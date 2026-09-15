from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import inspect, text
from db.database import Base, engine

# from models.product import Product  # noqa: F401 - ensure model metadata is registered
from routers.product import router as product_router
from routers.auth import router as auth_router
from routers.cart import router as cart_router
from routers.address import router as address_router
from routers.order import router as order_router
from routers.rating import router as rating_router


@asynccontextmanager
async def lifespan(_: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

        def migrate_sqlite_schema(sync_conn):
            if sync_conn.dialect.name != "sqlite":
                return

            rating_columns = {
                column["name"] for column in inspect(sync_conn).get_columns("ratings")
            }
            if "photo_url" not in rating_columns:
                sync_conn.execute(
                    text("ALTER TABLE ratings ADD COLUMN photo_url VARCHAR")
                )

        await conn.run_sync(migrate_sqlite_schema)
    yield


app = FastAPI(lifespan=lifespan)
app.mount(
    "/media",
    StaticFiles(directory=Path(__file__).resolve().parent / "media"),
    name="media",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PREFIX = "/api/v1"

app.include_router(
    auth_router,
    prefix=f"{API_PREFIX}/users",
    tags=["Users"],
)

app.include_router(
    product_router,
    prefix=f"{API_PREFIX}/products",
    tags=["Products"],
)

app.include_router(
    cart_router,
    prefix=f"{API_PREFIX}/cart",
    tags=["Carts"],
)

app.include_router(
    address_router,
    prefix=f"{API_PREFIX}/address",
    tags=["Addresses"],
)

app.include_router(
    order_router,
    prefix=f"{API_PREFIX}/orders",
    tags=["Orders"],
)

app.include_router(
    rating_router,
    prefix=f"{API_PREFIX}/rating",
    tags=["Ratings"],
)


# @app.get("/")
# async def root():
#     return {"message": "Hello, FastAPI!"}
