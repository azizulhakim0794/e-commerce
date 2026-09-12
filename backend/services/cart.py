from uuid import UUID
from sqlalchemy import select
from fastapi import HTTPException, Depends, status
from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from db.database import get_db
from schemas.cart import CartItemCreate, CartItemUpdate
from models.product import Product
from models.cart import Cart, CartItem
from core.security import CurrentUser

DBSesstion = Annotated[AsyncSession, Depends(get_db)]


async def get_cart_products(db: DBSesstion, current_user: CurrentUser) -> list[Cart]:
    result = await db.execute(
        select(Cart)
        .options(selectinload(Cart.items).selectinload(CartItem.product))
        .where(Cart.user_id == current_user.id)
    )

    return result.scalars().all()


async def save_product_into_cart(
    db: DBSesstion, current_user: CurrentUser, product_data: CartItemCreate
) -> Cart:
    result = await db.execute(
        select(Product).where(Product.id == product_data.product_id)
    )

    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="product is not fould"
        )

    result = await db.execute(select(Cart).where(Cart.user_id == current_user.id))

    cart = result.scalar_one_or_none()

    # 3. Create cart if user doesn't have one
    if cart is None:
        cart = Cart(user_id=current_user.id)

        db.add(cart)

        await db.flush()

    # 4. Check whether product is already in cart
    result = await db.execute(
        select(CartItem).where(
            CartItem.cart_id == cart.id, CartItem.product_id == product_data.product_id
        )
    )

    cart_item = result.scalar_one_or_none()

    if cart_item:
        cart_item.quantity += product_data.quantity

    else:
        cart_item = CartItem(
            cart_id=cart.id,
            product_id=product_data.product_id,
            quantity=product_data.quantity,
        )

        db.add(cart_item)

    await db.commit()
    await db.refresh(cart_item)

    result = await db.execute(
        select(Cart)
        .options(selectinload(Cart.items).selectinload(CartItem.product))
        .where(Cart.id == cart.id)
    )

    return result.scalar_one()


async def update_cart_item_quantity(
    db: DBSesstion, current_user: CurrentUser, cart_data: CartItemUpdate
) -> Cart:
    result = await db.execute(
        select(CartItem)
        .join(Cart)
        .where(CartItem.id == cart_data.cart_id, Cart.user_id == current_user.id)
    )

    cart_item = result.scalar_one_or_none()

    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found"
        )

    cart_item.quantity = cart_data.quantity

    db.add(cart_item)
    await db.commit()
    await db.refresh(cart_item)

    result = await db.execute(
        select(Cart)
        .options(selectinload(Cart.items).selectinload(CartItem.product))
        .where(Cart.id == cart_item.cart_id)
    )

    return result.scalar_one()


async def delete_cart_item(db: DBSesstion, current_user: CurrentUser, cart_id: UUID):
    result = await db.execute(
        select(CartItem)
        .join(Cart)
        .where(CartItem.id == cart_id, Cart.user_id == current_user.id)
    )

    cart_item = result.scalar_one_or_none()

    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found"
        )

    await db.delete(cart_item)
    await db.commit()
