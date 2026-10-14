from fastapi import APIRouter, Form, File, UploadFile, Depends, Query, Request
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError
from starlette.datastructures import UploadFile as StarletteUploadFile
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
    db: DBSession,
    redis: RedisClient,
    _: AdminUser,
    request: Request,
    product_data: Annotated[str | None, Form()] = None,
    photo: Annotated[UploadFile | None, File()] = None,
):
    if product_data is None:
        if request.headers.get("content-type", "").startswith("application/json"):
            body = await request.body()
            try:
                product = ProductCreate.model_validate_json(body)
            except ValidationError as exc:
                raise RequestValidationError(
                    [
                        {
                            **error,
                            "loc": ("body", *error["loc"]),
                        }
                        for error in exc.errors()
                    ],
                    body=body,
                ) from exc
        else:
            raise RequestValidationError(
                [
                    {
                        "type": "missing",
                        "loc": ("body", "product_data"),
                        "msg": "Field required",
                        "input": None,
                    }
                ],
                body=await request.body(),
            )
    else:
        try:
            product = ProductCreate.model_validate_json(product_data)
        except ValidationError as exc:
            raise RequestValidationError(
                [
                    {
                        **error,
                        "loc": ("body", "product_data", *error["loc"]),
                    }
                    for error in exc.errors()
                ],
                body=product_data,
            ) from exc

    return await product_service.create_product(db, redis, product, photo)


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
