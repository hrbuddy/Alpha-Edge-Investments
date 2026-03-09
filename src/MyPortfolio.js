import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { useAccess } from "./AccessContext";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebase";

const GOLD   = "#D4A017";
const NAVY   = "#0D1B2A";
const COLORS = [GOLD,"#4FC3F7","#81C784","#FFB74D","#F48FB1","#CE93D8","#80CBC4","#FFCC02"];

function SectionHeader({ label }) {
  return (
    <div style={{ fontSize:9, fontWeight:800, letterSpacing:"0.32em",
      color:"rgba(212,160,23,0.55)", marginBottom:12, marginTop:4,
      fontFamily:"'DM Sans',sans-serif" }}>
      {label}
    </div>
  );
}

function Card({ children, delay=0, visible, style={} }) {
  return (
    <div style={{
      background:"rgba(255,255,255,0.02)",
      border:"1px solid rgba(255,255,255,0.06)",
      borderRadius:14, padding:"16px 16px 12px", marginBottom:12,
      opacity:visible?1:0,
      transform:visible?"translateY(0)":"translateY(16px)",
      transition:`opacity .6s ease ${delay}ms, transform .6s cubic-bezier(.22,1,.36,1) ${delay}ms`,
      ...style,
    }}>
      {children}
    </div>
  );
}

function Btn({ label, gold=false, onClick, disabled=false }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{
        flex:1, padding:"10px 12px", borderRadius:8,
        cursor:disabled?"not-allowed":"pointer",
        fontSize:11, fontWeight:800, letterSpacing:"0.8px",
        fontFamily:"'DM Sans',sans-serif",
        background: gold ? (hov?"#c8980f":GOLD) : (hov?"rgba(212,160,23,0.12)":"rgba(212,160,23,0.07)"),
        color: gold ? NAVY : GOLD,
        border: gold?"none":"1px solid rgba(212,160,23,0.25)",
        opacity:disabled?0.4:1, transition:"background .15s",
      }}>
      {label}
    </button>
  );
}

function WeightBar({ label, weight, color=GOLD }) {
  const pct = Math.min(weight*100, 100);
  return (
    <div style={{ marginBottom:8 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
        <span style={{ fontSize:11, color:"#94a3b8", fontWeight:600 }}>{label}</span>
        <span style={{ fontSize:11, color, fontWeight:800 }}>{pct.toFixed(1)}%</span>
      </div>
      <div style={{ height:4, background:"rgba(255,255,255,0.06)", borderRadius:99, overflow:"hidden" }}>
        <div style={{ width:`${pct}%`, height:"100%", background:color, borderRadius:99, transition:"width .6s ease" }}/>
      </div>
    </div>
  );
}

function PortfolioRow({ portfolio, onLoad, onDelete }) {
  const [hov, setHov] = useState(false);
  const date = portfolio.savedAt
    ? new Date(portfolio.savedAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})
    : "—";
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ display:"flex", alignItems:"center", gap:12,
        padding:"12px 4px", borderBottom:"1px solid rgba(255,255,255,0.04)",
        background:hov?"rgba(255,255,255,0.02)":"transparent",
        transition:"background .15s", borderRadius:8 }}>
      <div style={{ width:34, height:34, borderRadius:8, flexShrink:0,
        background:"rgba(212,160,23,0.08)", border:"1px solid rgba(212,160,23,0.2)",
        display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>
        🗂️
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13, fontWeight:700, color:"#e2e8f0", fontFamily:"'DM Sans',sans-serif" }}>
          {portfolio.name || "Unnamed Portfolio"}
        </div>
        <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginTop:4 }}>
          {(portfolio.stocks||[]).slice(0,5).map((t,i)=>(
            <span key={t} style={{ fontSize:9, fontWeight:800, padding:"2px 6px", borderRadius:99,
              background:COLORS[i%COLORS.length]+"22", color:COLORS[i%COLORS.length],
              border:`1px solid ${COLORS[i%COLORS.length]}44` }}>{t}</span>
          ))}
          {(portfolio.stocks||[]).length > 5 && (
            <span style={{ fontSize:9, color:"#3d5570" }}>+{portfolio.stocks.length-5} more</span>
          )}
        </div>
        <div style={{ fontSize:10, color:"#3d5570", marginTop:3 }}>
          {portfolio.weightMode==="equal"?"Equal weight":"Custom weight"} · {date}
        </div>
      </div>
      <div style={{ display:"flex", gap:6, flexShrink:0 }}>
        <button onClick={()=>onLoad(portfolio)}
          style={{ padding:"5px 12px", borderRadius:6,
            border:"1px solid rgba(212,160,23,0.3)", background:"rgba(212,160,23,0.08)",
            color:GOLD, fontSize:10, fontWeight:800, cursor:"pointer", letterSpacing:"0.5px" }}>
          LOAD
        </button>
        <button onClick={()=>onDelete(portfolio.id)}
          style={{ padding:"5px 8px", borderRadius:6,
            border:"1px solid rgba(192,57,43,0.2)", background:"rgba(192,57,43,0.06)",
            color:"#c0392b", fontSize:11, fontWeight:700, cursor:"pointer" }}>
          ✕
        </button>
      </div>
    </div>
  );
}

