import { Link } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import { ThemeContext } from "./App";

const NAVY  = "#0D1B2A";
const GOLD  = "#D4A017";
const GREEN = "#27AE60";
const TEAL  = "#0E7C7B";

const stocks = [
  { name: "Info Edge (India) Ltd", ticker: "NSE: NAUKRI · BSE: 532777", rating: "BUY", target: "₹1,700 – 2,100", cagr: "12–17% CAGR to FY30", path: "/info-edge",     active: true  },
  { name: "Eicher Motors Ltd",     ticker: "NSE: EICHERMOT",            rating: "BUY", target: "₹12,500 – 15,000", cagr: "14–16% CAGR to FY30", path: "/eicher-motors", active: true  },
  { name: "Zomato Ltd",            ticker: "NSE: ZOMATO",               rating: null, target: null, cagr: null, path: "#", active: false },
  { name: "PB Fintech Ltd",        ticker: "NSE: POLICYBZR",            rating: null, target: null, cagr: null, path: "#", active: false },
  { name: "Trent Ltd",             ticker: "NSE: TRENT",                rating: null, target: null, cagr: null, path: "#", active: false },
  { name: "Persistent Systems",    ticker: "NSE: PERSISTENT",           rating: null, target: null, cagr: null, path: "#", active: false },
  { name: "Dixon Technologies",    ticker: "NSE: DIXON",                rating: null, target: null, cagr: null, path: "#", active: false },
  { name: "Rail Vikas Nigam",      ticker: "NSE: RVNL",                 rating: null, target: null, cagr: null, path: "#", active: false },
  { name: "Suzlon Energy",         ticker: "NSE: SUZLON",               rating: null, target: null, cagr: null, path: "#", active: false },
  { name: "HDFC Bank Ltd",         ticker: "NSE: HDFCBANK",             rating: null, target: null, cagr: null, path: "#", active: false },
];

