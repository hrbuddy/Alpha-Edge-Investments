// ============================================================
//  ALPHA EDGE — UNIVERSAL STOCK DASHBOARD RENDERER
//  This is the ONLY format file. Edit here → all stocks update.
//  Data comes from stocksDB.js — never hardcoded here.
//  Format version: 1.0
// ============================================================

import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, ComposedChart, Cell,
} from "recharts";

// ── Design tokens (change once → all dashboards update) ────────────────────
const NAVY   = "#0D1B2A";
const BLUE   = "#2E75B6";
const TEAL   = "#0E7C7B";
const GREEN  = "#27AE60";
const RED    = "#C0392B";
const ORANGE = "#E67E22";
const GOLD   = "#D4A017";

// Resolve color name strings from DB to actual hex values
const COLOR_MAP = { GOLD, BLUE, TEAL, GREEN, RED, ORANGE };
const c = (name) => COLOR_MAP[name] || GOLD;

const TABS = [
  "Overview",
  "Porter's 5 Forces",
  "Revenue Model",
  "FCFF & CFO/PAT",
  "OPM & ROCE",
  "Quality Score",
  "Sensitivity",
];

const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap');

  /* ── Metric grid: row on desktop, 2-col on mobile ── */
  .ae-metric-grid {
    display: flex;
    gap: 8px;
    margin-top: 10px;
    flex-wrap: wrap;
  }
  .ae-metric-card {
    flex: 1;
    min-width: 120px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 7px;
    padding: 10px 14px;
  }

  /* ── Tab scroll with fade + arrow hint ── */
  .ae-tab-wrapper {
    position: relative;
    margin-top: 12px;
  }
  .ae-tab-scroll {
    display: flex;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    scroll-behavior: smooth;
  }
  .ae-tab-scroll::-webkit-scrollbar { display: none; }
  .ae-tab-wrapper::after {
    content: "›";
    position: absolute;
    right: 0; top: 0; bottom: 3px;
    width: 42px;
    background: linear-gradient(to right, transparent, #0D1B2A 70%);
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 8px;
    color: #D4A017;
    font-size: 22px;
    font-weight: 700;
    pointer-events: none;
    transition: opacity 0.25s;
  }
  .ae-tab-wrapper.at-end::after { opacity: 0; }

  @media (max-width: 600px) {
    .ae-metric-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 7px;
    }
    .ae-metric-card { min-width: unset; }
    .ae-thesis-grid  { grid-template-columns: 1fr !important; }
    .ae-porter-grid  { grid-template-columns: 1fr !important; }
    .ae-quality-grid { grid-template-columns: 1fr !important; }
    .ae-scenario-grid{ grid-template-columns: 1fr !important; }
  }
