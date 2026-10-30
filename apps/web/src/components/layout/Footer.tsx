"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Smartphone,
  MapPin,
  PlusCircle,
  Compass,
  Calendar,
  Download,
  X,
  CheckCircle2,
} from "lucide-react";
import { BrandEmblem } from "@/components/ui/BrandLogo";

export function Footer() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      return;
    }
    setShowIosGuide(true);
  };

  return (
    <footer className="mt-8 border-t border-slate-200/80 bg-white pb-24 lg:pb-8 text-slate-600">
      <div className="mx-auto max-w-7xl px-3 pt-6 sm:px-6 lg:px-8">
        {/* PWA Install Strip (when not already installed) */}
        {!isStandalone && (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50/90 via-teal-50/60 to-white p-3.5 sm:p-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                  Cài ứng dụng Đánh Cầu Lông ra màn hình chính
                </h3>
                <p className="text-[11px] text-slate-500">
                  Mở nhanh 1 chạm như App gốc, nhận thông báo kèo mới và thẻ vé lên sân tức thì.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleInstallClick}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 hover:bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white transition active:scale-95 shrink-0"
            >
              <Download className="h-3.5 w-3.5 text-emerald-400" />
              <span>Thêm vào màn hình chính</span>
            </button>
          </div>
        )}

        {/* iOS / Mobile Install Guide Modal */}
        {showIosGuide && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
            onClick={() => setShowIosGuide(false)}
          >
            <div
              className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Smartphone className="h-4 w-4 text-emerald-600" />
                  <span>Cài đặt Đánh Cầu Lông (PWA)</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setShowIosGuide(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 space-y-2.5 text-xs text-slate-600">
                <p className="font-semibold text-slate-800">
                  Để đưa ứng dụng ra màn hình chính điện thoại:
                </p>
                <div className="rounded-xl bg-slate-50 p-3 space-y-2 border border-slate-100">
                  <p>
                    <strong>• Trên iPhone (Safari):</strong> Bấm nút{" "}
                    <span className="font-bold text-emerald-700">Chia sẻ (Share)</span> ở thanh dưới cùng → chọn{" "}
                    <span className="font-bold text-slate-900">&ldquo;Thêm vào MH chính&rdquo; (Add to Home Screen)</span>.
                  </p>
                  <p>
                    <strong>• Trên Android (Chrome):</strong> Bấm biểu tượng{" "}
                    <span className="font-bold text-emerald-700">3 chấm (⋮)</span> ở góc trên phải → chọn{" "}
                    <span className="font-bold text-slate-900">&ldquo;Cài đặt ứng dụng&rdquo;</span>.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIosGuide(false)}
                className="mt-4 w-full rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-700"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        )}

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 pb-6 border-b border-slate-100">
          {/* Col 1: Brand */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BrandEmblem className="h-7 w-7 shrink-0" />
              <span className="text-sm font-black tracking-tight text-slate-900">
                ĐÁNH CẦU LÔNG · CLVL
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Nền tảng ghép kèo vãng lai, tìm sân cầu lông gần bạn và bảo chứng đặt cọc tự động qua VietQR uy tín hàng đầu Việt Nam.
            </p>
          </div>

          {/* Col 2: Quick Navigation */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
              Khám phá nhanh
            </h4>
            <ul className="space-y-1 text-xs">
              <li>
                <Link href="/explore" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-emerald-600 transition">
                  <Compass className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Tất cả kèo cầu lông</span>
                </Link>
              </li>
              <li>
                <Link href="/?tab=map" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-emerald-600 transition">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Bản đồ sân cầu lông</span>
                </Link>
              </li>
              <li>
                <Link href="/sessions/create" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-emerald-600 transition">
                  <PlusCircle className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Đăng kèo tuyển thành viên</span>
                </Link>
              </li>
              <li>
                <Link href="/my-sessions" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-emerald-600 transition">
                  <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Quản lý kèo của tôi</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Trust & Escrow */}
          <div className="space-y-1.5 sm:col-span-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Cam kết Bảo vệ Lông thủ & Chủ sân (CLVL Escrow)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5 text-[11.5px] text-slate-600">
              <div className="flex items-start gap-1.5 rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Chống bùng kèo 100%:</strong> Giữ chỗ tự động bằng VietQR, hoàn tiền 100% nếu hủy trước hạn quy định.
                </span>
              </div>
              <div className="flex items-start gap-1.5 rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Hệ thống Điểm Uy Tín:</strong> Đánh giá minh bạch trình độ (Yếu, TB-, TB, TB+, Khá) và lịch sử tham gia.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-4 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
          <span>© {new Date().getFullYear()} danhcaulong.com (CLVL). All rights reserved.</span>
          <span>Cộng đồng Cầu Lông Vãng Lai Việt Nam 🇻🇳</span>
        </div>
      </div>
    </footer>
  );
}
