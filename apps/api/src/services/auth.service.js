import { getFirebaseAdminAuth } from "../config/firebaseAdmin.js";
import { AppError } from "../utils/AppError.js";
import { signJwt } from "../utils/token.js";
import { toUserDto, upsertFirebaseUser } from "./users.service.js";

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
