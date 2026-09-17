import dotenv from "dotenv";
import { readFile } from "node:fs/promises";
import mongoose from "mongoose";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config({
  path: path.join(path.dirname(fileURLToPath(import.meta.url)), "../.env"),
});

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI in apps/api/.env");
}

const COURTS_INFO_PATH = new URL("../../../courts_info.json", import.meta.url);

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .trim();
}

function looksLikeBadmintonCourt(entry) {
  if (!entry.title) return false;
  const text = normalizeText(
    [entry.title, entry.categoryName, ...(entry.categories ?? [])].join(" "),
  );
  return text.includes("cau long") || text.includes("badminton");
}

function extractDistrict(entry) {
  const text = [
    entry.neighborhood,
    entry.address,
    entry.searchString,
    entry.state,
  ]
    .filter(Boolean)
    .join(" ");

  const match = text.match(
    /(Quận\s+\d+|Quận\s+[A-Za-zÀ-ỹ]+|Huyện\s+[A-Za-zÀ-ỹ\s]+|Thành phố\s+[A-Za-zÀ-ỹ\s]+|TP\.\s*Thủ Đức|Thủ Đức|Bình Thạnh|Tân Bình|Tân Phú|Gò Vấp|Phú Nhuận|Bình Tân|Hóc Môn|Bình Chánh|Củ Chi|Nhà Bè|Cầu Giấy|Đống Đa|Ba Đình|Hai Bà Trưng|Hoàn Kiếm|Thanh Xuân|Tây Hồ|Long Biên|Nam Từ Liêm|Bắc Từ Liêm|Hà Đông|Hoàng Mai)/i,
  );

  if (match) {
    let d = match[0].trim();
    if (d.toLowerCase() === "thủ đức") return "Thủ Đức";
    return d;
  }

  return entry.neighborhood || entry.city || "Hồ Chí Minh";
}

function toVenuePayload(entry) {
  let city = entry.city || entry.state || "Hồ Chí Minh";
  if (city.includes("Hồ Chí Minh") || city.includes("HCM") || city.includes("SG")) {
    city = "Hồ Chí Minh";
  } else if (city.includes("Hà Nội")) {
    city = "Hà Nội";
  }

  const district = extractDistrict(entry);
  const address = entry.address || entry.street || entry.title;

  return {
    name: entry.title.trim(),
    address: address.trim(),
    district,
    city,
    images: entry.imageUrl ? [entry.imageUrl] : [],
    courtCount: entry.courtCount || 4,
    openingHours: { open: "06:00", close: "22:00" },
    priceRange: { min: 80000, max: 150000 },
    rating: Number(entry.totalScore) || 4.5,
    reviewCount: Number(entry.reviewsCount) || 10,
    isActive: true,
  };
}

async function main() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);

    const { Venue } = await import("../src/models/Venue.js");

    console.log("Reading courts_info.json...");
    const rawData = JSON.parse(await readFile(COURTS_INFO_PATH, "utf8"));

    const seen = new Set();
    const uniqueVenues = [];

    for (const entry of rawData) {
      if (!looksLikeBadmintonCourt(entry)) continue;

      const normName = normalizeText(entry.title);
      if (seen.has(normName)) continue;
      seen.add(normName);

      const payload = toVenuePayload(entry);
      if (payload.name && payload.address) {
        uniqueVenues.push(payload);
      }
    }

    console.log(`Found ${uniqueVenues.length} unique badminton venues.`);

    const existingCount = await Venue.countDocuments();
    console.log(`Existing venues in DB: ${existingCount}`);

    if (existingCount > 0) {
      console.log("Updating / Upserting venues into DB...");
    } else {
      console.log("Seeding venues into DB...");
    }

    let inserted = 0;
    const batchSize = 100;
    for (let i = 0; i < uniqueVenues.length; i += batchSize) {
      const batch = uniqueVenues.slice(i, i + batchSize);
      const ops = batch.map((v) => ({
        updateOne: {
          filter: { name: v.name },
          update: { $set: v },
          upsert: true,
        },
      }));

      const res = await Venue.bulkWrite(ops);
      inserted += (res.upsertedCount || 0) + (res.modifiedCount || 0);
    }

    const totalNow = await Venue.countDocuments({ isActive: true });
    console.log(`Success! Total venues in DB now: ${totalNow}`);

    await mongoose.disconnect();
    console.log("Done.");
  } catch (error) {
    console.error("Error seeding venues:", error);
    process.exit(1);
  }
}

main();
