from io import BytesIO

import pytest
from fastapi import HTTPException, UploadFile
from starlette.datastructures import Headers

from core.config import settings
from schemas.product import ProductCreate
from services import product as product_service


def _image_upload(content: bytes, content_type: str = "image/png") -> UploadFile:
    return UploadFile(
        file=BytesIO(content),
        filename="product.png",
        headers=Headers({"content-type": content_type}),
    )


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
    assert response.json()[0]["image"] == "https://example.com/product.jpg"
    assert response.json()[0]["photo_url"] == "https://example.com/product.jpg"

    cached_response = await client.get("/api/v1/products")
    assert cached_response.status_code == 200
    assert cached_response.json()[0]["image"] == "https://example.com/product.jpg"
    assert cached_response.json()[0]["photo_url"] == "https://example.com/product.jpg"

    product_id = response.json()[0]["id"]
    single_product_response = await client.get(f"/api/v1/products/{product_id}")
    assert single_product_response.status_code == 200
    assert single_product_response.json()["image"] == "https://example.com/product.jpg"
    assert (
        single_product_response.json()["photo_url"]
        == "https://example.com/product.jpg"
    )


@pytest.mark.asyncio
async def test_upload_product_image_stages_and_enqueues_product_photo(
    db_session, fake_redis, tmp_path, monkeypatch
):
    monkeypatch.setattr(settings, "image_upload_temp_dir", tmp_path)
    product = await product_service.create_product(
        db_session,
        fake_redis,
        ProductCreate(
            name="Product with photo",
            description="Product photo upload test.",
            price=12.50,
            category="Test",
            rating=0,
            reviews=0,
            badge="New",
            stock=3,
            specs=[],
        ),
    )
    enqueue_calls = []

    def enqueue_image(product_id, image_path, folder):
        enqueue_calls.append((product_id, image_path, folder))
        return "image-job-id"

    monkeypatch.setattr(product_service, "enqueue_image", enqueue_image)

    result = await product_service.upload_product_image(
        db_session,
        product.id,
        _image_upload(b"image-data"),
    )

    assert result == {"job_id": "image-job-id", "status": "queued"}
    assert len(enqueue_calls) == 1
    assert enqueue_calls[0][0] == product.id
    assert enqueue_calls[0][1].read_bytes() == b"image-data"
    assert enqueue_calls[0][2] == "ecommerce/products"


@pytest.mark.asyncio
async def test_upload_product_image_rejects_unsupported_types():
    with pytest.raises(HTTPException) as exc_info:
        await product_service._stage_photo(_image_upload(b"image-data", "image/gif"))

    assert exc_info.value.status_code == 400


@pytest.mark.asyncio
async def test_upload_product_image_rejects_files_over_configured_limit(
    tmp_path, monkeypatch
):
    monkeypatch.setattr(settings, "image_upload_temp_dir", tmp_path)
    monkeypatch.setattr(settings, "max_upload_size_bytes", 3)

    with pytest.raises(HTTPException) as exc_info:
        await product_service._stage_photo(_image_upload(b"four"))

    assert exc_info.value.status_code == 413
    assert list(tmp_path.iterdir()) == []
