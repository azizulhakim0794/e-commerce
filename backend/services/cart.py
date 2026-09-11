from uuid import UUID
from sqlalchemy import select
from fastapi import HTTPException, Depends, status
from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_db
from schemas.cart import CartItemCreate
from models.product import Product
from models.cart import Cart, CartItem
from core.security import CurrentUser

DBSesstion = Annotated[AsyncSession, Depends(get_db)]


async def get_cart_products(
    db: DBSesstion, current_user: CurrentUser
) -> list[CartItem]:
    result = await db.execute(
        select(CartItem).join(Cart).where(Cart.user_id == current_user.id)
    )

    return result.scalars().all()


async def save_product_into_cart(
    db: DBSesstion, current_user: CurrentUser, product_id: UUID, quantity: int
) -> CartItemCreate:
    print(product_id, quantity)

    result = await db.execute(select(Product).where(Product.id == product_id))

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
            CartItem.cart_id == cart.id, CartItem.product_id == product_id
        )
    )

    cart_item = result.scalar_one_or_none()

    if cart_item:
        cart_item.quantity += quantity

    else:
        cart_item = CartItem(
            cart_id=cart.id,
            product_id=product_id,
            quantity=quantity,
        )

        db.add(cart_item)

    db.commit()
    db.refresh(cart_item)

    return cart_item


async def update_cart_item_quantity(
    db: DBSesstion, current_user: CurrentUser, quantity: int, cart_id: UUID
) -> CartItem:

    result = await db.execute(
        select(CartItem)
        .join(Cart)
        .where(CartItem.cart_id == cart_id, Cart.user_id == current_user.id)
    )

    cart_item = result.scalar_one_or_none()

    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found"
        )

    cart_item.quantity = quantity

    db.add(cart_item)
    db.commit()
    db.refresh(cart_item)

    return cart_item
