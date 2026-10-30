import mongoose from "mongoose";
import { Session } from "../models/Session.js";
import { Venue } from "../models/Venue.js";
import { Payment } from "../models/Payment.js";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { createNotification } from "./notifications.service.js";

async function populateSession(sessionQuery) {
  return sessionQuery
    .populate("host venue players.user")
    .lean({ virtuals: true });
}

function sanitizeSessionForViewer(session, viewer = null) {
  if (!session) return session;
  const viewerId = viewer?.sub || viewer?.id;
  const isAdmin = viewer?.role === "admin" || viewer?.role === "superadmin";
  const hostId =
    session.host?._id?.toString?.() ||
    session.host?.id ||
    session.host?.toString?.();
  const isHost = Boolean(viewerId && hostId && String(viewerId) === String(hostId));

  if (!isHost && !isAdmin) {
    const copy = { ...session };
    delete copy.checkInCode;
    return copy;
  }
  return session;
}

export async function handleSessionCancellationRefunds(session, cancelReason = "") {
  const heldPayments = await Payment.find({
    session: session._id,
    status: { $in: ["escrow_held", "pending"] },
  });

  if (heldPayments.length > 0) {
    for (const payment of heldPayments) {
      if (payment.status === "escrow_held") {
        payment.status = "refunded";
        payment.refundedAt = new Date();
        payment.refundReason = cancelReason || "Buổi chơi đã bị hủy - Tự động hoàn cọc 100%";
        await payment.save();

        await createNotification({
          recipient: payment.payer,
          type: "system",
          title: "Hoàn cọc 100% - Buổi chơi đã bị hủy",
          message: `Buổi chơi "${session.title}" đã bị hủy. Khoản cọc ${payment.amount.toLocaleString()}đ của bạn đã được hoàn lại đầy đủ.`,
          session: session._id,
        });
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
}

function syncSessionStatus(session) {
  if (session.status === "cancelled" || session.status === "completed") {
    return session;
  }

  session.status =
    session.currentPlayersCount >= session.maxPlayers ? "full" : "open";
  return session;
}

export async function listSessions(filters = {}, viewer = null) {
  const query = {};

  if (filters.host) query.host = filters.host;
  if (filters.city) query.city = filters.city;
  if (filters.district) query.district = filters.district;
  if (filters.skillLevel) {
    query.skillRequirements = { $in: [filters.skillLevel] };
  }
  if (filters.matchType) query.matchType = filters.matchType;
  if (filters.status) query.status = filters.status;

  if (filters.participant) {
    query.$or = [
      { host: filters.participant },
      {
        "players.user": filters.participant,
        "players.status": { $nin: ["left", "rejected"] },
      },
    ];
  } else if (filters.player) {
    query["players.user"] = filters.player;
    query["players.status"] = { $nin: ["left", "rejected"] };
  }

  if (filters.search) {
    const reg = new RegExp(filters.search.trim(), "i");
    const searchCondition = [
      { title: reg },
      { venueName: reg },
      { district: reg },
    ];
    if (query.$or) {
      query.$and = [{ $or: query.$or }, { $or: searchCondition }];
      delete query.$or;
    } else {
      query.$or = searchCondition;
    }
  }

  const sessions = await populateSession(
    Session.find(query).sort({ datetime: 1, createdAt: -1 }).limit(100),
  );

  return Array.isArray(sessions)
    ? sessions.map((s) => sanitizeSessionForViewer(s, viewer))
    : sessions;
}

export async function createSession(hostId, payload) {
  const normalizedSkills =
    payload.skillRequirements ??
    (payload.skillRequirement ? [payload.skillRequirement] : undefined);
  const checkInCode =
    payload.checkInCode ||
    Math.floor(100000 + Math.random() * 900000).toString();
  const depositRequired = Boolean(payload.depositRequired ?? true);
  const depositAmount = !depositRequired
    ? 0
    : payload.depositAmount !== undefined
      ? Number(payload.depositAmount) || 0
      : payload.price && payload.price > 0
        ? Math.min(payload.price, 50000)
        : 50000;
  const coverImage = payload.coverImage ?? payload.imageUrl ?? "";

  let geoFields = {};
  const venueIdToLook = payload.venueId || payload.venue;
  if (venueIdToLook) {
    try {
      const vDoc = await Venue.findById(venueIdToLook).lean();
      if (vDoc?.latitude && vDoc?.longitude) {
        geoFields = {
          latitude: vDoc.latitude,
          longitude: vDoc.longitude,
          location: vDoc.location,
          googleMapsUrl: vDoc.googleMapsUrl,
        };
      }
    } catch {}
  }
  if (!geoFields.latitude && payload.venueName) {
    try {
      const vDoc = await Venue.findOne({ name: payload.venueName }).lean();
      if (vDoc?.latitude && vDoc?.longitude) {
        geoFields = {
          latitude: vDoc.latitude,
          longitude: vDoc.longitude,
          location: vDoc.location,
          googleMapsUrl: vDoc.googleMapsUrl,
        };
      }
    } catch {}
  }

  const session = await Session.create({
    ...payload,
    ...geoFields,
    ...(normalizedSkills ? { skillRequirements: normalizedSkills } : {}),
    venue: payload.venueId,
    host: hostId,
    datetime: new Date(payload.datetime),
    checkInCode,
    depositAmount,
    depositRequired,
    cancelPolicyHours: payload.cancelPolicyHours ?? 12,
    coverImage,
    imageUrl: coverImage,
    players: [
      {
        user: hostId,
        status: "host",
        paymentStatus: "paid",
        attendanceStatus: "attended",
      },
    ],
    currentPlayersCount: 1,
  });

  return populateSession(Session.findById(session._id));
}

export async function updateSession(sessionId, hostId, updates) {
  let session = null;
  if (mongoose.Types.ObjectId.isValid(sessionId)) {
    session = await Session.findById(sessionId);
  }
  if (!session) {
    session = await Session.findOne({ slug: sessionId });
  }

  if (!session) {
    throw new AppError("Session not found", 404);
  }

  if (session.host.toString() !== hostId.toString()) {
    throw new AppError("Only the host can update the session", 403);
  }

  if (updates.datetime) {
    session.datetime = new Date(updates.datetime);
  }

  const directFields = [
    "title",
    "venueName",
    "district",
    "city",
    "skillRequirements",
    "maxPlayers",
    "matchType",
    "price",
    "hasGenderPricing",
    "priceFemale",
    "notes",
    "isPrivate",
    "chatEnabled",
    "depositRequired",
    "depositAmount",
    "cancelPolicyHours",
    "coverImage",
    "imageUrl",
  ];

  for (const field of directFields) {
    if (updates[field] !== undefined) {
      session[field] = updates[field];
    }
  }

  if (updates.coverImage !== undefined) {
    const val = updates.coverImage || "";
    session.coverImage = val;
    session.imageUrl = val;
  } else if (updates.imageUrl !== undefined) {
    const val = updates.imageUrl || "";
    session.coverImage = val;
    session.imageUrl = val;
  }

  if (updates.skillRequirement !== undefined) {
    session.skillRequirements = [updates.skillRequirement];
  }

  if (updates.venueId !== undefined) {
    session.venue = updates.venueId;
  }

  session.currentPlayersCount = Math.min(
    session.currentPlayersCount,
    session.maxPlayers,
  );
  syncSessionStatus(session);
  await session.save();

  return populateSession(Session.findById(session._id));
}

export async function cancelSession(sessionId, hostId) {
  let session = null;
  if (mongoose.Types.ObjectId.isValid(sessionId)) {
    session = await Session.findById(sessionId);
  }
  if (!session) {
    session = await Session.findOne({ slug: sessionId });
  }

  if (!session) {
    throw new AppError("Session not found", 404);
  }

  if (session.host.toString() !== hostId.toString()) {
    throw new AppError("Only the host can cancel the session", 403);
  }

  session.status = "cancelled";
  await handleSessionCancellationRefunds(session, "Host đã hủy buổi chơi");
  await session.save();

  return populateSession(Session.findById(session._id));
}

export async function getSessionById(sessionId, viewer = null) {
  // Validate ObjectId to avoid Mongoose CastError for invalid ids
  if (
    !Session.db ||
    !Session.db.base ||
    !Session.db.base.Types ||
    !Session.db.base.Types.ObjectId
  ) {
    // Fallback: if ObjectId helper isn't available, attempt to find directly
    const session = await populateSession(Session.findById(sessionId));
    if (!session) throw new AppError("Session not found", 404);
    return sanitizeSessionForViewer(session, viewer);
  }

  const ObjectId = Session.db.base.Types.ObjectId;
  if (!ObjectId.isValid(sessionId)) {
    // Try slug fallback (e.g. "session-1") before returning 404
    const bySlug = await populateSession(Session.findOne({ slug: sessionId }));
    if (bySlug) return sanitizeSessionForViewer(bySlug, viewer);
    throw new AppError("Session not found", 404);
  }

  const session = await populateSession(Session.findById(sessionId));
  if (!session) {
    throw new AppError("Session not found", 404);
  }

  return sanitizeSessionForViewer(session, viewer);
}

export async function joinSession(sessionId, userId) {
  const session = await Session.findById(sessionId);

  if (!session) {
    throw new AppError("Không tìm thấy buổi chơi", 404);
  }

  if (session.status === "cancelled") {
    throw new AppError("Buổi chơi này đã bị hủy, không thể tham gia", 400);
  }

  const uidStr = String(userId);
  const activeEntry = session.players.find(
    (entry) =>
      entry.user.toString() === uidStr &&
      entry.status !== "left" &&
      entry.status !== "rejected",
  );
  if (activeEntry) {
    throw new AppError("Bạn đã đăng ký tham gia buổi chơi này rồi", 409);
  }

  // If the session does NOT require deposit and has slots, or if it requires deposit:
  // If user previously left or was rejected, reuse their slot entry instead of duplicating
  const previousEntry = session.players.find(
    (entry) => entry.user.toString() === uidStr,
  );

  // Auto-join immediately if session does not require deposit and has open slots;
  // otherwise set as pending (will auto-promote to joined when deposit is paid or host approves)
  const canAutoJoinFree =
    !session.depositRequired && session.currentPlayersCount < session.maxPlayers;
  const nextStatus = canAutoJoinFree ? "joined" : "pending";

  if (previousEntry) {
    previousEntry.status = nextStatus;
    previousEntry.paymentStatus = "unpaid";
    previousEntry.attendanceStatus = "registered";
    previousEntry.joinedAt = new Date();
  } else {
    session.players.push({
      user: userId,
      status: nextStatus,
      paymentStatus: "unpaid",
      attendanceStatus: "registered",
    });
  }

  if (canAutoJoinFree) {
    session.currentPlayersCount = (session.currentPlayersCount || 1) + 1;
    syncSessionStatus(session);
  }

  await session.save();

  // Notify host with real player name
  if (session.host.toString() !== uidStr) {
    const joiningUser = await User.findById(userId)
      .select("name skillLevel")
      .lean();
    const playerName = joiningUser?.name || "Một lông thủ";
    const playerSkill = joiningUser?.skillLevel
      ? ` (Trình ${joiningUser.skillLevel})`
      : "";

    await createNotification({
      recipient: session.host,
      actor: userId,
      type: canAutoJoinFree ? "session_joined" : "session_join_request",
      title: canAutoJoinFree
        ? "Thành viên mới tham gia buổi chơi"
        : "Yêu cầu tham gia buổi chơi",
      message: canAutoJoinFree
        ? `${playerName}${playerSkill} đã tham gia "${session.title}".`
        : `${playerName}${playerSkill} đã đăng ký tham gia "${session.title}".`,
      session: session._id,
    });
  }

  const populated = await populateSession(Session.findById(sessionId));
  return sanitizeSessionForViewer(populated, { sub: userId });
}

export async function respondToJoinRequest(sessionId, hostId, userId, approve) {
  const session = await Session.findById(sessionId);

  if (!session) {
    throw new AppError("Session not found", 404);
  }

  if (session.host.toString() !== hostId.toString()) {
    throw new AppError("Only the host can respond to join requests", 403);
  }

  const participant = session.players.find(
    (p) => p.user.toString() === userId && p.status === "pending",
  );
  if (!participant) {
    throw new AppError("Join request not found", 404);
  }

  if (approve) {
    if (session.currentPlayersCount >= session.maxPlayers) {
      throw new AppError("Session is full", 400);
    }
    participant.status = "joined";
    session.currentPlayersCount = (session.currentPlayersCount || 0) + 1;
    syncSessionStatus(session);
    await session.save();

    await createNotification({
      recipient: userId,
      actor: hostId,
      type: "session_join_approved",
      title: "Yêu cầu được chấp nhận",
      message: `Yêu cầu tham gia ${session.title} đã được chấp nhận`,
      session: session._id,
    });
  } else {
    // mark as rejected
    participant.status = "rejected";

    // Auto refund deposit if player had paid escrow
    const heldPayment = await Payment.findOne({
      session: session._id,
      payer: userId,
      status: "escrow_held",
    });
    if (heldPayment) {
      heldPayment.status = "refunded";
      heldPayment.refundedAt = new Date();
      heldPayment.refundReason = "Yêu cầu tham gia bị Host từ chối - Tự động hoàn cọc 100%";
      await heldPayment.save();
      session.totalEscrowHeld = Math.max(0, (session.totalEscrowHeld || 0) - heldPayment.amount);
      participant.paymentStatus = "refunded";
    }

    await session.save();

    await createNotification({
      recipient: userId,
      actor: hostId,
      type: "session_join_rejected",
      title: "Yêu cầu không được chấp nhận",
      message: heldPayment
        ? `Yêu cầu tham gia ${session.title} đã bị từ chối. Khoản cọc ${heldPayment.amount.toLocaleString()}đ đã được hoàn lại đầy đủ.`
        : `Yêu cầu tham gia ${session.title} đã bị từ chối`,
      session: session._id,
    });
  }

  return populateSession(Session.findById(sessionId));
}

export async function leaveSession(sessionId, userId) {
  const session = await Session.findById(sessionId);

  if (!session) {
    throw new AppError("Session not found", 404);
  }

  const participant = session.players.find(
    (entry) => entry.user.toString() === userId && entry.status !== "left",
  );
  if (!participant) {
    throw new AppError("You are not part of this session", 400);
  }

  if (session.host.toString() === userId) {
    throw new AppError(
      "Host should cancel or transfer the session instead of leaving",
      400,
    );
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

  if (payment) {
    if (isEligibleForFullRefund) {
      payment.status = "refunded";
      payment.refundedAt = new Date();
      payment.refundReason = `Rời buổi chơi trước ${policyHours}h - Tự động hoàn cọc 100%`;
      await payment.save();
      session.totalEscrowHeld = Math.max(0, (session.totalEscrowHeld || 0) - payment.amount);
      participant.paymentStatus = "refunded";
      participant.attendanceStatus = "cancelled_refund";
    } else {
      payment.status = "forfeited_to_host";
      payment.refundReason = `Rời buổi chơi sát giờ (< ${policyHours}h) - Cọc bồi thường cho Host`;
      await payment.save();
      participant.paymentStatus = "forfeited";
      participant.attendanceStatus = "no_show";
    }
  }

  const wasJoined = participant.status === "joined";
  participant.status = "left";
  if (wasJoined) {
    session.currentPlayersCount = Math.max(1, session.currentPlayersCount - 1);
  }
  syncSessionStatus(session);
  await session.save();

  const populated = await populateSession(Session.findById(sessionId));
  return sanitizeSessionForViewer(populated, { sub: userId });
}

export async function invitePlayer(sessionId, hostId, userId) {
  const session = await Session.findById(sessionId);

  if (!session) {
    throw new AppError("Session not found", 404);
  }

  if (session.host.toString() !== hostId) {
    throw new AppError("Only the host can invite players", 403);
  }

  await createNotification({
    recipient: userId,
    actor: hostId,
    type: "session_invited",
    title: "You were invited to a session",
    message: `You have been invited to join ${session.title}`,
    session: session._id,
  });

  return true;
}

export async function updateSessionStatus(sessionId, hostId, payload) {
  const session = await Session.findById(sessionId);

  if (!session) {
    throw new AppError("Session not found", 404);
  }

  if (session.host.toString() !== hostId.toString()) {
    throw new AppError("Only the host can update session status", 403);
  }

  session.status = payload.status;
  if (payload.cancelReason !== undefined) {
    session.cancelReason = payload.cancelReason;
  }

  if (payload.status === "completed") {
    session.currentPlayersCount = Math.min(
      session.currentPlayersCount,
      session.maxPlayers,
    );
  }

  if (payload.status === "cancelled") {
    await handleSessionCancellationRefunds(session, payload.cancelReason || "Buổi chơi đã bị hủy");
  }

  await session.save();

  if (payload.status === "cancelled") {
    await createNotification({
      recipient: session.host,
      actor: hostId,
      type: "session_cancelled",
      title: "Session cancelled",
      message: `${session.title} has been cancelled.`,
      session: session._id,
    });
  }

  return populateSession(Session.findById(sessionId));
}
