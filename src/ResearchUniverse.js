import { Link } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import { ThemeContext } from "./App";
import { STOCKS, STOCK_ROUTES } from "./dashboards/stocksDB";

const NAVY  = "#0D1B2A";
const GOLD  = "#D4A017";
const GREEN = "#27AE60";
const TEAL  = "#0E7C7B";

const DARK_PAL = {
  bg: NAVY, text:"#e2e8f0", subText:"#5a7a94", muted:"#3d5570",
  cardBg:"rgba(255,255,255,0.025)", cardBorder:"rgba(212,160,23,0.38)",
};
const LIGHT_PAL = {
  bg:"#F5F0E8", text:"#0D1B2A", subText:"#3a5068", muted:"#7a8a9a",
  cardBg:"rgba(13,27,42,0.04)", cardBorder:"rgba(212,160,23,0.38)",
};

// Coming-soon placeholders not yet in DB
const COMING_SOON = [
  { name:"Zomato Ltd",         ticker:"NSE: ZOMATO"     },
  { name:"PB Fintech Ltd",     ticker:"NSE: POLICYBZR"  },
  { name:"Trent Ltd",          ticker:"NSE: TRENT"      },
  { name:"Persistent Systems", ticker:"NSE: PERSISTENT" },
  { name:"Dixon Technologies", ticker:"NSE: DIXON"      },
  { name:"Rail Vikas Nigam",   ticker:"NSE: RVNL"       },
  { name:"Suzlon Energy",      ticker:"NSE: SUZLON"     },
  { name:"HDFC Bank Ltd",      ticker:"NSE: HDFCBANK"   },
];

// Build active tiles from DB
const activeStocks = STOCK_ROUTES.map(({ path, stockId }) => {
  const s = STOCKS[stockId];
  const targetMetric = s.metrics.find(m => m.label === "Target");
  return {
    name:   s.name,
    ticker: `NSE: ${s.nse}${s.bse ? ` · BSE: ${s.bse}` : ""}`,
    rating: s.rating,
    target: targetMetric?.value ?? "—",
    cagr:   targetMetric?.sub   ?? "",
    path,
    active: true,
    sector: s.sector,
  };
});

const comingSoon = COMING_SOON.map(s => ({ ...s, path: "#", active: false }));

// ── Scroll reveal hook ────────────────────────────────────────────────────────
function useReveal(threshold = 0.05) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, vis];
}

