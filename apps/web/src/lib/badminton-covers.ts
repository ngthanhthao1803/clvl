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

/**
 * Mobile-friendly image compressor for session cover images.
 * Uses createImageBitmap / URL.createObjectURL instead of FileReader.readAsDataURL
 * to prevent memory crashes on 12MP-48MP phone camera photos (iOS Safari / Android WebView),
 * and compresses output to < ~80KB so mobile uploads succeed rapidly through any proxy.
 */
export async function compressCoverImageFile(file: File): Promise<string> {
  const isLikelyImage =
    !file.type ||
    file.type.startsWith("image/") ||
    file.type === "application/octet-stream" ||
    /\.(jpe?g|png|webp|gif|heic|heif|bmp|avif)$/i.test(file.name || "");

  if (!isLikelyImage) {
    throw new Error("Vui lòng chọn tệp hình ảnh hợp lệ (JPG, PNG, WebP).");
  }

  if (file.size > 20 * 1024 * 1024) {
    throw new Error("Hình ảnh quá lớn (tối đa 20MB). Vui lòng chọn ảnh khác.");
  }

  const maxWidth = 900;
  const maxHeight = 506;

  const renderToCompressedDataUrl = (
    source: CanvasImageSource,
    srcWidth: number,
    srcHeight: number,
  ): string => {
    let width = srcWidth || 800;
    let height = srcHeight || 450;

    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = Math.max(1, Math.round(width * ratio));
      height = Math.max(1, Math.round(height * ratio));
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Không thể khởi tạo bộ xử lý hình ảnh trên thiết bị này.");
    }

    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(source, 0, 0, width, height);

    const qualities = [0.8, 0.68, 0.55, 0.45];
    let dataUrl = "";
    for (const q of qualities) {
      dataUrl = canvas.toDataURL("image/jpeg", q);
      if (dataUrl.length <= 95_000) {
        break;
      }
    }
    return dataUrl;
  };

  // 1. Try createImageBitmap first (best for mobile Safari/Chrome & EXIF orientation)
  if (typeof window !== "undefined" && "createImageBitmap" in window) {
    try {
      const bitmap = await createImageBitmap(file);
      try {
        return renderToCompressedDataUrl(bitmap, bitmap.width, bitmap.height);
      } finally {
        bitmap.close?.();
      }
    } catch {
      // Fall through to URL.createObjectURL
    }
  }

  // 2. Fallback to URL.createObjectURL + HTMLImageElement
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      try {
        const result = renderToCompressedDataUrl(
          img,
          img.naturalWidth || img.width,
          img.naturalHeight || img.height,
        );
        URL.revokeObjectURL(objectUrl);
        resolve(result);
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(
        new Error(
          "Không thể đọc định dạng ảnh này trên điện thoại. Vui lòng chọn ảnh JPG hoặc PNG.",
        ),
      );
    };

    img.src = objectUrl;
  });
}
