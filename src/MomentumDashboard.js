/**
 * MomentumDashboard.js  (v3 — winners & losers, inline horizon selector)
 *
 * Firestore schema (momentum_engine.py v2):
 *   momentum_scores/_latest      → { date, month }
 *   momentum_scores/YYYY-MM      → {
 *       date, universe, count,
 *       scores_3m:  [{ ticker, ret, norm_score, rank }, ...],
 *       scores_6m:  [...],
 *       scores_12m: [...],
 *   }
 */

import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";
import { doc, getDoc, collection, getDocs, orderBy, query, limit } from "firebase/firestore";
import { db } from "./firebase";

const NAVY   = "#0D1B2A";
const GOLD   = "#D4A017";
const GREEN  = "#27AE60";
const TEAL   = "#0E7C7B";
const RED    = "#C0392B";
const ORANGE = "#E67E22";
const MUTED  = "#3d5570";
const SUB    = "#5a7a94";

const HORIZON_META = {
  "3m":  { label: "3 Month",    field: "scores_3m",  color: TEAL,   retLabel: "3M Return",  desc: "~63 trading days · 5-day skip"          },
  "6m":  { label: "6 Month",    field: "scores_6m",  color: ORANGE, retLabel: "6M Return",  desc: "~126 trading days · 10-day skip"         },
  "12m": { label: "12-1 Month", field: "scores_12m", color: GOLD,   retLabel: "11M Return", desc: "Jegadeesh-Titman · 252d lookback · 21d skip" },
};


// ── Static historical top-10 data (Nifty 500, 12-1M momentum) Jan 2021 – Dec 2024 ─
// Source: Jegadeesh-Titman cross-sectional momentum, monthly rebalance
// scores_3m / scores_6m approximate from same ranking logic for older months
// No static history — all data comes from Firestore (backfill_momentum.py)

// "2021-01" → "Jan 2021"
function fmtMonth(monthKey) {
  const [y, m] = monthKey.split("-");
  return new Date(+y, +m - 1, 1).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

function buildHistogram(scores, bins = 20) {
  const step = 2 / bins;
  const buckets = Array.from({ length: bins }, (_, i) => ({
    bin:   -1 + i * step + step / 2,
    label: `${(-1 + i * step).toFixed(1)}`,
    count: 0,
  }));
  scores.forEach(s => {
    const idx = Math.min(Math.floor((s.norm_score + 1) / step), bins - 1);
    if (idx >= 0) buckets[idx].count++;
  });
  return buckets;
}

// ── Tooltips ──────────────────────────────────────────────────────────────────
function RetTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div style={{ background:"rgba(6,14,26,0.97)", border:`1px solid rgba(212,160,23,0.3)`, borderRadius:10, padding:"10px 14px", fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ fontSize:13, fontWeight:800, color:"#e2e8f0", marginBottom:4 }}>{d?.ticker}</div>
      <div style={{ fontSize:11, color:GOLD }}>Rank #{d?.rank}</div>
      <div style={{ fontSize:11, color:d?.ret >= 0 ? GREEN : RED, marginTop:2 }}>
        Return: {d?.ret >= 0 ? "+" : ""}{(d?.ret * 100).toFixed(1)}%
      </div>
      <div style={{ fontSize:11, color:SUB, marginTop:2 }}>Score: {d?.norm_score?.toFixed(3)}</div>
    </div>
  );
}

function HistTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div style={{ background:"rgba(6,14,26,0.97)", border:`1px solid rgba(212,160,23,0.2)`, borderRadius:8, padding:"8px 12px", fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ fontSize:11, color:"#e2e8f0" }}>Score ≈ {d?.bin?.toFixed(2)}</div>
      <div style={{ fontSize:11, color:GOLD, marginTop:2 }}>{d?.count} stocks</div>
    </div>
  );
}

