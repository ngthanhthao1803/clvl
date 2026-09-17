import { asyncHandler } from "../utils/asyncHandler.js";
import { exchangeFirebaseIdToken } from "../services/auth.service.js";
import { toUserDto } from "../services/users.service.js";
import { getUserById } from "../services/users.service.js";

export const exchangeFirebaseController = asyncHandler(async (req, res) => {
  const result = await exchangeFirebaseIdToken(req.body.idToken);

  res.status(200).json({ success: true, data: result });
});

export const meController = asyncHandler(async (req, res) => {
  const user = await getUserById(req.user.sub);

  res.status(200).json({ success: true, data: { user: toUserDto(user) } });
});

export const logoutController = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, message: "Logged out" });
});
