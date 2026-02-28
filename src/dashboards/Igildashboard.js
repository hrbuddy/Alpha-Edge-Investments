import { useState } from "react";
import { Link } from "react-router-dom";
import { BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart, Area, Cell, ReferenceLine } from "recharts";

const NAVY = "#0D1B2A";
const BLUE = "#2E75B6";
const TEAL = "#0E7C7B";
const GREEN = "#27AE60";
const RED = "#C0392B";
const ORANGE = "#E67E22";
const GOLD = "#D4A017";

const tabs = ["Overview", "Porter's 5 Forces", "Revenue Model", "FCFF & CFO/PAT", "OPM & ROCE", "Quality Score", "Sensitivity"];

// Historical + Projected data (CY = Calendar Year for IGIL, FY = Fiscal Year post-transition)
const finData = [
  { yr: "CY20", rev: 292, opm: 62, opProfit: 181, cfo: 120, pat: 132, capex: 8, dep: 6, tax: 43, fcff: 112, cfoPatPct: 91, roce: 85, type: "H" },
  { yr: "CY21", rev: 407, opm: 65, opProfit: 265, cfo: 155, pat: 195, capex: 10, dep: 7, tax: 63, fcff: 145, cfoPatPct: 79, roce: 90, type: "H" },
  { yr: "CY22", rev: 491, opm: 68, opProfit: 335, cfo: 194, pat: 242, capex: 12, dep: 8, tax: 78, fcff: 182, cfoPatPct: 80, roce: 92, type: "H" },
  { yr: "CY23", rev: 639, opm: 71, opProfit: 450, cfo: 303, pat: 325, capex: 15, dep: 10, tax: 105, fcff: 288, cfoPatPct: 93, roce: 99, type: "H" },
  { yr: "CY24", rev: 1053, opm: 57, opProfit: 600, cfo: 393, pat: 427, capex: 25, dep: 18, tax: 138, fcff: 368, cfoPatPct: 92, roce: 68, type: "H" },
  { yr: "CY25", rev: 1229, opm: 60, opProfit: 737, cfo: 480, pat: 532, capex: 30, dep: 22, tax: 172, fcff: 450, cfoPatPct: 90, roce: 55, type: "H" },
  // Projections
  { yr: "FY27E", rev: 1450, opm: 60, opProfit: 870, cfo: 570, pat: 630, capex: 35, dep: 26, tax: 204, fcff: 535, cfoPatPct: 90, roce: 52, type: "P" },
  { yr: "FY28E", rev: 1700, opm: 61, opProfit: 1040, cfo: 690, pat: 760, capex: 40, dep: 30, tax: 246, fcff: 650, cfoPatPct: 91, roce: 50, type: "P" },
  { yr: "FY29E", rev: 2000, opm: 62, opProfit: 1240, cfo: 840, pat: 920, capex: 45, dep: 35, tax: 298, fcff: 795, cfoPatPct: 91, roce: 48, type: "P" },
  { yr: "FY30E", rev: 2350, opm: 63, opProfit: 1480, cfo: 1010, pat: 1100, capex: 50, dep: 40, tax: 356, fcff: 960, cfoPatPct: 92, roce: 48, type: "P" },
];

// CFO/PAT for chart
const cfoPat = finData.map(d => ({
  ...d,
  cfoPatClean: d.cfoPatPct && d.cfoPatPct > 0 && d.cfoPatPct < 200 ? d.cfoPatPct : null,
}));

