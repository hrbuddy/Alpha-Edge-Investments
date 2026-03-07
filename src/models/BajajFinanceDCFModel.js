// BajajFinanceDCFModel.js
// Vantage Capital — Live DCF Lab
// Bajaj Finance Ltd · Model 1 of 3 · FREE
// Full 3-statement model: P&L → BS → CF → FCFF → DCF valuation
// Build, save, compare with analyst, export to Excel (IB format)

import { useState, useMemo, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, Cell,
} from "recharts";

// ── Color tokens (matches platform) ─────────────────────────────────────────
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

// ── Historical data — Bajaj Finance Consolidated (₹ Crore) ──────────────────
// Source: Company filings, quarterly results FY20–FY25
// Revenue = NII + Fees + Other Income (already net of interest expense — NBFC structure)
const H = {
  yr:           ["FY20",  "FY21",  "FY22",  "FY23",  "FY24",  "FY25"],
  rev:          [11500,   13800,   19400,   26800,   34700,   43000 ],
  ebitda:       [4025,    3450,    7372,    9916,    13186,   16770 ],
  da:           [200,     220,     280,     380,     480,     580   ],
  ebit:         [3825,    3230,    7092,    9536,    12706,   16190 ],
  tax:          [932,     553,     1866,    2592,    3376,    4300  ],
  pat:          [3048,    1347,    5264,    7028,    9824,    13500 ],
  fixedAssets:  [1200,    1350,    1600,    1900,    2300,    2800  ],
  loanBook:     [147200,  158400,  196800,  255700,  320500,  388000],
  otherAssets:  [8500,    9200,    11000,   14000,   17500,   21000 ],
  equity:       [31200,   32600,   37900,   44700,   55500,   67000 ],
  borrowings:   [113700,  124350,  157500,  210000,  265000,  320000],
  otherLiab:    [12000,   12000,   14000,   16900,   19800,   24800 ],
  cfo:          [4200,    2100,    6800,    9400,    12500,   16000 ],
  capex:        [280,     250,     320,     450,     580,     700   ],
};

const P_YRS   = ["FY26E","FY27E","FY28E","FY29E","FY30E"];
const SHARES  = 60.12;   // Crore shares outstanding
const CMP     = 8650;    // ₹ per share (March 2026)

// ── Analyst model — Vantage Capital base case ─────────────────────────────────
const ANALYST = {
  revGrowth:    [18, 17, 16, 15, 14],   // % YoY FY26–FY30
  ebitdaMargin: [40, 41, 42, 43, 44],   // %
  daRev:        [1.4, 1.4, 1.4, 1.4, 1.4],  // D&A % of revenue per year
  capexRev:     1.6,    // Capex % of revenue
  wcRev:        3.0,    // ΔWorking capital % of revenue CHANGE
  taxRate:      25,     // %
  wacc:         10.0,   // % (cost of equity proxy — NBFC note below)
  termGrowth:   7.0,    // %
};
const deepClone = a => ({
  revGrowth:    [...a.revGrowth],
  ebitdaMargin: [...a.ebitdaMargin],
  daRev: [...a.daRev], capexRev: a.capexRev, wcRev: a.wcRev,
  taxRate: a.taxRate, wacc: a.wacc, termGrowth: a.termGrowth,
});

// ── Calculation Engine (pure JS — no side effects) ────────────────────────────
function runModel(a) {
  const pl = [], cf = [], bs = [];
  let pRev = H.rev[5], pEq = H.equity[5], pFA = H.fixedAssets[5], pLB = H.loanBook[5];

  for (let i = 0; i < 5; i++) {
    // ── Income Statement ──
    const rev    = Math.round(pRev * (1 + a.revGrowth[i] / 100));
    const ebitda = Math.round(rev * a.ebitdaMargin[i] / 100);
    const da     = Math.round(rev * a.daRev[i] / 100);
    const ebit   = ebitda - da;
    const tax    = Math.round(ebit * a.taxRate / 100);
    const nopat  = ebit - tax;
    const pat    = nopat;

    // ── Cash Flow ──
    const capex  = Math.round(rev * a.capexRev / 100);
    const dwc    = Math.round((rev - pRev) * a.wcRev / 100);
    const cfo    = pat + da - dwc;
    const fcff   = nopat + da - capex - dwc;

    // ── Balance Sheet ──
    const fa   = Math.round(pFA + capex - da);
    const lb   = Math.round(pLB * (1 + a.revGrowth[i] / 100));
    const oa   = Math.round(H.otherAssets[5] * Math.pow(1 + a.revGrowth[i] / 100 * 0.5, i + 1));
    const eq   = pEq + Math.round(pat * 0.70);
    const totA = fa + lb + oa;
    const bor  = Math.round(totA * 0.778);
    const ol   = Math.max(totA - eq - bor, 0);

    pl.push({ rev, ebitda, da, ebit, tax, nopat, pat,
              ebitdaM: a.ebitdaMargin[i], patM: +(pat/rev*100).toFixed(1),
              revGrowthPct: a.revGrowth[i] });
    cf.push({ cfo, capex, dwc, da, fcff, cfi: -capex });
    bs.push({ fa, lb, oa, totA, eq, bor, ol });

    pRev = rev; pFA = fa; pLB = lb; pEq = eq;
  }

  // ── DCF Valuation ──
  const w  = a.wacc / 100;
  const tg = a.termGrowth / 100;
  const ok = w > tg + 0.005;

  const fcffArr = cf.map(c => c.fcff);
  const pvArr   = fcffArr.map((f, i) => Math.round(f / Math.pow(1 + w, i + 1)));
  const pvFCFF  = pvArr.reduce((s, v) => s + v, 0);

  const tv    = ok ? Math.round(fcffArr[4] * (1 + tg) / (w - tg)) : 0;
  const pvTV  = ok ? Math.round(tv / Math.pow(1 + w, 5)) : 0;
  const eqVal = ok ? pvFCFF + pvTV : 0;
  const iv    = ok ? Math.round(eqVal / SHARES) : 0;

  return { pl, cf, bs, pvArr, pvFCFF, tv, pvTV, eqVal, iv,
           upside: ok ? +((iv - CMP) / CMP * 100).toFixed(1) : null, ok };
}

function calcSensGrid(a) {
  // Center rows/cols on user's current WACC and TG, ±2 steps
  const baseW  = Math.round(a.wacc);
  const baseTg = Math.round(a.termGrowth);
  const ws  = [baseW-2, baseW-1, baseW, baseW+1, baseW+2].map(v => Math.max(1, v));
  const tgs = [baseTg-2, baseTg-1, baseTg, baseTg+1, baseTg+2].map(v => Math.max(1, v));
  return { ws, tgs, grid: ws.map(w => tgs.map(tg => {
    // Always compute — even tight spreads; students need to see what happens
    const spread = w - tg;
    const iv = spread <= 0 ? null : runModel({ ...a, wacc: w, termGrowth: tg }).iv;
    return { iv, spread };
  })) };
}

// ── Formatter helpers ─────────────────────────────────────────────────────────
const cr   = v => v == null ? "—" : `₹${(v).toLocaleString("en-IN")}`;
const pct  = v => v == null ? "—" : `${v}%`;

// ── Sub-components ────────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: NAVY, border: `1px solid ${GOLD}`, borderRadius: 6, padding: "8px 12px", fontSize: 12 }}>
      <div style={{ fontWeight: 700, color: GOLD, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>
          {p.name}: {typeof p.value === "number" ? p.value.toLocaleString("en-IN") : p.value}
        </div>
      ))}
    </div>
  );
};

function SliderRow({ label, value, min, max, step = 0.5, onChange, modified, suffix = "%" }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
        <span style={{ fontSize: 10.5, color: MUTED }}>{label}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: modified ? BLUE : GOLD }}>{value}{suffix}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(+e.target.value)}
        style={{ width: "100%", accentColor: modified ? BLUE : GOLD, height: 3, cursor: "pointer" }} />
    </div>
  );
}

function MetCard({ label, value, sub, color = GOLD }) {
  return (
    <div style={{ background: CARD, border: `1px solid ${color}22`, borderRadius: 8, padding: "10px 14px", flex: 1, minWidth: 120 }}>
      <div style={{ fontSize: 10, color: MUTED, letterSpacing: 1, textTransform: "uppercase", marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color, fontFamily: "'DM Sans',sans-serif" }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: DIM, marginTop: 1 }}>{sub}</div>}
    </div>
  );
}

