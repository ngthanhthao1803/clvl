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

const sessionBlueprints = [
  {
    title: "Buổi chơi chiều thứ Bảy",
    dayOffset: 1,
    hourOffset: 17,
    skillRequirements: ["TB"],
    maxPlayers: 8,
    currentPlayersCount: 3,
    matchType: "doubles",
    price: 120000,
    notes: "Mang vợt, nước uống",
  },
  {
    title: "Sáng chủ nhật giao lưu",
    dayOffset: 2,
    hourOffset: 8,
    skillRequirements: ["Newbie"],
    maxPlayers: 6,
    currentPlayersCount: 2,
    matchType: "mixed doubles",
    price: 90000,
    notes: "Mời mọi người đến đúng giờ",
  },
  {
    title: "Tối đầu tuần đôi nam nữ",
    dayOffset: 3,
    hourOffset: 19,
    skillRequirements: ["Yếu"],
    maxPlayers: 8,
    currentPlayersCount: 5,
    matchType: "mixed doubles",
    price: 130000,
    notes: "Ưu tiên đúng giờ, có thể đổi cặp",
  },
  {
    title: "Chiều thứ Ba đánh đơn",
    dayOffset: 4,
    hourOffset: 16,
    skillRequirements: ["Yếu+"],
    maxPlayers: 4,
    currentPlayersCount: 1,
    matchType: "singles",
    price: 150000,
    notes: "Đánh đơn, ưu tiên người chơi kỹ thuật",
  },
  {
    title: "Giao lưu tối Quận 1",
    dayOffset: 5,
    hourOffset: 20,
    skillRequirements: ["TBY-"],
    maxPlayers: 8,
    currentPlayersCount: 8,
    matchType: "doubles",
    price: 140000,
    notes: "Buổi này đang đủ người để test trạng thái full",
    status: "full",
  },
  {
    title: "Sáng thứ Tư nhẹ nhàng",
    dayOffset: 6,
    hourOffset: 7,
    skillRequirements: ["TBY"],
    maxPlayers: 6,
    currentPlayersCount: 4,
    matchType: "doubles",
    price: 100000,
    notes: "Phù hợp người mới quay lại chơi",
  },
  {
    title: "Buổi tốc độ cao",
    dayOffset: 7,
    hourOffset: 18,
    skillRequirements: ["TBY+"],
    maxPlayers: 8,
    currentPlayersCount: 6,
    matchType: "mixed doubles",
    price: 110000,
    notes: "Nhịp độ nhanh, ưu tiên cầu bền",
  },
  {
    title: "Sân chiều thứ Năm",
    dayOffset: 8,
    hourOffset: 15,
    skillRequirements: ["TB-"],
    maxPlayers: 6,
    currentPlayersCount: 3,
    matchType: "doubles",
    price: 115000,
    notes: "Cần người có thể xoay tua vị trí",
  },
  {
    title: "Trận tối Ba Đình",
    dayOffset: 9,
    hourOffset: 20,
    skillRequirements: ["TB+"],
    maxPlayers: 8,
    currentPlayersCount: 7,
    matchType: "doubles",
    price: 125000,
    notes: "Gần full, còn 1 chỗ",
  },
  {
    title: "Buổi sáng TP.HCM",
    dayOffset: 10,
    hourOffset: 9,
    skillRequirements: ["Khá-"],
    maxPlayers: 4,
    currentPlayersCount: 2,
    matchType: "singles",
    price: 160000,
    notes: "Đánh nhanh, gọn, ít người",
  },
  {
    title: "Mix trình độ trung bình",
    dayOffset: 11,
    hourOffset: 19,
    skillRequirements: ["Khá"],
    maxPlayers: 8,
    currentPlayersCount: 8,
    matchType: "mixed doubles",
    price: 105000,
    notes: "Buổi này đã đầy để test lọc full",
    status: "full",
  },
  {
    title: "Giao lưu cuối tuần mở",
    dayOffset: 12,
    hourOffset: 14,
    skillRequirements: ["Khá+"],
    maxPlayers: 8,
    currentPlayersCount: 2,
    matchType: "doubles",
    price: 95000,
    notes: "Còn nhiều chỗ cho test danh sách mở",
  },
  {
    title: "Đánh đơn kỹ thuật",
    dayOffset: 13,
    hourOffset: 17,
    skillRequirements: ["Pro"],
    maxPlayers: 4,
    currentPlayersCount: 4,
    matchType: "singles",
    price: 180000,
    notes: "Mức cao, đã đủ người",
    status: "full",
  },
  {
    title: "Sân luyện phản xạ",
    dayOffset: 14,
    hourOffset: 18,
    skillRequirements: ["Bán chuyên"],
    maxPlayers: 8,
    currentPlayersCount: 5,
    matchType: "doubles",
    price: 135000,
    notes: "Dành cho nhóm chơi đều tay",
  },
  {
    title: "Buổi trình diễn",
    dayOffset: 15,
    hourOffset: 21,
    skillRequirements: ["Trình giải"],
    maxPlayers: 4,
    currentPlayersCount: 4,
    matchType: "singles",
    price: 200000,
    notes: "Dữ liệu mức cao nhất để test lọc theo trình độ",
    status: "completed",
  },
  {
    title: "Buổi tối Đà Nẵng",
    dayOffset: 16,
    hourOffset: 19,
    skillRequirements: ["TB"],
    maxPlayers: 8,
    currentPlayersCount: 6,
    matchType: "mixed doubles",
    price: 98000,
    notes: "Một buổi mở khác ở Đà Nẵng",
  },
  {
    title: "Buổi sáng Cầu Giấy",
    dayOffset: 17,
    hourOffset: 7,
    skillRequirements: ["Yếu"],
    maxPlayers: 6,
    currentPlayersCount: 6,
    matchType: "doubles",
    price: 85000,
    notes: "Đã đủ người để test trạng thái full",
    status: "full",
  },
  {
    title: "Buổi chiều Thanh Xuân",
    dayOffset: 18,
    hourOffset: 16,
    skillRequirements: ["TBY+"],
    maxPlayers: 8,
    currentPlayersCount: 3,
    matchType: "doubles",
    price: 125000,
    notes: "Thử lọc theo quận và mức trình độ",
  },
  {
    title: "Buổi tối cuối danh sách",
    dayOffset: 19,
    hourOffset: 20,
    skillRequirements: ["Khá"],
    maxPlayers: 8,
    currentPlayersCount: 2,
    matchType: "mixed doubles",
    price: 145000,
    notes: "Dữ liệu bổ sung để đủ 20 buổi",
    status: "cancelled",
    cancelReason: "Mưa lớn, dời lịch sang tuần sau",
  },
  {
    title: "Giao lưu ngoài giờ",
    dayOffset: 20,
    hourOffset: 18,
    skillRequirements: ["TB+"],
    maxPlayers: 6,
    currentPlayersCount: 2,
    matchType: "doubles",
    price: 99000,
    notes: "Buổi thêm để tổng dữ liệu phong phú hơn",
  },
];

