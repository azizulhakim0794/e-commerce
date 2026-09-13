from fastapi import APIRouter, status, Depends, Response
from db.database import get_db
from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from schemas.address import AddressResponse, AddressCreate, AddressUpdate
from services import address as address_service
from core.security import CurrentUser
from uuid import UUID

router = APIRouter()

DBSession = Annotated[AsyncSession, Depends(get_db)]


@router.post("", response_model=AddressResponse)
async def create_address(
    db: DBSession, current_user: CurrentUser, address_data: AddressCreate
):
    return address_service.create_address(db, current_user, address_data)


@router.get("", response_model=list[AddressResponse])
async def get_addresses(db: DBSession, current_user: CurrentUser):
    return address_service.get_addresses(db, current_user)


@router.patch("", response_model=AddressResponse)
async def update_address(
    db: DBSession, current_user: CurrentUser, address_data: AddressUpdate
):
    return address_service.update_address(db, current_user, address_data)


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def update_address(db: DBSession, current_user: CurrentUser, address_id: UUID):
    return address_service.update_address(db, current_user, address_id)
