/**
 * useDCFData.js
 * Reads stock_dcf_data/{ticker} from Firestore for historical financials.
 *
 * Coverage is determined by stocksDB — if a stock has a `dcf` block, it's covered.
 * Analyst assumptions are derived from stocksDB.finData projection rows (type:"P")
 * + dcf.wacc + dcf.termGrowth. No manual Firestore entry needed.
 *
 * Workflow for new covered stocks:
 *   1. Add stock to stocksDB with finData (type:"P" rows) + dcf: { wacc, termGrowth, note }
 *   2. Run stock_dcf_fetch.py to populate Firestore historical data
 *   3. Done — VC IV tile and vs Analyst tab appear automatically
 */

import { useState, useEffect } from "react";
import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import { STOCKS } from "./dashboards/stocksDB";

// ── useDCFData hook ───────────────────────────────────────────────────────────
export function useDCFData(ticker) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!ticker) { setLoading(false); setError("No ticker provided"); return; }
    setLoading(true); setError(null); setData(null);

    getDoc(doc(db, "stock_dcf_data", ticker))
      .then(snap => {
        if (!snap.exists()) {
          setError(`No DCF data found for ${ticker}. Run: python stock_dcf_fetch.py ${ticker}`);
          return;
        }
        const raw    = snap.data();
        const annual = (raw.annual || []).map(r => convertRow(r));

        // Coverage + analyst assumptions come from stocksDB — not Firestore
        const dbEntry = STOCKS[ticker];
        const covered = !!(dbEntry?.dcf);
        const analyst = covered ? deriveAnalystAssumptions(dbEntry) : null;

        setData({ ...raw, annual, covered, analyst });
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [ticker]);

  return { data, loading, error };
}

// ── deriveAnalystAssumptions ──────────────────────────────────────────────────
// Derives the full assumption set from stocksDB.finData projection rows.
// Only wacc, termGrowth, note need to be manually set in the dcf block.
function deriveAnalystAssumptions(dbEntry) {
  const { dcf, finData = [] } = dbEntry;

  const hist = finData.filter(r => r.type === "H").sort((a, b) => a.yr > b.yr ? 1 : -1);
  const proj = finData.filter(r => r.type === "P").sort((a, b) => a.yr > b.yr ? 1 : -1);

  if (proj.length < 4) return null; // need at least 4 projection years // need 5 projection years

  // Last historical row for base-year revenue

  // Derive revGrowth: YoY % change using previous row as base
  const allRows = [...hist, ...proj];
  const revGrowth = proj.map((r, i) => {
    const prevRev = allRows[hist.length - 1 + i]?.rev;  // row before this projection
    if (!prevRev) return 12;
    return Math.round(((r.rev / prevRev) - 1) * 1000) / 10; // 1dp
  });

  // Derive ebitdaMargin directly from opm field
  const ebitdaMargin = proj.map(r => r.opm || 30);

  // Derive daRev: dep as % of rev
  const daRev = proj.map(r => {
    if (!r.dep || !r.rev) return 1.5;
    return Math.round((r.dep / r.rev) * 1000) / 10;
  });

  // Derive capexRev: avg capex % of rev across projection years
  const capexPcts = proj.map(r => r.capex && r.rev ? (r.capex / r.rev) * 100 : 2.0);
  const capexRev  = Math.round(capexPcts.reduce((a, b) => a + b, 0) / capexPcts.length * 10) / 10;

  return {
    revGrowth,
    ebitdaMargin,
    daRev,
    capexRev,
    wcRev:        dcf.wcRev        ?? 3.0,
    taxRate:      dcf.taxRate      ?? 25,
    interestRate: dcf.interestRate ?? 7.0,
    wacc:         dcf.wacc,
    termGrowth:   dcf.termGrowth,
    note:         dcf.note         || "",
    isNBFC:       dcf.isNBFC       ?? false,
  };
}

// ── seedAssumptions ───────────────────────────────────────────────────────────
// Called by GenericDCFTemplate to set initial user-facing assumptions.
// For covered stocks → uses analyst assumptions (VC model as starting point).
// For uncovered      → derives from yfinance historical averages.
export function seedAssumptions(data) {
  if (data?.analyst) return { ...data.analyst }; // covered — start from VC model

  // Uncovered — seed from yfinance averages
  const derived = data?.derived || {};
  const g  = clamp(derived.avg_rev_growth    || 15, 3,  45);
  const m  = clamp(derived.avg_ebitda_margin || 30, 5,  70);
  const da = clamp(derived.avg_da_pct        || 1.5,0.3,10);
  const cx = clamp(derived.avg_capex_pct     || 2.0,0.5,20);
  // Seed from actual historical interest/debt ratio; fall back to 7 if no debt
  const ir = clamp(derived.avg_interest_rate || 7.0, 2.0, 18.0);

  return {
    revGrowth:    [g, snap(g-1), snap(g-2), snap(g-3), snap(g-4)],
    ebitdaMargin: [m, m, m, m, m],
    daRev:        [da, da, da, da, da],
    capexRev:     cx,
    wcRev:        3.0,
    taxRate:      25,
    interestRate: ir,
    wacc:         10.0,
    termGrowth:   7.0,
  };
}

// ── helpers ───────────────────────────────────────────────────────────────────
function convertRow(r) {
  const INR_FIELDS = ["revenue","ebitda","ebit","da","interest_expense","pbt","tax","pat","cfo","capex","fcff",
                      "total_debt","total_equity","cash"];
  const out = { ...r };
  for (const f of INR_FIELDS) {
    if (out[f] != null) out[f] = Math.abs(out[f]) > 1e6 ? Math.round(out[f] / 1e7) : out[f];
  }
  return out;
}
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, Math.round(v * 10) / 10));
const snap  = v => Math.max(3, +(v).toFixed(1));