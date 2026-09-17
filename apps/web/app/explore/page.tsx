"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { MatchCard } from "@/components/cards/MatchCard";
import { MapWrapper } from "@/components/map/MapWrapper";
import {
  Filter,
  MapPin,
  Calendar,
  Sparkles,
  SlidersHorizontal,
  Map as MapIcon,
  List,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";

const fallbackSessions = [
  {
    id: "demo-session-1",
    title: "Buổi đôi tối thứ 6 phong trào",
    venueName: "Sân Cầu Lông Kỳ Hòa",
    district: "Quận 10",
    city: "Hồ Chí Minh",
    datetime: "Hôm nay, 19:30",
    currentPlayers: 4,
    maxPlayers: 8,
    skillRequirements: ["TB+"],
    matchType: "doubles",
    price: 80000,
    depositRequired: true,
    latitude: 10.7746,
    longitude: 106.6669,
  },
  {
    id: "demo-session-2",
    title: "Giao lưu đôi nam nữ cuối tuần",
    venueName: "Sân Cầu Lông Lan Anh",
    district: "Quận 10",
    city: "Hồ Chí Minh",
    datetime: "Ngày mai, 08:00",
    currentPlayers: 6,
    maxPlayers: 8,
    skillRequirements: ["Khá"],
    matchType: "mixed doubles",
    price: 90000,
    depositRequired: true,
    latitude: 10.779,
    longitude: 106.671,
  },
  {
    id: "demo-session-3",
    title: "Kèo nhẹ Newbie & Yếu giao lưu",
    venueName: "Sân Cầu Lông Đào Duy Anh",
    district: "Phú Nhuận",
    city: "Hồ Chí Minh",
    datetime: "Hôm nay, 20:00",
    currentPlayers: 3,
    maxPlayers: 6,
    skillRequirements: ["Newbie", "Yếu+"],
    matchType: "doubles",
    price: 65000,
    depositRequired: false,
    latitude: 10.7992,
    longitude: 106.6803,
  },
];

const DISTRICT_COORDS: Record<string, [number, number]> = {
  "1": [10.7769, 106.7009],
  "2": [10.7872, 106.7499],
  "3": [10.7844, 106.6844],
  "4": [10.7645, 106.7042],
  "5": [10.754, 106.6634],
  "6": [10.7481, 106.6352],
  "7": [10.734, 106.7218],
  "8": [10.7241, 106.6286],
  "9": [10.8428, 106.7797],
  "10": [10.7746, 106.6669],
  "11": [10.7674, 106.6534],
  "12": [10.8672, 106.6413],
  "bình thạnh": [10.8106, 106.7091],
  "tân bình": [10.8015, 106.6558],
  "tân phú": [10.79, 106.628],
  "phú nhuận": [10.7992, 106.6803],
  "gò vấp": [10.8387, 106.6653],
  "bình tân": [10.7654, 106.6039],
  "thủ đức": [10.8494, 106.7537],
  "hóc môn": [10.8963, 106.5841],
  "bình chánh": [10.6874, 106.5938],
  "củ chi": [11.0067, 106.4946],
  "nhà bè": [10.6583, 106.7326],
};

function resolveCoords(district?: string): [number, number] {
  if (!district) return [10.8231, 106.6297];
  const cleaned = district
    .toLowerCase()
    .replace(/^(quận|huyện|thành phố|tp\.?)\s+/i, "")
    .trim();
  if (DISTRICT_COORDS[cleaned]) return DISTRICT_COORDS[cleaned];
  return [10.8231, 106.6297];
}

export default function ExplorePage() {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  );
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [activeChip, setActiveChip] = useState<string>("all");
  const [mobileView, setMobileView] = useState<"list" | "map">("list");

  const [uiFilters, setUiFilters] = useState({
    city: "",
    district: "",
    skillLevel: "",
    matchType: "",
    status: "open",
    datetimeFrom: "",
    datetimeTo: "",
    depositOnly: false,
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
      try {
        const response = await api.get("/sessions", { params });
        const sessions = response.data?.data?.sessions;
        if (Array.isArray(sessions) && sessions.length > 0) {
          return sessions;
        }
      } catch (err) {
        console.warn("Using fallback sessions:", err);
      }
      return fallbackSessions;
    },
    placeholderData: fallbackSessions,
  });

  // Client-side filtering
  const filteredSessions = useMemo(() => {
    let list = (sessionsQuery.data ?? []) as any[];

    // Keyword search (venue, title, district)
    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase().trim();
      list = list.filter(
        (s) =>
          (s.title || "").toLowerCase().includes(q) ||
          (s.venueName || "").toLowerCase().includes(q) ||
          (s.district || "").toLowerCase().includes(q),
      );
    }

    // Quick Chip filters
    if (activeChip === "tonight") {
      list = list.filter((s) => {
        const str = String(s.datetime || "").toLowerCase();
        return (
          str.includes("tối") ||
          str.includes("18:") ||
          str.includes("19:") ||
          str.includes("20:") ||
          str.includes("21:")
        );
      });
    } else if (activeChip === "escrow") {
      list = list.filter((s) => s.depositRequired || s.price > 0);
    } else if (activeChip === "tb") {
      list = list.filter((s) => {
        const reqs = s.skillRequirements ?? s.skillRequirement ?? [];
        const arr = Array.isArray(reqs) ? reqs : [reqs];
        return arr.some((lvl: string) => String(lvl).includes("TB"));
      });
    } else if (activeChip === "mixed") {
      list = list.filter((s) =>
        String(s.matchType || "")
          .toLowerCase()
          .includes("mixed"),
      );
    } else if (activeChip === "available") {
      list = list.filter((s) => {
        const current = s.currentPlayers ?? s.currentPlayersCount ?? 0;
        const max = s.maxPlayers || 8;
        return max - current > 0;
      });
    }

    // Advanced datetime range filter
    if (uiFilters.datetimeFrom || uiFilters.datetimeTo) {
      const from = uiFilters.datetimeFrom
        ? new Date(uiFilters.datetimeFrom).getTime()
        : -Infinity;
      const to = uiFilters.datetimeTo
        ? new Date(uiFilters.datetimeTo).getTime()
        : Infinity;
      list = list.filter((s) => {
        const t = new Date(s.datetime).getTime();
        if (Number.isNaN(t)) return true;
        return t >= from && t <= to;
      });
    }

    return list;
  }, [sessionsQuery.data, searchKeyword, activeChip, uiFilters]);

  // Transform sessions into map venue markers
  const mapVenues = useMemo(() => {
    return filteredSessions.map((s) => {
      const id = s.id ?? s._id ?? s.slug ?? "";
      let lat = s.latitude || s.venue?.latitude;
      let lng = s.longitude || s.venue?.longitude;

      if (!lat || !lng) {
        const fallback = resolveCoords(s.district);
        lat = fallback[0];
        lng = fallback[1];
      }

      const current = s.currentPlayers ?? s.currentPlayersCount ?? 0;
      const max = s.maxPlayers || 8;

      return {
        id,
        sessionId: id,
        name: s.venueName || "Sân Cầu Lông",
        address:
          s.venue?.address ||
          s.address ||
          `${s.district || ""}, ${s.city || "TP. Hồ Chí Minh"}`,
        district: s.district,
        city: s.city,
        latitude: Number(lat),
        longitude: Number(lng),
        price: s.price ?? 0,
        sessionTitle: s.title,
        slotsLeft: Math.max(0, max - current),
        maxPlayers: max,
        datetime: s.datetime,
        googleMapsUrl: s.googleMapsUrl || s.venue?.googleMapsUrl,
      };
    });
  }, [filteredSessions]);

  const updateUiFilter = (key: string, value: any) => {
    setUiFilters((curr) => ({ ...curr, [key]: value }));
  };

  const applyAdvancedFilters = () => {
    setAppliedFilters({
      city: uiFilters.city,
      district: uiFilters.district,
      skillLevel: uiFilters.skillLevel,
      matchType: uiFilters.matchType,
      status: uiFilters.status,
    });
    setShowAdvancedFilters(false);
  };

  const clearAllFilters = () => {
    setSearchKeyword("");
    setActiveChip("all");
    setUiFilters({
      city: "",
      district: "",
      skillLevel: "",
      matchType: "",
      status: "open",
      datetimeFrom: "",
      datetimeTo: "",
      depositOnly: false,
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
    <div className="space-y-5 animate-fadeUp">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
              Khám Phá Sân Đấu
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Các Buổi Chơi Cầu Lông Đang Mở
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Tìm kiếm sân bãi, ghép kèo chuẩn trình độ và bảo chứng ký quỹ an toàn
          </p>
        </div>

        {/* View Toggle on Mobile */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileView(mobileView === "list" ? "map" : "list")}
            className="flex items-center gap-2 rounded-full border border-emerald-300 bg-white px-4 py-2 text-xs font-bold text-emerald-800 shadow-sm transition hover:bg-emerald-50"
          >
            {mobileView === "list" ? (
              <>
                <MapIcon className="h-4 w-4 text-emerald-600" />
                <span>Xem Bản Đồ</span>
              </>
            ) : (
              <>
                <List className="h-4 w-4 text-emerald-600" />
                <span>Xem Danh Sách</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Search Bar + Quick Chips Filter Bar */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-3.5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Tìm theo tên sân, quận huyện, tên kèo..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition"
            />
            {searchKeyword && (
              <button
                type="button"
                onClick={() => setSearchKeyword("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveChip("all")}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                activeChip === "all"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Tất cả ({filteredSessions.length})
            </button>
            <button
              type="button"
              onClick={() =>
                setActiveChip(activeChip === "tonight" ? "all" : "tonight")
              }
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                activeChip === "tonight"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              🌙 Tối nay (18h+)
            </button>
            <button
              type="button"
              onClick={() =>
                setActiveChip(activeChip === "escrow" ? "all" : "escrow")
              }
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                activeChip === "escrow"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              🛡️ Ký quỹ an toàn
            </button>
            <button
              type="button"
              onClick={() =>
                setActiveChip(activeChip === "tb" ? "all" : "tb")
              }
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                activeChip === "tb"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              ⚡ Trình TB/TB+
            </button>
            <button
              type="button"
              onClick={() =>
                setActiveChip(activeChip === "mixed" ? "all" : "mixed")
              }
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                activeChip === "mixed"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              👥 Đôi Nam Nữ
            </button>
            <button
              type="button"
              onClick={() =>
                setActiveChip(activeChip === "available" ? "all" : "available")
              }
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                activeChip === "available"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              🔥 Còn chỗ trống
            </button>

            {/* Advanced Filters Trigger */}
            <button
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="ml-auto shrink-0 flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500" />
              <span>Bộ lọc</span>
            </button>
          </div>
        </div>

        {/* Expandable Advanced Filters */}
        {showAdvancedFilters && (
          <div className="mt-3.5 border-t border-slate-100 pt-3.5">
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
              <label className="text-xs text-slate-600 font-medium">
                Quận / Huyện
                <input
                  value={uiFilters.district}
                  onChange={(e) => updateUiFilter("district", e.target.value)}
                  placeholder="Quận 1, Tân Bình, Thủ Đức..."
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-emerald-400"
                />
              </label>

              <label className="text-xs text-slate-600 font-medium">
                Trình độ
                <select
                  value={uiFilters.skillLevel}
                  onChange={(e) => updateUiFilter("skillLevel", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-emerald-400"
                >
                  <option value="">Tất cả trình độ</option>
                  <option value="Newbie">Newbie</option>
                  <option value="Yếu">Yếu</option>
                  <option value="Yếu+">Yếu+</option>
                  <option value="TB-">TB-</option>
                  <option value="TB">TB</option>
                  <option value="TB+">TB+</option>
                  <option value="Khá">Khá</option>
                  <option value="Pro">Pro</option>
                </select>
              </label>

              <label className="text-xs text-slate-600 font-medium">
                Loại trận
                <select
                  value={uiFilters.matchType}
                  onChange={(e) => updateUiFilter("matchType", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-emerald-400"
                >
                  <option value="">Tất cả loại trận</option>
                  <option value="doubles">Đôi thường</option>
                  <option value="mixed doubles">Đôi nam nữ</option>
                  <option value="singles">Đơn</option>
                </select>
              </label>

              <div className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={applyAdvancedFilters}
                  className="flex-1 rounded-xl bg-emerald-500 py-2 text-xs font-bold text-white hover:bg-emerald-600 transition"
                >
                  Áp dụng
                </button>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="rounded-xl border border-slate-200 py-2 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Đặt lại
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Split-View Layout (Cards List + Sticky Interactive Map) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Boarding Pass Cards (60% on desktop) */}
        <div
          className={`space-y-4 lg:col-span-7 ${
            mobileView === "map" ? "hidden lg:block" : "block"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Tìm thấy <strong>{filteredSessions.length}</strong> buổi chơi phù
              hợp
            </span>
            <span className="hidden sm:inline">
              Rê chuột vào thẻ để xem vị trí sân trên bản đồ
            </span>
          </div>

          {filteredSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <span className="text-4xl">🏸</span>
              <h3 className="mt-3 text-base font-bold text-slate-800">
                Không tìm thấy buổi chơi nào
              </h3>
              <p className="mt-1 max-w-sm text-xs text-slate-500">
                Hãy thử chọn quận khác, xóa từ khóa tìm kiếm hoặc đổi bộ lọc.
              </p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="mt-4 rounded-full bg-emerald-500 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-600 transition"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredSessions.map((session: any, idx: number) => {
                const sId =
                  session.id ??
                  session._id ??
                  session.slug ??
                  `session-${idx}`;
                const isSelected = selectedSessionId === sId;

                return (
                  <div
                    key={sId}
                    onMouseEnter={() => setSelectedSessionId(sId)}
                    className={`transition-transform duration-300 ${
                      isSelected ? "scale-[1.01]" : ""
                    }`}
                  >
                    <MatchCard session={session} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Sticky Interactive Leaflet Map (40% on desktop) */}
        <div
          className={`lg:col-span-5 ${
            mobileView === "list" ? "hidden lg:block" : "block"
          }`}
        >
          <div className="sticky top-20">
            <div className="flex items-center justify-between px-1 pb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                <span>Bản đồ vị trí sân ({mapVenues.length} điểm)</span>
              </span>
              <span className="text-[11px] text-slate-400">
                Nhấp ghim để xem thông tin
              </span>
            </div>

            <MapWrapper
              venues={mapVenues}
              selectedId={selectedSessionId}
              onSelectVenue={(id) => setSelectedSessionId(id)}
              className="h-[calc(100vh-10rem)] min-h-[480px] w-full rounded-3xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
