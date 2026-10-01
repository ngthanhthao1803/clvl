export const ALL_SKILLS = [
  "Newbie",
  "Yếu",
  "Yếu+",
  "TBY-",
  "TBY",
  "TBY+",
  "TB-",
  "TB",
  "TB+",
  "Khá-",
  "Khá",
  "Khá+",
  "Pro",
  "Bán chuyên",
  "Trình giải",
] as const;

export type SkillLevel = (typeof ALL_SKILLS)[number];

export type SkillOption = {
  value: SkillLevel;
  label: string;
  group: string;
  desc: string;
};

export const SKILL_OPTIONS: SkillOption[] = [
  {
    value: "Newbie",
    label: "Newbie",
    group: "🌱 Nhập môn",
    desc: "Mới tập chơi",
  },
  {
    value: "Yếu",
    label: "Yếu",
    group: "🌱 Nhập môn",
    desc: "Đã biết luật",
  },
  {
    value: "Yếu+",
    label: "Yếu+",
    group: "🌱 Nhập môn",
    desc: "Yếu cộng",
  },
  {
    value: "TBY-",
    label: "TBY-",
    group: "🏸 Trung bình yếu",
    desc: "Trung bình yếu trừ",
  },
  {
    value: "TBY",
    label: "TBY",
    group: "🏸 Trung bình yếu",
    desc: "Trung bình yếu",
  },
  {
    value: "TBY+",
    label: "TBY+",
    group: "🏸 Trung bình yếu",
    desc: "Trung bình yếu cộng",
  },
  {
    value: "TB-",
    label: "TB-",
    group: "⚡ Phong trào Trung bình",
    desc: "Trung bình trừ",
  },
  {
    value: "TB",
    label: "TB",
    group: "⚡ Phong trào Trung bình",
    desc: "Trung bình",
  },
  {
    value: "TB+",
    label: "TB+",
    group: "⚡ Phong trào Trung bình",
    desc: "Trung bình khá",
  },
  {
    value: "Khá-",
    label: "Khá-",
    group: "🔥 Nâng cao & Khá",
    desc: "Khá trừ",
  },
  {
    value: "Khá",
    label: "Khá",
    group: "🔥 Nâng cao & Khá",
    desc: "Khá",
  },
  {
    value: "Khá+",
    label: "Khá+",
    group: "🔥 Nâng cao & Khá",
    desc: "Khá cộng",
  },
  {
    value: "Pro",
    label: "Pro",
    group: "🏆 Bán chuyên & Đỉnh cao",
    desc: "",
  },
  {
    value: "Bán chuyên",
    label: "Bán chuyên",
    group: "🏆 Bán chuyên & Đỉnh cao",
    desc: "",
  },
  {
    value: "Trình giải",
    label: "Trình giải",
    group: "🏆 Bán chuyên & Đỉnh cao",
    desc: "",
  },
];

export function getSkillDescription(skill: string): string {
  const found = SKILL_OPTIONS.find((s) => s.value === skill);
  return found ? `${found.label} (${found.desc})` : skill;
}
