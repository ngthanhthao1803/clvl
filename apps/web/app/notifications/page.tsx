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
  Check,
  CheckCheck,
  CheckCircle2,
  Compass,
  Mail,
  MapPin,
  MessageCircle,
  ShieldAlert,
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
  session?:
    | {
        _id?: string;
        id?: string;
        title?: string;
        venueName?: string;
        datetime?: string;
      }
    | string
    | null;
  venue?: {
    _id?: string;
    id?: string;
    name?: string;
    address?: string;
  } | null;
  meta?: Record<string, unknown>;
};

type FilterTab = "all" | "unread" | "sessions" | "others";

const SESSION_NOTIFICATION_TYPES = [
  "session_join_request",
  "session_join_approved",
  "session_join_rejected",
  "session_joined",
  "session_invited",
  "session_cancelled",
];

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
    if (diffMin < 60) return `${diffMin}p trước`;
    if (diffHours < 24) return `${diffHours}h trước`;
    if (diffDays === 1) return "Hôm qua";
    if (diffDays < 7) return `${diffDays} ngày trước`;

    const day = `${d.getDate()}`.padStart(2, "0");
    const month = `${d.getMonth() + 1}`.padStart(2, "0");
    return `${day}/${month}`;
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
        actionText: "Duyệt ngay",
      };
    case "session_join_approved":
      return {
        label: "Đã được duyệt",
        icon: CheckCircle2,
        bgColor: "bg-emerald-100",
        textColor: "text-emerald-700",
        badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
        actionText: "Mở thẻ vé",
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
        label: "Lời mời ghép sân",
        icon: Mail,
        bgColor: "bg-sky-100",
        textColor: "text-sky-700",
        badgeColor: "bg-sky-50 text-sky-800 border-sky-200",
        actionText: "Xem lời mời",
      };
    case "session_cancelled":
      return {
        label: "Kèo đã hủy",
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
        actionText: "Trả lời",
      };
    case "rating_received":
      return {
        label: "Điểm uy tín",
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
        badgeColor: "bg-slate-50 text-slate-700 border-slate-200",
        actionText: "Chi tiết",
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
  const sessionsNotifCount = notifications.filter((n) =>
    SESSION_NOTIFICATION_TYPES.includes(n.type),
  ).length;
  const othersNotifCount = notifications.length - sessionsNotifCount;

  const filteredNotifications = useMemo(() => {
    switch (activeTab) {
      case "unread":
        return notifications.filter((n) => !n.readAt);
      case "sessions":
        return notifications.filter((n) =>
          SESSION_NOTIFICATION_TYPES.includes(n.type),
        );
      case "others":
        return notifications.filter(
          (n) => !SESSION_NOTIFICATION_TYPES.includes(n.type),
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
        router.push(`/sessions/${sessionId}#join-requests` as any);
      } else if (notification.type === "chat_message") {
        router.push(`/chat/${sessionId}` as any);
      } else {
        router.push(`/sessions/${sessionId}` as any);
      }
      return;
    }

    if (notification.type === "rating_received") {
      router.push(
        user ? (`/profile/${user.id}` as any) : ("/explore" as any),
      );
      return;
    }
  };

  const tabs: Array<{
    key: FilterTab;
    label: string;
    count: number;
    highlight?: boolean;
  }> = [
    { key: "all", label: "Tất cả", count: notifications.length },
    {
      key: "unread",
      label: "Chưa đọc",
      count: unreadCount,
      highlight: unreadCount > 0,
    },
    { key: "sessions", label: "Kèo đấu", count: sessionsNotifCount },
    { key: "others", label: "Khác", count: othersNotifCount },
  ];

  return (
    <RequireAuth>
      <div className="mx-auto max-w-3xl space-y-3 pb-16 animate-fadeUp">
        {/* 1. Compact Header Bar */}
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60">
              <Bell className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900">
                  Thông báo
                </h1>
                {unreadCount > 0 && (
                  <span className="inline-flex items-center rounded-full bg-emerald-600 px-2 py-0.2 text-[10px] font-black text-white">
                    {unreadCount} mới
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                Cập nhật duyệt kèo, đặt cọc và tin nhắn sân cầu
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={unreadCount === 0 || markAllReadMutation.isPending}
            onClick={() => markAllReadMutation.mutate()}
            className="shrink-0 inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <CheckCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Đọc tất cả</span>
          </button>
        </div>

        {/* 2. 4-Column Segmented Control (Matching /my-sessions) */}
        <div className="grid grid-cols-4 gap-1 rounded-2xl border border-slate-200/80 bg-slate-100/90 p-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center justify-center gap-1 rounded-xl py-2 px-1.5 text-xs font-bold transition-all ${
                  isActive
                    ? "bg-white text-emerald-700 shadow-xs ring-1 ring-slate-200/70"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span className="truncate">{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[9.5px] font-black ${
                      isActive
                        ? "bg-emerald-100 text-emerald-800"
                        : tab.highlight
                          ? "bg-rose-500 text-white"
                          : "bg-slate-200/80 text-slate-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 3. Notifications List */}
        <div className="space-y-2">
          {notificationsQuery.isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs animate-pulse"
                >
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="h-3.5 w-28 rounded bg-slate-200" />
                      <div className="h-3 w-12 rounded bg-slate-100" />
                    </div>
                    <div className="h-3 w-3/4 rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-xs">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                {activeTab === "unread" ? (
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                ) : (
                  <BellOff className="h-6 w-6 text-slate-400" />
                )}
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-900 sm:text-base">
                {activeTab === "unread"
                  ? "Bạn đã xem hết mọi thông báo!"
                  : "Chưa có thông báo nào trong mục này"}
              </h3>
              <p className="mx-auto mt-1 max-w-xs text-xs text-slate-500">
                {activeTab === "unread"
                  ? "Không còn yêu cầu duyệt kèo hay tin nhắn nào bị bỏ lỡ."
                  : "Khi có người đăng ký kèo, gửi lời mời hoặc nhắn tin, thông báo sẽ hiển thị ngay tại đây."}
              </p>
              {activeTab === "all" && (
                <div className="mt-4">
                  <Link
                    href="/explore"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 active:scale-95"
                  >
                    <Compass className="h-3.5 w-3.5" />
                    <span>Tìm kèo cầu lông ngay</span>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const config = getNotificationConfig(notification.type);
              const Icon = config.icon;
              const isUnread = !notification.readAt;
              const sessionObj =
                notification.session &&
                typeof notification.session !== "string"
                  ? notification.session
                  : null;
              const sessionId = sessionObj?._id ?? sessionObj?.id;

              return (
                <article
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`group relative flex items-start gap-3 rounded-2xl border p-3 transition-all cursor-pointer sm:p-3.5 ${
                    isUnread
                      ? "border-emerald-300/90 bg-emerald-50/25 shadow-xs"
                      : "border-slate-200/80 bg-white hover:border-emerald-300 hover:bg-slate-50/40"
                  }`}
                >
                  {isUnread && (
                    <span className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-1 rounded-full bg-emerald-500" />
                  )}

                  {/* Actor Avatar or Type Icon */}
                  <div className="relative shrink-0">
                    {notification.actor?.avatar ? (
                      <div className="relative h-10 w-10">
                        <img
                          src={notification.actor.avatar}
                          alt={notification.actor.name || "User"}
                          className="h-full w-full rounded-xl object-cover ring-1 ring-slate-200"
                        />
                        <div
                          className={`absolute -bottom-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-md border border-white ${config.bgColor} ${config.textColor}`}
                        >
                          <Icon className="h-2.5 w-2.5" />
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${config.bgColor} ${config.textColor}`}
                      >
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className={`inline-flex items-center rounded-md border px-1.5 py-0.2 text-[9.5px] font-bold ${config.badgeColor}`}
                        >
                          {config.label}
                        </span>
                        {sessionObj && (
                          <span className="inline-flex items-center gap-1 truncate rounded-md bg-slate-100 px-1.5 py-0.2 text-[10px] font-semibold text-slate-600 max-w-[150px] sm:max-w-[240px]">
                            <MapPin className="h-2.5 w-2.5 shrink-0 text-emerald-600" />
                            <span className="truncate">
                              {sessionObj.venueName ||
                                sessionObj.title ||
                                "Kèo cầu lông"}
                            </span>
                          </span>
                        )}
                      </div>

                      <span
                        suppressHydrationWarning
                        className="shrink-0 text-[10px] font-semibold text-slate-400"
                      >
                        {mounted
                          ? formatRelativeTime(notification.createdAt)
                          : ""}
                      </span>
                    </div>

                    <h2
                      className={`mt-1 text-xs sm:text-[13px] font-bold leading-snug ${
                        isUnread ? "text-slate-900" : "text-slate-700"
                      }`}
                    >
                      {notification.title}
                    </h2>

                    <p className="mt-0.5 text-[11.5px] text-slate-500 leading-relaxed line-clamp-2">
                      {notification.message}
                    </p>

                    <div className="mt-2 flex items-center justify-between gap-2">
                      {sessionId || notification.type === "rating_received" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 group-hover:text-emerald-800">
                          <span>{config.actionText}</span>
                          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      ) : (
                        <span />
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
                            className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600"
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
                          className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
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
