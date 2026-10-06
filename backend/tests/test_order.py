import pytest
from sqlalchemy import select
from models.address import Address


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
async def test_infinite_order(authenticated_client, test_address, test_products):

    address_id = await get_first_addres_id(authenticated_client)
    product_id = await get_first_product_id(authenticated_client)

    order_data = await order_product(
        authenticated_client, product_id, address_id, 4000, 400
    )

    assert order_data["detail"] == "Insufficient stock for AeroFlex Headphones"


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
