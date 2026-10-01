"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarCheck2,
  Building2,
  Scale,
  CreditCard,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Menu,
  X,
  ExternalLink,
  Crown,
  AlertTriangle,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { BrandLogo } from "@/components/ui/BrandLogo";

const navItems = [
  {
    name: "Tổng quan",
    href: "/admin",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    name: "Người dùng",
    href: "/admin/users",
    icon: Users,
    badge: null,
  },
  {
    name: "Buổi chơi / Kèo",
    href: "/admin/sessions",
    icon: CalendarCheck2,
    badge: null,
  },
  {
    name: "Sân cầu lông",
    href: "/admin/venues",
    icon: Building2,
    badge: null,
  },
  {
    name: "Khiếu nại & Tranh chấp",
    href: "/admin/disputes",
    icon: Scale,
    badge: "Escrow",
  },
  {
    name: "Giao dịch & Cọc",
    href: "/admin/payments",
    icon: CreditCard,
    badge: null,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isReady, clearSession } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Kiểm tra quyền Quản trị viên tối cao
  const isAdmin =
    user && (user.role === "admin" || user.role === "superadmin");

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-400">
            Đang tải dữ liệu quyền Quản trị...
          </p>
        </div>
      </div>
    );
  }

  // Nếu chưa đăng nhập hoặc không có quyền Admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 px-4">
        <div className="max-w-md w-full rounded-2xl border border-red-500/20 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 mb-5">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Truy Cập Bị Từ Chối (403)
          </h1>
          <p className="mt-2 text-sm text-slate-400 leading-relaxed">
            Khu vực này được bảo vệ nghiêm ngặt và chỉ dành riêng cho tài khoản{" "}
            <span className="font-semibold text-emerald-400">
              Quản Trị Viên (Admin)
            </span>{" "}
            có quyền hạn lớn nhất trên nền tảng.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/login"
              className="w-full inline-flex justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-700 transition"
            >
              <ShieldCheck className="h-4 w-4" />
              Đăng nhập tài khoản Admin
            </Link>
            <Link
              href="/"
              className="w-full inline-flex justify-center items-center rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
            >
              Về trang chủ người dùng
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    clearSession();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row font-sans">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-slate-800/80 bg-slate-900/90 backdrop-blur-xl shrink-0">
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20">
              <Crown className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-tight text-white">
                  CLVL Admin
                </span>
                <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-black text-emerald-400 border border-emerald-500/30">
                  ROOT
                </span>
              </div>
              <p className="text-[10px] font-medium text-slate-400">
                Quản trị hệ thống
              </p>
            </div>
          </div>
        </div>

        {/* Current Admin Card */}
        <div className="p-3 mx-3 mt-3 rounded-xl bg-slate-800/50 border border-slate-800/80 flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 font-black text-xs shadow">
            {(user?.name?.[0] || "A").toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">
              {user?.name || "Admin"}
            </p>
            <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Super Admin</span>
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Quản Lý Nghiệp Vụ
          </div>

          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href as any}
                className={`group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/25"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                      isActive ? "text-white" : "text-slate-400 group-hover:text-emerald-400"
                    }`}
                  />
                  <span>{item.name}</span>
                </div>

                {item.badge ? (
                  <span className="rounded-md bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-extrabold text-amber-300 border border-amber-500/30">
                    {item.badge}
                  </span>
                ) : (
                  <ChevronRight
                    className={`h-3 w-3 opacity-0 transition group-hover:opacity-100 ${
                      isActive ? "opacity-100 text-white" : "text-slate-500"
                    }`}
                  />
                )}
              </Link>
            );
          })}

          <div className="pt-4 px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Lối tắt
          </div>

          <Link
            href="/"
            target="_blank"
            className="group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition"
          >
            <div className="flex items-center gap-2.5">
              <ExternalLink className="h-4 w-4 text-teal-400" />
              <span>Xem trang chính</span>
            </div>
            <span className="text-[10px] text-slate-500">Tab mới</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition"
          >
            <div className="flex items-center gap-2.5">
              <LogOut className="h-4 w-4" />
              <span>Đăng xuất</span>
            </div>
          </button>
        </nav>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800/80 text-[10px] text-slate-500 text-center">
          CLVL Admin v1.0
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="lg:hidden flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-3 sticky top-0 z-50 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white">
            <Crown className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-white">CLVL Admin</span>
              <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-bold text-emerald-400">
                ROOT
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-300"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[57px] bottom-0 z-40 bg-slate-950/95 backdrop-blur-2xl p-4 overflow-y-auto flex flex-col justify-between">
          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400 text-slate-950 font-black">
                {(user?.name?.[0] || "A").toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-bold text-white">{user?.name}</p>
                <p className="text-[10px] text-amber-400">Quản trị viên tối cao</p>
              </div>
            </div>

            {navItems.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href as any}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold ${
                    isActive
                      ? "bg-emerald-600 text-white"
                      : "text-slate-300 hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] text-amber-300">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col gap-2">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-300"
            >
              <ExternalLink className="h-4 w-4 text-emerald-400" />
              <span>Về Website chính</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl bg-rose-500/10 px-4 py-2.5 text-xs font-semibold text-rose-400"
            >
              <LogOut className="h-4 w-4" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 bg-slate-950 overflow-y-auto">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">{children}</div>
      </main>
    </div>
  );
}