// ── Stock tile ────────────────────────────────────────────────────────────────
function StockTile({ stock, delay = 0, pal }) {
  const [hov, setHov] = useState(false);
  const [ref, vis] = useReveal(0.04);

  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(24px)",
      transition: `opacity .6s ease ${delay}ms, transform .6s cubic-bezier(.22,1,.36,1) ${delay}ms`,
    }}>
      <Link
        to={stock.active ? stock.path : "/signup"}
        style={{ textDecoration: "none" }}
        onClick={!stock.active ? e => e.preventDefault() : undefined}
      >
        <div
          onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
          style={{
            background: stock.active ? (hov ? "rgba(212,160,23,0.05)" : pal.cardBg) : pal.cardBg,
            border: `1px solid ${stock.active ? (hov ? GOLD : pal.cardBorder) : pal.cardBorder}`,
            borderRadius: 14, padding: "20px 18px", height: "100%", boxSizing: "border-box",
            transition: "all .25s cubic-bezier(.4,0,.2,1)",
            boxShadow: hov && stock.active
              ? "0 0 0 1px rgba(212,160,23,.25),0 14px 36px rgba(212,160,23,.09),0 4px 16px rgba(0,0,0,.25)"
              : "0 4px 18px rgba(0,0,0,.12)",
            cursor: stock.active ? "pointer" : "default",
            position: "relative", overflow: "hidden",
          }}
        >
          {/* Gold shimmer on hover */}
          {stock.active && (
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 1,
              background: `linear-gradient(90deg,transparent,${GOLD},transparent)`,
              opacity: hov ? 1 : 0, transition: "opacity .3s",
            }}/>
          )}

          <div style={{ fontSize: 9, color: GOLD, letterSpacing: 2.5, fontWeight: 700, marginBottom: 9, fontFamily: "'DM Sans',sans-serif" }}>
            ALPHA EDGE RESEARCH
          </div>

          {stock.sector && (
            <div style={{ fontSize: 9, color: "rgba(212,160,23,0.45)", letterSpacing: 1.5, fontWeight: 600, marginBottom: 6, fontFamily: "'DM Sans',sans-serif" }}>
              {stock.sector.toUpperCase()}
            </div>
          )}

          <div style={{ fontSize: 17, fontWeight: 800, color: pal.text, fontFamily: "'Playfair Display',serif", lineHeight: 1.3, marginBottom: 4 }}>
            {stock.name}
          </div>
          <div style={{ fontSize: 11, color: pal.muted, letterSpacing: 0.3, fontFamily: "'DM Sans',sans-serif" }}>
            {stock.ticker}
          </div>

          {stock.active ? (
            <>
              <div style={{ height: 1, background: "rgba(212,160,23,0.12)", margin: "14px 0" }}/>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 5, gap: 8 }}>
                <div>
                  <div style={{ fontSize: 9, color: pal.muted, letterSpacing: 1, marginBottom: 3, fontFamily: "'DM Sans',sans-serif" }}>RATING</div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: GREEN, letterSpacing: 1, fontFamily: "'DM Sans',sans-serif" }}>{stock.rating}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 9, color: pal.muted, letterSpacing: 1, marginBottom: 3, fontFamily: "'DM Sans',sans-serif" }}>TARGET</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: pal.text, fontFamily: "'DM Sans',sans-serif" }}>{stock.target}</div>
                </div>
              </div>
              {stock.cagr && (
                <div style={{ fontSize: 11, color: TEAL, marginBottom: 14, fontFamily: "'DM Sans',sans-serif" }}>{stock.cagr}</div>
              )}
              <div style={{
                padding: "10px 14px", background: GOLD, color: NAVY, textAlign: "center",
                borderRadius: 8, fontWeight: 800, fontSize: 11, letterSpacing: 1.5,
                fontFamily: "'DM Sans',sans-serif", opacity: hov ? 1 : 0.88, transition: "opacity .2s",
              }}>
                VIEW FULL DASHBOARD →
              </div>
            </>
          ) : (
            <>
              <div style={{ height: 1, background: "rgba(212,160,23,0.10)", margin: "12px 0" }}/>
              <div style={{
                display: "inline-block", padding: "4px 10px",
                background: "rgba(212,160,23,0.08)", border: "1px solid rgba(212,160,23,0.2)",
                borderRadius: 999, fontSize: 9,
                color: "rgba(212,160,23,0.65)", letterSpacing: 2, fontWeight: 700,
                fontFamily: "'DM Sans',sans-serif",
              }}>
                COMING SOON
              </div>
            </>
          )}
        </div>
      </Link>
    </div>
  );
}

