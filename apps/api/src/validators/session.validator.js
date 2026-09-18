import { z } from "zod";

const skillLevels = [
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
];
const matchTypes = ["doubles", "mixed doubles", "singles"];
const statuses = ["open", "full", "completed", "cancelled"];

export const createSessionSchema = z
  .object({
    title: z.string().min(3).max(120),
    venueId: z.string().min(10).optional().or(z.literal("")),
    venueName: z.string().min(2).max(120),
    district: z.string().min(2).max(60),
    city: z.string().min(2).max(60),
    datetime: z.string().datetime(),
    skillRequirements: z.array(z.enum(skillLevels)).min(1),
    maxPlayers: z.number().int().min(2).max(32),
    matchType: z.enum(matchTypes),
    price: z.number().min(0),
    notes: z.string().max(1000).optional(),
    coverImage: z.string().optional().nullable(),
    imageUrl: z.string().optional().nullable(),
    depositRequired: z.boolean().optional(),
    depositAmount: z.number().min(0).optional(),
    cancelPolicyHours: z.number().min(1).max(72).optional(),
  })
  .passthrough();

export const updateSessionStatusSchema = z.object({
  status: z.enum(statuses),
  cancelReason: z.string().max(300).optional(),
});

export const inviteSessionSchema = z.object({
  userId: z.string().min(10),
});
