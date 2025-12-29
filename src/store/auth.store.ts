import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthTokens, AuthState } from '@/types/auth';

interface AuthStore extends AuthState {
    setAuth: (user: User, tokens: AuthTokens) => void;
    clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            user: null,
            tokens: null,
            isAuthenticated: false,

            setAuth: (user, tokens) => {
                // Store tokens in localStorage
                if (typeof window !== 'undefined') {
                    localStorage.setItem('accessToken', tokens.accessToken);
                    localStorage.setItem('refreshToken', tokens.refreshToken);
                }

                set({ user, tokens, isAuthenticated: true });
            },

            clearAuth: () => {
                // Clear localStorage
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                }

                set({ user: null, tokens: null, isAuthenticated: false });
            },
        }),
        {
            name: 'auth-storage',
        }
    )
);
