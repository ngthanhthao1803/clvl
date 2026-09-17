import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes/index.js";
import { env } from "./config/env.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { notFoundMiddleware } from "./middlewares/notFound.middleware.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  // In development allow reflected origin (so localhost:3000,3001,3002 work).
  const corsOptions =
    env.nodeEnv === "production"
      ? { origin: env.clientOrigin, credentials: true }
      : { origin: true, credentials: true };
  app.use(cors(corsOptions));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

  app.get("/", (req, res) => {
    res.json({ success: true, message: "CLVL API is running" });
  });

  app.use("/api/v1", routes);
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
