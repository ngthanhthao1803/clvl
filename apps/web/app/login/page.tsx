"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  Lock,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff,
  MapPin,
  Trophy,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";

function AuthFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";

  const { user, setSession } = useAuthStore();
  const [tab, setTab] = useState<"login" | "register">("login");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regPhone, setRegPhone] = useState("");
  const [regSkillLevel, setRegSkillLevel] = useState("TB");
  const [regDistrict, setRegDistrict] = useState("Quận 10");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // If already logged in
  if (user) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-5 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          Bạn đã đăng nhập rồi
        </h2>
        <p className="text-xs text-slate-500">
          Xin chào <strong>{user.name}</strong> ({user.email}). Bạn có thể tiếp
          tục khám phá các buổi chơi cầu lông.
        </p>
        <div className="flex w-full flex-col gap-2">
          <button
            type="button"
            onClick={() => router.push(redirectPath as any)}
            className="w-full rounded-2xl bg-emerald-500 py-3 text-xs font-bold text-white hover:bg-emerald-600 transition"
          >
            Tiếp tục đến trang yêu cầu
          </button>
          <Link
            href="/explore"
            className="w-full rounded-2xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Khám phá sân đấu
          </Link>
        </div>
      </div>
    );
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!loginEmail.trim() || !loginPassword) {
      setErrorMsg("Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.login({
        email: loginEmail.trim(),
        password: loginPassword,
      });

      const { user, token } = res.data.data;
      setSession({ user, token });
      setSuccessMsg("Đăng nhập thành công! Đang chuyển hướng...");
      setTimeout(() => {
        router.replace(redirectPath as any);
      }, 500);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Đăng nhập không thành công. Vui lòng kiểm tra lại email hoặc mật khẩu.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setErrorMsg("Vui lòng nhập đầy đủ họ tên, email và mật khẩu.");
      return;
    }

    if (regPassword.length < 6) {
      setErrorMsg("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.register({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        phone: regPhone.trim(),
        skillLevel: regSkillLevel,
        district: regDistrict,
        city: "Hồ Chí Minh",
      });

      const { user, token } = res.data.data;
      setSession({ user, token });
      setSuccessMsg("Tạo tài khoản thành công! Đang chuyển hướng...");
      setTimeout(() => {
        router.replace(redirectPath as any);
      }, 500);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Tạo tài khoản không thành công. Email này có thể đã được sử dụng.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md animate-fadeUp">
      {/* Header Info */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
          <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
          <span>Cộng Đồng Cầu Lông CLVL</span>
        </div>
        <h1 className="mt-3 text-2xl font-extrabold text-slate-900 sm:text-3xl">
          {tab === "login" ? "Chào Mừng Trở Lại" : "Tạo Tài Khoản Người Chơi"}
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          {tab === "login"
            ? "Đăng nhập để đặt sân, tham gia ghép kèo và tích lũy uy tín"
            : "Chỉ mất 30 giây để tạo hồ sơ và sẵn sàng lên sân thi đấu"}
        </p>
      </div>

      {/* Main Form Box */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
        {/* Tab switcher */}
        <div className="flex rounded-2xl bg-slate-100 p-1 mb-6">
          <button
            type="button"
            onClick={() => {
              setTab("login");
              setErrorMsg(null);
            }}
            className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
              tab === "login"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Đăng Nhập
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("register");
              setErrorMsg(null);
            }}
            className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
              tab === "register"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Tạo Tài Khoản
          </button>
        </div>

        {/* Notifications */}
        {errorMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* TAB 1: LOGIN */}
        {tab === "login" && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700">
                Email
              </label>
              <div className="relative mt-1">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 outline-none focus:border-emerald-400 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">
                Mật khẩu
              </label>
              <div className="relative mt-1">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showLoginPassword ? "text" : "password"}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-10 text-xs font-medium text-slate-900 outline-none focus:border-emerald-400 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showLoginPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3 text-xs font-bold text-white shadow-md shadow-emerald-500/10 hover:bg-emerald-600 transition disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span>Đăng Nhập Ngay</span>
              )}
            </button>
          </form>
        )}

        {/* TAB 2: REGISTER */}
        {tab === "register" && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700">
                Họ và tên hiển thị trên sân
              </label>
              <div className="relative mt-1">
                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 outline-none focus:border-emerald-400 focus:bg-white transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Số điện thoại
                </label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="0901234567"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 outline-none focus:border-emerald-400 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Khu vực thường chơi
                </label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <select
                    value={regDistrict}
                    onChange={(e) => setRegDistrict(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 outline-none focus:border-emerald-400 focus:bg-white transition cursor-pointer"
                  >
                    <option value="Quận 1">Quận 1</option>
                    <option value="Quận 3">Quận 3</option>
                    <option value="Quận 7">Quận 7</option>
                    <option value="Quận 10">Quận 10</option>
                    <option value="Tân Bình">Tân Bình</option>
                    <option value="Bình Thạnh">Bình Thạnh</option>
                    <option value="Thủ Đức">TP. Thủ Đức</option>
                    <option value="Phú Nhuận">Phú Nhuận</option>
                    <option value="Gò Vấp">Gò Vấp</option>
                    <option value="Hóc Môn">Hóc Môn</option>
                    <option value="Bình Tân">Bình Tân</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">
                Trình độ chơi hiện tại
              </label>
              <div className="relative mt-1">
                <Trophy className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  value={regSkillLevel}
                  onChange={(e) => setRegSkillLevel(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 outline-none focus:border-emerald-400 focus:bg-white transition cursor-pointer"
                >
                  <option value="Newbie">Newbie · Người mới bắt đầu</option>
                  <option value="Yếu">Yếu · Biết luật, giao cầu cơ bản</option>
                  <option value="TB-">TB- · Trung bình yếu</option>
                  <option value="TB">TB · Trung bình phong trào đều</option>
                  <option value="TB+">TB+ · Trung bình khá</option>
                  <option value="Khá">Khá · Kỹ thuật & phản xạ tốt</option>
                  <option value="Pro">Pro · Trình giải / Bán chuyên</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">
                Email
              </label>
              <div className="relative mt-1">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 outline-none focus:border-emerald-400 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">
                Mật khẩu (tối thiểu 6 ký tự)
              </label>
              <div className="relative mt-1">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showRegPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-10 text-xs font-medium text-slate-900 outline-none focus:border-emerald-400 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showRegPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3 text-xs font-bold text-white shadow-md shadow-emerald-500/10 hover:bg-emerald-600 transition disabled:opacity-50 mt-1"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span>Tạo Tài Khoản & Lên Sân</span>
              )}
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="w-full border-t border-slate-200" />
          <span className="absolute bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Hoặc tiếp tục với
          </span>
        </div>

        {/* Google Login Option */}
        <GoogleLoginButton
          onSuccess={() => {
            router.replace(redirectPath as any);
          }}
        />
      </div>

      {/* Footer Disclaimer */}
      <p className="mt-6 text-center text-[11px] text-slate-400">
        Bằng việc tiếp tục, bạn đồng ý với Quy chế hoạt động và Chính sách ký quỹ
        chống bùng kèo của CLVL.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[350px] items-center justify-center text-sm text-slate-500">
          Đang tải trang đăng nhập...
        </div>
      }
    >
      <AuthFormContent />
    </Suspense>
  );
}
