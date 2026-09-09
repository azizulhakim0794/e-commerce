from sqlalchemy import func, select
from typing import Annotated
from fastapi import HTTPException, status, Depends
from db.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from schemas.auth import UserCreate

from models.user import User

from core.security import hash_password

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
    new_user = user(
        email=user.email,
        username=user.username,
        password=password_hash,
        image_file=user.image_file,
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return new_user
