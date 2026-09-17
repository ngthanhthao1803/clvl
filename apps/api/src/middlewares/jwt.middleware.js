import { AppError } from "../utils/AppError.js";
import { verifyJwt } from "../utils/token.js";

export function authenticateJwt(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return next(new AppError("Authentication required", 401));
  }

  try {
    req.user = verifyJwt(token);
    return next();
  } catch (error) {
    return next(new AppError("Invalid or expired token", 401));
  }
}
