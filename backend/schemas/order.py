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

    model_config = {"from_attributes": True}
