from sqlalchemy import select
from fastapi import status, HTTPException, Depends
from core.security import CurrentUser
from db.database import get_db
from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from schemas.address import AddressCreate, AddressUpdate
from models.address import Address

DBSession = Annotated[AsyncSession, Depends(get_db)]


async def create_address(
    db: DBSession, current_user: CurrentUser, address_data: AddressCreate
) -> Address:
    new_address = Address(
        user_id=current_user.id,
        full_name=address_data.full_name,
        phone_number=address_data.phone_number,
        address_type=address_data.address_type,
        address_line_1=address_data.address_line_1,
        address_line_2=address_data.address_line_2,
        city=address_data.city,
        state_or_division=address_data.state_or_division,
        postal_code=address_data.postal_code,
        country=address_data.country,
    )

    db.add(new_address)
    await db.commit()
    await db.refresh(new_address)

    return new_address


async def get_addresses(db: DBSession, current_user: CurrentUser) -> list[Address]:
    result = await db.execute(select(Address).where(Address.user_id == current_user.id))

    addresses = result.scalars().all()
    if not addresses:
        return []

    return addresses


async def update_address(
    db: DBSession, current_user: CurrentUser, address_data: AddressUpdate
) -> Address:
    result = await db.execute(
        select(Address).where(
            Address.id == address_data.id,
            current_user.id == Address.user_id,
        )
    )

    existing_address = result.scalar_one_or_none()

    if not existing_address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="address not found"
        )

    update_data = address_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(existing_address, field, value)

    await db.commit()
    await db.refresh(existing_address)

    return existing_address


async def delete_address(db: DBSession, current_user: CurrentUser, address_id: UUID):
    result = await db.execute(
        select(Address).where(
            current_user.id == Address.user_id, Address.id == address_id
        )
    )

    existing_address = result.scalar_one_or_none()

    if not existing_address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="address not found"
        )

    await db.delete(existing_address)
    await db.commit()
