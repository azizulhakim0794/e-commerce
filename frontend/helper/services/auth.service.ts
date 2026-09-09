import { Access_Token, User } from "@/types/auth";
import api from "../api";

export const productService = {
    create_user: async (): Promise<User[]> => {
        const response = await api.get<User[]>("/users");
        return response.data;
    },

    get_login_access_token: async (id: number): Promise<User> => {
        const response = await api.get<any | Access_Token>(`/users/token`);
        return response.data;
    },

    get_me: async (): Promise<User> => {
        const response = await api.get<User>(`/users/me`);
        return response.data;
    },
};