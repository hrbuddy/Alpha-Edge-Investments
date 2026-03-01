/**
 * FlashCard.js
 * ─────────────────────────────────────────────────────
 * Tinder-style stock discovery deck for mobile.
 *
 * Data sources:
 *   Firestore: momentum_scores/_latest → month → scores_12m[]
 *   Firestore: stock_prices/{ticker}   → points[]
 *   Yahoo Finance search API           → top 3 news per ticker
 *
 * Install dependency:
 * Usage:
 *   Route: /discover  (see App.js)
 *   FAB:   <DiscoverFAB /> on Home.js (mobile only)
 */

import {
  useState, useEffect, useRef, useCallback, useMemo,
  useImperativeHandle, forwardRef,
} from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { useStockModal } from "./StockModal";
import { useAuth } from "./AuthContext";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { STOCKS, STOCK_ROUTES } from "./dashboards/stocksDB";

// ─── Design tokens ────────────────────────────────────────────────────────────
const GOLD    = "#D4A017";
const NAVY    = "#0D1B2A";
const GREEN   = "#27AE60";
const RED     = "#E74C3C";
const SURFACE = "#0D1829";
const CARD_BG = "#111e2e";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtPrice(v) {
  if (v == null) return "—";
  return `₹${v.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtPct(v, withSign = true) {
  if (v == null) return "—";
  const sign = withSign && v >= 0 ? "+" : "";
  return `${sign}${v.toFixed(2)}%`;
}

function calcYTD(points) {
  if (!points?.length) return null;
  const jan1 = new Date(new Date().getFullYear(), 0, 1).getTime();
  const start = [...points].reverse().find(p => p.ts <= jan1) ?? points[0];
  const end   = points[points.length - 1];
  if (!start || !end || start === end) return null;
  return (end.close / start.close - 1) * 100;
}

function sliceDays(points, days) {
  if (!points?.length) return [];
  const cutoff = Date.now() - days * 86400000;
  const s = points.filter(p => p.ts >= cutoff);
  return s.length > 2 ? s : points.slice(-days);
}

function momentumLabel(score) {
  if (score >= 0.6)  return { text: "STRONG",   color: "#27AE60" };
  if (score >= 0.2)  return { text: "POSITIVE",  color: "#2ECC71" };
  if (score >= -0.2) return { text: "NEUTRAL",   color: "#F39C12" };
  if (score >= -0.6) return { text: "WEAK",      color: "#E67E22" };
  return               { text: "NEGATIVE",  color: RED };
}

function getResearchPath(ticker) {
  const entry = STOCK_ROUTES.find(({ stockId }) => {
    const s = STOCKS[stockId];
    return s?.nse === ticker || stockId.toUpperCase() === ticker;
  });
  return entry ? entry.path : null;
}

function getSector(ticker) {
  const stock = Object.values(STOCKS).find(s => s.nse === ticker);
  return stock?.sector ?? null;
}

// ─── localStorage helpers ─────────────────────────────────────────────────────

// News — 1-hour TTL
const NEWS_TTL = 60 * 60 * 1000;
function lsGetNews(ticker) {
  try {
    const raw = localStorage.getItem(`ae_news_${ticker}`);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > NEWS_TTL) { localStorage.removeItem(`ae_news_${ticker}`); return null; }
    return data;
  } catch { return null; }
}
function lsSetNews(ticker, data) {
  try { localStorage.setItem(`ae_news_${ticker}`, JSON.stringify({ data, ts: Date.now() })); } catch {}
}

// Wishlist — persists indefinitely, survives page refresh
const WISHLIST_KEY = "ae_wishlist";
export function lsGetWishlist() {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function lsSetWishlist(tickers) {
  try { localStorage.setItem(WISHLIST_KEY, JSON.stringify(tickers)); } catch {}
}
function lsAddToWishlist(ticker) {
  const current = lsGetWishlist();
  if (!current.includes(ticker)) {
    const updated = [...current, ticker];
    lsSetWishlist(updated);
    return updated;
  }
  return current;
}

// ─── Firestore fetchers ───────────────────────────────────────────────────────
async function fetchLatestMomentum() {
  try {
    const latestSnap = await getDoc(doc(db, "momentum_scores", "_latest"));
    if (!latestSnap.exists()) return null;
    const { month } = latestSnap.data();
    const monthSnap = await getDoc(doc(db, "momentum_scores", month));
    if (!monthSnap.exists()) return null;
    const data = monthSnap.data();
    return {
      date:   data.date,
      scores: data.scores_12m ?? [],
    };
  } catch (e) {
    console.warn("fetchLatestMomentum:", e);
    return null;
  }
}

// ─── Lazy per-card fetchers ───────────────────────────────────────────────────
// We cache in module-level Map so multiple cards sharing a render don't double-fetch
const priceCache  = new Map();
const priceInFlight = new Map();

async function fetchPrice(ticker) {
  if (priceCache.has(ticker)) return priceCache.get(ticker);
  if (priceInFlight.has(ticker)) return priceInFlight.get(ticker);

  const promise = getDoc(doc(db, "stock_prices", ticker)).then(snap => {
    if (!snap.exists()) return null;
    const pts = snap.data().points ?? [];
    priceCache.set(ticker, pts.length ? pts : null);
    return pts.length ? pts : null;
  }).catch(() => null);

  priceInFlight.set(ticker, promise);
  const result = await promise;
  priceInFlight.delete(ticker);
  return result;
}

async function fetchNews(ticker) {
  const cached = lsGetNews(ticker);
  if (cached) return cached;

  // Try Google News RSS first (more reliable than Yahoo Finance)
  const stockName = Object.values(
    (typeof STOCKS !== "undefined" ? STOCKS : {})
  ).find(s => s.nse === ticker)?.name ?? ticker;

  const googleQuery = encodeURIComponent(`${stockName} NSE stock`);
  const rssUrl  = `https://news.google.com/rss/search?q=${googleQuery}&hl=en-IN&gl=IN&ceid=IN:en`;
  const proxy   = `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`;

  try {
    const res  = await fetch(proxy, { cache: "no-store" });
    const json = await res.json();
    const xml  = json.contents ?? "";
    const parser = new DOMParser();
    const doc    = parser.parseFromString(xml, "text/xml");
    const items  = Array.from(doc.querySelectorAll("item")).slice(0, 3);
    if (items.length > 0) {
      const news = items.map(item => {
        const rawTitle = item.querySelector("title")?.textContent ?? "";
        // Google News titles often end with " - Publisher"
        const titleParts = rawTitle.split(" - ");
        const publisher  = titleParts.length > 1 ? titleParts[titleParts.length - 1] : "Google News";
        const title      = titleParts.slice(0, -1).join(" - ") || rawTitle;
        const link       = item.querySelector("link")?.textContent
                         ?? item.querySelector("guid")?.textContent ?? "#";
        const pubDate    = item.querySelector("pubDate")?.textContent;
        const time       = pubDate ? Math.floor(new Date(pubDate).getTime() / 1000) : null;
        return { title, publisher, link, time };
      });
      lsSetNews(ticker, news);
      return news;
    }
  } catch { /* fall through */ }

  // Fallback: Yahoo Finance via allorigins
  try {
    const q     = `${ticker}.NS`;
    const yfUrl = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&newsCount=3&enableFuzzyQuery=false&enableNavLinks=false&enableCb=false`;
    const proxy2 = `https://api.allorigins.win/get?url=${encodeURIComponent(yfUrl)}`;
    const res2   = await fetch(proxy2, { cache: "no-store" });
    const json2  = await res2.json();
    const data   = JSON.parse(json2.contents);
    const news   = (data?.news ?? []).slice(0, 3).map(n => ({
      title:     n.title,
      publisher: n.publisher,
      link:      n.link,
      time:      n.providerPublishTime,
    }));
    if (news.length > 0) { lsSetNews(ticker, news); return news; }
  } catch { /* ignore */ }

  return [];
}


