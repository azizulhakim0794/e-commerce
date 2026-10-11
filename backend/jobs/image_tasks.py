import asyncio
import logging
from pathlib import Path
from uuid import UUID

from services import image_service
from services.rating import _save_rating_photo

logger = logging.getLogger(__name__)


# Uploads a rating photo and persists its URL.
# Keeps the temporary file when processing fails so RQ can retry.
def process_rating_image(
    rating_id: str,
    image_path: str,
) -> None:
    staged_path = Path(image_path)
    uploaded_image = None
    database_updated = False
    processing_complete = False

    try:
        # Upload the staged image to Cloudinary.
        uploaded_image = image_service.upload_image(
            file_path=staged_path,
            folder="ecommerce/ratings",
        )

        # Save the Cloudinary URL using a worker-owned DB session.
        rating_updated, previous_photo_url = asyncio.run(
            _save_rating_photo(
                UUID(rating_id),
                uploaded_image["url"],
            )
        )

        if not rating_updated:
            # The rating was deleted before this job executed.
            image_service.delete_image(uploaded_image["public_id"])
            processing_complete = True
            return

        database_updated = True
        processing_complete = True

        # Delete the old image only after the new URL is saved.
        if previous_photo_url:
            try:
                image_service.delete_image_from_url(previous_photo_url)
            except Exception:
                # Log cleanup failure without retrying the upload.
                logger.exception(
                    "Could not delete previous rating photo: %s",
                    rating_id,
                )

    except Exception:
        # If the database update has not completed, try to remove
        # the newly uploaded image to avoid unnecessary Cloudinary files.
        if uploaded_image is not None and not database_updated:
            try:
                image_service.delete_image(uploaded_image["public_id"])
            except Exception:
                logger.exception(
                    "Could not clean up failed image upload: %s",
                    rating_id,
                )

        # RQ must receive the exception to recognize the job as failed
        # and apply its retry policy.
        raise

    finally:
        # Keep the file when the job fails so retries can use it.
        if processing_complete:
            staged_path.unlink(missing_ok=True)
