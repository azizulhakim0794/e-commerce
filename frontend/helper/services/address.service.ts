import api from "../api";
import type {
  Address,
  AddressFormValues,
  AddressUpdatePayload,
} from "@/types/address";

export const addressService = {
  getAddresses: async (): Promise<Address[]> => {
    const { data } = await api.get<Address[]>("/address");
    return data;
  },

  createAddress: async (payload: AddressFormValues): Promise<Address> => {
    const { data } = await api.post<Address>("/address", payload);
    return data;
  },

  updateAddress: async (payload: AddressUpdatePayload): Promise<Address> => {
    const { data } = await api.patch<Address>("/address", payload);
    return data;
  },

  deleteAddress: async (addressId: string): Promise<void> => {
    await api.delete(`/address?address_id=${addressId}`);
  },
};
