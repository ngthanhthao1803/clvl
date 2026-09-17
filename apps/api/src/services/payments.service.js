import { Payment } from "../models/Payment.js";
import { Session } from "../models/Session.js";
import { User } from "../models/User.js";
import { Dispute } from "../models/Dispute.js";
import { AppError } from "../utils/AppError.js";
import { createNotification } from "./notifications.service.js";

const POPULAR_BANKS = [
  { bin: "970422", shortName: "MBBank", name: "Ngân hàng Quân Đội", code: "MB" },
  { bin: "970436", shortName: "Vietcombank", name: "Ngân hàng Ngoại Thương", code: "VCB" },
  { bin: "970407", shortName: "Techcombank", name: "Ngân hàng Kỹ Thương", code: "TCB" },
  { bin: "970415", shortName: "VietinBank", name: "Ngân hàng Công Thương", code: "CTG" },
  { bin: "970418", shortName: "BIDV", name: "Ngân hàng Đầu tư & Phát triển", code: "BIDV" },
  { bin: "970432", shortName: "VPBank", name: "Ngân hàng Việt Nam Thịnh Vượng", code: "VPB" },
  { bin: "970416", shortName: "ACB", name: "Ngân hàng Á Châu", code: "ACB" },
  { bin: "970423", shortName: "TPBank", name: "Ngân hàng Tiên Phong", code: "TPB" },
];

export function getBanksList() {
  return POPULAR_BANKS;
}

export async function createDepositOrder({ sessionId, userId }) {
  const session = await Session.findById(sessionId).populate("host");
  if (!session) {
    throw new AppError("Không tìm thấy buổi chơi", 404);
  }

  if (session.status === "cancelled") {
    throw new AppError("Buổi chơi đã bị hủy", 400);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("Người dùng không tồn tại", 404);
  }

  const participant = session.players.find(
    (p) => p.user.toString() === userId && p.status !== "left",
  );
  if (!participant) {
    throw new AppError("Bạn cần đăng ký tham gia buổi chơi trước khi đặt cọc", 400);
  }

  if (
    participant.paymentStatus === "escrow_held" ||
    participant.paymentStatus === "paid"
  ) {
    throw new AppError("Bạn đã hoàn tất đặt cọc cho buổi chơi này", 400);
  }

  const amount =
    session.depositAmount && session.depositAmount > 0
      ? session.depositAmount
      : session.price && session.price > 0
        ? Math.min(session.price, 50000)
        : 50000;

  // Generate unique order code
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderCode = `CLVL${Date.now().toString().slice(-6)}${randomSuffix}`;
  const transferContent = `CLVL ${orderCode}`;

  // VietQR generation (using platform escrow bank account format)
  const escrowBankBin = "970422"; // MBBank
  const escrowAccountNo = "0988888888"; // CLVL Escrow Account
  const escrowAccountName = "CLVL ESCROW VIETNAM";

  const qrCodeUrl = `https://img.vietqr.io/image/${escrowBankBin}-${escrowAccountNo}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(
    transferContent,
  )}&accountName=${encodeURIComponent(escrowAccountName)}`;

  const payment = await Payment.create({
    orderCode,
    session: session._id,
    payer: user._id,
    receiver: session.host._id,
    amount,
    type: "deposit",
    paymentMethod: "vietqr_escrow",
    status: "pending",
    transferContent,
    qrCodeUrl,
    metadata: {
      sessionTitle: session.title,
      cancelPolicyHours: session.cancelPolicyHours || 12,
    },
  });

  // Mark player payment status as pending
  participant.paymentStatus = "pending";
  await session.save();

  return {
    payment,
    orderCode,
    amount,
    transferContent,
    qrCodeUrl,
    bankInfo: {
      bankName: "MBBank (Ngân hàng Quân Đội)",
      accountNumber: escrowAccountNo,
      accountHolder: escrowAccountName,
      bin: escrowBankBin,
    },
    cancelPolicyHours: session.cancelPolicyHours || 12,
  };
}

export async function confirmEscrowPayment({ orderCode, userId }) {
  const payment = await Payment.findOne({ orderCode });
  if (!payment) {
    throw new AppError("Không tìm thấy đơn thanh toán", 404);
  }

  if (payment.payer.toString() !== userId) {
    throw new AppError("Bạn không có quyền xác nhận đơn này", 403);
  }

  if (payment.status === "escrow_held" || payment.status === "completed") {
    return { success: true, payment, message: "Đơn đã được xác nhận trước đó" };
  }

  payment.status = "escrow_held";
  payment.paidAt = new Date();
  await payment.save();

  const session = await Session.findById(payment.session);
  if (session) {
    const participant = session.players.find(
      (p) => p.user.toString() === payment.payer.toString(),
    );
    if (participant) {
      participant.paymentStatus = "escrow_held";
      participant.paidAmount = payment.amount;
      // Auto promote pending player to joined upon deposit
      if (participant.status === "pending") {
        participant.status = "joined";
        session.currentPlayersCount = (session.currentPlayersCount || 0) + 1;
        if (session.currentPlayersCount >= session.maxPlayers) {
          session.status = "full";
        }
      }
    }

    session.totalEscrowHeld = (session.totalEscrowHeld || 0) + payment.amount;
    if (session.escrowStatus === "none") {
      session.escrowStatus = "holding";
    }
    await session.save();

    // Notify player
    await createNotification({
      recipient: payment.payer,
      type: "system",
      title: "Đặt cọc giữ chỗ thành công!",
      message: `Bạn đã cọc ${payment.amount.toLocaleString()}đ cho buổi chơi "${session.title}". Tiền được bảo vệ bởi CLVL Escrow.`,
      session: session._id,
    });

    // Notify host
    await createNotification({
      recipient: session.host,
      actor: payment.payer,
      type: "session_joined",
      title: "Thành viên đã đặt cọc giữ chỗ",
      message: `Một người chơi đã đặt cọc ${payment.amount.toLocaleString()}đ cho "${session.title}".`,
      session: session._id,
    });
  }

  return { success: true, payment, session };
}

