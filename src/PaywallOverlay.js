import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "./App";
import { useAuth } from "./AuthContext";

const GOLD = "#D4A017";
const NAVY = "#0D1B2A";

// ── Copy per scenario ─────────────────────────────────────────────────────────
// "signup"     — anon user hitting report limit (first gate)
// "dcf_teaser" — anon/free user clicking DCF for the first time (temptation gate)
// "report"     — free user who has used all 3 reports (upgrade gate)
// "dcf"        — free user who has used all 3 DCF models (upgrade gate)
// "portfolio"  — free user who has used all 10 sim runs (upgrade gate)

const COPY = {
  signup: {
    icon:  "📊",
    title: "You've completed your free research",
    sub:   "Create a free account to keep reading. You'll get access to deep-dive financials, DCF models, factor scores, and more.",
    cta:   null,
    counter: null,
    signupLabel: "CREATE FREE ACCOUNT",
  },
  dcf_teaser: {
    icon:  "🔐",
    title: (ticker) => `See ${ticker}'s intrinsic value`,
    sub:   "Our DCF model calculates a fair value estimate using live financials. Sign in to unlock it — free.",
    cta:   null,
    counter: null,
    signupLabel: "SIGN IN TO UNLOCK DCF",
  },
  report: {
    icon:  "🔒",
    title: "You've read all your free reports",
    sub:   "Upgrade to unlock every research report, DCF model, and portfolio tool we publish.",
    cta:   "UNLOCK FULL ACCESS",
    counter: (used, total) => `${used} of ${total} free reports used`,
    signupLabel: "SIGN UP FREE INSTEAD",
  },
  dcf: {
    icon:  "🔒",
    title: "You've used all your free DCF models",
    sub:   "Upgrade to unlock all DCF models with editable assumptions, scenario analysis, and intrinsic value calculations.",
    cta:   "UNLOCK ALL MODELS",
    counter: (used, total) => `${used} of ${total} free DCF models used`,
    signupLabel: "SIGN UP FREE INSTEAD",
  },
  portfolio: {
    icon:  "🔒",
    title: "You've used all your free simulations",
    sub:   "Upgrade for unlimited portfolio simulations, saved scenarios, and benchmark comparisons.",
    cta:   "UNLOCK UNLIMITED",
    counter: (used, total) => `${used} of ${total} simulations used`,
    signupLabel: "SIGN UP FREE INSTEAD",
  },
};

const FEATURES = [
  "Every research report we publish",
  "Full DCF models with editable assumptions",
  "Unlimited portfolio simulations",
  "Save & compare portfolio scenarios",
  "Early access to new coverage",
];

