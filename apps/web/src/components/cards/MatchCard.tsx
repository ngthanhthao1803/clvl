"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import {
  MapPin,
  Clock,
  Users,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Bookmark,
  Share2,
} from "lucide-react";
import { SkillBadge } from "@/components/ui/SkillBadge";
import { BADMINTON_COVER_PRESETS, resolveCoverImage } from "@/lib/badminton-covers";
import { useSavedSessionsStore } from "@/stores/saved-sessions-store";
import { shareSession } from "@/lib/share";
import { toast } from "@/stores/toast-store";

export type MatchCardProps = {
  session: {
    id?: string;
    _id?: string;
    slug?: string;
    title: string;
    venueName: string;
    district?: string;
    city?: string;
    datetime: string;
    currentPlayers?: number;
    currentPlayersCount?: number;
    maxPlayers: number;
    skillRequirement?: string | string[];
    skillRequirements?: string[];
    matchType: string;
    price: number;
    status?: string;
    courtNumber?: string | number;
    depositRequired?: boolean;
    depositAmount?: number;
    latitude?: number;
    longitude?: number;
    googleMapsUrl?: string;
    coverImage?: string;
    imageUrl?: string;
    image?: string;
    host?: {
      id?: string;
      _id?: string;
      name?: string;
      avatar?: string;
      reputation?: number;
      isVerifiedHost?: boolean;
    };
    venue?: {
      name?: string;
      address?: string;
      district?: string;
      googleMapsUrl?: string;
    };
    notes?: string;
  };
  layout?: "horizontal" | "grid" | "auto";
  className?: string;
};

function formatMatchType(type?: string): string {
  if (!type) return "Giao lưu";
  const lower = type.toLowerCase().replace(/[-_]/g, " ");
  if (lower.includes("mixed")) return "Đôi Nam Nữ";
  if (lower.includes("doubles") || lower.includes("đôi")) return "Đôi";
  if (lower.includes("singles") || lower.includes("đơn")) return "Đơn";
  return type;
}

export type TimeStatus = {
  time: string;
  date: string;
  dateLabel: string;
  isTonight: boolean;
  isToday: boolean;
  isTomorrow: boolean;
  isPast: boolean;
  isLive: boolean;
  isStartingSoon: boolean;
  statusText: string;
  badgeStyle: {
    bg: string;
    text: string;
    border: string;
  };
};

function parseDateTime(datetimeStr?: string, durationMinutes = 120): TimeStatus {
  const defaultStatus: TimeStatus = {
    time: "--:--",
    date: "Chưa định",
    dateLabel: "Chưa định",
    isTonight: false,
    isToday: false,
    isTomorrow: false,
    isPast: false,
    isLive: false,
    isStartingSoon: false,
    statusText: "",
    badgeStyle: {
      bg: "bg-emerald-50",
      text: "text-emerald-800",
      border: "border-emerald-200/70",
    },
  };

  if (!datetimeStr) return defaultStatus;

  const d = new Date(datetimeStr);
  if (isNaN(d.getTime())) {
    const isTonight = datetimeStr.toLowerCase().includes("tối");
    return {
      ...defaultStatus,
      time: datetimeStr,
      date: isTonight ? "Tối nay" : "Sắp tới",
      dateLabel: isTonight ? "Tối nay" : "Sắp tới",
      isTonight,
    };
  }

  const now = new Date();
  const startTime = d.getTime();
  const endTime = startTime + (durationMinutes || 120) * 60 * 1000;
  const nowTime = now.getTime();

  const isPast = nowTime > endTime;
  const isLive = nowTime >= startTime && nowTime <= endTime;
  const diffMs = startTime - nowTime;
  const isStartingSoon = diffMs > 0 && diffMs <= 2 * 60 * 60 * 1000; // trong vòng 2h tới

  // Tính số ngày chênh lệch (chỉ so sánh phần ngày)
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const targetDayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const dayDiff = Math.round((targetDayStart - todayStart) / (1000 * 60 * 60 * 24));

  const isToday = dayDiff === 0;
  const isTomorrow = dayDiff === 1;
  const isTonight = isToday && d.getHours() >= 18;

  const time = d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const formattedDate = d.toLocaleDateString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });

  let dateLabel = formattedDate;
  let statusText = "";
  let badgeStyle = {
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200/70",
  };

  if (isPast) {
    statusText = "Đã diễn ra";
    dateLabel = dayDiff === 0 ? "Hôm nay (Đã qua)" : `${formattedDate} (Đã qua)`;
    badgeStyle = {
      bg: "bg-slate-100",
      text: "text-slate-500",
      border: "border-slate-200",
    };
  } else if (isLive) {
    statusText = "Đang diễn ra";
    dateLabel = "Đang đánh ngay lúc này";
    badgeStyle = {
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-200",
    };
  } else if (isStartingSoon) {
    const minutesLeft = Math.max(1, Math.round(diffMs / (60 * 1000)));
    statusText = `Bắt đầu sau ${minutesLeft} phút`;
    dateLabel = `Sắp đấu (${minutesLeft}p)`;
    badgeStyle = {
      bg: "bg-amber-50",
      text: "text-amber-800",
      border: "border-amber-300",
    };
  } else if (isTonight) {
    statusText = "Tối nay";
    dateLabel = "Tối nay";
    badgeStyle = {
      bg: "bg-emerald-100/90",
      text: "text-emerald-900",
      border: "border-emerald-300",
    };
  } else if (isToday) {
    statusText = "Hôm nay";
    dateLabel = "Hôm nay";
    badgeStyle = {
      bg: "bg-emerald-100/90",
      text: "text-emerald-900",
      border: "border-emerald-300",
    };
  } else if (isTomorrow) {
    statusText = "Ngày mai";
    dateLabel = "Ngày mai";
    badgeStyle = {
      bg: "bg-sky-50",
      text: "text-sky-800",
      border: "border-sky-200",
    };
  } else if (dayDiff > 1 && dayDiff <= 6) {
    dateLabel = `${formattedDate} (${dayDiff} ngày tới)`;
  }

  return {
    time,
    date: dateLabel,
    dateLabel,
    isTonight,
    isToday,
    isTomorrow,
    isPast,
    isLive,
    isStartingSoon,
    statusText,
    badgeStyle,
  };
}

