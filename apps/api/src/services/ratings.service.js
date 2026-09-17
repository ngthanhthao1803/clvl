import { Rating } from "../models/Rating.js";
import { Session } from "../models/Session.js";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { createNotification } from "./notifications.service.js";

function calculateReputation(averageRating, totalRatings) {
  const base = 70 + averageRating * 6 + Math.min(totalRatings, 50) * 0.3;
  return Math.max(0, Math.min(100, Math.round(base)));
}

async function refreshRateeStats(rateeId) {
  const aggregation = await Rating.aggregate([
    { $match: { ratee: rateeId } },
    {
      $group: {
        _id: "$ratee",
        average: { $avg: "$overall" },
        count: { $sum: 1 },
      },
    },
  ]);

  const summary = aggregation[0];

  if (!summary) {
    await User.findByIdAndUpdate(rateeId, {
      $set: { rating: 0, reputation: 100 },
    });
    return { average: 0, count: 0 };
  }

  await User.findByIdAndUpdate(rateeId, {
    $set: {
      rating: Number(summary.average.toFixed(2)) || 0,
      reputation: calculateReputation(summary.average, summary.count),
    },
  });

  return summary;
}

export async function submitSessionRating({
  sessionId,
  raterId,
  rateeId,
  overall,
  criteria,
  comment,
}) {
  const session = await Session.findById(sessionId);

  if (!session) {
    throw new AppError("Session not found", 404);
  }

  const duplicate = await Rating.findOne({
    session: sessionId,
    rater: raterId,
    ratee: rateeId,
  });
  if (duplicate) {
    throw new AppError("You already rated this player for this session", 409);
  }

  const rating = await Rating.create({
    session: sessionId,
    rater: raterId,
    ratee: rateeId,
    overall,
    criteria,
    comment,
    isPositive: overall >= 4,
  });

  await refreshRateeStats(rateeId);

  await createNotification({
    recipient: rateeId,
    actor: raterId,
    type: "rating_received",
    title: "You received a rating",
    message: `Your session rating was updated to ${overall} stars.`,
    session: sessionId,
  });

  return rating;
}

export async function listRatingsForUser(userId) {
  return Rating.find({ ratee: userId })
    .sort({ createdAt: -1 })
    .populate("rater session");
}

export async function updateSessionRating({
  ratingId,
  raterId,
  overall,
  criteria,
  comment,
}) {
  const rating = await Rating.findOneAndUpdate(
    { _id: ratingId, rater: raterId },
    {
      $set: {
        ...(overall !== undefined ? { overall, isPositive: overall >= 4 } : {}),
        ...(criteria !== undefined ? { criteria } : {}),
        ...(comment !== undefined ? { comment } : {}),
      },
    },
    { new: true, runValidators: true },
  );

  if (!rating) {
    throw new AppError("Rating not found", 404);
  }

  await refreshRateeStats(rating.ratee);
  return rating.populate("rater session");
}

export async function deleteSessionRating({ ratingId, raterId }) {
  const rating = await Rating.findOne({ _id: ratingId, rater: raterId });

  if (!rating) {
    throw new AppError("Rating not found", 404);
  }

  await rating.deleteOne();
  await refreshRateeStats(rating.ratee);
  return true;
}
