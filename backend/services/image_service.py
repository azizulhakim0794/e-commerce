import cloudinary.uploader


async def upload_image(file):
    result = cloudinary.uploader.upload(
        file.file,
        folder="ecommerce/products",
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


async def delete_image(public_id: str):
    result = cloudinary.uploader.destroy(
        public_id,
        resource_type="image",
    )

    return result
