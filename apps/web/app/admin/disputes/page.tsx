"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Scale,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  X,
  RefreshCw,
} from "lucide-react";
import { adminApi } from "@/lib/api";
import { format } from "date-fns";

export default function AdminDisputesPage() {
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  // Modal resolution state
  const [resolvingDispute, setResolvingDispute] = useState<any>(null);
  const [actionType, setActionType] = useState<"refund" | "dismiss">("refund");
  const [resolutionNote, setResolutionNote] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin", "disputes", { statusFilter, page }],
    queryFn: async () => {
      const res = await adminApi.getDisputes({
        status: statusFilter,
        page,
        limit: 15,
      });
      return res.data.data;
    },
    staleTime: 5000,
  });

  const disputes = data?.items || [];
  const pagination = data?.pagination || { total: 0, totalPages: 1, page: 1 };

  // Resolve mutation
  const resolveMutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: { action: "refund" | "dismiss"; resolutionNote: string };
    }) => {
      const res = await adminApi.resolveDispute(id, payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "disputes"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "sessions"] });
      setMessage({ type: "success", text: "Đã xử lý và ra quyết định phán quyết tranh chấp!" });
      setResolvingDispute(null);
      setResolutionNote("");
      setTimeout(() => setMessage(null), 3000);
    },
    onError: (err: any) => {
      setMessage({ type: "error", text: err?.response?.data?.message || "Lỗi xử lý khiếu nại" });
      setTimeout(() => setMessage(null), 4000);
    },
  });

  const handleOpenResolve = (dispute: any, action: "refund" | "dismiss") => {
    setResolvingDispute(dispute);
    setActionType(action);
    setResolutionNote(
      action === "refund"
        ? "Quản trị viên đã xem xét bằng chứng và chấp thuận hoàn trả tiền cọc cho người chơi."
        : "Quản trị viên bác bỏ khiếu nại do không đủ chứng cứ vi phạm. Mở khóa giải ngân cho Host.",
    );
  };

  const handleConfirmResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingDispute) return;
    resolveMutation.mutate({
      id: resolvingDispute._id,
      payload: { action: actionType, resolutionNote },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Tòa Phán Quyết Khiếu Nại & Tranh Chấp (Disputes)
            </h1>
            <span className="rounded-full bg-rose-500/20 px-2.5 py-0.5 text-xs font-bold text-rose-400 border border-rose-500/30">
              {pagination.total} vụ việc
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Quyền lực tài phán tối cao của Admin: Xem xét chứng cứ, quyết định hoàn tiền cọc người chơi hoặc giải ngân cho Host.
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
      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500 max-w-xs"
        >
          <option value="">Tất cả trạng thái khiếu nại</option>
          <option value="pending">Chờ phán quyết (Pending)</option>
          <option value="investigating">Đang điều tra (Investigating)</option>
          <option value="resolved_refund">Đã chấp thuận hoàn tiền (Refunded)</option>
          <option value="resolved_dismissed">Đã bác bỏ khiếu nại (Dismissed)</option>
        </select>
      </div>

      {/* Disputes List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-500 text-xs">
            Đang tải danh sách khiếu nại...
          </div>
        ) : disputes.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
            <CheckCircle className="h-8 w-8 text-emerald-500" />
            <p className="font-bold text-slate-300">Không có khiếu nại nào cần xử lý!</p>
            <p className="text-slate-500">Mọi buổi chơi và cọc ký quỹ đều đang vận hành thuận lợi.</p>
          </div>
        ) : (
          disputes.map((d: any) => {
            let formattedDate = "";
            try {
              formattedDate = format(new Date(d.createdAt), "dd/MM/yyyy HH:mm");
            } catch {
              formattedDate = String(d.createdAt);
            }

            const isPending = d.status === "pending" || d.status === "investigating";

            return (
              <div
                key={d._id}
                className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg space-y-4"
              >
                {/* Dispute Top */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${
                        d.status === "pending"
                          ? "bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse"
                          : d.status === "resolved_refund"
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                          : "bg-slate-800 text-slate-400 border-slate-700"
                      }`}
                    >
                      {d.status}
                    </span>
                    <span className="text-xs text-slate-400">
                      Loại: <span className="font-bold text-white">{d.type}</span>
                    </span>
                    <span className="text-xs text-slate-500">• Ngày gửi: {formattedDate}</span>
                  </div>

                  {/* Actions for Admin if pending */}
                  {isPending && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleOpenResolve(d, "refund")}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition shadow"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Chấp thuận & Hoàn tiền
                      </button>
                      <button
                        onClick={() => handleOpenResolve(d, "dismiss")}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-3.5 py-1.5 text-xs font-bold text-rose-400 hover:bg-slate-700 border border-rose-500/20 transition"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Bác bỏ khiếu nại
                      </button>
                    </div>
                  )}
                </div>

                {/* Dispute Body: Reporter vs Reported, Session */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Reporter */}
                  <div className="rounded-xl bg-slate-950/60 p-3.5 border border-slate-800/80">
                    <span className="text-[10px] uppercase font-bold text-slate-500">
                      Người Khiếu Nại (Bên A)
                    </span>
                    <p className="font-bold text-white mt-1">{d.reporter?.name || "Ẩn danh"}</p>
                    <p className="text-slate-400">{d.reporter?.email || d.reporter?.phone || "---"}</p>
                  </div>

                  {/* Reported */}
                  <div className="rounded-xl bg-slate-950/60 p-3.5 border border-slate-800/80">
                    <span className="text-[10px] uppercase font-bold text-slate-500">
                      Bên Bị Khiếu Nại (Bên B)
                    </span>
                    <p className="font-bold text-white mt-1">{d.reportedUser?.name || "Host"}</p>
                    <p className="text-slate-400">{d.reportedUser?.email || d.reportedUser?.phone || "---"}</p>
                  </div>

                  {/* Session */}
                  <div className="rounded-xl bg-slate-950/60 p-3.5 border border-slate-800/80">
                    <span className="text-[10px] uppercase font-bold text-slate-500">
                      Buổi Chơi Gắn Liền
                    </span>
                    <p className="font-bold text-emerald-400 mt-1 truncate">
                      {d.session?.title || "Buổi chơi không xác định"}
                    </p>
                    <p className="text-slate-400">{d.session?.venueName || "---"}</p>
                  </div>
                </div>

                {/* Reason & Resolution note */}
                <div className="rounded-xl bg-slate-950/40 p-4 border border-slate-800/60 space-y-2 text-xs">
                  <p className="text-slate-300 font-medium">
                    <span className="font-bold text-white">Lý do khiếu nại: </span>
                    {d.reason}
                  </p>

                  {d.resolutionNote && (
                    <div className="mt-2 pt-2 border-t border-slate-800 text-xs">
                      <span className="font-bold text-amber-400">Quyết định phán quyết của Admin: </span>
                      <span className="text-slate-300">{d.resolutionNote}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Resolution Modal */}
      {resolvingDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="max-w-md w-full rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Scale className="h-5 w-5 text-amber-400" />
                {actionType === "refund"
                  ? "Phán Quyết: Chấp Thuận Hoàn Tiền"
                  : "Phán Quyết: Bác Bỏ Khiếu Nại"}
              </h2>
              <button
                onClick={() => setResolvingDispute(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmResolve} className="space-y-4 text-xs">
              <p className="text-slate-300 leading-relaxed">
                {actionType === "refund"
                  ? "Hệ thống sẽ chuyển trạng thái khiếu nại thành ĐÃ GIẢI QUYẾT, hoàn trả tiền cọc cho người chơi và thu hồi cọc buổi đấu."
                  : "Hệ thống sẽ bác bỏ khiếu nại và mở khóa quyền rút tiền (Giải ngân cọc) cho Host."}
              </p>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Ghi chú phán quyết của Quản trị viên
                </label>
                <textarea
                  rows={3}
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setResolvingDispute(null)}
                  className="rounded-xl px-4 py-2 text-slate-400 hover:text-white font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={resolveMutation.isPending}
                  className={`rounded-xl px-5 py-2 font-bold text-white transition ${
                    actionType === "refund"
                      ? "bg-emerald-600 hover:bg-emerald-500"
                      : "bg-rose-600 hover:bg-rose-500"
                  }`}
                >
                  {resolveMutation.isPending ? "Đang xử lý..." : "Ban Hành Quyết Định"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
