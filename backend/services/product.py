from decimal import Decimal
from sqlalchemy import select
from uuid import UUID
from fastapi import HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from models.product import Product
from schemas.product import ProductCreate, ProductUpdate
from typing import Annotated
from db.database import get_db

DBSession = Annotated[AsyncSession, Depends(get_db)]


async def create_product(db: DBSession, product_data: ProductCreate) -> Product:
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

    return new_product


async def get_products(
    db: DBSession,
    category: str | None = None,
    search: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    page: int = 1,
    limit: int = 20,
) -> list[Product]:
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
    db: DBSession, product_id: UUID, product_data: ProductUpdate
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

    return existing_product


async def delete_product(db: DBSession, product_id: UUID):
    result = await db.execute(select(Product).where(Product.id == product_id))

    existing_product = result.scalar_one_or_none()

    if not existing_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Product not found"
        )

    await db.delete(existing_product)
    await db.commit()
    return existing_product
