import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { Session } from "../models/Session.js";
import { Venue } from "../models/Venue.js";
import { Dispute } from "../models/Dispute.js";
import { Payment } from "../models/Payment.js";
import { AppError } from "../utils/AppError.js";
import { toUserDto } from "./users.service.js";

/**
 * Lấy số liệu thống kê tổng thể toàn hệ thống cho Dashboard Quản trị
 */
export async function getDashboardStats() {
  const [
    totalUsers,
    activeUsers,
    verifiedHosts,
    adminCount,
    totalSessions,
    openSessions,
    completedSessions,
    cancelledSessions,
    totalVenues,
    courtStats,
    totalDisputes,
    pendingDisputes,
    totalPayments,
    financialStats,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    User.countDocuments({ isVerifiedHost: true }),
    User.countDocuments({ role: { $in: ["admin", "superadmin"] } }),
    Session.countDocuments(),
    Session.countDocuments({ status: { $in: ["open", "full"] } }),
    Session.countDocuments({ status: "completed" }),
    Session.countDocuments({ status: "cancelled" }),
    Venue.countDocuments(),
    Venue.aggregate([
      { $group: { _id: null, totalCourts: { $sum: "$courtCount" } } },
    ]),
    Dispute.countDocuments(),
    Dispute.countDocuments({ status: { $in: ["pending", "investigating"] } }),
    Payment.countDocuments(),
    Payment.aggregate([
      {
        $group: {
          _id: null,
          totalVolume: {
            $sum: {
              $cond: [
                { $in: ["$status", ["completed", "escrow_held"]] },
                "$amount",
                0,
              ],
            },
          },
          escrowHolding: {
            $sum: {
              $cond: [{ $eq: ["$status", "escrow_held"] }, "$amount", 0],
            },
          },
          totalRefunded: {
            $sum: {
              $cond: [{ $eq: ["$status", "refunded"] }, "$amount", 0],
            },
          },
        },
      },
    ]),
  ]);

  const recentUsers = await User.find()
    .select("name email phone role skillLevel isVerifiedHost isActive createdAt avatar")
    .sort({ createdAt: -1 })
    .limit(6)
    .lean();

  const recentSessions = await Session.find()
    .populate("host", "name email phone avatar")
    .sort({ createdAt: -1 })
    .limit(6)
    .lean();

  const recentDisputes = await Dispute.find()
    .populate("reporter", "name email phone")
    .populate("session", "title venueName datetime")
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  const recentPayments = await Payment.find()
    .populate("payer", "name email")
    .sort({ createdAt: -1 })
    .limit(6)
    .lean();

  return {
    overview: {
      users: {
        total: totalUsers,
        active: activeUsers,
        verifiedHosts,
        admins: adminCount,
      },
      sessions: {
        total: totalSessions,
        active: openSessions,
        completed: completedSessions,
        cancelled: cancelledSessions,
      },
      venues: {
        total: totalVenues,
        totalCourts: courtStats[0]?.totalCourts || 0,
      },
      disputes: {
        total: totalDisputes,
        pending: pendingDisputes,
      },
      financials: {
        totalPayments,
        totalVolume: financialStats[0]?.totalVolume || 0,
        escrowHolding: financialStats[0]?.escrowHolding || 0,
        totalRefunded: financialStats[0]?.totalRefunded || 0,
      },
    },
    recent: {
      users: recentUsers,
      sessions: recentSessions,
      disputes: recentDisputes,
      payments: recentPayments,
    },
  };
}

/**
 * Quản lý người dùng: Lấy danh sách phân trang + tìm kiếm + bộ lọc
 */
