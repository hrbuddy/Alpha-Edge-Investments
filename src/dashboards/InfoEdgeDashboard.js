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

// Historical + Projected standalone data
const finData = [
  { yr: "FY16", rev: 748, opm: 12, opProfit: 91, cfo: 78, pat: 118, capex: 15, dep: 24, tax: 55, fcff: 63, cfoPatPct: 66, roce: 12, type: "H" },
  { yr: "FY17", rev: 888, opm: -1, opProfit: -9, cfo: 213, pat: -43, capex: 20, dep: 33, tax: 47, fcff: 193, cfoPatPct: null, roce: 3, type: "H" },
  { yr: "FY18", rev: 988, opm: 22, opProfit: 219, cfo: 253, pat: 501, capex: 18, dep: 30, tax: 82, fcff: 235, cfoPatPct: 50, roce: 15, type: "H" },
  { yr: "FY19", rev: 1151, opm: 1, opProfit: 9, cfo: 276, pat: 592, capex: 22, dep: 22, tax: 122, fcff: 254, cfoPatPct: 47, roce: 4, type: "H" },
  { yr: "FY20", rev: 1312, opm: -27, opProfit: -350, cfo: 350, pat: -246, capex: 25, dep: 48, tax: -120, fcff: 325, cfoPatPct: null, roce: -13, type: "H" },
  { yr: "FY21", rev: 1128, opm: 7, opProfit: 74, cfo: 276, pat: 1418, capex: 20, dep: 45, tax: 192, fcff: 256, cfoPatPct: 19, roce: 4, type: "H" },
  { yr: "FY22", rev: 1589, opm: 28, opProfit: 446, cfo: 707, pat: 12882, capex: 30, dep: 45, tax: 1278, fcff: 677, cfoPatPct: 5, roce: 23, type: "H" },
  { yr: "FY23", rev: 2346, opm: 15, opProfit: 348, cfo: 512, pat: -70, capex: 45, dep: 73, tax: -212, fcff: 467, cfoPatPct: null, roce: 3, type: "H" },
  { yr: "FY24", rev: 2536, opm: 28, opProfit: 711, cfo: 702, pat: 595, capex: 55, dep: 101, tax: 281, fcff: 647, cfoPatPct: 118, roce: 4, type: "H" },
  { yr: "FY25", rev: 2850, opm: 31, opProfit: 874, cfo: 876, pat: 1310, capex: 60, dep: 113, tax: 430, fcff: 816, cfoPatPct: 67, roce: 3, type: "H" },
  // Projections (standalone operating metrics)
  { yr: "FY26E", rev: 3245, opm: 36, opProfit: 1168, cfo: 1050, pat: 860, capex: 70, dep: 125, tax: 283, fcff: 980, cfoPatPct: 122, roce: 4, stndlRoce: 38, type: "P" },
  { yr: "FY27E", rev: 3770, opm: 38, opProfit: 1433, cfo: 1280, pat: 1060, capex: 80, dep: 140, tax: 348, fcff: 1200, cfoPatPct: 121, roce: 4, stndlRoce: 40, type: "P" },
  { yr: "FY28E", rev: 4349, opm: 39, opProfit: 1696, cfo: 1500, pat: 1255, capex: 90, dep: 155, tax: 412, fcff: 1410, cfoPatPct: 120, roce: 5, stndlRoce: 42, type: "P" },
  { yr: "FY29E", rev: 5118, opm: 41, opProfit: 2047, cfo: 1780, pat: 1515, capex: 100, dep: 170, tax: 497, fcff: 1680, cfoPatPct: 117, roce: 5, stndlRoce: 43, type: "P" },
  { yr: "FY30E", rev: 6850, opm: 42, opProfit: 2877, cfo: 2100, pat: 2129, capex: 120, dep: 190, tax: 699, fcff: 1980, cfoPatPct: 99, roce: 6, stndlRoce: 45, type: "P" },
];

