"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Bell, Compass, Home, Plus, UserRound } from "lucide-react";
import { notificationsApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export function BottomNavigation() {
  const pathname = usePathname();
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

  const isHome = pathname === "/";
  const isExplore = pathname.startsWith("/explore");
  const isCreate = pathname.startsWith("/sessions/create");
  const isNotifications = pathname.startsWith("/notifications");
  const isProfile = pathname.startsWith("/profile") || pathname === "/login";

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/90 bg-white/95 dark:bg-slate-900/95 dark:border-slate-800 backdrop-blur-xl px-2 pt-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] shadow-[0_-4px_24px_rgba(0,0,0,0.04)] md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 items-end">
        {/* 1. Trang chủ */}
        <Link
          href="/"
          className={`flex flex-col items-center gap-0.5 py-1 text-center transition-all ${isHome
              ? "text-emerald-600 dark:text-emerald-400 font-bold"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 font-medium"
            }`}
        >
          <Home className={`h-5 w-5 transition-transform ${isHome ? "scale-110" : ""}`} />
          <span className="text-[10px] tracking-tight">Trang chủ</span>
        </Link>

        {/* 2. Khám phá */}
        <Link
          href="/explore"
          className={`flex flex-col items-center gap-0.5 py-1 text-center transition-all ${isExplore
              ? "text-emerald-600 dark:text-emerald-400 font-bold"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 font-medium"
            }`}
        >
          <Compass className={`h-5 w-5 transition-transform ${isExplore ? "scale-110" : ""}`} />
          <span className="text-[10px] tracking-tight">Khám phá</span>
        </Link>

        {/* 3. Center Elevated Action Button: Tạo Kèo */}
        <Link
          href="/sessions/create"
          className="group relative flex flex-col items-center py-1 text-center select-none"
          title="Tạo buổi chơi mới"
        >
          {/* Elevated Circular Action Button */}
          <div
            className={`relative -top-3.5 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 text-white shadow-[0_8px_20px_-3px_rgba(5,150,105,0.45)] ring-4 ring-white dark:ring-slate-900 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform-gpu group-hover:scale-105 group-active:scale-95 ${
              isCreate
                ? "ring-emerald-400 shadow-[0_0_24px_rgba(16,185,129,0.55)] scale-105"
                : ""
            }`}
          >
            <Plus
              className={`h-6 w-6 stroke-[2.5] transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform-gpu group-hover:rotate-90 group-active:rotate-90 ${
                isCreate ? "rotate-45" : ""
              }`}
            />
          </div>

          {/* Label with comfortable breathing room & aligned baseline */}
          <span
            className={`-mt-1.5 text-[10px] tracking-tight transition-colors ${
              isCreate
                ? "text-emerald-600 font-bold dark:text-emerald-400"
                : "text-slate-600 dark:text-slate-400 font-medium group-hover:text-emerald-700"
            }`}
          >
            Tạo kèo
          </span>
        </Link>

        {/* 4. Thông báo */}
        <Link
          href="/notifications"
          className={`relative flex flex-col items-center gap-0.5 py-1 text-center transition-all ${isNotifications
              ? "text-emerald-600 dark:text-emerald-400 font-bold"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 font-medium"
            }`}
        >
          <div className="relative inline-flex">
            <Bell className={`h-5 w-5 transition-transform ${isNotifications ? "scale-110" : ""}`} />
            {unreadCount > 0 ? (
              <span className="absolute -right-2 -top-1.5 min-w-4 h-4 rounded-full bg-rose-500 px-1 text-[9px] font-black leading-tight text-white flex items-center justify-center animate-pulse shadow-sm">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            ) : null}
          </div>
          <span className="text-[10px] tracking-tight">Thông báo</span>
        </Link>

        {/* 5. Cá nhân / Tài khoản */}
        <Link
          href={(user ? `/profile/${user.id}` : "/login") as any}
          className={`flex flex-col items-center gap-0.5 py-1 text-center transition-all ${isProfile
              ? "text-emerald-600 dark:text-emerald-400 font-bold"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 font-medium"
            }`}
        >
          {user ? (
            <div
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black text-white shadow-xs transition-transform ${isProfile
                  ? "bg-gradient-to-br from-emerald-500 to-teal-600 ring-2 ring-emerald-500 scale-110"
                  : "bg-gradient-to-br from-slate-600 to-slate-800"
                }`}
            >
              {(user.name?.[0] || "U").toUpperCase()}
            </div>
          ) : (
            <UserRound className={`h-5 w-5 transition-transform ${isProfile ? "scale-110" : ""}`} />
          )}
          <span className="text-[10px] tracking-tight">
            {user ? "Cá nhân" : "Đăng nhập"}
          </span>
        </Link>
      </div>
    </nav>
  );
}
