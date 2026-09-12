from fastapi import APIRouter, Depends, status
from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_db
from schemas.cart import CartItemCreate, CartItemUpdate, CartResponse
from core.security import CurrentUser
from services import cart as cart_service
from uuid import UUID

router = APIRouter()


DBSession = Annotated[AsyncSession, Depends(get_db)]


@router.post("", response_model=CartResponse)
async def save_product_into_cart(
    db: DBSession, current_user: CurrentUser, product_data: CartItemCreate
):
    return await cart_service.save_product_into_cart(db, current_user, product_data)


@router.get("", response_model=list[CartResponse])
async def get_cart_products(db: DBSession, current_user: CurrentUser):
    return await cart_service.get_cart_products(db, current_user)


@router.patch("", response_model=CartResponse)
async def update_cart_item_quantity(
    db: DBSession, current_user: CurrentUser, cart_data: CartItemUpdate
):
    return await cart_service.update_cart_item_quantity(db, current_user, cart_data)


@router.delete("/{cart_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_cart_item(db: DBSession, current_user: CurrentUser, cart_id: UUID):
    return await cart_service.delete_cart_item(db, current_user, cart_id)
