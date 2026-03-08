/**
 * GenericDCFTemplate.js
 * Vantage Capital — Live DCF Lab (data-driven, any NSE ticker)
 * Layout, components and UX are IDENTICAL to BajajFinanceDCFModel.
 * Route: /dcf/:ticker  (specific routes like /dcf/BAJFINANCE load that model first)
 */

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAccess } from "./AccessContext";
import PaywallOverlay from "./PaywallOverlay";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell,
} from "recharts";
import { useDCFData, seedAssumptions } from "./useDCFData";

// ── Color tokens (identical to BajajFinanceDCFModel) ─────────────────────────
const NAVY  = "#0D1B2A";
const CARD  = "#162840";
const BLUE  = "#2E75B6";
const TEAL  = "#0E7C7B";
const GREEN = "#27AE60";
const RED   = "#C0392B";
const ORANGE= "#E67E22";
const GOLD  = "#D4A017";
const MUTED = "#94a3b8";
const DIM   = "#64748b";
const TEXT  = "#e2e8f0";

// ── Formatter helpers (identical to BajajFinanceDCFModel) ─────────────────────
const cr  = v => v == null ? "—" : `₹${Math.round(v).toLocaleString("en-IN")}`;
const pct = v => v == null ? "—" : `${v}%`;

// ── deepClone — mirrors Bajaj's deepClone exactly ─────────────────────────────
const deepClone = a => ({
  revGrowth:    [...a.revGrowth],
  ebitdaMargin: [...a.ebitdaMargin],
  daRev:        [...a.daRev],
  capexRev: a.capexRev, wcRev: a.wcRev,
  taxRate: a.taxRate, interestRate: a.interestRate ?? 7,
  wacc: a.wacc, termGrowth: a.termGrowth,
});

// ── Calculation Engine ────────────────────────────────────────────────────────
// hArr = historical rows, oldest first; a = assumptions; meta = Firestore meta
function runModel(hArr, a, meta, isNBFC) {
  if (!hArr?.length || !a) return null;
  const base = hArr[hArr.length - 1];       // most recent year
  let pRev  = base.revenue      || 0;
  let pEq   = base.total_equity || 0;
  let pDebt = base.total_debt   || 0;
  let pCash = base.cash         || 0;

  const pl = [], cf = [], bs = [];

  for (let i = 0; i < 5; i++) {
    const rev      = Math.round(pRev * (1 + a.revGrowth[i] / 100));
    const ebitda   = Math.round(rev  * a.ebitdaMargin[i] / 100);
    const da       = Math.round(rev  * a.daRev[i]        / 100);
    const ebit     = ebitda - da;
    const interest = Math.round(pDebt * (a.interestRate ?? 7) / 100);
    const pbt      = ebit - interest;
    const tax      = Math.round(Math.max(0, pbt) * a.taxRate / 100);
    const pat      = Math.max(0, pbt) - tax;
    const capex    = Math.round(rev  * a.capexRev / 100);
    const dwc      = Math.round((rev - pRev) * a.wcRev / 100);
    const cfo      = pat + da - dwc;
    const fcfe     = pat + da - capex - dwc;   // FCFE — equity cash flow, post-interest, post-tax

    // Simplified balance sheet
    const eq   = pEq   + Math.round(pat * 0.70);
    const bor  = Math.round(pDebt * (1 + a.revGrowth[i] / 100 * 0.5));
    const cash = Math.max(0, Math.round(pCash + cfo - capex));
    const totA = eq + bor;

    pl.push({ rev, ebitda, da, ebit, interest, pbt, tax, pat,
              ebitdaM: a.ebitdaMargin[i],
              patM: +(pat / rev * 100).toFixed(1),
              revGrowthPct: a.revGrowth[i] });
    cf.push({ cfo, capex, dwc, da, fcfe, cfi: -capex });
    bs.push({ eq, bor, cash, totA });

    pRev = rev; pEq = eq; pDebt = bor; pCash = cash;
  }

  // ── DCF — FCFE discounted at Cost of Equity → Equity Value directly ──────
  // FCFE = PAT + D&A − Capex − ΔNWC (post-interest, post-tax)
  // For NBFCs PAT ≈ FCFE already (same logic, lending capital IS working capital)
  const w  = a.wacc       / 100;   // treated as Cost of Equity
  const tg = a.termGrowth / 100;
  const ok = w > tg + 0.005;

  const flowArr = cf.map(r => r.fcfe);          // same for both industrial and NBFC
  const pvArr   = flowArr.map((f, i) => ok ? Math.round(f / Math.pow(1 + w, i + 1)) : 0);
  const pvFCFE  = pvArr.reduce((s, v) => s + v, 0);
  const tv      = ok ? Math.round(flowArr[4] * (1 + tg) / (w - tg)) : 0;
  const pvTV    = ok ? Math.round(tv / Math.pow(1 + w, 5)) : 0;
  const eqVal   = ok ? pvFCFE + pvTV : 0;       // Equity Value — no bridge needed

  const shares = meta?.shares_cr || 1;
  const cmp    = meta?.cmp       || 0;
  const iv     = ok && shares > 0 ? Math.round(eqVal / shares) : 0;

  return {
    pl, cf, bs, pvArr, pvFCFE, tv, pvTV, eqVal, iv,
    upside: ok && iv > 0 && cmp > 0 ? +((iv - cmp) / cmp * 100).toFixed(1) : null,
    ok: ok && iv > 0,
  };
}

function calcSensGrid(hArr, a, meta, isNBFC) {
  const baseW  = Math.round(a.wacc);
  const baseTg = Math.round(a.termGrowth);
  const ws  = [baseW-2, baseW-1, baseW, baseW+1, baseW+2].map(v => Math.max(1, v));
  const tgs = [baseTg-2, baseTg-1, baseTg, baseTg+1, baseTg+2].map(v => Math.max(1, v));
  return { ws, tgs, grid: ws.map(w => tgs.map(tg => {
    const spread = w - tg;
    const iv = spread <= 0 ? null : runModel(hArr, { ...a, wacc: w, termGrowth: tg }, meta, isNBFC)?.iv || null;
    return { iv, spread };
  })) };
}

