from pathlib import Path
from urllib.parse import urlparse

from core.cloudinary import cloudinary


def upload_image(
    file_path: Path,
    folder: str,
) -> dict[str, str]:
    result = cloudinary.uploader.upload(
        str(file_path),
        folder=folder,
        resource_type="image",
        transformation=[
            {
                "width": 1200,
                "height": 1200,
                "crop": "limit",
                "quality": "auto",
                "fetch_format": "auto",
            }
        ],
    )

    return {
        "url": result["secure_url"],
        "public_id": result["public_id"],
    }


def delete_image(public_id: str):
    result = cloudinary.uploader.destroy(
        public_id,
        resource_type="image",
    )
    return result


def delete_image_from_url(image_url: str) -> dict[str, str] | None:
    parsed_url = urlparse(image_url)
    if parsed_url.hostname != "res.cloudinary.com":
        return None

    path_parts = parsed_url.path.strip("/").split("/")
    try:
        upload_index = path_parts.index("upload")
    except ValueError:
        return None

    public_id_parts = path_parts[upload_index + 1 :]
    version_index = next(
        (
            index
            for index, part in enumerate(public_id_parts)
            if part.startswith("v") and part[1:].isdigit()
        ),
        None,
    )
    if version_index is not None:
        public_id_parts = public_id_parts[version_index + 1 :]

    if not public_id_parts:
        return None

    public_id_parts[-1] = public_id_parts[-1].rsplit(".", 1)[0]
    return delete_image("/".join(public_id_parts))
