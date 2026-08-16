import axios from "axios";
import type { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
import { ENV } from "../../config/env";

const CSRF_COOKIE_NAME = "csrftoken";
const UNSAFE_METHODS = new Set(["post", "put", "patch", "delete"]);

const getCsrfToken = () => {
    const match = document.cookie.match(
        new RegExp(`(?:^|;\\s*)${CSRF_COOKIE_NAME}=([^;]*)`)
    );

    return match ? decodeURIComponent(match[1]) : null;
};

const api = axios.create({
    baseURL: ENV.API_BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const method = config.method?.toLowerCase();

    if (method && UNSAFE_METHODS.has(method)) {
        const csrfToken = getCsrfToken();

        if (csrfToken) {
            config.headers["X-CSRFToken"] = csrfToken;
        }
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
