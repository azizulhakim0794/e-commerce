import { create } from "zustand";
import { getMe, logoutApi, type AuthUser } from "../helper/service/auth.service";

interface AuthState {
    user: AuthUser | null;
    loading: boolean;

    initialize: () => Promise<void>;
    setUser: (user: AuthUser | null) => void;
    logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    loading: true,

    initialize: async () => {
        try {
            const response = await getMe();

            set({
                user: response.data.authenticated ? response.data.user : null,
                loading: false,
            });
        } catch {
            set({
                user: null,
                loading: false,
            });
        }
    },

    setUser: (user) => {
        set({ user });
    },

    logout: async () => {
        try {
            await logoutApi();
        } finally {
            set({
                user: null,
                loading: false,
            });
        }
    },
}));
