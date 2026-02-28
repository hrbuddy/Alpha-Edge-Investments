import { Link } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import { ThemeContext } from "./App";

// ── Design Tokens (identical to all dashboards) ───────────────────────────────
const NAVY   = "#0D1B2A";
const GOLD   = "#D4A017";

const GREEN  = "#27AE60";
const TEAL   = "#0E7C7B";

// ── Stock Universe ────────────────────────────────────────────────────────────
const stocks = [
  { name: "Info Edge (India) Ltd",  ticker: "NSE: NAUKRI · BSE: 532777", rating: "BUY", target: "₹1,700 – 2,100", cagr: "12–17% CAGR to FY30",  path: "/info-edge",     active: true  },
  { name: "Eicher Motors Ltd",      ticker: "NSE: EICHERMOT",             rating: "BUY", target: "₹12,500 – 15,000", cagr: "14–16% CAGR to FY30", path: "/eicher-motors", active: true  },
  { name: "Zomato Ltd",             ticker: "NSE: ZOMATO",                rating: null,  target: null,              cagr: null,                    path: "#",              active: false },
  { name: "PB Fintech Ltd",         ticker: "NSE: POLICYBZR",             rating: null,  target: null,              cagr: null,                    path: "#",              active: false },
  { name: "Trent Ltd",              ticker: "NSE: TRENT",                 rating: null,  target: null,              cagr: null,                    path: "#",              active: false },
  { name: "Persistent Systems",     ticker: "NSE: PERSISTENT",            rating: null,  target: null,              cagr: null,                    path: "#",              active: false },
  { name: "Dixon Technologies",     ticker: "NSE: DIXON",                 rating: null,  target: null,              cagr: null,                    path: "#",              active: false },
  { name: "Rail Vikas Nigam",       ticker: "NSE: RVNL",                  rating: null,  target: null,              cagr: null,                    path: "#",              active: false },
  { name: "Suzlon Energy",          ticker: "NSE: SUZLON",                rating: null,  target: null,              cagr: null,                    path: "#",              active: false },
  { name: "HDFC Bank Ltd",          ticker: "NSE: HDFCBANK",              rating: null,  target: null,              cagr: null,                    path: "#",              active: false },
];

