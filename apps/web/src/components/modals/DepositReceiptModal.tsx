"use client";

import { CheckCircle2, Copy, ShieldCheck, X, Calendar, MapPin, KeyRound, Clock } from "lucide-react";
import { useState } from "react";

interface DepositReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: {
    title: string;
    venueName: string;
    datetime: string;
    depositAmount?: number;
    cancelPolicyHours?: number;
    checkInCode?: string;
  };
  player: {
    paidAmount?: number;
    checkInAt?: string;
    attendanceStatus?: string;
  };
  orderCode?: string;
}

export function DepositReceiptModal({
  isOpen,
  onClose,
  session,
  player,
  orderCode,
}: DepositReceiptModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const depositAmount = player.paidAmount || session.depositAmount || 50000;
  const policyHours = session.cancelPolicyHours || 12;

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fadeUp">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Certificate Header */}
        <div className="flex items-center gap-2 text-emerald-600">
          <ShieldCheck className="h-6 w-6" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Chứng Nhận Ký Quỹ CLVL Escrow
          </span>
        </div>

        <h3 className="mt-1.5 text-xl font-black text-slate-900">
          Biên lai cọc giữ chỗ an toàn
        </h3>
        <p className="text-xs text-slate-500">
          Tiền cọc của bạn được nền tảng bảo vệ 100% trong suốt buổi chơi.
        </p>

        {/* Big Amount Card */}
        <div className="my-4 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-50/30 p-4 text-center">
          <span className="text-xs font-semibold text-emerald-800">
            Số tiền đã ký quỹ thành công
          </span>
          <div className="mt-1 text-3xl font-black text-emerald-700">
            {depositAmount.toLocaleString()} đ
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-800">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Ký quỹ bảo đảm • Chống bùng kèo</span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="space-y-2.5 rounded-2xl bg-slate-50 p-3.5 text-xs text-slate-700">
          <div className="flex items-start justify-between">
            <span className="text-slate-500">Buổi chơi:</span>
            <span className="max-w-[220px] text-right font-bold text-slate-900 line-clamp-1">
              {session.title}
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200/80 pt-2">
            <span className="text-slate-500">Sân cầu lông:</span>
            <span className="font-semibold text-slate-800">
              {session.venueName}
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200/80 pt-2">
            <span className="text-slate-500">Thời gian đánh:</span>
            <span className="font-semibold text-slate-800">
              {new Date(session.datetime).toLocaleString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </span>
          </div>

          {orderCode && (
            <div className="flex items-center justify-between border-t border-slate-200/80 pt-2">
              <span className="text-slate-500">Mã đơn giao dịch:</span>
              <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900">
                <span>{orderCode}</span>
                <button
                  type="button"
                  onClick={() => copyCode(orderCode)}
                  className="text-slate-400 hover:text-emerald-600"
                  title="Sao chép"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                {copied && <span className="text-[10px] text-emerald-600">Đã chép</span>}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-slate-200/80 pt-2">
            <span className="text-slate-500">Trạng thái điểm danh:</span>
            <span className="font-bold text-emerald-600">
              {player.attendanceStatus === "attended"
                ? "✓ Đã có mặt tại sân"
                : "Đã giữ slot (Chờ đến sân)"}
            </span>
          </div>
        </div>

        {/* Cancellation Guarantee Rule */}
        <div className="mt-3.5 rounded-2xl border border-slate-200 bg-white p-3 text-[11px] leading-relaxed text-slate-600 shadow-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
            <Clock className="h-3.5 w-3.5 text-emerald-600" />
            <span>Chính sách hoàn cọc:</span>
          </div>
          <p>
            • Hủy trước <strong>{policyHours} tiếng</strong>: Nền tảng tự động hoàn cọc <strong>100%</strong> vào tài khoản.
          </p>
          <p>
            • Hủy sau mốc trên hoặc không đến: Tiền cọc đền bù tiền sân cho Host & trừ 15 điểm uy tín.
          </p>
          <p>
            • Kèo ảo / Host vắng mặt: Nền tảng phong tỏa quỹ và hoàn tiền 100%.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-2xl bg-slate-900 py-3 text-xs font-bold text-white hover:bg-slate-800 transition"
        >
          Đóng biên lai
        </button>
      </div>
    </div>
  );
}
