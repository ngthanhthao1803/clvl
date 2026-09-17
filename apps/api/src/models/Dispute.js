import mongoose from "mongoose";

const disputeSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
      index: true,
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "fake_session",
        "host_absent",
        "player_no_show",
        "venue_closed",
        "incorrect_charge",
        "other",
      ],
      required: true,
    },
    reason: { type: String, required: true, trim: true, maxlength: 1000 },
    evidenceImages: [{ type: String, trim: true }],
    status: {
      type: String,
      enum: [
        "pending",
        "investigating",
        "resolved_refund",
        "resolved_dismissed",
      ],
      default: "pending",
      index: true,
    },
    resolutionNote: { type: String, trim: true, default: "" },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

disputeSchema.index({ session: 1, status: 1 });

export const Dispute = mongoose.model("Dispute", disputeSchema);
