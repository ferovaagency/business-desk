"use client";

import { onAuthStateChanged, signInWithPopup, signOut, type User } from "firebase/auth";
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { auth, db, googleProvider } from "@/lib/firebase";
import type { UserProfile } from "@/lib/types";

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (!currentUser) {
        setProfile(null);
        return;
      }

      const profileRef = doc(db, "users", currentUser.uid);
      const profileSnapshot = await getDoc(profileRef);

      if (!profileSnapshot.exists()) {
        await setDoc(profileRef, {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          credits: 0,
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        });
      }

      return onSnapshot(profileRef, (snapshot) => {
        setProfile(snapshot.data() as UserProfile);
      });
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      login: () => signInWithPopup(auth, googleProvider).then(() => undefined),
      logout: () => signOut(auth),
    }),
    [loading, profile, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return value;
}

