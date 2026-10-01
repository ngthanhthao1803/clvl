import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Khám Phá Kèo Cầu Lông & Bản Đồ Sân Toàn Quốc",
  description:
    "Tìm kiếm các buổi chơi cầu lông gần bạn, lọc theo quận huyện, trình độ từ Newbie đến Khá/Giỏi, xem bản đồ sân và đặt chỗ nhanh chóng tại danhcaulong.com.",
  openGraph: {
    title: "Khám Phá Kèo Cầu Lông & Bản Đồ Sân Toàn Quốc | danhcaulong.com",
    description:
      "Tìm kiếm các buổi chơi cầu lông gần bạn, lọc theo quận huyện, trình độ từ Newbie đến Khá/Giỏi, xem bản đồ sân và đặt chỗ nhanh chóng.",
  },
};

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
