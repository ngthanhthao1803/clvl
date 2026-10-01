"use client";

import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  KeyRound,
  MapPin,
  MessageSquare,
  ShieldAlert,
  ShieldCheck,
  UserX,
  Wallet,
  Navigation,
  Bookmark,
  Share2,
  ArrowLeft,
  Calendar,
  Sparkles,
  Users,
  ChevronRight,
  Info,
  Check,
  Edit3,
  ExternalLink,
} from "lucide-react";
import { api, paymentsApi, sessionsApi } from "@/lib/api";
import { MapWrapper } from "@/components/map/MapWrapper";
import { SkillBadge } from "@/components/ui/SkillBadge";
import { resolveCoverImage } from "@/lib/badminton-covers";
import { useSavedSessionsStore } from "@/stores/saved-sessions-store";
import { shareSession } from "@/lib/share";
import { toast } from "@/stores/toast-store";
import { useAuthStore } from "@/stores/auth-store";
import { PaymentQRModal } from "@/components/modals/PaymentQRModal";
import { CheckInModal } from "@/components/modals/CheckInModal";
import { DisputeModal } from "@/components/modals/DisputeModal";
import { DepositReceiptModal } from "@/components/modals/DepositReceiptModal";
import { PayoutConfirmModal } from "@/components/modals/PayoutConfirmModal";

function formatMatchType(type?: string): string {
  if (!type) return "Giao lưu";
  const lower = type.toLowerCase().replace(/[-_]/g, " ");
  if (lower.includes("mixed")) return "Đôi Nam Nữ";
  if (lower.includes("doubles") || lower.includes("đôi")) return "Đôi Nam/Nữ";
  if (lower.includes("singles") || lower.includes("đơn")) return "Đơn Nam/Nữ";
  return type;
}

