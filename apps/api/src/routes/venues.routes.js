import { Router } from "express";
import { authenticateJwt } from "../middlewares/jwt.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createVenueSchema } from "../validators/venue.validator.js";
import {
  deleteVenueController,
  createVenueController,
  getVenueController,
  listVenuesController,
  updateVenueController,
} from "../controllers/venues.controller.js";

const router = Router();

router.get("/", listVenuesController);
router.post(
  "/",
  authenticateJwt,
  validate(createVenueSchema),
  createVenueController,
);
router.get("/:id", getVenueController);
router.patch(
  "/:id",
  authenticateJwt,
  validate(createVenueSchema.partial().omit({ ownerId: true })),
  updateVenueController,
);
router.delete("/:id", authenticateJwt, deleteVenueController);

export default router;
