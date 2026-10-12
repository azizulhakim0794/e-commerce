import json
import logging
from decimal import Decimal
from pathlib import Path
from uuid import UUID, uuid4
from sqlalchemy import select
from fastapi import HTTPException, UploadFile, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from models.product import Product
from schemas.product import ProductCreate, ProductResponse, ProductUpdate
from typing import Annotated
from db.database import get_db
from redis.asyncio import Redis
from redis.exceptions import RedisError
from core.cache import create_cache_key, _invalidate_list_cache
from core.config import settings
from core.redis import redis_client
from db.database import AsyncSessionFactory
from jobs.queue import enqueue_image

DBSession = Annotated[AsyncSession, Depends(get_db)]

PRODUCT_LIST_CACHE_VERSION_KEY = "products:list:version"
PRODUCT_LIST_CACHE_TTL_SECONDS = 300
PRODUCT_IMAGE_FOLDER = "ecommerce/products"
ALLOWED_PHOTO_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}
logger = logging.getLogger(__name__)


async def create_product(
    db: DBSession,
    redis: Redis,
    product_data: ProductCreate,
) -> Product:
    new_product = Product(
        name=product_data.name,
        description=product_data.description,
        price=product_data.price,
        original_price=product_data.original_price,
        category=product_data.category,
        badge=product_data.badge,
        stock=product_data.stock,
        specs=product_data.specs,
        photo_url=product_data.image,
    )

    db.add(new_product)
    await db.commit()
    await db.refresh(new_product)
    await _invalidate_list_cache(redis, PRODUCT_LIST_CACHE_VERSION_KEY)

    return new_product


# Validates the uploaded photo, checks its size, and saves it
# to a temporary directory so a background worker can process it later.
async def _stage_photo(photo: UploadFile) -> Path:
    extension = ALLOWED_PHOTO_TYPES.get(photo.content_type or "")
    if extension is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported image type",
        )
    image_data = await photo.read(settings.max_upload_size_bytes + 1)
    if not image_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image file is empty",
        )
    if len(image_data) > settings.max_upload_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail="Image file is too large",
        )

    upload_dir = settings.image_upload_temp_dir
    upload_dir.mkdir(parents=True, exist_ok=True)
    image_path = upload_dir / f"{uuid4().hex}{extension}"
    image_path.write_bytes(image_data)
    return image_path


async def _save_product_photo(
    product_id: UUID,
    photo_url: str,
) -> tuple[bool, str | None]:
    async with AsyncSessionFactory() as db:
        result = await db.execute(select(Product).where(Product.id == product_id))
        product = result.scalar_one_or_none()

        if product is None:
            return False, None

        previous_photo_url = product.photo_url
        product.photo_url = photo_url

        await db.commit()
        try:
            await _invalidate_list_cache(redis_client, PRODUCT_LIST_CACHE_VERSION_KEY)
        except RedisError:
            logger.exception(
                "Could not invalidate the product list cache after image upload"
            )

        return True, previous_photo_url


async def upload_product_image(
    db: DBSession,
    product_id: UUID,
    photo: UploadFile,
) -> dict[str, str]:
    result = await db.execute(select(Product).where(Product.id == product_id))
    if result.scalar_one_or_none() is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    image_path = await _stage_photo(photo)
    try:
        job_id = enqueue_image(product_id, image_path, PRODUCT_IMAGE_FOLDER)
    except RedisError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Image processing queue unavailable",
        ) from exc

    return {"job_id": job_id, "status": "queued"}


async def get_products(
    db: DBSession,
    redis: Redis,
    category: str | None = None,
    search: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    page: int = 1,
    limit: int = 20,
) -> list[Product]:
    cache_key = await create_cache_key(
        redis=redis,
        resource="products:list",
        params={
            "category": category,
            "search": search,
            "min_price": min_price,
            "max_price": max_price,
            "page": page,
            "limit": limit,
        },
        version_key=PRODUCT_LIST_CACHE_VERSION_KEY,
    )

    cached_products = await redis.get(cache_key)

    if cached_products is not None:
        cached_items = json.loads(cached_products)
        for product in cached_items:
            if "photo_url" not in product:
                product["photo_url"] = product.pop("image", None)
        return [Product(**product) for product in cached_items]

    query = select(Product)

    if category:
        query = query.where(Product.category.ilike(f"%{category}%"))

    if search:
        query = query.where(Product.name.ilike(f"%{search}%"))

    if min_price is not None:
        query = query.where(Product.price >= Decimal(str(min_price)))

    if max_price is not None:
        query = query.where(Product.price <= Decimal(str(max_price)))

    offset = (page - 1) * limit
    query = query.offset(offset).limit(limit)

    result = await db.execute(query)
    products = result.scalars().all()
    response_products = [
        ProductResponse.model_validate(product) for product in products
    ]
    await redis.set(
        cache_key,
        json.dumps([product.model_dump(mode="json") for product in response_products]),
        ex=PRODUCT_LIST_CACHE_TTL_SECONDS,
    )
    print(f"Cache key: {cache_key}")
    return products


async def get_product(db: DBSession, product_id: UUID) -> Product:
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if product:
        return product
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND, detail="Product not found"
    )


async def update_product(
    db: DBSession, redis: Redis, product_id: UUID, product_data: ProductUpdate
) -> Product:
    result = await db.execute(select(Product).where(Product.id == product_id))

    existing_product = result.scalar_one_or_none()

    if not existing_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Product not found"
        )

    # Exclude 'id' if present in product_data so it can't overwrite the PK
    update_data = product_data.model_dump(exclude_unset=True, exclude={"id"})

    for field, value in update_data.items():
        setattr(existing_product, field, value)

    await db.commit()
    await db.refresh(existing_product)
    await _invalidate_list_cache(redis, PRODUCT_LIST_CACHE_VERSION_KEY)

    return existing_product


async def delete_product(db: DBSession, redis: Redis, product_id: UUID):
    result = await db.execute(select(Product).where(Product.id == product_id))

    existing_product = result.scalar_one_or_none()

    if not existing_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Product not found"
        )

    await db.delete(existing_product)
    await db.commit()
    await _invalidate_list_cache(redis, PRODUCT_LIST_CACHE_VERSION_KEY)
    return existing_product
