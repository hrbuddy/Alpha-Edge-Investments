import { Link } from "react-router-dom";

const GOLD = "#D4A017";
const NAVY = "#0D1B2A";

export default function Footer() {
  return (
    <footer style={{
      background: NAVY,
      color: "#94a3b8",
      padding: "60px 28px 40px",
      borderTop: "1px solid rgba(212,160,23,0.15)",
      fontFamily: "'DM Sans', sans-serif",
      fontSize: 13,
      textAlign: "center"
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Logo + Name */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 24 }}>
          <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="9" fill={GOLD} />
            <ellipse cx="50" cy="50" rx="29" ry="13" stroke={GOLD} strokeWidth="3.5" strokeOpacity="0.85" />
            <ellipse cx="50" cy="50" rx="37" ry="17" stroke={GOLD} strokeWidth="3" strokeOpacity="0.65" transform="rotate(55 50 50)" />
            <ellipse cx="50" cy="50" rx="45" ry="20" stroke={GOLD} strokeWidth="2.5" strokeOpacity="0.45" transform="rotate(-40 50 50)" />
          </svg>
          <div style={{ fontSize: 24, fontWeight: 800, color: GOLD, fontFamily: "'Playfair Display', serif" }}>
            ALPHA EDGE
          </div>
        </div>

        {/* Quick Links */}
        <div style={{ display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap", marginBottom: 32 }}>
          <Link to="/" style={{ color: "#94a3b8", textDecoration: "none", fontWeight: 500 }}>Home</Link>
          <Link to="/info-edge" style={{ color: "#94a3b8", textDecoration: "none", fontWeight: 500 }}>Info Edge</Link>
          <Link to="/eicher-motors" style={{ color: "#94a3b8", textDecoration: "none", fontWeight: 500 }}>Eicher Motors</Link>
          <a href="#universe" style={{ color: "#94a3b8", textDecoration: "none", fontWeight: 500 }}>Research Universe</a>
        </div>

        {/* Disclaimer */}
        <div style={{ fontSize: 11, lineHeight: 1.6, maxWidth: 620, margin: "0 auto 24px", color: "#64748b" }}>
          Alpha Edge Research provides institutional-grade equity analysis for informational purposes only.<br />
          We are not SEBI-registered investment advisors. Past performance is not indicative of future results.<br />
          Always consult a qualified financial advisor before making investment decisions.
        </div>

        {/* Copyright */}
        <div style={{ fontSize: 11, color: "#475569", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 24 }}>
          © {new Date().getFullYear()} Alpha Edge Investments • All Rights Reserved
        </div>
      </div>
    </footer>
  );
}