import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: {
      type: String,
      enum: [
        "session_joined",
        "session_invited",
        "session_join_request",
        "session_join_approved",
        "session_join_rejected",
        "session_cancelled",
        "chat_message",
        "rating_received",
        "system",
      ],
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 300 },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      index: true,
    },
    venue: { type: mongoose.Schema.Types.ObjectId, ref: "Venue" },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
    readAt: { type: Date, default: null, index: true },
  },
  { timestamps: true },
);

notificationSchema.index({ recipient: 1, readAt: 1, createdAt: -1 });

export const Notification = mongoose.model("Notification", notificationSchema);
