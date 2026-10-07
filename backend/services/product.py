import hashlib
import json
from decimal import Decimal
from sqlalchemy import select
from uuid import UUID
from fastapi import HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from models.product import Product
from schemas.product import ProductCreate, ProductResponse, ProductUpdate
from typing import Annotated
from db.database import get_db
from redis.asyncio import Redis

DBSession = Annotated[AsyncSession, Depends(get_db)]

PRODUCT_LIST_CACHE_VERSION_KEY = "products:list:version"
PRODUCT_LIST_CACHE_TTL_SECONDS = 300


async def _invalidate_product_list_cache(redis: Redis) -> None:
    await redis.incr(PRODUCT_LIST_CACHE_VERSION_KEY)


async def create_product(
    db: DBSession, redis: Redis, product_data: ProductCreate
) -> Product:
    new_product = Product(
        name=product_data.name,
        description=product_data.description,
        price=product_data.price,
        original_price=product_data.original_price,
        image=product_data.image,
        category=product_data.category,
        badge=product_data.badge,
        stock=product_data.stock,
        specs=product_data.specs,
    )

    db.add(new_product)
    await db.commit()
    await db.refresh(new_product)
    await _invalidate_product_list_cache(redis)

    return new_product


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
    cache_parameters = json.dumps(
        {
            "category": category,
            "search": search,
            "min_price": min_price,
            "max_price": max_price,
            "page": page,
            "limit": limit,
        },
        sort_keys=True,
        separators=(",", ":"),
    )
    cache_digest = hashlib.sha256(cache_parameters.encode()).hexdigest()
    cache_version = await redis.get(PRODUCT_LIST_CACHE_VERSION_KEY) or "0"

    cache_key = f"products:list:{cache_version}:{cache_digest}"

    cached_products = await redis.get(cache_key)
    if cached_products is not None:
        return [Product(**product) for product in json.loads(cached_products)]

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
    await _invalidate_product_list_cache(redis)

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
    await _invalidate_product_list_cache(redis)
    return existing_product
