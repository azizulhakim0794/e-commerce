from uuid import UUID

from pydantic import BaseModel, Field
from schemas.product import ProductResponse


class CartItemCreate(BaseModel):
    product_id: UUID
    quantity: int = Field(default=1, gt=0)


class CartItemUpdate(BaseModel):
    quantity: int = Field(default=1, gt=0)
    cart_id: UUID


class CartItemResponse(BaseModel):
    id: UUID
    product_id: UUID
    quantity: int
    product: ProductResponse

    model_config = {"from_attributes": True}


class CartResponse(BaseModel):
    id: UUID
    user_id: UUID
    items: list[CartItemResponse] = Field(default_factory=list)

    model_config = {"from_attributes": True}
