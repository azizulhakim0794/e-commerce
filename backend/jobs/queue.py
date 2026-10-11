# backend/jobs/queue.py

from pathlib import Path
from uuid import UUID

from redis import Redis
from redis.exceptions import RedisError
from rq import Queue, Retry

from core.config import settings

# Queue dedicated to background image-processing jobs.
redis_connection = Redis.from_url(settings.REDIS_URL)
image_queue = Queue(
    name="images",
    connection=redis_connection,
)


# Adds a rating image-processing job to Redis/RQ.
def enqueue_rating_image(
    rating_id: UUID,
    image_path: Path,
) -> str:
    try:
        job = image_queue.enqueue(
            "jobs.image_tasks.process_rating_image",
            str(rating_id),
            str(image_path),
            retry=Retry(
                max=3,
                interval=[30, 120],
            ),
            job_timeout=300,
            result_ttl=3600,
        )

        return job.id

    except RedisError:
        # The image could not be queued, so remove its temporary file.
        image_path.unlink(missing_ok=True)
        raise
