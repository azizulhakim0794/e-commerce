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


class AddressUpdate(AddressBase):
    pass


class AddressResponse(AddressBase):
    id: UUID
    user_id: UUID

    model_config = ConfigDict(from_attributes=True)
