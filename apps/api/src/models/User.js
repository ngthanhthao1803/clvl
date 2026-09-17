import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
      sparse: true,
    },
    avatar: { type: String, trim: true },
    bio: { type: String, trim: true, maxlength: 400, default: "" },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_say"],
      default: "prefer_not_say",
    },
    skillLevel: {
      type: String,
      enum: [
        "Beginner",
        "Intermediate",
        "Intermediate+",
        "Advanced",
        "Advanced+",
        "Pro",
      ],
      default: "Beginner",
      index: true,
    },
    dominantHand: {
      type: String,
      enum: ["left", "right", "ambidextrous"],
      default: "right",
    },
    preferredPosition: {
      type: String,
      enum: ["front", "back", "left", "right", "all-round"],
      default: "all-round",
    },
    city: { type: String, trim: true, index: true },
    district: { type: String, trim: true, index: true },
    playSchedule: [{ type: String, trim: true }],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reputation: { type: Number, default: 100, min: 0, max: 100 },
    totalMatches: { type: Number, default: 0, min: 0 },
    role: {
      type: String,
      enum: ["player", "owner", "admin"],
      default: "player",
    },
    bankAccount: {
      bankId: { type: String, trim: true, default: "" },
      bankName: { type: String, trim: true, default: "" },
      accountNumber: { type: String, trim: true, default: "" },
      accountHolder: { type: String, trim: true, default: "" },
    },
    isVerifiedHost: { type: Boolean, default: false },
    hostedMatchesCount: { type: Number, default: 0, min: 0 },
    lastActiveAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

userSchema.index({ name: "text", bio: "text", city: "text", district: "text" });

export const User = mongoose.model("User", userSchema);
