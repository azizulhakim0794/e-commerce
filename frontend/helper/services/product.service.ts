import { CartItem, Product } from "@/types";
import api from "../api";


export const product_service = {
    get_products: async (): Promise<Product[]> => {
        const response = await api.get<Product[]>("/products");
        return response.data;
    },

    get_product: async (id: string): Promise<Product> => {
        const response = await api.get<Product>(`/products/${id}/`);
        return response.data;
    },

    save_product_into_cart: async (data:{quantity: number, product_id:string}): Promise<any> => {
        const response = await api.post<any>(`/cart`, data);
        return response.data;
    },

    get_cart_product: async () => {
        const response = await api.get<CartItem>("/cart")
        return response.data
    },

    update_cart_products_quantity: async (data:{quantity:number,cart_id:string}) => {
        const response = await api.patch<any>(`/cart`,data)
        return response.data
    },

    remove_cart_product: async (cart_id:string) => {
        const response = await api.delete<any>(`/cart/${cart_id}`)
        return response.data
    }


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