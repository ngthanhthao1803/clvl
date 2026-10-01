import dotenv from "dotenv";
dotenv.config({ path: new URL("../.env", import.meta.url) });

import mongoose from "mongoose";
import { connectDb } from "../src/config/db.js";
import { User } from "../src/models/User.js";
import { Session } from "../src/models/Session.js";
import { Payment } from "../src/models/Payment.js";
import { Venue } from "../src/models/Venue.js";
import {
  createSession,
  cancelSession,
} from "../src/services/sessions.service.js";
import {
  createDepositOrder,
  confirmEscrowPayment,
  cancelBookingWithRefund,
  releasePayoutToHost,
} from "../src/services/payments.service.js";

async function runTests() {
  console.log("=== BẮT ĐẦU KIỂM THỬ TOÀN DIỆN CƠ CHẾ CỌC & ESCROW ===");
  await connectDb();

  // 1. Chuẩn bị hoặc tìm User & Venue
  let testHost = await User.findOne({ email: "testhost_deposit@clvl.vn" });
  if (!testHost) {
    testHost = await User.create({
      name: "Test Host Deposit",
      email: "testhost_deposit@clvl.vn",
      password: "TestPassword123!",
      phone: "0900000001",
      reputation: 100,
      bankAccount: {
        bankId: "MB",
        accountNumber: "0900000001",
        accountHolder: "TEST HOST DEPOSIT",
      },
    });
  } else {
    testHost.bankAccount = {
      bankId: "MB",
      accountNumber: "0900000001",
      accountHolder: "TEST HOST DEPOSIT",
    };
    await testHost.save();
  }

  let testPlayer = await User.findOne({ email: "testplayer_deposit@clvl.vn" });
  if (!testPlayer) {
    testPlayer = await User.create({
      name: "Test Player Deposit",
      email: "testplayer_deposit@clvl.vn",
      password: "TestPassword123!",
      phone: "0900000002",
      reputation: 100,
    });
  } else {
    // Reset uy tín về 100
    testPlayer.reputation = 100;
    await testPlayer.save();
  }

  let testVenue = await Venue.findOne();
  if (!testVenue) {
    testVenue = await Venue.create({
      name: "Sân Cầu Lông Test Escrow",
      address: "123 Đường Cầu Lông, Quận 1",
      city: "Hồ Chí Minh",
      pricePerHour: 100000,
      courtCount: 4,
    });
  }

  const createdSessionIds = [];

  try {
    // ==========================================
    // TEST 1: HOST TẠO KÈO KHÔNG CẦN CỌC
    // ==========================================
    console.log("\n--- TEST 1: Kèo KHÔNG CẦN CỌC (depositRequired: false) ---");
    const sessionNoDeposit = await createSession(testHost._id, {
      title: "Test Kèo Miễn Cọc",
      venueId: testVenue._id,
      venueName: testVenue.name || "Sân Test Cầu Lông",
      district: "Quận 1",
      city: "Hồ Chí Minh",
      datetime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      duration: 120,
      maxPlayers: 4,
      matchType: "doubles",
      depositRequired: false,
      depositAmount: 50000, // Thử gửi 50k để xem backend có ép về 0 không
    });
    createdSessionIds.push(sessionNoDeposit._id);

    if (sessionNoDeposit.depositAmount !== 0) {
      throw new Error(`FAIL: depositAmount phải là 0 khi depositRequired = false, nhưng nhận được: ${sessionNoDeposit.depositAmount}`);
    }
    console.log("✓ Session không cọc ép depositAmount về 0 thành công.");

    // Thử tạo đơn cọc cho kèo này -> Phải throw 400
    let rejectedDeposit = false;
    try {
      await createDepositOrder({
        sessionId: sessionNoDeposit._id,
        userId: testPlayer._id,
      });
    } catch (err) {
      if (err.message.includes("không yêu cầu đặt cọc")) {
        rejectedDeposit = true;
      }
    }
    if (!rejectedDeposit) {
      throw new Error("FAIL: Buổi chơi không cọc nhưng hệ thống vẫn cho phép tạo đơn cọc!");
    }
    console.log("✓ Hệ thống đã chặn thành công việc tạo đơn cọc cho buổi chơi miễn cọc.");

    // Player tham gia và sau đó hủy
    await Session.findByIdAndUpdate(sessionNoDeposit._id, {
      $push: { players: { user: testPlayer._id, status: "joined" } },
      $set: { currentPlayersCount: 2 },
    });

    const cancelRes1 = await cancelBookingWithRefund({
      sessionId: sessionNoDeposit._id,
      userId: testPlayer._id.toString(),
      reason: "Bận việc",
    });
    if (cancelRes1.refundAmount !== 0 || cancelRes1.hadDeposit !== false) {
      throw new Error("FAIL: Kèo không cọc nhưng kết quả hủy lại báo có hoàn tiền!");
    }
    console.log("✓ Người chơi hủy slot trên kèo không cọc chuẩn xác: không hoàn cọc ảo, không bồi thường ảo.");

    // ==========================================
    // TEST 2: KÈO CÓ CỌC - HỦY TRƯỚC HẠN (HOÀN CỌC 100%)
    // ==========================================
    console.log("\n--- TEST 2: Kèo CÓ CỌC - Hủy trước hạn >= 12h (Hoàn cọc 100%) ---");
    const sessionWithDeposit = await createSession(testHost._id, {
      title: "Test Kèo Có Cọc Hủy Sớm",
      venueId: testVenue._id,
      venueName: testVenue.name || "Sân Test Cầu Lông",
      district: "Quận 1",
      city: "Hồ Chí Minh",
      datetime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h nữa (lớn hơn 12h)
      duration: 120,
      maxPlayers: 4,
      matchType: "doubles",
      depositRequired: true,
      depositAmount: 50000,
      cancelPolicyHours: 12,
    });
    createdSessionIds.push(sessionWithDeposit._id);

    // Thêm player vào session với status pending
    await Session.findByIdAndUpdate(sessionWithDeposit._id, {
      $push: { players: { user: testPlayer._id, status: "pending" } },
    });

    // Tạo đơn cọc
    const orderData = await createDepositOrder({
      sessionId: sessionWithDeposit._id,
      userId: testPlayer._id,
    });
    console.log(`✓ Tạo đơn cọc thành công với mã: ${orderData.orderCode}, số tiền: ${orderData.amount}đ`);

    // Giả lập đối soát nộp cọc thành công (confirmPayment từ Webhook / Ngân hàng)
    await confirmEscrowPayment({ orderCode: orderData.orderCode });
    
    // Kiểm tra sau khi nộp cọc
    const afterDepositSession = await Session.findById(sessionWithDeposit._id);
    const playerInSession = afterDepositSession.players.find(p => p.user.toString() === testPlayer._id.toString());
    
    if (afterDepositSession.totalEscrowHeld !== 50000) {
      throw new Error(`FAIL: totalEscrowHeld phải là 50000, nhưng là: ${afterDepositSession.totalEscrowHeld}`);
    }
    if (playerInSession.status !== "joined" || playerInSession.paymentStatus !== "escrow_held") {
      throw new Error("FAIL: Player chưa được tự động promote lên joined và escrow_held sau khi cọc!");
    }
    console.log("✓ Nộp cọc thành công: Tiền vào quỹ Escrow và Player tự động chuyển sang 'joined'.");

    // Player hủy trước hạn 12h (hiện tại còn 24h)
    const cancelRes2 = await cancelBookingWithRefund({
      sessionId: sessionWithDeposit._id,
      userId: testPlayer._id.toString(),
      reason: "Bận đột xuất",
    });

    if (!cancelRes2.isFullRefund || cancelRes2.refundAmount !== 50000) {
      throw new Error(`FAIL: Hủy trước 24h (hạn 12h) phải được hoàn 100% cọc! Nhận: ${JSON.stringify(cancelRes2)}`);
    }

    const afterCancelSession = await Session.findById(sessionWithDeposit._id);
    const updatedPayment = await Payment.findOne({ orderCode: orderData.orderCode });
    if (updatedPayment.status !== "refunded" || afterCancelSession.totalEscrowHeld !== 0) {
      throw new Error("FAIL: Trạng thái payment chưa đổi thành refunded hoặc totalEscrowHeld chưa trừ!");
    }
    console.log("✓ Hủy trước hạn thành công: Đã HOÀN CỌC 100% (50,000đ), quỹ Escrow đã hoàn trả chuẩn xác.");

    // ==========================================
    // TEST 3: KÈO CÓ CỌC - HỦY SÁT GIỜ (< 12h)
    // ==========================================
    console.log("\n--- TEST 3: Kèo CÓ CỌC - Hủy sát giờ (< 12h) ---");
    // Giờ đấu chỉ cách hiện tại 2 tiếng (nhỏ hơn policy 12 tiếng)
    const sessionLateCancel = await createSession(testHost._id, {
      title: "Test Kèo Hủy Muộn",
      venueId: testVenue._id,
      venueName: testVenue.name || "Sân Test Cầu Lông",
      district: "Quận 1",
      city: "Hồ Chí Minh",
      datetime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      duration: 120,
      maxPlayers: 4,
      matchType: "doubles",
      depositRequired: true,
      depositAmount: 50000,
      cancelPolicyHours: 12,
    });
    createdSessionIds.push(sessionLateCancel._id);

    // Thêm player vào session với status pending
    await Session.findByIdAndUpdate(sessionLateCancel._id, {
      $push: { players: { user: testPlayer._id, status: "pending" } },
    });

    const orderDataLate = await createDepositOrder({
      sessionId: sessionLateCancel._id,
      userId: testPlayer._id,
    });
    await confirmEscrowPayment({ orderCode: orderDataLate.orderCode });
    const repBefore = (await User.findById(testPlayer._id)).reputation;

    // Hủy sát giờ (2h < 12h)
    const cancelResLate = await cancelBookingWithRefund({
      sessionId: sessionLateCancel._id,
      userId: testPlayer._id.toString(),
      reason: "Ngủ quên",
    });

    const repAfter = (await User.findById(testPlayer._id)).reputation;
    const paymentLate = await Payment.findOne({ orderCode: orderDataLate.orderCode });

    if (cancelResLate.isFullRefund || !cancelResLate.penaltyApplied) {
      throw new Error("FAIL: Hủy sát giờ nhưng không áp dụng phạt!");
    }
    if (paymentLate.status !== "forfeited_to_host") {
      throw new Error(`FAIL: Tiền cọc phải chuyển thành forfeited_to_host, nhưng nhận được: ${paymentLate.status}`);
    }
    if (repBefore - repAfter !== 15) {
      throw new Error(`FAIL: Điểm uy tín phải bị trừ 15, trước: ${repBefore}, sau: ${repAfter}`);
    }
    console.log("✓ Hủy sát giờ thành công: Tiền cọc bồi thường cho Host (forfeited_to_host) và bị trừ đúng 15 điểm uy tín.");

    // ==========================================
    // TEST 4: HOST HỦY BUỔI CHƠI (TỰ ĐỘNG HOÀN TOÀN BỘ CỌC)
    // ==========================================
    console.log("\n--- TEST 4: Host hủy buổi chơi (Tự động hoàn cọc cho người chơi) ---");
    const sessionHostCancel = await createSession(testHost._id, {
      title: "Test Host Hủy Buổi Chơi",
      venueId: testVenue._id,
      venueName: testVenue.name || "Sân Test Cầu Lông",
      district: "Quận 1",
      city: "Hồ Chí Minh",
      datetime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      duration: 120,
      maxPlayers: 4,
      matchType: "doubles",
      depositRequired: true,
      depositAmount: 50000,
    });
    createdSessionIds.push(sessionHostCancel._id);

    await Session.findByIdAndUpdate(sessionHostCancel._id, {
      $push: { players: { user: testPlayer._id, status: "pending" } },
    });

    const orderDataHostCancel = await createDepositOrder({
      sessionId: sessionHostCancel._id,
      userId: testPlayer._id,
    });
    await confirmEscrowPayment({ orderCode: orderDataHostCancel.orderCode });

    // Host thực hiện hủy kèo
    await cancelSession(sessionHostCancel._id, testHost._id);

    const paymentAfterHostCancel = await Payment.findOne({ orderCode: orderDataHostCancel.orderCode });
    const sessionAfterHostCancel = await Session.findById(sessionHostCancel._id);

    if (paymentAfterHostCancel.status !== "refunded") {
      throw new Error(`FAIL: Khi Host hủy kèo, tiền cọc của player phải là refunded, nhưng nhận được: ${paymentAfterHostCancel.status}`);
    }
    if (sessionAfterHostCancel.totalEscrowHeld !== 0) {
      throw new Error(`FAIL: totalEscrowHeld phải bằng 0 sau khi hủy, nhưng nhận được: ${sessionAfterHostCancel.totalEscrowHeld}`);
    }
    console.log("✓ Host hủy buổi chơi: Toàn bộ cọc trong quỹ Escrow đã tự động hoàn trả 100% cho người chơi.");

    // ==========================================
    // TEST 5: GIẢI NGÂN QUỸ CỌC CHO HOST SAU KÈO
    // ==========================================
    console.log("\n--- TEST 5: Giải ngân quỹ cọc cho Host sau khi trận đấu kết thúc ---");
    // Buổi chơi đã kết thúc (3 tiếng trước)
    const sessionPayout = await createSession(testHost._id, {
      title: "Test Giải Ngân Kèo Đã Xong",
      venueId: testVenue._id,
      venueName: testVenue.name || "Sân Test Cầu Lông",
      district: "Quận 1",
      city: "Hồ Chí Minh",
      datetime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      duration: 120,
      maxPlayers: 4,
      matchType: "doubles",
      depositRequired: true,
      depositAmount: 50000,
    });
    createdSessionIds.push(sessionPayout._id);

    await Session.findByIdAndUpdate(sessionPayout._id, {
      $push: { players: { user: testPlayer._id, status: "pending" } },
    });

    const orderDataPayout = await createDepositOrder({
      sessionId: sessionPayout._id,
      userId: testPlayer._id,
    });
    await confirmEscrowPayment({ orderCode: orderDataPayout.orderCode });

    // Đánh dấu trận đã xong và player đã tham gia (attended)
    await Session.findByIdAndUpdate(
      sessionPayout._id,
      {
        $set: {
          status: "completed",
          "players.$[elem].attendanceStatus": "attended",
        },
      },
      {
        arrayFilters: [{ "elem.user": testPlayer._id }],
      },
    );

    const payoutResult = await releasePayoutToHost({
      sessionId: sessionPayout._id,
      hostId: testHost._id.toString(),
    });

    const sessionAfterPayout = await Session.findById(sessionPayout._id);
    const paymentAfterPayout = await Payment.findOne({ orderCode: orderDataPayout.orderCode });

    if (sessionAfterPayout.escrowStatus !== "paid_out") {
      throw new Error(`FAIL: escrowStatus phải là 'paid_out', nhưng là: ${sessionAfterPayout.escrowStatus}`);
    }
    if (paymentAfterPayout.status !== "completed") {
      throw new Error(`FAIL: payment status phải là 'completed', nhưng là: ${paymentAfterPayout.status}`);
    }
    console.log(`✓ Giải ngân thành công: Host nhận được ${payoutResult.totalAmount?.toLocaleString()}đ, trạng thái quỹ chuyển thành 'paid_out'.`);

    console.log("\n=======================================================");
    console.log(">>> TẤT CẢ 5/5 KỊCH BẢN CỌC & ESCROW ĐÃ PASS 100% <<<");
    console.log("=======================================================\n");

  } finally {
    // Dọn dẹp session và payment test
    if (createdSessionIds.length > 0) {
      await Session.deleteMany({ _id: { $in: createdSessionIds } });
      await Payment.deleteMany({ session: { $in: createdSessionIds } });
      console.log(`Đã dọn dẹp ${createdSessionIds.length} sessions test.`);
    }
    await mongoose.disconnect();
  }
}

runTests().catch((err) => {
  console.error("LỖI TEST CỌC:", err);
  process.exit(1);
});
