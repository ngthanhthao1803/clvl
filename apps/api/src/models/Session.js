import mongoose from "mongoose";

const sessionPlayerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    joinedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["host", "joined", "invited", "pending", "rejected", "left"],
      default: "joined",
    },
    paymentStatus: {
      type: String,
      enum: [
        "unpaid",
        "pending",
        "escrow_held",
        "paid",
        "refunded",
        "forfeited",
      ],
      default: "unpaid",
    },
    paidAmount: { type: Number, default: 0, min: 0 },
    checkInAt: { type: Date, default: null },
    attendanceStatus: {
      type: String,
      enum: ["registered", "attended", "no_show", "cancelled_refund"],
      default: "registered",
    },
  },
  { _id: false },
);

const sessionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    venue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venue",
      required: false,
      index: true,
    },
    venueName: { type: String, required: true, trim: true },
    // Optional human-friendly slug used for seeded/dev routes (e.g. "session-1")
    slug: {
      type: String,
      required: false,
      trim: true,
      index: true,
      unique: true,
      sparse: true,
    },
    district: { type: String, required: true, trim: true, index: true },
    city: { type: String, required: true, trim: true, index: true },
    datetime: { type: Date, required: true, index: true },
    skillRequirements: {
      type: [String],
      enum: [
        "Newbie",
        "Yếu",
        "Yếu+",
        "TBY-",
        "TBY",
        "TBY+",
        "TB-",
        "TB",
        "TB+",
        "Khá-",
        "Khá",
        "Khá+",
        "Pro",
        "Bán chuyên",
        "Trình giải",
      ],
      required: true,
      index: true,
    },
    maxPlayers: { type: Number, required: true, min: 2, max: 32 },
    currentPlayersCount: { type: Number, default: 1, min: 1 },
    players: [sessionPlayerSchema],
    matchType: {
      type: String,
      enum: ["doubles", "mixed doubles", "singles"],
      required: true,
      index: true,
    },
    price: { type: Number, default: 0, min: 0 },
    notes: { type: String, trim: true, maxlength: 1000, default: "" },
    coverImage: { type: String, trim: true, default: "" },
    imageUrl: { type: String, trim: true, default: "" },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["open", "full", "completed", "cancelled"],
      default: "open",
      index: true,
    },
    cancelReason: { type: String, trim: true, maxlength: 300, default: "" },
    isPrivate: { type: Boolean, default: false },
    chatEnabled: { type: Boolean, default: true },
    depositRequired: { type: Boolean, default: true },
    depositAmount: { type: Number, default: 50000, min: 0 },
    cancelPolicyHours: { type: Number, default: 12, min: 1 },
    checkInCode: { type: String, trim: true },
    escrowStatus: {
      type: String,
      enum: ["none", "holding", "ready_for_payout", "paid_out", "disputed"],
      default: "none",
    },
    totalEscrowHeld: { type: Number, default: 0, min: 0 },
    latitude: { type: Number, required: false },
    longitude: { type: Number, required: false },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        default: [106.6297, 10.8231],
      },
    },
    googleMapsUrl: { type: String, trim: true },
  },
  { timestamps: true },
);

sessionSchema.index({ city: 1, district: 1, datetime: 1, status: 1 });
sessionSchema.index({ location: "2dsphere" });

export const Session = mongoose.model("Session", sessionSchema);
