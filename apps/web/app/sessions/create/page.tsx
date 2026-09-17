"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Coins,
  HelpCircle,
  Info,
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
import { SkillBadge } from "@/components/ui/SkillBadge";
import { DualSkillRangeSlider } from "@/components/ui/DualSkillRangeSlider";
import { api, sessionsApi, venuesApi } from "@/lib/api";

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
    title: "Đôi (Doubles)",
    desc: "Đánh đôi tự do (4 - 8 người)",
    icon: "👥",
  },
  {
    value: "mixed doubles",
    title: "Đôi Nam Nữ",
    desc: "Giao lưu đôi nam nữ hỗn hợp",
    icon: "👫",
  },
  {
    value: "singles",
    title: "Đơn (Singles)",
    desc: "Đấu đơn 1 vs 1 rèn kỹ thuật",
    icon: "👤",
  },
];

const TITLE_SUGGESTIONS = [
  "🔥 Giao lưu phong trào vui vẻ tối nay",
  "🏸 Tuyển đôi nam / nữ trình TB-TB+",
  "⚡ Kèo sáng rèn thể lực & giao lưu",
  "🏆 Đánh đôi nâng cao - cọ xát kinh nghiệm",
  "🌱 Kèo vui vẻ chào đón Newbie & Yếu+",
];

const NOTE_TAGS = [
  "🏸 Cầu Thành Công / Hải Yến chất lượng",
  "💧 Tiền sân bao gồm nước khoáng / trà đá",
  "⏰ Vui lòng đến sớm 10 phút để khởi động",
  "🤝 Tinh thần giao lưu thể thao, vui vẻ, hòa đồng",
  "🛵 Có bãi đỗ xe máy & ô tô thuận tiện",
  "👟 Trang bị trang phục & giày cầu lông phù hợp",
];

