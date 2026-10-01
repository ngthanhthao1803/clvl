import { Router } from "express";
import { authenticateJwt } from "../middlewares/jwt.middleware.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";
import {
  getDashboardStatsController,
  getUsersController,
  getUserDetailController,
  updateUserController,
  deleteUserController,
  getSessionsController,
  updateSessionStatusController,
  deleteSessionController,
  getVenuesController,
  createVenueController,
  updateVenueController,
  deleteVenueController,
  getDisputesController,
  resolveDisputeController,
  getPaymentsController,
} from "../controllers/admin.controller.js";

const router = Router();

// Tất cả các routes admin đều cần phải đăng nhập và có quyền Admin
router.use(authenticateJwt, requireAdmin);

// Dashboard overview
router.get("/stats", getDashboardStatsController);

// Quản lý người dùng
router.get("/users", getUsersController);
router.get("/users/:id", getUserDetailController);
router.patch("/users/:id", updateUserController);
router.delete("/users/:id", deleteUserController);

// Quản lý buổi chơi (Sessions)
router.get("/sessions", getSessionsController);
router.patch("/sessions/:id/status", updateSessionStatusController);
router.delete("/sessions/:id", deleteSessionController);

// Quản lý sân cầu lông (Venues)
router.get("/venues", getVenuesController);
router.post("/venues", createVenueController);
router.patch("/venues/:id", updateVenueController);
router.delete("/venues/:id", deleteVenueController);

// Quản lý khiếu nại (Disputes)
router.get("/disputes", getDisputesController);
router.post("/disputes/:id/resolve", resolveDisputeController);

// Quản lý giao dịch (Payments & Escrow)
router.get("/payments", getPaymentsController);

export default router;
