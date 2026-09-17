"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuthStore } from "@/stores/auth-store";

export default function SettingsPage() {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);

  useEffect(() => {
    if (currentUser) {
      router.replace(`/profile/${currentUser.id}`);
    }
  }, [currentUser, router]);

  return (
    <RequireAuth>
      <div className="mx-auto max-w-2xl space-y-6">
        Chuyển hướng đến tài khoản…
      </div>
    </RequireAuth>
  );
}