`;

// ── Shared sub-components ───────────────────────────────────────────────────

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
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}

function MetricCard({ label, value, sub, color = "GOLD" }) {
  return (
    <div className="ae-metric-card">
      <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ fontSize: 18, fontWeight: 800, color: c(color), fontFamily: "'DM Sans', sans-serif" }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// Tab row with right-fade + › arrow to hint scrollability
function TabScrollRow({ tabs, tab, setTab }) {
  const scrollRef = useRef(null);
  const wrapRef   = useRef(null);

  const checkEnd = () => {
    const el = scrollRef.current;
    const wrap = wrapRef.current;
    if (!el || !wrap) return;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    wrap.classList.toggle("at-end", atEnd);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkEnd, { passive: true });
    checkEnd(); // initial check
    return () => el.removeEventListener("scroll", checkEnd);
  }, []);

  return (
    <div className="ae-tab-wrapper" ref={wrapRef}>
      <div className="ae-tab-scroll" ref={scrollRef}>
        {tabs.map((t, i) => (
          <TabButton key={i} label={t} active={tab === i} onClick={() => setTab(i)} />
        ))}
      </div>
    </div>
  );
}

function ScoreBar({ label, score, maxScore = 10 }) {
  const pct = (score / maxScore) * 100;
  const barColor = score >= 8 ? GREEN : score >= 6 ? ORANGE : RED;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontSize: 12, color: "#e2e8f0", fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 800, color: barColor }}>{score}/10</span>
      </div>
      <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 4, height: 8, overflow: "hidden" }}>
        <div style={{
          width: `${pct}%`, height: "100%",
          background: `linear-gradient(90deg, ${barColor}, ${barColor}cc)`,
          borderRadius: 4, transition: "width 0.6s ease",
        }} />
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: NAVY, border: `1px solid ${GOLD}`, borderRadius: 6, padding: "8px 12px", color: "#fff", fontSize: 12 }}>
      <p style={{ margin: 0, fontWeight: 700, color: GOLD }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ margin: "2px 0", color: p.color }}>
          {p.name}: {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  );
}

// Segment colors for revenue model chart
const SEG_COLORS = [BLUE, TEAL, GREEN, ORANGE, RED, GOLD];

// ── Main export ─────────────────────────────────────────────────────────────

export default function StockDashboard({ stock }) {
  const [tab, setTab] = useState(0);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  if (!stock) {
    return (
      <div style={{ background: NAVY, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 24, color: GOLD, marginBottom: 8 }}>Stock not found</div>
          <Link to="/" style={{ color: "#94a3b8" }}>← Back to Alpha Edge</Link>
        </div>
      </div>
    );
  }

  const { finData, segData, segmentKeys, segmentLabels, porterData, porterKeys, porterLabels,
          porterNarrative, porterConclusion, qualityData, qualitySummary, sensitivity } = stock;

  // CFO/PAT cleaned series
  const cfoPat = finData.map(d => ({
    ...d,
    cfoPatClean: d.cfoPatPct && d.cfoPatPct > 0 && d.cfoPatPct < 200 ? d.cfoPatPct : null,
  }));

  return (
    <div style={{
      background: `linear-gradient(135deg, ${NAVY} 0%, #0a1628 100%)`,
      minHeight: "100vh",
      color: "#e2e8f0",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <style>{GLOBAL_STYLES}</style>

      {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
      <div style={{ padding: "112px 22px 0", borderBottom: `1px solid rgba(212,160,23,0.2)` }}>

        {/* Identity row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
          <div>
            <div style={{ fontSize: 10, color: GOLD, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700 }}>
              Alpha Edge Research — Initiating Coverage
            </div>
            <h1 style={{ margin: "4px 0 2px", fontSize: 24, fontWeight: 800, fontFamily: "'Playfair Display', serif", color: "#fff" }}>
              {stock.name}
            </h1>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>
              NSE: {stock.nse} · BSE: {stock.bse} · {stock.indices}
            </div>
          </div>
          <div style={{
            display: "flex", gap: 6, padding: "5px 12px",
            background: "rgba(39,174,96,0.12)", border: `1px solid ${GREEN}44`,
            borderRadius: 7, alignItems: "center", flexShrink: 0,
          }}>
            <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>RATING</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: GREEN }}>{stock.rating}</span>
          </div>
        </div>

        {/* Description banner */}
        <div style={{
          marginTop: 10, padding: "9px 13px",
          background: "rgba(212,160,23,0.06)", border: "1px solid rgba(212,160,23,0.18)",
          borderRadius: 7,
        }}>
          <p style={{ margin: 0, fontSize: 12, color: "#c8dae8", lineHeight: 1.6 }}>
            {stock.description}
          </p>
        </div>

        {/* Metric tiles */}
        <div className="ae-metric-grid">
          {stock.metrics.map((m, i) => (
            <MetricCard key={i} label={m.label} value={m.value} sub={m.sub} color={m.color} />
          ))}
        </div>

        {/* Tabs — scroll wrapper with fade+arrow hint */}
        <TabScrollRow tabs={TABS} tab={tab} setTab={setTab} />
      </div>

      {/* ══ TAB CONTENT ═════════════════════════════════════════════════════ */}
      <div style={{ padding: "20px 28px 60px" }}>

        {/* ─── TAB 0: Overview ─── */}
        {tab === 0 && (
          <div>
            <h2 style={{ fontSize: 18, color: GOLD, marginBottom: 12, fontFamily: "'Playfair Display', serif" }}>
              Investment Thesis
            </h2>
            <div className="ae-thesis-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {stock.thesis.map((item, i) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 8, padding: 16,
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: GOLD, marginBottom: 4 }}>{item.t}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.55 }}>{item.d}</div>
                </div>
              ))}
            </div>

            <h2 style={{ fontSize: 18, color: GOLD, margin: "24px 0 6px", fontFamily: "'Playfair Display', serif" }}>
              Revenue & Operating Profit (₹ Cr)
            </h2>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: "-2px 0 12px" }}>
              Shaded bars = projections. Historical on left, estimates on right.
            </p>
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={finData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="yr" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="rev" name="Revenue (₹Cr)" fill={BLUE} opacity={0.7} radius={[3, 3, 0, 0]}>
                  {finData.map((d, i) => <Cell key={i} fill={d.type === "P" ? `${BLUE}88` : BLUE} />)}
                </Bar>
                <Line dataKey="opProfit" name="Op. Profit (₹Cr)" stroke={GOLD} strokeWidth={2.5} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ─── TAB 1: Porter's 5 Forces ─── */}
        {tab === 1 && (
          <div>
            <h2 style={{ fontSize: 18, color: GOLD, marginBottom: 6, fontFamily: "'Playfair Display', serif" }}>
              Porter's Five Forces — Competitive Moat Analysis
            </h2>
            <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>
              Score 1–10 where 10 = strongest competitive position for the company.
            </p>
            <div className="ae-porter-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <ResponsiveContainer width="100%" height={340}>
                <RadarChart data={porterData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="force" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fill: "#64748b", fontSize: 9 }} />
                  {porterKeys.map((key, i) => (
                    <Radar key={key} name={porterLabels[key]} dataKey={key}
                      stroke={SEG_COLORS[i]} fill={SEG_COLORS[i]}
                      fillOpacity={i === 0 ? 0.25 : 0.1} strokeWidth={2}
                    />
                  ))}
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
              <div>
                {porterNarrative.map((f, i) => (
                  <div key={i} style={{
                    marginBottom: 10, padding: "10px 12px",
                    background: "rgba(255,255,255,0.02)", borderRadius: 6,
                    borderLeft: `3px solid ${SEG_COLORS[i % SEG_COLORS.length]}`,
                  }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>{f.force}</div>
                    {f.lines.map((line, j) => (
                      <div key={j} style={{ fontSize: 11, color: SEG_COLORS[j % SEG_COLORS.length] }}>{line}</div>
                    ))}
                  </div>
                ))}
                <div style={{
                  padding: "12px 14px", background: `rgba(39,174,96,0.08)`,
                  border: `1px solid ${GREEN}33`, borderRadius: 8, marginTop: 8,
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: GREEN }}>Conclusion</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{porterConclusion}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 2: Revenue Model ─── */}
        {tab === 2 && (
          <div>
            <h2 style={{ fontSize: 18, color: GOLD, marginBottom: 6, fontFamily: "'Playfair Display', serif" }}>
              Segment Revenue Model (₹ Cr)
            </h2>
            <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>
              Stacked bars by business segment. Shaded = projections.
            </p>
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={segData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="yr" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {segmentKeys.map((key, i) => (
                  <Bar key={key} dataKey={key} name={segmentLabels[key]}
                    stackId="a" fill={SEG_COLORS[i % SEG_COLORS.length]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ─── TAB 3: FCFF & CFO/PAT ─── */}
        {tab === 3 && (
          <div>
            <h2 style={{ fontSize: 18, color: GOLD, marginBottom: 6, fontFamily: "'Playfair Display', serif" }}>
              Free Cash Flow to Firm (FCFF) & CFO/PAT %
            </h2>
            <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>
              FCFF = CFO − Capex. CFO/PAT % measures cash earnings quality (null = negative PAT year).
            </p>
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={cfoPat}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="yr" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar yAxisId="left" dataKey="fcff" name="FCFF (₹Cr)" fill={TEAL} opacity={0.8} radius={[3, 3, 0, 0]}>
                  {cfoPat.map((d, i) => <Cell key={i} fill={d.type === "P" ? `${TEAL}88` : TEAL} />)}
                </Bar>
                <Bar yAxisId="left" dataKey="cfo" name="CFO (₹Cr)" fill={GREEN} opacity={0.5} radius={[3, 3, 0, 0]}>
                  {cfoPat.map((d, i) => <Cell key={i} fill={d.type === "P" ? `${GREEN}88` : GREEN} />)}
                </Bar>
                <Line yAxisId="right" dataKey="cfoPatClean" name="CFO/PAT %" stroke={GOLD} strokeWidth={2} dot={{ r: 3 }} connectNulls={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ─── TAB 4: OPM & ROCE ─── */}
        {tab === 4 && (
          <div>
            <h2 style={{ fontSize: 18, color: GOLD, marginBottom: 6, fontFamily: "'Playfair Display', serif" }}>
              Operating Margin (OPM %) & ROCE %
            </h2>
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={finData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="yr" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar yAxisId="left" dataKey="opm" name="OPM %" fill={BLUE} opacity={0.7} radius={[3, 3, 0, 0]}>
                  {finData.map((d, i) => <Cell key={i} fill={d.type === "P" ? `${BLUE}88` : BLUE} />)}
                </Bar>
                <Line yAxisId="right" dataKey="roce" name="ROCE %" stroke={ORANGE} strokeWidth={2.5} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ─── TAB 5: Quality Score ─── */}
        {tab === 5 && (
          <div>
            <h2 style={{ fontSize: 18, color: GOLD, marginBottom: 6, fontFamily: "'Playfair Display', serif" }}>
              Quality Scorecard — 8 Parameter Analysis
            </h2>
            <div className="ae-quality-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={qualityData.map(d => ({ ...d, fullMark: 10 }))}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="param" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fill: "#64748b", fontSize: 9 }} />
                  <Radar name="Score" dataKey="score" stroke={GOLD} fill={GOLD} fillOpacity={0.2} strokeWidth={2} dot={{ r: 3, fill: GOLD }} />
                </RadarChart>
              </ResponsiveContainer>
              <div>
                {qualityData.map((d, i) => (
                  <div key={i} style={{ marginBottom: 6 }}>
                    <ScoreBar label={d.param} score={d.score} />
                    <div style={{ fontSize: 10, color: "#64748b", marginTop: -4, marginBottom: 6, paddingLeft: 2 }}>{d.full}</div>
                  </div>
                ))}
                <div style={{
                  marginTop: 14, padding: "12px 14px",
                  background: "rgba(212,160,23,0.08)", borderRadius: 8, border: `1px solid ${GOLD}33`,
                }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: GOLD }}>
                    Overall: {qualitySummary.consolidated}
                  </div>
                  {qualitySummary.standalone !== qualitySummary.consolidated && (
                    <div style={{ fontSize: 14, fontWeight: 800, color: GREEN, marginTop: 2 }}>
                      Standalone: {qualitySummary.standalone}
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 6, lineHeight: 1.5 }}>
                    {qualitySummary.insight}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 6: Sensitivity ─── */}
        {tab === 6 && (
          <div>
            <h2 style={{ fontSize: 18, color: GOLD, marginBottom: 6, fontFamily: "'Playfair Display', serif" }}>
              FY30 Sensitivity Analysis — Earnings × P/E Matrix
            </h2>
            <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>
              CMP: ₹{sensitivity.cmp.toLocaleString()}
            </p>

            {/* Matrix table */}
            <div style={{ overflowX: "auto", marginBottom: 24 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr>
                    <th style={{ padding: "10px 14px", textAlign: "left", color: GOLD, fontWeight: 700, borderBottom: `2px solid ${GOLD}44` }}>
                      EPS ↓ / P/E →
                    </th>
                    {sensitivity.peColumns.map(col => (
                      <th key={col.key} style={{ padding: "10px 14px", textAlign: "center", color: GOLD, fontWeight: 700, borderBottom: `2px solid ${GOLD}44` }}>
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sensitivity.rows.map((row, i) => {
                    const rowColor = [RED, BLUE, GREEN][i] || BLUE;
                    const bg = [`rgba(192,57,43,0.06)`, `rgba(46,117,182,0.06)`, `rgba(39,174,96,0.06)`][i] || "transparent";
                    return (
                      <tr key={i} style={{ background: bg }}>
                        <td style={{ padding: "10px 14px", fontWeight: 700, color: rowColor }}>{row.label}</td>
                        {sensitivity.peColumns.map((col, j) => {
                          const val = row[col.key];
                          const upside = ((val - sensitivity.cmp) / sensitivity.cmp * 100).toFixed(0);
                          const isAbove = val > sensitivity.cmp;
                          return (
                            <td key={j} style={{ padding: "10px 14px", textAlign: "center" }}>
                              <div style={{ fontSize: 15, fontWeight: 700, color: isAbove ? GREEN : RED }}>
                                ₹{val.toLocaleString()}
                              </div>
                              <div style={{ fontSize: 10, color: isAbove ? "#66bb6a" : "#ef5350" }}>
                                {isAbove ? "+" : ""}{upside}%
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Scenario cards */}
            <div className="ae-scenario-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
              {sensitivity.scenarios.map((s, i) => (
                <div key={i} style={{
                  padding: 14, background: "rgba(255,255,255,0.02)",
                  borderRadius: 8, borderTop: `3px solid ${c(s.color)}`,
                }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: c(s.color), marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.6 }}>
                    <div>Revenue: <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{s.rev}</span></div>
                    <div>OPM: <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{s.opm}</span></div>
                    <div>EPS: <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{s.eps}</span></div>
                    <div>P/E Range: <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{s.pe}</span></div>
                    <div>Target: <span style={{ color: c(s.color), fontWeight: 700 }}>{s.target}</span></div>
                  </div>
                  <div style={{ fontSize: 10, color: "#64748b", marginTop: 8, lineHeight: 1.4 }}>{s.desc}</div>
                </div>
              ))}
            </div>

            {/* Conclusion */}
            <div style={{
              padding: "14px 18px", background: "rgba(39,174,96,0.06)",
              border: `1px solid ${GREEN}33`, borderRadius: 8,
            }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: GREEN }}>{sensitivity.conclusion}</div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}