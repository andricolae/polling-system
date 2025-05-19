export interface AuthState {
    user: { uid: string; email: string; role: string } | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
}

export const initialAuthState: AuthState = {
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false,
};