"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ShieldCheck,
  Users,
  MapPin,
  Calendar,
  Zap,
  Sparkles,
  CheckCircle2,
  Navigation,
  KeyRound,
  Compass,
} from "lucide-react";
import { MatchCard } from "@/components/cards/MatchCard";
import { MapWrapper } from "@/components/map/MapWrapper";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";
import { HeroDynamicBackground } from "@/components/home/HeroDynamicBackground";
import { api } from "@/lib/api";

const defaultFeatured = [
  {
    id: "session-1",
    title: "Khởi động đôi sáng Chủ nhật",
    venueName: "Sân Cầu Lông Kỳ Hòa",
    district: "Quận 10",
    city: "Hồ Chí Minh",
    datetime: "Chủ nhật, 08:00",
    currentPlayers: 6,
    maxPlayers: 8,
    skillRequirements: ["TB"],
    matchType: "doubles",
    price: 80000,
    depositRequired: true,
    latitude: 10.7746,
    longitude: 106.6669,
  },
  {
    id: "session-2",
    title: "Giải giao lưu đôi nam nữ buổi tối",
    venueName: "Sân Cầu Lông Lan Anh",
    district: "Quận 10",
    city: "Hồ Chí Minh",
    datetime: "Thứ Sáu, 19:30",
    currentPlayers: 4,
    maxPlayers: 10,
    skillRequirements: ["Khá"],
    matchType: "mixed doubles",
    price: 95000,
    depositRequired: true,
    latitude: 10.779,
    longitude: 106.671,
  },
  {
    id: "session-3",
    title: "Kèo giao lưu Newbie thân thiện",
    venueName: "Sân Cầu Lông Đào Duy Anh",
    district: "Phú Nhuận",
    city: "Hồ Chí Minh",
    datetime: "Thứ Bảy, 18:00",
    currentPlayers: 3,
    maxPlayers: 6,
    skillRequirements: ["Newbie", "Yếu+"],
    matchType: "doubles",
    price: 70000,
    depositRequired: false,
    latitude: 10.7992,
    longitude: 106.6803,
  },
];

