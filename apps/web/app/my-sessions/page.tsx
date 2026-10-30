"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Clock,
  MapPin,
  Users,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  MessageSquare,
  ArrowRight,
  Wallet,
  ChevronRight,
  Plus,
  Crown,
  History,
  CalendarCheck2,
  Copy,
  Check,
  Receipt,
  Edit3,
} from "lucide-react";
import { api, paymentsApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { SkillBadge } from "@/components/ui/SkillBadge";
import { CheckInModal } from "@/components/modals/CheckInModal";
import { DepositReceiptModal } from "@/components/modals/DepositReceiptModal";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";
import {
  DEFAULT_BADMINTON_COVER,
  resolveCoverImage,
} from "@/lib/badminton-covers";
import { toast } from "@/stores/toast-store";

type TabType = "upcoming" | "hosted" | "history" | "escrow";

export default function MySessionsPage() {
  const [mounted, setMounted] = useState(false);
  const user = useAuthStore((s) => s.user);
  const isReady = useAuthStore((s) => s.isReady);
  const queryClient = useQueryClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  const [activeTab, setActiveTab] = useState<TabType>("upcoming");
  const [copiedSessionId, setCopiedSessionId] = useState<string | null>(null);

  // Modals state
  const [selectedSessionForCheckIn, setSelectedSessionForCheckIn] =
    useState<any | null>(null);
  const [selectedSessionForReceipt, setSelectedSessionForReceipt] =
    useState<any | null>(null);

  const userId = user?.id || (user as any)?._id;

  // Fetch participant sessions
  const sessionsQuery = useQuery({
    queryKey: ["my-sessions", userId],
    queryFn: async () => {
      if (!userId) return [];
      try {
        const res = await api.get("/sessions", {
          params: { participant: userId },
        });
        const list = res.data?.data?.sessions;
        if (Array.isArray(list)) return list;
      } catch (err) {
        console.warn("Could not fetch my sessions:", err);
      }
      return [];
    },
    enabled: Boolean(userId),
  });

  // Fetch payments list
  const paymentsQuery = useQuery({
    queryKey: ["my-payments", userId],
    queryFn: async () => {
      if (!userId) return [];
      try {
        const res = await paymentsApi.getMyPayments();
        return res.data?.data?.payments || [];
      } catch {
        return [];
      }
    },
    enabled: Boolean(userId),
  });

  const allSessions = (sessionsQuery.data || []) as any[];
  const payments = (paymentsQuery.data || []) as any[];

  const now = Date.now();

  const isPast = (s: any) => {
    const matchStart = new Date(s.datetime).getTime();
    if (isNaN(matchStart)) return false;
    const matchEnd = matchStart + (s.duration || 120) * 60 * 1000;
    return (
      now > matchEnd || s.status === "completed" || s.status === "cancelled"
    );
  };

  const upcomingSessions = allSessions.filter((s) => !isPast(s));
  const historySessions = allSessions.filter((s) => isPast(s));
  const hostedSessions = allSessions.filter((s) => {
    const hostId = s.host?._id || s.host?.id || s.host;
    return String(hostId) === String(userId);
  });

  const handleCheckIn = async (code: string) => {
    if (!selectedSessionForCheckIn) return;
    const sessId =
      selectedSessionForCheckIn._id || selectedSessionForCheckIn.id;
    await paymentsApi.checkIn(sessId, code);
    toast.success(
      "Điểm danh thành công!",
      "Bạn đã check-in thành công tại sân.",
    );
    queryClient.invalidateQueries({ queryKey: ["my-sessions"] });
  };

  const handleCopyCode = (sessId: string, code: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedSessionId(sessId);
    toast.success("Đã sao chép mã điểm danh!");
    setTimeout(() => setCopiedSessionId(null), 2000);
  };

  if (!mounted) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 py-4 animate-pulse">
        <div className="h-16 rounded-2xl bg-slate-200/70" />
        <div className="h-11 rounded-2xl bg-slate-200/60" />
        <div className="space-y-3">
          <div className="h-28 rounded-2xl bg-slate-100" />
          <div className="h-28 rounded-2xl bg-slate-100" />
        </div>
      </div>
    );
  }

  // Unauthenticated state
  if (!user && isReady) {
    return (
      <div className="mx-auto max-w-md py-10 text-center">
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CalendarCheck2 className="h-7 w-7 stroke-[2.2]" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
            Quản Lý Kèo Đấu Của Bạn
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
            Đăng nhập để xem lịch lên sân sắp tới, lấy mã điểm danh check-in,
            vào phòng chat và theo dõi tiền cọc ký quỹ.
          </p>

          <div className="mt-5 space-y-2.5">
            <GoogleLoginButton />
            <Link
              href="/login"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
            >
              <span>Đăng nhập / Tạo tài khoản nhanh</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4 text-left space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>Lưu lịch đánh & điểm danh 1 chạm tại sân</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>Bảo chứng tiền cọc VietQR & hoàn tiền minh bạch</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatSessionDateTime = (datetimeStr?: string) => {
    if (!datetimeStr) return { dateBadge: "Chưa định", time: "--:--", isToday: false };
    const d = new Date(datetimeStr);
    if (isNaN(d.getTime())) {
      return { dateBadge: datetimeStr, time: "", isToday: false };
    }
    const isToday = d.toDateString() === new Date().toDateString();
    const time = d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const dateBadge = isToday
      ? "Hôm nay"
      : d.toLocaleDateString("vi-VN", {
          weekday: "short",
          day: "2-digit",
          month: "2-digit",
        });
    return { dateBadge, time, isToday };
  };

  return (
    <div className="mx-auto max-w-4xl space-y-4 pb-20">
      {/* 1. Compact Professional Header */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:flex-row sm:items-center sm:justify-between sm:rounded-3xl sm:p-4 shadow-xs">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
              <CalendarCheck2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black tracking-tight text-slate-900 sm:text-xl">
                  Kèo Của Tôi
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10.5px] font-bold text-amber-800 border border-amber-200/80">
                  ⭐ {user?.reputation ?? 100} uy tín
                </span>
              </div>
              <p className="text-[11px] text-slate-500 sm:text-xs">
                Quản lý lịch lên sân, mã điểm danh và ký quỹ VietQR
              </p>
            </div>
          </div>

          <Link
            href="/sessions/create"
            className="inline-flex sm:hidden items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 active:scale-95 shrink-0"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Tạo kèo</span>
          </Link>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <Link
            href="/sessions/create"
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 active:scale-95"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Tạo kèo mới</span>
          </Link>
        </div>
      </div>

      {/* 2. Clean 4-Column Segmented Tab Bar (Fits 100% on Mobile without Horizontal Scroll) */}
      <div className="grid grid-cols-4 gap-1 rounded-2xl border border-slate-200/80 bg-slate-100/90 p-1">
        {(
          [
            {
              id: "upcoming",
              label: "Sắp tới",
              count: upcomingSessions.length,
              icon: Clock,
            },
            {
              id: "hosted",
              label: "Tôi tạo",
              count: hostedSessions.length,
              icon: Crown,
            },
            {
              id: "history",
              label: "Lịch sử",
              count: historySessions.length,
              icon: History,
            },
            {
              id: "escrow",
              label: "Ký quỹ",
              count: payments.length,
              icon: Wallet,
            },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 rounded-xl py-2 px-1.5 text-center transition-all ${
                isActive
                  ? "bg-white text-emerald-950 shadow-xs ring-1 ring-slate-200/80 font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50 font-medium"
              }`}
            >
              <div className="flex items-center gap-1">
                <Icon
                  className={`h-3.5 w-3.5 shrink-0 ${
                    isActive ? "text-emerald-600" : "text-slate-400"
                  }`}
                />
                <span className="text-[11px] sm:text-xs leading-tight">
                  {tab.label}
                </span>
              </div>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-extrabold leading-tight ${
                  isActive
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-200/80 text-slate-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Tab Contents */}
      {sessionsQuery.isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs animate-pulse"
            />
          ))}
        </div>
      ) : (
        <>
          {/* TAB 1: UPCOMING */}
          {activeTab === "upcoming" && (
            <div className="space-y-3">
              {upcomingSessions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-xs">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <CalendarCheck2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 sm:text-base">
                    Chưa có lịch lên sân nào sắp tới
                  </h3>
                  <p className="mx-auto mt-1 max-w-xs text-xs text-slate-500">
                    Khám phá các kèo cầu lông quanh khu vực của bạn hoặc tự tạo
                    kèo mới ngay.
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <Link
                      href="/"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700"
                    >
                      <span>Tìm kèo ngay</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                upcomingSessions.map((session) => {
                  const sessId = session._id || session.id;
                  const isHost =
                    String(
                      session.host?._id || session.host?.id || session.host,
                    ) === String(userId);

                  const playerEntry = session.players?.find(
                    (p: any) =>
                      String(p.user?._id || p.user?.id || p.user) ===
                      String(userId),
                  );

                  const paymentStatus =
                    playerEntry?.paymentStatus || (isHost ? "paid" : "unpaid");
                  const attendanceStatus =
                    playerEntry?.attendanceStatus || "registered";
                  const playerStatus =
                    playerEntry?.status || (isHost ? "host" : "joined");

                  const { dateBadge, time, isToday } = formatSessionDateTime(
                    session.datetime,
                  );
                  const coverSrc = resolveCoverImage(
                    session.coverImage || session.imageUrl,
                  );
                  const currentCount =
                    session.currentPlayersCount ??
                    session.currentPlayers ??
                    session.players?.filter(
                      (p: any) => p.status === "joined" || p.status === "host",
                    ).length ??
                    1;
                  const maxCount = session.maxPlayers || 8;
                  const skills =
                    session.skillRequirements ?? session.skillRequirement ?? "TB";

                  return (
                    <div
                      key={sessId}
                      className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs transition hover:border-emerald-300 hover:shadow-sm"
                    >
                      {/* Main Row */}
                      <div className="flex gap-3 p-3 sm:p-3.5">
                        {/* Left Thumbnail */}
                        <Link
                          href={`/sessions/${sessId}`}
                          className="relative h-20 w-20 sm:h-24 sm:w-28 shrink-0 overflow-hidden rounded-xl bg-slate-900"
                        >
                          <img
                            src={coverSrc}
                            alt={session.title}
                            onError={(e) => {
                              e.currentTarget.src = DEFAULT_BADMINTON_COVER;
                            }}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/25" />
                          <div className="absolute bottom-1.5 inset-x-1 text-center">
                            <span className="inline-block rounded bg-black/65 px-1.5 py-0.5 text-[9px] font-bold text-white leading-none">
                              {currentCount}/{maxCount} người
                            </span>
                          </div>
                        </Link>

                        {/* Right Info */}
                        <div className="flex flex-1 flex-col justify-between min-w-0">
                          <div>
                            {/* Top Row: Time + Status Badges */}
                            <div className="flex flex-wrap items-center justify-between gap-1.5">
                              <div className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 text-[11px] font-bold text-emerald-900">
                                <Clock className="h-3 w-3 text-emerald-600 shrink-0" />
                                <span>{time}</span>
                                <span className="opacity-40">·</span>
                                <span
                                  className={
                                    isToday ? "text-rose-600 font-extrabold" : ""
                                  }
                                >
                                  {dateBadge}
                                </span>
                              </div>

                              <div className="flex items-center gap-1">
                                {isHost ? (
                                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                                    <Crown className="h-2.5 w-2.5" />
                                    <span>Host</span>
                                  </span>
                                ) : attendanceStatus === "attended" ? (
                                  <span className="inline-flex items-center gap-1 rounded-md bg-teal-50 border border-teal-200 px-2 py-0.5 text-[10px] font-bold text-teal-800">
                                    <CheckCircle2 className="h-2.5 w-2.5" />
                                    <span>Đã check-in</span>
                                  </span>
                                ) : paymentStatus === "escrow_held" ||
                                  paymentStatus === "paid" ? (
                                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                    <ShieldCheck className="h-2.5 w-2.5" />
                                    <span>Đã giữ chỗ</span>
                                  </span>
                                ) : playerStatus === "pending" ? (
                                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                                    <span>⏳ Chờ cọc</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                    <span>Đã đăng ký</span>
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Venue & Title */}
                            <Link
                              href={`/sessions/${sessId}`}
                              className="mt-1 block truncate text-xs sm:text-sm font-bold text-slate-900 hover:text-emerald-700 transition"
                            >
                              {session.venueName}
                            </Link>
                            <p className="flex items-center gap-1 text-[11px] text-slate-500 truncate">
                              <MapPin className="h-3 w-3 text-emerald-600 shrink-0" />
                              <span className="font-medium text-slate-600">
                                {session.district || session.city || "TP.HCM"}
                              </span>
                              <span className="text-slate-300">·</span>
                              <span className="truncate text-slate-400">
                                {session.title}
                              </span>
                            </p>
                          </div>

                          {/* Skill & Price */}
                          <div className="mt-1.5 flex items-center justify-between gap-2">
                            <SkillBadge
                              level={skills}
                              className="text-[9.5px] px-1.5 py-0"
                            />
                            <span className="text-xs font-extrabold text-emerald-600">
                              {session.price > 0
                                ? `${session.price.toLocaleString("vi-VN")}đ`
                                : "Chia đều"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Compact Action Footer Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/70 px-3 py-2">
                        {/* Left: Host CheckIn Code or Player Receipt */}
                        <div className="flex items-center gap-2">
                          {isHost && session.checkInCode ? (
                            <button
                              type="button"
                              onClick={() =>
                                handleCopyCode(sessId, session.checkInCode)
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-900 transition hover:bg-amber-100 active:scale-95"
                              title="Sao chép mã điểm danh"
                            >
                              <KeyRound className="h-3 w-3 text-amber-600" />
                              <span>Mã sân:</span>
                              <span className="font-mono font-black tracking-wider">
                                {session.checkInCode}
                              </span>
                              {copiedSessionId === sessId ? (
                                <Check className="h-3 w-3 text-emerald-600" />
                              ) : (
                                <Copy className="h-3 w-3 text-amber-600/80" />
                              )}
                            </button>
                          ) : playerEntry?.paymentStatus === "escrow_held" ? (
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedSessionForReceipt({
                                  session,
                                  player: playerEntry,
                                })
                              }
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 transition"
                            >
                              <Receipt className="h-3 w-3 text-emerald-600" />
                              <span>Biên lai cọc</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium">
                              {isHost ? "Bạn là Chủ kèo" : "Vé tham gia hợp lệ"}
                            </span>
                          )}
                        </div>

                        {/* Right: Primary Actions */}
                        <div className="flex items-center gap-1.5">
                          {!isHost && attendanceStatus !== "attended" && (
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedSessionForCheckIn(session)
                              }
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-bold text-white shadow-2xs transition hover:bg-emerald-700 active:scale-95"
                            >
                              <KeyRound className="h-3 w-3" />
                              <span>Check-in</span>
                            </button>
                          )}

                          <Link
                            href={`/chat/${sessId}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"
                          >
                            <MessageSquare className="h-3 w-3 text-teal-600" />
                            <span>Chat</span>
                          </Link>

                          <Link
                            href={`/sessions/${sessId}`}
                            className="inline-flex items-center gap-0.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-800 transition hover:bg-slate-100"
                          >
                            <span>Chi tiết</span>
                            <ChevronRight className="h-3 w-3 text-slate-400" />
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
            <div className="space-y-3">
              {hostedSessions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-xs">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                    <Crown className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 sm:text-base">
                    Bạn chưa tạo kèo cầu lông nào
                  </h3>
                  <p className="mx-auto mt-1 max-w-xs text-xs text-slate-500">
                    Đăng kèo giúp bạn tuyển đủ tay vợt đúng trình độ và bảo đảm
                    chống bùng kèo qua VietQR.
                  </p>
                  <div className="mt-4">
                    <Link
                      href="/sessions/create"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Tạo kèo đầu tiên</span>
                    </Link>
                  </div>
                </div>
              ) : (
                hostedSessions.map((session) => {
                  const sessId = session._id || session.id;
                  const currentCount =
                    session.currentPlayersCount ??
                    session.currentPlayers ??
                    (session.players || []).filter(
                      (p: any) => p.status === "joined" || p.status === "host",
                    ).length ??
                    1;
                  const pendingCount = (session.players || []).filter(
                    (p: any) => p.status === "pending",
                  ).length;
                  const maxCount = session.maxPlayers || 8;
                  const { dateBadge, time } = formatSessionDateTime(
                    session.datetime,
                  );
                  const coverSrc = resolveCoverImage(
                    session.coverImage || session.imageUrl,
                  );
                  const sessionPast = isPast(session);

                  return (
                    <div
                      key={sessId}
                      className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs transition hover:border-emerald-300"
                    >
                      <div className="flex gap-3 p-3 sm:p-3.5">
                        {/* Left Thumbnail */}
                        <Link
                          href={`/sessions/${sessId}`}
                          className="relative h-20 w-20 sm:h-24 sm:w-28 shrink-0 overflow-hidden rounded-xl bg-slate-900"
                        >
                          <img
                            src={coverSrc}
                            alt={session.title}
                            onError={(e) => {
                              e.currentTarget.src = DEFAULT_BADMINTON_COVER;
                            }}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20" />
                          <div className="absolute top-1.5 left-1.5">
                            <span className="inline-flex items-center gap-0.5 rounded bg-amber-500/95 px-1.5 py-0.5 text-[9px] font-bold text-white leading-none">
                              <Crown className="h-2.5 w-2.5" />
                              Host
                            </span>
                          </div>
                        </Link>

                        {/* Right Info */}
                        <div className="flex flex-1 flex-col justify-between min-w-0">
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                                <Clock className="h-3 w-3 text-slate-500" />
                                <span>
                                  {time} · {dateBadge}
                                </span>
                              </span>

                              <span
                                className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                  session.status === "cancelled"
                                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                                    : sessionPast
                                      ? "bg-slate-100 text-slate-500"
                                      : currentCount >= maxCount
                                        ? "bg-amber-50 text-amber-800 border border-amber-200"
                                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                }`}
                              >
                                {session.status === "cancelled"
                                  ? "Đã hủy"
                                  : sessionPast
                                    ? "Đã kết thúc"
                                    : currentCount >= maxCount
                                      ? "Đã đủ người"
                                      : "Đang mở"}
                              </span>
                            </div>

                            <Link
                              href={`/sessions/${sessId}`}
                              className="mt-1 block truncate text-xs sm:text-sm font-bold text-slate-900 hover:text-emerald-700 transition"
                            >
                              {session.title}
                            </Link>
                            <p className="text-[11px] text-slate-500 truncate">
                              {session.venueName} · {session.district}
                            </p>
                          </div>

                          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                            <span className="inline-flex items-center gap-1 font-semibold">
                              <Users className="h-3 w-3 text-emerald-600" />
                              <strong>
                                {currentCount}/{maxCount}
                              </strong>{" "}
                              vợt thủ
                            </span>
                            {pendingCount > 0 && (
                              <span className="rounded bg-amber-100 px-1.5 py-0.2 text-[10px] font-bold text-amber-800">
                                +{pendingCount} chờ cọc/duyệt
                              </span>
                            )}
                            <span className="text-slate-300">·</span>
                            <span className="font-bold text-emerald-700">
                              {session.price > 0
                                ? `${session.price.toLocaleString("vi-VN")}đ/ng`
                                : "Chia đều"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Footer Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/70 px-3 py-2">
                        {session.checkInCode ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleCopyCode(sessId, session.checkInCode)
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-900 transition hover:bg-amber-100 active:scale-95"
                          >
                            <KeyRound className="h-3 w-3 text-amber-600" />
                            <span>Mã check-in:</span>
                            <span className="font-mono font-black tracking-wider">
                              {session.checkInCode}
                            </span>
                            {copiedSessionId === sessId ? (
                              <Check className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <Copy className="h-3 w-3 text-amber-600/80" />
                            )}
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            Quản lý buổi chơi
                          </span>
                        )}

                        <div className="flex items-center gap-1.5">
                          {!sessionPast && session.status !== "cancelled" && (
                            <Link
                              href={`/sessions/create?edit=${sessId}`}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 transition hover:bg-slate-100"
                            >
                              <Edit3 className="h-3 w-3 text-slate-500" />
                              <span>Sửa</span>
                            </Link>
                          )}

                          <Link
                            href={`/chat/${sessId}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"
                          >
                            <MessageSquare className="h-3 w-3 text-teal-600" />
                            <span>Chat</span>
                          </Link>

                          <Link
                            href={`/sessions/${sessId}`}
                            className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-emerald-600"
                          >
                            <span>Quản lý</span>
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
            <div className="space-y-2.5">
              {historySessions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-xs">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                    <History className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 sm:text-base">
                    Chưa có lịch sử trận đấu
                  </h3>
                  <p className="mx-auto mt-1 max-w-xs text-xs text-slate-500">
                    Các buổi giao lưu đã hoàn thành sẽ được lưu trữ tại đây.
                  </p>
                </div>
              ) : (
                historySessions.map((session) => {
                  const sessId = session._id || session.id;
                  const coverSrc = resolveCoverImage(
                    session.coverImage || session.imageUrl,
                  );
                  return (
                    <Link
                      key={sessId}
                      href={`/sessions/${sessId}`}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xs transition hover:border-emerald-300"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={coverSrc}
                          alt={session.title}
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_BADMINTON_COVER;
                          }}
                          className="h-14 w-14 shrink-0 rounded-xl object-cover grayscale-[25%]"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`rounded px-1.5 py-0.5 text-[9.5px] font-bold ${
                                session.status === "cancelled"
                                  ? "bg-rose-50 text-rose-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {session.status === "cancelled"
                                ? "Đã hủy"
                                : "Đã hoàn thành"}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {session.datetime
                                ? new Date(session.datetime).toLocaleDateString(
                                    "vi-VN",
                                  )
                                : ""}
                            </span>
                          </div>
                          <h4 className="mt-0.5 truncate text-xs sm:text-sm font-bold text-slate-900">
                            {session.title}
                          </h4>
                          <p className="truncate text-[11px] text-slate-500">
                            {session.venueName} · {session.district}
                          </p>
                        </div>
                      </div>

                      <span className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700">
                        <span>Xem</span>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                      </span>
                    </Link>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 4: ESCROW PAYMENTS FLOW */}
          {activeTab === "escrow" && (
            <div className="space-y-3">
              <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-3 text-xs text-slate-700">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="text-emerald-950">
                    Bảo chứng Ký Quỹ VietQR:
                  </strong>{" "}
                  Tiền cọc được hệ thống giữ an toàn và chỉ giải ngân cho Host
                  sau khi trận đấu hoàn tất. Tự động hoàn cọc 100% nếu hủy đúng
                  hạn.
                </p>
              </div>

              {payments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-xs">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                    <Wallet className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 sm:text-base">
                    Chưa có giao dịch ký quỹ nào
                  </h3>
                  <p className="mx-auto mt-1 max-w-xs text-xs text-slate-500">
                    Lịch sử đặt cọc giữ chỗ và hoàn tiền tự động sẽ hiển thị tại
                    đây.
                  </p>
                </div>
              ) : (
                payments.map((p) => {
                  const linkedSession =
                    typeof p.session === "object" ? p.session : null;
                  const linkedSessionId =
                    linkedSession?._id || linkedSession?.id;

                  return (
                    <div
                      key={p._id || p.orderCode}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-xs"
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-mono text-xs font-black text-slate-900">
                            #{p.orderCode}
                          </span>
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                              p.status === "escrow_held"
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : p.status === "completed" ||
                                    p.status === "released"
                                  ? "bg-teal-50 text-teal-800 border border-teal-200"
                                  : p.status === "refunded"
                                    ? "bg-sky-50 text-sky-800 border border-sky-200"
                                    : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {p.status === "escrow_held"
                              ? "Đang giữ ký quỹ"
                              : p.status === "completed" ||
                                  p.status === "released"
                                ? "Đã giải ngân"
                                : p.status === "refunded"
                                  ? "Đã hoàn cọc 100%"
                                  : "Chờ thanh toán"}
                          </span>
                        </div>

                        {linkedSession ? (
                          <Link
                            href={`/sessions/${linkedSessionId}`}
                            className="block truncate text-xs font-bold text-slate-800 hover:text-emerald-700"
                          >
                            {linkedSession.venueName || linkedSession.title}
                          </Link>
                        ) : (
                          <p className="truncate text-xs text-slate-600">
                            Nội dung: {p.transferContent}
                          </p>
                        )}

                        <p className="text-[10.5px] text-slate-400">
                          {p.createdAt
                            ? new Date(p.createdAt).toLocaleString("vi-VN")
                            : ""}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="block text-sm sm:text-base font-black text-emerald-700">
                          {(p.amount || 0).toLocaleString("vi-VN")}đ
                        </span>
                        <span className="text-[10px] font-medium text-slate-400">
                          VietQR Escrow
                        </span>
                      </div>
                    </div>
                  );
                })
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
