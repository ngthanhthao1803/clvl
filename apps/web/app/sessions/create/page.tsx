"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { RequireAuth } from "@/components/auth/RequireAuth";
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

const emptyForm: SessionFormState = {
  title: "",
  venueName: "",
  district: "",
  city: "Ho Chi Minh City",
  datetime: "",
  skillRequirements: ["TB"],
  maxPlayers: 8,
  matchType: "doubles",
  price: 0,
  priceSplit: true,
  depositRequired: true,
  depositAmount: 50000,
  cancelPolicyHours: 12,
  notes: "",
};

function toDateTimeLocalValue(value: string | Date | undefined) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function CreateSessionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editSessionId = searchParams.get("edit");
  const submitLockRef = useRef(false);
  const [form, setForm] = useState<SessionFormState>(emptyForm);
  const [selectedVenue, setSelectedVenue] = useState<VenueSuggestion | null>(null);
  const [formHydrated, setFormHydrated] = useState(false);
  const venueSearch = form.venueName.trim();
  const skillOptions = [
    { label: "Newbie", value: "Newbie" },
    { label: "Yếu", value: "Yếu" },
    { label: "Yếu+", value: "Yếu+" },
    { label: "TBY-", value: "TBY-" },
    { label: "TBY", value: "TBY" },
    { label: "TBY+", value: "TBY+" },
    { label: "TB-", value: "TB-" },
    { label: "TB", value: "TB" },
    { label: "TB+", value: "TB+" },
    { label: "Khá-", value: "Khá-" },
    { label: "Khá", value: "Khá" },
    { label: "Khá+", value: "Khá+" },
    { label: "Pro", value: "Pro" },
    { label: "Bán chuyên", value: "Bán chuyên" },
    { label: "Trình giải", value: "Trình giải" },
  ];
  const skillToneClasses = {
    gray: {
      active: "border-slate-300 bg-slate-100 text-slate-700",
      inactive:
        "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
    },
    blue: {
      active: "border-sky-300 bg-sky-100 text-sky-700",
      inactive: "border-sky-200 bg-white text-slate-600 hover:border-sky-300",
    },
    green: {
      active: "border-emerald-300 bg-emerald-100 text-emerald-700",
      inactive:
        "border-emerald-200 bg-white text-slate-600 hover:border-emerald-300",
    },
    red: {
      active: "border-rose-300 bg-rose-100 text-rose-700",
      inactive: "border-rose-200 bg-white text-slate-600 hover:border-rose-300",
    },
  } as const;
  const getSkillTone = (value: string) => {
    if (["Newbie", "Yếu", "Yếu+"].includes(value)) return "gray";
    if (["TBY-", "TBY", "TBY+", "TB-", "TB", "TB+"].includes(value)) {
      return "blue";
    }
    if (["Khá-", "Khá", "Khá+"].includes(value)) return "green";
    if (["Pro", "Bán chuyên", "Trình giải"].includes(value)) return "red";
    return "gray";
  };

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
      city: session.city ?? "Ho Chi Minh City",
      datetime: toDateTimeLocalValue(session.datetime),
      skillRequirements: session.skillRequirements ??
        session.skillRequirement ?? ["TB"],
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

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        // Convert browser `datetime-local` (e.g. "2026-05-30T08:10") to full ISO string
        datetime: form.datetime
          ? new Date(form.datetime).toISOString()
          : form.datetime,
        price: form.priceSplit ? 0 : form.price,
      };
      const response = editSessionId
        ? await sessionsApi.updateSession(editSessionId, payload)
        : await api.post("/sessions", payload);
      return response.data.data.session;
    },
    onMutate: () => {
      submitLockRef.current = true;
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

  const isEditing = Boolean(editSessionId);
  const isLoadingEditSession = isEditing && editingSessionQuery.isLoading;

  if (isLoadingEditSession) {
    return (
      <RequireAuth>
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-glow">
          Đang tải buổi chơi để chỉnh sửa...
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">
            {isEditing
              ? "Chỉnh sửa buổi cầu lông của bạn"
              : "Tổ chức một buổi cầu lông mới"}
          </h1>
        </div>

        <form
          className="grid gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-glow"
          onSubmit={(event) => {
            event.preventDefault();
            if (submitLockRef.current || createMutation.isPending) {
              return;
            }
            createMutation.mutate();
          }}
        >
          <fieldset disabled={createMutation.isPending} className="grid gap-4">
            <label className="grid gap-2 text-sm text-slate-600">
              Tên buổi chơi
              <input
                type="text"
                value={form.title}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    title: event.target.value,
                  }))
                }
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none disabled:cursor-not-allowed disabled:opacity-60"
              />
            </label>

            <div className="grid gap-2 text-sm text-slate-600">
              <span>Tên sân cầu lông</span>
              <div className="space-y-3">
                {selectedVenue && form.venueName === selectedVenue.name ? (
                  <div className="flex items-center justify-between rounded-2xl border border-emerald-300 bg-emerald-50/90 p-4">
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        {selectedVenue.name}
                      </div>
                      <div className="mt-1 text-xs text-slate-600">
                        {[selectedVenue.district, selectedVenue.city]
                          .filter(Boolean)
                          .join(" · ")}
                      </div>
                      <div className="text-xs text-slate-500">
                        {selectedVenue.address}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedVenue(null)}
                      className="rounded-xl border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                    >
                      Đổi sân khác
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      value={form.venueName}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          venueName: event.target.value,
                          venueId: undefined,
                        }))
                      }
                      placeholder="Gõ tên sân hoặc khu vực (Ví dụ: Kỳ Hòa, Lý Phong, Tân Bình, Quận 7...)"
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    {venueSearch.length >= 1 ? (
                      <div className="max-h-72 overflow-y-auto rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/60 p-3">
                        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                          Gợi ý sân cầu lông phù hợp
                        </div>
                        {venuesQuery.isLoading ? (
                          <p className="text-sm text-slate-500">Đang tìm sân...</p>
                        ) : venueSuggestions.length > 0 ? (
                          <div className="grid gap-2">
                            {venueSuggestions.map((venue) => {
                              const venueId = venue.id ?? venue._id ?? venue.name;
                              return (
                                <button
                                  key={venueId}
                                  type="button"
                                  onClick={() => selectVenueSuggestion(venue)}
                                  className="rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-left transition hover:border-emerald-300 hover:bg-emerald-50"
                                >
                                  <div className="font-semibold text-slate-900">
                                    {venue.name}
                                  </div>
                                  <div className="mt-0.5 text-xs font-medium text-emerald-700">
                                    {[venue.district, venue.city]
                                      .filter(Boolean)
                                      .join(" · ")}
                                  </div>
                                  <div className="mt-0.5 truncate text-xs text-slate-500">
                                    {venue.address}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500">
                            Không tìm thấy sân phù hợp. Bạn vẫn có thể dùng tên sân này.
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">
                        Gõ từ 1-2 ký tự để xem gợi ý sân đã crawl.
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>

            <label className="grid gap-2 text-sm text-slate-600">
              Quận
              <input
                type="text"
                value={form.district}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    district: event.target.value,
                  }))
                }
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none disabled:cursor-not-allowed disabled:opacity-60"
              />
            </label>

            <label className="grid gap-2 text-sm text-slate-600">
              Thời gian
              <input
                type="datetime-local"
                value={form.datetime}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    datetime: event.target.value,
                  }))
                }
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none disabled:cursor-not-allowed disabled:opacity-60"
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm text-slate-600">
                Loại trận
                <select
                  value={form.matchType}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      matchType: event.target.value,
                    }))
                  }
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="doubles">Đôi</option>
                  <option value="mixed doubles">Đôi nam nữ</option>
                  <option value="singles">Đơn</option>
                </select>
              </label>
              <div className="grid gap-2 text-sm text-slate-600">
                <span>Trình độ yêu cầu</span>
                <div className="flex flex-wrap gap-2">
                  {skillOptions.map((option) => {
                    const active = form.skillRequirements.includes(
                      option.value,
                    );
                    const tone = getSkillTone(option.value);
                    const toneClasses = skillToneClasses[tone];
                    return (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={active}
                        onClick={() =>
                          setForm((previous) => ({
                            ...previous,
                            skillRequirements: (() => {
                              const current = previous.skillRequirements;
                              if (current.includes(option.value)) {
                                const next = current.filter(
                                  (item) => item !== option.value,
                                );
                                return next.length > 0 ? next : current;
                              }
                              return [...current, option.value];
                            })(),
                          }))
                        }
                        className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                          active ? toneClasses.active : toneClasses.inactive
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm text-slate-600">
                Số người tối đa
                <input
                  type="number"
                  value={form.maxPlayers}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      maxPlayers: Number(event.target.value),
                    }))
                  }
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none disabled:cursor-not-allowed disabled:opacity-60"
                />
              </label>
              <div className="grid gap-2 text-sm text-slate-600">
                <span>Chi phí</span>
                <div className="flex gap-2">
                  {[
                    { label: "Chia đều", value: true },
                    { label: "Nhập số tiền", value: false },
                  ].map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      aria-pressed={form.priceSplit === option.value}
                      onClick={() =>
                        setForm((previous) => ({
                          ...previous,
                          priceSplit: option.value,
                          price: option.value ? 0 : previous.price,
                        }))
                      }
                      className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                        form.priceSplit === option.value
                          ? "border-emerald-300 bg-emerald-100 text-emerald-700"
                          : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={form.price}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      price: Number(event.target.value),
                    }))
                  }
                  disabled={form.priceSplit}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none disabled:cursor-not-allowed disabled:opacity-60"
                />
                <p className="text-xs text-slate-500">
                  {form.priceSplit
                    ? "Chi phi se duoc host va thanh vien tu chia sau buoi choi."
                    : "Nhap tong chi phi (VND)."}
                </p>
              </div>
            </div>

            {/* Deposit & Escrow Settings */}
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-900">
                    Bắt buộc đặt cọc giữ chỗ (Chống bùng kèo)
                  </span>
                  <p className="text-xs text-slate-500">
                    Người chơi phải cọc qua VietQR để giữ chỗ. Quỹ được giữ an toàn bởi CLVL Escrow.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={form.depositRequired}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, depositRequired: e.target.checked }))
                  }
                  className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
              </div>

              {form.depositRequired && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-1.5 text-xs font-medium text-slate-700">
                    Số tiền cọc mỗi người (VND):
                    <input
                      type="number"
                      step={10000}
                      value={form.depositAmount}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          depositAmount: Number(e.target.value),
                        }))
                      }
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none"
                    />
                  </label>
                  <label className="grid gap-1.5 text-xs font-medium text-slate-700">
                    Thời hạn cho phép hủy hoàn 100% cọc:
                    <select
                      value={form.cancelPolicyHours}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          cancelPolicyHours: Number(e.target.value),
                        }))
                      }
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none"
                    >
                      <option value={6}>Hủy trước 6 tiếng</option>
                      <option value={12}>Hủy trước 12 tiếng (Khuyên dùng)</option>
                      <option value={24}>Hủy trước 24 tiếng</option>
                    </select>
                  </label>
                </div>
              )}
            </div>

            <label className="grid gap-2 text-sm text-slate-600">
              Notes
              <textarea
                value={form.notes}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    notes: event.target.value,
                  }))
                }
                rows={4}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none disabled:cursor-not-allowed disabled:opacity-60"
              />
            </label>

            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex w-fit items-center rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createMutation.isPending
                ? isEditing
                  ? "Đang lưu..."
                  : "Đang tạo..."
                : isEditing
                  ? "Lưu thay đổi"
                  : "Tạo buổi chơi"}
            </button>
          </fieldset>
        </form>
      </div>
    </RequireAuth>
  );
}

export default function CreateSessionPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-500">
          Đang tải biểu mẫu buổi chơi...
        </div>
      }
    >
      <CreateSessionForm />
    </Suspense>
  );
}

