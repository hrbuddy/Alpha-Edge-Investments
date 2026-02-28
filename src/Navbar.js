import { Link } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "./App";

const GOLD = "#D4A017";

export default function Navbar() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@700;800&family=Playfair+Display:wght@800&display=swap" rel="stylesheet" />
      <nav style={{
        position:       "fixed",
        top:            0,
        left:           0,
        right:          0,
        zIndex:         100000,
        background:     "rgba(13,27,42,0.96)",
        borderBottom:   "1px solid rgba(212,160,23,0.18)",
        padding:        "0 28px",
        height:         70,
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
      }}>

        {/* ── Logo ── */}
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 13, textDecoration: "none" }}>

          {/* Atom SVG — three tilted elliptical orbits + glowing nucleus */}
          <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <radialGradient id="nucleusGrad" cx="50%" cy="35%" r="60%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="45%" stopColor={GOLD} />
                <stop offset="100%" stopColor="#b8860b" />
              </radialGradient>
            </defs>

            {/* Orbit 1 – horizontal */}
            <ellipse cx="50" cy="50" rx="38" ry="14"
              stroke={GOLD} strokeWidth="2.2" strokeOpacity="0.9" filter="url(#glow)" />

            {/* Orbit 2 – tilted +60° */}
            <ellipse cx="50" cy="50" rx="38" ry="14"
              stroke={GOLD} strokeWidth="2.2" strokeOpacity="0.65"
              transform="rotate(60 50 50)" filter="url(#glow)" />

            {/* Orbit 3 – tilted -60° */}
            <ellipse cx="50" cy="50" rx="38" ry="14"
              stroke={GOLD} strokeWidth="2.2" strokeOpacity="0.4"
              transform="rotate(-60 50 50)" />

            {/* Electron 1 – top-right of orbit 1 */}
            <circle cx="82" cy="42" r="5" fill={GOLD} filter="url(#glow)" />

            {/* Electron 2 – bottom-left of orbit 2 */}
            <circle cx="20" cy="65" r="4.5" fill={GOLD} fillOpacity="0.75" />

            {/* Electron 3 – bottom-right of orbit 3 */}
            <circle cx="78" cy="70" r="4" fill={GOLD} fillOpacity="0.55" />

            {/* Nucleus */}
            <circle cx="50" cy="50" r="10" fill="url(#nucleusGrad)" filter="url(#glow)" />
          </svg>

          {/* Wordmark */}
          <div>
            <div style={{
              fontSize:      22,
              fontWeight:    800,
              letterSpacing: "-0.5px",
              color:         GOLD,
              fontFamily:    "'Playfair Display', serif",
              lineHeight:    1,
            }}>
              ALPHA EDGE
            </div>
            <div style={{
              fontSize:      9,
              letterSpacing: 3,
              color:         "rgba(212,160,23,0.55)",
              fontFamily:    "'DM Sans', sans-serif",
              fontWeight:    600,
              marginTop:     2,
            }}>
              INVESTMENTS
            </div>
          </div>
        </Link>

        {/* ── Nav links (hidden on narrow screens) ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <Link to="/" style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1.5, color: "rgba(212,160,23,0.65)", textDecoration: "none", fontFamily: "'DM Sans', sans-serif" }}>
            RESEARCH
          </Link>

          {/* Dark / light toggle */}
          <button
            onClick={toggleTheme}
            style={{
              background:    "rgba(212,160,23,0.1)",
              border:        "1px solid rgba(212,160,23,0.25)",
              borderRadius:  8,
              padding:       "6px 12px",
              cursor:        "pointer",
              fontSize:      16,
              display:       "flex",
              alignItems:    "center",
            }}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
      </nav>
    </>
  );
}