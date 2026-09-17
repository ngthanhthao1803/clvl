"use client";

import { useState } from "react";
import { AlertTriangle, ShieldAlert, X, CheckCircle2 } from "lucide-react";

interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  sessionTitle: string;
  onReportDispute: (payload: {
    sessionId: string;
    type: string;
    reason: string;
  }) => Promise<void>;
}

export function DisputeModal({
  isOpen,
  onClose,
  sessionId,
  sessionTitle,
  onReportDispute,
}: DisputeModalProps) {
  const [type, setType] = useState("fake_session");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setErrorMsg("Vui lòng nhập chi tiết sự việc");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await onReportDispute({ sessionId, type, reason: reason.trim() });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setReason("");
        onClose();
      }, 2000);
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message || "Có lỗi khi gửi báo cáo, vui lòng thử lại.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fadeUp">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 text-rose-600">
          <ShieldAlert className="h-6 w-6" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Khiếu Nại & Bảo Vệ Người Chơi
          </span>
        </div>

        <h3 className="mt-2 text-lg font-bold text-slate-900">
          Báo cáo vấn đề buổi chơi
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Buổi chơi: <strong>{sessionTitle}</strong>
        </p>

        <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
          <strong>Cơ chế bảo vệ ký quỹ:</strong> Khi bạn gửi báo cáo, toàn bộ quỹ
          tiền cọc sẽ <strong>lập tức bị đóng băng</strong>. Host sẽ không thể rút
          tiền cho tới khi ban quản trị xác minh sự việc và hoàn tiền cho bạn.
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Loại vấn đề gặp phải:
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-1.5 w-full rounded-2xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-800 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            >
              <option value="fake_session">
                Kèo ảo / Sân không tồn tại / Đến sân không có đặt chỗ
              </option>
              <option value="host_absent">
                Host vắng mặt, không nghe máy, không có người điều phối
              </option>
              <option value="venue_closed">Sân đóng cửa hoặc bị hủy lịch</option>
              <option value="incorrect_charge">
                Thu tiền sai thỏa thuận / Ép giá
              </option>
              <option value="other">Vấn đề khác</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Mô tả chi tiết sự việc:
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Vui lòng mô tả rõ những gì xảy ra tại sân..."
              className="mt-1.5 w-full rounded-2xl border border-slate-300 p-3 text-xs text-slate-800 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>

          {errorMsg && (
            <div className="flex items-center gap-1.5 text-xs text-rose-600">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {success ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3 text-sm font-semibold text-white">
              <CheckCircle2 className="h-5 w-5" />
              <span>Đã tiếp nhận! Quỹ cọc đã được phong tỏa.</span>
            </div>
          ) : (
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-2xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !reason.trim()}
                className="flex-[2] rounded-2xl bg-rose-600 py-2.5 text-xs font-semibold text-white shadow-md shadow-rose-600/20 hover:bg-rose-700 disabled:opacity-50"
              >
                {isSubmitting ? "Đang gửi báo cáo..." : "Gửi báo cáo & Phong tỏa"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
