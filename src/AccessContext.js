// ── AccessContext ─────────────────────────────────────────────────────────────
// Single source of truth for access control across the app.
// Wrap your app in <AccessProvider> (inside AuthProvider, inside Router).
//
// Usage in any component:
//   const { checkReport, recordReport, showPaywall } = useAccess();
//
// Before showing gated content:
//   const { allowed, remaining } = checkReport("BAJFINANCE");
//   if (!allowed) { showPaywall({ type: "report", used: 3, total: 3 }); return; }
//   await recordReport("BAJFINANCE");

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import {
  getOrCreateUsage, trackReportView, trackDCFOpen,
  trackPortfolioRun, mergeAnonReports, LIMITS,
} from "./usageService";
import {
  canAnonViewReport, recordAnonReport, anonReportsRemaining,
  flushAnonReports, MAX_ANON_REPORTS,
  canAnonViewDCF, recordAnonDCF, anonDCFRemaining,
  canAnonRunPortfolio, recordAnonPortfolio, MAX_ANON_PORTFOLIO,
  getUserViewedReports, saveUserViewedReport,
} from "./anonSession";

const AccessContext = createContext();

// ── Session cache — lives outside React, updates synchronously ────────────────
// Solves React batching race: when user navigates DCF→DCF quickly,
// setUserData hasn't flushed yet. This cache is always current.
const _session = {
  reports:      new Set(),
  dcf:          new Set(),
  portfolioRuns: 0,
};
// Reset when user signs out
function resetSessionCache() {
  _session.reports.clear();
  _session.dcf.clear();
  _session.portfolioRuns = 0;
}

