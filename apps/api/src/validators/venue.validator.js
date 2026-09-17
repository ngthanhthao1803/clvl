import { z } from "zod";

export const createVenueSchema = z.object({
  name: z.string().min(2).max(120),
  address: z.string().min(5).max(200),
  district: z.string().min(2).max(60),
  city: z.string().min(2).max(60),
  images: z.array(z.string().url()).max(12).default([]),
  courtCount: z.number().int().min(1).max(100),
  openingHours: z.object({
    open: z.string().min(1),
    close: z.string().min(1),
  }),
  priceRange: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
  }),
  ownerId: z.string().min(10).optional(),
});
