import { Router } from "express";
import { authenticateJwt } from "../middlewares/jwt.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createRatingSchema,
  updateRatingSchema,
} from "../validators/rating.validator.js";
import {
  deleteRatingController,
  createRatingController,
  listRatingsController,
  updateRatingController,
} from "../controllers/ratings.controller.js";

const router = Router({ mergeParams: true });

router.post(
  "/sessions/:sessionId/ratings",
  authenticateJwt,
  validate(createRatingSchema),
  createRatingController,
);
router.patch(
  "/sessions/:sessionId/ratings/:id",
  authenticateJwt,
  validate(updateRatingSchema),
  updateRatingController,
);
router.delete(
  "/sessions/:sessionId/ratings/:id",
  authenticateJwt,
  deleteRatingController,
);
router.get("/users/:userId/ratings", listRatingsController);

export default router;
