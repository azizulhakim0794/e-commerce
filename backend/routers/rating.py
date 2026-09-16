from fastapi import APIRouter, Depends, File, Form, UploadFile
from schemas.rating import RatingCreate, RatingResponse, RatingUpdate
from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from core.security import CurrentUser
from services import rating as rating_service
from db.database import get_db
from uuid import UUID

router = APIRouter()

DBSession = Annotated[AsyncSession, Depends(get_db)]


@router.post("", response_model=RatingResponse)
async def create_rating(
    db: DBSession,
    current_user: CurrentUser,
    product_id: UUID = Form(...),
    rating: int = Form(...),
    comment: str | None = Form(None),
    photo: UploadFile | None = File(None),
):
    rating_data = RatingCreate(
        product_id=product_id,
        rating=rating,
        comment=comment,
    )
    return await rating_service.create_rating(db, current_user, rating_data, photo)


@router.get("/mine", response_model=list[RatingResponse])
async def get_my_ratings(db: DBSession, current_user: CurrentUser):
    return await rating_service.get_rating(db, current_user)


@router.get("/{product_id}", response_model=list[RatingResponse])
async def get_ratings(db: DBSession, product_id: UUID):
    return await rating_service.get_ratings_by_product_id(db, product_id)


@router.patch("/{rating_id}", response_model=RatingResponse)
async def update_rating(
    db: DBSession,
    current_user: CurrentUser,
    rating_id: UUID,
    rating: int = Form(...),
    comment: str | None = Form(None),
    photo: UploadFile | None = File(None),
):
    rating_data = RatingUpdate(rating=rating, comment=comment)
    return await rating_service.update_rating(
        db, current_user, rating_id, rating_data, photo
    )
