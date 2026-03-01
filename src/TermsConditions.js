import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "./App";

const GOLD = "#D4A017";
const NAVY = "#0D1B2A";

const SECTIONS = [
  {
    id:"1",
    title:"Nature of Content & No Investment Advice",
    body:`Vantage Capital Investments ("Vantage Capital", "we", "us", "our") publishes equity research reports, analysis, dashboards, and commentary exclusively for educational and informational purposes.

Nothing on this website — including but not limited to stock reports, price targets, ratings such as "BUY", financial models, or commentary — constitutes investment advice, a recommendation to buy or sell any security, or a solicitation of any kind.

Vantage Capital is not registered with the Securities and Exchange Board of India (SEBI) as an investment advisor, portfolio manager, research analyst, or stockbroker. We operate as an independent research and education platform only.`,
  },
  {
    id:"2",
    title:"User Responsibility",
    body:`By accessing and using this website, you acknowledge and agree that:

• All investment decisions are yours alone. You bear full responsibility for any investment decisions you make based on content you read on this site.

• You will conduct your own independent research and, where appropriate, consult a SEBI-registered investment advisor before making any investment decision.

• You understand that equity investments carry risk including the loss of principal. Past analysis, past coverage, or past price targets published on this site do not imply future performance of any security.

• You will not hold Vantage Capital Investments, its authors, or contributors liable for any losses, damages, or investment outcomes arising from your use of this website.`,
  },
  {
    id:"3",
    title:"Accuracy, Completeness & Updates",
    body:`We make reasonable efforts to ensure the accuracy of information published on this site. However, we make no representations or warranties — express or implied — regarding the accuracy, completeness, or timeliness of any content.

Financial data, estimates, and price targets are based on information available at the time of publication. Markets, business fundamentals, and macroeconomic conditions change. We are not obligated to update any report or commentary once published, though we will endeavour to note material changes when they occur.

You should always verify data from primary sources (company filings, BSE/NSE disclosures, RBI publications) before relying on it for any decision.`,
  },
  {
    id:"4",
    title:"Conflicts of Interest & Independence",
    body:`Vantage Capital Investments maintains strict editorial independence:

• We do not accept fees, payments, advertising revenue, or commissions from any company we cover or plan to cover.

• Our authors and contributors may personally hold positions in securities covered on this site. Where material, such positions may be disclosed at the author's discretion, but you should assume that a conflict of interest may exist for any security we cover.

• We do not receive referral fees, kickbacks, or incentives from brokers, fund managers, or financial product distributors.

• Our content is funded entirely by voluntary reader support and is offered free of charge.`,
  },
  {
    id:"5",
    title:"Intellectual Property",
    body:`All content on this website — including reports, analysis, dashboards, graphics, written commentary, and design elements — is the intellectual property of Vantage Capital Investments and is protected under applicable copyright and intellectual property laws.

You may share links to our content or quote brief excerpts (not exceeding 150 words) with proper attribution to Vantage Capital Investments. You may not reproduce, republish, distribute, or commercially exploit our content without prior written consent.

Our brand name, logo, and marks are proprietary to Vantage Capital Investments and may not be used without written permission.`,
  },
  {
    id:"6",
    title:"Privacy & Data",
    body:`When you sign up for access to Vantage Capital Investments, we collect your name and email address. We use this information only to provide you access to our research and to notify you when new reports are published.

We do not sell, rent, or share your personal information with third parties for commercial purposes. We do not run advertising on this website.

We may use cookies and analytics tools to understand how users navigate the site, solely for the purpose of improving the user experience. By using this site, you consent to this limited use of tracking technologies.

You may request deletion of your account and data at any time by contacting us.`,
  },
  {
    id:"7",
    title:"Limitation of Liability",
    body:`To the fullest extent permitted by applicable law, Vantage Capital Investments and its authors, contributors, and affiliates shall not be liable for any direct, indirect, incidental, consequential, or special damages arising from:

• Your use of, or inability to use, this website or its content;
• Any investment decision made in reliance on content published here;
• Any errors, inaccuracies, or omissions in our content;
• Any interruption, suspension, or discontinuation of this website.

This limitation applies regardless of the theory of liability — whether in contract, tort, negligence, or otherwise — even if Vantage Capital has been advised of the possibility of such damages.`,
  },
  {
    id:"8",
    title:"Governing Law",
    body:`These Terms & Conditions are governed by and shall be construed in accordance with the laws of India. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts of India.`,
  },
  {
    id:"9",
    title:"Modifications",
    body:`We reserve the right to modify these Terms & Conditions at any time. Material changes will be notified via the website. Your continued use of the site after any modification constitutes your acceptance of the revised terms. We recommend reviewing this page periodically.`,
  },
  {
    id:"10",
    title:"Contact",
    body:`If you have questions about these Terms & Conditions, our research process, or any content on this site, please reach out via the contact information available on the website. We are a small, transparent team and we read every message.`,
  },
];

