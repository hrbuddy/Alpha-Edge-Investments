import { Link } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import { ThemeContext } from "./App";

const NAVY  = "#0D1B2A";
const GOLD  = "#D4A017";
const GREEN = "#27AE60";
const TEAL  = "#0E7C7B";

// ─── Committed design system palettes ──────────────────────────────────────
//  DARK  → deep navy background, gold accents, muted blue-grey text
//  LIGHT → warm off-white (#F5F0E8), dark navy text, same gold accents
// ---------------------------------------------------------------------------
const DARK_PAL = {
  bg:              NAVY,
  text:            "#e2e8f0",
  subText:         "#5a7a94",
  muted:           "#3d5570",
  cardBg:          "rgba(255,255,255,0.025)",
  cardBorder:      "rgba(212,160,23,0.38)",
  stripBg:         "rgba(212,160,23,0.022)",
  // inactive tiles
  inactiveBorder:  "rgba(255,255,255,0.07)",
  inactiveBg:      "rgba(255,255,255,0.015)",
  inactiveDivider: "rgba(255,255,255,0.05)",
  inactiveBoxBg:   "rgba(255,255,255,0.03)",
  inactiveBoxBdr:  "rgba(255,255,255,0.055)",
  inactiveLabel:   "#2a3d52",
  // carousel
  carouselBg:      "rgba(212,160,23,0.04)",
  carouselBorder:  "rgba(212,160,23,0.12)",
  carouselTitle:   "#c8dae8",
  carouselBody:    "#6a8fa8",
  // stats
  statLabel:       "#6a8fa8",
  // section underlay
  sectionBg:       NAVY,
};

const LIGHT_PAL = {
  bg:              "#F5F0E8",
  text:            "#0D1B2A",
  subText:         "#3a5068",
  muted:           "#7a8a9a",
  cardBg:          "rgba(13,27,42,0.04)",
  cardBorder:      "rgba(212,160,23,0.38)",
  stripBg:         "rgba(212,160,23,0.07)",
  // inactive tiles
  inactiveBorder:  "rgba(13,27,42,0.10)",
  inactiveBg:      "rgba(13,27,42,0.02)",
  inactiveDivider: "rgba(13,27,42,0.08)",
  inactiveBoxBg:   "rgba(13,27,42,0.04)",
  inactiveBoxBdr:  "rgba(13,27,42,0.10)",
  inactiveLabel:   "#7a8a9a",
  // carousel
  carouselBg:      "rgba(13,27,42,0.03)",
  carouselBorder:  "rgba(212,160,23,0.20)",
  carouselTitle:   "#0D1B2A",
  carouselBody:    "#3a5068",
  // stats
  statLabel:       "#5a7a94",
  // section underlay
  sectionBg:       "#F5F0E8",
};

// ─── Home page shows 3 live + 6 coming-soon ────────────────────────────────
//  Full universe (all stocks) lives at /research-universe
const stocks = [
  { name:"Info Edge (India) Ltd", ticker:"NSE: NAUKRI · BSE: 532777", rating:"BUY", target:"₹1,700 – 2,100",   cagr:"12–17% CAGR to FY30", path:"/info-edge",     active:true  },
  { name:"Eicher Motors Ltd",     ticker:"NSE: EICHERMOT · BSE: 505200", rating:"BUY", target:"₹12,500 – 15,000", cagr:"14–16% CAGR to FY30", path:"/eicher-motors", active:true  },
  { name:"MCX Ltd",               ticker:"NSE: MCX · BSE: 534091",    rating:"BUY", target:"₹5,150",           cagr:"Base · 21% CAGR",     path:"/mcx",           active:true  },
  { name:"Zomato Ltd",            ticker:"NSE: ZOMATO",     path:"#", active:false },
  { name:"PB Fintech Ltd",        ticker:"NSE: POLICYBZR",  path:"#", active:false },
  { name:"Trent Ltd",             ticker:"NSE: TRENT",      path:"#", active:false },
  { name:"Dixon Technologies",    ticker:"NSE: DIXON",      path:"#", active:false },
  { name:"Rail Vikas Nigam",      ticker:"NSE: RVNL",       path:"#", active:false },
  { name:"HDFC Bank Ltd",         ticker:"NSE: HDFCBANK",   path:"#", active:false },
];

