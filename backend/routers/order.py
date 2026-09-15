from fastapi import APIRouter, Depends, status
from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_db

# from schemas.cart import CartItemCreate, CartItemUpdate, CartResponse
from schemas.order import CreateOrderFromCart, BuyNowRequest, OrderResponse
from core.security import CurrentUser
from services import order as order_service
from uuid import UUID

router = APIRouter()


DBSession = Annotated[AsyncSession, Depends(get_db)]


@router.post("", response_model=OrderResponse)
async def create_order_from_cart(
    db: DBSession, current_user: CurrentUser, product_data: CreateOrderFromCart
):
    return await order_service.create_order_from_cart(db, current_user, product_data)


@router.post("/buy-now", response_model=OrderResponse)
async def create_order_buy_now(
    db: DBSession, current_user: CurrentUser, product_data: BuyNowRequest
):
    return await order_service.create_order_buy_now(db, current_user, product_data)


@router.get("", response_model=list[OrderResponse])
async def update_cart_item_quantity(
    db: DBSession,
    current_user: CurrentUser,
):
    return await order_service.get_order_product(db, current_user)
