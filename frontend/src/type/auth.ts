export interface AuthUser {
    id: string;
    username: string;
    email: string;
}

export interface AuthResponse {
    message: string;
    user: AuthUser;
}

export interface MeResponse {
    authenticated: boolean;
    user: AuthUser | null;
}