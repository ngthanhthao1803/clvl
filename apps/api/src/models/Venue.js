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
    phone: { type: String, trim: true },
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

venueSchema.index({ location: "2dsphere" });

export const Venue = mongoose.model("Venue", venueSchema);
