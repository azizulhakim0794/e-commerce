import asyncio
import logging
from pathlib import Path
from uuid import UUID

from services import image_service
from services.rating import _save_rating_photo
from services.product import _save_product_photo

logger = logging.getLogger(__name__)
RATING_IMAGE_FOLDER = "ecommerce/ratings"
PRODUCT_IMAGE_FOLDER = "ecommerce/products"


# Uploads an image and persists its URL.
# Keeps the temporary file when processing fails so RQ can retry.
def process_rating_image(
    process_id: str,
    image_path: str,
    folder: str = RATING_IMAGE_FOLDER,
) -> None:
    staged_path = Path(image_path)
    uploaded_image = None
    database_updated = False
    processing_complete = False

    try:
        # Upload the staged image to Cloudinary.
        uploaded_image = image_service.upload_image(
            file_path=staged_path,
            folder=folder,
        )

        # Save the Cloudinary URL using a worker-owned DB session.
        if folder == RATING_IMAGE_FOLDER:
            record_updated, previous_photo_url = asyncio.run(
                _save_rating_photo(
                    UUID(process_id),
                    uploaded_image["url"],
                )
            )

        elif folder == PRODUCT_IMAGE_FOLDER:
            record_updated, previous_photo_url = asyncio.run(
                _save_product_photo(
                    UUID(process_id),
                    uploaded_image["url"],
                )
            )

        else:
            raise ValueError(f"Unsupported image folder: {folder}")

        if not record_updated:
            # The rating or product was deleted before this job executed.
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
                    "Could not delete previous photo from folder '%s'. Process ID: %s",
                    folder,
                    process_id,
                )

    except Exception:
        # If the database update has not completed, try to remove
        # the newly uploaded image to avoid unnecessary Cloudinary files.
        if uploaded_image is not None and not database_updated:
            try:
                image_service.delete_image(uploaded_image["public_id"])
            except Exception:
                logger.exception(
                    "Could not clean up failed image upload: %s the location is: %s",
                    process_id,
                    folder,
                )

        # RQ must receive the exception to recognize the job as failed
        # and apply its retry policy.
        raise

    finally:
        # Keep the file when the job fails so retries can use it.
        if processing_complete:
            staged_path.unlink(missing_ok=True)
