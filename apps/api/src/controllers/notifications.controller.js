import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteNotification,
  countUnreadNotifications,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notifications.service.js";

export const listNotificationsController = asyncHandler(async (req, res) => {
  const notifications = await listNotifications(req.user.sub);
  res.json({ success: true, data: { notifications } });
});

export const unreadNotificationsCountController = asyncHandler(
  async (req, res) => {
    const unreadCount = await countUnreadNotifications(req.user.sub);
    res.json({ success: true, data: { unreadCount } });
  },
);

export const markAllNotificationsReadController = asyncHandler(
  async (req, res) => {
    await markAllNotificationsRead(req.user.sub);
    res.json({ success: true, message: "All notifications marked as read" });
  },
);

export const markNotificationReadController = asyncHandler(async (req, res) => {
  const notification = await markNotificationRead(req.user.sub, req.params.id);
  res.json({ success: true, data: { notification } });
});

export const deleteNotificationController = asyncHandler(async (req, res) => {
  await deleteNotification(req.user.sub, req.params.id);
  res.json({ success: true, message: "Notification deleted" });
});
