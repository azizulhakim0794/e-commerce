from fastapi import APIRouter, Depends
from typing import Annotated
from db.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from services import auth as auth_service
from schemas.auth import UserCreate, UserPrivate
from models.user import User

router = APIRouter()

DBSession = Annotated[AsyncSession, Depends(get_db)]


@router.post("", response_model=UserPrivate)
async def create_user(db: DBSession, user_data: UserCreate):
    return await auth_service.create_user(db, user_data)
