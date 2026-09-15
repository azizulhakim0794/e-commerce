from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field


class RatingCreate(BaseModel):
    product_id: UUID
    rating: int = Field(ge=1, le=5)
    comment: str | None = Field(default=None, max_length=1000)


class RatingUpdate(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str | None = Field(default=None, max_length=1000)


class RatingResponse(BaseModel):
    id: UUID
    product_id: UUID
    rating: int
    comment: str | None
    photo_url: str | None = None
    user_name: str
    user_pic: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
