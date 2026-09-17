import { z } from "zod";

export const sendMessageSchema = z.object({
  content: z.string().min(1).max(1000),
  type: z.enum(["text", "image", "system"]).default("text"),
});

export const updateMessageSchema = sendMessageSchema.pick({ content: true });
