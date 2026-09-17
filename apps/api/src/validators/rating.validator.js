import { z } from "zod";

export const createRatingSchema = z.object({
  rateeId: z.string().min(10),
  overall: z.number().int().min(1).max(5),
  criteria: z.object({
    skill: z.number().int().min(1).max(5),
    attitude: z.number().int().min(1).max(5),
    punctuality: z.number().int().min(1).max(5),
  }),
  comment: z.string().max(500).optional(),
});

export const updateRatingSchema = z.object({
  overall: z.number().int().min(1).max(5).optional(),
  criteria: z
    .object({
      skill: z.number().int().min(1).max(5),
      attitude: z.number().int().min(1).max(5),
      punctuality: z.number().int().min(1).max(5),
    })
    .optional(),
  comment: z.string().max(500).optional(),
});
