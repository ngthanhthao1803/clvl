import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
      index: true,
    },
    rater: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    ratee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    overall: { type: Number, required: true, min: 1, max: 5 },
    criteria: {
      skill: { type: Number, required: true, min: 1, max: 5 },
      attitude: { type: Number, required: true, min: 1, max: 5 },
      punctuality: { type: Number, required: true, min: 1, max: 5 },
    },
    comment: { type: String, trim: true, maxlength: 500, default: "" },
    isPositive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

ratingSchema.index({ session: 1, rater: 1, ratee: 1 }, { unique: true });

export const Rating = mongoose.model("Rating", ratingSchema);