export async function getAdminUsers({
  page = 1,
  limit = 20,
  search = "",
  role = "",
  status = "",
}) {
  const query = {};

  if (search) {
    const regex = new RegExp(search.trim(), "i");
    query.$or = [{ name: regex }, { email: regex }, { phone: regex }];
  }

  if (role) {
    query.role = role;
  }

  if (status === "active") {
    query.isActive = true;
  } else if (status === "banned" || status === "inactive") {
    query.isActive = false;
  }

  const numericPage = Math.max(1, Number(page) || 1);
  const numericLimit = Math.max(1, Math.min(100, Number(limit) || 20));
  const skip = (numericPage - 1) * numericLimit;

  const [users, total] = await Promise.all([
    User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(numericLimit)
      .lean(),
    User.countDocuments(query),
  ]);

  return {
    items: users.map(toUserDto),
    pagination: {
      total,
      page: numericPage,
      limit: numericLimit,
      totalPages: Math.ceil(total / numericLimit) || 1,
    },
  };
}

/**
 * Lấy chi tiết người dùng
 */
export async function getAdminUserDetail(userId) {
  const user = await User.findById(userId).lean();
  if (!user) {
    throw new AppError("Không tìm thấy người dùng", 404);
  }

  const [hostedSessions, joinedSessions, userPayments] = await Promise.all([
    Session.find({ host: userId }).sort({ datetime: -1 }).limit(10).lean(),
    Session.find({ "players.user": userId }).sort({ datetime: -1 }).limit(10).lean(),
    Payment.find({ $or: [{ payer: userId }, { receiver: userId }] })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
  ]);

  return {
    user: toUserDto(user),
    stats: {
      hostedCount: hostedSessions.length,
      joinedCount: joinedSessions.length,
      paymentsCount: userPayments.length,
    },
    recentHosted: hostedSessions,
    recentJoined: joinedSessions,
    recentPayments: userPayments,
  };
}

/**
 * Cập nhật thông tin / vai trò / trạng thái người dùng
 */
export async function updateAdminUser(adminUserId, targetUserId, updates) {
  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    throw new AppError("Không tìm thấy người dùng", 404);
  }

  // Bảo vệ: Admin không thể tự khóa hoặc tự tước quyền của chính mình
  if (adminUserId.toString() === targetUserId.toString()) {
    if (updates.isActive === false) {
      throw new AppError("Bạn không thể tự khóa tài khoản của chính mình", 400);
    }
    if (updates.role && updates.role !== "admin" && updates.role !== "superadmin") {
      throw new AppError("Bạn không thể tự hạ quyền quản trị viên của chính mình", 400);
    }
  }

  const allowedFields = [
    "name",
    "email",
    "phone",
    "bio",
    "gender",
    "role",
    "skillLevel",
    "city",
    "district",
    "isVerifiedHost",
    "isActive",
    "reputation",
    "rating",
  ];

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      targetUser[field] = updates[field];
    }
  }

  if (updates.password && typeof updates.password === "string" && updates.password.length >= 6) {
    const salt = await bcrypt.genSalt(10);
    targetUser.password = await bcrypt.hash(updates.password, salt);
  }

  await targetUser.save();
  return toUserDto(targetUser);
}

/**
 * Xóa người dùng (người dùng bị vi phạm nghiêm trọng)
 */
export async function deleteAdminUser(adminUserId, targetUserId) {
  if (adminUserId.toString() === targetUserId.toString()) {
    throw new AppError("Bạn không thể tự xóa tài khoản của chính mình", 400);
  }

  const user = await User.findById(targetUserId);
  if (!user) {
    throw new AppError("Không tìm thấy người dùng để xóa", 404);
  }

  await User.findByIdAndDelete(targetUserId);

  return { message: `Đã xóa vĩnh viễn tài khoản người dùng ${user.name} khỏi hệ thống thành công!` };
}

/**
 * Quản lý danh sách buổi chơi (Kèo cầu lông)
 */
export async function getAdminSessions({
  page = 1,
  limit = 20,
  search = "",
  status = "",
  district = "",
}) {
  const query = {};

  if (search) {
    const regex = new RegExp(search.trim(), "i");
    query.$or = [{ title: regex }, { venueName: regex }];
  }

  if (status) {
    query.status = status;
  }

  if (district) {
    query.district = district;
  }

  const numericPage = Math.max(1, Number(page) || 1);
  const numericLimit = Math.max(1, Math.min(100, Number(limit) || 20));
  const skip = (numericPage - 1) * numericLimit;

  const [sessions, total] = await Promise.all([
    Session.find(query)
      .populate("host", "name email phone avatar")
      .populate("venue", "name address phone courtCount")
      .sort({ datetime: -1 })
      .skip(skip)
      .limit(numericLimit)
      .lean(),
    Session.countDocuments(query),
  ]);

  return {
    items: sessions,
    pagination: {
      total,
      page: numericPage,
      limit: numericLimit,
      totalPages: Math.ceil(total / numericLimit) || 1,
    },
  };
}

