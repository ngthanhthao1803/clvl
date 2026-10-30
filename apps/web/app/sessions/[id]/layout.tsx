import type { Metadata } from "next";

const siteUrl = "https://danhcaulong.com";

type MetadataProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
  const { id: sessionId } = await params;
  const apiBase =
    process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:5002/api/v1";

  try {
    const res = await fetch(`${apiBase}/sessions/${sessionId}`, {
      next: { revalidate: 30 },
    });

    if (res.ok) {
      const json = await res.json();
      const session = json?.data?.session;

      if (session) {
        const currentCount =
          session.currentPlayersCount ??
          session.currentPlayers ??
          session.players?.filter(
            (p: any) => p.status === "joined" || p.status === "host",
          ).length ??
          1;
        const maxCount = session.maxPlayers || 8;
        const slotsLeft = Math.max(0, maxCount - currentCount);
        const slotStatus =
          slotsLeft > 0 ? `Còn ${slotsLeft}/${maxCount} chỗ` : "Đã đủ người";

        const d = new Date(session.datetime);
        const isValidDate = !Number.isNaN(d.getTime());
        const timeStr = isValidDate
          ? `${d.toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })} - ${d.toLocaleDateString("vi-VN", {
              weekday: "short",
              day: "2-digit",
              month: "2-digit",
            })}`
          : "";

        const priceStr =
          session.hasGenderPricing && session.priceFemale !== undefined
            ? `Nam ${(session.price || 0).toLocaleString("vi-VN")}đ / Nữ ${
                session.priceFemale > 0
                  ? `${session.priceFemale.toLocaleString("vi-VN")}đ`
                  : "Free"
              }`
            : session.price > 0
              ? `${session.price.toLocaleString("vi-VN")}đ/người`
              : "Chia đều tại sân";

        const skills = Array.isArray(session.skillRequirements)
          ? session.skillRequirements.join(", ")
          : session.skillRequirement || "Mọi trình độ";

        const ogTitle = `🏸 [${slotStatus}] ${session.title} | ${session.venueName}`;
        const ogDescription = `⏰ ${timeStr} · 📍 ${session.venueName} (${
          session.district || session.city || "Việt Nam"
        }) · 💰 ${priceStr} · Trình: ${skills}. Tham gia giữ chỗ ngay trên danhcaulong.com!`;

        const rawCover =
          typeof session.coverImage === "string" ? session.coverImage.trim() : "";
        const isLegacyUnsplash = rawCover.startsWith(
          "https://images.unsplash.com/photo-",
        );
        const coverUrl =
          rawCover && !isLegacyUnsplash && rawCover.startsWith("http")
            ? rawCover
            : `${siteUrl}/images/covers/badminton.jpg`;

        return {
          title: `${session.title} - ${session.venueName} (${session.district || ""})`,
          description: ogDescription,
          alternates: {
            canonical: `${siteUrl}/sessions/${sessionId}`,
          },
          openGraph: {
            title: ogTitle,
            description: ogDescription,
            url: `${siteUrl}/sessions/${sessionId}`,
            siteName: "Đánh Cầu Lông - danhcaulong.com",
            images: [
              {
                url: coverUrl,
                width: 1200,
                height: 630,
                alt: session.title,
              },
            ],
            locale: "vi_VN",
            type: "website",
          },
          twitter: {
            card: "summary_large_image",
            title: ogTitle,
            description: ogDescription,
            images: [coverUrl],
          },
        };
      }
    }
  } catch {
    // Fallback to default metadata if API is unreachable during build
  }

  return {
    title: "Chi tiết kèo cầu lông | Đánh Cầu Lông",
    description:
      "Xem chi tiết buổi giao lưu cầu lông, danh sách tay vợt, vị trí sân và đặt cọc giữ chỗ an toàn tại danhcaulong.com.",
  };
}

export default function SessionDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
