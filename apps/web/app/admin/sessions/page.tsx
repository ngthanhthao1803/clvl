"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CalendarCheck2,
  Search,
  Filter,
  MapPin,
  Clock,
  Users,
  CreditCard,
  Ban,
  CheckCircle,
  Trash2,
  AlertTriangle,
  X,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { adminApi } from "@/lib/api";
import { format } from "date-fns";

export default function AdminSessionsPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [page, setPage] = useState(1);

  // Modal Cancel state
  const [cancellingSession, setCancellingSession] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin", "sessions", { search, statusFilter, districtFilter, page }],
    queryFn: async () => {
      const res = await adminApi.getSessions({
        search,
        status: statusFilter,
        district: districtFilter,
        page,
        limit: 15,
      });
      return res.data.data;
    },
    staleTime: 5000,
  });

  const sessions = data?.items || [];
  const pagination = data?.pagination || { total: 0, totalPages: 1, page: 1 };

  // Status mutation
  const statusMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      const res = await adminApi.updateSessionStatus(id, payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "sessions"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
      setMessage({ type: "success", text: "Cập nhật trạng thái buổi chơi thành công!" });
      setCancellingSession(null);
      setCancelReason("");
      setTimeout(() => setMessage(null), 3000);
    },
    onError: (err: any) => {
      setMessage({ type: "error", text: err?.response?.data?.message || "Lỗi cập nhật buổi chơi" });
      setTimeout(() => setMessage(null), 4000);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await adminApi.deleteSession(id);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "sessions"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
      setMessage({ type: "success", text: "Đã xóa buổi chơi khỏi hệ thống!" });
      setTimeout(() => setMessage(null), 3000);
    },
    onError: (err: any) => {
      setMessage({ type: "error", text: err?.response?.data?.message || "Lỗi xóa buổi chơi" });
      setTimeout(() => setMessage(null), 4000);
    },
  });

  const handleOpenCancel = (session: any) => {
    setCancellingSession(session);
    setCancelReason("Kèo bị Quản trị viên hủy do vi phạm quy định hoặc sân bị hủy đột xuất.");
  };

  const handleConfirmCancel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingSession) return;
    statusMutation.mutate({
      id: cancellingSession._id,
      payload: { status: "cancelled", cancelReason },
    });
  };

  const handleCompleteSession = (session: any) => {
    if (confirm(`Đánh dấu hoàn tất buổi chơi "${session.title}"?`)) {
      statusMutation.mutate({
        id: session._id,
        payload: { status: "completed" },
      });
    }
  };

  const handleDeleteSession = (session: any) => {
    if (confirm(`CẢNH BÁO: Bạn có chắc chắn muốn xóa vĩnh viễn buổi chơi "${session.title}"?`)) {
      deleteMutation.mutate(session._id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Quản Lý Buổi Chơi & Kèo Đấu
            </h1>
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
              {pagination.total} buổi chơi
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Giám sát các kèo cầu lông mở, can thiệp hủy kèo vi phạm và giải ngân cọc.
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

      {message && (
        <div
          className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between ${
            message.type === "success"
              ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/20 border border-rose-500/30 text-rose-300"
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

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
            placeholder="Tìm theo tiêu đề, tên sân..."
            className="w-full rounded-xl bg-slate-900 border border-slate-800 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="open">Đang mở (Open)</option>
            <option value="full">Đã đủ chỗ (Full)</option>
            <option value="completed">Đã hoàn tất (Completed)</option>
            <option value="cancelled">Đã hủy (Cancelled)</option>
          </select>
        </div>

        <div>
          <input
            type="text"
            value={districtFilter}
            onChange={(e) => {
              setDistrictFilter(e.target.value);
              setPage(1);
            }}
            placeholder="Lọc theo Quận / Huyện..."
            className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Sessions Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Buổi chơi / Kèo</th>
                <th className="py-3.5 px-4">Host tạo</th>
                <th className="py-3.5 px-4">Địa điểm</th>
                <th className="py-3.5 px-4">Thời gian</th>
                <th className="py-3.5 px-4">Thành viên</th>
                <th className="py-3.5 px-4">Cọc / Escrow</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    Đang tải danh sách buổi chơi...
                  </td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    Không tìm thấy buổi chơi nào
                  </td>
                </tr>
              ) : (
                sessions.map((s: any) => {
                  let formattedDate = "";
                  try {
                    formattedDate = format(new Date(s.datetime), "dd/MM/yyyy HH:mm");
                  } catch {
                    formattedDate = String(s.datetime);
                  }

                  return (
                    <tr key={s._id} className="hover:bg-slate-800/40 transition">
                      {/* Title */}
                      <td className="py-3.5 px-4">
                        <div className="max-w-xs sm:max-w-md">
                          <p className="font-bold text-white truncate" title={s.title}>
                            {s.title}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {s.matchType} • Giá: {Number(s.price || 0).toLocaleString()} đ
                          </p>
                        </div>
                      </td>

                      {/* Host */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-200 truncate max-w-[180px]">
                          {s.host?.name || "Ẩn danh"}
                        </p>
                        <p className="text-[11px] text-slate-400">{s.host?.phone || ""}</p>
                      </td>

                      {/* Venue */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-200 truncate max-w-[220px]">
                          {s.venueName}
                        </p>
                        <p className="text-[11px] text-slate-400">{s.district}, {s.city}</p>
                      </td>

                      {/* Datetime */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-emerald-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formattedDate}
                        </span>
                      </td>

                      {/* Players count */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-white">
                          {s.currentPlayersCount || s.players?.length || 1} / {s.maxPlayers}
                        </span>
                      </td>

                      {/* Escrow */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            s.escrowStatus === "holding"
                              ? "bg-amber-500/20 text-amber-300"
                              : s.escrowStatus === "ready_for_payout"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : s.escrowStatus === "disputed"
                              ? "bg-rose-500/20 text-rose-300 animate-pulse"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {s.escrowStatus}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                            s.status === "open"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : s.status === "full"
                              ? "bg-blue-500/20 text-blue-400"
                              : s.status === "completed"
                              ? "bg-purple-500/20 text-purple-400"
                              : "bg-rose-500/20 text-rose-400"
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Force complete */}
                          {s.status !== "completed" && s.status !== "cancelled" && (
                            <button
                              onClick={() => handleCompleteSession(s)}
                              title="Hoàn tất buổi chơi"
                              className="rounded-lg p-1.5 text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20"
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {/* Force cancel */}
                          {s.status !== "cancelled" && (
                            <button
                              onClick={() => handleOpenCancel(s)}
                              title="Hủy kèo này"
                              className="rounded-lg p-1.5 text-amber-400 hover:bg-amber-500/10 border border-amber-500/20"
                            >
                              <Ban className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteSession(s)}
                            title="Xóa vĩnh viễn"
                            className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-500/10 border border-rose-500/20"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
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

      {/* Cancel Reason Modal */}
      {cancellingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="max-w-md w-full rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Ban className="h-5 w-5 text-amber-400" />
                Hủy Buổi Chơi (Admin Quyền Lực)
              </h2>
              <button
                onClick={() => setCancellingSession(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmCancel} className="space-y-4 text-xs">
              <p className="text-slate-300">
                Bạn đang thực hiện quyền Admin để hủy buổi chơi:{" "}
                <span className="font-bold text-white">{cancellingSession.title}</span>.
              </p>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Lý do hủy (Hiển thị cho các thành viên và Host)
                </label>
                <textarea
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCancellingSession(null)}
                  className="rounded-xl px-4 py-2 text-slate-400 hover:text-white font-semibold"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={statusMutation.isPending}
                  className="rounded-xl bg-amber-500 px-5 py-2 font-bold text-slate-950 hover:bg-amber-400 transition"
                >
                  {statusMutation.isPending ? "Đang xử lý..." : "Xác Nhận Hủy Kèo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
