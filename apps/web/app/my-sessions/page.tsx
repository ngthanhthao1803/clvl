"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  MessageSquare,
  Trophy,
  ArrowRight,
  AlertTriangle,
  Wallet,
  Sparkles,
  ExternalLink,
  ChevronRight,
  PlusCircle,
  QrCode,
  CreditCard,
  Crown,
  History,
  CalendarCheck2,
  XCircle,
} from "lucide-react";
import { api, paymentsApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { SkillBadge } from "@/components/ui/SkillBadge";
import { CheckInModal } from "@/components/modals/CheckInModal";
import { DepositReceiptModal } from "@/components/modals/DepositReceiptModal";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";
import { toast } from "@/stores/toast-store";

export default function MySessionsPage() {
  const [mounted, setMounted] = useState(false);
  const user = useAuthStore((s) => s.user);
  const isReady = useAuthStore((s) => s.isReady);
  const queryClient = useQueryClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  const [activeTab, setActiveTab] = useState<"upcoming" | "hosted" | "history" | "escrow">("upcoming");

  // Modals state
  const [selectedSessionForCheckIn, setSelectedSessionForCheckIn] = useState<any | null>(null);
  const [selectedSessionForReceipt, setSelectedSessionForReceipt] = useState<any | null>(null);

  // Fetch participant sessions
  const sessionsQuery = useQuery({
    queryKey: ["my-sessions", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      try {
        const res = await api.get("/sessions", {
          params: { participant: user.id },
        });
        const list = res.data?.data?.sessions;
        if (Array.isArray(list)) return list;
      } catch (err) {
        console.warn("Could not fetch my sessions:", err);
      }
      return [];
    },
    enabled: Boolean(user?.id),
  });

  // Fetch payments list
  const paymentsQuery = useQuery({
    queryKey: ["my-payments", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      try {
        const res = await paymentsApi.getMyPayments();
        return res.data?.data?.payments || [];
      } catch (err) {
        return [];
      }
    },
    enabled: Boolean(user?.id),
  });

  const allSessions = (sessionsQuery.data || []) as any[];
  const payments = (paymentsQuery.data || []) as any[];

  // Categorize sessions
  const now = Date.now();

  const isPast = (s: any) => {
    const matchStart = new Date(s.datetime).getTime();
    if (isNaN(matchStart)) return false;
    const matchEnd = matchStart + (s.duration || 120) * 60 * 1000;
    return now > matchEnd || s.status === "completed" || s.status === "cancelled";
  };

  const upcomingSessions = allSessions.filter((s) => !isPast(s));
  const historySessions = allSessions.filter((s) => isPast(s));
  const hostedSessions = allSessions.filter((s) => {
    const hostId = s.host?._id || s.host?.id || s.host;
    return String(hostId) === String(user?.id);
  });

  // CheckIn handler
  const handleCheckIn = async (code: string) => {
    if (!selectedSessionForCheckIn) return;
    const sessId = selectedSessionForCheckIn._id || selectedSessionForCheckIn.id;
    await paymentsApi.checkIn(sessId, code);
    toast.success("Điểm danh thành công!", "Bạn đã check-in thành công tại sân.");
    queryClient.invalidateQueries({ queryKey: ["my-sessions"] });
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-6 animate-pulse">
        <div className="h-44 rounded-[2.5rem] bg-slate-900/10" />
        <div className="h-10 w-64 rounded-full bg-slate-200" />
        <div className="space-y-4">
          <div className="h-32 rounded-3xl bg-slate-100" />
          <div className="h-32 rounded-3xl bg-slate-100" />
        </div>
      </div>
    );
  }

  // If user is not logged in
  if (!user && isReady) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center animate-fadeUp">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600 shadow-inner">
          <CalendarCheck2 className="h-10 w-10 stroke-[2.2]" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
          Đăng Nhập Để Xem Kèo Của Bạn
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-slate-500 leading-relaxed">
          Theo dõi các trận đấu bạn đã đăng ký, lấy mã QR check-in tại sân, xem trạng thái cọc và mở nhanh nhóm chat thảo luận.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <GoogleLoginButton />
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition"
          >
            <span>Tùy chọn đăng nhập khác</span>
          </Link>
        </div>

        <div className="mt-12 rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-left">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Lợi ích khi đăng nhập
          </h3>
          <ul className="mt-3 space-y-2.5 text-xs text-slate-600 font-medium">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Quản lý vé lên sân & mã QR điểm danh 1-chạm</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Theo dõi dòng tiền cọc và lịch sử hoàn tiền tự động</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Nhận thông báo khi Host phê duyệt hoặc thay đổi lịch đấu</span>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 animate-fadeUp">
      {/* 1. Header Overview */}
      <div className="rounded-[2.5rem] border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 h-60 w-60 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3.5 py-1 text-xs font-bold text-emerald-300 border border-emerald-400/30">
              <CalendarCheck2 className="h-3.5 w-3.5" />
              <span>Sổ Tay Trận Đấu</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
              Kèo Của Tôi
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed">
              Quản lý lịch trình lên sân, điểm danh mã QR và theo dõi bảo chứng ký quỹ cọc của bạn.
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 text-center backdrop-blur-md">
              <span className="block text-2xl font-black text-emerald-400">
                {upcomingSessions.length}
              </span>
              <span className="text-[11px] font-semibold text-slate-300">
                Sắp diễn ra
              </span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 text-center backdrop-blur-md">
              <span className="block text-2xl font-black text-teal-300">
                {hostedSessions.length}
              </span>
              <span className="text-[11px] font-semibold text-slate-300">
                Kèo tôi tạo
              </span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 text-center backdrop-blur-md">
              <span className="block text-2xl font-black text-amber-300">
                {user?.reputation ?? 100}
              </span>
              <span className="text-[11px] font-semibold text-slate-300">
                Điểm uy tín
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-none gap-2 pb-1">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition whitespace-nowrap ${
            activeTab === "upcoming"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/25"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Sắp Diễn Ra</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
              activeTab === "upcoming"
                ? "bg-emerald-700 text-emerald-100"
                : "bg-slate-200 text-slate-600"
            }`}
          >
            {upcomingSessions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("hosted")}
          className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition whitespace-nowrap ${
            activeTab === "hosted"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/25"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <Crown className="h-4 w-4" />
          <span>Kèo Tôi Làm Host</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
              activeTab === "hosted"
                ? "bg-emerald-700 text-emerald-100"
                : "bg-slate-200 text-slate-600"
            }`}
          >
            {hostedSessions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition whitespace-nowrap ${
            activeTab === "history"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/25"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <History className="h-4 w-4" />
          <span>Lịch Sử Đã Đấu</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
              activeTab === "history"
                ? "bg-emerald-700 text-emerald-100"
                : "bg-slate-200 text-slate-600"
            }`}
          >
            {historySessions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("escrow")}
          className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition whitespace-nowrap ${
            activeTab === "escrow"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/25"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <Wallet className="h-4 w-4" />
          <span>Dòng Tiền Cọc & Ký Quỹ</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
              activeTab === "escrow"
                ? "bg-emerald-700 text-emerald-100"
                : "bg-slate-200 text-slate-600"
            }`}
          >
            {payments.length}
          </span>
        </button>
      </div>

      {/* 3. Tab Contents */}
      {sessionsQuery.isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-40 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs animate-pulse"
            />
          ))}
        </div>
      ) : (
        <>
          {/* TAB 1: UPCOMING */}
          {activeTab === "upcoming" && (
            <div className="space-y-4">
              {upcomingSessions.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-xs">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <CalendarCheck2 className="h-7 w-7" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Bạn chưa có lịch lên sân nào sắp tới
                  </h3>
                  <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
                    Hãy dạo quanh Trang chủ để tìm kèo phù hợp với khu vực và trình độ của bạn!
                  </p>
                  <div className="mt-5 flex items-center justify-center gap-3">
                    <Link
                      href="/"
                      className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-sm"
                    >
                      <span>Khám Phá Kèo Ngay</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                upcomingSessions.map((session) => {
                  const sessId = session._id || session.id;
                  const isHost =
                    String(session.host?._id || session.host?.id || session.host) ===
                    String(user?.id);

                  const playerEntry = session.players?.find(
                    (p: any) =>
                      String(p.user?._id || p.user?.id || p.user) === String(user?.id)
                  );

                  const paymentStatus = playerEntry?.paymentStatus || (isHost ? "paid" : "unpaid");
                  const attendanceStatus = playerEntry?.attendanceStatus || "registered";

                  const sessionDate = new Date(session.datetime);
                  const isToday =
                    !isNaN(sessionDate.getTime()) &&
                    sessionDate.toDateString() === new Date().toDateString();

                  return (
                    <div
                      key={sessId}
                      className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm hover:shadow-md transition-all"
                    >
                      {/* Top Bar: Timing & Badges */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              isToday
                                ? "bg-rose-100 text-rose-700 animate-pulse"
                                : "bg-emerald-50 text-emerald-800"
                            }`}
                          >
                            {isToday ? "⚡ Hôm nay" : session.datetime ? new Date(session.datetime).toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit" }) : "Lịch chơi"}
                          </span>
                          <span className="flex items-center gap-1 text-xs font-bold text-slate-700">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            {session.datetime ? new Date(session.datetime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : ""}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {isHost ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-black text-amber-800 border border-amber-200">
                              <Crown className="h-3 w-3" />
                              <span>Host (Chủ kèo)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                              <span>Thành viên</span>
                            </span>
                          )}

                          {/* Payment badge */}
                          {paymentStatus === "escrow_held" || paymentStatus === "paid" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                              <ShieldCheck className="h-3 w-3" />
                              <span>Đã Cọc (Ký Quỹ)</span>
                            </span>
                          ) : paymentStatus === "unpaid" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 border border-amber-200">
                              <span>Chưa cọc</span>
                            </span>
                          ) : null}

                          {/* Attendance badge */}
                          {attendanceStatus === "attended" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-bold text-teal-800">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Đã check-in</span>
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {/* Main Match Info */}
                      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] items-start">
                        <div className="space-y-2">
                          <Link
                            href={`/sessions/${sessId}`}
                            className="text-lg font-extrabold text-slate-900 hover:text-emerald-600 transition"
                          >
                            {session.title}
                          </Link>

                          <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-600">
                            <span className="flex items-center gap-1 font-semibold text-slate-800">
                              <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                              {session.venueName}
                              {session.district ? ` · ${session.district}` : ""}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5 text-slate-400" />
                              <span>
                                {session.currentPlayersCount || session.players?.length || 1} / {session.maxPlayers || 8} Vợt thủ
                              </span>
                            </span>
                          </div>

                          {/* Skill requirement */}
                          <div className="flex flex-wrap items-center gap-1 pt-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                              Yêu cầu:
                            </span>
                            {(session.skillRequirements || []).map((lvl: string) => (
                              <SkillBadge key={lvl} level={lvl} />
                            ))}
                          </div>
                        </div>

                        {/* Actions Suite */}
                        <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                          {/* 1-Tap CheckIn Action */}
                          {!isHost && attendanceStatus !== "attended" && (
                            <button
                              onClick={() => setSelectedSessionForCheckIn(session)}
                              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:brightness-105 transition active:scale-95"
                            >
                              <KeyRound className="h-3.5 w-3.5" />
                              <span>Điểm Danh Check-in</span>
                            </button>
                          )}

                          {isHost && (
                            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 px-3 py-1.5 text-right">
                              <span className="block text-[10px] font-extrabold uppercase text-amber-700">
                                Mã Check-in của Sân
                              </span>
                              <span className="font-mono text-base font-black tracking-widest text-slate-900">
                                {session.checkInCode || "Chưa tạo"}
                              </span>
                            </div>
                          )}

                          {/* Quick Group Chat */}
                          <Link
                            href={`/chat/${sessId}`}
                            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 transition"
                          >
                            <MessageSquare className="h-3.5 w-3.5 text-teal-600" />
                            <span>Vào Phòng Chat</span>
                          </Link>

                          {/* Receipt view */}
                          {playerEntry?.paymentStatus === "escrow_held" && (
                            <button
                              onClick={() => setSelectedSessionForReceipt({ session, player: playerEntry })}
                              className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition underline underline-offset-2"
                            >
                              Biên lai cọc VietQR
                            </button>
                          )}

                          <Link
                            href={`/sessions/${sessId}`}
                            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition flex items-center gap-1"
                          >
                            <span>Xem chi tiết</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: HOSTED BY ME */}
          {activeTab === "hosted" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Danh sách tất cả các kèo do bạn đứng ra tổ chức và điều phối sân.
                </p>
                <Link
                  href="/sessions/create"
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-sm"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>Tạo Buổi Chơi Mới</span>
                </Link>
              </div>

              {hostedSessions.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-xs">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                    <Crown className="h-7 w-7" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Bạn chưa đứng ra làm Host kèo nào
                  </h3>
                  <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
                    Tổ chức buổi chơi giúp bạn chủ động thời gian, chọn sân quen thuộc và kết nối bạn bè mới.
                  </p>
                  <div className="mt-5">
                    <Link
                      href="/sessions/create"
                      className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span>Đăng Kèo Mới Ngay</span>
                    </Link>
                  </div>
                </div>
              ) : (
                hostedSessions.map((session) => {
                  const sessId = session._id || session.id;
                  const confirmedPlayers = (session.players || []).filter(
                    (p: any) => p.status !== "left" && p.status !== "rejected"
                  );

                  return (
                    <div
                      key={sessId}
                      className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-200 flex items-center gap-1">
                            <Crown className="h-3 w-3" />
                            Host Kèo
                          </span>
                          <span className="text-xs font-bold text-slate-700">
                            {session.datetime ? new Date(session.datetime).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" }) : ""}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-500">
                            Mã điểm danh:
                          </span>
                          <span className="rounded-lg bg-slate-100 px-2 py-0.5 font-mono text-xs font-black text-slate-800">
                            {session.checkInCode || "123456"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-1">
                          <Link
                            href={`/sessions/${sessId}`}
                            className="text-base font-extrabold text-slate-900 hover:text-emerald-600 transition"
                          >
                            {session.title}
                          </Link>
                          <p className="text-xs text-slate-500">
                            {session.venueName} · {session.district}
                          </p>
                          <div className="flex items-center gap-3 pt-1 text-xs text-slate-600">
                            <span>
                              <strong>{confirmedPlayers.length}</strong> / {session.maxPlayers} Thành viên
                            </span>
                            <span>·</span>
                            <span>
                              Giá: <strong>{(session.price || 0).toLocaleString()}đ</strong>
                            </span>
                            {session.depositRequired && (
                              <>
                                <span>·</span>
                                <span className="text-emerald-700 font-bold">
                                  Ký quỹ cọc: {(session.depositAmount || 50000).toLocaleString()}đ
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            href={`/chat/${sessId}`}
                            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                          >
                            <MessageSquare className="h-3.5 w-3.5 text-teal-600" />
                            <span>Phòng Chat</span>
                          </Link>

                          <Link
                            href={`/sessions/${sessId}`}
                            className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-600 transition"
                          >
                            <span>Quản lý kèo</span>
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 3: HISTORY */}
          {activeTab === "history" && (
            <div className="space-y-4">
              {historySessions.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-xs">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                    <History className="h-7 w-7" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Chưa có lịch sử buổi chơi hoàn tất
                  </h3>
                  <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
                    Khi các buổi chơi của bạn kết thúc, toàn bộ lịch sử đấu và thống kê sẽ được lưu lại tại đây.
                  </p>
                </div>
              ) : (
                historySessions.map((session) => {
                  const sessId = session._id || session.id;
                  return (
                    <div
                      key={sessId}
                      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 opacity-90 hover:opacity-100 transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                            {session.status === "completed" ? "Đã hoàn thành" : "Đã qua"}
                          </span>
                          <span className="text-xs text-slate-500">
                            {session.datetime ? new Date(session.datetime).toLocaleDateString("vi-VN") : ""}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                          {session.title}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {session.venueName} · {session.district}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/sessions/${sessId}`}
                          className="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                        >
                          Xem lại
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 4: ESCROW PAYMENTS FLOW */}
          {activeTab === "escrow" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-xs text-emerald-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Quy trình bảo chứng Ký Quỹ (CLVL Escrow):</span>
                </div>
                <p className="text-slate-600">
                  Khoản tiền cọc của bạn được lưu an toàn trong hệ thống và chỉ được giải ngân cho Host sau khi trận đấu diễn ra và bạn đã check-in thành công. Nếu trận đấu bị hủy hoặc bạn hủy trước hạn quy định, tiền sẽ tự động hoàn lại.
                </p>
              </div>

              {payments.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-xs">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                    <Wallet className="h-7 w-7" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Chưa có giao dịch ký quỹ nào
                  </h3>
                  <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
                    Khi bạn đặt cọc giữ chỗ qua VietQR, mã tra cứu và trạng thái tiền cọc sẽ hiển thị tại đây.
                  </p>
                </div>
              ) : (
                payments.map((p) => (
                  <div
                    key={p._id || p.orderCode}
                    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-extrabold text-slate-900">
                          #{p.orderCode}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            p.status === "escrow_held"
                              ? "bg-emerald-100 text-emerald-800"
                              : p.status === "completed"
                              ? "bg-teal-100 text-teal-800"
                              : p.status === "refunded"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {p.status === "escrow_held"
                            ? "Đang giữ ký quỹ (An toàn)"
                            : p.status === "completed"
                            ? "Đã giải ngân"
                            : p.status === "refunded"
                            ? "Đã hoàn cọc 100%"
                            : p.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Nội dung: {p.transferContent}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Thời gian: {p.createdAt ? new Date(p.createdAt).toLocaleString("vi-VN") : ""}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="block text-base font-black text-slate-900">
                        {(p.amount || 0).toLocaleString()}đ
                      </span>
                      <span className="text-[11px] text-slate-400">
                        VietQR PayOS
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}

      {/* CheckIn Modal */}
      {selectedSessionForCheckIn && (
        <CheckInModal
          isOpen={Boolean(selectedSessionForCheckIn)}
          onClose={() => setSelectedSessionForCheckIn(null)}
          sessionTitle={selectedSessionForCheckIn.title}
          venueName={selectedSessionForCheckIn.venueName}
          onCheckIn={handleCheckIn}
        />
      )}

      {/* Deposit Receipt Modal */}
      {selectedSessionForReceipt && (
        <DepositReceiptModal
          isOpen={Boolean(selectedSessionForReceipt)}
          onClose={() => setSelectedSessionForReceipt(null)}
          session={selectedSessionForReceipt.session}
          player={selectedSessionForReceipt.player}
        />
      )}
    </div>
  );
}
