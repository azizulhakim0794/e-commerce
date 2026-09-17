from pathlib import Path
from uuid import UUID, uuid4

from fastapi import Depends, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated
from db.database import get_db
from core.security import CurrentUser
from sqlalchemy import func, select
from sqlalchemy.orm import selectinload
from schemas.rating import RatingCreate, RatingResponse, RatingUpdate
from models import Order, OrderItem, Rating, Product
from services import image_service
from services.order import _build_order_response
from core.config import settings

DBSession = Annotated[AsyncSession, Depends(get_db)]
MEDIA_ROOT = Path(__file__).resolve().parents[1] / "media" / "reviews"
ALLOWED_PHOTO_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}


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

    photo_url = None

    if photo:
        uploaded_image = await image_service.upload_image(
            file=photo, folder="ecommerce/ratings"
        )
        photo_url = uploaded_image["url"]

    if rating:
        rating.rating = rating_data.rating
        rating.comment = rating_data.comment
        if photo_url:
            image_service.delete_image(rating.photo_url)
            rating.photo_url = photo_url
    else:
        rating = Rating(
            product_id=product.id,
            user_id=current_user.id,
            rating=rating_data.rating,
            comment=rating_data.comment,
            photo_url=photo_url,
        )
        db.add(rating)

    await db.commit()
    await _refresh_product_summary(db, product)
    await db.commit()
    rating_result = await db.execute(
        select(Rating).options(selectinload(Rating.user)).where(Rating.id == rating.id)
    )
    rating = rating_result.scalar_one()

    return rating


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

    photo_url = await _save_photo(photo) if photo else None
    rating.rating = rating_data.rating
    rating.comment = rating_data.comment
    if photo_url:
        _remove_photo(rating.photo_url)
        rating.photo_url = photo_url
    await db.commit()

    product_result = await db.execute(
        select(Product).where(Product.id == rating.product_id)
    )
    product = product_result.scalar_one()
    await _refresh_product_summary(db, product)
    await db.commit()
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
