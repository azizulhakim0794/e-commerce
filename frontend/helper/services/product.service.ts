import { CartResponse, Product, CreateProductType, Order } from "@/types";
import api from "../api";

export const product_service = {
  save_product: async (
    product_data: CreateProductType,
  ): Promise<CreateProductType> => {
    const { data } = await api.post<Product>("/products", product_data);
    return data;
  },
  get_products: async (): Promise<Product[]> => {
    const { data } = await api.get<Product[]>("/products");
    return data;
  },

  get_ordered_products: async (): Promise<Order> => {
    const { data } = await api.get<Order>("/orders/admin");
    return data;
  },

  get_product: async (id: string): Promise<Product> => {
    const { data } = await api.get<Product>(`/products/${id}/`);
    return data;
  },

  save_product_into_cart: async (data: {
    quantity: number;
    product_id: string;
  }): Promise<unknown> => {
    const { data: responseData } = await api.post<unknown>(`/cart`, data);
    return responseData;
  },

  get_cart_product: async (): Promise<CartResponse[]> => {
    const { data: responseData } = await api.get<CartResponse[]>("/cart");
    return responseData;
  },

  update_cart_products_quantity: async (data: {
    quantity: number;
    cart_id: string;
  }): Promise<unknown> => {
    const { data: responseData } = await api.patch<unknown>(`/cart`, data);
    return responseData;
  },

  remove_cart_product: async (cart_id: string): Promise<unknown> => {
    const { data: responseData } = await api.delete<unknown>(
      `/cart/${cart_id}`,
    );
    return responseData;
  },

  // createProduct: async (
  //     data: Partial<Product>
  // ): Promise<Product> => {
  //     const response = await api.post<Product>(
  //         "/products/",
  //         data
  //     );

  //     return response.data;
  // },

  // updateProduct: async (
  //     id: number,
  //     data: Partial<Product>
  // ): Promise<Product> => {
  //     const response = await api.put<Product>(
  //         `/products/${id}/`,
  //         data
  //     );

  //     return response.data;
  // },

  // deleteProduct: async (id: number): Promise<void> => {
  //     await api.delete(`/products/${id}/`);
  // },
};
