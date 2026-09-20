"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  EyeOff,
  FileText,
  Image as ImageIcon,
  MapPin,
  Minus,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { MatchCard } from "@/components/cards/MatchCard";
import { DualSkillRangeSlider } from "@/components/ui/DualSkillRangeSlider";
import { api, sessionsApi, venuesApi } from "@/lib/api";
import { BADMINTON_COVER_PRESETS } from "@/lib/badminton-covers";

type SessionFormState = {
  title: string;
  venueName: string;
  venueId?: string;
  district: string;
  city: string;
  datetime: string;
  skillRequirements: string[];
  maxPlayers: number;
  matchType: string;
  price: number;
  priceSplit: boolean;
  depositRequired: boolean;
  depositAmount: number;
  cancelPolicyHours: number;
  notes: string;
  coverImage?: string;
};

type VenueSuggestion = {
  id?: string;
  _id?: string;
  name: string;
  address: string;
  district: string;
  city: string;
};

const MATCH_TYPES = [
  {
    value: "doubles",
    title: "Đôi",
    sub: "4 - 8 người",
    icon: "👥",
  },
  {
    value: "mixed doubles",
    title: "Đôi Nam Nữ",
    sub: "Hỗn hợp",
    icon: "👫",
  },
  {
    value: "singles",
    title: "Đơn",
    sub: "1 vs 1",
    icon: "👤",
  },
];

const TITLE_SUGGESTIONS = [
  "🔥 Giao lưu phong trào vui vẻ tối nay",
  "🏸 Tuyển đôi nam / nữ trình TB-TB+",
  "⚡ Kèo sáng rèn thể lực & giao lưu",
  "🌱 Kèo vui vẻ chào đón Newbie & Yếu+",
];

const NOTE_TAGS = [
  "🏸 Cầu Thành Công / Hải Yến",
  "💧 Đã có nước khoáng / trà đá",
  "⏰ Đến sớm 10p khởi động",
  "🤝 Giao lưu vui vẻ, hòa đồng",
  "🛵 Có bãi đỗ xe máy & ô tô",
];

const CANCEL_POLICIES = [
  {
    hours: 6,
    label: "Trước 6h",
    desc: "Linh hoạt",
  },
  {
    hours: 12,
    label: "Trước 12h",
    desc: "Khuyên dùng",
    popular: true,
  },
  {
    hours: 24,
    label: "Trước 24h",
    desc: "Chắc chắn",
  },
];

