import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deactivateMe,
  getUserById,
  listPlayers,
  toUserDto,
  updateMe,
} from "../services/users.service.js";

export const meController = asyncHandler(async (req, res) => {
  const user = await getUserById(req.user.sub);
  res.json({ success: true, data: { user: toUserDto(user) } });
});

export const updateMeController = asyncHandler(async (req, res) => {
  const user = await updateMe(req.user.sub, req.body);
  res.json({ success: true, data: { user: toUserDto(user) } });
});

export const listPlayersController = asyncHandler(async (req, res) => {
  const users = await listPlayers(req.query);
  res.json({ success: true, data: { users: users.map(toUserDto) } });
});

export const getUserController = asyncHandler(async (req, res) => {
  const user = await getUserById(req.params.id);
  res.json({ success: true, data: { user: toUserDto(user) } });
});

export const deleteMeController = asyncHandler(async (req, res) => {
  await deactivateMe(req.user.sub);
  res.json({ success: true, message: "Account deactivated" });
});
