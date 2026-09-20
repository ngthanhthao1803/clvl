"use client";

import { useEffect, useRef, useState } from "react";
import {
  Camera,
  Check,
  Image as ImageIcon,
  Minus,
  Move,
  Plus,
  RotateCw,
  Sparkles,
  Upload,
  X,
  Zap,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { usersApi } from "@/lib/api";
import {
  BADMINTON_AVATAR_PRESETS,
  getDefaultAvatar,
} from "@/lib/badminton-avatars";

interface AvatarUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar?: string;
  userName: string;
  onSuccess: (newAvatarUrl: string) => void;
}

export function AvatarUploadModal({
  isOpen,
  onClose,
  currentAvatar,
  userName,
  onSuccess,
}: AvatarUploadModalProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "presets">("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [selectedPresetUrl, setSelectedPresetUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setZoom(1);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
      setSelectedFile(null);
      setImageSrc(null);
      setSelectedPresetUrl(null);
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Vui lòng chọn tệp hình ảnh hợp lệ (PNG, JPG, WebP).");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg("Ảnh gốc quá lớn (vượt quá 15MB). Vui lòng chọn ảnh khác.");
      return;
    }

    setErrorMsg(null);
    setSelectedFile(file);
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Dragging logic for panning the image inside crop box
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imageSrc) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!imageSrc || e.touches.length === 0) return;
    setIsDragging(true);
    setDragStart({
      x: e.touches[0].clientX - offset.x,
      y: e.touches[0].clientY - offset.y,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length === 0) return;
    setOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Compress & crop image using HTML5 Canvas to produce lightweight JPEG (~25-45KB)
  const generateOptimizedAvatar = async (): Promise<string> => {
    if (activeTab === "presets" && selectedPresetUrl) {
      return selectedPresetUrl;
    }

    if (!imgRef.current || !imageSrc) {
      throw new Error("Chưa chọn hình ảnh để tải lên.");
    }

    const img = imgRef.current;
    const canvasSize = 360; // 360x360 px is optimal for high-DPI avatar displays
    const canvas = document.createElement("canvas");
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Không thể khởi tạo bộ xử lý đồ họa canvas.");

    // Fill clean white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Center coordinate
    ctx.save();
    ctx.translate(canvasSize / 2, canvasSize / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Calculate aspect ratio
    const naturalWidth = img.naturalWidth || canvasSize;
    const naturalHeight = img.naturalHeight || canvasSize;
    const aspect = naturalWidth / naturalHeight;

    // The crop preview display circle is 224px (w-56)
    const previewScale = canvasSize / 224;
    ctx.translate(offset.x * previewScale, offset.y * previewScale);

    let drawW = canvasSize;
    let drawH = canvasSize;
    if (aspect > 1) {
      drawW = canvasSize * aspect;
      drawH = canvasSize;
    } else {
      drawW = canvasSize;
      drawH = canvasSize / aspect;
    }

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    // Export to JPEG with quality 0.82 (lightweight, ~25KB - 40KB)
    let finalDataUrl = canvas.toDataURL("image/jpeg", 0.82);

    // If still large, compress further
    if (finalDataUrl.length > 150000) {
      finalDataUrl = canvas.toDataURL("image/jpeg", 0.72);
    }

    return finalDataUrl;
  };

  const updateAvatarMutation = useMutation({
    mutationFn: async () => {
      const finalAvatarUrl = await generateOptimizedAvatar();
      await usersApi.updateMe({ avatar: finalAvatarUrl });
      return finalAvatarUrl;
    },
    onSuccess: (finalAvatarUrl) => {
      onSuccess(finalAvatarUrl);
      onClose();
    },
    onError: (err: any) => {
      setErrorMsg(
        err?.response?.data?.message ||
        err?.message ||
        "Không thể lưu ảnh đại diện. Vui lòng thử lại.",
      );
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-xs sm:p-4 animate-in fade-in">
      <div className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Đổi ảnh đại diện
              </h3>
              <p className="text-xs text-slate-500">
                Tải ảnh lên và căn chỉnh hoặc chọn mẫu phong cách CLVL
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Segmented Tabs */}
        <div className="border-b border-slate-100 px-5 pt-3">
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab("upload");
                setErrorMsg(null);
              }}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition ${activeTab === "upload"
                  ? "bg-white text-emerald-950 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
                }`}
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Tải ảnh & Căn chỉnh</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("presets");
                setErrorMsg(null);
              }}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition ${activeTab === "presets"
                  ? "bg-white text-emerald-950 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
                }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Avatar mẫu CLVL</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {errorMsg && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs font-medium text-rose-700">
              {errorMsg}
            </div>
          )}

          {activeTab === "upload" ? (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {!imageSrc ? (
                /* File Dropzone */
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="group flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-8 text-center transition hover:border-emerald-400 hover:bg-emerald-50/40"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xs text-slate-400 transition group-hover:scale-110 group-hover:text-emerald-600">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div className="mt-3 text-sm font-bold text-slate-800 group-hover:text-emerald-700">
                    Chọn ảnh từ máy tính hoặc điện thoại
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Hỗ trợ PNG, JPG, WebP. Tự động căn chỉnh khung tròn & nén nhẹ.
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition group-hover:bg-emerald-700">
                    <ImageIcon className="h-3.5 w-3.5" />
                    <span>Duyệt tệp ảnh...</span>
                  </span>
                </button>
              ) : (
                /* Interactive Crop & Adjust Stage */
                <div className="space-y-4">

                  {/* Circular Crop Box */}
                  <div
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    className="relative mx-auto h-56 w-56 cursor-grab active:cursor-grabbing overflow-hidden rounded-full border-4 border-emerald-500 bg-slate-900 shadow-xl select-none"
                  >
                    <img
                      ref={imgRef}
                      src={imageSrc}
                      alt="Crop preview"
                      draggable={false}
                      style={{
                        transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                        transformOrigin: "center center",
                        transition: isDragging ? "none" : "transform 0.1s ease-out",
                      }}
                      className="h-full w-full object-contain pointer-events-none"
                    />

                    {/* Circular Crosshair / Grid overlay for framing */}
                    <div className="pointer-events-none absolute inset-0 rounded-full border border-white/30" />
                    <div className="pointer-events-none absolute left-1/2 top-0 bottom-0 w-px bg-white/20 -translate-x-1/2" />
                    <div className="pointer-events-none absolute top-1/2 left-0 right-0 h-px bg-white/20 -translate-y-1/2" />
                  </div>

                  {/* Zoom & Rotation Controls */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 space-y-2.5">
                    {/* Zoom Slider */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-slate-700 w-12">
                        Thu phóng:
                      </span>
                      <button
                        type="button"
                        onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <input
                        type="range"
                        min="0.6"
                        max="3"
                        step="0.05"
                        value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        className="h-1.5 flex-1 cursor-pointer appearance-none rounded-lg bg-slate-200 accent-emerald-600"
                      />
                      <button
                        type="button"
                        onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                      <span className="text-[11px] font-bold text-slate-600 w-8 text-right">
                        {Math.round(zoom * 100)}%
                      </span>
                    </div>

                    {/* Extra adjustment tools */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setRotation((r) => (r + 90) % 360)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          <RotateCw className="h-3 w-3" />
                          <span>Xoay 90°</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setZoom(1);
                            setRotation(0);
                            setOffset({ x: 0, y: 0 });
                          }}
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100"
                        >
                          Căn giữa lại
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 underline"
                      >
                        Chọn ảnh khác
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Presets Grid */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  Chọn avatar theo phong cách của bạn:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPresetUrl(getDefaultAvatar(userName));
                  }}
                  className="text-[11px] font-semibold text-emerald-700 hover:underline"
                >
                  Dùng chữ cái mặc định
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {BADMINTON_AVATAR_PRESETS.map((preset) => {
                  const isSelected = selectedPresetUrl === preset.dataUrl;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setSelectedPresetUrl(preset.dataUrl)}
                      className={`group relative flex flex-col items-center rounded-2xl border p-3 text-center transition-all ${isSelected
                          ? "border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500 shadow-xs"
                          : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50"
                        }`}
                    >
                      <div className="relative h-16 w-16 overflow-hidden rounded-full ring-2 ring-white shadow-sm transition-transform group-hover:scale-105">
                        <img
                          src={preset.dataUrl}
                          alt={preset.name}
                          className="h-full w-full object-cover"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center bg-emerald-600/40 text-white">
                            <Check className="h-6 w-6 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <div className="mt-2 font-bold text-xs text-slate-800 leading-tight">
                        {preset.name}
                      </div>
                      <span className="mt-0.5 inline-block rounded-md bg-slate-100 px-1.5 py-0.2 text-[9.5px] font-medium text-slate-500">
                        {preset.tag}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 bg-slate-50/50 px-5 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            disabled={
              updateAvatarMutation.isPending ||
              (activeTab === "upload" && !imageSrc) ||
              (activeTab === "presets" && !selectedPresetUrl)
            }
            onClick={() => updateAvatarMutation.mutate()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {updateAvatarMutation.isPending ? (
              <>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Đang tối ưu & lưu...</span>
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                <span>Lưu ảnh đại diện</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
