"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Clock, Users, ShieldCheck, ArrowRight } from "lucide-react";
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
  };
};

function formatMatchType(type?: string): string {
  if (!type) return "Giao lưu";
  const lower = type.toLowerCase().replace(/[-_]/g, " ");
  if (lower.includes("mixed")) return "Đôi Nam Nữ";
  if (lower.includes("doubles") || lower.includes("đôi")) return "Đôi";
  if (lower.includes("singles") || lower.includes("đơn")) return "Đơn";
  return type;
}

function parseDateTime(datetimeStr?: string): { time: string; date: string } {
  if (!datetimeStr) return { time: "--:--", date: "Chưa định" };
  const d = new Date(datetimeStr);
  if (!isNaN(d.getTime())) {
    const time = d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const date = d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
    return { time, date };
  }
  const parts = datetimeStr.split(",");
  if (parts.length >= 2) {
    return { date: parts[0].trim(), time: parts[1].trim() };
  }
  return { time: datetimeStr, date: "Sắp tới" };
}

export function MatchCard({ session }: MatchCardProps) {
  const sessionId = session.id ?? session._id ?? session.slug ?? "";
  const skillLevel =
    session.skillRequirements ?? session.skillRequirement ?? "TB";

  const { time, date } = parseDateTime(session.datetime);
  const matchType = formatMatchType(session.matchType);

  const currentCount =
    session.currentPlayers ?? session.currentPlayersCount ?? 0;
  const maxCount = session.maxPlayers || 8;
  const slotsLeft = Math.max(0, maxCount - currentCount);

  // Cover Image resolution (custom from host or deterministic preset)
  const rawImage = session.coverImage || session.imageUrl || session.image;
  const initialCover = resolveCoverImage(rawImage, sessionId || session.title);
  const [imageSrc, setImageSrc] = useState(initialCover);

  useEffect(() => {
    setImageSrc(initialCover);
  }, [initialCover]);

  // Status Badge calculation
  const isFull = slotsLeft === 0 || session.status === "full";
  const isCancelled = session.status === "cancelled";
  const isAlmostFull = slotsLeft > 0 && slotsLeft <= 2;

  let statusBadge = (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/90 backdrop-blur-md px-2.5 py-0.5 text-[10.5px] font-bold text-white shadow-sm border border-emerald-400/40 leading-none">
      <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
      Mở đăng ký
    </span>
  );

  if (isCancelled) {
    statusBadge = (
      <span className="inline-flex items-center rounded-full bg-rose-600/90 backdrop-blur-md px-2.5 py-0.5 text-[10.5px] font-bold text-white shadow-sm border border-rose-400/40 leading-none">
        Đã hủy
      </span>
    );
  } else if (isFull) {
    statusBadge = (
      <span className="inline-flex items-center rounded-full bg-slate-900/85 backdrop-blur-md px-2.5 py-0.5 text-[10.5px] font-semibold text-slate-200 border border-white/20 leading-none">
        Đã đủ chỗ
      </span>
    );
  } else if (isAlmostFull) {
    statusBadge = (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/95 backdrop-blur-md px-2.5 py-0.5 text-[10.5px] font-bold text-white shadow-sm border border-amber-300/40 leading-none">
        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
        Còn {slotsLeft} chỗ
      </span>
    );
  }

  return (
    <Link
      href={`/sessions/${sessionId}`}
      className="group block overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400 hover:shadow-xl"
    >
      {/* 1. Badminton Court Image Header */}
      <div className="relative h-36 sm:h-40 w-full overflow-hidden bg-slate-900">
        <img
          src={imageSrc}
          alt={session.title}
          onError={() => setImageSrc(BADMINTON_COVER_PRESETS[0].url)}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Ambient Gradient Overlays for optimal text/badge legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/45 pointer-events-none" />

        {/* Top Badges: Match Type, Escrow, Status */}
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2 pointer-events-none">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-white/95 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-bold text-slate-900 shadow-sm leading-tight border border-white/40">
              {matchType}
            </span>
            {session.depositRequired && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/95 backdrop-blur-md px-2 py-0.5 text-[11px] font-bold text-white shadow-sm leading-tight border border-emerald-400/40">
                <ShieldCheck className="h-3 w-3 shrink-0" />
                <span>Ký quỹ</span>
              </span>
            )}
          </div>
          <div>{statusBadge}</div>
        </div>

        {/* Bottom Floating Price Badge on Image */}
        <div className="absolute bottom-2.5 right-3 rounded-xl bg-slate-950/85 backdrop-blur-md px-2.5 py-1 text-right shadow-sm border border-white/15 pointer-events-none">
          <span className="text-sm sm:text-[15px] font-black text-emerald-400 leading-none">
            {session.price > 0
              ? `${session.price.toLocaleString("vi-VN")} đ`
              : "Miễn phí"}
          </span>
          <span className="text-[10px] text-slate-300 font-medium ml-1">
            / người
          </span>
        </div>
      </div>

      {/* 2. Card Content Body */}
      <div className="p-3.5 sm:p-4">
        {/* Title */}
        <h3
          className="text-sm sm:text-[15px] font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1 leading-snug"
          title={session.title}
        >
          {session.title}
        </h3>

        {/* Venue & District */}
        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 line-clamp-1 leading-none">
          <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          <span className="font-semibold text-slate-700 truncate">{session.venueName}</span>
          {session.courtNumber ? <span>(Sân {session.courtNumber})</span> : null}
          {session.district ? (
            <>
              <span className="text-slate-300">·</span>
              <span className="shrink-0">{session.district}</span>
            </>
          ) : null}
        </p>

        {/* Key Info Chips: Time, Skill, Players */}
        <div className="mt-2.5 grid grid-cols-3 gap-2 rounded-xl bg-slate-50/90 border border-slate-100 px-2.5 py-1.5 text-xs text-slate-600">
          {/* Time */}
          <div className="flex flex-col">
            <span className="text-[9.5px] uppercase font-bold text-slate-400 leading-none">
              Thời gian
            </span>
            <span className="mt-0.5 font-bold text-slate-800 text-xs leading-tight">{time}</span>
            <span className="text-[10px] text-slate-400 leading-none">{date}</span>
          </div>

          {/* Skill Range */}
          <div className="flex flex-col">
            <span className="text-[9.5px] uppercase font-bold text-slate-400 leading-none">
              Trình độ
            </span>
            <div className="mt-0.5">
              <SkillBadge level={skillLevel} className="text-[10.5px] px-2 py-0" />
            </div>
          </div>

          {/* Players */}
          <div className="flex flex-col items-end">
            <span className="text-[9.5px] uppercase font-bold text-slate-400 leading-none">
              Số người
            </span>
            <span className="mt-0.5 font-bold text-slate-800 text-xs leading-tight">
              {currentCount}/{maxCount}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold leading-none">
              {slotsLeft > 0 ? `Còn ${slotsLeft} chỗ` : "Đã đủ"}
            </span>
          </div>
        </div>

        {/* Bottom Footer: Host info / Quick Action */}
        <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="line-clamp-1">Giao lưu thể thao CLVL</span>
          </div>

          <div className="inline-flex items-center gap-1 font-bold text-emerald-700 group-hover:text-emerald-800 text-xs transition-colors">
            <span>Chi tiết</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  );
}
