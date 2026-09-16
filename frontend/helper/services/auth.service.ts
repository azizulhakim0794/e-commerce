import { User } from "@/types/auth";
import api from "../api";

interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

export const authService = {
    register: async (payload: RegisterPayload): Promise<User> => {
        const { data } = await api.post<{
            id: string;
            username: string;
            email: string;
        }>("/users", payload);

        return {
            id: data.id,
            name: data.username,
            username: data.username,
            email: data.email,
        };
    },

    login: async (payload: LoginPayload): Promise<string> => {
        const { data } = await api.post<string>("/users/token", payload);

        return data;
    },

    getMe: async (): Promise<User> => {
        const { data } = await api.get<{
            id: string;
            username: string;
            email: string;
        }>("/users/me");

        return {
            id: data.id,
            name: data.username,
            username: data.username,
            email: data.email,
        };
    },

    logout: async (): Promise<string> => {
        const { data } = await api.post<string>("/users/logout");
        return data;
    },
};