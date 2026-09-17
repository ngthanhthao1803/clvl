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
  const levels = Array.isArray(level) ? level : [level];

  if (levels.length > 1) {
    return (
      <div className={clsx("flex flex-wrap gap-2", className)}>
        {levels.map((item) => (
          <span
            key={item}
            className={clsx(
              "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1",
              resolveTone(item),
            )}
          >
            {item}
          </span>
        ))}
      </div>
    );
  }

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1",
        resolveTone(levels[0]),
        className,
      )}
    >
      {levels[0]}
    </span>
  );
}
