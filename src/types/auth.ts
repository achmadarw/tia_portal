export interface User {
    id: number;
    username: string;
    name: string;
    role: 'admin' | 'security' | 'user';
    email?: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface AuthState {
    user: User | null;
    tokens: AuthTokens | null;
    isAuthenticated: boolean;
}
