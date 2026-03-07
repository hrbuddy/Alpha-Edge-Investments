import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const GOLD = "#D4A017";
const NAVY = "#0D1B2A";
const GREEN = "#27AE60";

const FEATURES = [
  { icon: "📄", text: "Every research report we publish" },
  { icon: "📊", text: "Full DCF models with editable assumptions" },
  { icon: "🗂️", text: "Unlimited portfolio simulations" },
  { icon: "💾", text: "Save & compare portfolio scenarios" },
  { icon: "⚡", text: "Early access to new stock coverage" },
];

export default function UpgradePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div style={{
      background: `linear-gradient(160deg, ${NAVY} 0%, #060e1a 100%)`,
      minHeight: "100vh", color: "#e2e8f0",
      fontFamily: "'DM Sans', sans-serif",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "100px 24px 60px",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet"/>

      <div style={{ maxWidth: 480, width: "100%" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 10, color: GOLD, letterSpacing: "2.5px", fontWeight: 700, marginBottom: 10 }}>
            VANTAGE CAPITAL · FULL ACCESS
          </div>
          <h1 style={{
            fontSize: "clamp(28px,4vw,40px)", fontWeight: 800,
            fontFamily: "'Playfair Display', serif", color: "#fff",
            margin: "0 0 12px", lineHeight: 1.2,
          }}>
            Unlock Everything
          </h1>
          <p style={{ fontSize: 13, color: "#5a7a94", lineHeight: 1.7, margin: 0 }}>
            Institutional-grade equity research, DCF models and portfolio tools — at one flat annual price.
          </p>
        </div>

        {/* Pricing card */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: `1px solid rgba(212,160,23,0.30)`,
          borderRadius: 20, padding: "28px 24px 24px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
        }}>

          {/* Price */}
          <div style={{
            display: "flex", alignItems: "baseline", gap: 6,
            justifyContent: "center", marginBottom: 6,
          }}>
            <span style={{ fontSize: 48, fontWeight: 900, color: GOLD, fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>₹999</span>
            <span style={{ fontSize: 13, color: "rgba(212,160,23,0.55)", fontWeight: 700, letterSpacing: "1px" }}>/YEAR</span>
          </div>
          <div style={{ textAlign: "center", fontSize: 11, color: "#3d5570", marginBottom: 24 }}>
            ₹83/month · billed annually
          </div>

          {/* Features */}
          <div style={{ marginBottom: 24 }}>
            {FEATURES.map(f => (
              <div key={f.text} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0",
                borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{f.icon}</span>
                <span style={{ fontSize: 13, color: "#c8dae8", fontWeight: 500 }}>{f.text}</span>
                <span style={{ marginLeft: "auto", color: GREEN, fontSize: 12, flexShrink: 0 }}>✓</span>
              </div>
            ))}
          </div>

          {/* CTA — payment coming soon */}
          <div style={{
            background: "rgba(212,160,23,0.06)", border: "1px solid rgba(212,160,23,0.15)",
            borderRadius: 12, padding: "16px", textAlign: "center", marginBottom: 14,
          }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: GOLD, marginBottom: 6 }}>
              🚀 Payment gateway launching soon
            </div>
            <div style={{ fontSize: 11, color: "#5a7a94", lineHeight: 1.6 }}>
              We're setting up secure payments. Leave your email and we'll notify you the moment it's live — and lock in the launch price.
            </div>
          </div>

          <button
            onClick={() => {
              const email = user?.email || "";
              window.open(`mailto:vantage@example.com?subject=Upgrade Interest&body=Email: ${email}`, "_blank");
            }}
            style={{
              width: "100%", padding: "14px",
              background: GOLD, color: NAVY, border: "none",
              borderRadius: 10, fontWeight: 800, fontSize: 13,
              letterSpacing: "0.1em", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: "0 4px 24px rgba(212,160,23,0.3)",
              transition: "all .2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background="#e8b420"; e.currentTarget.style.transform="translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background=GOLD; e.currentTarget.style.transform="translateY(0)"; }}
          >
            NOTIFY ME WHEN LIVE →
          </button>

          <button
            onClick={() => navigate(-1)}
            style={{
              width: "100%", marginTop: 10, padding: "11px",
              background: "transparent", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10, color: "#5a7a94", fontSize: 12,
              fontWeight: 700, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            ← Go Back
          </button>

        </div>

        <p style={{ textAlign: "center", fontSize: 10, color: "#2e4a60", marginTop: 16, lineHeight: 1.6 }}>
          No spam. No auto-charge. We'll email you when ready.
        </p>
      </div>
    </div>
  );
}