export async function cancelBookingWithRefund({ sessionId, userId, reason = "" }) {
  const session = await Session.findById(sessionId);
  if (!session) {
    throw new AppError("Không tìm thấy buổi chơi", 404);
  }

  const participant = session.players.find(
    (p) => p.user.toString() === userId && p.status !== "left",
  );
  if (!participant) {
    throw new AppError("Bạn không tham gia buổi chơi này", 400);
  }

  if (session.host.toString() === userId) {
    throw new AppError("Host không thể hủy tham gia, hãy chọn hủy toàn bộ buổi chơi", 400);
  }

  const policyHours = session.cancelPolicyHours || 12;
  const matchTime = new Date(session.datetime).getTime();
  const now = Date.now();
  const diffHours = (matchTime - now) / (1000 * 60 * 60);

  const payment = await Payment.findOne({
    session: session._id,
    payer: userId,
    status: "escrow_held",
  });

  const isEligibleForFullRefund = diffHours >= policyHours;

  if (isEligibleForFullRefund) {
    // 100% refund
    if (payment) {
      payment.status = "refunded";
      payment.refundedAt = new Date();
      payment.refundReason = reason || `Hủy trước ${policyHours}h (Đạt điều kiện hoàn 100%)`;
      await payment.save();
      session.totalEscrowHeld = Math.max(0, (session.totalEscrowHeld || 0) - payment.amount);
    }

    participant.status = "left";
    participant.attendanceStatus = "cancelled_refund";
    participant.paymentStatus = "refunded";

    await createNotification({
      recipient: userId,
      type: "system",
      title: "Hủy slot thành công (Hoàn cọc 100%)",
      message: `Bạn đã hủy trước thời hạn quy định. Khoản cọc đã được hoàn lại đầy đủ.`,
      session: session._id,
    });

    await createNotification({
      recipient: session.host,
      type: "system",
      title: "Thành viên hủy slot trước hạn",
      message: `Một người chơi đã hủy slot buổi "${session.title}". Slot đã được mở lại cho người khác.`,
      session: session._id,
    });
  } else {
    // Penalty: Last-minute cancellation / No-show
    if (payment) {
      payment.status = "forfeited_to_host";
      payment.refundReason = `Hủy sát giờ (< ${policyHours}h) - Tiền cọc được bồi thường cho Host`;
      await payment.save();
    }

    // Deduct reputation
    await User.findByIdAndUpdate(userId, {
      $inc: { reputation: -15 },
    });

    participant.status = "left";
    participant.attendanceStatus = "no_show";
    participant.paymentStatus = "forfeited";

    await createNotification({
      recipient: userId,
      type: "system",
      title: "Hủy slot muộn - Mất cọc & Trừ điểm uy tín",
      message: `Bạn hủy sát giờ (< ${policyHours}h). Tiền cọc được bồi thường tiền sân cho Host và bạn bị trừ 15 điểm uy tín.`,
      session: session._id,
    });

    await createNotification({
      recipient: session.host,
      type: "system",
      title: "Thành viên hủy muộn - Đã giữ cọc đền bù",
      message: `Một người chơi đã hủy sát giờ. Tiền cọc của người này sẽ được giải ngân đền bù cho bạn.`,
      session: session._id,
    });
  }

  // Update session counts
  session.currentPlayersCount = Math.max(1, (session.currentPlayersCount || 1) - 1);
  if (session.status === "full") {
    session.status = "open";
  }
  await session.save();

  return {
    success: true,
    isFullRefund: isEligibleForFullRefund,
    diffHours: Math.round(diffHours * 10) / 10,
    policyHours,
    refundAmount: isEligibleForFullRefund && payment ? payment.amount : 0,
    penaltyApplied: !isEligibleForFullRefund,
  };
}

