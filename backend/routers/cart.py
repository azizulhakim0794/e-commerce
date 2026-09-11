from fastapi import APIRouter, Depends
from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_db
from schemas.cart import CartResponse
from core.security import CurrentUser
from routers import cart as cart_service
from uuid import UUID

router = APIRouter()


DBSession = Annotated[AsyncSession, Depends(get_db)]


@router.post("", response_model=CartResponse)
async def save_product_into_cart(
    db: DBSession, current_user: CurrentUser, product_id: UUID, quantity: int
):
    return cart_service.save_product_into_cart(
        db, current_user, current_user, product_id, quantity
    )


@router.get("", response_model=list[CartResponse])
async def get_cart_products(db: DBSession, current_user: CurrentUser):
    return cart_service.get_cart_products(db, current_user)


@router.patch("/{cart_id}", response_model=CartResponse)
async def update_cart_item_quantity(
    db: DBSession, current_user: CurrentUser, cart_id: UUID, quantity: int
):
    return cart_service.update_cart_item_quantity(db, current_user, cart_id, quantity)
