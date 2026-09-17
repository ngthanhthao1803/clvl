import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: { type: String, required: true, trim: true, maxlength: 1000 },
    type: { type: String, enum: ["text", "image", "system"], default: "text" },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isSystem: { type: Boolean, default: false },
    editedAt: { type: Date },
  },
  { timestamps: true },
);

messageSchema.index({ session: 1, createdAt: -1 });

export const Message = mongoose.model("Message", messageSchema);
