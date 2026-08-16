import { create } from "zustand";
import {
    getMe,
    logoutApi,
    refreshApi,
    type AuthUser,
} from "../helper/service/auth.service";
import { tokenStorage } from "../helper/token.storage";

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
            if (!tokenStorage.getAccessToken() && !tokenStorage.getRefreshToken()) {
                set({ user: null, loading: false });
                return;
            }

            let response = await getMe();

            if (!response.data.authenticated && tokenStorage.getRefreshToken()) {
                await refreshApi();
                response = await getMe();
            }

            set({
                user: response.data.authenticated ? response.data.user : null,
                loading: false,
            });

            if (!response.data.authenticated) {
                tokenStorage.clear();
            }
        } catch {
            tokenStorage.clear();
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
