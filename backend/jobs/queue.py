# backend/jobs/queue.py

from pathlib import Path
from uuid import UUID

from redis import Redis
from rq import Queue, Retry

from core.config import settings

# Queue dedicated to background image-processing jobs.
redis_connection = Redis.from_url(settings.REDIS_URL, protocol=2)
image_queue = Queue(
    name="images",
    connection=redis_connection,
)


# Adds an image-processing job to Redis/RQ.
def enqueue_image(
    items_id: UUID,
    image_path: Path,
    folder: str = "ecommerce/ratings",
) -> str:
    try:
        job = image_queue.enqueue(
            "jobs.image_tasks.process_image",
            str(items_id),
            str(image_path),
            str(folder),
            retry=Retry(
                max=3,
                interval=[30, 120],
            ),
            job_timeout=300,
            result_ttl=3600,
        )

        return job.id

    except Exception:
        # A job that was not queued cannot be retried, so remove its staged file.
        image_path.unlink(missing_ok=True)
        raise


# Keep the original import name available to existing rating-image callers.
enqueue_rating_image = enqueue_image


def enqueue_order_confirmation(order_id: UUID) -> str:
    from rq.exceptions import DuplicateJobError

    job_id = f"order-confirmation-{order_id}"
    try:
        job = image_queue.enqueue(
            "jobs.email_tasks.send_order_confirmation_task",
            str(order_id),
            job_id=job_id,
            unique=True,
            retry=Retry(max=3, interval=[30, 120]),
            job_timeout=120,
            result_ttl=86400,
            failure_ttl=604800,
        )
    except DuplicateJobError:
        return job_id

    return job.id
