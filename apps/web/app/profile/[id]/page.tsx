"use client";

import { useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api, usersApi } from "@/lib/api";
import { PlayerCard } from "@/components/cards/PlayerCard";
import { MatchCard } from "@/components/cards/MatchCard";
import { useState, useEffect } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuthStore } from "@/stores/auth-store";
import { signOutSession } from "@/lib/auth";
import { Building2, CheckCircle2 } from "lucide-react";

export default function ProfilePage() {
  const params = useParams<{ id: string }>();

  const profileQuery = useQuery({
    queryKey: ["profile", params.id],
    queryFn: async () => {
      const response = await api.get(`/users/${params.id}`);
      return response.data.data.user;
    },
  });

  const createdSessionsQuery = useQuery({
    queryKey: ["profile-sessions", params.id],
    queryFn: async () => {
      const response = await api.get("/sessions", {
        params: { host: params.id },
      });
      return response.data.data.sessions;
    },
    enabled: Boolean(params.id),
  });

  const user = profileQuery.data;
  const createdSessions = createdSessionsQuery.data ?? [];

  const currentUser = useAuthStore((s) => s.user);
  const isOwner = Boolean(currentUser && currentUser.id === user?.id);
  const [lightMode] = useState(true);

  const [bankForm, setBankForm] = useState({
    bankId: "MB",
    bankName: "MBBank (Quân Đội)",
    accountNumber: "",
    accountHolder: "",
  });
  const [bankNotice, setBankNotice] = useState<string | null>(null);

  useEffect(() => {
    if (user?.bankAccount) {
      setBankForm({
        bankId: user.bankAccount.bankId || "MB",
        bankName: user.bankAccount.bankName || "MBBank (Quân Đội)",
        accountNumber: user.bankAccount.accountNumber || "",
        accountHolder: user.bankAccount.accountHolder || "",
      });
    }
  }, [user]);

  const updateBankMutation = useMutation({
    mutationFn: async () => {
      await usersApi.updateMe({ bankAccount: bankForm });
    },
    onSuccess: () => {
      profileQuery.refetch();
      setBankNotice("Đã lưu thông tin tài khoản ngân hàng thành công!");
      setTimeout(() => setBankNotice(null), 3000);
    },
  });

  if (!user) {
    return <div className="text-slate-500">Đang tải hồ sơ...</div>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PlayerCard player={user} />
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-glow">
        <h2 className="text-lg font-semibold text-slate-900">Giới thiệu</h2>
        <p className="mt-2 text-slate-600">
          {user.bio ?? "Chưa có giới thiệu."}
        </p>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-glow">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Buổi chơi đã tạo
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {createdSessionsQuery.isLoading
                ? "Đang tải danh sách buổi chơi..."
                : `${createdSessions.length} buổi chơi`}
            </p>
          </div>
          {createdSessions.length > 0 ? (
            <Link
              href="/explore"
              className="text-sm font-medium text-emerald-700 transition hover:text-emerald-800"
            >
              Xem thêm buổi chơi
            </Link>
          ) : null}
        </div>

        <div className="mt-5 space-y-4">
          {createdSessionsQuery.isLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              Đang tải các buổi chơi đã tạo...
            </div>
          ) : createdSessions.length > 0 ? (
            createdSessions.map((session: any) => (
              <MatchCard
                key={session.id ?? session._id ?? session.slug}
                session={session}
              />
            ))
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              Người dùng này chưa tạo buổi chơi nào.
            </div>
          )}
        </div>
      </section>

      {isOwner ? (
        <RequireAuth>
          {/* Bank Account Settings */}
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-glow">
            <div className="flex items-center gap-2 text-emerald-700">
              <Building2 className="h-5 w-5" />
              <h2 className="text-lg font-bold text-slate-900">
                Tài Khoản Ngân Hàng Nhận Tiền (Dành cho Host)
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Nhập tài khoản để nhận giải ngân tiền cọc và tiền chia sân sau khi buổi chơi kết thúc.
            </p>

            {bankNotice && (
              <div className="mt-3 flex items-center gap-2 rounded-2xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">
                <CheckCircle2 className="h-4 w-4" />
                <span>{bankNotice}</span>
              </div>
            )}

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Ngân hàng:
                </label>
                <select
                  value={bankForm.bankId}
                  onChange={(e) => {
                    const selected = [
                      { id: "MB", name: "MBBank (Quân Đội)" },
                      { id: "VCB", name: "Vietcombank" },
                      { id: "TCB", name: "Techcombank" },
                      { id: "CTG", name: "VietinBank" },
                      { id: "BIDV", name: "BIDV" },
                      { id: "VPB", name: "VPBank" },
                      { id: "ACB", name: "ACB" },
                      { id: "TPB", name: "TPBank" },
                    ].find((b) => b.id === e.target.value);
                    setBankForm((p) => ({
                      ...p,
                      bankId: e.target.value,
                      bankName: selected?.name || e.target.value,
                    }));
                  }}
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 outline-none"
                >
                  <option value="MB">MBBank (Quân Đội)</option>
                  <option value="VCB">Vietcombank</option>
                  <option value="TCB">Techcombank</option>
                  <option value="CTG">VietinBank</option>
                  <option value="BIDV">BIDV</option>
                  <option value="VPB">VPBank</option>
                  <option value="ACB">ACB</option>
                  <option value="TPB">TPBank</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700">
                  Số tài khoản:
                </label>
                <input
                  type="text"
                  value={bankForm.accountNumber}
                  onChange={(e) =>
                    setBankForm((p) => ({ ...p, accountNumber: e.target.value }))
                  }
                  placeholder="Ví dụ: 0988888888"
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700">
                  Tên chủ tài khoản (viết hoa không dấu):
                </label>
                <input
                  type="text"
                  value={bankForm.accountHolder}
                  onChange={(e) =>
                    setBankForm((p) => ({
                      ...p,
                      accountHolder: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="Ví dụ: NGUYEN VAN A"
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 outline-none"
                />
              </div>
            </div>

            <div className="mt-4">
              <button
                type="button"
                disabled={updateBankMutation.isPending}
                onClick={() => updateBankMutation.mutate()}
                className="rounded-full bg-emerald-500 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-emerald-600 disabled:opacity-50"
              >
                {updateBankMutation.isPending ? "Đang lưu..." : "Lưu tài khoản ngân hàng"}
              </button>
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-glow">
            <h2 className="text-lg font-semibold text-slate-900">Tùy chọn</h2>
            <p className="mt-2 text-slate-600">
              Ứng dụng đang dùng giao diện sáng mặc định để dễ đọc và đồng bộ
              hơn.
            </p>
            <div className="mt-4 flex items-center gap-3 text-sm text-slate-700">
              <span className="h-3 w-3 rounded-full bg-emerald-400" />{" "}
              {lightMode
                ? "Đang dùng giao diện sáng"
                : "Đang dùng giao diện tối"}
            </div>
          </section>

          <button
            type="button"
            onClick={signOutSession}
            className="rounded-full border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700"
          >
            Đăng xuất
          </button>
        </RequireAuth>
      ) : null}
    </div>
  );
}
