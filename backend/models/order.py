from sqlalchemy.orm import Mapped, mapped_column, relationship
from db.database import Base
from sqlalchemy import ForeignKey, DateTime, func, UniqueConstraint, Numeric
from uuid import UUID, uuid4
from datetime import datetime
from models.product import Product
from decimal import Decimal


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    items: Mapped[list["OrderItem"]] = relationship(
        back_populates="order", cascade="all, delete-orphan"
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    __table_args__ = (
        UniqueConstraint("order_id", "product_id", name="uq_order_product"),
    )

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)

    order_id: Mapped[UUID] = mapped_column(ForeignKey("orders.id"), nullable=False)
    product_id: Mapped[UUID] = mapped_column(ForeignKey("products.id"), nullable=False)
    cart_id: Mapped[UUID | None] = mapped_column(ForeignKey("carts.id"), nullable=True)

    quantity: Mapped[int] = mapped_column(nullable=False, default=1)

    unit_price: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    order: Mapped[Order] = relationship(back_populates="items")

    product: Mapped[Product] = relationship()
