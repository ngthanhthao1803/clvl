import mongoose from "mongoose";

const venueSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    address: { type: String, required: true, trim: true, maxlength: 200 },
    district: { type: String, required: true, trim: true, index: true },
    city: { type: String, required: true, trim: true, index: true },
    images: [{ type: String, trim: true }],
    courtCount: { type: Number, required: true, min: 1 },
    openingHours: {
      open: { type: String, required: true },
      close: { type: String, required: true },
    },
    priceRange: {
      min: { type: Number, required: true, min: 0 },
      max: { type: Number, required: true, min: 0 },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

venueSchema.index({
  name: "text",
  address: "text",
  district: "text",
  city: "text",
});

export const Venue = mongoose.model("Venue", venueSchema);
