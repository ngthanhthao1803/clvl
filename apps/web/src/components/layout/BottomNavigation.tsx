"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Bell, Home, Plus, Search, UserRound } from "lucide-react";
import { notificationsApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

// navigation items are built inside the component so we can use the current user

export function BottomNavigation() {
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

  const items = [
    { href: "/", label: "Trang chủ", icon: Home },
    { href: "/explore", label: "Khám phá", icon: Search },
    { href: "/sessions/create", label: "Tạo", icon: Plus },
    { href: "/notifications", label: "Thông báo", icon: Bell },
    {
      href: user ? `/profile/${user.id}` : "/login",
      label: "Tài khoản",
      icon: UserRound,
    },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 dark:border-slate-700 bg-panel dark:bg-slate-900/95 px-3 py-2 backdrop-blur-xl md:hidden">
      <div className="mx-auto grid max-w-5xl grid-cols-5 gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          const showBadge = item.href === "/notifications" && unreadCount > 0;
          return (
            <Link
              key={item.href}
              href={item.href as any}
              className="flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-xs text-slate-500 transition hover:bg-emerald-50 hover:text-slate-900"
            >
              <span className="relative inline-flex">
                <Icon className="h-4 w-4" />
                {showBadge ? (
                  <span className="absolute -right-2 -top-2 min-w-4 rounded-full bg-rose-500 px-1 py-0.5 text-[9px] font-semibold leading-none text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                ) : null}
              </span>
              {/* {item.label} */}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
