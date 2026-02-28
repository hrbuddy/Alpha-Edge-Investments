import { useState } from "react";
import { Link } from "react-router-dom";
import { LineChart, Line, BarChart, Bar, ComposedChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell } from "recharts";

const COLORS = { navy: "#0D1B2A", blue: "#2E75B6", teal: "#0E7C7B", green: "#27AE60", red: "#C0392B", orange: "#E67E22", purple: "#8E44AD", gold: "#F39C12", gray: "#95A5A6" };

// ===== DATA =====
const years = ["FY16","FY17","FY18","FY19","FY20","FY21","FY22","FY23","FY24","FY25","FY26E","FY27E","FY28E","FY29E","FY30E"];
const isF = (y) => y.includes("E");

const revenueData = years.map((y,i) => ({
  year: y,
  value: [6173,7033,8965,9797,9154,8720,10298,14442,16536,18870,22800,26400,30400,34800,39500][i],
  forecast: isF(y)
}));

const epsData = years.map((y,i) => ({
  year: y,
  value: [49.3,61.3,71.9,80.8,66.9,49.3,61.3,106.6,146.1,172.7,204,241,285,336,394][i],
  forecast: isF(y)
}));

const roceData = years.map((y,i) => ({
  year: y,
  value: [51,53,49,41,25,17,18,27,31,30,31,32,33,33,34][i],
  forecast: isF(y)
}));

const cfoPatData = [
  {year:"FY16",cfo:1463,pat:1338,ratio:109},
  {year:"FY17",cfo:1708,pat:1667,ratio:102},
  {year:"FY18",cfo:2482,pat:1960,ratio:127},
  {year:"FY19",cfo:1575,pat:2203,ratio:72},
  {year:"FY20",cfo:1694,pat:1827,ratio:93},
  {year:"FY21",cfo:1691,pat:1347,ratio:126},
  {year:"FY22",cfo:1527,pat:1677,ratio:91},
  {year:"FY23",cfo:2823,pat:2914,ratio:97},
  {year:"FY24",cfo:3724,pat:4001,ratio:93},
  {year:"FY25",cfo:3980,pat:4734,ratio:84},
  {year:"FY26E",cfo:4800,pat:5600,ratio:86},
  {year:"FY27E",cfo:5700,pat:6600,ratio:86},
  {year:"FY28E",cfo:6800,pat:7800,ratio:87},
  {year:"FY29E",cfo:8100,pat:9200,ratio:88},
  {year:"FY30E",cfo:9500,pat:10800,ratio:88},
];

const marginData = years.map((y,i) => ({
  year: y,
  opm: [27,31,31,30,24,20,21,24,26,25,25,26,27,27,28][i],
  npm: [22,24,22,22,20,15,16,20,24,25,25,25,26,26,27][i],
  forecast: isF(y)
}));

const reinvestData = [
  {year:"FY17",divPayout:16,retained:84,capex:280,investments:4987},
  {year:"FY18",divPayout:15,retained:85,capex:660,investments:5581},
  {year:"FY19",divPayout:15,retained:85,capex:523,investments:4923},
  {year:"FY20",divPayout:19,retained:81,capex:350,investments:5749},
  {year:"FY21",divPayout:34,retained:66,capex:350,investments:3902},
  {year:"FY22",divPayout:34,retained:66,capex:440,investments:7721},
  {year:"FY23",divPayout:35,retained:65,capex:570,investments:12321},
  {year:"FY24",divPayout:35,retained:65,capex:700,investments:13527},
  {year:"FY25",divPayout:41,retained:59,capex:800,investments:14791},
  {year:"FY26E",divPayout:40,retained:60,capex:1200,investments:16500},
  {year:"FY27E",divPayout:40,retained:60,capex:1000,investments:19000},
  {year:"FY28E",divPayout:38,retained:62,capex:900,investments:22000},
  {year:"FY29E",divPayout:38,retained:62,capex:850,investments:25500},
  {year:"FY30E",divPayout:38,retained:62,capex:850,investments:29500},
];