export function MatchCard({
  session,
  layout = "auto",
  className,
}: MatchCardProps) {
  const sessionId = session.id ?? session._id ?? session.slug ?? "";
  const skillLevel =
    session.skillRequirements ?? session.skillRequirement ?? "TB";

  const timeInfo = parseDateTime(
    session.datetime,
    (session as any).duration || 120,
  );
  const matchType = formatMatchType(session.matchType);

  const currentCount =
    session.currentPlayers ?? session.currentPlayersCount ?? 0;
  const maxCount = session.maxPlayers || 8;
  const slotsLeft = Math.max(0, maxCount - currentCount);

  // Cover Image resolution
  const rawImage = session.coverImage || session.imageUrl || session.image;
  const initialCover = resolveCoverImage(rawImage, sessionId || session.title);
  const [imageSrc, setImageSrc] = useState(initialCover);

  useEffect(() => {
    setImageSrc(initialCover);
  }, [initialCover]);

  // Saved / Bookmark & Share logic
  const isSaved = useSavedSessionsStore((s) => s.isSaved(sessionId));
  const toggleSave = useSavedSessionsStore((s) => s.toggleSave);

  const handleToggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const saved = toggleSave(session);
    if (saved) {
      toast.success("Đã lưu kèo vào danh sách!", "Bạn có thể xem lại tại tab 'Đã lưu' bất cứ lúc nào.");
    } else {
      toast.info("Đã bỏ lưu kèo");
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await shareSession({
      id: sessionId,
      title: session.title,
      venueName: session.venueName,
      datetime: session.datetime,
      price: session.price,
    });
  };

  // Host Info
  const host = typeof session.host === "object" ? session.host : null;
  const hostName = host?.name || "CLVL Host";
  const hostReputation = host?.reputation ?? 100;
  const isVerifiedHost = Boolean(host?.isVerifiedHost);

  // Status conditions
  const isPastSession = timeInfo.isPast || session.status === "completed";
  const isCancelled = session.status === "cancelled";
  const isFull = slotsLeft === 0 || session.status === "full";
  const isAlmostFull = slotsLeft > 0 && slotsLeft <= 2;

  // Mini badge on image
  const thumbnailStatusBadge = isCancelled ? (
    <span className="inline-flex items-center rounded-md bg-rose-600/90 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-xs">
      Đã hủy
    </span>
  ) : isPastSession ? (
    <span className="inline-flex items-center gap-0.5 rounded-md bg-slate-800/90 backdrop-blur-xs px-1.5 py-0.5 text-[9px] font-bold text-slate-300 border border-white/10 shadow-xs">
      Đã diễn ra
    </span>
  ) : timeInfo.isLive ? (
    <span className="inline-flex items-center gap-1 rounded-md bg-rose-600/95 backdrop-blur-xs px-1.5 py-0.5 text-[9px] font-black text-white shadow-xs animate-pulse">
      <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
      🔴 Đang đánh
    </span>
  ) : timeInfo.isStartingSoon ? (
    <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/95 backdrop-blur-xs px-1.5 py-0.5 text-[9px] font-black text-white shadow-xs animate-pulse">
      ⚡ Sắp đánh
    </span>
  ) : isFull ? (
    <span className="inline-flex items-center rounded-md bg-slate-900/80 px-1.5 py-0.5 text-[9px] font-medium text-slate-200">
      Đã đủ
    </span>
  ) : isAlmostFull ? (
    <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/95 px-1.5 py-0.5 text-[9px] font-black text-white shadow-xs">
      <span className="h-1 w-1 rounded-full bg-white animate-pulse" />
      Còn {slotsLeft}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-600/90 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-xs">
      Còn {slotsLeft} chỗ
    </span>
  );

  // Inline status pill for text rows
  const inlineStatusPill = isCancelled ? (
    <span className="inline-flex items-center rounded-md bg-rose-50 px-1.5 py-0.5 text-[9.5px] font-bold text-rose-700 border border-rose-200">
      Đã hủy
    </span>
  ) : isPastSession ? (
    <span className="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-[9.5px] font-medium text-slate-500 border border-slate-200">
      Đã kết thúc
    </span>
  ) : timeInfo.isLive ? (
    <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-1.5 py-0.5 text-[9.5px] font-bold text-rose-700 border border-rose-200">
      <span className="h-1 w-1 rounded-full bg-rose-500 animate-ping" />
      Đang diễn ra
    </span>
  ) : isFull ? (
    <span className="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-[9.5px] font-medium text-slate-600 border border-slate-200">
      Đã đủ chỗ
    </span>
  ) : isAlmostFull ? (
    <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[9.5px] font-bold text-amber-700 border border-amber-200">
      <span className="h-1 w-1 rounded-full bg-amber-500 animate-ping" />
      Còn {slotsLeft} slot
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[9.5px] font-bold text-emerald-700 border border-emerald-200">
      <span className="h-1 w-1 rounded-full bg-emerald-500" />
      Còn {slotsLeft} chỗ
    </span>
  );

  /* -------------------------------------------------------------
   * RENDER: 1. Horizontal Compact Card (Mobile-First High Density)
   * ------------------------------------------------------------- */
  const renderHorizontal = () => (
    <Link
      href={`/sessions/${sessionId}`}
      className={clsx(
        "group flex items-stretch gap-2.5 sm:gap-3 rounded-2xl border border-slate-200/90 bg-white p-2 sm:p-2.5 shadow-xs transition-all duration-200 hover:border-emerald-400 hover:shadow-md active:scale-[0.995]",
        isPastSession && "opacity-75 hover:opacity-100 bg-slate-50/70 border-slate-200",
        className,
      )}
    >
      {/* Left Thumbnail (Fixed compact width, full height) */}
      <div className="relative w-24 sm:w-28 shrink-0 overflow-hidden rounded-xl bg-slate-900 self-stretch min-h-[96px]">
        <img
          src={imageSrc}
          alt={session.title}
          onError={() => setImageSrc(BADMINTON_COVER_PRESETS[0].url)}
          loading="lazy"
          className={clsx(
            "h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105",
            isPastSession && "grayscale-[30%]",
          )}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 pointer-events-none" />

        {/* Top Mini Pill: Match Type */}
        <div className="absolute top-1.5 left-1.5 pointer-events-none">
          <span className="rounded-md bg-black/65 backdrop-blur-xs px-1.5 py-0.5 text-[9px] font-bold text-white border border-white/20 leading-none">
            {matchType}
          </span>
        </div>

        {/* Bottom Mini Pill: Slots Status */}
        <div className="absolute bottom-1.5 inset-x-1.5 pointer-events-none text-center">
          {thumbnailStatusBadge}
        </div>
      </div>

      {/* Right Column: Rich Info */}
      <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
        {/* Row 1: Datetime Badge + Escrow / Status */}
        <div className="flex items-center justify-between gap-1">
          <div
            suppressHydrationWarning
            className={clsx(
              "inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border leading-tight transition-colors",
              timeInfo.badgeStyle.bg,
              timeInfo.badgeStyle.text,
              timeInfo.badgeStyle.border,
            )}
          >
            <Clock className="h-3 w-3 shrink-0" />
            <span suppressHydrationWarning>{timeInfo.time}</span>
            <span className="opacity-50">·</span>
            <span suppressHydrationWarning>{timeInfo.date}</span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {session.depositRequired && (
              <span
                className="inline-flex items-center gap-0.5 rounded-md bg-teal-50 px-1.5 py-0.5 text-[9.5px] font-bold text-teal-700 border border-teal-200/80 leading-none"
                title="Bảo đảm ký quỹ chống bùng kèo CLVL"
              >
                <ShieldCheck className="h-3 w-3 text-teal-600" />
                <span className="hidden sm:inline">Ký quỹ</span>
              </span>
            )}

            {/* Quick Share */}
            <button
              type="button"
              onClick={handleShare}
              title="Chia sẻ kèo đấu"
              className="p-1 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition active:scale-90"
            >
              <Share2 className="h-3.5 w-3.5" />
            </button>

            {/* Quick Bookmark / Save */}
            <button
              type="button"
              onClick={handleToggleSave}
              title={isSaved ? "Bỏ lưu kèo" : "Lưu kèo xem sau"}
              className={clsx(
                "p-1 rounded-md transition active:scale-90",
                isSaved
                  ? "text-amber-500 bg-amber-50 hover:bg-amber-100"
                  : "text-slate-400 hover:text-amber-500 hover:bg-slate-100",
              )}
            >
              <Bookmark className={clsx("h-3.5 w-3.5", isSaved && "fill-amber-500")} />
            </button>
          </div>
        </div>

        {/* Row 2: Venue Name (Bold) + District */}
        <div className="mt-0.5">
          <h3 className="text-xs sm:text-[13.5px] font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1 leading-snug">
            {session.venueName}
            {session.courtNumber ? (
              <span className="font-semibold text-slate-500 text-[11px] ml-1">
                (Sân {session.courtNumber})
              </span>
            ) : null}
          </h3>
          <p className="flex items-center gap-1 text-[10.5px] text-slate-500 line-clamp-1 leading-tight mt-0.5">
            <MapPin className="h-3 w-3 text-emerald-600 shrink-0" />
            <span className="truncate font-medium text-slate-600">
              {session.district ? `${session.district}` : session.city || "TP.HCM"}
            </span>
            <span className="text-slate-300">·</span>
            <span className="truncate text-slate-400">{session.title}</span>
          </p>
        </div>

        {/* Row 3: Skill Badge + Host Info */}
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10.5px]">
          <SkillBadge level={skillLevel} className="text-[9.5px] px-1.5 py-0" />

          {hostName && (
            <div className="inline-flex items-center gap-1 text-slate-600 text-[10.5px] truncate max-w-[140px] sm:max-w-none">
              <span className="h-1 w-1 rounded-full bg-slate-300 shrink-0" />
              <span className="text-slate-400">Host:</span>
              <span className="font-semibold text-slate-700 truncate">{hostName}</span>
              {hostReputation > 0 && (
                <span className="text-amber-600 font-bold shrink-0">⭐{hostReputation}</span>
              )}
              {isVerifiedHost && (
                <ShieldCheck className="h-3 w-3 text-emerald-600 shrink-0" />
              )}
            </div>
          )}
        </div>

        {/* Row 4: Price & Slots Left & CTA */}
        <div className="mt-1 flex items-center justify-between border-t border-slate-100 pt-1 text-xs">
          <div className="flex items-baseline gap-1">
            <span className="text-xs sm:text-[13px] font-black text-emerald-600 leading-none">
              {session.price > 0 ? `${session.price.toLocaleString("vi-VN")}đ` : "Miễn phí"}
            </span>
            <span className="text-[9px] text-slate-400 font-medium">/người</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
              <Users className="h-3 w-3 text-slate-400 shrink-0" />
              <span className="font-bold text-slate-700">
                {currentCount}/{maxCount}
              </span>
            </div>
            <span className="inline-flex items-center text-xs font-bold text-emerald-700 group-hover:text-emerald-800 transition-colors">
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );

  /* -------------------------------------------------------------
   * RENDER: 2. Grid Compact Card (Ultra-Compact Vertical)
   * ------------------------------------------------------------- */
  const renderGrid = () => (
    <Link
      href={`/sessions/${sessionId}`}
      className={clsx(
        "group flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-md active:scale-[0.995]",
        isPastSession && "opacity-75 hover:opacity-100 bg-slate-50/70 border-slate-200",
        className,
      )}
    >
      {/* Compact Image Header */}
      <div className="relative h-24 sm:h-28 w-full overflow-hidden bg-slate-900 shrink-0">
        <img
          src={imageSrc}
          alt={session.title}
          onError={() => setImageSrc(BADMINTON_COVER_PRESETS[0].url)}
          loading="lazy"
          className={clsx(
            "h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105",
            isPastSession && "grayscale-[30%]",
          )}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/35 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute inset-x-2 top-2 flex items-start justify-between gap-1 pointer-events-none">
          <div className="flex flex-wrap items-center gap-1">
            <span className="rounded-md bg-black/65 backdrop-blur-xs px-1.5 py-0.5 text-[9px] font-bold text-white border border-white/20 leading-none">
              {matchType}
            </span>
            {session.depositRequired && (
              <span
                className="rounded-md bg-teal-500/95 backdrop-blur-xs p-0.5 text-white shadow-xs border border-white/20"
                title="Bảo đảm ký quỹ"
              >
                <ShieldCheck className="h-2.5 w-2.5" />
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 pointer-events-auto">
            {thumbnailStatusBadge}

            {/* Quick Share */}
            <button
              type="button"
              onClick={handleShare}
              title="Chia sẻ kèo đấu"
              className="p-1 rounded-md bg-black/55 backdrop-blur-xs text-white/85 hover:text-white hover:bg-black/75 border border-white/20 transition active:scale-90"
            >
              <Share2 className="h-3 w-3" />
            </button>

            {/* Quick Bookmark / Save */}
            <button
              type="button"
              onClick={handleToggleSave}
              title={isSaved ? "Bỏ lưu kèo" : "Lưu kèo xem sau"}
              className={clsx(
                "p-1 rounded-md backdrop-blur-xs border transition active:scale-90",
                isSaved
                  ? "bg-amber-500 text-white border-amber-400"
                  : "bg-black/55 text-white/85 hover:text-white hover:bg-black/75 border-white/20",
              )}
            >
              <Bookmark className={clsx("h-3 w-3", isSaved && "fill-white")} />
            </button>
          </div>
        </div>

        {/* Bottom Price on Image */}
        <div className="absolute bottom-1.5 right-2 rounded-md bg-slate-950/80 backdrop-blur-xs px-1.5 py-0.5 text-right border border-white/15 pointer-events-none">
          <span className="text-[11px] sm:text-xs font-black text-emerald-400 leading-none">
            {session.price > 0
              ? `${session.price.toLocaleString("vi-VN")}đ`
              : "Free"}
          </span>
          <span className="text-[8.5px] text-slate-300 ml-0.5 font-normal">/ng</span>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-2 sm:p-2.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Time highlight */}
          <div
            suppressHydrationWarning
            className={clsx(
              "inline-flex items-center gap-1 text-[10.5px] font-bold px-1.5 py-0.5 rounded-md border leading-tight mb-0.5",
              timeInfo.badgeStyle.bg,
              timeInfo.badgeStyle.text,
              timeInfo.badgeStyle.border,
            )}
          >
            <Clock className="h-3 w-3 shrink-0" />
            <span suppressHydrationWarning className="truncate">{timeInfo.time} · {timeInfo.date}</span>
          </div>

          {/* Venue & District */}
          <h3 className="mt-1 text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1 leading-snug">
            {session.venueName}
          </h3>

          <p className="flex items-center gap-1 text-[10px] text-slate-500 line-clamp-1 leading-tight mt-0.5">
            <MapPin className="h-2.5 w-2.5 text-slate-400 shrink-0" />
            <span className="truncate">{session.district || "TP.HCM"}{session.courtNumber ? ` · Sân ${session.courtNumber}` : ""}</span>
          </p>

          {/* Skill & Host */}
          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            <SkillBadge level={skillLevel} className="text-[9px] px-1 py-0" />
            {hostName && (
              <span className="text-[9.5px] text-slate-500 truncate max-w-[85px]" title={hostName}>
                {hostName} {hostReputation > 0 ? `⭐${hostReputation}` : ""}
              </span>
            )}
          </div>
        </div>

        {/* Bottom Slots & Arrow */}
        <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-1.5 text-[10.5px]">
          <div className="flex items-center gap-1 font-semibold text-slate-600 text-[10px]">
            <Users className="h-2.5 w-2.5 text-slate-400" />
            <span>{currentCount}/{maxCount}</span>
            <span className="text-emerald-600 font-bold text-[9.5px]">
              {slotsLeft > 0 ? `(${slotsLeft} trống)` : "(Hết)"}
            </span>
          </div>
          <ArrowRight className="h-3 w-3 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  );

  /* -------------------------------------------------------------
   * RENDER: 3. Auto Layout (Horizontal on mobile, Grid on desktop)
   * ------------------------------------------------------------- */
  if (layout === "horizontal") return renderHorizontal();
  if (layout === "grid") return renderGrid();

  // "auto": Responsive switcher
  return (
    <>
      <div className="block sm:hidden">{renderHorizontal()}</div>
      <div className="hidden sm:block">{renderHorizontal()}</div>
    </>
  );
}
