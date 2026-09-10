from fastapi import APIRouter, Depends
from schemas.product import ProductResponse, ProductCreate
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated
from db.database import get_db
from services import product as product_service
from uuid import UUID

router = APIRouter()


DBSession = Annotated[AsyncSession, Depends(get_db)]


@router.post("", response_model=ProductResponse)
async def create_product(db: DBSession, product_data: ProductCreate):
    return await product_service.create_product(db, product_data)


@router.get("", response_model=list[ProductResponse])
async def get_products(db: DBSession):
    return await product_service.get_products(db)


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(db: DBSession, product_id: UUID):
    return await product_service.get_product(db, product_id)
