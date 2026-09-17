import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteVenue,
  createVenue,
  getVenueById,
  listVenues,
  updateVenue,
} from "../services/venues.service.js";

export const listVenuesController = asyncHandler(async (req, res) => {
  const venues = await listVenues(req.query);
  res.json({ success: true, data: { venues } });
});

export const createVenueController = asyncHandler(async (req, res) => {
  const venue = await createVenue(req.user.sub, req.body);
  res.status(201).json({ success: true, data: { venue } });
});

export const getVenueController = asyncHandler(async (req, res) => {
  const venue = await getVenueById(req.params.id);
  res.json({ success: true, data: { venue } });
});

export const updateVenueController = asyncHandler(async (req, res) => {
  const venue = await updateVenue(req.user.sub, req.params.id, req.body);
  res.json({ success: true, data: { venue } });
});

export const deleteVenueController = asyncHandler(async (req, res) => {
  await deleteVenue(req.user.sub, req.params.id);
  res.json({ success: true, message: "Venue removed" });
});
