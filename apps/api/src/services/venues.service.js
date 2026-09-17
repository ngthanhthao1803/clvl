import { Venue } from "../models/Venue.js";
import { AppError } from "../utils/AppError.js";
import { readFile } from "node:fs/promises";

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .trim();
}

const VIETNAMESE_MAP = {
  a: "[aàáảãạăằắẳẵặâầấẩẫậ]",
  e: "[eèéẻẽẹêềếểễệ]",
  i: "[iìíỉĩị]",
  o: "[oòóỏõọôồốổỗộơờớởỡợ]",
  u: "[uùúủũụưừứửữự]",
  y: "[yỳýỷỹỵ]",
  d: "[dđ]",
};

function toVietnameseRegexPattern(str) {
  const norm = normalizeText(str);
  return norm
    .split("")
    .map((char) => {
      if (VIETNAMESE_MAP[char]) return VIETNAMESE_MAP[char];
      if (/[.*+?^${}()|[\]\\]/.test(char)) return "\\" + char;
      return char;
    })
    .join("");
}

let cachedCourts = null;

async function getFallbackCourts() {
  if (cachedCourts) return cachedCourts;
  try {
    const COURTS_INFO_PATH = new URL("../../../courts_info.json", import.meta.url);
    const raw = JSON.parse(await readFile(COURTS_INFO_PATH, "utf8"));
    const seen = new Set();
    cachedCourts = [];
    for (const d of raw) {
      if (!d.title) continue;
      const text = normalizeText(
        [d.title, d.categoryName, ...(d.categories ?? [])].join(" "),
      );
      if (!text.includes("cau long") && !text.includes("badminton")) continue;
      const normName = normalizeText(d.title);
      if (seen.has(normName)) continue;
      seen.add(normName);
      cachedCourts.push({
        _id: d.placeId || normName,
        id: d.placeId || normName,
        name: d.title.trim(),
        address: (d.address || d.street || d.title).trim(),
        district: d.neighborhood || d.state || "Hồ Chí Minh",
        city: d.city || "Hồ Chí Minh",
        rating: Number(d.totalScore) || 4.5,
        reviewCount: Number(d.reviewsCount) || 10,
        courtCount: 4,
        isActive: true,
      });
    }
    return cachedCourts;
  } catch {
    return [];
  }
}

export async function createVenue(ownerId, payload) {
  return Venue.create({ ...payload, owner: ownerId });
}

export async function listVenues(filters = {}) {
  const query = { isActive: true };
  const limit = Math.min(Number(filters.limit) || 20, 50);

  if (filters.city) query.city = new RegExp(filters.city, "i");
  if (filters.district) query.district = new RegExp(filters.district, "i");

  const rawSearch = String(filters.q ?? "").trim();
  const search = normalizeText(rawSearch);

  try {
    let venues;

    if (rawSearch) {
      // 1. Regex with Vietnamese accent-insensitivity
      const vnPattern = toVietnameseRegexPattern(rawSearch);
      const regex = new RegExp(vnPattern, "i");
      venues = await Venue.find({
        ...query,
        $or: [{ name: regex }, { address: regex }, { district: regex }],
      })
        .sort({ rating: -1, reviewCount: -1 })
        .limit(limit);

      // 2. Normalized text matching fallback for diacritic-free typing (e.g. "ky hoa" -> "Kỳ Hòa")
      if (venues.length < limit) {
        const candidates = await Venue.find(query)
          .sort({ rating: -1, reviewCount: -1 })
          .limit(300);

        const existingIds = new Set(venues.map((v) => v._id.toString()));
        for (const candidate of candidates) {
          if (venues.length >= limit) break;
          if (existingIds.has(candidate._id.toString())) continue;

          const haystack = [
            candidate.name,
            candidate.address,
            candidate.district,
            candidate.city,
          ]
            .map(normalizeText)
            .join(" ");

          if (haystack.includes(search)) {
            venues.push(candidate);
            existingIds.add(candidate._id.toString());
          }
        }
      }
    } else {
      venues = await Venue.find(query)
        .sort({ rating: -1, reviewCount: -1, createdAt: -1 })
        .limit(limit);
    }

    // 3. Resilient fallback if DB was empty
    if (!venues || venues.length === 0) {
      const fallbackList = await getFallbackCourts();
      const filteredFallback = search
        ? fallbackList.filter((v) => {
            const haystack = [v.name, v.address, v.district, v.city]
              .map(normalizeText)
              .join(" ");
            return haystack.includes(search);
          })
        : fallbackList;
      return filteredFallback.slice(0, limit);
    }

    return venues;
  } catch (error) {
    console.warn("MongoDB query failed, falling back to JSON venues:", error.message);
    const fallbackList = await getFallbackCourts();
    const filteredFallback = search
      ? fallbackList.filter((v) => {
          const haystack = [v.name, v.address, v.district, v.city]
            .map(normalizeText)
            .join(" ");
          return haystack.includes(search);
        })
      : fallbackList;
    return filteredFallback.slice(0, limit);
  }
}

export async function getVenueById(venueId) {
  const venue = await Venue.findOne({ _id: venueId, isActive: true }).populate(
    "owner",
  );
  if (!venue) {
    throw new AppError("Venue not found", 404);
  }
  return venue;
}

export async function updateVenue(ownerId, venueId, updates) {
  const venue = await Venue.findOneAndUpdate(
    { _id: venueId, owner: ownerId, isActive: true },
    { $set: updates },
    { new: true, runValidators: true },
  );
  if (!venue) {
    throw new AppError("Venue not found or not owned by this user", 404);
  }
  return venue;
}

export async function deleteVenue(ownerId, venueId) {
  const venue = await Venue.findOneAndUpdate(
    { _id: venueId, owner: ownerId, isActive: true },
    { $set: { isActive: false } },
    { new: true },
  );

  if (!venue) {
    throw new AppError("Venue not found or not owned by this user", 404);
  }

  return venue;
}
