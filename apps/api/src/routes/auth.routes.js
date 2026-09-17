import { Router } from "express";
import {
  exchangeFirebaseController,
  logoutController,
  meController,
} from "../controllers/auth.controller.js";
import { authenticateJwt } from "../middlewares/jwt.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { firebaseExchangeSchema } from "../validators/auth.validator.js";

const router = Router();

router.post(
  "/firebase",
  validate(firebaseExchangeSchema),
  exchangeFirebaseController,
);
router.get("/me", authenticateJwt, meController);
router.post("/logout", authenticateJwt, logoutController);

export default router;
