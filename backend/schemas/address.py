from pydantic import BaseModel, ConfigDict
from uuid import UUID


class AddressBase(BaseModel):
    full_name: str
    phone_number: str
    address_type: str
    address_line_1: str
    address_line_2: str
    city: str
    state_or_division: str
    postal_code: str
    country: str


class AddressCreate(AddressBase):
    pass


class AddressUpdate(BaseModel):
    id: UUID
    full_name: str | None = None
    phone_number: str | None = None
    address_type: str | None = None
    address_line_1: str | None = None
    address_line_2: str | None = None
    city: str | None = None
    state_or_division: str | None = None
    postal_code: str | None = None
    country: str | None = None


class AddressResponse(AddressBase):
    id: UUID
    user_id: UUID

    model_config = ConfigDict(from_attributes=True)
