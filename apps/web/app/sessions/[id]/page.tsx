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
} from "lucide-react";
import { api, paymentsApi, sessionsApi } from "@/lib/api";
import { MatchCard } from "@/components/cards/MatchCard";
import { MapWrapper } from "@/components/map/MapWrapper";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuthStore } from "@/stores/auth-store";
import { PaymentQRModal } from "@/components/modals/PaymentQRModal";
import { CheckInModal } from "@/components/modals/CheckInModal";
import { DisputeModal } from "@/components/modals/DisputeModal";

export default function SessionDetailsPage() {
  const params = useParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [notice, setNotice] = useState<{ type: "success" | "error" | "info"; text: string } | null>(
    null,
  );
  const [copiedCode, setCopiedCode] = useState(false);

  // Modals state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentOrderData, setPaymentOrderData] = useState<any>(null);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);

  const sessionQuery = useQuery({
    queryKey: ["session", params.id],
    queryFn: async () => {
      const response = await api.get(`/sessions/${params.id}`);
      return response.data.data.session;
    },
  });

  const session = sessionQuery.data;
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
      setNotice({ type: "success", text: "Đã gửi yêu cầu tham gia buổi chơi!" });
    },
    onError: (err: any) => {
      setNotice({
        type: "error",
        text: err.response?.data?.message || "Không thể tham gia buổi chơi",
      });
    },
  });

  const respondMutation = useMutation({
    mutationFn: async ({ userId, approve }: { userId: string; approve: boolean }) =>
      sessionsApi.respondJoinRequest(params.id ?? "", userId, approve),
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
      const confirmed = window.confirm(
        `Chính sách hủy: Nếu hủy trước ${session.cancelPolicyHours || 12}h, bạn được HOÀN CỌC 100%. Nếu hủy sát giờ, tiền cọc sẽ bồi thường cho Host và bạn bị trừ 15 điểm uy tín. Bạn có chắc chắn muốn hủy?`,
      );
      if (!confirmed) return;
      return paymentsApi.cancelBooking(params.id ?? "");
    },
    onSuccess: (res: any) => {
      sessionQuery.refetch();
      const data = res?.data?.data;
      if (data?.isFullRefund) {
        setNotice({
          type: "success",
          text: `Đã hủy slot và HOÀN CỌC 100% (${data.refundAmount?.toLocaleString()}đ) vì hủy trước ${data.policyHours}h.`,
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
        "Xác nhận báo cáo người chơi này bùng kèo (No-show)? Người này sẽ mất tiền cọc cho bạn và bị trừ 25 điểm uy tín.",
      );
      if (!confirmed) return;
      return paymentsApi.markNoShow(params.id ?? "", targetUserId);
    },
    onSuccess: () => {
      sessionQuery.refetch();
      setNotice({
        type: "success",
        text: "Đã đánh dấu bùng kèo (No-show) thành công. Tiền cọc người này đã được chuyển về ví của bạn.",
      });
    },
    onError: (err: any) => {
      setNotice({
        type: "error",
        text: err.response?.data?.message || "Có lỗi xảy ra",
      });
    },
  });

  if (!session) {
    return <div className="text-slate-500">Đang tải buổi chơi...</div>;
  }

  const hasPaidDeposit =
    myPlayer?.paymentStatus === "escrow_held" || myPlayer?.paymentStatus === "paid";
  const hasAttended = myPlayer?.attendanceStatus === "attended";
  const isPending = myPlayer?.status === "pending";
  const isJoined = myPlayer?.status === "joined" || myPlayer?.status === "host";

  const copyCheckInCode = () => {
    if (session.checkInCode) {
      navigator.clipboard.writeText(session.checkInCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="space-y-6 animate-fadeUp">
      {!user && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs text-emerald-900 shadow-sm">
          <span>
            Bạn đang xem buổi chơi này ở chế độ khách. Hãy đăng nhập để tham gia
            và nhận mã check-in bảo chứng.
          </span>
          <Link
            href={`/login?redirect=/sessions/${params.id}`}
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-600 transition shadow-sm"
          >
            Đăng nhập ngay
          </Link>
        </div>
      )}

      <MatchCard session={session} />

        {/* Escrow Trust & Cancellation Policy Banner */}
        <div className="rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-teal-50 to-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-700">
                <ShieldCheck className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Chính Sách Chống Bùng Kèo & Bảo Vệ Người Chơi (CLVL Escrow)
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-900">
                {session.depositRequired
                  ? `Yêu cầu đặt cọc: ${(session.depositAmount || 50000).toLocaleString()} đ/người`
                  : "Không yêu cầu cọc"}
              </p>
              <p className="text-xs text-slate-600">
                • Hủy trước <strong>{session.cancelPolicyHours || 12} tiếng</strong>: Hoàn cọc <strong>100%</strong>.
                <br />
                • Hủy sát giờ hoặc không đến: <strong>Mất cọc</strong> đền bù cho Host & trừ 15-25 điểm uy tín.
                <br />
                • Kèo ảo / Host vắng mặt: Nền tảng phong tỏa tiền và <strong>hoàn tiền 100%</strong> cho người chơi.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-300 bg-white px-4 py-2.5 text-center">
              <div className="text-[11px] font-medium text-slate-500">Quỹ cọc Ký quỹ</div>
              <div className="text-lg font-bold text-emerald-600">
                {(session.totalEscrowHeld || 0).toLocaleString()} đ
              </div>
              <span
                className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                  session.escrowStatus === "disputed"
                    ? "bg-rose-100 text-rose-700"
                    : session.escrowStatus === "paid_out"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {session.escrowStatus === "disputed"
                  ? "Đang khiếu nại"
                  : session.escrowStatus === "paid_out"
                    ? "Đã giải ngân"
                    : session.escrowStatus === "holding"
                      ? "Đang giữ an toàn"
                      : "Chưa có cọc"}
              </span>
            </div>
          </div>
        </div>

        {/* Notices */}
        {notice && (
          <div
            className={`rounded-2xl border p-4 text-sm font-medium ${
              notice.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : notice.type === "error"
                  ? "border-rose-200 bg-rose-50 text-rose-800"
                  : "border-amber-200 bg-amber-50 text-amber-800"
            }`}
          >
            {notice.text}
          </div>
        )}

        {/* Action Buttons Bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Join button */}
          {!myPlayer && (
            <button
              onClick={() => {
                if (!user) {
                  router.push(`/login?redirect=/sessions/${params.id}`);
                  return;
                }
                joinMutation.mutate();
              }}
              disabled={joinMutation.isPending}
              className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 disabled:opacity-50"
            >
              {joinMutation.isPending
                ? "Đang gửi..."
                : !user
                  ? "Đăng nhập để tham gia buổi chơi"
                  : "Tham gia buổi chơi"}
            </button>
          )}

          {/* Player status badges & actions */}
          {myPlayer && !canEdit && (
            <>
              {/* Deposit Action */}
              {!hasPaidDeposit ? (
                <button
                  onClick={() => createDepositMutation.mutate()}
                  disabled={createDepositMutation.isPending}
                  className="flex items-center gap-2 rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 hover:bg-amber-600 disabled:opacity-50"
                >
                  <CreditCard className="h-4 w-4" />
                  {createDepositMutation.isPending
                    ? "Đang tạo mã..."
                    : `Đặt cọc VietQR (${(session.depositAmount || 50000).toLocaleString()}đ)`}
                </button>
              ) : (
                <span className="flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-700">
                  <ShieldCheck className="h-4 w-4" /> Đã cọc giữ chỗ (Ký quỹ an toàn)
                </span>
              )}

              {/* Check-In Action */}
              {isJoined && (
                <>
                  {!hasAttended ? (
                    <button
                      onClick={() => setIsCheckInModalOpen(true)}
                      className="flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-emerald-700"
                    >
                      <MapPin className="h-4 w-4" /> Check-in tại sân
                    </button>
                  ) : (
                    <span className="flex items-center gap-1.5 rounded-full border border-teal-300 bg-teal-50 px-4 py-2.5 text-xs font-bold text-teal-700">
                      <CheckCircle2 className="h-4 w-4" /> Đã có mặt tại sân
                    </span>
                  )}
                </>
              )}

              {/* Cancel Slot Action */}
              <button
                onClick={() => cancelBookingMutation.mutate()}
                disabled={cancelBookingMutation.isPending}
                className="rounded-full border border-slate-300 bg-white px-4 py-3 text-xs font-semibold text-slate-600 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
              >
                Hủy tham gia
              </button>

              {/* Report Fake Session / Absent Host */}
              <button
                onClick={() => setIsDisputeModalOpen(true)}
                className="flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700 hover:bg-rose-100"
              >
                <ShieldAlert className="h-3.5 w-3.5" /> Báo cáo kèo ảo / Host vắng mặt
              </button>
            </>
          )}

          {/* Chat button */}
          <button
            type="button"
            onClick={() => {
              if (myPlayer) {
                router.push(`/chat/${params.id}`);
              } else {
                setNotice({
                  type: "info",
                  text: "Bạn cần tham gia buổi chơi trước khi vào chat.",
                });
              }
            }}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:border-emerald-300 hover:bg-emerald-50"
          >
            <MessageSquare className="h-4 w-4" /> Chat buổi chơi
          </button>

          {/* Host Edit */}
          {canEdit && (
            <Link
              href={`/sessions/create?edit=${session.id ?? session._id ?? session.slug}`}
              className="rounded-full border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
            >
              Chỉnh sửa buổi chơi
            </Link>
          )}
        </div>

        {/* Host Control Panel */}
        {canEdit && (
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-glow">
            <h2 className="text-lg font-bold text-slate-900">Bảng Điều Khiển Của Host</h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {/* Check-in Code Box */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-slate-700">
                  <KeyRound className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Mã Check-in Tại Sân
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Đọc hoặc cho người chơi xem mã này khi đến sân để họ check-in:
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <span className="rounded-xl border border-emerald-300 bg-emerald-100 px-4 py-2 text-2xl font-black tracking-widest text-emerald-950">
                    {session.checkInCode || "123456"}
                  </span>
                  <button
                    onClick={copyCheckInCode}
                    className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {copiedCode ? "Đã sao chép!" : "Sao chép"}
                  </button>
                </div>
              </div>

              {/* Escrow Payout Box */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-slate-700">
                  <Wallet className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Giải Ngân Quỹ Cọc
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Tổng tiền cọc đang giữ trong quỹ ký quỹ:
                </p>
                <div className="mt-2 text-2xl font-black text-emerald-600">
                  {(session.totalEscrowHeld || 0).toLocaleString()} đ
                </div>
                <div className="mt-3">
                  <button
                    onClick={() => releasePayoutMutation.mutate()}
                    disabled={
                      releasePayoutMutation.isPending ||
                      session.escrowStatus === "paid_out" ||
                      session.totalEscrowHeld === 0 ||
                      session.escrowStatus === "disputed"
                    }
                    className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
                  >
                    {session.escrowStatus === "paid_out"
                      ? "Đã giải ngân"
                      : session.escrowStatus === "disputed"
                        ? "Đang tranh chấp (Khóa)"
                        : "Giải ngân về STK của Host"}
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Players Roster & Attendance Table */}
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-glow">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Danh Sách Người Chơi</h2>
              <p className="text-xs text-slate-500">
                {session.currentPlayersCount}/{session.maxPlayers} người tham gia
              </p>
            </div>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {(session.players || [])
              .filter((p: any) => p.status !== "left" && p.status !== "rejected")
              .map((p: any) => {
                const isHost = p.status === "host";
                const isMe =
                  (p.user?._id ?? p.user?.id ?? p.user) === user?.id;
                const playerId = p.user?._id ?? p.user?.id ?? p.user;

                return (
                  <div
                    key={playerId}
                    className="flex flex-wrap items-center justify-between gap-3 py-3.5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-800">
                        {(p.user?.name?.[0] || "P").toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">
                            {p.user?.name ?? "Người chơi"}
                          </span>
                          {isHost && (
                            <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-white">
                              Host
                            </span>
                          )}
                          {isMe && (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                              Bạn
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>Trình độ: {p.user?.skillLevel || "TB"}</span>
                          <span>•</span>
                          <span>Uy tín: {p.user?.reputation ?? 100} điểm</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Payment Badge */}
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          p.paymentStatus === "escrow_held" || p.paymentStatus === "paid"
                            ? "bg-emerald-100 text-emerald-800"
                            : p.paymentStatus === "forfeited"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {p.paymentStatus === "escrow_held" || p.paymentStatus === "paid"
                          ? "✓ Đã cọc"
                          : p.paymentStatus === "forfeited"
                            ? "Mất cọc"
                            : "Chưa cọc"}
                      </span>

                      {/* Attendance Badge */}
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          p.attendanceStatus === "attended"
                            ? "bg-teal-100 text-teal-800"
                            : p.attendanceStatus === "no_show"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {p.attendanceStatus === "attended"
                          ? "✓ Đã có mặt"
                          : p.attendanceStatus === "no_show"
                            ? "✗ Bùng kèo (No-show)"
                            : "Chờ đến sân"}
                      </span>

                      {/* Host action: Mark No-Show */}
                      {canEdit && !isHost && p.attendanceStatus !== "no_show" && (
                        <button
                          onClick={() => markNoShowMutation.mutate(playerId)}
                          className="flex items-center gap-1 rounded-xl border border-rose-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50"
                          title="Báo cáo người chơi này không đến để phạt cọc và trừ uy tín"
                        >
                          <UserX className="h-3 w-3" /> Báo bùng kèo
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </section>

        {/* Join Requests (Host only) */}
        {canEdit && (
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-glow">
            <h2 className="text-lg font-bold text-slate-900">Yêu Cầu Tham Gia Chờ Duyệt</h2>
            <div className="mt-3 space-y-2.5">
              {(session.players || []).filter((p: any) => p.status === "pending").length === 0 ? (
                <p className="text-xs text-slate-400">Không có yêu cầu nào đang chờ.</p>
              ) : (
                (session.players || [])
                  .filter((p: any) => p.status === "pending")
                  .map((p: any) => (
                    <div
                      key={p.user?._id ?? p.user?.id ?? p.user}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3"
                    >
                      <div>
                        <div className="font-semibold text-slate-900">
                          {p.user?.name ?? "Người chơi"}
                        </div>
                        <div className="text-xs text-slate-500">
                          Trình: {p.user?.skillLevel ?? "-"} • Uy tín:{" "}
                          {p.user?.reputation ?? 100} điểm
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            respondMutation.mutate({
                              userId: p.user?._id ?? p.user?.id ?? p.user,
                              approve: true,
                            })
                          }
                          className="rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white"
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
                          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                        >
                          Từ chối
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </section>
        )}

        {/* Venue Address & Interactive Map */}
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-glow">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
                <MapPin className="h-4 w-4" />
                <span>Địa Chỉ & Sân Đấu</span>
              </div>
              <h2 className="mt-1 text-lg font-bold text-slate-900">
                {session.venueName}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {session.venue?.address ||
                  session.address ||
                  `${session.district || ""}, ${session.city || "TP. Hồ Chí Minh"}`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
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
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-600 transition"
              >
                <Navigation className="h-3.5 w-3.5 text-emerald-400" />
                <span>Chỉ đường Google Maps</span>
              </a>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
            <MapWrapper
              venues={[
                {
                  id: session.id ?? session._id ?? "session",
                  sessionId: session.id ?? session._id ?? "session",
                  name: session.venueName,
                  address:
                    session.venue?.address ||
                    `${session.district || ""}, ${session.city || ""}`,
                  district: session.district,
                  city: session.city,
                  latitude: Number(
                    session.latitude ||
                      session.venue?.latitude ||
                      10.896255,
                  ),
                  longitude: Number(
                    session.longitude ||
                      session.venue?.longitude ||
                      106.5840769,
                  ),
                  price: session.price,
                  sessionTitle: session.title,
                  slotsLeft: Math.max(
                    0,
                    (session.maxPlayers || 8) -
                      (session.currentPlayersCount || 1),
                  ),
                  maxPlayers: session.maxPlayers || 8,
                  datetime: session.datetime,
                  googleMapsUrl:
                    session.googleMapsUrl || session.venue?.googleMapsUrl,
                },
              ]}
              selectedId={session.id ?? session._id}
              center={[
                Number(
                  session.latitude ||
                    session.venue?.latitude ||
                    10.896255,
                ),
                Number(
                  session.longitude ||
                    session.venue?.longitude ||
                    106.5840769,
                ),
              ]}
              zoom={14}
              className="h-[280px] w-full"
            />
          </div>
        </section>

        {/* Notes */}
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-glow">
          <h2 className="text-lg font-bold text-slate-900">Ghi Chú Buổi Chơi</h2>
          <p className="mt-2 text-sm text-slate-600">{session.notes || "Chưa có ghi chú nào."}</p>
        </section>

        {/* Modals */}
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
      </div>
  );
}
