import axios from "axios";
import { getApiBaseUrl } from "./endpoints";

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    let token = window.localStorage.getItem("clvl-jwt");
    if (!token) {
      try {
        const raw = window.localStorage.getItem("clvl-auth");
        if (raw) {
          const parsed = JSON.parse(raw);
          token = parsed?.state?.token;
          if (token) {
            window.localStorage.setItem("clvl-jwt", token);
          }
        }
      } catch {}
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export const authApi = {
  register: (payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    skillLevel?: string;
    district?: string;
    city?: string;
  }) => api.post("/auth/register", payload),
  login: (payload: { email: string; password: string }) =>
    api.post("/auth/login", payload),
  getMe: () => api.get("/auth/me"),
  logout: () => api.post("/auth/logout"),
};

export const sessionsApi = {
  updateSession: (id: string, payload: any) =>
    api.patch(`/sessions/${id}`, payload),
  joinSession: (id: string) => api.post(`/sessions/${id}/join`),
  respondJoinRequest: (sessionId: string, userId: string, approve: boolean) =>
    api.post(`/sessions/${sessionId}/requests/${userId}`, { approve }),
  cancelSession: (id: string) => api.delete(`/sessions/${id}`),
};

export const messagesApi = {
  updateMessage: (sessionId: string, messageId: string, payload: any) =>
    api.patch(`/sessions/${sessionId}/messages/${messageId}`, payload),
  deleteMessage: (sessionId: string, messageId: string) =>
    api.delete(`/sessions/${sessionId}/messages/${messageId}`),
};

export const ratingsApi = {
  updateRating: (sessionId: string, ratingId: string, payload: any) =>
    api.patch(`/sessions/${sessionId}/ratings/${ratingId}`, payload),
  deleteRating: (sessionId: string, ratingId: string) =>
    api.delete(`/sessions/${sessionId}/ratings/${ratingId}`),
};

export const venuesApi = {
  listVenues: (params: Record<string, unknown> = {}) =>
    api.get(`/venues`, { params }),
  getVenue: (venueId: string) => api.get(`/venues/${venueId}`),
  deleteVenue: (venueId: string) => api.delete(`/venues/${venueId}`),
};

export const notificationsApi = {
  listNotifications: () => api.get(`/notifications`),
  getUnreadCount: () => api.get(`/notifications/unread-count`),
  markRead: (notificationId: string) =>
    api.patch(`/notifications/${notificationId}/read`),
  markAllRead: () => api.patch(`/notifications/read-all`),
  deleteNotification: (notificationId: string) =>
    api.delete(`/notifications/${notificationId}`),
};

export const usersApi = {
  updateMe: (payload: any) => api.patch(`/users/me`, payload),
  deactivateMe: () => api.delete(`/users/me`),
};

export const paymentsApi = {
  getBanks: () => api.get("/payments/banks"),
  createDepositOrder: (sessionId: string) =>
    api.post("/payments/deposit-order", { sessionId }),
  getPaymentStatus: (orderCode: string) =>
    api.get(`/payments/status/${orderCode}`),
  getMyPayments: () => api.get("/payments/my-payments"),
  confirmPayment: (
    orderCode: string,
    payload?: { proofImage?: string; bankTransactionId?: string },
  ) => api.post("/payments/confirm", { orderCode, ...payload }),
  cancelBooking: (sessionId: string, reason?: string) =>
    api.post("/payments/cancel-booking", { sessionId, reason }),
  checkIn: (sessionId: string, checkInCode: string) =>
    api.post("/payments/check-in", { sessionId, checkInCode }),
  markNoShow: (sessionId: string, targetUserId: string) =>
    api.post("/payments/mark-no-show", { sessionId, targetUserId }),
  reportDispute: (payload: {
    sessionId: string;
    type: string;
    reason: string;
    evidenceImages?: string[];
  }) => api.post("/payments/dispute", payload),
  releasePayout: (sessionId: string) =>
    api.post("/payments/release-payout", { sessionId }),
  getSessionPayments: (sessionId: string) =>
    api.get(`/payments/session/${sessionId}`),
};