/**
 * Cập nhật trạng thái buổi chơi (hủy kèo, hoàn tất kèo)
 */
export async function updateAdminSessionStatus(sessionId, { status, cancelReason }) {
  const session = await Session.findById(sessionId);
  if (!session) {
    throw new AppError("Không tìm thấy buổi chơi", 404);
  }

  if (status) {
    session.status = status;
  }
  if (cancelReason !== undefined) {
    session.cancelReason = cancelReason;
  }

  if (status === "cancelled") {
    const heldPayments = await Payment.find({
      session: session._id,
      status: { $in: ["escrow_held", "pending"] },
    });

    for (const payment of heldPayments) {
      if (payment.status === "escrow_held") {
        payment.status = "refunded";
        payment.refundedAt = new Date();
        payment.refundReason = cancelReason || "Quản trị viên đã hủy buổi chơi - Tự động hoàn cọc 100%";
        await payment.save();
      } else if (payment.status === "pending") {
        payment.status = "cancelled";
        await payment.save();
      }
    }

    for (const player of session.players) {
      if (player.paymentStatus === "escrow_held") {
        player.paymentStatus = "refunded";
        player.attendanceStatus = "cancelled_refund";
      }
    }

    session.totalEscrowHeld = 0;
    session.escrowStatus = "none";
  }

  await session.save();
  return session;
}

/**
 * Xóa buổi chơi
 */
export async function deleteAdminSession(sessionId) {
  const session = await Session.findByIdAndDelete(sessionId);
  if (!session) {
    throw new AppError("Không tìm thấy buổi chơi để xóa", 404);
  }
  return { message: "Đã xóa buổi chơi thành công" };
}

/**
 * Quản lý danh sách sân cầu lông
 */
