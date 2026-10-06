from fastapi import APIRouter, Depends, Response
from typing import Annotated
from db.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from services import auth as auth_service
from schemas.auth import (
    UserCreate,
    UserPrivate,
    UserLogin,
    LoginResponse,
    UserList,
    UserUpdate,
    ChangePassword,
)
from models.user import User
from core.security import CurrentUser, AdminUser

router = APIRouter()

DBSession = Annotated[AsyncSession, Depends(get_db)]


@router.post("", response_model=UserPrivate)
async def create_user(db: DBSession, user_data: UserCreate):
    return await auth_service.create_user(db, user_data)


@router.post("/token", response_model=LoginResponse)
async def login_with_token(response: Response, db: DBSession, user_data: UserLogin):
    return await auth_service.login_with_token(response, db, user_data)


@router.get("/me", response_model=UserPrivate)
async def get_current_user(current_user: CurrentUser):
    return current_user


@router.patch("/me", response_model=UserPrivate)
async def update_current_user(
    db: DBSession, current_user: CurrentUser, user_data: UserUpdate
):
    return await auth_service.update_user(db, current_user, user_data)


@router.post("/me/change-password", response_model=LoginResponse)
async def change_password(
    db: DBSession, current_user: CurrentUser, password_data: ChangePassword
):
    return await auth_service.change_password(db, current_user, password_data)


@router.get("", response_model=list[UserList])
async def get_users(db: DBSession, current_user: AdminUser):
    return await auth_service.get_users(db, current_user)


@router.post("/logout", response_model=LoginResponse)
async def logout(response: Response):
    return await auth_service.logout(response)