export function AccessProvider({ children }) {
  const { user }              = useAuth();

  // Custom auth stores { name, email, joinedAt } — no uid.
  // Derive a stable Firestore key from email (same as usageService expects).
  const userKey = user?.email ? user.email.toLowerCase().replace(/[^a-z0-9]/g, "_") : null;

  const [userData, setUserData] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [paywallConfig, setPaywallConfig] = useState(null);
  const [sessionViewed, setSessionViewed] = useState(new Set()); // triggers re-render on record

  // ── Load / reload user data from Firestore ──────────────────────────────────
  const loadUserData = useCallback(async (uid) => {
    if (!uid) {
      setUserData(null);
      setLoading(false);
      setSessionViewed(new Set());
      resetSessionCache();   // ← clear session on sign-out
      return;
    }
    setLoading(true);
    try {
      const data = await getOrCreateUsage(uid);
      setUserData(data);
    } catch (e) {
      console.warn("AccessContext: failed to load usage", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserData(userKey);
  }, [userKey, loadUserData]);

  // ── Merge anon session when user signs in / up ──────────────────────────────
  // Call this right after sign-up in AuthContext. Automatically flushes localStorage.
  const mergeAnonOnSignIn = useCallback(async () => {
    if (!userKey) return;
    const anonTickers = flushAnonReports();
    if (anonTickers.length > 0) {
      await mergeAnonReports(userKey, anonTickers);
    }
    await loadUserData(userKey);
  }, [userKey, loadUserData]);

  // ── REPORT ──────────────────────────────────────────────────────────────────
  const checkReport = useCallback((ticker) => {
    if (!user) {
      const allowed    = canAnonViewReport(ticker);
      const remaining  = anonReportsRemaining();
      const used       = MAX_ANON_REPORTS - remaining;
      return { allowed, remaining, used, total: MAX_ANON_REPORTS, isAnon: true };
    }
    const firestoreViewed = userData?.usage?.reportsViewed || [];
    const allViewed = new Set([...firestoreViewed, ..._session.reports]);
    const isPaid    = userData?.isPaid || false;
    if (isPaid)                  return { allowed: true, remaining: null };
    if (allViewed.has(ticker))   return { allowed: true, remaining: null };
    const used      = allViewed.size;
    const limit     = LIMITS.free.reports;
    const remaining = limit - used;
    return { allowed: remaining > 0, used, total: limit,
             remaining: Math.max(0, remaining) };
  }, [user, userData]);

  const recordReport = useCallback(async (ticker) => {
    if (!user) { recordAnonReport(ticker); return; }
    _session.reports.add(ticker);
    setSessionViewed(prev => new Set([...prev, ticker])); // ← triggers re-render
    setUserData(prev => {
      if (!prev || prev.usage?.reportsViewed?.includes(ticker)) return prev;
      return { ...prev, usage: { ...prev.usage,
        reportsViewed: [...(prev.usage?.reportsViewed || []), ticker] }};
    });
    // Save to localStorage immediately — survives refresh regardless of Firestore rules
    saveUserViewedReport(userKey, ticker);
    // Also persist to Firestore (best-effort — badge works even if this fails)
    try { await trackReportView(userKey, ticker); }
    catch (e) { console.warn("trackReportView failed:", e); }
  }, [user, userKey]);

  // ── DCF ─────────────────────────────────────────────────────────────────────
  const checkDCF = useCallback((ticker) => {
    if (!user) {
      const { allowed, viewOnly } = canAnonViewDCF(ticker);
      const remaining = anonDCFRemaining();
      return { allowed, viewOnly, remaining, requiresSignup: !allowed };
    }
    // Merge Firestore array + session cache for reliable count
    const firestoreOpened = userData?.usage?.dcfOpened || [];
    const allOpened = new Set([...firestoreOpened, ..._session.dcf]);
    const isPaid    = userData?.isPaid || false;
    if (isPaid)                   return { allowed: true, viewOnly: false, remaining: null };
    if (allOpened.has(ticker))    return { allowed: true, viewOnly: false, remaining: null };
    const used      = allOpened.size;
    const limit     = LIMITS.free.dcf;
    const remaining = limit - used;
    return { allowed: remaining > 0, viewOnly: false, used, total: limit,
             remaining: Math.max(0, remaining) };
  }, [user, userData]);

  const recordDCF = useCallback(async (ticker) => {
    if (!user) { recordAnonDCF(ticker); return; }
    _session.dcf.add(ticker);   // ← synchronous, instant, no batching delay
    setUserData(prev => {
      if (!prev || prev.usage?.dcfOpened?.includes(ticker)) return prev;
      return { ...prev, usage: { ...prev.usage,
        dcfOpened: [...(prev.usage?.dcfOpened || []), ticker] }};
    });
    try { await trackDCFOpen(userKey, ticker); }
    catch (e) { console.warn("trackDCFOpen failed:", e); }
  }, [user, userKey]);

  // ── PORTFOLIO ────────────────────────────────────────────────────────────────
  const checkPortfolio = useCallback(() => {
    if (!user) {
      const allowed = canAnonRunPortfolio();
      return { allowed, remaining: allowed ? 1 : 0, requiresSignup: !allowed, total: MAX_ANON_PORTFOLIO };
    }
    const isPaid       = userData?.isPaid || false;
    if (isPaid)         return { allowed: true, remaining: null };
    const firestoreRuns = userData?.usage?.portfolioRuns || 0;
    const totalRuns     = firestoreRuns + _session.portfolioRuns;
    const remaining     = LIMITS.free.portfolio - totalRuns;
    return { allowed: remaining > 0, used: totalRuns,
             total: LIMITS.free.portfolio, remaining: Math.max(0, remaining) };
  }, [user, userData]);

  const recordPortfolioRun = useCallback(async () => {
    if (!user) { recordAnonPortfolio(); return; }
    _session.portfolioRuns += 1;   // ← synchronous
    setUserData(prev => {
      if (!prev) return prev;
      return { ...prev, usage: { ...prev.usage,
        portfolioRuns: (prev.usage?.portfolioRuns || 0) + 1 }};
    });
    try { await trackPortfolioRun(userKey); }
    catch (e) { console.warn("trackPortfolioRun failed:", e); }
  }, [user, userKey]);

  // ── Paywall controls ─────────────────────────────────────────────────────────
  // showPaywall({ type: "report"|"dcf"|"portfolio"|"signup", used, total, ticker })
  const showPaywall = useCallback((config) => setPaywallConfig(config), []);
  const hidePaywall = useCallback(() => setPaywallConfig(null), []);

  const isPaid = userData?.isPaid || false;
  const plan   = isPaid ? "paid" : (user ? "free" : "anonymous");

  // Live set — Firestore + in-session React state + localStorage fallback
  // localStorage is the reliable source — persists across refresh without Firestore rules
  const viewedReports = new Set([
    ...(userData?.usage?.reportsViewed || []),
    ...sessionViewed,
    ...(userKey ? getUserViewedReports(userKey) : []),
  ]);

  return (
    <AccessContext.Provider value={{
      loading, plan, isPaid, userData,
      checkReport,  recordReport,
      checkDCF,     recordDCF,
      checkPortfolio, recordPortfolioRun,
      mergeAnonOnSignIn,
      paywallConfig, showPaywall, hidePaywall,
      viewedReports,
    }}>
      {children}
    </AccessContext.Provider>
  );
}

export function useAccess() {
  const ctx = useContext(AccessContext);
  if (!ctx) throw new Error("useAccess must be used inside <AccessProvider>");
  return ctx;
}