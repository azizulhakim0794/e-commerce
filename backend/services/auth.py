from sqlalchemy import func, select
from typing import Annotated
from fastapi import HTTPException, status, Depends, Response
from db.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from schemas.auth import UserCreate, UserLogin
from core.config import settings
from models.user import User
from datetime import timedelta

from core.security import (
    hash_password,
    verify_password,
    create_access_token,
    CurrentUser,
)

DBSession = Annotated[AsyncSession, Depends(get_db)]


async def create_user(db: DBSession, user: UserCreate):

    result = await db.execute(
        select(User).where(func.lower(User.email) == user.email.lower())
    )

    existing_email = result.scalars().first()

    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address already exist",
        )

    password_hash = hash_password(user.password)
    new_user = User(
        email=user.email,
        username=user.username,
        password_hash=password_hash,
        # image_file=user.image_file,
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return new_user


async def login_with_token(
    response: Response,
    db: DBSession,
    user_data: UserLogin,
):

    result = await db.execute(
        select(User).where(func.lower(User.email) == user_data.email.lower())
    )

    db_user = result.scalars().first()

    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    if not verify_password(
        user_data.password,
        db_user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    # Create access token with user id as subject
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": str(db_user.id)},
        expires_delta=access_token_expires,
    )
    # return Token(access_token=access_token, token_type="bearer")

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,
        samesite="lax",
    )

    return {"message": "Login successful"}


async def get_current_user(current_user: CurrentUser):
    return current_user
