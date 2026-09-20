"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  Compass,
  MapPin,
  PlusCircle,
  UserRound,
} from "lucide-react";
import { notificationsApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { BrandLogo } from "@/components/ui/BrandLogo";

export function Navbar() {
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

  const isExplore = pathname === "/explore";
  const isCreate = pathname === "/sessions/create";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-1.5 sm:px-6 sm:py-3 lg:px-8">
        {/* 1. Brand Logo with Shuttlecock Emblem */}
        <div className="flex items-center gap-6">
          <BrandLogo size="md" href="/" />

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1.5 ml-4">
            <Link
              href="/explore"
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                isExplore
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
              }`}
            >
              <Compass className="h-3.5 w-3.5 text-emerald-600" />
              <span>Khám Phá Kèo</span>
            </Link>

            <Link
              href="/explore?tab=map"
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-all"
            >
              <MapPin className="h-3.5 w-3.5 text-teal-600" />
              <span>Bản Đồ Sân</span>
            </Link>
          </nav>
        </div>

        {/* 2. Desktop Actions Hub */}
        <div className="hidden items-center gap-3 md:flex">
          {/* Quick Create Match CTA */}
          <Link
            href="/sessions/create"
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all shadow-sm ${
              isCreate
                ? "bg-emerald-600 text-white shadow-emerald-500/25"
                : "bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98]"
            }`}
          >
            <PlusCircle className="h-4 w-4" />
            <span>Tạo Buổi Chơi</span>
          </Link>

          {/* Notification Bell */}
          <Link
            href="/notifications"
            className="relative rounded-full border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 shadow-sm"
            title="Thông báo"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 ? (
              <span className="absolute -right-1 -top-1 min-w-4 h-4 rounded-full bg-rose-500 px-1 text-[9px] font-black leading-tight text-white flex items-center justify-center animate-pulse">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            ) : null}
          </Link>

          {/* Auth State */}
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href={`/profile/${user.id}`}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 transition shadow-sm"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-[11px] font-black text-white shadow-sm">
                  {(user.name?.[0] || "U").toUpperCase()}
                </div>
                <span className="max-w-[130px] truncate">{user.name}</span>
              </Link>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-600 transition hover:scale-[1.02] active:scale-[0.98]"
            >
              <UserRound className="h-3.5 w-3.5" />
              <span>Đăng nhập</span>
            </Link>
          )}
        </div>

        {/* 3. Mobile Right Quick Action (md:hidden) */}
        {/* De-duplicated: "Tạo Kèo", "Thông báo", and "Tài khoản" are housed in BottomNavigation */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/explore?tab=map"
            className="inline-flex items-center gap-1 rounded-full border border-emerald-200/90 bg-emerald-50/80 px-2.5 py-1 text-[11px] font-bold text-emerald-800 transition active:scale-95 shadow-xs hover:bg-emerald-100"
            title="Xem bản đồ sân cầu lông"
          >
            <MapPin className="h-3 w-3 text-emerald-600" />
            <span>Bản Đồ</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

