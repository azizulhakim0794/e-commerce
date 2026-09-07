from contextlib import asynccontextmanager

from fastapi import FastAPI

from db.database import Base, engine
from models.product import Product  # noqa: F401 - ensure model metadata is registered
from routers.product import router as product_router


@asynccontextmanager
async def lifespan(_: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(lifespan=lifespan)


app.include_router(
    product_router,
    prefix="/products",
    tags=["Products"],
)


@app.get("/")
async def root():
    return {"message": "Hello, FastAPI!"}
