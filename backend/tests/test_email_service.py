import asyncio
from datetime import datetime, timezone
from decimal import Decimal
from email.message import EmailMessage
from uuid import uuid4

import pytest
from pydantic import SecretStr
from rq import Retry
from rq.exceptions import DuplicateJobError

from core.config import settings
from jobs import email_tasks, queue as queue_service
from services import email_service


def _email_data():
    return {
        "customer_email": "customer@example.com",
        "customer_name": "<Customer>",
        "order_id": uuid4(),
        "order_date": datetime(2026, 10, 14, 8, tzinfo=timezone.utc),
        "items": [
            email_service.OrderConfirmationItem(
                product_name="<Wireless headphones>",
                quantity=2,
                unit_price=Decimal("19.95"),
                subtotal=Decimal("39.90"),
            )
        ],
        "total_amount": Decimal("39.90"),
        "order_status": "processing",
    }


def test_order_confirmation_templates_render_order_data_and_escape_html():
    data = _email_data()

    html, text = email_service.render_order_confirmation(
        customer_name=data["customer_name"],
        order_id=data["order_id"],
        order_date=data["order_date"],
        items=data["items"],
        total_amount=data["total_amount"],
        order_status=data["order_status"],
        order_url="https://shop.example.com/orders",
        support_email="support@example.com",
    )

    assert "&lt;Customer&gt;" in html
    assert "&lt;Wireless headphones&gt;" in html
    assert "<Customer>" not in html
    assert "Qty 2" in html
    assert "$19.95" in html
    assert "$39.90" in html
    assert str(data["order_id"]) in html
    assert "processing" in html
    assert "Not recorded" in html
    assert "https://shop.example.com/orders" in html
    assert "support@example.com" in html
    assert "<Customer>" in text
    assert "$39.90" in text


def test_send_order_confirmation_uses_smtp_and_sends_both_templates(
    monkeypatch,
):
    data = _email_data()
    calls = {}

    async def fake_send(message, **kwargs):
        calls["message"] = message
        calls["options"] = kwargs

    monkeypatch.setattr(email_service.aiosmtplib, "send", fake_send)
    monkeypatch.setattr(settings, "mail_server", "sandbox.smtp.mailtrap.io")
    monkeypatch.setattr(settings, "mail_port", 2525)
    monkeypatch.setattr(settings, "mail_username", "mailtrap-smtp-login")
    monkeypatch.setattr(settings, "mail_password", SecretStr("test-smtp-password"))
    monkeypatch.setattr(settings, "mail_from", "verified@example.com")
    monkeypatch.setattr(settings, "mail_use_tls", True)
    monkeypatch.setattr(settings, "frontend_url", "https://shop.example.com/")
    monkeypatch.setattr(settings, "support_email", "support@example.com")

    asyncio.run(email_service.send_order_confirmation(**data))

    message: EmailMessage = calls["message"]
    assert message["From"] == "verified@example.com"
    assert message["To"] == "customer@example.com"
    assert message["Subject"] == f"Order Confirmation #{data['order_id']}"
    assert message.get_content_type() == "multipart/alternative"
    assert "39.90" in message.get_body(preferencelist=("plain",)).get_content()
    assert "$39.90" in message.get_body(preferencelist=("html",)).get_content()
    assert calls["options"] == {
        "hostname": "sandbox.smtp.mailtrap.io",
        "port": 2525,
        "username": "mailtrap-smtp-login",
        "password": "test-smtp-password",
        "start_tls": True,
        "timeout": 30,
    }


def test_smtp_failure_is_raised_for_rq_retry(monkeypatch):
    data = _email_data()

    async def fail_to_send(*_args, **_kwargs):
        raise email_service.aiosmtplib.SMTPException("temporary SMTP failure")

    monkeypatch.setattr(email_service.aiosmtplib, "send", fail_to_send)
    monkeypatch.setattr(settings, "mail_password", SecretStr("test-smtp-password"))
    monkeypatch.setattr(settings, "mail_from", "verified@example.com")

    with pytest.raises(email_service.aiosmtplib.SMTPException):
        asyncio.run(email_service.send_order_confirmation(**data))


def test_order_confirmation_queue_uses_existing_rq_queue_and_retries(monkeypatch):
    order_id = uuid4()
    captured = {}

    class FakeQueue:
        def enqueue(self, task, *args, **kwargs):
            captured.update(task=task, args=args, **kwargs)
            return type("Job", (), {"id": kwargs["job_id"]})()

    monkeypatch.setattr(queue_service, "image_queue", FakeQueue())

    job_id = queue_service.enqueue_order_confirmation(order_id)

    assert job_id == f"order-confirmation-{order_id}"
    assert captured["task"] == "jobs.email_tasks.send_order_confirmation_task"
    assert captured["args"] == (str(order_id),)
    assert captured["unique"] is True
    assert captured["retry"].max == 3
    assert captured["retry"].intervals == [30, 120]
    assert captured["result_ttl"] == 86400


def test_duplicate_confirmation_job_is_not_enqueued_again(monkeypatch):
    order_id = uuid4()
    attempts = []

    class DuplicateQueue:
        def enqueue(self, *_args, **_kwargs):
            attempts.append(True)
            raise DuplicateJobError("already queued")

    monkeypatch.setattr(queue_service, "image_queue", DuplicateQueue())

    result = queue_service.enqueue_order_confirmation(order_id)

    assert result == f"order-confirmation-{order_id}"
    assert attempts == [True]


def test_confirmation_task_reraises_smtp_failure_for_rq_retry(monkeypatch):
    data = _email_data()

    async def load_order(_order_id):
        return data

    async def fail_to_send(**_kwargs):
        raise email_service.aiosmtplib.SMTPException("temporary SMTP failure")

    monkeypatch.setattr(email_tasks, "_load_order_confirmation", load_order)
    monkeypatch.setattr(email_tasks, "send_order_confirmation", fail_to_send)

    with pytest.raises(RuntimeError, match="Order confirmation task failed"):
        email_tasks.send_order_confirmation_task(str(data["order_id"]))
