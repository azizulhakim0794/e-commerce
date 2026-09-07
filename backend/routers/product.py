from fastapi import APIRouter, HTTPException, status, Query, Depends
from ..schemas.product import ProductResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated
from ..db.database import get_db
from ..services import product as product_service

router = APIRouter()


DBSession = Annotated[AsyncSession, Depends(get_db)]


@router.get("", response_model=list[ProductResponse])
async def get_products(db: DBSession):
    return await product_service.get_products(db)
