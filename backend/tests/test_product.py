import pytest

from schemas.product import ProductCreate
from services import product as product_service


@pytest.mark.asyncio
async def test_get_products_uses_redis_cache_and_invalidates_after_create(
    client, db_session, fake_redis
):
    first_response = await client.get("/api/v1/products")
    assert first_response.status_code == 200
    assert first_response.json() == []

    cached_response = await client.get("/api/v1/products")
    assert cached_response.status_code == 200
    assert cached_response.json() == []
    assert fake_redis.cache_hits == 1

    await product_service.create_product(
        db_session,
        fake_redis,
        ProductCreate(
            name="Cached product",
            description="A product used to verify list cache invalidation.",
            price=12.50,
            image="https://example.com/product.jpg",
            category="Test",
            rating=4.5,
            reviews=1,
            badge="New",
            stock=3,
            specs=[],
        ),
    )

    response = await client.get("/api/v1/products")

    assert response.status_code == 200
    assert [product["name"] for product in response.json()] == ["Cached product"]
