"use client";

import { useState } from "react";
import { CheckCircle2, MapPin, X, AlertCircle } from "lucide-react";

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionTitle: string;
  venueName: string;
  onCheckIn: (code: string) => Promise<void>;
}

export function CheckInModal({
  isOpen,
  onClose,
  sessionTitle,
  venueName,
  onCheckIn,
}: CheckInModalProps) {
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setErrorMsg("Vui lòng nhập mã 6 số từ Host");
      return;
    }
    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await onCheckIn(code.trim());
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setCode("");
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message || "Mã Check-in không hợp lệ. Vui lòng thử lại!",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fadeUp">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 text-emerald-600">
          <MapPin className="h-6 w-6" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Check-in Tại Sân
          </span>
        </div>

        <h3 className="mt-2 text-lg font-bold text-slate-900">
          Xác nhận có mặt tại sân
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Buổi chơi: <strong>{sessionTitle}</strong> ({venueName})
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Nhập mã Check-in (6 chữ số từ Host):
            </label>
            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="Ví dụ: 123456"
              className="mt-1.5 w-full rounded-2xl border border-slate-300 px-4 py-3 text-center text-2xl font-bold tracking-widest text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            <span className="mt-1.5 block text-[11px] text-slate-400">
              * Hỏi Host của buổi chơi khi bạn đến sân để lấy mã xác nhận này.
            </span>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-1.5 text-xs text-rose-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {success ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3 text-sm font-semibold text-white">
              <CheckCircle2 className="h-5 w-5" />
              <span>Check-in thành công!</span>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-2xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting || code.length < 4}
                className="flex-[2] rounded-2xl bg-emerald-500 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-600 disabled:opacity-50"
              >
                {isSubmitting ? "Đang kiểm tra..." : "Xác nhận có mặt"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
