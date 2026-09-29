from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field
from schemas.cart import CartItemResponse
from schemas.auth import UserPrivate
from decimal import Decimal

# from schemas.product import ProductRespons

# from schemas.auth import UserPrivate


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


class OrderedProductResponse(BaseModel):
    id: UUID
    quantity: int
    order_items: list[CartItemResponse] = Field(default_factory=list)
    user_details: UserPrivate
    created_at: datetime
    price: Decimal
    user_details: UserPrivate

    model_config = {"from_attributes": True}


# class OrderedProductResponse(BaseModel):
#     id: UUID
#     product_id: UUID
#     quantity: int
#     price: Decimal
#     created_at: datetime
#     user_details: UserResponse


class AllOrderResponse(BaseModel):
    order_items: list[OrderedProductResponse] = Field(default_factory=list)
    created_at: datetime
    delivery_at: datetime
    status: str = "processing"

    model_config = {"from_attributes": True}
