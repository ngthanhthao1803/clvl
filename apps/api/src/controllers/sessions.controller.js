import { asyncHandler } from "../utils/asyncHandler.js";
import {
  cancelSession,
  createSession,
  getSessionById,
  invitePlayer,
  joinSession,
  leaveSession,
  listSessions,
  updateSession,
  respondToJoinRequest,
  updateSessionStatus,
} from "../services/sessions.service.js";

export const listSessionsController = asyncHandler(async (req, res) => {
  const sessions = await listSessions(req.query);
  res.json({ success: true, data: { sessions } });
});

export const createSessionController = asyncHandler(async (req, res) => {
  const session = await createSession(req.user.sub, req.body);
  res.status(201).json({ success: true, data: { session } });
});

export const updateSessionController = asyncHandler(async (req, res) => {
  const session = await updateSession(req.params.id, req.user.sub, req.body);
  res.json({ success: true, data: { session } });
});

export const getSessionController = asyncHandler(async (req, res) => {
  const session = await getSessionById(req.params.id);
  res.json({ success: true, data: { session } });
});

export const joinSessionController = asyncHandler(async (req, res) => {
  const session = await joinSession(req.params.id, req.user.sub);
  res.json({ success: true, data: { session } });
});

export const leaveSessionController = asyncHandler(async (req, res) => {
  const session = await leaveSession(req.params.id, req.user.sub);
  res.json({ success: true, data: { session } });
});

export const inviteSessionController = asyncHandler(async (req, res) => {
  await invitePlayer(req.params.id, req.user.sub, req.body.userId);
  res.json({ success: true, message: "Invitation sent" });
});

export const respondJoinRequestController = asyncHandler(async (req, res) => {
  const { approve } = req.body;
  const userId = req.params.userId;
  const session = await respondToJoinRequest(
    req.params.id,
    req.user.sub,
    userId,
    Boolean(approve),
  );
  res.json({ success: true, data: { session } });
});

export const updateSessionStatusController = asyncHandler(async (req, res) => {
  const session = await updateSessionStatus(
    req.params.id,
    req.user.sub,
    req.body,
  );
  res.json({ success: true, data: { session } });
});

export const deleteSessionController = asyncHandler(async (req, res) => {
  const session = await cancelSession(req.params.id, req.user.sub);
  res.json({ success: true, data: { session } });
});