// ── Inline editable cell — always shows as input, no click-to-reveal ────────
function EditCell({ rawValue, displayValue, onCommit, color, fontWeight, isModified }) {
  const [draft, setDraft] = useState(null); // null = not focused

  const handleFocus = () => setDraft(String(rawValue ?? ""));
  const commit = () => {
    if (draft !== null) { onCommit(draft); }
    setDraft(null);
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      value={draft !== null ? draft : displayValue}
      onFocus={handleFocus}
      onChange={e => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={e => { if (e.key === "Enter") e.target.blur(); if (e.key === "Escape") { setDraft(null); e.target.blur(); } }}
      style={{
        width: "100%", height: "100%",
        background: "transparent",
        border: "none",
        borderBottom: draft !== null ? `1px solid ${GOLD}` : `1px solid rgba(255,255,255,0.0)`,
        color: isModified ? GOLD : GREEN,
        fontWeight: isModified ? 700 : fontWeight,
        fontSize: 13,
        textAlign: "right",
        padding: "0 2px",
        outline: "none",
        cursor: "text",
        fontFamily: "'DM Sans',sans-serif",
        caretColor: GOLD,
      }}
    />
  );
}

// ── Statement table ───────────────────────────────────────────────────────────
// Row types:
//   row.total   → gold highlight, bold — bottom-line totals
//   row.subtotal→ white bold — section subtotals
//   row.sub     → italic, indented — derived/ratio rows (read-only)
//   row.onEdit  → editable assumption rows — distinct background
//   plain       → derived calculated rows
function StatTable({ rows, projOnly = false }) {
  const HIST_BG  = "#090f1a";
  const PROJ_BG  = "#0d1b2e";
  const EDIT_BG  = "#0e2030";   // assumption input rows
  const TOTAL_BG = `${GOLD}12`;
  const SEP_COL  = "rgba(255,255,255,0.05)";
  const ROW_H    = 36;

  return (
    <div style={{ overflowX: "auto", marginBottom: 20, borderRadius: 8, border: `1px solid rgba(255,255,255,0.07)`,
                   WebkitOverflowScrolling: "touch", position: "relative" }}>
      <table style={{ borderCollapse: "collapse", fontSize: 13, width: "100%", minWidth: 860, tableLayout: "fixed" }}>
        <colgroup>
          <col style={{ width: projOnly ? 220 : 200 }} />
          {!projOnly && H.yr.map((_,i) => <col key={i} style={{ width: 90 }} />)}
          {P_YRS.map((_,i) => <col key={i} style={{ width: 100 }} />)}
        </colgroup>
        <thead>
          <tr style={{ background: "#07101c" }}>
            <th style={{
              padding: "9px 14px", textAlign: "left", color: GOLD, fontWeight: 700,
              borderBottom: `1px solid rgba(255,255,255,0.1)`,
              position: "sticky", left: 0, zIndex: 3,
              background: "#07101c", fontSize: 11,
              letterSpacing: "0.08em", textTransform: "uppercase",
              boxShadow: "2px 0 8px rgba(0,0,0,0.5)",
              borderRight: "1px solid rgba(255,255,255,0.08)",
            }}>
              Line Item
            </th>
            {!projOnly && H.yr.map(y => (
              <th key={y} style={{
                padding: "9px 10px", textAlign: "right", color: DIM, fontWeight: 500,
                borderBottom: `1px solid rgba(255,255,255,0.1)`,
                borderLeft: `1px solid ${SEP_COL}`,
                background: HIST_BG, fontSize: 11,
              }}>{y}</th>
            ))}
            {P_YRS.map(y => (
              <th key={y} style={{
                padding: "9px 10px", textAlign: "right", color: GOLD, fontWeight: 700,
                borderBottom: `1px solid rgba(255,255,255,0.1)`,
                borderLeft: `1px solid rgba(212,160,23,0.15)`,
                background: PROJ_BG, fontSize: 11,
              }}>{y} <span style={{ color: `${GOLD}55`, fontSize: 9 }}>E</span></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => {
            if (row.sep) return <tr key={ri}><td colSpan={12} style={{ height: 1, background: SEP_COL }} /></tr>;

            const isTot   = row.total;
            const isSub   = row.subtotal;
            const isRatio = row.sub;   // italic sub-row
            const isEdit  = !!row.onEdit;

            const histBg  = isTot ? `${GOLD}08` : HIST_BG;
            const projBg  = isTot ? TOTAL_BG : isEdit ? EDIT_BG : PROJ_BG;

            return (
              <tr key={ri} style={{
                height: ROW_H,
                borderBottom: `1px solid ${isTot ? `${GOLD}22` : SEP_COL}`,
              }}>
                {/* Label */}
                <td style={{
                  padding: "0 14px",
                  height: ROW_H,
                  position: "sticky", left: 0,
                  zIndex: 2,
                  background: isTot ? "#1a1500" : isEdit ? "#0a1c2c" : "#0d1b2e",
                  borderRight: `1px solid rgba(255,255,255,0.08)`,
                  boxShadow: "2px 0 8px rgba(0,0,0,0.5)",
                  color: isTot ? GOLD : isSub ? TEXT : isEdit ? "#cde0f0" : isRatio ? MUTED : MUTED,
                  fontWeight: isTot || isSub ? 700 : isEdit ? 600 : 400,
                  fontStyle: isRatio ? "italic" : "normal",
                  fontSize: 13,
                  paddingLeft: isRatio ? 24 : 14,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {row.label}
                </td>
                {/* Historical — always read-only */}
                {!projOnly && (row.hist || []).map((v, ci) => (
                  <td key={ci} style={{
                    padding: "0 10px", height: ROW_H, textAlign: "right",
                    color: isEdit ? "#3d6880" : isRatio ? "#3d5570" : DIM,
                    fontWeight: isSub || isTot ? 600 : 400,
                    fontStyle: isRatio ? "italic" : "normal",
                    background: histBg,
                    borderLeft: `1px solid ${SEP_COL}`,
                    fontSize: 13,
                  }}>
                    {row.fmt ? row.fmt(v) : cr(v)}
                  </td>
                ))}
                {/* Projected */}
                {(row.proj || []).map((v, ci) => {
                  const isModified = row.modified?.[ci];
                  const baseColor = isTot ? GOLD : isSub ? TEXT
                    : row.posNeg ? (v >= 0 ? GREEN : RED) : "#c8dae8";
                  const fw = isTot || isSub ? 700 : 500;
                  const display = row.fmt ? row.fmt(v) : cr(v);
                  return (
                    <td key={ci} style={{
                      padding: isEdit ? "0 6px" : "0 10px",
                      height: ROW_H, textAlign: "right",
                      background: projBg,
                      borderLeft: `1px solid ${isTot ? `${GOLD}22` : isEdit ? "rgba(46,117,182,0.15)" : SEP_COL}`,
                      fontStyle: isRatio ? "italic" : "normal",
                      verticalAlign: "middle",
                    }}>
                      {isEdit ? (
                        <EditCell
                          rawValue={v} displayValue={display}
                          color={GREEN} fontWeight={fw}
                          isModified={isModified}
                          onCommit={raw => row.onEdit(ci, raw)}
                        />
                      ) : (
                        <span style={{ color: isModified ? GOLD : baseColor, fontWeight: isModified ? 700 : fw,
                                       fontStyle: isRatio ? "italic" : "normal" }}>
                          {display}
                        </span>
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

// ── Collapsible panel section (must be outside main component to preserve state) ──
function PanelSection({ label, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: 10 }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "transparent", border: "none", borderBottom: `1px solid ${GOLD}22`,
        padding: "6px 0", cursor: "pointer", marginBottom: open ? 8 : 0,
      }}>
        <span style={{ fontSize: 9.5, fontWeight: 800, color: GOLD,
                       letterSpacing: "0.12em", textTransform: "uppercase" }}>{label}</span>
        <span style={{ color: GOLD, fontSize: 11, display: "inline-block",
                       transition: "transform 0.2s",
                       transform: open ? "rotate(0deg)" : "rotate(-90deg)" }}>▾</span>
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

// ── Inline note icon + popup ─────────────────────────────────────────────────
function NoteButton({ text }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} style={{
        background: "none", border: "none", cursor: "pointer",
        color: "rgba(255,255,255,0.4)", fontSize: 11,
        display: "inline-flex", alignItems: "center", gap: 4,
        padding: "0 0 10px", fontFamily: "'DM Sans',sans-serif",
        transition: "color 0.2s",
      }}
        onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.75)"}
        onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}
      >
        <span style={{ fontSize: 13, lineHeight: 1 }}>ⓘ</span>
        <span style={{ fontSize: 10, letterSpacing: "0.05em" }}>Note</span>
      </button>
      {open && (
        <div onClick={() => setOpen(false)} style={{
          position: "fixed", inset: 0, zIndex: 3000,
          background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 24,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "#0f1e2d", border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 12, padding: "24px 24px 20px", maxWidth: 460, width: "100%",
            boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
          }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom: 14 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)",
                             letterSpacing: "0.1em", textTransform: "uppercase" }}>Note</span>
              <button onClick={() => setOpen(false)} style={{
                background: "none", border: "none", cursor: "pointer",
                color: "rgba(255,255,255,0.35)", fontSize: 20, lineHeight: 1, padding: 0,
              }}>×</button>
            </div>
            <div style={{ fontSize: 13, color: "#e0e8f0", lineHeight: 1.7 }}>{text}</div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function BajajFinanceDCFModel() {
  const [assumptions, setAssumptions] = useState(deepClone(ANALYST));
  const [tab,    setTab]    = useState(0);
  const [saved,  setSaved]  = useState(null);
  const [banner, setBanner] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);  // mobile assumptions sheet
  const [panelOpen, setPanelOpen] = useState(true);    // desktop panel visible
  const [waccInputs, setWaccInputs] = useState({
    rfr:        7.0,   // Risk-Free Rate %
    mrp:        6.4,   // Market Risk Premium %
    beta:       1.1,   // Beta
    debtCost:   3.2,   // Pre-tax cost of debt %
    totalDebt:  320000,// ₹ Cr (FY25 borrowings)
    marketCap:  520000,// ₹ Cr (60.12Cr shares × ₹8650)
    useBuildup: false, // when true, WACC is auto-derived
  });
  const setWacc = (key, val) => setWaccInputs(prev => ({ ...prev, [key]: val }));

  // WACC buildup computation
  const coe       = +(waccInputs.rfr + waccInputs.beta * waccInputs.mrp).toFixed(2);
  const atCod     = +(waccInputs.debtCost * (1 - assumptions.taxRate / 100)).toFixed(2);
  const totalCap  = waccInputs.totalDebt + waccInputs.marketCap;
  const dWt       = totalCap > 0 ? +(waccInputs.totalDebt / totalCap * 100).toFixed(1) : 0;
  const eWt       = +(100 - dWt).toFixed(1);
  const derivedWACC = +(coe * eWt / 100 + atCod * dWt / 100).toFixed(2);

  // Sync derived WACC into assumptions when buildup mode is on
  useEffect(() => {
    if (waccInputs.useBuildup) {
      setAssumptions(prev => ({ ...deepClone(prev), wacc: derivedWACC }));
    }
  }, [derivedWACC, waccInputs.useBuildup]);

  // Load SheetJS from CDN once — no npm install required
  useEffect(() => {
    if (!window.XLSX) {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
      document.head.appendChild(s);
    }
  }, []);

  // live model
  const model = useMemo(() => runModel(assumptions), [assumptions]);
  // analyst reference model
  const analystModel = useMemo(() => runModel(ANALYST), []);
  // sensitivity grid
  const { ws: sensWs, tgs: sensTgs, grid: sensGrid } = useMemo(() => calcSensGrid(assumptions), [assumptions]);

  const isModified = useCallback((key, idx = null) => {
    if (idx !== null) return assumptions[key][idx] !== ANALYST[key][idx];
    return assumptions[key] !== ANALYST[key];
  }, [assumptions]);

  const set = useCallback((key, val, idx = null) => {
    setAssumptions(prev => {
      const next = deepClone(prev);
      if (idx !== null) next[key][idx] = val;
      else next[key] = val;
      return next;
    });
  }, []);

  const resetToAnalyst = () => { setAssumptions(deepClone(ANALYST)); setBanner("Reset to Vantage Capital analyst model"); setTimeout(() => setBanner(null), 2500); };

  const saveScenario = () => { setSaved(deepClone(assumptions)); setBanner("Scenario saved"); setTimeout(() => setBanner(null), 2500); };

  const loadScenario = () => {
    if (!saved) return;
    setAssumptions(deepClone(saved));
    setBanner("Scenario loaded"); setTimeout(() => setBanner(null), 2500);
  };

  const exportExcel = async () => {
    try {
      const XLSX = window.XLSX;
      if (!XLSX) { setBanner("Loading Excel library... try again in 2s"); setTimeout(() => setBanner(null), 2500); return; }
      const wb = XLSX.utils.book_new();

      // P&L sheet
      const plData = [
        ["Bajaj Finance — DCF Model | Vantage Capital", ...Array(10).fill("")],
        ["INCOME STATEMENT (₹ Crore)", ...H.yr, ...P_YRS],
        ["Revenue", ...H.rev, ...model.pl.map(r => r.rev)],
        ["YoY Growth (%)", ...H.yr.map((_,i) => i===0 ? "—" : +((H.rev[i]/H.rev[i-1]-1)*100).toFixed(1)), ...model.pl.map(r => r.revGrowthPct)],
        ["EBITDA", ...H.ebitda, ...model.pl.map(r => r.ebitda)],
        ["EBITDA Margin (%)", ...H.rev.map((_,i) => +(H.ebitda[i]/H.rev[i]*100).toFixed(1)), ...model.pl.map(r => r.ebitdaM)],
        ["D&A", ...H.da, ...model.pl.map(r => r.da)],
        ["EBIT", ...H.ebit, ...model.pl.map(r => r.ebit)],
        ["Tax", ...H.tax, ...model.pl.map(r => r.tax)],
        ["NOPAT / PAT", ...H.pat, ...model.pl.map(r => r.pat)],
        ["PAT Margin (%)", ...H.pat.map((_,i) => +(H.pat[i]/H.rev[i]*100).toFixed(1)), ...model.pl.map(r => r.patM)],
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(plData), "Income Statement");

      // BS sheet
      const bsData = [
        ["BALANCE SHEET (₹ Crore)", ...H.yr, ...P_YRS],
        ["Fixed Assets (Net)", ...H.fixedAssets, ...model.bs.map(r => r.fa)],
        ["Loan Book / AUM", ...H.loanBook, ...model.bs.map(r => r.lb)],
        ["Other Assets", ...H.otherAssets, ...model.bs.map(r => r.oa)],
        ["TOTAL ASSETS", ...H.fixedAssets.map((_,i) => H.fixedAssets[i]+H.loanBook[i]+H.otherAssets[i]), ...model.bs.map(r => r.totA)],
        ["", ...Array(11).fill("")],
        ["Equity", ...H.equity, ...model.bs.map(r => r.eq)],
        ["Borrowings", ...H.borrowings, ...model.bs.map(r => r.bor)],
        ["Other Liabilities", ...H.otherLiab, ...model.bs.map(r => r.ol)],
        ["TOTAL LIABILITIES", ...H.equity.map((_,i)=>H.equity[i]+H.borrowings[i]+H.otherLiab[i]), ...model.bs.map(r => r.totA)],
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(bsData), "Balance Sheet");

      // CF sheet
      const cfData = [
        ["CASH FLOW STATEMENT (₹ Crore)", ...H.yr, ...P_YRS],
        ["PAT", ...H.pat, ...model.pl.map(r => r.pat)],
        ["+ D&A", ...H.da, ...model.cf.map(r => r.da)],
        ["- ΔWorking Capital", "—","—","—","—","—","—", ...model.cf.map(r => r.dwc)],
        ["Cash from Operations", ...H.cfo, ...model.cf.map(r => r.cfo)],
        ["- Capex", ...H.capex.map(v=>-v), ...model.cf.map(r => -r.capex)],
        ["FCFF", ...H.capex.map((_,i)=>H.cfo[i]-H.capex[i]), ...model.cf.map(r => r.fcff)],
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(cfData), "Cash Flow");

      // DCF sheet
      const dcfData = [
        ["DCF VALUATION", "FY26E","FY27E","FY28E","FY29E","FY30E"],
        ["FCFF (₹ Cr)", ...model.cf.map(r => r.fcff)],
        ["Discount Factor", ...model.pvArr.map((_,i) => +(1/Math.pow(1+assumptions.wacc/100,i+1)).toFixed(4))],
        ["PV of FCFF", ...model.pvArr],
        ["","","","","",""],
        ["Sum PV FCFF (₹ Cr)", model.pvFCFF, "", "", "", ""],
        ["Terminal Value (₹ Cr)", model.tv, "", "", "", ""],
        ["PV of TV (₹ Cr)", model.pvTV, "", "", "", ""],
        ["Enterprise / Equity Value (₹ Cr)", model.eqVal, "", "", "", ""],
        ["Shares Outstanding (Cr)", SHARES, "", "", "", ""],
        ["Intrinsic Value / Share (₹)", model.iv, "", "", "", ""],
        ["CMP (₹)", CMP, "", "", "", ""],
        ["Upside / Downside", `${model.upside}%`, "", "", "", ""],
        ["","","","","",""],
        ["NOTE: For NBFC (Bajaj Finance), revenue is already net of interest expense (NII + Fees).", "", "", "", "", ""],
        ["FCFF is treated as equity cash flow. No net debt deduction from Enterprise Value.", "", "", "", "", ""],
        ["WACC used = Cost of Equity proxy.", "", "", "", "", ""],
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(dcfData), "DCF Valuation");

      XLSX.writeFile(wb, `BajajFinance_DCF_VantageCapital_${new Date().toISOString().slice(0,10)}.xlsx`);
      setBanner("Excel file downloaded");
      setTimeout(() => setBanner(null), 2500);
    } catch (e) {
      setBanner("Excel export failed — try again");
      setTimeout(() => setBanner(null), 3000);
    }
  };

  const tabs = ["P&L","Balance Sheet","Cash Flow","FCFF & DCF","Sensitivity","vs Analyst","Key Metrics"];

  // ── Chart data ──────────────────────────────────────────────────────────────
  const chartData = H.yr.map((y, i) => ({
    yr: y, rev: H.rev[i], ebitda: H.ebitda[i], pat: H.pat[i], type: "H",
  })).concat(model.pl.map((r, i) => ({
    yr: P_YRS[i], rev: r.rev, ebitda: r.ebitda, pat: r.pat, type: "P",
  })));

  const fcffChartData = model.cf.map((r, i) => ({
    yr: P_YRS[i], fcff: r.fcff, pv: model.pvArr[i],
  }));

  // ── Assumption panel ────────────────────────────────────────────────────────
  const AssumptionPanel = (
    <div style={{ width: 272, flexShrink: 0, background: CARD, borderLeft: `1px solid ${GOLD}20`,
                  overflowY: "auto", padding: "14px 14px 80px", fontSize: 11 }}>

      <div style={{ fontSize: 9.5, color: DIM, marginBottom: 10 }}>Blue = modified from analyst model</div>

      <PanelSection label="Revenue Growth (% YoY)" defaultOpen={false}>
        {P_YRS.map((y, i) => (
          <SliderRow key={y} label={y} value={assumptions.revGrowth[i]} min={-15} max={60} step={0.1}
            modified={isModified("revGrowth", i)} onChange={v => set("revGrowth", v, i)} />
        ))}
      </PanelSection>

      <PanelSection label="EBITDA Margin (%)" defaultOpen={false}>
        {P_YRS.map((y, i) => (
          <SliderRow key={y} label={y} value={assumptions.ebitdaMargin[i]} min={-20} max={80} step={0.1}
            modified={isModified("ebitdaMargin", i)} onChange={v => set("ebitdaMargin", v, i)} />
        ))}
      </PanelSection>

      <PanelSection label="Operating Assumptions" defaultOpen={false}>
        <div style={{ fontSize:10, color:MUTED, marginBottom:4 }}>D&A % OF REVENUE</div>
        {P_YRS.map((y, i) => (
          <SliderRow key={y} label={y} value={assumptions.daRev[i]} min={0} max={10} step={0.1}
            modified={assumptions.daRev[i] !== ANALYST.daRev[i]}
            onChange={v => set("daRev", v, i)} />
        ))}
        <SliderRow label="Capex % of Revenue" value={assumptions.capexRev} min={0.5} max={5} step={0.1}
          modified={isModified("capexRev")} onChange={v => set("capexRev", v)} />
        <SliderRow label="ΔWC % of Rev Change" value={assumptions.wcRev} min={0} max={10} step={0.1}
          modified={isModified("wcRev")} onChange={v => set("wcRev", v)} />
        <SliderRow label="Tax Rate" value={assumptions.taxRate} min={15} max={40} step={0.1}
          modified={isModified("taxRate")} onChange={v => set("taxRate", v)} />
      </PanelSection>

      <PanelSection label="WACC Build-up" defaultOpen={false}>
        <div style={{ background: "#0a1420", borderRadius: 6, padding: "10px 10px 6px",
                      border: `1px solid ${BLUE}22`, marginBottom: 8 }}>
          <SliderRow label="Risk-Free Rate" value={waccInputs.rfr} min={4} max={12} step={0.1}
            modified={waccInputs.rfr !== 7.0} onChange={v => setWacc("rfr", v)} />
          <SliderRow label="Market Risk Premium" value={waccInputs.mrp} min={3} max={12} step={0.1}
            modified={waccInputs.mrp !== 6.4} onChange={v => setWacc("mrp", v)} />
          <SliderRow label="Beta" value={waccInputs.beta} min={0.3} max={2.5} step={0.05}
            modified={waccInputs.beta !== 1.1} onChange={v => setWacc("beta", v)} />
          <div style={{ display:"flex", justifyContent:"space-between", padding:"4px 0",
                        borderTop:`1px solid rgba(255,255,255,0.06)`, marginTop:4 }}>
            <span style={{ fontSize:11, color:MUTED }}>Cost of Equity</span>
            <span style={{ fontSize:12, fontWeight:800, color:BLUE }}>{coe}%</span>
          </div>
          <div style={{ height:1, background:"rgba(255,255,255,0.05)", margin:"8px 0" }} />
          <SliderRow label="Pre-tax Cost of Debt" value={waccInputs.debtCost} min={1} max={12} step={0.1}
            modified={waccInputs.debtCost !== 3.2} onChange={v => setWacc("debtCost", v)} />
          <div style={{ display:"flex", justifyContent:"space-between", padding:"4px 0" }}>
            <span style={{ fontSize:11, color:MUTED }}>After-Tax Cost of Debt</span>
            <span style={{ fontSize:12, fontWeight:700, color:MUTED }}>{atCod}%</span>
          </div>
          <div style={{ height:1, background:"rgba(255,255,255,0.05)", margin:"8px 0" }} />
          <SliderRow label="Total Debt (₹ Cr)" value={waccInputs.totalDebt} min={0} max={600000} step={1000}
            modified={waccInputs.totalDebt !== 320000} onChange={v => setWacc("totalDebt", v)} suffix="" />
          <SliderRow label="Market Cap (₹ Cr)" value={waccInputs.marketCap} min={0} max={1200000} step={1000}
            modified={waccInputs.marketCap !== 520000} onChange={v => setWacc("marketCap", v)} suffix="" />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginTop:6,
                        padding:"6px 0", borderTop:`1px solid rgba(255,255,255,0.06)` }}>
            <div><div style={{fontSize:9,color:DIM}}>Debt Wt.</div><div style={{fontSize:13,fontWeight:700,color:ORANGE}}>{dWt}%</div></div>
            <div><div style={{fontSize:9,color:DIM}}>Equity Wt.</div><div style={{fontSize:13,fontWeight:700,color:GREEN}}>{eWt}%</div></div>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                        padding:"6px 0", borderTop:`1px solid rgba(255,255,255,0.06)`, marginTop:2 }}>
            <span style={{ fontSize:11, fontWeight:700, color:GOLD }}>Derived WACC</span>
            <span style={{ fontSize:14, fontWeight:900, color:GOLD }}>{derivedWACC}%</span>
          </div>
          <button onClick={() => setWacc("useBuildup", !waccInputs.useBuildup)} style={{
            width:"100%", marginTop:8, padding:"5px 0", borderRadius:5, fontSize:10, cursor:"pointer",
            background: waccInputs.useBuildup ? `${GREEN}22` : "transparent",
            border: `1px solid ${waccInputs.useBuildup ? GREEN : GOLD}44`,
            color: waccInputs.useBuildup ? GREEN : DIM, fontWeight:700,
          }}>
            {waccInputs.useBuildup ? "✓ Using derived WACC" : "Apply derived WACC →"}
          </button>
        </div>
      </PanelSection>

      <PanelSection label="Valuation" defaultOpen={false}>
        <SliderRow label="WACC / CoE (manual)" value={assumptions.wacc} min={7} max={18} step={0.5}
          modified={isModified("wacc")} onChange={v => { set("wacc", v); setWacc("useBuildup", false); }} />
        <SliderRow label="Terminal Growth Rate" value={assumptions.termGrowth} min={3} max={10} step={0.1}
          modified={isModified("termGrowth")} onChange={v => set("termGrowth", v)} />
      </PanelSection>

      {/* Live valuation pill */}
      <div style={{ marginTop: 10, padding: "12px 10px", background: model.upside > 0 ? `${GREEN}15` : `${RED}15`,
                    borderRadius: 8, border: `1px solid ${model.upside > 0 ? GREEN : RED}44`, textAlign: "center" }}>
        <div style={{ fontSize: 10, color: MUTED, marginBottom: 2 }}>INTRINSIC VALUE</div>
        <div style={{ fontSize: 26, fontWeight: 900, color: model.upside > 0 ? GREEN : RED, fontFamily: "'DM Sans',sans-serif" }}>
          {model.ok ? `₹${model.iv.toLocaleString("en-IN")}` : "Invalid"}
        </div>
        <div style={{ fontSize: 11, color: model.upside > 0 ? GREEN : RED, fontWeight: 700 }}>
          {model.ok ? `${model.upside > 0 ? "+" : ""}${model.upside}% vs CMP ₹${CMP.toLocaleString("en-IN")}` : "WACC ≤ terminal growth"}
        </div>
        <div style={{ fontSize: 9.5, color: DIM, marginTop: 4 }}>WACC {assumptions.wacc}% · TG {assumptions.termGrowth}%</div>
      </div>

      <NoteButton text="Revenue = NII + Fees (net of funding costs). FCFF treated as equity cash flow. No net debt deduction. WACC = Cost of Equity proxy for NBFCs." />
    </div>
  );

  // ── P&L Tab ─────────────────────────────────────────────────────────────────
  const PLTab = (
    <div>
      <NoteButton text="Revenue = NII + Fees + Other Income, already net of interest expense on borrowings. EBITDA = pre-provision operating profit. FY21 EBITDA margin dip reflects COVID provisioning." />
      <StatTable rows={[
        { label: "Revenue (₹ Cr)", hist: H.rev, proj: model.pl.map(r => r.rev), subtotal: true },
        { label: "  YoY Growth %", sub: true, hist: H.yr.map((_,i) => i===0 ? null : +((H.rev[i]/H.rev[i-1]-1)*100).toFixed(1)),
          proj: model.pl.map(r => r.revGrowthPct), fmt: v => v==null ? "—" : `${v}%`, posNeg: true,
          modified: assumptions.revGrowth.map((v,i) => v !== ANALYST.revGrowth[i]),
          onEdit: (ci, raw) => { const n = parseFloat(raw); if (!isNaN(n)) set("revGrowth", Math.min(60, Math.max(-15, n)), ci); } },
        { label: "EBITDA (₹ Cr)", hist: H.ebitda, proj: model.pl.map(r => r.ebitda), subtotal: true },
        { label: "  EBITDA Margin %", sub: true, hist: H.rev.map((_,i) => +(H.ebitda[i]/H.rev[i]*100).toFixed(1)),
          proj: model.pl.map(r => r.ebitdaM), fmt: pct,
          modified: assumptions.ebitdaMargin.map((v,i) => v !== ANALYST.ebitdaMargin[i]),
          onEdit: (ci, raw) => { const n = parseFloat(raw); if (!isNaN(n)) set("ebitdaMargin", Math.min(80, Math.max(-20, n)), ci); } },
        { label: "  D&A % of Revenue", sub: true, hist: H.rev.map((_,i) => +(H.da[i]/H.rev[i]*100).toFixed(1)),
          proj: assumptions.daRev, fmt: pct,
          modified: assumptions.daRev.map((v,i) => v !== ANALYST.daRev[i]),
          onEdit: (ci, raw) => { const n = parseFloat(raw); if (!isNaN(n)) set("daRev", Math.min(10, Math.max(0, n)), ci); } },
        { label: "(-) D&A (₹ Cr)", hist: H.da, proj: model.pl.map(r => r.da) },
        { label: "EBIT (₹ Cr)", hist: H.ebit, proj: model.pl.map(r => r.ebit), subtotal: true },
        { label: "(-) Tax (₹ Cr)", hist: H.tax, proj: model.pl.map(r => r.tax) },
        { label: "Tax Rate %", hist: H.tax.map((_,i) => H.ebit[i]>0?+(H.tax[i]/H.ebit[i]*100).toFixed(1):null),
          proj: model.pl.map(() => assumptions.taxRate), fmt: pct,
          modified: [0,1,2,3,4].map(() => assumptions.taxRate !== ANALYST.taxRate),
          onEdit: (_ci, raw) => { const n = parseFloat(raw); if (!isNaN(n)) set("taxRate", Math.min(40, Math.max(15, n))); } },
        { label: "NOPAT / PAT (₹ Cr)", hist: H.pat, proj: model.pl.map(r => r.pat), total: true },
        { label: "  PAT Margin", sub: true, hist: H.pat.map((_,i) => +(H.pat[i]/H.rev[i]*100).toFixed(1)),
          proj: model.pl.map(r => r.patM), fmt: pct },
      ]} />
      <div style={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="yr" tick={{ fill: MUTED, fontSize: 10 }} />
            <YAxis yAxisId="l" tick={{ fill: MUTED, fontSize: 10 }} />
            <YAxis yAxisId="r" orientation="right" tick={{ fill: MUTED, fontSize: 10 }} />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Bar yAxisId="l" dataKey="rev" name="Revenue (₹Cr)" radius={[3,3,0,0]}>
              {chartData.map((d,i) => <Cell key={i} fill={d.type==="P" ? `${BLUE}66` : BLUE} />)}
            </Bar>
            <Line yAxisId="r" dataKey="pat" name="PAT (₹Cr)" stroke={GOLD} strokeWidth={2} dot={{ r: 2.5 }}
              strokeDasharray={chartData.map(d => d.type==="P" ? "5 3" : "0").join(" ")} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  // ── Balance Sheet Tab ───────────────────────────────────────────────────────
  const BSTab = (
    <div>
      <div style={{ fontSize: 11, color: MUTED, marginBottom: 12 }}>
        Loan book grows at same rate as revenue (NBFCs deploy capital to generate revenue).
        Equity builds via retained earnings (70% retention assumed). Borrowings maintain ~78% of total assets.
      </div>
      <StatTable rows={[
        { label: "Fixed Assets (Net, ₹ Cr)", hist: H.fixedAssets, proj: model.bs.map(r => r.fa) },
        { label: "Loan Book / AUM (₹ Cr)", hist: H.loanBook, proj: model.bs.map(r => r.lb) },
        { label: "Other Assets (₹ Cr)", hist: H.otherAssets, proj: model.bs.map(r => r.oa) },
        { label: "TOTAL ASSETS (₹ Cr)", hist: H.fixedAssets.map((_,i)=>H.fixedAssets[i]+H.loanBook[i]+H.otherAssets[i]),
          proj: model.bs.map(r => r.totA), total: true },
        { sep: true },
        { label: "Equity (₹ Cr)", hist: H.equity, proj: model.bs.map(r => r.eq) },
        { label: "Borrowings (₹ Cr)", hist: H.borrowings, proj: model.bs.map(r => r.bor) },
        { label: "Other Liabilities (₹ Cr)", hist: H.otherLiab, proj: model.bs.map(r => r.ol) },
        { label: "TOTAL LIABILITIES (₹ Cr)", hist: H.equity.map((_,i)=>H.equity[i]+H.borrowings[i]+H.otherLiab[i]),
          proj: model.bs.map(r => r.totA), total: true },
      ]} />
    </div>
  );

  // ── Cash Flow Tab ───────────────────────────────────────────────────────────
  const CFTab = (
    <div>
      <StatTable rows={[
        { label: "PAT (₹ Cr)", hist: H.pat, proj: model.pl.map(r => r.pat) },
        { label: "  (+) D&A (₹ Cr)", hist: H.da, proj: model.cf.map(r => r.da) },
        { label: "  (-) ΔWorking Capital",
          hist: Array(6).fill(null),
          proj: model.cf.map(r => r.dwc), posNeg: true },
        { label: "Cash from Operations (₹ Cr)", hist: H.cfo, proj: model.cf.map(r => r.cfo), subtotal: true },
        { sep: true },
        { label: "  (-) Capex (₹ Cr)", hist: H.capex, proj: model.cf.map(r => r.capex) },
        { label: "Cash from Investing (₹ Cr)", hist: H.capex.map(v => -v), proj: model.cf.map(r => -r.capex) },
        { sep: true },
        { label: "FCFF (₹ Cr)", hist: H.cfo.map((v,i) => v - H.capex[i]), proj: model.cf.map(r => r.fcff), total: true },
        { label: "  CFO/PAT %", hist: H.cfo.map((v,i) => H.pat[i] > 0 ? Math.round(v/H.pat[i]*100) : null),
          proj: model.cf.map((r,i) => model.pl[i].pat > 0 ? Math.round(r.cfo/model.pl[i].pat*100) : null), fmt: v => v==null?"—":`${v}%` },
      ]} />
      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={fcffChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="yr" tick={{ fill: MUTED, fontSize: 11 }} />
            <YAxis tick={{ fill: MUTED, fontSize: 11 }} />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="fcff" name="FCFF (₹Cr)" fill={TEAL} radius={[3,3,0,0]} />
            <Line dataKey="pv" name="PV of FCFF (₹Cr)" stroke={GOLD} strokeWidth={2} dot={{ r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  // ── FCFF & DCF Tab ──────────────────────────────────────────────────────────
  const DCFTab = (
    <div>
      <NoteButton text="Traditional FCFF (NOPAT + D&A − Capex − ΔNWC) is designed for industrial companies. For NBFCs like Bajaj Finance, lending capital IS working capital — ΔNWC inflates and FCFF understates true cash generation. A more rigorous approach would use Dividend Discount Model (DDM) or Excess Return Model. Use this DCF directionally, not definitively. Note: tiny WACC/TG spread changes drive large IV swings as terminal value dominates." />
      {/* FCFF bridge — uses StatTable for sticky column + consistent fonts */}
      <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: "0.1em",
                    textTransform: "uppercase", marginBottom: 8 }}>FCFF Bridge</div>
      <StatTable rows={[
        { label: "EBIT (₹ Cr)",           hist: H.ebit, proj: model.pl.map(r => r.ebit) },
        { label: "  (-) Tax on EBIT",      hist: H.tax,  proj: model.pl.map(r => r.tax), sub: true },
        { label: "NOPAT (₹ Cr)",           hist: H.pat,  proj: model.pl.map(r => r.nopat), subtotal: true },
        { label: "  (+) D&A (₹ Cr)",       hist: H.da,   proj: model.cf.map(r => r.da), sub: true },
        { label: "  (-) Capex (₹ Cr)",     hist: H.capex, proj: model.cf.map(r => r.capex), sub: true },
        { label: "  (-) ΔNWC (₹ Cr)",      hist: H.rev.map((_,i) => i===0 ? null : Math.round((H.rev[i]-H.rev[i-1])*ANALYST.wcRev/100)),
          proj: model.cf.map(r => r.dwc), sub: true },
        { label: "FCFF (₹ Cr)",            hist: H.cfo.map((_,i) => H.cfo[i] - H.capex[i]),
          proj: model.cf.map(r => r.fcff), total: true },
        { sep: true },
        { label: "Discount Factor",        hist: H.yr.map(() => null),
          proj: model.pvArr.map((_,i) => +(1/Math.pow(1+assumptions.wacc/100,i+1)).toFixed(4)),
          fmt: v => v == null ? "—" : v.toFixed(4) },
        { label: "PV of FCFF (₹ Cr)",      hist: H.yr.map(() => null), proj: model.pvArr,
          fmt: v => v == null ? "—" : cr(v) },
      ]} />

      {/* Inline WACC / TG controls */}
      <div style={{ background: "#0a1420", border: `1px solid ${BLUE}22`, borderRadius: 8,
                    padding: "14px 16px", marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: GOLD, letterSpacing: "0.12em",
                      textTransform: "uppercase", marginBottom: 12 }}>Valuation Assumptions</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[
            { label: "WACC / CoE %", key: "wacc", min: 1, max: 25,
              onChange: v => { set("wacc", v); setWacc("useBuildup", false); } },
            { label: "Terminal Growth %", key: "termGrowth", min: 0, max: 15,
              onChange: v => set("termGrowth", v) },
          ].map(({ label, key, min, max, onChange }) => {
            const val = assumptions[key];
            const modified = isModified(key);
            return (
              <div key={key}>
                <div style={{ fontSize: 10, color: MUTED, marginBottom: 4 }}>{label}</div>
                <input
                  type="text" inputMode="decimal"
                  defaultValue={val}
                  key={val}
                  onBlur={e => { const n = parseFloat(e.target.value); if (!isNaN(n)) onChange(Math.min(max, Math.max(min, n))); }}
                  onKeyDown={e => { if (e.key === "Enter") e.target.blur(); }}
                  style={{
                    width: "100%", padding: "8px 12px", fontSize: 18, fontWeight: 800,
                    background: "#06111c", border: `1px solid ${modified ? GOLD : BLUE}44`,
                    borderRadius: 6, color: modified ? GOLD : GREEN,
                    outline: "none", fontFamily: "'DM Sans',sans-serif",
                    caretColor: GOLD, textAlign: "center",
                  }}
                />
              </div>
            );
          })}
        </div>
        {(() => {
          const spread = assumptions.wacc - assumptions.termGrowth;
          const tvShare = model.pvFCFF + model.pvTV > 0
            ? (model.pvTV / (model.pvFCFF + model.pvTV) * 100) : 0;
          const lesson =
            spread <= 0 ? { color: RED,    msg: "❌ WACC ≤ TG: Gordon Growth formula breaks (negative denominator). IV is undefined — this is a mathematical impossibility." } :
            spread <= 1 ? { color: RED,    msg: `⚠ ${spread.toFixed(1)}% spread: Terminal value is ~${tvShare.toFixed(0)}% of IV. Model is in extreme territory — a 0.5% WACC change will move IV by 30-50%.` } :
            spread <= 3 ? { color: ORANGE, msg: `⚠ ${spread.toFixed(1)}% spread: TV = ${tvShare.toFixed(0)}% of total IV. High sensitivity — this is typical for fast-growing NBFCs but demands conservatism.` } :
            spread <= 5 ? { color: GOLD,   msg: `${spread.toFixed(1)}% spread: TV = ${tvShare.toFixed(0)}% of total IV. Moderate sensitivity — reasonable for a mature compounder.` } :
                          { color: GREEN,  msg: `${spread.toFixed(1)}% spread: TV = ${tvShare.toFixed(0)}% of total IV. Wide spread — terminal value is less dominant. Model is relatively stable here.` };
          return (
            <div style={{ marginTop: 10, padding: "10px 12px", background: `${lesson.color}10`,
                          border: `1px solid ${lesson.color}30`, borderRadius: 6,
                          fontSize: 11, color: lesson.color, lineHeight: 1.6 }}>
              {lesson.msg}
            </div>
          );
        })()}
      </div>

      {/* Valuation summary */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        {[
          { label: "Sum PV of FCFF",        value: cr(model.pvFCFF),  color: TEAL,  sub: `${model.pvArr.length} years discounted` },
          { label: "Terminal Value (TV)",   value: cr(model.tv),      color: BLUE,  sub: `FCFF×(1+${assumptions.termGrowth}%)/(WACC−TG)` },
          { label: "PV of Terminal Value",  value: cr(model.pvTV),    color: ORANGE,sub: `${(model.pvTV / (model.pvFCFF + model.pvTV) * 100).toFixed(1)}% of total EV` },
          { label: "Equity Value",          value: cr(model.eqVal),   color: GOLD,  sub: "NBFC: EV ≈ Equity Value" },
          { label: "Intrinsic Value/Share", value: model.ok ? `₹${model.iv.toLocaleString("en-IN")}` : "N/A",
            color: model.upside > 0 ? GREEN : RED, sub: `${model.upside > 0 ? "+" : ""}${model.upside}% vs CMP` },
        ].map((m, i) => (
          <div key={i} style={{ background: CARD, border: `1px solid ${m.color}22`, borderRadius: 8,
                                padding: "10px 14px", flex: 1, minWidth: 130 }}>
            <div style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>{m.label}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: m.color, fontFamily: "'DM Sans',sans-serif" }}>{m.value}</div>
            <div style={{ fontSize: 10, color: DIM, marginTop: 1 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* WACC build-up */}
      <div style={{ background: CARD, borderRadius: 8, padding: 14, border: `1px solid ${BLUE}22`, marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: BLUE, marginBottom: 8 }}>WACC Summary</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, fontSize: 11 }}>
          {[
            { label: "Risk-Free Rate (approx)", value: "7.0%", note: "10Y Gsec yield" },
            { label: "Equity Risk Premium", value: "6.4%", note: "India ERP" },
            { label: "Beta (Bajaj Finance)", value: "1.1x", note: "Market risk relative" },
            { label: "Cost of Equity", value: "14.0%", note: "7% + 1.1×6.4%" },
            { label: "User WACC Input", value: `${assumptions.wacc}%`, note: "Adjustable above", highlight: true },
            { label: "Terminal Growth", value: `${assumptions.termGrowth}%`, note: "Perpetuity growth", highlight: true },
          ].map((item, i) => (
            <div key={i} style={{ padding: "8px 10px", background: item.highlight ? `${GOLD}10` : "#0a1420",
                                  borderRadius: 6, border: `1px solid ${item.highlight ? GOLD : "transparent"}22` }}>
              <div style={{ color: MUTED, fontSize: 10, marginBottom: 2 }}>{item.label}</div>
              <div style={{ color: item.highlight ? GOLD : TEXT, fontWeight: 700, fontSize: 14 }}>{item.value}</div>
              <div style={{ color: DIM, fontSize: 10 }}>{item.note}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Sensitivity Tab ─────────────────────────────────────────────────────────
  const SensTab = (
    <div>
      <NoteButton text={`📚 Learning this table: Each cell shows what IV would be at that WACC × TG combination — holding all other assumptions fixed.\n\n🔑 The spread (WACC − TG) is everything. A spread of 10% vs 2% can move IV by 10x. When spread is tight (≤2%), terminal value becomes 90-95% of total IV — meaning tiny changes in WACC or TG produce massive swings. This is not a model flaw; it is the fundamental limitation of DCF for perpetuity businesses.\n\nRed border cells = spread ≤ 2%: extreme sensitivity zone. WACC ≤ TG cells = mathematical impossibility (Gordon Growth breaks down).\n\nBase case: WACC ${ANALYST.wacc}%, TG ${ANALYST.termGrowth}% (highlighted gold).`} />
      <div style={{ overflowX: "auto", marginBottom: 24, WebkitOverflowScrolling: "touch", borderRadius: 8, border: "1px solid rgba(255,255,255,0.07)" }}>
        <table style={{ borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ padding: "8px 14px", textAlign: "left", color: GOLD, fontWeight: 700,
                           borderBottom: `2px solid ${GOLD}33`, background: NAVY, minWidth: 140,
                           position: "sticky", left: 0, zIndex: 3, boxShadow: "2px 0 8px rgba(0,0,0,0.5)" }}>
                WACC ↓ / TG →
              </th>
              {sensTgs.map(tg => (
                <th key={tg} style={{ padding: "8px 14px", textAlign: "center", color: GOLD, fontWeight: 700,
                                     borderBottom: `2px solid ${GOLD}33`, minWidth: 100,
                                     background: tg === Math.round(assumptions.termGrowth) ? `${GOLD}18` : NAVY }}>
                  TG {tg}%
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sensWs.map((w, wi) => (
              <tr key={w} style={{ background: w === Math.round(assumptions.wacc) ? `${GOLD}08` : "transparent" }}>
                <td style={{ padding: "8px 14px", fontWeight: 700, color: w === Math.round(assumptions.wacc) ? GOLD : MUTED,
                             position: "sticky", left: 0, zIndex: 2,
                             boxShadow: "2px 0 8px rgba(0,0,0,0.5)",
                             background: w === Math.round(assumptions.wacc) ? "#1a1500" : "#07101c" }}>
                  WACC {w}%
                </td>
                {sensGrid[wi].map(({ iv, spread }, tgi) => {
                  if (iv === null) return (
                    <td key={tgi} style={{ padding: "8px 10px", textAlign: "center",
                                          background: "#0a0a0a", borderLeft: "2px solid rgba(255,50,50,0.3)" }}>
                      <div style={{ fontSize: 10, color: RED, fontWeight: 700 }}>WACC ≤ TG</div>
                      <div style={{ fontSize: 9, color: DIM, marginTop: 2 }}>No valid IV</div>
                    </td>
                  );
                  const up = (iv - CMP) / CMP * 100;
                  const bg = up > 20 ? `${GREEN}15` : up > 0 ? `${ORANGE}10` : `${RED}10`;
                  const col = up > 20 ? GREEN : up > 0 ? ORANGE : RED;
                  const isBase = w === Math.round(assumptions.wacc) && sensTgs[tgi] === Math.round(assumptions.termGrowth);
                  const tightSpread = spread <= 2;
                  return (
                    <td key={tgi} style={{ padding: "8px 10px", textAlign: "center",
                                          background: isBase ? `${GOLD}20` : bg,
                                          border: isBase ? `1px solid ${GOLD}55` : tightSpread ? `1px solid ${ORANGE}44` : "none",
                                          position: "relative" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: isBase ? GOLD : col }}>
                        ₹{iv.toLocaleString("en-IN")}
                      </div>
                      <div style={{ fontSize: 10, color: col }}>
                        {up > 0 ? "+" : ""}{up.toFixed(1)}%
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

  // ── vs Analyst Tab ──────────────────────────────────────────────────────────
  const AnalystTab = (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <div style={{ padding: "6px 14px", background: `${BLUE}22`, border: `1px solid ${BLUE}44`, borderRadius: 6, fontSize: 11, color: BLUE, fontWeight: 700 }}>
          Your Model — IV: ₹{model.ok ? model.iv.toLocaleString("en-IN") : "N/A"} ({model.upside > 0 ? "+" : ""}{model.upside}%)
        </div>
        <div style={{ padding: "6px 14px", background: `${GOLD}15`, border: `1px solid ${GOLD}44`, borderRadius: 6, fontSize: 11, color: GOLD, fontWeight: 700 }}>
          Analyst Model — IV: ₹{analystModel.iv.toLocaleString("en-IN")} ({analystModel.upside > 0 ? "+" : ""}{analystModel.upside}%)
        </div>
      </div>
      <div style={{ overflowX: "auto", marginBottom: 20, WebkitOverflowScrolling: "touch", borderRadius: 8, border: "1px solid rgba(255,255,255,0.07)" }}>
        <table style={{ borderCollapse: "collapse", fontSize: 13, width: "100%", minWidth: 700 }}>
          <thead>
            <tr>
              <th style={{ padding: "7px 10px", textAlign: "left", color: GOLD, borderBottom: `2px solid ${GOLD}33`,
                           position: "sticky", left: 0, zIndex: 3, background: "#07101c", minWidth: 160, boxShadow: "2px 0 8px rgba(0,0,0,0.5)" }}>Assumption</th>
              {P_YRS.map(y => (
                <th key={y} colSpan={2} style={{ padding: "7px 10px", textAlign: "center", color: GOLD,
                                                 borderBottom: `2px solid ${GOLD}33`, minWidth: 150 }}>{y}</th>
              ))}
            </tr>
            <tr>
              <th style={{ padding: "4px 10px", background: "#07101c", position: "sticky", left: 0, zIndex: 3, borderBottom: `1px solid ${GOLD}22`, boxShadow: "2px 0 8px rgba(0,0,0,0.5)" }} />
              {P_YRS.map(y => (
                <>
                  <th key={`${y}u`} style={{ padding: "4px 8px", textAlign: "center", color: BLUE, fontSize: 10,
                                             background: "#0a1c2c", borderBottom: `1px solid ${GOLD}22`,
                             zIndex: 3, boxShadow: "2px 0 8px rgba(0,0,0,0.5)" }}>You</th>
                  <th key={`${y}a`} style={{ padding: "4px 8px", textAlign: "center", color: GOLD, fontSize: 10,
                                             background: CARD, borderBottom: `1px solid ${GOLD}22` }}>Analyst</th>
                </>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { label: "Rev Growth (%)", uk: "revGrowth", ak: "revGrowth" },
              { label: "EBITDA Margin (%)", uk: "ebitdaMargin", ak: "ebitdaMargin" },
              { label: "PAT (₹ Cr)", uvals: model.pl.map(r => r.pat), avals: analystModel.pl.map(r => r.pat) },
              { label: "FCFF (₹ Cr)", uvals: model.cf.map(r => r.fcff), avals: analystModel.cf.map(r => r.fcff) },
            ].map((row, ri) => {
              const uArr = row.uvals || assumptions[row.uk];
              const aArr = row.avals || ANALYST[row.ak];
              return (
                <tr key={ri} style={{ background: ri%2===0?"transparent":"rgba(255,255,255,0.015)" }}>
                  <td style={{ padding:"5px 10px", color: MUTED, fontWeight: 600, position: "sticky", left: 0, zIndex: 2, boxShadow: "2px 0 8px rgba(0,0,0,0.5)", background: ri%2===0?"#07101c":"#0d1b2e" }}>{row.label}</td>
                  {uArr.map((uv, ci) => {
                    const av = aArr[ci];
                    const diff = uv && av ? Math.abs((uv - av) / av * 100) : 0;
                    const isDiff = diff > 3;
                    return (
                      <>
                        <td key={`u${ci}`} style={{ padding:"5px 8px", textAlign:"right", background: "#0a1c2c",
                                                     color: isDiff ? BLUE : TEXT, fontWeight: isDiff ? 700 : 400 }}>
                          {typeof uv === "number" && uv > 1000 ? uv.toLocaleString("en-IN") : uv}
                        </td>
                        <td key={`a${ci}`} style={{ padding:"5px 8px", textAlign:"right", background: CARD,
                                                     color: isDiff ? GOLD : MUTED, fontWeight: isDiff ? 700 : 400 }}>
                          {typeof av === "number" && av > 1000 ? av.toLocaleString("en-IN") : av}
                          {isDiff && <span style={{ color: diff > 10 ? RED : ORANGE, fontSize: 9.5 }}> ▲</span>}
                        </td>
                      </>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <NoteButton text={`Bajaj Finance is India's most consistent NBFC compounder with 25%+ revenue CAGR over a decade. Our 16-18% growth for FY26-FY28 assumes mean reversion from the FY23-24 high base. EBITDA margin expansion to 44% by FY30 reflects digital cost stabilisation. Key risk: RBI action on unsecured lending could crimp AUM growth 3-5%. At ₹${analystModel.iv.toLocaleString("en-IN")}, stock offers ${analystModel.upside}% upside. BUY on dips to ₹8,000-8,200.`} />
    </div>
  );

  // ── Key Metrics Tab ──────────────────────────────────────────────────────────
  const ALL_YRS = [...H.yr, ...P_YRS];

  // Build combined hist+proj series for every metric
  const km = ALL_YRS.map((yr, i) => {
    const isP = i >= 6;
    const hi  = isP ? null : i;
    const pi  = isP ? i - 6 : null;

    const rev    = isP ? model.pl[pi].rev    : H.rev[hi];
    const ebitda = isP ? model.pl[pi].ebitda : H.ebitda[hi];
    const ebit   = isP ? model.pl[pi].ebit   : H.ebit[hi];
    const pat    = isP ? model.pl[pi].pat    : H.pat[hi];
    const da     = isP ? model.cf[pi].da     : H.da[hi];
    const capex  = isP ? model.cf[pi].capex  : H.capex[hi];
    const equity = isP ? model.bs[pi].eq     : H.equity[hi];
    const assets = isP ? model.bs[pi].totA   : H.fixedAssets[hi]+H.loanBook[hi]+H.otherAssets[hi];
    const bor    = isP ? model.bs[pi].bor    : H.borrowings[hi];
    const lb     = isP ? model.bs[pi].lb     : H.loanBook[hi];
    const fcff   = isP ? model.cf[pi].fcff   : H.cfo[hi] - H.capex[hi];

    return {
      yr, type: isP ? "P" : "H",
      // Profitability
      ebitdaMargin: +(ebitda / rev * 100).toFixed(1),
      patMargin:    +(pat    / rev * 100).toFixed(1),
      roe:          equity > 0 ? +(pat / equity * 100).toFixed(1) : null,
      roa:          assets > 0 ? +(pat / assets * 100).toFixed(1) : null,
      // Turnover / Efficiency
      assetTurnover: assets > 0 ? +(rev / assets).toFixed(2) : null,
      lbRev:         rev   > 0  ? +(lb  / rev).toFixed(1)    : null,
      capexRev:      rev   > 0  ? +(capex / rev * 100).toFixed(1) : null,
      daRev:         rev   > 0  ? +(da    / rev * 100).toFixed(1) : null,  // computed from actual da
      // Leverage
      debtEquity:    equity > 0 ? +(bor / equity).toFixed(2) : null,
      debtAssets:    assets > 0 ? +(bor / assets * 100).toFixed(1) : null,
      interestCover: ebit  > 0  ? null : null,   // not in model
      // Valuation / Growth
      rev, pat, ebitda, fcff,
      // raw values for leverage charts
      bor, equity, assets,
    };
  });

  // Chart tooltip
  const KMTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: NAVY, border: `1px solid ${GOLD}44`, borderRadius: 6, padding: "8px 12px", fontSize: 12 }}>
        <div style={{ fontWeight: 700, color: GOLD, marginBottom: 4 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.color }}>
            {p.name}: {typeof p.value === "number" ? p.value.toLocaleString("en-IN") : p.value}
          </div>
        ))}
      </div>
    );
  };

  // Mini chart component — bar or line, hist vs projected
  const KMChart = ({ title, dataKey, data, color, fmt, type = "bar", unit = "", secondKey, secondColor, secondName, name }) => (
    <div style={{ background: CARD, border: `1px solid rgba(255,255,255,0.07)`, borderRadius: 10, padding: "14px 14px 8px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: "0.08em",
                    textTransform: "uppercase", marginBottom: 10 }}>{title}</div>
      <ResponsiveContainer width="100%" height={160}>
        <ComposedChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="yr" tick={{ fill: DIM, fontSize: 9 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: DIM, fontSize: 9 }} tickLine={false} axisLine={false}
                 tickFormatter={v => fmt ? fmt(v) : v} />
          <Tooltip content={<KMTooltip />} />
          {type === "bar" ? (
            <Bar dataKey={dataKey} name={name || title} radius={[3,3,0,0]} maxBarSize={28}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.type === "P" ? `${color}88` : color}
                      stroke={d.type === "P" ? color : "none"} strokeWidth={1} strokeDasharray={d.type==="P"?"4 2":"0"} />
              ))}
            </Bar>
          ) : (
            <Line dataKey={dataKey} name={name || title} stroke={color} strokeWidth={2}
                  dot={d => <circle cx={d.cx} cy={d.cy} r={3} fill={d.payload.type==="P" ? "transparent" : color}
                                    stroke={color} strokeWidth={1.5} />}
                  strokeDasharray="0" />
          )}
          {secondKey && (
            <Line dataKey={secondKey} name={secondName} stroke={secondColor} strokeWidth={2} strokeDasharray="5 3"
                  dot={d => <circle cx={d.cx} cy={d.cy} r={2.5} fill="transparent" stroke={secondColor} strokeWidth={1.5} />} />
          )}
          {/* Divider between hist and projected */}
          {type === "bar" && <Cell />}
        </ComposedChart>
      </ResponsiveContainer>
      <div style={{ display:"flex", gap:10, marginTop:4, justifyContent:"flex-end" }}>
        <span style={{ fontSize:9, color: DIM }}>
          <span style={{ display:"inline-block", width:10, height:2, background: color, marginRight:4, verticalAlign:"middle" }} />Hist
        </span>
        <span style={{ fontSize:9, color: DIM }}>
          <span style={{ display:"inline-block", width:10, height:2, background:`${color}66`, marginRight:4, verticalAlign:"middle" }} />Projected
        </span>
      </div>
    </div>
  );

  const pctFmt = v => `${v}%`;
  const xFmt   = v => `${v}x`;
  const crFmt  = v => v >= 1000 ? `₹${(v/1000).toFixed(0)}K` : `₹${v}`;

  const MetricSection = ({ label, children, defaultOpen = true }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
            background: open ? `${GOLD}08` : `${GOLD}05`,
            border: `1px solid ${GOLD}22`, borderRadius: open ? "8px 8px 0 0" : 8,
            padding: "10px 16px", cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 800, color: GOLD,
                         letterSpacing: "0.18em", textTransform: "uppercase" }}>{label}</span>
          <span style={{ color: GOLD, fontSize: 13, display: "inline-block",
                         transition: "transform 0.2s",
                         transform: open ? "rotate(0deg)" : "rotate(-90deg)" }}>▾</span>
        </button>
        {open && (
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12,
            padding: 12, background: `${GOLD}04`,
            border: `1px solid ${GOLD}22`, borderTop: "none", borderRadius: "0 0 8px 8px",
          }}>
            {children}
          </div>
        )}
      </div>
    );
  };

  const KeyMetricsTab = (
    <div>
      <NoteButton text="10-year view: FY20–FY25 historical (solid bars) + FY26–FY30 projected per your assumptions (faded). Adjust sliders or table inputs — all charts update live." />

      <MetricSection label="Profitability" defaultOpen={false}>
        <KMChart title="EBITDA Margin %" dataKey="ebitdaMargin" data={km} color={TEAL} fmt={pctFmt} type="line" name="EBITDA Margin %" />
        <KMChart title="PAT Margin %" dataKey="patMargin" data={km} color={GOLD} fmt={pctFmt} type="line" name="PAT Margin %" />
        <KMChart title="Return on Equity %" dataKey="roe" data={km} color={GREEN} fmt={pctFmt} type="bar" name="ROE %" />
        <KMChart title="Return on Assets %" dataKey="roa" data={km} color={TEAL} fmt={pctFmt} type="bar" name="ROA %" />
      </MetricSection>

      <MetricSection label="Efficiency & Turnover" defaultOpen={false}>
        <KMChart title="Asset Turnover (x)" dataKey="assetTurnover" data={km} color={BLUE} fmt={xFmt} type="line" name="Asset Turnover" />
        <KMChart title="Loan Book / Revenue (x)" dataKey="lbRev" data={km} color={ORANGE} fmt={xFmt} type="line" name="LB/Rev" />
        <KMChart title="Capex % of Revenue" dataKey="capexRev" data={km} color={ORANGE} fmt={pctFmt} type="bar" name="Capex/Rev %" />
        <KMChart title="D&A % of Revenue" dataKey="daRev" data={km} color={MUTED} fmt={pctFmt} type="bar" name="D&A/Rev %" />
      </MetricSection>

      <MetricSection label="Leverage" defaultOpen={false}>
        <KMChart title="Debt / Equity (x)" dataKey="debtEquity" data={km} color={RED} fmt={xFmt} type="line" name="D/E Ratio" />
        <KMChart title="Debt / Assets %" dataKey="debtAssets" data={km} color={ORANGE} fmt={pctFmt} type="bar" name="Debt/Assets %" />
        <KMChart title="Borrowings (₹ Cr)" dataKey="bor" data={km} color={RED} fmt={crFmt} type="bar" name="Borrowings" />
        <KMChart title="Equity (₹ Cr)" dataKey="equity" data={km} color={GREEN} fmt={crFmt} type="bar" name="Equity" />
      </MetricSection>

      <MetricSection label="Valuation & Growth" defaultOpen={false}>
        <KMChart title="Revenue (₹ Cr)" dataKey="rev" data={km} color={BLUE} fmt={crFmt} type="bar" name="Revenue" />
        <KMChart title="PAT (₹ Cr)" dataKey="pat" data={km} color={GOLD} fmt={crFmt} type="bar" name="PAT" />
        <KMChart title="FCFF (₹ Cr)" dataKey="fcff" data={km} color={TEAL} fmt={crFmt} type="bar" name="FCFF" />
        <KMChart title="EBITDA (₹ Cr)" dataKey="ebitda" data={km} color={GREEN} fmt={crFmt} type="bar" name="EBITDA" />
      </MetricSection>
    </div>
  );

  const tabContent = [PLTab, BSTab, CFTab, DCFTab, SensTab, AnalystTab, KeyMetricsTab];

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: `linear-gradient(135deg,${NAVY} 0%,#0a1628 100%)`,
                  minHeight: "100vh", color: TEXT, fontFamily: "'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />

      <Link to="/" style={{ position:"fixed", top:20, left:28, zIndex:10000, color:GOLD, textDecoration:"none",
                            fontWeight:700, background:"rgba(13,27,42,0.95)", padding:"8px 18px", borderRadius:8,
                            fontSize:13, boxShadow:"0 4px 12px rgba(0,0,0,0.3)" }}>← Home</Link>

      {/* ── Header ── */}
      <div style={{ padding:"82px 28px 0", borderBottom:`1px solid ${GOLD}20` }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:10 }}>
          <div>
            <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:4 }}>
              <span style={{ fontSize:10, color:GOLD, letterSpacing:2, fontWeight:700, textTransform:"uppercase" }}>
                Vantage Capital — Live DCF Lab
              </span>
              <span style={{ fontSize:10, background:`${GREEN}22`, border:`1px solid ${GREEN}44`, color:GREEN,
                             padding:"2px 8px", borderRadius:20, fontWeight:700 }}>Model 1 of 3 · FREE</span>
            </div>
            <h1 style={{ margin:"0 0 3px", fontSize:28, fontWeight:800, fontFamily:"'Playfair Display',serif", color:"#fff" }}>
              Bajaj Finance Ltd — 3-Statement DCF Model
            </h1>
            <div style={{ fontSize:12, color:MUTED }}>NSE: BAJFINANCE · NBFC · India's leading consumer lender · FY20–FY30E</div>
          </div>

        </div>

        {/* Metric cards */}
        <div style={{ display:"flex", gap:10, marginTop:14, flexWrap:"wrap" }}>
          <MetCard label="CMP" value={`₹${CMP.toLocaleString("en-IN")}`} sub="March 2026" />
          <MetCard label="Your IV" value={model.ok ? `₹${model.iv.toLocaleString("en-IN")}` : "N/A"}
                   sub={model.ok ? `${model.upside > 0 ? "+" : ""}${model.upside}% vs CMP` : "Adjust WACC"}
                   color={model.upside > 0 ? GREEN : RED} />
          <MetCard label="Vantage Capital IV" value={`₹${analystModel.iv.toLocaleString("en-IN")}`}
                   sub={`+${analystModel.upside}% vs CMP`} color={GOLD} />
          <MetCard label="WACC" value={`${assumptions.wacc}%`} sub={`TG ${assumptions.termGrowth}%`} color={ORANGE} />
        </div>

        {/* Tabs — dropdown on mobile, tab bar on desktop */}
        <div style={{ marginTop:14 }}>
          {/* Mobile: dropdown selector */}
          <div style={{ display: "none" }} className="mobile-tab-select">
            <select
              value={tab}
              onChange={e => setTab(+e.target.value)}
              style={{
                width: "100%", padding: "10px 14px",
                background: CARD, border: `1px solid ${GOLD}44`,
                borderRadius: 8, color: GOLD, fontSize: 14, fontWeight: 700,
                fontFamily: "'DM Sans',sans-serif", outline: "none",
                WebkitAppearance: "none", appearance: "none",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23D4A017' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center",
                paddingRight: 36,
              }}
            >
              {tabs.map((t, i) => <option key={i} value={i}>{t}</option>)}
            </select>
          </div>
          {/* Desktop: tab bar */}
          <div style={{ display:"flex", gap:0, overflowX:"auto" }} className="desktop-tabs">
            {tabs.map((t,i) => (
              <button key={i} onClick={() => setTab(i)} style={{
                padding:"8px 16px", border:"none",
                borderBottom: tab===i ? `3px solid ${GOLD}` : "3px solid transparent",
                background: tab===i ? `${GOLD}10` : "transparent",
                color: tab===i ? GOLD : MUTED, fontWeight: tab===i ? 700 : 500,
                fontSize:13, cursor:"pointer", transition:"all 0.2s", fontFamily:"'DM Sans',sans-serif",
                whiteSpace:"nowrap",
              }}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 767px) {
          .mobile-tab-select { display: block !important; }
          .desktop-tabs { display: none !important; }
          .assumption-panel { display: none !important; }
          .main-padding { padding: 12px 14px 160px !important; }
        }
        @media (min-width: 768px) {
          .mobile-sheet-overlay { display: none !important; }
        }
      `}</style>

      {/* ── Main layout: content + assumption panel ── */}
      <div style={{ display:"flex", height:"calc(100vh - 290px)", minHeight:500 }}>

        {/* Tab content */}
        <div className="main-padding" style={{ flex:1, padding:"18px 28px 80px", overflowY:"auto" }}>
          {tabContent[tab]}
        </div>

        {/* Desktop: toggle tab always visible + conditional panel */}
        <div style={{ display:"flex", flexDirection:"row" }} className="assumption-panel">
          <button onClick={() => setPanelOpen(o => !o)} style={{
            width: 22, flexShrink: 0,
            background: `${GOLD}10`, border: "none",
            borderLeft: `1px solid ${GOLD}22`,
            cursor: "pointer", color: GOLD,
            display: "flex", alignItems: "center", justifyContent: "center",
          }} title={panelOpen ? "Hide assumptions" : "Show assumptions"}>
            <span style={{
              fontSize: 11,
              display: "inline-block",
              writingMode: "vertical-rl",
              transform: panelOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.25s",
              letterSpacing: "0.08em",
              fontWeight: 700,
            }}>
              {panelOpen ? "▸ HIDE" : "▸ SHOW"}
            </span>
          </button>
          {panelOpen && AssumptionPanel}
        </div>
      </div>

      {/* ── Mobile assumptions bottom sheet ── */}
      {sheetOpen && (
        <div
          className="mobile-sheet-overlay"
          style={{
            position:"fixed", inset:0, zIndex:2000,
            background:"rgba(0,0,0,0.6)", backdropFilter:"blur(4px)",
          }}
          onClick={e => { if (e.target === e.currentTarget) setSheetOpen(false); }}
        >
          <div style={{
            position:"absolute", bottom:0, left:0, right:0,
            display:"flex", justifyContent:"center",
            animation:"slideUp .28s cubic-bezier(.22,1,.36,1)",
          }}>
          <div style={{
            width:"100%", maxWidth:520,
            background:"#0d1b2e", borderTop:`2px solid ${GOLD}`,
            borderRadius:"20px 20px 0 0",
            maxHeight:"82vh", overflowY:"auto",
            WebkitOverflowScrolling:"touch",
          }}>
            <style>{`@keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }`}</style>
            {/* Handle */}
            <div style={{ display:"flex", justifyContent:"center", padding:"12px 0 0" }}>
              <div style={{ width:36, height:4, background:"rgba(255,255,255,0.2)", borderRadius:2 }} />
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 20px 4px" }}>
              <span style={{ fontSize:14, fontWeight:800, color:GOLD }}>Assumptions</span>
              <button onClick={() => setSheetOpen(false)}
                style={{ background:"none", border:"none", color:"rgba(255,255,255,0.5)", fontSize:20, cursor:"pointer" }}>×</button>
            </div>
            {/* Reuse assumption panel content — rendered inline */}
            <div style={{ padding:"0 0 40px" }}>
              {AssumptionPanel}
            </div>
          </div>
          </div>
        </div>
      )}

      {/* ── Action bar ── */}
      <style>{`
        .action-btn-label { display: inline; }
        @media (max-width: 767px) {
          .action-btn-label { display: none; }
          .action-bar { padding: 8px 12px !important; }
        }
      `}</style>
      <div className="action-bar" style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:1000,
                    background:"rgba(10,21,36,0.97)", borderTop:`1px solid ${GOLD}22`,
                    padding:"10px 28px", display:"flex", gap:8, alignItems:"center",
                    backdropFilter:"blur(12px)" }}>
        {/* Assumptions — far left, mobile only */}
        <button className="mobile-assumptions-btn" onClick={() => setSheetOpen(true)} style={{
          padding:"8px 14px", background:"transparent",
          border:"1px solid rgba(255,255,255,0.2)", borderRadius:6,
          color:"rgba(255,255,255,0.8)", fontSize:12, fontWeight:600, cursor:"pointer",
          display:"flex", alignItems:"center", gap:6,
          fontFamily:"'DM Sans',sans-serif",
        }}>
          <span>⚙</span><span>Assumptions</span>
        </button>
        <div style={{ flex:1 }} />
        {banner && (
          <div style={{ padding:"6px 10px", background:`${GREEN}22`, border:`1px solid ${GREEN}44`,
                        borderRadius:6, color:GREEN, fontSize:11, fontWeight:700 }}>{banner}</div>
        )}
        {[
          { icon:"↺", label:"Reset to Analyst", onClick: resetToAnalyst, color: GOLD, bg:"transparent" },
          { icon:"💾", label:"Save Scenario",   onClick: saveScenario,   color: TEAL, bg:`${TEAL}22` },
          ...(saved ? [{ icon:"📂", label:"Load Saved", onClick: loadScenario, color: BLUE, bg:`${BLUE}22` }] : []),
          { icon:"⬇", label:"Download Excel",  onClick: exportExcel,    color: GREEN, bg:`${GREEN}22` },
        ].map(({ icon, label, onClick, color, bg }) => (
          <button key={label} onClick={onClick} title={label} style={{
            padding:"8px 14px", background: bg,
            border:`1px solid ${color}44`, borderRadius:6,
            color, fontSize:14, cursor:"pointer", fontWeight:700,
            display:"flex", alignItems:"center", gap:6,
            fontFamily:"'DM Sans',sans-serif",
          }}>
            <span>{icon}</span>
            <span className="action-btn-label" style={{ fontSize:12 }}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}