"use client";

import { useEffect, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";
import { api, authApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export function AuthBootstrap() {
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);
  const markReady = useAuthStore((state) => state.markReady);

  const isVerifyingRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    // 1. Sync / restore cached state from localStorage immediately
    let storedToken: string | null = null;
    let storedUser: any = null;

    if (typeof window !== "undefined") {
      storedToken = localStorage.getItem("clvl-jwt");
      try {
        const rawAuth = localStorage.getItem("clvl-auth");
        if (rawAuth) {
          const parsed = JSON.parse(rawAuth);
          storedUser = parsed?.state?.user || null;
          if (!storedToken && parsed?.state?.token) {
            storedToken = parsed.state.token;
            localStorage.setItem("clvl-jwt", storedToken as string);
          }
        }
      } catch {}
    }

    // If we have cached user and token, ensure Zustand has them and immediately mark ready
    // to eliminate layout shift or loading spinners on page refresh
    if (storedToken && storedUser) {
      const currentState = useAuthStore.getState();
      if (!currentState.user || !currentState.token) {
        useAuthStore.setState({ user: storedUser, token: storedToken });
      }
      markReady();
    }

    // 2. Validate token with backend /auth/me in background
    async function verifyLocalSession(token: string) {
      if (isVerifyingRef.current) return;
      isVerifyingRef.current = true;

      try {
        const response = await authApi.getMe();
        if (!isMounted) return;
        const freshUser = response.data.data.user;
        setSession({ user: freshUser, token });
      } catch (error: any) {
        if (!isMounted) return;
        // Only clear session if the server explicitly rejected the JWT (401 Unauthorized)
        if (error?.response?.status === 401) {
          clearSession();
        }
        // If error is network or 500, keep cached credentials
      } finally {
        if (isMounted) {
          markReady();
        }
        isVerifyingRef.current = false;
      }
    }

    if (storedToken) {
      verifyLocalSession(storedToken);
    }

    // 3. Firebase Auth listener for Google Login
    let unsubscribe = () => {};
    try {
      if (firebaseAuth) {
        unsubscribe = onAuthStateChanged(
          firebaseAuth,
          async (firebaseUser) => {
            if (!isMounted) return;

            try {
              if (firebaseUser) {
                // Firebase / Google user is signed in
                const currentToken =
                  localStorage.getItem("clvl-jwt") || useAuthStore.getState().token;
                const currentUser = useAuthStore.getState().user;

                // Sync if no token or current user does not match the Firebase UID
                if (!currentToken || !currentUser || currentUser.firebaseUid !== firebaseUser.uid) {
                  const idToken = await firebaseUser.getIdToken();
                  const response = await api.post("/auth/firebase", { idToken });
                  const { user: apiUser, token } = response.data.data;

                  if (isMounted) {
                    localStorage.setItem("clvl-jwt", token);
                    setSession({ user: apiUser, token });
                  }
                }
              } else {
                // firebaseUser is null
                // CRITICAL: Do NOT clearSession() for email/password users!
                // Email/password users have a JWT but no Firebase account.
                const currentToken =
                  localStorage.getItem("clvl-jwt") || useAuthStore.getState().token;
                const currentUser = useAuthStore.getState().user;

                // Only clear if the active user was explicitly a Firebase user who signed out
                if (
                  currentUser &&
                  currentUser.firebaseUid &&
                  !currentUser.firebaseUid.startsWith("local_")
                ) {
                  clearSession();
                } else if (!currentToken) {
                  // No stored session and no Firebase user -> guest
                  markReady();
                }
              }
            } catch (error) {
              console.error("Firebase auth sync error:", error);
            } finally {
              if (isMounted) {
                markReady();
              }
            }
          },
          (error) => {
            console.error("Firebase onAuthStateChanged error:", error);
            if (isMounted) {
              markReady();
            }
          }
        );
      }
    } catch (err) {
      console.error("Error setting up Firebase auth listener:", err);
      markReady();
    }

    // Safety timeout: ensure markReady is called within 1.5s even if network or Firebase hangs
    const timer = setTimeout(() => {
      if (isMounted) {
        markReady();
      }
    }, 1500);

    return () => {
      isMounted = false;
      unsubscribe();
      clearTimeout(timer);
    };
  }, [clearSession, markReady, setSession]);

  return null;
}
