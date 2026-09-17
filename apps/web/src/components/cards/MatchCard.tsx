import Link from "next/link";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { SkillBadge } from "@/components/ui/SkillBadge";

type MatchCardProps = {
  session: {
    id?: string;
    _id?: string;
    slug?: string;
    title: string;
    venueName: string;
    district: string;
    city?: string;
    datetime: string;
    currentPlayers: number;
    maxPlayers: number;
    skillRequirement?: string | string[];
    skillRequirements?: string[];
    matchType: string;
    price: number;
  };
};

export function MatchCard({ session }: MatchCardProps) {
  const sessionId = session.id ?? session._id ?? session.slug ?? "";
  const skillLevel =
    session.skillRequirements ?? session.skillRequirement ?? [];
  const dt = session.datetime ? new Date(session.datetime) : null;
  const timeStr = dt
    ? dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";
  const dateStr = dt ? dt.toLocaleDateString() : "";

  return (
    <Link
      href={`/sessions/${sessionId}`}
      className="group block rounded-3xl border border-slate-200 bg-white p-5 shadow-glow transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50/60"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-emerald-700/90">
            {session.matchType}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">
            {session.title}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {session.city ? `${session.city} · ` : ""}Tổ chức tại{" "}
            {session.venueName}
          </p>
        </div>
        <SkillBadge level={skillLevel} />
      </div>

      <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
        <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2">
          <MapPin className="h-4 w-4 text-emerald-700" /> {session.district}
        </div>
        <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2">
          <CalendarDays className="h-4 w-4 text-emerald-700" /> {timeStr}{" "}
          {dateStr && <span className="ml-2 text-slate-400">{dateStr}</span>}
        </div>
        <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2">
          <Users className="h-4 w-4 text-emerald-700" />{" "}
          {session.currentPlayers}/{session.maxPlayers}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
        <span>{session.price.toLocaleString()} VNĐ</span>
        <span className="text-emerald-700 transition group-hover:translate-x-0.5">
          Xem chi tiết
        </span>
      </div>
    </Link>
  );
}