// ── Canvas Atom Particle System ───────────────────────────────────────────────
function CosmicCanvas() {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const mouse     = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let W, H, cx, cy;
    const particles = [];

    // Orbital definitions – 3 ellipses tilted at different angles
    const orbits = [
      { rx: 0.22, ry: 0.08, tilt: 0,    speed: 0.0006, count: 28 },
      { rx: 0.26, ry: 0.10, tilt: 60,   speed: 0.0005, count: 32 },
      { rx: 0.28, ry: 0.09, tilt: -45,  speed: 0.0007, count: 26 },
    ];

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      cx = W / 2;
      cy = H / 2;
    }

    function orbitXY(orbit, angle) {
      const rad  = orbit.tilt * Math.PI / 180;
      const rx   = orbit.rx * W;
      const ry   = orbit.ry * H;
      const lx   = Math.cos(angle) * rx;
      const ly   = Math.sin(angle) * ry;
      return {
        x: cx + lx * Math.cos(rad) - ly * Math.sin(rad),
        y: cy + lx * Math.sin(rad) + ly * Math.cos(rad),
      };
    }

    function makeParticles() {
      particles.length = 0;

      // ── Space dust (random drifting) ──────────────────────────
      for (let i = 0; i < 520; i++) {
        const isCrystal = Math.random() < 0.18;
        particles.push({
          type:    "dust",
          x:       Math.random() * W,
          y:       Math.random() * H,
          vx:      (Math.random() - 0.5) * 0.18,
          vy:      (Math.random() - 0.5) * 0.18,
          size:    isCrystal ? 1.8 + Math.random() * 2.2 : 0.5 + Math.random() * 1.2,
          opBase:  0.15 + Math.random() * 0.55,
          op:      0,
          phase:   Math.random() * Math.PI * 2,
          phaseV:  0.008 + Math.random() * 0.014,
          crystal: isCrystal,
          hue:     Math.random() < 0.4 ? GOLD : Math.random() < 0.5 ? "#a8d8ff" : "#ffffff",
          parallax: 0.02 + Math.random() * 0.06,
        });
      }

      // ── Orbital particles ─────────────────────────────────────
      orbits.forEach((orbit, oi) => {
        for (let i = 0; i < orbit.count; i++) {
          const angle = (i / orbit.count) * Math.PI * 2;
          const pos   = orbitXY(orbit, angle);
          const isBright = Math.random() < 0.35;
          particles.push({
            type:    "orbital",
            orbitIdx: oi,
            angle,
            speed:   orbit.speed * (0.85 + Math.random() * 0.3) * (Math.random() < 0.5 ? 1 : -1),
            size:    isBright ? 2.5 + Math.random() * 2   : 1.2 + Math.random() * 1.4,
            opBase:  isBright ? 0.7 + Math.random() * 0.3 : 0.3 + Math.random() * 0.3,
            op:      0,
            phase:   Math.random() * Math.PI * 2,
            phaseV:  0.012 + Math.random() * 0.018,
            crystal: isBright,
            hue:     isBright ? GOLD : Math.random() < 0.5 ? "#a8d8ff" : "#e8f4ff",
            x: pos.x,
            y: pos.y,
          });
        }
      });

      // ── Nucleus core glow points ──────────────────────────────
      for (let i = 0; i < 6; i++) {
        particles.push({
          type:    "nucleus",
          angle:   (i / 6) * Math.PI * 2,
          r:       3 + Math.random() * 8,
          size:    1.5 + Math.random() * 2,
          opBase:  0.6 + Math.random() * 0.4,
          op:      0,
          phase:   Math.random() * Math.PI * 2,
          phaseV:  0.02 + Math.random() * 0.02,
          speed:   0.008 + Math.random() * 0.012,
          hue:     GOLD,
          crystal: true,
          x: cx, y: cy,
        });
      }
    }

    // Draw a diamond/crystal shape
    function drawCrystal(ctx, x, y, size, alpha, color) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle   = color;
      ctx.strokeStyle = color;
      ctx.lineWidth   = 0.5;
      ctx.translate(x, y);
      ctx.rotate(Math.PI / 4);
      ctx.beginPath();
      ctx.rect(-size / 2, -size / 2, size, size);
      ctx.fill();
      // inner shine
      ctx.globalAlpha = alpha * 0.4;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.rect(-size * 0.15, -size * 0.45, size * 0.3, size * 0.45);
      ctx.fill();
      ctx.restore();
    }

    // Draw a soft glowing dot
    function drawGlow(ctx, x, y, size, alpha, color) {
      const grad = ctx.createRadialGradient(x, y, 0, x, y, size * 2.5);
      grad.addColorStop(0,   color + Math.round(alpha * 255).toString(16).padStart(2, "0"));
      grad.addColorStop(0.4, color + Math.round(alpha * 0.5 * 255).toString(16).padStart(2, "0"));
      grad.addColorStop(1,   color + "00");
      ctx.beginPath();
      ctx.arc(x, y, size * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    function drawOrbitalRings() {
      orbits.forEach(orbit => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(orbit.tilt * Math.PI / 180);
        ctx.beginPath();
        ctx.ellipse(0, 0, orbit.rx * W, orbit.ry * H, 0, 0, Math.PI * 2);
        ctx.strokeStyle = GOLD;
        ctx.lineWidth   = 0.6;
        ctx.globalAlpha = 0.12;
        ctx.stroke();
        ctx.restore();
      });
    }

    function drawNucleus(t) {
      // Outer halo
      const pulseR = 18 + Math.sin(t * 0.002) * 4;
      const haloGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulseR * 3.5);
      haloGrad.addColorStop(0,   GOLD + "55");
      haloGrad.addColorStop(0.5, GOLD + "22");
      haloGrad.addColorStop(1,   GOLD + "00");
      ctx.beginPath();
      ctx.arc(cx, cy, pulseR * 3.5, 0, Math.PI * 2);
      ctx.fillStyle = haloGrad;
      ctx.fill();

      // Core
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulseR);
      coreGrad.addColorStop(0,   "#ffffff");
      coreGrad.addColorStop(0.3, GOLD);
      coreGrad.addColorStop(1,   GOLD + "00");
      ctx.beginPath();
      ctx.arc(cx, cy, pulseR, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();
    }

    let t = 0;
    function animate() {
      t++;
      ctx.clearRect(0, 0, W, H);

      // Deep space bg gradient (subtle, layered)
      const bg = ctx.createRadialGradient(cx, cy * 0.6, 0, cx, cy, Math.max(W, H) * 0.8);
      bg.addColorStop(0,   "#0f2140");
      bg.addColorStop(0.5, "#0a1628");
      bg.addColorStop(1,   NAVY);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Gold rim nebula
      const nebula = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.38);
      nebula.addColorStop(0,   GOLD + "18");
      nebula.addColorStop(0.6, GOLD + "06");
      nebula.addColorStop(1,   "transparent");
      ctx.beginPath();
      ctx.arc(cx, cy, W * 0.38, 0, Math.PI * 2);
      ctx.fillStyle = nebula;
      ctx.fill();

      drawOrbitalRings();
      drawNucleus(t);

      // Mouse parallax offset
      const mx = (mouse.current.x - cx) * 0.00004;
      const my = (mouse.current.y - cy) * 0.00004;

      particles.forEach(p => {
        p.phase += p.phaseV;
        const pulse = 0.5 + 0.5 * Math.sin(p.phase);

        if (p.type === "dust") {
          p.x += p.vx - mx * p.parallax * W;
          p.y += p.vy - my * p.parallax * H;
          if (p.x < -10) p.x = W + 10;
          if (p.x > W + 10) p.x = -10;
          if (p.y < -10) p.y = H + 10;
          if (p.y > H + 10) p.y = -10;
          p.op = p.opBase * (0.55 + 0.45 * pulse);

          if (p.crystal) drawCrystal(ctx, p.x, p.y, p.size, p.op, p.hue);
          else drawGlow(ctx, p.x, p.y, p.size, p.op * 0.7, p.hue);

        } else if (p.type === "orbital") {
          p.angle += p.speed;
          const pos = orbitXY(orbits[p.orbitIdx], p.angle);
          p.x = pos.x - mx * 6;
          p.y = pos.y - my * 6;
          p.op = p.opBase * (0.6 + 0.4 * pulse);

          if (p.crystal) {
            drawCrystal(ctx, p.x, p.y, p.size * (0.85 + 0.15 * pulse), p.op, p.hue);
            // glow halo around bright orbital crystals
            drawGlow(ctx, p.x, p.y, p.size * 0.6, p.op * 0.5, p.hue);
          } else {
            drawGlow(ctx, p.x, p.y, p.size, p.op, p.hue);
          }

        } else if (p.type === "nucleus") {
          p.angle += p.speed;
          p.x = cx + Math.cos(p.angle) * p.r + Math.sin(p.angle * 1.7) * 2;
          p.y = cy + Math.sin(p.angle) * p.r + Math.cos(p.angle * 1.3) * 2;
          p.op = p.opBase * (0.7 + 0.3 * pulse);
          drawCrystal(ctx, p.x, p.y, p.size * (0.9 + 0.1 * pulse), p.op, p.hue);
        }
      });

      animRef.current = requestAnimationFrame(animate);
    }

    function init() {
      resize();
      makeParticles();
      animate();
    }

    const ro = new ResizeObserver(() => {
      resize();
      makeParticles();
    });
    ro.observe(canvas);

    const onMouse = e => { mouse.current.x = e.clientX; mouse.current.y = e.clientY; };
    window.addEventListener("mousemove", onMouse);

    init();
    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
    />
  );
}

