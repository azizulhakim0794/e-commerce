import { create } from "zustand";
import { getMe } from "../helper/service/auth.service";

interface User {
    id: string;
    username: string;
    email: string;
}

interface AuthState {
    user: User | null;
    loading: boolean;

    initialize: () => Promise<void>;
    setUser: (user: User | null) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    loading: true,

    initialize: async () => {
        console.log("Auth initialization started");

        try {
            console.log("Calling /auth/me/");

            const response = await getMe();

            console.log("ME response:", response.data);

            if (response.data.authenticated) {
                set({
                    user: response.data.user,
                    loading: false,
                });
            } else {
                set({
                    user: null,
                    loading: false,
                });
            }
        } catch (error) {
            console.error("ME request failed:", error);

            set({
                user: null,
                loading: false,
            });
        }
    },

    setUser: (user) => {
        set({ user });
    },

    logout: () => {
        set({
            user: null,
            loading: false,
        });
    },
}));