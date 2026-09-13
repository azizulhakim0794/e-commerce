import api from "../api";
import type { Address, AddressFormValues } from "@/types/address";

export const addressService = {
  getAddresses: async (): Promise<Address[]> => {
    const response = await api.get<Address[]>("/address");
    return response.data;
  },

  createAddress: async (payload: AddressFormValues): Promise<Address> => {
    const response = await api.post<Address>("/address", payload);
    return response.data;
  },

  updateAddress: async (payload: AddressFormValues): Promise<Address> => {
    const response = await api.patch<Address>("/address", payload);
    return response.data;
  },

  deleteAddress: async (addressId: string): Promise<void> => {
    await api.delete(`/address?address_id=${addressId}`);
  },
};
