from fastapi import APIRouter, Depends, Query
from schemas.product import ProductResponse, ProductCreate, ProductUpdate
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated
from db.database import get_db
from services import product as product_service
from uuid import UUID
from core.security import AdminUser
from redis.asyncio import Redis
from core.redis import get_redis

router = APIRouter()


DBSession = Annotated[AsyncSession, Depends(get_db)]
RedisClient = Annotated[Redis, Depends(get_redis)]


@router.post("", response_model=ProductResponse)
async def create_product(
    db: DBSession, redis: RedisClient, product_data: ProductCreate, _: AdminUser
):
    return await product_service.create_product(db, redis, product_data)


@router.get("", response_model=list[ProductResponse])
async def get_products(
    db: DBSession,
    redis: RedisClient,
    category: str | None = Query(default=None, description="Filter by category"),
    search: str | None = Query(default=None, description="Search by name"),
    min_price: float | None = Query(default=None, ge=0, description="Minimum price"),
    max_price: float | None = Query(default=None, ge=0, description="Maximum price"),
    page: int = Query(default=1, ge=1, description="Page number"),
    limit: int = Query(default=20, ge=1, le=100, description="Items per page"),
):
    return await product_service.get_products(
        db,
        redis,
        category=category,
        search=search,
        min_price=min_price,
        max_price=max_price,
        page=page,
        limit=limit,
    )


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(db: DBSession, product_id: UUID):
    return await product_service.get_product(db, product_id)


@router.patch("/{product_id}", response_model=ProductResponse)
async def update_product(
    db: DBSession,
    redis: RedisClient,
    product_id: UUID,
    product_data: ProductUpdate,
    _: AdminUser,
):
    return await product_service.update_product(db, redis, product_id, product_data)


@router.delete("/{product_id}", response_model=ProductResponse)
async def delete_product(
    db: DBSession, redis: RedisClient, product_id: UUID, _: AdminUser
):
    return await product_service.delete_product(db, redis, product_id)
