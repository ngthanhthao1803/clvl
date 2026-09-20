"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  BellOff,
  Calendar,
  Check,
  CheckCheck,
  CheckCircle2,
  Clock,
  Compass,
  Mail,
  MapPin,
  MessageCircle,
  ShieldAlert,
  Sparkles,
  Star,
  Trash2,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { notificationsApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

type NotificationItem = {
  _id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
  readAt?: string | null;
  actor?: {
    _id?: string;
    name?: string;
    avatar?: string;
    skillLevel?: string;
  } | null;
  session?: {
    _id?: string;
    id?: string;
    title?: string;
    venueName?: string;
    datetime?: string;
  } | string | null;
  venue?: {
    _id?: string;
    id?: string;
    name?: string;
    address?: string;
  } | null;
  meta?: Record<string, unknown>;
};

type FilterTab = "all" | "unread" | "sessions" | "others";

function formatRelativeTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "";
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSec = Math.max(0, Math.floor(diffMs / 1000));
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMin < 1) return "Vừa xong";
    if (diffMin < 60) return `${diffMin} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays === 1) return "Hôm qua";
    if (diffDays < 7) return `${diffDays} ngày trước`;

    const day = `${d.getDate()}`.padStart(2, "0");
    const month = `${d.getMonth() + 1}`.padStart(2, "0");
    const hours = `${d.getHours()}`.padStart(2, "0");
    const minutes = `${d.getMinutes()}`.padStart(2, "0");
    return `${hours}:${minutes} · ${day}/${month}`;
  } catch {
    return "";
  }
}

function getNotificationConfig(type: string) {
  switch (type) {
    case "session_join_request":
      return {
        label: "Yêu cầu tham gia",
        icon: UserPlus,
        bgColor: "bg-amber-100",
        textColor: "text-amber-700",
        badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
        actionText: "Duyệt yêu cầu",
      };
    case "session_join_approved":
      return {
        label: "Đã được duyệt",
        icon: CheckCircle2,
        bgColor: "bg-emerald-100",
        textColor: "text-emerald-700",
        badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
        actionText: "Vào buổi chơi",
      };
    case "session_join_rejected":
      return {
        label: "Từ chối tham gia",
        icon: XCircle,
        bgColor: "bg-rose-100",
        textColor: "text-rose-700",
        badgeColor: "bg-rose-50 text-rose-800 border-rose-200",
        actionText: "Xem chi tiết",
      };
    case "session_joined":
      return {
        label: "Thành viên mới",
        icon: Users,
        bgColor: "bg-teal-100",
        textColor: "text-teal-700",
        badgeColor: "bg-teal-50 text-teal-800 border-teal-200",
        actionText: "Xem danh sách",
      };
    case "session_invited":
      return {
        label: "Lời mời tham gia",
        icon: Mail,
        bgColor: "bg-sky-100",
        textColor: "text-sky-700",
        badgeColor: "bg-sky-50 text-sky-800 border-sky-200",
        actionText: "Xem lời mời",
      };
    case "session_cancelled":
      return {
        label: "Buổi chơi đã hủy",
        icon: AlertTriangle,
        bgColor: "bg-rose-100",
        textColor: "text-rose-700",
        badgeColor: "bg-rose-50 text-rose-800 border-rose-200",
        actionText: "Xem thông tin",
      };
    case "chat_message":
      return {
        label: "Tin nhắn mới",
        icon: MessageCircle,
        bgColor: "bg-indigo-100",
        textColor: "text-indigo-700",
        badgeColor: "bg-indigo-50 text-indigo-800 border-indigo-200",
        actionText: "Mở chat",
      };
    case "rating_received":
      return {
        label: "Đánh giá uy tín",
        icon: Star,
        bgColor: "bg-amber-100",
        textColor: "text-amber-700",
        badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
        actionText: "Xem hồ sơ",
      };
    case "system":
    default:
      return {
        label: "Hệ thống",
        icon: ShieldAlert,
        bgColor: "bg-slate-100",
        textColor: "text-slate-700",
        badgeColor: "bg-slate-50 text-slate-800 border-slate-200",
        actionText: "Xem chi tiết",
      };
  }
}

export default function NotificationsPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await notificationsApi.listNotifications();
      return response.data.data.notifications as NotificationItem[];
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.deleteNotification(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });

  const notifications = notificationsQuery.data ?? [];
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const filteredNotifications = useMemo(() => {
    switch (activeTab) {
      case "unread":
        return notifications.filter((n) => !n.readAt);
      case "sessions":
        return notifications.filter((n) =>
          [
            "session_join_request",
            "session_join_approved",
            "session_join_rejected",
            "session_joined",
            "session_invited",
            "session_cancelled",
          ].includes(n.type),
        );
      case "others":
        return notifications.filter(
          (n) =>
            !["session_join_request", "session_join_approved", "session_join_rejected", "session_joined", "session_invited", "session_cancelled"].includes(
              n.type,
            ),
        );
      case "all":
      default:
        return notifications;
    }
  }, [notifications, activeTab]);

  const handleNotificationClick = async (notification: NotificationItem) => {
    if (!notification.readAt) {
      markReadMutation.mutate(notification._id);
    }

    const sessionObj =
      notification.session && typeof notification.session !== "string"
        ? notification.session
        : null;
    const sessionId = sessionObj?._id ?? sessionObj?.id;

    if (sessionId) {
      if (notification.type === "session_join_request") {
        router.push((`/sessions/${sessionId}#join-requests`) as any);
      } else if (notification.type === "chat_message") {
        router.push((`/chat/${sessionId}`) as any);
      } else {
        router.push((`/sessions/${sessionId}`) as any);
      }
      return;
    }

    if (notification.type === "rating_received") {
      router.push(user ? ((`/profile/${user.id}`) as any) : ("/explore" as any));
      return;
    }
  };

  return (
    <RequireAuth>
      <div className="mx-auto max-w-3xl space-y-4 pb-12 sm:space-y-5">
        {/* Top Header */}
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between sm:rounded-3xl sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 sm:h-11 sm:w-11 sm:rounded-2xl">
              <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-2xl">
                  Thông báo
                </h1>
                {unreadCount > 0 && (
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                    {unreadCount} mới
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Tin nhắn, lời mời và diễn biến từ các buổi chơi cầu lông
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 sm:pt-0 sm:border-0">
            <button
              type="button"
              disabled={unreadCount === 0 || markAllReadMutation.isPending}
              onClick={() => markAllReadMutation.mutate()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Đọc tất cả</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          {[
            { key: "all" as FilterTab, label: "Tất cả", count: notifications.length },
            {
              key: "unread" as FilterTab,
              label: "Chưa đọc",
              count: unreadCount,
              badge: unreadCount > 0,
            },
            {
              key: "sessions" as FilterTab,
              label: "Kèo cầu lông",
              count: notifications.filter((n) =>
                [
                  "session_join_request",
                  "session_join_approved",
                  "session_join_rejected",
                  "session_joined",
                  "session_invited",
                  "session_cancelled",
                ].includes(n.type),
              ).length,
            },
            {
              key: "others" as FilterTab,
              label: "Tin nhắn & Khác",
              count: notifications.filter(
                (n) =>
                  ![
                    "session_join_request",
                    "session_join_approved",
                    "session_join_rejected",
                    "session_joined",
                    "session_invited",
                    "session_cancelled",
                  ].includes(n.type),
              ).length,
            },
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "border border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : tab.badge
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Notifications List */}
        <div className="space-y-2.5">
          {notificationsQuery.isLoading ? (
            /* Loading Skeletons */
            <div className="space-y-2.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex items-start gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs animate-pulse"
                >
                  <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-32 rounded bg-slate-200" />
                      <div className="h-3 w-16 rounded bg-slate-100" />
                    </div>
                    <div className="h-3 w-3/4 rounded bg-slate-100" />
                    <div className="h-3 w-1/2 rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            /* Empty State */
            <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-xs sm:rounded-3xl sm:p-12">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 sm:h-16 sm:w-16">
                {activeTab === "unread" ? (
                  <CheckCircle2 className="h-7 w-7 text-emerald-500 sm:h-8 sm:w-8" />
                ) : (
                  <BellOff className="h-7 w-7 text-slate-400 sm:h-8 sm:w-8" />
                )}
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900 sm:text-lg">
                {activeTab === "unread"
                  ? "Bạn đã đọc hết thông báo!"
                  : "Chưa có thông báo nào"}
              </h3>
              <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500 sm:text-sm">
                {activeTab === "unread"
                  ? "Tuyệt vời! Không có tin nhắn hoặc yêu cầu nào còn tồn đọng."
                  : "Khi có người đăng ký kèo, gửi lời mời hoặc nhắn tin, thông báo sẽ xuất hiện tại đây."}
              </p>
              {activeTab === "all" && (
                <div className="mt-5">
                  <Link
                    href="/explore"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
                  >
                    <Compass className="h-4 w-4" />
                    <span>Khám phá các buổi chơi</span>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            /* List of notifications */
            filteredNotifications.map((notification) => {
              const config = getNotificationConfig(notification.type);
              const Icon = config.icon;
              const isUnread = !notification.readAt;
              const sessionObj =
                notification.session && typeof notification.session !== "string"
                  ? notification.session
                  : null;
              const sessionId = sessionObj?._id ?? sessionObj?.id;

              return (
                <article
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`group relative flex items-start gap-3 rounded-2xl border p-3.5 transition-all cursor-pointer sm:p-4 ${
                    isUnread
                      ? "border-emerald-200/90 bg-emerald-50/20 shadow-xs ring-1 ring-emerald-500/20"
                      : "border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  {/* Unread Left Border / Indicator */}
                  {isUnread && (
                    <span className="absolute left-1.5 top-1/2 -translate-y-1/2 h-8 w-1 rounded-full bg-emerald-500 sm:left-2" />
                  )}

                  {/* Icon or Actor Avatar */}
                  <div className="relative flex-shrink-0">
                    {notification.actor?.avatar ? (
                      <div className="relative h-10 w-10 sm:h-11 sm:w-11">
                        <img
                          src={notification.actor.avatar}
                          alt={notification.actor.name || "User"}
                          className="h-full w-full rounded-xl object-cover ring-1 ring-slate-200"
                        />
                        <div
                          className={`absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-md border border-white ${config.bgColor} ${config.textColor}`}
                        >
                          <Icon className="h-3 w-3" />
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${config.bgColor} ${config.textColor}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="min-w-0 flex-1">
                    {/* Top Row: Tag & Relative Time */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-flex items-center rounded-md border px-1.5 py-0.2 text-[10px] font-semibold ${config.badgeColor}`}
                        >
                          {config.label}
                        </span>
                        {isUnread && (
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        )}
                      </div>

                      <span
                        suppressHydrationWarning
                        className="flex-shrink-0 text-[10.5px] font-medium text-slate-400"
                      >
                        {mounted
                          ? formatRelativeTime(notification.createdAt)
                          : ""}
                      </span>
                    </div>

                    {/* Title */}
                    <h2
                      className={`mt-1 text-xs font-bold leading-snug sm:text-sm ${
                        isUnread ? "text-slate-900" : "text-slate-700"
                      }`}
                    >
                      {notification.title}
                    </h2>

                    {/* Message */}
                    <p className="mt-0.5 text-xs text-slate-500 leading-relaxed line-clamp-2 sm:line-clamp-none">
                      {notification.message}
                    </p>

                    {/* Session Context Pill if attached */}
                    {sessionObj && (
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <div className="inline-flex items-center gap-1 rounded-lg bg-slate-100/90 px-2 py-0.5 text-[11px] font-medium text-slate-700 max-w-full">
                          <MapPin className="h-3 w-3 flex-shrink-0 text-emerald-600" />
                          <span className="truncate">
                            {sessionObj.venueName || sessionObj.title || "Buổi chơi cầu lông"}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Action Row */}
                    <div className="mt-2.5 flex items-center justify-between gap-2 pt-1 border-t border-slate-100/60">
                      {sessionId ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 transition group-hover:text-emerald-800">
                          <span>{config.actionText}</span>
                          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      ) : (
                        <div />
                      )}

                      <div className="flex items-center gap-1">
                        {isUnread && (
                          <button
                            type="button"
                            title="Đánh dấu đã đọc"
                            onClick={(e) => {
                              e.stopPropagation();
                              markReadMutation.mutate(notification._id);
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          title="Xóa thông báo"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMutation.mutate(notification._id);
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </RequireAuth>
  );
}
