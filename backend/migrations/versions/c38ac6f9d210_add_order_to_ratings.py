"""add order reference to ratings

Revision ID: c38ac6f9d210
Revises: af283ded6b84
Create Date: 2026-10-11 19:02:53.294000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c38ac6f9d210"
down_revision: Union[str, Sequence[str], None] = "af283ded6b84"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("ratings", sa.Column("order_id", sa.Uuid(), nullable=True))
    op.create_foreign_key(
        "fk_ratings_order_id_orders",
        "ratings",
        "orders",
        ["order_id"],
        ["id"],
    )
    op.execute(
        sa.text(
            """
            UPDATE ratings
            SET order_id = (
                SELECT orders.id
                FROM orders
                JOIN order_items ON order_items.order_id = orders.id
                WHERE orders.user_id = ratings.user_id
                  AND order_items.product_id = ratings.product_id
                ORDER BY order_items.created_at DESC, orders.id
                LIMIT 1
            )
            """
        )
    )
    op.alter_column(
        "ratings",
        "order_id",
        existing_type=sa.Uuid(),
        nullable=False,
    )
    op.drop_constraint("uq_rating_product_user", "ratings", type_="unique")
    op.create_unique_constraint(
        "uq_rating_order_product_user",
        "ratings",
        ["order_id", "product_id", "user_id"],
    )


def downgrade() -> None:
    op.drop_constraint("uq_rating_order_product_user", "ratings", type_="unique")
    op.create_unique_constraint(
        "uq_rating_product_user",
        "ratings",
        ["product_id", "user_id"],
    )
    op.drop_constraint("fk_ratings_order_id_orders", "ratings", type_="foreignkey")
    op.drop_column("ratings", "order_id")
