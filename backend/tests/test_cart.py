import pytest


@pytest.mark.asyncio
async def test_add_product_to_cart(authenticated_client, test_products):
    product = test_products[0]

    print(product.id)

    response = await authenticated_client.post(
        "/api/v1/cart",
        json={
            "product_id": str(product.id),
            "quantity": 1,
        },
    )

    assert response.status_code == 200