// Revenue driver model — single segment with sub-drivers
const segData = [
  { yr: "CY22", diamond: 344, jewelry: 74, education: 25, colored: 25, other: 23, total: 491 },
  { yr: "CY23", diamond: 447, jewelry: 96, education: 32, colored: 32, other: 32, total: 639 },
  { yr: "CY24", diamond: 737, jewelry: 158, education: 53, colored: 53, other: 52, total: 1053 },
  { yr: "CY25", diamond: 860, jewelry: 184, education: 62, colored: 62, other: 61, total: 1229 },
  { yr: "FY27E", diamond: 1015, jewelry: 218, education: 73, colored: 73, other: 71, total: 1450 },
  { yr: "FY28E", diamond: 1190, jewelry: 255, education: 85, colored: 85, other: 85, total: 1700 },
  { yr: "FY29E", diamond: 1400, jewelry: 300, education: 100, colored: 100, other: 100, total: 2000 },
  { yr: "FY30E", diamond: 1645, jewelry: 353, education: 118, colored: 118, other: 116, total: 2350 },
];

// Porter's 5 Forces — single business, but compared across Natural Diamonds, LGD, Jewelry Cert
const porterData = [
  { force: "New Entrants", natural: 9, lgd: 9, jewelry: 8 },
  { force: "Buyer Power", natural: 8, lgd: 9, jewelry: 7 },
  { force: "Supplier Power", natural: 9, lgd: 9, jewelry: 9 },
  { force: "Substitutes", natural: 8, lgd: 7, jewelry: 6 },
  { force: "Rivalry", natural: 6, lgd: 9, jewelry: 8 },
];

// Quality scorecard
const qualityData = [
  { param: "Longevity", score: 7, full: "51yr brand, only 14mo listed" },
  { param: "Predictable CF", score: 8, full: "High-vol, low-ticket cert svc" },
  { param: "ROCE", score: 10, full: "68% (99% pre-acq). Top 0.1%" },
  { param: "Revenue Resilience", score: 7, full: "17% organic growth, untested" },
  { param: "EPS Stability", score: 7, full: "₹9.9→12.3, only 2yr data" },
  { param: "CFO/PAT", score: 9, full: "88% avg cash conversion" },
  { param: "Margins", score: 10, full: "60% EBITDA, <4% capex" },
  { param: "Reinvestment", score: 6, full: "Asset-light = narrow runway" },
];

const radarQuality = qualityData.map(d => ({ ...d, fullMark: 10 }));

// Sensitivity matrix — FY30 EPS × P/E
const sensMatrix = [
  { eps: "Bear ₹22", pe20: 440, pe25: 550, pe28: 616, pe32: 704 },
  { eps: "Base ₹25.4", pe20: 508, pe25: 635, pe28: 711, pe32: 813 },
  { eps: "Bull ₹28", pe20: 560, pe25: 700, pe28: 784, pe32: 896 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: NAVY, border: `1px solid ${GOLD}`, borderRadius: 6, padding: "8px 12px", color: "#fff", fontSize: 12 }}>
      <p style={{ margin: 0, fontWeight: 700, color: GOLD }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ margin: "2px 0", color: p.color }}>
          {p.name}: {typeof p.value === "number" ? p.value.toLocaleString() : p.value}{p.unit || ""}
        </p>
      ))}
    </div>
  );
};

function TabButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 16px",
        border: "none",
        borderBottom: active ? `3px solid ${GOLD}` : "3px solid transparent",
        background: active ? "rgba(212,160,23,0.1)" : "transparent",
        color: active ? GOLD : "#94a3b8",
        fontWeight: active ? 700 : 500,
        fontSize: 13,
        cursor: "pointer",
        transition: "all 0.2s",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {label}
    </button>
  );
}

