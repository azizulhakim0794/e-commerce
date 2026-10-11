from io import BytesIO
from uuid import UUID, uuid4

import pytest
from fastapi import HTTPException, UploadFile
from redis.exceptions import RedisError
from starlette.datastructures import Headers

from core.config import settings
from jobs import image_tasks, queue as queue_service
from services import image_service, rating as rating_service


def test_image_queue_uses_a_synchronous_redis_connection():
    from redis import Redis

    assert isinstance(queue_service.image_queue.connection, Redis)


def test_rq_worker_consumes_the_shared_image_queue(monkeypatch):
    from workers import rq_worker

    worker_args = {}

    class FakeWorker:
        def __init__(self, queues):
            worker_args["queues"] = queues

        def work(self, *, with_scheduler):
            worker_args["with_scheduler"] = with_scheduler

    monkeypatch.setattr(rq_worker, "Worker", FakeWorker)

    rq_worker.main()

    assert worker_args == {
        "queues": [queue_service.image_queue],
        "with_scheduler": True,
    }


def _upload(content: bytes, content_type: str = "image/png") -> UploadFile:
    return UploadFile(
        file=BytesIO(content),
        filename="review.png",
        headers=Headers({"content-type": content_type}),
    )


@pytest.mark.asyncio
async def test_stage_photo_writes_upload_to_configured_shared_directory(
    tmp_path, monkeypatch
):
    monkeypatch.setattr(settings, "image_upload_temp_dir", tmp_path)

    image_path = await rating_service._stage_photo(_upload(b"image-data"))

    assert image_path.parent == tmp_path
    assert image_path.suffix == ".png"
    assert image_path.read_bytes() == b"image-data"


@pytest.mark.asyncio
async def test_stage_photo_rejects_files_over_configured_limit(monkeypatch, tmp_path):
    monkeypatch.setattr(settings, "image_upload_temp_dir", tmp_path)
    monkeypatch.setattr(settings, "max_upload_size_bytes", 3)

    with pytest.raises(HTTPException) as exc_info:
        await rating_service._stage_photo(_upload(b"four"))

    assert exc_info.value.status_code == 413


def test_queue_enqueue_removes_file_when_redis_is_unavailable(
    tmp_path, monkeypatch
):
    class UnavailableQueue:
        def enqueue(self, *args, **kwargs):
            raise RedisError("Redis unavailable")

    image_path = tmp_path / "rating.png"
    image_path.write_bytes(b"image-data")
    monkeypatch.setattr(queue_service, "image_queue", UnavailableQueue())

    with pytest.raises(RedisError):
        queue_service.enqueue_rating_image(
            rating_id=uuid4(),
            image_path=image_path,
        )

    assert not image_path.exists()


def test_image_job_uploads_and_persists_photo_in_background(tmp_path, monkeypatch):
    image_path = tmp_path / "rating.png"
    image_path.write_bytes(b"image-data")
    upload_calls = []
    persisted_urls = []

    def upload_image(*, file_path, folder):
        upload_calls.append((file_path, folder))
        return {
            "url": "https://res.cloudinary.com/example/image/upload/rating.png",
            "public_id": "ecommerce/ratings/rating",
        }

    async def save_rating_photo(rating_id, photo_url):
        persisted_urls.append((rating_id, photo_url))
        return True, None

    monkeypatch.setattr(image_service, "upload_image", upload_image)
    monkeypatch.setattr(image_tasks, "_save_rating_photo", save_rating_photo)

    image_tasks.process_rating_image(
        "8a2c8f63-96b8-4f1b-a4db-75f34aef332d",
        str(image_path),
    )

    assert upload_calls == [(image_path, "ecommerce/ratings")]
    assert persisted_urls == [
        (
            UUID("8a2c8f63-96b8-4f1b-a4db-75f34aef332d"),
            "https://res.cloudinary.com/example/image/upload/rating.png",
        )
    ]
    assert not image_path.exists()


def test_delete_image_from_url_extracts_cloudinary_public_id(monkeypatch):
    deleted_ids = []
    monkeypatch.setattr(
        image_service,
        "delete_image",
        lambda public_id: deleted_ids.append(public_id),
    )

    image_service.delete_image_from_url(
        "https://res.cloudinary.com/example/image/upload/"
        "c_limit,w_1200/v123456/ecommerce/ratings/rating.webp"
    )

    assert deleted_ids == ["ecommerce/ratings/rating"]