export default function SessionDetailsPage() {
  const params = useParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [notice, setNotice] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Modals state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentOrderData, setPaymentOrderData] = useState<any>(null);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);

  const sessionQuery = useQuery({
    queryKey: ["session", params.id],
    queryFn: async () => {
      const response = await api.get(`/sessions/${params.id}`);
      return response.data.data.session;
    },
  });

  const session = sessionQuery.data;
  const sessionId = params.id || session?.id || session?._id || "";

  // Saved Session store hook
  const isSaved = useSavedSessionsStore((s) => s.isSaved(sessionId));
  const toggleSave = useSavedSessionsStore((s) => s.toggleSave);

  const handleToggleSave = () => {
    if (!session) return;
    const saved = toggleSave(session);
    if (saved) {
      toast.success(
        "Đã lưu kèo vào danh sách!",
        "Bạn có thể vào tab 'Đã lưu' để xem lại bất cứ lúc nào.",
      );
    } else {
      toast.info("Đã bỏ lưu kèo");
    }
  };

  const handleShare = async () => {
    if (!session) return;
    await shareSession({
      id: sessionId,
      title: session.title,
      venueName: session.venueName,
      datetime: session.datetime,
      price: session.price,
    });
  };

  const hostId = session?.host?._id ?? session?.host?.id ?? session?.host;
  const canEdit = Boolean(user?.id && hostId && user.id === hostId);

  const myPlayer = (session?.players || []).find(
    (p: any) => (p.user?._id ?? p.user?.id ?? p.user) === user?.id,
  );

  // Mutations
  const joinMutation = useMutation({
    mutationFn: async () => sessionsApi.joinSession(params.id ?? ""),
    onSuccess: () => {
      sessionQuery.refetch();
      setNotice({ type: "success", text: "Đã đăng ký tham gia buổi chơi thành công!" });
    },
    onError: (err: any) => {
      setNotice({
        type: "error",
        text: err.response?.data?.message || "Không thể tham gia buổi chơi",
      });
    },
  });

  const respondMutation = useMutation({
    mutationFn: async ({
      userId,
      approve,
    }: {
      userId: string;
      approve: boolean;
    }) => sessionsApi.respondJoinRequest(params.id ?? "", userId, approve),
    onSuccess: () => {
      sessionQuery.refetch();
    },
  });

  const createDepositMutation = useMutation({
    mutationFn: async () => {
      const res = await paymentsApi.createDepositOrder(params.id ?? "");
      return res.data.data;
    },
    onSuccess: (data) => {
      if (data?.isFree) {
        sessionQuery.refetch();
        setNotice({
          type: "success",
          text: "Xác nhận thành công! Bạn là Nữ và được miễn phí vé tham gia buổi chơi này.",
        });
        return;
      }
      setPaymentOrderData(data);
      setIsPaymentModalOpen(true);
    },
    onError: (err: any) => {
      setNotice({
        type: "error",
        text: err.response?.data?.message || "Không thể tạo mã thanh toán",
      });
    },
  });

  const cancelBookingMutation = useMutation({
    mutationFn: async () => {
      const confirmMsg = session?.depositRequired
        ? `Chính sách hủy: Nếu hủy trước ${session.cancelPolicyHours || 12}h, bạn được HOÀN CỌC 100%. Nếu hủy sát giờ, tiền cọc sẽ bồi thường cho Host và bạn bị trừ 15 điểm uy tín. Bạn có chắc chắn muốn hủy?`
        : "Bạn có chắc chắn muốn hủy đăng ký tham gia buổi chơi này không?";
      const confirmed = window.confirm(confirmMsg);
      if (!confirmed) return;
      return paymentsApi.cancelBooking(params.id ?? "");
    },
    onSuccess: (res: any) => {
      sessionQuery.refetch();
      const data = res?.data?.data;
      if (!session?.depositRequired && !data?.hadDeposit) {
        setNotice({
          type: "success",
          text: "Đã hủy đăng ký tham gia buổi chơi.",
        });
      } else if (data?.isFullRefund) {
        setNotice({
          type: "success",
          text: `Đã hủy slot và HOÀN CỌC 100% (${(data.refundAmount || session?.depositAmount || 0).toLocaleString()}đ).`,
        });
      } else {
        setNotice({
          type: "info",
          text: "Đã hủy slot. Vì hủy sát giờ, tiền cọc được đền bù cho Host và bạn bị trừ 15 điểm uy tín.",
        });
      }
    },
    onError: (err: any) => {
      setNotice({
        type: "error",
        text: err.response?.data?.message || "Không thể hủy tham gia",
      });
    },
  });

  const releasePayoutMutation = useMutation({
    mutationFn: async () => paymentsApi.releasePayout(params.id ?? ""),
    onSuccess: (res) => {
      sessionQuery.refetch();
      setNotice({
        type: "success",
        text: res.data?.message || "Giải ngân tiền cọc thành công vào tài khoản!",
      });
    },
    onError: (err: any) => {
      setNotice({
        type: "error",
        text: err.response?.data?.message || "Không thể giải ngân lúc này",
      });
    },
  });

  const markNoShowMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      const confirmed = window.confirm(
        "Xác nhận báo cáo người chơi này bùng kèo (No-show)? Người này sẽ mất tiền cọc và bị trừ 25 điểm uy tín.",
      );
      if (!confirmed) return;
      return paymentsApi.markNoShow(params.id ?? "", targetUserId);
    },
    onSuccess: () => {
      sessionQuery.refetch();
      setNotice({
        type: "success",
        text: "Đã đánh dấu bùng kèo (No-show) thành công.",
      });
    },
    onError: (err: any) => {
      setNotice({
        type: "error",
        text: err.response?.data?.message || "Có lỗi xảy ra",
      });
    },
  });

  if (sessionQuery.isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        <p className="text-xs font-semibold text-slate-500">
          Đang tải thông tin buổi chơi...
        </p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-center p-6">
        <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl">
          🏸
        </div>
        <h2 className="text-lg font-black text-slate-900">
          Không tìm thấy buổi chơi
        </h2>
        <p className="text-xs text-slate-500 max-w-sm">
          Buổi chơi này có thể đã bị xóa hoặc đường dẫn không chính xác.
        </p>
        <Link
          href="/explore"
          className="mt-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-600 transition"
        >
          Khám phá kèo khác
        </Link>
      </div>
    );
  }

  const hasPaidDeposit =
    myPlayer?.paymentStatus === "escrow_held" ||
    myPlayer?.paymentStatus === "paid";
  const hasAttended = myPlayer?.attendanceStatus === "attended";
  const isPending = myPlayer?.status === "pending";
  const isJoined =
    myPlayer?.status === "joined" || myPlayer?.status === "host";

  const matchStart = new Date(session.datetime).getTime();
  const matchDuration = (session.duration || 120) * 60 * 1000;
  const matchEnd = matchStart + matchDuration;
  const now = Date.now();
  const isPastSession =
    !isNaN(matchStart) && (now > matchEnd || session.status === "completed");
  const isLiveSession =
    !isNaN(matchStart) && now >= matchStart && now <= matchEnd;
  const isStartingSoon =
    !isNaN(matchStart) &&
    matchStart - now > 0 &&
    matchStart - now <= 2 * 60 * 60 * 1000;

  const currentCount =
    session.currentPlayersCount ??
    session.currentPlayers ??
    session.players?.filter(
      (p: any) => p.status === "joined" || p.status === "host",
    ).length ??
    1;
  const maxCount = session.maxPlayers || 8;
  const slotsLeft = Math.max(0, maxCount - currentCount);
  const isFull = slotsLeft <= 0;

  const skillLevel =
    session.skillRequirements ?? session.skillRequirement ?? "TB";

  const d = new Date(session.datetime);
  const isValidDate = !isNaN(d.getTime());
  const timeFormatted = isValidDate
    ? d.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : "--:--";

  const dateFormatted = isValidDate
    ? d.toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : String(session.datetime || "Chưa định ngày");

  const coverImage = resolveCoverImage(
    session.coverImage || session.imageUrl,
    sessionId || session.title,
  );

  const host = typeof session.host === "object" ? session.host : null;
  const hostName = host?.name || "CLVL Host";
  const hostReputation = Number(host?.reputation ?? 100);
  const isVerifiedHost = Boolean(host?.isVerifiedHost);

  const copyCheckInCode = () => {
    if (session.checkInCode) {
      navigator.clipboard.writeText(session.checkInCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
      toast.success("Đã sao chép mã check-in!");
    }
  };

  const handleChatClick = () => {
    if (myPlayer) {
      router.push(`/chat/${params.id}`);
    } else {
      toast.info("Vui lòng tham gia buổi chơi trước khi vào phòng chat!");
    }
  };

  // Build participants roster with empty slots
  const activePlayers = (session.players || []).filter(
    (p: any) => p.status !== "left" && p.status !== "rejected",
  );
  const emptySlotsCount = Math.max(0, maxCount - activePlayers.length);

  return (
    <div className="space-y-4 pb-24 animate-fadeUp max-w-6xl mx-auto">
      {/* 1. Header Bar: Breadcrumb + Action Controls */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Tất cả kèo đấu</span>
        </Link>

        <div className="flex items-center gap-1.5">
          {/* Share */}
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition active:scale-95 shadow-xs"
            title="Chia sẻ kèo đấu"
          >
            <Share2 className="h-3.5 w-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Chia sẻ</span>
          </button>

          {/* Bookmark */}
          <button
            type="button"
            onClick={handleToggleSave}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition active:scale-95 shadow-xs ${
              isSaved
                ? "bg-amber-50 text-amber-800 border-amber-300"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
            title={isSaved ? "Bỏ lưu kèo" : "Lưu kèo xem sau"}
          >
            <Bookmark
              className={`h-3.5 w-3.5 ${
                isSaved ? "fill-amber-500 text-amber-500" : "text-slate-400"
              }`}
            />
            <span>{isSaved ? "Đã lưu" : "Lưu"}</span>
          </button>

          {/* Chat Link */}
          <button
            type="button"
            onClick={handleChatClick}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 transition active:scale-95 shadow-xs"
          >
            <MessageSquare className="h-3.5 w-3.5 text-teal-600" />
            <span className="hidden sm:inline">Chat</span>
          </button>

          {/* Host Edit Link */}
          {canEdit && (
            <Link
              href={`/sessions/create?edit=${sessionId}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition shadow-xs"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Sửa</span>
            </Link>
          )}
        </div>
      </div>

      {/* 2. Status Alert Bar (Only when notable status) */}
      {isLiveSession && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-300 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-800 animate-pulse">
          <span className="flex h-2 w-2 rounded-full bg-rose-600 animate-ping" />
          <span>Buổi chơi đang diễn ra tại sân!</span>
        </div>
      )}

      {isPastSession && (
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2 text-xs text-slate-600">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          <span>Buổi chơi này đã kết thúc. Bạn đang xem thông tin lưu trữ.</span>
        </div>
      )}

      {notice && (
        <div
          className={`rounded-xl border px-3.5 py-2 text-xs font-bold flex items-center justify-between ${
            notice.type === "success"
              ? "border-emerald-300 bg-emerald-50 text-emerald-900"
              : notice.type === "error"
                ? "border-rose-300 bg-rose-50 text-rose-900"
                : "border-amber-300 bg-amber-50 text-amber-900"
          }`}
        >
          <span>{notice.text}</span>
          <button onClick={() => setNotice(null)} className="text-slate-400 hover:text-slate-700">
            ✕
          </button>
        </div>
      )}

      {/* 3. Hero Visual Container (Modern 16:9 Banner) */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200/90 bg-white shadow-xs">
        <div className="relative h-48 sm:h-64 w-full overflow-hidden bg-slate-900">
          <img
            src={coverImage}
            alt={session.title}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-black/20" />

          {/* Badges on Image */}
          <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
            <span className="rounded-lg bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white border border-white/20">
              {formatMatchType(session.matchType)}
            </span>
            <SkillBadge level={skillLevel} className="text-[11px] px-2.5 py-0.5" />
            {session.depositRequired ? (
              <span className="inline-flex items-center gap-1 rounded-lg bg-teal-600/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-white shadow-xs">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Bảo chứng Escrow</span>
              </span>
            ) : (
              <span className="rounded-lg bg-black/50 backdrop-blur-md px-2.5 py-1 text-[11px] font-medium text-slate-200 border border-white/10">
                Không cần cọc
              </span>
            )}
          </div>

          {/* Bottom Title on Image */}
          <div className="absolute bottom-3 inset-x-3 sm:inset-x-5 text-white">
            <h1 className="text-lg sm:text-2xl font-black tracking-tight leading-snug drop-shadow-sm">
              {session.title}
            </h1>
            <p className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-200 mt-1 font-medium drop-shadow-xs">
              <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>{session.venueName}</span>
              {session.courtNumber && (
                <span className="text-emerald-300 font-bold">(Sân {session.courtNumber})</span>
              )}
              <span className="text-slate-400">·</span>
              <span>{session.district ? `${session.district}` : session.city || "TP.HCM"}</span>
            </p>
          </div>
        </div>

        {/* Quick Time & Host Strip below Image */}
        <div className="p-3.5 sm:p-4 bg-slate-50/70 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-black text-xs shrink-0 border border-emerald-200">
              {(hostName?.[0] || "H").toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900">{hostName}</span>
                {isVerifiedHost && (
                  <span className="text-emerald-600 font-bold text-[10.5px] flex items-center gap-0.5">
                    <ShieldCheck className="h-3 w-3" /> Uy tín
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">Host buổi chơi • ⭐ {hostReputation} điểm uy tín</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-xs">
            <Clock className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="font-bold text-slate-900">{timeFormatted}</span>
            <span className="text-slate-400">·</span>
            <span className="capitalize">{dateFormatted}</span>
          </div>
        </div>
      </div>

      {/* 4. Main 2-Column Grid (Left: Details & Roster | Right: Sticky Booking) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (7 cols): Information, Roster, Map */}
        <div className="lg:col-span-7 space-y-4">
          {/* Visual Players Roster Grid */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-emerald-600" />
                  Danh Sách Người Chơi ({currentCount}/{maxCount})
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {slotsLeft > 0 ? `Còn ${slotsLeft} chỗ trống` : "Đã đủ người tham gia"}
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold">
                <span className="text-emerald-600">{currentCount}</span>
                <span className="text-slate-400">/</span>
                <span className="text-slate-600">{maxCount}</span>
              </div>
            </div>

            {/* Players List */}
            <div className="divide-y divide-slate-100 mt-1">
              {activePlayers.map((p: any) => {
                const isHost = p.status === "host";
                const isMe = (p.user?._id ?? p.user?.id ?? p.user) === user?.id;
                const playerId = p.user?._id ?? p.user?.id ?? p.user;

                return (
                  <div
                    key={playerId}
                    className="flex items-center justify-between gap-3 py-2.5 hover:bg-slate-50/70 rounded-xl px-2 transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold text-xs shrink-0 border border-slate-200">
                        {(p.user?.name?.[0] || "P").toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-900 truncate">
                            {p.user?.name ?? "Người chơi"}
                          </span>
                          {p.user?.gender === "female" && (
                            <span className="text-[11px] text-rose-500 font-bold" title="Nữ">♀</span>
                          )}
                          {p.user?.gender === "male" && (
                            <span className="text-[11px] text-blue-500 font-bold" title="Nam">♂</span>
                          )}
                          {isHost && (
                            <span className="rounded-md bg-slate-900 px-1.5 py-0.2 text-[9px] font-black text-white">
                              HOST
                            </span>
                          )}
                          {isMe && (
                            <span className="rounded-md bg-emerald-100 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800">
                              BẠN
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[10.5px] text-slate-500">
                          <SkillBadge level={p.user?.skillLevel || "TB"} className="text-[9px] px-1 py-0" />
                          <span>· ⭐ {p.user?.reputation ?? 100}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Deposit tag */}
                      <span
                        className={`rounded-md px-2 py-0.5 text-[9.5px] font-bold ${
                          p.paymentStatus === "escrow_held" || p.paymentStatus === "paid"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : p.paymentStatus === "forfeited"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {p.paymentStatus === "escrow_held" || p.paymentStatus === "paid"
                          ? "✓ Đã cọc"
                          : p.paymentStatus === "forfeited"
                            ? "Mất cọc"
                            : "Tại sân"}
                      </span>

                      {/* Attendance tag */}
                      <span
                        className={`rounded-md px-2 py-0.5 text-[9.5px] font-bold ${
                          p.attendanceStatus === "attended"
                            ? "bg-teal-50 text-teal-700 border border-teal-200"
                            : p.attendanceStatus === "no_show"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {p.attendanceStatus === "attended" ? "✓ Có mặt" : "Chờ đến"}
                      </span>

                      {/* Host action */}
                      {canEdit && !isHost && p.attendanceStatus !== "no_show" && (
                        <button
                          onClick={() => markNoShowMutation.mutate(playerId)}
                          className="rounded-lg border border-rose-200 bg-white px-2 py-0.5 text-[10px] font-bold text-rose-600 hover:bg-rose-50"
                          title="Báo vắng không đến"
                        >
                          Báo vắng
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Empty Slots Indicator */}
              {Array.from({ length: emptySlotsCount }).map((_, idx) => (
                <div
                  key={`empty-${idx}`}
                  className="flex items-center justify-between gap-3 py-2.5 px-2 text-slate-400 border-dashed"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-xs font-bold text-slate-400">
                      {activePlayers.length + idx + 1}
                    </div>
                    <span className="text-xs font-medium text-slate-400 italic">
                      Slot trống (Đang mở)
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    Sẵn sàng nhận
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Escrow Guarantee Card */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                  Chính Sách Chống Bùng Kèo (CLVL Escrow)
                </h3>
                {session.depositRequired ? (
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Yêu cầu cọc <strong>{(session.depositAmount || 50000).toLocaleString()}đ</strong>. 
                    Hủy trước <strong>{session.cancelPolicyHours || 12}h</strong> được hoàn cọc 100%. 
                    Hủy sát giờ bồi thường cho Host. Nếu gặp kèo ảo, hệ thống hoàn tiền 100%.
                  </p>
                ) : (
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Kèo không yêu cầu cọc. Thanh toán tiền sân trực tiếp cho Host. 
                    Nếu bận, vui lòng hủy trước {session.cancelPolicyHours || 12}h để nhường chỗ cho bạn khác.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Map & Address */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                  Địa Chỉ Sân Đấu
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  {session.venue?.address || session.address || `${session.district || ""}, ${session.city || "TP.HCM"}`}
                </p>
              </div>

              <a
                href={
                  session.googleMapsUrl ||
                  session.venue?.googleMapsUrl ||
                  (session.latitude && session.longitude
                    ? `https://www.google.com/maps/dir/?api=1&destination=${session.latitude},${session.longitude}`
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        session.venueName + " " + (session.district || ""),
                      )}`)
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-600 transition shrink-0"
              >
                <Navigation className="h-3.5 w-3.5 text-emerald-400" />
                <span>Google Maps</span>
              </a>
            </div>

            <div className="relative z-0 isolate mt-3 overflow-hidden rounded-xl border border-slate-200">
              <MapWrapper
                venues={[
                  {
                    id: session.id ?? session._id ?? "session",
                    sessionId: session.id ?? session._id ?? "session",
                    name: session.venueName,
                    address: session.venue?.address || `${session.district || ""}, ${session.city || ""}`,
                    district: session.district,
                    city: session.city,
                    latitude: Number(session.latitude || session.venue?.latitude || 10.896255),
                    longitude: Number(session.longitude || session.venue?.longitude || 106.5840769),
                    price: session.price,
                    sessionTitle: session.title,
                    slotsLeft,
                    maxPlayers: session.maxPlayers || 8,
                    datetime: session.datetime,
                    googleMapsUrl: session.googleMapsUrl || session.venue?.googleMapsUrl,
                  },
                ]}
                selectedId={session.id ?? session._id}
                center={[
                  Number(session.latitude || session.venue?.latitude || 10.896255),
                  Number(session.longitude || session.venue?.longitude || 106.5840769),
                ]}
                zoom={14}
                className="h-[220px] w-full"
              />
            </div>
          </div>

          {/* Notes */}
          {session.notes && (
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Info className="h-4 w-4 text-emerald-600" />
                Ghi Chú Từ Host
              </h2>
              <p className="mt-1.5 text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                {session.notes}
              </p>
            </div>
          )}
        </div>

        {/* Right Column (5 cols): Sticky Booking Hub & Host Tools */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Booking Card (Sticky) */}
          <div className="sticky top-20 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-md">
            {/* Price Header */}
            {session.hasGenderPricing && session.priceFemale !== undefined ? (
              <div className="pb-3 border-b border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <span className="flex items-center gap-1">
                    <span>👫</span> Phí sân theo giới tính
                  </span>
                  {session.depositRequired && (
                    <span className="text-[10.5px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                      Cọc {(session.depositAmount || 50000).toLocaleString()}đ
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-2.5 text-center">
                    <div className="text-[11px] font-bold text-blue-700 flex items-center justify-center gap-1">
                      <span>♂</span> Tiền Nam
                    </div>
                    <div className="text-base font-black text-blue-900 mt-0.5">
                      {session.price > 0 ? `${session.price.toLocaleString("vi-VN")}đ` : "Miễn phí"}
                    </div>
                  </div>

                  <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-2.5 text-center">
                    <div className="text-[11px] font-bold text-rose-700 flex items-center justify-center gap-1">
                      <span>♀</span> Tiền Nữ
                    </div>
                    <div className="text-base font-black text-rose-900 mt-0.5">
                      {session.priceFemale > 0 ? `${session.priceFemale.toLocaleString("vi-VN")}đ` : "Miễn phí (Free)"}
                    </div>
                  </div>
                </div>

                {/* Personalized price indicator for the logged-in user */}
                {user && (
                  <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center justify-between">
                    <span>Mức phí áp dụng cho bạn:</span>
                    <span className="font-bold text-emerald-700">
                      {user.gender === "female"
                        ? (session.priceFemale > 0 ? `${session.priceFemale.toLocaleString("vi-VN")}đ (Nữ)` : "Miễn phí (Nữ)")
                        : `${session.price.toLocaleString("vi-VN")}đ (Nam)`}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-baseline justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-2xl font-black text-emerald-600">
                    {session.price > 0 ? `${session.price.toLocaleString("vi-VN")} đ` : "Miễn phí"}
                  </span>
                  <span className="text-xs text-slate-500 font-medium ml-1">/ người</span>
                </div>

                {session.depositRequired && (
                  <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                    Cọc {(session.depositAmount || 50000).toLocaleString()}đ
                  </span>
                )}
              </div>
            )}

            {/* Slots Meter */}
            <div className="py-3">
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-600">Chỗ trống</span>
                <span className={slotsLeft > 0 ? "text-emerald-600" : "text-rose-500"}>
                  {slotsLeft > 0 ? `Còn ${slotsLeft} slot` : "Đã hết slot"}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    slotsLeft > 0 ? "bg-emerald-500" : "bg-slate-400"
                  }`}
                  style={{ width: `${Math.min(100, (currentCount / maxCount) * 100)}%` }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              {!myPlayer ? (
                isPastSession ? (
                  <button disabled className="w-full rounded-xl bg-slate-100 py-3 text-xs font-bold text-slate-400 cursor-not-allowed">
                    Buổi chơi đã kết thúc
                  </button>
                ) : isFull ? (
                  <button disabled className="w-full rounded-xl bg-slate-100 py-3 text-xs font-bold text-slate-400 cursor-not-allowed">
                    Đã đủ số lượng người
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (!user) {
                        router.push(`/login?redirect=/sessions/${params.id}`);
                        return;
                      }
                      joinMutation.mutate();
                    }}
                    disabled={joinMutation.isPending}
                    className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 text-xs font-black text-white shadow-md shadow-emerald-600/25 transition active:scale-[0.98] disabled:opacity-50"
                  >
                    {joinMutation.isPending ? "Đang gửi yêu cầu..." : !user ? "Đăng nhập để tham gia" : "Tham Gia Buổi Chơi Ngay"}
                  </button>
                )
              ) : (
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{isPending ? "Đang chờ Host xét duyệt" : "Bạn đã có slot tham gia!"}</span>
                  </div>

                  {session.depositRequired && !hasPaidDeposit && !canEdit && (() => {
                    const isFemaleUser = user?.gender === "female";
                    const femaleFree = Boolean(session.hasGenderPricing && isFemaleUser && (session.priceFemale === 0 || session.priceFemale === undefined));
                    const effectivePrice = session.hasGenderPricing && isFemaleUser
                      ? (session.priceFemale ?? 0)
                      : session.price;
                    const depAmount = femaleFree
                      ? 0
                      : Math.min(
                          session.depositAmount || 50000,
                          effectivePrice > 0 ? effectivePrice : session.depositAmount || 50000,
                        );

                    return (
                      <button
                        type="button"
                        onClick={() => createDepositMutation.mutate()}
                        disabled={createDepositMutation.isPending}
                        className={`w-full rounded-xl py-2.5 text-xs font-bold text-white shadow-md transition active:scale-[0.98] flex items-center justify-center gap-2 ${
                          femaleFree
                            ? "bg-rose-500 hover:bg-rose-600"
                            : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                        }`}
                      >
                        <CreditCard className="h-4 w-4" />
                        <span>
                          {createDepositMutation.isPending
                            ? "Đang xử lý..."
                            : femaleFree
                              ? "Xác nhận giữ chỗ (Nữ Free 0đ)"
                              : `Đặt cọc VietQR (${depAmount.toLocaleString("vi-VN")}đ)`}
                        </span>
                      </button>
                    );
                  })()}

                  {session.depositRequired && hasPaidDeposit && (
                    <button
                      type="button"
                      onClick={() => setIsReceiptModalOpen(true)}
                      className="w-full rounded-xl border border-emerald-300 bg-emerald-50 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition flex items-center justify-center gap-1.5"
                    >
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      <span>Xem biên lai cọc Escrow</span>
                    </button>
                  )}

                  {isJoined && !canEdit && (
                    <>
                      {!hasAttended ? (
                        <button
                          type="button"
                          onClick={() => setIsCheckInModalOpen(true)}
                          className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-emerald-600 transition flex items-center justify-center gap-2"
                        >
                          <MapPin className="h-4 w-4 text-emerald-400" />
                          <span>Check-in tại sân</span>
                        </button>
                      ) : (
                        <div className="p-2 text-center rounded-lg bg-teal-50 border border-teal-200 text-xs font-bold text-teal-800 flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4 text-teal-600" />
                          <span>Đã check-in có mặt tại sân</span>
                        </div>
                      )}
                    </>
                  )}

                  {!canEdit && (
                    <button
                      type="button"
                      onClick={() => cancelBookingMutation.mutate()}
                      disabled={cancelBookingMutation.isPending}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                    >
                      Hủy tham gia
                    </button>
                  )}

                  {!canEdit && session.depositRequired && (
                    <button
                      type="button"
                      onClick={() => setIsDisputeModalOpen(true)}
                      className="w-full rounded-xl border border-rose-200 bg-rose-50/60 py-1.5 text-[11px] font-semibold text-rose-700 hover:bg-rose-100 transition flex items-center justify-center gap-1"
                    >
                      <ShieldAlert className="h-3 w-3" />
                      <span>Báo cáo kèo ảo / Host vắng</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Bảo vệ bởi CLVL Escrow • Hoàn tiền 100% nếu có khiếu nại</span>
            </p>
          </div>

          {/* Host Management Controls (Only visible to Host) */}
          {canEdit && (
            <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Quản Lý Buổi Chơi (Host)
                </span>
                <span className="rounded bg-emerald-100 text-emerald-800 px-1.5 py-0.2 text-[9px] font-bold">
                  CHỦ KÈO
                </span>
              </div>

              {/* Check-in Code Box */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                  <KeyRound className="h-3.5 w-3.5 text-emerald-600" />
                  Mã check-in cho khách đến sân:
                </span>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="rounded-lg border border-emerald-300 bg-emerald-100 px-3 py-1 text-lg font-black tracking-widest text-emerald-950 font-mono">
                    {session.checkInCode || "123456"}
                  </span>
                  <button
                    onClick={copyCheckInCode}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                  >
                    {copiedCode ? "Đã chép" : "Sao chép"}
                  </button>
                </div>
              </div>

              {/* Escrow Payout Box */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                  <Wallet className="h-3.5 w-3.5 text-emerald-600" />
                  Quỹ cọc đang giữ:
                </span>
                <div className="text-base font-black text-emerald-600 mt-0.5">
                  {(session.totalEscrowHeld || 0).toLocaleString("vi-VN")} đ
                </div>
                <button
                  type="button"
                  onClick={() => setIsPayoutModalOpen(true)}
                  disabled={
                    releasePayoutMutation.isPending ||
                    session.escrowStatus === "paid_out" ||
                    session.totalEscrowHeld === 0 ||
                    session.escrowStatus === "disputed"
                  }
                  className="mt-2 w-full rounded-lg bg-emerald-600 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition active:scale-95 disabled:opacity-50"
                >
                  {session.escrowStatus === "paid_out"
                    ? "✓ Đã giải ngân"
                    : session.escrowStatus === "disputed"
                      ? "Đang khiếu nại"
                      : "Giải ngân về STK"}
                </button>
              </div>

              {/* Pending Join Requests */}
              {(session.players || []).filter((p: any) => p.status === "pending").length > 0 && (
                <div className="pt-1">
                  <span className="text-xs font-bold text-slate-800">
                    Yêu cầu chờ duyệt ({(session.players || []).filter((p: any) => p.status === "pending").length})
                  </span>
                  <div className="mt-1.5 space-y-1.5">
                    {(session.players || [])
                      .filter((p: any) => p.status === "pending")
                      .map((p: any) => (
                        <div
                          key={p.user?._id ?? p.user?.id ?? p.user}
                          className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs"
                        >
                          <div>
                            <p className="font-bold text-slate-900">{p.user?.name ?? "Người chơi"}</p>
                            <p className="text-[10px] text-slate-500">Trình: {p.user?.skillLevel || "TB"}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() =>
                                respondMutation.mutate({
                                  userId: p.user?._id ?? p.user?.id ?? p.user,
                                  approve: true,
                                })
                              }
                              className="rounded bg-emerald-500 px-2 py-0.5 text-[11px] font-bold text-white hover:bg-emerald-600"
                            >
                              Duyệt
                            </button>
                            <button
                              onClick={() =>
                                respondMutation.mutate({
                                  userId: p.user?._id ?? p.user?.id ?? p.user,
                                  approve: false,
                                })
                              }
                              className="rounded border border-slate-200 bg-white px-2 py-0.5 text-[11px] text-slate-600 hover:bg-slate-100"
                            >
                              Từ chối
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 5. Mobile Floating Action Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 border-t border-slate-200 p-3 shadow-xl backdrop-blur-md flex items-center justify-between gap-3 lg:hidden">
        <div>
          <span className="text-lg font-black text-emerald-600 leading-none">
            {session.price > 0 ? `${session.price.toLocaleString("vi-VN")}đ` : "Miễn phí"}
          </span>
          <p className="text-[10px] text-slate-500 font-medium">
            {slotsLeft > 0 ? `Còn ${slotsLeft} chỗ` : "Đã hết chỗ"}
          </p>
        </div>

        <div>
          {!myPlayer ? (
            isPastSession ? (
              <span className="text-xs font-bold text-slate-400">Đã kết thúc</span>
            ) : isFull ? (
              <span className="text-xs font-bold text-slate-400">Đã đủ</span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (!user) {
                    router.push(`/login?redirect=/sessions/${params.id}`);
                    return;
                  }
                  joinMutation.mutate();
                }}
                disabled={joinMutation.isPending}
                className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md active:scale-95 disabled:opacity-50"
              >
                {joinMutation.isPending ? "Đang gửi..." : !user ? "Đăng nhập" : "Tham Gia Ngay"}
              </button>
            )
          ) : session.depositRequired && !hasPaidDeposit && !canEdit ? (
            <button
              type="button"
              onClick={() => createDepositMutation.mutate()}
              className="rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-white shadow-md active:scale-95"
            >
              Đặt cọc VietQR
            </button>
          ) : isJoined && !hasAttended && !canEdit ? (
            <button
              type="button"
              onClick={() => setIsCheckInModalOpen(true)}
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white active:scale-95"
            >
              Check-in sân
            </button>
          ) : (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              ✓ Đã có slot
            </span>
          )}
        </div>
      </div>

      {/* 6. Modals */}
      <PaymentQRModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        orderData={paymentOrderData}
        onConfirmPayment={async (orderCode) => {
          await paymentsApi.confirmPayment(orderCode);
          sessionQuery.refetch();
        }}
      />

      <CheckInModal
        isOpen={isCheckInModalOpen}
        onClose={() => setIsCheckInModalOpen(false)}
        sessionTitle={session.title}
        venueName={session.venueName}
        onCheckIn={async (code) => {
          await paymentsApi.checkIn(params.id ?? "", code);
          sessionQuery.refetch();
        }}
      />

      <DisputeModal
        isOpen={isDisputeModalOpen}
        onClose={() => setIsDisputeModalOpen(false)}
        sessionId={params.id ?? ""}
        sessionTitle={session.title}
        onReportDispute={async (payload) => {
          await paymentsApi.reportDispute(payload);
          sessionQuery.refetch();
        }}
      />

      <DepositReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        session={session}
        player={myPlayer || {}}
        orderCode={paymentOrderData?.orderCode}
      />

      <PayoutConfirmModal
        isOpen={isPayoutModalOpen}
        onClose={() => setIsPayoutModalOpen(false)}
        totalEscrowHeld={session.totalEscrowHeld || 0}
        sessionTitle={session.title}
        hostBank={session.host?.bankAccount || user?.bankAccount}
        onConfirmPayout={async () => {
          await releasePayoutMutation.mutateAsync();
        }}
        onBankUpdated={() => {
          sessionQuery.refetch();
        }}
      />
    </div>
  );
}
