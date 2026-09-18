import { Payment } from "../models/Payment.js";
import { Session } from "../models/Session.js";
import { User } from "../models/User.js";
import { Dispute } from "../models/Dispute.js";
import { AppError } from "../utils/AppError.js";
import { socketEvents } from "../utils/socketEvents.js";
import { createNotification } from "./notifications.service.js";
import { env } from "../config/env.js";
import {
  createPayOSPaymentLink,
  getPayOSPaymentStatus,
  isPayOSEnabled,
  verifyPayOSWebhook,
} from "./payos.service.js";

const POPULAR_BANKS = [
  { bin: "970426", shortName: "MSB", name: "Ngân hàng Hàng Hải (MSB)", code: "MSB" },
  { bin: "970422", shortName: "MBBank", name: "Ngân hàng Quân Đội (MB)", code: "MB" },
  { bin: "970436", shortName: "Vietcombank", name: "Ngân hàng Ngoại Thương (VCB)", code: "VCB" },
  { bin: "970407", shortName: "Techcombank", name: "Ngân hàng Kỹ Thương (TCB)", code: "TCB" },
  { bin: "970415", shortName: "VietinBank", name: "Ngân hàng Công Thương (CTG)", code: "CTG" },
  { bin: "970418", shortName: "BIDV", name: "Ngân hàng Đầu tư & Phát triển (BIDV)", code: "BIDV" },
  { bin: "970432", shortName: "VPBank", name: "Ngân hàng Việt Nam Thịnh Vượng (VPB)", code: "VPB" },
  { bin: "970416", shortName: "ACB", name: "Ngân hàng Á Châu (ACB)", code: "ACB" },
  { bin: "970423", shortName: "TPBank", name: "Ngân hàng Tiên Phong (TPB)", code: "TPB" },
  { bin: "970405", shortName: "Agribank", name: "Ngân hàng Nông nghiệp (Agribank)", code: "VBA" },
  { bin: "970448", shortName: "OCB", name: "Ngân hàng Phương Đông (OCB)", code: "OCB" },
  { bin: "970443", shortName: "SHB", name: "Ngân hàng Sài Gòn - Hà Nội (SHB)", code: "SHB" },
  { bin: "970437", shortName: "HDBank", name: "Ngân hàng Phát triển TP.HCM (HDB)", code: "HDB" },
  { bin: "970403", shortName: "Sacombank", name: "Ngân hàng Sài Gòn Thương Tín (STB)", code: "STB" },
  { bin: "546034", shortName: "VIB", name: "Ngân hàng Quốc tế (VIB)", code: "VIB" },
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

  // Generate unique numeric order code (safe integer for PayOS compatibility)
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const numericCode = Number(`${Date.now().toString().slice(-6)}${randomSuffix}`);
  const orderCode = String(numericCode);
  const transferContent = `CLVL ${orderCode}`;

  let qrCodeUrl = "";
  let bankInfo = null;
  let checkoutUrl = "";
  let gateway = "vietqr_escrow";
  let metadata = {
    sessionTitle: session.title,
    cancelPolicyHours: session.cancelPolicyHours || 12,
  };

  // Try creating PayOS payment link if enabled (hides personal identity)
  if (isPayOSEnabled()) {
    try {
      const returnUrl = `${env.clientOrigin}/sessions/${session.slug || session._id}`;
      const cancelUrl = returnUrl;
      const payosRes = await createPayOSPaymentLink({
        orderCode: numericCode,
        amount,
        description: transferContent,
        returnUrl,
        cancelUrl,
      });

      gateway = "PayOS";
      checkoutUrl = payosRes.checkoutUrl || "";
      qrCodeUrl = `https://img.vietqr.io/image/${payosRes.bin}-${payosRes.accountNumber}-compact2.png?amount=${payosRes.amount}&addInfo=${encodeURIComponent(
        payosRes.description,
      )}&accountName=${encodeURIComponent(payosRes.accountName)}`;

      bankInfo = {
        bankName: "Ngân hàng TMCP Hàng Hải (MSB - Cổng PayOS)",
        accountNumber: payosRes.accountNumber,
        accountHolder: payosRes.accountName,
        bin: payosRes.bin,
      };

      metadata = {
        ...metadata,
        payosPaymentLinkId: payosRes.paymentLinkId,
        checkoutUrl: payosRes.checkoutUrl,
        rawQrCode: payosRes.qrCode,
        payosOrderCode: numericCode,
      };
    } catch (payosError) {
      console.error(
        "Lỗi tạo link PayOS, tự động chuyển về VietQR dự phòng:",
        payosError.message,
      );
    }
  }

  // Fallback to direct MSB VietQR if PayOS is inactive or fails
  if (!bankInfo) {
    const escrowBankBin = env.escrowBankBin || "970426";
    const escrowAccountNo = env.escrowAccountNo || "04201015822962";
    const escrowAccountName = env.escrowAccountName || "HOÀNG HỮU TOÀN";
    const escrowBankName = env.escrowBankName || "MSB (Ngân hàng Hàng Hải)";

    const qrAccountName = escrowAccountName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toUpperCase();

    qrCodeUrl = `https://img.vietqr.io/image/${escrowBankBin}-${escrowAccountNo}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(
      transferContent,
    )}&accountName=${encodeURIComponent(qrAccountName)}`;

    bankInfo = {
      bankName: escrowBankName,
      accountNumber: escrowAccountNo,
      accountHolder: escrowAccountName,
      bin: escrowBankBin,
    };
  }

  const payment = await Payment.create({
    orderCode,
    session: session._id,
    payer: user._id,
    receiver: session.host._id,
    amount,
    type: "deposit",
    paymentMethod: "vietqr_escrow",
    gateway,
    status: "pending",
    transferContent: metadata.payosOrderCode ? `CLVL ${orderCode}` : transferContent,
    qrCodeUrl,
    metadata,
  });

  // Mark player payment status as pending
  participant.paymentStatus = "pending";
  await session.save();

  return {
    payment,
    orderCode,
    amount,
    transferContent: payment.transferContent,
    qrCodeUrl,
    checkoutUrl,
    bankInfo,
    cancelPolicyHours: session.cancelPolicyHours || 12,
  };
}

