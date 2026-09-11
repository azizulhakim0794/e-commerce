from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db.database import Base, engine

# from models.product import Product  # noqa: F401 - ensure model metadata is registered
from routers.product import router as product_router
from routers.auth import router as auth_router
from routers.cart import router as cart_router


@asynccontextmanager
async def lifespan(_: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(lifespan=lifespan)

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


@app.get("/")
async def root():
    return {"message": "Hello, FastAPI!"}
