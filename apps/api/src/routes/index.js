import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./users.routes.js";
import sessionRoutes from "./sessions.routes.js";
import venueRoutes from "./venues.routes.js";
import messageRoutes from "./messages.routes.js";
import notificationRoutes from "./notifications.routes.js";
import ratingRoutes from "./ratings.routes.js";
import paymentRoutes from "./payments.routes.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ success: true, service: "clvl-api", status: "ok" });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/sessions", sessionRoutes);
router.use("/venues", venueRoutes);
router.use("/payments", paymentRoutes);
router.use("/", messageRoutes);
router.use("/notifications", notificationRoutes);
router.use("/", ratingRoutes);

export default router;
