import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDb() {
  mongoose.set("strictQuery", true);

  try {
    await mongoose.connect(env.mongodbUri);
    return { connected: true };
  } catch (error) {
    if (env.nodeEnv === "production") {
      throw error;
    }

    console.warn(
      "MongoDB connection unavailable, starting API in degraded mode:",
      error.message,
    );
    return { connected: false, error };
  }
}
