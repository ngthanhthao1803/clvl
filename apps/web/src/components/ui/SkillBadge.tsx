import clsx from "clsx";

type SkillBadgeProps = {
  level: string | string[];
  className?: string;
};

const toneClasses = {
  gray: "bg-slate-100 text-slate-700 ring-slate-200",
  blue: "bg-sky-100 text-sky-700 ring-sky-200",
  green: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  red: "bg-rose-100 text-rose-700 ring-rose-200",
} as const;

const resolveTone = (value: string) => {
  if (["Newbie", "Yếu", "Yếu+"].includes(value)) return toneClasses.gray;
  if (["TBY-", "TBY", "TBY+", "TB-", "TB", "TB+"].includes(value)) {
    return toneClasses.blue;
  }
  if (["Khá-", "Khá", "Khá+"].includes(value)) return toneClasses.green;
  if (["Pro", "Bán chuyên", "Trình giải"].includes(value)) {
    return toneClasses.red;
  }
  if (["Beginner", "Intermediate", "Intermediate+"].includes(value)) {
    return toneClasses.blue;
  }
  if (["Advanced", "Advanced+"].includes(value)) return toneClasses.green;
  return toneClasses.gray;
};

export function SkillBadge({ level, className }: SkillBadgeProps) {
  const levels = (Array.isArray(level) ? level : [level]).filter(Boolean);

  if (levels.length === 0) {
    return (
      <span
        className={clsx(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-slate-200 bg-slate-50 text-slate-700",
          className,
        )}
      >
        Tự do
      </span>
    );
  }

  // If multiple levels are specified, show: first → last
  if (levels.length > 1 && levels[0] !== levels[levels.length - 1]) {
    const first = levels[0];
    const last = levels[levels.length - 1];
    return (
      <span
        className={clsx(
          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1",
          resolveTone(last),
          className,
        )}
      >
        <span>{first}</span>
        <span className="opacity-60 font-normal">→</span>
        <span>{last}</span>
      </span>
    );
  }

  // Single skill level (no arrow)
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1",
        resolveTone(levels[0]),
        className,
      )}
    >
      {levels[0]}
    </span>
  );
}