async function main() {
  await mongoose.connect(MONGODB_URI, {
    dbName: process.env.DB_NAME ?? undefined,
  });

  const { User } = await import("../src/models/User.js");
  const { Venue } = await import("../src/models/Venue.js");
  const { Session } = await import("../src/models/Session.js");

  let users = await User.find().sort({ createdAt: 1 });
  if (users.length < 3) {
    await User.create([
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
    ]).catch(() => undefined);
    users = await User.find().sort({ createdAt: 1 });
  }

  const venueBlueprints = [
    {
      name: "Sân Cầu Lông Cầu Giấy",
      address: "123 Phố A",
      district: "Cầu Giấy",
      city: "Hà Nội",
      courtCount: 6,
      openingHours: { open: "06:00", close: "22:00" },
      priceRange: { min: 100000, max: 200000 },
      rating: 4.5,
      reviewCount: 24,
    },
    {
      name: "Sân Thanh Xuân",
      address: "45 Đường B",
      district: "Thanh Xuân",
      city: "Hà Nội",
      courtCount: 4,
      openingHours: { open: "07:00", close: "21:00" },
      priceRange: { min: 80000, max: 150000 },
      rating: 4.1,
      reviewCount: 11,
    },
    {
      name: "Sân Ba Đình Arena",
      address: "88 Liễu Giai",
      district: "Ba Đình",
      city: "Hà Nội",
      courtCount: 5,
      openingHours: { open: "06:30", close: "22:30" },
      priceRange: { min: 110000, max: 210000 },
      rating: 4.6,
      reviewCount: 19,
    },
    {
      name: "Saigon Smash Court",
      address: "12 Nguyễn Huệ",
      district: "Quận 1",
      city: "TP.HCM",
      courtCount: 7,
      openingHours: { open: "06:00", close: "23:00" },
      priceRange: { min: 120000, max: 240000 },
      rating: 4.7,
      reviewCount: 31,
    },
    {
      name: "Thủ Đức Sports Hub",
      address: "99 Võ Văn Ngân",
      district: "Thủ Đức",
      city: "TP.HCM",
      courtCount: 8,
      openingHours: { open: "05:30", close: "22:00" },
      priceRange: { min: 90000, max: 180000 },
      rating: 4.4,
      reviewCount: 28,
    },
    {
      name: "Đà Nẵng Shuttle Club",
      address: "27 Trần Phú",
      district: "Hải Châu",
      city: "Đà Nẵng",
      courtCount: 4,
      openingHours: { open: "06:00", close: "21:30" },
      priceRange: { min: 70000, max: 140000 },
      rating: 4.3,
      reviewCount: 14,
    },
  ];

  const existingVenues = await Venue.find().sort({ createdAt: 1 });
  if (existingVenues.length < venueBlueprints.length) {
    const owner = users[0]?._id;
    const missing = venueBlueprints
      .slice(existingVenues.length)
      .map((venue) => ({
        ...venue,
        owner,
        images: [],
      }));
    if (missing.length > 0) {
      await Venue.create(missing).catch(() => undefined);
    }
  }

  const venues = await Venue.find().sort({ createdAt: 1 });
  if (venues.length === 0) {
    throw new Error("No venues available to create sessions");
  }

  const cleanupResult = await Session.deleteMany({
    slug: { $regex: /^session-(extra|more)-/ },
  });
  const currentCount = await Session.countDocuments();
  const runId = Date.now().toString(36);
  const docsToCreate = sessionBlueprints.map((blueprint, index) => {
    const venue = venues[index % venues.length];
    const host = users[index % users.length];
    return {
      title: blueprint.title,
      slug: `session-more-${runId}-${index + 1}`,
      venue: venue._id,
      venueName: venue.name,
      district: venue.district,
      city: venue.city,
      datetime: new Date(
        Date.now() +
          blueprint.dayOffset * 24 * 60 * 60 * 1000 +
          blueprint.hourOffset * 60 * 60 * 1000,
      ),
      skillRequirements: blueprint.skillRequirements,
      maxPlayers: blueprint.maxPlayers,
      currentPlayersCount: blueprint.currentPlayersCount,
      players: [{ user: host._id, status: "host" }],
      matchType: blueprint.matchType,
      price: blueprint.price,
      notes: blueprint.notes,
      host: host._id,
      status: blueprint.status ?? "open",
      cancelReason: blueprint.cancelReason ?? "",
    };
  });

  const createdSessions = await Session.create(docsToCreate);
  console.log(
    `Removed ${cleanupResult.deletedCount ?? 0} previous test sessions.`,
  );
  console.log(`Current session count before insert: ${currentCount}`);
  console.log(`Created ${createdSessions.length} new sessions.`);
  console.log(
    `Session count after insert: ${currentCount + createdSessions.length}`,
  );

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
