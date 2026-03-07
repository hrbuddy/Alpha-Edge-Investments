// ── Anonymous session tracking (localStorage) ────────────────────────────────

const ANON_ID_KEY       = "vc_anon_id";
const ANON_REPORTS_KEY  = "vc_anon_reports";
const ANON_DCF_KEY      = "vc_anon_dcf";
const ANON_PORT_KEY     = "vc_anon_portfolio_runs";

export const MAX_ANON_REPORTS  = 3;
export const MAX_ANON_DCF      = 3;
export const MAX_ANON_PORTFOLIO = 1;

// ── Stable anon ID ────────────────────────────────────────────────────────────
export function getAnonId() {
  let id = localStorage.getItem(ANON_ID_KEY);
  if (!id) {
    id = "anon_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
    localStorage.setItem(ANON_ID_KEY, id);
  }
  return id;
}

// ── REPORTS ───────────────────────────────────────────────────────────────────
export function getAnonReports() {
  try { return JSON.parse(localStorage.getItem(ANON_REPORTS_KEY) || "[]"); }
  catch { return []; }
}
export function canAnonViewReport(ticker) {
  const seen = getAnonReports();
  if (seen.includes(ticker)) return true;
  return seen.length < MAX_ANON_REPORTS;
}
export function recordAnonReport(ticker) {
  const seen = getAnonReports();
  if (!seen.includes(ticker)) { seen.push(ticker); localStorage.setItem(ANON_REPORTS_KEY, JSON.stringify(seen)); }
  return seen;
}
export function anonReportsRemaining() {
  return Math.max(0, MAX_ANON_REPORTS - getAnonReports().length);
}
export function flushAnonReports() {
  const tickers = getAnonReports();
  localStorage.removeItem(ANON_REPORTS_KEY);
  return tickers;
}

// ── DCF (view-only, 3 tickers) ────────────────────────────────────────────────
export function getAnonDCF() {
  try { return JSON.parse(localStorage.getItem(ANON_DCF_KEY) || "[]"); }
  catch { return []; }
}
// Returns { allowed, viewOnly }
// - Already seen ticker → re-open allowed, viewOnly
// - New ticker under cap → allowed, viewOnly
// - New ticker over cap  → not allowed
export function canAnonViewDCF(ticker) {
  const seen = getAnonDCF();
  if (seen.includes(ticker)) return { allowed: true, viewOnly: true };
  if (seen.length < MAX_ANON_DCF) return { allowed: true, viewOnly: true };
  return { allowed: false, viewOnly: false };
}
export function recordAnonDCF(ticker) {
  const seen = getAnonDCF();
  if (!seen.includes(ticker)) { seen.push(ticker); localStorage.setItem(ANON_DCF_KEY, JSON.stringify(seen)); }
  return seen;
}
export function anonDCFRemaining() {
  return Math.max(0, MAX_ANON_DCF - getAnonDCF().length);
}
export function flushAnonDCF() {
  const tickers = getAnonDCF();
  localStorage.removeItem(ANON_DCF_KEY);
  return tickers;
}

// ── PORTFOLIO (1 run) ─────────────────────────────────────────────────────────
export function getAnonPortfolioRuns() {
  return parseInt(localStorage.getItem(ANON_PORT_KEY) || "0", 10);
}
export function canAnonRunPortfolio() {
  return getAnonPortfolioRuns() < MAX_ANON_PORTFOLIO;
}
export function recordAnonPortfolio() {
  localStorage.setItem(ANON_PORT_KEY, String(getAnonPortfolioRuns() + 1));
}

// ── Per-user viewed-badge store (localStorage, keyed by userKey) ──────────────
// Used purely for the VIEWED badge UI — survives refresh, no Firestore needed.
const USER_REPORTS_PREFIX = "vc_user_reports_";

export function getUserViewedReports(userKey) {
  if (!userKey) return [];
  try { return JSON.parse(localStorage.getItem(USER_REPORTS_PREFIX + userKey) || "[]"); }
  catch { return []; }
}

export function saveUserViewedReport(userKey, ticker) {
  if (!userKey) return;
  const seen = getUserViewedReports(userKey);
  if (!seen.includes(ticker)) {
    seen.push(ticker);
    localStorage.setItem(USER_REPORTS_PREFIX + userKey, JSON.stringify(seen));
  }
}