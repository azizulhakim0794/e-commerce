from fastapi import APIRouter, Depends, Response
from typing import Annotated
from db.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from services import auth as auth_service
from schemas.auth import UserCreate, UserPrivate, UserLogin, LoginResponse
from models.user import User
from core.security import CurrentUser

router = APIRouter()

DBSession = Annotated[AsyncSession, Depends(get_db)]


@router.post("", response_model=UserPrivate)
async def create_user(db: DBSession, user_data: UserCreate):
    return await auth_service.create_user(db, user_data)


@router.post("/token", response_model=LoginResponse)
async def login_with_token(response: Response, db: DBSession, user_data: UserLogin):
    return await auth_service.login_with_token(response, db, user_data)


@router.post("/me", response_model=UserPrivate)
async def get_current_user(currect_user: CurrentUser):
    return await auth_service.get_current_user(currect_user)
