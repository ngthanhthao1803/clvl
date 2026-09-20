import { Star } from "lucide-react";
import { SkillBadge } from "@/components/ui/SkillBadge";
import { getDefaultAvatar } from "@/lib/badminton-avatars";

export type PlayerCardProps = {
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
  const avatarUrl = player.avatar || getDefaultAvatar(player.name, player.id);

  return (
    <article className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-emerald-100 ring-2 ring-emerald-500/20 shadow-xs">
          <img
            src={avatarUrl}
            alt={player.name}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-lg font-bold text-slate-900">
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
          <p className="text-xs text-slate-500">
            {player.city ?? "Hồ Chí Minh"}{" "}
            {player.district ? `· ${player.district}` : ""}
          </p>
        </div>
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-2">
        <SkillBadge level={player.skillLevel ?? "TB"} />
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 border border-slate-200/80 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          {player.rating?.toFixed(1) ?? "5.0"}
        </span>
        {isLowReputation && (
          <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
            Uy tín thấp
          </span>
        )}
      </div>

      <dl className="mt-3.5 grid grid-cols-2 gap-2 text-sm text-slate-600">
        <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
          <dt className="text-[11px] font-medium text-slate-500">Điểm uy tín</dt>
          <dd className="mt-0.5 text-base font-bold text-slate-900">
            {player.reputation ?? 100} / 100
          </dd>
        </div>
        <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
          <dt className="text-[11px] font-medium text-slate-500">Số trận đã đấu</dt>
          <dd className="mt-0.5 text-base font-bold text-slate-900">
            {player.totalMatches ?? 0} trận
          </dd>
        </div>
      </dl>
    </article>
  );
}
