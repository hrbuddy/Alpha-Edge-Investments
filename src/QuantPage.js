/**
 * QuantPage.js  — Factor Research Hub  (/quant)
 */

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";


const NAVY   = "#0D1B2A";
const GOLD   = "#D4A017";
const GREEN  = "#27AE60";
const TEAL   = "#0E7C7B";
const BLUE   = "#2E75B6";
const ORANGE = "#E67E22";
const RED    = "#C0392B";
const MUTED  = "#3d5570";
const SUB    = "#5a7a94";

const FACTORS = [
  {
    key:         "momentum",
    icon:        "⚡",
    label:       "MOMENTUM",
    title:       "Momentum Factor",
    desc:        "Stocks that have outperformed peers over recent horizons tend to continue outperforming — cross-sectional price momentum.",
    detail:      "12-1M · 6M · 3M · Jegadeesh-Titman (1993)",
    color:       TEAL,
    path:        "/momentum",
    status:      "LIVE",
    metricLabel: "Horizons",
    metricValue: "3",
  },
  {
    key:         "size",
    icon:        "📐",
    label:       "SIZE",
    title:       "Size Factor",
    desc:        "Smaller companies earn a return premium over large caps over long horizons — the Fama-French SMB effect.",
    detail:      "Market Cap · SMB · Nifty 500 Universe",
    color:       BLUE,
    path:        "/size",
    status:      "LIVE",
    metricLabel: "Universe",
    metricValue: "500",
  },
  {
    key:         "value",
    icon:        "⚖️",
    label:       "VALUE",
    title:       "Value Factor",
    desc:        "Stocks trading cheaply relative to fundamentals deliver superior long-run returns — the Fama-French HML effect.",
    detail:      "P/E · P/B · EV/EBITDA · Earnings Yield",
    color:       ORANGE,
    path:        "/value",
    status:      "LIVE",
    metricLabel: "Metrics",
    metricValue: "4",
  },
  {
    key:         "quality",
    icon:        "🔬",
    label:       "QUALITY",
    title:       "Quality Factor",
    desc:        "High-quality businesses with strong ROCE, stable earnings and clean balance sheets outperform over cycles.",
    detail:      "ROE · ROCE · CFO/PAT · EPS Stability",
    color:       GOLD,
    path:        null,
    status:      "SOON",
    metricLabel: "Parameters",
    metricValue: "8",
  },
  {
    key:         "growth",
    icon:        "📈",
    label:       "GROWTH",
    title:       "Growth Factor",
    desc:        "Companies with accelerating revenue and earnings growth consistently attract institutional capital and re-rating.",
    detail:      "Revenue CAGR · EPS CAGR · Reinvestment Rate",
    color:       GREEN,
    path:        null,
    status:      "SOON",
    metricLabel: "Metrics",
    metricValue: "6",
  },
];