// ── Stock Tile ─────────────────────────────────────────────────────────────────
function StockTile({ stock }) {
  const [hovered, setHovered] = useState(false);

  const borderColor = stock.active
    ? hovered ? GOLD : "rgba(212,160,23,0.45)"
    : "rgba(255,255,255,0.07)";

  const shadowStyle = stock.active && hovered
    ? `0 0 0 1px ${GOLD}55, 0 24px 60px rgba(212,160,23,0.18), 0 8px 32px rgba(0,0,0,0.5)`
    : "0 8px 32px rgba(0,0,0,0.4)";

  return (
    <Link
      to={stock.path}
      style={{ textDecoration: "none" }}
      onClick={!stock.active ? e => e.preventDefault() : undefined}
    >
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background:    hovered && stock.active
            ? "rgba(212,160,23,0.04)"
            : "rgba(255,255,255,0.025)",
          border:        `1px solid ${borderColor}`,
          borderRadius:  14,
          padding:       "28px 26px",
          height:        "100%",
          boxSizing:     "border-box",
          transition:    "all 0.28s cubic-bezier(0.4,0,0.2,1)",
          boxShadow:     shadowStyle,
          cursor:        stock.active ? "pointer" : "default",
          position:      "relative",
          overflow:      "hidden",
        }}
      >
        {/* Top gold shimmer line on hover */}
        {stock.active && (
          <div style={{
            position:   "absolute", top: 0, left: 0, right: 0, height: 2,
            background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
            opacity:    hovered ? 1 : 0,
            transition: "opacity 0.3s",
          }} />
        )}

        {/* Header */}
        <div style={{ fontSize: 10, color: GOLD, letterSpacing: 2.5, fontWeight: 700, marginBottom: 14, fontFamily: "'DM Sans', sans-serif" }}>
          ALPHA EDGE RESEARCH
        </div>

        <div style={{ fontSize: 21, fontWeight: 800, color: "#f0f4f8", fontFamily: "'Playfair Display', serif", lineHeight: 1.25, marginBottom: 5 }}>
          {stock.name}
        </div>
        <div style={{ fontSize: 12, color: "#64748b", letterSpacing: 0.5, fontFamily: "'DM Sans', sans-serif" }}>
          {stock.ticker}
        </div>

        {stock.active ? (
          <>
            <div style={{ height: 1, background: "rgba(212,160,23,0.15)", margin: "20px 0" }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 6 }}>
              <div>
                <div style={{ fontSize: 10, color: "#64748b", letterSpacing: 1, marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>RATING</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: GREEN, letterSpacing: 1, fontFamily: "'DM Sans', sans-serif" }}>
                  {stock.rating}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 10, color: "#64748b", letterSpacing: 1, marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>FY30 TARGET</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#e8eef4", fontFamily: "'DM Sans', sans-serif" }}>
                  {stock.target}
                </div>
              </div>
            </div>

            {stock.cagr && (
              <div style={{ fontSize: 12, color: TEAL, marginBottom: 20, fontFamily: "'DM Sans', sans-serif" }}>
                {stock.cagr}
              </div>
            )}

            <div style={{
              padding:    "12px 16px",
              background: GOLD,
              color:      NAVY,
              textAlign:  "center",
              borderRadius: 8,
              fontWeight: 800,
              fontSize:   12,
              letterSpacing: 1.5,
              fontFamily: "'DM Sans', sans-serif",
              transition: "opacity 0.2s",
              opacity:    hovered ? 1 : 0.88,
            }}>
              VIEW FULL DASHBOARD →
            </div>
          </>
        ) : (
          <>
            <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "20px 0" }} />
            <div style={{
              padding:    "10px 16px",
              background: "rgba(255,255,255,0.04)",
              border:     "1px solid rgba(255,255,255,0.07)",
              borderRadius: 8,
              textAlign:  "center",
              fontSize:   11,
              color:      "#475569",
              letterSpacing: 2,
              fontFamily: "'DM Sans', sans-serif",
            }}>
              RESEARCH IN PROGRESS
            </div>
          </>
        )}
      </div>
    </Link>
  );
}

