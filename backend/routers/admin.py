from fastapi import APIRouter, Depends
from typing import Annotated
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_db
from core.security import AdminUser
from models.user import User
from models.product import Product
from models.order import Order, OrderItem

router = APIRouter()

DBSession = Annotated[AsyncSession, Depends(get_db)]


@router.get("/overview")
async def get_admin_overview(db: DBSession, current_user: AdminUser):
    """Returns dashboard summary stats for the admin panel."""

    # Total users (excluding admins)
    user_count_result = await db.execute(
        select(func.count(User.id)).where(User.is_admin == False)  # noqa: E712
    )
    total_users = user_count_result.scalar_one()

    # Total products
    product_count_result = await db.execute(select(func.count(Product.id)))
    total_products = product_count_result.scalar_one()

    # Total orders
    order_count_result = await db.execute(select(func.count(Order.id)))
    total_orders = order_count_result.scalar_one()

    # Total revenue (sum of unit_price * quantity across all order items)
    revenue_result = await db.execute(
        select(func.sum(OrderItem.unit_price * OrderItem.quantity))
    )
    total_revenue = revenue_result.scalar_one() or 0

    # Out-of-stock products
    out_of_stock_result = await db.execute(
        select(func.count(Product.id)).where(Product.stock == 0)
    )
    out_of_stock_count = out_of_stock_result.scalar_one()

    return {
        "admin": {
            "id": str(current_user.id),
            "username": current_user.username,
        },
        "stats": {
            "total_users": total_users,
            "total_products": total_products,
            "total_orders": total_orders,
            "total_revenue": float(total_revenue),
            "out_of_stock_products": out_of_stock_count,
        },
    }
