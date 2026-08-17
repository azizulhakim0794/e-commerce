import type { AuthResponse, MeResponse } from "../../type/auth";
import api from "../api";

export const loginApi = (data: { username: string; password: string }) => {
    return api.post<AuthResponse>("/auth/login", data);
};

export const registerApi = (data: {
    username: string;
    email: string;
    password: string;
    confirmation: string;
}) => {
    return api.post<AuthResponse>("/auth/register", data);
};

export const logoutApi = () => {
    return api.post<{ message: string }>("/auth/logout");
};

export const getMe = () => {
    return api.get<MeResponse>("/auth/me");
};

export const getAuthErrorMessage = (error: unknown, fallback: string) => {
    if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { error?: string } } }).response?.data?.error === "string"
    ) {
        return (error as { response: { data: { error: string } } }).response.data.error;
    }

    return fallback;
};
