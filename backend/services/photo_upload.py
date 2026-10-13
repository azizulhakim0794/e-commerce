from collections.abc import Mapping
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status

from core.config import settings


async def stage_photo(
    photo: UploadFile,
    allowed_photo_types: Mapping[str, str],
) -> Path:
    extension = allowed_photo_types.get(photo.content_type or "")
    if extension is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported image type",
        )
    image_data = await photo.read(settings.max_upload_size_bytes + 1)
    if not image_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image file is empty",
        )
    if len(image_data) > settings.max_upload_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail="Image file is too large",
        )

    upload_dir = settings.image_upload_temp_dir
    upload_dir.mkdir(parents=True, exist_ok=True)
    image_path = upload_dir / f"{uuid4().hex}{extension}"
    image_path.write_bytes(image_data)
    return image_path