// ─── SwipeCard — custom touch/mouse swipe wrapper (no external lib) ───────────
// Exposes ref.swipe(direction) for programmatic swipe (button controls)
const SwipeCard = forwardRef(({ index, isTop, scale, yOffset, zIndex, onSwipe, children }, ref) => {
  const [drag,    setDrag]    = useState({ x: 0, rotate: 0, dragging: false });
  const [exiting, setExiting] = useState(null); // "left" | "right" | null
  const startRef  = useRef(null);
  const THRESHOLD = 80;

  // Expose programmatic swipe to parent via ref
  useImperativeHandle(ref, () => ({
    swipe(dir) { triggerExit(dir); },
  }));

  function triggerExit(dir) {
    setExiting(dir);
    setTimeout(() => {
      setExiting(null);
      setDrag({ x: 0, rotate: 0, dragging: false });
      onSwipe(dir);
    }, 320);
  }

  function onPointerDown(e) {
    if (!isTop) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    startRef.current = { x: e.clientX, y: e.clientY };
    setDrag(d => ({ ...d, dragging: true }));
  }

  function onPointerMove(e) {
    if (!isTop || !startRef.current) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    // Block if mostly vertical
    if (Math.abs(dy) > Math.abs(dx) * 1.5) return;
    setDrag({ x: dx, rotate: dx * 0.08, dragging: true });
  }

  function onPointerUp(e) {
    if (!isTop || !startRef.current) return;
    startRef.current = null;
    const dx = drag.x;
    if (Math.abs(dx) >= THRESHOLD) {
      triggerExit(dx > 0 ? "right" : "left");
    } else {
      setDrag({ x: 0, rotate: 0, dragging: false });
    }
  }

  // Compute transform
  let tx = drag.x, rot = drag.rotate, opacity = 1;
  if (exiting === "right") { tx = 600;  rot = 20;  opacity = 0; }
  if (exiting === "left")  { tx = -600; rot = -20; opacity = 0; }

  const isDragging   = drag.dragging && isTop;
  const swipeRatio   = Math.min(Math.abs(drag.x) / THRESHOLD, 1);

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{
        position:        "absolute",
        inset:           0,
        transform:       `scale(${scale}) translateY(${yOffset}px) translateX(${tx}px) rotate(${rot}deg)`,
        zIndex,
        transformOrigin: "bottom center",
        transition:      exiting
          ? "transform 0.32s cubic-bezier(.22,1,.36,1), opacity 0.32s ease"
          : isDragging
            ? "none"
            : "transform 0.3s ease",
        opacity,
        cursor:          isTop ? (isDragging ? "grabbing" : "grab") : "default",
        touchAction:     "none",
        willChange:      "transform",
      }}
    >
      {/* Live swipe hint overlays while dragging */}
      {isTop && drag.x > 20 && (
        <div style={{
          position:"absolute", inset:0, zIndex:10,
          display:"flex", alignItems:"center", justifyContent:"center",
          pointerEvents:"none",
          opacity: swipeRatio, transition:"opacity .1s",
        }}>
          <div style={{
            padding:"14px 28px", borderRadius:16,
            background:"rgba(39,174,96,0.2)",
            border:"3px solid rgba(39,174,96,0.8)",
            transform:`rotate(-8deg)`,
          }}>
            <span style={{ fontSize:42, fontWeight:900, color:"#27AE60", letterSpacing:"0.06em", fontFamily:"'DM Sans',sans-serif", textShadow:"0 2px 12px rgba(39,174,96,0.5)" }}>LIKE ♥</span>
          </div>
        </div>
      )}
      {isTop && drag.x < -20 && (
        <div style={{
          position:"absolute", inset:0, zIndex:10,
          display:"flex", alignItems:"center", justifyContent:"center",
          pointerEvents:"none",
          opacity: swipeRatio, transition:"opacity .1s",
        }}>
          <div style={{
            padding:"14px 28px", borderRadius:16,
            background:"rgba(231,76,60,0.2)",
            border:"3px solid rgba(231,76,60,0.8)",
            transform:`rotate(8deg)`,
          }}>
            <span style={{ fontSize:42, fontWeight:900, color:"#E74C3C", letterSpacing:"0.06em", fontFamily:"'DM Sans',sans-serif", textShadow:"0 2px 12px rgba(231,76,60,0.5)" }}>NOPE ✕</span>
          </div>
        </div>
      )}
      {children}
    </div>
  );
});
SwipeCard.displayName = "SwipeCard";

