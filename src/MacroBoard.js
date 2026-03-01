import { useContext, useEffect, useState, useCallback, useRef, useMemo } from "react";
import { ThemeContext } from "./App";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, ReferenceLine,
} from "recharts";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

const NAVY = "#0D1B2A";
const GOLD = "#D4A017";

const DARK_PAL = {
  bg:"#080F1A", surface:"rgba(255,255,255,0.022)", border:"rgba(212,160,23,0.12)",
  text:"#e2e8f0", sub:"#5a7a94", muted:"#3d5570",
  gridLine:"rgba(255,255,255,0.04)", axisText:"#3d5570",
  tooltipBg:"rgba(6,14,26,0.97)", tooltipBdr:"rgba(212,160,23,0.28)",
  chip:"rgba(255,255,255,0.04)", pillBg:"rgba(255,255,255,0.06)",
};
const LIGHT_PAL = {
  bg:"#F5F0E8", surface:"rgba(13,27,42,0.04)", border:"rgba(212,160,23,0.18)",
  text:"#0D1B2A", sub:"#3a5068", muted:"#7a8a9a",
  gridLine:"rgba(13,27,42,0.06)", axisText:"#7a8a9a",
  tooltipBg:"rgba(245,240,232,0.98)", tooltipBdr:"rgba(212,160,23,0.35)",
  chip:"rgba(13,27,42,0.04)", pillBg:"rgba(13,27,42,0.06)",
};

// ── Section 1: Global Markets ─────────────────────────────────────────────
// Removed: Sensex, Bank Nifty (India-specific, moved to section 2)
// Added: MSCI China (FXI ETF proxy)
// All colors unique within this section
const GLOBAL = [
  { id:"nifty50",   label:"Nifty 50",    symbol:"^NSEI",  color:"#00BFA5", benchmark:true },  // teal — distinct from Gold below
  { id:"msciworld", label:"MSCI World",  symbol:"URTH",   color:"#7C4DFF" },
  { id:"msciem",    label:"MSCI EM",     symbol:"EEM",    color:"#FF6D00" },
  { id:"mscichina", label:"MSCI China",  symbol:"FXI",    color:"#E91E63" },
  { id:"sp500",     label:"S&P 500",     symbol:"^GSPC",  color:"#F44336" },
  { id:"nasdaq",    label:"Nasdaq 100",  symbol:"^NDX",   color:"#00E5FF" },
  { id:"gold",      label:"Gold",        symbol:"GC=F",   color:"#FFD600" },
];

// ── Section 2: Nifty Broad Indices ────────────────────────────────────────
const NIFTY_INDICES = [
  { id:"nifty50",   label:"Nifty 50",       symbol:"^NSEI",        color:"#D4A017", benchmark:true },
  { id:"sensex",    label:"Sensex",         symbol:"^BSESN",       color:"#4CAF50" },
  { id:"banknifty", label:"Bank Nifty",     symbol:"^NSEBANK",     color:"#2196F3" },
  { id:"nifty500",  label:"Nifty 500",      symbol:"^CNX500",      color:"#CE93D8" },
  { id:"midcap",    label:"Nifty Midcap",   symbol:"^CNXMIDCAP",   color:"#FF6D00" },
  { id:"smallcap",  label:"Nifty Smallcap", symbol:"^CNXSMALLCAP", color:"#FF4081" },
];

// ── Section 3: Nifty Sectoral Indices ─────────────────────────────────────
const NIFTY_SECTORS = [
  { id:"niftyit",  label:"Nifty IT",     symbol:"^CNXIT",     color:"#00E5FF" },
  { id:"auto",     label:"Nifty Auto",   symbol:"^CNXAUTO",   color:"#FF9800" },
  { id:"pharma",   label:"Nifty Pharma", symbol:"^CNXPHARMA", color:"#8BC34A" },
  { id:"fmcg",     label:"Nifty FMCG",   symbol:"^CNXFMCG",   color:"#F06292" },
  { id:"metal",    label:"Nifty Metal",  symbol:"^CNXMETAL",  color:"#9C27B0" },
  { id:"realty",   label:"Nifty Realty", symbol:"^CNXREALTY", color:"#26C6DA" },
  { id:"energy",   label:"Nifty Energy", symbol:"^CNXENERGY", color:"#FF5722" },
];

