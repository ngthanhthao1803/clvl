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
  QrCode,
  BadgeCheck,
  Lock,
  Clock,
  Award,
  Star,
  Wallet,
  PlusCircle,
  ArrowUpRight,
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
              className="rounded-3xl border border-white/20  p-3.5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] sm:p-4 text-left"
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

      {/* CLVL Trust & Escrow Guarantee (Bảo chứng thể thao minh bạch) */}
      <section className="space-y-8">
        {/* Header & Tagline */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-800 shadow-sm">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Bảo Chứng Thể Thao Minh Bạch</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 sm:text-4xl tracking-tight">
            An Tâm Lên Sân Với Cơ Chế 3 Lớp Bảo Vệ
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Giải quyết triệt để nỗi lo bùng kèo sát giờ, chấm dứt tình trạng tạo
            kèo ảo thu cọc, và kết nối chuẩn bạn chơi đúng trình độ thể thao.
          </p>
        </div>

        {/* 3 Visual Pillars with Interactive-Style UI Mockups */}
        <div className="grid gap-6 md:grid-cols-3 items-stretch">
          {/* Pillar 1: Smart Escrow Flow */}
          <div className="group flex flex-col rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-xl hover:border-emerald-300 hover:-translate-y-1 transition-all duration-300">
            {/* Visual Diagram Mockup */}
            <div className="relative mb-5 overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/40 p-4 shadow-inner">
              <div className="flex items-center justify-between gap-2">
                {/* User node */}
                <div className="flex items-center gap-2 rounded-xl bg-white p-2.5 shadow-sm border border-emerald-100/90">
                  <div className="h-8 w-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-sm shadow-emerald-500/30">
                    <QrCode className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">Cọc 50K</div>
                    <div className="text-[10px] text-slate-400 font-medium">VietQR 24/7</div>
                  </div>
                </div>

                {/* Flow indicator */}
                <div className="flex flex-col items-center px-1">
                  <span className="text-[9px] font-extrabold text-emerald-700 uppercase tracking-wider">
                    Khóa Két
                  </span>
                  <div className="h-0.5 w-10 sm:w-12 bg-emerald-300 relative my-1">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 absolute -top-[3px] right-0 animate-ping" />
                    <div className="h-2 w-2 rounded-full bg-emerald-600 absolute -top-[3px] right-0" />
                  </div>
                  <span className="text-[9px] text-slate-400 font-medium">Ký quỹ tự động</span>
                </div>

                {/* Escrow vault node */}
                <div className="flex items-center gap-2 rounded-xl bg-white p-2.5 shadow-sm border border-emerald-100/90">
                  <div className="h-8 w-8 rounded-lg bg-teal-700 text-white flex items-center justify-center shadow-sm shadow-teal-500/30">
                    <Lock className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">Ví Ký Thác</div>
                    <div className="text-[10px] text-emerald-600 font-bold">Bảo chứng</div>
                  </div>
                </div>
              </div>

              {/* Status footer pill */}
              <div className="mt-3 flex items-center justify-between border-t border-emerald-100/80 pt-2.5 text-[11px]">
                <span className="flex items-center gap-1 text-slate-600 font-medium">
                  <Clock className="h-3.5 w-3.5 text-emerald-600" />
                  Hủy trước 12h hoàn 100%
                </span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
                  Auto-Refund
                </span>
              </div>
            </div>

            {/* Content info */}
            <div className="flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Ký Quỹ Tự Động</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Ký Quỹ Thông Minh Chống Bùng Kèo
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  Mỗi người chơi giữ chỗ bằng một khoản cọc nhỏ qua VietQR.
                  Khoản tiền được phong tỏa trong két ký thác độc lập và tự động
                  hoàn trả khi hủy lịch đúng hạn, không cần xin phép host.
                </p>
              </div>

              <ul className="space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Hoàn tiền thẳng về STK trong 30 giây</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Phạt 100% cọc bùng sát giờ đền bù tiền sân</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Pillar 2: Court Ticket & On-Court Check-in */}
          <div className="group flex flex-col rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-xl hover:border-teal-300 hover:-translate-y-1 transition-all duration-300">
            {/* Visual Diagram Mockup */}
            <div className="relative mb-5 overflow-hidden rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50/70 via-white to-cyan-50/40 p-4 shadow-inner">
              {/* Simulated Stadium Pass */}
              <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm">
                <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-2">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-teal-600" />
                    <span className="text-xs font-bold text-slate-900">
                      Sân Cầu Lông Kỳ Hòa
                    </span>
                  </div>
                  <span className="rounded bg-teal-50 px-1.5 py-0.5 text-[10px] font-extrabold text-teal-700">
                    Sân số 3
                  </span>
                </div>

                {/* 6-Digit PIN Code Blocks */}
                <div className="pt-2.5 text-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Mã OTP Xác Thực Có Mặt
                  </div>
                  <div className="mt-1 flex justify-center items-center gap-1 font-mono text-xs sm:text-sm font-black text-slate-900">
                    <span className="rounded-md bg-slate-100 px-2 py-1 border border-slate-200">7</span>
                    <span className="rounded-md bg-slate-100 px-2 py-1 border border-slate-200">4</span>
                    <span className="rounded-md bg-slate-100 px-2 py-1 border border-slate-200">8</span>
                    <span className="text-slate-300 px-0.5">·</span>
                    <span className="rounded-md bg-emerald-50 text-emerald-700 px-2 py-1 border border-emerald-200 font-bold">2</span>
                    <span className="rounded-md bg-emerald-50 text-emerald-700 px-2 py-1 border border-emerald-200 font-bold">1</span>
                    <span className="rounded-md bg-emerald-50 text-emerald-700 px-2 py-1 border border-emerald-200 font-bold">9</span>
                  </div>
                </div>
              </div>

              {/* Verified GPS Status */}
              <div className="mt-2.5 flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1 text-slate-600 font-medium">
                  <Navigation className="h-3 w-3 text-teal-600" />
                  Định vị GPS tại cổng sân
                </span>
                <span className="flex items-center gap-1 text-[10px] font-extrabold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="h-3 w-3 text-teal-600" /> Đã khớp sân
                </span>
              </div>
            </div>

            {/* Content info */}
            <div className="flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 uppercase tracking-wider mb-1">
                  <KeyRound className="h-4 w-4" />
                  <span>Xác Thực Thực Tế</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Mã Check-in OTP Tại Cổng Sân
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  Host chỉ được giải ngân kinh phí sau khi cung cấp mã OTP 6 số
                  cho người chơi khi đã có mặt thực tế tại sân. Triệt tiêu 100%
                  vấn nạn tạo kèo ảo trên mạng để lừa tiền cọc.
                </p>
              </div>

              <ul className="space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Chống tuyệt đối bài đăng ảo lừa đảo cọc</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Host yên tâm người chơi có mặt đông đủ mới đánh</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Pillar 3: Badminton Passport & Reputation Score */}
          <div className="group flex flex-col rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-xl hover:border-cyan-300 hover:-translate-y-1 transition-all duration-300">
            {/* Visual Diagram Mockup */}
            <div className="relative mb-5 overflow-hidden rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50/70 via-white to-blue-50/40 p-4 shadow-inner">
              {/* Simulated Player Passport Badge */}
              <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-black text-white text-xs shadow-sm">
                    <span>HA</span>
                    <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                      <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        Hoàng An
                      </span>
                      <span className="rounded bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[10px] font-black text-emerald-700">
                        TB+ (Khá)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex text-amber-400 text-[10px]">★★★★★</div>
                      <span className="text-[10px] font-bold text-slate-500">
                        99/100 Uy Tín
                      </span>
                    </div>
                  </div>
                </div>

                {/* Metric Strip */}
                <div className="mt-2.5 grid grid-cols-3 gap-1.5 border-t border-slate-100 pt-2 text-[10px]">
                  <div className="rounded-lg bg-slate-50 p-1 text-center">
                    <span className="block font-black text-slate-900">42 Trận</span>
                    <span className="text-slate-400 text-[9px]">Đã chơi</span>
                  </div>
                  <div className="rounded-lg bg-emerald-50 p-1 text-center">
                    <span className="block font-black text-emerald-700">0% Bùng</span>
                    <span className="text-emerald-600/80 text-[9px]">Kỷ luật cao</span>
                  </div>
                  <div className="rounded-lg bg-teal-50 p-1 text-center">
                    <span className="block font-black text-teal-700">100%</span>
                    <span className="text-teal-600/80 text-[9px]">Đúng giờ</span>
                  </div>
                </div>
              </div>

              {/* Verified Identity Footnote */}
              <div className="mt-2.5 flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1 text-slate-600 font-medium">
                  <BadgeCheck className="h-3.5 w-3.5 text-cyan-600" />
                  Hồ sơ căn cước vợt thủ
                </span>
                <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-extrabold text-cyan-800">
                  Đã Định Danh
                </span>
              </div>
            </div>

            {/* Content info */}
            <div className="flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-700 uppercase tracking-wider mb-1">
                  <Users className="h-4 w-4" />
                  <span>Hồ Sơ Minh Bạch</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Điểm Uy Tín & Phân Hạng Trình Độ
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  Mỗi thành viên đều có chỉ số kỷ luật và phân hạng kỹ năng từ
                  Newbie đến Pro. Hệ thống ghép đúng bạn chơi ngang cơ, hạn chế
                  tối đa việc lệch trình gây mất hứng khi giao lưu.
                </p>
              </div>

              <ul className="space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Ghép đúng trình độ, không lo bị "ngợp" trên sân</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Người chơi uy tín cao được ưu tiên giữ slot</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA for Hosts (Dành Cho Chủ Sân & Trưởng Nhóm) with Custom Badminton Arena Background */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-emerald-500/30 bg-gradient-to-br from-[#021d15] via-[#043324] to-[#01140e] p-7 sm:p-10 lg:p-14 text-white shadow-2xl shadow-emerald-950/50">
        {/* ========================================================
            BACKGROUND LAYER 1: Ambient Lighting Glow Orbs
        ======================================================== */}
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-emerald-400/20 blur-[90px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-teal-500/15 blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 h-64 w-64 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-[80px] pointer-events-none" />

        {/* ========================================================
            BACKGROUND LAYER 2: Badminton Court Geometry & Shuttlecock Watermark
        ======================================================== */}
        <div className="absolute inset-0 pointer-events-none opacity-25 overflow-hidden">
          <svg
            className="absolute right-0 top-0 h-full w-full lg:w-[65%]"
            viewBox="0 0 800 500"
            fill="none"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <linearGradient id="ctaCourtLine" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34d399" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.1" />
              </linearGradient>
              <pattern id="ctaNetMesh" width="14" height="14" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="14" y2="14" stroke="#6ee7b7" strokeWidth="0.8" strokeOpacity="0.4" />
                <line x1="14" y1="0" x2="0" y2="14" stroke="#6ee7b7" strokeWidth="0.8" strokeOpacity="0.4" />
              </pattern>
            </defs>

            {/* 3D Perspective Court Outline in Background */}
            <polygon
              points="200,60 760,40 790,460 90,480"
              stroke="url(#ctaCourtLine)"
              strokeWidth="2"
              fill="rgba(6, 78, 59, 0.2)"
            />
            {/* Singles Sideline */}
            <line x1="250" y1="58" x2="155" y2="475" stroke="#34d399" strokeWidth="1.5" strokeOpacity="0.6" />
            <line x1="710" y1="42" x2="735" y2="462" stroke="#34d399" strokeWidth="1.5" strokeOpacity="0.6" />
            {/* Service Line */}
            <line x1="225" y1="160" x2="745" y2="140" stroke="#34d399" strokeWidth="1.5" strokeOpacity="0.6" />
            <line x1="130" y1="360" x2="770" y2="340" stroke="#34d399" strokeWidth="1.5" strokeOpacity="0.6" />
            {/* Center Line */}
            <line x1="480" y1="50" x2="440" y2="470" stroke="#34d399" strokeWidth="1.5" strokeOpacity="0.5" />

            {/* Translucent Badminton Net watermark */}
            <polygon points="175,250 755,230 760,285 165,305" fill="url(#ctaNetMesh)" />
            <line x1="175" y1="250" x2="755" y2="230" stroke="#ffffff" strokeWidth="3" strokeOpacity="0.7" />

            {/* Flying Shuttlecock Trail Watermark */}
            <path
              d="M120 440 Q 420 100 720 180"
              stroke="url(#ctaCourtLine)"
              strokeWidth="2.5"
              strokeDasharray="6 6"
              fill="none"
            />
            {/* Shuttlecock Head Watermark */}
            <circle cx="720" cy="180" r="14" fill="#34d399" fillOpacity="0.4" />
            <circle cx="720" cy="180" r="8" fill="#fef08a" fillOpacity="0.8" />
          </svg>
        </div>

        {/* ========================================================
            CONTENT LAYER (Glassmorphism & Structured Host Hub)
        ======================================================== */}
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          {/* Left Column: Heading & Value Proposition */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-950/70 backdrop-blur-md px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-300 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Dành Cho Chủ Sân & Trưởng Nhóm (Host)</span>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] text-white">
                Lấp Kín Sân Nhanh,{" "}
                <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent">
                  Thu Tiền Sòng Phẳng
                </span>
              </h2>
              <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed max-w-xl">
                Không còn cảnh tự bỏ tiền túi bù giờ thiếu người, hay phải nhắn
                tin đòi tiền cọc từng thành viên. Nền tảng tự động kết nối vợt thủ,
                quản lý ký quỹ và giải ngân tiền sân về STK của bạn ngay sau trận.
              </p>
            </div>

            {/* 3 Host Highlight Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md p-3.5">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs mb-1">
                  <Zap className="h-4 w-4 text-amber-400 fill-amber-400" />
                  <span>Kín Sân Nhanh</span>
                </div>
                <div className="text-lg font-black text-white">~15 Phút</div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Tự động ghép đủ 6-8 vợt thủ
                </p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md p-3.5">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs mb-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>0% Rủi Ro</span>
                </div>
                <div className="text-lg font-black text-white">Bảo Vệ Cọc</div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Đền bù 100% cọc nếu bùng giờ chót
                </p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md p-3.5">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs mb-1">
                  <Wallet className="h-4 w-4 text-cyan-400" />
                  <span>VietQR 24/7</span>
                </div>
                <div className="text-lg font-black text-white">Tự Động</div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Quyết toán về tài khoản sau trận
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Frosted Glass Action Console */}
          <div className="rounded-3xl border border-white/20 bg-slate-950/70 backdrop-blur-xl p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col justify-between space-y-5">
            {/* Console Header: Live Match Slot Simulation */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/50 p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <div>
                  <span className="block text-[11px] font-bold text-white">
                    Kèo Mẫu: Sân Kỳ Hòa · Đôi Nam Nữ
                  </span>
                  <span className="text-[10px] text-emerald-300 font-medium">
                    Đã ghép 7/8 người · Còn 1 slot cuối
                  </span>
                </div>
              </div>
              <span className="rounded-lg bg-emerald-500/20 border border-emerald-400/30 px-2 py-1 text-[10px] font-black text-emerald-300">
                19:30 Tối Nay
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link
                href="/sessions/create"
                className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 py-4 px-6 text-sm font-black text-slate-950 shadow-lg shadow-emerald-400/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <PlusCircle className="h-5 w-5 text-slate-950" />
                <span>Tạo Buổi Chơi Ngay (Miễn Phí)</span>
                <ArrowRight className="h-4 w-4 text-slate-950" />
              </Link>

              <div className="flex items-center justify-center">
                <GoogleLoginButton />
              </div>
            </div>

            {/* Trust Subtext */}
            <div className="flex items-center justify-center gap-2 text-center text-xs text-slate-400">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Chỉ mất 60 giây để đăng kèo · Không phát sinh phụ phí</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
