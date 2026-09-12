from db.database import Base
from uuid import UUID, uuid4
from decimal import Decimal

# from models.cart import CartItem
from sqlalchemy import (
    DateTime,
    ForeignKey,
    String,
    Text,
    Numeric,
    JSON,
    Integer,
    Float,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship


class Product(Base):
    __tablename__ = "products"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)

    name: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text)

    price: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    original_price: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2), nullable=True
    )

    image: Mapped[str] = mapped_column(String)
    category: Mapped[str] = mapped_column(String)

    rating: Mapped[float] = mapped_column(Float, default=0)
    reviews: Mapped[int] = mapped_column(Integer, default=0)
    badge: Mapped[str] = mapped_column(String)
    stock: Mapped[int] = mapped_column(Integer, default=0)

    specs: Mapped[list[str]] = mapped_column(JSON)

    cart_items: Mapped[list["CartItem"]] = relationship(back_populates="product")
