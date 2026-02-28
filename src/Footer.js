import { Link } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "./App";

const GOLD = "#D4A017";
const NAVY = "#0D1B2A";

export default function Footer() {
  const { theme } = useContext(ThemeContext);
  const isDark    = theme === "dark";

  const bg       = isDark ? NAVY              : "#EDE8DE";
  const border   = isDark ? "rgba(212,160,23,0.15)" : "rgba(212,160,23,0.28)";
  const linkCol  = isDark ? "#4a6888"         : "#3a5068";
  const muteCol  = isDark ? "#2e4a64"         : "#7a8a9a";
  const copyCol  = isDark ? "#1e3a5a"         : "#9aaa9a";

  return (
    <footer style={{
      background:  bg,
      color:       linkCol,
      padding:     "56px 28px 36px",
      borderTop:   `1px solid ${border}`,
      fontFamily:  "'DM Sans', sans-serif",
      fontSize:    13,
      textAlign:   "center",
    }}>
      <div style={{ maxWidth:"1200px", margin:"0 auto" }}>

        {/* Logo + Name */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:12, marginBottom:28 }}>
          <svg width="32" height="32" viewBox="0 0 44 44" fill="none">
            <defs>
              <radialGradient id="footNucG" cx="40%" cy="30%" r="65%">
                <stop offset="0%" stopColor="#ffffff"/>
                <stop offset="40%" stopColor={GOLD}/>
                <stop offset="100%" stopColor="#9a6e00"/>
              </radialGradient>
            </defs>
            <ellipse cx="22" cy="22" rx="17" ry="6.2" stroke={GOLD} strokeWidth="1.15" strokeOpacity="0.85" fill="none"/>
            <ellipse cx="22" cy="22" rx="17" ry="6.2" stroke={GOLD} strokeWidth="1.0" strokeOpacity="0.5" fill="none" transform="rotate(60 22 22)"/>
            <ellipse cx="22" cy="22" rx="17" ry="6.2" stroke={GOLD} strokeWidth="0.85" strokeOpacity="0.3" fill="none" transform="rotate(-60 22 22)"/>
            <circle cx="38.6" cy="22" r="2.4" fill={GOLD} fillOpacity="0.85"/>
            <path d="M22 15.5 L26.2 22 L22 28.5 L17.8 22 Z" fill="url(#footNucG)"/>
          </svg>
          <div>
            <div style={{ fontSize:20, fontWeight:800, color:GOLD, fontFamily:"'Playfair Display', serif", lineHeight:1 }}>ALPHA EDGE</div>
            <div style={{ fontSize:7.5, letterSpacing:"3px", color:"rgba(212,160,23,0.4)", fontFamily:"'DM Sans',sans-serif", fontWeight:700, marginTop:2 }}>INVESTMENTS</div>
          </div>
        </div>

        {/* Links */}
        <div style={{ display:"flex", justifyContent:"center", gap:28, flexWrap:"wrap", marginBottom:36 }}>
          {[
            ["Home",                "/"],
            ["Info Edge",           "/info-edge"],
            ["Eicher Motors",       "/eicher-motors"],
            ["IGI Ltd",             "/igil"],
            ["Investment Philosophy","/philosophy"],
            ["About Us",            "/about"],
            ["Terms & Conditions",  "/terms"],
          ].map(([label, path]) => (
            <Link key={label} to={path} style={{ color:linkCol, textDecoration:"none", fontWeight:500, fontSize:12, transition:"color .2s" }}
              onMouseEnter={e => e.target.style.color = GOLD}
              onMouseLeave={e => e.target.style.color = linkCol}>
              {label}
            </Link>
          ))}
        </div>

        {/* Disclaimer */}
        <div style={{ fontSize:11, lineHeight:1.7, maxWidth:600, margin:"0 auto 24px", color:muteCol }}>
          Alpha Edge Research provides institutional-grade equity analysis for informational purposes only.<br/>
          Not SEBI-registered investment advisors. Past performance does not indicate future results.<br/>
          Always consult a qualified financial advisor before making investment decisions.
        </div>

        {/* Copyright */}
        <div style={{ fontSize:11, color:copyCol, borderTop:`1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(13,27,42,0.08)"}`, paddingTop:22 }}>
          © {new Date().getFullYear()} Alpha Edge Investments · All Rights Reserved
        </div>
      </div>
    </footer>
  );
}