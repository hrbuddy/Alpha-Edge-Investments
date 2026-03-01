/**
 * StockModal.js
 * ─────────────
 * Global stock chart bottom sheet — usable from any page.
 *
 * Usage in any component:
 *   import { useStockModal } from "./StockModal";
 *   const { openModal } = useStockModal();
 *   <span onClick={() => openModal("RELIANCE")}>RELIANCE</span>
 *
 * Data source: Firestore stock_prices/{ticker}
 *   { points: [{ts, open, high, low, close, volume}, ...] }
 */

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import { STOCK_ROUTES, STOCKS } from "./dashboards/stocksDB";

// ── Constants ────────────────────────────────────────────────────────────────
const GOLD  = "#D4A017";
const NAVY  = "#0D1B2A";
const GREEN = "#27AE60";
const RED   = "#E74C3C";

const PERIODS = [
  { label:"1M",  days:30   },
  { label:"3M",  days:90   },
  { label:"6M",  days:180  },
  { label:"1Y",  days:365  },
  { label:"3Y",  days:1095 },
  { label:"Max", days:null },
];

// ── Context ──────────────────────────────────────────────────────────────────
const StockModalContext = createContext(null);

export function useStockModal() {
  const ctx = useContext(StockModalContext);
  if (!ctx) throw new Error("useStockModal must be used inside StockModalProvider");
  return ctx;
}

