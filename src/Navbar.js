import { Link } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "./App";

const GOLD = "#D4A017";

export default function Navbar() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@700;800&family=Playfair+Display:wght@800&display=swap" rel="stylesheet"/>
      <style>{`
        @keyframes spinOrbit1{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes spinOrbit2{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}
        .orbit-ring-1{animation:spinOrbit1 9s linear infinite;transform-origin:50% 50%}
        .orbit-ring-2{animation:spinOrbit2 13s linear infinite;transform-origin:50% 50%}
      `}</style>

      <nav style={{
        position:"fixed",top:0,left:0,right:0,zIndex:100000,
        background:"rgba(10,21,36,0.97)",
        borderBottom:"1px solid rgba(212,160,23,0.14)",
        padding:"0 28px",height:70,
        display:"flex",alignItems:"center",justifyContent:"space-between",
        backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",
      }}>

        {/* ── LOGO ── */}
        <Link to="/" style={{display:"flex",alignItems:"center",gap:13,textDecoration:"none"}}>

          {/*
            Atom mark:
            • Three concentric ellipses at 0°, 60°, -60° — each slightly different rx/ry for perspective
            • Two of the ellipses have a spinning electron dot
            • Nucleus is a sharp diamond octahedron shape
            • Entire mark reads as precise, sharp, scientific
          */}
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="navGlow" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="1.4" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <filter id="coreGlow" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2.2" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <radialGradient id="nucG" cx="40%" cy="30%" r="65%">
                <stop offset="0%" stopColor="#ffffff"/>
                <stop offset="40%" stopColor={GOLD}/>
                <stop offset="100%" stopColor="#9a6e00"/>
              </radialGradient>
              <radialGradient id="eG" cx="40%" cy="30%" r="60%">
                <stop offset="0%" stopColor="#ffe8a0"/>
                <stop offset="100%" stopColor={GOLD}/>
              </radialGradient>
            </defs>

            {/* Orbit 1 — horizontal, no spin, slightly transparent */}
            <ellipse cx="22" cy="22" rx="17" ry="6.2"
              stroke={GOLD} strokeWidth="1.15" strokeOpacity="0.9"
              fill="none" filter="url(#navGlow)"/>

            {/* Orbit 2 — 60° tilt with spinning electron */}
            <g className="orbit-ring-1">
              <ellipse cx="22" cy="22" rx="17" ry="6.2"
                stroke={GOLD} strokeWidth="1.0" strokeOpacity="0.55"
                fill="none" transform="rotate(60 22 22)"/>
              {/* Electron on orbit 2 */}
              <circle cx="38.4" cy="17.4" r="2.6" fill="url(#eG)" filter="url(#navGlow)"/>
            </g>

            {/* Orbit 3 — -60° tilt with spinning electron */}
            <g className="orbit-ring-2">
              <ellipse cx="22" cy="22" rx="17" ry="6.2"
                stroke={GOLD} strokeWidth="0.85" strokeOpacity="0.32"
                fill="none" transform="rotate(-60 22 22)"/>
              {/* Electron on orbit 3 */}
              <circle cx="5.8" cy="27.2" r="2.2" fill={GOLD} fillOpacity="0.65"/>
            </g>

            {/* Fixed electron on orbit 1 */}
            <circle cx="38.6" cy="22" r="2.4" fill={GOLD} filter="url(#navGlow)"/>

            {/* Nucleus — diamond (rotated square + facets) */}
            <g filter="url(#coreGlow)">
              {/* Diamond body */}
              <path d="M22 15.5 L26.2 22 L22 28.5 L17.8 22 Z" fill="url(#nucG)"/>
              {/* Inner shine facet */}
              <path d="M22 16.5 L24.8 21.5 L22 24.5 L20 21.5 Z" fill="white" fillOpacity="0.45"/>
            </g>
          </svg>

          {/* Wordmark */}
          <div>
            <div style={{
              fontSize:20, fontWeight:800, letterSpacing:"0.5px",
              color:GOLD, fontFamily:"'Playfair Display',serif", lineHeight:1,
            }}>
              ALPHA EDGE
            </div>
            <div style={{
              fontSize:8.5, letterSpacing:"3.5px",
              color:"rgba(212,160,23,0.45)", fontFamily:"'DM Sans',sans-serif",
              fontWeight:700, marginTop:2.5, textTransform:"uppercase",
            }}>
              INVESTMENTS
            </div>
          </div>
        </Link>

        {/* ── Right side ── */}
        <div style={{display:"flex",alignItems:"center",gap:24}}>
          <Link to="/" style={{fontSize:11,fontWeight:700,letterSpacing:2,color:"rgba(212,160,23,0.5)",textDecoration:"none",fontFamily:"'DM Sans',sans-serif"}}>
            RESEARCH
          </Link>
          <button onClick={toggleTheme} style={{
            background:"rgba(212,160,23,0.08)",border:"1px solid rgba(212,160,23,0.2)",
            borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:15,
            display:"flex",alignItems:"center",
          }}>
            {theme==="dark"?"☀️":"🌙"}
          </button>
        </div>
      </nav>
    </>
  );
}