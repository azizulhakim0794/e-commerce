from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserBase(BaseModel):
    username: str = Field(min_length=1, max_length=50)
    email: EmailStr = Field(max_length=120)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class UserCreate(UserBase):
    password: str = Field(min_length=8)
    # image_file: str = Field(min_length=8)


class UserPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    username: str
    image_file: str | None = None


class UserPrivate(UserPublic):
    email: EmailStr


class UserUpdate(BaseModel):
    username: str | None = Field(
        default=None,
        min_length=1,
        max_length=50,
    )
    email: EmailStr | None = Field(
        default=None,
        max_length=120,
    )
    image_file: str | None = Field(
        default=None,
        min_length=1,
        max_length=200,
    )
