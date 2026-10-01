"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  CalendarCheck2,
  Building2,
  Scale,
  CreditCard,
  ShieldCheck,
  TrendingUp,
  ArrowUpRight,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Crown,
} from "lucide-react";
import { adminApi } from "@/lib/api";

export default function AdminDashboardPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const res = await adminApi.getStats();
      return res.data.data;
    },
    staleTime: 10_000,
  });

  const overview = data?.overview;
  const recent = data?.recent;

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900/60 via-slate-900 to-slate-900 border border-emerald-500/20 p-6 sm:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/20 mb-2">
              <Crown className="h-3.5 w-3.5" />
              <span>Tài khoản Quyền lực Tối cao (Root Admin)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Bảng Điều Khiển Quản Trị Hệ Thống
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-2xl">
              Giám sát toàn diện người chơi, buổi đấu cầu lông, mạng lưới sân bãi, 
              khiếu nại tranh chấp và dòng tiền cọc ký quỹ (Escrow) theo thời gian thực.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700 border border-slate-700 transition"
            >
              <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              Làm mới số liệu
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* 1. Tổng Thành Viên */}
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Tổng Thành Viên
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-white">
              {isLoading ? "..." : overview?.users?.total ?? 0}
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
              <span className="text-emerald-400 font-bold">
                {overview?.users?.active ?? 0}
              </span>{" "}
              đang hoạt động •{" "}
              <span className="text-amber-400 font-bold">
                {overview?.users?.verifiedHosts ?? 0}
              </span>{" "}
              host uy tín
            </div>
          </div>
          <Link
            href={"/admin/users" as any}
            className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300"
          >
            Quản lý người dùng <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* 2. Buổi Chơi & Kèo Đấu */}
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Kèo Cầu Lông
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CalendarCheck2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-white">
              {isLoading ? "..." : overview?.sessions?.total ?? 0}
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
              <span className="text-emerald-400 font-bold">
                {overview?.sessions?.active ?? 0}
              </span>{" "}
              đang mở •{" "}
              <span className="text-slate-400">
                {overview?.sessions?.completed ?? 0} hoàn thành
              </span>
            </div>
          </div>
          <Link
            href={"/admin/sessions" as any}
            className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300"
          >
            Danh sách buổi chơi <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* 3. Sân Bãi Toàn Quốc */}
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Sân Cầu Lông
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-white">
              {isLoading ? "..." : overview?.venues?.total ?? 0}
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Quy mô:{" "}
              <span className="text-purple-400 font-bold">
                {overview?.venues?.totalCourts ?? 0}
              </span>{" "}
              sân thảm tiêu chuẩn
            </div>
          </div>
          <Link
            href={"/admin/venues" as any}
            className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-purple-400 hover:text-purple-300"
          >
            Quản lý sân bãi <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* 4. Tiền Cọc Đang Giữ (Escrow) */}
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Tiền Cọc Đang Giữ
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-amber-400">
              {isLoading
                ? "..."
                : (overview?.financials?.escrowHolding ?? 0).toLocaleString("vi-VN") + " đ"}
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Tổng luân chuyển:{" "}
              <span className="text-white font-bold">
                {(overview?.financials?.totalVolume ?? 0).toLocaleString("vi-VN")} đ
              </span>
            </div>
          </div>
          <Link
            href={"/admin/payments" as any}
            className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300"
          >
            Quản lý giao dịch <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Alert Khiếu Nại nếu có */}
      {(overview?.disputes?.pending ?? 0) > 0 && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                Có {overview.disputes.pending} khiếu nại đang chờ Admin phán quyết!
              </p>
              <p className="text-xs text-rose-300">
                Hãy kiểm tra và quyết định hoàn tiền cho người chơi hoặc mở giải ngân cho Host.
              </p>
            </div>
          </div>
          <Link
            href={"/admin/disputes" as any}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500 transition shadow-lg shadow-rose-600/20 shrink-0"
          >
            <Scale className="h-4 w-4" />
            Xử lý khiếu nại ngay
          </Link>
        </div>
      )}

      {/* Two Columns: Recent Registrations & Recent Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registered Users */}
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-400" />
              Thành Viên Mới Đăng Ký
            </h2>
            <Link
              href={"/admin/users" as any}
              className="text-xs font-bold text-blue-400 hover:text-blue-300"
            >
              Xem tất cả
            </Link>
          </div>

          <div className="divide-y divide-slate-800/80 mt-2">
            {recent?.users?.length ? (
              recent.users.map((u: any) => (
                <div key={u._id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-white shrink-0 border border-slate-700">
                      {(u.name?.[0] || "U").toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{u.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{u.email || u.phone || "Không có email"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === "admin"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : u.role === "owner"
                          ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {u.role}
                    </span>
                    <span
                      className={`h-2 w-2 rounded-full ${
                        u.isActive ? "bg-emerald-500" : "bg-rose-500"
                      }`}
                      title={u.isActive ? "Hoạt động" : "Bị khóa"}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-xs text-slate-500">
                Chưa có dữ liệu thành viên
              </p>
            )}
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <CalendarCheck2 className="h-4 w-4 text-emerald-400" />
              Buổi Chơi Mới Tạo
            </h2>
            <Link
              href={"/admin/sessions" as any}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300"
            >
              Xem tất cả
            </Link>
          </div>

          <div className="divide-y divide-slate-800/80 mt-2">
            {recent?.sessions?.length ? (
              recent.sessions.map((s: any) => (
                <div key={s._id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{s.title}</p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
                      <MapPin className="h-3 w-3 text-emerald-500 shrink-0" />
                      <span className="truncate">{s.venueName} • {s.district}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.status === "open"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : s.status === "completed"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-rose-500/20 text-rose-400"
                      }`}
                    >
                      {s.status}
                    </span>
                    <span className="text-[11px] font-bold text-slate-300">
                      {s.currentPlayersCount}/{s.maxPlayers}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-xs text-slate-500">
                Chưa có buổi chơi nào
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