const CANCEL_POLICIES = [
  {
    hours: 6,
    label: "Trước 6 tiếng",
    desc: "Linh hoạt cho người bận rộn",
  },
  {
    hours: 12,
    label: "Trước 12 tiếng",
    desc: "Khuyên dùng (Đủ thời gian tìm người thay)",
    popular: true,
  },
  {
    hours: 24,
    label: "Trước 24 tiếng",
    desc: "Nghiêm ngặt, kế hoạch chắc chắn",
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
    | "tomorrow_18"
    | "tomorrow_1930"
    | "sat_08"
    | "sun_08",
) {
  const d = new Date();
  if (type === "tonight_18") {
    d.setHours(18, 0, 0, 0);
  } else if (type === "tonight_1930") {
    d.setHours(19, 30, 0, 0);
  } else if (type === "tomorrow_18") {
    d.setDate(d.getDate() + 1);
    d.setHours(18, 0, 0, 0);
  } else if (type === "tomorrow_1930") {
    d.setDate(d.getDate() + 1);
    d.setHours(19, 30, 0, 0);
  } else if (type === "sat_08") {
    const day = d.getDay();
    const diff = (6 - day + 7) % 7 || 7;
    d.setDate(d.getDate() + diff);
    d.setHours(8, 0, 0, 0);
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
};

function CreateSessionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editSessionId = searchParams.get("edit");
  const submitLockRef = useRef(false);

  const [form, setForm] = useState<SessionFormState>(emptyForm);
  const [selectedVenue, setSelectedVenue] = useState<VenueSuggestion | null>(
    null,
  );
  const [formHydrated, setFormHydrated] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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
    });
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
    onSuccess: (session) => {
      const sessionId = session.id ?? session._id ?? session.slug;
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
    };
  }, [form, editSessionId]);

  if (isLoadingEditSession) {
    return (
      <RequireAuth>
        <div className="mx-auto max-w-2xl py-16 text-center">
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
      <div className="mx-auto max-w-6xl space-y-6 pb-20">
        {/* Top Breadcrumb & Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-emerald-700"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Quay lại Khám phá</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 border border-emerald-200">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              Tổ chức buổi chơi
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 border border-sky-200">
              <ShieldCheck className="h-3.5 w-3.5 text-sky-600" />
              Ký quỹ VietQR chống bùng
            </span>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {isEditing
              ? "Chỉnh sửa buổi cầu lông"
              : "Tổ chức buổi cầu lông mới"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Điền thông tin buổi chơi, chọn sân và thiết lập ký quỹ cọc tự động để kết nối bạn chơi đúng trình độ.
          </p>
        </div>

        {formError && (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-sm text-rose-800 animate-in fade-in">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-600" />
            <span className="font-medium">{formError}</span>
          </div>
        )}

        {/* 2-Column Grid Layout on Desktop */}
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Main Form: 7 columns on Desktop */}
          <div className="lg:col-span-7 xl:col-span-8">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (submitLockRef.current || createMutation.isPending) return;
                createMutation.mutate();
              }}
              className="space-y-6"
            >
              {/* SECTION 1: THÔNG TIN CƠ BẢN */}
              <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Thông tin cơ bản
                    </h2>
                    <p className="text-xs text-slate-500">
                      Tên buổi chơi và loại hình giao lưu
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-5">
                  {/* Title */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Tên buổi chơi <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={120}
                      value={form.title}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, title: e.target.value }))
                      }
                      placeholder="Ví dụ: Kèo đôi nam nữ tối thứ 6 phong trào vui vẻ..."
                      className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                    />

                    {/* Quick Title Suggestions */}
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-medium text-slate-400">
                        Gợi ý:
                      </span>
                      {TITLE_SUGGESTIONS.map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({ ...prev, title: sug }))
                          }
                          className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Match Type */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Hình thức thi đấu
                    </label>
                    <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
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
                            className={`flex flex-col items-start rounded-2xl border p-3.5 text-left transition ${isSelected
                              ? "border-emerald-500 bg-emerald-50/70 shadow-sm"
                              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                              }`}
                          >
                            <div className="flex w-full items-center justify-between">
                              <span className="text-xl">{type.icon}</span>
                              {isSelected && (
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                              )}
                            </div>
                            <div
                              className={`mt-2 font-semibold text-sm ${isSelected
                                ? "text-emerald-950"
                                : "text-slate-800"
                                }`}
                            >
                              {type.title}
                            </div>
                            <div className="mt-0.5 text-[11px] text-slate-500">
                              {type.desc}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION 2: ĐỊA ĐIỂM & THỜI GIAN */}
              <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Địa điểm & Thời gian
                    </h2>
                    <p className="text-xs text-slate-500">
                      Chọn sân cầu lông từ hơn 1,000+ sân và lịch thi đấu
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-5">
                  {/* Venue Search & Picker */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Sân cầu lông <span className="text-rose-500">*</span>
                    </label>

                    {selectedVenue && form.venueName === selectedVenue.name ? (
                      <div className="mt-1.5 flex items-center justify-between rounded-2xl border border-emerald-300 bg-emerald-50/80 p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white">
                            <MapPin className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 font-bold text-slate-900">
                              <span>{selectedVenue.name}</span>
                              <span className="rounded-md bg-emerald-200/80 px-2 py-0.5 text-[11px] font-semibold text-emerald-900">
                                Đã chọn sân
                              </span>
                            </div>
                            <div className="mt-0.5 text-xs text-slate-600">
                              {[selectedVenue.district, selectedVenue.city]
                                .filter(Boolean)
                                .join(" · ")}
                            </div>
                            <div className="text-xs text-slate-500 line-clamp-1">
                              {selectedVenue.address}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedVenue(null)}
                          className="rounded-xl border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                        >
                          Đổi sân
                        </button>
                      </div>
                    ) : (
                      <div className="mt-1.5 space-y-2">
                        <div className="relative">
                          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
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
                            placeholder="Gõ tên sân hoặc khu vực (Ví dụ: Kỳ Hòa, Lan Anh, Tân Bình, Quận 10...)"
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
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
                              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        {venueSearch.length >= 1 && (
                          <div className="max-h-64 overflow-y-auto rounded-2xl border border-emerald-200 bg-emerald-50/40 p-2 shadow-inner">
                            <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                              Gợi ý sân phù hợp ({venueSuggestions.length})
                            </div>
                            {venuesQuery.isLoading ? (
                              <div className="p-3 text-center text-xs text-slate-500">
                                Đang tìm sân trong hệ thống...
                              </div>
                            ) : venueSuggestions.length > 0 ? (
                              <div className="mt-1 grid gap-1">
                                {venueSuggestions.map((venue) => {
                                  const vId =
                                    venue.id ?? venue._id ?? venue.name;
                                  return (
                                    <button
                                      key={vId}
                                      type="button"
                                      onClick={() =>
                                        selectVenueSuggestion(venue)
                                      }
                                      className="flex items-center justify-between rounded-xl border border-transparent bg-white p-3 text-left transition hover:border-emerald-300 hover:bg-emerald-50/80"
                                    >
                                      <div>
                                        <div className="font-semibold text-sm text-slate-900">
                                          {venue.name}
                                        </div>
                                        <div className="text-xs text-emerald-700">
                                          {[venue.district, venue.city]
                                            .filter(Boolean)
                                            .join(" · ")}
                                        </div>
                                        <div className="truncate text-[11px] text-slate-500 max-w-md">
                                          {venue.address}
                                        </div>
                                      </div>
                                      <span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
                                        Chọn
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="p-3 text-xs text-slate-500">
                                Không tìm thấy sân trong danh mục. Bạn vẫn có thể sử dụng tên sân này và tự nhập Quận bên dưới.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* District & City */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
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
                        placeholder="Ví dụ: Quận 10, Tân Bình, Bình Thạnh..."
                        className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Thành phố
                      </label>
                      <input
                        type="text"
                        value={form.city}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, city: e.target.value }))
                        }
                        placeholder="Hồ Chí Minh"
                        className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                      />
                    </div>
                  </div>

                  {/* DateTime & Quick Shortcuts */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Ngày & Giờ bắt đầu <span className="text-rose-500">*</span>
                    </label>
                    <div className="mt-1.5 relative">
                      <input
                        type="datetime-local"
                        value={form.datetime}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            datetime: e.target.value,
                          }))
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                      />
                    </div>

                    {/* Quick Time Helpers */}
                    <div className="mt-2.5">
                      <span className="text-[11px] font-medium text-slate-400">
                        Chọn nhanh giờ phổ biến:
                      </span>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {[
                          {
                            key: "tonight_18",
                            label: "Tối nay 18:00",
                          },
                          {
                            key: "tonight_1930",
                            label: "Tối nay 19:30",
                          },
                          {
                            key: "tomorrow_18",
                            label: "Tối mai 18:00",
                          },
                          {
                            key: "tomorrow_1930",
                            label: "Tối mai 19:30",
                          },
                          {
                            key: "sat_08",
                            label: "Sáng T7 08:00",
                          },
                          {
                            key: "sun_08",
                            label: "Sáng CN 08:00",
                          },
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
                            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION 3: QUY MÔ & TRÌNH ĐỘ */}
              <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Quy mô & Trình độ yêu cầu
                    </h2>
                    <p className="text-xs text-slate-500">
                      Số lượng người chơi và khoảng trình độ phù hợp
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-6">
                  {/* Max Players Stepper */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Số người tối đa (bao gồm cả Host)
                    </label>
                    <div className="mt-2 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            maxPlayers: Math.max(2, prev.maxPlayers - 1),
                          }))
                        }
                        className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <div className="flex h-11 min-w-[120px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/70 font-bold text-slate-900">
                        <Users className="mr-2 h-4 w-4 text-emerald-600" />
                        {form.maxPlayers}
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            maxPlayers: Math.min(32, prev.maxPlayers + 1),
                          }))
                        }
                        className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"
                      >
                        <Plus className="h-4 w-4" />
                      </button>

                    </div>
                  </div>

                  {/* Skill Requirements: Dual-handle Range Slider */}
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
              </section>

              {/* SECTION 4: CHI PHÍ & KÝ QUỸ CỌC (ESCROW) */}
              <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold text-sm">
                    4
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Chi phí & Ký quỹ cọc
                    </h2>
                    <p className="text-xs text-slate-500">
                      Cách chia tiền sân và thiết lập cọc giữ chỗ chống bùng kèo
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-6">
                  {/* Price Split vs Fixed Price */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Hình thức chi phí sân
                    </label>
                    <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            priceSplit: true,
                            price: 0,
                          }))
                        }
                        className={`rounded-2xl border p-4 text-left transition ${form.priceSplit
                          ? "border-emerald-500 bg-emerald-50/80 ring-1 ring-emerald-300"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-slate-900">
                            🤝 Chia đều tại sân
                          </span>
                          {form.priceSplit && (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          )}
                        </div>
                        <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                          Tiền sân và cầu sẽ được chia đều cho tất cả người tham gia sau khi kết thúc buổi chơi.
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
                        className={`rounded-2xl border p-4 text-left transition ${!form.priceSplit
                          ? "border-emerald-500 bg-emerald-50/80 ring-1 ring-emerald-300"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-slate-900">
                            🎟️ Thu phí cố định / người
                          </span>
                          {!form.priceSplit && (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          )}
                        </div>
                        <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                          Quy định mức tiền cố định cho mỗi người tham gia (bao gồm cả tiền sân & cầu).
                        </p>
                      </button>
                    </div>

                    {/* If fixed price: show input & presets */}
                    {!form.priceSplit && (
                      <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                        <label className="block text-xs font-semibold text-slate-700">
                          Mức phí mỗi người tham gia (VND):
                        </label>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
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
                            className="w-44 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-900 outline-none focus:border-emerald-400"
                          />
                          <span className="text-xs text-slate-500">VNĐ / người</span>

                          <div className="ml-auto flex flex-wrap gap-1.5">
                            {[50000, 70000, 80000, 100000].map((amt) => (
                              <button
                                key={amt}
                                type="button"
                                onClick={() =>
                                  setForm((prev) => ({ ...prev, price: amt }))
                                }
                                className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition ${form.price === amt
                                  ? "border-emerald-400 bg-emerald-100 text-emerald-800"
                                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                  }`}
                              >
                                {amt.toLocaleString("vi-VN")}đ
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Escrow Deposit Switch & Settings */}
                  <div className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-5 w-5 text-emerald-600" />
                          <span className="font-bold text-slate-900 text-sm">
                            Yêu cầu đặt cọc giữ chỗ (Chống bùng kèo)
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-600 leading-relaxed max-w-xl">
                          Người chơi tham gia phải chuyển cọc qua VietQR để xác nhận giữ chỗ. Tiền được giữ an toàn trên hệ thống CLVL Escrow và quyết toán tự động sau buổi chơi.
                        </p>
                      </div>

                      {/* Switch Toggle */}
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
                        <div className="h-6 w-11 rounded-full bg-slate-200 transition after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-focus:outline-none" />
                      </label>
                    </div>

                    {form.depositRequired && (
                      <div className="mt-5 space-y-4 border-t border-emerald-200/80 pt-4">
                        {/* Deposit Amount */}
                        <div>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                              Số tiền cọc mỗi người:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
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
                                  className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${form.depositAmount === amt
                                    ? "border-emerald-500 bg-emerald-600 text-white"
                                    : "border-emerald-200 bg-white text-emerald-800 hover:bg-emerald-100"
                                    }`}
                                >
                                  {amt.toLocaleString("vi-VN")}đ
                                  {amt === 50000 && " (Gợi ý)"}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="mt-2 flex items-center gap-2">
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
                              className="w-44 rounded-xl border border-emerald-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500"
                            />
                            <span className="text-xs font-medium text-slate-600">
                              VNĐ / người
                            </span>
                          </div>
                        </div>

                        {/* Cancellation Policy */}
                        <div>
                          <span className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                            Chính sách hủy hoàn cọc 100%:
                          </span>
                          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
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
                                  className={`rounded-xl border p-3 text-left transition ${isSelected
                                    ? "border-emerald-500 bg-white ring-1 ring-emerald-300 font-semibold"
                                    : "border-emerald-200/80 bg-emerald-50/40 hover:bg-white"
                                    }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-900">
                                      {pol.label}
                                    </span>
                                    {isSelected && (
                                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                    )}
                                  </div>
                                  <div className="mt-0.5 text-[11px] text-slate-500 font-normal">
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

              {/* SECTION 5: GHI CHÚ & QUY TẮC */}
              <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 font-bold text-sm">
                    5
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Ghi chú & Nội quy buổi chơi
                    </h2>
                    <p className="text-xs text-slate-500">
                      Dặn dò về loại cầu, nước uống, số sân hoặc nội quy
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <textarea
                    rows={4}
                    maxLength={1000}
                    value={form.notes}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, notes: e.target.value }))
                    }
                    placeholder="Ví dụ: Đánh sân số 3 và 4. Đã có sẵn trà đá, cầu Thành Công 77. Anh em đến đúng giờ để cùng khởi động nhé..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  />

                  {/* Quick Note Tags */}
                  <div>
                    <span className="text-[11px] font-medium text-slate-400">
                      Bấm để thêm nhanh vào ghi chú:
                    </span>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
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
                          className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* ACTION BUTTON BAR */}
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>
                    Thông tin minh bạch · Tự động tạo mã Check-in 6 số
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href="/explore"
                    className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    Hủy bỏ
                  </Link>
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-7 py-3 text-sm font-bold text-white shadow-md shadow-emerald-500/20 transition hover:bg-emerald-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
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

          {/* Right Column: Sticky Live Preview on Desktop (5 cols) */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-24 space-y-6">
              {/* Preview Card Header */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Xem trước thẻ hiển thị (Live Preview)
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Explore Card
                  </span>
                </div>

                <div className="mt-4">
                  <MatchCard session={previewSession as any} />
                </div>
              </div>

              {/* Host Tips Card */}
              <div className="rounded-3xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50/80 to-white p-5 shadow-sm">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-950">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  Mẹo tổ chức trận đấu thành công
                </div>
                <ul className="mt-3 space-y-2 text-xs text-slate-600 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <Check className="h-3.5 w-3.5 flex-shrink-0 text-emerald-600 mt-0.5" />
                    <span>
                      <strong>Ký quỹ VietQR:</strong> Giúp hạn chế đến 98% tình trạng người tham gia hủy sát giờ hoặc bùng kèo.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-3.5 w-3.5 flex-shrink-0 text-emerald-600 mt-0.5" />
                    <span>
                      <strong>Khoảng trình độ:</strong> Ghi rõ từ trình độ thấp đến cao giúp trận đấu cân sức và vui vẻ hơn.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-3.5 w-3.5 flex-shrink-0 text-emerald-600 mt-0.5" />
                    <span>
                      <strong>Mã Check-in:</strong> Sau khi tạo, bạn sẽ có mã 6 số để xác nhận người chơi có mặt tại sân.
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