// ════════════════════════════════════════════════════════════════════════════
//  COSMIC CANVAS  — atom in background, comets, dense star field
// ════════════════════════════════════════════════════════════════════════════
function CosmicCanvas() {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const mouse     = useRef({ x:0, y:0 });
  const scrollYR  = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W, H, cx, cy;

    const ORBITS = [
      { rxF:.255, ryF:.095, tilt:  0, spd: .0052, eA: 0           },
      { rxF:.268, ryF:.101, tilt: 60, spd:-.0045, eA: Math.PI*.67  },
      { rxF:.260, ryF:.098, tilt:-60, spd: .0058, eA: Math.PI*1.33 },
    ];

    const G  = [212,160,23];
    const W3 = [255,255,255];
    const IC = [168,212,255];
    const gc = ([r,g,b],a) => `rgba(${r},${g},${b},${+a.toFixed(3)})`;

    let stars=[], crystals=[], comets=[];

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      cx = W / 2;
      cy = W <= 600 ? H * .28 : H * .42;
    }

    function orbitRy(o) { return Math.min(o.ryF*H, o.rxF*W*0.40); }
    function orbitPos(o, a) {
      const r = o.tilt*Math.PI/180;
      const lx = Math.cos(a)*o.rxF*W;
      const ly = Math.sin(a)*orbitRy(o);
      return { x:cx+lx*Math.cos(r)-ly*Math.sin(r), y:cy+lx*Math.sin(r)+ly*Math.cos(r) };
    }

    function build() {
      stars=[]; crystals=[]; comets=[];

      // Dense sharp stars
      for (let i=0; i<750; i++) {
        const bright = Math.random()<.11;
        stars.push({
          x:Math.random()*W, y:Math.random()*H,
          vx:(Math.random()-.5)*.032, vy:(Math.random()-.5)*.032,
          sz:bright?1.0+Math.random()*.85:.2+Math.random()*.42,
          ob:bright?.55+Math.random()*.42:.06+Math.random()*.18,
          ph:Math.random()*Math.PI*2, phv:.004+Math.random()*.008,
          rgb:Math.random()<.38?G:Math.random()<.5?IC:W3,
          px:.007+Math.random()*.018,
        });
      }
      // Fine cosmic dust
      for (let i=0; i<700; i++) {
        stars.push({
          x:Math.random()*W, y:Math.random()*H,
          vx:(Math.random()-.5)*.012, vy:(Math.random()-.5)*.012,
          sz:.10+Math.random()*.25, ob:.04+Math.random()*.10,
          ph:Math.random()*Math.PI*2, phv:.002+Math.random()*.005,
          rgb:Math.random()<.5?G:W3, px:.003+Math.random()*.008,
        });
      }

      // Drifting crystal diamonds
      for (let i=0; i<50; i++) {
        const big = Math.random()<.13;
        crystals.push({
          x:Math.random()*W, y:Math.random()*H,
          vx:(Math.random()-.5)*.06, vy:(Math.random()-.5)*.06,
          sz:big?2.5+Math.random()*2.2:1.0+Math.random()*1.5,
          ob:big?.32+Math.random()*.34:.09+Math.random()*.18,
          ph:Math.random()*Math.PI*2, phv:.005+Math.random()*.009,
          rot:Math.random()*Math.PI, rv:(Math.random()-.5)*.004,
          rgb:Math.random()<.44?G:Math.random()<.5?IC:W3,
          px:.016+Math.random()*.028,
        });
      }

      for (let i=0; i<5; i++) spawnComet();
    }

    function spawnComet() {
      const fromLeft = Math.random()<.5;
      comets.push({
        x:fromLeft?-140:W+140, y:Math.random()*H*.78,
        vx:fromLeft? 2.2+Math.random()*2.8 : -(2.2+Math.random()*2.8),
        vy:.35+Math.random()*.9,
        len:65+Math.random()*140, sz:.6+Math.random()*.75,
        ob:0, targetOb:.5+Math.random()*.4,
        life:0, maxLife:190+Math.random()*210,
      });
    }

    function drawStar(x,y,sz,alpha,rgb) {
      if (sz<.45) {
        ctx.globalAlpha=alpha; ctx.fillStyle=gc(rgb,1);
        ctx.beginPath(); ctx.arc(x,y,sz,0,Math.PI*2); ctx.fill();
        ctx.globalAlpha=1; return;
      }
      const len=sz*5.2;
      ctx.lineWidth=.48; ctx.globalAlpha=alpha*.38; ctx.strokeStyle=gc(W3,1);
      ctx.beginPath(); ctx.moveTo(x-len,y); ctx.lineTo(x+len,y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x,y-len); ctx.lineTo(x,y+len); ctx.stroke();
      ctx.globalAlpha=alpha*.16;
      const d=len*.5;
      ctx.beginPath(); ctx.moveTo(x-d,y-d); ctx.lineTo(x+d,y+d); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x+d,y-d); ctx.lineTo(x-d,y+d); ctx.stroke();
      const g=ctx.createRadialGradient(x,y,0,x,y,sz*4.2);
      g.addColorStop(0,gc(rgb,alpha*.5)); g.addColorStop(.38,gc(rgb,alpha*.13)); g.addColorStop(1,gc(rgb,0));
      ctx.globalAlpha=1; ctx.fillStyle=g;
      ctx.beginPath(); ctx.arc(x,y,sz*4.2,0,Math.PI*2); ctx.fill();
      ctx.globalAlpha=alpha; ctx.fillStyle=gc(W3,1);
      ctx.beginPath(); ctx.arc(x,y,sz*.36,0,Math.PI*2); ctx.fill();
      ctx.globalAlpha=1;
    }

    function drawDiamond(x,y,sz,rot,alpha,rgb,glow) {
      ctx.save(); ctx.translate(x,y); ctx.rotate(rot);
      if (glow) {
        const g=ctx.createRadialGradient(0,0,0,0,0,sz*5);
        g.addColorStop(0,gc(rgb,alpha*.45)); g.addColorStop(.5,gc(rgb,alpha*.09)); g.addColorStop(1,gc(rgb,0));
        ctx.fillStyle=g; ctx.globalAlpha=1;
        ctx.beginPath(); ctx.arc(0,0,sz*5,0,Math.PI*2); ctx.fill();
      }
      ctx.globalAlpha=alpha; ctx.fillStyle=gc(rgb,1);
      ctx.beginPath();
      ctx.moveTo(0,-sz); ctx.lineTo(sz*.62,0); ctx.lineTo(0,sz); ctx.lineTo(-sz*.62,0);
      ctx.closePath(); ctx.fill();
      ctx.globalAlpha=alpha*.5; ctx.fillStyle=gc(W3,1);
      ctx.beginPath();
      ctx.moveTo(0,-sz*.88); ctx.lineTo(sz*.22,-sz*.06); ctx.lineTo(0,sz*.13); ctx.lineTo(-sz*.09,-sz*.06);
      ctx.closePath(); ctx.fill();
      ctx.restore(); ctx.globalAlpha=1;
    }

    function drawComet(c) {
      const ang=Math.atan2(c.vy,c.vx);
      const tx=c.x-Math.cos(ang)*c.len, ty=c.y-Math.sin(ang)*c.len;
      const g=ctx.createLinearGradient(tx,ty,c.x,c.y);
      g.addColorStop(0,gc(W3,0)); g.addColorStop(.55,gc(G,c.ob*.25)); g.addColorStop(1,gc(W3,c.ob));
      ctx.strokeStyle=g; ctx.lineWidth=c.sz;
      ctx.beginPath(); ctx.moveTo(tx,ty); ctx.lineTo(c.x,c.y); ctx.stroke();
      const hg=ctx.createRadialGradient(c.x,c.y,0,c.x,c.y,c.sz*5.5);
      hg.addColorStop(0,gc(W3,c.ob*.88)); hg.addColorStop(1,gc(G,0));
      ctx.fillStyle=hg; ctx.beginPath(); ctx.arc(c.x,c.y,c.sz*5.5,0,Math.PI*2); ctx.fill();
    }

    function drawOrbits() {
      ORBITS.forEach((o,oi) => {
        ctx.save();
        ctx.translate(cx,cy);
        ctx.rotate(o.tilt*Math.PI/180);
        const ry=orbitRy(o);
        ctx.shadowColor=gc(G,.15); ctx.shadowBlur=8;
        ctx.beginPath(); ctx.ellipse(0,0,o.rxF*W,ry,0,0,Math.PI*2);
        ctx.strokeStyle=gc(G,.05); ctx.lineWidth=5; ctx.stroke();
        ctx.shadowBlur=0;
        const opa = oi===0?.32:oi===1?.22:.14;
        const lw  = oi===0?1.1:oi===1?.9:.7;
        ctx.beginPath(); ctx.ellipse(0,0,o.rxF*W,ry,0,0,Math.PI*2);
        ctx.strokeStyle=gc(G,opa); ctx.lineWidth=lw; ctx.stroke();
        ctx.restore();
        o.eA += o.spd;
        const ep=orbitPos(o,o.eA);
        const eg=ctx.createRadialGradient(ep.x,ep.y,0,ep.x,ep.y,12);
        eg.addColorStop(0,gc(G,.5)); eg.addColorStop(.45,gc(G,.10)); eg.addColorStop(1,gc(G,0));
        ctx.fillStyle=eg; ctx.beginPath(); ctx.arc(ep.x,ep.y,12,0,Math.PI*2); ctx.fill();
        const ec=ctx.createRadialGradient(ep.x-.8,ep.y-.8,0,ep.x,ep.y,5.5);
        ec.addColorStop(0,gc(W3,.98)); ec.addColorStop(.45,gc(G,1)); ec.addColorStop(1,gc(G,0));
        ctx.fillStyle=ec; ctx.beginPath(); ctx.arc(ep.x,ep.y,5.5,0,Math.PI*2); ctx.fill();
      });
    }

    function drawNucleus(t) {
      const pulse=.5+.5*Math.sin(t*.0018);
      const R=12+pulse*4;
      [4.5,3.2,2.2,1.6].forEach((mult,i) => {
        const r=R*mult, a=(.042-i*.006)*(.68+.32*pulse);
        const grd=ctx.createRadialGradient(cx,cy,0,cx,cy,r);
        grd.addColorStop(0,gc(G,a)); grd.addColorStop(.55,gc(G,a*.32)); grd.addColorStop(1,gc(G,0));
        ctx.fillStyle=grd; ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill();
      });
      const ig=ctx.createRadialGradient(cx,cy,0,cx,cy,R*1.7);
      ig.addColorStop(0,gc(W3,.96)); ig.addColorStop(.22,gc(G,1)); ig.addColorStop(.75,gc(G,.10)); ig.addColorStop(1,gc(G,0));
      ctx.fillStyle=ig; ctx.beginPath(); ctx.arc(cx,cy,R*1.7,0,Math.PI*2); ctx.fill();
      ctx.save(); ctx.translate(cx,cy); ctx.rotate(t*.0012);
      const dg=ctx.createLinearGradient(0,-R,0,R);
      dg.addColorStop(0,gc(W3,.96)); dg.addColorStop(.3,gc(G,1)); dg.addColorStop(1,gc([175,115,5],1));
      ctx.fillStyle=dg; ctx.globalAlpha=1;
      ctx.beginPath(); ctx.moveTo(0,-R); ctx.lineTo(R*.72,0); ctx.lineTo(0,R); ctx.lineTo(-R*.72,0); ctx.closePath(); ctx.fill();
      ctx.fillStyle=gc(W3,.52); ctx.globalAlpha=1;
      ctx.beginPath(); ctx.moveTo(0,-R*.88); ctx.lineTo(R*.26,-R*.06); ctx.lineTo(0,R*.14); ctx.lineTo(-R*.1,-R*.06); ctx.closePath(); ctx.fill();
      ctx.restore(); ctx.globalAlpha=1;
    }

    let t=0;
    function frame() {
      t++;
      ctx.clearRect(0,0,W,H);
      const py=scrollYR.current*.25;
      ctx.save(); ctx.translate(0,-py);
      const bg=ctx.createRadialGradient(cx,cy*.5,0,cx,cy,Math.max(W,H)*.98);
      bg.addColorStop(0,"#152442"); bg.addColorStop(.5,"#0d1e3a"); bg.addColorStop(1,NAVY);
      ctx.fillStyle=bg; ctx.fillRect(0,py,W,H);
      const nb=ctx.createRadialGradient(cx,cy,0,cx,cy,W*.32);
      nb.addColorStop(0,gc(G,.07)); nb.addColorStop(.5,gc(G,.025)); nb.addColorStop(1,gc(G,0));
      ctx.fillStyle=nb; ctx.beginPath(); ctx.arc(cx,cy,W*.32,0,Math.PI*2); ctx.fill();
      const mdx=(mouse.current.x/(W||1)-.5)*2;
      const mdy=(mouse.current.y/(H||1)-.5)*2;
      stars.forEach(p => {
        p.ph+=p.phv; const pulse=.5+.5*Math.sin(p.ph);
        p.x+=p.vx-mdx*p.px*W*.00007; p.y+=p.vy-mdy*p.px*H*.00007;
        if(p.x<-5)p.x=W+5; if(p.x>W+5)p.x=-5;
        if(p.y<-5)p.y=H+5; if(p.y>H+5)p.y=-5;
        drawStar(p.x,p.y,p.sz,p.ob*(.5+.5*pulse),p.rgb);
      });
      crystals.forEach(p => {
        p.ph+=p.phv; p.rot+=p.rv; const pulse=.5+.5*Math.sin(p.ph);
        p.x+=p.vx-mdx*p.px*W*.00010; p.y+=p.vy-mdy*p.px*H*.00010;
        if(p.x<-12)p.x=W+12; if(p.x>W+12)p.x=-12;
        if(p.y<-12)p.y=H+12; if(p.y>H+12)p.y=-12;
        drawDiamond(p.x,p.y,p.sz,p.rot,p.ob*(.55+.45*pulse),p.rgb,p.sz>2.2);
      });
      for (let i=comets.length-1; i>=0; i--) {
        const c=comets[i]; c.life++; c.x+=c.vx; c.y+=c.vy;
        if(c.life<35)      c.ob=c.targetOb*(c.life/35);
        else if(c.life>c.maxLife-45) c.ob=c.targetOb*((c.maxLife-c.life)/45);
        else c.ob=c.targetOb;
        drawComet(c);
        if(c.life>=c.maxLife||c.x<-260||c.x>W+260){ comets.splice(i,1); if(Math.random()<.45) spawnComet(); }
      }
      if(comets.length<4&&Math.random()<.005) spawnComet();
      drawOrbits();
      drawNucleus(t);
      ctx.restore();
      rafRef.current=requestAnimationFrame(frame);
    }

    const ro=new ResizeObserver(()=>{resize();build();});
    ro.observe(canvas);
    const onM=e=>{mouse.current.x=e.clientX;mouse.current.y=e.clientY;};
    const onS=()=>{scrollYR.current=window.scrollY;};
    window.addEventListener("mousemove",onM);
    window.addEventListener("scroll",onS,{passive:true});
    resize(); build(); frame();
    return () => {
      cancelAnimationFrame(rafRef.current); ro.disconnect();
      window.removeEventListener("mousemove",onM);
      window.removeEventListener("scroll",onS);
    };
  },[]);

  return <canvas ref={canvasRef} style={{position:"absolute",inset:0,width:"100%",height:"100%",display:"block"}}/>;
}

