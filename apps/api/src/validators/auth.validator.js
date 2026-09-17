import { z } from "zod";

export const firebaseExchangeSchema = z.object({
  idToken: z.string().min(10, "Firebase ID token is required"),
});
