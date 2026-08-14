import axios from "axios";
import type { AxiosRequestConfig } from "axios";
import { ENV } from "../../config/env";

const api = axios.create({
    baseURL: ENV.API_BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("csrftoken="))
        ?.split("=")[1];

    if (csrfToken) {
        config.headers["X-CSRFToken"] = decodeURIComponent(csrfToken);
    }

    const accessToken = localStorage.getItem("access_token");

    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
});
export const GET = async <T>(
    url: string,
    config?: AxiosRequestConfig
): Promise<T> => {
    const response = await api.get<T>(url, config);
    return response.data;
};

export const POST = async <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
): Promise<T> => {
    const response = await api.post<T>(url, data, config);
    return response.data;
};

export const PUT = async <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
): Promise<T> => {
    const response = await api.put<T>(url, data, config);
    return response.data;
};

export const DELETE = async <T>(
    url: string,
    config?: AxiosRequestConfig
): Promise<T> => {
    const response = await api.delete<T>(url, config);
    return response.data;
};

export const UPLOAD = async <T>(
    url: string,
    formData: FormData,
    config?: AxiosRequestConfig
): Promise<T> => {
    const response = await api.post<T>(url, formData, {
        ...config,
        headers: {
            ...config?.headers,
            "Content-Type": "multipart/form-data",
        },
    });

    return response.data;
};

export default api;