"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { MatchCard } from "@/components/cards/MatchCard";
import { MapWrapper } from "@/components/map/MapWrapper";
import {
  MapPin,
  SlidersHorizontal,
  Map as MapIcon,
  List,
  LayoutGrid,
  LayoutList,
  Search,
  X,
  Bookmark,
  PlusCircle,
  ShieldCheck,
  Locate,
  Sparkles,
  CalendarDays,
} from "lucide-react";
import { useSavedSessionsStore } from "@/stores/saved-sessions-store";
import { VIETNAM_PROVINCES, getDistricts } from "@/lib/vietnam-locations";
import { SKILL_OPTIONS } from "@/lib/skills";
import { toast } from "@/stores/toast-store";

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
    coverImage: "/images/covers/badminton.jpg",
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
    coverImage: "/images/covers/badminton.jpg",
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
    coverImage: "/images/covers/badminton.jpg",
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
    coverImage: "/images/covers/badminton.jpg",
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
    coverImage: "/images/covers/badminton.jpg",
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
    coverImage: "/images/covers/badminton.jpg",
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
    coverImage: "/images/covers/badminton.jpg",
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

function getDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function HomePage() {
  const router = useRouter();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [activeChip, setActiveChip] = useState<string>("all");
  const [selectedDateKey, setSelectedDateKey] = useState<string>("");
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [locatingGps, setLocatingGps] = useState(false);

  const [mounted, setMounted] = useState(false);
  const savedIds = useSavedSessionsStore((s) => s.savedIds);
  const getSavedList = useSavedSessionsStore((s) => s.getSavedList);
  const savedCount = mounted ? savedIds.length : 0;

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const chip = params.get("chip") || params.get("filter");
      if (chip === "saved") {
        setActiveChip("saved");
      }
      if (params.get("tab") === "map") {
        setMobileView("map");
      }
      if (params.get("search")) {
        setSearchKeyword(params.get("search") || "");
      }
    }
  }, []);

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
    queryKey: ["home-sessions", appliedFilters],
    queryFn: async () => {
      const params = Object.fromEntries(
        Object.entries(appliedFilters).filter(([, value]) => value),
      );
      try {
        const response = await api.get("/sessions", { params });
        const sessions = response.data?.data?.sessions;
        if (Array.isArray(sessions)) {
          return sessions;
        }
      } catch (err) {
        console.warn("Using fallback sessions:", err);
      }
      return fallbackSessions;
    },
  });

  const handleNearMeClick = () => {
    if (activeChip === "nearby") {
      setActiveChip("all");
      return;
    }
    if (userCoords) {
      setActiveChip("nearby");
      return;
    }
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      toast.error("Trình duyệt của bạn không hỗ trợ định vị GPS");
      return;
    }
    setLocatingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocatingGps(false);
        setUserCoords([pos.coords.latitude, pos.coords.longitude]);
        setActiveChip("nearby");
        toast.success(
          "Đã bật lọc kèo gần bạn!",
          "Danh sách kèo được sắp xếp từ gần đến xa theo vị trí hiện tại.",
        );
      },
      () => {
        setLocatingGps(false);
        toast.info(
          "Không thể lấy vị trí GPS",
          "Vui lòng cấp quyền vị trí hoặc chọn Quận/Huyện trong bộ lọc.",
        );
      },
      { enableHighAccuracy: true, timeout: 7000 },
    );
  };

  // Client-side filtering logic
  const filteredSessions = useMemo(() => {
    let list = (sessionsQuery.data ?? []) as any[];
    const now = Date.now();

    const isPastSession = (s: any) => {
      const matchStart = new Date(s.datetime).getTime();
      if (isNaN(matchStart)) return false;
      const matchEnd = matchStart + (s.duration || 120) * 60 * 1000;
      return now > matchEnd || s.status === "completed";
    };

    const isTodaySession = (s: any) => {
      const d = new Date(s.datetime);
      if (isNaN(d.getTime())) return false;
      const nowDate = new Date();
      return (
        d.getDate() === nowDate.getDate() &&
        d.getMonth() === nowDate.getMonth() &&
        d.getFullYear() === nowDate.getFullYear()
      );
    };

    const isTomorrowSession = (s: any) => {
      const d = new Date(s.datetime);
      if (isNaN(d.getTime())) return false;
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return (
        d.getDate() === tomorrow.getDate() &&
        d.getMonth() === tomorrow.getMonth() &&
        d.getFullYear() === tomorrow.getFullYear()
      );
    };

    const toLocalDateKey = (dateObj: Date) => {
      const y = dateObj.getFullYear();
      const m = String(dateObj.getMonth() + 1).padStart(2, "0");
      const d = String(dateObj.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    };

    // Keyword search
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

    // 7-Day Date Strip Filter
    if (selectedDateKey) {
      list = list.filter((s) => {
        const d = new Date(s.datetime);
        if (!isNaN(d.getTime())) {
          return toLocalDateKey(d) === selectedDateKey;
        }
        return false;
      });
    }

    // Quick Chip filters
    if (activeChip === "upcoming") {
      list = list.filter((s) => !isPastSession(s));
    } else if (activeChip === "today") {
      list = list.filter((s) => isTodaySession(s));
    } else if (activeChip === "tomorrow") {
      list = list.filter((s) => isTomorrowSession(s));
    } else if (activeChip === "tonight") {
      list = list.filter((s) => {
        const d = new Date(s.datetime);
        if (!isNaN(d.getTime())) {
          return isTodaySession(s) && d.getHours() >= 18;
        }
        const str = String(s.datetime || "").toLowerCase();
        return str.includes("tối");
      });
    } else if (activeChip === "past") {
      list = list.filter((s) => isPastSession(s));
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
        return max - current > 0 && !isPastSession(s);
      });
    } else if (activeChip === "nearby") {
      list = list.filter((s) => !isPastSession(s));
    } else if (activeChip === "saved") {
      const savedFromList = list.filter((s) =>
        savedIds.includes(String(s.id || s._id)),
      );
      const extraSaved = getSavedList().filter(
        (stored: any) =>
          !savedFromList.some(
            (s) => String(s.id || s._id) === String(stored.id || stored._id),
          ),
      );
      list = [...savedFromList, ...extraSaved];
    }

    // Smart Sorting: Nếu chọn "Gần tôi" thì xếp theo khoảng cách GPS, ngược lại xếp kèo sắp diễn ra trước
    return list.slice().sort((a, b) => {
      const pastA = isPastSession(a);
      const pastB = isPastSession(b);
      if (pastA !== pastB) return pastA ? 1 : -1;

      if (activeChip === "nearby" && userCoords) {
        const [latA, lngA] =
          a.latitude && a.longitude
            ? [Number(a.latitude), Number(a.longitude)]
            : resolveCoords(a.district);
        const [latB, lngB] =
          b.latitude && b.longitude
            ? [Number(b.latitude), Number(b.longitude)]
            : resolveCoords(b.district);
        const distA = getDistanceKm(userCoords[0], userCoords[1], latA, lngA);
        const distB = getDistanceKm(userCoords[0], userCoords[1], latB, lngB);
        return distA - distB;
      }

      const timeA = new Date(a.datetime).getTime() || 0;
      const timeB = new Date(b.datetime).getTime() || 0;
      return timeA - timeB;
    });
  }, [sessionsQuery.data, searchKeyword, activeChip, selectedDateKey, savedIds, getSavedList, userCoords]);

  // 7-Day Date Strip items with live session count per day
  const sevenDaysStrip = useMemo(() => {
    const rawList = (sessionsQuery.data ?? []) as any[];
    const weekdays = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
    const baseNow = new Date();

    return Array.from({ length: 7 }).map((_, offset) => {
      const target = new Date(
        baseNow.getFullYear(),
        baseNow.getMonth(),
        baseNow.getDate() + offset,
      );
      const y = target.getFullYear();
      const m = String(target.getMonth() + 1).padStart(2, "0");
      const d = String(target.getDate()).padStart(2, "0");
      const key = `${y}-${m}-${d}`;
      const dayMonth = `${d}/${m}`;
      const label =
        offset === 0
          ? "Hôm nay"
          : offset === 1
            ? "Ngày mai"
            : weekdays[target.getDay()];

      const count = rawList.filter((s) => {
        const dt = new Date(s.datetime);
        if (isNaN(dt.getTime())) return false;
        return (
          dt.getFullYear() === y &&
          dt.getMonth() === target.getMonth() &&
          dt.getDate() === target.getDate()
        );
      }).length;

      return { key, label, dayMonth, count, isWeekend: target.getDay() === 0 || target.getDay() === 6 };
    });
  }, [sessionsQuery.data]);

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
    setSelectedDateKey("");
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
    <div suppressHydrationWarning className="space-y-3 pb-20 animate-fadeUp">
      {/* 0. Compact Value Proposition & Fast Conversion Strip for New Visitors */}
      <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 px-3.5 py-2.5 text-white shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <span className="inline-flex items-center gap-1.5 font-extrabold text-emerald-300">
            <span>Ghép Kèo Cầu Lông Toàn Quốc</span>
          </span>
          <span className="hidden sm:inline text-white/30">•</span>
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-200 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span>Bảo chứng cọc VietQR · Hoàn 100% nếu hủy trước hạn</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleNearMeClick}
            className="inline-flex items-center gap-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 px-2.5 py-1 text-[11px] font-bold text-emerald-300 transition active:scale-95"
          >
            <Locate className={`h-3 w-3 ${locatingGps ? "animate-spin" : ""}`} />
            <span>{locatingGps ? "Đang định vị..." : "Kèo gần tôi"}</span>
          </button>
          <Link
            href="/sessions/create"
            className="inline-flex items-center gap-1 rounded-full bg-emerald-500 hover:bg-emerald-400 px-2.5 py-1 text-[11px] font-black text-slate-950 transition active:scale-95"
          >
            <PlusCircle className="h-3 w-3" />
            <span>Đăng kèo</span>
          </Link>
        </div>
      </div>

      {/* 1. Search Bar + Quick Filter Chips */}
      <div suppressHydrationWarning className="rounded-2xl border border-slate-200/90 bg-white p-2 sm:p-2.5 shadow-xs">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              suppressHydrationWarning
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Tìm tên sân, quận huyện, trình độ, chủ sân..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-1.5 pl-8 pr-7 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400/20 transition"
            />
            {searchKeyword && (
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setSearchKeyword("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Quick Filter Chips Carousel */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 lg:pb-0 scrollbar-none">
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setActiveChip("all")}
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${activeChip === "all"
                  ? "bg-slate-900 text-white shadow-xs font-bold"
                  : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
            >
              Tất cả
            </button>

            {/* Chip: Đã lưu (Saved) */}
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setActiveChip(activeChip === "saved" ? "all" : "saved")}
              className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold transition ${activeChip === "saved"
                  ? "bg-amber-500 text-white shadow-xs"
                  : "border border-amber-300/80 bg-amber-50/70 text-amber-800 hover:bg-amber-100"
                }`}
            >
              <Bookmark
                className={`h-3 w-3 ${activeChip === "saved" ? "fill-white text-white" : "fill-amber-600 text-amber-600"
                  }`}
              />
              <span>Đã lưu</span>
              {savedCount > 0 && (
                <span
                  suppressHydrationWarning
                  className={`rounded-full px-1.5 py-0.2 text-[9.5px] font-black ${activeChip === "saved" ? "bg-white text-amber-700" : "bg-amber-200 text-amber-900"
                    }`}
                >
                  {savedCount}
                </span>
              )}
            </button>

            <button
              type="button"
              suppressHydrationWarning
              onClick={handleNearMeClick}
              className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition ${activeChip === "nearby"
                  ? "bg-sky-600 text-white shadow-xs"
                  : "border border-sky-200 bg-sky-50/80 text-sky-800 hover:bg-sky-100"
                }`}
            >
              <Locate className={`h-3 w-3 ${locatingGps ? "animate-spin" : ""}`} />
              <span>Gần tôi</span>
            </button>

            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setActiveChip(activeChip === "upcoming" ? "all" : "upcoming")}
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${activeChip === "upcoming"
                  ? "bg-emerald-600 text-white shadow-xs font-bold"
                  : "border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                }`}
            >
              ⚡ Sắp tới
            </button>

            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setActiveChip(activeChip === "today" ? "all" : "today")}
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${activeChip === "today"
                  ? "bg-emerald-600 text-white shadow-xs font-bold"
                  : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
            >
              🔥 Hôm nay
            </button>

            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setActiveChip(activeChip === "tonight" ? "all" : "tonight")}
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${activeChip === "tonight"
                  ? "bg-emerald-600 text-white shadow-xs font-bold"
                  : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
            >
              🌙 Tối nay
            </button>

            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setActiveChip(activeChip === "tomorrow" ? "all" : "tomorrow")}
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${activeChip === "tomorrow"
                  ? "bg-sky-600 text-white shadow-xs font-bold"
                  : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
            >
              📅 Ngày mai
            </button>

            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setActiveChip(activeChip === "escrow" ? "all" : "escrow")}
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${activeChip === "escrow"
                  ? "bg-emerald-600 text-white shadow-xs font-bold"
                  : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
            >
              🛡️ Ký quỹ
            </button>

            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setActiveChip(activeChip === "tb" ? "all" : "tb")}
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${activeChip === "tb"
                  ? "bg-emerald-600 text-white shadow-xs font-bold"
                  : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
            >
              🏸 Trình TB/TB+
            </button>

            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setActiveChip(activeChip === "mixed" ? "all" : "mixed")}
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${activeChip === "mixed"
                  ? "bg-emerald-600 text-white shadow-xs font-bold"
                  : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
            >
              👥 Đôi Nam Nữ
            </button>

            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setActiveChip(activeChip === "available" ? "all" : "available")}
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${activeChip === "available"
                  ? "bg-emerald-600 text-white shadow-xs font-bold"
                  : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
            >
              🟢 Còn chỗ
            </button>

            {/* Advanced Filters Trigger */}
            <button
              type="button"
              suppressHydrationWarning
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
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              <label className="text-[11px] text-slate-600 font-medium">
                Tỉnh / Thành phố
                <select
                  value={uiFilters.city}
                  onChange={(e) => updateUiFilter("city", e.target.value)}
                  className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-emerald-400 cursor-pointer"
                >
                  <option value="">Tất cả tỉnh thành</option>
                  <optgroup label="Tỉnh thành tiêu biểu">
                    {VIETNAM_PROVINCES.filter((p) => p.isHot).map((p) => (
                      <option key={p.name} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Tỉnh thành khác">
                    {VIETNAM_PROVINCES.filter((p) => !p.isHot).map((p) => (
                      <option key={p.name} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </label>

              <label className="text-[11px] text-slate-600 font-medium">
                Quận / Huyện
                <input
                  list="home-district-options"
                  value={uiFilters.district}
                  onChange={(e) => updateUiFilter("district", e.target.value)}
                  placeholder="Quận 10, Tân Bình, Cầu Giấy..."
                  className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-emerald-400"
                />
                <datalist id="home-district-options">
                  {getDistricts(uiFilters.city).map((d) => (
                    <option key={d} value={d} />
                  ))}
                </datalist>
              </label>

              <label className="text-[11px] text-slate-600 font-medium">
                Trình độ
                <select
                  value={uiFilters.skillLevel}
                  onChange={(e) => updateUiFilter("skillLevel", e.target.value)}
                  className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-emerald-400 cursor-pointer"
                >
                  <option value="">Tất cả trình độ</option>
                  {Array.from(new Set(SKILL_OPTIONS.map((s) => s.group))).map((group) => (
                    <optgroup key={group} label={group}>
                      {SKILL_OPTIONS.filter((s) => s.group === group).map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.value} ({s.desc.split(" · ")[0]})
                        </option>
                      ))}
                    </optgroup>
                  ))}
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

        {/* 7-Day Quick Date Strip */}
        <div
          suppressHydrationWarning
          className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5"
        >
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setSelectedDateKey("")}
            className={`shrink-0 inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-left transition ${
              selectedDateKey === ""
                ? "bg-emerald-600 text-white shadow-xs"
                : "border border-slate-200/80 bg-slate-50/70 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <CalendarDays className="h-3.5 w-3.5 shrink-0" />
            <div className="leading-tight">
              <div className="text-[10.5px] font-bold">Mọi ngày</div>
              <div
                className={`text-[9px] font-medium ${
                  selectedDateKey === "" ? "text-emerald-100" : "text-slate-400"
                }`}
              >
                7 ngày tới
              </div>
            </div>
          </button>

          {mounted &&
            sevenDaysStrip.map((item) => {
              const isSelected = selectedDateKey === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() =>
                    setSelectedDateKey(isSelected ? "" : item.key)
                  }
                  className={`shrink-0 flex items-center gap-2 rounded-xl border px-2.5 py-1 text-left transition active:scale-95 ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-600 text-white shadow-xs"
                      : item.count > 0
                        ? "border-slate-200/90 bg-white text-slate-800 hover:border-emerald-300 hover:bg-emerald-50/40"
                        : "border-slate-100 bg-slate-50/50 text-slate-400 hover:bg-slate-100"
                  }`}
                >
                  <div className="leading-tight">
                    <div
                      className={`text-[10.5px] font-extrabold ${
                        isSelected
                          ? "text-white"
                          : item.isWeekend
                            ? "text-rose-600"
                            : "text-slate-800"
                      }`}
                    >
                      {item.label}
                    </div>
                    <div
                      className={`text-[9.5px] font-medium ${
                        isSelected ? "text-emerald-100" : "text-slate-400"
                      }`}
                    >
                      {item.dayMonth}
                    </div>
                  </div>
                  {item.count > 0 && (
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[9.5px] font-black ${
                        isSelected
                          ? "bg-white text-emerald-700"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200/70"
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
        </div>
      </div>

      {/* 2. Toolbar: Count, Quick Create & View Switcher */}
      <div suppressHydrationWarning className="flex items-center justify-between gap-2 pt-0.5">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
          <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
            Kèo Cầu Lông Đang Mở
          </h1>
          <span suppressHydrationWarning className="rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-[11px] font-black text-emerald-800">
            {filteredSessions.length} kèo
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Create Match button */}
          <Link
            href="/sessions/create"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition active:scale-95"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Tạo kèo</span>
          </Link>

          {/* List vs Grid Switcher */}
          <div className="flex items-center rounded-xl bg-slate-100 p-0.5 border border-slate-200/80">
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold transition ${viewMode === "list"
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
              suppressHydrationWarning
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold transition ${viewMode === "grid"
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
              suppressHydrationWarning
              onClick={() => setMobileView(mobileView === "list" ? "map" : "list")}
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
                  <span>Danh sách</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Split-View Layout (Cards on Left + Interactive Map on Right) */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-12">
        {/* Left Column: Match Cards */}
        <div
          className={`space-y-2 sm:space-y-2.5 lg:col-span-7 ${mobileView === "map" ? "hidden lg:block" : "block"
            }`}
        >
          {sessionsQuery.isLoading ? (
            <div className="flex flex-col gap-2.5">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="flex items-stretch gap-3 rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-xs animate-pulse"
                >
                  <div className="w-24 sm:w-28 h-24 rounded-xl bg-slate-200 shrink-0" />
                  <div className="flex-1 flex flex-col justify-between py-1 space-y-2">
                    <div className="flex justify-between">
                      <div className="h-4 w-28 rounded bg-slate-200" />
                      <div className="h-4 w-16 rounded bg-slate-100" />
                    </div>
                    <div className="h-4 w-3/4 rounded bg-slate-200" />
                    <div className="h-3 w-1/2 rounded bg-slate-100" />
                    <div className="flex justify-between pt-1">
                      <div className="h-4 w-20 rounded bg-slate-200" />
                      <div className="h-4 w-12 rounded bg-slate-100" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredSessions.length === 0 ? (
            activeChip === "saved" ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-amber-300 bg-amber-50/40 p-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 mb-2 border border-amber-200">
                  <Bookmark className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Bạn chưa lưu kèo nào
                </h3>
                <p className="mt-1 max-w-xs text-xs text-slate-500 leading-relaxed">
                  Khi lướt các buổi chơi, hãy bấm biểu tượng lưu (🔖) trên thẻ kèo để xem lại sau bất cứ lúc nào!
                </p>
                <button
                  type="button"
                  onClick={() => setActiveChip("all")}
                  className="mt-3.5 rounded-full bg-slate-900 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-600 transition shadow-sm"
                >
                  Xem tất cả các kèo
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <span className="text-3xl">🏸</span>
                <h3 className="mt-2 text-sm font-bold text-slate-800">
                  Không tìm thấy buổi chơi nào
                </h3>
                <p className="mt-1 max-w-xs text-xs text-slate-500">
                  Hãy thử chọn quận khác, xóa từ khóa tìm kiếm hoặc bấm đặt lại bộ lọc.
                </p>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="mt-3 rounded-full bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-600 transition"
                >
                  Đặt lại bộ lọc
                </button>
              </div>
            )
          ) : viewMode === "list" ? (
            /* LIST VIEW: Compact Horizontal Cards */
            <div className="flex flex-col gap-2 sm:gap-2.5">
              {filteredSessions.map((session: any, idx: number) => {
                const sId =
                  session.id ?? session._id ?? session.slug ?? `session-${idx}`;
                const isSelected = selectedSessionId === sId;

                return (
                  <div
                    key={sId}
                    onMouseEnter={() => setSelectedSessionId(sId)}
                    className={`transition-all duration-200 ${isSelected
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
            <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
              {filteredSessions.map((session: any, idx: number) => {
                const sId =
                  session.id ?? session._id ?? session.slug ?? `session-${idx}`;
                const isSelected = selectedSessionId === sId;

                return (
                  <div
                    key={sId}
                    onMouseEnter={() => setSelectedSessionId(sId)}
                    className={`transition-all duration-200 ${isSelected
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

        {/* Right Column: Sticky Interactive Leaflet Map */}
        <div
          className={`lg:col-span-5 ${mobileView === "list" ? "hidden lg:block" : "block"
            }`}
        >
          <div className="sticky top-16 sm:top-20">
            <div className="flex items-center justify-between px-1 pb-1.5 text-xs">
              <span className="flex items-center gap-1.5 font-bold text-slate-700">
                <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                <span>Bản đồ vị trí sân ({mapVenues.length} điểm)</span>
              </span>
              <span className="text-[10.5px] text-slate-400">
                Nhấp ghim để xem kèo
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
