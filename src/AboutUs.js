import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "./App";

const GOLD  = "#D4A017";
const NAVY  = "#0D1B2A";

export default function AboutUs() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

  const fu = (d = 0) => ({
    opacity:    visible ? 1 : 0,
    transform:  visible ? "translateY(0)" : "translateY(22px)",
    transition: `opacity .75s ease ${d}ms, transform .75s cubic-bezier(.22,1,.36,1) ${d}ms`,
  });

  const pal = isDark ? {
    bg: NAVY, text: "#e2e8f0", sub: "#5a7a94", muted:"#3d5570",
    card: "rgba(255,255,255,0.025)", border: "rgba(212,160,23,0.13)",
  } : {
    bg: "#F5F0E8", text: "#0D1B2A", sub: "#3a5068", muted:"#7a8a9a",
    card: "rgba(13,27,42,0.04)", border: "rgba(212,160,23,0.22)",
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;600;700;800&family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,800&display=swap" rel="stylesheet"/>
      <style>{`
        .about-divider{ width:44px;height:2px;background:${GOLD};border-radius:2px;margin:16px 0 24px; }
        .principle-card:hover{ background:rgba(212,160,23,0.06) !important; border-color:rgba(212,160,23,0.35) !important; transform:translateY(-2px); }
        .principle-card{ transition:all .25s ease; }
      `}</style>

      <div style={{ background: pal.bg, minHeight:"100vh", paddingTop:92, fontFamily:"'DM Sans',sans-serif", color:pal.text }}>

        {/* ── HERO BANNER ── */}
        <section style={{ background: isDark ? "rgba(255,255,255,0.015)" : "rgba(13,27,42,0.04)", borderBottom:`1px solid ${pal.border}`, padding:"56px 24px 52px", textAlign:"center" }}>
          <div style={{ maxWidth:720, margin:"0 auto" }}>
            <div style={{ fontSize:9, letterSpacing:"0.38em", color:GOLD, fontWeight:700, marginBottom:14, ...fu(0) }}>ABOUT ALPHA EDGE</div>
            <h1 style={{ fontSize:"clamp(28px,4.5vw,46px)", fontWeight:900, fontFamily:"'Playfair Display',serif", margin:"0 0 18px", lineHeight:1.15, color:pal.text, ...fu(80) }}>
              Independent Research for the<br/>
              <span style={{ background:"linear-gradient(135deg,#f8dc72,#D4A017)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
                Patient Investor
              </span>
            </h1>
            <p style={{ fontSize:"clamp(14px,1.6vw,17px)", color:pal.sub, lineHeight:1.8, margin:0, fontWeight:300, ...fu(160) }}>
              We are not a brokerage. We are not SEBI-registered advisors. We are a small, passionate team of fundamental investors who believe that great businesses, bought at sensible prices and held for years, can generate life-changing wealth.
            </p>
          </div>
        </section>

        <div style={{ maxWidth:820, margin:"0 auto", padding:"56px 24px 80px" }}>

          {/* ── OUR STORY ── */}
          <section style={{ marginBottom:60, ...fu(0) }}>
            <div style={{ fontSize:9, letterSpacing:"0.38em", color:GOLD, fontWeight:700, marginBottom:8 }}>OUR STORY</div>
            <div className="about-divider"/>
            <p style={{ fontSize:"clamp(14px,1.6vw,16px)", color:pal.sub, lineHeight:1.9, marginBottom:18 }}>
              Alpha Edge Investments was born from a simple frustration: institutional-quality equity research in India has historically been locked behind expensive subscriptions, accessible only to fund managers and HNIs. Meanwhile, the retail investor — the person with genuine long-term conviction — was left with noise, tips, and broker-sponsored "buy" calls.
            </p>
            <p style={{ fontSize:"clamp(14px,1.6vw,16px)", color:pal.sub, lineHeight:1.9, marginBottom:18 }}>
              We set out to change that. Every report we publish is written the way we would want to read it — detailed, honest, and anchored to fundamentals. We do not receive fees from companies we cover. We do not run a SEBI-registered advisory. We write because we love the craft of analysis, and we publish because we believe in democratising access to good investment thinking.
            </p>
            <p style={{ fontSize:"clamp(14px,1.6vw,16px)", color:pal.sub, lineHeight:1.9 }}>
              Our coverage is deliberately narrow. We would rather know 10 businesses deeply than skim 100 superficially. Each of our reports is the product of weeks of reading annual reports, listening to management calls, stress-testing assumptions, and triangulating with primary research.
            </p>
          </section>

          {/* ── WHAT WE ARE & WHAT WE ARE NOT ── */}
          <section style={{ marginBottom:60, ...fu(100) }}>
            <div style={{ fontSize:9, letterSpacing:"0.38em", color:GOLD, fontWeight:700, marginBottom:8 }}>WHAT WE ARE — AND WHAT WE ARE NOT</div>
            <div className="about-divider"/>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:16 }}>
              {[
                {
                  label:"We ARE",
                  color: "#27AE60",
                  items:[
                    "Independent, self-funded researchers",
                    "Long-term fundamental investors (5–10 year horizon)",
                    "Focused on quality businesses with durable moats",
                    "Transparent about our assumptions and uncertainty",
                    "Free — always, for everyone",
                  ]
                },
                {
                  label:"We are NOT",
                  color: "#e07070",
                  items:[
                    "SEBI-registered investment advisors",
                    "A brokerage or distributor",
                    "Recommending you to buy or sell any security",
                    "Responsible for your investment decisions",
                    "Paid by any company we cover",
                  ]
                }
              ].map(col=>(
                <div key={col.label} style={{ background:pal.card, border:`1px solid ${pal.border}`, borderRadius:14, padding:"22px 20px" }}>
                  <div style={{ fontSize:11, fontWeight:800, color:col.color, letterSpacing:"1px", marginBottom:16, fontFamily:"'DM Sans',sans-serif" }}>{col.label}</div>
                  {col.items.map(item=>(
                    <div key={item} style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:10 }}>
                      <div style={{ width:5, height:5, borderRadius:"50%", background:col.color, marginTop:7, flexShrink:0 }}/>
                      <span style={{ fontSize:13, color:pal.sub, lineHeight:1.6 }}>{item}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>

          {/* ── OUR PROCESS ── */}
          <section style={{ marginBottom:60, ...fu(200) }}>
            <div style={{ fontSize:9, letterSpacing:"0.38em", color:GOLD, fontWeight:700, marginBottom:8 }}>HOW WE RESEARCH</div>
            <div className="about-divider"/>
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {[
                ["01", "Universe Screening", "We begin with a universe of ~50 quality businesses — companies with 10+ year track records of consistent ROE, low debt, and durable competitive advantages. We run both qualitative filters (management quality, moat type, industry structure) and quantitative screens."],
                ["02", "Deep-Dive Analysis", "For each company we cover, we read every annual report going back at least 7 years, review every investor presentation, and listen to every earnings call. We build granular financial models and stress-test them across multiple scenarios."],
                ["03", "Moat Assessment", "We identify the specific source of competitive advantage — pricing power, network effects, cost advantages, switching costs, or intangible assets — and assess its durability. We ask: will this moat still be intact in 10 years?"],
                ["04", "Valuation & Target Setting", "We use a combination of intrinsic value frameworks (DCF, EV/EBIT, reverse DCF) to determine a fair value range and set a 5-year price target. We are explicit about our assumptions and what would need to be true for our thesis to work."],
                ["05", "Publishing & Transparency", "We publish our full reasoning — including the bear case and the risks. We update our views as facts change. We are not perma-bulls. If a thesis breaks, we will say so."],
              ].map(([num, title, body])=>(
                <div key={num} className="principle-card" style={{ display:"flex", gap:20, padding:"20px", background:pal.card, border:`1px solid ${pal.border}`, borderRadius:13 }}>
                  <div style={{ fontSize:22, fontWeight:900, color:"rgba(212,160,23,0.2)", fontFamily:"'Playfair Display',serif", flexShrink:0, lineHeight:1, paddingTop:2 }}>{num}</div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:pal.text, marginBottom:6 }}>{title}</div>
                    <p style={{ fontSize:13, color:pal.sub, lineHeight:1.75, margin:0 }}>{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── DISCLAIMER BANNER ── */}
          <section style={{ ...fu(300) }}>
            <div style={{ background:"rgba(212,160,23,0.04)", border:"1px solid rgba(212,160,23,0.14)", borderRadius:14, padding:"22px 24px" }}>
              <div style={{ fontSize:10, fontWeight:700, color:GOLD, letterSpacing:"1.5px", marginBottom:10 }}>IMPORTANT DISCLAIMER</div>
              <p style={{ fontSize:12, color:pal.muted, lineHeight:1.8, margin:"0 0 10px" }}>
                Alpha Edge Investments is not registered with the Securities and Exchange Board of India (SEBI) as an investment advisor. Nothing on this website constitutes investment advice, a solicitation to buy or sell securities, or a recommendation of any kind. All content is for educational and informational purposes only.
              </p>
              <p style={{ fontSize:12, color:pal.muted, lineHeight:1.8, margin:0 }}>
                Past analysis does not guarantee future performance. Equity investments carry risk. Please consult a SEBI-registered investment advisor before making any investment decision. By using this website, you acknowledge that you have read, understood, and agree to our{" "}
                <Link to="/terms" style={{ color:"rgba(212,160,23,0.7)", textDecoration:"none" }}>Terms & Conditions</Link>.
              </p>
            </div>
          </section>

          {/* ── CTA ── */}
          <div style={{ textAlign:"center", marginTop:52, ...fu(400) }}>
            <Link to="/" style={{
              display:"inline-block", background:GOLD, color:NAVY,
              padding:"13px 40px", borderRadius:999, fontWeight:800,
              fontSize:11, letterSpacing:"0.16em", textDecoration:"none",
              fontFamily:"'DM Sans',sans-serif",
            }}>
              EXPLORE OUR RESEARCH →
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}