// ── Loading skeleton (shimmer) ────────────────────────────────────────────────
function SkeletonDCF() {
  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 20px", fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      {[1,2,3,4,5,6,7,8].map(i => (
        <div key={i} style={{ display:"flex", gap:10, marginBottom:12 }}>
          <div style={{ width:"22%", height:13, borderRadius:4,
            background:"linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.09) 50%,rgba(255,255,255,0.04) 75%)",
            backgroundSize:"200% 100%", animation:"shimmer 1.4s infinite" }} />
          {[1,2,3,4,5,6,7].map(j => (
            <div key={j} style={{ flex:1, height:13, borderRadius:4,
              background:"linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.09) 50%,rgba(255,255,255,0.04) 75%)",
              backgroundSize:"200% 100%", animation:"shimmer 1.4s infinite" }} />
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Error state ───────────────────────────────────────────────────────────────
function ErrorState({ ticker, message }) {
  return (
    <div style={{ maxWidth:480, margin:"80px auto", textAlign:"center",
                  fontFamily:"'DM Sans',sans-serif", padding:"0 24px" }}>
      <div style={{ fontSize:36, marginBottom:16 }}>📊</div>
      <div style={{ fontSize:18, fontWeight:800, color:TEXT, marginBottom:8 }}>
        {ticker} — No DCF Data
      </div>
      <div style={{ fontSize:13, color:MUTED, marginBottom:24, lineHeight:1.6 }}>{message}</div>
      <div style={{ fontSize:11, color:DIM, fontFamily:"monospace",
                    background:"rgba(255,255,255,0.05)", padding:"10px 14px",
                    borderRadius:8, marginBottom:24, textAlign:"left" }}>
        $ python stock_dcf_fetch.py {ticker}
      </div>
      <Link to="/" style={{ padding:"10px 24px", borderRadius:999, background:GOLD,
        color:NAVY, fontWeight:700, fontSize:12, textDecoration:"none" }}>
        ← Home
      </Link>
    </div>
  );
}

// ── Inline editable cell — identical to BajajFinanceDCFModel ─────────────────
function EditCell({ rawValue, displayValue, onCommit, isModified, disabled }) {
  const [draft, setDraft] = useState(null);
  const commit = () => { if (draft !== null) onCommit(draft); setDraft(null); };
  if (disabled) {
    return (
      <span style={{
        display:"block", width:"100%", textAlign:"right", padding:"0 2px",
        color: isModified ? GOLD : GREEN, fontWeight: isModified ? 700 : 500,
        fontSize:13, cursor:"not-allowed", opacity:0.5,
      }}>{displayValue}</span>
    );
  }
  return (
    <input
      type="text" inputMode="decimal"
      value={draft !== null ? draft : displayValue}
      onFocus={() => setDraft(String(rawValue ?? ""))}
      onChange={e => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={e => { if (e.key === "Enter") e.target.blur(); if (e.key === "Escape") { setDraft(null); e.target.blur(); } }}
      style={{
        width:"100%", height:"100%", background:"transparent", border:"none",
        borderBottom: draft !== null ? `1px solid ${GOLD}` : "1px solid rgba(255,255,255,0.0)",
        color: isModified ? GOLD : GREEN, fontWeight: isModified ? 700 : 500,
        fontSize:13, textAlign:"right", padding:"0 2px", outline:"none",
        cursor:"text", fontFamily:"'DM Sans',sans-serif", caretColor:GOLD,
      }}
    />
  );
}

// ── StatTable — identical logic to BajajFinanceDCFModel ──────────────────────
// Adapted to accept dynamic histYears / projYears arrays
function StatTable({ rows, histYears = [], projYears = [], projOnly = false, viewOnly = false }) {
  const HIST_BG  = "#090f1a";
  const PROJ_BG  = "#0d1b2e";
  const EDIT_BG  = "#0e2030";
  const TOTAL_BG = `${GOLD}12`;
  const SEP_COL  = "rgba(255,255,255,0.05)";
  const ROW_H    = 36;
  const colCount = 1 + (projOnly ? 0 : histYears.length) + projYears.length;

  return (
    <div style={{ overflowX:"auto", marginBottom:20, borderRadius:8,
                  border:"1px solid rgba(255,255,255,0.07)",
                  WebkitOverflowScrolling:"touch", position:"relative" }}>
      <table style={{ borderCollapse:"collapse", fontSize:13, width:"100%",
                      minWidth: 200 + (projOnly ? 0 : histYears.length*90) + projYears.length*100,
                      tableLayout:"fixed" }}>
        <colgroup>
          <col style={{ width:210 }} />
          {!projOnly && histYears.map((_,i) => <col key={`h${i}`} style={{ width:90 }} />)}
          {projYears.map((_,i) => <col key={`p${i}`} style={{ width:100 }} />)}
        </colgroup>
        <thead>
          <tr style={{ background:"#07101c" }}>
            <th style={{
              padding:"9px 14px", textAlign:"left", color:GOLD, fontWeight:700,
              borderBottom:"1px solid rgba(255,255,255,0.1)",
              position:"sticky", left:0, zIndex:3, background:"#07101c",
              fontSize:11, letterSpacing:"0.08em", textTransform:"uppercase",
              boxShadow:"2px 0 8px rgba(0,0,0,0.5)",
              borderRight:"1px solid rgba(255,255,255,0.08)",
            }}>Line Item</th>
            {!projOnly && histYears.map(y => (
              <th key={y} style={{
                padding:"9px 10px", textAlign:"right", color:DIM, fontWeight:500,
                borderBottom:"1px solid rgba(255,255,255,0.1)",
                borderLeft:`1px solid ${SEP_COL}`, background:HIST_BG, fontSize:11,
              }}>{y}</th>
            ))}
            {projYears.map(y => (
              <th key={y} style={{
                padding:"9px 10px", textAlign:"right", color:GOLD, fontWeight:700,
                borderBottom:"1px solid rgba(255,255,255,0.1)",
                borderLeft:"1px solid rgba(212,160,23,0.15)",
                background:PROJ_BG, fontSize:11,
              }}>{y} <span style={{ color:`${GOLD}55`, fontSize:9 }}>E</span></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => {
            if (row.sep) return (
              <tr key={ri}><td colSpan={colCount} style={{ height:1, background:SEP_COL }} /></tr>
            );
            const isTot  = row.total;
            const isSub  = row.subtotal;
            const isRat  = row.sub;
            const isEdit = !!row.onEdit;
            const histBg = isTot ? `${GOLD}08` : HIST_BG;
            const projBg = isTot ? TOTAL_BG : isEdit ? EDIT_BG : PROJ_BG;

            return (
              <tr key={ri} style={{ height:ROW_H, borderBottom:`1px solid ${isTot ? `${GOLD}22` : SEP_COL}` }}>
                <td style={{
                  padding:"0 14px", height:ROW_H,
                  position:"sticky", left:0, zIndex:2,
                  background: isTot ? "#1a1500" : isEdit ? "#0a1c2c" : "#0d1b2e",
                  borderRight:"1px solid rgba(255,255,255,0.08)",
                  boxShadow:"2px 0 8px rgba(0,0,0,0.5)",
                  color: isTot ? GOLD : isSub ? TEXT : isEdit ? "#cde0f0" : MUTED,
                  fontWeight: isTot || isSub ? 700 : isEdit ? 600 : 400,
                  fontStyle: isRat ? "italic" : "normal",
                  fontSize:13, paddingLeft: isRat ? 24 : 14,
                  whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
                }}>{row.label}</td>

                {!projOnly && (row.hist || []).map((v, ci) => (
                  <td key={ci} style={{
                    padding:"0 10px", height:ROW_H, textAlign:"right",
                    color: isEdit ? "#3d6880" : isRat ? "#3d5570" : DIM,
                    fontWeight: isSub || isTot ? 600 : 400,
                    fontStyle: isRat ? "italic" : "normal",
                    background:histBg, borderLeft:`1px solid ${SEP_COL}`, fontSize:13,
                  }}>{row.fmt ? row.fmt(v) : cr(v)}</td>
                ))}

                {(row.proj || []).map((v, ci) => {
                  const isM  = row.modified?.[ci];
                  const base = isTot ? GOLD : isSub ? TEXT
                             : row.posNeg ? (v >= 0 ? GREEN : RED) : "#c8dae8";
                  const fw   = isTot || isSub ? 700 : 500;
                  const disp = row.fmt ? row.fmt(v) : cr(v);
                  return (
                    <td key={ci} style={{
                      padding: isEdit ? "0 6px" : "0 10px",
                      height:ROW_H, textAlign:"right",
                      background:projBg,
                      borderLeft:`1px solid ${isTot ? `${GOLD}22` : isEdit ? "rgba(46,117,182,0.15)" : SEP_COL}`,
                      fontStyle: isRat ? "italic" : "normal",
                      verticalAlign:"middle",
                    }}>
                      {isEdit ? (
                        <EditCell rawValue={v} displayValue={disp} isModified={isM}
                          disabled={viewOnly} onCommit={raw => row.onEdit(ci, raw)} />
                      ) : (
                        <span style={{ color: isM ? GOLD : base, fontWeight: isM ? 700 : fw,
                                       fontStyle: isRat ? "italic" : "normal" }}>{disp}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── PanelSection — identical to BajajFinanceDCFModel ─────────────────────────
function PanelSection({ label, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom:10 }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center",
        background:"transparent", border:"none", borderBottom:`1px solid ${GOLD}22`,
        padding:"6px 0", cursor:"pointer", marginBottom: open ? 8 : 0,
      }}>
        <span style={{ fontSize:9.5, fontWeight:800, color:GOLD,
                       letterSpacing:"0.12em", textTransform:"uppercase" }}>{label}</span>
        <span style={{ color:GOLD, fontSize:11, display:"inline-block",
                       transition:"transform 0.2s",
                       transform: open ? "rotate(0deg)" : "rotate(-90deg)" }}>▾</span>
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

// ── NoteButton — identical to BajajFinanceDCFModel ───────────────────────────
function NoteButton({ text }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} style={{
        background:"none", border:"none", cursor:"pointer",
        color:"rgba(255,255,255,0.4)", fontSize:11,
        display:"inline-flex", alignItems:"center", gap:4,
        padding:"0 0 10px", fontFamily:"'DM Sans',sans-serif", transition:"color 0.2s",
      }}
        onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.75)"}
        onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}
      >
        <span style={{ fontSize:13, lineHeight:1 }}>ⓘ</span>
      </button>
      {open && (
        <div onClick={() => setOpen(false)} style={{
          position:"fixed", inset:0, zIndex:3000,
          background:"rgba(0,0,0,0.55)", backdropFilter:"blur(4px)",
          display:"flex", alignItems:"center", justifyContent:"center", padding:24,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background:"#0f1e2d", border:"1px solid rgba(255,255,255,0.12)",
            borderRadius:12, padding:"24px 24px 20px", maxWidth:460, width:"100%",
            boxShadow:"0 24px 60px rgba(0,0,0,0.6)",
          }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
              <span style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.4)",
                             letterSpacing:"0.1em", textTransform:"uppercase" }}>Note</span>
              <button onClick={() => setOpen(false)} style={{
                background:"none", border:"none", cursor:"pointer",
                color:"rgba(255,255,255,0.35)", fontSize:20, lineHeight:1, padding:0 }}>×</button>
            </div>
            <div style={{ fontSize:13, color:"#e0e8f0", lineHeight:1.7 }}>{text}</div>
          </div>
        </div>
      )}
    </>
  );
}

// ── SliderRow — identical to BajajFinanceDCFModel ────────────────────────────
function SliderRow({ label, value, min, max, step = 0.5, onChange, modified, suffix = "%", disabled = false }) {
  return (
    <div style={{ marginBottom:6, opacity: disabled ? 0.45 : 1 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
        <span style={{ fontSize:10.5, color:MUTED }}>{label}</span>
        <span style={{ fontSize:11, fontWeight:700, color: modified ? BLUE : GOLD }}>{value}{suffix}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => !disabled && onChange(+e.target.value)}
        disabled={disabled}
        style={{ width:"100%", accentColor: modified ? BLUE : GOLD, height:3, cursor: disabled ? "not-allowed" : "pointer" }} />
    </div>
  );
}

// ── MetCard — identical to BajajFinanceDCFModel ───────────────────────────────
function MetCard({ label, value, sub, color = GOLD }) {
  return (
    <div style={{ background:CARD, border:`1px solid ${color}22`, borderRadius:8,
                  padding:"10px 14px", flex:1, minWidth:120 }}>
      <div style={{ fontSize:10, color:MUTED, letterSpacing:1, textTransform:"uppercase", marginBottom:3 }}>{label}</div>
      <div style={{ fontSize:20, fontWeight:800, color, fontFamily:"'DM Sans',sans-serif" }}>{value}</div>
      {sub && <div style={{ fontSize:10, color:DIM, marginTop:1 }}>{sub}</div>}
    </div>
  );
}

// ── ChartTooltip — identical to BajajFinanceDCFModel ─────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:NAVY, border:`1px solid ${GOLD}`, borderRadius:6, padding:"8px 12px", fontSize:12 }}>
      <div style={{ fontWeight:700, color:GOLD, marginBottom:4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color:p.color }}>
          {p.name}: {typeof p.value === "number" ? p.value.toLocaleString("en-IN") : p.value}
        </div>
      ))}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function GenericDCFTemplate() {
  const { ticker: rawTicker } = useParams();
  const ticker = rawTicker?.toUpperCase() || "";
  const navigate = useNavigate();

  const { checkDCF, recordDCF, loading: accessLoading } = useAccess();
  const [paywall,  setPaywall]  = useState(null);
  const [viewOnly, setViewOnly] = useState(false);

  // Reset on ticker change — component stays mounted between /dcf/A → /dcf/B
  useEffect(() => {
    setViewOnly(false);
    setPaywall(null);
  }, [ticker]);

  // Gate — fires after reset and after Firestore loads
  useEffect(() => {
    if (!ticker || accessLoading) return;
    const access = checkDCF(ticker);
    if (!access.allowed) {
      setPaywall({
        type:   access.requiresSignup ? "dcf_teaser" : "dcf",
        used:   access.used  ?? 0,
        total:  access.total ?? 3,
        ticker,
      });
    } else {
      setViewOnly(!!access.viewOnly);
      recordDCF(ticker);
    }
  }, [ticker, accessLoading]); // eslint-disable-line

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data, loading, error } = useDCFData(ticker);

  // ── State (mirrors BajajFinanceDCFModel exactly) ──────────────────────────
  const [assumptions, setAssumptions] = useState(null);
  const [tab,         setTab]         = useState(0);
  const [saved,       setSaved]       = useState(null);
  const [banner,      setBanner]      = useState(null);
  const [sheetOpen,   setSheetOpen]   = useState(false);
  const [panelOpen,   setPanelOpen]   = useState(true);
  const [cardsOpen,   setCardsOpen]   = useState(true);
  const [waccInputs,  setWaccInputs]  = useState({
    rfr:        7.0,
    mrp:        6.4,
    beta:       1.0,
    debtCost:   8.0,
    totalDebt:  0,
    marketCap:  0,
    useBuildup: true,   // auto-apply derived WACC on load
  });
  const setWacc = (key, val) => setWaccInputs(prev => ({ ...prev, [key]: val }));

  const defaultsRef    = useRef(null);
  const waccInitRef    = useRef(false);
  const [defaultModel, setDefaultModel] = useState(null);

  // ── Seed once data arrives ────────────────────────────────────────────────
  useEffect(() => {
    if (data && !defaultsRef.current) {
      const seeded = seedAssumptions(data);
      defaultsRef.current = deepClone(seeded);
      setAssumptions(deepClone(seeded));
    }
  }, [data]);

  // ── Seed WACC buildup from Firestore data ─────────────────────────────────
  useEffect(() => {
    if (data && !waccInitRef.current) {
      const annual  = data.annual || [];
      const last    = [...annual].sort((a,b) => +a.year - +b.year).pop() || {};
      const mcap    = data.meta?.market_cap_cr || 0;
      setWaccInputs(prev => ({
        ...prev,
        totalDebt: last.total_debt  || 0,
        marketCap: mcap,
      }));
      waccInitRef.current = true;
    }
  }, [data]);

  // ── WACC buildup computation (identical to BajajFinanceDCFModel) ──────────
  const taxRateForWacc = assumptions?.taxRate ?? 25;
  const coe       = +(waccInputs.rfr + waccInputs.beta * waccInputs.mrp).toFixed(2);
  const atCod     = +(waccInputs.debtCost * (1 - taxRateForWacc / 100)).toFixed(2);
  const totalCap  = waccInputs.totalDebt + waccInputs.marketCap;
  const dWt       = totalCap > 0 ? +(waccInputs.totalDebt / totalCap * 100).toFixed(1) : 0;
  const eWt       = +(100 - dWt).toFixed(1);
  const derivedWACC = +(coe * eWt / 100 + atCod * dWt / 100).toFixed(2);

  useEffect(() => {
    if (waccInputs.useBuildup && assumptions) {
      setAssumptions(prev => ({ ...deepClone(prev), wacc: derivedWACC }));
    }
  }, [derivedWACC, waccInputs.useBuildup]); // eslint-disable-line

  // ── Load SheetJS CDN ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!window.XLSX) {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
      document.head.appendChild(s);
    }
  }, []);

  // ── Derived constants from data ───────────────────────────────────────────
  const meta    = useMemo(() => data?.meta    || {}, [data]);
  const isNBFC  = !!meta.is_nbfc;
  const covered = !!data?.covered;
  const analyst = data?.analyst || null;
  const CMP     = meta.cmp      || 0;
  const SHARES  = meta.shares_cr|| 1;

  // hArr = historical rows, oldest-first (mirrors H in Bajaj)
  const hArr = useMemo(() =>
    [...(data?.annual || [])].sort((a,b) => +a.year - +b.year),
  [data]);

  // Year label arrays
  const H_YRS = useMemo(() => hArr.map(r => {
    const y = String(r.year); return `FY${y.slice(-2)}A`;
  }), [hArr]);

  const baseYear = useMemo(() => {
    const last = hArr[hArr.length - 1];
    return last ? parseInt(last.year) : 2025;
  }, [hArr]);

  const P_YRS = useMemo(() =>
    [1,2,3,4,5].map(i => `FY${String(baseYear + i).slice(-2)}E`),
  [baseYear]);

  // ── Live model ────────────────────────────────────────────────────────────
  const model = useMemo(() =>
    assumptions ? runModel(hArr, assumptions, meta, isNBFC) : null,
  [hArr, assumptions, meta, isNBFC]);

  // ── Default model — computed once after hArr + meta are stable ────────────
  // eslint-disable-next-line no-use-before-define
  useEffect(() => {
    if (defaultsRef.current && hArr.length > 0 && !defaultModel) {
      setDefaultModel(runModel(hArr, defaultsRef.current, meta, isNBFC));
    }
  }, [hArr, meta, isNBFC, defaultModel]);

  // ── Sensitivity grid ──────────────────────────────────────────────────────
  const { ws: sensWs, tgs: sensTgs, grid: sensGrid } = useMemo(() =>
    assumptions ? calcSensGrid(hArr, assumptions, meta, isNBFC)
                : { ws:[], tgs:[], grid:[] },
  [hArr, assumptions, meta, isNBFC]);

  // ── Helpers (mirrors Bajaj) ───────────────────────────────────────────────
  const isModified = useCallback((key, idx = null) => {
    const def = defaultsRef.current;
    if (!def || !assumptions) return false;
    if (idx !== null) return assumptions[key][idx] !== def[key][idx];
    return assumptions[key] !== def[key];
  }, [assumptions]);

  const set = useCallback((key, val, idx = null) => {
    setAssumptions(prev => {
      const next = deepClone(prev);
      if (idx !== null) next[key][idx] = val;
      else next[key] = val;
      return next;
    });
  }, []);

  const resetToAnalyst = () => {
    if (defaultsRef.current) {
      setAssumptions(deepClone(defaultsRef.current));
      setBanner(covered ? "↺ Reset to Vantage Capital model" : "↺ Reset to default assumptions");
      setTimeout(() => setBanner(null), 2500);
    }
  };
  const saveScenario  = () => { setSaved(deepClone(assumptions)); setBanner("Scenario saved"); setTimeout(() => setBanner(null), 2500); };
  const loadScenario  = () => { if (!saved) return; setAssumptions(deepClone(saved)); setBanner("Scenario loaded"); setTimeout(() => setBanner(null), 2500); };

  const exportExcel = () => {
    try {
      const XLSX = window.XLSX;
      if (!XLSX) { setBanner("Loading Excel library… try again in 2s"); setTimeout(() => setBanner(null), 3000); return; }
      if (!model) return;
      const wb = XLSX.utils.book_new();
      const hd = [...hArr];
      const allYrs = [...H_YRS, ...P_YRS];

      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        [`${ticker} — DCF Model | Vantage Capital`, ...Array(allYrs.length).fill("")],
        ["INCOME STATEMENT (₹ Crore)", ...allYrs],
        ["Revenue",        ...hd.map(r=>r.revenue||"—"),  ...model.pl.map(r=>r.rev)],
        ["YoY Growth (%)", ...hd.map((_,i)=>i===0?"—":+((hd[i].revenue/hd[i-1].revenue-1)*100).toFixed(1)), ...model.pl.map(r=>r.revGrowthPct)],
        ["EBITDA",         ...hd.map(r=>r.ebitda||"—"),   ...model.pl.map(r=>r.ebitda)],
        ["EBITDA Margin",  ...hd.map(r=>r.ebitda&&r.revenue?+(r.ebitda/r.revenue*100).toFixed(1)+"%" :"—"), ...model.pl.map(r=>r.ebitdaM+"%")],
        ["D&A",            ...hd.map(r=>r.da||"—"),       ...model.pl.map(r=>r.da)],
        ["EBIT",           ...hd.map(r=>{ const e=r.ebit??(r.ebitda!=null&&r.da!=null?r.ebitda-r.da:null); return e??("—"); }), ...model.pl.map(r=>r.ebit)],
        ["Tax",            ...hd.map(r=>r.tax??("—")),        ...model.pl.map(r=>r.tax)],
        ["NOPAT / PAT",    ...hd.map(r=>r.pat||"—"),      ...model.pl.map(r=>r.pat)],
        ["PAT Margin",     ...hd.map(r=>r.pat&&r.revenue?+(r.pat/r.revenue*100).toFixed(1)+"%":"—"), ...model.pl.map(r=>r.patM+"%")],
      ]), "Income Statement");

      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ["DCF VALUATION", ...P_YRS],
        [isNBFC?"PAT (₹ Cr)":"FCFE (₹ Cr)", ...model.cf.map(r=>isNBFC?model.pl[model.cf.indexOf(r)].pat:r.fcfe)],
        ["Discount Factor", ...model.pvArr.map((_,i)=>+(1/Math.pow(1+assumptions.wacc/100,i+1)).toFixed(4))],
        ["PV of FCFE (₹ Cr)", ...model.pvArr],
        [""],
        ["Sum PV Explicit (₹ Cr)",      model.pvFCFE],
        ["Terminal Value (₹ Cr)",        model.tv],
        ["PV of TV (₹ Cr)",             model.pvTV],
        ["Enterprise / Equity Value",    model.eqVal],
        ["Shares Outstanding (Cr)",      SHARES],
        ["Intrinsic Value / Share (₹)",  model.iv],
        ["CMP (₹)",                      CMP],
        ["Upside / Downside",            model.upside!=null?model.upside+"%":"—"],
        ["WACC",           assumptions.wacc+"%"],
        ["Terminal Growth",assumptions.termGrowth+"%"],
      ]), "DCF Valuation");

      XLSX.writeFile(wb, `${ticker}_DCF_VantageCapital_${new Date().toISOString().slice(0,10)}.xlsx`);
      setBanner("Excel downloaded ✓"); setTimeout(() => setBanner(null), 2500);
    } catch(e) { setBanner("Export failed"); setTimeout(() => setBanner(null), 3000); }
  };

  // ── Tabs (identical to BajajFinanceDCFModel) ──────────────────────────────
  const tabs = ["P&L", "Balance Sheet", "Cash Flow", "FCFE & DCF", "Sensitivity", "vs Analyst", "Key Metrics"];

  // ── Chart data (mirrors Bajaj chartData + fcffChartData) ─────────────────
  const chartData = useMemo(() => {
    if (!model) return [];
    return [
      ...hArr.map((r, i) => ({ yr:H_YRS[i], rev:r.revenue, ebitda:r.ebitda, pat:r.pat, type:"H" })),
      ...model.pl.map((r, i) => ({ yr:P_YRS[i], rev:r.rev, ebitda:r.ebitda, pat:r.pat, type:"P" })),
    ];
  }, [hArr, model, H_YRS, P_YRS]);

  const fcfeChartData = useMemo(() => {
    if (!model) return [];
    return model.cf.map((r, i) => ({
      yr: P_YRS[i], fcfe: r.fcfe, pv: model.pvArr[i],
    }));
  }, [model, P_YRS]);

  // ── All hooks done — early returns now safe ───────────────────────────────
  if (loading) return (
    <div style={{ background:NAVY, minHeight:"100vh" }}><SkeletonDCF /></div>
  );
  if (error || !data) return (
    <div style={{ background:NAVY, minHeight:"100vh", paddingTop:40 }}>
      <ErrorState ticker={ticker} message={error || "No data found."} />
    </div>
  );
  // If paywall triggered before data loads — show blurred skeleton + overlay
  if (!assumptions || !model) {
    if (paywall) return (
      <>
        <div style={{
          background: NAVY, minHeight: "100vh", paddingTop: 96,
          filter: "blur(4px) brightness(0.6)", pointerEvents: "none",
          fontFamily: "'DM Sans',sans-serif", padding: "96px 28px 40px",
        }}>
          {/* Skeleton header */}
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div style={{ height: 14, width: 220, background: "rgba(212,160,23,0.3)", borderRadius: 4, marginBottom: 12 }} />
            <div style={{ height: 28, width: 340, background: "rgba(255,255,255,0.08)", borderRadius: 6, marginBottom: 8 }} />
            <div style={{ height: 12, width: 180, background: "rgba(255,255,255,0.04)", borderRadius: 4, marginBottom: 28 }} />
            {/* Skeleton assumption rows */}
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                padding:"12px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ height: 11, width: 160, background: "rgba(255,255,255,0.06)", borderRadius: 3 }} />
                <div style={{ height: 16, width: 70, background: "rgba(212,160,23,0.15)", borderRadius: 4 }} />
              </div>
            ))}
            {/* Skeleton chart area */}
            <div style={{ height: 220, background: "rgba(255,255,255,0.03)", borderRadius: 8, marginTop: 28,
              border: "1px solid rgba(255,255,255,0.05)" }} />
          </div>
        </div>
        <PaywallOverlay config={paywall} onClose={() => navigate(-1)} />
      </>
    );
    return null;
  }

  // ── Paywall overlay ────────────────────────────────────────────────────────
  // paywall renders ON TOP of full page — removed early return for FOMO blur effect

  // ── View-only banner (anon users) ──────────────────────────────────────────
  const ViewOnlyBanner = viewOnly ? (
    <div style={{
      background:"rgba(212,160,23,0.08)", borderBottom:"1px solid rgba(212,160,23,0.2)",
      padding:"9px 20px", display:"flex", alignItems:"center", justifyContent:"space-between",
      flexWrap:"wrap", gap:8,
    }}>
      <span style={{ fontSize:11, color:"#D4A017", fontWeight:700 }}>
        👁 View-only mode — sign in to edit assumptions
      </span>
      <button
        onClick={() => navigate("/signup")}
        style={{ fontSize:10, fontWeight:800, color:"#0D1B2A", background:"#D4A017",
          border:"none", borderRadius:999, padding:"5px 14px", cursor:"pointer", letterSpacing:"0.5px" }}
      >
        SIGN IN FREE
      </button>
    </div>
  ) : null;
  const AssumptionPanel = (
    <div style={{ width:272, flexShrink:0, background:CARD, borderLeft:`1px solid ${GOLD}20`,
                  overflowY:"auto", padding:"14px 14px 80px", fontSize:11, position:"relative" }}>

      {/* View-only blocker — prevents ALL interaction with sliders */}
      {viewOnly && (
        <div onClick={() => navigate("/signup")} style={{
          position:"absolute", inset:0, zIndex:999, cursor:"pointer",
          background:"rgba(8,15,26,0.6)", backdropFilter:"blur(2px)",
          display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center", gap:10, padding:"20px",
        }}>
          <span style={{ fontSize:20 }}>🔐</span>
          <span style={{ fontSize:12, fontWeight:800, color:GOLD, textAlign:"center", lineHeight:1.4 }}>
            Sign in to edit assumptions
          </span>
          <span style={{ fontSize:10, color:"#5a7a94", textAlign:"center", lineHeight:1.5 }}>
            Free account · no credit card
          </span>
          <button style={{
            marginTop:4, padding:"7px 20px", borderRadius:999,
            background:GOLD, color:NAVY, border:"none",
            fontSize:10, fontWeight:800, letterSpacing:"0.5px", cursor:"pointer",
          }}>SIGN IN FREE</button>
        </div>
      )}

      <div style={{ fontSize:9.5, color:DIM, marginBottom:10 }}>Blue = modified from seeded default</div>

      <PanelSection label="Revenue Growth (% YoY)" defaultOpen={false}>
        {P_YRS.map((y, i) => (
          <SliderRow key={y} label={y} disabled={viewOnly} value={assumptions.revGrowth[i]} min={-15} max={60} step={0.1}
            modified={isModified("revGrowth", i)} onChange={v => set("revGrowth", v, i)} />
        ))}
      </PanelSection>

      <PanelSection label="EBITDA Margin (%)" defaultOpen={false}>
        {P_YRS.map((y, i) => (
          <SliderRow key={y} label={y} disabled={viewOnly} value={assumptions.ebitdaMargin[i]} min={-20} max={80} step={0.1}
            modified={isModified("ebitdaMargin", i)} onChange={v => set("ebitdaMargin", v, i)} />
        ))}
      </PanelSection>

      <PanelSection label="Operating Assumptions" defaultOpen={true}>
        <div style={{ fontSize:10, color:MUTED, marginBottom:4 }}>D&A % OF REVENUE</div>
        {P_YRS.map((y, i) => (
          <SliderRow key={y} label={y} disabled={viewOnly} value={assumptions.daRev[i]} min={0} max={10} step={0.1}
            modified={isModified("daRev", i)} onChange={v => set("daRev", v, i)} />
        ))}
        <SliderRow disabled={viewOnly} label="Capex % of Revenue" value={assumptions.capexRev} min={0.5} max={20} step={0.1}
          modified={isModified("capexRev")} onChange={v => set("capexRev", v)} />
        <SliderRow disabled={viewOnly} label="ΔWC % of Rev Change" value={assumptions.wcRev} min={0} max={10} step={0.1}
          modified={isModified("wcRev")} onChange={v => set("wcRev", v)} />
        <SliderRow disabled={viewOnly} label="Tax Rate" value={assumptions.taxRate} min={15} max={40} step={0.1}
          modified={isModified("taxRate")} onChange={v => set("taxRate", v)} />
        <SliderRow disabled={viewOnly} label="Interest Rate on Debt %" value={assumptions.interestRate ?? 7} min={0} max={15} step={0.1}
          modified={isModified("interestRate")} onChange={v => set("interestRate", v)} />
      </PanelSection>

      <PanelSection label="WACC Build-up" defaultOpen={false}>
        <div style={{ background:"#0a1420", borderRadius:6, padding:"10px 10px 6px",
                      border:`1px solid ${BLUE}22`, marginBottom:8 }}>
          <SliderRow disabled={viewOnly} label="Risk-Free Rate" value={waccInputs.rfr} min={4} max={12} step={0.1}
            modified={waccInputs.rfr !== 7.0} onChange={v => setWacc("rfr", v)} />
          <SliderRow disabled={viewOnly} label="Market Risk Premium" value={waccInputs.mrp} min={3} max={12} step={0.1}
            modified={waccInputs.mrp !== 6.4} onChange={v => setWacc("mrp", v)} />
          <SliderRow disabled={viewOnly} label="Beta" value={waccInputs.beta} min={0.3} max={2.5} step={0.05}
            modified={waccInputs.beta !== 1.0} onChange={v => setWacc("beta", v)} />
          <div style={{ display:"flex", justifyContent:"space-between", padding:"4px 0",
                        borderTop:"1px solid rgba(255,255,255,0.06)", marginTop:4 }}>
            <span style={{ fontSize:11, color:MUTED }}>Cost of Equity</span>
            <span style={{ fontSize:12, fontWeight:800, color:BLUE }}>{coe}%</span>
          </div>
          <div style={{ height:1, background:"rgba(255,255,255,0.05)", margin:"8px 0" }} />
          <SliderRow disabled={viewOnly} label="Pre-tax Cost of Debt" value={waccInputs.debtCost} min={1} max={15} step={0.1}
            modified={waccInputs.debtCost !== 8.0} onChange={v => setWacc("debtCost", v)} />
          <div style={{ display:"flex", justifyContent:"space-between", padding:"4px 0" }}>
            <span style={{ fontSize:11, color:MUTED }}>After-Tax Cost of Debt</span>
            <span style={{ fontSize:12, fontWeight:700, color:MUTED }}>{atCod}%</span>
          </div>
          <div style={{ height:1, background:"rgba(255,255,255,0.05)", margin:"8px 0" }} />
          <SliderRow disabled={viewOnly} label="Total Debt (₹ Cr)" value={waccInputs.totalDebt} min={0} max={Math.max(1000000, waccInputs.totalDebt*2)} step={100}
            modified={false} onChange={v => setWacc("totalDebt", v)} suffix="" />
          <SliderRow disabled={viewOnly} label="Market Cap (₹ Cr)" value={waccInputs.marketCap} min={0} max={Math.max(2000000, waccInputs.marketCap*2)} step={100}
            modified={false} onChange={v => setWacc("marketCap", v)} suffix="" />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginTop:6,
                        padding:"6px 0", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
            <div><div style={{fontSize:9,color:DIM}}>Debt Wt.</div><div style={{fontSize:13,fontWeight:700,color:ORANGE}}>{dWt}%</div></div>
            <div><div style={{fontSize:9,color:DIM}}>Equity Wt.</div><div style={{fontSize:13,fontWeight:700,color:GREEN}}>{eWt}%</div></div>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                        padding:"6px 0", borderTop:"1px solid rgba(255,255,255,0.06)", marginTop:2 }}>
            <span style={{ fontSize:11, fontWeight:700, color:GOLD }}>Derived WACC</span>
            <span style={{ fontSize:14, fontWeight:900, color:GOLD }}>{derivedWACC}%</span>
          </div>
          <button onClick={() => setWacc("useBuildup", !waccInputs.useBuildup)} style={{
            width:"100%", marginTop:8, padding:"5px 0", borderRadius:5, fontSize:10, cursor:"pointer",
            background: waccInputs.useBuildup ? `${GREEN}22` : "transparent",
            border:`1px solid ${waccInputs.useBuildup ? GREEN : GOLD}44`,
            color: waccInputs.useBuildup ? GREEN : DIM, fontWeight:700,
          }}>
            {waccInputs.useBuildup ? "✓ Using derived WACC" : "Apply derived WACC →"}
          </button>
        </div>
      </PanelSection>

      <PanelSection label="Valuation" defaultOpen={false}>
        <SliderRow disabled={viewOnly} label="WACC / CoE (manual)" value={assumptions.wacc} min={7} max={18} step={0.5}
          modified={isModified("wacc")}
          onChange={v => { set("wacc", v); setWacc("useBuildup", false); }} />
        <SliderRow disabled={viewOnly} label="Terminal Growth Rate" value={assumptions.termGrowth} min={3} max={10} step={0.1}
          modified={isModified("termGrowth")} onChange={v => set("termGrowth", v)} />
      </PanelSection>

      {/* Live valuation pill — identical to BajajFinanceDCFModel */}
      <div style={{ marginTop:10, padding:"12px 10px",
        background: model.upside > 0 ? `${GREEN}15` : `${RED}15`,
        borderRadius:8, border:`1px solid ${model.upside > 0 ? GREEN : RED}44`, textAlign:"center" }}>
        <div style={{ fontSize:10, color:MUTED, marginBottom:2 }}>INTRINSIC VALUE</div>
        <div style={{ fontSize:26, fontWeight:900, color: model.upside > 0 ? GREEN : RED, fontFamily:"'DM Sans',sans-serif" }}>
          {model.ok ? `₹${model.iv.toLocaleString("en-IN")}` : "Invalid"}
        </div>
        <div style={{ fontSize:11, color: model.upside > 0 ? GREEN : RED, fontWeight:700 }}>
          {model.ok
            ? `${model.upside > 0 ? "+" : ""}${model.upside}% vs CMP ₹${CMP.toLocaleString("en-IN")}`
            : "WACC ≤ terminal growth"}
        </div>
        <div style={{ fontSize:9.5, color:DIM, marginTop:4 }}>WACC {assumptions.wacc}% · TG {assumptions.termGrowth}%</div>
      </div>

      <NoteButton text={isNBFC
        ? "Revenue = NII + Fees (net of funding costs). PAT treated as equity cash flow for NBFC DCF. WACC = Cost of Equity proxy. No net debt deduction."
        : "FCFE = PAT + D&A − Capex − ΔNWC (equity cash flow, post-interest, post-tax). Discounted at Cost of Equity. Terminal value via Gordon Growth. Cost of Equity = risk-free rate + beta × equity premium."
      } />
    </div>
  );


  // ── P&L Tab (mirrors BajajFinanceDCFModel PLTab exactly) ──────────────────
  const PLTab = (
    <div>
      <NoteButton text={isNBFC
        ? "Revenue = NII + Fees + Other Income, already net of interest expense on borrowings. EBITDA = pre-provision operating profit. Projected rows in the table are directly editable — click any green cell."
        : "Revenue = total operating revenue. EBITDA = earnings before interest, tax, D&A. FCFE = PAT + D&A − Capex − ΔNWC (equity cash flow). Projected rows are directly editable — click any green cell."
      } />
      <StatTable histYears={H_YRS} projYears={P_YRS} viewOnly={viewOnly} rows={[
        { label:"Revenue (₹ Cr)", hist:hArr.map(r=>r.revenue), proj:model.pl.map(r=>r.rev), subtotal:true },
        { label:"  YoY Growth %", sub:true,
          hist:hArr.map((_,i)=>i===0?null:+((hArr[i].revenue/hArr[i-1].revenue-1)*100).toFixed(1)),
          proj:model.pl.map(r=>r.revGrowthPct), fmt:v=>v==null?"—":`${v}%`, posNeg:true,
          modified:assumptions.revGrowth.map((v,i)=>isModified("revGrowth",i)),
          onEdit:(ci,raw)=>{ const n=parseFloat(raw); if(!isNaN(n)) set("revGrowth",Math.min(60,Math.max(-15,n)),ci); } },
        { label:"EBITDA (₹ Cr)", hist:hArr.map(r=>r.ebitda), proj:model.pl.map(r=>r.ebitda), subtotal:true },
        { label:"  EBITDA Margin %", sub:true,
          hist:hArr.map(r=>r.revenue>0?+(r.ebitda/r.revenue*100).toFixed(1):null),
          proj:model.pl.map(r=>r.ebitdaM), fmt:pct,
          modified:assumptions.ebitdaMargin.map((v,i)=>isModified("ebitdaMargin",i)),
          onEdit:(ci,raw)=>{ const n=parseFloat(raw); if(!isNaN(n)) set("ebitdaMargin",Math.min(80,Math.max(-20,n)),ci); } },
        { label:"  D&A % of Revenue", sub:true,
          hist:hArr.map(r=>r.revenue>0?+(r.da/r.revenue*100).toFixed(1):null),
          proj:assumptions.daRev, fmt:pct,
          modified:assumptions.daRev.map((v,i)=>isModified("daRev",i)),
          onEdit:(ci,raw)=>{ const n=parseFloat(raw); if(!isNaN(n)) set("daRev",Math.min(10,Math.max(0,n)),ci); } },
        { label:"(-) D&A (₹ Cr)", hist:hArr.map(r=>r.da), proj:model.pl.map(r=>r.da) },
        { label:"EBIT (₹ Cr)",        hist:hArr.map(r=>r.ebit),             proj:model.pl.map(r=>r.ebit),     subtotal:true },
        { label:"(-) Interest (₹ Cr)",hist:hArr.map(r=>r.interest_expense), proj:model.pl.map(r=>r.interest) },
        { label:"PBT (₹ Cr)",         hist:hArr.map(r=>r.pbt),              proj:model.pl.map(r=>r.pbt),      subtotal:true },
        { label:"(-) Tax (₹ Cr)",     hist:hArr.map(r=>r.tax),              proj:model.pl.map(r=>r.tax) },
        { label:"Tax Rate %",
          hist:hArr.map(r=> r.pbt>0 && r.tax!=null ? +(r.tax/r.pbt*100).toFixed(1) : null),
          proj:model.pl.map(()=>assumptions.taxRate), fmt:pct,
          modified:[0,1,2,3,4].map(()=>isModified("taxRate")),
          onEdit:(_ci,raw)=>{ const n=parseFloat(raw); if(!isNaN(n)) set("taxRate",Math.min(40,Math.max(15,n))); } },
        { label:"NOPAT / PAT (₹ Cr)", hist:hArr.map(r=>r.pat), proj:model.pl.map(r=>r.pat), total:true },
        { label:"  PAT Margin", sub:true,
          hist:hArr.map(r=>r.revenue>0?+(r.pat/r.revenue*100).toFixed(1):null),
          proj:model.pl.map(r=>r.patM), fmt:pct },
      ]} />
      <div style={{ height:260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="yr" tick={{ fill:MUTED, fontSize:10 }} />
            <YAxis yAxisId="l" tick={{ fill:MUTED, fontSize:10 }} />
            <YAxis yAxisId="r" orientation="right" tick={{ fill:MUTED, fontSize:10 }} />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ fontSize:10 }} />
            <Bar yAxisId="l" dataKey="rev" name="Revenue (₹Cr)" radius={[3,3,0,0]}>
              {chartData.map((d,i) => <Cell key={i} fill={d.type==="P" ? `${BLUE}66` : BLUE} />)}
            </Bar>
            <Line yAxisId="r" dataKey="pat" name="PAT (₹Cr)" stroke={GOLD} strokeWidth={2} dot={{ r:2.5 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  // ── Balance Sheet Tab (mirrors BajajFinanceDCFModel BSTab) ─────────────────
  const BSTab = (
    <div>
      <div style={{ fontSize:11, color:MUTED, marginBottom:12 }}>
        {isNBFC
          ? "Loan book / AUM grows at same rate as revenue (NBFCs deploy capital to generate revenue). Equity builds via retained earnings (70% retention assumed). Borrowings maintain leverage ratio."
          : "Equity builds via 70% PAT retention. Debt scales at half the revenue growth rate. Projected balance sheet is simplified — use Bajaj Finance 3-statement model for a rigorous linked BS."
        }
      </div>
      <StatTable histYears={H_YRS} projYears={P_YRS} viewOnly={viewOnly} rows={[
        { label:"Total Equity (₹ Cr)", hist:hArr.map(r=>r.total_equity), proj:model.bs.map(r=>r.eq), subtotal:true },
        { label:"Total Debt / Borrowings (₹ Cr)", hist:hArr.map(r=>r.total_debt), proj:model.bs.map(r=>r.bor) },
        { label:"TOTAL ASSETS (₹ Cr)",
          hist:hArr.map(r=>(r.total_equity||0)+(r.total_debt||0)),
          proj:model.bs.map(r=>r.totA), total:true },
        { sep:true },
        { label:"Cash & Equivalents (₹ Cr)", hist:hArr.map(r=>r.cash), proj:model.bs.map(r=>r.cash) },
        { label:"Net Debt (₹ Cr)",
          hist:hArr.map(r=>(r.total_debt||0)-(r.cash||0)),
          proj:model.bs.map(r=>r.bor-r.cash) },
        { label:"  Debt / Equity (x)", sub:true,
          hist:hArr.map(r=>r.total_equity>0?+(r.total_debt/r.total_equity).toFixed(2):null),
          proj:model.bs.map(r=>r.eq>0?+(r.bor/r.eq).toFixed(2):null),
          fmt:v=>v==null?"—":`${v}x` },
      ]} />
    </div>
  );

  // ── Cash Flow Tab (mirrors BajajFinanceDCFModel CFTab) ─────────────────────
  const CFTab = (
    <div>
      <StatTable histYears={H_YRS} projYears={P_YRS} viewOnly={viewOnly} rows={[
        { label:"PAT (₹ Cr)",           hist:hArr.map(r=>r.pat),   proj:model.pl.map(r=>r.pat) },
        { label:"  (+) D&A (₹ Cr)",     hist:hArr.map(r=>r.da),    proj:model.cf.map(r=>r.da) },
        { label:"  (-) ΔWorking Capital",
          hist:hArr.map(()=>null), proj:model.cf.map(r=>r.dwc), posNeg:true },
        { label:"Cash from Operations (₹ Cr)", hist:hArr.map(r=>r.cfo), proj:model.cf.map(r=>r.cfo), subtotal:true },
        { sep:true },
        { label:"  (-) Capex (₹ Cr)",   hist:hArr.map(r=>r.capex), proj:model.cf.map(r=>r.capex) },
        { label:"Cash from Investing (₹ Cr)", hist:hArr.map(r=>r.capex?-r.capex:null), proj:model.cf.map(r=>-r.capex) },
        { sep:true },
        { label:"FCFE (₹ Cr)",
          hist:hArr.map(r=>r.cfo&&r.capex?r.cfo-r.capex:r.fcfe||null),
          proj:model.cf.map(r=>r.fcfe), total:true },
        { label:"  CFO / PAT %", sub:true,
          hist:hArr.map(r=>r.pat>0&&r.cfo?Math.round(r.cfo/r.pat*100):null),
          proj:model.cf.map((r,i)=>model.pl[i].pat>0?Math.round(r.cfo/model.pl[i].pat*100):null),
          fmt:v=>v==null?"—":`${v}%` },
      ]} />
      <div style={{ height:220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={fcfeChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="yr" tick={{ fill:MUTED, fontSize:11 }} />
            <YAxis tick={{ fill:MUTED, fontSize:11 }} />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ fontSize:11 }} />
            <Bar dataKey="fcfe" name={"FCFE (₹Cr)"} fill={TEAL} radius={[3,3,0,0]} />
            <Line dataKey="pv" name="PV of Cash Flow (₹Cr)" stroke={GOLD} strokeWidth={2} dot={{ r:3 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );


  // ── FCFE & DCF Tab (identical structure to BajajFinanceDCFModel DCFTab) ────
  const DCFTab = (
    <div>
      <NoteButton text={isNBFC
        ? "For NBFCs, lending capital IS working capital — ΔNWC inflates free cash flow. FCFE (PAT + D&A − Capex − ΔNWC) is used as equity cash flow, discounted at Cost of Equity. Use directionally — tiny WACC/TG spread changes drive large IV swings as terminal value dominates."
        : "FCFE = PAT + D&A − Capex − ΔNWC. This is post-interest, post-tax equity cash flow — discounted at Cost of Equity to get Equity Value directly. No EV bridge, no net debt adjustment. Terminal value via Gordon Growth: TV = FCFE₅ × (1+g) / (Ke−g)."
      } />

      {/* FCFE Bridge — identical to BajajFinanceDCFModel */}
      <div style={{ fontSize:11, fontWeight:700, color:MUTED, letterSpacing:"0.1em",
                    textTransform:"uppercase", marginBottom:8 }}>FCFE Bridge</div>
      <StatTable histYears={H_YRS} projYears={P_YRS} viewOnly={viewOnly} rows={[
        { label:"EBIT (₹ Cr)",          hist:hArr.map(r=>r.ebit),  proj:model.pl.map(r=>r.ebit) },
        { label:"  (-) Tax on EBIT",    hist:hArr.map(()=>null),   proj:model.pl.map(r=>r.tax), sub:true },
        { label:"NOPAT (₹ Cr)",         hist:hArr.map(r=>r.pat),   proj:model.pl.map(r=>r.nopat), subtotal:true },
        { label:"  (+) D&A (₹ Cr)",     hist:hArr.map(r=>r.da),    proj:model.cf.map(r=>r.da), sub:true },
        { label:"  (-) Capex (₹ Cr)",   hist:hArr.map(r=>r.capex), proj:model.cf.map(r=>r.capex), sub:true },
        { label:"  (-) ΔNWC (₹ Cr)",    hist:hArr.map(()=>null),   proj:model.cf.map(r=>r.dwc), sub:true },
        { label:"FCFE (₹ Cr)",
          hist:hArr.map(r=>r.cfo&&r.capex?r.cfo-r.capex:null),
          proj:model.cf.map(r=>r.fcfe), total:true },
        { sep:true },
        { label:"Discount Factor",
          hist:hArr.map(()=>null),
          proj:model.pvArr.map((_,i)=>+(1/Math.pow(1+assumptions.wacc/100,i+1)).toFixed(4)),
          fmt:v=>v==null?"—":v.toFixed(4) },
        { label:"PV of FCFE (₹ Cr)",
          hist:hArr.map(()=>null), proj:model.pvArr,
          fmt:v=>v==null?"—":cr(v) },
      ]} />

      {/* Inline WACC / TG controls — identical to BajajFinanceDCFModel */}
      <div style={{ background:"#0a1420", border:`1px solid ${BLUE}22`, borderRadius:8,
                    padding:"14px 16px", marginBottom:16 }}>
        <div style={{ fontSize:10, fontWeight:800, color:GOLD, letterSpacing:"0.12em",
                      textTransform:"uppercase", marginBottom:12 }}>Valuation Assumptions</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          {[
            { label:"WACC / CoE %", key:"wacc", min:1, max:25,
              onChange: v => { set("wacc", v); setWacc("useBuildup", false); } },
            { label:"Terminal Growth %", key:"termGrowth", min:0, max:15,
              onChange: v => set("termGrowth", v) },
          ].map(({ label, key, min, max, onChange }) => {
            const val = assumptions[key];
            const mod = isModified(key);
            return (
              <div key={key}>
                <div style={{ fontSize:10, color:MUTED, marginBottom:4 }}>{label}</div>
                <input type="text" inputMode="decimal" defaultValue={val} key={val}
                  onBlur={e => { const n = parseFloat(e.target.value); if (!isNaN(n)) onChange(Math.min(max,Math.max(min,n))); }}
                  onKeyDown={e => { if (e.key==="Enter") e.target.blur(); }}
                  style={{
                    width:"100%", padding:"8px 12px", fontSize:18, fontWeight:800,
                    background:"#06111c", border:`1px solid ${mod ? GOLD : BLUE}44`,
                    borderRadius:6, color: mod ? GOLD : GREEN,
                    outline:"none", fontFamily:"'DM Sans',sans-serif",
                    caretColor:GOLD, textAlign:"center",
                  }} />
              </div>
            );
          })}
        </div>
        {(() => {
          const spread   = assumptions.wacc - assumptions.termGrowth;
          const tvShare  = model.pvFCFE + model.pvTV > 0
            ? (model.pvTV / (model.pvFCFE + model.pvTV) * 100) : 0;
          const lesson =
            spread <= 0 ? { color:RED,    msg:`❌ WACC ≤ TG: Gordon Growth formula breaks (negative denominator). IV is undefined — mathematical impossibility.` } :
            spread <= 1 ? { color:RED,    msg:`⚠ ${spread.toFixed(1)}% spread: Terminal value is ~${tvShare.toFixed(0)}% of IV. Extreme territory — a 0.5% WACC change moves IV by 30-50%.` } :
            spread <= 3 ? { color:ORANGE, msg:`⚠ ${spread.toFixed(1)}% spread: TV = ${tvShare.toFixed(0)}% of total IV. High sensitivity — typical for fast-growing companies, demands conservatism.` } :
            spread <= 5 ? { color:GOLD,   msg:`${spread.toFixed(1)}% spread: TV = ${tvShare.toFixed(0)}% of total IV. Moderate sensitivity — reasonable for a mature compounder.` } :
                          { color:GREEN,  msg:`${spread.toFixed(1)}% spread: TV = ${tvShare.toFixed(0)}% of total IV. Wide spread — terminal value less dominant. Model is relatively stable.` };
          return (
            <div style={{ marginTop:10, padding:"10px 12px", background:`${lesson.color}10`,
                          border:`1px solid ${lesson.color}30`, borderRadius:6,
                          fontSize:11, color:lesson.color, lineHeight:1.6 }}>
              {lesson.msg}
            </div>
          );
        })()}
      </div>

      {/* Valuation summary cards */}
      <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:20 }}>
        {[
          { label:"Sum PV of FCFE",       value:cr(model.pvFCFE), color:TEAL,
            sub:`${model.pvArr.length} years discounted` },
          { label:"PV of Terminal Value", value:cr(model.pvTV),   color:ORANGE,
            sub:model.eqVal>0?`${(model.pvTV/model.eqVal*100).toFixed(1)}% of EV`:"" },
          { label: "Equity Value", value:cr(model.eqVal), color:BLUE,
            sub: `PV of FCFEs + PV of TV` },
          { label: "Intrinsic Value / Share",
            value: model.ok ? `₹${model.iv.toLocaleString("en-IN")}` : "N/A",
            color: model.upside > 0 ? GREEN : RED,
            sub: model.ok ? `${model.upside > 0 ? "+" : ""}${model.upside}% vs CMP` : "Adjust WACC/TG" },
        ].map((m, i) => (
          <div key={i} style={{ background:CARD, border:`1px solid ${m.color}22`, borderRadius:8,
                                padding:"10px 14px", flex:1, minWidth:130 }}>
            <div style={{ fontSize:10, color:MUTED, textTransform:"uppercase", letterSpacing:1, marginBottom:3 }}>{m.label}</div>
            <div style={{ fontSize:18, fontWeight:800, color:m.color, fontFamily:"'DM Sans',sans-serif" }}>{m.value}</div>
            <div style={{ fontSize:10, color:DIM, marginTop:1 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* WACC summary — identical to BajajFinanceDCFModel */}
      <div style={{ background:CARD, borderRadius:8, padding:14, border:`1px solid ${BLUE}22`, marginBottom:12 }}>
        <div style={{ fontSize:13, fontWeight:700, color:BLUE, marginBottom:8 }}>WACC Summary</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, fontSize:11 }}>
          {[
            { label:"Risk-Free Rate (approx)", value:"7.0%",    note:"10Y Gsec yield" },
            { label:"Equity Risk Premium",     value:"6.4%",    note:"India ERP" },
            { label:"Beta (your input)",        value:`${waccInputs.beta}x`, note:"Market risk relative" },
            { label:"Cost of Equity",           value:`${coe}%`,note:`${waccInputs.rfr}% + ${waccInputs.beta}×${waccInputs.mrp}%` },
            { label:"User WACC Input",          value:`${assumptions.wacc}%`, note:"Adjustable above", highlight:true },
            { label:"Terminal Growth",          value:`${assumptions.termGrowth}%`, note:"Perpetuity growth", highlight:true },
          ].map((item, i) => (
            <div key={i} style={{ padding:"8px 10px",
              background: item.highlight ? `${GOLD}10` : "#0a1420",
              borderRadius:6, border:`1px solid ${item.highlight ? GOLD : "transparent"}22` }}>
              <div style={{ color:MUTED, fontSize:10, marginBottom:2 }}>{item.label}</div>
              <div style={{ color:item.highlight ? GOLD : TEXT, fontWeight:700, fontSize:14 }}>{item.value}</div>
              <div style={{ color:DIM, fontSize:10 }}>{item.note}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Sensitivity Tab (identical to BajajFinanceDCFModel SensTab) ───────────
  const SensTab = (
    <div>
      <NoteButton text={`📚 Each cell shows IV at that WACC × TG combination — all other assumptions fixed.\n\n🔑 The spread (WACC − TG) is everything. A spread of 10% vs 2% can move IV by 10x. When spread is tight (≤2%), terminal value becomes 90-95% of total IV — meaning tiny changes in WACC or TG produce massive swings. This is not a model flaw; it is the fundamental limitation of DCF for perpetuity businesses.\n\nRed border cells = spread ≤ 2%: extreme sensitivity zone. WACC ≤ TG cells = mathematical impossibility (Gordon Growth breaks down).\n\nBase case: WACC ${assumptions.wacc}%, TG ${assumptions.termGrowth}% (highlighted gold).`} />
      <div style={{ overflowX:"auto", marginBottom:24, WebkitOverflowScrolling:"touch",
                    borderRadius:8, border:"1px solid rgba(255,255,255,0.07)" }}>
        <table style={{ borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr>
              <th style={{ padding:"8px 14px", textAlign:"left", color:GOLD, fontWeight:700,
                           borderBottom:`2px solid ${GOLD}33`, background:NAVY, minWidth:140,
                           position:"sticky", left:0, zIndex:3, boxShadow:"2px 0 8px rgba(0,0,0,0.5)" }}>
                WACC ↓ / TG →
              </th>
              {sensTgs.map(tg => (
                <th key={tg} style={{ padding:"8px 14px", textAlign:"center", color:GOLD, fontWeight:700,
                                     borderBottom:`2px solid ${GOLD}33`, minWidth:100,
                                     background:tg===Math.round(assumptions.termGrowth)?`${GOLD}18`:NAVY }}>
                  TG {tg}%
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sensWs.map((w, wi) => (
              <tr key={w} style={{ background:w===Math.round(assumptions.wacc)?`${GOLD}08`:"transparent" }}>
                <td style={{ padding:"8px 14px", fontWeight:700,
                             color:w===Math.round(assumptions.wacc)?GOLD:MUTED,
                             position:"sticky", left:0, zIndex:2,
                             boxShadow:"2px 0 8px rgba(0,0,0,0.5)",
                             background:w===Math.round(assumptions.wacc)?"#1a1500":"#07101c" }}>
                  WACC {w}%
                </td>
                {sensGrid[wi].map(({ iv, spread }, tgi) => {
                  if (iv === null) return (
                    <td key={tgi} style={{ padding:"8px 10px", textAlign:"center",
                                          background:"#0a0a0a", borderLeft:"2px solid rgba(255,50,50,0.3)" }}>
                      <div style={{ fontSize:10, color:RED, fontWeight:700 }}>WACC ≤ TG</div>
                      <div style={{ fontSize:9, color:DIM, marginTop:2 }}>No valid IV</div>
                    </td>
                  );
                  const up = CMP > 0 ? (iv - CMP) / CMP * 100 : 0;
                  const bg  = up > 20 ? `${GREEN}15` : up > 0 ? `${ORANGE}10` : `${RED}10`;
                  const col = up > 20 ? GREEN : up > 0 ? ORANGE : RED;
                  const isBase    = w===Math.round(assumptions.wacc) && sensTgs[tgi]===Math.round(assumptions.termGrowth);
                  const tightSprd = spread <= 2;
                  return (
                    <td key={tgi} style={{ padding:"8px 10px", textAlign:"center",
                                          background:isBase?`${GOLD}20`:bg,
                                          border:isBase?`1px solid ${GOLD}55`:tightSprd?`1px solid ${ORANGE}44`:"none",
                                          position:"relative" }}>
                      <div style={{ fontSize:14, fontWeight:700, color:isBase?GOLD:col }}>
                        ₹{iv.toLocaleString("en-IN")}
                      </div>
                      <div style={{ fontSize:10, color:col }}>
                        {CMP > 0 ? (up > 0 ? "+" : "") + up.toFixed(1) + "%" : ""}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );


  // ── vs Analyst Tab (mirrors BajajFinanceDCFModel AnalystTab exactly) ───────
  const AnalystTab = (() => {
    const defModel = defaultModel;
    const DEFAULTS = defaultsRef.current;
    if (!defModel || !DEFAULTS) return <div style={{ color:MUTED }}>Loading…</div>;
    return (
      <div>
        <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
          <div style={{ padding:"6px 14px", background:`${BLUE}22`, border:`1px solid ${BLUE}44`,
                        borderRadius:6, fontSize:11, color:BLUE, fontWeight:700 }}>
            Your Model — IV: ₹{model.ok?model.iv.toLocaleString("en-IN"):"N/A"}
            {model.upside!=null?` (${model.upside>0?"+":""}${model.upside}%)`:""}</div>
          <div style={{ padding:"6px 14px", background:`${GOLD}15`, border:`1px solid ${GOLD}44`,
                        borderRadius:6, fontSize:11, color:GOLD, fontWeight:700 }}>
            {covered ? "Vantage Capital" : "Base Case"} — IV: ₹{defModel.ok?defModel.iv.toLocaleString("en-IN"):"N/A"}
            {defModel.upside!=null?` (${defModel.upside>0?"+":""}${defModel.upside}%)`:""}</div>
        </div>
        <div style={{ overflowX:"auto", marginBottom:20, WebkitOverflowScrolling:"touch",
                      borderRadius:8, border:"1px solid rgba(255,255,255,0.07)" }}>
          <table style={{ borderCollapse:"collapse", fontSize:13, width:"100%", minWidth:700 }}>
            <thead>
              <tr>
                <th style={{ padding:"7px 10px", textAlign:"left", color:GOLD,
                             borderBottom:`2px solid ${GOLD}33`,
                             position:"sticky", left:0, zIndex:3, background:"#07101c",
                             minWidth:160, boxShadow:"2px 0 8px rgba(0,0,0,0.5)" }}>Assumption</th>
                {P_YRS.map(y => (
                  <th key={y} colSpan={2} style={{ padding:"7px 10px", textAlign:"center", color:GOLD,
                                                   borderBottom:`2px solid ${GOLD}33`, minWidth:150 }}>{y}</th>
                ))}
              </tr>
              <tr>
                <th style={{ padding:"4px 10px", background:"#07101c", position:"sticky", left:0, zIndex:3,
                             borderBottom:`1px solid ${GOLD}22`, boxShadow:"2px 0 8px rgba(0,0,0,0.5)" }} />
                {P_YRS.map(y => (
                  <React.Fragment key={y}>
                    <th style={{ padding:"4px 8px", textAlign:"center", color:BLUE, fontSize:10,
                                 background:"#0a1c2c", borderBottom:`1px solid ${GOLD}22` }}>You</th>
                    <th style={{ padding:"4px 8px", textAlign:"center", color:GOLD, fontSize:10,
                                 background:CARD, borderBottom:`1px solid ${GOLD}22` }}>{covered ? "VC" : "Base"}</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label:"Rev Growth (%)",        uvals:assumptions.revGrowth,              avals:DEFAULTS.revGrowth,              fmt:v=>v },
                { label:"EBITDA Margin (%)",      uvals:assumptions.ebitdaMargin,           avals:DEFAULTS.ebitdaMargin,           fmt:v=>v },
                { label:"Tax Rate (%)",           uvals:[...Array(5)].map(()=>assumptions.taxRate),  avals:[...Array(5)].map(()=>DEFAULTS.taxRate),  fmt:v=>v },
                { label:"Interest Rate on Debt (%)", uvals:[...Array(5)].map(()=>assumptions.interestRate??7), avals:[...Array(5)].map(()=>DEFAULTS.interestRate??7), fmt:v=>v },
                { label:"PAT (₹ Cr)",             uvals:model.pl.map(r=>r.pat),             avals:defModel.pl.map(r=>r.pat),       fmt:v=>v },
                { label:"FCFE (₹ Cr)",            uvals:model.cf.map(r=>r.fcfe),            avals:defModel.cf.map(r=>r.fcfe),      fmt:v=>v },
                { label:"Cost of Equity (WACC %)",uvals:[...Array(5)].map(()=>assumptions.wacc),     avals:[...Array(5)].map(()=>DEFAULTS.wacc),     fmt:v=>v },
                { label:"Terminal Growth (%)",    uvals:[...Array(5)].map(()=>assumptions.termGrowth),avals:[...Array(5)].map(()=>DEFAULTS.termGrowth),fmt:v=>v },
              ].map((row, ri) => (
                <tr key={ri} style={{ background:ri%2===0?"transparent":"rgba(255,255,255,0.015)" }}>
                  <td style={{ padding:"5px 10px", color:MUTED, fontWeight:600,
                               position:"sticky", left:0, zIndex:2,
                               boxShadow:"2px 0 8px rgba(0,0,0,0.5)",
                               background:ri%2===0?"#07101c":"#0d1b2e" }}>{row.label}</td>
                  {row.uvals.map((uv, ci) => {
                    const av   = row.avals[ci];
                    const diff = uv&&av ? Math.abs((uv-av)/av*100) : 0;
                    const isD  = diff > 3;
                    return (
                      <React.Fragment key={ci}>
                        <td style={{ padding:"5px 8px", textAlign:"right", background:"#0a1c2c",
                                     color:isD?BLUE:TEXT, fontWeight:isD?700:400 }}>
                          {typeof uv==="number"&&uv>1000?uv.toLocaleString("en-IN"):uv}
                        </td>
                        <td style={{ padding:"5px 8px", textAlign:"right", background:CARD,
                                     color:isD?GOLD:MUTED, fontWeight:isD?700:400 }}>
                          {typeof av==="number"&&av>1000?av.toLocaleString("en-IN"):av}
                          {isD && <span style={{ color:diff>10?RED:ORANGE, fontSize:9.5 }}> ▲</span>}
                        </td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {covered && analyst?.analyst_note && (
          <NoteButton text={`Vantage Capital coverage: ${analyst.analyst_note}`} />
        )}
      </div>
    );
  })();

  // ── Key Metrics Tab (identical to BajajFinanceDCFModel KeyMetricsTab) ──────
  const ALL_YRLABELS = [...H_YRS, ...P_YRS];
  const km = ALL_YRLABELS.map((yr, i) => {
    const isP   = i >= hArr.length;
    const hi    = isP ? null : i;
    const pi    = isP ? i - hArr.length : null;
    const rev    = isP ? model.pl[pi].rev    : hArr[hi].revenue;
    const ebitda = isP ? model.pl[pi].ebitda : hArr[hi].ebitda;
    const pat    = isP ? model.pl[pi].pat    : hArr[hi].pat;
    const da     = isP ? model.cf[pi].da     : hArr[hi].da;
    const capex  = isP ? model.cf[pi].capex  : hArr[hi].capex;
    const equity = isP ? model.bs[pi].eq     : hArr[hi].total_equity;
    const bor    = isP ? model.bs[pi].bor    : hArr[hi].total_debt;
    const totA   = isP ? model.bs[pi].totA   : (hArr[hi].total_equity||0)+(hArr[hi].total_debt||0);
    const fcfe   = isP ? model.cf[pi].fcfe   : (hArr[hi].cfo&&hArr[hi].capex?hArr[hi].cfo-hArr[hi].capex:hArr[hi].fcfe||0)||0;
    return {
      yr, type: isP ? "P" : "H",
      ebitdaMargin: rev>0 ? +(ebitda/rev*100).toFixed(1) : null,
      patMargin:    rev>0 ? +(pat/rev*100).toFixed(1)    : null,
      roe:          equity>0 ? +(pat/equity*100).toFixed(1)   : null,
      roa:          totA>0   ? +(pat/totA*100).toFixed(1)     : null,
      assetTurnover:totA>0   ? +(rev/totA).toFixed(2)         : null,
      capexRev:     rev>0    ? +(capex/rev*100).toFixed(1)    : null,
      daRev:        rev>0    ? +(da/rev*100).toFixed(1)       : null,
      debtEquity:   equity>0 ? +(bor/equity).toFixed(2)       : null,
      debtAssets:   totA>0   ? +(bor/totA*100).toFixed(1)     : null,
      rev, pat, ebitda, fcfe, bor, equity, totA,
    };
  });

  const KMTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background:NAVY, border:`1px solid ${GOLD}44`, borderRadius:6, padding:"8px 12px", fontSize:12 }}>
        <div style={{ fontWeight:700, color:GOLD, marginBottom:4 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color:p.color }}>
            {p.name}: {typeof p.value==="number"?p.value.toLocaleString("en-IN"):p.value}
          </div>
        ))}
      </div>
    );
  };

  const KMChart = ({ title, dataKey, color, fmt, type="bar", name }) => (
    <div style={{ background:CARD, border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, padding:"14px 14px 8px" }}>
      <div style={{ fontSize:11, fontWeight:700, color:MUTED, letterSpacing:"0.08em",
                    textTransform:"uppercase", marginBottom:10 }}>{title}</div>
      <ResponsiveContainer width="100%" height={160}>
        <ComposedChart data={km} margin={{ top:4, right:4, left:-16, bottom:0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="yr" tick={{ fill:DIM, fontSize:9 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill:DIM, fontSize:9 }} tickLine={false} axisLine={false}
                 tickFormatter={v => fmt ? fmt(v) : v} />
          <Tooltip content={<KMTooltip />} />
          {type === "bar" ? (
            <Bar dataKey={dataKey} name={name||title} radius={[3,3,0,0]} maxBarSize={28}>
              {km.map((d, i) => (
                <Cell key={i} fill={d.type==="P"?`${color}88`:color}
                      stroke={d.type==="P"?color:"none"} strokeWidth={1}
                      strokeDasharray={d.type==="P"?"4 2":"0"} />
              ))}
            </Bar>
          ) : (
            <Line dataKey={dataKey} name={name||title} stroke={color} strokeWidth={2}
                  dot={d => <circle cx={d.cx} cy={d.cy} r={3}
                    fill={d.payload.type==="P"?"transparent":color}
                    stroke={color} strokeWidth={1.5} />}
                  strokeDasharray="0" />
          )}
        </ComposedChart>
      </ResponsiveContainer>
      <div style={{ display:"flex", gap:10, marginTop:4, justifyContent:"flex-end" }}>
        <span style={{ fontSize:9, color:DIM }}>
          <span style={{ display:"inline-block", width:10, height:2, background:color, marginRight:4, verticalAlign:"middle" }} />Hist
        </span>
        <span style={{ fontSize:9, color:DIM }}>
          <span style={{ display:"inline-block", width:10, height:2, background:`${color}66`, marginRight:4, verticalAlign:"middle" }} />Projected
        </span>
      </div>
    </div>
  );

  const pctFmt = v => `${v}%`;
  const xFmt   = v => `${v}x`;
  const crFmt  = v => v >= 1000 ? `₹${(v/1000).toFixed(0)}K` : `₹${v}`;

  const MetricSection = ({ label, children, defaultOpen = false }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
      <div style={{ marginBottom:20 }}>
        <button onClick={() => setOpen(o=>!o)} style={{
          width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between",
          background: open?`${GOLD}08`:`${GOLD}05`,
          border:`1px solid ${GOLD}22`, borderRadius: open?"8px 8px 0 0":8,
          padding:"10px 16px", cursor:"pointer", transition:"all 0.2s",
        }}>
          <span style={{ fontSize:11, fontWeight:800, color:GOLD,
                         letterSpacing:"0.18em", textTransform:"uppercase" }}>{label}</span>
          <span style={{ color:GOLD, fontSize:13, display:"inline-block",
                         transition:"transform 0.2s",
                         transform: open?"rotate(0deg)":"rotate(-90deg)" }}>▾</span>
        </button>
        {open && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:12,
                        padding:12, background:`${GOLD}04`, border:`1px solid ${GOLD}22`,
                        borderTop:"none", borderRadius:"0 0 8px 8px" }}>
            {children}
          </div>
        )}
      </div>
    );
  };

  const KeyMetricsTab = (
    <div>
      <NoteButton text={`${H_YRS[0]}–${H_YRS[H_YRS.length-1]} historical (solid bars) + ${P_YRS[0]}–${P_YRS[4]} projected per your assumptions (faded). Adjust sliders or table inputs — all charts update live.`} />

      <MetricSection label="Profitability" defaultOpen={false}>
        <KMChart title="EBITDA Margin %" dataKey="ebitdaMargin" color={TEAL}  fmt={pctFmt} type="line" name="EBITDA Margin %" />
        <KMChart title="PAT Margin %"    dataKey="patMargin"    color={GOLD}  fmt={pctFmt} type="line" name="PAT Margin %"    />
        <KMChart title="Return on Equity %" dataKey="roe"       color={GREEN} fmt={pctFmt} type="bar"  name="ROE %"           />
        <KMChart title="Return on Assets %" dataKey="roa"       color={TEAL}  fmt={pctFmt} type="bar"  name="ROA %"           />
      </MetricSection>

      <MetricSection label="Efficiency & Turnover" defaultOpen={false}>
        <KMChart title="Asset Turnover (x)"    dataKey="assetTurnover" color={BLUE}   fmt={xFmt}   type="line" name="Asset Turnover"  />
        <KMChart title="Capex % of Revenue"    dataKey="capexRev"      color={ORANGE} fmt={pctFmt} type="bar"  name="Capex/Rev %"    />
        <KMChart title="D&A % of Revenue"      dataKey="daRev"         color={MUTED}  fmt={pctFmt} type="bar"  name="D&A/Rev %"      />
      </MetricSection>

      <MetricSection label="Leverage" defaultOpen={false}>
        <KMChart title="Debt / Equity (x)"   dataKey="debtEquity" color={RED}    fmt={xFmt}   type="line" name="D/E Ratio"   />
        <KMChart title="Debt / Assets %"     dataKey="debtAssets" color={ORANGE} fmt={pctFmt} type="bar"  name="Debt/Assets %" />
        <KMChart title="Borrowings (₹ Cr)"   dataKey="bor"        color={RED}    fmt={crFmt}  type="bar"  name="Borrowings"  />
        <KMChart title="Equity (₹ Cr)"       dataKey="equity"     color={GREEN}  fmt={crFmt}  type="bar"  name="Equity"      />
      </MetricSection>

      <MetricSection label="Valuation & Growth" defaultOpen={false}>
        <KMChart title="Revenue (₹ Cr)" dataKey="rev"    color={BLUE}  fmt={crFmt} type="bar" name="Revenue" />
        <KMChart title="PAT (₹ Cr)"     dataKey="pat"    color={GOLD}  fmt={crFmt} type="bar" name="PAT"     />
        <KMChart title="FCFE (₹ Cr)"    dataKey="fcfe"   color={TEAL}  fmt={crFmt} type="bar" name="FCFE"    />
        <KMChart title="EBITDA (₹ Cr)"  dataKey="ebitda" color={GREEN} fmt={crFmt} type="bar" name="EBITDA"  />
      </MetricSection>
    </div>
  );

  const tabContent = [PLTab, BSTab, CFTab, DCFTab, SensTab, AnalystTab, KeyMetricsTab];


  // ── Render (identical to BajajFinanceDCFModel render) ─────────────────────
  return (
    <>
    {/* Content blurs when paywall active — FOMO effect */}
    <div style={{ background:`linear-gradient(135deg,${NAVY} 0%,#0a1628 100%)`,
                  minHeight:"100vh", color:TEXT, fontFamily:"'DM Sans',sans-serif",
                  filter: paywall ? "blur(3px) brightness(0.75)" : "none",
                  pointerEvents: paywall ? "none" : "auto",
                  transition: "filter 0.3s ease",
                  userSelect: paywall ? "none" : "auto" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />

      {/* View-only banner for anon users */}
      {ViewOnlyBanner}

      {/* ← Home — identical position to BajajFinanceDCFModel */}
      <Link to="/" style={{ position:"fixed", top:20, left:28, zIndex:10000, color:GOLD,
        textDecoration:"none", fontWeight:700, background:"rgba(13,27,42,0.95)",
        padding:"8px 18px", borderRadius:8, fontSize:13, boxShadow:"0 4px 12px rgba(0,0,0,0.3)" }}>
        ← Home
      </Link>

      {/* ── Header ── */}
      <div style={{ padding:"82px 28px 0", borderBottom:`1px solid ${GOLD}20` }} className="dcf-header">
        {/* Title block */}
        <div style={{ display:"flex", alignItems:"flex-start", gap:10, flexWrap:"wrap" }}>
          <div>
            {/* "Build Your DCF" label + how-to popup */}
            <div style={{ display:"flex", gap:6, alignItems:"center", marginBottom:5 }}>
              <span style={{ fontSize:11, color:GOLD, letterSpacing:"0.14em", fontWeight:800, textTransform:"uppercase" }}>
                Build Your DCF
              </span>
              <NoteButton text={`How to use this model:\n\n1. Start on the P&L tab — review historical revenue & margin trends.\n\n2. Open the Assumptions panel (right side) and adjust Revenue Growth and EBITDA Margin for each projection year.\n\n3. Expand Operating Assumptions — set Capex %, D&A %, and Tax Rate to match the business.\n\n4. Use WACC Build-up to derive a discount rate, or set WACC manually in the Valuation section.\n\n5. Go to FCFE & DCF tab — set Terminal Growth Rate. Watch the spread warning carefully.\n\n6. Check Sensitivity tab to understand how much IV swings with WACC and TG.\n\n7. Compare vs the seeded default model on the vs Analyst tab.\n\n8. Download Excel to share or present your model.`} />
            </div>
            <h1 style={{ margin:"0 0 4px", fontSize:26, fontWeight:800,
                         fontFamily:"'Playfair Display',serif", color:"#fff" }}>
              {meta.name || ticker}
            </h1>
            <div style={{ fontSize:11, color:MUTED }}>
              NSE: {ticker} · {meta.sector || "—"} · {"FCFE DCF"} · {H_YRS[0]}–{P_YRS[4]}
            </div>
          </div>
        </div>

        {/* Analyst note banner (covered stocks only) */}
        {covered && analyst?.analyst_note && (
          <div style={{ marginTop:10, padding:"9px 13px",
            background:`${GOLD}06`, border:`1px solid ${GOLD}18`,
            borderLeft:`3px solid ${GOLD}`, borderRadius:7,
            fontSize:12, color:`${GOLD}dd`, lineHeight:1.6 }}>
            🏦 <strong>Vantage Capital:</strong> {analyst.analyst_note}
          </div>
        )}

        {/* Metric cards — flex row on desktop, collapsible 2×2 on mobile */}
        <>
          {/* Toggle row — mobile only, hidden on desktop via CSS */}
          <div className="cards-toggle" style={{
            display:"none", alignItems:"center", justifyContent:"space-between",
            marginTop:14, marginBottom: cardsOpen ? 6 : 0,
            cursor:"pointer", userSelect:"none",
          }} onClick={() => setCardsOpen(o => !o)}>
            <span style={{ fontSize:10, color:DIM, letterSpacing:"0.08em", textTransform:"uppercase", fontWeight:600 }}>
              Key Stats
            </span>
            <span style={{ color:GOLD, fontSize:13, display:"inline-block",
                           transition:"transform 0.2s",
                           transform: cardsOpen ? "rotate(0deg)" : "rotate(-90deg)" }}>▾</span>
          </div>

          {/* Desktop: flex row (same as original Bajaj). Mobile: 2×2 grid, collapsible */}
          {cardsOpen && (
            <div className="metric-cards-desktop" style={{ display:"flex", gap:10, marginTop:14, flexWrap:"wrap" }}>
              <MetCard
                label="CMP"
                value={CMP > 0 ? `₹${CMP.toLocaleString("en-IN")}` : "N/A"}
                sub={meta.market_cap_cr ? `MCap ₹${Math.round(meta.market_cap_cr).toLocaleString("en-IN")} Cr` : "—"}
              />
              <MetCard
                label="Your IV"
                value={model.ok ? `₹${model.iv.toLocaleString("en-IN")}` : "N/A"}
                sub={model.ok ? `${model.upside > 0 ? "+" : ""}${model.upside}% vs CMP` : "Adjust assumptions"}
                color={model.ok ? (model.upside > 0 ? GREEN : RED) : MUTED}
              />
              {covered && defaultModel?.ok ? (
                <MetCard
                  label="Vantage Capital IV"
                  value={`₹${defaultModel.iv.toLocaleString("en-IN")}`}
                  sub={`${defaultModel.upside > 0 ? "+" : ""}${defaultModel.upside}% vs CMP`}
                  color={GOLD}
                />
              ) : (
                <div style={{ background:CARD, border:`1px solid rgba(255,255,255,0.06)`,
                              borderRadius:8, padding:"10px 14px", flex:1, minWidth:120 }}>
                  <div style={{ fontSize:10, color:MUTED, letterSpacing:1, textTransform:"uppercase", marginBottom:4 }}>
                    Vantage Capital IV
                  </div>
                  <div style={{ fontSize:13, fontWeight:700, color:DIM }}>Not Covered Yet</div>
                  <div style={{ fontSize:10, color:DIM, marginTop:2 }}>Research in progress</div>
                </div>
              )}
              <MetCard
                label="WACC"
                value={`${assumptions.wacc}%`}
                sub={`TG ${assumptions.termGrowth}% · ${"FCFE DCF"}`}
                color={ORANGE}
              />
            </div>
          )}
        </>

        {/* Tabs — mobile dropdown + desktop bar, identical to BajajFinanceDCFModel */}
        <div style={{ marginTop:14 }}>
          <div style={{ display:"none" }} className="mobile-tab-select">
            <select value={tab} onChange={e => setTab(+e.target.value)} style={{
              width:"100%", padding:"10px 14px", background:CARD,
              border:`1px solid ${GOLD}44`, borderRadius:8, color:GOLD, fontSize:14, fontWeight:700,
              fontFamily:"'DM Sans',sans-serif", outline:"none",
              WebkitAppearance:"none", appearance:"none",
              backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23D4A017' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`,
              backgroundRepeat:"no-repeat", backgroundPosition:"right 14px center", paddingRight:36,
            }}>
              {tabs.map((t,i) => <option key={i} value={i}>{t}</option>)}
            </select>
          </div>
          <div style={{ display:"flex", gap:0, overflowX:"auto" }} className="desktop-tabs">
            {tabs.map((t,i) => (
              <button key={i} onClick={() => setTab(i)} style={{
                padding:"8px 16px", border:"none",
                borderBottom: tab===i ? `3px solid ${GOLD}` : "3px solid transparent",
                background: tab===i ? `${GOLD}10` : "transparent",
                color: tab===i ? GOLD : MUTED,
                fontWeight: tab===i ? 700 : 500,
                fontSize:13, cursor:"pointer", transition:"all 0.2s",
                fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap",
              }}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Responsive CSS — identical to BajajFinanceDCFModel */}
      <style>{`
        @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
        input[type=range] { height: 3px; } * { box-sizing: border-box; }
        .dcf-header { padding-top: 96px !important; }
        @media (max-width: 767px) {
          .dcf-header { padding-top: 112px !important; }
          .mobile-tab-select  { display: block !important; }
          .desktop-tabs       { display: none  !important; }
          .assumption-panel   { display: none  !important; }
          .main-padding       { padding: 12px 14px 160px !important; }
          .cards-toggle       { display: flex !important; }
          .metric-cards-desktop { display: grid !important; grid-template-columns: 1fr 1fr !important; max-width: 520px !important; }
        }
        @media (min-width: 768px) {
          .mobile-sheet-overlay  { display: none !important; }
          .mobile-assumptions-btn { display: none !important; }
          .cards-toggle          { display: none !important; }
          .metric-cards          { display: grid !important; }
        }
        .action-btn-label { display: inline; }
        @media (max-width: 767px) {
          .action-btn-label { display: none; }
          .action-bar { padding: 8px 12px !important; }
        }
      `}</style>

      {/* ── Main layout: content + right assumption panel ── */}
      <div style={{ display:"flex", height:"calc(100vh - 290px)", minHeight:500 }}>

        {/* Tab content */}
        <div className="main-padding" style={{ flex:1, padding:"10px 28px 80px", overflowY:"auto" }}>
          {tabContent[tab]}
        </div>

        {/* Desktop: vertical toggle strip + panel — identical to BajajFinanceDCFModel */}
        <div style={{ display:"flex", flexDirection:"row" }} className="assumption-panel">
          <button onClick={() => setPanelOpen(o => !o)} style={{
            width:22, flexShrink:0, background:`${GOLD}10`, border:"none",
            borderLeft:`1px solid ${GOLD}22`, cursor:"pointer", color:GOLD,
            display:"flex", alignItems:"center", justifyContent:"center",
          }} title={panelOpen ? "Hide assumptions" : "Show assumptions"}>
            <span style={{
              fontSize:11, display:"inline-block", writingMode:"vertical-rl",
              transform: panelOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition:"transform 0.25s", letterSpacing:"0.08em", fontWeight:700,
            }}>
              {panelOpen ? "▸ HIDE" : "▸ SHOW"}
            </span>
          </button>
          {panelOpen && AssumptionPanel}
        </div>
      </div>

      {/* ── Mobile assumptions bottom sheet — identical to BajajFinanceDCFModel ── */}
      {sheetOpen && (
        <div className="mobile-sheet-overlay"
          style={{ position:"fixed", inset:0, zIndex:2000,
                   background:"rgba(0,0,0,0.6)", backdropFilter:"blur(4px)" }}
          onClick={e => { if (e.target===e.currentTarget) setSheetOpen(false); }}>
          <div style={{ position:"absolute", bottom:0, left:0, right:0,
                        display:"flex", justifyContent:"center",
                        animation:"slideUp .28s cubic-bezier(.22,1,.36,1)" }}>
            <div style={{ width:"100%", maxWidth:520, background:"#0d1b2e",
                          borderTop:`2px solid ${GOLD}`, borderRadius:"20px 20px 0 0",
                          maxHeight:"82vh", overflowY:"auto", WebkitOverflowScrolling:"touch" }}>
              <div style={{ display:"flex", justifyContent:"center", padding:"12px 0 0" }}>
                <div style={{ width:36, height:4, background:"rgba(255,255,255,0.2)", borderRadius:2 }} />
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 20px 4px" }}>
                <span style={{ fontSize:14, fontWeight:800, color:GOLD }}>Assumptions</span>
                <button onClick={() => setSheetOpen(false)}
                  style={{ background:"none", border:"none", color:"rgba(255,255,255,0.5)", fontSize:20, cursor:"pointer" }}>×</button>
              </div>
              <div style={{ padding:"0 0 40px" }}>{AssumptionPanel}</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Action bar — identical to BajajFinanceDCFModel ── */}
      <div className="action-bar" style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:1000,
        background:"rgba(10,21,36,0.97)", borderTop:`1px solid ${GOLD}22`,
        padding:"10px 28px", display:"flex", gap:8, alignItems:"center",
        backdropFilter:"blur(12px)" }}>
        {/* ⚙ Assumptions — far left, mobile only */}
        <button className="mobile-assumptions-btn" onClick={() => setSheetOpen(true)} style={{
          padding:"8px 14px", background:"transparent",
          border:"1px solid rgba(255,255,255,0.2)", borderRadius:6,
          color:"rgba(255,255,255,0.8)", fontSize:12, fontWeight:600, cursor:"pointer",
          display:"flex", alignItems:"center", gap:6, fontFamily:"'DM Sans',sans-serif",
        }}><span>⚙</span><span>Assumptions</span></button>
        <div style={{ flex:1 }} />
        {banner && (
          <div style={{ padding:"6px 10px", background:`${GREEN}22`, border:`1px solid ${GREEN}44`,
                        borderRadius:6, color:GREEN, fontSize:11, fontWeight:700 }}>{banner}</div>
        )}
        {[
          { icon:"↺", label: covered ? "Reset to Vantage Capital" : "Reset to Defaults", onClick:resetToAnalyst, color:GOLD, bg:"transparent" },
          { icon:"💾", label:"Save Scenario",   onClick:saveScenario,   color:TEAL,  bg:`${TEAL}22`   },
          ...(saved ? [{ icon:"📂", label:"Load Saved", onClick:loadScenario, color:BLUE, bg:`${BLUE}22` }] : []),
          { icon:"⬇", label:"Download Excel",  onClick:exportExcel,    color:GREEN, bg:`${GREEN}22`  },
        ].map(({ icon, label, onClick, color, bg }) => (
          <button key={label} onClick={onClick} title={label} style={{
            padding:"8px 14px", background:bg, border:`1px solid ${color}44`,
            borderRadius:6, color, fontSize:14, cursor:"pointer", fontWeight:700,
            display:"flex", alignItems:"center", gap:6, fontFamily:"'DM Sans',sans-serif",
          }}>
            <span>{icon}</span>
            <span className="action-btn-label" style={{ fontSize:12 }}>{label}</span>
          </button>
        ))}
      </div>
    </div>
    {/* Paywall overlays blurred page — FOMO effect */}
    {paywall && <PaywallOverlay config={paywall} onClose={() => navigate(-1)} />}
    </>
  );
}