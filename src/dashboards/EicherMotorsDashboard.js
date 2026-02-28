import { useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ComposedChart, Area, Cell, ReferenceLine
} from "recharts";

// ── Design Tokens ─────────────────────────────────────────────────────────────
const NAVY  = "#0D1B2A";
const BLUE  = "#2E75B6";
const TEAL  = "#0E7C7B";
const GREEN = "#27AE60";
const RED   = "#C0392B";
const ORANGE= "#E67E22";
const GOLD  = "#D4A017";

const tabs = ["Overview","Porter's 5 Forces","Revenue Model","FCFF & CFO/PAT","OPM & ROCE","Quality Score","Sensitivity"];

// ── Financial Data (Historical FY16–FY25 + Projected FY26E–FY30E) ─────────────
const finData = [
  { yr:"FY16", rev:6173,  opm:27, opProfit:1667, cfo:1463, pat:1338, capex:280,  dep:220, fcff:1183, cfoPatPct:109, roce:51, type:"H" },
  { yr:"FY17", rev:7033,  opm:31, opProfit:2180, cfo:1708, pat:1667, capex:280,  dep:250, fcff:1428, cfoPatPct:102, roce:53, type:"H" },
  { yr:"FY18", rev:8965,  opm:31, opProfit:2779, cfo:2482, pat:1960, capex:660,  dep:290, fcff:1822, cfoPatPct:127, roce:49, type:"H" },
  { yr:"FY19", rev:9797,  opm:30, opProfit:2939, cfo:1575, pat:2203, capex:523,  dep:320, fcff:1052, cfoPatPct:72,  roce:41, type:"H" },
  { yr:"FY20", rev:9154,  opm:24, opProfit:2197, cfo:1694, pat:1827, capex:350,  dep:350, fcff:1344, cfoPatPct:93,  roce:25, type:"H" },
  { yr:"FY21", rev:8720,  opm:20, opProfit:1744, cfo:1691, pat:1347, capex:350,  dep:380, fcff:1341, cfoPatPct:126, roce:17, type:"H" },
  { yr:"FY22", rev:10298, opm:21, opProfit:2163, cfo:1527, pat:1677, capex:440,  dep:400, fcff:1087, cfoPatPct:91,  roce:18, type:"H" },
  { yr:"FY23", rev:14442, opm:24, opProfit:3466, cfo:2823, pat:2914, capex:570,  dep:440, fcff:2253, cfoPatPct:97,  roce:27, type:"H" },
  { yr:"FY24", rev:16536, opm:26, opProfit:4299, cfo:3724, pat:4001, capex:700,  dep:480, fcff:3024, cfoPatPct:93,  roce:31, type:"H" },
  { yr:"FY25", rev:18870, opm:25, opProfit:4718, cfo:3980, pat:4734, capex:800,  dep:520, fcff:3180, cfoPatPct:84,  roce:30, type:"H" },
  { yr:"FY26E",rev:22800, opm:25, opProfit:5700, cfo:4800, pat:5600, capex:1200, dep:580, fcff:3600, cfoPatPct:86,  roce:31, type:"P" },
  { yr:"FY27E",rev:26400, opm:26, opProfit:6864, cfo:5700, pat:6600, capex:1000, dep:640, fcff:4700, cfoPatPct:86,  roce:32, type:"P" },
  { yr:"FY28E",rev:30400, opm:27, opProfit:8208, cfo:6800, pat:7800, capex:900,  dep:700, fcff:5900, cfoPatPct:87,  roce:33, type:"P" },
  { yr:"FY29E",rev:34800, opm:27, opProfit:9396, cfo:8100, pat:9200, capex:850,  dep:760, fcff:7250, cfoPatPct:88,  roce:33, type:"P" },
  { yr:"FY30E",rev:39500, opm:28, opProfit:11060,cfo:9500, pat:10800,capex:850,  dep:820, fcff:8650, cfoPatPct:88,  roce:34, type:"P" },
];

