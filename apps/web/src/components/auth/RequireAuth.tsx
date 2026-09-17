"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

type RequireAuthProps = {
  children: React.ReactNode;
};

export function RequireAuth({ children }: RequireAuthProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, isReady } = useAuthStore();

  useEffect(() => {
    if (isReady && !token) {
      const redirectUrl = pathname
        ? `/login?redirect=${encodeURIComponent(pathname)}`
        : "/login";
      router.replace(redirectUrl as any);
    }
  }, [isReady, pathname, router, token]);

  if (!isReady) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center p-6 text-center text-sm text-slate-500">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        <p className="mt-3">Đang kiểm tra thông tin đăng nhập...</p>
      </div>
    );
  }

  if (!token) {
    return null;
  }

  return <>{children}</>;
}