// ─── Sub-components ───────────────────────────────────────────────────────────

function SparkLine({ points, positive }) {
  if (!points?.length) return (
    <div style={{ height: 56, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>No chart data</span>
    </div>
  );
  const color = positive ? GREEN : RED;
  return (
    <ResponsiveContainer width="100%" height={44}>
      <AreaChart data={points} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
        <defs>
          <linearGradient id={`fcGrad_${positive ? "g" : "r"}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity={0.3}/>
            <stop offset="100%" stopColor={color} stopOpacity={0.0}/>
          </linearGradient>
        </defs>
        <Area
          type="monotone" dataKey="close"
          stroke={color} strokeWidth={1.8}
          fill={`url(#fcGrad_${positive ? "g" : "r"})`}
          dot={false} isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function MomentumBar({ score }) {
  // score is -1 to +1, display as 0–100
  const pct      = ((score + 1) / 2) * 100;
  const { text, color } = momentumLabel(score);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", color: "rgba(255,255,255,0.35)", fontFamily: "'DM Sans',sans-serif" }}>
          MOMENTUM
        </span>
        <span style={{ fontSize: 9, fontWeight: 800, color, letterSpacing: "0.06em", fontFamily: "'DM Sans',sans-serif" }}>
          {text}
        </span>
      </div>
      <div style={{ position: "relative", height: 5, borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
        <div style={{
          position: "absolute", left: 0, top: 0, height: "100%",
          width: `${Math.max(3, pct)}%`,
          borderRadius: 3,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          transition: "width .6s cubic-bezier(.22,1,.36,1)",
        }}/>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
        <span style={{ fontSize: 8, color: "rgba(255,255,255,0.2)", fontFamily: "'DM Sans',sans-serif" }}>WEAK</span>
        <span style={{ fontSize: 8, color, fontWeight: 700, fontFamily: "'DM Sans',sans-serif" }}>
          {pct.toFixed(0)}/100
        </span>
        <span style={{ fontSize: 8, color: "rgba(255,255,255,0.2)", fontFamily: "'DM Sans',sans-serif" }}>STRONG</span>
      </div>
    </div>
  );
}

function NewsItem({ item }) {
  const dt = item.time
    ? new Date(item.time * 1000).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
    : "";
  return (
    <a href={item.link} target="_blank" rel="noopener noreferrer"
      style={{ textDecoration: "none", display: "block" }}
      onClick={e => e.stopPropagation()}>
      <div style={{
        padding: "8px 10px",
        background: "rgba(255,255,255,0.04)",
        borderRadius: 8, marginBottom: 5,
        borderLeft: `2px solid rgba(212,160,23,0.25)`,
        transition: "background .15s",
      }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
      >
        <div style={{ fontSize: 11, color: "#c8dae8", lineHeight: 1.45, fontFamily: "'DM Sans',sans-serif", fontWeight: 500, marginBottom: 3 }}>
          {item.title}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 9, color: "rgba(212,160,23,0.55)", fontFamily: "'DM Sans',sans-serif", fontWeight: 700 }}>
            {item.publisher}
          </span>
          {dt && <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", fontFamily: "'DM Sans',sans-serif" }}>{dt}</span>}
        </div>
      </div>
    </a>
  );
}

// ─── Single card content ───────────────────────────────────────────────────────
function CardContent({ item, isTop, onSwipeLeft, onSwipeRight, onOpenStock }) {
  const [priceData, setPriceData] = useState(null);
  const [news,      setNews]      = useState(null);
  const [loaded,    setLoaded]    = useState(false);

  // Lazy-load price + news when this card is near the top
  useEffect(() => {
    if (!isTop || loaded) return;
    setLoaded(true);
    fetchPrice(item.ticker).then(pts => {
      setPriceData(pts);
    });
    fetchNews(item.ticker).then(n => {
      setNews(n);
    });
  }, [isTop, item.ticker, loaded]);

  const ltp        = priceData?.[priceData.length - 1]?.close ?? null;
  const prev       = priceData?.[priceData.length - 2]?.close ?? null;
  const dayChg     = (ltp != null && prev != null) ? ((ltp - prev) / prev) * 100 : null;
  const ytd        = calcYTD(priceData);
  const sparkData  = useMemo(() => sliceDays(priceData, 90), [priceData]);
  const positive   = (ytd ?? 0) >= 0;
  const sector     = getSector(item.ticker);
  const hasResearch = !!getResearchPath(item.ticker);

  return (
    <div style={{
      background:   CARD_BG,
      borderRadius: 22,
      border:       `1px solid rgba(212,160,23,0.15)`,
      borderTop:    `2px solid ${GOLD}`,
      overflow:     "hidden",
      height:       "100%",
      display:      "flex",
      flexDirection:"column",
      boxShadow:    "0 24px 60px rgba(0,0,0,0.6), 0 2px 12px rgba(212,160,23,0.08)",
      fontFamily:   "'DM Sans',sans-serif",
      userSelect:   "none",
    }}>

      {/* ── Header ── */}
      <div style={{ padding: "18px 20px 14px", flex: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div>
            {/* Rank badge */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
              <div style={{
                padding: "2px 8px", borderRadius: 4,
                background: "rgba(212,160,23,0.12)",
                border: "1px solid rgba(212,160,23,0.25)",
              }}>
                <span style={{ fontSize: 9, color: GOLD, fontWeight: 800, letterSpacing: "0.08em" }}>
                  #{item.rank} MOMENTUM
                </span>
              </div>
              {hasResearch && (
                <div style={{
                  padding: "2px 8px", borderRadius: 4,
                  background: "rgba(39,174,96,0.12)",
                  border: "1px solid rgba(39,174,96,0.3)",
                }}>
                  <span style={{ fontSize: 9, color: GREEN, fontWeight: 800, letterSpacing: "0.06em" }}>
                    RESEARCH ✓
                  </span>
                </div>
              )}
            </div>

            <div style={{ fontSize: 24, fontWeight: 900, color: "#f0f6ff", lineHeight: 1, fontFamily: "'Playfair Display',serif", letterSpacing: "-0.5px" }}>
              {item.ticker}
            </div>
            {sector && (
              <div style={{ fontSize: 10, color: "rgba(212,160,23,0.5)", fontWeight: 700, letterSpacing: "0.08em", marginTop: 4 }}>
                {sector.toUpperCase()}
              </div>
            )}
          </div>

          {/* Price block */}
          <div style={{ textAlign: "right" }}>
            {ltp != null ? (
              <>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#f0f6ff" }}>
                  {fmtPrice(ltp)}
                </div>
                {dayChg != null && (
                  <div style={{ fontSize: 11, fontWeight: 700, color: dayChg >= 0 ? GREEN : RED, marginTop: 2 }}>
                    {dayChg >= 0 ? "▲" : "▼"} {Math.abs(dayChg).toFixed(2)}%
                  </div>
                )}
              </>
            ) : (
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.2)", marginTop: 8 }}>Loading…</div>
            )}
          </div>
        </div>

        {/* YTD */}
        {ytd != null && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 10px", borderRadius: 6,
            background: positive ? "rgba(39,174,96,0.1)" : "rgba(231,76,60,0.1)",
            border: `1px solid ${positive ? "rgba(39,174,96,0.25)" : "rgba(231,76,60,0.25)"}`,
          }}>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: "0.06em" }}>YTD</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: positive ? GREEN : RED }}>
              {fmtPct(ytd)}
            </span>
          </div>
        )}
      </div>

      {/* ── Sparkline ── */}
      <div style={{ padding: "0 16px", flex: 0 }}>
        <SparkLine points={sparkData} positive={positive} />
      </div>

      {/* ── Divider ── */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.04)", margin: "10px 20px" }}/>

      {/* ── Momentum bar ── */}
      <div style={{ padding: "0 20px 12px", flex: 0 }}>
        <MomentumBar score={item.norm_score} />
        <div style={{ marginTop: 8, display: "flex", gap: 16 }}>
          <div>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", fontWeight: 700, letterSpacing: "0.06em", marginBottom: 2 }}>
              12M RETURN
            </div>
            <div style={{
              fontSize: 13, fontWeight: 800,
              color: (item.ret ?? 0) >= 0 ? GREEN : RED,
            }}>
              {fmtPct(item.ret * 100)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", fontWeight: 700, letterSpacing: "0.06em", marginBottom: 2 }}>
              MOMENTUM RANK
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#c8dae8" }}>
              #{item.rank} / {item.total}
            </div>
          </div>
        </div>
      </div>

      {/* ── Divider ── */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.04)", margin: "0 20px 10px" }}/>

      {/* ── News ── */}
      <div style={{ padding: "0 20px", flex: 1, overflow: "hidden" }}>
        <div style={{ fontSize: 9, color: GOLD, fontWeight: 700, letterSpacing: "0.12em", marginBottom: 8 }}>
          📰 LATEST NEWS
        </div>
        {news === null && (
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>Loading news…</div>
        )}
        {news?.length === 0 && (
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>No recent news found.</div>
        )}
        {news?.slice(0, 1).map((n, i) => <NewsItem key={i} item={n} />)}
      </div>

      {/* ── In-card action buttons ── */}
      <div style={{ padding: "10px 20px 16px", flex: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 32 }}>
        <button
          className="fc-btn-left"
          onClick={e => { e.stopPropagation(); onSwipeLeft(); }}
          style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(231,76,60,0.12)", border: "2px solid rgba(231,76,60,0.45)", color: "#E74C3C", fontSize: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s", boxShadow: "0 4px 16px rgba(231,76,60,0.18)", flexShrink: 0 }}>
          ✕
        </button>
        <button
          onClick={e => { e.stopPropagation(); onOpenStock(); }}
          style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(212,160,23,0.12)", border: "1px solid rgba(212,160,23,0.35)", color: "#D4A017", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s", flexShrink: 0 }}>
          ★
        </button>
        <button
          className="fc-btn-right"
          onClick={e => { e.stopPropagation(); onSwipeRight(); }}
          style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(39,174,96,0.12)", border: "2px solid rgba(39,174,96,0.45)", color: "#27AE60", fontSize: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s", boxShadow: "0 4px 16px rgba(39,174,96,0.18)", flexShrink: 0 }}>
          ♥
        </button>
      </div>

    </div>
  );
}

// ─── Sign-up gate card ────────────────────────────────────────────────────────
function GateCard({ savedTickers, onDismiss }) {
  const navigate = useNavigate();
  return (
    <div style={{
      background: CARD_BG,
      borderRadius: 22,
      border: `2px solid ${GOLD}`,
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "32px 28px",
      textAlign: "center",
      boxShadow: `0 0 60px rgba(212,160,23,0.15), 0 24px 60px rgba(0,0,0,0.6)`,
      fontFamily: "'DM Sans',sans-serif",
    }}>
      <div style={{ fontSize: 44, marginBottom: 16 }}>🔐</div>
      <div style={{ fontSize: 9, color: GOLD, fontWeight: 800, letterSpacing: "0.2em", marginBottom: 12 }}>
        SAVE YOUR PICKS
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 900, color: "#f0f6ff", fontFamily: "'Playfair Display',serif", margin: "0 0 12px", lineHeight: 1.3 }}>
        You've found {savedTickers.length} interesting {savedTickers.length === 1 ? "stock" : "stocks"}
      </h2>

      {savedTickers.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginBottom: 18 }}>
          {savedTickers.map(t => (
            <div key={t} style={{
              padding: "4px 10px", borderRadius: 6,
              background: "rgba(212,160,23,0.1)",
              border: "1px solid rgba(212,160,23,0.3)",
              fontSize: 11, fontWeight: 700, color: GOLD,
            }}>{t}</div>
          ))}
        </div>
      )}

      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: "0 0 24px" }}>
        Create a free account to save your watchlist, get notified when we publish research, and swipe through all 400+ stocks.
      </p>

      <button
        onClick={() => navigate("/signup")}
        style={{
          width: "100%", padding: "14px", borderRadius: 12,
          background: GOLD, border: "none", color: NAVY,
          fontSize: 13, fontWeight: 800, letterSpacing: "0.08em",
          cursor: "pointer", marginBottom: 12,
          boxShadow: "0 4px 20px rgba(212,160,23,0.3)",
        }}>
        SIGN UP FREE — SAVE MY PICKS →
      </button>
      <button
        onClick={onDismiss}
        style={{
          width: "100%", padding: "12px", borderRadius: 12,
          background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
          color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 700,
          cursor: "pointer",
        }}>
        Continue without saving
      </button>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ onReset }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", height: "100%",
      padding: "40px 28px", textAlign: "center",
      fontFamily: "'DM Sans',sans-serif",
    }}>
      <div style={{ fontSize: 56, marginBottom: 20 }}>🎯</div>
      <div style={{ fontSize: 9, color: GOLD, fontWeight: 800, letterSpacing: "0.2em", marginBottom: 12 }}>
        DECK COMPLETE
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 900, color: "#f0f6ff", fontFamily: "'Playfair Display',serif", margin: "0 0 12px" }}>
        You've seen every stock
      </h2>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, margin: "0 0 28px" }}>
        New momentum scores are calculated monthly. Come back at end of month for fresh rankings.
      </p>
      <button onClick={onReset} style={{
        padding: "12px 32px", borderRadius: 12,
        background: GOLD, border: "none", color: NAVY,
        fontSize: 12, fontWeight: 800, letterSpacing: "0.08em",
        cursor: "pointer",
      }}>
        RESTART DECK
      </button>
    </div>
  );
}