// ── Firestore fetch ──────────────────────────────────────────────────────────
async function fetchStockData(ticker) {
  try {
    const snap = await getDoc(doc(db, "stock_prices", ticker));
    if (snap.exists()) {
      const pts = snap.data().points ?? [];
      if (pts.length > 0) return pts;
    }
  } catch (e) {
    console.warn("StockModal Firestore error:", e);
  }
  return null;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function sliceByDays(pts, days) {
  if (!days) return pts;
  const cutoff = Date.now() - days * 86400000;
  const sliced = pts.filter(p => p.ts >= cutoff);
  return sliced.length > 1 ? sliced : pts.slice(-days);
}

function fmtPrice(v) {
  if (v == null) return "—";
  return `₹${v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtVol(v) {
  if (v == null || v === 0) return "—";
  if (v >= 1e7) return `${(v / 1e7).toFixed(2)}Cr`;
  if (v >= 1e5) return `${(v / 1e5).toFixed(2)}L`;
  return v.toLocaleString("en-IN");
}

function fmtDate(ts) {
  return new Date(ts).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}


function momentumLabel(score) {
  if (score == null) return null;
  if (score >= 0.6)  return { text: "STRONG",   color: "#27AE60" };
  if (score >= 0.2)  return { text: "POSITIVE",  color: "#2ECC71" };
  if (score >= -0.2) return { text: "NEUTRAL",   color: "#F39C12" };
  if (score >= -0.6) return { text: "WEAK",      color: "#E67E22" };
  return               { text: "NEGATIVE",  color: "#E74C3C" };
}

// ── Look up if ticker has a full research page ───────────────────────────────
function getResearchPath(ticker) {
  const entry = STOCK_ROUTES.find(({ stockId }) => {
    const s = STOCKS[stockId];
    return s?.nse === ticker || stockId.toUpperCase() === ticker;
  });
  return entry ? entry.path : null;
}

// ── Custom tooltip ───────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div style={{
      background: "rgba(6,14,26,0.97)",
      border: `1px solid rgba(212,160,23,0.28)`,
      borderRadius: 10, padding: "10px 14px",
      fontFamily: "'DM Sans',sans-serif",
      boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
    }}>
      <div style={{ fontSize: 9, color: GOLD, letterSpacing: "1px", marginBottom: 6 }}>
        {fmtDate(d?.ts)}
      </div>
      <div style={{ fontSize: 13, fontWeight: 800, color: "#e2e8f0" }}>{fmtPrice(d?.close)}</div>
      {d?.volume != null && (
        <div style={{ fontSize: 10, color: "#5a7a94", marginTop: 3 }}>Vol: {fmtVol(d?.volume)}</div>
      )}
    </div>
  );
}

// ── News fetch (Yahoo Finance via allorigins proxy, 1hr TTL) ─────────────────
const NEWS_TTL_SM = 60 * 60 * 1000;
function smGetNewsCache(ticker) {
  try {
    const raw = localStorage.getItem(`ae_news_${ticker}`);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > NEWS_TTL_SM) { localStorage.removeItem(`ae_news_${ticker}`); return null; }
    return data;
  } catch { return null; }
}
function smSetNewsCache(ticker, data) {
  try { localStorage.setItem(`ae_news_${ticker}`, JSON.stringify({ data, ts: Date.now() })); } catch {}
}
async function fetchNewsForModal(ticker) {
  const cached = smGetNewsCache(ticker);
  if (cached) return cached;
  try {
    const q     = `${ticker}.NS`;
    const yfUrl = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&newsCount=3&enableFuzzyQuery=false&enableNavLinks=false&enableCb=false`;
    const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(yfUrl)}`;
    const res   = await fetch(proxy, { cache: "no-store" });
    const json  = await res.json();
    const parsed = JSON.parse(json.contents);
    const news = (parsed?.news ?? []).slice(0, 3).map(n => ({
      title:     n.title,
      publisher: n.publisher,
      link:      n.link,
      time:      n.providerPublishTime,
    }));
    smSetNewsCache(ticker, news);
    return news;
  } catch { return []; }
}

// ── The modal sheet itself ───────────────────────────────────────────────────
function StockSheet({ ticker, extraData, onClose }) {
  const navigate              = useNavigate();
  const [pts, setPts]         = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);
  const [period, setPeriod]   = useState("1Y");
  const [news, setNews]       = useState(null);   // null = loading, [] = none found
  const sheetRef              = useRef(null);

  // Fetch price data + scroll sheet to top on open
  useEffect(() => {
    if (!ticker) return;
    setLoading(true); setError(false); setPts(null);
    // Scroll the sheet back to top whenever a new ticker opens
    if (sheetRef.current) sheetRef.current.scrollTop = 0;
    fetchStockData(ticker).then(data => {
      if (data) setPts(data);
      else setError(true);
      setLoading(false);
    });
  }, [ticker]);

  // Fetch news independently — doesn't block the chart
  useEffect(() => {
    if (!ticker) return;
    setNews(null);
    fetchNewsForModal(ticker).then(setNews);
  }, [ticker]);

  // Close on backdrop click
  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  // Close on Escape
  useEffect(() => {
    const handler = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Derived chart data
  const selPeriod  = PERIODS.find(p => p.label === period);
  const chartData  = pts ? sliceByDays(pts, selPeriod?.days ?? null) : [];
  const ltp        = pts?.[pts.length - 1]?.close;
  const prev       = pts?.[pts.length - 2]?.close;
  const dayChg     = (ltp != null && prev != null) ? ltp - prev : null;
  const dayChgPct  = (dayChg != null && prev) ? (dayChg / prev) * 100 : null;
  const isPositive = (dayChg ?? 0) >= 0;
  const accentColor = isPositive ? GREEN : RED;

  // 52-week stats
  const yr = pts ? sliceByDays(pts, 365) : [];
  const hi52 = yr.length ? Math.max(...yr.map(p => p.high ?? p.close)) : null;
  const lo52 = yr.length ? Math.min(...yr.map(p => p.low  ?? p.close)) : null;
  const avgVol = yr.length ? Math.round(yr.reduce((s, p) => s + (p.volume ?? 0), 0) / yr.length) : null;

  const researchPath = getResearchPath(ticker);

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={handleBackdropClick}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
          zIndex: 1200,
          animation: "smFadeIn .2s ease",
        }}
      />

      {/* ── Sheet ── */}
      <div
        ref={sheetRef}
        style={{
          position: "fixed",
          bottom: 0, left: 0, right: 0,
          zIndex: 1201,
          background: "#080F1A",
          borderTop: `2px solid ${GOLD}`,
          borderRadius: "20px 20px 0 0",
          padding: "0 0 env(safe-area-inset-bottom)",
          maxHeight: "calc(100vh - 100px)",
          overflowY: "auto",
          animation: "smSlideUp .28s cubic-bezier(.22,1,.36,1)",
          boxShadow: "0 -16px 60px rgba(0,0,0,0.7)",
          fontFamily: "'DM Sans',sans-serif",
        }}
      >
        {/* ── Sticky top bar: drag handle + close button always visible ── */}
        <div style={{
          position:"sticky", top:0, zIndex:10,
          background:"#080F1A",
          borderBottom:"1px solid rgba(255,255,255,0.04)",
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"10px 20px 8px",
        }}>
          {/* Drag handle centered */}
          <div style={{ flex:1 }}/>
          <div style={{ width:40, height:4, borderRadius:2, background:"rgba(255,255,255,0.14)", flex:0 }}/>
          <div style={{ flex:1, display:"flex", justifyContent:"flex-end" }}>
            <button
              onClick={onClose}
              style={{
                background:"rgba(255,255,255,0.09)", border:"1px solid rgba(255,255,255,0.12)",
                borderRadius:"50%", width:36, height:36,
                color:"#e2e8f0", fontSize:20, cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow:"0 2px 8px rgba(0,0,0,0.4)",
              }}
            >×</button>
          </div>
        </div>

        <div style={{ padding: "16px 20px 32px", maxWidth: 860, margin: "0 auto" }}>

          {/* ── Header row ── */}
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:16 }}>
            <div>
              <div style={{ fontSize:10, color: GOLD, fontWeight:700, letterSpacing:"1.5px", marginBottom:4 }}>
                NSE · INDIA
              </div>
              <div style={{ fontSize:28, fontWeight:900, color:"#e2e8f0", lineHeight:1, fontFamily:"'Playfair Display',serif" }}>
                {ticker}
              </div>
              {/* LTP + change */}
              {!loading && !error && ltp != null && (
                <div style={{ display:"flex", alignItems:"baseline", gap:12, marginTop:8 }}>
                  <span style={{ fontSize:22, fontWeight:800, color:"#e2e8f0" }}>
                    {fmtPrice(ltp)}
                  </span>
                  {dayChg != null && (
                    <span style={{ fontSize:13, fontWeight:700, color: accentColor }}>
                      {dayChg >= 0 ? "▲" : "▼"} {fmtPrice(Math.abs(dayChg))} ({dayChgPct >= 0 ? "+" : ""}{dayChgPct?.toFixed(2)}%)
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Period tabs ── */}
          <div style={{ display:"flex", gap:6, marginBottom:14 }}>
            {PERIODS.map(p => (
              <button key={p.label} onClick={() => setPeriod(p.label)} style={{
                padding:"4px 13px", borderRadius:6,
                border:`1px solid ${period === p.label ? GOLD : "rgba(255,255,255,0.1)"}`,
                background: period === p.label ? "rgba(212,160,23,0.14)" : "transparent",
                color: period === p.label ? GOLD : "#5a7a94",
                fontSize:10, fontWeight:700, letterSpacing:"0.8px",
                cursor:"pointer", transition:"all .15s",
              }}>{p.label}</button>
            ))}
          </div>

          {/* ── Chart area ── */}
          <div style={{
            background:"rgba(255,255,255,0.02)",
            border:"1px solid rgba(255,255,255,0.06)",
            borderRadius:14, padding:"14px 8px 8px",
            position:"relative", minHeight:220,
          }}>
            {loading && (
              <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:14, background:"rgba(8,15,26,0.7)" }}>
                <div style={{ width:28, height:28, border:`2px solid rgba(212,160,23,0.2)`, borderTop:`2px solid ${GOLD}`, borderRadius:"50%", animation:"smSpin 0.8s linear infinite" }}/>
              </div>
            )}
            {error && !loading && (
              <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", borderRadius:14 }}>
                <div style={{ fontSize:24, marginBottom:8 }}>📭</div>
                <div style={{ fontSize:12, color:"#5a7a94", marginBottom:4 }}>No price data in Firestore yet</div>
                <div style={{ fontSize:10, color:"rgba(212,160,23,0.5)" }}>Run: python3 stock_ohlcv_backfill.py</div>
              </div>
            )}
            {!loading && !error && chartData.length > 0 && (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData} margin={{ top:4, right:8, left:0, bottom:4 }}>
                  <defs>
                    <linearGradient id="smGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={accentColor} stopOpacity={0.25}/>
                      <stop offset="100%" stopColor={accentColor} stopOpacity={0.01}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                  <XAxis dataKey="ts" type="number" scale="time" domain={["dataMin","dataMax"]}
                    tickFormatter={ts => new Date(ts).toLocaleDateString("en-IN",{ month:"short", year:"2-digit" })}
                    tick={{ fill:"#3d5570", fontSize:9, fontFamily:"'DM Sans',sans-serif" }}
                    tickLine={false} axisLine={{ stroke:"rgba(255,255,255,0.06)" }}
                    minTickGap={60}/>
                  <YAxis
                    tickFormatter={v => `₹${(v/1000).toFixed(0)}k`}
                    tick={{ fill:"#3d5570", fontSize:9, fontFamily:"'DM Sans',sans-serif" }}
                    tickLine={false} axisLine={false} width={48}
                    domain={["auto","auto"]}/>
                  <Tooltip content={<ChartTooltip/>} isAnimationActive={false}/>
                  <Area
                    type="monotone" dataKey="close"
                    stroke={accentColor} strokeWidth={1.8}
                    fill="url(#smGrad)"
                    dot={false} activeDot={{ r:4, strokeWidth:0, fill:accentColor }}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* ── Stats row ── */}
          {!loading && !error && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginTop:14 }}>
              {[
                { label:"52W High",    value: fmtPrice(hi52)    },
                { label:"52W Low",     value: fmtPrice(lo52)    },
                { label:"Avg Volume",  value: fmtVol(avgVol)    },
              ].map(s => (
                <div key={s.label} style={{
                  background:"rgba(255,255,255,0.03)",
                  border:"1px solid rgba(255,255,255,0.06)",
                  borderRadius:10, padding:"10px 12px",
                }}>
                  <div style={{ fontSize:9, color:"#5a7a94", letterSpacing:"0.8px", marginBottom:4, fontWeight:700 }}>
                    {s.label.toUpperCase()}
                  </div>
                  <div style={{ fontSize:14, fontWeight:800, color:"#e2e8f0" }}>{s.value}</div>
                </div>
              ))}
            </div>
          )}

          {/* ── Momentum Score (if opened from FlashCard) ── */}
          {extraData?.momentumScore != null && (() => {
            const score = extraData.momentumScore;
            const pct = ((score + 1) / 2) * 100;
            const ml = momentumLabel(score);
            return (
              <div style={{ marginTop:14, padding:"14px 16px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:14 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                  <span style={{ fontSize:9, fontWeight:800, letterSpacing:"1px", color:"rgba(255,255,255,0.35)" }}>MOMENTUM RANK</span>
                  <span style={{ fontSize:9, fontWeight:800, color: ml.color, letterSpacing:"0.8px" }}>#{extraData.rank} / {extraData.total}</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                  <span style={{ fontSize:9, fontWeight:700, color:"rgba(255,255,255,0.35)", letterSpacing:"0.8px" }}>MOMENTUM SCORE</span>
                  <span style={{ fontSize:12, fontWeight:900, color: ml.color }}>{ml.text} · {pct.toFixed(0)}/100</span>
                </div>
                <div style={{ position:"relative", height:6, borderRadius:3, background:"rgba(255,255,255,0.08)", overflow:"hidden" }}>
                  <div style={{ position:"absolute", left:0, top:0, height:"100%", width:`${Math.max(3, pct)}%`, borderRadius:3, background:`linear-gradient(90deg, ${ml.color}88, ${ml.color})` }}/>
                </div>
              </div>
            );
          })()}

          {/* ── Latest News ── */}
          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 9, color: GOLD, fontWeight: 800, letterSpacing: "0.18em", marginBottom: 10 }}>
              📰 LATEST NEWS
            </div>
            {news === null && (
              <div style={{ fontSize: 11, color: "#3d5570", padding: "10px 0" }}>Loading news…</div>
            )}
            {news?.length === 0 && (
              <div style={{ fontSize: 11, color: "#3d5570", padding: "10px 0" }}>No recent news found.</div>
            )}
            {news?.map((n, i) => {
              const dt = n.time
                ? new Date(n.time * 1000).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
                : "";
              return (
                <a key={i} href={n.link} target="_blank" rel="noopener noreferrer"
                  style={{ textDecoration: "none", display: "block", marginBottom: 8 }}>
                  <div style={{
                    padding: "10px 12px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderLeft: `2px solid rgba(212,160,23,0.35)`,
                    borderRadius: 10, transition: "background .15s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                  >
                    <div style={{ fontSize: 12, color: "#c8dae8", lineHeight: 1.5, fontWeight: 500, marginBottom: 4 }}>
                      {n.title}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <span style={{ fontSize: 9, color: "rgba(212,160,23,0.6)", fontWeight: 700 }}>{n.publisher}</span>
                      {dt && <span style={{ fontSize: 9, color: "#3d5570" }}>{dt}</span>}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>

          {/* ── Action buttons ── */}
          <div style={{ display:"flex", gap:10, marginTop:18, flexWrap:"wrap" }}>
            {researchPath ? (
              <button
                onClick={() => { onClose(); navigate(researchPath); }}
                style={{
                  flex:1, padding:"12px 20px", borderRadius:999,
                  background: GOLD, border:"none",
                  color: NAVY, fontSize:12, fontWeight:800,
                  letterSpacing:"0.5px", cursor:"pointer",
                  fontFamily:"'DM Sans',sans-serif",
                  transition:"opacity .15s",
                }}
                onMouseEnter={e => e.currentTarget.style.opacity="0.88"}
                onMouseLeave={e => e.currentTarget.style.opacity="1"}
              >
                View Full Research →
              </button>
            ) : (
              <button
                onClick={() => { onClose(); navigate("/research-universe#request"); }}
                style={{
                  flex:1, padding:"12px 20px", borderRadius:999,
                  background:"transparent",
                  border:`1.5px solid ${GOLD}`,
                  color: GOLD, fontSize:12, fontWeight:800,
                  letterSpacing:"0.5px", cursor:"pointer",
                  fontFamily:"'DM Sans',sans-serif",
                  transition:"all .15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background="rgba(212,160,23,0.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.background="transparent"; }}
              >
                📩 Request Stock Research
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                padding:"12px 20px", borderRadius:999,
                background:"rgba(255,255,255,0.06)",
                border:"1px solid rgba(255,255,255,0.1)",
                color:"#5a7a94", fontSize:12, fontWeight:700,
                cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
              }}
            >
              Close
            </button>
          </div>

          <div style={{ fontSize:9, color:"#3d5570", textAlign:"center", marginTop:14, letterSpacing:"0.5px" }}>
            Daily data · Source: Zerodha · Not investment advice
          </div>
        </div>
      </div>
    </>
  );
}

// ── Provider — wraps the whole app ───────────────────────────────────────────
export function StockModalProvider({ children }) {
  const [ticker,    setTicker]    = useState(null);
  const [extraData, setExtraData] = useState(null);
  const location = useLocation();

  const openModal  = useCallback((t, extra = null) => {
    setTicker(t?.trim()?.toUpperCase() ?? null);
    setExtraData(extra ?? null);
  }, []);
  const closeModal = useCallback(() => { setTicker(null); setExtraData(null); }, []);

  // Auto-close whenever the user navigates to a different page
  useEffect(() => {
    closeModal();
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <StockModalContext.Provider value={{ openModal, closeModal }}>
      <style>{`
        @keyframes smFadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes smSlideUp { from { transform:translateY(100%) } to { transform:translateY(0) } }
        @keyframes smSpin    { to   { transform:rotate(360deg) } }
        .sm-ticker-link {
          cursor: pointer;
          border-bottom: 1px dashed rgba(212,160,23,0.4);
          transition: color .15s, border-color .15s;
        }
        .sm-ticker-link:hover {
          color: #D4A017 !important;
          border-color: rgba(212,160,23,0.9);
        }
      `}</style>

      {children}

      {ticker && (
        <StockSheet ticker={ticker} extraData={extraData} onClose={closeModal} />
      )}
    </StockModalContext.Provider>
  );
}