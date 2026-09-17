import { Star } from "lucide-react";
import { SkillBadge } from "@/components/ui/SkillBadge";

type PlayerCardProps = {
  player: {
    id: string;
    name: string;
    avatar?: string;
    city?: string;
    district?: string;
    rating?: number;
    reputation?: number;
    skillLevel?: string;
    totalMatches?: number;
    isVerifiedHost?: boolean;
    hostedMatchesCount?: number;
  };
};

export function PlayerCard({ player }: PlayerCardProps) {
  const isVerified =
    player.isVerifiedHost || (player.hostedMatchesCount ?? 0) >= 3;
  const isLowReputation = (player.reputation ?? 100) < 70;

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-glow">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-emerald-100 text-lg font-semibold text-emerald-700">
          {player.avatar ? (
            <img
              src={player.avatar}
              alt={player.name}
              className="h-full w-full object-cover"
            />
          ) : (
            player.name.slice(0, 1)
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-lg font-semibold text-slate-900">
              {player.name}
            </h3>
            {isVerified && (
              <span
                className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700"
                title="Host đã tổ chức nhiều trận thành công"
              >
                ✓ Host Uy Tín
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500">
            {player.city ?? "Việt Nam"}{" "}
            {player.district ? `, ${player.district}` : ""}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <SkillBadge level={player.skillLevel ?? "Beginner"} />
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-3 py-1 text-xs text-slate-600">
          <Star className="h-3.5 w-3.5 text-amber-300" />
          {player.rating?.toFixed(1) ?? "0.0"}
        </span>
        {isLowReputation && (
          <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
            Uy tín thấp
          </span>
        )}
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
        <div className="rounded-2xl bg-slate-50 p-3">
          <dt className="text-slate-500">Uy tín</dt>
          <dd className="mt-1 text-lg font-semibold text-slate-900">
            {player.reputation ?? 0}
          </dd>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <dt className="text-slate-500">Số trận</dt>
          <dd className="mt-1 text-lg font-semibold text-slate-900">
            {player.totalMatches ?? 0}
          </dd>
        </div>
      </dl>
    </article>
  );
}
