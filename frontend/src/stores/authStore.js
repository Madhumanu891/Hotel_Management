import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user:  null,
      token: null,

      setAuth: (user, token) => set({ user, token }),

      setToken: (token) => set({ token }),

      logout: () => set({ user: null, token: null }),

      updateUser: (updates) =>
        set(state => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name:    'nexora-auth',
      partialize: (state) => ({
        user:  state.user,
        token: state.token,
      }),
    }
  )
);