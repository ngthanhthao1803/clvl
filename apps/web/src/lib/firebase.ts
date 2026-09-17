import { initializeApp, getApps, getApp } from "firebase/app";
import { GoogleAuthProvider, getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "YOUR_FIREBASE_KEY",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ??
    "clvl-b4bcf.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "clvl-b4bcf",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ??
    "clvl-b4bcf.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "847127864640",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ??
    "1:847127864640:web:16d5bf8e50cf683795c6a5",
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "G-GHJSLJCJ95",
};

const missingKeys = [];
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "YOUR_FIREBASE_KEY") {
  missingKeys.push("NEXT_PUBLIC_FIREBASE_API_KEY");
}
if (!firebaseConfig.authDomain) {
  missingKeys.push("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
}
if (!firebaseConfig.projectId) {
  missingKeys.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
}
if (!firebaseConfig.appId) {
  missingKeys.push("NEXT_PUBLIC_FIREBASE_APP_ID");
}

export const firebaseConfigError = missingKeys.length
  ? `Missing Firebase config: ${missingKeys.join(", ")}`
  : null;

if (firebaseConfigError) {
  console.warn(firebaseConfigError);
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
