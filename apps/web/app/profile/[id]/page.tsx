"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  AlertCircle,
  Award,
  Building2,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  Compass,
  Edit3,
  LogOut,
  MapPin,
  Plus,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  User,
  Users,
} from "lucide-react";
import { api, usersApi } from "@/lib/api";
import { MatchCard } from "@/components/cards/MatchCard";
import { SkillBadge } from "@/components/ui/SkillBadge";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuthStore } from "@/stores/auth-store";
import { signOutSession } from "@/lib/auth";
import { AvatarUploadModal } from "@/components/profile/AvatarUploadModal";
import { getDefaultAvatar } from "@/lib/badminton-avatars";

const BANK_LIST = [
  { id: "MB", name: "MBBank (Quân Đội)" },
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
  { id: "MSB", name: "MSB (Hàng Hải)" },
];

const SKILL_OPTIONS = [
  "Newbie",
  "Yếu",
  "Yếu+",
  "TBY-",
  "TBY",
  "TBY+",
  "TB-",
  "TB",
  "TB+",
  "Khá-",
  "Khá",
  "Khá+",
  "Pro",
  "Bán chuyên",
  "Trình giải",
];

export default function ProfilePage() {
  const params = useParams<{ id: string }>();
  const qc = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);

  const [activeTab, setActiveTab] = useState<"sessions" | "bank" | "edit">("sessions");
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const profileQuery = useQuery({
    queryKey: ["profile", params.id],
    queryFn: async () => {
      const response = await api.get(`/users/${params.id}`);
      return response.data.data.user;
    },
    enabled: Boolean(params.id),
  });

  const createdSessionsQuery = useQuery({
    queryKey: ["profile-sessions", params.id],
    queryFn: async () => {
      const response = await api.get("/sessions", {
        params: { host: params.id },
      });
      return response.data.data.sessions;
    },
    enabled: Boolean(params.id),
  });

  const user = profileQuery.data;
  const createdSessions = createdSessionsQuery.data ?? [];
  const isOwner = Boolean(currentUser && currentUser.id === user?.id);

  // Bank Form State
  const [bankForm, setBankForm] = useState({
    bankId: "MB",
    bankName: "MBBank (Quân Đội)",
    accountNumber: "",
    accountHolder: "",
  });

  // Edit Profile Form State
  const [editForm, setEditForm] = useState({
    name: "",
    bio: "",
    skillLevel: "TB",
    dominantHand: "right",
    preferredPosition: "all-round",
    city: "Hồ Chí Minh",
    district: "",
  });

  useEffect(() => {
    if (user) {
      if (user.bankAccount) {
        setBankForm({
          bankId: user.bankAccount.bankId || "MB",
          bankName: user.bankAccount.bankName || "MBBank (Quân Đội)",
          accountNumber: user.bankAccount.accountNumber || "",
          accountHolder: user.bankAccount.accountHolder || "",
        });
      }
      setEditForm({
        name: user.name || "",
        bio: user.bio || "",
        skillLevel: user.skillLevel || "TB",
        dominantHand: user.dominantHand || "right",
        preferredPosition: user.preferredPosition || "all-round",
        city: user.city || "Hồ Chí Minh",
        district: user.district || "",
      });
    }
  }, [user]);

  const updateBankMutation = useMutation({
    mutationFn: async () => {
      await usersApi.updateMe({ bankAccount: bankForm });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile", params.id] });
      setSuccessToast("Đã lưu thông tin tài khoản ngân hàng thành công!");
      setTimeout(() => setSuccessToast(null), 3500);
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      await usersApi.updateMe(editForm);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile", params.id] });
      if (currentUser) {
        useAuthStore.setState((s) => ({
          ...s,
          user: s.user ? { ...s.user, name: editForm.name, skillLevel: editForm.skillLevel } : null,
        }));
      }
      setSuccessToast("Cập nhật thông tin cá nhân thành công!");
      setTimeout(() => setSuccessToast(null), 3500);
      setActiveTab("sessions");
    },
  });

  if (profileQuery.isLoading) {
    return (
      <div className="mx-auto max-w-3xl py-20 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        <p className="mt-3 text-xs font-semibold text-slate-500">
          Đang tải hồ sơ tay vợt...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xs">
        <AlertCircle className="mx-auto h-10 w-10 text-rose-500" />
        <h2 className="mt-3 text-base font-bold text-slate-900">
          Không tìm thấy hồ sơ người chơi
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Tài khoản này có thể đã bị xóa hoặc đường dẫn không chính xác.
        </p>
        <Link
          href="/explore"
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs"
        >
          <Compass className="h-4 w-4" />
          <span>Về trang Khám phá</span>
        </Link>
      </div>
    );
  }

  const avatarUrl = user.avatar || getDefaultAvatar(user.name, user.id);
  const isVerifiedHost = user.isVerifiedHost || (user.hostedMatchesCount ?? 0) >= 3;
  const reputation = user.reputation ?? 100;
  const isLowReputation = reputation < 70;

  const positionLabel =
    user.preferredPosition === "front"
      ? "Bắt lưới & Tạt cầu"
      : user.preferredPosition === "back"
        ? "Đập cầu & Công sau"
        : "Công thủ toàn diện";

  const handLabel =
    user.dominantHand === "left"
      ? "Tay trái"
      : user.dominantHand === "ambidextrous"
        ? "Cả hai tay"
        : "Tay phải";

  return (
    <div className="mx-auto max-w-3xl space-y-4 pb-16 sm:space-y-5">
      {/* Toast Alert */}
      {successToast && (
        <div className="fixed top-16 right-4 z-50 flex items-center gap-2 rounded-2xl border border-emerald-300 bg-white px-4 py-3 text-xs font-bold text-emerald-800 shadow-xl animate-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{successToast}</span>
        </div>
      )}

      {/* HERO PROFILE CARD */}
      <section className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xs">
        {/* Badminton Sport Banner */}
        <div className="relative h-28 w-full overflow-hidden bg-gradient-to-r from-emerald-800 via-teal-700 to-slate-900 sm:h-36">
          {/* Subtle decorative court pattern */}
          <div className="absolute inset-0 opacity-15">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern
                  id="court-grid"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#court-grid)" />
            </svg>
          </div>

          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            {isVerifiedHost && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 backdrop-blur-md px-2.5 py-0.5 text-[10.5px] font-bold text-white shadow-xs">
                <ShieldCheck className="h-3 w-3 stroke-[2.5]" />
                Host Uy Tín
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-black/40 backdrop-blur-md px-2.5 py-0.5 text-[10.5px] font-medium text-white/90">
              <Sparkles className="h-3 w-3 text-amber-300" />
              CLVL Member
            </span>
          </div>
        </div>

        {/* Profile Info Row */}
        <div className="px-4 pb-4 sm:px-6 sm:pb-5">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            {/* Avatar & Basic Info */}
            <div className="flex items-end gap-3.5 -mt-12 sm:-mt-14">
              {/* Avatar Circle with edit button */}
              <div className="group relative h-22 w-22 sm:h-26 sm:w-26 flex-shrink-0 rounded-full border-4 border-white bg-slate-100 shadow-md ring-1 ring-slate-200/80 overflow-hidden">
                <img
                  src={avatarUrl}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />

                {isOwner && (
                  <button
                    type="button"
                    onClick={() => setIsAvatarModalOpen(true)}
                    title="Thay đổi ảnh đại diện"
                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Camera className="h-5 w-5" />
                    <span className="mt-0.5 text-[9px] font-bold">Đổi ảnh</span>
                  </button>
                )}
              </div>

              <div className="min-w-0 pb-1">
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-lg font-black text-slate-900 sm:text-2xl">
                    {user.name}
                  </h1>
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                  <SkillBadge level={user.skillLevel ?? "TB"} />
                  <span>·</span>
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin className="h-3 w-3 text-emerald-600" />
                    {[user.district, user.city].filter(Boolean).join(", ") ||
                      "Hồ Chí Minh"}
                  </span>
                </div>
              </div>
            </div>

            {/* Owner Actions */}
            {isOwner && (
              <div className="flex items-center gap-2 pt-1 sm:pt-0">
                <button
                  type="button"
                  onClick={() => setIsAvatarModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50"
                >
                  <Camera className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Đổi ảnh</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("edit")}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 active:scale-95"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Sửa hồ sơ</span>
                </button>
              </div>
            )}
          </div>

          {/* Bio text */}
          {user.bio ? (
            <div className="mt-3 rounded-2xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-700 border border-slate-100">
              "{user.bio}"
            </div>
          ) : isOwner ? (
            <div className="mt-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-2.5 text-center text-xs text-slate-400">
              Bạn chưa có lời giới thiệu.{" "}
              <button
                type="button"
                onClick={() => setActiveTab("edit")}
                className="font-bold text-emerald-700 hover:underline"
              >
                Thêm ngay
              </button>
            </div>
          ) : null}

          {/* Sport Stats Counter Bar (4 metrics in 1 row) */}
          <div className="mt-4 grid grid-cols-4 gap-2 rounded-2xl bg-slate-50/80 p-2.5 border border-slate-100 sm:p-3">
            <div className="text-center">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Trận đấu
              </div>
              <div className="mt-0.5 text-sm font-black text-slate-900 sm:text-base">
                {user.totalMatches ?? 0}
              </div>
            </div>
            <div className="text-center border-l border-slate-200/80">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Đã Host
              </div>
              <div className="mt-0.5 text-sm font-black text-emerald-700 sm:text-base">
                {createdSessions.length || user.hostedMatchesCount || 0}
              </div>
            </div>
            <div className="text-center border-l border-slate-200/80">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Uy tín
              </div>
              <div
                className={`mt-0.5 text-sm font-black sm:text-base ${
                  isLowReputation ? "text-rose-600" : "text-slate-900"
                }`}
              >
                {reputation}/100
              </div>
            </div>
            <div className="text-center border-l border-slate-200/80">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Đánh giá
              </div>
              <div className="mt-0.5 flex items-center justify-center gap-0.5 text-sm font-black text-amber-600 sm:text-base">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span>{user.rating?.toFixed(1) ?? "5.0"}</span>
              </div>
            </div>
          </div>

          {/* Badminton Playstyle Specs Pill Bar */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
              🏸 {handLabel}
            </span>
            <span className="rounded-lg bg-sky-50 border border-sky-200 px-2.5 py-1 text-[11px] font-semibold text-sky-800">
              🎯 {positionLabel}
            </span>
            {user.gender && user.gender !== "prefer_not_say" && (
              <span className="rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                {user.gender === "male" ? "Nam" : "Nữ"}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* INTERACTIVE NAVIGATION TABS */}
      <div className="flex items-center gap-1.5 border-b border-slate-200/90 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("sessions")}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
            activeTab === "sessions"
              ? "bg-emerald-600 text-white shadow-xs"
              : "border border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <Trophy className="h-3.5 w-3.5" />
          <span>Kèo đã tổ chức</span>
          <span
            className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
              activeTab === "sessions"
                ? "bg-white/20 text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {createdSessions.length}
          </span>
        </button>

        {isOwner && (
          <>
            <button
              type="button"
              onClick={() => setActiveTab("bank")}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeTab === "bank"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "border border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>Tài khoản nhận tiền Host</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("edit")}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeTab === "edit"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "border border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Sửa hồ sơ & Cài đặt</span>
            </button>
          </>
        )}
      </div>

      {/* TAB CONTENT 1: BUỔI CHƠI ĐÃ TẠO */}
      {activeTab === "sessions" && (
        <section className="space-y-3">
          {createdSessionsQuery.isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-32 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs animate-pulse"
                />
              ))}
            </div>
          ) : createdSessions.length > 0 ? (
            <div className="grid gap-3">
              {createdSessions.map((session: any) => (
                <MatchCard
                  key={session.id ?? session._id ?? session.slug}
                  session={session}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200/90 bg-white p-8 text-center shadow-xs sm:p-10">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Trophy className="h-6 w-6" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-900 sm:text-base">
                Chưa tổ chức buổi chơi nào
              </h3>
              <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
                {isOwner
                  ? "Tạo buổi chơi đầu tiên để kết nối các bạn lông thủ phong trào tại khu vực của bạn!"
                  : "Người chơi này hiện chưa đăng lịch tổ chức buổi cầu lông nào."}
              </p>
              {isOwner && (
                <div className="mt-4">
                  <Link
                    href="/sessions/create"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Tạo kèo giao lưu ngay</span>
                  </Link>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* TAB CONTENT 2: TÀI KHOẢN NGÂN HÀNG HOST (isOwner only) */}
      {isOwner && activeTab === "bank" && (
        <RequireAuth>
          <section className="rounded-3xl border border-slate-200/90 bg-white p-4 shadow-xs sm:p-5 space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                  Tài khoản ngân hàng nhận tiền cọc & chia sân
                </h2>
                <p className="text-[11px] text-slate-500">
                  Hệ thống CLVL sẽ tự động giải ngân tiền cọc VietQR về tài khoản này sau khi trận đấu hoàn tất.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Ngân hàng thụ hưởng:
                </label>
                <select
                  value={bankForm.bankId}
                  onChange={(e) => {
                    const selected = BANK_LIST.find((b) => b.id === e.target.value);
                    setBankForm((p) => ({
                      ...p,
                      bankId: e.target.value,
                      bankName: selected?.name || e.target.value,
                    }));
                  }}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-emerald-500 focus:bg-white"
                >
                  {BANK_LIST.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Số tài khoản:
                </label>
                <input
                  type="text"
                  value={bankForm.accountNumber}
                  onChange={(e) =>
                    setBankForm((p) => ({ ...p, accountNumber: e.target.value }))
                  }
                  placeholder="Ví dụ: 0988888888"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Tên chủ tài khoản (Viết hoa không dấu):
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
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-400">
                🛡️ Thông tin được mã hóa bảo mật chuẩn VietQR.
              </span>
              <button
                type="button"
                disabled={updateBankMutation.isPending}
                onClick={() => updateBankMutation.mutate()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
              >
                {updateBankMutation.isPending ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Lưu tài khoản</span>
                  </>
                )}
              </button>
            </div>
          </section>
        </RequireAuth>
      )}

      {/* TAB CONTENT 3: CHỈNH SỬA HỒ SƠ & CÀI ĐẶT (isOwner only) */}
      {isOwner && activeTab === "edit" && (
        <RequireAuth>
          <section className="rounded-3xl border border-slate-200/90 bg-white p-4 shadow-xs sm:p-5 space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <Edit3 className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                  Chỉnh sửa thông tin cá nhân
                </h2>
                <p className="text-[11px] text-slate-500">
                  Cập nhật tên, trình độ và phong cách thi đấu cầu lông của bạn.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Tên hiển thị:
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, name: e.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Giới thiệu bản thân (Bio):
                </label>
                <textarea
                  rows={2}
                  value={editForm.bio}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, bio: e.target.value }))
                  }
                  placeholder="Chia sẻ kinh nghiệm chơi cầu lông, sở thích hoặc thói quen..."
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-medium text-slate-900 outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Trình độ:
                  </label>
                  <select
                    value={editForm.skillLevel}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, skillLevel: e.target.value }))
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-emerald-500 focus:bg-white"
                  >
                    {SKILL_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Tay thuận:
                  </label>
                  <select
                    value={editForm.dominantHand}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, dominantHand: e.target.value }))
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-emerald-500 focus:bg-white"
                  >
                    <option value="right">Tay phải</option>
                    <option value="left">Tay trái</option>
                    <option value="ambidextrous">Cả hai tay</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Vị trí ưa thích:
                  </label>
                  <select
                    value={editForm.preferredPosition}
                    onChange={(e) =>
                      setEditForm((p) => ({
                        ...p,
                        preferredPosition: e.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-emerald-500 focus:bg-white"
                  >
                    <option value="all-round">Công thủ toàn diện</option>
                    <option value="front">Bắt lưới & Tạt cầu</option>
                    <option value="back">Đập cầu & Công sau</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Khu vực (Quận/Huyện):
                  </label>
                  <input
                    type="text"
                    value={editForm.district}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, district: e.target.value }))
                    }
                    placeholder="Quận 10, Tân Bình..."
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={updateProfileMutation.isPending}
                onClick={() => updateProfileMutation.mutate()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Lưu thay đổi</span>
                  </>
                )}
              </button>
            </div>

            {/* Logout Action */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Đăng xuất khỏi phiên làm việc hiện tại
              </span>
              <button
                type="button"
                onClick={signOutSession}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 active:scale-95"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </section>
        </RequireAuth>
      )}

      {/* AVATAR UPLOAD & CROP MODAL */}
      <AvatarUploadModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatar={avatarUrl}
        userName={user.name}
        onSuccess={(newAvatarUrl) => {
          qc.invalidateQueries({ queryKey: ["profile", params.id] });
          if (currentUser) {
            useAuthStore.setState((s) => ({
              ...s,
              user: s.user ? { ...s.user, avatar: newAvatarUrl } : null,
            }));
          }
          setSuccessToast("Đã cập nhật ảnh đại diện mới thành công!");
          setTimeout(() => setSuccessToast(null), 3500);
        }}
      />
    </div>
  );
}