const cashFlowData = years.map((y,i) => ({
  year: y,
  cfo: [1463,1708,2482,1575,1694,1691,1527,2823,3724,3980,4800,5700,6800,8100,9500][i],
  forecast: isF(y)
}));

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 6, padding: "8px 12px", fontSize: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
      <p style={{ fontWeight: 700, marginBottom: 4, color: COLORS.navy }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, margin: "2px 0" }}>
          {p.name}: {typeof p.value === "number" ? (p.value >= 1000 ? `₹${(p.value).toLocaleString()} Cr` : p.value < 200 ? (p.name.includes("%") || p.name.includes("ROCE") || p.name.includes("OPM") || p.name.includes("NPM") || p.name.includes("Ratio") || p.name.includes("Payout") || p.name.includes("Retained") ? `${p.value}%` : `₹${p.value}`) : `${p.value}`) : p.value}
        </p>
      ))}
    </div>
  );
};

const SectionCard = ({ title, verdict, score, children, explanation }) => (
  <div style={{ background: "#fff", borderRadius: 12, padding: "20px 24px", marginBottom: 20, boxShadow: "0 1px 6px rgba(0,0,0,0.08)", border: "1px solid #e8ecf0" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
      <h3 style={{ margin: 0, fontSize: 16, color: COLORS.navy, fontWeight: 700 }}>{title}</h3>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{ background: verdict === "EXCELLENT" ? "#E8F5E9" : verdict === "STRONG" ? "#FFF3E0" : "#E3F2FD", color: verdict === "EXCELLENT" ? COLORS.green : verdict === "STRONG" ? COLORS.orange : COLORS.blue, padding: "2px 10px", borderRadius: 12, fontSize: 11, fontWeight: 700 }}>{verdict}</span>
        <span style={{ background: COLORS.navy, color: "#fff", padding: "2px 10px", borderRadius: 12, fontSize: 11, fontWeight: 700 }}>{score}/10</span>
      </div>
    </div>
    <p style={{ fontSize: 12.5, color: "#555", margin: "6px 0 14px", lineHeight: 1.5 }}>{explanation}</p>
    {children}
  </div>
);

export default function EicherQualityDashboard() {
  const [tab, setTab] = useState("all");

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#f4f6f8", minHeight: "100vh", padding: "0" }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${COLORS.navy} 0%, ${COLORS.teal} 100%)`, padding: "24px 28px 18px", color: "#fff" }}>

        {/* BACK TO HOME BUTTON */}
        <Link
          to="/"
          style={{
            position: "fixed",
            top: "20px",
            left: "28px",
            zIndex: 10000,
            color: "#D4A017",
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

        {/* Header Content */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ margin: 0, fontSize: 11, letterSpacing: 3, opacity: 0.7, textTransform: "uppercase" }}>Quality Analysis Dashboard</p>
            <h1 style={{ margin: "4px 0 2px", fontSize: 26, fontWeight: 800 }}>Eicher Motors Ltd</h1>
            <p style={{ margin: 0, fontSize: 13, opacity: 0.8 }}>NSE: EICHERMOT | Royal Enfield + VECV | FY30 Target: ₹12,500–15,000</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: "10px 16px" }}>
              <p style={{ margin: 0, fontSize: 10, opacity: 0.7 }}>QUALITY SCORE</p>
              <p style={{ margin: 0, fontSize: 32, fontWeight: 800, color: "#4ADE80" }}>8.9<span style={{ fontSize: 14, opacity: 0.6 }}>/10</span></p>
            </div>
          </div>
        </div>

        {/* Score pills */}
        <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
          {[["CMP","₹8,190"],["P/E","41x"],["ROCE","30%"],["ROE","24%"],["Mkt Cap","₹2.2L Cr"],["Debt","~0"],["Div Yield","0.9%"]].map(([k,v])=>(
            <span key={k} style={{ background: "rgba(255,255,255,0.12)", borderRadius: 6, padding: "3px 10px", fontSize: 11 }}>
              <span style={{ opacity: 0.6 }}>{k}: </span><span style={{ fontWeight: 700 }}>{v}</span>
            </span>
          ))}
        </div>
      </div>

      <div style={{ padding: "16px 20px 30px" }}>
        <p style={{ fontSize: 12, color: COLORS.gray, marginBottom: 16, textAlign: "center" }}>
          10 years historical (FY16–FY25) + 5 years forecast (FY26E–FY30E) • Shaded area = forecasted
        </p>

        {/* ALL YOUR SECTION CARDS (exactly as you wrote them) */}
        {/* a) Longevity */}
        <SectionCard title="a) Longevity / Long Period of Operation" verdict="EXCELLENT" score="10" explanation="Eicher Motors: incorporated 1982 (43 years). Royal Enfield: founded 1901 (125 years). Never reported a loss in listed history. Profitable through 2008 crisis, demonetization, COVID. One of the longest-operating industrial brands globally.">
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[["Founded","1901 (RE)"],["Incorporated","1982"],["Years Operating","43+"],["Loss Years","ZERO"],["COVID PAT","₹1,347 Cr"],["Brand Age","125 yrs"]].map(([k,v])=>(
              <div key={k} style={{ flex: "1 1 120px", background: "#f8fafb", borderRadius: 8, padding: "10px 14px", textAlign: "center", border: "1px solid #e8ecf0" }}>
                <p style={{ margin: 0, fontSize: 10, color: COLORS.gray }}>{k}</p>
                <p style={{ margin: "2px 0 0", fontSize: 16, fontWeight: 700, color: COLORS.navy }}>{v}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* b) Predictable Cash Flow */}
        <SectionCard title="b) Predictable Cash Flow (CFO ₹ Cr)" verdict="EXCELLENT" score="9" explanation="Cash flows are highly predictable: daily cash motorcycle sales, negative working capital cycle (collects before paying suppliers), low maintenance capex. CFO grew from ₹1,463 Cr (FY16) to ₹3,980 Cr (FY25). 5Y CFO CAGR: 19%.">
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={cashFlowData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="year" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <defs>
                <linearGradient id="cfGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.teal} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={COLORS.teal} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="cfo" name="CFO" fill="url(#cfGrad)" stroke={COLORS.teal} strokeWidth={2.5} dot={{ r: 3, fill: COLORS.teal }} />
              <ReferenceLine x="FY25" stroke={COLORS.gray} strokeDasharray="5 5" label={{ value: "Forecast →", fontSize: 9, fill: COLORS.gray }} />
            </ComposedChart>
          </ResponsiveContainer>
        </SectionCard>

        {/* c) High ROCE */}
        <SectionCard title="c) High ROCE (%)" verdict="EXCELLENT" score="9" explanation="ROCE averaged ~30% over 10 years, peaking at 53% (FY17), bottoming at 17% (FY21 COVID). Current 30% is well above 11-12% cost of capital and among the highest in Indian auto. Projected to sustain 31-34% through FY30.">
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={roceData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="year" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 60]} tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={12} stroke={COLORS.red} strokeDasharray="4 4" label={{ value: "WACC ~12%", fontSize: 9, fill: COLORS.red, position: "right" }} />
              <Bar dataKey="value" name="ROCE %" radius={[4, 4, 0, 0]}>
                {roceData.map((d, i) => (
                  <Cell key={i} fill={d.forecast ? COLORS.orange : d.value >= 30 ? COLORS.green : d.value >= 20 ? COLORS.blue : COLORS.gray} opacity={d.forecast ? 0.6 : 1} />
                ))}
              </Bar>
              <ReferenceLine x="FY25" stroke={COLORS.gray} strokeDasharray="5 5" />
            </ComposedChart>
          </ResponsiveContainer>
        </SectionCard>

        {/* d) Resilience - Revenue Growth */}
        <SectionCard title="d) Resilience — Revenue Growth (₹ Cr)" verdict="STRONG" score="8" explanation="Revenue fell only in FY20 (-7%) and FY21 (-5%) due to COVID. Otherwise every year positive. 5Y CAGR: 16%, 3Y CAGR: 22%. Recovery from shocks is swift and V-shaped. Revenue projected to reach ₹39,500 Cr by FY30.">
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={revenueData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="year" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip />} />
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.blue} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={COLORS.blue} stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="value" name="Revenue" fill="url(#revGrad)" stroke="none" />
              <Bar dataKey="value" name="Revenue" radius={[3, 3, 0, 0]}>
                {revenueData.map((d, i) => (
                  <Cell key={i} fill={d.forecast ? COLORS.orange : COLORS.blue} opacity={d.forecast ? 0.55 : 0.85} />
                ))}
              </Bar>
              <ReferenceLine x="FY25" stroke={COLORS.gray} strokeDasharray="5 5" label={{ value: "Forecast →", fontSize: 9, fill: COLORS.gray }} />
            </ComposedChart>
          </ResponsiveContainer>
        </SectionCard>

        {/* e) Non-Cyclical EPS */}
        <SectionCard title="e) Non-Cyclical: EPS Growth (₹)" verdict="STRONG" score="8" explanation="EPS dipped during FY20-21 (COVID) and recovered sharply to new highs. 5Y EPS CAGR: 29%. EPS growth healthy in 8 of 10 years. While auto is cyclical, Royal Enfield's mid-weight niche behaves more like a consumer franchise. FY30E EPS: ₹394.">
          <ResponsiveContainer width="100%" height={250}>
            <ComposedChart data={epsData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="year" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `₹${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <defs>
                <linearGradient id="epsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.green} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={COLORS.green} stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="value" name="EPS" fill="url(#epsGrad)" stroke={COLORS.green} strokeWidth={2.5} dot={(props) => {
                const { cx, cy, payload } = props;
                return <circle cx={cx} cy={cy} r={payload.forecast ? 4 : 3.5} fill={payload.forecast ? COLORS.orange : COLORS.green} stroke="#fff" strokeWidth={1.5} />;
              }} />
              <ReferenceLine x="FY25" stroke={COLORS.gray} strokeDasharray="5 5" />
            </ComposedChart>
          </ResponsiveContainer>
        </SectionCard>

        {/* f) CFO/PAT Conversion */}
        <SectionCard title="f) Converts Profit to Cash: CFO/PAT" verdict="EXCELLENT" score="9" explanation="CFO/PAT averaged ~98% over 9 years. Virtually every rupee of profit converts to operating cash. FY18 stood out at 127% (working capital release). This is the hallmark of a truly high-quality business.">
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={cfoPatData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="year" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 10 }} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} domain={[0, 150]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar yAxisId="left" dataKey="cfo" name="CFO (₹ Cr)" fill={COLORS.teal} opacity={0.7} radius={[3, 3, 0, 0]} />
              <Bar yAxisId="left" dataKey="pat" name="PAT (₹ Cr)" fill={COLORS.blue} opacity={0.5} radius={[3, 3, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="ratio" name="CFO/PAT Ratio %" stroke={COLORS.red} strokeWidth={2.5} dot={{ r: 3, fill: COLORS.red }} />
              <ReferenceLine yAxisId="right" y={100} stroke={COLORS.green} strokeDasharray="4 4" label={{ value: "100%", fontSize: 9, fill: COLORS.green, position: "right" }} />
              <ReferenceLine x="FY25" stroke={COLORS.gray} strokeDasharray="5 5" />
            </ComposedChart>
          </ResponsiveContainer>
        </SectionCard>

        {/* g) Low Capex / High Margins */}
        <SectionCard title="g) Low Capex Driven: High PAT & Operating Margins (%)" verdict="EXCELLENT" score="9" explanation="PAT margin averaged ~21% over 5 years, reaching 25% in FY25. Operating margin averaged 25%. Extraordinary for an auto company — reflects Royal Enfield's brand-driven pricing power. Capex/Revenue typically 4-6%, indicating high-margin, low-capex business.">
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={marginData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="year" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 40]} tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="opm" name="OPM %" stroke={COLORS.blue} strokeWidth={2.5} dot={(props) => {
                const { cx, cy, payload } = props;
                return <circle cx={cx} cy={cy} r={payload.forecast ? 4 : 3} fill={payload.forecast ? COLORS.orange : COLORS.blue} stroke="#fff" strokeWidth={1} />;
              }} />
              <Line type="monotone" dataKey="npm" name="NPM %" stroke={COLORS.green} strokeWidth={2.5} dot={(props) => {
                const { cx, cy, payload } = props;
                return <circle cx={cx} cy={cy} r={payload.forecast ? 4 : 3} fill={payload.forecast ? COLORS.orange : COLORS.green} stroke="#fff" strokeWidth={1} />;
              }} />
              <ReferenceLine x="FY25" stroke={COLORS.gray} strokeDasharray="5 5" label={{ value: "Forecast →", fontSize: 9, fill: COLORS.gray }} />
            </ComposedChart>
          </ResponsiveContainer>
        </SectionCard>

        {/* h) Reinvestment */}
        <SectionCard title="h) High Reinvestment — Dividend Payout vs Retention + Investment Portfolio (₹ Cr)" verdict="GOOD" score="8" explanation="Company retains ~59-62% of PAT while paying rising dividends (16% → 41% payout). Investment portfolio grew from ₹4,987 Cr (FY17) to ₹14,791 Cr (FY25). At 30% ROCE and 59% retention, organic growth potential is ~18% (ROCE × Reinvestment Rate).">
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={reinvestData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="year" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 10 }} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} tickFormatter={v => `${v}%`} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar yAxisId="left" dataKey="investments" name="Investments (₹ Cr)" fill={COLORS.purple} opacity={0.5} radius={[3, 3, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="retained" name="Retained %" stroke={COLORS.green} strokeWidth={2.5} dot={{ r: 3, fill: COLORS.green }} />
              <Line yAxisId="right" type="monotone" dataKey="divPayout" name="Div Payout %" stroke={COLORS.orange} strokeWidth={2} strokeDasharray="5 3" dot={{ r: 3, fill: COLORS.orange }} />
              <ReferenceLine x="FY25" stroke={COLORS.gray} strokeDasharray="5 5" />
            </ComposedChart>
          </ResponsiveContainer>
        </SectionCard>

        {/* Overall Summary */}
        <div style={{ background: `linear-gradient(135deg, ${COLORS.navy} 0%, #1a3f5c 100%)`, borderRadius: 14, padding: "22px 26px", color: "#fff", marginTop: 8 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 18, fontWeight: 800 }}>Overall Quality Scorecard — Eicher Motors</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
            {[
              ["Longevity","10/10","125yr brand, 43yr listed"],
              ["Cash Predictability","9/10","Neg WC cycle, daily cash"],
              ["ROCE","9/10","30% avg, 2.5× WACC"],
              ["Revenue Resilience","8/10","16% 5Y CAGR, V-recovery"],
              ["EPS (Non-Cyclical)","8/10","29% 5Y CAGR, 1 dip"],
              ["CFO/PAT","9/10","98% avg conversion"],
              ["Low Capex/Margins","9/10","25% NPM, 4-6% capex"],
              ["Reinvestment","8/10","59% retained, ₹15K Cr war chest"],
              ["OVERALL","8.9/10","EXCEPTIONAL COMPOUNDER"],
            ].map(([k,v,d], i) => (
              <div key={k} style={{
                background: i === 8 ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.07)",
                borderRadius: 10,
                padding: "10px 14px",
                border: i === 8 ? "1px solid rgba(74,222,128,0.3)" : "1px solid rgba(255,255,255,0.08)"
              }}>
                <p style={{ margin: 0, fontSize: 10, opacity: 0.6 }}>{k}</p>
                <p style={{ margin: "2px 0", fontSize: i === 8 ? 22 : 18, fontWeight: 800, color: i === 8 ? "#4ADE80" : "#fff" }}>{v}</p>
                <p style={{ margin: 0, fontSize: 10, opacity: 0.5 }}>{d}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(74,222,128,0.1)", borderRadius: 10, border: "1px solid rgba(74,222,128,0.2)" }}>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6 }}>
              <strong style={{ color: "#4ADE80" }}>BUY — FY30 Target: ₹12,500–15,000</strong> (59–84% upside, 14–16% CAGR). Eicher Motors is an exceptional quality compounder: dominant franchise, 30% ROCE, cash-generative, near-zero debt, growing dividends, and a clear growth runway through capacity expansion, EV entry, and global reach. Hold through market cycles.
            </p>
          </div>
          <p style={{ margin: "10px 0 0", fontSize: 10, opacity: 0.4, textAlign: "center" }}>
            For informational purposes only. Not SEBI-registered advice. Feb 2026 data. Consult advisor before investing.
          </p>
        </div>
      </div>
    </div>
  );
}