function MetricCard({ label, value, sub, color = GOLD }) {
  return (
    <div className="metric-card" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "14px 18px" }}>
      <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: "'DM Sans', sans-serif" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function ScoreBar({ label, score, maxScore = 10, color }) {
  const pct = (score / maxScore) * 100;
  const barColor = score >= 8 ? GREEN : score >= 6 ? ORANGE : RED;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontSize: 12, color: "#e2e8f0", fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 800, color: barColor }}>{score}/10</span>
      </div>
      <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 4, height: 8, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${barColor}, ${barColor}cc)`, borderRadius: 4, transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

export default function IGILDashboard() {
  const [tab, setTab] = useState(0);

  return (
    <div style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #0a1628 100%)`, minHeight: "100vh", color: "#e2e8f0", fontFamily: "'DM Sans', sans-serif" }}>

      {/* BACK TO HOME BUTTON - now always visible */}
      <Link
        to="/"
        style={{
          position: "fixed",
          top: "20px",
          left: "28px",
          zIndex: 10000,
          color: GOLD,
          textDecoration: "none",
          fontWeight: 700,
          background: "rgba(13,27,42,0.95)",
          padding: "8px 18px",
          borderRadius: 8,
          fontSize: 13,
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
        }}
      >
        ← Back to Alpha Edge Home
      </Link>

      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`
        .metric-grid { display: flex; gap: 10px; margin-top: 16px; flex-wrap: wrap; }
        .metric-card { flex: 1; min-width: 140px; }
        @media (max-width: 600px) {
          .metric-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
          .metric-card { min-width: unset; }
        }
      `}</style>

      {/* Header */}
      <div style={{ padding: "90px 28px 0", borderBottom: `1px solid rgba(212,160,23,0.2)` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: GOLD, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700 }}>Alpha Edge Research — Initiating Coverage</div>
            <h1 style={{ margin: "6px 0 2px", fontSize: 30, fontWeight: 800, fontFamily: "'Playfair Display', serif", color: "#fff" }}>
              International Gemmological Institute (India) Ltd
            </h1>
            <div style={{ fontSize: 13, color: "#94a3b8" }}>NSE: IGIL · BSE: 544311 · Nifty Smallcap 100 · World's #1 Diamond Certification</div>
          </div>
          <div style={{ display: "flex", gap: 8, padding: "6px 14px", background: "rgba(39,174,96,0.12)", border: `1px solid ${GREEN}44`, borderRadius: 8, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>RATING</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: GREEN }}>BUY</span>
          </div>
        </div>

        {/* Company description */}
        <div style={{ marginTop: 14, padding: "12px 16px", background: "rgba(212,160,23,0.06)", border: "1px solid rgba(212,160,23,0.18)", borderRadius: 8 }}>
          <p style={{ margin: 0, fontSize: 13, color: "#c8dae8", lineHeight: 1.65 }}>
            World's largest independent diamond and gemstone certification lab, holding <strong style={{color:"#fff"}}>33% global market share</strong> and certifying 65% of all lab-grown diamonds worldwide. A pure picks-and-shovels play — every diamond entering organised retail needs an IGI certificate, making revenues agnostic to diamond price cycles.
          </p>
        </div>

        <div className="metric-grid">
          <MetricCard label="CMP" value="₹330" sub="Feb 2026" />
          <MetricCard label="Market Cap" value="₹14,200 Cr" sub="$1.7B" />
          <MetricCard label="FY30 Target" value="₹550–700" sub="14–20% CAGR" color={GREEN} />
          <MetricCard label="ROCE" value="68%" sub="CY24 (99% pre-acq)" color={TEAL} />
          <MetricCard label="EBITDA Margin" value="60%" sub="CY25" color={BLUE} />
          <MetricCard label="Quality" value="8.0/10" sub="High-Quality Monopoly" color={ORANGE} />
        </div>

        <div style={{ display: "flex", gap: 0, marginTop: 16, overflowX: "auto" }}>
          {tabs.map((t, i) => <TabButton key={i} label={t} active={tab === i} onClick={() => setTab(i)} />)}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "20px 28px 40px" }}>

        {/* TAB 0: Overview */}
        {tab === 0 && (
          <div>
            <h2 style={{ fontSize: 18, color: GOLD, marginBottom: 12, fontFamily: "'Playfair Display', serif" }}>Investment Thesis</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[
                { t: "Global Certification Monopoly", d: "World's #1 independent certifier. 33% global share, 50% India share, 65% of all LGD certifications worldwide." },
                { t: "Picks-and-Shovels Play", d: "Toll-road on the entire diamond value chain. Every diamond entering organized retail needs certification. IGI earns regardless of diamond prices." },
                { t: "Exceptional Unit Economics", d: "68% ROCE, 60% EBITDA margins, near-zero debt. Asset-light model: brand trust + gemologists = revenue. No inventory, no factories." },
                { t: "LGD Structural Tailwind", d: "Lab-grown diamonds growing at 19% CAGR. IGI holds 65% LGD certification share. Volume explosion = certification demand explosion." },
              ].map((item, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: GOLD, marginBottom: 4 }}>{item.t}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>{item.d}</div>
                </div>
              ))}
            </div>

            <h2 style={{ fontSize: 18, color: GOLD, margin: "24px 0 12px", fontFamily: "'Playfair Display', serif" }}>Revenue & Operating Profit (₹ Cr)</h2>
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={finData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="yr" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="rev" name="Revenue" fill={BLUE} opacity={0.7} radius={[3, 3, 0, 0]}>
                  {finData.map((d, i) => <Cell key={i} fill={d.type === "P" ? `${BLUE}88` : BLUE} />)}
                </Bar>
                <Line dataKey="opProfit" name="Op. Profit" stroke={GOLD} strokeWidth={2.5} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>

            {/* TAM Mini-Section */}
            <h2 style={{ fontSize: 18, color: GOLD, margin: "24px 0 12px", fontFamily: "'Playfair Display', serif" }}>TAM — Total Addressable Market</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
              {[
                ["Global Jewelry", "$320B → $420B", "4-5% CAGR"],
                ["Diamond Market", "$105B → $130B", "3-4% CAGR"],
                ["LGD Market", "$25B → $45B", "9-14% CAGR"],
                ["Cert. Market", "$2.8B → $6B", "~15% CAGR"],
                ["IGI Share (33%)", "$1B → $2B", "~15% CAGR"],
              ].map(([t, v, g], i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: "#64748b" }}>{t}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", margin: "3px 0" }}>{v}</div>
                  <div style={{ fontSize: 10, color: GREEN, fontWeight: 600 }}>{g}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 1: Porter's 5 Forces */}
        {tab === 1 && (
          <div>
            <h2 style={{ fontSize: 18, color: GOLD, marginBottom: 6, fontFamily: "'Playfair Display', serif" }}>Porter's Five Forces — Competitive Moat Analysis</h2>
            <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>Score 1–10 where 10 = strongest position. IGI analyzed across its three certification verticals: Natural Diamonds, LGD, and Jewelry. The moat is exceptionally wide across all segments.</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <ResponsiveContainer width="100%" height={340}>
                  <RadarChart data={porterData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="force" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fill: "#64748b", fontSize: 9 }} />
                    <Radar name="Natural Diamond" dataKey="natural" stroke={BLUE} fill={BLUE} fillOpacity={0.2} strokeWidth={2} />
                    <Radar name="LGD Cert." dataKey="lgd" stroke={GREEN} fill={GREEN} fillOpacity={0.15} strokeWidth={2} />
                    <Radar name="Jewelry Cert." dataKey="jewelry" stroke={ORANGE} fill={ORANGE} fillOpacity={0.1} strokeWidth={2} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div>
                {[
                  { force: "Threat of New Entrants", n: "VERY LOW — 50yr trust moat, accreditation takes decades", l: "VERY LOW — 65% share, first-mover", j: "LOW — IGI pioneered this category" },
                  { force: "Bargaining Power of Buyers", n: "LOW — Cert cost is 1-2% of diamond value", l: "VERY LOW — No alternative at scale", j: "LOW-MOD — Fewer mandatory standards" },
                  { force: "Supplier Power", n: "VERY LOW — No raw materials needed", l: "VERY LOW — Asset-light, gemologists only", j: "VERY LOW — Same model" },
                  { force: "Threat of Substitutes", n: "LOW — Blockchain/AI can't replace trust", l: "MOD — Some self-cert by manufacturers", j: "MODERATE — Retailer self-certification" },
                  { force: "Competitive Rivalry", n: "MODERATE — GIA is gold standard", l: "VERY LOW — IGI dominates 65%", j: "LOW — IGI first-mover in jewelry cert" },
                ].map((f, i) => (
                  <div key={i} style={{ marginBottom: 12, padding: "10px 12px", background: "rgba(255,255,255,0.02)", borderRadius: 6, borderLeft: `3px solid ${i === 4 ? GREEN : i === 0 ? GREEN : BLUE}` }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>{f.force}</div>
                    <div style={{ fontSize: 11, color: BLUE }}>Natural: {f.n}</div>
                    <div style={{ fontSize: 11, color: GREEN }}>LGD: {f.l}</div>
                    <div style={{ fontSize: 11, color: ORANGE }}>Jewelry: {f.j}</div>
                  </div>
                ))}
                <div style={{ padding: "12px 14px", background: `rgba(39,174,96,0.08)`, border: `1px solid ${GREEN}33`, borderRadius: 8, marginTop: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: GREEN }}>Conclusion: VERY WIDE moat across all verticals</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>50 years of trust = near-impossible to replicate. GIA is the only credible competitor (non-profit, US-focused). In LGD, IGI is essentially a monopoly.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Revenue Model */}
        {tab === 2 && (
          <div>
            <h2 style={{ fontSize: 18, color: GOLD, marginBottom: 6, fontFamily: "'Playfair Display', serif" }}>Revenue Driver Model — Certification Volumes × Pricing (₹ Cr)</h2>
            <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>Revenue = Certification Volumes × Avg Fee. Volumes driven by LGD growth (20%+), organized retail expansion, and jewelry certification penetration.</p>

            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={segData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="yr" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="diamond" name="Diamond Cert." stackId="a" fill={BLUE} />
                <Bar dataKey="jewelry" name="Jewelry Cert." stackId="a" fill={TEAL} />
                <Bar dataKey="education" name="Education" stackId="a" fill={ORANGE} />
                <Bar dataKey="colored" name="Colored Stones" stackId="a" fill={GOLD} />
                <Bar dataKey="other" name="Other" stackId="a" fill="#7B2D8E" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            <h3 style={{ fontSize: 15, color: TEAL, margin: "20px 0 10px" }}>Certification Volume Driver Breakdown</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${GOLD}33` }}>
                    {["Driver", "CY25", "FY27E", "FY28E", "FY29E", "FY30E"].map(h => (
                      <th key={h} style={{ padding: "8px 10px", textAlign: h === "Driver" ? "left" : "right", color: GOLD, fontWeight: 700 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Cert. Volumes (M)", "13.5", "16.0", "18.5", "21.5", "25.0"],
                    ["  Natural Diamond", "5.0", "5.5", "5.8", "6.0", "6.3"],
                    ["  LGD", "6.5", "8.0", "10.0", "12.5", "15.5"],
                    ["  Jewelry + Other", "2.0", "2.5", "2.7", "3.0", "3.2"],
                    ["Avg Fee (₹)", "~750", "~740", "~730", "~720", "~710"],
                    ["Revenue (₹ Cr)", "1,229", "1,450", "1,700", "2,000", "2,350"],
                    ["YoY Growth", "17%", "18%", "17%", "18%", "18%"],
                  ].map((row, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: i === 5 ? "rgba(46,117,182,0.08)" : "transparent" }}>
                      {row.map((cell, j) => (
                        <td key={j} style={{ padding: "7px 10px", textAlign: j === 0 ? "left" : "right", fontWeight: i === 5 || j === 0 ? 700 : 400, color: i === 5 ? BLUE : i === 6 ? GREEN : "#e2e8f0" }}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 style={{ fontSize: 15, color: TEAL, margin: "20px 0 10px" }}>P&L Build-Up</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${GOLD}33` }}>
                    {["Metric", "CY24", "CY25", "FY27E", "FY28E", "FY30E"].map(h => (
                      <th key={h} style={{ padding: "8px 10px", textAlign: h === "Metric" ? "left" : "right", color: GOLD, fontWeight: 700 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Revenue (₹ Cr)", "1,053", "1,229", "1,450", "1,700", "2,350"],
                    ["EBITDA Margin", "57%", "60%", "60%", "61%", "63%"],
                    ["PAT (₹ Cr)", "427", "532", "630", "760", "1,100"],
                    ["PAT Margin", "41%", "43%", "43%", "45%", "47%"],
                    ["EPS (₹)", "9.89", "12.30", "14.6", "17.6", "25.4"],
                  ].map((row, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: i === 4 ? "rgba(46,117,182,0.08)" : "transparent" }}>
                      {row.map((cell, j) => (
                        <td key={j} style={{ padding: "7px 10px", textAlign: j === 0 ? "left" : "right", fontWeight: i === 4 || j === 0 ? 700 : 400, color: i === 4 ? BLUE : "#e2e8f0" }}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: FCFF & CFO/PAT */}
        {tab === 3 && (
          <div>
            <h2 style={{ fontSize: 18, color: GOLD, marginBottom: 6, fontFamily: "'Playfair Display', serif" }}>Free Cash Flow to Firm (FCFF) — Historical + Forecast</h2>
            <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>FCFF = CFO − Capex. IGI's asset-light model means capex is minimal (&lt;4% of revenue). Almost all operating cash converts to free cash.</p>

            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={finData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="yr" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="cfo" name="CFO (₹Cr)" fill={BLUE} opacity={0.6} radius={[3, 3, 0, 0]}>
                  {finData.map((d, i) => <Cell key={i} fill={d.type === "P" ? `${BLUE}66` : BLUE} />)}
                </Bar>
                <Bar dataKey="capex" name="Capex (₹Cr)" fill={RED} opacity={0.5}>
                  {finData.map((d, i) => <Cell key={i} fill={d.type === "P" ? `${RED}66` : RED} />)}
                </Bar>
                <Line dataKey="fcff" name="FCFF (₹Cr)" stroke={GREEN} strokeWidth={2.5} dot={{ r: 4, fill: GREEN }} />
              </ComposedChart>
            </ResponsiveContainer>

            <h2 style={{ fontSize: 18, color: GOLD, margin: "28px 0 6px", fontFamily: "'Playfair Display', serif" }}>CFO / PAT Ratio</h2>
            <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>IGI consistently converts 80–93% of PAT into operating cash. No working capital traps, no inventory drag. Healthy range: 80–100%.</p>

            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={cfoPat}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="yr" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis domain={[0, 110]} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={100} stroke={GOLD} strokeDasharray="5 5" label={{ value: "100%", fill: GOLD, fontSize: 10 }} />
                <Bar dataKey="cfoPatClean" name="CFO/PAT %" fill={TEAL} radius={[3, 3, 0, 0]}>
                  {cfoPat.map((d, i) => <Cell key={i} fill={d.type === "P" ? `${TEAL}88` : TEAL} />)}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
            <div style={{ fontSize: 11, color: "#64748b", fontStyle: "italic", marginTop: 8 }}>Average CFO/PAT: ~88%. Score: 9/10 (Excellent). Deducting 1 point only for limited 4-year sample size.</div>
          </div>
        )}

        {/* TAB 4: OPM & ROCE */}
        {tab === 4 && (
          <div>
            <h2 style={{ fontSize: 18, color: GOLD, marginBottom: 6, fontFamily: "'Playfair Display', serif" }}>Operating Profit Margin (EBITDA %) — Historical + Forecast</h2>
            <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>EBITDA margins dipped in CY24 (57%) due to Belgium/Netherlands acquisition costs, but are recovering toward 60–63% as integration completes and operating leverage kicks in.</p>

            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={finData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="yr" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis domain={[40, 80]} tick={{ fill: "#94a3b8", fontSize: 11 }} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area dataKey="opm" name="EBITDA %" fill={BLUE} fillOpacity={0.15} stroke={BLUE} strokeWidth={2.5} dot={{ r: 4, fill: BLUE }}>
                </Area>
              </ComposedChart>
            </ResponsiveContainer>

            <h2 style={{ fontSize: 18, color: GOLD, margin: "28px 0 6px", fontFamily: "'Playfair Display', serif" }}>ROCE (%) — Pre and Post Acquisition</h2>
            <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>ROCE hit 99% in CY23 (pre-acquisition). Post-acquisition goodwill inflated capital employed, compressing ROCE to 68% (CY24). Even at 48–55%, IGI's ROCE is among the highest of ANY Indian listed company.</p>

            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={finData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="yr" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis domain={[0, 110]} tick={{ fill: "#94a3b8", fontSize: 11 }} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <ReferenceLine y={12} stroke={RED} strokeDasharray="4 4" label={{ value: "WACC ~12%", fill: RED, fontSize: 10 }} />
                <Bar dataKey="roce" name="ROCE %" fill={GREEN} opacity={0.7} radius={[3, 3, 0, 0]}>
                  {finData.map((d, i) => <Cell key={i} fill={d.type === "P" ? `${GREEN}88` : d.roce >= 60 ? GREEN : BLUE} />)}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
            <div style={{ marginTop: 10, padding: "10px 14px", background: "rgba(212,160,23,0.06)", borderRadius: 6, border: `1px solid ${GOLD}22` }}>
              <span style={{ fontSize: 12, color: GOLD, fontWeight: 700 }}>Model Note: </span>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>ROCE decline from 99% to 55% is entirely due to acquisition-inflated capital employed (goodwill). The UNDERLYING business ROCE likely exceeds 80%. Comparable to CAMS (67%), BSE (65%), and other monopoly platforms. Score: 10/10 — EXCEPTIONAL.</span>
            </div>
          </div>
        )}

        {/* TAB 5: Quality Score */}
        {tab === 5 && (
          <div>
            <h2 style={{ fontSize: 18, color: GOLD, marginBottom: 6, fontFamily: "'Playfair Display', serif" }}>Quality Scorecard — 8 Parameter Analysis</h2>
            <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>IGIL is a rare globally-dominant monopoly franchise. Exceptional scores on ROCE (10/10) and Margins (10/10) offset by limited listed track record (7/10 longevity) and narrow reinvestment runway (6/10).</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <ResponsiveContainer width="100%" height={320}>
                  <RadarChart data={radarQuality}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="param" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fill: "#64748b", fontSize: 9 }} />
                    <Radar name="Score" dataKey="score" stroke={GOLD} fill={GOLD} fillOpacity={0.2} strokeWidth={2} dot={{ r: 3, fill: GOLD }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div>
                {qualityData.map((d, i) => (
                  <div key={i} style={{ marginBottom: 6 }}>
                    <ScoreBar label={d.param} score={d.score} />
                    <div style={{ fontSize: 10, color: "#64748b", marginTop: -4, marginBottom: 6, paddingLeft: 2 }}>{d.full}</div>
                  </div>
                ))}
                <div style={{ marginTop: 14, padding: "12px 14px", background: "rgba(212,160,23,0.08)", borderRadius: 8, border: `1px solid ${GOLD}33` }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: GOLD }}>Overall: 8.0/10 — HIGH-QUALITY MONOPOLY</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>Key Insight: Two parameters score 10/10 (ROCE and Margins) — extremely rare. The short listed history (14 months) and narrow reinvestment runway are the only deductions. This is a "toll road" business with monopoly characteristics at a reasonable valuation (27x TTM P/E with 68% ROCE).</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: Sensitivity */}
        {tab === 6 && (
          <div>
            <h2 style={{ fontSize: 18, color: GOLD, marginBottom: 6, fontFamily: "'Playfair Display', serif" }}>FY30 Sensitivity Analysis — Earnings × P/E Matrix</h2>
            <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>EPS based on FY30 projections. P/E range reflects certification monopoly premium. CMP: ₹330.</p>

            <div style={{ overflowX: "auto", marginBottom: 24 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr>
                    <th style={{ padding: "10px 14px", textAlign: "left", color: GOLD, fontWeight: 700, borderBottom: `2px solid ${GOLD}44` }}>EPS ↓ / P/E →</th>
                    {["20x (De-rate)", "25x (Bear)", "28x (Base)", "32x (Re-rate)"].map(h => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "center", color: GOLD, fontWeight: 700, borderBottom: `2px solid ${GOLD}44` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sensMatrix.map((row, i) => {
                    const bg = i === 0 ? "rgba(192,57,43,0.06)" : i === 1 ? "rgba(46,117,182,0.06)" : "rgba(39,174,96,0.06)";
                    return (
                      <tr key={i} style={{ background: bg }}>
                        <td style={{ padding: "10px 14px", fontWeight: 700, color: i === 0 ? RED : i === 1 ? BLUE : GREEN }}>{row.eps}</td>
                        {[row.pe20, row.pe25, row.pe28, row.pe32].map((val, j) => {
                          const upside = ((val - 330) / 330 * 100).toFixed(0);
                          const isAbove = val > 330;
                          return (
                            <td key={j} style={{ padding: "10px 14px", textAlign: "center", fontWeight: (i === 1 && j >= 1) || (i === 2 && j >= 1) ? 700 : 400 }}>
                              <div style={{ fontSize: 15, color: isAbove ? GREEN : RED }}>₹{val.toLocaleString()}</div>
                              <div style={{ fontSize: 10, color: isAbove ? "#66bb6a" : "#ef5350" }}>{isAbove ? "+" : ""}{upside}%</div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <h3 style={{ fontSize: 15, color: TEAL, marginBottom: 10 }}>Scenario Definitions</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              {[
                { label: "BEAR (De-Rate)", color: RED, rev: "₹2,000 Cr", opm: "58%", eps: "₹22", pe: "20–25x", target: "₹440–550", desc: "LGD volume slows. Certification fee compression. Blackstone overhang persists. PE de-rates to 20-25x." },
                { label: "BASE CASE", color: BLUE, rev: "₹2,350 Cr", opm: "63%", eps: "₹25.4", pe: "25–28x", target: "₹635–711", desc: "17-18% revenue CAGR. EBITDA expands to 63%. Market assigns fair monopoly premium." },
                { label: "BULL (Re-Rate)", color: GREEN, rev: "₹2,700 Cr", opm: "65%", eps: "₹28", pe: "28–32x", target: "₹784–896", desc: "20%+ CAGR. LGD accelerates. Jewelry cert. explodes. Market re-rates as quality monopoly." },
              ].map((s, i) => (
                <div key={i} style={{ padding: 14, background: "rgba(255,255,255,0.02)", borderRadius: 8, borderTop: `3px solid ${s.color}` }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: s.color, marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.6 }}>
                    <div>FY30 Rev: <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{s.rev}</span></div>
                    <div>OPM: <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{s.opm}</span></div>
                    <div>EPS: <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{s.eps}</span></div>
                    <div>P/E Range: <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{s.pe}</span></div>
                    <div>Target: <span style={{ color: s.color, fontWeight: 700 }}>{s.target}</span></div>
                  </div>
                  <div style={{ fontSize: 10, color: "#64748b", marginTop: 8, lineHeight: 1.4 }}>{s.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 20, padding: "14px 18px", background: "rgba(39,174,96,0.06)", border: `1px solid ${GREEN}33`, borderRadius: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: GREEN }}>Base Case FY30 Target: ₹550–700 (14–20% CAGR from ₹330)</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>Assumes 17-18% revenue CAGR driven by LGD volume growth (20%+), natural diamond share gains, and jewelry certification expansion. EBITDA margin expanding from 60% to 63%. At 27x TTM P/E with 68% ROCE — meaningfully cheaper than business quality deserves. Accumulate ₹290–350 range.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}