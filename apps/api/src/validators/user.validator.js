import { z } from "zod";

const skillLevels = [
  "Beginner",
  "Intermediate",
  "Intermediate+",
  "Advanced",
  "Advanced+",
  "Pro",
];
const genders = ["male", "female", "other", "prefer_not_say"];
const hands = ["left", "right", "ambidextrous"];
const positions = ["front", "back", "left", "right", "all-round"];

export const updateUserSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  avatar: z.string().max(400_000).optional(),
  bio: z.string().max(400).optional(),
  gender: z.enum(genders).optional(),
  skillLevel: z.enum(skillLevels).optional(),
  dominantHand: z.enum(hands).optional(),
  preferredPosition: z.enum(positions).optional(),
  city: z.string().min(2).max(60).optional(),
  district: z.string().min(2).max(60).optional(),
  playSchedule: z.array(z.string().min(1)).max(14).optional(),
  bankAccount: z
    .object({
      bankId: z.string().max(20).optional(),
      bankName: z.string().max(80).optional(),
      accountNumber: z.string().max(40).optional(),
      accountHolder: z.string().max(80).optional(),
    })
    .optional(),
});
