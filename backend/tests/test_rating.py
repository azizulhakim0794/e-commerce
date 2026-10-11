from datetime import datetime, timedelta, timezone
from decimal import Decimal

import pytest
from sqlalchemy import select

from models.order import Order, OrderItem
from models.user import User


@pytest.mark.asyncio
async def test_create_rating_is_linked_to_order_and_listed_by_product(
    authenticated_client,
    db_session,
    test_products,
):
    product = test_products[0]
    user_result = await db_session.execute(
        select(User).where(User.email == "admin@example.com")
    )
    user = user_result.scalar_one()
    order = Order(user_id=user.id)
    db_session.add(order)
    await db_session.flush()
    db_session.add(
        OrderItem(
            order_id=order.id,
            product_id=product.id,
            quantity=1,
            unit_price=Decimal(product.price),
            created_at=datetime.now(timezone.utc) - timedelta(days=1),
        )
    )
    await db_session.commit()

    response = await authenticated_client.post(
        "/api/v1/rating",
        data={
            "product_id": str(product.id),
            "order_id": str(order.id),
            "rating": "5",
            "comment": "Great product",
        },
    )

    assert response.status_code == 200
    assert response.json()["order_id"] == str(order.id)

    listed_response = await authenticated_client.get(
        f"/api/v1/rating/{product.id}"
    )

    assert listed_response.status_code == 200
    assert len(listed_response.json()) == 1
    assert listed_response.json()[0]["id"] == response.json()["id"]
