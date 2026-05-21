import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user:  null,
      token: null,

      setAuth: (user, token) => set({ user, token }),
      setToken: (token)      => set({ token }),
      logout:  ()            => set({ user: null, token: null }),

      isAuthenticated: () => !!get().token,
      hasRole: (roles) => roles.includes(get().user?.role),
    }),
    {
      name:    'hotel-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);