// ── Request tile ──────────────────────────────────────────────────────────────
function RequestTile({ pal }) {
  const [hov, setHov] = useState(false);
  return (
    <a
      href="mailto:research@alphaedge.in?subject=Stock%20Request"
      style={{ textDecoration: "none" }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
    >
      <div style={{
        background: hov ? "rgba(212,160,23,0.05)" : pal.cardBg,
        border: `1px dashed ${hov ? GOLD : "rgba(212,160,23,0.3)"}`,
        borderRadius: 14, padding: "28px 18px", cursor: "pointer",
        textAlign: "center", transition: "all .25s", boxSizing: "border-box",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10,
        minHeight: 120,
      }}>
        <div style={{ fontSize: 28, opacity: hov ? 1 : 0.5, transition: "opacity .2s" }}>＋</div>
        <div style={{ fontSize: 14, fontWeight: 800, color: hov ? GOLD : pal.muted, fontFamily: "'Playfair Display',serif", transition: "color .2s" }}>
          Request a Stock
        </div>
        <div style={{ fontSize: 11, color: pal.muted, fontFamily: "'DM Sans',sans-serif", lineHeight: 1.5 }}>
          Don't see a stock you're tracking?<br/>Tell us and we'll add it to our pipeline.
        </div>
      </div>
    </a>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ResearchUniverse() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";
  const pal = isDark ? DARK_PAL : LIGHT_PAL;
  const [visible, setVisible] = useState(false);
  useEffect(() => { window.scrollTo(0, 0); setTimeout(() => setVisible(true), 80); }, []);

  const fu = (d = 0) => ({
    opacity:   visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(20px)",
    transition: `opacity .75s ease ${d}ms, transform .75s cubic-bezier(.22,1,.36,1) ${d}ms`,
  });

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;600;700;800&family=Playfair+Display:wght@700;800;900&display=swap" rel="stylesheet"/>
      <style>{`
        @media(max-width:640px){
          .ru-active-grid { grid-template-columns: 1fr !important; }
          .ru-soon-grid   { grid-template-columns: 1fr 1fr !important; }
        }
        @media(min-width:641px) and (max-width:960px){
          .ru-active-grid { grid-template-columns: 1fr 1fr !important; }
          .ru-soon-grid   { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      <div style={{
        background: pal.bg, minHeight: "100vh",
        color: pal.text, fontFamily: "'DM Sans',sans-serif",
        paddingTop: 92,
      }}>

        {/* ── HEADER ── */}
        <section style={{
          background: isDark ? "rgba(255,255,255,0.015)" : "rgba(13,27,42,0.04)",
          borderBottom: `1px solid rgba(212,160,23,0.13)`,
          padding: "52px 24px 48px", textAlign: "center",
        }}>
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            <div style={{ fontSize: 9, letterSpacing: "0.38em", color: GOLD, fontWeight: 700, marginBottom: 14, fontFamily: "'DM Sans',sans-serif", ...fu(0) }}>
              CURATED EQUITY RESEARCH
            </div>
            <h1 style={{
              fontSize: "clamp(28px,4.5vw,46px)", fontWeight: 900,
              fontFamily: "'Playfair Display',serif", margin: "0 0 14px",
              lineHeight: 1.12, color: pal.text, ...fu(80),
            }}>
              Our Research Universe
            </h1>
            <div style={{ width: 44, height: 2, background: GOLD, borderRadius: 2, margin: "0 auto 18px", ...fu(140) }}/>
            <p style={{ fontSize: "clamp(13px,1.5vw,15px)", color: pal.subText, lineHeight: 1.8, margin: 0, fontWeight: 400, ...fu(160) }}>
              {activeStocks.length} live reports published · more always in the pipeline.<br/>
              Deep-dive fundamental analysis on quality compounders. FY30 price targets. Independent. Always free.
            </p>
          </div>
        </section>

        {/* ── CONTENT ── */}
        <div style={{ maxWidth: 1360, margin: "0 auto", padding: "56px 18px 80px" }}>

          {/* Live reports label */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, ...fu(0) }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: GREEN, boxShadow: `0 0 8px ${GREEN}` }}/>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.26em", color: GREEN, fontFamily: "'DM Sans',sans-serif" }}>
              LIVE — {activeStocks.length} REPORTS PUBLISHED
            </span>
          </div>

          {/* Active grid */}
          <div className="ru-active-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
            gap: 16, marginBottom: 32,
          }}>
            {activeStocks.map((s, i) => (
              <StockTile key={s.name} stock={s} delay={i * 90} pal={pal}/>
            ))}
          </div>

          {/* Coming soon label */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, marginTop: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(212,160,23,0.4)", border: `1px solid rgba(212,160,23,0.5)` }}/>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.26em", color: "rgba(212,160,23,0.5)", fontFamily: "'DM Sans',sans-serif" }}>
              IN THE PIPELINE — {comingSoon.length} UPCOMING
            </span>
          </div>

          {/* Coming soon grid */}
          <div className="ru-soon-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 11, marginBottom: 11,
          }}>
            {comingSoon.map((s, i) => (
              <StockTile key={s.name} stock={s} delay={60 + i * 40} pal={pal}/>
            ))}
          </div>

          {/* Request tile — spans below */}
          <div style={{ marginTop: 12 }}>
            <RequestTile pal={pal}/>
          </div>

          {/* Back to home */}
          <div style={{ textAlign: "center", marginTop: 52 }}>
            <Link to="/" style={{
              fontSize: 12, color: "rgba(212,160,23,0.55)", fontWeight: 700,
              textDecoration: "none", letterSpacing: "1.2px", fontFamily: "'DM Sans',sans-serif",
            }}>
              ← BACK TO HOME
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}