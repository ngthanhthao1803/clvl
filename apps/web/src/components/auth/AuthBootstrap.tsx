"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export function AuthBootstrap() {
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);
  const markReady = useAuthStore((state) => state.markReady);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      firebaseAuth,
      async (firebaseUser) => {
        try {
          if (!firebaseUser) {
            clearSession();
            localStorage.removeItem("clvl-jwt");
            markReady();
            return;
          }

          const idToken = await firebaseUser.getIdToken();
          const response = await api.post("/auth/firebase", { idToken });
          const { user, token } = response.data.data;

          localStorage.setItem("clvl-jwt", token);
          setSession({ user, token });
        } catch (error) {
          clearSession();
        } finally {
          markReady();
        }
      },
    );

    return () => unsubscribe();
  }, [clearSession, markReady, setSession]);

  return null;
}