export default function PaywallOverlay({ config, onClose, onSignUp }) {
  const navigate  = useNavigate();
  const { theme } = useContext(ThemeContext);
  const { user }  = useAuth();
  const isDark    = theme === "dark";

  if (!config) return null;

  const { type = "signup", used = 0, total = 3, ticker = "" } = config;
  const copy         = COPY[type] || COPY.signup;
  const isSignupWall = type === "signup" || type === "dcf_teaser";

  const title = typeof copy.title === "function" ? copy.title(ticker) : copy.title;

  function handleSignUp() {
    if (onSignUp) { onSignUp(); return; }
    navigate("/signup");   // navigate directly — do NOT call onClose first
  }
  function handleUpgrade() {
    navigate("/upgrade");  // navigate directly — do NOT call onClose first
  }

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 90000,
          backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
          background: "rgba(10,21,36,0.75)",
          animation: "pwFadeIn .25s ease",
        }}
      />

      {/* ── Card — maxHeight + overflow so it never escapes screen ── */}
      <div style={{
        position:  "fixed",
        top:       "50%",
        left:      "50%",
        transform: "translate(-50%,-50%)",
        zIndex:    90001,
        width:     "min(400px, calc(100vw - 32px))",
        maxHeight: "calc(100vh - 80px)",   // ← fixes overflow on small screens
        overflowY: "auto",                 // ← scroll inside if needed
        background: isDark
          ? "linear-gradient(160deg, rgba(14,26,45,0.99) 0%, rgba(10,19,34,0.99) 100%)"
          : "linear-gradient(160deg, rgba(252,248,240,0.99) 0%, rgba(245,240,232,0.99) 100%)",
        border:       "1px solid rgba(212,160,23,0.30)",
        borderRadius: 20,
        padding:      "28px 22px 24px",
        boxShadow:    "0 32px 80px rgba(0,0,0,0.6)",
        fontFamily:   "'DM Sans', sans-serif",
        animation:    "pwSlideUp .3s cubic-bezier(.22,1,.36,1)",
        boxSizing:    "border-box",
      }}>

        {/* Close */}
        <button onClick={onClose} style={{
          position: "absolute", top: 12, right: 12,
          background: "none", border: "none", cursor: "pointer",
          color: "rgba(212,160,23,0.4)", fontSize: 22, lineHeight: 1,
          padding: "2px 7px", borderRadius: 6,
        }}>✕</button>

        {/* Icon */}
        <div style={{ textAlign: "center", fontSize: 34, marginBottom: 10 }}>{copy.icon}</div>

        {/* Counter pill — only for paid paywall */}
        {copy.counter && (
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <span style={{
              fontSize: 10, fontWeight: 800, letterSpacing: "1.2px",
              color: GOLD, background: "rgba(212,160,23,0.1)",
              border: "1px solid rgba(212,160,23,0.22)",
              borderRadius: 999, padding: "4px 14px", display: "inline-block",
            }}>
              {copy.counter(used, total).toUpperCase()}
            </span>
          </div>
        )}

        {/* Title */}
        <h2 style={{
          fontSize: 19, fontWeight: 800, textAlign: "center",
          color: isDark ? "#e2e8f0" : NAVY,
          fontFamily: "'Playfair Display', serif",
          margin: "0 0 8px", lineHeight: 1.3,
        }}>
          {title}
        </h2>

        {/* Sub */}
        <p style={{
          fontSize: 13, color: isDark ? "#5a7a94" : "#4a6070",
          textAlign: "center", lineHeight: 1.65, margin: "0 0 18px",
        }}>
          {copy.sub}
        </p>

        {/* Feature list — paid upgrade only */}
        {!isSignupWall && (
          <div style={{
            background: isDark ? "rgba(212,160,23,0.04)" : "rgba(212,160,23,0.06)",
            border: "1px solid rgba(212,160,23,0.12)",
            borderRadius: 12, padding: "12px 16px", marginBottom: 18,
          }}>
            <div style={{
              display: "flex", alignItems: "baseline", gap: 5,
              justifyContent: "center", marginBottom: 12,
              borderBottom: "1px solid rgba(212,160,23,0.1)", paddingBottom: 10,
            }}>
              <span style={{ fontSize: 26, fontWeight: 900, color: GOLD, fontFamily: "'Playfair Display', serif" }}>₹999</span>
              <span style={{ fontSize: 10, color: "rgba(212,160,23,0.55)", fontWeight: 700, letterSpacing: "1px" }}>/YEAR</span>
            </div>
            {FEATURES.map(f => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 9, padding: "4px 0" }}>
                <span style={{ color: "#27AE60", fontSize: 11, flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: 12, color: isDark ? "#8aabb8" : "#3a5068", fontWeight: 500 }}>{f}</span>
              </div>
            ))}
          </div>
        )}

        {/* Primary CTA — paid upgrade */}
        {!isSignupWall && copy.cta && (
          <button onClick={handleUpgrade} style={{
            width: "100%", padding: "13px",
            background: GOLD, color: NAVY, border: "none",
            borderRadius: 10, fontWeight: 800, fontSize: 12,
            letterSpacing: "0.14em", cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", marginBottom: 8,
            boxShadow: "0 4px 24px rgba(212,160,23,0.3)",
            transition: "all .2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background="#e8b420"; e.currentTarget.style.transform="translateY(-1px)"; }}
          onMouseLeave={e => { e.currentTarget.style.background=GOLD; e.currentTarget.style.transform="translateY(0)"; }}
          >
            {copy.cta}
          </button>
        )}

        {/* Secondary CTA — signup for anon, or "view my reports" for signed-in */}
        {!isSignupWall && (
          user ? (
            <button onClick={() => onClose?.()} style={{
              width: "100%", padding: "13px",
              background: "rgba(212,160,23,0.09)",
              color: GOLD,
              border: "1px solid rgba(212,160,23,0.28)",
              borderRadius: 10, fontWeight: 800, fontSize: 12,
              letterSpacing: "0.12em", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              transition: "opacity .2s",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              CLOSE
            </button>
          ) : (
            <button onClick={handleSignUp} style={{
              width: "100%", padding: "13px",
              background: "rgba(212,160,23,0.09)",
              color: GOLD,
              border: "1px solid rgba(212,160,23,0.28)",
              borderRadius: 10, fontWeight: 800, fontSize: 12,
              letterSpacing: "0.12em", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              transition: "opacity .2s",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              {copy.signupLabel}
            </button>
          )
        )}

        {/* Sign-up CTA — only for signup walls (anon) */}
        {isSignupWall && (
          <button onClick={handleSignUp} style={{
            width: "100%", padding: "13px",
            background: GOLD, color: NAVY, border: "none",
            borderRadius: 10, fontWeight: 800, fontSize: 12,
            letterSpacing: "0.12em", cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: "0 4px 24px rgba(212,160,23,0.28)",
            transition: "opacity .2s",
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            {copy.signupLabel}
          </button>
        )}

        <p style={{
          fontSize: 10, color: isDark ? "#2e4a60" : "#8a9aaa",
          textAlign: "center", margin: "12px 0 0", lineHeight: 1.6,
        }}>
          No spam. No credit card. Cancel anytime.
        </p>
      </div>

      <style>{`
        @keyframes pwFadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes pwSlideUp { from { opacity:0; transform:translate(-50%,-46%) } to { opacity:1; transform:translate(-50%,-50%) } }
      `}</style>
    </>
  );
}