// Clean CFO/PAT for chart (exclude negative PAT years)
const cfoPat = finData.map(d => ({
  ...d,
  cfoPatClean: d.cfoPatPct && d.cfoPatPct > 0 && d.cfoPatPct < 200 ? d.cfoPatPct : null,
  cfoStndl: d.type === "P" ? d.cfoPatPct : d.cfoPatPct
}));

// Segment revenue
const segData = [
  { yr: "FY22", naukri: 1558, acres: 217, others: 155, total: 1930 },
  { yr: "FY23", naukri: 1990, acres: 310, others: 210, total: 2510 },
  { yr: "FY24", naukri: 2250, acres: 356, others: 265, total: 2871 },
  { yr: "FY25", naukri: 2505, acres: 420, others: 320, total: 3245 },
  { yr: "FY26E", naukri: 2900, acres: 490, others: 380, total: 3770 },
  { yr: "FY27E", naukri: 3329, acres: 575, others: 445, total: 4349 },
  { yr: "FY28E", naukri: 3923, acres: 675, others: 520, total: 5118 },
  { yr: "FY29E", naukri: 4530, acres: 790, others: 600, total: 5920 },
  { yr: "FY30E", naukri: 5255, acres: 920, others: 675, total: 6850 },
];

// Porter's 5 Forces
const porterData = [
  { force: "New Entrants", naukri: 9, acres: 5, jeevansathi: 5 },
  { force: "Buyer Power", naukri: 8, acres: 5, jeevansathi: 5 },
  { force: "Supplier Power", naukri: 9, acres: 9, jeevansathi: 9 },
  { force: "Substitutes", naukri: 7, acres: 5, jeevansathi: 4 },
  { force: "Rivalry", naukri: 9, acres: 3, jeevansathi: 3 },
];

// Quality scorecard
const qualityData = [
  { param: "Longevity", score: 9, full: "31yrs ops, 20yrs listed" },
  { param: "Predictable CF", score: 7, full: "Growing CFO, hiring cycle risk" },
  { param: "ROCE", score: 5, full: "3% consol (35-40% standalone)" },
  { param: "Revenue Resilience", score: 7, full: "15% 10yr CAGR, 1 dip" },
  { param: "EPS Stability", score: 4, full: "Volatile (-4 to +198)" },
  { param: "CFO/PAT", score: 6, full: "Good standalone, consol noisy" },
  { param: "Margins", score: 8, full: "36% OPM, Naukri 47-50%" },
  { param: "Reinvestment", score: 7, full: "36% IRR on VC portfolio" },
];

const radarQuality = qualityData.map(d => ({ ...d, fullMark: 10 }));

// Sensitivity matrix
const sensMatrix = [
  { eps: "Bear ₹23.5", pe30: 705, pe40: 940, pe50: 1175, pe60: 1410 },
  { eps: "Base ₹32.8", pe30: 984, pe40: 1312, pe50: 1640, pe60: 1968 },
  { eps: "Bull ₹42.1", pe30: 1263, pe40: 1684, pe50: 2105, pe60: 2526 },
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
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "14px 18px", flex: 1, minWidth: 140 }}>
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

