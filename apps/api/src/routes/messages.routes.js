import { Router } from "express";
import { authenticateJwt } from "../middlewares/jwt.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  sendMessageSchema,
  updateMessageSchema,
} from "../validators/message.validator.js";
import {
  deleteMessageController,
  listMessagesController,
  sendMessageController,
  updateMessageController,
} from "../controllers/messages.controller.js";

const router = Router({ mergeParams: true });

router.get(
  "/sessions/:sessionId/messages",
  authenticateJwt,
  listMessagesController,
);
router.post(
  "/sessions/:sessionId/messages",
  authenticateJwt,
  validate(sendMessageSchema),
  sendMessageController,
);
router.patch(
  "/sessions/:sessionId/messages/:id",
  authenticateJwt,
  validate(updateMessageSchema),
  updateMessageController,
);
router.delete(
  "/sessions/:sessionId/messages/:id",
  authenticateJwt,
  deleteMessageController,
);

export default router;