const featuredVenuesMap = [
  {
    id: "v-1",
    name: "Sân Cầu Lông Kỳ Hòa",
    address: "238 Đường 3/2, Phường 12, Quận 10",
    district: "Quận 10",
    latitude: 10.7746,
    longitude: 106.6669,
    price: 80000,
    sessionTitle: "Khởi động đôi sáng Chủ nhật",
    sessionId: "session-1",
  },
  {
    id: "v-2",
    name: "Sân Cầu Lông Lan Anh",
    address: "291 Cách Mạng Tháng 8, Phường 12, Quận 10",
    district: "Quận 10",
    latitude: 10.779,
    longitude: 106.671,
    price: 95000,
    sessionTitle: "Giải giao lưu đôi nam nữ buổi tối",
    sessionId: "session-2",
  },
  {
    id: "v-3",
    name: "Sân Cầu Lông Đào Duy Anh",
    address: "21 Đào Duy Anh, Phường 9, Phú Nhuận",
    district: "Phú Nhuận",
    latitude: 10.7992,
    longitude: 106.6803,
    price: 70000,
    sessionTitle: "Kèo giao lưu Newbie thân thiện",
    sessionId: "session-3",
  },
  {
    id: "v-4",
    name: "Sân Cầu Lông Châu Tử - Hóc Môn",
    address: "139/2A ấp Tân Thới 3, Hóc Môn",
    district: "Hóc Môn",
    latitude: 10.896255,
    longitude: 106.5840769,
    price: 60000,
    sessionTitle: "Giao lưu cầu lông Hóc Môn",
    sessionId: "6aabf2560d6f413727829ff5",
  },
  {
    id: "v-5",
    name: "Sân Cầu Lông Tân Sơn",
    address: "Quận Tân Bình, TP.HCM",
    district: "Tân Bình",
    latitude: 10.8015,
    longitude: 106.6558,
    price: 85000,
    sessionTitle: "Kèo đôi tối thứ 6 Tân Bình",
    sessionId: "demo-tb",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");

  const sessionsQuery = useQuery({
    queryKey: ["home-featured-sessions"],
    queryFn: async () => {
      try {
        const res = await api.get("/sessions", { params: { limit: 6 } });
        const list = res.data?.data?.sessions;
        if (Array.isArray(list) && list.length > 0) return list;
      } catch { }
      return defaultFeatured;
    },
    placeholderData: defaultFeatured,
  });

  const handleSearchMatches = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (selectedDistrict) query.set("district", selectedDistrict);
    if (selectedSkill) query.set("skillLevel", selectedSkill);
    router.push(`/explore?${query.toString()}`);
  };

  const sessions = (sessionsQuery.data ?? defaultFeatured).slice(0, 3);

  return (
    <div className="space-y-12 pb-14 animate-fadeUp">
      {/* Hero Section with Dynamic Background */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-emerald-500/20 bg-slate-950 p-6 shadow-2xl sm:p-10 lg:p-14 text-white">
        {/* Dynamic Animated Canvas, Aurora Orbs & 3D Badminton Court */}
        <HeroDynamicBackground />

        <div className="relative z-10 space-y-6 max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-950/70 backdrop-blur-md px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Nền Tảng Cầu Lông Thông Minh Việt Nam</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl sm:leading-[1.15] drop-shadow-sm">
            Ghép Kèo Lên Sân Cầu Lông,{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(16,185,129,0.45)]">
              Không Lo Bùng Kèo
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-base text-slate-300 sm:text-lg drop-shadow">
            Tìm kèo ghép đôi, bao sân nhanh chóng, xác thực mã check-in tại sân
            và bảo vệ người chơi bằng quỹ ký quỹ ký thác an toàn.
          </p>

          {/* Match Search Bar (Frosted Glassmorphism Console) */}
          <div className="pt-2">
            <form
              onSubmit={handleSearchMatches}
              className="rounded-3xl border border-white/20 bg-white/95 backdrop-blur-xl p-3.5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] sm:p-4 text-left"
            >
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 items-center">
                {/* Field 1: District */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 px-3.5 py-2.5">
                  <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Khu Vực (Quận / Huyện)
                  </span>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="mt-0.5 w-full bg-transparent text-sm font-semibold text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="">Tất cả khu vực</option>
                    <option value="Quận 1">Quận 1</option>
                    <option value="Quận 7">Quận 7</option>
                    <option value="Quận 10">Quận 10</option>
                    <option value="Tân Bình">Tân Bình</option>
                    <option value="Bình Thạnh">Bình Thạnh</option>
                    <option value="Thủ Đức">TP. Thủ Đức</option>
                    <option value="Phú Nhuận">Phú Nhuận</option>
                    <option value="Gò Vấp">Gò Vấp</option>
                    <option value="Hóc Môn">Hóc Môn</option>
                  </select>
                </div>

                {/* Field 2: Time */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 px-3.5 py-2.5">
                  <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Khung Giờ Chơi
                  </span>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="mt-0.5 w-full bg-transparent text-sm font-semibold text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="">Mọi khung giờ</option>
                    <option value="tonight">Tối nay (18:00 - 22:00)</option>
                    <option value="weekend">Cuối tuần (Thứ 7 - CN)</option>
                    <option value="morning">Buổi sáng (06:00 - 10:00)</option>
                  </select>
                </div>

                {/* Field 3: Skill Level */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/90 px-3.5 py-2.5">
                  <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Trình Độ Yêu Cầu
                  </span>
                  <select
                    value={selectedSkill}
                    onChange={(e) => setSelectedSkill(e.target.value)}
                    className="mt-0.5 w-full bg-transparent text-sm font-semibold text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="">Tất cả trình độ</option>
                    <option value="Newbie">Newbie · Người mới</option>
                    <option value="TB-">TB- · Trung bình yếu</option>
                    <option value="TB">TB · Trung bình</option>
                    <option value="TB+">TB+ · Trung bình khá</option>
                    <option value="Khá">Khá · Chơi phong trào tốt</option>
                    <option value="Pro">Pro · Bán chuyên / Giải</option>
                  </select>
                </div>

                {/* Submit Action */}
                <div>
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3.5 px-6 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>Tìm Kèo Lên Sân</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Live Pulse Ticker */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs text-slate-300 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>
                <strong className="text-white">1,056+</strong> Sân cầu lông sẵn sàng
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>
                <strong className="text-white">100%</strong> Ký quỹ hoàn cọc tự động
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <KeyRound className="h-4 w-4 text-emerald-400" />
              <span>
                <strong className="text-white">Mã Check-in</strong> chống kèo ảo
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* Featured Matches */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                Kèo Hot Hôm Nay
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Kèo Cầu Lông Đang Mở Đăng Ký
            </h2>
          </div>
          <Link
            href="/explore"
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition group"
          >
            <span>Xem tất cả kèo</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sessions.map((session: any) => (
            <MatchCard key={session.id || session._id} session={session} />
          ))}
        </div>
      </section>

      {/* Interactive Radar Map Preview (Bản đồ sân bãi) */}
      <section className="overflow-hidden rounded-[2.5rem] border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr] lg:items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
              <Compass className="h-3.5 w-3.5 text-emerald-600" />
              <span>CLVL Radar Map</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Định Vị 1,056+ Sân Cầu Lông Gần Bạn
            </h2>
            <p className="text-sm leading-relaxed text-slate-600">
              Không cần tìm kiếm đâu xa. Nền tảng tự động kết nối và định vị các
              cụm sân xung quanh bạn với chỉ đường Google Maps 1-chạm, thông tin
              bãi xe, giá giờ chơi và các buổi giao lưu đang diễn ra.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <span className="text-2xl font-black text-slate-900">1,056</span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sân bãi được lập chỉ mục GPS
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <span className="text-2xl font-black text-emerald-600">
                  1-Chạm
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chỉ đường Google Maps tận cổng sân
                </p>
              </div>
            </div>

            <div className="pt-1">
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-xs font-bold text-white hover:bg-emerald-600 transition shadow-sm"
              >
                <span>Mở Bản Đồ Toàn Màn Hình</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Interactive Map Preview */}
          <div className="overflow-hidden rounded-3xl border border-slate-200 shadow-md">
            <MapWrapper
              venues={featuredVenuesMap}
              className="h-[380px] w-full"
            />
          </div>
        </div>
      </section>

      {/* CLVL Trust & Escrow Guarantee (Bảo chứng uy tín) */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Bảo Chứng Thể Thao Minh Bạch
          </span>
          <h2 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">
            Vì Sao Bạn Yên Tâm Khi Chơi Cùng CLVL?
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Giải quyết triệt để nỗi đau bùng kèo, thiếu người, hoặc host đăng bài
            ảo thu tiền.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Pillar 1 */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm hover:border-emerald-300 transition-colors">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">
              Ký Quỹ Chống Bùng Kèo
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Người chơi đóng cọc giữ chỗ qua VietQR tự động. Hủy trước 12 tiếng
              được hoàn cọc 100%. Bùng kèo sát giờ sẽ mất cọc đền bù cho Host.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm hover:border-emerald-300 transition-colors">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
              <KeyRound className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">
              Mã Check-in Tại Sân
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Host nhận mã bí mật 6 số và chỉ cấp cho người chơi khi có mặt thực
              tế tại sân. Ngăn chặn 100% tình trạng tạo kèo ảo thu tiền cọc.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm hover:border-emerald-300 transition-colors">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">
              Điểm Uy Tín & Hồ Sơ Minh Bạch
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Mỗi thành viên đều có điểm uy tín và phân cấp trình độ (Newbie đến
              Pro). Người chơi có điểm uy tín cao được ưu tiên duyệt vào sân.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA for Hosts */}
      <section className="rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-8 sm:p-10 text-white shadow-lg shadow-emerald-700/10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
              Dành Cho Chủ Sân & Trưởng Nhóm
            </span>
            <h2 className="text-2xl font-extrabold sm:text-3xl">
              Bạn Muốn Kín Sân Nhanh & Thu Tiền Sòng Phẳng?
            </h2>
            <p className="text-xs sm:text-sm text-emerald-50/90">
              Đăng buổi chơi chỉ mất 1 phút. Nền tảng tự động điều phối, giữ
              tiền cọc và chuyển khoản giải ngân về tài khoản của bạn sau trận.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/sessions/create"
              className="rounded-full bg-white px-6 py-3 text-xs font-bold text-slate-950 hover:bg-emerald-50 transition shadow-sm"
            >
              Tạo Buổi Chơi Mới
            </Link>
            <GoogleLoginButton />
          </div>
        </div>
      </section>
    </div>
  );
}