// ── Segment Revenue ────────────────────────────────────────────────────────────
const segData = [
  { yr:"FY22", re_dom:7800,  re_intl:1100, vecv:1200, others:198 },
  { yr:"FY23", re_dom:10200, re_intl:1800, vecv:2200, others:242 },
  { yr:"FY24", re_dom:11500, re_intl:2100, vecv:2700, others:236 },
  { yr:"FY25", re_dom:13000, re_intl:2600, vecv:3000, others:270 },
  { yr:"FY26E",re_dom:15800, re_intl:3200, vecv:3500, others:300 },
  { yr:"FY27E",re_dom:18200, re_intl:3900, vecv:4000, others:300 },
  { yr:"FY28E",re_dom:21000, re_intl:4600, vecv:4500, others:300 },
  { yr:"FY29E",re_dom:24000, re_intl:5300, vecv:5200, others:300 },
  { yr:"FY30E",re_dom:27200, re_intl:6200, vecv:5800, others:300 },
];

// ── Porter's 5 Forces ─────────────────────────────────────────────────────────
const porterData = [
  { force:"New Entrants",   re:8, vecv:5 },
  { force:"Buyer Power",    re:7, vecv:5 },
  { force:"Supplier Power", re:6, vecv:6 },
  { force:"Substitutes",    re:6, vecv:5 },
  { force:"Rivalry",        re:7, vecv:4 },
];

// ── Quality Scorecard ─────────────────────────────────────────────────────────
const qualityData = [
  { param:"Longevity",       score:10, full:"125yr brand, 43yr listed, zero loss years" },
  { param:"Predictable CF",  score:9,  full:"Neg WC, daily cash sales, 19% 5Y CFO CAGR" },
  { param:"ROCE",            score:9,  full:"30% avg, 2.5× WACC; peaks at 53% (FY17)" },
  { param:"Rev Resilience",  score:8,  full:"16% 5Y CAGR; only 2 dips (FY20, FY21 COVID)" },
  { param:"EPS Stability",   score:8,  full:"29% 5Y CAGR; 1 dip (FY21), swift recovery" },
  { param:"CFO/PAT",         score:9,  full:"~98% avg conversion; FY18 peak at 127%" },
  { param:"Margins",         score:9,  full:"25% NPM, 25% OPM — extraordinary for auto" },
  { param:"Reinvestment",    score:8,  full:"59% retained, ₹14,791 Cr investment portfolio" },
];
const radarQuality = qualityData.map(d => ({ ...d, fullMark: 10 }));

// ── Sensitivity Matrix ────────────────────────────────────────────────────────
// CMP: ₹7,800 | FY30 EPS scenarios × P/E range
const sensMatrix = [
  { eps:"Bear ₹320",  pe30:9600,  pe35:11200, pe40:12800, pe45:14400 },
  { eps:"Base ₹394",  pe30:11820, pe35:13790, pe40:15760, pe45:17730 },
  { eps:"Bull ₹480",  pe30:14400, pe35:16800, pe40:19200, pe45:21600 },
];

// ── Shared Components ─────────────────────────────────────────────────────────
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

