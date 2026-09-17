import Link from "next/link";
import { MapPin, Clock, Users, ShieldCheck, ArrowRight } from "lucide-react";
import { SkillBadge } from "@/components/ui/SkillBadge";

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

  // Status Badge calculation
  const isFull = slotsLeft === 0 || session.status === "full";
  const isCancelled = session.status === "cancelled";
  const isAlmostFull = slotsLeft > 0 && slotsLeft <= 2;

  let statusBadge = (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200/80 leading-none">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      Mở đăng ký
    </span>
  );

  if (isCancelled) {
    statusBadge = (
      <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 border border-rose-200 leading-none">
        Đã hủy
      </span>
    );
  } else if (isFull) {
    statusBadge = (
      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500 border border-slate-200 leading-none">
        Đã đủ chỗ
      </span>
    );
  } else if (isAlmostFull) {
    statusBadge = (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200 leading-none">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
        Còn {slotsLeft} chỗ
      </span>
    );
  }

  return (
    <Link
      href={`/sessions/${sessionId}`}
      className="group block rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-md"
    >
      {/* Top badges: Match Type, Escrow, Status */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 leading-none">
            {matchType}
          </span>
          {session.depositRequired && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 leading-none">
              <ShieldCheck className="h-3 w-3 text-emerald-600 shrink-0" />
              <span>Có ký quỹ</span>
            </span>
          )}
        </div>
        <div>{statusBadge}</div>
      </div>

      {/* Title */}
      <h3
        className="mt-2 text-sm sm:text-[15px] font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1 leading-snug"
        title={session.title}
      >
        {session.title}
      </h3>

      {/* Venue & District */}
      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 line-clamp-1 leading-none">
        <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
        <span className="font-medium text-slate-700">{session.venueName}</span>
        {session.courtNumber ? <span>(Sân {session.courtNumber})</span> : null}
        {session.district ? (
          <>
            <span className="text-slate-300">·</span>
            <span>{session.district}</span>
          </>
        ) : null}
      </p>

      {/* Key Info Chips: Time, Skill, Players */}
      <div className="mt-2.5 grid grid-cols-3 gap-2 rounded-xl bg-slate-50/80 px-2.5 py-1.5 text-xs text-slate-600">
        {/* Time */}
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-semibold text-slate-400 leading-none">
            Thời gian
          </span>
          <span className="mt-0.5 font-bold text-slate-800 text-xs leading-tight">{time}</span>
          <span className="text-[10px] text-slate-400 leading-none">{date}</span>
        </div>

        {/* Skill Range */}
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-semibold text-slate-400 leading-none">
            Trình độ
          </span>
          <div className="mt-0.5">
            <SkillBadge level={skillLevel} className="text-[11px] px-2 py-0" />
          </div>
        </div>

        {/* Players */}
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase font-semibold text-slate-400 leading-none">
            Số người
          </span>
          <span className="mt-0.5 font-bold text-slate-800 text-xs leading-tight">
            {currentCount}/{maxCount}
          </span>
          <span className="text-[10px] text-emerald-600 font-medium leading-none">
            {slotsLeft > 0 ? `Còn ${slotsLeft} chỗ` : "Đã đủ"}
          </span>
        </div>
      </div>

      {/* Bottom Footer: Price & Link */}
      <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
        <div>
          <span className="text-sm sm:text-[15px] font-extrabold text-emerald-600 leading-none">
            {session.price > 0
              ? `${session.price.toLocaleString("vi-VN")} đ`
              : "Miễn phí"}
          </span>
          <span className="text-[11px] text-slate-400 font-normal ml-1">
            / người
          </span>
        </div>

        <div className="inline-flex items-center gap-1 font-semibold text-emerald-700 group-hover:text-emerald-800 text-xs">
          <span>Chi tiết</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}
