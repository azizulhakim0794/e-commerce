from pydantic import BaseModel, Field
from uuid import UUID
from decimal import Decimal


class ProductCreate(BaseModel):
    name: str
    description: str
    price: Decimal = Field(gt=0)
    original_price: Decimal | None = Field(default=None, gt=0)
    image: str
    category: str
    rating: float = Field(ge=0, le=5)
    reviews: int = Field(ge=0)
    stock: int = Field(ge=0)
    specs: list[str]
    model: str


class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    price: Decimal | None = Field(default=None, gt=0)
    original_price: Decimal | None = Field(default=None, gt=0)
    image: str | None = None
    category: str | None = None
    stock: int | None = Field(default=None, ge=0)
    specs: list[str] | None = None
    model: str | None = None


class ProductResponse(BaseModel):
    id: UUID
    name: str
    description: str
    price: Decimal
    original_price: Decimal | None = None
    image: str
    category: str
    rating: float = Field(ge=0, le=5)
    reviews: int = Field(ge=0)
    stock: int = Field(ge=0)
    specs: list[str]
    model: str
