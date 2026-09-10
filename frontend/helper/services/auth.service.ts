import { User } from "@/types/auth";
import api from "../api";

interface LoginResponse {
  message: string;
  access_token: string;
}

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
        const response = await api.post<{
            id?: string;
            username: string;
            email: string;
        }>("/users", payload);

        return {
            id: response.data.id,
            name: response.data.username,
            username: response.data.username,
            email: response.data.email,
        };
    },

    login: async (payload: LoginPayload): Promise<string> => {
        const response = await api.post<LoginResponse>("/users/token", payload);

        return response.data.access_token;
    },

    getMe: async (): Promise<User> => {
        const response = await api.get<{
            id?: string;
            username: string;
            email: string;
        }>("/users/me");

        return {
            id: response.data.id,
            name: response.data.username,
            username: response.data.username,
            email: response.data.email,
        };
    },
};