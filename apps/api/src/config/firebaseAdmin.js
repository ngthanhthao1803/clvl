import admin from "firebase-admin";
import { env } from "./env.js";

let firebaseApp = null;

export function isFirebaseAdminReady() {
  return Boolean(
    env.firebaseProjectId && env.firebaseClientEmail && env.firebasePrivateKey,
  );
}

export function getFirebaseAdminAuth() {
  if (!isFirebaseAdminReady()) {
    return null;
  }

  if (!firebaseApp) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.firebaseProjectId,
        clientEmail: env.firebaseClientEmail,
        privateKey: env.firebasePrivateKey.replace(/\\n/g, "\n"),
      }),
    });
  }

  return admin.auth(firebaseApp);
}
