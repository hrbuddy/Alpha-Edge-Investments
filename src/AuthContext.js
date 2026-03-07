import { createContext, useContext, useState, useEffect, useRef } from "react";
import { onAuthStateChanged, signInWithPopup, signOut as fbSignOut } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, googleProvider, db } from "./firebase";
import { flushAnonReports } from "./anonSession";
import { mergeAnonReports, getOrCreateUsage } from "./usageService";

export const AuthContext = createContext();

// Saves every user to Firestore users collection
async function saveUserToFirestore(firebaseUser) {
  if (!firebaseUser) return;
  try {
    await setDoc(doc(db, "users", firebaseUser.uid), {
      uid:      firebaseUser.uid,
      name:     firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
      email:    firebaseUser.email,
      photoURL: firebaseUser.photoURL || null,
      provider: firebaseUser.providerData?.[0]?.providerId || "unknown",
      lastSeen: serverTimestamp(),
    }, { merge: true });
    // joinedAt only written once — merge won't overwrite
    await setDoc(doc(db, "users", firebaseUser.uid), {
      joinedAt: serverTimestamp(),
    }, { merge: true });
  } catch (e) {
    console.warn("Firestore write failed:", e);
  }
}

// Merges anon localStorage reports into Firestore on first sign-in
async function mergeAndSeedUsage(uid) {
  const anonTickers = flushAnonReports(); // clears localStorage, returns tickers
  await getOrCreateUsage(uid);            // creates usage doc if it doesn't exist
  if (anonTickers.length > 0) {
    await mergeAnonReports(uid, anonTickers);
  }
}

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const mergedRef = useRef(new Set()); // track which uids we've already merged

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const u = {
          uid:      firebaseUser.uid,
          name:     firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
          email:    firebaseUser.email,
          photoURL: firebaseUser.photoURL || null,
        };
        setUser(u);
        localStorage.setItem("ae_user", JSON.stringify(u));
        // Merge anon session once per uid per app session
        if (!mergedRef.current.has(firebaseUser.uid)) {
          mergedRef.current.add(firebaseUser.uid);
          mergeAndSeedUsage(firebaseUser.uid).catch(console.warn);
        }
      } else {
        const saved = localStorage.getItem("ae_user");
        if (saved) {
          try { setUser(JSON.parse(saved)); } catch {}
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // ── Google Sign-In ──────────────────────────────────────────────────────────
  async function signInWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider);
    await saveUserToFirestore(result.user);
    return result.user;
  }

  // ── Email Sign-Up (legacy) ──────────────────────────────────────────────────
  async function signUp(name, email) {
    const u = { name, email, joinedAt: new Date().toISOString() };
    setUser(u);
    localStorage.setItem("ae_user", JSON.stringify(u));
    try {
      const key = email.replace(/[.#$[\]]/g, "_");
      await setDoc(doc(db, "users", key), {
        name, email,
        provider: "email",
        joinedAt: serverTimestamp(),
        lastSeen: serverTimestamp(),
        isPaid:   false,
        plan:     "free",
        usage: { reportsViewed: [], dcfOpened: [], portfolioRuns: 0 },
      }, { merge: true });
      // Merge anon reports for email sign-up too
      const anonTickers = flushAnonReports();
      if (anonTickers.length > 0) {
        await mergeAnonReports(key, anonTickers);
      }
    } catch (e) {
      console.warn("Firestore write failed:", e);
    }
  }

  // ── Sign Out ────────────────────────────────────────────────────────────────
  async function signOut() {
    try { await fbSignOut(auth); } catch {}
    setUser(null);
    localStorage.removeItem("ae_user");
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}