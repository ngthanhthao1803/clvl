import { toast } from "@/stores/toast-store";

export async function shareSession(session: {
  id?: string;
  _id?: string;
  title?: string;
  venueName?: string;
  datetime?: string;
  price?: number;
}) {
  const sessionId = session.id || session._id;
  if (!sessionId) {
    toast.error("Không tìm thấy thông tin buổi chơi để chia sẻ");
    return false;
  }

  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://danhcaulong.com";
  const url = `${origin}/sessions/${sessionId}`;

  const title = session.title || "Kèo cầu lông giao lưu CLVL";
  const venue = session.venueName || "Sân cầu lông";
  const text = `🏸 Kèo cầu lông: "${title}" tại ${venue}. Bấm link để xem chi tiết và tham gia cùng anh em!`;

  // 1. Web Share API (mobile native share sheet)
  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share({
        title,
        text,
        url,
      });
      return true;
    } catch (err: any) {
      if (err?.name === "AbortError") {
        // User closed the share menu, no action needed
        return false;
      }
    }
  }

  // 2. Fallback: Copy link to clipboard
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(
        "Đã sao chép link kèo đấu!",
        "Bạn có thể dán vào Zalo, Messenger hoặc gửi cho bạn bè.",
      );
      return true;
    } catch {
      // Try input fallback below
    }
  }

  // 3. Fallback for older browsers
  try {
    const input = document.createElement("input");
    input.value = url;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
    toast.success("Đã sao chép link kèo đấu!");
    return true;
  } catch {
    toast.error("Không thể sao chép liên kết");
    return false;
  }
}
