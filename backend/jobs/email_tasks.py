import asyncio
import logging
from decimal import Decimal
from datetime import datetime
from typing import TypedDict
from uuid import UUID

from aiosmtplib import SMTPException
from jinja2 import TemplateError
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import selectinload

from db.database import AsyncSessionFactory
from models import Order, OrderItem, User
from services.email_service import OrderConfirmationItem, send_order_confirmation
from services.order import _build_order_response

logger = logging.getLogger(__name__)


class OrderConfirmationPayload(TypedDict):
    customer_email: str
    customer_name: str
    order_id: UUID
    order_date: datetime | None
    items: list[OrderConfirmationItem]
    total_amount: Decimal
    order_status: str


async def _load_order_confirmation(order_id: UUID) -> OrderConfirmationPayload:
    async with AsyncSessionFactory() as db:
        result = await db.execute(
            select(Order)
            .options(selectinload(Order.items).selectinload(OrderItem.product))
            .where(Order.id == order_id)
        )
        order = result.scalar_one_or_none()
        if order is None:
            raise ValueError("Committed order was not found")

        user_result = await db.execute(select(User).where(User.id == order.user_id))
        customer = user_result.scalar_one_or_none()
        if customer is None:
            raise ValueError("Order customer was not found")

        response = _build_order_response(order)
        items = []
        for item in order.items:
            if item.product is None:
                raise ValueError("Order item product was not found")
            items.append(
                OrderConfirmationItem(
                    product_name=item.product.name,
                    quantity=item.quantity,
                    unit_price=item.unit_price,
                    subtotal=item.unit_price * item.quantity,
                )
            )

        return {
            "customer_email": customer.email,
            "customer_name": customer.username,
            "order_id": order.id,
            "order_date": response.created_at,
            "items": items,
            "total_amount": sum(
                (item.subtotal for item in items),
                start=Decimal("0.00"),
            ),
            "order_status": response.status,
        }


async def _send_order_confirmation(order_id: UUID) -> None:
    email_data = await _load_order_confirmation(order_id)
    await send_order_confirmation(**email_data)


def send_order_confirmation_task(order_id: str) -> None:
    try:
        asyncio.run(_send_order_confirmation(UUID(order_id)))
    except (
        OSError,
        SMTPException,
        SQLAlchemyError,
        TemplateError,
        ValueError,
    ) as exc:
        logger.error(
            "Order confirmation task failed order_id=%s error_type=%s",
            order_id,
            type(exc).__name__,
        )
        raise RuntimeError("Order confirmation task failed") from None

    logger.info(
        "SMTP accepted order confirmation message order_id=%s",
        order_id,
    )
