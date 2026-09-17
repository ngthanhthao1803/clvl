import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: false,
      unique: true,
      index: true,
      sparse: true,
    },
    password: { type: String, required: false, select: false },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
      sparse: true,
    },
    phone: { type: String, trim: true },
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
        "Beginner",
        "Intermediate",
        "Intermediate+",
        "Advanced",
        "Advanced+",
      ],
      default: "TB",
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
    city: { type: String, trim: true, index: true, default: "Hồ Chí Minh" },
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

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model("User", userSchema);
