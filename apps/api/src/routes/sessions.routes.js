import { Router } from "express";
import { authenticateJwt } from "../middlewares/jwt.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createSessionSchema,
  inviteSessionSchema,
  updateSessionStatusSchema,
} from "../validators/session.validator.js";
import {
  deleteSessionController,
  createSessionController,
  getSessionController,
  inviteSessionController,
  joinSessionController,
  leaveSessionController,
  listSessionsController,
  updateSessionController,
  updateSessionStatusController,
  respondJoinRequestController,
} from "../controllers/sessions.controller.js";

const router = Router();

router.get("/", listSessionsController);
router.post(
  "/",
  authenticateJwt,
  validate(createSessionSchema),
  createSessionController,
);
router.get("/:id", getSessionController);
router.patch(
  "/:id",
  authenticateJwt,
  validate(createSessionSchema.partial()),
  updateSessionController,
);
router.post("/:id/join", authenticateJwt, joinSessionController);
router.post("/:id/leave", authenticateJwt, leaveSessionController);
router.post(
  "/:id/invite",
  authenticateJwt,
  validate(inviteSessionSchema),
  inviteSessionController,
);
router.post(
  "/:id/requests/:userId",
  authenticateJwt,
  respondJoinRequestController,
);
router.patch(
  "/:id/status",
  authenticateJwt,
  validate(updateSessionStatusSchema),
  updateSessionStatusController,
);
router.delete("/:id", authenticateJwt, deleteSessionController);

export default router;
