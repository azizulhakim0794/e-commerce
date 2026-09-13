from uuid import UUID

from pydantic import BaseModel, Field
from schemas.cart import CartItemResponse


class OrderCreate(BaseModel):
    order_items: list[CartItemResponse] = Field(default_factory=list)
    # address_id:
