import json

import pytest

from core.config import settings
from services import product as product_service


def _product_data(name: str) -> dict:
    return {
        "name": name,
        "description": "Product API upload test.",
        "price": 12.5,
        "category": "Test",
        "rating": 4.5,
        "reviews": 1,
        "badge": "New",
        "stock": 3,
        "specs": [],
    }


@pytest.mark.asyncio
async def test_create_product_accepts_json_without_photo(authenticated_client):
    response = await authenticated_client.post(
        "/api/v1/products",
        json=_product_data("JSON product"),
    )

    assert response.status_code == 200
    assert response.json()["name"] == "JSON product"


@pytest.mark.asyncio
async def test_create_product_accepts_product_data_and_photo(
    authenticated_client, monkeypatch, tmp_path
):
    monkeypatch.setattr(settings, "image_upload_temp_dir", tmp_path)
    enqueue_calls = []

    def enqueue_image(product_id, image_path, folder):
        enqueue_calls.append((product_id, image_path, folder))
        return "image-job-id"

    monkeypatch.setattr(product_service, "enqueue_image", enqueue_image)

    response = await authenticated_client.post(
        "/api/v1/products",
        data={"product_data": json.dumps(_product_data("Uploaded product"))},
        files={"photo": ("product.png", b"image-data", "image/png")},
    )

    assert response.status_code == 200
    assert response.json()["name"] == "Uploaded product"
    assert len(enqueue_calls) == 1
    product_id, image_path, folder = enqueue_calls[0]
    assert str(product_id) == response.json()["id"]
    assert image_path.read_bytes() == b"image-data"
    assert folder == "ecommerce/products"
