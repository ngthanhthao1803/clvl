"use client";

import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-6 rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-glow">
      <p className="text-xs uppercase tracking-[0.24em] text-emerald-700/90">
        Xác thực
      </p>
      <h1 className="text-3xl font-semibold text-slate-900">
        Đăng nhập để tham gia buổi chơi cầu lông
      </h1>
      <p className="text-slate-600">
        Dùng đăng nhập Google qua Firebase để tạo hồ sơ người chơi và nhận phiên
        JWT từ backend.
      </p>
      <GoogleLoginButton />
    </div>
  );
}
