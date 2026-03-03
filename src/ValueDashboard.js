/**
 * ValueDashboard.js  — Value Factor  (/value)
 *
 * Data: Firestore stock_fundamentals/{ticker} → factors.value_score
 * Meta: Firestore stock_fundamentals/_meta    → { as_of: "YYYY-MM-DD" }
 *
 * Score: +1 = DEEP VALUE (cheap),  -1 = HIGH GROWTH (expensive)
 */
import { useState, useEffect, useMemo } from "react";
import { useStockModal } from "./StockModal";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

const NAVY   = "#0D1B2A";
const GOLD   = "#D4A017";
const GREEN  = "#27AE60";
const PURPLE = "#8E44AD";
const ORANGE = "#E67E22";
const RED    = "#C0392B";
const MUTED  = "#3d5570";
const SUB    = "#5a7a94";

const MOCK = [
  { ticker:"COALINDIA",  norm_score: 0.92, rank:1  },
  { ticker:"NTPC",       norm_score: 0.85, rank:2  },
  { ticker:"ONGC",       norm_score: 0.79, rank:3  },
  { ticker:"SBIN",       norm_score: 0.73, rank:4  },
  { ticker:"POWERGRID",  norm_score: 0.66, rank:5  },
  { ticker:"HDFCBANK",   norm_score: 0.44, rank:6  },
  { ticker:"INFY",       norm_score: 0.03, rank:7  },
  { ticker:"TCS",        norm_score:-0.06, rank:8  },
  { ticker:"KOTAKBANK",  norm_score:-0.43, rank:9  },
  { ticker:"PERSISTENT", norm_score:-0.60, rank:10 },
  { ticker:"YATHARTH",   norm_score:-0.74, rank:11 },
  { ticker:"IGIL",       norm_score:-0.80, rank:12 },
  { ticker:"V2RETAIL",   norm_score:-0.86, rank:13 },
  { ticker:"DMART",      norm_score:-0.91, rank:14 },
  { ticker:"ZOMATO",     norm_score:-0.95, rank:15 },
];

function valueLabel(score) {
  if (score == null)  return { text:"N/A",       color:"rgba(255,255,255,0.3)" };
  if (score >= 0.33)  return { text:"VALUE",      color:GREEN  };
  if (score >= -0.33) return { text:"BALANCED",   color:GOLD   };
  return                     { text:"GROWTH",     color:PURPLE };
}

function ScoreTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d  = payload[0]?.payload;
  const fl = valueLabel(d?.norm_score);
  return (
    <div style={{ background:"rgba(6,14,26,0.97)", border:"1px solid rgba(230,126,34,0.3)", borderRadius:10, padding:"10px 14px", fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ fontSize:13, fontWeight:800, color:"#e2e8f0", marginBottom:4 }}>{d?.ticker}</div>
      <div style={{ fontSize:11, color:ORANGE }}>Rank #{d?.rank}</div>
      <div style={{ fontSize:11, color:fl.color, marginTop:2 }}>Score: {d?.norm_score?.toFixed(3)}</div>
    </div>
  );
}

