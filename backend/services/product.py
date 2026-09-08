from sqlalchemy import select
from uuid import UUID
from fastapi import HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from models.product import Product
from schemas.product import ProductCreate
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


async def get_products(db: DBSession) -> list[Product]:
    result = await db.execute(select(Product))
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
