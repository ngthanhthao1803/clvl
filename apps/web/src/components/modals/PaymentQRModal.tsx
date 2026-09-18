import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Copy,
  ShieldCheck,
  X,
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { paymentsApi } from "@/lib/api";

interface PaymentQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: {
    orderCode: string;
    amount: number;
    transferContent: string;
    qrCodeUrl: string;
    checkoutUrl?: string;
    bankInfo: {
      bankName: string;
      accountNumber: string;
      accountHolder: string;
      bin?: string;
    };
    cancelPolicyHours?: number;
  } | null;
  onConfirmPayment: (orderCode: string, extra?: { bankTransactionId?: string }) => Promise<void>;
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
  const [showManualRef, setShowManualRef] = useState(false);
  const [transactionRef, setTransactionRef] = useState("");
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes

  // Countdown timer
  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(15 * 60);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  // Auto-polling for real-time payment confirmation (SePAY / Webhook / Casso / Bank)
  useEffect(() => {
    if (!isOpen || !orderData?.orderCode || success) return;

    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const res = await paymentsApi.getPaymentStatus(orderData.orderCode);
        const payment = res.data?.data?.payment;
        if (
          isMounted &&
          payment &&
          (payment.status === "escrow_held" || payment.status === "completed")
        ) {
          setSuccess(true);
          setTimeout(() => {
            onClose();
          }, 1800);
        }
      } catch {
        // Silently continue polling
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isOpen, orderData?.orderCode, success, onClose]);

  if (!isOpen || !orderData) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await onConfirmPayment(orderData.orderCode, {
        bankTransactionId: transactionRef.trim() || undefined,
      });
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fadeUp">
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
          {orderData.checkoutUrl && (
            <a
              href={orderData.checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
            >
              <span>Mở trang thanh toán PayOS Checkout</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
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

        {/* Live Auto-detect & Countdown */}
        <div className="mt-2.5 flex items-center justify-between px-1 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5 font-medium text-emerald-600">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span>Tự động khớp lệnh Napas 24/7</span>
          </div>
          <div className="flex items-center gap-1 font-mono font-bold text-amber-600">
            <Clock className="h-3.5 w-3.5" />
            <span>Hết hạn: {timeFormatted}</span>
          </div>
        </div>

        {/* Optional Manual Reference input toggle */}
        <div className="mt-1.5 text-right">
          <button
            type="button"
            onClick={() => setShowManualRef(!showManualRef)}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-emerald-600 transition"
          >
            <span>Nhập mã giao dịch ngân hàng (tùy chọn)</span>
            {showManualRef ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>

        {showManualRef && (
          <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 p-2.5">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Mã tham chiếu / Mã giao dịch từ app ngân hàng:
            </label>
            <input
              type="text"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              placeholder="Ví dụ: FT260918123456 hoặc 982736"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-emerald-500"
            />
          </div>
        )}

        {/* Helper Note */}
        <div className="mt-3 rounded-xl bg-slate-50 p-2.5 text-[11px] text-slate-600 border border-slate-200/80 leading-relaxed">
          💡 <strong>Lưu ý:</strong> Sau khi bạn chuyển khoản qua app ngân hàng, hệ thống sẽ tự động xác nhận trong vòng 2 - 5 giây. Bạn không cần làm gì thêm hoặc có thể bấm <strong>Kiểm tra thanh toán</strong> để tra soát ngay.
        </div>

        {errorMsg && (
          <div className="mt-3 rounded-xl bg-rose-50 p-3 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
            <div className="space-y-0.5">
              <span className="font-bold">Chưa phát hiện tiền vào tài khoản:</span>
              <p className="text-[11px] leading-relaxed text-rose-600">{errorMsg}</p>
            </div>
          </div>
        )}

        {success ? (
          <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 animate-fadeUp">
            <CheckCircle2 className="h-5 w-5" />
            <span>Đã xác nhận tiền cọc thành công!</span>
          </div>
        ) : (
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Để sau
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleConfirm}
              className="flex-[2] inline-flex items-center justify-center gap-1.5 rounded-2xl bg-emerald-500 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-600 disabled:opacity-50 transition"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang tra soát...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  <span>Kiểm tra thanh toán</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