// ── Horizon Selector Pills (inline, compact, greyed when inactive) ─────────────
function HorizonPills({ horizon, setHorizon }) {
  return (
    <div style={{ display:"flex", gap:5 }}>
      {Object.entries(HORIZON_META).map(([key, meta]) => {
        const active = horizon === key;
        return (
          <button
            key={key}
            onClick={() => setHorizon(key)}
            style={{
              padding:"4px 13px", borderRadius:999,
              border:`1px solid ${active ? meta.color : "rgba(255,255,255,0.12)"}`,
              background: active ? `${meta.color}22` : "transparent",
              color: active ? meta.color : "rgba(200,218,232,0.40)",
              fontWeight: active ? 800 : 500,
              fontSize:10, letterSpacing:"0.4px",
              cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
              transition:"all .15s",
            }}
          >
            {meta.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Winners & Losers Banner ───────────────────────────────────────────────────
function WinnersLosersBanner({ data, horizon, setHorizon }) {
  const [expanded, setExpanded] = useState(false);
  const meta      = HORIZON_META[horizon];
  const allScores = data?.[meta.field] ?? [];
  const count     = expanded ? 10 : 5;

  const winners = allScores.slice(0, count);
  const losers  = [...allScores].sort((a, b) => a.norm_score - b.norm_score).slice(0, count);

  const StockCard = ({ s, isWinner }) => (
    <div style={{
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"9px 12px",
      background: isWinner ? "rgba(39,174,96,0.05)" : "rgba(192,57,43,0.05)",
      border:`1px solid ${isWinner ? "rgba(39,174,96,0.18)" : "rgba(192,57,43,0.18)"}`,
      borderLeft:`3px solid ${isWinner ? GREEN : RED}`,
      borderRadius:8,
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ fontSize:9, fontWeight:800, color:isWinner ? GREEN : RED, minWidth:22 }}>
          #{s.rank}
        </span>
        <span className="wl-ticker" style={{ fontSize:13, fontWeight:800, color:"#e2e8f0", fontFamily:"'DM Sans',sans-serif" }}>
          {s.ticker}
        </span>
      </div>
      <span className="wl-ret" style={{ fontSize:12, fontWeight:700, color:isWinner ? GREEN : RED }}>
        {s.ret >= 0 ? "+" : ""}{(s.ret * 100).toFixed(1)}%
      </span>
    </div>
  );

  return (
    <div style={{ marginBottom:32 }}>
      {/* Header row: title + date + horizon pills — all inline */}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16, flexWrap:"wrap" }}>
        <h2 style={{ fontSize:16, fontWeight:800, color:"#e2e8f0", fontFamily:"'Playfair Display',serif", margin:0 }}>
          Winners &amp; Losers
        </h2>
        <span style={{ fontSize:11, color:SUB }}>as of {data?.date ? new Date(data.date).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }) : "—"}</span>
        <HorizonPills horizon={horizon} setHorizon={setHorizon}/>
      </div>

      {allScores.length === 0 ? (
        <div style={{ color:MUTED, fontSize:13 }}>No data for this horizon yet.</div>
      ) : (
        <>
          {/* Two-column layout on desktop, two narrow columns on mobile */}
          <div className="wl-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            {/* Winners */}
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
                <div style={{ width:3, height:14, background:GREEN, borderRadius:2 }}/>
                <span style={{ fontSize:10, fontWeight:800, color:GREEN, letterSpacing:"1.5px", fontFamily:"'DM Sans',sans-serif" }}>
                  TOP WINNERS
                </span>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {winners.map(s => <StockCard key={s.ticker} s={s} isWinner={true}/>)}
              </div>
            </div>

            {/* Losers */}
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
                <div style={{ width:3, height:14, background:RED, borderRadius:2 }}/>
                <span style={{ fontSize:10, fontWeight:800, color:RED, letterSpacing:"1.5px", fontFamily:"'DM Sans',sans-serif" }}>
                  BOTTOM LOSERS
                </span>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {losers.map(s => <StockCard key={s.ticker} s={s} isWinner={false}/>)}
              </div>
            </div>
          </div>

          {/* View more / collapse */}
          <div style={{ textAlign:"center", marginTop:14 }}>
            <button
              onClick={() => setExpanded(e => !e)}
              style={{
                background:"transparent",
                border:`1px solid rgba(212,160,23,0.25)`,
                borderRadius:999, padding:"6px 22px",
                color:"rgba(212,160,23,0.65)", fontSize:10, fontWeight:700,
                letterSpacing:"1px", cursor:"pointer",
                fontFamily:"'DM Sans',sans-serif", transition:"all .15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(212,160,23,0.55)"; e.currentTarget.style.color=GOLD; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(212,160,23,0.25)"; e.currentTarget.style.color="rgba(212,160,23,0.65)"; }}
            >
              {expanded ? "▲ SHOW LESS" : "▼ VIEW MORE (TOP 10)"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Horizon Section ───────────────────────────────────────────────────────────
function HorizonSection({ data, horizonKey }) {
  const meta     = HORIZON_META[horizonKey];
  const scores   = useMemo(() => data?.[meta.field] ?? [], [data, meta.field]);
  const top20    = scores.slice(0, 20);
  const histData = useMemo(() => buildHistogram(scores), [scores]);

  if (scores.length === 0) {
    return (
      <div style={{ padding:"24px 0", color:MUTED, fontSize:13, fontFamily:"'DM Sans',sans-serif" }}>
        No {meta.label} data in Firestore yet. Re-run momentum_engine.py.
      </div>
    );
  }

  return (
    <div style={{
      background:"rgba(255,255,255,0.018)",
      border:`1px solid rgba(212,160,23,0.09)`,
      borderTop:`2px solid ${meta.color}`,
      borderRadius:14, padding:"24px 22px", marginBottom:20,
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
        <div style={{ width:3, height:18, background:meta.color, borderRadius:2, flexShrink:0 }}/>
        <span style={{ fontSize:14, fontWeight:800, color:meta.color, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.5px" }}>
          {meta.label} Momentum
        </span>
        <span style={{ fontSize:10, color:MUTED, fontFamily:"'DM Sans',sans-serif" }}>{meta.desc}</span>
      </div>

      <div className="mom-charts-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
        <div>
          <div style={{ fontSize:10, fontWeight:700, color:SUB, letterSpacing:"1.2px", marginBottom:6, fontFamily:"'DM Sans',sans-serif" }}>
            SCORE DISTRIBUTION · {scores.length} STOCKS
          </div>
          <p style={{ fontSize:10, color:MUTED, margin:"0 0 10px", lineHeight:1.6, fontFamily:"'DM Sans',sans-serif" }}>
            Cross-sectional momentum normalised to [−1, +1]. Right tail = highest momentum.
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={histData} margin={{ top:4, right:8, left:-20, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
              <XAxis dataKey="label" tick={{ fill:MUTED, fontSize:8, fontFamily:"'DM Sans',sans-serif" }}
                tickLine={false} axisLine={{ stroke:"rgba(212,160,23,0.1)" }} interval={4}/>
              <YAxis tick={{ fill:MUTED, fontSize:8 }} tickLine={false} axisLine={false}/>
              <ReferenceLine x="0.0" stroke="rgba(212,160,23,0.3)" strokeWidth={1.5} strokeDasharray="4 2"/>
              <Tooltip content={<HistTooltip/>} cursor={{ fill:"rgba(212,160,23,0.04)" }}/>
              <Bar dataKey="count" radius={[3,3,0,0]} maxBarSize={24} isAnimationActive={false}>
                {histData.map((entry, i) => (
                  <Cell key={i}
                    fill={entry.bin > 0.5 ? meta.color : entry.bin > 0 ? `${meta.color}cc` : `${meta.color}88`}
                    fillOpacity={entry.bin > 0.5 ? 1 : entry.bin > 0 ? 0.85 : 0.65}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div>
          <div style={{ fontSize:10, fontWeight:700, color:SUB, letterSpacing:"1.2px", marginBottom:6, fontFamily:"'DM Sans',sans-serif" }}>
            TOP 20 · {meta.retLabel.toUpperCase()}
          </div>
          <p style={{ fontSize:10, color:MUTED, margin:"0 0 10px", lineHeight:1.6, fontFamily:"'DM Sans',sans-serif" }}>
            Raw period returns for top-ranked stocks. Gold = top 10.
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={top20} layout="vertical" margin={{ top:0, right:56, left:0, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false}/>
              <XAxis type="number" tickFormatter={v => `${(v*100).toFixed(0)}%`}
                tick={{ fill:MUTED, fontSize:8, fontFamily:"'DM Sans',sans-serif" }}
                tickLine={false} axisLine={{ stroke:"rgba(212,160,23,0.1)" }}/>
              <YAxis type="category" dataKey="ticker" width={88}
                tick={{ fill:SUB, fontSize:8.5, fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}
                tickLine={false} axisLine={false}/>
              <ReferenceLine x={0} stroke="rgba(212,160,23,0.2)" strokeWidth={1}/>
              <Tooltip content={<RetTooltip/>} cursor={{ fill:"rgba(212,160,23,0.04)" }} isAnimationActive={false}/>
              <Bar dataKey="ret" radius={[0,3,3,0]} maxBarSize={13} isAnimationActive={false}
                label={{ position:"right", fontSize:8, fontFamily:"'DM Sans',sans-serif", fontWeight:700, fill:MUTED,
                  formatter: v => `${v >= 0 ? "+" : ""}${(v*100).toFixed(0)}%` }}>
                {top20.map(entry => (
                  <Cell key={entry.ticker}
                    fill={entry.rank <= 10 ? meta.color : `${meta.color}66`}
                    fillOpacity={entry.rank <= 10 ? 0.88 : 0.45}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ── History View ──────────────────────────────────────────────────────────────
function HistoryView({ history, horizon }) {
  const meta   = HORIZON_META[horizon];
  const months = useMemo(() =>
    history.map(h => ({
      month:  h.month,
      date:   h.date,
      top:    (h[meta.field] ?? []).slice(0, 10).map(s => s.ticker),
      topSet: new Set((h[meta.field] ?? []).slice(0, 10).map(s => s.ticker)),
    })), [history, meta]);

  const allTickers = useMemo(() => {
    const set = new Set();
    months.forEach(m => m.top.forEach(t => set.add(t)));
    return Array.from(set).sort();
  }, [months]);

  if (!months.length) return (
    <div style={{ textAlign:"center", padding:"60px 0", color:MUTED }}>
      <div style={{ fontSize:32, marginBottom:12 }}>📅</div>
      <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13 }}>No history yet. Scores appear after the first month-end run.</div>
    </div>
  );

  return (
    <div>
      <h3 style={{ fontSize:15, color:GOLD, margin:"0 0 6px", fontFamily:"'Playfair Display',serif" }}>
        Top 10 Historical Composition — {meta.label}
      </h3>
      <p style={{ fontSize:11, color:SUB, margin:"0 0 16px" }}>
        ✓ = in top 10 that month · Sorted by total appearances · Jan 2021 – present · <span style={{ color:"rgba(212,160,23,0.5)" }}>Quarterly data pre-2025, monthly thereafter</span>
      </p>
      <div style={{ overflowX:"auto" }}>
        <table style={{ borderCollapse:"collapse", fontSize:11, minWidth:"100%" }}>
          <thead>
            <tr>
              <th style={{ padding:"8px 12px", textAlign:"left", color:GOLD, fontWeight:700, borderBottom:`2px solid rgba(212,160,23,0.2)`, fontFamily:"'DM Sans',sans-serif", position:"sticky", left:0, background:"#080F1A", whiteSpace:"nowrap" }}>Ticker</th>
              {months.map(m => (
                <th key={m.month} style={{ padding:"8px 6px", textAlign:"center", color:GOLD, fontWeight:700, borderBottom:`2px solid rgba(212,160,23,0.2)`, fontFamily:"'DM Sans',sans-serif", fontSize:9, whiteSpace:"nowrap" }}>{fmtMonth(m.month)}</th>
              ))}
              <th style={{ padding:"8px 8px", textAlign:"center", color:GOLD, fontWeight:700, borderBottom:`2px solid rgba(212,160,23,0.2)`, fontFamily:"'DM Sans',sans-serif" }}>Count</th>
            </tr>
          </thead>
          <tbody>
            {allTickers
              .map(ticker => ({ ticker, appearances: months.filter(m => m.topSet.has(ticker)).length }))
              .sort((a, b) => b.appearances - a.appearances)
              .map(({ ticker, appearances }) => (
                <tr key={ticker} style={{ borderBottom:"1px solid rgba(255,255,255,0.03)" }}>
                  <td style={{ padding:"7px 12px", fontWeight:700, color:"#e2e8f0", fontFamily:"'DM Sans',sans-serif", position:"sticky", left:0, background:"#080F1A", whiteSpace:"nowrap" }}>{ticker}</td>
                  {months.map(m => (
                    <td key={m.month} style={{ padding:"7px 6px", textAlign:"center", background:m.topSet.has(ticker) ? "rgba(212,160,23,0.14)" : "transparent", borderRadius:4 }}>
                      {m.topSet.has(ticker)
                        ? <span style={{ color:GOLD, fontWeight:800, fontSize:12 }}>✓</span>
                        : <span style={{ color:"rgba(255,255,255,0.1)", fontSize:10 }}>·</span>}
                    </td>
                  ))}
                  <td style={{ padding:"7px 8px", textAlign:"center" }}>
                    <span style={{ fontSize:11, fontWeight:800, color: appearances >= months.length*0.6 ? GREEN : appearances >= months.length*0.3 ? ORANGE : MUTED }}>{appearances}</span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function MomentumDashboard() {
  const [horizon, setHorizon] = useState("3m");
  const [tab,     setTab]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [current, setCurrent] = useState(null);
  const [history, setHistory] = useState([]);
  // null = latest (live Firestore), "YYYY-MM" = historical
  const [selectedMonthKey, setSelectedMonthKey] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    let cancelled = false;

    async function load() {
      setLoading(true); setError(null);
      try {
        const latestSnap = await getDoc(doc(db, "momentum_scores", "_latest"));
        if (!latestSnap.exists()) {
          setError("No momentum data yet. Run momentum_engine.py to generate scores."); return;
        }
        const { month: latestMonth } = latestSnap.data();

        const currSnap = await getDoc(doc(db, "momentum_scores", latestMonth));
        if (currSnap.exists() && !cancelled) {
          const d = currSnap.data();
          setCurrent({ month: latestMonth, ...d });
        }

        const histQ    = query(collection(db, "momentum_scores"), orderBy("date", "desc"), limit(25));
        const histSnap = await getDocs(histQ);
        const hist = [];
        histSnap.forEach(d => { if (d.id !== "_latest") hist.push({ month: d.id, ...d.data() }); });
        if (!cancelled) setHistory(hist.sort((a, b) => b.date.localeCompare(a.date)));

      } catch (err) {
        if (!cancelled) setError(`Failed to load data: ${err.message}`);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // All available months — live Firestore history + static pre-2025 data, deduped, sorted newest first
  const allMonths = useMemo(() => {
    const combined = [...history];
    const seen = new Set();
    return combined
      .filter(m => { if (seen.has(m.month)) return false; seen.add(m.month); return true; })
      .sort((a, b) => b.month.localeCompare(a.month));
  }, [history]);

  // The data shown on Rankings tab — latest by default, or selected historical month
  const displayData = useMemo(() => {
    if (!selectedMonthKey) return current;
    return allMonths.find(m => m.month === selectedMonthKey) || current;
  }, [selectedMonthKey, allMonths, current]);

  // Top scores for the display data (used in metric strip)
  const displayTopScores = useMemo(() => {
    if (!displayData) return [];
    return (displayData[HORIZON_META[horizon].field] ?? []).slice(0, 10);
  }, [displayData, horizon]);

  const displayAvgRet = useMemo(() => {
    if (!displayTopScores.length) return null;
    return displayTopScores.reduce((s, x) => s + x.ret, 0) / displayTopScores.length;
  }, [displayTopScores]);

  return (
    <div style={{ background:`linear-gradient(160deg,${NAVY} 0%,#060e1a 100%)`, minHeight:"100vh", color:"#e2e8f0", fontFamily:"'DM Sans',sans-serif", paddingTop:92 }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet"/>
      <style>{`
        @keyframes momSpin { to { transform:rotate(360deg) } }
        @media(max-width:700px) {
          .mom-charts-grid { grid-template-columns: 1fr !important; }
          .wl-grid { gap: 10px !important; }
          .wl-ticker { font-size: 11px !important; }
          .wl-ret    { font-size: 10px !important; }
          .mom-metric-strip { grid-template-columns: 1fr 1fr !important; gap: 8px !important; }
          .mom-metric-card  { padding: 9px 12px !important; }
          .mom-metric-val   { font-size: 16px !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ padding:"60px 28px 0", borderBottom:`1px solid rgba(212,160,23,0.15)` }}>
        <div style={{ maxWidth:1320, margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12, marginBottom:20 }}>
            <div>
              <div style={{ fontSize:9, color:GOLD, letterSpacing:"2.5px", fontWeight:700, marginBottom:6 }}>VANTAGE CAPITAL · QUANT</div>
              <h1 style={{ margin:"0 0 4px", fontSize:28, fontWeight:800, fontFamily:"'Playfair Display',serif", color:"#fff" }}>Momentum Factor</h1>
              <div style={{ fontSize:12, color:SUB }}>
                Cross-sectional momentum · Nifty 500 universe · Updated monthly
              </div>
            </div>
            {!loading && !error && current && (
              <div style={{ padding:"10px 18px", background:"rgba(39,174,96,0.08)", border:`1px solid ${GREEN}33`, borderRadius:10, textAlign:"right" }}>
                <div style={{ fontSize:9, color:SUB, letterSpacing:1, marginBottom:3 }}>LAST UPDATED</div>
                <div style={{ fontSize:15, fontWeight:800, color:GREEN }}>{current.date}</div>
              </div>
            )}
          </div>

          {/* Metric strip */}
          {!loading && !error && current && (
            <div className="mom-metric-strip" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, flexWrap:"wrap", marginBottom:20 }}>
              {[
                { label:"Universe",          value:"Nifty 500",  sub:"index constituents",  color:GOLD   },
                { label:"Top 10 Avg Return", value: displayAvgRet != null ? `${displayAvgRet>=0?"+":""}${(displayAvgRet*100).toFixed(1)}%` : "—", sub:HORIZON_META[horizon].label, color: displayAvgRet >= 0 ? GREEN : RED },
                { label:"History",           value:`${history.length}M`, sub:"months of data", color:TEAL   },
                { label:"#1 Stock",          value: displayTopScores[0]?.ticker ?? "—", sub:`Score ${displayTopScores[0]?.norm_score?.toFixed(2) ?? "—"}`, color:ORANGE },
              ].map(m => (
                <div key={m.label} className="mom-metric-card" style={{ background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, padding:"12px 18px" }}>
                  <div style={{ fontSize:9, color:SUB, textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>{m.label}</div>
                  <div className="mom-metric-val" style={{ fontSize:20, fontWeight:800, color:m.color }}>{m.value}</div>
                  <div style={{ fontSize:9, color:MUTED, marginTop:2 }}>{m.sub}</div>
                </div>
              ))}
            </div>
          )}

          {/* Tab bar only — horizon pills now live inside WinnersLosersBanner */}
          <div style={{ display:"flex", alignItems:"center", gap:0 }}>
            {[["Rankings",0],["See Historical",1]].map(([label,i]) => (
              <button key={i} onClick={() => setTab(i)} style={{
                padding:"9px 20px", border:"none", cursor:"pointer",
                borderBottom: tab===i ? `3px solid ${GOLD}` : "3px solid transparent",
                background: tab===i ? "rgba(212,160,23,0.10)" : "transparent",
                color: tab===i ? GOLD : SUB,
                fontWeight: tab===i ? 800 : 500, fontSize:13, fontFamily:"'DM Sans',sans-serif",
              }}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding:"32px 28px 80px", maxWidth:1320, margin:"0 auto" }}>

        {loading && (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"80px 0", gap:14 }}>
            <svg width="36" height="36" viewBox="0 0 32 32" style={{ animation:"momSpin .9s linear infinite" }}>
              <circle cx="16" cy="16" r="12" fill="none" stroke={GOLD} strokeWidth="2.5" strokeDasharray="52" strokeDashoffset="14" strokeLinecap="round"/>
            </svg>
            <span style={{ fontSize:10, color:GOLD, letterSpacing:"2px" }}>LOADING SCORES…</span>
          </div>
        )}

        {!loading && error && (
          <div style={{ maxWidth:520, margin:"60px auto", textAlign:"center", background:"rgba(192,57,43,0.08)", border:`1px solid ${RED}33`, borderRadius:14, padding:"32px 28px" }}>
            <div style={{ fontSize:32, marginBottom:12 }}>🔴</div>
            <div style={{ fontSize:14, fontWeight:700, color:RED, marginBottom:8 }}>No Data Available</div>
            <div style={{ fontSize:12, color:SUB, lineHeight:1.8 }}>{error}</div>
            <div style={{ marginTop:24, textAlign:"left", background:"rgba(255,255,255,0.03)", borderRadius:10, padding:"16px 18px" }}>
              <div style={{ fontSize:11, fontWeight:700, color:GOLD, marginBottom:10, letterSpacing:1 }}>QUICK START</div>
              {["pip install firebase-admin pyarrow","Save firebase_service_account.json in script folder","python momentum_engine.py"].map((step,i) => (
                <div key={i} style={{ display:"flex", gap:10, marginBottom:8, alignItems:"flex-start" }}>
                  <span style={{ fontSize:9, fontWeight:800, color:GOLD, minWidth:16, paddingTop:1 }}>{i+1}.</span>
                  <code style={{ fontSize:10, color:"#c8dae8", background:"rgba(255,255,255,0.05)", padding:"2px 8px", borderRadius:4 }}>{step}</code>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rankings tab */}
        {!loading && !error && current && tab === 0 && (
          <>
            {/* ── Historical month selector ── */}
            {allMonths.length > 0 && (
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20, flexWrap:"wrap" }}>
                <span style={{ fontSize:9, fontWeight:700, color:SUB, letterSpacing:"1.5px", whiteSpace:"nowrap" }}>VIEW MONTH</span>
                <select
                  value={selectedMonthKey ?? ""}
                  onChange={e => setSelectedMonthKey(e.target.value === "" ? null : e.target.value)}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${selectedMonthKey ? "rgba(212,160,23,0.45)" : "rgba(212,160,23,0.2)"}`,
                    borderRadius: 8,
                    color: selectedMonthKey ? GOLD : SUB,
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: "'DM Sans',sans-serif",
                    padding: "6px 12px",
                    cursor: "pointer",
                    outline: "none",
                    letterSpacing: "0.3px",
                    appearance: "none",
                    WebkitAppearance: "none",
                    paddingRight: 28,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23D4A017' fill-opacity='0.5'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 10px center",
                  }}
                >
                  <option value="" style={{ background:"#0D1B2A" }}>Latest — {current?.date ?? "—"}</option>
                  {allMonths.map(m => (
                    <option key={m.month} value={m.month} style={{ background:"#0D1B2A" }}>
                      {fmtMonth(m.month)}
                    </option>
                  ))}
                </select>
                {selectedMonthKey && (
                  <button
                    onClick={() => setSelectedMonthKey(null)}
                    style={{ background:"transparent", border:"none", cursor:"pointer", fontSize:10, color:"rgba(212,160,23,0.5)", fontFamily:"'DM Sans',sans-serif", fontWeight:700, letterSpacing:"0.5px", padding:0 }}
                  >
                    ✕ BACK TO LATEST
                  </button>
                )}
                {selectedMonthKey && (
                  <span style={{ fontSize:9, color:MUTED, fontFamily:"'DM Sans',sans-serif" }}>
                    {allMonths.find(m => m.month === selectedMonthKey)?.universe
                      ? `Source: ${allMonths.find(m => m.month === selectedMonthKey).universe}`
                      : "Source: Historical data"}
                  </span>
                )}
              </div>
            )}

            {/* Winners & Losers with horizon pills inline */}
            <WinnersLosersBanner data={displayData} horizon={horizon} setHorizon={setHorizon}/>

            <div style={{ height:1, background:"rgba(212,160,23,0.10)", margin:"4px 0 28px" }}/>
            <div style={{ fontSize:11, fontWeight:700, color:SUB, letterSpacing:"2px", marginBottom:20 }}>HORIZON ANALYSIS</div>
            {Object.keys(HORIZON_META).map(key => (
              <HorizonSection key={key} data={displayData} horizonKey={key}/>
            ))}
          </>
        )}

        {/* See Historical tab — merges live Firestore history + static pre-2025 data */}
        {!loading && !error && tab === 1 && (
          <HistoryView history={history} horizon={horizon}/>
        )}

        {!loading && !error && (
          <div style={{ fontSize:10, color:MUTED, marginTop:32, lineHeight:1.9, borderTop:"1px solid rgba(255,255,255,0.05)", paddingTop:20 }}>
            <span style={{ color:GOLD }}>★</span> 12M = Jegadeesh-Titman (1993) 12-1 momentum · 6M = 6-month, 10-day skip · 3M = 3-month, 5-day skip<br/>
            All scores cross-sectionally normalised to [−1, +1] within the Nifty 500 universe · Live data via Zerodha / Kite Connect<br/>
            Historical data (2021–2024) based on quarterly reconstructed rankings · <strong style={{ color:RED }}>Not SEBI-registered investment advice.</strong> For research &amp; educational use only. · <span style={{ color:"rgba(212,160,23,0.4)" }}>© Vantage Capital Investments</span>
          </div>
        )}

        {/* Back to home — scrolls to top on navigation */}
        <div style={{ textAlign:"center", marginTop:40 }}>
          <Link to="/" onClick={() => window.scrollTo({ top:0, behavior:"smooth" })} style={{ fontSize:12, color:"rgba(212,160,23,0.5)", fontWeight:700, textDecoration:"none", letterSpacing:"1.2px" }}>
            ← BACK TO HOME
          </Link>
        </div>
      </div>
    </div>
  );
}