export default function MyPortfolio() {
  const navigate        = useNavigate();
  const { user }        = useAuth();
  const { isPaid }      = useAccess();
  const [visible, setVisible]             = useState(false);
  const [portfolios, setPortfolios]       = useState([]);
  const [loading, setLoading]             = useState(true);
  const [active, setActive]               = useState(null);
  const [deleteId, setDeleteId]           = useState(null);
  const [wishlistCount, setWishlistCount] = useState(0);

  const userKey = user?.email ? user.email.replace(/[.#$[\]]/g,"_") : null;

  useEffect(() => {
    if (!user) { navigate("/signup"); return; }
    window.scrollTo(0,0);
    setTimeout(()=>setVisible(true), 60);

    // Wishlist count from ae_wishlist (same key used by the app)
    try {
      const wl = JSON.parse(localStorage.getItem("ae_wishlist")||"[]");
      setWishlistCount(wl.length);
    } catch { setWishlistCount(0); }

    // Portfolios from Firestore — same path as PortfolioSimulator
    if (!userKey) { setLoading(false); return; }
    getDocs(collection(db,"portfolios",userKey,"saved"))
      .then(snap => {
        const list = [];
        snap.forEach(d => list.push({id:d.id, ...d.data()}));
        setPortfolios(list);
      })
      .catch(()=>{})
      .finally(()=>setLoading(false));
  }, [user, navigate, userKey]);

  async function handleDelete(id) {
    if (!userKey) return;
    await deleteDoc(doc(db,"portfolios",userKey,"saved",id));
    setPortfolios(prev => prev.filter(p=>p.id!==id));
    if (active?.id===id) setActive(null);
    setDeleteId(null);
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;600;700;800&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet"/>
      <style>{`
        @media(max-width:640px){ .vc-myport-root { padding-top:110px !important; } }
      `}</style>

      <div className="vc-myport-root" style={{
        background:`linear-gradient(160deg, ${NAVY} 0%, #060e1a 100%)`,
        minHeight:"100vh", color:"#e2e8f0",
        fontFamily:"'DM Sans',sans-serif", paddingTop:96,
      }}>
        <div style={{ maxWidth:640, margin:"0 auto", padding:"32px 18px 100px" }}>

          {/* HEADER */}
          <div style={{ opacity:visible?1:0, transform:visible?"translateY(0)":"translateY(12px)",
            transition:"opacity .5s, transform .5s", marginBottom:24 }}>
            <Link to="/profile" style={{ color:"rgba(212,160,23,0.45)", fontSize:12,
              textDecoration:"none", fontWeight:600 }}>← Profile</Link>
            <div style={{ fontSize:26, fontWeight:800, color:"#fff",
              fontFamily:"'Playfair Display',serif", lineHeight:1.1, marginTop:6 }}>
              My Portfolio
            </div>
            <div style={{ fontSize:12, color:"#3d5570", marginTop:4 }}>
              Save, load and track your portfolio simulations
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <Card visible={visible} delay={0}>
            <SectionHeader label="QUICK ACTIONS" />
            <div style={{ display:"flex", gap:8 }}>
              <Btn gold label="RUN SIMULATION" onClick={()=>navigate("/portfolio")} />
              <Btn label="BUILD DCF" onClick={()=>navigate("/dcf/hdfcamc")} />
            </div>
          </Card>

          {/* ACTIVE PORTFOLIO */}
          {active ? (
            <Card visible={visible} delay={80}
              style={{ border:"1px solid rgba(212,160,23,0.2)", background:"rgba(212,160,23,0.03)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                <div>
                  <SectionHeader label="LOADED PORTFOLIO" />
                  <div style={{ fontSize:15, fontWeight:800, color:"#fff",
                    fontFamily:"'Playfair Display',serif" }}>{active.name}</div>
                  <div style={{ fontSize:10, color:"#3d5570", marginTop:2 }}>
                    {active.stocks?.length||0} stocks · {active.weightMode==="equal"?"Equal weight":"Custom weight"}
                  </div>
                </div>
                <button onClick={()=>setActive(null)}
                  style={{ background:"none", border:"none", color:"#3d5570", fontSize:20, cursor:"pointer" }}>×</button>
              </div>
              <div style={{ marginBottom:12 }}>
                {(active.stocks||[]).map((t,i) => {
                  const w = active.weightMode==="equal"
                    ? 1/(active.stocks.length)
                    : (active.weights?.[t]||0);
                  return <WeightBar key={t} label={t} weight={w} color={COLORS[i%COLORS.length]} />;
                })}
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <Btn gold label="▶  RUN WITH THIS"
                  onClick={()=>navigate("/portfolio",{state:{portfolio:active}})} />
              </div>
            </Card>
          ) : (
            <Card visible={visible} delay={80}>
              <SectionHeader label="ACTIVE PORTFOLIO" />
              <div style={{ textAlign:"center", padding:"14px 0 6px", color:"#3d5570", fontSize:12, lineHeight:1.7 }}>
                No portfolio loaded.<br/>
                <span style={{ color:"rgba(212,160,23,0.45)" }}>
                  Load a saved portfolio below or run a new simulation.
                </span>
              </div>
            </Card>
          )}

          {/* SAVED PORTFOLIOS */}
          <Card visible={visible} delay={160}>
            <SectionHeader label={`SAVED PORTFOLIOS${portfolios.length ? ` · ${portfolios.length}` : ""}`} />
            {loading ? (
              <div style={{ textAlign:"center", padding:"20px 0", color:"#3d5570", fontSize:12 }}>Loading…</div>
            ) : portfolios.length===0 ? (
              <div style={{ textAlign:"center", padding:"16px 0 8px", color:"#3d5570", fontSize:12, lineHeight:1.7 }}>
                No saved portfolios yet.<br/>
                <span style={{ color:"rgba(212,160,23,0.45)" }}>Build one in Portfolio Simulator and tap Save.</span>
                <div style={{ marginTop:14, display:"flex" }}>
                  <Btn gold label="GO TO SIMULATOR →" onClick={()=>navigate("/portfolio",{state:{portfolio:active}})} />
                </div>
              </div>
            ) : (
              portfolios.map(p=>(
                <PortfolioRow key={p.id} portfolio={p}
                  onLoad={p=>setActive(p)}
                  onDelete={id=>setDeleteId(id)} />
              ))
            )}
          </Card>

          {/* STATS */}
          <Card visible={visible} delay={240}>
            <SectionHeader label="MY STATS" />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {[
                { label:"Portfolios Saved", value:portfolios.length, icon:"🗂️" },
                { label:"Wishlisted Stocks", value:wishlistCount, icon:"❤️" },
              ].map(({label,value,icon})=>(
                <div key={label} style={{ background:"rgba(212,160,23,0.05)",
                  border:"1px solid rgba(212,160,23,0.12)", borderRadius:10,
                  padding:"14px 12px", textAlign:"center" }}>
                  <div style={{ fontSize:20, marginBottom:4 }}>{icon}</div>
                  <div style={{ fontSize:24, fontWeight:900, color:GOLD,
                    fontFamily:"'Playfair Display',serif" }}>{value}</div>
                  <div style={{ fontSize:9, color:"#3d5570", marginTop:3,
                    fontWeight:700, letterSpacing:"0.3px" }}>{label}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* UPGRADE NUDGE */}
          {!isPaid && (
            <Card visible={visible} delay={320}
              style={{ border:"1px solid rgba(212,160,23,0.25)", background:"rgba(212,160,23,0.03)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                <span style={{ fontSize:26 }}>⚡</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:800, color:GOLD }}>Unlock Unlimited Simulations</div>
                  <div style={{ fontSize:11, color:"#3d5570", marginTop:2, lineHeight:1.5 }}>
                    Premium members get unlimited portfolio runs, DCF models & more.
                  </div>
                </div>
                <button onClick={()=>navigate("/upgrade")}
                  style={{ padding:"8px 14px", background:GOLD, color:NAVY,
                    border:"none", borderRadius:8, fontSize:10, fontWeight:900,
                    letterSpacing:"0.8px", cursor:"pointer", flexShrink:0 }}>
                  ₹999/yr
                </button>
              </div>
            </Card>
          )}

        </div>
      </div>

      {/* DELETE CONFIRM */}
      {deleteId && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)",
          backdropFilter:"blur(6px)", zIndex:999,
          display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div style={{ background:"#0d1b2a", border:"1px solid rgba(192,57,43,0.3)",
            borderRadius:16, padding:"28px 24px", maxWidth:320, width:"100%", textAlign:"center" }}>
            <div style={{ fontSize:32, marginBottom:10 }}>🗑️</div>
            <div style={{ fontSize:16, fontWeight:800, color:"#fff",
              fontFamily:"'Playfair Display',serif", marginBottom:8 }}>
              Delete this portfolio?
            </div>
            <div style={{ fontSize:12, color:"#5a7a94", lineHeight:1.7, marginBottom:20 }}>
              This cannot be undone.
            </div>
            <button onClick={()=>handleDelete(deleteId)} style={{
              width:"100%", padding:"11px", background:"#C0392B", color:"#fff",
              border:"none", borderRadius:8, fontWeight:800, fontSize:12,
              cursor:"pointer", marginBottom:8, fontFamily:"'DM Sans',sans-serif" }}>
              YES, DELETE
            </button>
            <button onClick={()=>setDeleteId(null)} style={{
              width:"100%", padding:"10px", background:"transparent",
              border:"1px solid rgba(255,255,255,0.08)", borderRadius:8,
              color:"#5a7a94", fontSize:12, fontWeight:700,
              cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}