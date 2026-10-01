"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CreditCard,
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  CheckCircle,
  XCircle,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { adminApi } from "@/lib/api";
import { format } from "date-fns";

export default function AdminPaymentsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin", "payments", { search, statusFilter, typeFilter, page }],
    queryFn: async () => {
      const res = await adminApi.getPayments({
        search,
        status: statusFilter,
        type: typeFilter,
        page,
        limit: 15,
      });
      return res.data.data;
    },
    staleTime: 5000,
  });

  const payments = data?.items || [];
  const pagination = data?.pagination || { total: 0, totalPages: 1, page: 1 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Quản Lý Giao Dịch & Quỹ Ký Gửi (Escrow)
            </h1>
            <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-400 border border-amber-500/30">
              {pagination.total} giao dịch
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Theo dõi tất cả dòng tiền đặt cọc giữ chỗ qua VietQR, hoàn trả và giải ngân cho Host.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 transition shrink-0"
        >
          <RefreshCw className="h-3.5 w-3.5 text-emerald-400" />
          Làm mới
        </button>
      </div>

      {/* Filter bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm theo mã đơn, nội dung..."
            className="w-full rounded-xl bg-slate-900 border border-slate-800 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="escrow_held">Đang giữ cọc (Escrow Held)</option>
            <option value="completed">Đã hoàn tất (Completed)</option>
            <option value="refunded">Đã hoàn tiền (Refunded)</option>
            <option value="pending">Chờ thanh toán (Pending)</option>
            <option value="cancelled">Đã hủy (Cancelled)</option>
          </select>
        </div>

        <div>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="">Tất cả loại giao dịch</option>
            <option value="deposit">Tiền cọc giữ chỗ (Deposit)</option>
            <option value="payout">Giải ngân cho Host (Payout)</option>
            <option value="refund">Hoàn tiền (Refund)</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Mã giao dịch</th>
                <th className="py-3.5 px-4">Người nộp (Payer)</th>
                <th className="py-3.5 px-4">Buổi chơi / Host</th>
                <th className="py-3.5 px-4">Số tiền</th>
                <th className="py-3.5 px-4">Loại GD</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Đang tải danh sách giao dịch...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Không tìm thấy giao dịch nào
                  </td>
                </tr>
              ) : (
                payments.map((p: any) => {
                  let formattedDate = "";
                  try {
                    formattedDate = format(new Date(p.createdAt), "dd/MM/yyyy HH:mm");
                  } catch {
                    formattedDate = String(p.createdAt);
                  }

                  return (
                    <tr key={p._id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-amber-400">
                          {p.orderCode}
                        </span>
                        <p className="text-[11px] text-slate-500 truncate max-w-xs">
                          {p.transferContent}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-white truncate max-w-[200px]">
                          {p.payer?.name || "---"}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                          {p.payer?.email || p.payer?.phone || ""}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="text-slate-200 truncate max-w-xs sm:max-w-sm">
                          {p.session?.title || "Buổi chơi"}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Host: {p.receiver?.name || "Chủ kèo"}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-white text-sm">
                          {Number(p.amount || 0).toLocaleString("vi-VN")} đ
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                          {p.type}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${
                            p.status === "escrow_held"
                              ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                              : p.status === "completed"
                              ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                              : p.status === "refunded"
                              ? "bg-blue-500/10 text-blue-300 border-blue-500/30"
                              : "bg-slate-800 text-slate-400 border-slate-700"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-slate-400 text-[11px] flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formattedDate}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-800 p-4 bg-slate-950/60 text-xs">
            <span className="text-slate-400">
              Trang {pagination.page} / {pagination.totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 font-semibold text-slate-300 disabled:opacity-40"
              >
                Trước
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 font-semibold text-slate-300 disabled:opacity-40"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
