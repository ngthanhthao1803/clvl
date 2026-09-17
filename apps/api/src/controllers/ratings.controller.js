import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteSessionRating,
  listRatingsForUser,
  submitSessionRating,
  updateSessionRating,
} from "../services/ratings.service.js";

export const createRatingController = asyncHandler(async (req, res) => {
  const rating = await submitSessionRating({
    sessionId: req.params.sessionId,
    raterId: req.user.sub,
    rateeId: req.body.rateeId,
    overall: req.body.overall,
    criteria: req.body.criteria,
    comment: req.body.comment,
  });

  res.status(201).json({ success: true, data: { rating } });
});

export const listRatingsController = asyncHandler(async (req, res) => {
  const ratings = await listRatingsForUser(req.params.userId);
  res.json({ success: true, data: { ratings } });
});

export const updateRatingController = asyncHandler(async (req, res) => {
  const rating = await updateSessionRating({
    ratingId: req.params.id,
    raterId: req.user.sub,
    overall: req.body.overall,
    criteria: req.body.criteria,
    comment: req.body.comment,
  });

  res.json({ success: true, data: { rating } });
});

export const deleteRatingController = asyncHandler(async (req, res) => {
  await deleteSessionRating({ ratingId: req.params.id, raterId: req.user.sub });
  res.json({ success: true, message: "Rating deleted" });
});
