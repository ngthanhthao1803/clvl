import dotenv from "dotenv";
import { readFile } from "node:fs/promises";
import mongoose from "mongoose";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI ||
  process.env.MONGODB_URI_LOCAL ||
  "mongodb://127.0.0.1:27017/clvl-dev";

const COURTS_INFO_PATH = new URL("../../../courts_info.json", import.meta.url);

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function looksLikeBadmintonCourt(entry) {
  const text = normalizeText(
    [entry.title, entry.categoryName, ...(entry.categories ?? [])].join(" "),
  );

  return text.includes("san cau long") || text.includes("badminton");
}

function toVenuePayload(entry) {
  const city = entry.city || entry.state || "Hồ Chí Minh";
  const district =
    entry.neighborhood ||
    entry.street ||
    entry.state ||
    entry.city ||
    "Hồ Chí Minh";
  const address = entry.address || entry.title || city;

  return {
    name: entry.title,
    address,
    district,
    city,
    images: entry.imageUrl ? [entry.imageUrl] : [],
    courtCount: 1,
    openingHours: { open: "06:00", close: "22:00" },
    priceRange: { min: 0, max: 0 },
    rating: Number(entry.totalScore) || 0,
    reviewCount: Number(entry.reviewsCount) || 0,
  };
}

async function main() {
  try {
    console.log("Connecting to MongoDB:", MONGODB_URI);
    await mongoose.connect(MONGODB_URI, {
      dbName: process.env.DB_NAME ?? undefined,
    });

    // Import models after connection
    const { User } = await import("../src/models/User.js");
    const { Venue } = await import("../src/models/Venue.js");
    const { Session } = await import("../src/models/Session.js");
    const { Message } = await import("../src/models/Message.js");
    const { Rating } = await import("../src/models/Rating.js");
    const { Notification } = await import("../src/models/Notification.js");

    console.log("Clearing existing collections...");
    await Promise.all([
      Notification.deleteMany({}),
      Message.deleteMany({}),
      Rating.deleteMany({}),
      Session.deleteMany({}),
      Venue.deleteMany({}),
      User.deleteMany({}),
    ]);

    console.log("Creating users...");
    const users = await User.create([
      {
        firebaseUid: "seed-uid-1",
        name: "Nguyễn Văn A",
        email: "a@example.com",
        avatar: "",
        city: "Hà Nội",
        district: "Cầu Giấy",
        skillLevel: "Intermediate",
        rating: 4.2,
      },
      {
        firebaseUid: "seed-uid-2",
        name: "Trần Thị B",
        email: "b@example.com",
        avatar: "",
        city: "Hà Nội",
        district: "Ba Đình",
        skillLevel: "Advanced",
        rating: 4.7,
      },
      {
        firebaseUid: "seed-uid-3",
        name: "Lê Văn C",
        email: "c@example.com",
        avatar: "",
        city: "Hồ Chí Minh",
        district: "Quận 1",
        skillLevel: "Beginner",
        rating: 3.8,
      },
    ]);

    console.log("Creating venues...");
    const courtsInfo = JSON.parse(await readFile(COURTS_INFO_PATH, "utf8"));
    const crawledVenues = courtsInfo
      .filter(looksLikeBadmintonCourt)
      .slice(0, 123)
      .map(toVenuePayload)
      .filter((venue) => venue.name && venue.address);

    const venues = await Venue.create([
      {
        name: "Sân Cầu Lông Cầu Giấy",
        address: "123 Phố A",
        district: "Cầu Giấy",
        city: "Hà Nội",
        images: [],
        courtCount: 6,
        openingHours: { open: "06:00", close: "22:00" },
        priceRange: { min: 100000, max: 200000 },
        owner: users[1]._id,
        rating: 4.5,
        reviewCount: 24,
      },
      {
        name: "Sân Thanh Xuân",
        address: "45 Đường B",
        district: "Thanh Xuân",
        city: "Hà Nội",
        images: [],
        courtCount: 4,
        openingHours: { open: "07:00", close: "21:00" },
        priceRange: { min: 80000, max: 150000 },
        owner: users[0]._id,
        rating: 4.1,
        reviewCount: 11,
      },
      ...crawledVenues,
    ]);

    console.log("Creating sessions...");
    const now = new Date();
    const sessions = await Session.create([
      {
        title: "Buổi chơi chiều thứ Bảy",
        slug: "session-1",
        venue: venues[0]._id,
        venueName: venues[0].name,
        district: venues[0].district,
        city: venues[0].city,
        datetime: new Date(now.getTime() + 1000 * 60 * 60 * 24),
        skillRequirements: ["TB"],
        maxPlayers: 8,
        currentPlayersCount: 1,
        players: [{ user: users[0]._id, status: "host" }],
        matchType: "doubles",
        price: 120000,
        notes: "Mang vợt, nước uống",
        host: users[0]._id,
      },
      {
        title: "Sáng chủ nhật giao lưu",
        slug: "session-2",
        venue: venues[1]._id,
        venueName: venues[1].name,
        district: venues[1].district,
        city: venues[1].city,
        datetime: new Date(now.getTime() + 1000 * 60 * 60 * 48),
        skillRequirements: ["Newbie"],
        maxPlayers: 6,
        currentPlayersCount: 1,
        players: [{ user: users[1]._id, status: "host" }],
        matchType: "mixed doubles",
        price: 90000,
        notes: "Mời mọi người đến đúng giờ",
        host: users[1]._id,
      },
    ]);

    console.log("Creating messages...");
    const messages = await Message.create([
      {
        session: sessions[0]._id,
        sender: users[0]._id,
        content: "Mọi người nhớ mang giày sạch nhé",
      },
      {
        session: sessions[0]._id,
        sender: users[1]._id,
        content: "Tôi sẽ đến lúc 17:30",
      },
    ]);

    console.log("Creating ratings...");
    const ratings = await Rating.create([
      {
        session: sessions[0]._id,
        rater: users[1]._id,
        ratee: users[0]._id,
        overall: 5,
        criteria: { skill: 5, attitude: 5, punctuality: 5 },
        comment: "Rất nhiệt tình",
      },
    ]);

    console.log("Creating notifications...");
    const notifications = await Notification.create([
      {
        recipient: users[0]._id,
        actor: users[1]._id,
        type: "session_joined",
        title: "Có người tham gia",
        message: "Trần Thị B đã tham gia buổi chơi của bạn",
        session: sessions[0]._id,
      },
    ]);

    console.log("Seed complete:");
    console.log(`- users: ${users.length}`);
    console.log(`- venues: ${venues.length}`);
    console.log(`- sessions: ${sessions.length}`);
    console.log(`- messages: ${messages.length}`);
    console.log(`- ratings: ${ratings.length}`);
    console.log(`- notifications: ${notifications.length}`);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  } catch (err) {
    console.error("Seeding failed:", err);
    try {
      await mongoose.disconnect();
    } catch (e) {
      // ignore
    }
    process.exit(1);
  }
}

main();
