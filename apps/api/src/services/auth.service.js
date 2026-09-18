import mongoose from "mongoose";
import { getFirebaseAdminAuth } from "../config/firebaseAdmin.js";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { signJwt } from "../utils/token.js";
import { toUserDto, upsertFirebaseUser } from "./users.service.js";

export async function registerWithEmailPassword(payload) {
  const { email, password, name, phone, skillLevel, district, city } = payload;

  if (!email || !password || !name) {
    throw new AppError("Vui lòng điền đầy đủ họ tên, email và mật khẩu", 400);
  }

  if (password.length < 6) {
    throw new AppError("Mật khẩu phải có ít nhất 6 ký tự", 400);
  }

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    throw new AppError("Email này đã được sử dụng. Vui lòng đăng nhập.", 400);
  }

  try {
    const localUid = `local_${new mongoose.Types.ObjectId()}`;
    const user = await User.create({
      firebaseUid: localUid,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone ? phone.trim() : "",
      skillLevel: skillLevel || "TB",
      district: district ? district.trim() : "",
      city: city ? city.trim() : "Hồ Chí Minh",
      role: "player",
      reputation: 100,
      isActive: true,
    });

    const token = signJwt({
      sub: user._id.toString(),
      firebaseUid: user.firebaseUid,
      role: user.role,
    });

    return {
      token,
      user: toUserDto(user),
    };
  } catch (err) {
    if (err.code === 11000) {
      throw new AppError("Email này đã được đăng ký. Vui lòng đăng nhập.", 400);
    }
    throw err;
  }
}

export async function loginWithEmailPassword({ email, password }) {
  if (!email || !password) {
    throw new AppError("Vui lòng nhập email và mật khẩu", 400);
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
    "+password",
  );

  if (!user || !user.password) {
    throw new AppError("Email hoặc mật khẩu không chính xác", 401);
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new AppError("Email hoặc mật khẩu không chính xác", 401);
  }

  if (!user.isActive) {
    throw new AppError("Tài khoản của bạn đã bị vô hiệu hóa", 403);
  }

  user.lastActiveAt = new Date();
  await User.findByIdAndUpdate(user._id, {
    $set: { lastActiveAt: user.lastActiveAt },
  });

  const token = signJwt({
    sub: user._id.toString(),
    role: user.role,
  });

  return {
    token,
    user: toUserDto(user),
  };
}

export async function exchangeFirebaseIdToken(idToken) {
  const firebaseAuth = getFirebaseAdminAuth();

  if (!firebaseAuth) {
    throw new AppError("Firebase Admin credentials are not configured", 500);
  }

  const decoded = await firebaseAuth.verifyIdToken(idToken);
  let picture = decoded.picture;
  let displayName = decoded.name;
  let email = decoded.email;

  if (!picture || !displayName || !email) {
    const userRecord = await firebaseAuth.getUser(decoded.uid);
    picture = picture ?? userRecord.photoURL ?? "";
    displayName = displayName ?? userRecord.displayName ?? "";
    email = email ?? userRecord.email ?? "";
  }

  const user = await upsertFirebaseUser({
    uid: decoded.uid,
    email,
    name: displayName,
    picture,
  });

  const token = signJwt({
    sub: user._id.toString(),
    firebaseUid: user.firebaseUid,
    role: user.role,
  });

  return {
    token,
    user: toUserDto(user),
  };
}