function StockCard({ s, isTop, openModal }) {
  return (
    <div
      onClick={() => openModal(s.ticker)}
      style={{
        display:"flex", alignItems:"center", gap:8, padding:"9px 12px", cursor:"pointer",
        background: isTop ? "rgba(39,174,96,0.05)" : "rgba(142,68,173,0.05)",
        border:`1px solid ${isTop ? "rgba(39,174,96,0.18)" : "rgba(142,68,173,0.18)"}`,
        borderLeft:`3px solid ${isTop ? GREEN : PURPLE}`,
        borderRadius:8,
      }}
    >
      <span style={{ fontSize:9, fontWeight:800, color:isTop ? GREEN : PURPLE, minWidth:28, flexShrink:0 }}>#{s.rank}</span>
      <span style={{ fontSize:13, fontWeight:800, color:"#e2e8f0", fontFamily:"'DM Sans',sans-serif", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
        {s.ticker}
      </span>
      <span style={{ fontSize:10, color:MUTED, marginLeft:"auto", flexShrink:0 }}>{s.norm_score?.toFixed(2)}</span>
    </div>
  );
}

function FactorBanner({ scores, openModal }) {
  const [expanded, setExpanded] = useState(false);
  const count      = expanded ? 10 : 5;
  const topList    = scores.slice(0, count);
  const bottomList = [...scores].sort((a, b) => a.norm_score - b.norm_score).slice(0, count);

  return (
    <div style={{ marginBottom:32 }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16, flexWrap:"wrap" }}>
        <h2 style={{ fontSize:16, fontWeight:800, color:"#e2e8f0", fontFamily:"'Playfair Display',serif", margin:0 }}>Value Factor Rankings</h2>
        <span style={{ fontSize:11, color:SUB }}>Nifty 500 · Fundamental Valuations</span>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
            <div style={{ width:3, height:14, background:GREEN, borderRadius:2 }}/>
            <span style={{ fontSize:10, fontWeight:800, color:GREEN, letterSpacing:"1.5px" }}>DEEP VALUE (CHEAP)</span>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {topList.map(s => <StockCard key={s.ticker} s={s} isTop={true} openModal={openModal}/>)}
          </div>
        </div>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
            <div style={{ width:3, height:14, background:PURPLE, borderRadius:2 }}/>
            <span style={{ fontSize:10, fontWeight:800, color:PURPLE, letterSpacing:"1.5px" }}>HIGH GROWTH (EXPENSIVE)</span>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {bottomList.map(s => <StockCard key={s.ticker} s={s} isTop={false} openModal={openModal}/>)}
          </div>
        </div>
      </div>
      <div style={{ textAlign:"center", marginTop:14 }}>
        <button
          onClick={() => setExpanded(e => !e)}
          style={{ background:"transparent", border:"1px solid rgba(230,126,34,0.25)", borderRadius:999, padding:"6px 22px", color:"rgba(230,126,34,0.7)", fontSize:10, fontWeight:700, letterSpacing:"1px", cursor:"pointer" }}
        >
          {expanded ? "▲ SHOW LESS" : "▼ VIEW MORE (TOP 10)"}
        </button>
      </div>
    </div>
  );
}

function ScoreChart({ scores, openModal }) {
  const top25 = scores.slice(0, 25);
  if (!top25.length) return null;
  return (
    <div style={{ background:"rgba(255,255,255,0.018)", border:"1px solid rgba(230,126,34,0.12)", borderTop:`2px solid ${ORANGE}`, borderRadius:14, padding:"24px 22px", marginBottom:20 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
        <div style={{ width:3, height:18, background:ORANGE, borderRadius:2, flexShrink:0 }}/>
        <span style={{ fontSize:14, fontWeight:800, color:ORANGE }}>Value Factor · Full Universe</span>
        <span style={{ fontSize:10, color:MUTED }}>Top 25 · Score [−1, +1]</span>
      </div>
      <ResponsiveContainer width="100%" height={380}>
        <BarChart data={top25} layout="vertical" margin={{ top:0, right:70, left:0, bottom:0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false}/>
          <XAxis type="number" domain={[-1,1]} tickFormatter={v => v.toFixed(1)}
            tick={{ fill:MUTED, fontSize:9 }} tickLine={false} axisLine={{ stroke:"rgba(230,126,34,0.15)" }}/>
          <YAxis type="category" dataKey="ticker" width={96}
            tick={{ fill:SUB, fontSize:9, fontWeight:600 }} tickLine={false} axisLine={false}
            onClick={d => d?.value && openModal(d.value)} style={{ cursor:"pointer" }}/>
          <ReferenceLine x={0}     stroke="rgba(230,126,34,0.25)" strokeWidth={1.5}/>
          <ReferenceLine x={0.33}  stroke="rgba(39,174,96,0.15)"  strokeDasharray="3 3"/>
          <ReferenceLine x={-0.33} stroke="rgba(142,68,173,0.15)" strokeDasharray="3 3"/>
          <Tooltip content={<ScoreTooltip/>} cursor={{ fill:"rgba(230,126,34,0.05)" }} isAnimationActive={false}/>
          <Bar dataKey="norm_score" radius={[0,3,3,0]} maxBarSize={13} isAnimationActive={false}
            label={{ position:"right", fontSize:8, fontWeight:700, fill:MUTED, formatter:v => v.toFixed(2) }}>
            {top25.map(entry => {
              const fl = valueLabel(entry.norm_score);
              return <Cell key={entry.ticker} fill={fl.color} fillOpacity={entry.rank <= 10 ? 0.9 : 0.55}/>;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function ValueDashboard() {
  const { openModal } = useStockModal();
  const [tab,     setTab]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [scores,  setScores]  = useState([]);
  const [isLive,  setIsLive]  = useState(false);
  const [asOf,    setAsOf]    = useState(null);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    let cancelled = false;

    async function load() {
      setLoading(true); setError(null);
      try {
        const snap = await getDocs(collection(db, "stock_fundamentals"));
        const raw = [];
        let metaAsOf = null;
        snap.forEach(d => {
          if (d.id === "_meta") { metaAsOf = d.data()?.as_of ?? null; return; }
          const score = d.data()?.factors?.value_score;
          if (score != null) raw.push({ ticker: d.id, norm_score: score });
        });
        if (!cancelled) {
          if (raw.length >= 5) {
            raw.sort((a, b) => b.norm_score - a.norm_score);
            raw.forEach((s, i) => { s.rank = i + 1; });
            setScores(raw);
            setIsLive(true);
            setAsOf(metaAsOf);
          } else {
            setScores(MOCK); setIsLive(false);
          }
        }
      } catch (err) {
        if (!cancelled) { setScores(MOCK); setIsLive(false); setError(err.message); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const deepValueCnt  = useMemo(() => scores.filter(s => s.norm_score >= 0.33).length,  [scores]);
  const balancedCnt   = useMemo(() => scores.filter(s => s.norm_score >= -0.33 && s.norm_score < 0.33).length, [scores]);
  const highGrowthCnt = useMemo(() => scores.filter(s => s.norm_score < -0.33).length,  [scores]);

  return (
    <div style={{ background:`linear-gradient(160deg,${NAVY} 0%,#060e1a 100%)`, minHeight:"100vh", color:"#e2e8f0", fontFamily:"'DM Sans',sans-serif", paddingTop:92 }} className="ae-page-root">
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet"/>
      <style>{`@keyframes vSpin{to{transform:rotate(360deg)}} @media(max-width:700px){.v-strip{grid-template-columns:1fr 1fr !important;}}`}</style>

      {/* ── Header ── */}
      <div className="ae-page-header" style={{ padding:"60px 28px 32px", borderBottom:"1px solid rgba(230,126,34,0.2)", textAlign:"center" }}>
        <div style={{ maxWidth:680, margin:"0 auto" }}>
          <div style={{ fontSize:9, color:GOLD, letterSpacing:"2.5px", fontWeight:700, marginBottom:10 }}>VANTAGE CAPITAL · QUANT ENGINE</div>
          <h1 style={{ margin:"0 0 12px", fontSize:"clamp(28px,4vw,42px)", fontWeight:800, fontFamily:"'Playfair Display',serif", color:"#fff", lineHeight:1.15 }}>Value Factor</h1>
          <div style={{ width:44, height:2, background:ORANGE, borderRadius:2, margin:"0 auto 14px" }}/>
          <p style={{ fontSize:13, color:SUB, lineHeight:1.8, margin:"0 0 16px" }}>Composite of P/E, P/B, EV/EBITDA and earnings yield across the Nifty 500. Stocks trading cheaply vs fundamentals deliver superior long-run returns.</p>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"6px 14px", background: isLive ? "rgba(39,174,96,0.1)" : "rgba(230,126,34,0.08)", border:`1px solid ${isLive ? GREEN+"44" : ORANGE+"33"}`, borderRadius:999, fontSize:11, fontWeight:700, color: isLive ? GREEN : ORANGE }}>
            {isLive && asOf ? `🟢 LAST UPDATED · ${asOf}` : isLive ? "🟢 LIVE DATA" : "📦 SAMPLE DATA"}
          </div>
        </div>
      </div>

      <div style={{ padding:"28px 28px 80px", maxWidth:1320, margin:"0 auto" }}>

        {/* Metric strip */}
        <div className="v-strip" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:28 }}>
          {[
            { label:"Universe",    value:"Nifty 500",           sub:"index constituents",   color:GOLD   },
            { label:"Deep Value",  value:String(deepValueCnt),  sub:"P/E · P/B · EV cheap", color:GREEN  },
            { label:"Balanced",    value:String(balancedCnt),   sub:"fair-valued stocks",   color:GOLD   },
            { label:"High Growth", value:String(highGrowthCnt), sub:"premium / expensive",  color:PURPLE },
          ].map(m => (
            <div key={m.label} style={{ background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, padding:"12px 18px" }}>
              <div style={{ fontSize:9, color:SUB, textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>{m.label}</div>
              <div style={{ fontSize:20, fontWeight:800, color:m.color }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div style={{ display:"flex", borderBottom:"1px solid rgba(255,255,255,0.07)", marginBottom:28 }}>
          {[["Rankings",0],["Historical",1]].map(([label,i]) => (
            <button key={i} onClick={() => setTab(Number(i))} style={{
              padding:"9px 20px", border:"none", cursor:"pointer",
              borderBottom: tab===i ? `3px solid ${ORANGE}` : "3px solid transparent",
              background:   tab===i ? "rgba(230,126,34,0.10)" : "transparent",
              color:        tab===i ? ORANGE : SUB,
              fontWeight:   tab===i ? 800 : 500, fontSize:13, fontFamily:"'DM Sans',sans-serif",
            }}>{label}</button>
          ))}
        </div>

        {loading && (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"80px 0", gap:14 }}>
            <svg width="36" height="36" viewBox="0 0 32 32" style={{ animation:"vSpin .9s linear infinite" }}>
              <circle cx="16" cy="16" r="12" fill="none" stroke={ORANGE} strokeWidth="2.5" strokeDasharray="52" strokeDashoffset="14" strokeLinecap="round"/>
            </svg>
            <span style={{ fontSize:10, color:ORANGE, letterSpacing:"2px" }}>LOADING SCORES…</span>
          </div>
        )}

        {!loading && error && (
          <div style={{ padding:"12px 16px", background:"rgba(192,57,43,0.08)", border:`1px solid ${RED}33`, borderRadius:10, marginBottom:20, fontSize:11, color:RED }}>
            ⚠ Could not load live data — showing sample. ({error})
          </div>
        )}

        {!loading && tab === 0 && (
          <>
            {!isLive && (
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20, padding:"10px 16px", background:"rgba(230,126,34,0.06)", border:`1px solid ${ORANGE}22`, borderRadius:10 }}>
                <span>📦</span>
                <div style={{ fontSize:11, color:SUB }}>
                  Showing <strong style={{ color:ORANGE }}>sample data</strong> — run <code style={{ background:"rgba(255,255,255,0.06)", padding:"1px 6px", borderRadius:4, fontSize:10 }}>size_value_engine.py</code> to populate live scores.
                </div>
              </div>
            )}
            <FactorBanner scores={scores} openModal={openModal}/>
            <div style={{ height:1, background:"rgba(230,126,34,0.10)", margin:"4px 0 28px" }}/>
            <div style={{ fontSize:11, fontWeight:700, color:SUB, letterSpacing:"2px", marginBottom:20 }}>FULL UNIVERSE BREAKDOWN</div>
            <ScoreChart scores={scores} openModal={openModal}/>
          </>
        )}

        {!loading && tab === 1 && (
          <div style={{ maxWidth:540, margin:"80px auto 0", textAlign:"center" }}>
            <div style={{ fontSize:40, marginBottom:16 }}>📅</div>
            <div style={{ fontSize:16, fontWeight:800, color:ORANGE, fontFamily:"'Playfair Display',serif", marginBottom:8 }}>Historical Value Data Coming Soon</div>
            <div style={{ fontSize:12, color:SUB, lineHeight:1.8 }}>Monthly value rankings and P/E dispersion trends will appear here once the data pipeline runs.</div>
          </div>
        )}

        {!loading && (
          <div style={{ fontSize:10, color:MUTED, marginTop:32, lineHeight:1.9, borderTop:"1px solid rgba(255,255,255,0.05)", paddingTop:20 }}>
            <span style={{ color:GOLD }}>★</span> Value factor: composite of P/E, P/B, EV/EBITDA and earnings yield · Lower multiples = higher score = deeper value<br/>
            Scores normalised to [−1, +1] · <strong style={{ color:RED }}>Not SEBI-registered investment advice.</strong> · <span style={{ color:"rgba(212,160,23,0.4)" }}>© Vantage Capital Investments</span>
          </div>
        )}

        <div style={{ textAlign:"center", marginTop:40 }}>
          <Link to="/quant" onClick={() => window.scrollTo({ top:0, behavior:"smooth" })} style={{ fontSize:12, color:"rgba(230,126,34,0.6)", fontWeight:700, textDecoration:"none", letterSpacing:"1.2px" }}>
            ← BACK TO QUANT HUB
          </Link>
        </div>
      </div>
    </div>
  );
}