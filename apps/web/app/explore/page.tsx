"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { MatchCard } from "@/components/cards/MatchCard";

const fallbackSessions = [
  {
    id: "demo-session-1",
    title: "Buổi đôi buổi tối",
    venueName: "Saigon Smash Court",
    district: "Quận 1",
    datetime: "Hôm nay, 19:00",
    currentPlayers: 4,
    maxPlayers: 8,
    skillRequirements: ["TB+"],
    matchType: "doubles",
    price: 100000,
  },
];

export default function ExplorePage() {
  const [showFilters, setShowFilters] = useState(false);
  const [uiFilters, setUiFilters] = useState({
    city: "",
    district: "",
    skillLevel: "",
    matchType: "",
    status: "open",
    datetimeFrom: "",
    datetimeTo: "",
  });
  const [appliedFilters, setAppliedFilters] = useState(() => ({
    city: "",
    district: "",
    skillLevel: "",
    matchType: "",
    status: "open",
  }));

  const sessionsQuery = useQuery({
    queryKey: ["sessions", appliedFilters],
    queryFn: async () => {
      const params = Object.fromEntries(
        Object.entries(appliedFilters).filter(([, value]) => value),
      );
      const response = await api.get("/sessions", { params });

      let sessions = response.data.data.sessions as typeof fallbackSessions;

      // Client-side datetime range filtering when provided
      if (uiFilters.datetimeFrom || uiFilters.datetimeTo) {
        const from = uiFilters.datetimeFrom
          ? new Date(uiFilters.datetimeFrom).getTime()
          : -Infinity;
        const to = uiFilters.datetimeTo
          ? new Date(uiFilters.datetimeTo).getTime()
          : Infinity;
        sessions = sessions.filter((s: any) => {
          const t = new Date(s.datetime).getTime();
          if (Number.isNaN(t)) return false;
          return t >= from && t <= to;
        });
      }

      return sessions;
    },
    placeholderData: fallbackSessions,
  });

  const updateUiFilter = (key: keyof typeof uiFilters, value: string) => {
    setUiFilters((current) => ({ ...current, [key]: value }));
  };

  const applyFilters = () => {
    const { datetimeFrom, datetimeTo, ...rest } = uiFilters;
    setAppliedFilters(rest);
  };

  const clearFilters = () => {
    setUiFilters({
      city: "",
      district: "",
      skillLevel: "",
      matchType: "",
      status: "open",
      datetimeFrom: "",
      datetimeTo: "",
    });
    setAppliedFilters({
      city: "",
      district: "",
      skillLevel: "",
      matchType: "",
      status: "open",
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">
              Các buổi chơi cầu lông đang mở
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setShowFilters((current) => !current)}
            className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
          >
            {showFilters ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
          </button>
        </div>
      </div>

      {showFilters ? (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-glow">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <label className="space-y-2 text-sm text-slate-600">
              <span>Thành phố</span>
              <input
                value={uiFilters.city}
                onChange={(event) => updateUiFilter("city", event.target.value)}
                placeholder="Ho Chi Minh City"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-0 transition placeholder:text-slate-400 focus:border-emerald-400/40"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-600">
              <span>Quận / huyện</span>
              <input
                value={uiFilters.district}
                onChange={(event) =>
                  updateUiFilter("district", event.target.value)
                }
                placeholder="Quận 1"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-0 transition placeholder:text-slate-400 focus:border-emerald-400/40"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-600">
              <span>Trình độ</span>
              <select
                value={uiFilters.skillLevel}
                onChange={(event) =>
                  updateUiFilter("skillLevel", event.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-0 transition focus:border-emerald-400/40"
              >
                <option value="">Tất cả</option>
                <option value="Newbie">Newbie</option>
                <option value="Yếu">Yếu</option>
                <option value="Yếu+">Yếu+</option>
                <option value="TBY-">TBY-</option>
                <option value="TBY">TBY</option>
                <option value="TBY+">TBY+</option>
                <option value="TB-">TB-</option>
                <option value="TB">TB</option>
                <option value="TB+">TB+</option>
                <option value="Khá-">Khá-</option>
                <option value="Khá">Khá</option>
                <option value="Khá+">Khá+</option>
                <option value="Pro">Pro</option>
              </select>
            </label>
            <label className="space-y-2 text-sm text-slate-600">
              <span>Loại trận</span>
              <select
                value={uiFilters.matchType}
                onChange={(event) =>
                  updateUiFilter("matchType", event.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-0 transition focus:border-emerald-400/40"
              >
                <option value="">Tất cả</option>
                <option value="doubles">Đôi</option>
                <option value="mixed_doubles">Đôi nam nữ</option>
                <option value="singles">Đơn</option>
              </select>
            </label>
            <label className="space-y-2 text-sm text-slate-600">
              <span>Trạng thái</span>
              <select
                value={uiFilters.status}
                onChange={(event) =>
                  updateUiFilter("status", event.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-0 transition focus:border-emerald-400/40"
              >
                <option value="">Tất cả</option>
                <option value="full">Đã đủ</option>
                <option value="completed">Đã xong</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </label>
            <label className="space-y-2 text-sm text-slate-600">
              <span>Từ thời gian</span>
              <input
                type="datetime-local"
                value={uiFilters.datetimeFrom}
                onChange={(e) => updateUiFilter("datetimeFrom", e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-0 transition placeholder:text-slate-400 focus:border-emerald-400/40"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-600">
              <span>Đến thời gian</span>
              <input
                type="datetime-local"
                value={uiFilters.datetimeTo}
                onChange={(e) => updateUiFilter("datetimeTo", e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none ring-0 transition placeholder:text-slate-400 focus:border-emerald-400/40"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={applyFilters}
              className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
            >
              Áp dụng
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Xóa bộ lọc
            </button>
          </div>
        </section>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(sessionsQuery.data ?? []).map((session: any, idx: number) => (
          <MatchCard
            key={
              session.id ??
              session._id ??
              session.slug ??
              `${session.title ?? "session"}-${idx}`
            }
            session={session}
          />
        ))}
      </div>
    </div>
  );
}
