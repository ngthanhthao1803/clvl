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
  LayoutGrid,
  LayoutList,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";

const fallbackSessions = [
  {
    id: "demo-session-1",
    title: "Buổi đôi tối thứ 6 phong trào",
    venueName: "Sân Cầu Lông Kỳ Hòa",
    courtNumber: 3,
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
    coverImage:
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80",
    host: {
      name: "Hoàng Toàn",
      reputation: 100,
      isVerifiedHost: true,
    },
  },
  {
    id: "demo-session-2",
    title: "Giao lưu đôi nam nữ cuối tuần",
    venueName: "Sân Cầu Lông Lan Anh",
    courtNumber: 5,
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
    coverImage:
      "https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?auto=format&fit=crop&w=800&q=80",
    host: {
      name: "Thanh Thảo",
      reputation: 98,
      isVerifiedHost: true,
    },
  },
  {
    id: "demo-session-3",
    title: "Kèo nhẹ Newbie & Yếu giao lưu",
    venueName: "Sân Cầu Lông Đào Duy Anh",
    courtNumber: 2,
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
    coverImage:
      "https://images.unsplash.com/photo-1521537634581-0dced2fed2a8?auto=format&fit=crop&w=800&q=80",
    host: {
      name: "Minh Trí",
      reputation: 95,
      isVerifiedHost: false,
    },
  },
  {
    id: "demo-session-4",
    title: "Đôi Nam TB-TB+ rèn kỹ thuật đập cầu",
    venueName: "Sân Cầu Lông Viettel",
    courtNumber: 1,
    district: "Tân Bình",
    city: "Hồ Chí Minh",
    datetime: "Ngày mai, 18:30",
    currentPlayers: 7,
    maxPlayers: 8,
    skillRequirements: ["TB", "TB+"],
    matchType: "doubles",
    price: 75000,
    depositRequired: true,
    latitude: 10.8015,
    longitude: 106.6558,
    coverImage:
      "https://images.unsplash.com/photo-1613918108466-292b78a8ef95?auto=format&fit=crop&w=800&q=80",
    host: {
      name: "Quốc Hưng",
      reputation: 100,
      isVerifiedHost: true,
    },
  },
  {
    id: "demo-session-5",
    title: "Giao lưu rèn thể lực & phản xạ sáng sớm",
    venueName: "Sân Cầu Lông Tre Xanh",
    courtNumber: 4,
    district: "Gò Vấp",
    city: "Hồ Chí Minh",
    datetime: "Chủ nhật, 06:30",
    currentPlayers: 4,
    maxPlayers: 6,
    skillRequirements: ["TB"],
    matchType: "mixed doubles",
    price: 70000,
    depositRequired: false,
    latitude: 10.8387,
    longitude: 106.6653,
    coverImage:
      "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
    host: {
      name: "Văn Đức",
      reputation: 92,
      isVerifiedHost: false,
    },
  },
  {
    id: "demo-session-6",
    title: "Đôi nam nữ giao lưu buổi tối",
    venueName: "Sân Cầu Lông Bình Thạnh",
    courtNumber: 6,
    district: "Bình Thạnh",
    city: "Hồ Chí Minh",
    datetime: "Hôm nay, 19:00",
    currentPlayers: 5,
    maxPlayers: 8,
    skillRequirements: ["TB", "Khá"],
    matchType: "mixed doubles",
    price: 85000,
    depositRequired: true,
    latitude: 10.8106,
    longitude: 106.7091,
    coverImage:
      "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?auto=format&fit=crop&w=800&q=80",
    host: {
      name: "Phương Linh",
      reputation: 99,
      isVerifiedHost: true,
    },
  },
  {
    id: "demo-session-7",
    title: "Kèo đôi cọ xát nâng trình độ TB+",
    venueName: "Sân Cầu Lông Tân Sơn",
    courtNumber: 2,
    district: "Tân Bình",
    city: "Hồ Chí Minh",
    datetime: "Ngày mai, 19:30",
    currentPlayers: 2,
    maxPlayers: 6,
    skillRequirements: ["TB+"],
    matchType: "doubles",
    price: 80000,
    depositRequired: true,
    latitude: 10.8123,
    longitude: 106.6621,
    coverImage:
      "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
    host: {
      name: "Thế Hùng",
      reputation: 96,
      isVerifiedHost: false,
    },
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
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

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

    // Keyword search (venue, title, district, court, host)
    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase().trim();
      list = list.filter(
        (s) =>
          (s.title || "").toLowerCase().includes(q) ||
          (s.venueName || "").toLowerCase().includes(q) ||
          (s.district || "").toLowerCase().includes(q) ||
          (s.host?.name || "").toLowerCase().includes(q) ||
          String(s.courtNumber || "").includes(q),
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
    <div className="space-y-3 sm:space-y-4 animate-fadeUp">
      {/* 1. Header Toolbar (Compact & Ergonomic) */}
      <div className="flex items-center justify-between gap-2">
        {/* Left: Title & Count */}
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
          <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
            Kèo Cầu Lông
          </h1>
          <span className="rounded-full bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 text-[10.5px] font-bold text-emerald-800">
            {filteredSessions.length} kèo
          </span>
        </div>

        {/* Right: View Mode & Map Toggle */}
        <div className="flex items-center gap-1.5">
          {/* List vs Grid Segmented Switcher */}
          <div className="flex items-center rounded-xl bg-slate-100 p-0.5 border border-slate-200/80">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold transition ${
                viewMode === "list"
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Danh sách ngang gọn"
            >
              <LayoutList className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Danh sách</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold transition ${
                viewMode === "grid"
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
              title="Lưới 2 cột gọn"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Lưới</span>
            </button>
          </div>

          {/* Mobile Map vs Cards Toggle */}
          <div className="flex items-center lg:hidden">
            <button
              type="button"
              onClick={() =>
                setMobileView(mobileView === "list" ? "map" : "list")
              }
              className="flex items-center gap-1 rounded-xl border border-emerald-300 bg-white px-2.5 py-1 text-[11px] font-bold text-emerald-800 shadow-xs transition hover:bg-emerald-50 active:scale-95"
            >
              {mobileView === "list" ? (
                <>
                  <MapIcon className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Bản đồ</span>
                </>
              ) : (
                <>
                  <List className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Kèo đấu</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Search Bar + Quick Chips Filter Bar (Tight & Compact) */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-2 sm:p-2.5 shadow-xs">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Tìm tên sân, quận huyện, trình độ, host..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-1.5 pl-8 pr-7 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400/20 transition"
            />
            {searchKeyword && (
              <button
                type="button"
                onClick={() => setSearchKeyword("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Quick Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 lg:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveChip("all")}
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                activeChip === "all"
                  ? "bg-slate-900 text-white shadow-xs"
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
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                activeChip === "tonight"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              🌙 Tối nay
            </button>
            <button
              type="button"
              onClick={() =>
                setActiveChip(activeChip === "escrow" ? "all" : "escrow")
              }
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                activeChip === "escrow"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              🛡️ Ký quỹ
            </button>
            <button
              type="button"
              onClick={() =>
                setActiveChip(activeChip === "tb" ? "all" : "tb")
              }
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                activeChip === "tb"
                  ? "bg-emerald-600 text-white shadow-xs"
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
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                activeChip === "mixed"
                  ? "bg-emerald-600 text-white shadow-xs"
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
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                activeChip === "available"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              🔥 Còn chỗ
            </button>

            {/* Advanced Filters Trigger */}
            <button
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="ml-auto shrink-0 flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <SlidersHorizontal className="h-3 w-3 text-slate-500" />
              <span>Bộ lọc</span>
            </button>
          </div>
        </div>

        {/* Expandable Advanced Filters */}
        {showAdvancedFilters && (
          <div className="mt-2.5 border-t border-slate-100 pt-2.5">
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
              <label className="text-[11px] text-slate-600 font-medium">
                Quận / Huyện
                <input
                  value={uiFilters.district}
                  onChange={(e) => updateUiFilter("district", e.target.value)}
                  placeholder="Quận 10, Tân Bình, Phú Nhuận..."
                  className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-emerald-400"
                />
              </label>

              <label className="text-[11px] text-slate-600 font-medium">
                Trình độ
                <select
                  value={uiFilters.skillLevel}
                  onChange={(e) => updateUiFilter("skillLevel", e.target.value)}
                  className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-emerald-400 cursor-pointer"
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

              <label className="text-[11px] text-slate-600 font-medium">
                Loại trận
                <select
                  value={uiFilters.matchType}
                  onChange={(e) => updateUiFilter("matchType", e.target.value)}
                  className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-emerald-400 cursor-pointer"
                >
                  <option value="">Tất cả loại trận</option>
                  <option value="doubles">Đôi thường</option>
                  <option value="mixed doubles">Đôi nam nữ</option>
                  <option value="singles">Đơn</option>
                </select>
              </label>

              <div className="flex items-end gap-1.5">
                <button
                  type="button"
                  onClick={applyAdvancedFilters}
                  className="flex-1 rounded-lg bg-emerald-500 py-1.5 text-xs font-bold text-white hover:bg-emerald-600 transition"
                >
                  Áp dụng
                </button>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="rounded-lg border border-slate-200 py-1.5 px-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Đặt lại
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Main Split-View Layout (Cards + Map) */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-12">
        {/* Left Column: Match Cards (60% on desktop) */}
        <div
          className={`space-y-2 sm:space-y-2.5 lg:col-span-7 ${
            mobileView === "map" ? "hidden lg:block" : "block"
          }`}
        >
          {filteredSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <span className="text-3xl">🏸</span>
              <h3 className="mt-2 text-sm font-bold text-slate-800">
                Không tìm thấy buổi chơi nào
              </h3>
              <p className="mt-1 max-w-xs text-xs text-slate-500">
                Hãy thử chọn quận khác, xóa từ khóa tìm kiếm hoặc đổi bộ lọc.
              </p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="mt-3 rounded-full bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-600 transition"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          ) : viewMode === "list" ? (
            /* LIST VIEW: Compact Horizontal Cards */
            <div className="flex flex-col gap-2 sm:gap-2.5">
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
                    className={`transition-all duration-200 ${
                      isSelected
                        ? "ring-2 ring-emerald-500/80 rounded-2xl scale-[1.005]"
                        : ""
                    }`}
                  >
                    <MatchCard session={session} layout="horizontal" />
                  </div>
                );
              })}
            </div>
          ) : (
            /* GRID VIEW: 2-Column Compact Grid */
            <div className="grid grid-cols-2 gap-2 sm:gap-2.5 lg:grid-cols-2">
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
                    className={`transition-all duration-200 ${
                      isSelected
                        ? "ring-2 ring-emerald-500/80 rounded-2xl scale-[1.01]"
                        : ""
                    }`}
                  >
                    <MatchCard session={session} layout="grid" />
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
          <div className="sticky top-16 sm:top-20">
            <div className="flex items-center justify-between px-1 pb-1.5 text-xs">
              <span className="flex items-center gap-1.5 font-bold text-slate-700">
                <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                <span>Bản đồ vị trí sân ({mapVenues.length} điểm)</span>
              </span>
              <span className="text-[10.5px] text-slate-400">
                Nhấp ghim xem chi tiết
              </span>
            </div>

            <MapWrapper
              venues={mapVenues}
              selectedId={selectedSessionId}
              onSelectVenue={(id) => setSelectedSessionId(id)}
              className="h-[calc(100vh-8.5rem)] min-h-[420px] w-full rounded-2xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