// ── Main Home Component ────────────────────────────────────────────────────────
export default function Home() {
  useContext(ThemeContext);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,300&family=Playfair+Display:wght@700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes pulseGold {
          0%, 100% { box-shadow: 0 0 0 0 rgba(212,160,23,0); }
          50%       { box-shadow: 0 0 28px 6px rgba(212,160,23,0.22); }
        }
        @keyframes floatTag {
          0%, 100% { transform: translateY(0px);  }
          50%       { transform: translateY(-8px); }
        }
        .hero-tag { animation: floatTag 5s ease-in-out infinite; }
        .hero-tag:nth-child(2) { animation-delay: 0.6s; }
        .hero-tag:nth-child(3) { animation-delay: 1.1s; }
        .hero-tag:nth-child(4) { animation-delay: 1.7s; }
        .hero-tag:nth-child(5) { animation-delay: 2.2s; }
      `}</style>

      <div style={{
        background:  NAVY,
        minHeight:   "100vh",
        color:       "#e2e8f0",
        fontFamily:  "'DM Sans', sans-serif",
        paddingTop:  "70px",
        overflowX:   "hidden",
      }}>

        {/* ════════════ HERO ════════════ */}
        <section style={{
          position:   "relative",
          height:     "100vh",
          minHeight:  640,
          display:    "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign:  "center",
          overflow:   "hidden",
        }}>
          <CosmicCanvas />

          {/* Vignette overlay */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: "radial-gradient(ellipse at center, transparent 40%, rgba(13,27,42,0.7) 100%)",
          }} />

          {/* Content */}
          <div style={{ position: "relative", zIndex: 2, maxWidth: 820, padding: "0 24px" }}>

            <div style={{
              fontSize: 11, letterSpacing: 4, color: GOLD,
              marginBottom: 22, fontWeight: 600,
              animation: visible ? "fadeIn 1s ease 0.2s both" : "none",
            }}>
              THE BEST TIME TO INVEST IS NOW
            </div>

            <h1 style={{
              fontSize:    "clamp(52px, 8vw, 88px)",
              fontWeight:  900,
              lineHeight:  1.0,
              margin:      "0 0 10px",
              color:       "#ffffff",
              fontFamily:  "'Playfair Display', serif",
              letterSpacing: "-1px",
              animation:   visible ? "fadeUp 0.9s cubic-bezier(0.22,1,0.36,1) 0.4s both" : "none",
            }}>
              Alpha Edge
            </h1>

            <h2 style={{
              fontSize:   "clamp(52px, 8vw, 88px)",
              fontWeight: 900,
              lineHeight: 1.0,
              margin:     "0 0 32px",
              fontFamily: "'Playfair Display', serif",
              letterSpacing: "-1px",
              background: `linear-gradient(135deg, ${GOLD} 0%, #f5d060 50%, ${GOLD} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation:  visible ? "fadeUp 0.9s cubic-bezier(0.22,1,0.36,1) 0.55s both" : "none",
            }}>
              Investments
            </h2>

            <p style={{
              fontSize:  "clamp(15px, 2vw, 19px)",
              color:     "#8899aa",
              margin:    "0 0 48px",
              lineHeight: 1.65,
              fontWeight: 300,
              animation: visible ? "fadeUp 0.9s cubic-bezier(0.22,1,0.36,1) 0.7s both" : "none",
            }}>
              Institutional-grade equity research on India's finest compounders.<br />
              10 hand-picked businesses built to last decades.
            </p>

            <div style={{
              animation: visible ? "fadeUp 0.9s cubic-bezier(0.22,1,0.36,1) 0.85s both" : "none",
            }}>
              <button
                onClick={() => document.getElementById("research-universe").scrollIntoView({ behavior: "smooth" })}
                style={{
                  background:    GOLD,
                  color:         NAVY,
                  padding:       "16px 52px",
                  borderRadius:  999,
                  fontWeight:    800,
                  fontSize:      13,
                  letterSpacing: 2,
                  border:        "none",
                  cursor:        "pointer",
                  fontFamily:    "'DM Sans', sans-serif",
                  animation:     "pulseGold 3s ease-in-out 2s infinite",
                  boxShadow:     "0 8px 36px rgba(212,160,23,0.35)",
                }}
              >
                EXPLORE DASHBOARDS
              </button>
            </div>
          </div>

          {/* Floating concept tags */}
          <div style={{
            position: "absolute", bottom: 56, left: "50%", transform: "translateX(-50%)",
            display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center",
            animation: visible ? "fadeIn 1s ease 1.4s both" : "none",
          }}>
            {["MOAT", "QUALITY", "GROWTH", "VALUATION", "COMPOUNDING"].map((tag, i) => (
              <div key={tag} className="hero-tag" style={{
                padding:       "10px 22px",
                background:    "rgba(13,27,42,0.7)",
                backdropFilter:"blur(12px)",
                border:        "1px solid rgba(212,160,23,0.25)",
                borderRadius:  999,
                fontSize:      11,
                letterSpacing: 2.5,
                color:         GOLD,
                fontWeight:    600,
                fontFamily:    "'DM Sans', sans-serif",
              }}>
                {tag}
              </div>
            ))}
          </div>

          {/* Scroll indicator */}
          <div style={{
            position:  "absolute", bottom: 18, left: "50%", transform: "translateX(-50%)",
            display:   "flex", flexDirection: "column", alignItems: "center", gap: 6,
            animation: visible ? "fadeIn 1s ease 2s both" : "none",
          }}>
            <div style={{ width: 1, height: 36, background: `linear-gradient(to bottom, ${GOLD}88, transparent)` }} />
            <div style={{ fontSize: 9, letterSpacing: 3, color: GOLD + "88", fontWeight: 600 }}>SCROLL</div>
          </div>
        </section>

        {/* ════════════ STATS STRIP ════════════ */}
        <div style={{
          borderTop:    `1px solid rgba(212,160,23,0.15)`,
          borderBottom: `1px solid rgba(212,160,23,0.15)`,
          background:   "rgba(212,160,23,0.03)",
          padding:      "28px 48px",
          display:      "flex",
          justifyContent: "center",
          gap:          "clamp(32px, 6vw, 96px)",
          flexWrap:     "wrap",
        }}>
          {[
            { v: "10",    l: "Researched Companies" },
            { v: "FY30",  l: "Projection Horizon"   },
            { v: "₹0",    l: "Paid Subscription"    },
            { v: "100%",  l: "Independent Research"  },
          ].map(({ v, l }) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "clamp(22px,3vw,30px)", fontWeight: 800, color: GOLD, fontFamily: "'Playfair Display', serif" }}>{v}</div>
              <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 1.5, marginTop: 4, fontFamily: "'DM Sans', sans-serif" }}>{l}</div>
            </div>
          ))}
        </div>

        {/* ════════════ RESEARCH UNIVERSE ════════════ */}
        <section id="research-universe" style={{ padding: "100px 28px 120px", maxWidth: 1640, margin: "0 auto" }}>

          {/* Section header */}
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ fontSize: 10, letterSpacing: 4, color: GOLD, fontWeight: 700, marginBottom: 14, fontFamily: "'DM Sans', sans-serif" }}>
              CURATED EQUITY RESEARCH
            </div>
            <h2 style={{
              fontSize:   "clamp(28px, 4vw, 40px)",
              fontWeight: 800,
              color:      "#f0f4f8",
              fontFamily: "'Playfair Display', serif",
              margin:     0,
              lineHeight: 1.2,
            }}>
              Our Research Universe
            </h2>
            <div style={{ width: 56, height: 2, background: GOLD, margin: "20px auto 0", borderRadius: 2 }} />
          </div>

          {/* Active dashboards – full width row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px,1fr))", gap: 24, marginBottom: 24 }}>
            {stocks.filter(s => s.active).map((s, i) => (
              <StockTile key={i} stock={s} />
            ))}
          </div>

          {/* Coming soon grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 18 }}>
            {stocks.filter(s => !s.active).map((s, i) => (
              <StockTile key={i} stock={s} />
            ))}
          </div>
        </section>

        {/* ════════════ FOOTER ════════════ */}
        <footer style={{
          borderTop:  `1px solid rgba(255,255,255,0.06)`,
          padding:    "40px 28px",
          textAlign:  "center",
        }}>
          <div style={{ fontSize: 12, color: "#1e3a5f", marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>
            Alpha Edge Research · High-Conviction Indian Equity Analysis
          </div>
          <div style={{ fontSize: 11, color: "#1e3a5f", fontFamily: "'DM Sans', sans-serif" }}>
            Not SEBI-registered investment advice. For informational purposes only. Consult a financial advisor before investing.
          </div>
        </footer>

      </div>
    </>
  );
}