// ─── Main FlashCard component ─────────────────────────────────────────────────
export default function FlashCard() {
  const { openModal } = useStockModal();
  const { user }      = useAuth();



  // State
  const [deck,         setDeck]         = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(false);
  const [rightSwipes,  setRightSwipes]  = useState([]);
  const [showGate,     setShowGate]     = useState(false);
  const [gateShown,    setGateShown]    = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  // Show swipe hint on first session visit
  const [showHint, setShowHint] = useState(() => {
    try { return !sessionStorage.getItem('fc_hint_seen'); } catch { return true; }
  });

  const cardRefs = useRef([]);
  const pageRef  = useRef(null);

  // ── Load deck ──────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    fetchLatestMomentum().then(result => {
      if (!result?.scores?.length) { setError(true); setLoading(false); return; }
      const total  = result.scores.length;
      // Randomize deck order so worst performers aren't always shown first
      const shuffled = [...result.scores]
        .map(s => ({ ...s, total }))
        .sort(() => Math.random() - 0.5);
      setDeck(shuffled);
      setCurrentIndex(shuffled.length - 1);
      setLoading(false);

      // ── Eagerly warm cache for top 5 cards so news is instant ──
      // Stagger requests by 400ms each to avoid proxy rate limits
      const top5 = shuffled.slice(-5).map(s => s.ticker);
      top5.forEach((ticker, i) => {
        setTimeout(() => {
          fetchNews(ticker).catch(() => {});
          fetchPrice(ticker).catch(() => {});
        }, i * 400);
      });
    }).catch(() => { setError(true); setLoading(false); });
  }, []);

  // ── Swipe handler ──────────────────────────────────────────────
  const handleSwipe = useCallback((direction, ticker, index) => {
    // Dismiss first-visit hint on first swipe
    if (showHint) {
      setShowHint(false);
      try { sessionStorage.setItem('fc_hint_seen', '1'); } catch {}
    }

    const nextIndex = index - 1;
    setCurrentIndex(nextIndex);

    // Prefetch news for the card after next so it's ready
    if (nextIndex > 1) {
      const upcoming = deck[nextIndex - 2]?.ticker;
      if (upcoming) {
        setTimeout(() => { fetchNews(upcoming).catch(() => {}); }, 200);
      }
    }

    if (direction === "right") {
      // ── Save to persistent wishlist immediately ──
      lsAddToWishlist(ticker);

      const newRights = [...rightSwipes, ticker];
      setRightSwipes(newRights);

      // Show gate after 5 right swipes for non-logged-in users
      if (!user && newRights.length >= 5 && !gateShown) {
        setShowGate(true);
        setGateShown(true);
        return;
      }

      // Open stock modal (shows chart + news)
      const swipedItem = deck[index];
      openModal(ticker, swipedItem ? {
        momentumScore: swipedItem.norm_score,
        rank: swipedItem.rank,
        total: swipedItem.total,
      } : null);
    }
  }, [rightSwipes, user, gateShown, openModal, deck, showHint, setShowHint]);



  // ── Swipe triggered from in-card buttons ────────────────────────
  function handleSwipeButton(direction, index) {
    const ref = cardRefs.current[index];
    if (ref?.swipe) ref.swipe(direction);
    // Dismiss first-visit hint on first button tap too
    if (showHint) {
      setShowHint(false);
      try { sessionStorage.setItem('fc_hint_seen', '1'); } catch {}
    }
  }

  // ── Dismiss gate ────────────────────────────────────────────────
  function handleGateDismiss() {
    setShowGate(false);
    if (rightSwipes.length > 0) {
      openModal(rightSwipes[rightSwipes.length - 1]);
    }
  }

  // ── Full reset ──────────────────────────────────────────────────
  function handleFullReset() {
    lsSetWishlist([]);
    setRightSwipes([]);
    setCurrentIndex(deck.length - 1);
    setGateShown(false);
    setShowGate(false);
    setShowConfirm(false);
    window.dispatchEvent(new CustomEvent('wishlist-updated'));
  }

  // ── Render ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ background: SURFACE, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, paddingTop: 72 }}>
        <div style={{ width: 36, height: 36, border: "2px solid rgba(212,160,23,0.2)", borderTop: `2px solid ${GOLD}`, borderRadius: "50%", animation: "fcSpin 0.8s linear infinite" }}/>
        <div style={{ fontSize: 11, color: GOLD, letterSpacing: "0.15em", fontFamily: "'DM Sans',sans-serif" }}>LOADING CARDS…</div>
        <style>{`@keyframes fcSpin { to { transform:rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: SURFACE, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, padding: "72px 28px 0", textAlign: "center" }}>
        <div style={{ fontSize: 48 }}>📡</div>
        <h2 style={{ fontSize: 20, color: "#e2e8f0", fontFamily: "'Playfair Display',serif", margin: 0 }}>Couldn't load data</h2>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0 }}>Check Firestore connection and momentum_scores collection.</p>
        <button onClick={() => window.location.reload()} style={{ padding: "12px 28px", background: GOLD, border: "none", borderRadius: 10, color: NAVY, fontWeight: 800, fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
          RETRY
        </button>
      </div>
    );
  }

  const isDone = currentIndex < 0 && !showGate;

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;600;700;800&family=Playfair+Display:wght@800;900&display=swap" rel="stylesheet"/>
      <style>{`
        @keyframes fcSpin   { to { transform:rotate(360deg); } }
        @keyframes fcPulseL { 0%,100%{box-shadow:0 0 0 0 rgba(231,76,60,0)} 50%{box-shadow:0 0 0 12px rgba(231,76,60,0.15)} }
        @keyframes fcPulseR { 0%,100%{box-shadow:0 0 0 0 rgba(39,174,96,0)} 50%{box-shadow:0 0 0 12px rgba(39,174,96,0.15)} }
        .fc-btn-left:active  { transform:scale(0.9); }
        .fc-btn-right:active { transform:scale(0.9); }
        @keyframes hintLeft  { 0%,100%{transform:translateX(0)} 50%{transform:translateX(-8px)} }
        @keyframes hintRight { 0%,100%{transform:translateX(0)} 50%{transform:translateX(8px)} }
      `}</style>

      <div ref={pageRef} style={{ background: SURFACE, minHeight: "100vh", display: "flex", flexDirection: "column", paddingTop: 160, fontFamily: "'DM Sans',sans-serif", overflow: "hidden", position: "relative" }}>

        {/* ── Reset button ── */}
        <button
          onClick={() => setShowConfirm(true)}
          title="Reset deck & wishlist"
          style={{
            position:"fixed", top:112, right:12, zIndex:500,
            background:"rgba(255,255,255,0.07)",
            border:"1px solid rgba(255,255,255,0.12)",
            borderRadius:"50%", width:34, height:34,
            display:"flex", alignItems:"center", justifyContent:"center",
            cursor:"pointer", fontSize:15,
          }}
        >🔄</button>

        {/* ── Confirm dialog ── */}
        {showConfirm && (
          <>
            <div onClick={() => setShowConfirm(false)} style={{ position:"fixed", inset:0, zIndex:2000, background:"rgba(0,0,0,0.65)" }}/>
            <div style={{
              position:"fixed", top:"50%", left:"50%", zIndex:2001,
              transform:"translate(-50%,-50%)",
              background:"#0f1e30", border:"1px solid rgba(212,160,23,0.3)",
              borderRadius:18, padding:"28px 24px", width:"min(320px,88vw)",
              fontFamily:"'DM Sans',sans-serif", textAlign:"center",
              boxShadow:"0 24px 60px rgba(0,0,0,0.7)",
            }}>
              <div style={{ fontSize:36, marginBottom:14 }}>🔄</div>
              <div style={{ fontSize:16, fontWeight:800, color:"#f0f6ff", marginBottom:10, fontFamily:"'Playfair Display',serif" }}>Reset Everything?</div>
              <p style={{ fontSize:12, color:"rgba(255,255,255,0.45)", lineHeight:1.7, margin:"0 0 24px" }}>
                This will clear your entire wishlist and restart the deck from the beginning. This cannot be undone.
              </p>
              <button onClick={handleFullReset} style={{
                width:"100%", padding:"13px", borderRadius:10,
                background:"#E74C3C", border:"none", color:"#fff",
                fontSize:12, fontWeight:800, letterSpacing:"0.08em",
                cursor:"pointer", marginBottom:10, fontFamily:"'DM Sans',sans-serif",
              }}>YES, RESET & CLEAR WISHLIST</button>
              <button onClick={() => setShowConfirm(false)} style={{
                width:"100%", padding:"11px", borderRadius:10,
                background:"transparent", border:"1px solid rgba(255,255,255,0.1)",
                color:"rgba(255,255,255,0.4)", fontSize:12, fontWeight:700,
                cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
              }}>Cancel</button>
            </div>
          </>
        )}

        {/* ── Swipe deck ── */}
        <>
            {/* ── Card stack ── */}
            <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "2px 12px 0", overflow: "hidden" }}>



              {/* ── First-visit swipe hint ── */}
              {showHint && !isDone && !showGate && (
                <div style={{ position:"absolute", inset:0, zIndex:200, pointerEvents:"none", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16 }}>
                  {/* Dim overlay */}
                  <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.45)", borderRadius:22 }}/>
                  {/* Arrows */}
                  <div style={{ position:"relative", zIndex:1, display:"flex", alignItems:"center", gap:40 }}>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontSize:36, animation:"hintLeft 1s ease-in-out infinite" }}>👈</div>
                      <div style={{ fontSize:10, fontWeight:800, color:"#E74C3C", letterSpacing:"0.06em", fontFamily:"'DM Sans',sans-serif", marginTop:6 }}>SKIP</div>
                    </div>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontSize:36, animation:"hintRight 1s ease-in-out infinite" }}>👉</div>
                      <div style={{ fontSize:10, fontWeight:800, color:"#27AE60", letterSpacing:"0.06em", fontFamily:"'DM Sans',sans-serif", marginTop:6 }}>LIKE</div>
                    </div>
                  </div>
                  <div style={{ position:"relative", zIndex:1, padding:"8px 20px", borderRadius:20, background:"rgba(212,160,23,0.15)", border:"1px solid rgba(212,160,23,0.4)" }}>
                    <span style={{ fontSize:10, fontWeight:800, color:"#D4A017", letterSpacing:"0.1em", fontFamily:"'DM Sans',sans-serif" }}>SWIPE OR TAP BUTTONS BELOW</span>
                  </div>
                </div>
              )}

              {isDone ? (
                <EmptyState onReset={() => { setCurrentIndex(deck.length - 1); setRightSwipes([]); setGateShown(false); }}/>
              ) : showGate ? (
                <div style={{ width: "100%", maxWidth: 380, height: "100%", maxHeight: 470 }}>
                  <GateCard savedTickers={rightSwipes} onDismiss={handleGateDismiss}/>
                </div>
              ) : (
                <div style={{ position: "relative", width: "100%", maxWidth: 380, height: 450 }}>
                  {deck.map((item, i) => {
                    const offset = currentIndex - i;
                    if (offset < 0 || offset > 4) return null;
                    const isTopCard = offset === 0;
                    const scale     = 1 - offset * 0.04;
                    const yOffset   = offset * 10;
                    return (
                      <SwipeCard
                        key={item.ticker}
                        index={i}
                        isTop={isTopCard}
                        scale={scale}
                        yOffset={yOffset}
                        zIndex={100 - offset}
                        onSwipe={dir => handleSwipe(dir, item.ticker, i)}
                        ref={el => { cardRefs.current[i] = el; }}
                      >
                        <CardContent item={item} isTop={isTopCard || offset === 1} onSwipeLeft={() => handleSwipeButton("left", i)} onSwipeRight={() => handleSwipeButton("right", i)} onOpenStock={() => openModal(item.ticker, item ? { momentumScore: item.norm_score, rank: item.rank, total: item.total } : null)}/>
                      </SwipeCard>
                    );
                  })}
                </div>
              )}
            </div>


            {/* ── Progress bar ── */}
            {deck.length > 0 && !isDone && (
              <div style={{ padding: "0 20px 12px", flex: 0 }}>
                <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${((deck.length - 1 - currentIndex) / deck.length) * 100}%`, background: `linear-gradient(90deg, ${GOLD}88, ${GOLD})`, borderRadius: 2, transition: "width .3s ease" }}/>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)" }}>{deck.length - 1 - currentIndex} / {deck.length} seen</span>
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)" }}>{currentIndex >= 0 ? `#${deck[currentIndex]?.rank} of ${deck.length}` : ""}</span>
                </div>
              </div>
            )}
          </>
      </div>
    </>
  );
}

