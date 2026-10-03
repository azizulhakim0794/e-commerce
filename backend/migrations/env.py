import asyncio
import os
from logging.config import fileConfig
from pathlib import Path

from dotenv import load_dotenv

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

# Load the backend environment before importing database settings.
load_dotenv(Path(__file__).resolve().parents[1] / ".env")

from db.database import Base

# Import all models so SQLAlchemy registers their tables
from models import Address, Cart, CartItem, Order, OrderItem, Product, Rating, User

config = context.config


if config.config_file_name is not None:
    fileConfig(config.config_file_name)


DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set")


# This is what Alembic uses for --autogenerate
target_metadata = Base.metadata


def run_migrations_offline() -> None:

    context.configure(
        url=DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:

    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:

    configuration = config.get_section(config.config_ini_section)

    configuration["sqlalchemy.url"] = DATABASE_URL

    connectable = async_engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    try:
        async with connectable.connect() as connection:
            await connection.run_sync(do_run_migrations)
    finally:
        await connectable.dispose()


def run_migrations_online() -> None:

    asyncio.run(run_async_migrations())


if context.is_offline_mode():

    run_migrations_offline()

else:

    run_migrations_online()
