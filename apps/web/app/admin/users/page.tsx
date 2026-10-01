"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Search,
  Filter,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Crown,
  KeyRound,
  X,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { adminApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const currentAdmin = useAuthStore((s) => s.user);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  // Modal edit state
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    role: "player",
    skillLevel: "TB",
    reputation: 100,
    isActive: true,
    isVerifiedHost: false,
    newPassword: "",
  });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch users
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin", "users", { search, roleFilter, statusFilter, page }],
    queryFn: async () => {
      const res = await adminApi.getUsers({
        search,
        role: roleFilter,
        status: statusFilter,
        page,
        limit: 15,
      });
      return res.data.data;
    },
    staleTime: 5000,
  });

  const users = data?.items || [];
  const pagination = data?.pagination || { total: 0, totalPages: 1, page: 1 };

  // Mutation to update user
  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      const res = await adminApi.updateUser(id, payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
      setMessage({ type: "success", text: "Cập nhật tài khoản thành công!" });
      setEditingUser(null);
      setTimeout(() => setMessage(null), 3000);
    },
    onError: (err: any) => {
      const errMsg = err?.response?.data?.message || "Có lỗi xảy ra khi cập nhật";
      setMessage({ type: "error", text: errMsg });
      setTimeout(() => setMessage(null), 4000);
    },
  });

  // Mutation to delete user
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await adminApi.deleteUser(id);
      return res.data;
    },
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
      setMessage({
        type: "success",
        text: res?.data?.message || "Đã xóa vĩnh viễn tài khoản người dùng thành công!",
      });
      setEditingUser(null);
      setTimeout(() => setMessage(null), 3500);
    },
    onError: (err: any) => {
      const errMsg = err?.response?.data?.message || "Không thể xóa người dùng này";
      setMessage({ type: "error", text: errMsg });
      setTimeout(() => setMessage(null), 4000);
    },
  });

  const handleDeleteUser = (user: any) => {
    const uid = user.id || user._id;
    const isSelf = currentAdmin?.id === uid;
    if (isSelf) {
      alert("Bạn không thể tự xóa tài khoản của chính mình!");
      return;
    }

    if (
      confirm(
        `⚠️ CẢNH BÁO XÓA TÀI KHOẢN:\n\nBạn có chắc chắn muốn XÓA VĨNH VIỄN người dùng "${user.name}" (${user.email || user.phone || "Không có email"}) khỏi hệ thống không?\n\nTài khoản sẽ bị gỡ bỏ hoàn toàn khỏi cơ sở dữ liệu và không thể hoàn tác!`
      )
    ) {
      deleteMutation.mutate(uid);
    }
  };

  const handleOpenEdit = (user: any) => {
    setEditingUser(user);
    setEditForm({
      name: user.name || "",
      phone: user.phone || "",
      role: user.role || "player",
      skillLevel: user.skillLevel || "TB",
      reputation: user.reputation ?? 100,
      isActive: Boolean(user.isActive),
      isVerifiedHost: Boolean(user.isVerifiedHost),
      newPassword: "",
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const payload: any = {
      name: editForm.name,
      phone: editForm.phone,
      role: editForm.role,
      skillLevel: editForm.skillLevel,
      reputation: Number(editForm.reputation),
      isActive: editForm.isActive,
      isVerifiedHost: editForm.isVerifiedHost,
    };

    if (editForm.newPassword.trim()) {
      payload.password = editForm.newPassword.trim();
    }

    updateMutation.mutate({ id: editingUser.id || editingUser._id, payload });
  };

  const handleToggleActive = (user: any) => {
    const isSelf = currentAdmin?.id === (user.id || user._id);
    if (isSelf && user.isActive) {
      alert("Bạn không thể tự khóa tài khoản của chính mình!");
      return;
    }
    const newStatus = !user.isActive;
    const action = newStatus ? "mở khóa" : "khóa";
    if (confirm(`Bạn có chắc chắn muốn ${action} tài khoản của ${user.name}?`)) {
      updateMutation.mutate({
        id: user.id || user._id,
        payload: { isActive: newStatus },
      });
    }
  };

  const handleQuickPromoteAdmin = (user: any) => {
    if (confirm(`Cấp quyền Quản trị viên (Admin) tối cao cho ${user.name} (${user.email})?`)) {
      updateMutation.mutate({
        id: user.id || user._id,
        payload: { role: "admin", isVerifiedHost: true },
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Quản Lý Người Dùng Hệ Thống
            </h1>
            <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-xs font-bold text-blue-400 border border-blue-500/30">
              {pagination.total} tài khoản
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Xem danh sách, phân quyền Quản trị viên (Admin), duyệt Host uy tín và khóa các tài khoản vi phạm.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 transition shrink-0"
        >
          <RefreshCw className="h-3.5 w-3.5 text-emerald-400" />
          Làm mới
        </button>
      </div>

      {/* Alert toast */}
      {message && (
        <div
          className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between ${
            message.type === "success"
              ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/20 border border-rose-500/30 text-rose-300"
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm theo tên, email, số điện thoại..."
            className="w-full rounded-xl bg-slate-900 border border-slate-800 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        <div>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
          >
            <option value="">Tất cả vai trò</option>
            <option value="admin">Quản trị viên (Admin)</option>
            <option value="owner">Chủ sân (Owner)</option>
            <option value="player">Người chơi (Player)</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động (Active)</option>
            <option value="banned">Bị khóa (Banned / Inactive)</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Thành viên</th>
                <th className="py-3.5 px-4">Liên hệ / Khu vực</th>
                <th className="py-3.5 px-4">Vai trò</th>
                <th className="py-3.5 px-4">Trình độ</th>
                <th className="py-3.5 px-4">Host uy tín</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Đang tải danh sách thành viên...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Không tìm thấy thành viên nào phù hợp với bộ lọc
                  </td>
                </tr>
              ) : (
                users.map((u: any) => {
                  const uid = u.id || u._id;
                  const isCurrentAdmin = currentAdmin?.id === uid;

                  return (
                    <tr key={uid} className="hover:bg-slate-800/40 transition">
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-black text-xs text-white shrink-0">
                            {(u.name?.[0] || "U").toUpperCase()}
                          </div>
                          <div className="min-w-0 max-w-xs sm:max-w-sm">
                            <p className="font-bold text-white truncate flex items-center gap-1">
                              {u.name}
                              {isCurrentAdmin && (
                                <span className="text-[9px] text-amber-400 font-extrabold">(Tôi)</span>
                              )}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">{u.email || "Chưa có email"}</p>
                          </div>
                        </div>
                      </td>

                      {/* Phone & District */}
                      <td className="py-3.5 px-4">
                        <p className="text-white font-medium">{u.phone || "---"}</p>
                        <p className="text-[11px] text-slate-400">{u.district ? `${u.district}, ${u.city || ""}` : u.city || "Toàn quốc"}</p>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${
                            u.role === "admin" || u.role === "superadmin"
                              ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                              : u.role === "owner"
                              ? "bg-purple-500/10 text-purple-300 border-purple-500/30"
                              : "bg-slate-800 text-slate-300 border-slate-700"
                          }`}
                        >
                          {(u.role === "admin" || u.role === "superadmin") && <Crown className="h-3 w-3 text-amber-400" />}
                          {u.role}
                        </span>
                      </td>

                      {/* Skill Level */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-200 bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                          {u.skillLevel || "TB"}
                        </span>
                      </td>

                      {/* Verified Host */}
                      <td className="py-3.5 px-4">
                        {u.isVerifiedHost ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                            <CheckCircle className="h-3.5 w-3.5" />
                            Đã duyệt
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Thường</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {u.isActive ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                            Hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-rose-400 font-bold text-[11px]">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-400"></span>
                            Bị khóa
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick promote if player */}
                          {u.role !== "admin" && u.role !== "superadmin" && (
                            <button
                              onClick={() => handleQuickPromoteAdmin(u)}
                              title="Cấp quyền Admin tối cao"
                              className="rounded-lg p-1.5 text-amber-400 hover:bg-amber-500/10 border border-amber-500/20 transition"
                            >
                              <Crown className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {/* Quick toggle active */}
                          <button
                            onClick={() => handleToggleActive(u)}
                            title={u.isActive ? "Khóa tài khoản" : "Mở khóa"}
                            disabled={isCurrentAdmin}
                            className={`rounded-lg p-1.5 border transition ${
                              isCurrentAdmin
                                ? "opacity-30 cursor-not-allowed text-slate-500 border-slate-700"
                                : u.isActive
                                ? "text-rose-400 hover:bg-rose-500/10 border-rose-500/20"
                                : "text-emerald-400 hover:bg-emerald-500/10 border-emerald-500/20"
                            }`}
                          >
                            {u.isActive ? <XCircle className="h-3.5 w-3.5" /> : <CheckCircle className="h-3.5 w-3.5" />}
                          </button>

                          {/* Edit Modal Button */}
                          <button
                            onClick={() => handleOpenEdit(u)}
                            title="Sửa quyền hạn & thông tin"
                            className="rounded-lg p-1.5 text-blue-400 hover:bg-blue-500/10 border border-blue-500/20 transition"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteUser(u)}
                            title="Xóa vĩnh viễn người dùng"
                            disabled={isCurrentAdmin || deleteMutation.isPending}
                            className={`rounded-lg p-1.5 border transition ${
                              isCurrentAdmin
                                ? "opacity-20 cursor-not-allowed text-slate-600 border-slate-800"
                                : "text-rose-400 hover:bg-rose-500/10 border-rose-500/20 hover:border-rose-500/40"
                            }`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-800 p-4 bg-slate-950/60 text-xs">
            <span className="text-slate-400">
              Trang {pagination.page} / {pagination.totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 font-semibold text-slate-300 disabled:opacity-40"
              >
                Trước
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 font-semibold text-slate-300 disabled:opacity-40"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="max-w-md w-full rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  Chỉnh Sửa Quyền & Tài Khoản
                </h2>
                <p className="text-xs text-slate-400">{editingUser.email || editingUser.phone}</p>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Họ và tên</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Số điện thoại</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Vai trò hệ thống (Role)
                </label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="player">Người chơi (Player)</option>
                  <option value="owner">Chủ sân cầu lông (Owner)</option>
                  <option value="admin">Quản trị viên tối cao (Admin)</option>
                </select>
                <p className="mt-1 text-[11px] text-amber-400">
                  * Admin có toàn quyền can thiệp hệ thống, duyệt tranh chấp và quản lý thành viên.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Trình độ</label>
                  <input
                    type="text"
                    value={editForm.skillLevel}
                    onChange={(e) => setEditForm({ ...editForm, skillLevel: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Điểm uy tín</label>
                  <input
                    type="number"
                    value={editForm.reputation}
                    onChange={(e) => setEditForm({ ...editForm, reputation: Number(e.target.value) })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.isActive}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-950 text-emerald-500 h-4 w-4"
                  />
                  <span className="text-slate-200 font-semibold">Tài khoản đang hoạt động (Active)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.isVerifiedHost}
                    onChange={(e) => setEditForm({ ...editForm, isVerifiedHost: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-950 text-emerald-500 h-4 w-4"
                  />
                  <span className="text-slate-200 font-semibold">Được xác minh là Host uy tín</span>
                </label>
              </div>

              {/* Reset Password */}
              <div className="pt-2 border-t border-slate-800">
                <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5 text-amber-400" />
                  Đặt lại mật khẩu mới (Nếu cần)
                </label>
                <input
                  type="password"
                  placeholder="Để trống nếu không đổi..."
                  value={editForm.newPassword}
                  onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white placeholder-slate-600"
                />
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-800">
                <button
                  type="button"
                  disabled={
                    currentAdmin?.id === (editingUser.id || editingUser._id) ||
                    deleteMutation.isPending
                  }
                  onClick={() => handleDeleteUser(editingUser)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Xóa tài khoản này</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="rounded-xl px-4 py-2 text-slate-400 hover:text-white font-semibold"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2 font-bold text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-600 transition disabled:opacity-50"
                  >
                    {updateMutation.isPending ? "Đang lưu..." : "Lưu Thay Đổi"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
