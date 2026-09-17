"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

type RequireAuthProps = {
  children: React.ReactNode;
};

export function RequireAuth({ children }: RequireAuthProps) {
  const router = useRouter();
  const { token, isReady } = useAuthStore();

  useEffect(() => {
    if (isReady && !token) {
      router.replace("/");
    }
  }, [isReady, router, token]);

  if (!isReady) {
    return (
      <div className="p-6 text-sm text-slate-500">
        Đang tải phiên của bạn...
      </div>
    );
  }

  if (!token) {
    return null;
  }

  return <>{children}</>;
}
