from fastapi import FastAPI
from .routers.product import router as product_router

app = FastAPI()


app.include_router(
    product_router,
    prefix="/products",
    tags=["Products"],
)


@app.get("/")
async def root():
    return {"message": "Hello, FastAPI!"}