// ─── Dashboard Card ─────────────────────────────────────────────────────────
function DashboardCard({ card, pal, isDark }) {
  const [hov, setHov] = useState(false);
  return (
    <Link to={card.path} style={{ textDecoration:"none" }}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          background: hov ? `rgba(${card.color === "#D4A017" ? "212,160,23" : card.color === "#27AE60" ? "39,174,96" : "46,117,182"},0.07)` : pal.cardBg,
          border: `1px solid ${hov ? card.color : pal.cardBorder}`,
          borderRadius: 14, padding: "24px 20px",
          transition: "all .25s cubic-bezier(.4,0,.2,1)",
          boxShadow: hov ? `0 12px 32px rgba(0,0,0,.18), 0 0 0 1px ${card.color}22` : "0 4px 18px rgba(0,0,0,.1)",
          cursor: "pointer", position: "relative", overflow: "hidden",
          minHeight: 180,
        }}
      >
        {/* Top accent line */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: card.color,
          opacity: hov ? 1 : 0.35,
          transition: "opacity .25s",
        }}/>

        {/* Badge */}
        {card.badge && (
          <div style={{
            position: "absolute", top: 14, right: 14,
            background: "#27AE60", color: "#fff",
            fontSize: 8, fontWeight: 800, letterSpacing: "1.5px",
            padding: "3px 8px", borderRadius: 999,
            fontFamily: "'DM Sans',sans-serif",
            boxShadow: "0 0 10px rgba(39,174,96,0.5)",
          }}>
            {card.badge}
          </div>
        )}

        <div style={{ fontSize: 28, marginBottom: 12 }}>{card.icon}</div>
        <div style={{ fontSize: 8, letterSpacing: "2px", color: card.color, fontWeight: 700, marginBottom: 6, fontFamily: "'DM Sans',sans-serif", opacity: 0.8 }}>
          {card.label}
        </div>
        <div style={{ fontSize: 16, fontWeight: 800, color: pal.text, fontFamily: "'Playfair Display',serif", lineHeight: 1.25, marginBottom: 10 }}>
          {card.title}
        </div>
        <p style={{ fontSize: 12, color: pal.muted, lineHeight: 1.7, margin: "0 0 16px", fontFamily: "'DM Sans',sans-serif" }}>
          {card.desc}
        </p>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 10, fontWeight: 800, letterSpacing: "1.2px",
          color: card.color, fontFamily: "'DM Sans',sans-serif",
          opacity: hov ? 1 : 0.7, transition: "opacity .2s",
        }}>
          OPEN DASHBOARD <span style={{ transform: hov ? "translateX(3px)" : "none", transition: "transform .2s", display:"inline-block" }}>→</span>
        </div>
      </div>
    </Link>
  );
}

