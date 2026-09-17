"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { BadgePlus, Bell, Search, Sparkles } from "lucide-react";
import { notificationsApi } from "@/lib/api";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";
import { useAuthStore } from "@/stores/auth-store";

export function Navbar() {
  const user = useAuthStore((state) => state.user);
  const unreadCountQuery = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const response = await notificationsApi.getUnreadCount();
      return response.data.data.unreadCount as number;
    },
    enabled: Boolean(user),
    staleTime: 30_000,
  });
  const unreadCount = unreadCountQuery.data ?? 0;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-3 font-semibold tracking-wide text-slate-900"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">
            <Sparkles className="h-5 w-5" />
          </span>
          <span>
            CLVL{" "}
            <span className="block text-xs font-normal text-slate-500">
              Cầu lông Việt Nam
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"
          >
            <Search className="h-4 w-4" /> Khám phá
          </Link>
          <Link
            href="/sessions/create"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
          >
            <BadgePlus className="h-4 w-4" /> Tạo buổi chơi
          </Link>
          <Link
            href="/notifications"
            className="relative rounded-full border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 ? (
              <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            ) : null}
          </Link>
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href={`/profile/${user.id}`}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 transition"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-800">
                  {(user.name?.[0] || "U").toUpperCase()}
                </div>
                <span className="max-w-[120px] truncate">{user.name}</span>
              </Link>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-600 transition"
            >
              <span>Đăng nhập / Đăng ký</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
