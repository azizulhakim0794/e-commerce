from contextlib import asynccontextmanager

from fastapi import FastAPI

from db.database import Base, engine

# from models.product import Product  # noqa: F401 - ensure model metadata is registered
from routers.product import router as product_router
from routers.auth import router as auth_router


@asynccontextmanager
async def lifespan(_: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(lifespan=lifespan)

API_PREFIX = "/api/v1"

app.include_router(
    product_router,
    prefix=f"{API_PREFIX}/products",
    tags=["Products"],
)

app.include_router(
    auth_router,
    prefix=f"{API_PREFIX}/users",
    tags=["Users"],
)


@app.get("/")
async def root():
    return {"message": "Hello, FastAPI!"}
