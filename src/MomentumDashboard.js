/**
 * MomentumDashboard.js
 *
 * Reads momentum_scores/* from Firestore and renders:
 *  Tab 0 — Current Rankings : bar chart of all stocks, top-N highlighted
 *  Tab 1 — History           : month-by-month composition of top N portfolio
 *
 * Firestore collections read:
 *  momentum_scores/_latest          → { date, month }
 *  momentum_scores/{YYYY-MM}        → { scores[], count, date, universe }
 *
 * Add route in App.js:
 *   <Route path="/momentum" element={<MomentumDashboard />} />
 */

import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";
import {
  doc, getDoc, collection, getDocs, orderBy, query, limit,
} from "firebase/firestore";
import { db } from "./firebase";

// ── Theme tokens (match rest of app) ─────────────────────────────────────────
const NAVY   = "#0D1B2A";
const GOLD   = "#D4A017";
const GREEN  = "#27AE60";
const TEAL   = "#0E7C7B";
// const BLUE = "#2E75B6"; // reserved for future use
const RED    = "#C0392B";
const ORANGE = "#E67E22";
const MUTED  = "#3d5570";
const SUB    = "#5a7a94";

// Color ramp for rank position (rank 1 = most gold, fades down)
function rankColor(rank, topN) {
  if (rank > topN) return MUTED + "55";
  const t = 1 - (rank - 1) / Math.max(topN - 1, 1);   // 1.0 → 0.0
  if (t > 0.66) return GOLD;
  if (t > 0.33) return ORANGE;
  return TEAL;
}

// ── Small UI primitives ───────────────────────────────────────────────────────
function TabBtn({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "8px 18px", border: "none", cursor: "pointer",
      borderBottom: active ? `3px solid ${GOLD}` : "3px solid transparent",
      background: active ? "rgba(212,160,23,0.10)" : "transparent",
      color: active ? GOLD : SUB,
      fontWeight: active ? 800 : 500, fontSize: 13,
      fontFamily: "'DM Sans', sans-serif", transition: "all .2s",
    }}>{label}</button>
  );
}

function NBtn({ n, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "5px 16px", borderRadius: 999,
      border: `1px solid ${active ? GOLD : "rgba(212,160,23,0.2)"}`,
      background: active ? "rgba(212,160,23,0.14)" : "transparent",
      color: active ? GOLD : MUTED,
      fontWeight: 800, fontSize: 11, letterSpacing: "1px",
      cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
      transition: "all .15s",
    }}>Top {n}</button>
  );
}

function MetricCard({ label, value, sub, color = GOLD }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 8, padding: "14px 18px", flex: 1, minWidth: 130,
    }}>
      <div style={{ fontSize: 10, color: SUB, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: "'DM Sans', sans-serif" }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// ── Custom tooltip for the bar chart ─────────────────────────────────────────
function RankTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div style={{
      background: "rgba(6,14,26,0.97)", border: `1px solid rgba(212,160,23,0.3)`,
      borderRadius: 10, padding: "10px 14px", fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: "#e2e8f0", marginBottom: 4 }}>{d?.ticker}</div>
      <div style={{ fontSize: 11, color: GOLD }}>Rank #{d?.rank}</div>
      <div style={{ fontSize: 11, color: d?.ret_11m >= 0 ? GREEN : RED, marginTop: 2 }}>
        11-mo return: {d?.ret_11m >= 0 ? "+" : ""}{(d?.ret_11m * 100).toFixed(1)}%
      </div>
      <div style={{ fontSize: 11, color: SUB, marginTop: 2 }}>
        Score: {d?.norm_score?.toFixed(3)}
      </div>
    </div>
  );
}

