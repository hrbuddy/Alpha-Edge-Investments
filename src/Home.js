import { Link } from "react-router-dom";

const NAVY = "#0D1B2A";
const GOLD = "#D4A017";

const stocks = [
  {
    name: "Info Edge (India) Ltd",
    ticker: "NSE: NAUKRI • BSE: 532777",
    rating: "BUY",
    target: "₹1,700–2,100",
    cagr: "12–17% CAGR",
    path: "/info-edge",
  },
  {
    name: "Eicher Motors Ltd",
    ticker: "NSE: EICHERMOT",
    rating: "BUY",
    target: "₹12,500–15,000",
    cagr: "14–16% CAGR (59–84% upside)",
    path: "/eicher-motors",
  },
  { name: "Zomato Ltd", ticker: "NSE: ZOMATO", rating: "Coming Soon", target: "Dashboard in progress", path: "#", disabled: true },
  { name: "PB Fintech Ltd", ticker: "NSE: POLICYBZR", rating: "Coming Soon", target: "Dashboard in progress", path: "#", disabled: true },
  { name: "Trent Ltd", ticker: "NSE: TRENT", rating: "Coming Soon", target: "Dashboard in progress", path: "#", disabled: true },
  { name: "Persistent Systems", ticker: "NSE: PERSISTENT", rating: "Coming Soon", target: "Dashboard in progress", path: "#", disabled: true },
  { name: "Dixon Technologies", ticker: "NSE: DIXON", rating: "Coming Soon", target: "Dashboard in progress", path: "#", disabled: true },
  { name: "Rail Vikas Nigam", ticker: "NSE: RVNL", rating: "Coming Soon", target: "Dashboard in progress", path: "#", disabled: true },
  { name: "Suzlon Energy", ticker: "NSE: SUZLON", rating: "Coming Soon", target: "Dashboard in progress", path: "#", disabled: true },
  { name: "HDFC Bank Ltd", ticker: "NSE: HDFCBANK", rating: "Coming Soon", target: "Dashboard in progress", path: "#", disabled: true },
];

export default function Home() {
  return (
    <div style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #0a1628 100%)`, minHeight: "100vh", color: "#e2e8f0", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ padding: "60px 28px 40px", textAlign: "center" }}>
        <div style={{ fontSize: 52, fontWeight: 800, color: GOLD, letterSpacing: "-2px" }}>ALPHA EDGE</div>
        <div style={{ fontSize: 18, color: "#94a3b8", marginTop: 8 }}>Equity Research • Professional Dashboards • Started February 2026</div>
        <h1 style={{ fontSize: 32, marginTop: 50, marginBottom: 8 }}>Select a Stock</h1>
        <p style={{ fontSize: 15, color: "#94a3b8", maxWidth: 500, margin: "0 auto" }}>
          10 high-quality Indian equity research dashboards. All built in-house at Alpha Edge.
        </p>
      </div>

      <div style={{ padding: "0 28px 60px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 24 }}>
        {stocks.map((stock, i) => (
          <Link
            key={i}
            to={stock.path}
            style={{ textDecoration: "none" }}
            onClick={stock.disabled ? (e) => e.preventDefault() : undefined}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${stock.disabled ? "rgba(255,255,255,0.08)" : GOLD}`,
                borderRadius: 16,
                padding: 28,
                height: "100%",
                transition: "all 0.3s",
                opacity: stock.disabled ? 0.65 : 1,
                cursor: stock.disabled ? "not-allowed" : "pointer",
              }}
            >
              <div style={{ fontSize: 12, color: GOLD, letterSpacing: 2, fontWeight: 700 }}>ALPHA EDGE RESEARCH</div>
              <div style={{ fontSize: 24, fontWeight: 800, margin: "16px 0 6px" }}>{stock.name}</div>
              <div style={{ fontSize: 13, color: "#94a3b8" }}>{stock.ticker}</div>

              <div style={{ marginTop: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>RATING</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: stock.rating === "BUY" ? "#27AE60" : "#94a3b8" }}>
                    {stock.rating}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>FY30 TARGET</div>
                  <div style={{ fontSize: 20, fontWeight: 800 }}>{stock.target}</div>
                </div>
              </div>

              {stock.cagr && <div style={{ marginTop: 16, fontSize: 13, color: "#94a3b8" }}>{stock.cagr}</div>}

              {stock.disabled ? (
                <div style={{ marginTop: 24, padding: "10px", background: "rgba(148,163,184,0.1)", borderRadius: 8, textAlign: "center", fontSize: 13 }}>
                  Coming Soon
                </div>
              ) : (
                <div style={{ marginTop: 24, padding: "14px", background: GOLD, color: NAVY, textAlign: "center", borderRadius: 10, fontWeight: 700, fontSize: 14 }}>
                  VIEW FULL DASHBOARD →
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b", fontSize: 12, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        Alpha Edge Research • High-Quality Indian Equity Analysis • Not SEBI registered advice • For informational purposes only
      </div>
    </div>
  );
}