// ─── Scroll reveal ──────────────────────────────────────────────────────────
function useReveal(threshold=.08) {
  const ref=useRef(null);
  const [vis,setVis]=useState(false);
  useEffect(()=>{
    const el=ref.current; if(!el)return;
    const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting){setVis(true);obs.disconnect();}},{threshold});
    obs.observe(el); return()=>obs.disconnect();
  },[threshold]);
  return [ref,vis];
}

// ─── Stock tile ─────────────────────────────────────────────────────────────
function StockTile({stock, delay=0, pal}) {
  const [hov,setHov]=useState(false);
  const [ref,vis]=useReveal(.05);

  return (
    <div ref={ref} style={{
      opacity:vis?1:0, transform:vis?"translateY(0)":"translateY(24px)",
      transition:`opacity .6s ease ${delay}ms,transform .6s cubic-bezier(.22,1,.36,1) ${delay}ms`,
    }}>
      <Link to={stock.path} style={{textDecoration:"none"}} onClick={!stock.active?e=>e.preventDefault():undefined}>
        <div
          onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
          style={{
            background: stock.active ? (hov?"rgba(212,160,23,0.05)":pal.cardBg) : pal.cardBg,
            border:`1px solid ${stock.active?(hov?GOLD:pal.cardBorder):pal.cardBorder}`,
            borderRadius:14, padding:"20px 18px", height:"100%", boxSizing:"border-box",
            transition:"all .25s cubic-bezier(.4,0,.2,1)",
            boxShadow:hov&&stock.active
              ?"0 0 0 1px rgba(212,160,23,.25),0 14px 36px rgba(212,160,23,.09),0 4px 16px rgba(0,0,0,.25)"
              :"0 4px 18px rgba(0,0,0,.12)",
            cursor:stock.active?"pointer":"default",
            position:"relative", overflow:"hidden",
          }}
        >
          {stock.active && (
            <div style={{
              position:"absolute",top:0,left:0,right:0,height:1,
              background:`linear-gradient(90deg,transparent,${GOLD},transparent)`,
              opacity:hov?1:0,transition:"opacity .3s",
            }}/>
          )}

          <div style={{fontSize:9,color:GOLD,letterSpacing:2.5,fontWeight:700,marginBottom:9,fontFamily:"'DM Sans',sans-serif"}}>
            VANTAGE CAPITAL INVESTMENTS
          </div>
          <div style={{fontSize:17,fontWeight:800,color:pal.text,fontFamily:"'Playfair Display',serif",lineHeight:1.3,marginBottom:4}}>
            {stock.name}
          </div>
          <div style={{fontSize:11,color:pal.muted,letterSpacing:.3,fontFamily:"'DM Sans',sans-serif"}}>
            {stock.ticker}
          </div>

          {stock.active ? (
            <>
              <div style={{height:1,background:"rgba(212,160,23,0.12)",margin:"14px 0"}}/>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:5,gap:8}}>
                <div>
                  <div style={{fontSize:9,color:pal.muted,letterSpacing:1,marginBottom:3,fontFamily:"'DM Sans',sans-serif"}}>RATING</div>
                  <div style={{fontSize:17,fontWeight:800,color:GREEN,letterSpacing:1,fontFamily:"'DM Sans',sans-serif"}}>{stock.rating}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:9,color:pal.muted,letterSpacing:1,marginBottom:3,fontFamily:"'DM Sans',sans-serif"}}>TARGET</div>
                  <div style={{fontSize:13,fontWeight:800,color:pal.text,fontFamily:"'DM Sans',sans-serif"}}>{stock.target}</div>
                </div>
              </div>
              {stock.cagr && (
                <div style={{fontSize:11,color:TEAL,marginBottom:14,fontFamily:"'DM Sans',sans-serif"}}>{stock.cagr}</div>
              )}
              <div style={{
                padding:"10px 14px",background:GOLD,color:NAVY,textAlign:"center",
                borderRadius:8,fontWeight:800,fontSize:11,letterSpacing:1.5,
                fontFamily:"'DM Sans',sans-serif",opacity:hov?1:.88,transition:"opacity .2s",
              }}>
                VIEW FULL DASHBOARD →
              </div>
            </>
          ) : (
            <>
              <div style={{height:1,background:"rgba(212,160,23,0.10)",margin:"12px 0"}}/>
              <div style={{
                display:"inline-block",
                padding:"4px 10px",
                background:"rgba(212,160,23,0.08)",
                border:"1px solid rgba(212,160,23,0.2)",
                borderRadius:999,fontSize:9,
                color:"rgba(212,160,23,0.65)",letterSpacing:2,fontWeight:700,
                fontFamily:"'DM Sans',sans-serif",
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

// ─── Request a Stock tile ────────────────────────────────────────────────────
function RequestStockTile({ pal, onOpen }) {
  const [hov,setHov]=useState(false);
  return (
    <div
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      onClick={onOpen}
      style={{
        background: hov?"rgba(212,160,23,0.05)":pal.cardBg,
        border:`1px dashed ${hov?GOLD:"rgba(212,160,23,0.3)"}`,
        borderRadius:14, padding:"28px 18px",
        cursor:"pointer", textAlign:"center",
        transition:"all .25s", boxSizing:"border-box",
        display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,
      }}
    >
      <div style={{fontSize:28,opacity:hov?1:0.5,transition:"opacity .2s"}}>＋</div>
      <div style={{fontSize:14,fontWeight:800,color:hov?GOLD:pal.muted,fontFamily:"'Playfair Display',serif",transition:"color .2s"}}>
        Request a Stock
      </div>
      <div style={{fontSize:11,color:pal.muted,fontFamily:"'DM Sans',sans-serif",lineHeight:1.5}}>
        Don't see a stock you're tracking?<br/>Tell us and we'll add it to our pipeline.
      </div>
    </div>
  );
}

// ─── Request Stock Popup ─────────────────────────────────────────────────────
function RequestStockPopup({ pal, isDark, onClose }) {
  const [name,setName]=useState("");
  const [ticker,setTicker]=useState("");
  const [email,setEmail]=useState("");
  const [submitted,setSubmitted]=useState(false);
  const [err,setErr]=useState("");

  function handleSubmit() {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErr("Please enter a valid email address."); return;
    }
    setSubmitted(true);
  }

  const inputStyle = {
    width:"100%", boxSizing:"border-box",
    background: isDark?"rgba(255,255,255,0.04)":"rgba(13,27,42,0.04)",
    border:`1px solid rgba(212,160,23,0.2)`,
    borderRadius:8, padding:"10px 14px",
    color: isDark?"#c8dae8":"#0D1B2A",
    fontSize:13, fontFamily:"'DM Sans',sans-serif",
    outline:"none",
  };

  return (
    <div style={{
      position:"fixed",inset:0,zIndex:9999999,
      background:"rgba(0,0,0,0.7)",backdropFilter:"blur(6px)",
      display:"flex",alignItems:"center",justifyContent:"center",padding:16,
    }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{
        background: isDark?"#0D1B2A":"#f5f0e8",
        border:`1px solid rgba(212,160,23,0.25)`,
        borderRadius:16, padding:"32px 28px",
        width:"100%", maxWidth:420,
        boxShadow:"0 24px 64px rgba(0,0,0,0.5)",
      }}>
        {submitted ? (
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:36,marginBottom:12}}>✅</div>
            <div style={{fontSize:18,fontWeight:800,color:GOLD,fontFamily:"'Playfair Display',serif",marginBottom:8}}>
              Request Received!
            </div>
            <div style={{fontSize:13,color:isDark?"#94a3b8":"#4a6070",fontFamily:"'DM Sans',sans-serif",lineHeight:1.6}}>
              Thanks! We'll notify you at <strong style={{color:GOLD}}>{email}</strong> when we publish research on {name||"this stock"}.
            </div>
            <button onClick={onClose} style={{marginTop:24,padding:"10px 28px",background:GOLD,color:"#0D1B2A",border:"none",borderRadius:8,fontWeight:800,fontSize:12,letterSpacing:1.2,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
              CLOSE
            </button>
          </div>
        ) : (
          <>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div style={{fontSize:18,fontWeight:800,color:GOLD,fontFamily:"'Playfair Display',serif"}}>
                Request a Stock
              </div>
              <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:"rgba(212,160,23,0.5)",lineHeight:1,padding:4}}>×</button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div>
                <div style={{fontSize:10,fontWeight:700,letterSpacing:1.2,color:"rgba(212,160,23,0.7)",fontFamily:"'DM Sans',sans-serif",marginBottom:6}}>STOCK NAME</div>
                <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Zomato Ltd" style={inputStyle}/>
              </div>
              <div>
                <div style={{fontSize:10,fontWeight:700,letterSpacing:1.2,color:"rgba(212,160,23,0.7)",fontFamily:"'DM Sans',sans-serif",marginBottom:6}}>NSE TICKER (optional)</div>
                <input value={ticker} onChange={e=>setTicker(e.target.value)} placeholder="e.g. ZOMATO" style={inputStyle}/>
              </div>
              <div>
                <div style={{fontSize:10,fontWeight:700,letterSpacing:1.2,color:"rgba(212,160,23,0.7)",fontFamily:"'DM Sans',sans-serif",marginBottom:6}}>YOUR EMAIL <span style={{color:"#C0392B"}}>*</span></div>
                <input value={email} onChange={e=>{setEmail(e.target.value);setErr("");}} placeholder="you@example.com" type="email" style={{...inputStyle,...(err?{border:"1px solid #C0392B"}:{})}}/>
                {err && <div style={{fontSize:11,color:"#C0392B",marginTop:4,fontFamily:"'DM Sans',sans-serif"}}>{err}</div>}
              </div>
              <button onClick={handleSubmit} style={{
                marginTop:4, padding:"12px",background:GOLD,color:"#0D1B2A",
                border:"none",borderRadius:8,fontWeight:800,fontSize:12,
                letterSpacing:1.4,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",
                transition:"opacity .2s",
              }}
                onMouseEnter={e=>e.target.style.opacity=".88"}
                onMouseLeave={e=>e.target.style.opacity="1"}
              >
                SUBMIT REQUEST →
              </button>
              <div style={{fontSize:10,color:"rgba(212,160,23,0.4)",textAlign:"center",fontFamily:"'DM Sans',sans-serif"}}>
                We'll email you when research is published.
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Investment Disclaimer Popup ─────────────────────────────────────────────
function DisclaimerPopup({ pal, isDark, onAccept }) {
  return (
    <div style={{
      position:"fixed",inset:0,zIndex:9999998,
      background:"rgba(0,0,0,0.82)",backdropFilter:"blur(8px)",
      display:"flex",alignItems:"center",justifyContent:"center",padding:16,
    }}>
      <div style={{
        background: isDark?"#0D1B2A":"#f5f0e8",
        border:`1px solid rgba(212,160,23,0.3)`,
        borderRadius:16, padding:"36px 28px",
        width:"100%", maxWidth:480,
        boxShadow:"0 24px 64px rgba(0,0,0,0.6)",
        textAlign:"center",
      }}>
        <div style={{fontSize:32,marginBottom:12}}>⚠️</div>
        <div style={{fontSize:20,fontWeight:800,color:GOLD,fontFamily:"'Playfair Display',serif",marginBottom:16,lineHeight:1.3}}>
          Investment Disclaimer
        </div>
        <div style={{
          background:"rgba(212,160,23,0.06)",border:"1px solid rgba(212,160,23,0.15)",
          borderRadius:10,padding:"16px 18px",marginBottom:20,textAlign:"left",
        }}>
          {[
            "Vantage Capital Investments is NOT a SEBI-registered investment advisor.",
            "All research, analysis, and content published here is strictly for educational and informational purposes only.",
            "Nothing on this platform constitutes investment advice, a solicitation, or a recommendation to buy or sell any security.",
            "Past performance does not guarantee future results. Investing in equities involves significant risk of loss.",
            "Always consult a SEBI-registered financial advisor before making any investment decisions.",
          ].map((pt,i)=>(
            <div key={i} style={{display:"flex",gap:10,marginBottom:i<4?10:0,alignItems:"flex-start"}}>
              <span style={{color:GOLD,fontWeight:700,flexShrink:0,fontFamily:"'DM Sans',sans-serif",fontSize:12}}>•</span>
              <span style={{fontSize:12,color:isDark?"#c8dae8":"#2a3d52",fontFamily:"'DM Sans',sans-serif",lineHeight:1.6}}>{pt}</span>
            </div>
          ))}
        </div>
        <button
          onClick={onAccept}
          style={{
            width:"100%",padding:"14px",background:GOLD,color:"#0D1B2A",
            border:"none",borderRadius:8,fontWeight:800,fontSize:12,
            letterSpacing:1.4,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",
            marginBottom:10,transition:"opacity .2s",
          }}
          onMouseEnter={e=>e.target.style.opacity=".88"}
          onMouseLeave={e=>e.target.style.opacity="1"}
        >
          I UNDERSTAND & AGREE TO PROCEED
        </button>
        <div style={{fontSize:10,color:"rgba(212,160,23,0.45)",fontFamily:"'DM Sans',sans-serif"}}>
          By proceeding, you confirm you have read and understood this disclaimer.
        </div>
      </div>
    </div>
  );
}

// ─── Edge Carousel (Research Philosophy Slideshow) ──────────────────────────
const EDGE_SLIDES = [
  {
    icon:"🔍",
    title:"Deep Due Diligence",
    body:"We go beyond screeners. Every business is stress-tested across multiple economic cycles — studying unit economics, capital allocation history, and management track record before forming a view.",
  },
  {
    icon:"🏆",
    title:"Quality First",
    body:"We only invest in businesses with durable competitive moats — pricing power, network effects, switching costs, or cost advantages — that compound shareholder value across decades.",
  },
  {
    icon:"📐",
    title:"Valuation Discipline",
    body:"Great businesses bought at the wrong price destroy wealth. We wait for the right entry — using DCF, reverse DCF, and peer-relative frameworks to ensure a meaningful margin of safety.",
  },
  {
    icon:"♾️",
    title:"Long-Term Horizon",
    body:"We think in decades, not quarters. Our FY30 targets reflect 5+ year conviction — not momentum calls. Low churn, patient capital, and compounding are the foundations of our edge.",
  },
];

function EdgeCarousel({ pal }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  function goTo(i) { setActive(i); }

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(() => {
      setActive(a => (a+1) % EDGE_SLIDES.length);
    }, 4000);
    return () => clearInterval(timerRef.current);
  }, [paused]);

  const slide = EDGE_SLIDES[active];

  return (
    <section style={{padding:"56px 24px 0", maxWidth:860, margin:"0 auto", textAlign:"center"}}>
      <div
        onMouseEnter={()=>setPaused(true)}
        onMouseLeave={()=>setPaused(false)}
        style={{
          background: pal.carouselBg,
          border:     `1px solid ${pal.carouselBorder}`,
          borderRadius:16,
          padding:"clamp(28px,4vw,48px) clamp(20px,5vw,56px)",
          position:"relative",
          minHeight:220,
          display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center",
        }}
      >
        <div style={{fontSize:9,letterSpacing:"0.38em",color:GOLD,fontWeight:700,marginBottom:20,fontFamily:"'DM Sans',sans-serif"}}>
          OUR EDGE
        </div>

        {/* Slide content — fade-up transition */}
        <div key={active} style={{animation:"edgeFadeIn .55s ease forwards"}}>
          <div style={{fontSize:36,marginBottom:14}}>{slide.icon}</div>
          <div style={{
            fontSize:"clamp(16px,2vw,20px)", fontWeight:800,
            color:pal.carouselTitle,
            fontFamily:"'Playfair Display',serif", marginBottom:14, letterSpacing:"-0.3px",
          }}>
            {slide.title}
          </div>
          <p style={{
            fontSize:"clamp(13px,1.5vw,15px)",
            color:pal.carouselBody,
            lineHeight:1.85, margin:0,
            fontFamily:"'DM Sans',sans-serif", fontWeight:400,
            maxWidth:560,
          }}>
            {slide.body}
          </p>
        </div>

        {/* Dot indicators */}
        <div style={{display:"flex",gap:8,marginTop:28}}>
          {EDGE_SLIDES.map((_,i) => (
            <button
              key={i}
              onClick={()=>goTo(i)}
              style={{
                width:i===active?22:7, height:7, borderRadius:999,
                background:i===active?GOLD:"rgba(212,160,23,0.25)",
                border:"none", cursor:"pointer", padding:0,
                transition:"width .35s ease, background .35s ease",
              }}
            />
          ))}
        </div>

        {/* Progress bar */}
        {!paused && (
          <div style={{position:"absolute",bottom:0,left:0,right:0,height:2,borderRadius:"0 0 16px 16px",overflow:"hidden",background:"rgba(212,160,23,0.08)"}}>
            <div key={active} style={{height:"100%",background:GOLD,animation:"edgeProgress 4s linear forwards"}}/>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function Home() {
  const { theme } = useContext(ThemeContext);
  const isDark    = theme === "dark";
  const pal       = isDark ? DARK_PAL : LIGHT_PAL;

  const [heroVis,      setHeroVis]      = useState(false);
  const [scrolled,     setScrolled]     = useState(false);
  const [stripRef,     stripVis]        = useReveal(.18);
  const [headRef,      headVis]         = useReveal(.12);
  const [requestOpen,  setRequestOpen]  = useState(false);
  const [disclaimer,   setDisclaimer]   = useState(false);

  useEffect(()=>{const t=setTimeout(()=>setHeroVis(true),120);return()=>clearTimeout(t);},[]);
  useEffect(()=>{
    const fn=()=>setScrolled(window.scrollY>55);
    window.addEventListener("scroll",fn,{passive:true});
    return()=>window.removeEventListener("scroll",fn);
  },[]);

  // Show disclaimer once, 15 seconds after mount
  useEffect(()=>{
    if (localStorage.getItem("ae_disclaimer_accepted")) return;
    const t = setTimeout(()=>setDisclaimer(true), 15000);
    return ()=>clearTimeout(t);
  },[]);

  const fu=(d=0)=>({
    opacity:heroVis?1:0,
    transform:heroVis?"translateY(0)":"translateY(20px)",
    transition:`opacity .85s ease ${d}ms,transform .85s cubic-bezier(.22,1,.36,1) ${d}ms`,
  });

  return (
    <>
      {/* Popups */}
      {disclaimer && (
        <DisclaimerPopup pal={pal} isDark={isDark} onAccept={()=>{
          localStorage.setItem("ae_disclaimer_accepted","1");
          setDisclaimer(false);
        }}/>
      )}
      {requestOpen && (
        <RequestStockPopup pal={pal} isDark={isDark} onClose={()=>setRequestOpen(false)}/>
      )}
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,300&family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,800&display=swap" rel="stylesheet"/>
      <style>{`
        @keyframes floatTag{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes pulseCTA{0%,100%{box-shadow:0 6px 28px rgba(212,160,23,.32)}50%{box-shadow:0 6px 48px rgba(212,160,23,.65)}}
        @keyframes arrowBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(7px)}}
        @keyframes edgeFadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes edgeProgress{from{width:0%}to{width:100%}}

        /* ── Floating tags — each child offset for staggered float ── */
        .ft{animation:floatTag 5.5s ease-in-out infinite}
        .ft:nth-child(2){animation-delay:.5s}
        .ft:nth-child(3){animation-delay:1s}
        .ft:nth-child(4){animation-delay:1.5s}
        .ft:nth-child(5){animation-delay:2s}

        *{box-sizing:border-box}

        /* ── MOBILE OVERRIDES ── */
        @media(max-width:600px){
          .hero-section{height:auto !important;min-height:0 !important;}
          .hero-content{padding-top:110px !important;padding-bottom:120px !important;}
          .hero-h1{font-size:clamp(36px,11vw,52px) !important;letter-spacing:-.8px !important;line-height:1.0 !important;}
          .hero-brand-alpha{margin-bottom:2px !important;}
          .hero-brand-investments{margin-bottom:35px !important;}
          .hero-tagline{font-size:13px !important;line-height:1.6 !important;margin-bottom:86px !important;}
          .hero-tags-row{gap:8px !important;margin-bottom: 45px !important;}
          .hero-tag{padding:6px 12px !important;font-size:10px !important;}
          .hero-cta-wrapper{margin-bottom:0 !important;}
          .hero-cta-btn{padding:12px 32px !important;font-size:11px !important;}
          .hero-eyebrow{font-size:11px !important;letter-spacing:0.22em !important;margin-bottom:25px !important;}
          .active-grid{grid-template-columns:1fr !important;}
          .inactive-grid{grid-template-columns:1fr 1fr !important;}
          .sec-h2{font-size:22px !important;}
          .stat-item{width:42% !important;text-align:center !important;}
          .stat-label{font-size:9px !important;letter-spacing:0.10em !important;}
        }
        @media(min-width:601px) and (max-width:900px){
          .active-grid{grid-template-columns:1fr !important;}
          .inactive-grid{grid-template-columns:1fr 1fr !important;}
        }
      `}</style>

      {/*
        ── OUTER WRAPPER ──
        Hero section is always dark (the canvas lives there).
        Everything BELOW the hero responds to the theme toggle.
      */}
      <div style={{
        background:pal.bg,
        minHeight:"100vh",
        color:pal.text,
        fontFamily:"'DM Sans',sans-serif",
        paddingTop:70,
        overflowX:"hidden",
      }}>

        {/* ══════════ HERO ══════════
            Always renders with a dark canvas — theme toggle doesn't
            affect the hero background since the canvas paints it.
        */}
        <section className="hero-section" style={{
          position:"relative",
          height:"calc(90vh - 00px)",
          minHeight:120,
          display:"flex",
          alignItems:"center",
          justifyContent:"center",
          textAlign:"center",
          overflow:"hidden",
          // Hero is always dark regardless of theme (canvas paints this area)
          background:NAVY,
        }}>
          <CosmicCanvas/>

          {/* Soft vignette keeps text readable without killing stars */}
          <div style={{
            position:"absolute",inset:0,pointerEvents:"none",
            background:"radial-gradient(ellipse 92% 70% at 50% 60%, transparent 22%, rgba(10,18,32,.72) 100%)",
          }}/>

          {/* ── Hero text — always light since bg is dark ── */}
          <div className="hero-content" style={{
            position:"relative", zIndex:2,
            maxWidth:800, padding:"0 22px", width:"100%",
            display:"flex", flexDirection:"column", alignItems:"center",
            paddingTop:"clamp(10px, 6vh, 60px)",
            paddingBottom:0,
          }}>

            {/* L1 — Eyebrow */}
            <div className="hero-eyebrow" style={{
              fontSize:14, letterSpacing:"0.32em", color:GOLD,
              fontWeight:600, marginBottom:0,
              fontFamily:"'DM Sans',sans-serif",
              opacity:.95, ...fu(150),
            }}>
              THE BEST TIME TO INVEST IS NOW!
            </div>

            {/* L2 — Brand name */}
            <h1 className="hero-h1 hero-brand-alpha" style={{
              fontSize:"clamp(52px,7.5vw,88px)",
              fontWeight:900, lineHeight:.93, margin:"0 0 4px",
              color:"#fff", fontFamily:"'Playfair Display',serif",
              letterSpacing:"-1.5px", ...fu(300),
            }}>
              Vantage Capital
            </h1>
            <h2 className="hero-h1 hero-brand-investments" style={{
              fontSize:"clamp(52px,7.5vw,88px)",
              fontWeight:900, lineHeight:.93,
              margin:"0 0 clamp(28px,23vh,198px)",
              fontFamily:"'Playfair Display',serif", letterSpacing:"-1.5px",
              background:"linear-gradient(135deg,#f8dc72 0%,#D4A017 42%,#c08a0a 100%)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
              ...fu(400),
            }}>
              Investments
            </h2>

            {/* L3 — Tagline */}
            <p className="hero-sub hero-tagline" style={{
              fontSize:"clamp(14px,1.65vw,18px)", color:"#8aacbf",
              margin:"0 0 clamp(44px, 24vh,40px)", lineHeight:1.68, fontWeight:400,
              ...fu(560),
            }}>
              Institutional-grade equity research on India's finest compounders.<br/>
              Hand-picked businesses built to last decades.
            </p>

            {/* L4 — Floating concept tags
                ── KEY FIX: inline in flow (NOT position:absolute) so they
                   never get displaced regardless of viewport height ──
            */}
            <div className="hero-tags-row" style={{
              display:"flex", justifyContent:"center", flexWrap:"wrap",
              gap:"clamp(8px,2vw,28px)",
              marginBottom:"clamp(20px,24vh,56px)",
              ...fu(680),
            }}>
              {["MOAT","QUALITY","GROWTH","VALUATION","COMPOUNDING"].map(tag => (
                <div key={tag} className="ft hero-tag" style={{
                  padding:"7px 16px",
                  background:"transparent",
                  border:"1px solid rgba(212,160,23,.40)",
                  borderRadius:999,
                  fontSize:12, letterSpacing:"0.26em", color:GOLD,
                  fontWeight:700, fontFamily:"'DM Sans',sans-serif",
                  whiteSpace:"nowrap",
                }}>
                  {tag}
                </div>
              ))}
            </div>

            {/* L5 — CTA */}
            <div className="hero-cta-wrapper" style={fu(780)}>
              <button
                className="hero-cta-btn"
                onClick={()=>document.getElementById("universe").scrollIntoView({behavior:"smooth"})}
                style={{
                  background:GOLD, color:NAVY,
                  padding:"14px 52px", borderRadius:999,
                  fontWeight:800, fontSize:12, letterSpacing:"0.18em",
                  border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
                  animation:"pulseCTA 3.5s ease-in-out 2.5s infinite",
                }}
              >
                EXPLORE DASHBOARDS
              </button>
            </div>
          </div>

          {/* Scroll arrow */}
          <div style={{
            position:"absolute", bottom:20, left:"50%", transform:"translateX(-50%)",
            display:"flex", flexDirection:"column", alignItems:"center", gap:3,
            opacity:scrolled?0:heroVis?.6:0, transition:"opacity .5s", pointerEvents:"none",
            animation:heroVis?"arrowBounce 2.4s ease-in-out 2.5s infinite":"none",
          }}>
            <div style={{width:1,height:26,background:"linear-gradient(to bottom,rgba(212,160,23,.75),transparent)"}}/>
            <svg width="13" height="7" viewBox="0 0 13 7" fill="none">
              <path d="M1 1L6.5 6L12 1" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </section>

        {/* ══════════ STATS STRIP ══════════ */}
        <div ref={stripRef} style={{
          borderTop:`1px solid rgba(212,160,23,.11)`,
          borderBottom:`1px solid rgba(212,160,23,.11)`,
          background:pal.stripBg,
          padding:"22px 36px",
          display:"flex", justifyContent:"center",
          gap:"clamp(20px,5vw,80px)", flexWrap:"wrap",
          opacity:stripVis?1:0, transform:stripVis?"none":"translateY(14px)",
          transition:"opacity .7s,transform .7s",
        }}>
          {[["∞","Growing Universe"],["FY30","Projection Horizon"],["₹0","Paid Subscription"],["100%","Independent Research"]].map(([v,l]) => (
            <div key={l} className="stat-item" style={{textAlign:"center"}}>
              <div style={{
                fontSize:"clamp(20px,2.8vw,28px)",
                fontWeight:800, color:GOLD,
                fontFamily:"'Playfair Display',serif",
              }}>
                {v}
              </div>
              <div className="stat-label" style={{
                fontSize:10, color:pal.statLabel,
                letterSpacing:"0.14em", marginTop:3,
                fontFamily:"'DM Sans',sans-serif",
              }}>
                {l}
              </div>
            </div>
          ))}
        </div>

        {/* ══════════ RESEARCH PHILOSOPHY CAROUSEL ══════════ */}
        <EdgeCarousel pal={pal}/>

        {/* ══════════ DASHBOARDS ══════════ */}
        <section style={{
          padding:"56px 18px 0",
          maxWidth:1360, margin:"0 auto",
        }}>
          <div style={{
            textAlign:"center", marginBottom:36,
          }}>
            <div style={{
              fontSize:9, letterSpacing:"0.38em", color:GOLD,
              fontWeight:700, marginBottom:10,
              fontFamily:"'DM Sans',sans-serif",
            }}>
              LIVE DASHBOARDS
            </div>
            <h2 style={{
              fontSize:"clamp(22px,3.5vw,36px)",
              fontWeight:800, color:pal.text,
              fontFamily:"'Playfair Display',serif",
              margin:0, lineHeight:1.2,
            }}>
              Explore Our Tools
            </h2>
            <div style={{width:44,height:2,background:GOLD,margin:"14px auto 0",borderRadius:2}}/>
          </div>

          <div style={{
            display:"grid",
            gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,280px),1fr))",
            gap:16,
          }}>
            {[
              {
                icon:"📡",
                label:"MACRO DASHBOARD",
                title:"India Macro Board",
                desc:"GDP, inflation, rates, FII flows, INR. The macro context every equity investor needs — updated live.",
                path:"/macro",
                color:"#2E75B6",
                badge:null,
              },
              {
                icon:"⚡",
                label:"MOMENTUM DASHBOARD",
                title:"Momentum Screener",
                desc:"Price momentum, RSI, 52-week ranks, sector rotation — quantitative signals refreshed daily.",
                path:"/momentum",
                color:"#27AE60",
                badge:"NEW",
              },
              {
                icon:"🔬",
                label:"RESEARCH UNIVERSE",
                title:"Stock Dashboards",
                desc:"Deep-dive fundamental reports. DCF, Porter's 5 Forces, quality scores and FY30 price targets.",
                path:"/research-universe",
                color:GOLD,
                badge:null,
              },
            ].map(card => (
              <DashboardCard key={card.title} card={card} pal={pal} isDark={isDark} />
            ))}
          </div>
        </section>

        {/* ══════════ RESEARCH UNIVERSE ══════════ */}
        <section id="universe" style={{
          padding:"72px 18px 90px",
          maxWidth:1360,
          margin:"0 auto",
        }}>
          <div ref={headRef} style={{
            textAlign:"center", marginBottom:44,
            opacity:headVis?1:0, transform:headVis?"none":"translateY(18px)",
            transition:"opacity .7s,transform .7s",
          }}>
            <div style={{
              fontSize:9, letterSpacing:"0.38em", color:GOLD,
              fontWeight:700, marginBottom:10,
              fontFamily:"'DM Sans',sans-serif",
            }}>
              CURATED EQUITY RESEARCH
            </div>
            <h2 className="sec-h2" style={{
              fontSize:"clamp(22px,3.5vw,36px)",
              fontWeight:800, color:pal.text,
              fontFamily:"'Playfair Display',serif",
              margin:0, lineHeight:1.2,
            }}>
              Featured Research
            </h2>
            <p style={{fontSize:13,color:pal.muted,marginTop:10,marginBottom:0,fontFamily:"'DM Sans',sans-serif",lineHeight:1.65}}>
              3 live dashboards · more always in the pipeline
            </p>
            <div style={{width:44,height:2,background:GOLD,margin:"14px auto 0",borderRadius:2}}/>
          </div>

          {/* Active dashboards */}
          <div className="active-grid" style={{
            display:"grid",
            gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,340px),1fr))",
            gap:16, marginBottom:20,
          }}>
            {stocks.filter(s=>s.active).map((s,i) => (
              <StockTile key={s.name} stock={s} delay={i*100} pal={pal}/>
            ))}
          </div>

          {/* Coming soon — strict 2-col grid (6 tiles) */}
          <div className="inactive-grid" style={{
            display:"grid",
            gridTemplateColumns:"repeat(3,1fr)",
            gap:11, marginBottom:11,
          }}>
            {stocks.filter(s=>!s.active).map((s,i) => (
              <StockTile key={s.name} stock={s} delay={80+i*45} pal={pal}/>
            ))}
          </div>

          {/* Request a Stock */}
          <div style={{marginTop:14}}>
            <RequestStockTile pal={pal} onOpen={()=>setRequestOpen(true)}/>
          </div>

          {/* CTA to full universe */}
          <div style={{textAlign:"center", marginTop:36}}>
            <p style={{fontSize:13,color:pal.muted,marginBottom:16,fontFamily:"'DM Sans',sans-serif"}}>
              Our universe is always growing — view all live reports and the full pipeline.
            </p>
            <Link to="/research-universe" style={{
              display:"inline-block",
              background:"transparent",
              border:`1px solid ${GOLD}`,
              color:GOLD,
              padding:"12px 38px", borderRadius:999,
              fontWeight:800, fontSize:11, letterSpacing:"0.18em",
              textDecoration:"none", fontFamily:"'DM Sans',sans-serif",
              transition:"all .2s",
            }}>
              EXPLORE FULL RESEARCH UNIVERSE →
            </Link>
          </div>
        </section>

      </div>
    </>
  );
}