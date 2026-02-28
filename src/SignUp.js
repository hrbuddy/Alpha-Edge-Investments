import { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ThemeContext } from "./App";
import { useAuth } from "./AuthContext";

const GOLD = "#D4A017";
const NAVY = "#0D1B2A";

export default function SignUp() {
  const { theme }        = useContext(ThemeContext);
  const isDark           = theme === "dark";
  const { user, signUp } = useAuth();
  const navigate         = useNavigate();

  const [name,     setName]    = useState("");
  const [email,    setEmail]   = useState("");
  const [done,     setDone]    = useState(false);
  const [error,    setError]   = useState("");
  const [focused,  setFocused] = useState(null);
  const [visible,  setVisible] = useState(false);
  const [socialMsg, setSocialMsg] = useState("");

  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);
  useEffect(() => { if (user) navigate("/"); }, [user, navigate]);

  // Theme palette
  const pal = isDark ? {
    bg:      NAVY,
    card:    "rgba(255,255,255,0.025)",
    border:  "rgba(212,160,23,0.13)",
    text:    "#e2e8f0",
    sub:     "#5a7a94",
    muted:   "#3d5570",
    input:   "rgba(255,255,255,0.03)",
    inputFocus: "rgba(212,160,23,0.06)",
    inputBorder:       "rgba(212,160,23,0.15)",
    inputBorderFocus:  "rgba(212,160,23,0.55)",
    inputColor: "#c8dae8",
  } : {
    bg:      "#F5F0E8",
    card:    "rgba(13,27,42,0.04)",
    border:  "rgba(212,160,23,0.22)",
    text:    "#0D1B2A",
    sub:     "#3a5068",
    muted:   "#6a8098",
    input:   "rgba(13,27,42,0.03)",
    inputFocus: "rgba(212,160,23,0.08)",
    inputBorder:       "rgba(212,160,23,0.25)",
    inputBorderFocus:  "rgba(212,160,23,0.6)",
    inputColor: "#0D1B2A",
  };

  function validate() {
    if (!name.trim())  return "Please enter your name.";
    if (!email.trim()) return "Please enter your email.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email address.";
    return "";
  }

  function handleSubmit(e) {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError("");
    signUp(name.trim(), email.trim().toLowerCase());
    setDone(true);
    setTimeout(() => navigate("/"), 2200);
  }

  // Social login — requires OAuth provider setup (Google / Facebook)
  // Wire these up in AuthContext with your preferred provider (Firebase, Auth0, Supabase etc.)
  function handleGoogleLogin() {
    setSocialMsg("Google login coming soon. Set up OAuth in AuthContext to enable.");
    setTimeout(() => setSocialMsg(""), 3000);
  }

  function handleFacebookLogin() {
    setSocialMsg("Facebook login coming soon. Set up OAuth in AuthContext to enable.");
    setTimeout(() => setSocialMsg(""), 3000);
  }

  const fu = (d = 0) => ({
    opacity:    visible ? 1 : 0,
    transform:  visible ? "translateY(0)" : "translateY(18px)",
    transition: `opacity .7s ease ${d}ms, transform .7s cubic-bezier(.22,1,.36,1) ${d}ms`,
  });

  const inputStyle = (field) => ({
    width: "100%", padding: "13px 16px",
    background: focused === field ? pal.inputFocus : pal.input,
    border: `1px solid ${focused === field ? pal.inputBorderFocus : pal.inputBorder}`,
    borderRadius: 10, outline: "none",
    color: pal.inputColor, fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    transition: "all .2s", boxSizing: "border-box",
  });

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;600;700;800&family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,800&display=swap" rel="stylesheet"/>
      <style>{`
        @keyframes signupGlow{0%,100%{box-shadow:0 0 40px rgba(212,160,23,.05)}50%{box-shadow:0 0 80px rgba(212,160,23,.12)}}
        @keyframes checkPop{0%{transform:scale(0) rotate(-20deg);opacity:0}60%{transform:scale(1.2) rotate(5deg);opacity:1}100%{transform:scale(1) rotate(0deg);opacity:1}}
        .signup-card{ animation: signupGlow 5s ease-in-out infinite; }
        .social-btn{ transition: all .2s; }
        .social-btn:hover{ transform: translateY(-1px); opacity: 0.92; }
        .social-btn:active{ transform: translateY(0); }
        .submit-btn{ transition: all .2s; }
        .submit-btn:hover{ background: #e8b420 !important; transform: translateY(-1px); box-shadow: 0 8px 32px rgba(212,160,23,.35) !important; }
        .submit-btn:active{ transform: translateY(0); }
      `}</style>

      <div style={{ background: pal.bg, minHeight: "100vh", paddingTop: 92, display: "flex", alignItems: "center", justifyContent: "center", padding: "92px 20px 60px", fontFamily: "'DM Sans', sans-serif" }}>

        {/* Ambient glow */}
        <div style={{ position:"fixed", top:"20%", left:"50%", transform:"translateX(-50%)", width:500, height:500, background:"radial-gradient(ellipse, rgba(212,160,23,0.04) 0%, transparent 70%)", pointerEvents:"none", zIndex:0 }}/>

        <div style={{ maxWidth: 480, width: "100%", position: "relative", zIndex: 1 }}>

          {done ? (
            /* ── SUCCESS ── */
            <div style={{ textAlign:"center", padding:"60px 32px", background:pal.card, border:`1px solid ${pal.border}`, borderRadius:20 }}>
              <div style={{ fontSize:64, animation:"checkPop .5s cubic-bezier(.22,1,.36,1) forwards" }}>✅</div>
              <h2 style={{ fontSize:26, fontWeight:800, color:pal.text, fontFamily:"'Playfair Display',serif", margin:"20px 0 10px" }}>You're in, {name.split(" ")[0]}!</h2>
              <p style={{ fontSize:14, color:pal.sub, lineHeight:1.7 }}>Welcome to Alpha Edge. Full access unlocked. Redirecting…</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{ textAlign:"center", marginBottom:32, ...fu(0) }}>
                <div style={{ fontSize:9, letterSpacing:"0.38em", color:GOLD, fontWeight:700, marginBottom:12, fontFamily:"'DM Sans',sans-serif" }}>JOIN ALPHA EDGE</div>
                <h1 style={{ fontSize:"clamp(24px,4vw,32px)", fontWeight:900, color:pal.text, fontFamily:"'Playfair Display',serif", margin:"0 0 10px", lineHeight:1.15 }}>
                  Full Access to All 10<br/>
                  <span style={{ background:"linear-gradient(135deg,#f8dc72,#D4A017)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
                    Deep-Dive Reports
                  </span>
                </h1>
                <p style={{ fontSize:14, color:pal.sub, lineHeight:1.7, margin:0 }}>
                  The first 3 dashboards are open to all. Create a free account to unlock every report, model, and analysis as we publish.
                </p>
              </div>

              {/* What you unlock */}
              <div style={{ display:"flex", flexDirection:"column", gap:9, marginBottom:26, ...fu(100) }}>
                {[
                  ["🔓", "Unlock all 10 stock dashboards as they go live"],
                  ["📊", "Full financial models, DCF, and scenario analysis"],
                  ["🔔", "First access — notified the moment research drops"],
                  ["♾️",  "Always free — no subscription, no card needed"],
                ].map(([icon, text]) => (
                  <div key={text} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", background:pal.card, border:`1px solid ${pal.border}`, borderRadius:10 }}>
                    <span style={{ fontSize:16 }}>{icon}</span>
                    <span style={{ fontSize:13, color:pal.sub, fontWeight:500 }}>{text}</span>
                  </div>
                ))}
              </div>

              {/* Card */}
              <div className="signup-card" style={{ background:pal.card, border:`1px solid ${pal.border}`, borderRadius:20, padding:"28px 24px", ...fu(200) }}>

                {/* ── Social login buttons ── */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
                  {/* Google */}
                  <button className="social-btn" onClick={handleGoogleLogin} style={{
                    display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                    padding:"11px 10px", borderRadius:10, cursor:"pointer",
                    background: isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.8)",
                    border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.12)",
                    fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:12,
                    color: isDark ? "#c8dae8" : "#2a2a2a", letterSpacing:"0.3px",
                  }}>
                    {/* Google "G" mark */}
                    <svg width="16" height="16" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </button>

                  {/* Facebook */}
                  <button className="social-btn" onClick={handleFacebookLogin} style={{
                    display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                    padding:"11px 10px", borderRadius:10, cursor:"pointer",
                    background:"#1877F2",
                    border:"none",
                    fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:12,
                    color:"#ffffff", letterSpacing:"0.3px",
                  }}>
                    {/* Facebook f */}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Continue with Facebook
                  </button>
                </div>

                {/* Social message */}
                {socialMsg && (
                  <div style={{ fontSize:11, color:GOLD, background:"rgba(212,160,23,0.08)", border:"1px solid rgba(212,160,23,0.18)", borderRadius:7, padding:"8px 12px", marginBottom:14, textAlign:"center" }}>
                    {socialMsg}
                  </div>
                )}

                {/* Divider */}
                <div style={{ display:"flex", alignItems:"center", gap:12, margin:"0 0 18px" }}>
                  <div style={{ flex:1, height:1, background:pal.border }}/>
                  <span style={{ fontSize:11, color:pal.muted, fontWeight:600, letterSpacing:"1px" }}>OR WITH EMAIL</span>
                  <div style={{ flex:1, height:1, background:pal.border }}/>
                </div>

                {/* Email form */}
                <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
                  <div>
                    <label style={{ fontSize:10, letterSpacing:"1.4px", color:"rgba(212,160,23,0.65)", fontWeight:700, display:"block", marginBottom:6 }}>YOUR NAME</label>
                    <input
                      type="text" value={name} onChange={e => setName(e.target.value)}
                      placeholder="e.g. Arjun Sharma"
                      onFocus={() => setFocused("name")} onBlur={() => setFocused(null)}
                      style={inputStyle("name")}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize:10, letterSpacing:"1.4px", color:"rgba(212,160,23,0.65)", fontWeight:700, display:"block", marginBottom:6 }}>EMAIL ADDRESS</label>
                    <input
                      type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
                      style={inputStyle("email")}
                    />
                  </div>

                  {error && (
                    <div style={{ fontSize:12, color:"#e07070", background:"rgba(224,112,112,0.08)", border:"1px solid rgba(224,112,112,0.18)", borderRadius:7, padding:"8px 12px" }}>
                      {error}
                    </div>
                  )}

                  <button type="submit" className="submit-btn" style={{
                    background: GOLD, color: NAVY, border:"none",
                    borderRadius:10, padding:"14px", fontWeight:800,
                    fontSize:12, letterSpacing:"0.16em", cursor:"pointer",
                    fontFamily:"'DM Sans',sans-serif", marginTop:4,
                    boxShadow:"0 4px 20px rgba(212,160,23,.22)",
                  }}>
                    UNLOCK ALL 10 REPORTS →
                  </button>
                </form>

                <p style={{ fontSize:11, color:pal.muted, textAlign:"center", marginTop:16, marginBottom:0, lineHeight:1.7 }}>
                  No spam. No subscription. No credit card.<br/>
                  By signing up you agree to our{" "}
                  <Link to="/terms" style={{ color:"rgba(212,160,23,0.6)", textDecoration:"none" }}>Terms & Conditions</Link>.
                </p>
              </div>

              <p style={{ textAlign:"center", fontSize:12, color:pal.muted, marginTop:20, ...fu(300) }}>
                Already signed up?{" "}
                <Link to="/" style={{ color:GOLD, textDecoration:"none", fontWeight:700 }}>Back to Research →</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}