"use client";

import { useState } from "react";
import { Building2, CheckCircle2, ShieldCheck, Wallet, X, AlertCircle, ArrowRight } from "lucide-react";
import { usersApi } from "@/lib/api";

const BANKS_LIST = [
  { id: "MSB", name: "MSB (Ngân hàng Hàng Hải)" },
  { id: "MB", name: "MBBank (Ngân hàng Quân Đội)" },
  { id: "VCB", name: "Vietcombank" },
  { id: "TCB", name: "Techcombank" },
  { id: "CTG", name: "VietinBank" },
  { id: "BIDV", name: "BIDV" },
  { id: "VPB", name: "VPBank" },
  { id: "ACB", name: "ACB" },
  { id: "TPB", name: "TPBank" },
  { id: "VBA", name: "Agribank" },
  { id: "OCB", name: "OCB" },
  { id: "SHB", name: "SHB" },
  { id: "HDB", name: "HDBank" },
  { id: "STB", name: "Sacombank" },
  { id: "VIB", name: "VIB" },
];

interface PayoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalEscrowHeld: number;
  sessionTitle: string;
  hostBank?: {
    bankId?: string;
    bankName?: string;
    accountNumber?: string;
    accountHolder?: string;
  } | null;
  onConfirmPayout: () => Promise<void>;
  onBankUpdated?: () => void;
}

export function PayoutConfirmModal({
  isOpen,
  onClose,
  totalEscrowHeld,
  sessionTitle,
  hostBank,
  onConfirmPayout,
  onBankUpdated,
}: PayoutConfirmModalProps) {
  const hasExistingBank = Boolean(hostBank?.accountNumber?.trim());

  const [bankForm, setBankForm] = useState({
    bankId: hostBank?.bankId || "MB",
    bankName: hostBank?.bankName || "MBBank (Ngân hàng Quân Đội)",
    accountNumber: hostBank?.accountNumber || "",
    accountHolder: hostBank?.accountHolder || "",
  });

  const [isEditingBank, setIsEditingBank] = useState(!hasExistingBank);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePayout = async () => {
    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      // If user edited or is filling in bank info, save first
      if (isEditingBank) {
        if (!bankForm.accountNumber.trim()) {
          throw new Error("Vui lòng nhập số tài khoản ngân hàng");
        }
        if (!bankForm.accountHolder.trim()) {
          throw new Error("Vui lòng nhập tên chủ tài khoản (viết hoa không dấu)");
        }

        await usersApi.updateMe({
          bankAccount: {
            bankId: bankForm.bankId,
            bankName: bankForm.bankName,
            accountNumber: bankForm.accountNumber.trim(),
            accountHolder: bankForm.accountHolder.trim().toUpperCase(),
          },
        });
        onBankUpdated?.();
      }

      await onConfirmPayout();
      onClose();
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message ||
          err.message ||
          "Có lỗi khi giải ngân, vui lòng thử lại.",
      );
    } finally {
      setIsSubmitting(false);
    }
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

        {/* Title */}
        <div className="flex items-center gap-2 text-emerald-600">
          <Wallet className="h-6 w-6" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Giải Ngân Quỹ Ký Quỹ CLVL
          </span>
        </div>

        <h3 className="mt-1.5 text-xl font-black text-slate-900">
          Chuyển tiền về tài khoản của Host
        </h3>
        <p className="text-xs text-slate-500">
          Buổi chơi: <span className="font-semibold text-slate-800">{sessionTitle}</span>
        </p>

        {/* Payout Amount Highlight */}
        <div className="my-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
          <span className="text-xs font-medium text-emerald-800">
            Tổng số tiền giải ngân vào STK:
          </span>
          <div className="mt-1 text-3xl font-black text-emerald-700">
            {totalEscrowHeld.toLocaleString()} đ
          </div>
          <span className="mt-1 inline-block text-[11px] text-slate-500">
            Bao gồm tiền cọc của các thành viên đã tham gia & tiền đền bù bùng kèo
          </span>
        </div>

        {/* Bank Account Info Section */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <Building2 className="h-4 w-4 text-emerald-600" />
              <span>Tài khoản ngân hàng thụ hưởng</span>
            </div>
            {hasExistingBank && (
              <button
                type="button"
                onClick={() => setIsEditingBank(!isEditingBank)}
                className="text-[11px] font-semibold text-emerald-700 hover:underline"
              >
                {isEditingBank ? "Dùng STK mặc định" : "Thay đổi STK"}
              </button>
            )}
          </div>

          {!isEditingBank ? (
            <div className="space-y-1.5 rounded-xl bg-white p-3 border border-slate-200 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Ngân hàng:</span>
                <span className="font-bold text-slate-900">
                  {hostBank?.bankName || "MBBank"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Số tài khoản:</span>
                <span className="font-mono font-bold text-emerald-700">
                  {hostBank?.accountNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Chủ tài khoản:</span>
                <span className="font-bold uppercase text-slate-800">
                  {hostBank?.accountHolder || "Host CLVL"}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Chọn Ngân hàng:
                </label>
                <select
                  value={bankForm.bankId}
                  onChange={(e) => {
                    const sel = BANKS_LIST.find((b) => b.id === e.target.value);
                    setBankForm((p) => ({
                      ...p,
                      bankId: e.target.value,
                      bankName: sel?.name || e.target.value,
                    }));
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-500"
                >
                  {BANKS_LIST.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Số tài khoản nhận tiền:
                </label>
                <input
                  type="text"
                  value={bankForm.accountNumber}
                  onChange={(e) =>
                    setBankForm((p) => ({ ...p, accountNumber: e.target.value }))
                  }
                  placeholder="Ví dụ: 0988888888"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono text-slate-800 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Họ tên chủ tài khoản:
                </label>
                <input
                  type="text"
                  value={bankForm.accountHolder}
                  onChange={(e) =>
                    setBankForm((p) => ({
                      ...p,
                      accountHolder: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="Ví dụ: NGUYEN VAN A"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs uppercase font-semibold text-slate-800 outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-rose-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-2xl border border-slate-200 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={isSubmitting || totalEscrowHeld <= 0}
            onClick={handlePayout}
            className="flex-[2] rounded-2xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 disabled:opacity-50 transition flex items-center justify-center gap-1.5"
          >
            <span>{isSubmitting ? "Đang xử lý..." : "Xác nhận giải ngân ngay"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
