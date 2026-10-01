import { AppError } from "../utils/AppError.js";
import { User } from "../models/User.js";

export async function requireAdmin(req, res, next) {
  try {
    if (!req.user || !req.user.sub) {
      return next(new AppError("Yêu cầu xác thực tài khoản", 401));
    }

    const user = await User.findById(req.user.sub);
    if (!user) {
      return next(new AppError("Không tìm thấy thông tin tài khoản người dùng", 404));
    }

    if (!user.isActive) {
      return next(new AppError("Tài khoản này đã bị vô hiệu hóa hoặc khóa", 403));
    }

    const hasAdminRole = user.role === "admin" || user.role === "superadmin";
    if (!hasAdminRole) {
      return next(
        new AppError(
          "Truy cập bị từ chối: Chỉ tài khoản Quản trị viên (Admin) mới có quyền thực hiện",
          403,
        ),
      );
    }

    req.adminUser = user;
    return next();
  } catch (error) {
    return next(error);
  }
}
