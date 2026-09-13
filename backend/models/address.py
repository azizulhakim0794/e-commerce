from db.database import Base
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import ForeignKey, String, DateTime, func
from datetime import datetime

from uuid import UUID, uuid4


class Address(Base):
    __tablename__ = "addresses"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id"), nullable=False, unique=True
    )
    full_name: Mapped[str] = mapped_column(String)
    phone_number: Mapped[str] = mapped_column(String)
    address_type: Mapped[str] = mapped_column(String)
    address_line_1: Mapped[str] = mapped_column(String)
    address_line_2: Mapped[str] = mapped_column(String)
    city: Mapped[str] = mapped_column(String)
    state_or_division: Mapped[str] = mapped_column(String)
    postal_code: Mapped[str] = mapped_column(String)
    country: Mapped[str] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
