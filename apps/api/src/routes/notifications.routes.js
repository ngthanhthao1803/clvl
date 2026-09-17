import { Router } from "express";
import { authenticateJwt } from "../middlewares/jwt.middleware.js";
import {
  deleteNotificationController,
  listNotificationsController,
  markAllNotificationsReadController,
  markNotificationReadController,
  unreadNotificationsCountController,
} from "../controllers/notifications.controller.js";

const router = Router();

router.get("/", authenticateJwt, listNotificationsController);
router.get(
  "/unread-count",
  authenticateJwt,
  unreadNotificationsCountController,
);
router.patch("/read-all", authenticateJwt, markAllNotificationsReadController);
router.patch("/:id/read", authenticateJwt, markNotificationReadController);
router.delete("/:id", authenticateJwt, deleteNotificationController);

export default router;
