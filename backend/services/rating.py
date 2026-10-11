from pathlib import Path
from uuid import UUID, uuid4

from fastapi import Depends, HTTPException, UploadFile, status
from redis.exceptions import RedisError
from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import selectinload

from core.config import settings

from core.security import CurrentUser
from db.database import get_db
from jobs.queue import enqueue_rating_image as enqueue_rating_image_job
from models import Order, OrderItem, Rating, Product
from schemas.rating import RatingCreate, RatingResponse, RatingUpdate
from services import image_service
from services.order import _build_order_response
from db.database import AsyncSessionFactory

DBSession = Annotated[AsyncSession, Depends(get_db)]
ALLOWED_PHOTO_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}


# Creates or updates a product rating after verifying that the user has received the product.
# If a photo is provided, stages it temporarily and queues it for background processing.
async def create_rating(
    db: DBSession,
    current_user: CurrentUser,
    rating_data: RatingCreate,
    photo: UploadFile | None = None,
) -> RatingResponse:
    result = await db.execute(
        select(Product).where(Product.id == rating_data.product_id)
    )

    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Product not found"
        )

    orders_result = await db.execute(
        select(Order)
        .options(selectinload(Order.items))
        .where(
            Order.user_id == current_user.id,
            Order.items.any(OrderItem.product_id == product.id),
        )
    )

    has_delivered_order = any(
        _build_order_response(order).status == "delivered"
        for order in orders_result.scalars().all()
    )

    if not has_delivered_order:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can review products only after delivery",
        )

    existing_result = await db.execute(
        select(Rating).where(
            Rating.product_id == rating_data.product_id,
            Rating.user_id == current_user.id,
        )
    )
    rating = existing_result.scalar_one_or_none()

    image_path = await _stage_photo(photo) if photo else None
    if rating:
        rating.rating = rating_data.rating
        rating.comment = rating_data.comment
    else:
        rating = Rating(
            product_id=product.id,
            user_id=current_user.id,
            rating=rating_data.rating,
            comment=rating_data.comment,
        )
        db.add(rating)

    await _refresh_product_summary(db, product)
    try:
        await db.commit()
    except SQLAlchemyError:
        if image_path:
            image_path.unlink(missing_ok=True)
        raise

    if image_path:
        try:
            enqueue_rating_image_job(rating.id, image_path)
        except RedisError as exc:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Image processing queue unavailable",
            ) from exc

    rating_result = await db.execute(
        select(Rating).options(selectinload(Rating.user)).where(Rating.id == rating.id)
    )
    rating = rating_result.scalar_one()

    return rating


# Validates the uploaded photo, checks its size, and saves it
# to a temporary directory so a background worker can process it later.
async def _stage_photo(photo: UploadFile) -> Path:
    extension = ALLOWED_PHOTO_TYPES.get(photo.content_type or "")
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


async def _save_rating_photo(
    rating_id: UUID,
    photo_url: str,
) -> tuple[bool, str | None]:
    async with AsyncSessionFactory() as db:
        result = await db.execute(select(Rating).where(Rating.id == rating_id))
        rating = result.scalar_one_or_none()

        if rating is None:
            return False, None

        previous_photo_url = rating.photo_url
        rating.photo_url = photo_url

        await db.commit()

        return True, previous_photo_url


async def get_rating(db: DBSession, current_user: CurrentUser) -> list[RatingResponse]:
    result = await db.execute(
        select(Rating)
        .options(selectinload(Rating.user))
        .where(Rating.user_id == current_user.id)
        .order_by(Rating.created_at.desc())
    )

    ratings = result.scalars().all()

    return ratings


async def get_ratings_by_product_id(
    db: DBSession, product_id: UUID
) -> list[RatingResponse]:
    result = await db.execute(
        select(Rating)
        .options(selectinload(Rating.user))
        .where(Rating.product_id == product_id)
        .order_by(Rating.created_at.desc())
    )

    ratings = result.scalars().all()
    return ratings


async def update_rating(
    db: DBSession,
    current_user: CurrentUser,
    rating_id: UUID,
    rating_data: RatingUpdate,
    photo: UploadFile | None = None,
) -> RatingResponse:
    result = await db.execute(
        select(Rating).where(
            Rating.id == rating_id,
            Rating.user_id == current_user.id,
        )
    )
    rating = result.scalar_one_or_none()

    if not rating:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Rating not found"
        )

    rating.rating = rating_data.rating
    rating.comment = rating_data.comment

    image_path = await _stage_photo(photo) if photo else None
    product_result = await db.execute(
        select(Product).where(Product.id == rating.product_id)
    )
    product = product_result.scalar_one()
    await _refresh_product_summary(db, product)
    try:
        await db.commit()
    except SQLAlchemyError:
        if image_path:
            image_path.unlink(missing_ok=True)
        raise

    if image_path:
        try:
            enqueue_rating_image_job(rating.id, image_path)
        except RedisError as exc:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Image processing queue unavailable",
            ) from exc

    rating_result = await db.execute(
        select(Rating).options(selectinload(Rating.user)).where(Rating.id == rating.id)
    )
    rating = rating_result.scalar_one()
    return rating


async def _refresh_product_summary(db: AsyncSession, product: Product) -> None:
    summary = await db.execute(
        select(func.avg(Rating.rating), func.count(Rating.id)).where(
            Rating.product_id == product.id
        )
    )
    average, count = summary.one()
    product.rating = round(float(average or 0), 2)
    product.reviews = int(count)


async def delete_rating(
    db: DBSession,
    current_user: CurrentUser,
    rating_id: UUID,
) -> None:
    result = await db.execute(
        select(Rating).where(
            Rating.id == rating_id,
            Rating.user_id == current_user.id,
        )
    )
    rating = result.scalar_one_or_none()

    if not rating:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Rating not found"
        )

    product_result = await db.execute(
        select(Product).where(Product.id == rating.product_id)
    )
    product = product_result.scalar_one_or_none()

    photo_url = rating.photo_url

    await db.delete(rating)
    await db.commit()

    if photo_url:
        image_service.delete_image_from_url(photo_url)

    if product:
        await _refresh_product_summary(db, product)
        await db.commit()
