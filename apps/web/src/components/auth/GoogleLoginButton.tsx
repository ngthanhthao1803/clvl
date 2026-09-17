"use client";

import { Loader2, LogIn } from "lucide-react";
import { useState } from "react";
import { signInWithGoogle } from "@/lib/auth";
import { useAuthStore } from "@/stores/auth-store";

type GoogleLoginButtonProps = {
  onSuccess?: () => void;
  className?: string;
};

export function GoogleLoginButton({ onSuccess, className }: GoogleLoginButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setSession = useAuthStore((state) => state.setSession);

  async function handleSignIn() {
    setLoading(true);
    setError(null);
    try {
      const session = await signInWithGoogle();
      setSession({ user: session.user, token: session.token });
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Đăng nhập Google thất bại. Vui lòng thử lại.";
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
        className={
          className ||
          "inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60 shadow-sm"
        }
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LogIn className="h-4 w-4 text-emerald-600" />
        )}
        Tiếp tục với Google
      </button>
      {error ? <p className="text-xs text-rose-600 text-center">{error}</p> : null}
    </div>
  );
}