function FactorCard({ factor, goTo }) {
  const [hov, setHov] = useState(false);
  const live = factor.status === "LIVE";

  return (
    <div
      onClick={() => { if (live && factor.path) goTo(factor.path); }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position:     "relative",
        background:   hov && live ? "rgba(255,255,255,0.042)" : "rgba(255,255,255,0.022)",
        border:       `1px solid ${hov && live ? factor.color + "60" : "rgba(255,255,255,0.07)"}`,
        borderLeft:   `3px solid ${live ? factor.color : "rgba(255,255,255,0.12)"}`,
        borderRadius: 14,
        padding:      "22px 24px 20px",
        cursor:       live ? "pointer" : "default",
        opacity:      live ? 1 : 0.52,
        transform:    hov && live ? "translateY(-2px)" : "translateY(0)",
        boxShadow:    hov && live ? "0 8px 32px rgba(0,0,0,0.32)" : "none",
        transition:   "all .2s",
      }}
    >
      <div style={{ position:"absolute", top:14, right:14, display:"flex", alignItems:"center", gap:5 }}>
        {live ? (
          <>
            <span style={{ width:6, height:6, borderRadius:"50%", background:GREEN, boxShadow:`0 0 6px ${GREEN}`, display:"inline-block" }}/>
            <span style={{ fontSize:8, fontWeight:800, color:GREEN, letterSpacing:"1.5px", fontFamily:"'DM Sans',sans-serif" }}>LIVE</span>
          </>
        ) : (
          <span style={{ fontSize:8, fontWeight:700, color:MUTED, letterSpacing:"1.5px", background:"rgba(255,255,255,0.05)", padding:"3px 9px", borderRadius:999, fontFamily:"'DM Sans',sans-serif" }}>COMING SOON</span>
        )}
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
        <span style={{ fontSize:22, lineHeight:1 }}>{factor.icon}</span>
        <span style={{ fontSize:9, fontWeight:800, letterSpacing:"2.5px", color:live ? factor.color : MUTED, fontFamily:"'DM Sans',sans-serif" }}>{factor.label}</span>
      </div>

      <div style={{ fontSize:17, fontWeight:800, color:live ? "#e2e8f0" : "#3a5068", fontFamily:"'Playfair Display',serif", marginBottom:8, lineHeight:1.2 }}>
        {factor.title}
      </div>

      <div style={{ fontSize:11, color:live ? SUB : MUTED, lineHeight:1.7, marginBottom:14 }}>
        {factor.desc}
      </div>

      <div style={{ display:"inline-block", fontSize:9, fontWeight:700, color:live ? factor.color + "cc" : MUTED, background:live ? factor.color + "14" : "transparent", padding:"4px 11px", borderRadius:999, marginBottom:18, letterSpacing:"0.4px", fontFamily:"'DM Sans',sans-serif" }}>
        {factor.detail}
      </div>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ fontSize:9, color:MUTED, letterSpacing:"0.8px", fontFamily:"'DM Sans',sans-serif" }}>{factor.metricLabel.toUpperCase()}</div>
          <div style={{ fontSize:20, fontWeight:900, color:live ? factor.color : MUTED, fontFamily:"'DM Sans',sans-serif", lineHeight:1.1, marginTop:2 }}>{factor.metricValue}</div>
        </div>
        {live && (
          <div style={{ fontSize:11, fontWeight:800, color:factor.color, display:"flex", alignItems:"center", gap:5, opacity:hov ? 1 : 0.6, transition:"opacity .15s", fontFamily:"'DM Sans',sans-serif" }}>
            Explore <span style={{ fontSize:15 }}>→</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function QuantPage() {
  const navigate = useNavigate();
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div
      style={{ background:`linear-gradient(160deg,${NAVY} 0%,#060e1a 100%)`, minHeight:"100vh", color:"#e2e8f0", fontFamily:"'DM Sans',sans-serif", paddingTop:92 }}
      className="ae-page-root"
    >
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet"/>
      <style>{`
        @media(max-width:900px) { .qp-grid { grid-template-columns: 1fr 1fr !important; } }
        @media(max-width:600px) { .qp-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      <div className="ae-page-header" style={{ padding:"60px 28px 32px", borderBottom:`1px solid rgba(212,160,23,0.15)`, textAlign:"center" }}>
        <div style={{ maxWidth:680, margin:"0 auto" }}>
          <div style={{ fontSize:9, color:GOLD, letterSpacing:"2.5px", fontWeight:700, marginBottom:10 }}>VANTAGE CAPITAL · QUANT ENGINE</div>
          <h1 style={{ margin:"0 0 12px", fontSize:"clamp(28px,4vw,42px)", fontWeight:800, fontFamily:"'Playfair Display',serif", color:"#fff", lineHeight:1.15 }}>Factor Research Hub</h1>
          <div style={{ width:44, height:2, background:GOLD, borderRadius:2, margin:"0 auto 14px" }}/>
          <p style={{ fontSize:13, color:SUB, lineHeight:1.8, margin:0 }}>Systematic, academic-grade factor models across the Nifty 500 universe — Momentum, Size and Value live, Quality and Growth coming soon.</p>
        </div>
      </div>

      <div style={{ padding:"32px 28px 80px", maxWidth:1160, margin:"0 auto" }}>
        <div className="qp-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:16, marginBottom:40 }}>
          {FACTORS.map(f => <FactorCard key={f.key} factor={f} goTo={navigate} />)}
        </div>

        <div style={{ padding:"20px 24px", background:"rgba(212,160,23,0.04)", border:"1px solid rgba(212,160,23,0.12)", borderRadius:12, marginBottom:28 }}>
          <div style={{ fontSize:10, fontWeight:800, color:GOLD, letterSpacing:"1.5px", marginBottom:10 }}>METHODOLOGY</div>
          <div style={{ fontSize:11, color:SUB, lineHeight:1.85 }}>
            All factor scores are cross-sectionally normalised to <strong style={{ color:"#c8dae8" }}>[−1, +1]</strong> within the Nifty 500 universe at each monthly rebalance.
            {" "}<strong style={{ color:TEAL }}>Momentum</strong>: Jegadeesh-Titman (1993) — 12-1M, 6M and 3M cross-sectional return ranks with skip period.
            {" "}<strong style={{ color:BLUE }}>Size</strong>: Fama-French SMB — market cap rank; larger market cap = higher score, smaller = lower score = size premium exposure.
            {" "}<strong style={{ color:ORANGE }}>Value</strong>: Composite of P/E, P/B, EV/EBITDA and earnings yield; lower multiples = higher factor score.
          </div>
        </div>

        <div style={{ fontSize:10, color:MUTED, lineHeight:1.9, borderTop:"1px solid rgba(255,255,255,0.05)", paddingTop:20 }}>
          <span style={{ color:GOLD }}>★</span> Factor models based on Fama-French (1993) and Jegadeesh-Titman (1993) academic literature · Monthly rebalance<br/>
          <strong style={{ color:RED }}>Not SEBI-registered investment advice.</strong> For research &amp; educational use only. · <span style={{ color:"rgba(212,160,23,0.4)" }}>© Vantage Capital Investments</span>
        </div>

        <div style={{ textAlign:"center", marginTop:40 }}>
          <Link to="/" onClick={() => window.scrollTo({ top:0, behavior:"smooth" })} style={{ fontSize:12, color:"rgba(212,160,23,0.5)", fontWeight:700, textDecoration:"none", letterSpacing:"1.2px" }}>
            ← BACK TO HOME
          </Link>
        </div>
      </div>
    </div>
  );
}