export async function getAdminVenues({
  page = 1,
  limit = 20,
  search = "",
  city = "",
  district = "",
}) {
  const query = {};

  if (search) {
    const regex = new RegExp(search.trim(), "i");
    query.$or = [{ name: regex }, { address: regex }];
  }

  if (city) query.city = city;
  if (district) query.district = district;

  const numericPage = Math.max(1, Number(page) || 1);
  const numericLimit = Math.max(1, Math.min(100, Number(limit) || 20));
  const skip = (numericPage - 1) * numericLimit;

  const [venues, total] = await Promise.all([
    Venue.find(query)
      .populate("owner", "name email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(numericLimit)
      .lean(),
    Venue.countDocuments(query),
  ]);

  return {
    items: venues,
    pagination: {
      total,
      page: numericPage,
      limit: numericLimit,
      totalPages: Math.ceil(total / numericLimit) || 1,
    },
  };
}

/**
 * Tạo mới sân cầu lông
 */
export async function createAdminVenue(venueData) {
  const venue = await Venue.create(venueData);
  return venue;
}

/**
 * Chỉnh sửa thông tin sân cầu lông
 */
export async function updateAdminVenue(venueId, venueData) {
  const venue = await Venue.findByIdAndUpdate(venueId, { $set: venueData }, { new: true });
  if (!venue) {
    throw new AppError("Không tìm thấy sân cầu lông", 404);
  }
  return venue;
}

/**
 * Xóa sân cầu lông
 */
export async function deleteAdminVenue(venueId) {
  const venue = await Venue.findByIdAndDelete(venueId);
  if (!venue) {
    throw new AppError("Không tìm thấy sân cầu lông để xóa", 404);
  }
  return { message: "Đã xóa sân cầu lông thành công" };
}

/**
 * Quản lý danh sách khiếu nại (Disputes)
 */
export async function getAdminDisputes({ page = 1, limit = 20, status = "" }) {
  const query = {};
  if (status) {
    query.status = status;
  }

  const numericPage = Math.max(1, Number(page) || 1);
  const numericLimit = Math.max(1, Math.min(100, Number(limit) || 20));
  const skip = (numericPage - 1) * numericLimit;

  const [disputes, total] = await Promise.all([
    Dispute.find(query)
      .populate("session", "title venueName datetime totalEscrowHeld escrowStatus")
      .populate("reporter", "name email phone avatar")
      .populate("reportedUser", "name email phone avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(numericLimit)
      .lean(),
    Dispute.countDocuments(query),
  ]);

  return {
    items: disputes,
    pagination: {
      total,
      page: numericPage,
      limit: numericLimit,
      totalPages: Math.ceil(total / numericLimit) || 1,
    },
  };
}

/**
 * Xử lý khiếu nại (Quyền phán quyết cao nhất của Admin)
 * action: 'refund' | 'dismiss'
 */
export async function resolveAdminDispute(disputeId, { action, resolutionNote = "" }) {
  const dispute = await Dispute.findById(disputeId);
  if (!dispute) {
    throw new AppError("Không tìm thấy khiếu nại", 404);
  }

  const session = await Session.findById(dispute.session);
  if (!session) {
    throw new AppError("Không tìm thấy buổi chơi gắn liền với khiếu nại này", 404);
  }

  if (action === "refund") {
    dispute.status = "resolved_refund";
    dispute.resolutionNote = resolutionNote || "Quản trị viên chấp thuận hoàn tiền cho người chơi";
    dispute.resolvedAt = new Date();
    await dispute.save();

    // Cập nhật trạng thái thanh toán & escrow
    session.escrowStatus = "none";
    await session.save();

    // Cập nhật các giao dịch thanh toán của người khiếu nại thành refunded
    await Payment.updateMany(
      { session: session._id, payer: dispute.reporter, status: "escrow_held" },
      { $set: { status: "refunded", refundedAt: new Date(), refundReason: resolutionNote } },
    );

    return {
      message: "Đã xử lý: Chấp thuận khiếu nại và tiến hành hoàn tiền cho người chơi",
      dispute,
    };
  } else if (action === "dismiss") {
    dispute.status = "resolved_dismissed";
    dispute.resolutionNote = resolutionNote || "Quản trị viên bác bỏ khiếu nại, giữ nguyên tiền cọc cho Host";
    dispute.resolvedAt = new Date();
    await dispute.save();

    // Mở lại trạng thái giải ngân cho Host
    session.escrowStatus = "ready_for_payout";
    await session.save();

    return {
      message: "Đã xử lý: Bác bỏ khiếu nại và mở khóa giải ngân cho Host",
      dispute,
    };
  } else {
    throw new AppError("Hành động xử lý không hợp lệ. Chỉ chấp nhận 'refund' hoặc 'dismiss'", 400);
  }
}

/**
 * Quản lý danh sách giao dịch & Escrow
 */
export async function getAdminPayments({
  page = 1,
  limit = 20,
  search = "",
  status = "",
  type = "",
}) {
  const query = {};

  if (search) {
    const regex = new RegExp(search.trim(), "i");
    query.$or = [{ orderCode: regex }, { transferContent: regex }];
  }

  if (status) query.status = status;
  if (type) query.type = type;

  const numericPage = Math.max(1, Number(page) || 1);
  const numericLimit = Math.max(1, Math.min(100, Number(limit) || 20));
  const skip = (numericPage - 1) * numericLimit;

  const [payments, total] = await Promise.all([
    Payment.find(query)
      .populate("payer", "name email phone")
      .populate("receiver", "name email phone")
      .populate("session", "title venueName datetime")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(numericLimit)
      .lean(),
    Payment.countDocuments(query),
  ]);

  return {
    items: payments,
    pagination: {
      total,
      page: numericPage,
      limit: numericLimit,
      totalPages: Math.ceil(total / numericLimit) || 1,
    },
  };
}