// ─── Canvas cosmic scene with PARTICLE ORBITS ─────────────────────────────
function CosmicCanvas() {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const mouse     = useRef({ x: 0, y: 0 });
  const scrollY   = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W, H, cx, cy;
    const pts = [];

    // ── Three orbital planes ──
    const ORBITS = [
      { rxF: 0.30, ryF: 0.11, tilt:   0, spd:  0.00055 },
      { rxF: 0.32, ryF: 0.12, tilt:  62, spd: -0.00048 },
      { rxF: 0.31, ryF: 0.12, tilt: -58, spd:  0.00062 },
    ];

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      cx = W / 2;
      cy = H * 0.44;
    }

    function orbitPos(o, a) {
      const r = o.tilt * Math.PI / 180;
      const lx = Math.cos(a) * o.rxF * W;
      const ly = Math.sin(a) * o.ryF * H;
      return {
        x: cx + lx * Math.cos(r) - ly * Math.sin(r),
        y: cy + lx * Math.sin(r) + ly * Math.cos(r),
      };
    }

    const G  = [212, 160, 23];
    const W3 = [255, 255, 255];
    const IC = [168, 212, 255];
    const c  = (r, g, b, a) => `rgba(${r},${g},${b},${+a.toFixed(3)})`;
    const gc = ([r, g, b], a) => c(r, g, b, a);

    function build() {
      pts.length = 0;

      // ── Background stars ──
      for (let i = 0; i < 500; i++) {
        const bright = Math.random() < 0.10;
        pts.push({
          k: "star", x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - .5) * .05, vy: (Math.random() - .5) * .05,
          sz: bright ? 1.2 + Math.random() * 1.0 : .3 + Math.random() * .5,
          ob: bright ? .6 + Math.random() * .4 : .1 + Math.random() * .2,
          ph: Math.random() * Math.PI * 2, phv: .005 + Math.random() * .01,
          rgb: Math.random() < .35 ? G : Math.random() < .5 ? IC : W3,
          px: .010 + Math.random() * .025,
        });
      }

      // ── Floating crystal diamonds ──
      for (let i = 0; i < 60; i++) {
        const big = Math.random() < .15;
        pts.push({
          k: "crystal", x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - .5) * .10, vy: (Math.random() - .5) * .10,
          sz: big ? 3.0 + Math.random() * 3 : 1.4 + Math.random() * 2,
          ob: big ? .45 + Math.random() * .4 : .15 + Math.random() * .25,
          ph: Math.random() * Math.PI * 2, phv: .007 + Math.random() * .012,
          rot: Math.random() * Math.PI, rv: (Math.random() - .5) * .004,
          rgb: Math.random() < .42 ? G : Math.random() < .5 ? IC : W3,
          px: .025 + Math.random() * .04,
        });
      }

      // ── PARTICLE ORBITS — thousands of glowing dust specks ──
      ORBITS.forEach((o, oi) => {
        // Dense particle ring
        const RING_COUNT = 400;
        for (let i = 0; i < RING_COUNT; i++) {
          const a = (i / RING_COUNT) * Math.PI * 2;
          // Add slight random spread around the orbit path
          const radialNoise = (Math.random() - 0.5) * 0.018;
          const axialNoise  = (Math.random() - 0.5) * 0.018;
          const thisMod = {
            ...o,
            rxF: o.rxF + radialNoise,
            ryF: o.ryF + axialNoise,
          };
          const p = orbitPos(thisMod, a);
          const isBright = Math.random() < 0.08;
          const isGold   = Math.random() < 0.55;
          pts.push({
            k: "ringParticle", oi,
            angle: a,
            angOff: (Math.random() - .5) * 0.04,
            rxMod: radialNoise, ryMod: axialNoise,
            sz: isBright ? 1.6 + Math.random() * 2.2 : 0.4 + Math.random() * 1.0,
            ob: isBright ? 0.7 + Math.random() * 0.3 : 0.15 + Math.random() * 0.35,
            ph: Math.random() * Math.PI * 2,
            phv: .006 + Math.random() * .014,
            bright: isBright,
            rgb: isGold ? G : Math.random() < .4 ? IC : W3,
            x: p.x, y: p.y,
          });
        }
      });

      // ── 3 bright electron beacons on orbits ──
      ORBITS.forEach((o, oi) => {
        const startA = [0, Math.PI * 0.67, Math.PI * 1.33][oi];
        pts.push({
          k: "electron", oi, angle: startA,
          sz: 4.5, ob: 1.0,
          ph: Math.random() * Math.PI * 2, phv: .02,
          rgb: G, x: 0, y: 0,
        });
      });

      // ── Nucleus orbiting specks ──
      for (let i = 0; i < 24; i++) {
        pts.push({
          k: "nuc", angle: (i / 24) * Math.PI * 2,
          r: 6 + Math.random() * 14,
          rv: .015 + Math.random() * .02 * (Math.random() < .5 ? 1 : -1),
          sz: 1.0 + Math.random() * 2.0,
          ob: .6 + Math.random() * .4,
          ph: Math.random() * Math.PI * 2, phv: .025 + Math.random() * .02,
          x: cx, y: cy,
        });
      }
    }

    // ── Draw helpers ──
    function drawStar(x, y, sz, alpha, rgb) {
      if (sz < 0.7) {
        ctx.globalAlpha = alpha;
        ctx.fillStyle = gc(rgb, 1);
        ctx.beginPath(); ctx.arc(x, y, sz, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1; return;
      }
      const len = sz * 5;
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = gc(W3, 1);
      ctx.globalAlpha = alpha * .45;
      ctx.beginPath(); ctx.moveTo(x - len, y); ctx.lineTo(x + len, y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, y - len); ctx.lineTo(x, y + len); ctx.stroke();
      const g = ctx.createRadialGradient(x, y, 0, x, y, sz * 4);
      g.addColorStop(0, gc(rgb, alpha * .6));
      g.addColorStop(.4, gc(rgb, alpha * .15));
      g.addColorStop(1, gc(rgb, 0));
      ctx.globalAlpha = 1; ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, sz * 4, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = gc(W3, 1);
      ctx.beginPath(); ctx.arc(x, y, sz * .45, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }

    function drawDiamond(x, y, sz, rot, alpha, rgb, glow) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
      if (glow) {
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, sz * 5);
        g.addColorStop(0, gc(rgb, alpha * .5));
        g.addColorStop(.5, gc(rgb, alpha * .1));
        g.addColorStop(1, gc(rgb, 0));
        ctx.fillStyle = g; ctx.globalAlpha = 1;
        ctx.beginPath(); ctx.arc(0, 0, sz * 5, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = alpha;
      ctx.fillStyle = gc(rgb, 1);
      ctx.beginPath();
      ctx.moveTo(0, -sz); ctx.lineTo(sz * .6, 0); ctx.lineTo(0, sz); ctx.lineTo(-sz * .6, 0);
      ctx.closePath(); ctx.fill();
      ctx.globalAlpha = alpha * .55;
      ctx.fillStyle = gc(W3, 1);
      ctx.beginPath();
      ctx.moveTo(0, -sz * .85); ctx.lineTo(sz * .2, -sz * .05); ctx.lineTo(0, sz * .1); ctx.lineTo(-sz * .08, -sz * .05);
      ctx.closePath(); ctx.fill();
      ctx.restore(); ctx.globalAlpha = 1;
    }

    function drawElectron(x, y, sz, alpha) {
      // Outer glow
      const g = ctx.createRadialGradient(x, y, 0, x, y, sz * 7);
      g.addColorStop(0, gc(G, alpha * .8));
      g.addColorStop(.3, gc(G, alpha * .3));
      g.addColorStop(1, gc(G, 0));
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, sz * 7, 0, Math.PI * 2); ctx.fill();
      // Core
      ctx.globalAlpha = alpha;
      ctx.fillStyle = gc(W3, 1);
      ctx.beginPath(); ctx.arc(x, y, sz * .6, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    }

    function drawNucleus(t) {
      const pulse = .5 + .5 * Math.sin(t * .0016);
      const R = 22 + pulse * 8; // bigger nucleus

      // Outer atmosphere layers
      for (let layer = 3; layer >= 0; layer--) {
        const r = R * (3.5 - layer * .6);
        const a = (.05 + layer * .04) * (.7 + .3 * pulse);
        const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grd.addColorStop(0, gc(G, a));
        grd.addColorStop(.5, gc(G, a * .4));
        grd.addColorStop(1, gc(G, 0));
        ctx.fillStyle = grd;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      }

      // Bright inner core
      const coreG = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.4);
      coreG.addColorStop(0, gc(W3, .98));
      coreG.addColorStop(.25, gc(G, 1));
      coreG.addColorStop(.7, gc(G, .2));
      coreG.addColorStop(1, gc(G, 0));
      ctx.fillStyle = coreG;
      ctx.beginPath(); ctx.arc(cx, cy, R * 1.4, 0, Math.PI * 2); ctx.fill();

      // Diamond nucleus body
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * .002);
      ctx.globalAlpha = 1;
      ctx.fillStyle = gc(G, 1);
      ctx.beginPath();
      ctx.moveTo(0, -R); ctx.lineTo(R * .65, 0); ctx.lineTo(0, R); ctx.lineTo(-R * .65, 0);
      ctx.closePath(); ctx.fill();
      // facet shine
      ctx.fillStyle = gc(W3, .5);
      ctx.beginPath();
      ctx.moveTo(0, -R * .9); ctx.lineTo(R * .25, -R * .05); ctx.lineTo(0, R * .15); ctx.lineTo(-R * .1, -R * .05);
      ctx.closePath(); ctx.fill();
      ctx.restore();
      ctx.globalAlpha = 1;
    }

    let t = 0;
    function frame() {
      t++;
      const sy = scrollY.current;
      ctx.clearRect(0, 0, W, H);

      // Parallax — shift entire scene up slightly on scroll
      const parallaxY = sy * 0.3;

      ctx.save();
      ctx.translate(0, -parallaxY);

      const bg = ctx.createRadialGradient(cx, cy * .7, 0, cx, cy, Math.max(W, H) * .95);
      bg.addColorStop(0, "#152442");
      bg.addColorStop(.45, "#0d2040");
      bg.addColorStop(1, NAVY);
      ctx.fillStyle = bg; ctx.fillRect(0, parallaxY, W, H);

      // Central nebula glow
      const nb = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * .45);
      nb.addColorStop(0, gc(G, .10));
      nb.addColorStop(.4, gc(G, .04));
      nb.addColorStop(1, gc(G, 0));
      ctx.fillStyle = nb;
      ctx.beginPath(); ctx.arc(cx, cy, W * .45, 0, Math.PI * 2); ctx.fill();

      drawNucleus(t);

      const mdx = (mouse.current.x / (W || 1) - .5) * 2;
      const mdy = (mouse.current.y / (H || 1) - .5) * 2;

      pts.forEach(p => {
        p.ph += p.phv || 0;
        const pulse = .5 + .5 * Math.sin(p.ph);

        if (p.k === "star") {
          p.x += p.vx - mdx * p.px * W * .00010;
          p.y += p.vy - mdy * p.px * H * .00010;
          if (p.x < -5) p.x = W + 5; if (p.x > W + 5) p.x = -5;
          if (p.y < -5) p.y = H + 5; if (p.y > H + 5) p.y = -5;
          drawStar(p.x, p.y, p.sz, p.ob * (.5 + .5 * pulse), p.rgb);

        } else if (p.k === "crystal") {
          p.x += p.vx - mdx * p.px * W * .00015;
          p.y += p.vy - mdy * p.px * H * .00015;
          p.rot += p.rv;
          if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10;
          if (p.y < -10) p.y = H + 10; if (p.y > H + 10) p.y = -10;
          drawDiamond(p.x, p.y, p.sz, p.rot, p.ob * (.55 + .45 * pulse), p.rgb, p.sz > 3);

        } else if (p.k === "ringParticle") {
          // Orbit particles rotate together
          p.angle += ORBITS[p.oi].spd * (1 + Math.sin(t * .0004 + p.oi) * .08);
          const mod = {
            ...ORBITS[p.oi],
            rxF: ORBITS[p.oi].rxF + p.rxMod,
            ryF: ORBITS[p.oi].ryF + p.ryMod,
          };
          const pos = orbitPos(mod, p.angle);
          p.x = pos.x - mdx * 5;
          p.y = pos.y - mdy * 5;
          const alpha = p.ob * (.5 + .5 * pulse);
          // Draw as glowing dot
          if (p.bright) {
            ctx.globalAlpha = alpha;
            const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.sz * 3.5);
            grd.addColorStop(0, gc(p.rgb, 1));
            grd.addColorStop(.4, gc(p.rgb, .3));
            grd.addColorStop(1, gc(p.rgb, 0));
            ctx.fillStyle = grd;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.sz * 3.5, 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = gc(W3, 1);
            ctx.beginPath(); ctx.arc(p.x, p.y, p.sz * .35, 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = 1;
          } else {
            ctx.globalAlpha = alpha;
            ctx.fillStyle = gc(p.rgb, 1);
            ctx.beginPath(); ctx.arc(p.x, p.y, p.sz * .5, 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = 1;
          }

        } else if (p.k === "electron") {
          p.angle += ORBITS[p.oi].spd * 1.0;
          const pos = orbitPos(ORBITS[p.oi], p.angle);
          p.x = pos.x - mdx * 6;
          p.y = pos.y - mdy * 6;
          drawElectron(p.x, p.y, p.sz, .9 + .1 * pulse);

        } else if (p.k === "nuc") {
          p.angle += p.rv;
          p.x = cx + Math.cos(p.angle) * p.r;
          p.y = cy + Math.sin(p.angle) * p.r;
          ctx.globalAlpha = p.ob * (.6 + .4 * pulse);
          ctx.fillStyle = gc(G, 1);
          ctx.beginPath(); ctx.arc(p.x, p.y, p.sz * .5, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = 1;
        }
      });

      ctx.restore();
      rafRef.current = requestAnimationFrame(frame);
    }

    const ro = new ResizeObserver(() => { resize(); build(); });
    ro.observe(canvas);
    const onM = e => { mouse.current.x = e.clientX; mouse.current.y = e.clientY; };
    const onS = () => { scrollY.current = window.scrollY; };
    window.addEventListener("mousemove", onM);
    window.addEventListener("scroll", onS, { passive: true });
    resize(); build(); frame();
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      window.removeEventListener("mousemove", onM);
      window.removeEventListener("scroll", onS);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} />;
}

