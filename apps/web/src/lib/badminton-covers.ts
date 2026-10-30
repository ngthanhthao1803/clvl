export interface BadmintonCoverPreset {
  id: string;
  title: string;
  tag: string;
  url: string;
}

export const DEFAULT_BADMINTON_COVER = "/images/covers/badminton.jpg";

export const BADMINTON_COVER_PRESETS: BadmintonCoverPreset[] = [
  {
    id: "default-badminton",
    title: "Ảnh Mặc Định CLVL",
    tag: "Mặc định",
    url: DEFAULT_BADMINTON_COVER,
  },
];

const LEGACY_PRESET_URLS = new Set([
  "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1521537634581-0dced2fed2a8?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1613918108466-292b78a8ef95?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80",
]);

/**
 * Resolves the cover image for a badminton match session:
 * 1. Uses custom uploaded image or URL provided by host if present (ignoring legacy Unsplash preset links).
 * 2. Otherwise returns DEFAULT_BADMINTON_COVER ("/images/covers/badminton.jpg").
 */
export function resolveCoverImage(customUrl?: string, _seed?: string): string {
  if (customUrl && typeof customUrl === "string") {
    const trimmed = customUrl.trim();
    if (trimmed.length > 0 && !LEGACY_PRESET_URLS.has(trimmed)) {
      return trimmed;
    }
  }

  return DEFAULT_BADMINTON_COVER;
}
