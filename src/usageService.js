// ── Usage service — Firestore operations for signed-in users ─────────────────
// All reads/writes go to: Firestore → users/{uid}
//
// Document shape:
// {
//   uid, name, email, provider, joinedAt, lastSeen,
//   isPaid: false,
//   plan:   "free" | "paid",
//   paidAt: null,
//   paidUntil: null,
//   usage: {
//     reportsViewed: ["BAJFINANCE", "NAUKRI"],   ← array of tickers
//     dcfOpened:     ["BAJFINANCE"],
//     portfolioRuns: 4,
//   }
// }

import { doc, getDoc, setDoc, updateDoc, arrayUnion, increment } from "firebase/firestore";
import { db } from "./firebase";

// ── Access limits per plan ────────────────────────────────────────────────────
export const LIMITS = {
  free: { reports: 3, dcf: 3, portfolio: 10 },
  paid: { reports: Infinity, dcf: Infinity, portfolio: Infinity },
};

// ── Default usage block ───────────────────────────────────────────────────────
const DEFAULT_USAGE = {
  isPaid:    false,
  plan:      "free",
  paidAt:    null,
  paidUntil: null,
  usage: {
    reportsViewed: [],
    dcfOpened:     [],
    portfolioRuns: 0,
  },
};

// ── Get user doc (creates default if missing) ────────────────────────────────
export async function getOrCreateUsage(uid) {
  const ref  = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, DEFAULT_USAGE, { merge: true });
    return DEFAULT_USAGE;
  }
  // Ensure usage sub-object always exists (handles legacy docs)
  const data = snap.data();
  if (!data.usage) {
    await setDoc(ref, { usage: DEFAULT_USAGE.usage }, { merge: true });
    return { ...data, usage: DEFAULT_USAGE.usage };
  }
  return data;
}

// ── Merge anon localStorage tickers into Firestore on sign-up ────────────────
// This prevents users getting 3 fresh reports after signing up.
export async function mergeAnonReports(uid, anonTickers) {
  if (!anonTickers?.length) return;
  await setDoc(doc(db, "users", uid), {
    usage: { reportsViewed: arrayUnion(...anonTickers) },
  }, { merge: true });
}

// ── Track a report view ───────────────────────────────────────────────────────
export async function trackReportView(uid, ticker) {
  await setDoc(doc(db, "users", uid), {
    usage: { reportsViewed: arrayUnion(ticker) },
  }, { merge: true });
}

// ── Track a DCF open ──────────────────────────────────────────────────────────
export async function trackDCFOpen(uid, ticker) {
  await setDoc(doc(db, "users", uid), {
    usage: { dcfOpened: arrayUnion(ticker) },
  }, { merge: true });
}

// ── Track a portfolio simulation run ─────────────────────────────────────────
export async function trackPortfolioRun(uid) {
  await updateDoc(doc(db, "users", uid), {
    "usage.portfolioRuns": increment(1),
  });
}

// ── Mark user as paid (called by payment webhook / manual override) ───────────
export async function setPaid(uid, paidUntilDate) {
  await setDoc(doc(db, "users", uid), {
    isPaid:    true,
    plan:      "paid",
    paidAt:    new Date().toISOString(),
    paidUntil: paidUntilDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  }, { merge: true });
}

// ── Pure access-check function (no async, works on already-loaded userData) ───
// Returns { allowed: bool, remaining: number | null }
// remaining = null means "already seen, unlimited re-access"
export function canAccess(userData, action, ticker = null) {
  const isPaid  = userData?.isPaid || false;
  const usage   = userData?.usage  || DEFAULT_USAGE.usage;
  const limits  = isPaid ? LIMITS.paid : LIMITS.free;

  switch (action) {
    case "report": {
      if (isPaid) return { allowed: true, remaining: null };
      // Already seen this ticker → always allow re-read
      if (ticker && usage.reportsViewed?.includes(ticker))
        return { allowed: true, remaining: null };
      const used      = usage.reportsViewed?.length || 0;
      const remaining = limits.reports - used;
      return { allowed: remaining > 0, remaining: Math.max(0, remaining) };
    }
    case "dcf": {
      if (isPaid) return { allowed: true, remaining: null };
      // Already opened this DCF → always allow
      if (ticker && usage.dcfOpened?.includes(ticker))
        return { allowed: true, remaining: null };
      const used      = usage.dcfOpened?.length || 0;
      const remaining = limits.dcf - used;
      return { allowed: remaining > 0, remaining: Math.max(0, remaining) };
    }
    case "portfolio": {
      if (isPaid) return { allowed: true, remaining: null };
      const used      = usage.portfolioRuns || 0;
      const remaining = limits.portfolio - used;
      return { allowed: remaining > 0, remaining: Math.max(0, remaining) };
    }
    default:
      return { allowed: false, remaining: 0 };
  }
}