// ─── Scroll reveal hook ────────────────────────────────────────────────────
function useReveal(threshold = 0.10) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold });
    obs.observe(el); return () => obs.disconnect();
  }, [threshold]);
  return [ref, vis];
}

// ─── Stock tile ────────────────────────────────────────────────────────────
function StockTile({ stock, delay = 0 }) {
  const [hov, setHov] = useState(false);
  const [ref, vis]    = useReveal(0.06);
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0)" : "translateY(28px)",
      transition: `opacity .6s ease ${delay}ms, transform .6s cubic-bezier(.22,1,.36,1) ${delay}ms`,
    }}>
      <Link to={stock.path} style={{ textDecoration: "none" }} onClick={!stock.active ? e => e.preventDefault() : undefined}>
        <div
          onMouseEnter={() => setHov(true)}
          onMouseLeave={() => setHov(false)}
          style={{
            background:   hov && stock.active ? "rgba(212,160,23,0.05)" : "rgba(255,255,255,0.025)",
            border:       `1px solid ${stock.active ? (hov ? GOLD : "rgba(212,160,23,0.4)") : "rgba(255,255,255,0.07)"}`,
            borderRadius: 14,
            padding:      "22px 20px",
            height:       "100%",
            boxSizing:    "border-box",
            transition:   "all .25s cubic-bezier(.4,0,.2,1)",
            boxShadow:    hov && stock.active
              ? `0 0 0 1px rgba(212,160,23,.28), 0 16px 40px rgba(212,160,23,.10), 0 4px 18px rgba(0,0,0,.45)`
              : "0 4px 20px rgba(0,0,0,.35)",
            cursor:   stock.active ? "pointer" : "default",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {stock.active && (
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 1,
              background: `linear-gradient(90deg,transparent,${GOLD},transparent)`,
              opacity: hov ? 1 : 0, transition: "opacity .3s",
            }} />
          )}

          <div style={{ fontSize: 9, color: GOLD, letterSpacing: 2.5, fontWeight: 700, marginBottom: 10, fontFamily: "'DM Sans',sans-serif" }}>
            ALPHA EDGE RESEARCH
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#f0f4f8", fontFamily: "'Playfair Display',serif", lineHeight: 1.3, marginBottom: 4 }}>
            {stock.name}
          </div>
          <div style={{ fontSize: 11, color: "#3d5570", letterSpacing: .3, fontFamily: "'DM Sans',sans-serif" }}>{stock.ticker}</div>

          {stock.active ? (
            <>
              <div style={{ height: 1, background: "rgba(212,160,23,0.12)", margin: "16px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 6, gap: 8 }}>
                <div>
                  <div style={{ fontSize: 9, color: "#3d5570", letterSpacing: 1, marginBottom: 3, fontFamily: "'DM Sans',sans-serif" }}>RATING</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: GREEN, letterSpacing: 1, fontFamily: "'DM Sans',sans-serif" }}>{stock.rating}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 9, color: "#3d5570", letterSpacing: 1, marginBottom: 3, fontFamily: "'DM Sans',sans-serif" }}>FY30 TARGET</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#e8eef4", fontFamily: "'DM Sans',sans-serif" }}>{stock.target}</div>
                </div>
              </div>
              {stock.cagr && <div style={{ fontSize: 11, color: TEAL, marginBottom: 16, fontFamily: "'DM Sans',sans-serif" }}>{stock.cagr}</div>}
              <div style={{
                padding: "11px 14px", background: GOLD, color: NAVY,
                textAlign: "center", borderRadius: 8, fontWeight: 800,
                fontSize: 11, letterSpacing: 1.5, fontFamily: "'DM Sans',sans-serif",
                opacity: hov ? 1 : .88, transition: "opacity .2s",
              }}>
                VIEW FULL DASHBOARD →
              </div>
            </>
          ) : (
            <>
              <div style={{ height: 1, background: "rgba(255,255,255,0.04)", margin: "16px 0" }} />
              <div style={{
                padding: "9px 14px", background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.055)", borderRadius: 8,
                textAlign: "center", fontSize: 10, color: "#2a3d52",
                letterSpacing: 2, fontFamily: "'DM Sans',sans-serif",
              }}>
                RESEARCH IN PROGRESS
              </div>
            </>
          )}
        </div>
      </Link>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────
