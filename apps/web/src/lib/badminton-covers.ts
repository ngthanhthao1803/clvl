export interface BadmintonCoverPreset {
  id: string;
  title: string;
  tag: string;
  url: string;
}

export const BADMINTON_COVER_PRESETS: BadmintonCoverPreset[] = [
  {
    id: "bwf-court",
    title: "Sân Thảm Tiêu Chuẩn",
    tag: "Chuyên nghiệp",
    url: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "racket-smash",
    title: "Đập Cầu Tốc Độ",
    tag: "Nhiệt huyết",
    url: "https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "night-arena",
    title: "Đèn Đêm Sân Đôi",
    tag: "Kèo tối",
    url: "https://images.unsplash.com/photo-1521537634581-0dced2fed2a8?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "carbon-gear",
    title: "Vợt Carbon & Cầu Lông",
    tag: "Trang thiết bị",
    url: "https://images.unsplash.com/photo-1613918108466-292b78a8ef95?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "speed-shuttle",
    title: "Đường Cầu Bứt Phá",
    tag: "Cọ xát",
    url: "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "sports-hall",
    title: "Nhà Thi Đấu Phong Trào",
    tag: "Giao lưu",
    url: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
  },
];

/**
 * Resolves the cover image for a badminton match session:
 * 1. Uses custom URL provided by host if present and valid.
 * 2. Otherwise chooses a deterministic preset from BADMINTON_COVER_PRESETS based on the session seed (ID, title, etc.).
 */
export function resolveCoverImage(customUrl?: string, seed?: string): string {
  if (customUrl && typeof customUrl === "string" && customUrl.trim().length > 0) {
    return customUrl.trim();
  }

  if (!seed) return BADMINTON_COVER_PRESETS[0].url;

  // Simple string hash
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % BADMINTON_COVER_PRESETS.length;
  return BADMINTON_COVER_PRESETS[index].url;
}
