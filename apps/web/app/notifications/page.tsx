"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api, notificationsApi } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RequireAuth } from "@/components/auth/RequireAuth";

export default function NotificationsPage() {
  const router = useRouter();
  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await api.get("/notifications");
      return response.data.data.notifications as Array<{
        _id: string;
        type: string;
        title: string;
        message: string;
        createdAt: string;
        readAt?: string | null;
        session?: { _id?: string; id?: string } | string;
      }>;
    },
  });

  const qc = useQueryClient();
  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.deleteNotification(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  return (
    <RequireAuth>
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold text-slate-900">Thông báo</h1>
        <div className="grid gap-3">
          {(notificationsQuery.data ?? []).map((notification) => {
            const sessionId =
              notification.session && typeof notification.session !== "string"
                ? (notification.session._id ?? notification.session.id ?? null)
                : null;

            return (
              <article
                key={notification._id}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-glow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-slate-900">
                      {notification.title}
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      {notification.message}
                    </p>
                  </div>
                  {notification.readAt ? null : (
                    <span className="mt-1 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
                      Mới
                    </span>
                  )}
                </div>
                {sessionId ? (
                  <div className="mt-4">
                    <button
                      onClick={async () => {
                        await markReadMutation.mutateAsync(notification._id);
                        router.push(
                          `/sessions/${sessionId}${
                            notification.type === "session_join_request"
                              ? "#join-requests"
                              : ""
                          }`,
                        );
                      }}
                      className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                    >
                      Mở buổi chơi
                    </button>
                  </div>
                ) : null}
                <p className="mt-3 text-xs text-slate-500">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => deleteMutation.mutate(notification._id)}
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700"
                  >
                    Xóa
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </RequireAuth>
  );
}