export async function checkInPlayer({ sessionId, userId, checkInCode }) {
  const session = await Session.findById(sessionId);
  if (!session) {
    throw new AppError("Không tìm thấy buổi chơi", 404);
  }

  if (!checkInCode || session.checkInCode?.trim() !== checkInCode.trim()) {
    throw new AppError("Mã Check-in không chính xác. Vui lòng xem mã từ Host tại sân!", 400);
  }

  const participant = session.players.find(
    (p) => p.user.toString() === userId && p.status !== "left",
  );
  if (!participant) {
    throw new AppError("Bạn không có trong danh sách thành viên của buổi chơi", 400);
  }

  if (participant.attendanceStatus === "attended") {
    return { success: true, message: "Bạn đã check-in trước đó", session };
  }

  participant.attendanceStatus = "attended";
  participant.checkInAt = new Date();
  await session.save();

  const user = await User.findById(userId);

  await createNotification({
    recipient: session.host,
    type: "system",
    title: "Thành viên đã check-in tại sân",
    message: `${user?.name || "Người chơi"} đã check-in thành công tại sân.`,
    session: session._id,
  });

  return { success: true, message: "Check-in thành công! Chúc bạn có buổi chơi vui vẻ.", session };
}

export async function markPlayerNoShow({ sessionId, hostId, targetUserId }) {
  const session = await Session.findById(sessionId);
  if (!session) {
    throw new AppError("Không tìm thấy buổi chơi", 404);
  }

  if (session.host.toString() !== hostId) {
    throw new AppError("Chỉ Host mới có quyền báo cáo thành viên vắng mặt", 403);
  }

  const participant = session.players.find(
    (p) => p.user.toString() === targetUserId && p.status !== "left",
  );
  if (!participant) {
    throw new AppError("Người chơi không tồn tại trong buổi chơi này", 404);
  }

  participant.attendanceStatus = "no_show";
  participant.paymentStatus = "forfeited";

  const payment = await Payment.findOne({
    session: session._id,
    payer: targetUserId,
    status: "escrow_held",
  });
  if (payment) {
    payment.status = "forfeited_to_host";
    payment.refundReason = "Host báo cáo bùng kèo không lý do (No-show)";
    await payment.save();
  }

  // Deduct 25 reputation points
  await User.findByIdAndUpdate(targetUserId, {
    $inc: { reputation: -25 },
  });

  await session.save();

  await createNotification({
    recipient: targetUserId,
    type: "system",
    title: "Cảnh báo: Báo cáo bùng kèo (No-show)",
    message: `Bạn bị Host báo cáo vắng mặt không lý do tại "${session.title}". Bạn bị mất tiền cọc và bị trừ 25 điểm uy tín.`,
    session: session._id,
  });

  return { success: true, message: "Đã đánh dấu người chơi vắng mặt thành công", session };
}

export async function reportDispute({
  sessionId,
  reporterId,
  type,
  reason,
  evidenceImages = [],
}) {
  const session = await Session.findById(sessionId);
  if (!session) {
    throw new AppError("Không tìm thấy buổi chơi", 404);
  }

  const reportedUser = session.host._id;

  // Create dispute record
  const dispute = await Dispute.create({
    session: session._id,
    reporter: reporterId,
    reportedUser,
    type,
    reason,
    evidenceImages,
    status: "pending",
  });

  // Freeze escrow payout immediately!
  session.escrowStatus = "disputed";
  await session.save();

  await createNotification({
    recipient: session.host,
    type: "system",
    title: "Buổi chơi có khiếu nại đang được xử lý",
    message: `Thành viên đã báo cáo vấn đề về buổi chơi "${session.title}". Quỹ ký quỹ tạm thời đóng băng để xác minh.`,
    session: session._id,
  });

  return {
    success: true,
    message: "Khiếu nại của bạn đã được tiếp nhận. Hệ thống đã phong tỏa tiền ký quỹ để bảo vệ bạn.",
    dispute,
  };
}

export async function releasePayoutToHost({ sessionId, hostId }) {
  const session = await Session.findById(sessionId);
  if (!session) {
    throw new AppError("Không tìm thấy buổi chơi", 404);
  }

  if (session.host.toString() !== hostId) {
    throw new AppError("Chỉ Host của buổi chơi mới có thể yêu cầu giải ngân", 403);
  }

  if (session.escrowStatus === "disputed") {
    throw new AppError("Buổi chơi đang có khiếu nại (Dispute), không thể giải ngân lúc này!", 400);
  }

  if (session.escrowStatus === "paid_out") {
    return { success: true, message: "Quỹ ký quỹ đã được giải ngân trước đó" };
  }

  session.escrowStatus = "paid_out";
  session.status = "completed";
  await session.save();

  // Award host reputation and count
  await User.findByIdAndUpdate(hostId, {
    $inc: { hostedMatchesCount: 1, reputation: 3 },
  });

  // Mark all held payments as completed
  await Payment.updateMany(
    { session: session._id, status: { $in: ["escrow_held", "forfeited_to_host"] } },
    { $set: { status: "completed", escrowReleasedAt: new Date() } },
  );

  return {
    success: true,
    message: "Giải ngân thành công vào tài khoản của Host!",
    totalEscrowHeld: session.totalEscrowHeld,
  };
}

export async function getSessionPayments(sessionId) {
  const payments = await Payment.find({ session: sessionId })
    .populate("payer", "name avatar reputation")
    .sort({ createdAt: -1 });

  return payments;
}
