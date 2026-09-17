import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AuthUser = {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  skillLevel?: string;
  city?: string;
};

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  isReady: boolean;
  setSession: (payload: { user: AuthUser; token: string }) => void;
  clearSession: () => void;
  markReady: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isReady: false,
      setSession: ({ user, token }) => set({ user, token }),
      clearSession: () => set({ user: null, token: null }),
      markReady: () => set({ isReady: true }),
    }),
    {
      name: "clvl-auth",
      partialize: (state) => ({ user: state.user, token: state.token }),
    },
  ),
);
