import api from "../api";
import { tokenStorage } from "../token.storage";

export interface AuthUser {
    id: string;
    username: string;
    email: string;
}

export interface AuthResponse {
    message: string;
    user: AuthUser;
    access: string;
    refresh: string;
}

export interface MeResponse {
    authenticated: boolean;
    user: AuthUser | null;
}

export interface TokenResponse {
    message: string;
    access: string;
    refresh: string;
}

const persistAuthTokens = (access: string, refresh: string) => {
    tokenStorage.setTokens(access, refresh);
};

export const loginApi = async (data: { username: string; password: string }) => {
    const response = await api.post<AuthResponse>("/auth/login/", data);
    persistAuthTokens(response.data.access, response.data.refresh);
    return response;
};

export const registerApi = async (data: {
    username: string;
    email: string;
    password: string;
    confirmation: string;
}) => {
    const response = await api.post<AuthResponse>("/auth/register/", data);
    persistAuthTokens(response.data.access, response.data.refresh);
    return response;
};

export const refreshApi = async () => {
    const refreshToken = tokenStorage.getRefreshToken();

    if (!refreshToken) {
        throw new Error("Missing refresh token");
    }

    const response = await api.post<TokenResponse>("/auth/refresh/", {
        refresh: refreshToken,
    });

    persistAuthTokens(response.data.access, response.data.refresh);
    return response;
};

export const logoutApi = async () => {
    const refreshToken = tokenStorage.getRefreshToken();

    try {
        await api.post<{ message: string }>("/auth/logout/", {
            refresh: refreshToken,
        });
    } finally {
        tokenStorage.clear();
    }
};

export const getMe = () => {
    return api.get<MeResponse>("/auth/me/");
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
