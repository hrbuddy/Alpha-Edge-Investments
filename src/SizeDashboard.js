/**
 * SizeDashboard.js  — Size Factor  (/size)
 *
 * Score direction (matches StockModal.js sizeFactorLabel):
 *   +1  = LARGE  (Reliance, TCS — lowest size premium)
 *   −1  = SMALL  (V2Retail, Yatharth — highest size / SMB premium)
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
const BLUE   = "#2E75B6";
const RED    = "#C0392B";
const ORANGE = "#E67E22";
const MUTED  = "#3d5570";
const SUB    = "#5a7a94";

// HIGH score (+1) = LARGE  ·  LOW score (−1) = SMALL (size premium)
const MOCK_SIZE_SCORES = [
  { ticker:"RELIANCE",   norm_score: 0.97, rank: 1  },
  { ticker:"TCS",        norm_score: 0.94, rank: 2  },
  { ticker:"INFY",       norm_score: 0.90, rank: 3  },
  { ticker:"HDFCBANK",   norm_score: 0.86, rank: 4  },
  { ticker:"ICICIBANK",  norm_score: 0.81, rank: 5  },
  { ticker:"SBIN",       norm_score: 0.76, rank: 6  },
  { ticker:"HINDUNILVR", norm_score: 0.71, rank: 7  },
  { ticker:"AXISBANK",   norm_score: 0.65, rank: 8  },
  { ticker:"LT",         norm_score: 0.59, rank: 9  },
  { ticker:"BAJFINANCE", norm_score: 0.52, rank: 10 },
  { ticker:"KOTAKBANK",  norm_score: 0.45, rank: 11 },
  { ticker:"TVSMOTOR",   norm_score: 0.36, rank: 12 },
  { ticker:"BEL",        norm_score: 0.27, rank: 13 },
  { ticker:"EICHERMOT",  norm_score: 0.16, rank: 14 },
  { ticker:"PERSISTENT", norm_score: 0.07, rank: 15 },
  { ticker:"MPHASIS",    norm_score:-0.05, rank: 16 },
  { ticker:"LTTS",       norm_score:-0.14, rank: 17 },
  { ticker:"COFORGE",    norm_score:-0.22, rank: 18 },
  { ticker:"NAUKRI",     norm_score:-0.31, rank: 19 },
  { ticker:"MCX",        norm_score:-0.40, rank: 20 },
  { ticker:"IREDA",      norm_score:-0.48, rank: 21 },
  { ticker:"BIKAJI",     norm_score:-0.57, rank: 22 },
  { ticker:"SAPPHIRE",   norm_score:-0.65, rank: 23 },
  { ticker:"KFINTECH",   norm_score:-0.73, rank: 24 },
  { ticker:"KPRMILL",    norm_score:-0.80, rank: 25 },
  { ticker:"IGIL",       norm_score:-0.87, rank: 26 },
  { ticker:"YATHARTH",   norm_score:-0.92, rank: 27 },
  { ticker:"V2RETAIL",   norm_score:-0.96, rank: 28 },
];

// +1 = LARGE, −1 = SMALL  (matches StockModal sizeFactorLabel)
function sizeLabel(score) {
  if (score == null)  return { text:"N/A",   color:"rgba(255,255,255,0.3)" };
  if (score >= 0.33)  return { text:"LARGE",  color:BLUE   };
  if (score >= -0.33) return { text:"MID",    color:GOLD   };
  return                { text:"SMALL",  color:ORANGE };
}

function ScoreTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d  = payload[0]?.payload;
  const fl = sizeLabel(d?.norm_score);
  return (
    <div style={{ background:"rgba(6,14,26,0.97)", border:"1px solid rgba(46,117,182,0.3)", borderRadius:10, padding:"10px 14px", fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ fontSize:13, fontWeight:800, color:"#e2e8f0", marginBottom:4 }}>{d?.ticker}</div>
      <div style={{ fontSize:11, color:BLUE }}>Rank #{d?.rank}</div>
      <div style={{ fontSize:11, color:fl.color, marginTop:2 }}>Score: {d?.norm_score?.toFixed(3)}</div>
      <div style={{ fontSize:11, color:fl.color, marginTop:1, fontWeight:700 }}>{fl.text}</div>
    </div>
  );
}

function FactorBanner({ scores }) {
  const { openModal } = useStockModal();
  const [expanded, setExpanded] = useState(false);
  const count   = expanded ? 10 : 5;
  // Top = large (high score). Bottom = small (low score = size premium)
  const topList    = scores.slice(0, count);
  const bottomList = [...scores].sort((a, b) => a.norm_score - b.norm_score).slice(0, count);

  function StockCard({ s, isTop }) {
    const fl = sizeLabel(s.norm_score);
    return (
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"9px 12px",
        background: isTop ? "rgba(46,117,182,0.05)" : "rgba(230,126,34,0.05)",
        border:`1px solid ${isTop ? "rgba(46,117,182,0.18)" : "rgba(230,126,34,0.18)"}`,
        borderLeft:`3px solid ${isTop ? BLUE : ORANGE}`,
        borderRadius:8,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, minWidth:0 }}>
          <span style={{ fontSize:9, fontWeight:800, color:isTop ? BLUE : ORANGE, minWidth:22 }}>#{s.rank}</span>
          <span
            className="wl-ticker sm-ticker-link"
            onClick={() => openModal(s.ticker, { sizeScore: s.norm_score })}
            style={{ fontSize:13, fontWeight:800, color:"#e2e8f0", fontFamily:"'DM Sans',sans-serif" }}
          >
            {s.ticker}
          </span>
        </div>
        <span style={{
          fontSize:9, fontWeight:800, color:fl.color,
          background:fl.color + "18", border:`1px solid ${fl.color}33`,
          padding:"3px 7px", borderRadius:999, letterSpacing:"0.5px", fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap", flexShrink:0,
        }}>
          {fl.text}
        </span>
      </div>
    );
  }

  return (
    <div style={{ marginBottom:32 }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16, flexWrap:"wrap" }}>
        <h2 style={{ fontSize:16, fontWeight:800, color:"#e2e8f0", fontFamily:"'Playfair Display',serif", margin:0 }}>Size Factor Rankings</h2>
        <span style={{ fontSize:11, color:SUB }}>Nifty 500 · Market Capitalisation</span>
      </div>

      <div className="wl-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
            <div style={{ width:3, height:14, background:BLUE, borderRadius:2 }}/>
            <span style={{ fontSize:10, fontWeight:800, color:BLUE, letterSpacing:"1.5px", fontFamily:"'DM Sans',sans-serif" }}>LARGE (HIGH SCORE)</span>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {topList.map(s => <StockCard key={s.ticker} s={s} isTop={true}/>)}
          </div>
        </div>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
            <div style={{ width:3, height:14, background:ORANGE, borderRadius:2 }}/>
            <span style={{ fontSize:10, fontWeight:800, color:ORANGE, letterSpacing:"1.5px", fontFamily:"'DM Sans',sans-serif" }}>SMALL (SIZE PREMIUM)</span>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {bottomList.map(s => <StockCard key={s.ticker} s={s} isTop={false}/>)}
          </div>
        </div>
      </div>

      <div style={{ textAlign:"center", marginTop:14 }}>
        <button
          onClick={() => setExpanded(e => !e)}
          style={{ background:"transparent", border:"1px solid rgba(46,117,182,0.25)", borderRadius:999, padding:"6px 22px", color:"rgba(46,117,182,0.7)", fontSize:10, fontWeight:700, letterSpacing:"1px", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all .15s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(46,117,182,0.55)"; e.currentTarget.style.color=BLUE; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(46,117,182,0.25)"; e.currentTarget.style.color="rgba(46,117,182,0.7)"; }}
        >
          {expanded ? "▲ SHOW LESS" : "▼ VIEW MORE (TOP 10)"}
        </button>
      </div>
    </div>
  );
}

function ScoreChart({ scores }) {
  const { openModal } = useStockModal();
  const top30 = scores.slice(0, 30);
  if (!top30.length) return null;

  return (
    <div style={{ background:"rgba(255,255,255,0.018)", border:"1px solid rgba(46,117,182,0.12)", borderTop:`2px solid ${BLUE}`, borderRadius:14, padding:"24px 22px", marginBottom:20 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
        <div style={{ width:3, height:18, background:BLUE, borderRadius:2, flexShrink:0 }}/>
        <span style={{ fontSize:14, fontWeight:800, color:BLUE, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.5px" }}>Size Factor · Full Universe</span>
        <span style={{ fontSize:10, color:MUTED, fontFamily:"'DM Sans',sans-serif" }}>Top 30 · Score [−1, +1] · Click ticker to open chart</span>
      </div>
      <ResponsiveContainer width="100%" height={440}>
        <BarChart data={top30} layout="vertical" margin={{ top:0, right:70, left:0, bottom:0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false}/>
          <XAxis type="number" domain={[-1,1]} tickFormatter={v => v.toFixed(1)}
            tick={{ fill:MUTED, fontSize:9, fontFamily:"'DM Sans',sans-serif" }}
            tickLine={false} axisLine={{ stroke:"rgba(46,117,182,0.15)" }}/>
          <YAxis type="category" dataKey="ticker" width={96}
            tick={{ fill:SUB, fontSize:9, fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}
            tickLine={false} axisLine={false}
            onClick={data => data?.value && openModal(data.value)}
            style={{ cursor:"pointer" }}/>
          <ReferenceLine x={0}     stroke="rgba(46,117,182,0.25)" strokeWidth={1.5}/>
          <ReferenceLine x={0.33}  stroke="rgba(46,117,182,0.15)"  strokeDasharray="3 3"/>
          <ReferenceLine x={-0.33} stroke="rgba(230,126,34,0.15)" strokeDasharray="3 3"/>
          <Tooltip content={<ScoreTooltip/>} cursor={{ fill:"rgba(46,117,182,0.05)" }} isAnimationActive={false}/>
          <Bar dataKey="norm_score" radius={[0,3,3,0]} maxBarSize={13} isAnimationActive={false}
            label={{ position:"right", fontSize:8, fontFamily:"'DM Sans',sans-serif", fontWeight:700, fill:MUTED, formatter: v => v.toFixed(2) }}>
            {top30.map(entry => {
              const fl = sizeLabel(entry.norm_score);
              return <Cell key={entry.ticker} fill={fl.color} fillOpacity={entry.rank <= 10 ? 0.9 : 0.55}/>;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function SizeDashboard() {
  const [tab,     setTab]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [scores,  setScores]  = useState(MOCK_SIZE_SCORES);
  const [isLive,  setIsLive]  = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    getDocs(collection(db, "stock_fundamentals"))
      .then(snap => {
        const raw = [];
        snap.forEach(d => {
          const score = d.data()?.factors?.size_score;
          if (score != null) raw.push({ ticker: d.id, norm_score: score });
        });
        if (raw.length >= 5) {
          raw.sort((a, b) => b.norm_score - a.norm_score);
          raw.forEach((s, i) => { s.rank = i + 1; });
          setScores(raw);
          setIsLive(true);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const largeCnt = useMemo(() => scores.filter(s => s.norm_score >= 0.33).length,  [scores]);
  const midCnt   = useMemo(() => scores.filter(s => s.norm_score >= -0.33 && s.norm_score < 0.33).length, [scores]);
  const smallCnt = useMemo(() => scores.filter(s => s.norm_score < -0.33).length,  [scores]);

  return (
    <div
      style={{ background:`linear-gradient(160deg,${NAVY} 0%,#060e1a 100%)`, minHeight:"100vh", color:"#e2e8f0", fontFamily:"'DM Sans',sans-serif", paddingTop:92 }}
      className="ae-page-root"
    >
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet"/>
      <style>{`
        @keyframes sizeSpin { to { transform:rotate(360deg) } }
        @media(max-width:700px) {
          .wl-grid { gap:10px !important; }
          .wl-ticker { font-size:11px !important; }
          .size-strip { grid-template-columns:1fr 1fr !important; gap:8px !important; }
        }
      `}</style>

      <div className="ae-page-header" style={{ padding:"60px 28px 0", borderBottom:"1px solid rgba(46,117,182,0.2)" }}>
        <div style={{ maxWidth:1320, margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12, marginBottom:20 }}>
            <div>
              <div style={{ fontSize:9, color:GOLD, letterSpacing:"2.5px", fontWeight:700, marginBottom:6 }}>VANTAGE CAPITAL · QUANT</div>
              <h1 style={{ margin:"0 0 4px", fontSize:28, fontWeight:800, fontFamily:"'Playfair Display',serif", color:"#fff" }}>Size Factor</h1>
              <div style={{ fontSize:12, color:SUB }}>Fama-French SMB · Market Capitalisation · Nifty 500 universe</div>
            </div>
            <div style={{ padding:"8px 14px", background: isLive ? "rgba(39,174,96,0.1)" : "rgba(46,117,182,0.08)", border:`1px solid ${isLive ? GREEN + "44" : BLUE + "33"}`, borderRadius:8, alignSelf:"flex-start" }}>
              <div style={{ fontSize:9, color:SUB, letterSpacing:1, marginBottom:2 }}>DATA SOURCE</div>
              <div style={{ fontSize:14, fontWeight:800, color: isLive ? GREEN : BLUE }}>{isLive ? "🟢 LIVE" : "📦 SAMPLE"}</div>
            </div>
          </div>

          <div className="size-strip" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
            {[
              { label:"Universe", value:"Nifty 500",       sub:"index constituents",         color:GOLD   },
              { label:"Large",    value:String(largeCnt),  sub:"mega-cap · low size premium", color:BLUE   },
              { label:"Mid",      value:String(midCnt),    sub:"mid-size classification",     color:GOLD   },
              { label:"Small",    value:String(smallCnt),  sub:"size premium · SMB exposure", color:ORANGE },
            ].map(m => (
              <div key={m.label} style={{ background:"rgba(255,255,255,0.025)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, padding:"12px 18px" }}>
                <div style={{ fontSize:9, color:SUB, textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>{m.label}</div>
                <div style={{ fontSize:20, fontWeight:800, color:m.color }}>{m.value}</div>
                <div style={{ fontSize:9, color:MUTED, marginTop:2 }}>{m.sub}</div>
              </div>
            ))}
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:0 }}>
            {[["Rankings",0],["Historical",1]].map(([label,i]) => (
              <button key={i} onClick={() => setTab(i)} style={{
                padding:"9px 20px", border:"none", cursor:"pointer",
                borderBottom: tab===i ? `3px solid ${BLUE}` : "3px solid transparent",
                background:   tab===i ? "rgba(46,117,182,0.10)" : "transparent",
                color:        tab===i ? BLUE : SUB,
                fontWeight:   tab===i ? 800 : 500, fontSize:13, fontFamily:"'DM Sans',sans-serif",
              }}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding:"32px 28px 80px", maxWidth:1320, margin:"0 auto" }}>
        {loading && (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"80px 0", gap:14 }}>
            <svg width="36" height="36" viewBox="0 0 32 32" style={{ animation:"sizeSpin .9s linear infinite" }}>
              <circle cx="16" cy="16" r="12" fill="none" stroke={BLUE} strokeWidth="2.5" strokeDasharray="52" strokeDashoffset="14" strokeLinecap="round"/>
            </svg>
            <span style={{ fontSize:10, color:BLUE, letterSpacing:"2px" }}>LOADING SCORES…</span>
          </div>
        )}

        {!loading && tab === 0 && (
          <>
            {!isLive && (
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20, padding:"10px 16px", background:"rgba(46,117,182,0.06)", border:`1px solid ${BLUE}22`, borderRadius:10 }}>
                <span style={{ fontSize:14 }}>📦</span>
                <div style={{ fontSize:11, color:SUB }}>
                  Showing <strong style={{ color:BLUE }}>sample data</strong> — run <code style={{ background:"rgba(255,255,255,0.06)", padding:"1px 6px", borderRadius:4, fontSize:10 }}>size_value_engine.py</code> to populate live scores.
                </div>
              </div>
            )}
            <FactorBanner scores={scores}/>
            <div style={{ height:1, background:"rgba(46,117,182,0.10)", margin:"4px 0 28px" }}/>
            <div style={{ fontSize:11, fontWeight:700, color:SUB, letterSpacing:"2px", marginBottom:20 }}>FULL UNIVERSE BREAKDOWN</div>
            <ScoreChart scores={scores}/>
          </>
        )}

        {!loading && tab === 1 && (
          <div style={{ maxWidth:540, margin:"80px auto 0", textAlign:"center" }}>
            <div style={{ fontSize:40, marginBottom:16 }}>📅</div>
            <div style={{ fontSize:16, fontWeight:800, color:BLUE, fontFamily:"'Playfair Display',serif", marginBottom:8 }}>Historical Size Data Coming Soon</div>
            <div style={{ fontSize:12, color:SUB, lineHeight:1.8 }}>Month-over-month size transitions and trend analysis will appear here once the data pipeline runs.</div>
          </div>
        )}

        {!loading && (
          <div style={{ fontSize:10, color:MUTED, marginTop:32, lineHeight:1.9, borderTop:"1px solid rgba(255,255,255,0.05)", paddingTop:20 }}>
            <span style={{ color:GOLD }}>★</span> Size factor: Fama-French (1993) SMB · Larger market cap = higher score · Smaller = lower score = size premium exposure<br/>
            Scores normalised to [−1, +1] within Nifty 500 · <strong style={{ color:RED }}>Not SEBI-registered investment advice.</strong> · <span style={{ color:"rgba(212,160,23,0.4)" }}>© Vantage Capital Investments</span>
          </div>
        )}

        <div style={{ textAlign:"center", marginTop:40 }}>
          <Link to="/quant" onClick={() => window.scrollTo({ top:0, behavior:"smooth" })} style={{ fontSize:12, color:"rgba(46,117,182,0.6)", fontWeight:700, textDecoration:"none", letterSpacing:"1.2px" }}>
            ← BACK TO QUANT HUB
          </Link>
        </div>
      </div>
    </div>
  );
}