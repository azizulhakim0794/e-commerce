from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from core.security import CurrentUser
from db.database import get_db
from models import Address, Cart, CartItem, Product, Order, OrderItem
from schemas.order import BuyNowRequest, CreateOrderFromCart, OrderResponse

DBSession = Annotated[AsyncSession, Depends(get_db)]


def _normalize_datetime(value: datetime | None) -> datetime | None:
    if value is None:
        return None

    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)

    return value.astimezone(timezone.utc)


def _build_order_response(order: Order) -> OrderResponse:
    items = list(order.items)

    created_at = _normalize_datetime(
        min((item.created_at for item in items), default=datetime.now(timezone.utc))
    )
    delivery_at = created_at + timedelta(hours=4)
    now = datetime.now(timezone.utc)

    status = "delivered" if now >= delivery_at else "processing"

    return OrderResponse(
        id=order.id,
        order_items=items,
        created_at=created_at,
        delivery_at=delivery_at,
        status=status,
    )


async def _validate_address(
    db: DBSession,
    current_user: CurrentUser,
    address_id,
) -> Address:
    result = await db.execute(
        select(Address).where(
            Address.id == address_id,
            Address.user_id == current_user.id,
        )
    )

    address = result.scalar_one_or_none()

    if not address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="address not found",
        )

    return address


async def create_order_from_cart(
    db: DBSession,
    current_user: CurrentUser,
    order_data: CreateOrderFromCart,
) -> OrderResponse:
    await _validate_address(db, current_user, order_data.address_id)

    result = await db.execute(
        select(Cart)
        .options(selectinload(Cart.items).selectinload(CartItem.product))
        .where(Cart.user_id == current_user.id)
    )

    cart = result.scalar_one_or_none()

    if cart is None or not cart.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="cart is empty",
        )

    product_ids = {item.product_id for item in cart.items}

    result = await db.execute(select(Product).where(Product.id.in_(product_ids)))
    products = result.scalars().all()

    products_by_id = {product.id: product for product in products}

    for cart_item in cart.items:
        product = products_by_id.get(cart_item.product_id)

        if product is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product {cart_item.product_id} not found",
            )

        if cart_item.quantity > product.stock:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for {product.name}",
            )

    order = Order(user_id=current_user.id)
    db.add(order)
    await db.flush()

    order_items: list[OrderItem] = []

    for cart_item in cart.items:
        product = products_by_id[cart_item.product_id]

        order_items.append(
            OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=cart_item.quantity,
                unit_price=product.price,
            )
        )

        product.stock -= cart_item.quantity

    db.add_all(order_items)

    for cart_item in list(cart.items):
        await db.delete(cart_item)

    await db.commit()
    await db.refresh(order)

    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items).selectinload(OrderItem.product))
        .where(Order.id == order.id)
    )

    created_order = result.scalar_one()

    return _build_order_response(created_order)


async def create_order_buy_now(
    db: DBSession,
    current_user: CurrentUser,
    order_data: BuyNowRequest,
) -> OrderResponse:
    await _validate_address(db, current_user, order_data.address_id)

    if order_data.quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="quantity must be greater than zero",
        )

    result = await db.execute(
        select(Product).where(Product.id == order_data.product_id)
    )
    product = result.scalar_one_or_none()

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product {order_data.product_id} not found",
        )

    if order_data.quantity > product.stock:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient stock for {product.name}",
        )

    order = Order(user_id=current_user.id)
    db.add(order)
    await db.flush()

    order_item = OrderItem(
        order_id=order.id,
        product_id=product.id,
        quantity=order_data.quantity,
        unit_price=product.price,
    )

    product.stock -= order_data.quantity

    db.add(order_item)
    await db.commit()
    await db.refresh(order)

    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items).selectinload(OrderItem.product))
        .where(Order.id == order.id)
    )

    created_order = result.scalar_one()

    return _build_order_response(created_order)


async def get_order_product(
    db: DBSession, current_user: CurrentUser
) -> list[OrderResponse]:

    result = await db.execute(
        select(Order)
        .options(selectinload(Order.items).selectinload(OrderItem.product))
        .where(Order.user_id == current_user.id)
    )

    orders = result.scalars().all()

    return [_build_order_response(order) for order in orders]
