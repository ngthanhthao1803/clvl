import dotenv from "dotenv";
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

const venueFixes = [
  {
    currentName: "S?n Ba ??nh Arena",
    name: "Sân Ba Đình Arena",
    address: "88 Liễu Giai",
    city: "Hà Nội",
    district: "Ba Đình",
  },
  {
    currentName: "Th? ??c Sports Hub",
    name: "Thủ Đức Sports Hub",
    address: "99 Võ Văn Ngân",
    city: "TP.HCM",
    district: "Thủ Đức",
  },
  {
    currentName: "Saigon Smash Court",
    name: "Saigon Smash Court",
    address: "12 Nguyễn Huệ",
    city: "TP.HCM",
    district: "Quận 1",
  },
  {
    currentName: "?? N?ng Shuttle Club",
    name: "Đà Nẵng Shuttle Club",
    address: "27 Trần Phú",
    city: "Đà Nẵng",
    district: "Hải Châu",
  },
];

async function main() {
  await mongoose.connect(MONGODB_URI, {
    dbName: process.env.DB_NAME ?? undefined,
  });

  const { Venue } = await import("../src/models/Venue.js");
  const { Session } = await import("../src/models/Session.js");

  let repairedVenues = 0;
  let repairedSessions = 0;

  for (const fix of venueFixes) {
    const venue = await Venue.findOneAndUpdate(
      { name: fix.currentName },
      {
        $set: {
          name: fix.name,
          address: fix.address,
          city: fix.city,
          district: fix.district,
        },
      },
      { new: true },
    ).lean();

    if (!venue) {
      continue;
    }

    repairedVenues += 1;

    const sessionResult = await Session.updateMany(
      { venue: venue._id },
      {
        $set: {
          venueName: fix.name,
          city: fix.city,
          district: fix.district,
        },
      },
    );

    repairedSessions += sessionResult.modifiedCount ?? 0;
  }

  console.log(`Repaired venues: ${repairedVenues}`);
  console.log(`Updated sessions: ${repairedSessions}`);

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore
  }
  process.exit(1);
});
