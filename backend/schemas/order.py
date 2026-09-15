from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field
from schemas.cart import CartItemResponse


class CreateOrderFromCart(BaseModel):
    address_id: UUID


class BuyNowRequest(BaseModel):
    product_id: UUID
    quantity: int
    address_id: UUID


class OrderResponse(BaseModel):
    id: UUID
    order_items: list[CartItemResponse] = Field(default_factory=list)
    created_at: datetime | None = None
    delivery_at: datetime | None = None
    status: str = "processing"

    model_config = {"from_attributes": True}
