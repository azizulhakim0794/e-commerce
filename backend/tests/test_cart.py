import pytest
from sqlalchemy import select

from models.cart import CartItem


async def add_product_to_cart(
    authenticated_client,
    product,
    quantity=1,
):
    response = await authenticated_client.post(
        "/api/v1/cart",
        json={
            "product_id": str(product.id),
            "quantity": quantity,
        },
    )

    assert response.status_code == 200

    return response.json()


async def get_cart_item(
    db_session,
    product_id,
):
    result = await db_session.execute(
        select(CartItem).where(CartItem.product_id == product_id)
    )

    return result.scalar_one()


@pytest.mark.asyncio
async def test_add_product_to_cart(
    authenticated_client,
    test_products,
):
    product = test_products[0]

    cart = await add_product_to_cart(
        authenticated_client,
        product,
    )

    item = cart["items"][0]

    assert item["product_id"] == str(product.id)
    assert item["quantity"] == 1


@pytest.mark.asyncio
async def test_update_cart(
    authenticated_client,
    test_products,
    db_session,
):
    product = test_products[0]

    await add_product_to_cart(
        authenticated_client,
        product,
    )

    cart_item = await get_cart_item(
        db_session,
        product.id,
    )

    response = await authenticated_client.patch(
        "/api/v1/cart",
        json={
            "cart_id": str(cart_item.id),
            "quantity": 3,
        },
    )

    assert response.status_code == 200

    item = response.json()["items"][0]

    assert item["id"] == str(cart_item.id)
    assert item["quantity"] == 3


@pytest.mark.asyncio
async def test_update_negative_cart_quantity(
    authenticated_client,
    test_products,
    db_session,
):
    product = test_products[0]

    await add_product_to_cart(
        authenticated_client,
        product,
    )

    cart_item = await get_cart_item(
        db_session,
        product.id,
    )

    response = await authenticated_client.patch(
        "/api/v1/cart",
        json={
            "cart_id": str(cart_item.id),
            "quantity": -3,
        },
    )

    assert response.status_code == 422


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "quantity",
    [-1, -3, -100, 0],
)
async def test_invalid_cart_quantity(
    authenticated_client,
    test_products,
    db_session,
    quantity,
):
    product = test_products[0]

    await add_product_to_cart(
        authenticated_client,
        product,
    )

    cart_item = await get_cart_item(
        db_session,
        product.id,
    )

    response = await authenticated_client.patch(
        "/api/v1/cart",
        json={
            "cart_id": str(cart_item.id),
            "quantity": quantity,
        },
    )

    assert response.status_code == 422