// ─── Floating Action Button (add to Home.js, mobile only) ─────────────────────
export function DiscoverFAB() {
  const navigate = useNavigate();
  return (
    <>
      <style>{`
        .discover-fab {
          display: none;
        }
        @media (max-width: 768px) {
          .discover-fab {
            display: flex;
            position: fixed;
            bottom: 8px;
            right: 20px;
            z-index: 900;
            width: 58px;
            height: 58px;
            border-radius: 50%;
            background: linear-gradient(135deg, #D4A017, #b8870e);
            border: none;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 24px rgba(212,160,23,0.45), 0 2px 8px rgba(0,0,0,0.4);
            animation: fabPulse 3s ease-in-out infinite;
            flex-direction: column;
            gap: 1px;
            font-family: 'DM Sans', sans-serif;
          }
          @keyframes fabPulse {
            0%,100% { box-shadow: 0 4px 24px rgba(212,160,23,0.45), 0 2px 8px rgba(0,0,0,0.4); }
            50%      { box-shadow: 0 4px 32px rgba(212,160,23,0.7),  0 2px 8px rgba(0,0,0,0.4); }
          }
        }
      `}</style>
      <button className="discover-fab" onClick={() => navigate("/discover")} title="Discover Stocks">
        <span style={{ fontSize: 22 }}>⚡</span>
        <span style={{ fontSize: 7, fontWeight: 800, color: NAVY, letterSpacing: "0.04em" }}>DISCOVER</span>
      </button>
    </>
  );
}