"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  Search,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Clock,
  X,
  RefreshCw,
} from "lucide-react";
import { adminApi } from "@/lib/api";

export default function AdminVenuesPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("");
  const [page, setPage] = useState(1);

  // Modal create/edit state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<any>(null);
  const [venueForm, setVenueForm] = useState({
    name: "",
    address: "",
    district: "",
    city: "Hồ Chí Minh",
    courtCount: 4,
    phone: "",
    priceMin: 60000,
    priceMax: 120000,
    openTime: "06:00",
    closeTime: "22:00",
  });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin", "venues", { search, district, page }],
    queryFn: async () => {
      const res = await adminApi.getVenues({
        search,
        district,
        page,
        limit: 15,
      });
      return res.data.data;
    },
    staleTime: 5000,
  });

  const venues = data?.items || [];
  const pagination = data?.pagination || { total: 0, totalPages: 1, page: 1 };

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editingVenue) {
        return adminApi.updateVenue(editingVenue._id, payload);
      } else {
        return adminApi.createVenue(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "venues"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
      setMessage({
        type: "success",
        text: editingVenue ? "Đã cập nhật sân cầu lông!" : "Đã tạo sân cầu lông mới thành công!",
      });
      setIsModalOpen(false);
      setEditingVenue(null);
      setTimeout(() => setMessage(null), 3000);
    },
    onError: (err: any) => {
      setMessage({ type: "error", text: err?.response?.data?.message || "Lỗi lưu sân cầu lông" });
      setTimeout(() => setMessage(null), 4000);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return adminApi.deleteVenue(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "venues"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
      setMessage({ type: "success", text: "Đã xóa sân cầu lông!" });
      setTimeout(() => setMessage(null), 3000);
    },
    onError: (err: any) => {
      setMessage({ type: "error", text: err?.response?.data?.message || "Lỗi xóa sân" });
      setTimeout(() => setMessage(null), 4000);
    },
  });

  const handleOpenCreate = () => {
    setEditingVenue(null);
    setVenueForm({
      name: "",
      address: "",
      district: "",
      city: "Hồ Chí Minh",
      courtCount: 4,
      phone: "",
      priceMin: 60000,
      priceMax: 120000,
      openTime: "06:00",
      closeTime: "22:00",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v: any) => {
    setEditingVenue(v);
    setVenueForm({
      name: v.name || "",
      address: v.address || "",
      district: v.district || "",
      city: v.city || "Hồ Chí Minh",
      courtCount: v.courtCount || 4,
      phone: v.phone || "",
      priceMin: v.priceRange?.min || 60000,
      priceMax: v.priceRange?.max || 120000,
      openTime: v.openingHours?.open || "06:00",
      closeTime: v.openingHours?.close || "22:00",
    });
    setIsModalOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: venueForm.name.trim(),
      address: venueForm.address.trim(),
      district: venueForm.district.trim(),
      city: venueForm.city.trim(),
      courtCount: Number(venueForm.courtCount),
      phone: venueForm.phone.trim(),
      priceRange: {
        min: Number(venueForm.priceMin),
        max: Number(venueForm.priceMax),
      },
      openingHours: {
        open: venueForm.openTime,
        close: venueForm.closeTime,
      },
    };
    saveMutation.mutate(payload);
  };

  const handleDeleteVenue = (v: any) => {
    if (confirm(`Bạn có chắc chắn muốn xóa sân "${v.name}"?`)) {
      deleteMutation.mutate(v._id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Quản Lý Mạng Lưới Sân Cầu Lông
            </h1>
            <span className="rounded-full bg-purple-500/20 px-2.5 py-0.5 text-xs font-bold text-purple-400 border border-purple-500/30">
              {pagination.total} sân
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Thêm sân mới, chỉnh sửa thông tin liên hệ, giá thuê và số lượng thảm sân.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 transition"
          >
            <RefreshCw className="h-3.5 w-3.5 text-emerald-400" />
            Làm mới
          </button>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-600 transition"
          >
            <Plus className="h-4 w-4" />
            Thêm Sân Mới
          </button>
        </div>
      </div>

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

      {/* Filter bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm theo tên sân, địa chỉ..."
            className="w-full rounded-xl bg-slate-900 border border-slate-800 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div>
          <input
            type="text"
            value={district}
            onChange={(e) => {
              setDistrict(e.target.value);
              setPage(1);
            }}
            placeholder="Lọc theo Quận / Huyện (ví dụ: Bình Thạnh, Quận 7...)"
            className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Venues Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Tên sân</th>
                <th className="py-3.5 px-4">Địa chỉ / Khu vực</th>
                <th className="py-3.5 px-4">Quy mô</th>
                <th className="py-3.5 px-4">Giá thuê / giờ</th>
                <th className="py-3.5 px-4">Giờ hoạt động</th>
                <th className="py-3.5 px-4">Số điện thoại</th>
                <th className="py-3.5 px-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Đang tải danh sách sân...
                  </td>
                </tr>
              ) : venues.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Không tìm thấy sân cầu lông nào
                  </td>
                </tr>
              ) : (
                venues.map((v: any) => (
                  <tr key={v._id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-white max-w-xs sm:max-w-sm truncate">{v.name}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="text-slate-300 max-w-sm sm:max-w-md truncate">{v.address}</p>
                      <p className="text-[11px] text-slate-500">{v.district}, {v.city}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded text-[11px]">
                        {v.courtCount} sân
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-emerald-400">
                        {v.priceRange?.min?.toLocaleString()} - {v.priceRange?.max?.toLocaleString()} đ
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-slate-300 font-medium">
                        {v.openingHours?.open || "06:00"} - {v.openingHours?.close || "22:00"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-slate-300">{v.phone || "---"}</span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(v)}
                          title="Sửa sân"
                          className="rounded-lg p-1.5 text-blue-400 hover:bg-blue-500/10 border border-blue-500/20"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteVenue(v)}
                          title="Xóa sân"
                          className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-500/10 border border-rose-500/20"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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

      {/* Modal Add/Edit Venue */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="max-w-md w-full rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-400" />
                {editingVenue ? "Chỉnh Sửa Sân Cầu Lông" : "Thêm Sân Cầu Lông Mới"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Tên sân cầu lông</label>
                <input
                  type="text"
                  value={venueForm.name}
                  onChange={(e) => setVenueForm({ ...venueForm, name: e.target.value })}
                  placeholder="Ví dụ: Sân Cầu Lông Viettel Hoàng Hoa Thám"
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Địa chỉ cụ thể</label>
                <input
                  type="text"
                  value={venueForm.address}
                  onChange={(e) => setVenueForm({ ...venueForm, address: e.target.value })}
                  placeholder="Ví dụ: 158/2A Hoàng Hoa Thám"
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Quận / Huyện</label>
                  <input
                    type="text"
                    value={venueForm.district}
                    onChange={(e) => setVenueForm({ ...venueForm, district: e.target.value })}
                    placeholder="Tân Bình"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Thành phố</label>
                  <input
                    type="text"
                    value={venueForm.city}
                    onChange={(e) => setVenueForm({ ...venueForm, city: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Số lượng sân (Thảm)</label>
                  <input
                    type="number"
                    min={1}
                    value={venueForm.courtCount}
                    onChange={(e) => setVenueForm({ ...venueForm, courtCount: Number(e.target.value) })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Số điện thoại liên hệ</label>
                  <input
                    type="text"
                    value={venueForm.phone}
                    onChange={(e) => setVenueForm({ ...venueForm, phone: e.target.value })}
                    placeholder="0901234567"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Giá tối thiểu (đ/h)</label>
                  <input
                    type="number"
                    step={5000}
                    value={venueForm.priceMin}
                    onChange={(e) => setVenueForm({ ...venueForm, priceMin: Number(e.target.value) })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Giá tối đa (đ/h)</label>
                  <input
                    type="number"
                    step={5000}
                    value={venueForm.priceMax}
                    onChange={(e) => setVenueForm({ ...venueForm, priceMax: Number(e.target.value) })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Giờ mở cửa</label>
                  <input
                    type="text"
                    value={venueForm.openTime}
                    onChange={(e) => setVenueForm({ ...venueForm, openTime: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Giờ đóng cửa</label>
                  <input
                    type="text"
                    value={venueForm.closeTime}
                    onChange={(e) => setVenueForm({ ...venueForm, closeTime: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-slate-400 hover:text-white font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="rounded-xl bg-purple-600 px-5 py-2 font-bold text-white hover:bg-purple-500 transition shadow-lg shadow-purple-600/20"
                >
                  {saveMutation.isPending ? "Đang lưu..." : "Lưu Sân Cầu Lông"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
