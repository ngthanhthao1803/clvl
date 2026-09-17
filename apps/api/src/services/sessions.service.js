import { Session } from "../models/Session.js";
import { Venue } from "../models/Venue.js";
import { AppError } from "../utils/AppError.js";
import { createNotification } from "./notifications.service.js";

async function populateSession(sessionQuery) {
  return sessionQuery
    .populate("host venue players.user")
    .lean({ virtuals: true });
}

function syncSessionStatus(session) {
  if (session.status === "cancelled" || session.status === "completed") {
    return session;
  }

  session.status =
    session.currentPlayersCount >= session.maxPlayers ? "full" : "open";
  return session;
}

export async function listSessions(filters = {}) {
  const query = {};

  if (filters.host) query.host = filters.host;
  if (filters.city) query.city = filters.city;
  if (filters.district) query.district = filters.district;
  if (filters.skillLevel) {
    query.skillRequirements = { $in: [filters.skillLevel] };
  }
  if (filters.matchType) query.matchType = filters.matchType;
  if (filters.status) query.status = filters.status;

  return populateSession(
    Session.find(query).sort({ datetime: 1, createdAt: -1 }).limit(100),
  );
}

export async function createSession(hostId, payload) {
  const normalizedSkills =
    payload.skillRequirements ??
    (payload.skillRequirement ? [payload.skillRequirement] : undefined);
  const checkInCode =
    payload.checkInCode ||
    Math.floor(100000 + Math.random() * 900000).toString();
  const depositAmount =
    payload.depositAmount !== undefined
      ? payload.depositAmount
      : payload.price && payload.price > 0
        ? Math.min(payload.price, 50000)
        : 50000;

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
    depositRequired: payload.depositRequired ?? true,
    cancelPolicyHours: payload.cancelPolicyHours ?? 12,
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
  const session = await Session.findById(sessionId);

  if (!session) {
    throw new AppError("Session not found", 404);
  }

  if (session.host.toString() !== hostId) {
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
    "notes",
    "isPrivate",
    "chatEnabled",
    "depositRequired",
    "depositAmount",
    "cancelPolicyHours",
  ];

  for (const field of directFields) {
    if (updates[field] !== undefined) {
      session[field] = updates[field];
    }
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

  return populateSession(Session.findById(sessionId));
}

export async function cancelSession(sessionId, hostId) {
  const session = await Session.findById(sessionId);

  if (!session) {
    throw new AppError("Session not found", 404);
  }

  if (session.host.toString() !== hostId) {
    throw new AppError("Only the host can cancel the session", 403);
  }

  session.status = "cancelled";
  await session.save();

  return populateSession(Session.findById(sessionId));
}

export async function getSessionById(sessionId) {
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
    return session;
  }

  const ObjectId = Session.db.base.Types.ObjectId;
  if (!ObjectId.isValid(sessionId)) {
    // Try slug fallback (e.g. "session-1") before returning 404
    const bySlug = await populateSession(Session.findOne({ slug: sessionId }));
    if (bySlug) return bySlug;
    throw new AppError("Session not found", 404);
  }

  const session = await populateSession(Session.findById(sessionId));
  if (!session) {
    throw new AppError("Session not found", 404);
  }

  return session;
}

export async function joinSession(sessionId, userId) {
  const session = await Session.findById(sessionId);

  if (!session) {
    throw new AppError("Session not found", 404);
  }

  if (session.status === "cancelled") {
    throw new AppError("Cancelled sessions cannot be joined", 400);
  }

  const alreadyRequested = session.players.some(
    (entry) => entry.user.toString() === userId && entry.status !== "left",
  );
  if (alreadyRequested) {
    throw new AppError("You already requested or joined this session", 409);
  }

  // Add as pending request; host will approve to become 'joined'
  session.players.push({ user: userId, status: "pending" });
  await session.save();

  // Notify host that someone requested to join
  if (session.host.toString() !== userId) {
    await createNotification({
      recipient: session.host,
      actor: userId,
      type: "session_join_request",
      title: "Yêu cầu tham gia buổi chơi",
      message: `${userId} muốn tham gia ${session.title}`,
      session: session._id,
    });
  }

  return populateSession(Session.findById(sessionId));
}

export async function respondToJoinRequest(sessionId, hostId, userId, approve) {
  const session = await Session.findById(sessionId);

  if (!session) {
    throw new AppError("Session not found", 404);
  }

  if (session.host.toString() !== hostId) {
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
    await session.save();

    await createNotification({
      recipient: userId,
      actor: hostId,
      type: "session_join_rejected",
      title: "Yêu cầu không được chấp nhận",
      message: `Yêu cầu tham gia ${session.title} đã bị từ chối`,
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

  participant.status = "left";
  session.currentPlayersCount = Math.max(1, session.currentPlayersCount - 1);
  syncSessionStatus(session);
  await session.save();

  return populateSession(Session.findById(sessionId));
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

  if (session.host.toString() !== hostId) {
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
