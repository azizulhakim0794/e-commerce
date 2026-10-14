import json
import logging
from decimal import Decimal
from pathlib import Path
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.datastructures import UploadFile
from models.product import Product
from schemas.product import ProductCreate, ProductResponse, ProductUpdate
from typing import Annotated
from db.database import get_db
from redis.asyncio import Redis
from redis.exceptions import RedisError
from core.cache import create_cache_key, _invalidate_list_cache
from core.redis import redis_client
from db.database import AsyncSessionFactory
from jobs.queue import enqueue_image
from services import photo_upload

DBSession = Annotated[AsyncSession, Depends(get_db)]

PRODUCT_LIST_CACHE_VERSION_KEY = "products:list:version"
PRODUCT_LIST_CACHE_TTL_SECONDS = 300
PRODUCT_IMAGE_FOLDER = "ecommerce/products"
ALLOWED_PHOTO_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    # "image/avif": ".avif",
}
logger = logging.getLogger(__name__)


async def create_product(
    db: DBSession,
    redis: Redis,
    product_data: ProductCreate,
    photo: UploadFile | None = None,
) -> Product:
    image_path = await _stage_photo(photo) if photo is not None else None
    new_product = Product(
        name=product_data.name,
        description=product_data.description,
        price=product_data.price,
        original_price=product_data.original_price,
        category=product_data.category,
        badge=product_data.badge,
        stock=product_data.stock,
        specs=product_data.specs,
        photo_url=product_data.photo_url,
    )

    db.add(new_product)
    try:
        await db.commit()
        await db.refresh(new_product)
    except SQLAlchemyError:
        await db.rollback()
        if image_path is not None:
            image_path.unlink(missing_ok=True)
        raise

    try:
        await _invalidate_list_cache(redis, PRODUCT_LIST_CACHE_VERSION_KEY)
    except RedisError:
        if image_path is not None:
            image_path.unlink(missing_ok=True)
        raise

    if image_path is not None:
        try:
            enqueue_image(new_product.id, image_path, PRODUCT_IMAGE_FOLDER)
        except RedisError as exc:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Image processing queue unavailable",
            ) from exc

    return new_product


# Validates the uploaded photo, checks its size, and saves it
# to a temporary directory so a background worker can process it later.
async def _stage_photo(photo: UploadFile) -> Path:
    return await photo_upload.stage_photo(photo, ALLOWED_PHOTO_TYPES)


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
                product["photo_url"] = product.get("image")
            product.pop("image", None)
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