export default function InfoEdgeDashboard() {
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


      {/* Header */}
      <div style={{ padding: "90px 28px 0", borderBottom: `1px solid rgba(212,160,23,0.2)` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: GOLD, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700 }}>Alpha Edge Research — Initiating Coverage</div>
            <h1 style={{ margin: "6px 0 2px", fontSize: 30, fontWeight: 800, fontFamily: "'Playfair Display', serif", color: "#fff" }}>
              Info Edge (India) Ltd
            </h1>
            <div style={{ fontSize: 13, color: "#94a3b8" }}>NSE: NAUKRI · BSE: 532777 · Nifty Next 50 · Nifty 500</div>
          </div>
          <div style={{ display: "flex", gap: 8, padding: "6px 14px", background: "rgba(39,174,96,0.12)", border: `1px solid ${GREEN}44`, borderRadius: 8, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>RATING</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: GREEN }}>BUY</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
          <MetricCard label="CMP" value="₹1,100" sub="Feb 2026" />
          <MetricCard label="Market Cap" value="₹70,000 Cr" sub="$8.3B" />
          <MetricCard label="FY30 Target" value="₹1,700–2,100" sub="12–17% CAGR" color={GREEN} />
          <MetricCard label="Inv. Portfolio" value="₹36,855 Cr" sub="9.3x / 36% IRR" color={TEAL} />
          <MetricCard label="Standalone OPM" value="36%" sub="FY25" color={BLUE} />
          <MetricCard label="Quality" value="6.6/10" sub="Consol (7.5 Stndl)" color={ORANGE} />
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
                { t: "Naukri = Wide Moat Monopoly", d: "~80% traffic share, 82M resumes, 72K+ clients. Winner-take-all network effects." },
                { t: "Investment Portfolio = Margin of Safety", d: "Zomato (12.4%) + PB Fintech (19%) = ₹31,500 Cr. Total: ₹36,855 Cr at 36% IRR." },
                { t: "Margin Expansion Story", d: "99acres & Jeevansathi turning cash-positive. Blended OPM: 31% → 42% by FY30." },
                { t: "Valuation Gap", d: "Strip portfolio value: core biz at ~12x operating profit vs 40-50x for comparable monopolies." },
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
          </div>
        )}

        {/* TAB 1: Porter's 5 Forces */}
        {tab === 1 && (
          <div>
            <h2 style={{ fontSize: 18, color: GOLD, marginBottom: 6, fontFamily: "'Playfair Display', serif" }}>Porter's Five Forces — Competitive Moat Analysis</h2>
            <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>Score 1–10 where 10 = strongest position (barrier high / rivalry low / power low). Naukri operates in an extremely favorable competitive structure.</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <ResponsiveContainer width="100%" height={340}>
                  <RadarChart data={porterData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="force" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fill: "#64748b", fontSize: 9 }} />
                    <Radar name="Naukri" dataKey="naukri" stroke={GREEN} fill={GREEN} fillOpacity={0.25} strokeWidth={2} />
                    <Radar name="99acres" dataKey="acres" stroke={ORANGE} fill={ORANGE} fillOpacity={0.1} strokeWidth={2} />
                    <Radar name="Jeevansathi" dataKey="jeevansathi" stroke={RED} fill={RED} fillOpacity={0.1} strokeWidth={2} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div>
                {[
                  { force: "Threat of New Entrants", n: "LOW — 82M resume moat, network effects", a: "MODERATE — Multi-homing", j: "MODERATE — Dating apps" },
                  { force: "Bargaining Power of Buyers", n: "LOW — Mission-critical, switching cost", a: "MODERATE — Builders multi-home", j: "MODERATE — Users multi-platform" },
                  { force: "Supplier Power", n: "VERY LOW — Platform, no raw materials", a: "VERY LOW", j: "VERY LOW" },
                  { force: "Threat of Substitutes", n: "LOW-MOD — LinkedIn = partial sub", a: "MODERATE — NoBroker, direct", j: "MOD-HIGH — Dating apps" },
                  { force: "Competitive Rivalry", n: "VERY LOW — Near monopoly", a: "HIGH — Housing, MagicBricks", j: "HIGH — Shaadi.com leads" },
                ].map((f, i) => (
                  <div key={i} style={{ marginBottom: 12, padding: "10px 12px", background: "rgba(255,255,255,0.02)", borderRadius: 6, borderLeft: `3px solid ${i === 0 ? GREEN : i === 4 ? RED : ORANGE}` }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>{f.force}</div>
                    <div style={{ fontSize: 11, color: GREEN }}>Naukri: {f.n}</div>
                    <div style={{ fontSize: 11, color: ORANGE }}>99acres: {f.a}</div>
                    <div style={{ fontSize: 11, color: "#e57373" }}>Jeevansathi: {f.j}</div>
                  </div>
                ))}
                <div style={{ padding: "12px 14px", background: `rgba(39,174,96,0.08)`, border: `1px solid ${GREEN}33`, borderRadius: 8, marginTop: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: GREEN }}>Conclusion: Naukri has a VERY WIDE moat</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>5 out of 5 forces favorable. Only LinkedIn poses a partial substitute threat. Operating leverage is exceptional.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Revenue Model */}
        {tab === 2 && (
          <div>
            <h2 style={{ fontSize: 18, color: GOLD, marginBottom: 6, fontFamily: "'Playfair Display', serif" }}>Bottom-Up Segment Revenue Model (₹ Cr)</h2>
            <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>Revenue projections are driver-based: Naukri = Customers × ARPU + B2C/Allied; 99acres = Builder listings + Broker subs; Others = Jeevansathi + Shiksha + Aisle.</p>

            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={segData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="yr" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="naukri" name="Naukri" stackId="a" fill={BLUE} radius={[0, 0, 0, 0]} />
                <Bar dataKey="acres" name="99acres" stackId="a" fill={TEAL} />
                <Bar dataKey="others" name="Others" stackId="a" fill={GOLD} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            <h3 style={{ fontSize: 15, color: TEAL, margin: "20px 0 10px" }}>Naukri Revenue Driver Breakdown</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${GOLD}33` }}>
                    {["Driver", "FY25", "FY26E", "FY27E", "FY28E", "FY30E"].map(h => (
                      <th key={h} style={{ padding: "8px 10px", textAlign: h === "Driver" ? "left" : "right", color: GOLD, fontWeight: 700 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["B2B Customers (K)", "72.1", "79", "86", "95", "115"],
                    ["ARPU (₹K/yr)", "28.5", "30.0", "31.5", "33.5", "37.0"],
                    ["B2B Revenue (₹Cr)", "2,055", "2,370", "2,709", "3,183", "4,255"],
                    ["B2C + Allied (₹Cr)", "450", "530", "620", "740", "1,000"],
                    ["TOTAL NAUKRI (₹Cr)", "2,505", "2,900", "3,329", "3,923", "5,255"],
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

            <h3 style={{ fontSize: 15, color: TEAL, margin: "20px 0 10px" }}>Segment Margin Trajectory</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${GOLD}33` }}>
                    {["Segment", "FY24", "FY25", "FY26E", "FY27E", "FY28E", "FY30E"].map(h => (
                      <th key={h} style={{ padding: "8px 10px", textAlign: h === "Segment" ? "left" : "right", color: GOLD, fontWeight: 700 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Naukri OPM", "47%", "48%", "49%", "50%", "50%", "51%"],
                    ["99acres OPM", "-8%", "5%", "8%", "12%", "15%", "20%"],
                    ["Others OPM", "-15%", "2%", "5%", "8%", "10%", "15%"],
                    ["Blended OPM", "34%", "36%", "38%", "39%", "40%", "42%"],
                  ].map((row, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: i === 3 ? "rgba(46,117,182,0.08)" : "transparent" }}>
                      {row.map((cell, j) => {
                        const isNeg = cell.includes("-");
                        return <td key={j} style={{ padding: "7px 10px", textAlign: j === 0 ? "left" : "right", fontWeight: i === 3 || j === 0 ? 700 : 400, color: isNeg ? RED : i === 3 ? BLUE : "#e2e8f0" }}>{cell}</td>;
                      })}
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
            <h2 style={{ fontSize: 18, color: GOLD, marginBottom: 6, fontFamily: "'Playfair Display', serif" }}>Free Cash Flow to Firm (FCFF) — 10yr Historical + 5yr Forecast</h2>
            <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>FCFF = CFO − Capex. Shaded bars = projections. Info Edge generates massive FCF due to minimal capex needs.</p>

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
            <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>Consolidated CFO/PAT is noisy due to investment gains/losses. Projected values use standalone operating PAT (ex-investment income). Healthy range: 80–120%.</p>

            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={cfoPat.filter(d => d.cfoPatClean !== null)}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="yr" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis domain={[0, 150]} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={100} stroke={GOLD} strokeDasharray="5 5" label={{ value: "100%", fill: GOLD, fontSize: 10 }} />
                <Bar dataKey="cfoPatClean" name="CFO/PAT %" fill={TEAL} radius={[3, 3, 0, 0]}>
                  {cfoPat.filter(d => d.cfoPatClean !== null).map((d, i) => <Cell key={i} fill={d.type === "P" ? `${TEAL}88` : TEAL} />)}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
            <div style={{ fontSize: 11, color: "#64748b", fontStyle: "italic", marginTop: 8 }}>Note: FY17, FY20, FY23 excluded (negative PAT). FY22 excluded (₹12,882 Cr PAT from Zomato IPO). Projected CFO/PAT based on standalone operating metrics.</div>
          </div>
        )}

        {/* TAB 4: OPM & ROCE */}
        {tab === 4 && (
          <div>
            <h2 style={{ fontSize: 18, color: GOLD, marginBottom: 6, fontFamily: "'Playfair Display', serif" }}>Operating Profit Margin — 10yr Historical + 5yr Forecast</h2>
            <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>Consolidated OPM includes subsidiaries' losses. Margin expansion driven by 99acres & Jeevansathi turning profitable.</p>

            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={finData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="yr" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis domain={[-30, 50]} tick={{ fill: "#94a3b8", fontSize: 11 }} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <ReferenceLine y={0} stroke="#fff" strokeOpacity={0.2} />
                <Area dataKey="opm" name="OPM %" fill={BLUE} fillOpacity={0.15} stroke={BLUE} strokeWidth={2.5} dot={{ r: 4, fill: BLUE }}>
                </Area>
              </ComposedChart>
            </ResponsiveContainer>

            <h2 style={{ fontSize: 18, color: GOLD, margin: "28px 0 6px", fontFamily: "'Playfair Display', serif" }}>ROCE — Consolidated vs Standalone Operating</h2>
            <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>Consolidated ROCE is depressed by ₹37,000+ Cr in investment assets in the denominator. Standalone operating ROCE (projected) reflects true business quality.</p>

            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={finData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="yr" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis domain={[-20, 50]} tick={{ fill: "#94a3b8", fontSize: 11 }} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <ReferenceLine y={0} stroke="#fff" strokeOpacity={0.2} />
                <Bar dataKey="roce" name="Consol ROCE %" fill={ORANGE} opacity={0.6} radius={[3, 3, 0, 0]} />
                <Line dataKey="stndlRoce" name="Stndl Op. ROCE % (est.)" stroke={GREEN} strokeWidth={2.5} dot={{ r: 4, fill: GREEN }} connectNulls={false} />
              </ComposedChart>
            </ResponsiveContainer>
            <div style={{ marginTop: 10, padding: "10px 14px", background: "rgba(212,160,23,0.06)", borderRadius: 6, border: `1px solid ${GOLD}22` }}>
              <span style={{ fontSize: 12, color: GOLD, fontWeight: 700 }}>Model Note: </span>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>Consol ROCE is structurally depressed (~3-4%) because capital employed includes ₹37,000+ Cr in investment portfolio. Standalone operating ROCE (excluding investments) is estimated at 35-45% — reflecting Naukri's asset-light monopoly economics. Projected standalone ROCE improves as 99acres & Jeevansathi contribute positive returns on capital.</span>
            </div>
          </div>
        )}

        {/* TAB 5: Quality Score */}
        {tab === 5 && (
          <div>
            <h2 style={{ fontSize: 18, color: GOLD, marginBottom: 6, fontFamily: "'Playfair Display', serif" }}>Quality Scorecard — 8 Parameter Analysis</h2>
            <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>Financial metrics assessed on standalone basis to reflect true operating quality. Investment portfolio assessed separately as bonus/risk factor.</p>

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
                  <div style={{ fontSize: 14, fontWeight: 800, color: GOLD }}>Overall: 6.6/10 (Consolidated)</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: GREEN, marginTop: 2 }}>Standalone Operating: 7.5/10</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>Key Insight: Quality score is depressed by investment portfolio's impact on consolidated metrics (volatile EPS, low reported ROCE). On standalone operating basis, this is a wide-moat platform monopoly with 36% OPM and 15% revenue CAGR.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: Sensitivity */}
        {tab === 6 && (
          <div>
            <h2 style={{ fontSize: 18, color: GOLD, marginBottom: 6, fontFamily: "'Playfair Display', serif" }}>FY30 Sensitivity Analysis — Earnings × P/E Matrix</h2>
            <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>Operating EPS (ex-investment income) × Operating Business P/E. Portfolio value adds separately. CMP: ₹1,100.</p>

            <div style={{ overflowX: "auto", marginBottom: 24 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr>
                    <th style={{ padding: "10px 14px", textAlign: "left", color: GOLD, fontWeight: 700, borderBottom: `2px solid ${GOLD}44` }}>Op EPS ↓ / P/E →</th>
                    {["30x (De-rate)", "40x (Base)", "50x (Re-rate)", "60x (Premium)"].map(h => (
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
                        {[row.pe30, row.pe40, row.pe50, row.pe60].map((val, j) => {
                          const upside = ((val - 1100) / 1100 * 100).toFixed(0);
                          const isAbove = val > 1100;
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
                { label: "BEAR (De-Rate)", color: RED, rev: "₹5,700 Cr", opm: "36%", eps: "₹23.5", pe: "30–40x", target: "₹705–940", desc: "Hiring slows to 12% CAGR. Margins stagnate. Market de-rates platform businesses." },
                { label: "BASE CASE", color: BLUE, rev: "₹6,850 Cr", opm: "42%", eps: "₹32.8", pe: "40–50x", target: "₹1,312–1,640", desc: "16% CAGR driven by Naukri + 99acres scaling. OPM expands to 42%. Reasonable multiple." },
                { label: "BULL (Re-Rate)", color: GREEN, rev: "₹8,200 Cr", opm: "45%", eps: "₹42.1", pe: "50–60x", target: "₹2,105–2,526", desc: "20% CAGR. All segments fire. Market re-rates as monopoly quality is recognized." },
              ].map((s, i) => (
                <div key={i} style={{ padding: 14, background: "rgba(255,255,255,0.02)", borderRadius: 8, borderTop: `3px solid ${s.color}` }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: s.color, marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.6 }}>
                    <div>FY30 Rev: <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{s.rev}</span></div>
                    <div>OPM: <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{s.opm}</span></div>
                    <div>Op EPS: <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{s.eps}</span></div>
                    <div>P/E Range: <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{s.pe}</span></div>
                    <div>Target: <span style={{ color: s.color, fontWeight: 700 }}>{s.target}</span></div>
                  </div>
                  <div style={{ fontSize: 10, color: "#64748b", marginTop: 8, lineHeight: 1.4 }}>{s.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 20, padding: "14px 18px", background: "rgba(39,174,96,0.06)", border: `1px solid ${GREEN}33`, borderRadius: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: GREEN }}>Base Case FY30 Target: ₹1,700–2,100 (12–17% CAGR from ₹1,100)</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>Assumes 16% revenue CAGR, OPM expansion to 42%, 50–60x operating P/E. Investment portfolio (₹36,855 Cr) provides additional margin of safety. Permanent capital loss risk &lt;10% given Naukri's monopoly + cash reserves + portfolio floor.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}