function ScoreBar({ label, score, maxScore = 10 }) {
  const pct = (score / maxScore) * 100;
  const barColor = score >= 9 ? GREEN : score >= 7 ? ORANGE : RED;
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

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function EicherMotorsDashboard() {
  const [tab, setTab] = useState(0);

  return (
    <div style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #0a1628 100%)`, minHeight: "100vh", color: "#e2e8f0", fontFamily: "'DM Sans', sans-serif" }}>

      {/* Back Button */}
      <Link
        to="/"
        style={{
          position: "fixed", top: "20px", left: "28px", zIndex: 10000,
          color: GOLD, textDecoration: "none", fontWeight: 700,
          background: "rgba(13,27,42,0.95)", padding: "8px 18px",
          borderRadius: 8, fontSize: 13, boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
        }}
      >
        ← Back to Alpha Edge Home
      </Link>

      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />

      {/* ── Header ── */}
      <div style={{ padding: "90px 28px 0", borderBottom: `1px solid rgba(212,160,23,0.2)` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: GOLD, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700 }}>Alpha Edge Research — Initiating Coverage</div>
            <h1 style={{ margin: "6px 0 2px", fontSize: 30, fontWeight: 800, fontFamily: "'Playfair Display', serif", color: "#fff" }}>
              Eicher Motors Ltd
            </h1>
            <div style={{ fontSize: 13, color: "#94a3b8" }}>NSE: EICHERMOT · Royal Enfield + VECV · Nifty 100</div>
          </div>
          <div style={{ display: "flex", gap: 8, padding: "6px 14px", background: "rgba(39,174,96,0.12)", border: `1px solid ${GREEN}44`, borderRadius: 8, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>RATING</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: GREEN }}>BUY</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
          <MetricCard label="CMP"            value="₹7,800"        sub="Feb 2026" />
          <MetricCard label="Market Cap"     value="₹2.13L Cr"     sub="$25.4B" />
          <MetricCard label="FY30 Target"    value="₹12,500–15,000" sub="14–16% CAGR" color={GREEN} />
          <MetricCard label="FY25 Revenue"   value="₹18,870 Cr"    sub="3Y CAGR 22%" color={TEAL} />
          <MetricCard label="OPM"            value="25%"            sub="FY25; 10Y avg 26%" color={BLUE} />
          <MetricCard label="Quality"        value="8.9/10"         sub="Exceptional Compounder" color={ORANGE} />
        </div>

        <div style={{ display: "flex", gap: 0, marginTop: 16, overflowX: "auto" }}>
          {tabs.map((t, i) => <TabButton key={i} label={t} active={tab === i} onClick={() => setTab(i)} />)}
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div style={{ padding: "20px 28px 40px" }}>

        {/* ════════════════ TAB 0 — OVERVIEW ════════════════ */}
        {tab === 0 && (
          <div>
            <h2 style={{ fontSize: 18, color: GOLD, marginBottom: 12, fontFamily: "'Playfair Display', serif" }}>Investment Thesis</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[
                { t: "Royal Enfield = Cultural Monopoly",      d: "Dominant 250–750cc segment with ~90% market share. 125yr heritage brand that sells aspiration, not just motorcycles. 870K units FY25 with pricing power intact." },
                { t: "Exceptional Economics",                  d: "25% NPM, 30% ROCE, near-zero debt, ₹14,791 Cr investment portfolio. CFO/PAT averaged 98% over 9 years — rare for any manufacturing co." },
                { t: "Structural Growth Runway",               d: "International expansion (exports up 136% in 3 years), mid-size EV entry, new platforms (Guerrilla 450, Bear 650). TAM expanding globally." },
                { t: "Valuation Comfort at Current Levels",    d: "At ₹7,800, trades at ~29x FY26E EPS. Historical average 30–40x for a brand monopoly with 25%+ margins. Significant re-rating potential by FY30." },
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

        {/* ════════════════ TAB 1 — PORTER'S 5 FORCES ════════════════ */}
        {tab === 1 && (
          <div>
            <h2 style={{ fontSize: 18, color: GOLD, marginBottom: 6, fontFamily: "'Playfair Display', serif" }}>Porter's Five Forces — Competitive Moat Analysis</h2>
            <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>Score 1–10 where 10 = strongest position. Royal Enfield operates in a structurally advantaged niche with cultural barriers that transcend traditional moat metrics.</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <ResponsiveContainer width="100%" height={340}>
                  <RadarChart data={porterData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="force" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fill: "#64748b", fontSize: 9 }} />
                    <Radar name="Royal Enfield" dataKey="re"   stroke={GREEN}  fill={GREEN}  fillOpacity={0.25} strokeWidth={2} />
                    <Radar name="VECV"          dataKey="vecv" stroke={ORANGE} fill={ORANGE} fillOpacity={0.1}  strokeWidth={2} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div>
                {[
                  {
                    force: "Threat of New Entrants",
                    re:   "LOW — 125yr brand, 4000+ dealer network, RE community moat",
                    vecv: "MOD — Volvo JV provides tech/brand advantage",
                    color: GREEN,
                  },
                  {
                    force: "Bargaining Power of Buyers",
                    re:   "LOW-MOD — Aspirational purchase, loyal community, limited alternatives",
                    vecv: "MODERATE — Fleet buyers have some negotiating power",
                    color: TEAL,
                  },
                  {
                    force: "Bargaining Power of Suppliers",
                    re:   "MODERATE — Auto components sector; RE manages via in-housing key parts",
                    vecv: "MODERATE — Similar supplier dynamics",
                    color: ORANGE,
                  },
                  {
                    force: "Threat of Substitutes",
                    re:   "LOW-MOD — Harley/Triumph at 2× price; Bajaj Dominar/Honda CB is partial",
                    vecv: "MODERATE — Tata, Ashok Leyland competition",
                    color: ORANGE,
                  },
                  {
                    force: "Competitive Rivalry",
                    re:   "LOW — ~90% share in 250–750cc. Honda/Bajaj entering but brand gap is wide",
                    vecv: "HIGH — Competitive CV market; differentiated via Volvo tech",
                    color: GREEN,
                  },
                ].map((f, i) => (
                  <div key={i} style={{ marginBottom: 12, padding: "10px 12px", background: "rgba(255,255,255,0.02)", borderRadius: 6, borderLeft: `3px solid ${f.color}` }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>{f.force}</div>
                    <div style={{ fontSize: 11, color: GREEN  }}>Royal Enfield: {f.re}</div>
                    <div style={{ fontSize: 11, color: ORANGE }}>VECV: {f.vecv}</div>
                  </div>
                ))}
                <div style={{ padding: "12px 14px", background: `rgba(39,174,96,0.08)`, border: `1px solid ${GREEN}33`, borderRadius: 8, marginTop: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: GREEN }}>Conclusion: Royal Enfield has a WIDE Cultural Moat</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>4 of 5 forces favorable for RE. Cultural brand loyalty creates switching costs that are psychological, not financial — arguably the strongest kind. VECV benefits from Volvo JV differentiating it in the CV space.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════ TAB 2 — REVENUE MODEL ════════════════ */}
        {tab === 2 && (
          <div>
            <h2 style={{ fontSize: 18, color: GOLD, marginBottom: 6, fontFamily: "'Playfair Display', serif" }}>Bottom-Up Segment Revenue Model (₹ Cr)</h2>
            <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>Revenue projections are driver-based: RE Domestic = Volume × ASP; RE International = Exports + CKD; VECV = Commercial Vehicle revenue; Others = Royalties + Parts + Accessories.</p>

            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={segData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="yr" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="re_dom"  name="RE Domestic"    stackId="a" fill={BLUE}   />
                <Bar dataKey="re_intl" name="RE International" stackId="a" fill={TEAL}  />
                <Bar dataKey="vecv"    name="VECV"            stackId="a" fill={ORANGE} />
                <Bar dataKey="others"  name="Others"          stackId="a" fill={GOLD}   radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            <h3 style={{ fontSize: 15, color: TEAL, margin: "20px 0 10px" }}>Royal Enfield Revenue Driver Breakdown</h3>
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
                    ["RE Dom. Volumes (K units)", "870",    "980",    "1,100",  "1,250",  "1,600" ],
                    ["RE Avg. Selling Price (₹K)", "185",   "195",    "200",    "205",    "215"   ],
                    ["RE Dom. Revenue (₹Cr)",     "13,000", "15,800", "18,200", "21,000", "27,200"],
                    ["RE Intl. Revenue (₹Cr)",    "2,600",  "3,200",  "3,900",  "4,600",  "6,200" ],
                    ["VECV Revenue (₹Cr)",         "3,000",  "3,500",  "4,000",  "4,500",  "5,800" ],
                    ["TOTAL REVENUE (₹Cr)",        "18,870", "22,800", "26,400", "30,400", "39,500"],
                  ].map((row, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: i === 5 ? "rgba(46,117,182,0.08)" : "transparent" }}>
                      {row.map((cell, j) => (
                        <td key={j} style={{ padding: "7px 10px", textAlign: j === 0 ? "left" : "right", fontWeight: i === 5 || j === 0 ? 700 : 400, color: i === 5 ? BLUE : "#e2e8f0" }}>{cell}</td>
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
                    ["RE Domestic OPM",   "32%", "31%", "31%", "32%", "33%", "35%"],
                    ["RE International OPM", "22%", "24%", "25%", "26%", "27%", "30%"],
                    ["VECV OPM",          "8%",  "8%",  "8%",  "9%",  "9%",  "10%"],
                    ["Blended OPM",       "26%", "25%", "25%", "26%", "27%", "28%"],
                  ].map((row, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: i === 3 ? "rgba(46,117,182,0.08)" : "transparent" }}>
                      {row.map((cell, j) => (
                        <td key={j} style={{ padding: "7px 10px", textAlign: j === 0 ? "left" : "right", fontWeight: i === 3 || j === 0 ? 700 : 400, color: i === 3 ? BLUE : "#e2e8f0" }}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════════════════ TAB 3 — FCFF & CFO/PAT ════════════════ */}
        {tab === 3 && (
          <div>
            <h2 style={{ fontSize: 18, color: GOLD, marginBottom: 6, fontFamily: "'Playfair Display', serif" }}>Free Cash Flow to Firm (FCFF) — 10yr Historical + 5yr Forecast</h2>
            <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>FCFF = CFO − Capex. Eicher generates strong FCF despite elevated capex phase (FY26E: ₹1,200 Cr for new platforms + capacity). Shaded bars = projections.</p>

            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={finData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="yr" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="cfo"   name="CFO (₹Cr)"   fill={BLUE} opacity={0.6} radius={[3, 3, 0, 0]}>
                  {finData.map((d, i) => <Cell key={i} fill={d.type === "P" ? `${BLUE}66` : BLUE} />)}
                </Bar>
                <Bar dataKey="capex" name="Capex (₹Cr)"  fill={RED}  opacity={0.5}>
                  {finData.map((d, i) => <Cell key={i} fill={d.type === "P" ? `${RED}66` : RED} />)}
                </Bar>
                <Line dataKey="fcff" name="FCFF (₹Cr)" stroke={GREEN} strokeWidth={2.5} dot={{ r: 4, fill: GREEN }} />
              </ComposedChart>
            </ResponsiveContainer>

            <h2 style={{ fontSize: 18, color: GOLD, margin: "28px 0 6px", fontFamily: "'Playfair Display', serif" }}>CFO / PAT Ratio</h2>
            <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>Eicher's CFO/PAT averaged ~98% across 9 years — an exceptional hallmark of quality manufacturing. This means virtually every rupee of accounting profit converts to real operating cash. Healthy range: 80–120%.</p>

            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={finData.filter(d => d.cfoPatPct > 0 && d.cfoPatPct < 200)}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="yr" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis domain={[0, 150]} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={100} stroke={GOLD} strokeDasharray="5 5" label={{ value: "100%", fill: GOLD, fontSize: 10 }} />
                <Bar dataKey="cfoPatPct" name="CFO/PAT %" fill={TEAL} radius={[3, 3, 0, 0]}>
                  {finData.filter(d => d.cfoPatPct > 0 && d.cfoPatPct < 200).map((d, i) => (
                    <Cell key={i} fill={d.type === "P" ? `${TEAL}88` : TEAL} />
                  ))}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
            <div style={{ fontSize: 11, color: "#64748b", fontStyle: "italic", marginTop: 8 }}>Note: 10-year average CFO/PAT ~98%. FY19 dip (72%) due to working capital build-up in high-growth year. Projections use operating cash flows.</div>
          </div>
        )}

        {/* ════════════════ TAB 4 — OPM & ROCE ════════════════ */}
        {tab === 4 && (
          <div>
            <h2 style={{ fontSize: 18, color: GOLD, marginBottom: 6, fontFamily: "'Playfair Display', serif" }}>Operating Profit Margin — 10yr Historical + 5yr Forecast</h2>
            <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>OPM averaged 25–27% over 10 years — extraordinary for an Indian auto manufacturer. COVID dip (FY20–21) recovered swiftly. Margin stability driven by brand pricing power and operating leverage on RE's platform.</p>

            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={finData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="yr" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis domain={[0, 40]} tick={{ fill: "#94a3b8", fontSize: 11 }} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <ReferenceLine y={0} stroke="#fff" strokeOpacity={0.2} />
                <Area dataKey="opm" name="OPM %" fill={BLUE} fillOpacity={0.15} stroke={BLUE} strokeWidth={2.5} dot={{ r: 4, fill: BLUE }} />
              </ComposedChart>
            </ResponsiveContainer>

            <h2 style={{ fontSize: 18, color: GOLD, margin: "28px 0 6px", fontFamily: "'Playfair Display', serif" }}>ROCE — Return on Capital Employed (%)</h2>
            <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>ROCE averaged ~30% over 10 years, peaking at 53% (FY17). Even at the COVID trough (17% FY21), it remained above WACC (~12%). Unlike Info Edge, Eicher's ROCE is clean — no investment portfolio distortion. This is the true return on operating capital.</p>

            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={finData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="yr" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis domain={[0, 60]} tick={{ fill: "#94a3b8", fontSize: 11 }} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <ReferenceLine y={12} stroke={RED} strokeDasharray="4 4" label={{ value: "WACC ~12%", fill: RED, fontSize: 10 }} />
                <Bar dataKey="roce" name="ROCE %" fill={ORANGE} opacity={0.7} radius={[3, 3, 0, 0]}>
                  {finData.map((d, i) => <Cell key={i} fill={d.type === "P" ? `${ORANGE}77` : d.roce >= 30 ? GREEN : d.roce >= 20 ? ORANGE : BLUE} />)}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
            <div style={{ marginTop: 10, padding: "10px 14px", background: "rgba(212,160,23,0.06)", borderRadius: 6, border: `1px solid ${GOLD}22` }}>
              <span style={{ fontSize: 12, color: GOLD, fontWeight: 700 }}>Model Note: </span>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>ROCE is reported on a clean basis — no investment portfolio in capital employed denominator. Eicher holds ₹14,791 Cr in investments but these are clearly separated. Core business ROCE of 30% reflects genuine operating excellence: premium pricing, negative working capital, and minimal maintenance capex needs.</span>
            </div>
          </div>
        )}

        {/* ════════════════ TAB 5 — QUALITY SCORE ════════════════ */}
        {tab === 5 && (
          <div>
            <h2 style={{ fontSize: 18, color: GOLD, marginBottom: 6, fontFamily: "'Playfair Display', serif" }}>Quality Scorecard — 8 Parameter Analysis</h2>
            <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>Eicher scores exceptionally across all 8 quality dimensions. Unlike Info Edge, there is no consolidated/standalone split — what you see is what you get: a clean, high-quality compounder with 125 years of operating history.</p>

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
                  <div style={{ fontSize: 14, fontWeight: 800, color: GREEN }}>Overall: 8.9/10 — Exceptional Compounder</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>Key Insight: Eicher is a rare Indian business that scores above 8 in every single quality dimension. The combination of brand monopoly, negative working capital, 30% ROCE, near-zero debt, and growing international presence makes it among the highest-quality compounders in the Indian market.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════ TAB 6 — SENSITIVITY ════════════════ */}
        {tab === 6 && (
          <div>
            <h2 style={{ fontSize: 18, color: GOLD, marginBottom: 6, fontFamily: "'Playfair Display', serif" }}>FY30 Sensitivity Analysis — EPS × P/E Matrix</h2>
            <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>FY30 EPS projections × fair P/E range for a brand-monopoly auto company. CMP: ₹7,800.</p>

            <div style={{ overflowX: "auto", marginBottom: 24 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr>
                    <th style={{ padding: "10px 14px", textAlign: "left", color: GOLD, fontWeight: 700, borderBottom: `2px solid ${GOLD}44` }}>EPS ↓ / P/E →</th>
                    {["30x (De-rate)", "35x (Base Low)", "40x (Base High)", "45x (Re-rate)"].map(h => (
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
                        {[row.pe30, row.pe35, row.pe40, row.pe45].map((val, j) => {
                          const upside  = ((val - 7800) / 7800 * 100).toFixed(0);
                          const isAbove = val > 7800;
                          return (
                            <td key={j} style={{ padding: "10px 14px", textAlign: "center", fontWeight: (i === 1 && j >= 1) || (i === 2) ? 700 : 400 }}>
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
                { label: "BEAR (De-Rate)",  color: RED,   rev: "₹31,000 Cr", opm: "22%", eps: "₹320", pe: "30–35x", target: "₹9,600–11,200", desc: "Volume growth stalls at 12% CAGR. EV disruption damages ICE margins. Market de-rates auto businesses broadly." },
                { label: "BASE CASE",       color: BLUE,  rev: "₹39,500 Cr", opm: "28%", eps: "₹394", pe: "35–40x", target: "₹13,790–15,760", desc: "16% CAGR. RE Domestic + International both compound steadily. OPM sustains at 27–28%. Premium brand multiple retained." },
                { label: "BULL (Re-Rate)",  color: GREEN, rev: "₹48,000 Cr", opm: "30%", eps: "₹480", pe: "40–45x", target: "₹19,200–21,600", desc: "20%+ CAGR. EV launch wins market, international reach doubles, 650cc platform dominates globally. Re-rating to tech-like multiples." },
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
              <div style={{ fontSize: 14, fontWeight: 800, color: GREEN }}>Base Case FY30 Target: ₹12,500–15,000 (59–84% upside, 14–16% CAGR from ₹7,800)</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>Assumes 16% revenue CAGR, OPM sustains at 27–28%, P/E re-rates to 35–40x as international and EV optionality is priced in. ₹14,791 Cr clean balance sheet provides downside protection. Permanent capital loss risk &lt;5% given brand strength + near-zero debt.</div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}