const PERIODS = ["YTD","1Y","3Y","5Y","CUSTOM"];
const YEAR_MIN = 2015;
const NOW_YEAR = new Date().getFullYear();

// ── Firestore cache — primary source (written daily by macro_fetch.py) ──────
async function fetchFromFirestore(id) {
  try {
    const snap = await getDoc(doc(db, "macro_data", id));
    if (snap.exists()) {
      const pts = snap.data().points ?? [];
      if (pts.length > 10) return pts; // only trust if has real data
    }
  } catch {}
  return null;
}

// ── localStorage cache — 6-hour TTL for speed ────────────────────────────────
const LS_TTL = 6 * 60 * 60 * 1000;

function lsGet(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > LS_TTL) { localStorage.removeItem(key); return null; }
    return data;
  } catch { return null; }
}
function lsSet(key, data) {
  try { localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() })); } catch {}
}

// FIX G: Fetch with cache-first; in-flight deduplication via a pending map
const PENDING = {};
async function fetchYF(symbol) {
  const cacheKey = `ae_yf_v2_${symbol}`;
  const cached   = lsGet(cacheKey);
  if (cached) return cached;

  // Deduplicate in-flight requests for same symbol
  if (PENDING[symbol]) return PENDING[symbol];

  PENDING[symbol] = (async () => {
    const url   = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1wk&range=10y&includePrePost=false`;
    const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    let raw;
    try {
      const r = await fetch(proxy);
      if (!r.ok) throw new Error("proxy failed");
      raw = JSON.parse((await r.json()).contents);
    } catch {
      try {
        const r = await fetch(url, { mode:"cors" });
        raw = await r.json();
      } catch { return []; }
    }
    const result = raw?.chart?.result?.[0];
    if (!result) return [];
    const ts = result.timestamp;
    const cl = result.indicators.quote[0].close;
    const pts = ts.map((t,i)=>({ ts:t*1000, close:cl[i] })).filter(p=>p.close!=null&&!isNaN(p.close));
    lsSet(cacheKey, pts);
    return pts;
  })();

  try {
    const result = await PENDING[symbol];
    return result;
  } finally {
    delete PENDING[symbol];
  }
}

function toSeries(pts, startYear, mode) {
  const f = pts.filter(p => new Date(p.ts).getFullYear() >= startYear);
  if (!f.length) return [];
  const base = f[0].close;
  return f.map(p => ({
    ts:  p.ts,
    val: mode === "pct" ? +((p.close/base - 1)*100).toFixed(3) : +((p.close/base)*100).toFixed(2),
  }));
}

function pRet(pts, days) {
  if (!pts || pts.length < 2) return null;
  const cut   = Date.now() - days * 864e5;
  const start = pts.find(p => p.ts >= cut);
  const end   = pts[pts.length-1];
  if (!start || start === end) return null;
  return +((end.close/start.close - 1)*100).toFixed(2);
}
function ytdRet(pts) {
  if (!pts || !pts.length) return null;
  const jan1  = new Date(new Date().getFullYear(), 0, 1).getTime();
  const start = [...pts].reverse().find(p => p.ts <= jan1) ?? pts.find(p => p.ts >= jan1);
  const end   = pts[pts.length-1];
  if (!start || !end) return null;
  return +((end.close/start.close - 1)*100).toFixed(2);
}
// FIX C: Return from custom start year to today
function customRet(pts, startYear) {
  if (!pts || !pts.length) return null;
  const cutTs = new Date(startYear, 0, 1).getTime();
  const start = pts.find(p => p.ts >= cutTs);
  const end   = pts[pts.length-1];
  if (!start || start === end) return null;
  return +((end.close/start.close - 1)*100).toFixed(2);
}

// ── Tooltips ──────────────────────────────────────────────────────────────────
function TSTooltip({ active, payload, label, pal, mode }) {
  if (!active || !payload?.length) return null;
  const dt = new Date(label).toLocaleDateString("en-IN",{ day:"2-digit", month:"short", year:"numeric" });
  return (
    <div style={{ background:pal.tooltipBg, border:`1px solid ${pal.tooltipBdr}`, borderRadius:10, padding:"12px 16px", minWidth:200, fontFamily:"'DM Sans',sans-serif", boxShadow:"0 12px 36px rgba(0,0,0,0.4)" }}>
      <div style={{ fontSize:9, color:GOLD, letterSpacing:"1.2px", fontWeight:700, marginBottom:8 }}>{dt}</div>
      {[...payload].sort((a,b)=>(b.value??-999)-(a.value??-999)).map(p=>(
        <div key={p.dataKey} style={{ display:"flex", justifyContent:"space-between", gap:20, marginBottom:3, alignItems:"center" }}>
          <span style={{ fontSize:11, color:p.color, fontWeight:600, display:"flex", alignItems:"center", gap:5 }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:p.color, display:"inline-block", flexShrink:0 }}/>
            {p.name}
          </span>
          <span style={{ fontSize:11, fontWeight:800, color: mode==="pct" ? (p.value>=0?"#27AE60":"#E74C3C") : "#c8dae8" }}>
            {mode==="pct" ? `${p.value>=0?"+":""}${p.value?.toFixed(2)}%` : `₹${p.value?.toFixed(2)}`}
          </span>
        </div>
      ))}
    </div>
  );
}

function BarTip({ active, payload, label, pal }) {
  if (!active || !payload?.length) return null;
  const v = payload[0]?.value;
  return (
    <div style={{ background:pal.tooltipBg, border:`1px solid ${pal.tooltipBdr}`, borderRadius:10, padding:"10px 14px", fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ fontSize:12, color:pal.text, fontWeight:700, marginBottom:4 }}>{label}</div>
      <div style={{ fontSize:13, fontWeight:800, color: v!=null&&v>=0?"#27AE60":"#E74C3C" }}>
        {v!=null ? `${v>=0?"+":""}${v.toFixed(2)}%` : "—"}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
      <svg width="28" height="28" viewBox="0 0 28 28" style={{ animation:"mbSpin .8s linear infinite" }}>
        <circle cx="14" cy="14" r="10" fill="none" stroke={GOLD} strokeWidth="2" strokeDasharray="42" strokeDashoffset="12" strokeLinecap="round"/>
      </svg>
      <span style={{ fontSize:9, color:GOLD, fontFamily:"'DM Sans',sans-serif", letterSpacing:"1.5px" }}>LOADING…</span>
    </div>
  );
}

function Cover({ children }) {
  return (
    <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:12, background:"rgba(8,15,26,0.65)", zIndex:10, backdropFilter:"blur(3px)" }}>
      {children}
    </div>
  );
}

// ── ChartPanel ────────────────────────────────────────────────────────────────
function ChartPanel({ eyebrow, title, accentColor, indices, defaultActive, pal, isDark }) {
  // FIX G: module-level raw data cache per symbol (shared across renders/panels)
  const rawCache = useRef({});

  // All indices active by default — user can toggle off individually
  const [active,    setActive]    = useState(() => new Set(indices.map(i => i.id)));
  const [startYear, setStartYear] = useState(2020);
  const [mode,      setMode]      = useState("pct");
  // FIX C: bar period can be CUSTOM (driven by slider)
  const [barPeriod, setBarPeriod] = useState("1Y");

  // Separate loading states for line vs bar — FIX A
  const [lTs,    setLTs]    = useState(true);
  const [lBar,   setLBar]   = useState(true);
  const [tsErr,  setTsErr]  = useState("");
  const [barErr, setBarErr] = useState("");

  // Raw data keyed by index id — stores {[id]: pts[]}
  // Bar data never re-fetches; line data slice is derived from raw
  const [rawData, setRawData] = useState({});
  const [tsData,  setTsData]  = useState([]);

  // Fetch raw data for ALL indices — Firestore first, then localStorage, then Yahoo
  const fetchAll = useCallback(async () => {
    try {
      const results = await Promise.allSettled(
        indices.map(async idx => {
          if (rawCache.current[idx.symbol]) return { id: idx.id, pts: rawCache.current[idx.symbol] };

          // 1. Try Firestore (fast, always fresh — written by Python daily)
          const fsPts = await fetchFromFirestore(idx.id);
          if (fsPts) {
            rawCache.current[idx.symbol] = fsPts;
            lsSet(`ae_yf_v2_${idx.symbol}`, fsPts); // warm localStorage too
            return { id: idx.id, pts: fsPts };
          }

          // 2. Try localStorage (6-hr TTL)
          const lsPts = lsGet(`ae_yf_v2_${idx.symbol}`);
          if (lsPts) {
            rawCache.current[idx.symbol] = lsPts;
            return { id: idx.id, pts: lsPts };
          }

          // 3. Fall back to Yahoo Finance (slow — only if Firestore not populated yet)
          const pts = await fetchYF(idx.symbol);
          rawCache.current[idx.symbol] = pts;
          return { id: idx.id, pts };
        })
      );
      const map = {};
      results.forEach(r => { if (r.status === "fulfilled") map[r.value.id] = r.value.pts; });
      setRawData(map);
    } catch (e) {
      setTsErr("Failed to load data.");
      setBarErr("Failed to load data.");
    } finally {
      setLTs(false);
      setLBar(false);
    }
  }, [indices]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // FIX A: Line chart data — derived from rawData + active + startYear + mode
  // Bar chart data — derived from rawData only (NOT from active — always shows all)
  // Using useMemo so changes to `active` don't recompute bar data
  useEffect(() => {
    if (Object.keys(rawData).length === 0) return;
    const list = indices.filter(i => active.has(i.id));
    const map  = {};
    list.forEach(idx => {
      const raw = rawData[idx.id];
      if (!raw) return;
      toSeries(raw, startYear, mode).forEach(p => {
        const k = new Date(p.ts).toLocaleDateString("en-CA");
        if (!map[k]) map[k] = { ts: p.ts };
        map[k][idx.id] = p.val;
      });
    });
    setTsData(Object.values(map).sort((a,b)=>a.ts-b.ts));
  }, [rawData, active, startYear, mode, indices]);

  // FIX A: barData computed with useMemo — NEVER depends on `active`
  // This prevents flash when toggling line chart indices
  const barData = useMemo(() => {
    return indices.map(idx => {
      const raw = rawData[idx.id];
      return {
        name:       idx.label,
        color:      idx.color,
        benchmark:  idx.benchmark,
        id:         idx.id,
        YTD:        ytdRet(raw),
        "1Y":       pRet(raw, 365),
        "3Y":       pRet(raw, 1095),
        "5Y":       pRet(raw, 1825),
        CUSTOM:     customRet(raw, startYear), // FIX C: driven by slider
      };
    });
  }, [rawData, startYear, indices]); // Note: NOT `active`

  // FIX C: When slider moves, auto-switch bar period to CUSTOM
  const prevStartYear = useRef(startYear);
  useEffect(() => {
    if (prevStartYear.current !== startYear) {
      setBarPeriod("CUSTOM");
      prevStartYear.current = startYear;
    }
  }, [startYear]);

  function toggle(id) {
    setActive(prev => {
      const n = new Set(prev);
      if (n.has(id)) { if (n.size > 1) n.delete(id); } else n.add(id);
      return n;
    });
  }

  // FIX A: sorted with useMemo — stable reference unless barData/barPeriod changes
  const sorted = useMemo(() =>
    [...barData].sort((a,b) => (b[barPeriod] ?? -9999) - (a[barPeriod] ?? -9999)),
    [barData, barPeriod]
  );

  const fmtY  = v => mode==="pct" ? `${v>=0?"+":""}${v.toFixed(0)}%` : `₹${v.toFixed(0)}`;
  const fmtX  = ts => new Date(ts).toLocaleDateString("en-IN",{ month:"short", year:"2-digit" });
  const ref0  = mode==="pct" ? 0 : 100;

  // FIX C: Label for CUSTOM period shows the year
  const periodLabel = (p) => p === "CUSTOM" ? `From ${startYear}` : p;

  return (
    <section className="mb-section-pad" style={{
      marginBottom: 48,
      background:   isDark ? "rgba(255,255,255,0.008)" : "rgba(13,27,42,0.02)",
      border:       `1px solid ${pal.border}`,
      borderTop:    `2px solid ${accentColor}`,
      borderRadius: 20,
      padding:      "28px 24px 24px",
      // FIX B: prevent section from overflowing
      minWidth: 0,
      overflow: "hidden",
    }}>

      {/* Header row */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:14, marginBottom:22 }}>
        <div>
          <div style={{ fontSize:9, letterSpacing:"0.36em", color:accentColor, fontWeight:700, marginBottom:6, fontFamily:"'DM Sans',sans-serif" }}>{eyebrow}</div>
          <h2 style={{ fontSize:"clamp(18px,2vw,26px)", fontWeight:900, color:pal.text, margin:0, fontFamily:"'Playfair Display',serif" }}>{title}</h2>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
          {/* % vs ₹100 */}
          <div style={{ display:"flex", background:pal.pillBg, border:`1px solid ${pal.border}`, borderRadius:999, overflow:"hidden" }}>
            {[["pct","% Return"],["level","₹100 Invested"]].map(([v,lab])=>(
              <button key={v} onClick={()=>setMode(v)} style={{
                padding:"6px 16px", border:"none", cursor:"pointer",
                fontFamily:"'DM Sans',sans-serif", fontSize:10, fontWeight:700, letterSpacing:"0.4px",
                background: mode===v ? GOLD : "transparent",
                color:      mode===v ? NAVY : pal.muted,
                borderRadius:999, transition:"all .15s",
              }}>{lab}</button>
            ))}
          </div>

          {/* Slider — FIX C: controls both charts */}
          <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:240 }}>
            <span style={{ fontSize:9, color:GOLD, fontWeight:700, fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap", minWidth:34 }}>{startYear}</span>
            <input
              type="range" min={YEAR_MIN} max={NOW_YEAR-1} value={startYear}
              onChange={e => setStartYear(Number(e.target.value))}
              className="mb-slider"
              style={{ flex:1, cursor:"pointer", height:4, accentColor:GOLD }}
            />
            <span style={{ fontSize:9, color:pal.muted, fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap" }}>TODAY</span>
          </div>
        </div>
      </div>

      {/* Two-column grid — FIX B: children must have min-width:0 */}
      <div className="mb-two-col">

        {/* ── LEFT: Line chart ── */}
        <div style={{ minWidth:0, display:"flex", flexDirection:"column" }}>
          {/* Toggle chips */}
          <div className="mb-chips-gap" style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:12 }}>
            {indices.map(idx => {
              const on = active.has(idx.id);
              return (
                <button key={idx.id} onClick={()=>toggle(idx.id)}
                  className={`mb-chip${on?" mb-chip-on":""}`}
                  style={{
                    padding:"4px 12px", borderRadius:999,
                    border:`1px solid ${on ? idx.color : pal.muted+"66"}`,
                    background: on ? idx.color+"22" : "transparent",
                    color:  on ? idx.color : pal.muted,
                    fontSize:10, fontWeight:700, letterSpacing:"0.5px",
                    cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
                    whiteSpace:"nowrap", transition:"all .15s",
                    boxShadow: on && idx.benchmark ? `0 0 0 1.5px ${idx.color}55` : "none",
                  }}>
                  <span className="mb-chip-dot" style={{ marginRight:5, fontSize:8 }}>●</span>{idx.label}
                  {idx.benchmark && <span style={{ marginLeft:5, opacity:.65, fontSize:9 }}>★</span>}
                </button>
              );
            })}
          </div>

          {/* Line chart */}
          <div style={{ background:pal.surface, border:`1px solid ${pal.border}`, borderRadius:12, padding:"14px 4px 4px", position:"relative", flex:1, minHeight:300, boxSizing:"border-box" }}>
            {lTs && <Cover><Spinner/></Cover>}
            {tsErr && !lTs && (
              <Cover>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontSize:12, color:pal.muted, marginBottom:10 }}>{tsErr}</div>
                  <button onClick={fetchAll} style={{ padding:"6px 20px", background:GOLD, color:NAVY, border:"none", borderRadius:999, fontWeight:800, fontSize:10, cursor:"pointer" }}>RETRY</button>
                </div>
              </Cover>
            )}
            <div className="mb-lc-inner">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={tsData} margin={{ top:4, right:16, left:0, bottom:4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={pal.gridLine} vertical={false}/>
                <XAxis dataKey="ts" type="number" domain={["dataMin","dataMax"]} scale="time"
                  tickFormatter={fmtX}
                  tick={{ fill:pal.axisText, fontSize:9, fontFamily:"'DM Sans',sans-serif" }}
                  tickLine={false} axisLine={{ stroke:pal.border }} minTickGap={56}/>
                <YAxis tickFormatter={fmtY}
                  tick={{ fill:pal.axisText, fontSize:9, fontFamily:"'DM Sans',sans-serif" }}
                  tickLine={false} axisLine={false} width={mode==="pct"?48:56}/>
                <ReferenceLine y={ref0} stroke="rgba(212,160,23,0.2)" strokeDasharray="5 4"/>
                <Tooltip content={<TSTooltip pal={pal} mode={mode}/>} isAnimationActive={false}/>
                {indices.filter(i=>active.has(i.id)).map(idx=>(
                  <Line key={idx.id} type="monotone" dataKey={idx.id} name={idx.label}
                    stroke={idx.color} strokeWidth={idx.benchmark?2.4:1.6}
                    dot={false} activeDot={{ r:3.5, strokeWidth:0 }}
                    connectNulls isAnimationActive={false}/>
                ))}
              </LineChart>
            </ResponsiveContainer>
            </div>
            <div style={{ fontSize:9, color:pal.muted, textAlign:"right", paddingRight:14, paddingBottom:6, fontFamily:"'DM Sans',sans-serif" }}>
              {mode==="pct" ? "Normalised to 0% at start year" : "₹100 invested at start year"} · Yahoo Finance
            </div>
          </div>
        </div>

        {/* ── RIGHT: Bar chart ── FIX A: completely independent of `active` */}
        <div style={{ minWidth:0, display:"flex", flexDirection:"column" }}>
          {/* Period tabs — FIX C: CUSTOM tab shows slider year */}
          <div style={{ display:"flex", gap:6, marginBottom:12, justifyContent:"flex-end", flexWrap:"wrap" }}>
            {PERIODS.map(p=>(
              <button key={p} onClick={()=>setBarPeriod(p)} style={{
                padding:"4px 12px", borderRadius:6,
                border:`1px solid ${barPeriod===p ? GOLD : pal.border}`,
                background: barPeriod===p ? "rgba(212,160,23,0.14)" : "transparent",
                color:  barPeriod===p ? GOLD : pal.muted,
                fontSize:10, fontWeight:700, letterSpacing:"1px",
                cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all .15s",
              }}>{periodLabel(p)}</button>
            ))}
          </div>

          {/* Bar chart — FIX F: left margin increased so Y labels don't get clipped */}
          <div style={{ background:pal.surface, border:`1px solid ${pal.border}`, borderRadius:12, padding:"14px 4px 4px", position:"relative", flex:1, minHeight:300, boxSizing:"border-box" }}>
            {lBar && <Cover><Spinner/></Cover>}
            {barErr && !lBar && (
              <Cover>
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontSize:12, color:pal.muted, marginBottom:10 }}>{barErr}</div>
                  <button onClick={fetchAll} style={{ padding:"6px 20px", background:GOLD, color:NAVY, border:"none", borderRadius:999, fontWeight:800, fontSize:10, cursor:"pointer" }}>RETRY</button>
                </div>
              </Cover>
            )}
            {!barErr && sorted.length > 0 && (
              <div className="mb-bc-inner">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sorted}
                  layout="vertical"
                  margin={{ top:4, right:60, left:0, bottom:4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={pal.gridLine} horizontal={false}/>
                  <XAxis type="number"
                    tickFormatter={v=>`${v>=0?"+":""}${v.toFixed(0)}%`}
                    tick={{ fill:pal.axisText, fontSize:9, fontFamily:"'DM Sans',sans-serif" }}
                    tickLine={false} axisLine={{ stroke:pal.border }}/>
                  {/* FIX F: width=110 gives enough room for "Nifty Smallcap" */}
                  <YAxis type="category" dataKey="name" width={110}
                    tick={{ fill:pal.sub, fontSize:10, fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}
                    tickLine={false} axisLine={false}/>
                  <ReferenceLine x={0} stroke="rgba(212,160,23,0.22)" strokeWidth={1.5}/>
                  {/* FIX A: isAnimationActive=false stops the flash on re-render */}
                  <Tooltip content={<BarTip pal={pal}/>} cursor={{ fill:"rgba(212,160,23,0.04)" }} isAnimationActive={false}/>
                  <Bar dataKey={barPeriod} radius={[0,4,4,0]} maxBarSize={20}
                    isAnimationActive={false}
                    label={{ position:"right", fontSize:9, fontFamily:"'DM Sans',sans-serif", fontWeight:700,
                      formatter:v=>v!=null?`${v>=0?"+":""}${v.toFixed(1)}%`:"",
                      fill:pal.sub }}>
                    {sorted.map((e,i)=>(
                      <Cell key={i} fill={(e[barPeriod]??0)>=0 ? e.color : "#E74C3C"} fillOpacity={0.88}/>
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              </div>
            )}
            <div style={{ fontSize:9, color:pal.muted, textAlign:"right", paddingRight:14, paddingBottom:6, fontFamily:"'DM Sans',sans-serif" }}>
              {barPeriod==="CUSTOM" ? `Cumulative from ${startYear} · ` : "3Y & 5Y are cumulative · "}Cached daily · Source: Yahoo Finance
            </div>
          </div>
        </div>

      </div>

      {/* Legend */}
      <div style={{ fontSize:10, color:pal.muted, marginTop:10, fontFamily:"'DM Sans',sans-serif" }}>
        ★ Benchmark · Drag the slider to change start year (left chart) and "From {startYear}" period (right chart)
      </div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function MacroBoard() {
  const { theme } = useContext(ThemeContext);
  const isDark    = theme === "dark";
  const pal       = isDark ? DARK_PAL : LIGHT_PAL;
  const [vis, setVis] = useState(false);
  useEffect(() => { setTimeout(() => setVis(true), 80); }, []);
  const fu = (d=0) => ({
    opacity:    vis?1:0,
    transform:  vis?"translateY(0)":"translateY(18px)",
    transition: `opacity .7s ease ${d}ms, transform .7s cubic-bezier(.22,1,.36,1) ${d}ms`,
  });

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;600;700;800&family=Playfair+Display:wght@800;900&display=swap" rel="stylesheet"/>
      <style>{`
        @keyframes mbSpin { to { transform:rotate(360deg); } }
        .mb-two-col {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 20px;
          align-items: stretch;
          min-width: 0;
          overflow: hidden;
        }
        @media(max-width:960px){
          .mb-two-col { grid-template-columns: 1fr !important; }
        }
        /* ── Line chart height ── */
        .mb-lc-inner { height: 300px; }
        /* ── Bar chart height — sized to content on desktop ── */
        .mb-bc-inner { height: 340px; overflow-y: auto; }
        /* ── Mobile overrides ── */
        @media(max-width:640px){
          /* Stretch charts to fill screen width */
          .mb-lc-inner { height: 420px; }
          .mb-bc-inner { height: 380px; }
          /* Compact legend chips to fit 2 rows */
          .mb-chip {
            padding: 3px 7px !important;
            font-size: 9px !important;
            letter-spacing: 0 !important;
            border-radius: 6px !important;
          }
          /* Hide ● dot on mobile — color border is enough */
          .mb-chip-dot { display: none !important; }
          /* Tighten chip gap */
          .mb-chips-gap { gap: 4px !important; }
          /* Reduce section padding */
          .mb-section-pad { padding: 16px 12px 16px !important; }
        }
        .mb-slider { -webkit-appearance:none; appearance:none; background:transparent; width:100%; }
        .mb-slider::-webkit-slider-runnable-track {
          height:4px; border-radius:2px;
          background:linear-gradient(90deg,rgba(212,160,23,0.55),rgba(212,160,23,0.18));
        }
        .mb-slider::-webkit-slider-thumb {
          -webkit-appearance:none; appearance:none;
          width:14px; height:14px; border-radius:50%;
          background:#D4A017; margin-top:-5px;
          box-shadow:0 0 0 3px rgba(212,160,23,0.28);
          cursor:pointer;
        }
        .mb-slider::-moz-range-track {
          height:4px; border-radius:2px;
          background:linear-gradient(90deg,rgba(212,160,23,0.55),rgba(212,160,23,0.18));
        }
        .mb-slider::-moz-range-thumb {
          width:14px; height:14px; border-radius:50%;
          background:#D4A017; border:none;
          box-shadow:0 0 0 3px rgba(212,160,23,0.28);
          cursor:pointer;
        }
      `}</style>

      <div style={{ background:pal.bg, minHeight:"100vh", paddingTop:92, color:pal.text, fontFamily:"'DM Sans',sans-serif" }}>

        {/* Header */}
        <section style={{ background:isDark?"rgba(255,255,255,0.015)":"rgba(13,27,42,0.04)", borderBottom:`1px solid ${pal.border}`, padding:"48px 24px 44px", textAlign:"center" }}>
          <div style={{ maxWidth:720, margin:"0 auto" }}>
            <div style={{ fontSize:9, letterSpacing:"0.38em", color:GOLD, fontWeight:700, marginBottom:12, ...fu(0) }}>LIVE MARKET DATA</div>
            <h1 style={{ fontSize:"clamp(26px,4vw,40px)", fontWeight:900, fontFamily:"'Playfair Display',serif", margin:"0 0 12px", lineHeight:1.15, color:pal.text, ...fu(80) }}>
              Macro Dashboard
            </h1>
            <div style={{ width:44, height:2, background:GOLD, borderRadius:2, margin:"0 auto 14px", ...fu(120) }}/>
            <p style={{ fontSize:13, color:pal.sub, lineHeight:1.8, margin:0, ...fu(160) }}>
              Toggle indices on the line chart · Drag the slider to set start year on <em>both</em> charts · Switch between <strong style={{ color:pal.text }}>% return</strong> and <strong style={{ color:pal.text }}>₹100 invested</strong> · Live data from Yahoo Finance.
            </p>
          </div>
        </section>

        <div style={{ maxWidth:1520, margin:"0 auto", padding:"40px 20px 80px" }}>

          {/* Section 1 — Global */}
          <ChartPanel
            eyebrow="SECTION 1  ·  GLOBAL MARKETS"
            title="Global Index Performance"
            accentColor="#3498DB"
            indices={GLOBAL}
            defaultActive={["nifty50","sp500","nasdaq","gold"]}
            pal={pal}
            isDark={isDark}
          />

          {/* Section 2 — Nifty Broad Indices */}
          <ChartPanel
            eyebrow="SECTION 2  ·  NIFTY BROAD INDICES"
            title="Nifty Index Performance"
            accentColor={GOLD}
            indices={NIFTY_INDICES}
            defaultActive={["nifty50","banknifty","midcap"]}
            pal={pal}
            isDark={isDark}
          />

          {/* Section 3 — Nifty Sectors */}
          <ChartPanel
            eyebrow="SECTION 3  ·  NIFTY SECTORAL INDICES"
            title="Sector Performance"
            accentColor="#4CAF50"
            indices={NIFTY_SECTORS}
            defaultActive={["niftyit","auto","pharma","energy"]}
            pal={pal}
            isDark={isDark}
          />

          <div style={{ fontSize:11, color:pal.muted, textAlign:"center", lineHeight:1.8 }}>
            ⚠️ MSCI World = URTH ETF · MSCI EM = EEM ETF · MSCI China = FXI ETF · ~15 min delay on US data · Not investment advice.
          </div>

        </div>
      </div>
    </>
  );
}