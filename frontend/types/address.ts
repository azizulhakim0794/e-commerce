export type AddressType = "home" | "office";

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone_number: string;
  address_type: AddressType;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state_or_division: string;
  postal_code: string;
  country: string;
}

export type AddressFormValues = Omit<
  Address,
  "id" | "user_id"
>;

export type AddressUpdatePayload = AddressFormValues & {
  id: string;
};