export async function confirmEscrowPayment({
  orderCode,
  userId,
  proofImage = "",
  bankTransactionId = "",
  io = null,
}) {
  const payment = await Payment.findOne({ orderCode });
  if (!payment) {
    throw new AppError("Không tìm thấy đơn thanh toán", 404);
  }

  if (userId && payment.payer.toString() !== userId) {
    throw new AppError("Bạn không có quyền xác nhận đơn này", 403);
  }

  if (payment.status === "escrow_held" || payment.status === "completed") {
    return { success: true, payment, message: "Đơn đã được xác nhận trước đó" };
  }

  // Chống gian lận: Nếu người dùng tự bấm xác nhận, hệ thống BẮT BUỘC phải tra soát với PayOS / Ngân hàng
  // Tuyệt đối không cho phép tự đánh dấu đã cọc khi chưa thực nhận được tiền!
  if (userId) {
    if (isPayOSEnabled() || payment.gateway === "PayOS") {
      const payosStatus = await getPayOSPaymentStatus(payment.orderCode);
      if (!payosStatus || payosStatus.status !== "PAID") {
        throw new AppError(
          "Hệ thống chưa ghi nhận tiền chuyển khoản cho đơn hàng này. Nếu bạn vừa chuyển trên App ngân hàng, vui lòng đợi 5-10 giây để hệ thống đối soát hoặc kiểm tra lại nội dung chuyển khoản!",
          400,
        );
      }
      if (payosStatus.transactions?.[0]?.reference) {
        bankTransactionId = String(payosStatus.transactions[0].reference);
      }
    } else {
      throw new AppError(
        "Hệ thống đang đối soát giao dịch ngân hàng. Vui lòng đợi ngân hàng ghi nhận tiền.",
        400,
      );
    }
  }

  payment.status = "escrow_held";
  payment.paidAt = new Date();
  if (proofImage) payment.proofImage = proofImage;
  if (bankTransactionId) payment.bankTransactionId = bankTransactionId;
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

    // Socket real-time broadcast
    if (io) {
      io.to(`session:${session._id}`).emit(socketEvents.paymentUpdated, {
        orderCode: payment.orderCode,
        sessionId: session._id,
        payerId: payment.payer,
        status: "escrow_held",
        amount: payment.amount,
      });
      io.to(`session:${session._id}`).emit(socketEvents.sessionUpdated, {
        sessionId: session._id,
        action: "payment_confirmed",
      });
    }
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

export async function getPaymentByOrderCode(orderCode, userId = null, io = null) {
  let payment = await Payment.findOne({ orderCode })
    .populate("payer", "name email avatar reputation")
    .populate("receiver", "name email avatar bankAccount")
    .populate(
      "session",
      "title datetime venueName district city totalEscrowHeld escrowStatus checkInCode cancelPolicyHours",
    );

  if (!payment) {
    throw new AppError("Không tìm thấy đơn thanh toán", 404);
  }

  // Real-time PayOS status check: automatically confirm when user pays
  if (payment.status === "pending" && isPayOSEnabled()) {
    try {
      const payosStatus = await getPayOSPaymentStatus(orderCode);
      if (payosStatus && payosStatus.status === "PAID") {
        await confirmEscrowPayment({
          orderCode,
          userId: null,
          proofImage: "",
          bankTransactionId: String(
            payosStatus.transactions?.[0]?.reference || "PAYOS_AUTO_CONFIRM",
          ),
          io,
        });

        payment = await Payment.findOne({ orderCode })
          .populate("payer", "name email avatar reputation")
          .populate("receiver", "name email avatar bankAccount")
          .populate(
            "session",
            "title datetime venueName district city totalEscrowHeld escrowStatus checkInCode cancelPolicyHours",
          );
      }
    } catch (pollErr) {
      // Continue without interrupting
    }
  }

  return payment;
}

export async function handlePaymentWebhook({ body = {}, headers = {}, io = null }) {
  // 1. PayOS webhook format with cryptographic signature verification
  if (body.data && body.signature && isPayOSEnabled()) {
    try {
      const verifiedData = await verifyPayOSWebhook(body);
      if (verifiedData && verifiedData.orderCode) {
        const orderCode = String(verifiedData.orderCode);
        const confirmResult = await confirmEscrowPayment({
          orderCode,
          userId: null,
          proofImage: "",
          bankTransactionId: String(verifiedData.reference || "PAYOS_WEBHOOK"),
          io,
        });
        return { success: true, message: "PayOS webhook processed", orderCode, confirmResult };
      }
    } catch (payosWebhookErr) {
      console.error("PayOS webhook verification failed:", payosWebhookErr.message);
    }
  }

  // Support SePAY, Casso, and generic VietQR payment gateways
  let content = "";
  let amount = 0;
  let reference = "";
  let gateway = "vietqr_webhook";

  // 2. SePAY format
  if (body.transferContent || body.content) {
    content = String(body.transferContent || body.content || "");
    amount = Number(body.transferAmount || body.amount || 0);
    reference = String(body.referenceCode || body.id || "");
    gateway = body.gateway || "SePAY";
  }
  // 3. Casso format
  else if (body.data && Array.isArray(body.data) && body.data.length > 0) {
    const first = body.data[0] || {};
    content = String(first.description || "");
    amount = Number(first.amount || 0);
    reference = String(first.tid || first.id || "");
    gateway = "Casso";
  }
  // 4. PayOS unverified / raw format
  else if (body.data && (body.data.orderCode || body.data.description)) {
    content = String(body.data.description || body.data.orderCode || "");
    amount = Number(body.data.amount || 0);
    reference = String(body.data.reference || "");
    gateway = "PayOS";
  }
  // 5. Generic / custom format
  else {
    content = String(body.description || body.addInfo || body.orderCode || "");
    amount = Number(body.amount || body.transferAmount || 0);
    reference = String(body.reference || body.code || body.transactionId || "");
  }

  if (!content) {
    return { success: false, message: "Không tìm thấy nội dung chuyển khoản trong webhook" };
  }

  // Extract CLVL code (e.g. CLVL12345678 or CLVL 12345678)
  const match = content.match(/CLVL\s*([A-Z0-9]+)/i);
  if (!match) {
    return { success: false, message: "Không tìm thấy mã đơn CLVL trong nội dung chuyển khoản" };
  }

  const extractedCode = match[0].replace(/\s+/g, "").toUpperCase();
  const payment = await Payment.findOne({
    $or: [
      { orderCode: extractedCode },
      { orderCode: new RegExp(`^${extractedCode}$`, "i") },
      { transferContent: new RegExp(extractedCode, "i") },
    ],
  });

  if (!payment) {
    return {
      success: false,
      message: `Không tìm thấy đơn hàng mã ${extractedCode} trong hệ thống`,
    };
  }

  if (payment.status === "escrow_held" || payment.status === "completed") {
    return {
      success: true,
      message: "Đơn hàng đã được xác nhận thanh toán trước đó",
      orderCode: payment.orderCode,
    };
  }

  // Check amount
  if (amount > 0 && amount < payment.amount) {
    payment.metadata = {
      ...payment.metadata,
      partialReceivedAmount: amount,
      gateway,
    };
    await payment.save();
    return {
      success: false,
      message: `Số tiền chuyển ${amount}đ nhỏ hơn số tiền cọc yêu cầu ${payment.amount}đ`,
    };
  }

  // Confirm escrow payment automatically
  return confirmEscrowPayment({
    orderCode: payment.orderCode,
    userId: null,
    proofImage: "",
    bankTransactionId: reference,
    io,
  });
}

export async function releasePayoutToHost({ sessionId, hostId, io = null }) {
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
    return { success: true, message: "Quỹ ký quỹ đã được giải ngân trước đó", session };
  }

  // Validate Host Bank Account
  const host = await User.findById(hostId);
  if (!host || !host.bankAccount?.accountNumber?.trim()) {
    throw new AppError(
      "Bạn chưa cài đặt tài khoản ngân hàng nhận tiền. Vui lòng cập nhật thông tin ngân hàng trong trang cá nhân trước khi giải ngân!",
      400,
    );
  }

  const payoutAmount = session.totalEscrowHeld || 0;
  if (payoutAmount <= 0) {
    throw new AppError("Không có tiền trong quỹ ký quỹ để giải ngân", 400);
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

  // Generate VietQR for Host Payout
  const bankEntry = POPULAR_BANKS.find(
    (b) =>
      b.code === host.bankAccount.bankId ||
      b.bin === host.bankAccount.bankId ||
      b.shortName?.toLowerCase() === (host.bankAccount.bankId || "").toLowerCase(),
  );
  const hostBankBin = bankEntry?.bin || host.bankAccount.bankId || "970426";
  const hostAccountNo = host.bankAccount.accountNumber;
  const hostAccountHolder = host.bankAccount.accountHolder || host.name;
  const payoutTransferContent = `CLVL PAYOUT ${session.slug || session._id.toString().slice(-6)}`;
  const payoutQrUrl = `https://img.vietqr.io/image/${hostBankBin}-${hostAccountNo}-compact2.png?amount=${payoutAmount}&addInfo=${encodeURIComponent(
    payoutTransferContent,
  )}&accountName=${encodeURIComponent(hostAccountHolder)}`;

  // Create Payout Payment record for auditing
  const payoutOrderCode = `PAYOUT${Date.now().toString().slice(-6)}${Math.floor(1000 + Math.random() * 9000)}`;
  const payoutRecord = await Payment.create({
    orderCode: payoutOrderCode,
    session: session._id,
    payer: hostId,
    receiver: hostId,
    amount: payoutAmount,
    type: "payout",
    paymentMethod: "vietqr_escrow",
    status: "completed",
    transferContent: payoutTransferContent,
    qrCodeUrl: payoutQrUrl,
    paidAt: new Date(),
    payoutBankInfo: {
      bankId: host.bankAccount.bankId,
      bankName: host.bankAccount.bankName,
      accountNumber: host.bankAccount.accountNumber,
      accountHolder: hostAccountHolder,
    },
    metadata: {
      sessionTitle: session.title,
    },
  });

  await createNotification({
    recipient: hostId,
    type: "system",
    title: "Giải ngân tiền cọc thành công!",
    message: `Đã giải ngân ${payoutAmount.toLocaleString()}đ về tài khoản ${host.bankAccount.bankName} (${host.bankAccount.accountNumber}).`,
    session: session._id,
  });

  if (io) {
    io.to(`session:${session._id}`).emit(socketEvents.sessionUpdated, {
      sessionId: session._id,
      action: "escrow_payout_released",
    });
  }

  return {
    success: true,
    message: `Giải ngân thành công ${payoutAmount.toLocaleString()}đ về tài khoản ${host.bankAccount.bankName} (${host.bankAccount.accountNumber})!`,
    totalEscrowHeld: payoutAmount,
    session,
    payoutRecord,
    hostBank: host.bankAccount,
  };
}

export async function getSessionPayments(sessionId) {
  const payments = await Payment.find({ session: sessionId })
    .populate("payer", "name avatar reputation")
    .sort({ createdAt: -1 });

  return payments;
}

export async function getMyPayments(userId) {
  const payments = await Payment.find({
    $or: [{ payer: userId }, { receiver: userId }],
  })
    .populate("session", "title datetime venueName district city status coverImage")
    .populate("payer", "name avatar email phone")
    .populate("receiver", "name avatar email phone")
    .sort({ createdAt: -1 })
    .limit(50);

  return payments;
}
