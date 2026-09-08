import { Product } from "@/types";
import api from "../api";
import { ProductResponse } from "@/types/product";


export const productService = {
    getProducts: async (): Promise<Product[]> => {
        const response = await api.get<ProductResponse>("/products");
        return response.data.products;
    },

    getProduct: async (id: number): Promise<Product> => {
        const response = await api.get<Product>(`/products/${id}/`);
        return response.data;
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