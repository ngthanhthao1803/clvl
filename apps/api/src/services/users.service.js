import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";

export function toUserDto(user) {
  if (!user) {
    return null;
  }

  return {
    id: user._id.toString(),
    firebaseUid: user.firebaseUid,
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    avatar: user.avatar,
    bio: user.bio,
    gender: user.gender,
    skillLevel: user.skillLevel,
    dominantHand: user.dominantHand,
    preferredPosition: user.preferredPosition,
    city: user.city,
    district: user.district,
    playSchedule: user.playSchedule,
    rating: user.rating,
    reputation: user.reputation,
    totalMatches: user.totalMatches,
    role: user.role,
    bankAccount: user.bankAccount ?? {
      bankId: "",
      bankName: "",
      accountNumber: "",
      accountHolder: "",
    },
    isVerifiedHost: Boolean(user.isVerifiedHost),
    hostedMatchesCount: user.hostedMatchesCount ?? 0,
    lastActiveAt: user.lastActiveAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function upsertFirebaseUser(firebaseProfile) {
  const payload = {
    firebaseUid: firebaseProfile.uid,
    name:
      firebaseProfile.name ?? firebaseProfile.email?.split("@")[0] ?? "Player",
    email: firebaseProfile.email,
    avatar: firebaseProfile.picture ?? undefined,
    lastActiveAt: new Date(),
    isActive: true,
    deletedAt: null,
  };

  if (!payload.avatar) {
    delete payload.avatar;
  }

  const user = await User.findOneAndUpdate(
    { firebaseUid: firebaseProfile.uid },
    { $set: payload, $setOnInsert: { totalMatches: 0, reputation: 100 } },
    { new: true, upsert: true },
  );

  return user;
}

export async function getUserById(userId) {
  const user = await User.findOne({ _id: userId, isActive: true });
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user;
}

export async function updateMe(userId, updates) {
  const user = await User.findOneAndUpdate(
    { _id: userId, isActive: true },
    { $set: updates },
    { new: true, runValidators: true },
  );

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
}

export async function listPlayers(filters = {}) {
  const query = { isActive: true };

  if (filters.city) query.city = filters.city;
  if (filters.district) query.district = filters.district;
  if (filters.skillLevel) query.skillLevel = filters.skillLevel;

  return User.find(query)
    .sort({ reputation: -1, rating: -1, createdAt: -1 })
    .limit(50);
}

export async function deactivateMe(userId) {
  const user = await User.findOneAndUpdate(
    { _id: userId, isActive: true },
    { $set: { isActive: false, deletedAt: new Date() } },
    { new: true },
  );

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
}