function toDateTimeLocalValue(value: string | Date | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function getPresetDateTime(
  type:
    | "tonight_18"
    | "tonight_1930"
    | "tomorrow_1930"
    | "sun_08",
) {
  const d = new Date();
  if (type === "tonight_18") {
    d.setHours(18, 0, 0, 0);
  } else if (type === "tonight_1930") {
    d.setHours(19, 30, 0, 0);
  } else if (type === "tomorrow_1930") {
    d.setDate(d.getDate() + 1);
    d.setHours(19, 30, 0, 0);
  } else if (type === "sun_08") {
    const day = d.getDay();
    const diff = (7 - day) % 7 || 7;
    d.setDate(d.getDate() + diff);
    d.setHours(8, 0, 0, 0);
  }
  return toDateTimeLocalValue(d);
}

const emptyForm: SessionFormState = {
  title: "",
  venueName: "",
  district: "",
  city: "Hồ Chí Minh",
  datetime: "",
  skillRequirements: ["TBY", "TBY+", "TB-", "TB", "TB+"],
  maxPlayers: 8,
  matchType: "doubles",
  price: 0,
  priceSplit: true,
  depositRequired: true,
  depositAmount: 50000,
  cancelPolicyHours: 12,
  notes: "",
  coverImage: "",
};

function CreateSessionForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const editSessionId = searchParams.get("edit");
  const submitLockRef = useRef(false);

  const [form, setForm] = useState<SessionFormState>(emptyForm);
  const [selectedVenue, setSelectedVenue] = useState<VenueSuggestion | null>(null);
  const [formHydrated, setFormHydrated] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  const venueSearch = form.venueName.trim();

  const venuesQuery = useQuery({
    queryKey: ["venue-search", venueSearch],
    queryFn: async () => {
      const response = await venuesApi.listVenues({
        q: venueSearch,
        limit: 8,
      });
      return response.data.data.venues as VenueSuggestion[];
    },
    enabled:
      venueSearch.length >= 1 &&
      (!selectedVenue || form.venueName !== selectedVenue.name),
    staleTime: 10_000,
  });

  const venueSuggestions = venuesQuery.data ?? [];

  const selectVenueSuggestion = (venue: VenueSuggestion) => {
    setForm((previous) => ({
      ...previous,
      venueName: venue.name,
      venueId: venue.id ?? venue._id,
      district: venue.district || previous.district,
      city: venue.city || previous.city,
    }));
    setSelectedVenue(venue);
  };

  const editingSessionQuery = useQuery({
    queryKey: ["session-edit", editSessionId],
    queryFn: async () => {
      const response = await api.get(`/sessions/${editSessionId}`);
      return response.data.data.session;
    },
    enabled: Boolean(editSessionId),
  });

  useEffect(() => {
    if (!editSessionId || formHydrated || !editingSessionQuery.data) {
      return;
    }

    const session = editingSessionQuery.data;
    setForm({
      title: session.title ?? "",
      venueName: session.venueName ?? "",
      district: session.district ?? "",
      city: session.city ?? "Hồ Chí Minh",
      datetime: toDateTimeLocalValue(session.datetime),
      skillRequirements:
        session.skillRequirements ??
        (session.skillRequirement ? [session.skillRequirement] : ["TB"]),
      maxPlayers: session.maxPlayers ?? 8,
      matchType: session.matchType ?? "doubles",
      price: session.price ?? 0,
      priceSplit: (session.price ?? 0) === 0,
      depositRequired: session.depositRequired ?? true,
      depositAmount: session.depositAmount ?? 50000,
      cancelPolicyHours: session.cancelPolicyHours ?? 12,
      notes: session.notes ?? "",
      coverImage: session.coverImage ?? session.imageUrl ?? session.image ?? "",
    });

    if (session.notes || session.coverImage) {
      setIsOptionsOpen(true);
    }

    setFormHydrated(true);
  }, [editSessionId, editingSessionQuery.data, formHydrated]);

  const isEditing = Boolean(editSessionId);
  const isLoadingEditSession = isEditing && editingSessionQuery.isLoading;

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!form.title.trim()) {
        throw new Error("Vui lòng nhập tên buổi chơi.");
      }
      if (!form.venueName.trim()) {
        throw new Error("Vui lòng chọn hoặc nhập tên sân cầu lông.");
      }
      if (!form.district.trim()) {
        throw new Error("Vui lòng nhập quận / huyện của sân.");
      }
      if (!form.datetime) {
        throw new Error("Vui lòng chọn ngày & giờ tổ chức.");
      }
      if (form.skillRequirements.length === 0) {
        throw new Error("Vui lòng chọn ít nhất một mức trình độ yêu cầu.");
      }

      const payload = {
        ...form,
        datetime: form.datetime
          ? new Date(form.datetime).toISOString()
          : form.datetime,
        price: form.priceSplit ? 0 : Number(form.price) || 0,
        depositAmount: form.depositRequired
          ? Number(form.depositAmount) || 50000
          : 0,
      };

      const response = editSessionId
        ? await sessionsApi.updateSession(editSessionId, payload)
        : await api.post("/sessions", payload);

      return response.data.data.session;
    },
    onMutate: () => {
      submitLockRef.current = true;
      setFormError(null);
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Đã có lỗi xảy ra khi tạo buổi chơi. Vui lòng thử lại.";
      setFormError(msg);
    },
    onSuccess: async (session) => {
      const sessionId =
        session?.id ?? session?._id ?? session?.slug ?? editSessionId;
      await queryClient.invalidateQueries({ queryKey: ["session"] });
      await queryClient.invalidateQueries({ queryKey: ["sessions"] });
      await queryClient.invalidateQueries({ queryKey: ["session-edit"] });
      if (sessionId) {
        router.replace(`/sessions/${sessionId}`);
        return;
      }
      router.replace("/explore");
    },
    onSettled: () => {
      submitLockRef.current = false;
    },
  });

  // Live preview session mock object
  const previewSession = useMemo(() => {
    return {
      id: editSessionId || "preview-id",
      title: form.title.trim() || "Buổi giao lưu cầu lông",
      venueName: form.venueName.trim() || "Sân Cầu Lông (Chưa chọn)",
      district: form.district.trim() || "Hồ Chí Minh",
      city: form.city.trim() || "Hồ Chí Minh",
      datetime: form.datetime || new Date().toISOString(),
      currentPlayers: 1,
      currentPlayersCount: 1,
      maxPlayers: form.maxPlayers || 8,
      skillRequirements:
        form.skillRequirements.length > 0
          ? form.skillRequirements
          : ["TB"],
      matchType: form.matchType,
      price: form.priceSplit ? 0 : Number(form.price) || 0,
      depositRequired: form.depositRequired,
      depositAmount: form.depositAmount,
      status: "open",
      coverImage: form.coverImage,
      notes: form.notes,
    };
  }, [form, editSessionId]);

  if (isLoadingEditSession) {
    return (
      <RequireAuth>
        <div className="mx-auto max-w-xl py-16 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="mt-3 text-sm font-medium text-slate-600">
            Đang tải thông tin buổi chơi...
          </p>
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <div className="mx-auto max-w-5xl space-y-4 pb-16 sm:space-y-6 sm:pb-24">
        {/* Top Header: Compact & Mobile-friendly */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 sm:pb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-2xl">
                {isEditing ? "Chỉnh sửa buổi cầu lông" : "Tạo kèo cầu lông mới"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile preview toggle button */}
            <button
              type="button"
              onClick={() => setShowMobilePreview((prev) => !prev)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 lg:hidden"
            >
              {showMobilePreview ? (
                <>
                  <EyeOff className="h-3.5 w-3.5 text-slate-500" />
                  <span>Ẩn thẻ</span>
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Xem trước</span>
                </>
              )}
            </button>

            <span className="hidden items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700 sm:inline-flex">
              <ShieldCheck className="h-3.5 w-3.5 text-sky-600" />
              VietQR Escrow
            </span>
          </div>
        </div>

        {formError && (
          <div className="flex items-center gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 sm:p-3.5 sm:text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-600 sm:h-5 sm:w-5" />
            <span className="font-medium">{formError}</span>
          </div>
        )}

        {/* Mobile Live Preview Drawer (Collapsible) */}
        {showMobilePreview && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-3 shadow-xs lg:hidden">
            <div className="mb-2 flex items-center justify-between text-xs font-bold text-emerald-900">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                Thẻ hiển thị thực tế trên Explore
              </span>
              <button
                type="button"
                onClick={() => setShowMobilePreview(false)}
                className="text-[11px] text-slate-500 hover:text-slate-800"
              >
                Đóng
              </button>
            </div>
            <MatchCard session={previewSession as any} />
          </div>
        )}

        {/* Form & Desktop Preview Split */}
        <div className="grid gap-5 lg:grid-cols-12">
          {/* Main Form: 7 to 8 cols on Desktop */}
          <div className="lg:col-span-7 xl:col-span-8">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (submitLockRef.current || createMutation.isPending) return;
                createMutation.mutate();
              }}
              className="space-y-4 sm:space-y-5"
            >
              {/* CARD 1: SÂN & THỜI GIAN & THỂ THỨC */}
              <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs sm:rounded-3xl sm:p-5">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-xs font-bold text-emerald-800">
                    1
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                      Thông tin sân & Thời gian
                    </h2>
                    <p className="text-[11px] text-slate-500 sm:text-xs">
                      Thể thức thi đấu, địa điểm sân và lịch đánh
                    </p>
                  </div>
                </div>

                <div className="mt-3.5 space-y-3.5 sm:mt-4 sm:space-y-4">
                  {/* Match Type (Compact Segmented Tabs) */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      Hình thức thi đấu
                    </label>
                    <div className="mt-1.5 grid grid-cols-3 gap-1.5 rounded-xl bg-slate-100 p-1">
                      {MATCH_TYPES.map((type) => {
                        const isSelected = form.matchType === type.value;
                        return (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                matchType: type.value,
                              }))
                            }
                            className={`flex flex-col items-center justify-center rounded-lg py-1.5 transition-all sm:py-2 ${isSelected
                              ? "bg-white text-emerald-950 shadow-xs ring-1 ring-slate-200/80 font-bold"
                              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                              }`}
                          >
                            <span className="text-base">{type.icon}</span>
                            <span className="text-xs">{type.title}</span>
                            <span className="text-[9.5px] text-slate-400 font-normal">
                              {type.sub}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Tên buổi chơi <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] text-slate-400">
                        {form.title.length}/120
                      </span>
                    </div>
                    <input
                      type="text"
                      maxLength={120}
                      value={form.title}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, title: e.target.value }))
                      }
                      placeholder="Ví dụ: Kèo đôi nam nữ tối thứ 6 phong trào vui vẻ..."
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 sm:text-sm"
                    />

                    {/* Compact Title Suggestions */}
                    <div className="mt-1.5 flex flex-wrap items-center gap-1">
                      <span className="text-[10px] text-slate-400">Gợi ý:</span>
                      {TITLE_SUGGESTIONS.map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({ ...prev, title: sug }))
                          }
                          className="rounded-md border border-slate-200/80 bg-slate-50 px-2 py-0.5 text-[10.5px] text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Venue Search & Autocomplete */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      Sân cầu lông <span className="text-rose-500">*</span>
                    </label>

                    {selectedVenue && form.venueName === selectedVenue.name ? (
                      <div className="mt-1 flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50/70 p-2.5 shadow-2xs sm:p-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
                            <MapPin className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="truncate text-xs font-bold text-slate-900 sm:text-sm">
                                {selectedVenue.name}
                              </span>
                              <span className="rounded bg-emerald-200/80 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-900">
                                Đã chọn
                              </span>
                            </div>
                            <div className="truncate text-[11px] text-slate-500">
                              {[selectedVenue.district, selectedVenue.city]
                                .filter(Boolean)
                                .join(" · ")}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedVenue(null)}
                          className="flex-shrink-0 rounded-lg border border-emerald-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-emerald-700 transition hover:bg-emerald-100"
                        >
                          Đổi sân
                        </button>
                      </div>
                    ) : (
                      <div className="mt-1 space-y-1.5">
                        <div className="relative">
                          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <input
                            type="text"
                            value={form.venueName}
                            onChange={(e) => {
                              setForm((prev) => ({
                                ...prev,
                                venueName: e.target.value,
                                venueId: undefined,
                              }));
                            }}
                            placeholder="Gõ tên sân (Kỳ Hòa, Lan Anh, Tân Bình, Quận 10...)"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-8 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 sm:text-sm"
                          />
                          {form.venueName && (
                            <button
                              type="button"
                              onClick={() =>
                                setForm((prev) => ({
                                  ...prev,
                                  venueName: "",
                                  venueId: undefined,
                                }))
                              }
                              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        {venueSearch.length >= 1 && (
                          <div className="max-h-52 overflow-y-auto rounded-xl border border-emerald-200 bg-white p-1.5 shadow-sm">
                            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                              Gợi ý sân phù hợp ({venueSuggestions.length})
                            </div>
                            {venuesQuery.isLoading ? (
                              <div className="p-2 text-center text-xs text-slate-500">
                                Đang tìm kiếm sân...
                              </div>
                            ) : venueSuggestions.length > 0 ? (
                              <div className="grid gap-1">
                                {venueSuggestions.map((venue) => {
                                  const vId =
                                    venue.id ?? venue._id ?? venue.name;
                                  return (
                                    <button
                                      key={vId}
                                      type="button"
                                      onClick={() => selectVenueSuggestion(venue)}
                                      className="flex items-center justify-between rounded-lg p-2 text-left transition hover:bg-emerald-50"
                                    >
                                      <div className="min-w-0 pr-2">
                                        <div className="truncate text-xs font-semibold text-slate-900">
                                          {venue.name}
                                        </div>
                                        <div className="truncate text-[11px] text-emerald-700">
                                          {[venue.district, venue.city]
                                            .filter(Boolean)
                                            .join(" · ")}
                                        </div>
                                        <div className="truncate text-[10px] text-slate-400">
                                          {venue.address}
                                        </div>
                                      </div>
                                      <span className="flex-shrink-0 rounded-md bg-emerald-100 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-800">
                                        Chọn
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="p-2 text-[11px] text-slate-500">
                                Không có trong danh mục. Bạn vẫn có thể dùng tên này và nhập Quận bên dưới.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* District & City (Inline 2-cols) */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Quận / Huyện <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.district}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            district: e.target.value,
                          }))
                        }
                        placeholder="Ví dụ: Quận 10, Tân Bình..."
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Thành phố
                      </label>
                      <input
                        type="text"
                        value={form.city}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, city: e.target.value }))
                        }
                        placeholder="Hồ Chí Minh"
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 sm:text-sm"
                      />
                    </div>
                  </div>

                  {/* DateTime & Quick Preset Chips */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      Ngày & Giờ bắt đầu <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={form.datetime}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          datetime: e.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 sm:text-sm"
                    />

                    {/* Quick Time Helper Chips */}
                    <div className="mt-1.5 flex flex-wrap items-center gap-1">
                      <span className="text-[10px] text-slate-400">Chọn nhanh:</span>
                      {[
                        { key: "tonight_18", label: "Tối nay 18:00" },
                        { key: "tonight_1930", label: "Tối nay 19:30" },
                        { key: "tomorrow_1930", label: "Tối mai 19:30" },
                        { key: "sun_08", label: "Sáng CN 08:00" },
                      ].map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              datetime: getPresetDateTime(item.key as any),
                            }))
                          }
                          className="rounded-md border border-slate-200/80 bg-slate-50 px-2 py-0.5 text-[10.5px] text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* CARD 2: NGƯỜI CHƠI, TRÌNH ĐỘ & CHI PHÍ */}
              <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs sm:rounded-3xl sm:p-5">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-xs font-bold text-emerald-800">
                    2
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                      Quy mô, Trình độ & Chi phí
                    </h2>
                    <p className="text-[11px] text-slate-500 sm:text-xs">
                      Số người, giới hạn kỹ năng và chính sách cọc VietQR
                    </p>
                  </div>
                </div>

                <div className="mt-3.5 space-y-4 sm:mt-4 sm:space-y-4.5">
                  {/* Max Players Stepper: Compact Inline Row */}
                  <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50/70 p-2.5 sm:p-3 border border-slate-200/70">
                    <div>
                      <div className="text-xs font-bold text-slate-900 sm:text-sm">
                        Số người tối đa
                      </div>
                      <div className="text-[10.5px] text-slate-500">
                        Bao gồm cả bạn (Host)
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            maxPlayers: Math.max(2, prev.maxPlayers - 1),
                          }))
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 active:scale-95"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <div className="flex h-8 min-w-[70px] items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-900 sm:text-sm">
                        <Users className="mr-1 h-3.5 w-3.5 text-emerald-600" />
                        {form.maxPlayers} người
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            maxPlayers: Math.min(32, prev.maxPlayers + 1),
                          }))
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 active:scale-95"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* DualSkillRangeSlider */}
                  <div>
                    <DualSkillRangeSlider
                      selectedSkills={form.skillRequirements}
                      onChange={(skills) =>
                        setForm((prev) => ({
                          ...prev,
                          skillRequirements: skills,
                        }))
                      }
                    />
                  </div>

                  {/* Price Split vs Fixed Price */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      Hình thức chi phí sân
                    </label>
                    <div className="mt-1.5 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            priceSplit: true,
                            price: 0,
                          }))
                        }
                        className={`rounded-xl border p-2.5 text-left transition ${form.priceSplit
                          ? "border-emerald-500 bg-emerald-50/80 ring-1 ring-emerald-300 font-semibold"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">
                            🤝 Chia đều tại sân
                          </span>
                          {form.priceSplit && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          )}
                        </div>
                        <p className="mt-0.5 text-[10.5px] text-slate-500 leading-tight">
                          Tiền sân & cầu chia đều sau trận
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            priceSplit: false,
                            price: prev.price > 0 ? prev.price : 70000,
                          }))
                        }
                        className={`rounded-xl border p-2.5 text-left transition ${!form.priceSplit
                          ? "border-emerald-500 bg-emerald-50/80 ring-1 ring-emerald-300 font-semibold"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">
                            🎟️ Cố định / người
                          </span>
                          {!form.priceSplit && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          )}
                        </div>
                        <p className="mt-0.5 text-[10.5px] text-slate-500 leading-tight">
                          Thu phí trọn gói mỗi thành viên
                        </p>
                      </button>
                    </div>

                    {/* Fixed Price Settings */}
                    {!form.priceSplit && (
                      <div className="mt-2 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/60 p-2.5">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            step={10000}
                            min={0}
                            value={form.price}
                            onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                price: Number(e.target.value),
                              }))
                            }
                            className="w-28 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-900 outline-none focus:border-emerald-400 sm:text-sm"
                          />
                          <span className="text-xs text-slate-500 font-medium">
                            đ / người
                          </span>
                        </div>

                        <div className="ml-auto flex flex-wrap gap-1">
                          {[50000, 70000, 80000, 100000].map((amt) => (
                            <button
                              key={amt}
                              type="button"
                              onClick={() =>
                                setForm((prev) => ({ ...prev, price: amt }))
                              }
                              className={`rounded-md border px-2 py-0.5 text-[10.5px] font-medium transition ${form.price === amt
                                ? "border-emerald-400 bg-emerald-100 text-emerald-800 font-bold"
                                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                }`}
                            >
                              {(amt / 1000)}k
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* VietQR Escrow Deposit Settings */}
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3 sm:p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-slate-900 sm:text-sm">
                            Ký quỹ đặt cọc VietQR (Chống bùng kèo)
                          </div>
                          <div className="text-[10.5px] text-slate-600 leading-tight">
                            Người chơi quét VietQR đặt cọc. Quyết toán tự động sau trận.
                          </div>
                        </div>
                      </div>

                      {/* iOS Toggle Switch */}
                      <label className="relative inline-flex cursor-pointer items-center flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={form.depositRequired}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              depositRequired: e.target.checked,
                            }))
                          }
                          className="peer sr-only"
                        />
                        <div className="h-5 w-9 rounded-full bg-slate-200 transition after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-focus:outline-none" />
                      </label>
                    </div>

                    {form.depositRequired && (
                      <div className="mt-3 space-y-3 border-t border-emerald-200/80 pt-3">
                        {/* Deposit Amount */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                            Tiền cọc mỗi người:
                          </span>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <input
                              type="number"
                              step={10000}
                              min={10000}
                              value={form.depositAmount}
                              onChange={(e) =>
                                setForm((prev) => ({
                                  ...prev,
                                  depositAmount: Number(e.target.value),
                                }))
                              }
                              className="w-24 rounded-lg border border-emerald-200 bg-white px-2 py-1 text-xs font-bold text-slate-900 outline-none focus:border-emerald-500"
                            />
                            <span className="text-[11px] text-slate-500 font-medium mr-1">
                              đ
                            </span>
                            {[30000, 50000, 70000, 100000].map((amt) => (
                              <button
                                key={amt}
                                type="button"
                                onClick={() =>
                                  setForm((prev) => ({
                                    ...prev,
                                    depositAmount: amt,
                                  }))
                                }
                                className={`rounded-md border px-2 py-0.5 text-[10.5px] font-semibold transition ${form.depositAmount === amt
                                  ? "border-emerald-500 bg-emerald-600 text-white"
                                  : "border-emerald-200 bg-white text-emerald-800 hover:bg-emerald-100"
                                  }`}
                              >
                                {amt === 50000 ? "50k (gợi ý)" : `${amt / 1000}k`}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Cancellation Policy (Segmented 3-button row) */}
                        <div>
                          <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                            Hủy hoàn cọc 100%:
                          </span>
                          <div className="grid grid-cols-3 gap-1.5">
                            {CANCEL_POLICIES.map((pol) => {
                              const isSelected =
                                form.cancelPolicyHours === pol.hours;
                              return (
                                <button
                                  key={pol.hours}
                                  type="button"
                                  onClick={() =>
                                    setForm((prev) => ({
                                      ...prev,
                                      cancelPolicyHours: pol.hours,
                                    }))
                                  }
                                  className={`rounded-xl border p-2 text-center transition ${isSelected
                                    ? "border-emerald-500 bg-white shadow-2xs ring-1 ring-emerald-300 font-bold"
                                    : "border-emerald-200/80 bg-emerald-50/40 hover:bg-white"
                                    }`}
                                >
                                  <div className="text-xs text-slate-900">
                                    {pol.label}
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-normal">
                                    {pol.desc}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* CARD 3: TÙY CHỌN (GHI CHÚ & ẢNH BÌA) - COLLAPSIBLE ACCORDION */}
              <section className="rounded-2xl border border-slate-200/90 bg-white shadow-xs sm:rounded-3xl overflow-hidden transition">
                <button
                  type="button"
                  onClick={() => setIsOptionsOpen((prev) => !prev)}
                  className="flex w-full items-center justify-between p-4 text-left hover:bg-slate-50/50 sm:p-5"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                      <FileText className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 sm:text-base">
                          Ghi chú & Ảnh bìa tùy chọn
                        </span>
                        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                          Không bắt buộc
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {form.notes || form.coverImage
                          ? "Đã tùy chỉnh ghi chú / ảnh bìa"
                          : "Dặn dò người chơi, chọn ảnh sân cầu lông..."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-slate-400">
                    {isOptionsOpen ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>
                </button>

                {isOptionsOpen && (
                  <div className="border-t border-slate-100 p-4 pt-3.5 sm:p-5 sm:pt-4 space-y-4">
                    {/* Notes Textarea */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Ghi chú & Nội quy buổi chơi
                      </label>
                      <textarea
                        rows={3}
                        maxLength={1000}
                        value={form.notes}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, notes: e.target.value }))
                        }
                        placeholder="Ví dụ: Đánh sân số 3. Đã chuẩn bị sẵn nước khoáng và cầu. Anh em đến sớm 10 phút nhé..."
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 sm:text-sm"
                      />

                      {/* Quick Note Tags */}
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {NOTE_TAGS.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => {
                              setForm((prev) => {
                                const current = prev.notes.trim();
                                const updated = current
                                  ? `${current}\n- ${tag.replace(/^[^a-zA-Z0-9À-ỹ]+/i, "")}`
                                  : `- ${tag.replace(/^[^a-zA-Z0-9À-ỹ]+/i, "")}`;
                                return { ...prev, notes: updated };
                              });
                            }}
                            className="rounded-md border border-slate-200/80 bg-slate-50 px-2 py-0.5 text-[10.5px] text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                          >
                            + {tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Cover Image Presets (Compact 3-column micro-grid) */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                          Ảnh bìa thẻ buổi đánh
                        </label>
                        {form.coverImage ? (
                          <button
                            type="button"
                            onClick={() =>
                              setForm((prev) => ({ ...prev, coverImage: "" }))
                            }
                            className="text-[10.5px] font-semibold text-emerald-700 hover:text-emerald-800"
                          >
                            Dùng ảnh mặc định
                          </button>
                        ) : null}
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {BADMINTON_COVER_PRESETS.map((preset) => {
                          const isSelected = form.coverImage === preset.url;
                          return (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() =>
                                setForm((prev) => ({
                                  ...prev,
                                  coverImage: isSelected ? "" : preset.url,
                                }))
                              }
                              className={`group relative h-20 overflow-hidden rounded-xl border text-left transition-all ${isSelected
                                ? "border-emerald-500 ring-2 ring-emerald-500 shadow-xs"
                                : "border-slate-200 hover:border-emerald-300"
                                }`}
                            >
                              <img
                                src={preset.url}
                                alt={preset.title}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                              {isSelected && (
                                <div className="absolute top-1.5 right-1.5 rounded-full bg-emerald-500 p-0.5 text-white shadow-xs">
                                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                                </div>
                              )}

                              <div className="absolute bottom-1.5 left-1.5 right-1.5">
                                <p className="text-[10px] font-bold text-white line-clamp-1 leading-tight">
                                  {preset.title}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Custom URL Input */}
                      <div className="mt-2.5">
                        <input
                          type="url"
                          value={form.coverImage || ""}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              coverImage: e.target.value,
                            }))
                          }
                          placeholder="Hoặc dán link ảnh sân của bạn (URL)..."
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* ACTION BUTTON BAR: Compact & Clean */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-xs">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span>Ký quỹ VietQR an toàn · Tự động cấp mã Check-in</span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href="/explore"
                    className="flex-1 sm:flex-initial text-center rounded-xl border border-slate-200 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    Hủy bỏ
                  </Link>
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-2 text-xs sm:text-sm font-bold text-white shadow-sm shadow-emerald-600/20 transition hover:bg-emerald-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {createMutation.isPending ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>{isEditing ? "Đang lưu..." : "Đang tạo..."}</span>
                      </>
                    ) : (
                      <>
                        <span>
                          {isEditing ? "Lưu thay đổi" : "Tạo buổi chơi ngay"}
                        </span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Desktop Live Preview & Tips Rail (4 to 5 cols) */}
          <div className="hidden lg:col-span-5 lg:block xl:col-span-4">
            <div className="sticky top-20 space-y-4">
              {/* Preview Card */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Xem trước thẻ Explore
                    </h3>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400">
                    Live Preview
                  </span>
                </div>

                <div className="mt-3">
                  <MatchCard session={previewSession as any} />
                </div>
              </div>

              {/* Tips Card */}
              <div className="rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/70 to-white p-4 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                  Mẹo tổ chức trận cầu đông vui
                </div>
                <ul className="mt-2.5 space-y-2 text-xs text-slate-600 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <Check className="h-3.5 w-3.5 flex-shrink-0 text-emerald-600 mt-0.5" />
                    <span>
                      <strong>Ký quỹ VietQR:</strong> Giúp hạn chế đến 98% tình trạng người tham gia bùng kèo.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-3.5 w-3.5 flex-shrink-0 text-emerald-600 mt-0.5" />
                    <span>
                      <strong>Trình độ rõ ràng:</strong> Chọn khoảng trình độ phù hợp giúp người xem dễ dàng quyết định tham gia.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-3.5 w-3.5 flex-shrink-0 text-emerald-600 mt-0.5" />
                    <span>
                      <strong>Mã Check-in:</strong> Sau khi tạo xong, bạn sẽ nhận được mã 6 số để điểm danh tại sân.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}

export default function CreateSessionPage() {
  return (
    <Suspense
      fallback={
        <div className="p-16 text-center text-slate-500">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="mt-3 text-sm font-medium text-slate-600">
            Đang tải biểu mẫu buổi chơi...
          </p>
        </div>
      }
    >
      <CreateSessionForm />
    </Suspense>
  );
}
