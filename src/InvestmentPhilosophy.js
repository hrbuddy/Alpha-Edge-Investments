import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "./App";

const GOLD  = "#D4A017";
const NAVY  = "#0D1B2A";
const TEAL  = "#0E7C7B";
const GREEN = "#27AE60";

export default function InvestmentPhilosophy() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

  const pal = isDark ? {
    bg: NAVY, text:"#e2e8f0", sub:"#5a7a94", muted:"#3d5570",
    card:"rgba(255,255,255,0.025)", border:"rgba(212,160,23,0.12)",
    headerBg:"rgba(255,255,255,0.015)",
  } : {
    bg:"#F2EDE0", text:"#0D1B2A", sub:"#3a5068", muted:"#7a8a9a",
    card:"rgba(13,27,42,0.04)", border:"rgba(212,160,23,0.2)",
    headerBg:"rgba(13,27,42,0.04)",
  };

  const fu = (d=0) => ({
    opacity:   visible?1:0,
    transform: visible?"translateY(0)":"translateY(22px)",
    transition:`opacity .75s ease ${d}ms, transform .75s cubic-bezier(.22,1,.36,1) ${d}ms`,
  });

  const PILLARS = [
    {
      icon:"🏰",
      title:"Quality Over Everything",
      colour: GREEN,
      body:`We are buyers of businesses, not stocks. The distinction matters. A stock is a ticker that moves daily. A business is a living organism with customers, employees, competitive advantages, and a culture.

We only invest in businesses that possess an enduring competitive moat — a structural advantage that allows them to earn returns on capital well above their cost of capital for many years. Moats come in various forms: pricing power (Nestle India raising chocolate prices without losing customers), network effects (the compounding value of Naukri's resume database), switching costs (the enterprise software no CFO wants to rip out), or low-cost production (a manufacturer whose cost structure no competitor can match).

A business without a moat is a commodity business. Commodity businesses earn average returns at best, and are destroyed by competition at worst. We do not own commodity businesses.`,
    },
    {
      icon:"⏳",
      title:"Time Is Your Greatest Edge",
      colour: GOLD,
      body:`The single most underappreciated force in investing is the compounding of a high-quality business over time. A business that earns a 20% return on equity, retains most of its earnings, and reinvests them at similar rates will double its intrinsic value roughly every 3.5 years.

Most investors never capture this compounding because they cannot sit still. They sell when the share price corrects 20%. They sell when a quarter disappoints. They sell when a macro headline frightens them. In doing so, they interrupt the very process that creates wealth.

Our investment horizon is explicitly 5 years and beyond. We set FY30 price targets not because we can predict the future with precision — we cannot — but because the discipline of thinking in 5-year increments forces us to focus on what will genuinely matter: earnings power, return on capital, and the health of the competitive moat.

Short-term price fluctuations are noise. Long-term business value creation is signal.`,
    },
    {
      icon:"📐",
      title:"Valuation Is a Margin of Safety",
      colour: TEAL,
      body:`Paying the wrong price for even the greatest business can produce poor returns. We have seen this play out with quality businesses trading at 80–100x earnings: the business grows exactly as expected, yet the investor earns nothing because the market had already priced in perfection.

We are not value investors in the Ben Graham sense — we do not seek businesses trading at a discount to liquidation value. We are quality investors who insist on a valuation that provides a reasonable margin of safety.

We use multiple frameworks in combination: discounted cash flow analysis with conservative assumptions, reverse DCF to understand what the market is already pricing in, and peer-relative comparisons adjusted for quality differentials.

Our discipline is to act only when the intrinsic value is meaningfully higher than the market price — not marginally higher, but materially higher — such that even if our assumptions prove somewhat optimistic, we still earn a satisfactory return.`,
    },
    {
      icon:"🔬",
      title:"Deep Research, Not Shallow Breadth",
      colour:"#9b8afb",
      body:`We do not attempt to cover the market. We attempt to deeply understand a small number of businesses.

Our universe is deliberately constrained to 10–15 businesses at any time. For each one, we read every annual report for the past 7–10 years, every investor presentation, every earnings call transcript. We track management commentary across years to observe how they behave — not just what they say.

We build detailed financial models, but we do not worship at the altar of the spreadsheet. A model is only as good as the assumptions that underlie it. The most important assumptions — the durability of the moat, the integrity of management, the long-term industry structure — cannot be modelled with precision. They require judgement, experience, and intellectual honesty.

We write our bull case. We write our bear case. We are explicit about what we are uncertain about, and we calibrate our position sizing and conviction accordingly.`,
    },
    {
      icon:"🧭",
      title:"Management: Character Before Capability",
      colour:"#60a5fa",
      body:`A mediocre business run by an outstanding management team will often outperform an outstanding business run by mediocre managers. Management quality is not optional — it is central to our thesis for every business we cover.

We assess management on two dimensions: capability (have they demonstrated the ability to allocate capital well, to navigate competitive threats, to grow revenue profitably?) and character (are they honest with shareholders, do they communicate transparently in good times and bad, do they own meaningful stakes in the business, do they avoid related-party transactions?).

We are particularly focused on capital allocation. How does management deploy the free cash flow the business generates? Do they invest in the business at high returns? Do they make acquisitions wisely, or do they overpay for growth? Do they return capital to shareholders when internal reinvestment opportunities are limited?

A great operator running a great business at a sensible price is our ideal investment.`,
    },
    {
      icon:"🧘",
      title:"Temperament Beats Intelligence",
      colour:"#f472b6",
      body:`The uncomfortable truth about investing is that having a high IQ, building sophisticated models, and reading voraciously are not sufficient. Many brilliant analysts earn mediocre returns because they cannot control their emotional responses to market volatility.

We believe that temperament — the ability to remain calm when markets are panicking, to think clearly when sentiment is euphoric, to hold a position through a 30% drawdown when the business fundamentals remain intact — is the most important determinant of long-term investment returns.

This is why we write our investment theses explicitly and in detail before we invest. The thesis serves as an anchor. When the share price falls and the world is screaming "sell!", we return to the thesis and ask a simple question: have the facts that underpinned our thesis changed? If not, we hold or add. If yes, we reassess.

The market is a voting machine in the short run and a weighing machine in the long run. We invest for the long run.`,
    },
  ];

  const CHECKLIST = [
    "Does this business have a clearly identifiable, durable moat?",
    "Has management demonstrated consistent, honest capital allocation?",
    "Can the business reinvest earnings at high returns for the next 5–10 years?",
    "Is the valuation reasonable relative to our 5-year intrinsic value estimate?",
    "What is the bear case, and can we live with it?",
    "What would make us change our mind? (Exit criteria)",
  ];

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;600;700;800&family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,800&display=swap" rel="stylesheet"/>
      <style>{`
        .pillar-card{ transition:all .3s ease; }
        .pillar-card:hover{ transform:translateY(-3px); }
        .quote-block{ border-left:3px solid rgba(212,160,23,0.4); }
      `}</style>

      <div style={{ background:pal.bg, minHeight:"100vh", paddingTop:92, fontFamily:"'DM Sans',sans-serif", color:pal.text }} className="ae-page-root">

        {/* HERO */}
        <section style={{ background:pal.headerBg, borderBottom:`1px solid ${pal.border}`, padding:"56px 24px 52px", textAlign:"center" }}>
          <div style={{ maxWidth:740, margin:"0 auto" }}>
            <div style={{ fontSize:9, letterSpacing:"0.38em", color:GOLD, fontWeight:700, marginBottom:14, ...fu(0) }}>OUR INVESTMENT PHILOSOPHY</div>
            <h1 style={{ fontSize:"clamp(28px,4.5vw,48px)", fontWeight:900, fontFamily:"'Playfair Display',serif", margin:"0 0 20px", lineHeight:1.1, ...fu(80) }}>
              Buy Great Businesses.<br/>
              <em style={{ fontStyle:"italic", background:"linear-gradient(135deg,#f8dc72,#D4A017)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
                Own Them for Years.
              </em>
            </h1>
            <p style={{ fontSize:"clamp(14px,1.6vw,17px)", color:pal.sub, lineHeight:1.8, margin:0, fontWeight:300, ...fu(160) }}>
              We are long-term, quality-focused, fundamental investors. Our philosophy is not novel — it is the philosophy of Warren Buffett, Charlie Munger, and a small number of patient capital allocators who have compounded wealth across decades. What is rare is the conviction to actually practise it.
            </p>
          </div>
        </section>

        <div style={{ maxWidth:860, margin:"0 auto", padding:"56px 24px 80px" }}>

          {/* Opening quote */}
          <div className="quote-block" style={{ padding:"20px 28px", marginBottom:52, background:"rgba(212,160,23,0.03)", borderRadius:"0 10px 10px 0", ...fu(0) }}>
            <p style={{ fontSize:"clamp(15px,1.8vw,18px)", color:pal.sub, fontStyle:"italic", lineHeight:1.9, margin:"0 0 10px", fontFamily:"'Playfair Display',serif" }}>
              "It's far better to buy a wonderful company at a fair price than a fair company at a wonderful price."
            </p>
            <div style={{ fontSize:11, color:"rgba(212,160,23,0.6)", fontWeight:700, letterSpacing:"1px" }}>— Warren Buffett</div>
          </div>

          {/* The six pillars */}
          <div style={{ marginBottom:60, ...fu(80) }}>
            <div style={{ fontSize:9, letterSpacing:"0.38em", color:GOLD, fontWeight:700, marginBottom:10 }}>SIX PILLARS OF OUR PHILOSOPHY</div>
            <div style={{ width:44, height:2, background:GOLD, borderRadius:2, marginBottom:36 }}/>

            <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
              {PILLARS.map((p, i) => (
                <div key={p.title} className="pillar-card" style={{ background:pal.card, border:`1px solid ${pal.border}`, borderRadius:16, overflow:"hidden", ...fu(80 + i*60) }}>
                  {/* Coloured top strip */}
                  <div style={{ height:3, background:`linear-gradient(90deg, ${p.colour}, transparent)` }}/>
                  <div style={{ padding:"24px 24px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:18 }}>
                      <span style={{ fontSize:28 }}>{p.icon}</span>
                      <h2 style={{ fontSize:"clamp(16px,2vw,19px)", fontWeight:800, color:pal.text, margin:0, fontFamily:"'Playfair Display',serif" }}>{p.title}</h2>
                    </div>
                    {p.body.split("\n\n").map((para, pi, arr) => (
                      <p key={pi} style={{ fontSize:13, color:pal.sub, lineHeight:1.85, margin: pi < arr.length-1 ? "0 0 14px" : 0 }}>{para}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Investment checklist */}
          <section style={{ marginBottom:56, ...fu(200) }}>
            <div style={{ fontSize:9, letterSpacing:"0.38em", color:GOLD, fontWeight:700, marginBottom:10 }}>OUR INVESTMENT CHECKLIST</div>
            <div style={{ width:44, height:2, background:GOLD, borderRadius:2, marginBottom:28 }}/>
            <p style={{ fontSize:13, color:pal.sub, lineHeight:1.8, marginBottom:22 }}>
              Before committing to any analysis, every business we consider must answer these questions satisfactorily:
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {CHECKLIST.map((item, i) => (
                <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:14, padding:"14px 18px", background:pal.card, border:`1px solid ${pal.border}`, borderRadius:10 }}>
                  <div style={{ width:22, height:22, borderRadius:6, border:`1.5px solid rgba(212,160,23,0.35)`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>
                    <span style={{ fontSize:9, fontWeight:900, color:"rgba(212,160,23,0.5)" }}>{String(i+1).padStart(2,"0")}</span>
                  </div>
                  <span style={{ fontSize:13, color:pal.sub, lineHeight:1.65 }}>{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* What we avoid */}
          <section style={{ marginBottom:56, ...fu(260) }}>
            <div style={{ fontSize:9, letterSpacing:"0.38em", color:GOLD, fontWeight:700, marginBottom:10 }}>WHAT WE DELIBERATELY AVOID</div>
            <div style={{ width:44, height:2, background:GOLD, borderRadius:2, marginBottom:28 }}/>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:12 }}>
              {[
                ["Momentum plays", "Businesses we buy purely because the share price is going up."],
                ["Commodities", "Businesses with no pricing power, competing entirely on cost."],
                ["Turnarounds", "Companies with broken business models that need 'fixing'."],
                ["Excessive leverage", "Businesses carrying debt that amplifies operational volatility."],
                ["Promoter risk",  "Companies where the promoter has a history of governance lapses."],
                ["Narrative-driven ideas", "Businesses where the thesis is driven by story, not numbers."],
              ].map(([title, body])=>(
                <div key={title} style={{ padding:"16px 16px", background:"rgba(224,112,112,0.04)", border:"1px solid rgba(224,112,112,0.12)", borderRadius:10 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:"#e07070", marginBottom:6 }}>✗ {title}</div>
                  <p style={{ fontSize:12, color:pal.muted, lineHeight:1.65, margin:0 }}>{body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div style={{ textAlign:"center", ...fu(300) }}>
            <p style={{ fontSize:14, color:pal.sub, marginBottom:24, lineHeight:1.7 }}>
              Interested in how we put this philosophy into practice? Explore our research.
            </p>
            <Link to="/signup" style={{ display:"inline-block", background:GOLD, color:NAVY, padding:"13px 40px", borderRadius:999, fontWeight:800, fontSize:11, letterSpacing:"0.16em", textDecoration:"none", fontFamily:"'DM Sans',sans-serif", marginRight:12 }}>
              GET FREE ACCESS →
            </Link>
            <Link to="/" style={{ display:"inline-block", border:"1px solid rgba(212,160,23,0.3)", color:"rgba(212,160,23,0.7)", padding:"13px 32px", borderRadius:999, fontWeight:700, fontSize:11, letterSpacing:"0.16em", textDecoration:"none", fontFamily:"'DM Sans',sans-serif" }}>
              VIEW RESEARCH
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}