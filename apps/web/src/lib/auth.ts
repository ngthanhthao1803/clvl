import { signInWithPopup, signOut } from "firebase/auth";
import { firebaseAuth, firebaseConfigError, googleProvider } from "./firebase";
import { api } from "./api";

export async function signInWithGoogle() {
  if (firebaseConfigError) {
    throw new Error(
      `${firebaseConfigError}. Update apps/web/.env.local and restart the web dev server.`,
    );
  }

  const result = await signInWithPopup(firebaseAuth, googleProvider);
  const idToken = await result.user.getIdToken();
  const response = await api.post("/auth/firebase", { idToken });

  return {
    firebaseUser: result.user,
    token: response.data.data.token as string,
    user: response.data.data.user as {
      id: string;
      name: string;
      avatar?: string;
      email?: string;
      skillLevel?: string;
      city?: string;
    },
  };
}

export async function signOutSession() {
  await signOut(firebaseAuth);
  localStorage.removeItem("clvl-jwt");
}
