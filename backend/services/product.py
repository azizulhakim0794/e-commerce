from sqlalchemy import select
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from models.product import Product
from schemas.product import ProductCreate


async def create_product(db: AsyncSession, product_data: ProductCreate) -> Product:
    product = Product(
        name=product_data.name,
        description=product_data.description,
        price=product_data.price,
        original_price=product_data.original_price,
        image=product_data.image,
        category=product_data.category,
        stock=product_data.stock,
        specs=product_data.specs,
        model=product_data.model,
    )

    db.add(product)
    await db.commit()
    await db.refresh(product)

    return product


async def get_products(db: AsyncSession) -> list[Product]:
    result = await db.execute(select(Product))
    products = result.scalars().all()

    return products


async def get_product(db: AsyncSession, product_id: UUID) -> Product:
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    return product
