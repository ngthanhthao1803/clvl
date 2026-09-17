"use client";

import { Loader2, LogIn } from "lucide-react";
import { useState } from "react";
import { signInWithGoogle } from "@/lib/auth";
import { useAuthStore } from "@/stores/auth-store";

export function GoogleLoginButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setSession = useAuthStore((state) => state.setSession);

  async function handleSignIn() {
    setLoading(true);
    setError(null);
    try {
      const session = await signInWithGoogle();
      localStorage.setItem("clvl-jwt", session.token);
      setSession({ user: session.user, token: session.token });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Dang nhap that bai. Vui long thu lai.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleSignIn}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LogIn className="h-4 w-4" />
        )}
        Tiếp tục với Google
      </button>
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