export default function TermsConditions() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(null);
  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

  const pal = isDark ? {
    bg: NAVY, text: "#e2e8f0", sub: "#5a7a94", muted:"#3d5570",
    card:"rgba(255,255,255,0.025)", border:"rgba(212,160,23,0.12)",
    headerBg:"rgba(255,255,255,0.015)",
  } : {
    bg: "#F2EDE0", text: "#0D1B2A", sub: "#3a5068", muted:"#7a8a9a",
    card:"rgba(13,27,42,0.04)", border:"rgba(212,160,23,0.2)",
    headerBg:"rgba(13,27,42,0.04)",
  };

  const fu = (d=0) => ({
    opacity:   visible?1:0,
    transform: visible?"translateY(0)":"translateY(18px)",
    transition:`opacity .7s ease ${d}ms, transform .7s cubic-bezier(.22,1,.36,1) ${d}ms`,
  });

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;600;700;800&family=Playfair+Display:wght@800&display=swap" rel="stylesheet"/>
      <style>{`
        .toc-item{ cursor:pointer; transition:color .2s, padding-left .2s; }
        .toc-item:hover{ color:rgba(212,160,23,0.9) !important; padding-left:6px !important; }
        .section-card{ transition:border-color .2s; }
        .section-card:hover{ border-color:rgba(212,160,23,0.25) !important; }
      `}</style>

      <div style={{ background:pal.bg, minHeight:"100vh", paddingTop:92, fontFamily:"'DM Sans',sans-serif", color:pal.text }}>

        {/* Header */}
        <section style={{ background:pal.headerBg, borderBottom:`1px solid ${pal.border}`, padding:"48px 24px 44px", textAlign:"center" }}>
          <div style={{ maxWidth:680, margin:"0 auto" }}>
            <div style={{ fontSize:9, letterSpacing:"0.38em", color:GOLD, fontWeight:700, marginBottom:12, ...fu(0) }}>LEGAL</div>
            <h1 style={{ fontSize:"clamp(26px,4vw,40px)", fontWeight:900, fontFamily:"'Playfair Display',serif", margin:"0 0 14px", lineHeight:1.2, ...fu(80) }}>
              Terms & Conditions
            </h1>
            <p style={{ fontSize:13, color:pal.muted, margin:0, ...fu(160) }}>
              Last updated: February 2026 · Please read carefully before using this website.
            </p>
          </div>
        </section>

        <div style={{ maxWidth:820, margin:"0 auto", padding:"48px 24px 80px", display:"grid", gridTemplateColumns:"minmax(0,1fr)", gap:32 }}>

          {/* Important notice */}
          <div style={{ background:"rgba(212,160,23,0.05)", border:"1px solid rgba(212,160,23,0.18)", borderRadius:12, padding:"18px 20px", ...fu(0) }}>
            <div style={{ fontSize:10, fontWeight:800, color:GOLD, letterSpacing:"1.4px", marginBottom:8 }}>⚠️ KEY POINT</div>
            <p style={{ fontSize:13, color:pal.sub, lineHeight:1.75, margin:0 }}>
              Vantage Capital Investments is <strong style={{color:pal.text}}>not a SEBI-registered investment advisor</strong>. Nothing on this site is investment advice. All content is for educational and informational purposes only. You are solely responsible for your own investment decisions.
            </p>
          </div>

          {/* TOC */}
          <div style={{ background:pal.card, border:`1px solid ${pal.border}`, borderRadius:14, padding:"22px 24px", ...fu(80) }}>
            <div style={{ fontSize:9, letterSpacing:"0.3em", color:GOLD, fontWeight:700, marginBottom:14 }}>TABLE OF CONTENTS</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:"6px 20px" }}>
              {SECTIONS.map(s=>(
                <a
                  key={s.id} href={`#section-${s.id}`}
                  className="toc-item"
                  style={{ fontSize:12, color:pal.muted, textDecoration:"none", paddingLeft:0, display:"block", paddingBottom:4 }}
                  onClick={()=>setActive(s.id)}
                >
                  <span style={{ color:"rgba(212,160,23,0.4)", marginRight:6 }}>{s.id}.</span>{s.title}
                </a>
              ))}
            </div>
          </div>

          {/* Sections */}
          {SECTIONS.map((s, i) => (
            <div key={s.id} id={`section-${s.id}`} className="section-card" style={{
              background: pal.card,
              border:`1px solid ${active===s.id ? "rgba(212,160,23,0.3)" : pal.border}`,
              borderRadius:14, padding:"24px 24px",
              ...fu(80 + i*30),
            }}>
              <div style={{ display:"flex", alignItems:"baseline", gap:12, marginBottom:14 }}>
                <span style={{ fontSize:14, fontWeight:900, color:"rgba(212,160,23,0.3)", fontFamily:"'Playfair Display',serif", flexShrink:0 }}>{s.id}.</span>
                <h2 style={{ fontSize:"clamp(15px,1.8vw,17px)", fontWeight:800, color:pal.text, margin:0, fontFamily:"'DM Sans',sans-serif" }}>{s.title}</h2>
              </div>
              <div style={{ borderLeft:`2px solid rgba(212,160,23,0.1)`, paddingLeft:20 }}>
                {s.body.split("\n\n").map((para, pi)=>(
                  <p key={pi} style={{ fontSize:13, color:pal.sub, lineHeight:1.85, margin: pi < s.body.split("\n\n").length-1 ? "0 0 14px" : 0 }}>
                    {para.split("\n").map((line, li, arr)=>(
                      <span key={li}>{line}{li < arr.length-1 ? <br/> : null}</span>
                    ))}
                  </p>
                ))}
              </div>
            </div>
          ))}

          {/* Footer CTA */}
          <div style={{ textAlign:"center", ...fu(200) }}>
            <p style={{ fontSize:13, color:pal.muted, marginBottom:20 }}>
              Questions about our terms? Reach out — we're a transparent, independent team.
            </p>
            <Link to="/about" style={{ display:"inline-block", background:GOLD, color:NAVY, padding:"11px 32px", borderRadius:999, fontWeight:800, fontSize:11, letterSpacing:"0.16em", textDecoration:"none", fontFamily:"'DM Sans',sans-serif", marginRight:12 }}>
              ABOUT US
            </Link>
            <Link to="/" style={{ display:"inline-block", border:"1px solid rgba(212,160,23,0.3)", color:"rgba(212,160,23,0.7)", padding:"11px 32px", borderRadius:999, fontWeight:700, fontSize:11, letterSpacing:"0.16em", textDecoration:"none", fontFamily:"'DM Sans',sans-serif" }}>
              BACK TO RESEARCH
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}