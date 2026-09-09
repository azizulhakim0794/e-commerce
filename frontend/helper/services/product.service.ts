// import { Product } from "@/types";
import { Product } from "@/types/product";
import api from "../api";


export const productService = {
    getProducts: async (): Promise<Product[]> => {
        const response = await api.get<Product[]>("/products");
        return response.data;
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