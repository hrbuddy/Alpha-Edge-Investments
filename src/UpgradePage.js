import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

const GOLD  = "#D4A017";
const NAVY  = "#0D1B2A";
const GREEN = "#27AE60";
const RED   = "#E74C3C";

const RAZORPAY_KEY  = "rzp_test_SOjue6DAku3jzT";
const PRICE_PREMIUM = 99900;
const PRICE_PRO     = 199900;

function loadRazorpay() {
  return new Promise(resolve => {
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

const ROWS = [
  { label: "Research reports",      free: "All",  premium: "All",  pro: "All"   },
  { label: "DCF Lab",               free: "3",    premium: "All",  pro: "All"   },
  { label: "Portfolio simulations", free: "1",    premium: "5",    pro: "All"   },
  { label: "Saved portfolios",      free: "1",    premium: "5",    pro: "All"   },
  { label: "Quant Hub",             free: false,  premium: false,  pro: true    },
  { label: "VC Model Portfolios",   free: false,  premium: false,  pro: "Soon"  },
  { label: "Early access",          free: false,  premium: false,  pro: true    },
  { label: "All future features",   free: false,  premium: false,  pro: true    },
];

function Cell({ val }) {
  if (val === false) return <span style={{ color:RED, fontSize:14, fontWeight:700 }}>✕</span>;
  if (val === true)  return <span style={{ color:GREEN, fontSize:15, fontWeight:700 }}>✓</span>;
  if (val === "Soon") return (
    <span style={{ fontSize:8, fontWeight:800, letterSpacing:"0.8px",
      color:NAVY, background:GOLD, padding:"2px 7px", borderRadius:99 }}>SOON</span>
  );
  return <span style={{ fontSize:11, fontWeight:600, color:"#fff" }}>{val}</span>;
}

function useCountdown() {
  const [time, setTime] = useState("");
  useEffect(() => {
    function calc() {
      const now = new Date();
      const end = new Date(); end.setHours(23,59,59,0);
      const diff = end - now;
      const h = String(Math.floor(diff/3600000)).padStart(2,"0");
      const m = String(Math.floor((diff%3600000)/60000)).padStart(2,"0");
      const s = String(Math.floor((diff%60000)/1000)).padStart(2,"0");
      setTime(`${h}:${m}:${s}`);
    }
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export default function UpgradePage() {
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const countdown = useCountdown();

  const [selected, setSelected] = useState("pro");
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(null);
  const [error,    setError]    = useState("");

  async function markPaid(paymentId, plan) {
    if (!user?.email) return;
    try {
      const key = user.email.toLowerCase().replace(/[.#$[\]]/g, "_");
      await updateDoc(doc(db, "users", key), {
        isPaid: true, plan,
        paidAt: new Date().toISOString(),
        paymentId,
      });
      const stored = localStorage.getItem("ae_user");
      if (stored) {
        const p = JSON.parse(stored);
        localStorage.setItem("ae_user", JSON.stringify({ ...p, isPaid: true, plan }));
      }
    } catch(e) { console.warn("Firestore error:", e); }
  }

  async function handlePayment() {
    setError(""); setLoading(true);
    const ok = await loadRazorpay();
    if (!ok) { setError("Failed to load payment gateway."); setLoading(false); return; }
    const isPro = selected === "pro";
    const options = {
      key: RAZORPAY_KEY,
      amount: isPro ? PRICE_PRO : PRICE_PREMIUM,
      currency: "INR",
      name: "Vantage Capital",
      description: isPro ? "Pro — Lifetime Access" : "Premium — Annual Plan",
      prefill: { name: user?.name || "", email: user?.email || "" },
      notes: { userEmail: user?.email || "unknown", plan: selected },
      theme: { color: GOLD },
      handler: async function(response) {
        await markPaid(response.razorpay_payment_id, selected);
        setSuccess(selected); setLoading(false);
        setTimeout(() => navigate("/profile"), 2500);
      },
      modal: { ondismiss: () => setLoading(false) },
    };
    try {
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", r => { setError(`Payment failed: ${r.error.description}`); setLoading(false); });
      rzp.open();
    } catch(e) { setError("Could not open payment window."); setLoading(false); }
  }

  if (success) {
    return (
      <div style={{ background:`linear-gradient(160deg,${NAVY} 0%,#060e1a 100%)`,
        minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
        padding:"100px 24px", fontFamily:"'DM Sans',sans-serif" }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet"/>
        <div style={{ maxWidth:420, width:"100%", textAlign:"center" }}>
          <div style={{ fontSize:64, marginBottom:16 }}>🎉</div>
          <h1 style={{ fontSize:28, fontWeight:900, color:"#fff",
            fontFamily:"'Playfair Display',serif", marginBottom:10 }}>
            You're in, {user?.name?.split(" ")[0] || "friend"}!
          </h1>
          <p style={{ fontSize:13, color:"#94a3b8", lineHeight:1.7 }}>
            {success==="pro" ? "Pro access unlocked — every feature, forever." : "Premium access unlocked. Research & DCF Lab are all yours."}
            <br/>Redirecting to your profile…
          </p>
          <div style={{ width:40, height:3, background:GOLD, borderRadius:2, margin:"20px auto 0" }}/>
        </div>
      </div>
    );
  }

  const isPro = selected === "pro";

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet"/>
      <style>{`
        @media(max-width:600px){
          .vc-up-wrap { padding: 130px 14px 40px !important; }
          .vc-table th, .vc-table td { padding: 8px 6px !important; }
          .feat-label { font-size: 10px !important; }
        }
        .plan-card { transition: all .18s; cursor: pointer; }
        .plan-card:hover { filter: brightness(1.07); }
        .pay-btn { transition: all .2s; }
        .pay-btn:hover:not(:disabled) { filter:brightness(1.1); transform:translateY(-2px); }
        .pay-btn:active:not(:disabled) { transform:translateY(0); }
        .back-btn:hover { border-color: rgba(255,255,255,0.4) !important; color: #fff !important; }
      `}</style>

      <div className="vc-up-wrap" style={{
        background:`linear-gradient(160deg,${NAVY} 0%,#060e1a 100%)`,
        minHeight:"100vh", color:"#fff",
        fontFamily:"'DM Sans',sans-serif",
        padding:"120px 20px 48px",
      }}>
        <div style={{ position:"fixed", top:"20%", left:"50%", transform:"translateX(-50%)",
          width:600, height:500, pointerEvents:"none", zIndex:0,
          background:"radial-gradient(ellipse,rgba(212,160,23,0.06) 0%,transparent 70%)" }}/>

        <div style={{ maxWidth:680, margin:"0 auto", position:"relative", zIndex:1 }}>

          {/* ── HEADER ── */}
          <div style={{ textAlign:"center", marginBottom:16 }}>
            <div style={{ fontSize:9, color:GOLD, letterSpacing:"2.5px", fontWeight:700, marginBottom:8 }}>
              VANTAGE CAPITAL · PLANS
            </div>
            <h1 style={{ fontSize:"clamp(24px,4vw,34px)", fontWeight:900,
              fontFamily:"'Playfair Display',serif", color:"#fff", margin:"0 0 6px" }}>
              Choose Your Plan
            </h1>
            {/* Launch price timer */}
            <div style={{ display:"inline-flex", alignItems:"center", gap:8,
              background:"rgba(212,160,23,0.08)", border:"1px solid rgba(212,160,23,0.2)",
              borderRadius:99, padding:"5px 14px" }}>
              <span style={{ fontSize:10, color:GOLD, fontWeight:700, letterSpacing:"0.5px" }}>
                🔥 LAUNCH PRICES · OFFER ENDS IN
              </span>
              <span style={{ fontSize:13, fontWeight:900, color:GOLD,
                fontFamily:"'Playfair Display',serif", letterSpacing:"2px" }}>
                {countdown}
              </span>
            </div>
          </div>

          {/* ── PLAN CARDS ── */}
          <div style={{ display:"flex", gap:10, marginBottom:12 }}>
            {[
              {
                key:"premium", label:"Premium",
                was:"₹1999/yr", price:"₹999/yr",
                discount:"50% OFF", sub:"Research + DCF · annual",
              },
              {
                key:"pro", label:"Pro ★",
                was:"₹4999", price:"₹1999",
                discount:"60% OFF", sub:"Everything · lifetime",
                best:true,
              },
            ].map(p => (
              <div key={p.key} className="plan-card"
                onClick={() => setSelected(p.key)}
                style={{
                  flex:1, padding:"14px 14px 12px", borderRadius:12, position:"relative",
                  border: selected===p.key
                    ? `2px solid ${p.best ? "#f8dc72" : GOLD}`
                    : "2px solid rgba(255,255,255,0.1)",
                  background: selected===p.key
                    ? p.best ? "rgba(248,220,114,0.07)" : "rgba(212,160,23,0.06)"
                    : "rgba(255,255,255,0.03)",
                }}>
                {p.best && (
                  <div style={{ position:"absolute", top:-10, left:"50%", transform:"translateX(-50%)",
                    fontSize:8, fontWeight:900, background:GOLD, color:NAVY,
                    padding:"3px 12px", borderRadius:99, letterSpacing:"1px", whiteSpace:"nowrap" }}>
                    BEST VALUE
                  </div>
                )}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:4 }}>
                  <div style={{ fontSize:10, fontWeight:800, letterSpacing:"0.8px", marginTop:p.best?4:0,
                    color: selected===p.key ? (p.best ? "#f8dc72" : GOLD) : "rgba(255,255,255,0.5)" }}>
                    {p.label}
                  </div>
                  <div style={{ fontSize:9, fontWeight:800, background:"rgba(39,174,96,0.15)",
                    color:GREEN, padding:"2px 7px", borderRadius:99, marginTop:p.best?4:0 }}>
                    {p.discount}
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"baseline", gap:6, marginBottom:2 }}>
                  <span style={{ fontSize:10, color:"rgba(255,255,255,0.35)",
                    textDecoration:"line-through" }}>{p.was}</span>
                  <span style={{ fontSize:20, fontWeight:900, color:"#fff",
                    fontFamily:"'Playfair Display',serif" }}>{p.price}</span>
                </div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.45)" }}>{p.sub}</div>
              </div>
            ))}
          </div>

          {/* Not signed in */}
          {!user && (
            <div style={{ fontSize:12, color:GOLD, background:"rgba(212,160,23,0.07)",
              border:"1px solid rgba(212,160,23,0.2)", borderRadius:8,
              padding:"9px 14px", marginBottom:10, textAlign:"center" }}>
              Please{" "}
              <span onClick={() => navigate("/signup")}
                style={{ fontWeight:800, cursor:"pointer", textDecoration:"underline" }}>
                sign in
              </span>
              {" "}first to link your payment.
            </div>
          )}

          {error && (
            <div style={{ fontSize:12, color:"#e07070", background:"rgba(224,112,112,0.08)",
              border:"1px solid rgba(224,112,112,0.2)", borderRadius:8,
              padding:"9px 14px", marginBottom:10 }}>{error}</div>
          )}

          {/* ── PAY BUTTON ── */}
          <button className="pay-btn" onClick={handlePayment}
            disabled={loading || !user}
            style={{
              width:"100%", padding:"14px", border:"none", borderRadius:10,
              fontWeight:900, fontSize:13, letterSpacing:"0.12em",
              cursor: loading||!user ? "not-allowed" : "pointer",
              fontFamily:"'DM Sans',sans-serif", marginBottom:16,
              background: loading ? "rgba(212,160,23,0.5)"
                : isPro ? "linear-gradient(135deg,#f8dc72,#D4A017)" : GOLD,
              color: NAVY,
              boxShadow: isPro ? "0 4px 28px rgba(248,220,114,0.3)" : "0 4px 20px rgba(212,160,23,0.25)",
              opacity: !user ? 0.6 : 1,
            }}>
            {loading ? "OPENING PAYMENT…"
              : isPro ? "GET PRO — ₹1999 LIFETIME ★"
              : "GET PREMIUM — ₹999 / YEAR"}
          </button>

          {/* ── COMPARISON TABLE ── */}
          <div style={{ borderRadius:14, overflow:"hidden",
            border:"1px solid rgba(255,255,255,0.1)", marginBottom:12 }}>
            <table className="vc-table" style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ borderBottom:"1px solid rgba(255,255,255,0.1)" }}>
                  <th style={{ padding:"12px 16px", textAlign:"left",
                    fontSize:9, color:"rgba(255,255,255,0.5)", fontWeight:700, letterSpacing:"1px" }}>
                    FEATURES
                  </th>
                  {[
                    { label:"FREE",    price:"₹0",    sub:"forever"  },
                    { label:"PREMIUM", price:"₹999",  sub:"/year",   gold:true },
                    { label:"PRO ★",   price:"₹1999", sub:"lifetime", bright:true },
                  ].map(col => (
                    <th key={col.label} style={{ padding:"12px 10px", textAlign:"center",
                      background: col.bright ? "rgba(212,160,23,0.06)" : "transparent",
                      borderLeft:"1px solid rgba(255,255,255,0.07)" }}>
                      <div style={{ fontSize:9, fontWeight:800, letterSpacing:"1px", marginBottom:3,
                        color: col.bright ? "#f8dc72" : col.gold ? GOLD : "rgba(255,255,255,0.5)" }}>
                        {col.label}
                      </div>
                      <div style={{ fontSize:14, fontWeight:900,
                        fontFamily:"'Playfair Display',serif",
                        color: col.bright ? "#f8dc72" : col.gold ? GOLD : "rgba(255,255,255,0.4)" }}>
                        {col.price}
                      </div>
                      <div style={{ fontSize:8, marginTop:1,
                        color: col.bright ? "rgba(248,220,114,0.5)" : "rgba(255,255,255,0.3)" }}>
                        {col.sub}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row, i) => (
                  <tr key={row.label}
                    style={{ borderBottom: i<ROWS.length-1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                      background: i%2===0 ? "rgba(255,255,255,0.01)" : "transparent" }}>
                    <td className="feat-label" style={{ padding:"10px 16px", fontSize:11,
                      color:"#fff", fontWeight:500 }}>{row.label}</td>
                    <td style={{ padding:"10px", textAlign:"center",
                      borderLeft:"1px solid rgba(255,255,255,0.06)" }}>
                      <Cell val={row.free}/>
                    </td>
                    <td style={{ padding:"10px", textAlign:"center",
                      borderLeft:"1px solid rgba(255,255,255,0.06)" }}>
                      <Cell val={row.premium}/>
                    </td>
                    <td style={{ padding:"10px", textAlign:"center",
                      borderLeft:"1px solid rgba(212,160,23,0.1)",
                      background:"rgba(212,160,23,0.03)" }}>
                      <Cell val={row.pro}/>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Go Back */}
          <button className="back-btn" onClick={() => navigate("/")} style={{
            width:"100%", padding:"11px", background:"transparent",
            border:"1px solid rgba(255,255,255,0.2)", borderRadius:10,
            color:"rgba(255,255,255,0.6)", fontSize:12, fontWeight:700, cursor:"pointer",
            fontFamily:"'DM Sans',sans-serif", transition:"all .2s",
          }}>
            ← Go Back
          </button>

          <p style={{ textAlign:"center", fontSize:10, color:"rgba(255,255,255,0.3)",
            marginTop:12, lineHeight:1.6 }}>
            Secure payment via Razorpay · UPI, cards, net banking accepted<br/>
            Questions?{" "}
            <a href="mailto:atul109.nitjsr@gmail.com"
              style={{ color:"rgba(212,160,23,0.5)", textDecoration:"none" }}>
              atul109.nitjsr@gmail.com
            </a>
          </p>

        </div>
      </div>
    </>
  );
}