"use client";

import { useState } from "react";
import { CheckCircle2, Copy, ShieldCheck, X, AlertCircle } from "lucide-react";

interface PaymentQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: {
    orderCode: string;
    amount: number;
    transferContent: string;
    qrCodeUrl: string;
    bankInfo: {
      bankName: string;
      accountNumber: string;
      accountHolder: string;
      bin?: string;
    };
    cancelPolicyHours?: number;
  } | null;
  onConfirmPayment: (orderCode: string) => Promise<void>;
}

export function PaymentQRModal({
  isOpen,
  onClose,
  orderData,
  onConfirmPayment,
}: PaymentQRModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !orderData) return null;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await onConfirmPayment(orderData.orderCode);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message || "Có lỗi khi xác nhận, vui lòng thử lại.",
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

        <div className="flex items-center gap-2 text-emerald-600">
          <ShieldCheck className="h-6 w-6" />
          <span className="text-xs font-bold uppercase tracking-wider">
            CLVL Ký Quỹ An Toàn (Escrow)
          </span>
        </div>

        <h3 className="mt-2 text-xl font-bold text-slate-900">
          Quét mã VietQR đặt cọc giữ chỗ
        </h3>

        {/* Escrow Guarantee banner */}
        <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3 text-xs leading-5 text-emerald-800">
          <p className="font-semibold">Bảo hiểm 100% tiền cọc:</p>
          <p>
            Tiền của bạn được CLVL giữ an toàn. Host chỉ được giải ngân sau khi
            buổi chơi kết thúc. Hoàn 100% tiền cọc nếu bạn hủy trước{" "}
            <strong>{orderData.cancelPolicyHours || 12} tiếng</strong> hoặc nếu
            kèo bị hủy/ảo.
          </p>
        </div>

        {/* QR Code */}
        <div className="my-4 flex flex-col items-center justify-center">
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 shadow-sm">
            {orderData.qrCodeUrl ? (
              <img
                src={orderData.qrCodeUrl}
                alt="VietQR code"
                className="h-52 w-52 rounded-lg object-contain"
              />
            ) : (
              <div className="flex h-52 w-52 items-center justify-center text-slate-400">
                Đang tải mã QR...
              </div>
            )}
          </div>
          <span className="mt-2 text-xs text-slate-500">
            Mở app ngân hàng bất kỳ để quét mã Napas 247
          </span>
        </div>

        {/* Transfer details */}
        <div className="space-y-2.5 rounded-2xl bg-slate-50 p-3.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Số tiền cọc:</span>
            <span className="text-base font-bold text-emerald-600">
              {orderData.amount.toLocaleString()} đ
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 pt-2">
            <span className="text-slate-500">Ngân hàng:</span>
            <span className="font-semibold text-slate-800">
              {orderData.bankInfo.bankName}
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 pt-2">
            <span className="text-slate-500">Số tài khoản:</span>
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <span>{orderData.bankInfo.accountNumber}</span>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    orderData.bankInfo.accountNumber,
                    "accountNumber",
                  )
                }
                className="text-slate-400 hover:text-emerald-600"
                title="Sao chép"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
              {copiedField === "accountNumber" && (
                <span className="text-[10px] text-emerald-600">Đã chép</span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 pt-2">
            <span className="text-slate-500">Nội dung chuyển khoản:</span>
            <div className="flex items-center gap-1.5 font-bold text-amber-700">
              <span>{orderData.transferContent}</span>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(orderData.transferContent, "transferContent")
                }
                className="text-slate-400 hover:text-emerald-600"
                title="Sao chép"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
              {copiedField === "transferContent" && (
                <span className="text-[10px] text-emerald-600">Đã chép</span>
              )}
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-rose-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {success ? (
          <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3 text-sm font-semibold text-white">
            <CheckCircle2 className="h-5 w-5" />
            <span>Đã ghi nhận đặt cọc thành công!</span>
          </div>
        ) : (
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Đóng
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleConfirm}
              className="flex-[2] rounded-2xl bg-emerald-500 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-600 disabled:opacity-50"
            >
              {isSubmitting ? "Đang xử lý..." : "Tôi đã chuyển khoản"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
