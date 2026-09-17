import Link from "next/link";
import { ArrowRight, Play, ShieldCheck, Users } from "lucide-react";
import { MatchCard } from "@/components/cards/MatchCard";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";

const featuredSessions = [
  {
    id: "session-1",
    title: "Khởi động đôi Chủ nhật",
    venueName: "Saigon Smash Court",
    district: "Quận 7",
    datetime: "Chủ nhật, 08:00",
    currentPlayers: 6,
    maxPlayers: 8,
    skillRequirements: ["TB"],
    matchType: "doubles",
    price: 90000,
  },
  {
    id: "session-2",
    title: "Giải đôi nam nữ buổi tối",
    venueName: "Lotus Arena",
    district: "Thủ Đức",
    datetime: "Thứ Sáu, 19:30",
    currentPlayers: 4,
    maxPlayers: 10,
    skillRequirements: ["Khá"],
    matchType: "mixed doubles",
    price: 120000,
  },
];

export default function HomePage() {
  return (
    <div className="space-y-10 pb-10 animate-fadeUp">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-glow sm:p-10">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs uppercase tracking-[0.24em] text-emerald-700">
              Cộng đồng cầu lông Việt Nam
            </span>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-6xl">
              Tìm người chơi, kín sân, và tổ chức buổi cầu lông hiệu quả hơn.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Dành cho ghép trận, điều phối buổi chơi, tìm sân, chat thời gian
              thực và hệ thống uy tín cho người chơi trên khắp Việt Nam.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
              >
                Khám phá buổi chơi <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/sessions/create"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"
              >
                <Play className="h-4 w-4" /> Tạo buổi chơi
              </Link>
              <GoogleLoginButton />
            </div>
          </div>

          <div className="grid gap-4 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
            <div className="rounded-3xl bg-gradient-to-br from-emerald-100 to-cyan-50 p-5">
              <div className="flex items-center justify-between text-sm text-slate-700">
                <span>Điểm ghép trận</span>
                <ShieldCheck className="h-4 w-4 text-emerald-700" />
              </div>
              <div className="mt-3 text-3xl font-semibold text-slate-900">
                92%
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Trình độ, khu vực, lịch chơi và thời gian rảnh đang khớp trong
                tuần này.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <Users className="h-5 w-5 text-emerald-700" />
                <p className="mt-4 text-2xl font-semibold text-slate-900">
                  1,240+
                </p>
                <p className="text-sm text-slate-500">
                  Người chơi đang hoạt động
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-4">
                <ShieldCheck className="h-5 w-5 text-emerald-700" />
                <p className="mt-4 text-2xl font-semibold text-slate-900">
                  180+
                </p>
                <p className="text-sm text-slate-500">Buổi chơi đã xác minh</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {featuredSessions.map((session) => (
          <MatchCard key={session.id} session={session} />
        ))}
      </section>
    </div>
  );
}
