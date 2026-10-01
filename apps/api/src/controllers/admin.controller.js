import { asyncHandler } from "../utils/asyncHandler.js";
import {
  getDashboardStats,
  getAdminUsers,
  getAdminUserDetail,
  updateAdminUser,
  deleteAdminUser,
  getAdminSessions,
  updateAdminSessionStatus,
  deleteAdminSession,
  getAdminVenues,
  createAdminVenue,
  updateAdminVenue,
  deleteAdminVenue,
  getAdminDisputes,
  resolveAdminDispute,
  getAdminPayments,
} from "../services/admin.service.js";

export const getDashboardStatsController = asyncHandler(async (req, res) => {
  const data = await getDashboardStats();
  res.status(200).json({ success: true, data });
});

export const getUsersController = asyncHandler(async (req, res) => {
  const result = await getAdminUsers(req.query);
  res.status(200).json({ success: true, data: result });
});

export const getUserDetailController = asyncHandler(async (req, res) => {
  const result = await getAdminUserDetail(req.params.id);
  res.status(200).json({ success: true, data: result });
});

export const updateUserController = asyncHandler(async (req, res) => {
  const result = await updateAdminUser(req.user.sub, req.params.id, req.body);
  res.status(200).json({ success: true, data: result });
});

export const deleteUserController = asyncHandler(async (req, res) => {
  const result = await deleteAdminUser(req.user.sub, req.params.id);
  res.status(200).json({ success: true, data: result });
});

export const getSessionsController = asyncHandler(async (req, res) => {
  const result = await getAdminSessions(req.query);
  res.status(200).json({ success: true, data: result });
});

export const updateSessionStatusController = asyncHandler(async (req, res) => {
  const result = await updateAdminSessionStatus(req.params.id, req.body);
  res.status(200).json({ success: true, data: result });
});

export const deleteSessionController = asyncHandler(async (req, res) => {
  const result = await deleteAdminSession(req.params.id);
  res.status(200).json({ success: true, data: result });
});

export const getVenuesController = asyncHandler(async (req, res) => {
  const result = await getAdminVenues(req.query);
  res.status(200).json({ success: true, data: result });
});

export const createVenueController = asyncHandler(async (req, res) => {
  const result = await createAdminVenue(req.body);
  res.status(201).json({ success: true, data: result });
});

export const updateVenueController = asyncHandler(async (req, res) => {
  const result = await updateAdminVenue(req.params.id, req.body);
  res.status(200).json({ success: true, data: result });
});

export const deleteVenueController = asyncHandler(async (req, res) => {
  const result = await deleteAdminVenue(req.params.id);
  res.status(200).json({ success: true, data: result });
});

export const getDisputesController = asyncHandler(async (req, res) => {
  const result = await getAdminDisputes(req.query);
  res.status(200).json({ success: true, data: result });
});

export const resolveDisputeController = asyncHandler(async (req, res) => {
  const result = await resolveAdminDispute(req.params.id, req.body);
  res.status(200).json({ success: true, data: result });
});

export const getPaymentsController = asyncHandler(async (req, res) => {
  const result = await getAdminPayments(req.query);
  res.status(200).json({ success: true, data: result });
});
