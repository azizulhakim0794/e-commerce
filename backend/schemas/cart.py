from uuid import UUID

from pydantic import BaseModel, Field


class CartItemCreate(BaseModel):
    product_id: UUID
    quantity: int = Field(default=1, gt=0)


class CartItemResponse(BaseModel):
    id: UUID
    product_id: UUID
    quantity: int

    model_config = {"from_attributes": True}


class CartResponse(BaseModel):
    id: UUID
    user_id: UUID
    items: list[CartItemResponse] = []

    model_config = {"from_attributes": True}
