import { useState } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";

const NAVY = "#0D1B2A";
const GOLD = "#D4A017";
const GREEN = "#27AE60";

const parameters = [
  { name: "Longevity", formula: "min(10, Years ÷ 5)", description: "50+ years = full 10 marks (as you wanted)" },
  { name: "Predictable CF", formula: "Avg CFO/PAT % ÷ 150 (max 10)", description: "Reliable cash conversion" },
  { name: "ROCE", formula: "Avg ROCE % ÷ 3.5 (max 10)", description: "Profit per rupee invested" },
  { name: "Revenue Resilience", formula: "(5-yr CAGR + (10 - down years)) ÷ 2", description: "Steady growth" },
  { name: "EPS Stability", formula: "10 - (volatility × 2)", description: "Steady profits" },
  { name: "CFO/PAT", formula: "Latest CFO/PAT % ÷ 120 (max 10)", description: "Cash from profit" },
  { name: "Margins", formula: "(Margin + expansion) ÷ 2.5", description: "Healthy & improving" },
  { name: "Reinvestment", formula: "(Capex efficiency + growth return) ÷ 2", description: "Smart growth spending" },
  { name: "Balance Sheet Strength", formula: "(Debt Score + Cash Score) ÷ 2", description: "Low debt + high cash" },
];

const exampleScores = {
  BEL: [10, 9, 9.5, 9, 8.5, 9, 8.5, 8, 10],        // avg = 9.06 → 9.1
  BajajFinance: [7, 8.5, 9, 9, 8, 9, 8.5, 8, 3.4], // avg = 7.82 → 7.8
  TVSMOTOR: [10, 9, 9, 9.5, 9, 9, 9, 8.5, 5.5],    // avg = 8.72 → 8.7
  V2RETAIL: [5, 8.5, 4.9, 9.5, 7, 10, 8.5, 8, 3.0],// avg = 7.71 → 7.7
};

function QualityExplainer() {
  const [selectedStock, setSelectedStock] = useState("V2RETAIL");
  const scores = exampleScores[selectedStock];
  const average = (scores.reduce((a, b) => a + b, 0) / 9).toFixed(1);

  const radarData = parameters.map((p, i) => ({ param: p.name, score: scores[i], fullMark: 10 }));

  return (
    <div style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #0a1628 100%)`, minHeight: "100vh", color: "#e2e8f0", fontFamily: "'DM Sans', sans-serif", padding: "40px 28px" }}>
      <h1 style={{ fontSize: 32, fontWeight: 800, color: GOLD, textAlign: "center" }}>Alpha Edge — Proprietary Quality Scorecard (Updated)</h1>
      <p style={{ textAlign: "center", color: "#94a3b8" }}>100% Mathematical • 9 Parameters • Longevity now ÷5 (50+ years = 10) • New Balance Sheet Strength</p>

      {/* Formula */}
      <div style={{ background: "rgba(212,160,23,0.08)", border: `1px solid ${GOLD}44`, borderRadius: 12, padding: 24, maxWidth: 900, margin: "30px auto" }}>
        Quality Score = (Sum of 9 scores) ÷ 9
      </div>

      {/* Table of Formulas */}
      <table style={{ width: "100%", maxWidth: 900, margin: "0 auto", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${GOLD}` }}>
            <th style={{ padding: 12, textAlign: "left" }}>Parameter</th>
            <th style={{ padding: 12, textAlign: "center" }}>Exact Formula</th>
            <th style={{ padding: 12, textAlign: "left" }}>What it measures</th>
          </tr>
        </thead>
        <tbody>
          {parameters.map((p, i) => (
            <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <td style={{ padding: 14, fontWeight: 600 }}>{p.name}</td>
              <td style={{ padding: 14, fontFamily: "monospace", color: "#2E75B6", textAlign: "center" }}>{p.formula}</td>
              <td style={{ padding: 14, color: "#94a3b8" }}>{p.description}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Live Radar + Scores */}
      <div style={{ maxWidth: 900, margin: "40px auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <ResponsiveContainer width="100%" height={340}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis dataKey="param" tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <PolarRadiusAxis domain={[0, 10]} />
            <Radar name="Score" dataKey="score" stroke={GOLD} fill={GOLD} fillOpacity={0.25} strokeWidth={3} />
          </RadarChart>
        </ResponsiveContainer>

        <div>
          <div style={{ fontSize: 36, color: GREEN, fontWeight: 800 }}>Score: {average}/10</div>
          {parameters.map((p, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <span>{p.name}</span>
              <span style={{ color: GOLD, fontWeight: 700 }}>{scores[i].toFixed(1)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default QualityExplainer;