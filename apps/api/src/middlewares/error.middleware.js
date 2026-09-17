import { env } from "../config/env.js";

export function errorMiddleware(err, req, res, next) {
  // Always log the error server-side to help debugging
  // Do not expose full error details to clients in production.
  console.error(err);
  const statusCode = err.statusCode ?? 500;
  const payload = {
    success: false,
    message: err.message ?? "Internal Server Error",
  };

  if (env.nodeEnv !== "production") {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
}
