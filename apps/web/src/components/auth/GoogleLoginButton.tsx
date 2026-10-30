"use client";

import { Loader2 } from "lucide-react";
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
    } catch (err: any) {
      const raw = String(err?.code || err?.message || "");
      if (
        raw.includes("popup-blocked") ||
        raw.includes("disallowed_useragent") ||
        raw.includes("popup-closed-by-user") ||
        raw.includes("cancelled-popup-request")
      ) {
        setError(
          "Trình duyệt nhúng (Zalo/Facebook) chặn cửa sổ Google. Bạn hãy bấm tab 'Tạo Tài Khoản' bên dưới (chỉ 10 giây) hoặc mở web bằng Safari/Chrome nhé!",
        );
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Đăng nhập Google thất bại. Vui lòng thử lại hoặc đăng ký bằng Email bên dưới.",
        );
      }
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
          "inline-flex w-full items-center justify-center gap-2.5 rounded-2xl border-2 border-slate-200 bg-white px-5 py-3 text-xs sm:text-sm font-bold text-slate-800 transition hover:border-emerald-400 hover:bg-emerald-50/50 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 shadow-xs"
        }
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
        ) : (
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
            />
          </svg>
        )}
        <span>Tiếp tục với Google</span>
      </button>
      {error ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-[11px] font-medium text-amber-900 leading-relaxed">
          {error}
        </div>
      ) : null}
    </div>
  );
}