export default function Home() {
  useContext(ThemeContext);
  const [heroVis, setHeroVis] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [stripRef, stripVis] = useReveal(.25);
  const [headRef,  headVis]  = useReveal(.20);

  useEffect(() => {
    const t = setTimeout(() => setHeroVis(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Track scroll for hero fade + scroll-arrow hide
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const fu = (d = 0) => ({
    opacity:   heroVis ? 1 : 0,
    transform: heroVis ? "translateY(0)" : "translateY(24px)",
    transition: `opacity .85s ease ${d}ms, transform .85s cubic-bezier(.22,1,.36,1) ${d}ms`,
  });

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,300&family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,800&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes floatTag{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes pulseCTA{0%,100%{box-shadow:0 8px 32px rgba(212,160,23,.28)}50%{box-shadow:0 8px 52px rgba(212,160,23,.6)}}
        @keyframes arrowBounce{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(8px)}}
        .ft{animation:floatTag 5.5s ease-in-out infinite}
        .ft:nth-child(2){animation-delay:.55s}
        .ft:nth-child(3){animation-delay:1.1s}
        .ft:nth-child(4){animation-delay:1.65s}
        .ft:nth-child(5){animation-delay:2.2s}
        * { box-sizing: border-box; }

        /* ── Mobile overrides ── */
        @media (max-width:600px){
          .hero-title   { font-size: 52px !important; }
          .hero-sub     { font-size: 14px !important; }
          .hero-cta     { padding: 14px 36px !important; }
          .stats-strip  { padding: 20px 16px !important; gap: 20px !important; }
          .universe-pad { padding: 60px 14px 80px !important; }
          .active-grid  { grid-template-columns: 1fr !important; }
          .inactive-grid{ grid-template-columns: 1fr 1fr !important; }
          .section-head { font-size: 26px !important; }
          .tags-row     { gap: 7px !important; }
          .tag-pill     { padding: 7px 13px !important; font-size: 9px !important; }
        }
        @media (min-width:601px) and (max-width:900px){
          .active-grid  { grid-template-columns: 1fr !important; }
          .inactive-grid{ grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      <div style={{ background: NAVY, minHeight: "100vh", color: "#e2e8f0", fontFamily: "'DM Sans',sans-serif", paddingTop: 70, overflowX: "hidden" }}>

        {/* ── HERO ── */}
        <section style={{ position: "relative", height: "100vh", minHeight: 600, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", overflow: "hidden" }}>
          <CosmicCanvas />

          {/* Vignette overlay */}
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 80% 70% at 50% 46%,transparent 20%,rgba(13,27,42,.72) 100%)" }} />

          {/* Hero text */}
          <div style={{ position: "relative", zIndex: 2, maxWidth: 860, padding: "0 20px", width: "100%" }}>
            <div style={{ fontSize: 10, letterSpacing: 5, color: GOLD, marginBottom: 18, fontWeight: 600, ...fu(150) }}>
              THE BEST TIME TO INVEST IS NOW
            </div>
            <h1 className="hero-title" style={{ fontSize: "clamp(48px,8vw,92px)", fontWeight: 900, lineHeight: .95, margin: "0 0 6px", color: "#fff", fontFamily: "'Playfair Display',serif", letterSpacing: "-1.5px", ...fu(320) }}>
              Alpha Edge
            </h1>
            <h2 className="hero-title" style={{ fontSize: "clamp(48px,8vw,92px)", fontWeight: 900, lineHeight: .95, margin: "0 0 30px", fontFamily: "'Playfair Display',serif", letterSpacing: "-1.5px", background: "linear-gradient(135deg,#f5d060 0%,#D4A017 45%,#c8940f 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", ...fu(460) }}>
              Investments
            </h2>
            <p className="hero-sub" style={{ fontSize: "clamp(14px,2vw,18px)", color: "#5a7a94", margin: "0 0 44px", lineHeight: 1.65, fontWeight: 300, ...fu(600) }}>
              Institutional-grade equity research on India's finest compounders.<br />
              10 hand-picked businesses built to last decades.
            </p>
            <div style={fu(740)}>
              <button
                className="hero-cta"
                onClick={() => document.getElementById("universe").scrollIntoView({ behavior: "smooth" })}
                style={{ background: GOLD, color: NAVY, padding: "15px 50px", borderRadius: 999, fontWeight: 800, fontSize: 12, letterSpacing: 2, border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", animation: "pulseCTA 3.5s ease-in-out 2s infinite" }}
              >
                EXPLORE DASHBOARDS
              </button>
            </div>
          </div>

          {/* ── Floating tags — properly centered ── */}
          <div style={{
            position: "absolute", bottom: 80,
            left: 0, right: 0,           // span full width
            display: "flex",
            justifyContent: "center",    // true center
            flexWrap: "wrap",
            gap: 10,
            padding: "0 20px",
            ...fu(960),
          }}>
            {["MOAT", "QUALITY", "GROWTH", "VALUATION", "COMPOUNDING"].map(tag => (
              <div key={tag} className="ft tag-pill" style={{
                padding: "9px 18px",
                background: "rgba(13,27,42,.75)",
                backdropFilter: "blur(14px)",
                border: "1px solid rgba(212,160,23,.22)",
                borderRadius: 999,
                fontSize: 9,
                letterSpacing: 3,
                color: GOLD,
                fontWeight: 700,
                fontFamily: "'DM Sans',sans-serif",
                whiteSpace: "nowrap",
              }}>{tag}</div>
            ))}
          </div>

          {/* ── Scroll arrow — fades out once user scrolls ── */}
          <div style={{
            position: "absolute",
            bottom: 22,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            opacity: scrolled ? 0 : heroVis ? 0.7 : 0,
            transition: "opacity .5s ease",
            pointerEvents: "none",
            animation: heroVis ? "arrowBounce 2.2s ease-in-out 1.5s infinite" : "none",
          }}>
            <div style={{ width: 1, height: 30, background: "linear-gradient(to bottom,rgba(212,160,23,.8),transparent)" }} />
            <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
              <path d="M1 1L7 7L13 1" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </section>

        {/* ── STATS STRIP ── */}
        <div
          ref={stripRef}
          className="stats-strip"
          style={{
            borderTop: "1px solid rgba(212,160,23,.11)",
            borderBottom: "1px solid rgba(212,160,23,.11)",
            background: "rgba(212,160,23,.022)",
            padding: "24px 40px",
            display: "flex",
            justifyContent: "center",
            gap: "clamp(24px,5vw,80px)",
            flexWrap: "wrap",
            opacity: stripVis ? 1 : 0,
            transform: stripVis ? "none" : "translateY(16px)",
            transition: "opacity .7s ease, transform .7s ease",
          }}
        >
          {[["10", "Researched Companies"], ["FY30", "Projection Horizon"], ["₹0", "Paid Subscription"], ["100%", "Independent Research"]].map(([v, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "clamp(20px,3vw,28px)", fontWeight: 800, color: GOLD, fontFamily: "'Playfair Display',serif" }}>{v}</div>
              <div style={{ fontSize: 10, color: "#2e4560", letterSpacing: 1.5, marginTop: 3, fontFamily: "'DM Sans',sans-serif" }}>{l}</div>
            </div>
          ))}
        </div>

        {/* ── RESEARCH UNIVERSE ── */}
        <section id="universe" className="universe-pad" style={{ padding: "80px 20px 100px", maxWidth: 1400, margin: "0 auto" }}>
          <div
            ref={headRef}
            style={{
              textAlign: "center",
              marginBottom: 50,
              opacity: headVis ? 1 : 0,
              transform: headVis ? "none" : "translateY(20px)",
              transition: "opacity .7s ease, transform .7s ease",
            }}
          >
            <div style={{ fontSize: 9, letterSpacing: 4, color: GOLD, fontWeight: 700, marginBottom: 10, fontFamily: "'DM Sans',sans-serif" }}>
              CURATED EQUITY RESEARCH
            </div>
            <h2 className="section-head" style={{ fontSize: "clamp(24px,4vw,38px)", fontWeight: 800, color: "#f0f4f8", fontFamily: "'Playfair Display',serif", margin: 0, lineHeight: 1.2 }}>
              Our Research Universe
            </h2>
            <div style={{ width: 48, height: 2, background: GOLD, margin: "16px auto 0", borderRadius: 2 }} />
          </div>

          {/* Active stocks — full-width cards on mobile */}
          <div className="active-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))",
            gap: 18,
            marginBottom: 16,
          }}>
            {stocks.filter(s => s.active).map((s, i) => (
              <StockTile key={s.name} stock={s} delay={i * 100} />
            ))}
          </div>

          {/* Inactive stocks — 2-col compact on mobile */}
          <div className="inactive-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 240px), 1fr))",
            gap: 12,
          }}>
            {stocks.filter(s => !s.active).map((s, i) => (
              <StockTile key={s.name} stock={s} delay={80 + i * 45} />
            ))}
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ borderTop: "1px solid rgba(255,255,255,0.04)", padding: "30px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "#1c3350", marginBottom: 5, fontFamily: "'DM Sans',sans-serif" }}>
            Alpha Edge Research · High-Conviction Indian Equity Analysis
          </div>
          <div style={{ fontSize: 10, color: "#1c3350", fontFamily: "'DM Sans',sans-serif" }}>
            Not SEBI-registered investment advice. For informational purposes only.
          </div>
        </footer>
      </div>
    </>
  );
}