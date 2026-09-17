import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AuthUser = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  skillLevel?: string;
  district?: string;
  city?: string;
  role?: string;
  reputation?: number;
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
      setSession: ({ user, token }) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("clvl-jwt", token);
        }
        set({ user, token });
      },
      clearSession: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("clvl-jwt");
        }
        set({ user: null, token: null });
      },
      markReady: () => set({ isReady: true }),
    }),
    {
      name: "clvl-auth",
      partialize: (state) => ({ user: state.user, token: state.token }),
    },
  ),
);
