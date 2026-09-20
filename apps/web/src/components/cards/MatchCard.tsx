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
} from "lucide-react";
import { SkillBadge } from "@/components/ui/SkillBadge";
import { BADMINTON_COVER_PRESETS, resolveCoverImage } from "@/lib/badminton-covers";

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

function parseDateTime(datetimeStr?: string): {
  time: string;
  date: string;
  isTonight: boolean;
} {
  if (!datetimeStr) {
    return { time: "--:--", date: "Chưa định", isTonight: false };
  }

  const d = new Date(datetimeStr);
  if (!isNaN(d.getTime())) {
    const time = d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const isTonight = isToday && d.getHours() >= 18;

    let date = d.toLocaleDateString("vi-VN", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
    });
    if (isTonight) date = "Tối nay";
    else if (isToday) date = "Hôm nay";

    return { time, date, isTonight };
  }

  const parts = datetimeStr.split(",");
  if (parts.length >= 2) {
    const dStr = parts[0].trim();
    const isTonight = dStr.toLowerCase().includes("tối");
    return { date: dStr, time: parts[1].trim(), isTonight };
  }

  const isTonight = datetimeStr.toLowerCase().includes("tối");
  return { time: datetimeStr, date: isTonight ? "Tối nay" : "Sắp tới", isTonight };
}

export function MatchCard({
  session,
  layout = "auto",
  className,
}: MatchCardProps) {
  const sessionId = session.id ?? session._id ?? session.slug ?? "";
  const skillLevel =
    session.skillRequirements ?? session.skillRequirement ?? "TB";

  const { time, date } = parseDateTime(session.datetime);
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

  // Host Info
  const host = typeof session.host === "object" ? session.host : null;
  const hostName = host?.name || "CLVL Host";
  const hostReputation = host?.reputation ?? 100;
  const isVerifiedHost = Boolean(host?.isVerifiedHost);

  // Status conditions
  const isFull = slotsLeft === 0 || session.status === "full";
  const isCancelled = session.status === "cancelled";
  const isAlmostFull = slotsLeft > 0 && slotsLeft <= 2;

  // Mini badge on image
  const thumbnailStatusBadge = isCancelled ? (
    <span className="inline-flex items-center rounded-md bg-rose-600/90 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-xs">
      Đã hủy
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
        className
      )}
    >
      {/* Left Thumbnail (Fixed compact width, full height) */}
      <div className="relative w-24 sm:w-28 shrink-0 overflow-hidden rounded-xl bg-slate-900 self-stretch min-h-[96px]">
        <img
          src={imageSrc}
          alt={session.title}
          onError={() => setImageSrc(BADMINTON_COVER_PRESETS[0].url)}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
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
          <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/70 leading-tight">
            <Clock className="h-3 w-3 shrink-0 text-emerald-600" />
            <span>{time}</span>
            <span className="text-emerald-400">·</span>
            <span>{date}</span>
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
        className
      )}
    >
      {/* Compact Image Header */}
      <div className="relative h-24 sm:h-28 w-full overflow-hidden bg-slate-900 shrink-0">
        <img
          src={imageSrc}
          alt={session.title}
          onError={() => setImageSrc(BADMINTON_COVER_PRESETS[0].url)}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
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
          <div>{thumbnailStatusBadge}</div>
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
          <div className="flex items-center gap-1 text-[10.5px] font-bold text-emerald-700 leading-tight">
            <Clock className="h-3 w-3 shrink-0 text-emerald-600" />
            <span className="truncate">{time} · {date}</span>
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
