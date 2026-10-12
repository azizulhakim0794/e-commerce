"""add photo_url to products

Revision ID: 3007e9509e6e
Revises: c38ac6f9d210
Create Date: 2026-10-12 02:37:07.088714

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3007e9509e6e'
down_revision: Union[str, Sequence[str], None] = 'c38ac6f9d210'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column(
        "products",
        "image",
        new_column_name="photo_url",
        existing_type=sa.String(),
        existing_nullable=False,
        nullable=True,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("UPDATE products SET photo_url = '' WHERE photo_url IS NULL")
    op.alter_column(
        "products",
        "photo_url",
        new_column_name="image",
        existing_type=sa.String(),
        existing_nullable=True,
        nullable=False,
    )
