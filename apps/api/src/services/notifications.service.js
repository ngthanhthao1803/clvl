import { Notification } from "../models/Notification.js";

export async function createNotification(payload) {
  return Notification.create(payload);
}

export async function listNotifications(recipientId) {
  return Notification.find({ recipient: recipientId })
    .sort({ createdAt: -1 })
    .limit(100)
    .populate("actor session venue");
}

export async function countUnreadNotifications(recipientId) {
  return Notification.countDocuments({ recipient: recipientId, readAt: null });
}

export async function markAllNotificationsRead(recipientId) {
  await Notification.updateMany(
    { recipient: recipientId, readAt: null },
    { $set: { readAt: new Date() } },
  );
  return true;
}

export async function markNotificationRead(recipientId, notificationId) {
  return Notification.findOneAndUpdate(
    { _id: notificationId, recipient: recipientId },
    { $set: { readAt: new Date() } },
    { new: true },
  );
}

export async function deleteNotification(recipientId, notificationId) {
  const result = await Notification.deleteOne({
    _id: notificationId,
    recipient: recipientId,
  });

  return result.deletedCount > 0;
}
