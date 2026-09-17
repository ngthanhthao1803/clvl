import { Router } from "express";
import { authenticateJwt } from "../middlewares/jwt.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { updateUserSchema } from "../validators/user.validator.js";
import {
  deleteMeController,
  getUserController,
  listPlayersController,
  meController,
  updateMeController,
} from "../controllers/users.controller.js";

const router = Router();

router.get("/me", authenticateJwt, meController);
router.patch(
  "/me",
  authenticateJwt,
  validate(updateUserSchema),
  updateMeController,
);
router.delete("/me", authenticateJwt, deleteMeController);
router.get("/", listPlayersController);
router.get("/:id", getUserController);

export default router;