// ── Tab 0: Current Rankings ───────────────────────────────────────────────────
function CurrentRankings({ scores, topN, asOfDate }) {
  // Show ALL stocks sorted by rank (top-N highlighted, rest muted)
  const chartData = useMemo(() =>
    scores.map(s => ({
      ...s,
      display_score: s.norm_score,
    })), [scores]);

  const top = scores.slice(0, topN);

  // Bar chart height scales with stock count
  const barH = Math.max(400, scores.length * 22);

  return (
    <div>
      {/* Top-N cards strip */}
      <h3 style={{ fontSize: 15, color: GOLD, margin: "0 0 12px", fontFamily: "'Playfair Display', serif" }}>
        Top {topN} Momentum Stocks
        <span style={{ fontSize: 11, color: SUB, fontWeight: 400, marginLeft: 10 }}>as of {asOfDate}</span>
      </h3>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
        {top.map((s, i) => (
          <div key={s.ticker} style={{
            background: "rgba(212,160,23,0.06)", border: `1px solid rgba(212,160,23,0.22)`,
            borderRadius: 8, padding: "10px 14px", minWidth: 120,
            borderLeft: `3px solid ${rankColor(s.rank, topN)}`,
          }}>
            <div style={{ fontSize: 9, color: rankColor(s.rank, topN), fontWeight: 800, letterSpacing: 1 }}>#{s.rank}</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#e2e8f0", fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>{s.ticker}</div>
            <div style={{ fontSize: 10, color: s.ret_11m >= 0 ? GREEN : RED, marginTop: 2 }}>
              {s.ret_11m >= 0 ? "+" : ""}{(s.ret_11m * 100).toFixed(1)}%
            </div>
          </div>
        ))}
      </div>

      {/* Full ranked bar chart */}
      <h3 style={{ fontSize: 15, color: GOLD, margin: "0 0 8px", fontFamily: "'Playfair Display', serif" }}>
        Full Universe Rankings ({scores.length} stocks)
      </h3>
      <p style={{ fontSize: 11, color: SUB, margin: "0 0 12px" }}>
        Normalised 12-1 momentum score · Highlighted = top {topN} · Sorted by score descending
      </p>

      <div style={{
        background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212,160,23,0.1)",
        borderRadius: 12, padding: "12px 4px 4px",
      }}>
        <ResponsiveContainer width="100%" height={barH}>
          <BarChart data={chartData} layout="vertical"
            margin={{ top: 4, right: 70, left: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
            <XAxis type="number" domain={[-1, 1]}
              tickFormatter={v => v.toFixed(1)}
              tick={{ fill: MUTED, fontSize: 9, fontFamily: "'DM Sans', sans-serif" }}
              tickLine={false} axisLine={{ stroke: "rgba(212,160,23,0.1)" }} />
            <YAxis type="category" dataKey="ticker" width={100}
              tick={{ fill: SUB, fontSize: 9, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}
              tickLine={false} axisLine={false} />
            <ReferenceLine x={0} stroke="rgba(212,160,23,0.25)" strokeWidth={1.5} />
            <Tooltip content={<RankTooltip />} cursor={{ fill: "rgba(212,160,23,0.04)" }} isAnimationActive={false} />
            <Bar dataKey="display_score" radius={[0, 3, 3, 0]}
              maxBarSize={16} isAnimationActive={false}
              label={{
                position: "right", fontSize: 8, fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700, fill: MUTED,
                formatter: (v, _, i) => `#${chartData[i]?.rank}`,
              }}>
              {chartData.map((entry) => (
                <Cell
                  key={entry.ticker}
                  fill={rankColor(entry.rank, topN)}
                  fillOpacity={entry.rank <= topN ? 0.90 : 0.30}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{ fontSize: 8, color: MUTED, textAlign: "right", paddingRight: 12, paddingBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>
          12-1 momentum (Jegadeesh-Titman) · Cross-sectional normalised [-1,+1]
        </div>
      </div>
    </div>
  );
}

// ── Tab 1: History ────────────────────────────────────────────────────────────
function HistoryView({ history, topN }) {
  // history: array of { month, date, scores[] } sorted newest first
  // For each month, compute which tickers were in top N

  const months = useMemo(() =>
    history.map(h => ({
      month:   h.month,
      date:    h.date,
      top:     h.scores.slice(0, topN).map(s => s.ticker),
      topSet:  new Set(h.scores.slice(0, topN).map(s => s.ticker)),
      scores:  h.scores,
    })), [history, topN]);

  // Universe of tickers that have appeared in top N at least once
  const allTickers = useMemo(() => {
    const set = new Set();
    months.forEach(m => m.top.forEach(t => set.add(t)));
    return Array.from(set).sort();
  }, [months]);

  if (months.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0", color: MUTED }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>📅</div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
          No history yet. Scores will appear here after first month-end run.
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ fontSize: 15, color: GOLD, margin: "0 0 6px", fontFamily: "'Playfair Display', serif" }}>
        Month-by-Month Top {topN} Composition
      </h3>
      <p style={{ fontSize: 11, color: SUB, margin: "0 0 16px" }}>
        ✓ = in top {topN} that month · highlighted stocks appeared most consistently
      </p>

      {/* Heatmap table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", fontSize: 11, minWidth: "100%" }}>
          <thead>
            <tr>
              <th style={{
                padding: "8px 12px", textAlign: "left", color: GOLD,
                fontWeight: 700, borderBottom: `2px solid rgba(212,160,23,0.2)`,
                fontFamily: "'DM Sans', sans-serif", position: "sticky", left: 0,
                background: "#080F1A", whiteSpace: "nowrap",
              }}>Ticker</th>
              {months.map(m => (
                <th key={m.month} style={{
                  padding: "8px 6px", textAlign: "center", color: GOLD,
                  fontWeight: 700, borderBottom: `2px solid rgba(212,160,23,0.2)`,
                  fontFamily: "'DM Sans', sans-serif", fontSize: 9,
                  letterSpacing: 0.5, whiteSpace: "nowrap",
                }}>
                  {m.month}
                </th>
              ))}
              <th style={{
                padding: "8px 8px", textAlign: "center", color: GOLD,
                fontWeight: 700, borderBottom: `2px solid rgba(212,160,23,0.2)`,
                fontFamily: "'DM Sans', sans-serif",
              }}>Count</th>
            </tr>
          </thead>
          <tbody>
            {allTickers
              .map(ticker => {
                const appearances = months.filter(m => m.topSet.has(ticker)).length;
                return { ticker, appearances };
              })
              .sort((a, b) => b.appearances - a.appearances)
              .map(({ ticker, appearances }) => (
                <tr key={ticker} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <td style={{
                    padding: "7px 12px", fontWeight: 700, color: "#e2e8f0",
                    fontFamily: "'DM Sans', sans-serif", position: "sticky", left: 0,
                    background: "#080F1A", whiteSpace: "nowrap",
                  }}>{ticker}</td>
                  {months.map(m => {
                    const inTop = m.topSet.has(ticker);
                    const stockScore = m.scores.find(s => s.ticker === ticker);
                    const score = stockScore?.norm_score;
                    return (
                      <td key={m.month} title={score != null ? `Score: ${score.toFixed(3)}` : "Not ranked"}
                        style={{
                          padding: "7px 6px", textAlign: "center",
                          background: inTop ? "rgba(212,160,23,0.14)" : "transparent",
                          borderRadius: 4,
                        }}>
                        {inTop
                          ? <span style={{ color: GOLD, fontWeight: 800, fontSize: 12 }}>✓</span>
                          : <span style={{ color: "rgba(255,255,255,0.1)", fontSize: 10 }}>·</span>
                        }
                      </td>
                    );
                  })}
                  <td style={{ padding: "7px 8px", textAlign: "center" }}>
                    <span style={{
                      fontSize: 11, fontWeight: 800,
                      color: appearances >= months.length * 0.6 ? GREEN
                           : appearances >= months.length * 0.3 ? ORANGE : MUTED,
                    }}>{appearances}</span>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {/* Turnover stats */}
      {months.length >= 2 && (
        <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
          {months.slice(0, -1).map((m, i) => {
            const next    = months[i + 1];
            const exits   = next.top.filter(t => !m.topSet.has(t)).length;
            const entries = m.top.filter(t => !next.topSet.has(t)).length;
            return (
              <div key={m.month} style={{
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 8, padding: "8px 14px", fontSize: 10, color: SUB,
                fontFamily: "'DM Sans', sans-serif",
              }}>
                <div style={{ fontWeight: 700, color: "#e2e8f0", marginBottom: 2 }}>{next.month} → {m.month}</div>
                <span style={{ color: GREEN, marginRight: 8 }}>▲ {entries} new</span>
                <span style={{ color: RED }}>▼ {exits} dropped</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function MomentumDashboard() {
  const [tab,     setTab]     = useState(0);
  const [topN,    setTopN]    = useState(10);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // Current month data
  const [current, setCurrent] = useState(null);   // { date, month, scores[] }
  // History: last 24 months
  const [history, setHistory] = useState([]);

  // ── Load data from Firestore ────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        // 1. Get latest pointer
        const latestSnap = await getDoc(doc(db, "momentum_scores", "_latest"));
        if (!latestSnap.exists()) {
          setError("No momentum data yet. Run daily_tasks.py at month-end to generate scores.");
          setLoading(false);
          return;
        }
        const { month: latestMonth } = latestSnap.data();

        // 2. Load current month
        const currSnap = await getDoc(doc(db, "momentum_scores", latestMonth));
        if (currSnap.exists() && !cancelled) {
          const d = currSnap.data();
          setCurrent({
            month:  latestMonth,
            date:   d.date,
            scores: d.scores || [],
            count:  d.count  || 0,
            universe: d.universe || "nifty100",
          });
        }

        // 3. Load last 24 months for history
        const histQuery = query(
          collection(db, "momentum_scores"),
          orderBy("date", "desc"),
          limit(25),
        );
        const histSnap = await getDocs(histQuery);
        const hist = [];
        histSnap.forEach(d => {
          if (d.id === "_latest") return;
          const data = d.data();
          hist.push({
            month:  d.id,
            date:   data.date,
            scores: data.scores || [],
          });
        });
        if (!cancelled) {
          setHistory(hist.sort((a, b) => b.date.localeCompare(a.date)));
        }

      } catch (err) {
        if (!cancelled) {
          setError(`Failed to load data: ${err.message}`);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, []);

  // ── Derived stats ───────────────────────────────────────────────────────────
  const topScores     = useMemo(() => current?.scores?.slice(0, topN) ?? [], [current, topN]);
  const avgRet        = useMemo(() => {
    if (!topScores.length) return null;
    return topScores.reduce((s, x) => s + x.ret_11m, 0) / topScores.length;
  }, [topScores]);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{
      background: `linear-gradient(135deg, ${NAVY} 0%, #0a1628 100%)`,
      minHeight: "100vh", color: "#e2e8f0",
      fontFamily: "'DM Sans', sans-serif",
      paddingTop: 92,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />

      <Link to="/" style={{
        position: "fixed", top: 20, left: 28, zIndex: 10000,
        color: GOLD, textDecoration: "none", fontWeight: 700,
        background: "rgba(13,27,42,0.95)", padding: "8px 18px",
        borderRadius: 8, fontSize: 13, boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      }}>← Back</Link>

      {/* ── Header ── */}
      <div style={{ padding: "80px 28px 0", borderBottom: `1px solid rgba(212,160,23,0.18)` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 10, color: GOLD, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700 }}>
              Alpha Edge Research · Quant
            </div>
            <h1 style={{ margin: "6px 0 2px", fontSize: 30, fontWeight: 800, fontFamily: "'Playfair Display', serif", color: "#fff" }}>
              Momentum Factor
            </h1>
            <div style={{ fontSize: 12, color: SUB }}>
              12-1 Cross-Sectional Momentum · {current?.universe ?? "Nifty 100"} universe
            </div>
          </div>

          {/* Status badge */}
          {!loading && !error && current && (
            <div style={{
              padding: "8px 16px", background: "rgba(39,174,96,0.1)",
              border: `1px solid ${GREEN}44`, borderRadius: 8,
              display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2,
            }}>
              <span style={{ fontSize: 9, color: SUB, letterSpacing: 1 }}>LAST UPDATED</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: GREEN }}>{current.date}</span>
            </div>
          )}
        </div>

        {/* Metric cards */}
        {!loading && !error && current && (
          <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
            <MetricCard label="Universe" value={`${current.count}`} sub="stocks scored" />
            <MetricCard
              label={`Top ${topN} Avg Return`}
              value={avgRet != null ? `${avgRet >= 0 ? "+" : ""}${(avgRet * 100).toFixed(1)}%` : "—"}
              sub="11-month momentum"
              color={avgRet >= 0 ? GREEN : RED}
            />
            <MetricCard label="Months History" value={`${history.length}`} sub="monthly snapshots" color={TEAL} />
            <MetricCard
              label="Top Stock"
              value={current.scores[0]?.ticker ?? "—"}
              sub={`Score: ${current.scores[0]?.norm_score?.toFixed(2) ?? "—"}`}
              color={ORANGE}
            />
          </div>
        )}

        {/* Top-N selector + tabs */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", gap: 0 }}>
            {["Current Rankings", "History"].map((t, i) => (
              <TabBtn key={i} label={t} active={tab === i} onClick={() => setTab(i)} />
            ))}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[10, 20, 30].map(n => (
              <NBtn key={n} n={n} active={topN === n} onClick={() => setTopN(n)} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ padding: "24px 28px 60px" }}>

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 0", gap: 12 }}>
            <svg width="32" height="32" viewBox="0 0 32 32" style={{ animation: "momSpin .9s linear infinite" }}>
              <circle cx="16" cy="16" r="12" fill="none" stroke={GOLD} strokeWidth="2.5"
                strokeDasharray="52" strokeDashoffset="14" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: 10, color: GOLD, letterSpacing: 2 }}>LOADING SCORES…</span>
            <style>{`@keyframes momSpin { to { transform:rotate(360deg) } }`}</style>
          </div>
        )}

        {/* Error / empty state */}
        {!loading && error && (
          <div style={{
            maxWidth: 560, margin: "60px auto", textAlign: "center",
            background: "rgba(192,57,43,0.08)", border: `1px solid ${RED}33`,
            borderRadius: 12, padding: "32px 28px",
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔴</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: RED, marginBottom: 8 }}>No Data Available</div>
            <div style={{ fontSize: 12, color: SUB, lineHeight: 1.8 }}>{error}</div>

            {/* Setup instructions */}
            <div style={{
              marginTop: 24, textAlign: "left", background: "rgba(255,255,255,0.03)",
              borderRadius: 8, padding: "16px 18px",
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, marginBottom: 10, letterSpacing: 1 }}>QUICK START</div>
              {[
                "pip install firebase-admin pyarrow",
                "Save firebase_service_account.json in script folder",
                "python daily_tasks.py --force-month-end",
              ].map((step, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 9, fontWeight: 800, color: GOLD, minWidth: 16, paddingTop: 1 }}>{i + 1}.</span>
                  <code style={{ fontSize: 10, color: "#c8dae8", background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: 4 }}>
                    {step}
                  </code>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        {!loading && !error && current && tab === 0 && (
          <CurrentRankings scores={current.scores} topN={topN} asOfDate={current.date} />
        )}
        {!loading && !error && tab === 1 && (
          <HistoryView history={history} topN={topN} />
        )}

        {/* Footer note */}
        {!loading && !error && (
          <div style={{ fontSize: 10, color: MUTED, marginTop: 24, lineHeight: 1.8 }}>
            ★ Momentum = 11-month return (t−252 to t−21) normalised cross-sectionally to [−1, +1] ·
            Jegadeesh &amp; Titman (1993) · Data via Zerodha · Not SEBI-registered investment advice.
          </div>
        )}
      </div>
    </div>
  );
}