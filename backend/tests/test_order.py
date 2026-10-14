from uuid import UUID

import pytest
from sqlalchemy import select
from models.address import Address
from models.order import Order
from redis.exceptions import RedisError
from services import order as order_service
from jobs import queue as queue_service
from jobs import email_tasks


async def get_first_addres_id(authenticated_client):

    address_response = await authenticated_client.get(
        "/api/v1/address",
    )

    assert address_response.status_code == 200

    data = address_response.json()

    return data[0]["id"]


async def get_first_product_id(authenticated_client):

    products_response = await authenticated_client.get(
        "/api/v1/products",
    )

    assert products_response.status_code == 200

    data = products_response.json()

    return data[0]["id"]


async def order_product(
    authenticated_client,
    product_id,
    address_id,
    quantity=1,
    status_code=200,
):
    print(quantity)
    order_response = await authenticated_client.post(
        "/api/v1/orders/buy-now",
        json={
            "product_id": str(product_id),
            "quantity": quantity,
            "address_id": str(address_id),
        },
    )

    assert order_response.status_code == status_code

    return order_response.json()


@pytest.mark.asyncio
async def test_create_order(authenticated_client, test_address, test_products):

    address_id = await get_first_addres_id(authenticated_client)
    product_id = await get_first_product_id(authenticated_client)

    order_data = await order_product(
        authenticated_client, product_id, address_id, 2, 200
    )

    assert order_data["order_items"][0]["product_id"] == product_id


@pytest.mark.asyncio
async def test_infinite_order(
    authenticated_client, test_address, test_products, monkeypatch
):
    enqueued_orders = []
    monkeypatch.setattr(
        order_service,
        "_enqueue_order_confirmation",
        enqueued_orders.append,
    )

    address_id = await get_first_addres_id(authenticated_client)
    product_id = await get_first_product_id(authenticated_client)

    order_data = await order_product(
        authenticated_client, product_id, address_id, 4000, 400
    )

    assert order_data["detail"] == "Insufficient stock for AeroFlex Headphones"
    assert enqueued_orders == []


@pytest.mark.asyncio
async def test_order_confirmation_is_enqueued_after_order_commit(
    authenticated_client,
    test_address,
    test_products,
    db_session,
    monkeypatch,
):
    events = []
    original_commit = db_session.commit

    async def record_commit():
        await original_commit()
        events.append("commit")

    def enqueue_confirmation(order_id):
        assert events[-1] == "commit"
        events.append(("enqueue", order_id))

    monkeypatch.setattr(db_session, "commit", record_commit)
    monkeypatch.setattr(
        order_service,
        "_enqueue_order_confirmation",
        enqueue_confirmation,
    )

    address_id = await get_first_addres_id(authenticated_client)
    product_id = await get_first_product_id(authenticated_client)
    response = await authenticated_client.post(
        "/api/v1/orders/buy-now",
        json={
            "product_id": product_id,
            "quantity": 2,
            "address_id": address_id,
        },
    )

    assert response.status_code == 200
    assert events[0] == "commit"
    assert events[1] == ("enqueue", UUID(response.json()["id"]))


@pytest.mark.asyncio
async def test_cart_order_confirmation_is_enqueued_after_commit(
    authenticated_client,
    test_address,
    test_products,
    db_session,
    monkeypatch,
):
    events = []
    original_commit = db_session.commit

    async def record_commit():
        await original_commit()
        events.append("commit")

    def enqueue_confirmation(order_id):
        assert events[-1] == "commit"
        events.append(("enqueue", order_id))

    monkeypatch.setattr(db_session, "commit", record_commit)
    monkeypatch.setattr(
        order_service,
        "_enqueue_order_confirmation",
        enqueue_confirmation,
    )

    address_id = await get_first_addres_id(authenticated_client)
    product_id = await get_first_product_id(authenticated_client)
    cart_response = await authenticated_client.post(
        "/api/v1/cart",
        json={"product_id": product_id, "quantity": 2},
    )
    assert cart_response.status_code == 200

    response = await authenticated_client.post(
        "/api/v1/orders",
        json={"address_id": address_id},
    )

    assert response.status_code == 200
    assert events[-2] == "commit"
    assert events[-1] == ("enqueue", UUID(response.json()["id"]))


@pytest.mark.asyncio
async def test_queue_failure_does_not_undo_a_committed_order(
    authenticated_client,
    test_address,
    test_products,
    db_session,
    monkeypatch,
):
    def fail_enqueue(_order_id):
        raise RedisError("Redis unavailable")

    monkeypatch.setattr(queue_service, "enqueue_order_confirmation", fail_enqueue)

    address_id = await get_first_addres_id(authenticated_client)
    product_id = await get_first_product_id(authenticated_client)
    response = await authenticated_client.post(
        "/api/v1/orders/buy-now",
        json={
            "product_id": product_id,
            "quantity": 1,
            "address_id": address_id,
        },
    )

    assert response.status_code == 200
    persisted_order = await db_session.get(Order, UUID(response.json()["id"]))
    assert persisted_order is not None


@pytest.mark.asyncio
async def test_email_task_reads_customer_and_items_from_committed_order(
    authenticated_client,
    test_address,
    test_products,
    db_session,
    monkeypatch,
):
    monkeypatch.setattr(order_service, "_enqueue_order_confirmation", lambda _id: None)

    address_id = await get_first_addres_id(authenticated_client)
    product_id = await get_first_product_id(authenticated_client)
    response = await authenticated_client.post(
        "/api/v1/orders/buy-now",
        json={
            "product_id": product_id,
            "quantity": 2,
            "address_id": address_id,
        },
    )
    assert response.status_code == 200

    class ExistingSessionContext:
        async def __aenter__(self):
            return db_session

        async def __aexit__(self, *_):
            return False

    monkeypatch.setattr(
        email_tasks,
        "AsyncSessionFactory",
        ExistingSessionContext,
    )

    order_data = await email_tasks._load_order_confirmation(
        UUID(response.json()["id"])
    )

    assert order_data["customer_email"] == "admin@example.com"
    assert order_data["customer_name"] == "testuser"
    assert order_data["items"][0].product_name == "AeroFlex Headphones"
    assert order_data["items"][0].quantity == 2
    assert order_data["items"][0].unit_price == 129
    assert order_data["items"][0].subtotal == 258
    assert order_data["total_amount"] == 258
    assert order_data["order_status"] == "processing"


@pytest.mark.asyncio
async def test_invalid_order(authenticated_client, test_address, test_products):

    address_id = await get_first_addres_id(authenticated_client)
    product_id = await get_first_product_id(authenticated_client)

    order_data = await order_product(
        authenticated_client, product_id, address_id, -40, 400
    )

    assert order_data["detail"] == "quantity must be greater than zero"


@pytest.mark.asyncio
async def test_overquantity_order(authenticated_client, test_address, test_products):

    address_id = await get_first_addres_id(authenticated_client)
    product_id = await get_first_product_id(authenticated_client)

    order_data = await order_product(
        authenticated_client, product_id, address_id, 20, 400
    )

    assert order_data["detail"] == "Insufficient stock for AeroFlex Headphones"
