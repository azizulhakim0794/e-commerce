from dataclasses import dataclass
from datetime import datetime, timezone
from decimal import Decimal
from email.message import EmailMessage
from pathlib import Path
from typing import Sequence
from uuid import UUID

import aiosmtplib
from jinja2 import Environment, FileSystemLoader, select_autoescape

from core.config import settings

TEMPLATE_DIRECTORY = Path(__file__).resolve().parents[1] / "emails" / "templates"
template_environment = Environment(
    loader=FileSystemLoader(TEMPLATE_DIRECTORY),
    autoescape=select_autoescape(["html", "xml"]),
)


@dataclass(frozen=True)
class OrderConfirmationItem:
    product_name: str
    quantity: int
    unit_price: Decimal
    subtotal: Decimal


def _format_currency(amount: Decimal) -> str:
    return f"${amount:,.2f}"


def _format_order_date(value: datetime | None) -> str:
    if value is None:
        return "Not available"
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc).strftime("%B %d, %Y at %I:%M %p UTC")


def render_order_confirmation(
    *,
    customer_name: str,
    order_id: UUID,
    order_date: datetime | None,
    items: Sequence[OrderConfirmationItem],
    total_amount: Decimal,
    order_status: str,
    order_url: str,
    support_email: str | None,
) -> tuple[str, str]:
    context = {
        "store_name": settings.store_name,
        "customer_name": customer_name,
        "order_number": str(order_id),
        "order_date": _format_order_date(order_date),
        "items": [
            {
                "product_name": item.product_name,
                "quantity": item.quantity,
                "unit_price": _format_currency(item.unit_price),
                "subtotal": _format_currency(item.subtotal),
            }
            for item in items
        ],
        "total_amount": _format_currency(total_amount),
        "order_status": order_status,
        "payment_status": "Not recorded",
        "order_url": order_url,
        "support_email": support_email,
    }
    html = template_environment.get_template("order_confirmation.html").render(
        **context
    )
    text = template_environment.get_template("order_confirmation.txt").render(**context)
    return html, text


async def send_email(
    to_email: str,
    subject: str,
    plain_text: str,
    html_content: str | None = None,
) -> None:
    message = EmailMessage()
    message["From"] = settings.mail_from
    message["To"] = to_email
    message["Subject"] = subject
    message.set_content(plain_text)

    if html_content:
        message.add_alternative(html_content, subtype="html")

    await aiosmtplib.send(
        message,
        hostname=settings.mail_server,
        port=settings.mail_port,
        username=settings.mail_username or None,
        password=settings.mail_password.get_secret_value() or None,
        start_tls=settings.mail_use_tls,
        timeout=30,
    )


async def send_order_confirmation(
    *,
    customer_email: str,
    customer_name: str,
    order_id: UUID,
    order_date: datetime | None,
    items: Sequence[OrderConfirmationItem],
    total_amount: Decimal,
    order_status: str,
) -> None:
    if not settings.mail_from:
        raise ValueError("MAIL_FROM must be configured")

    html, text = render_order_confirmation(
        customer_name=customer_name,
        order_id=order_id,
        order_date=order_date,
        items=items,
        total_amount=total_amount,
        order_status=order_status,
        order_url=f"{settings.frontend_url.rstrip('/')}/orders",
        support_email=settings.support_email,
    )

    await send_email(
        to_email=customer_email,
        subject=f"Order Confirmation #{order_id}",
        plain_text=text,
        html_content=html,
    )
