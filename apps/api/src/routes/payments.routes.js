import { Router } from "express";
import { authenticateJwt } from "../middlewares/jwt.middleware.js";
import {
  cancelBookingWithRefundController,
  checkInController,
  confirmEscrowPaymentController,
  createDepositOrderController,
  getBanksController,
  getSessionPaymentsController,
  markNoShowController,
  releasePayoutController,
  reportDisputeController,
} from "../controllers/payments.controller.js";

const router = Router();

router.get("/banks", getBanksController);
router.post("/deposit-order", authenticateJwt, createDepositOrderController);
router.post("/confirm", authenticateJwt, confirmEscrowPaymentController);
router.post("/cancel-booking", authenticateJwt, cancelBookingWithRefundController);
router.post("/check-in", authenticateJwt, checkInController);
router.post("/mark-no-show", authenticateJwt, markNoShowController);
router.post("/dispute", authenticateJwt, reportDisputeController);
router.post("/release-payout", authenticateJwt, releasePayoutController);
router.get("/session/:sessionId", authenticateJwt, getSessionPaymentsController);

export default router;
