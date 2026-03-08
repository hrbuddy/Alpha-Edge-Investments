import { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ThemeContext } from "./App";
import { useAuth } from "./AuthContext";

const GOLD = "#D4A017";
const NAVY = "#0D1B2A";

const FEATURES = [
  { icon: "🔓", text: "Stock research reports & your own DCF model" },
  { icon: "⚖️", text: "Portfolio simulator & curated model portfolios" },
  { icon: "📊", text: "Quant Hub — momentum, value, size & more" },
];

const GOOGLE_SVG = (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const FB_SVG = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

export default function SignUp() {
  const { theme }             = useContext(ThemeContext);
  const isDark                = theme === "dark";
  const { user, signUp, signIn, signInWithGoogle } = useAuth();
  const navigate              = useNavigate();

  const [tab,      setTab]    = useState("signup"); // "signup" | "signin"
  const [name,     setName]   = useState("");
  const [email,    setEmail]  = useState("");
  const [siEmail,  setSiEmail] = useState(""); // sign-in email
  const [done,     setDone]   = useState(false);
  const [error,    setError]  = useState("");
  const [siMsg,    setSiMsg]  = useState("");
  const [focused,  setFocused] = useState(null);
  const [visible,  setVisible] = useState(false);
  const [loading,  setLoading] = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);
  useEffect(() => { if (user) navigate("/"); }, [user, navigate]);
  // Clear errors on tab switch
  useEffect(() => { setError(""); setSiMsg(""); }, [tab]);

  const pal = isDark ? {
    bg: NAVY, card: "rgba(255,255,255,0.025)", border: "rgba(212,160,23,0.13)",
    text: "#e2e8f0", sub: "#5a7a94", muted: "#3d5570",
    input: "rgba(255,255,255,0.03)", inputFocus: "rgba(212,160,23,0.06)",
    inputBorder: "rgba(212,160,23,0.15)", inputBorderFocus: "rgba(212,160,23,0.55)",
    inputColor: "#c8dae8", tabInactive: "rgba(255,255,255,0.04)",
  } : {
    bg: "#F5F0E8", card: "rgba(13,27,42,0.04)", border: "rgba(212,160,23,0.22)",
    text: "#0D1B2A", sub: "#3a5068", muted: "#6a8098",
    input: "rgba(13,27,42,0.03)", inputFocus: "rgba(212,160,23,0.08)",
    inputBorder: "rgba(212,160,23,0.25)", inputBorderFocus: "rgba(212,160,23,0.6)",
    inputColor: "#0D1B2A", tabInactive: "rgba(13,27,42,0.04)",
  };

  const fu = (d = 0) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(18px)",
    transition: `opacity .7s ease ${d}ms, transform .7s cubic-bezier(.22,1,.36,1) ${d}ms`,
  });

  const inputStyle = (field) => ({
    width: "100%", padding: "10px 14px",
    background: focused === field ? pal.inputFocus : pal.input,
    border: `1px solid ${focused === field ? pal.inputBorderFocus : pal.inputBorder}`,
    borderRadius: 10, outline: "none",
    color: pal.inputColor, fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    transition: "all .2s", boxSizing: "border-box",
  });

  // ── Google login ──────────────────────────────────────────────────────────
  async function handleGoogleLogin() {
    try {
      await signInWithGoogle();
      // onAuthStateChanged in AuthContext updates user → triggers navigate("/")
    } catch (e) {
      setError(
        e.code === "auth/popup-closed-by-user"   ? "Sign-in cancelled." :
        e.code === "auth/popup-blocked"           ? "Popup blocked — please allow popups for this site." :
        "Google sign-in failed. Please try again."
      );
    }
  }

  // ── Sign Up submit ─────────────────────────────────────────────────────────
  function handleSignUp(e) {
    e.preventDefault();
    if (!name.trim())  { setError("Please enter your name."); return; }
    if (!email.trim()) { setError("Please enter your email."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Please enter a valid email address."); return; }
    setError("");
    signUp(name.trim(), email.trim().toLowerCase());
    setDone(true);
    setTimeout(() => navigate("/"), 2200);
  }

  // ── Sign In submit ─────────────────────────────────────────────────────────
  async function handleSignIn(e) {
    e.preventDefault();
    if (!siEmail.trim()) { setError("Please enter your email."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(siEmail)) { setError("Please enter a valid email address."); return; }
    setError(""); setLoading(true);
    const result = await signIn(siEmail.trim().toLowerCase());
    setLoading(false);
    if (result === "ok") {
      navigate("/");
    } else if (result === "not_found") {
      setError("No account found for this email. Please sign up instead.");
    } else {
      setError("Something went wrong. Please try again.");
    }
  }

  function handleFacebook() {
    setSiMsg("Facebook login coming soon.");
    setTimeout(() => setSiMsg(""), 3000);
  }

  const socialBtn = (onClick, bg, border, color, icon, label) => (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      padding: "9px 10px", borderRadius: 8, cursor: "pointer",
      background: bg, border, color,
      fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: 13,
      letterSpacing: "0.3px", transition: "all .2s", flex: 1,
    }}
      onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = "1";    e.currentTarget.style.transform = "translateY(0)"; }}
    >
      {icon} {label}
    </button>
  );

  const divider = (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "10px 0" }}>
      <div style={{ flex: 1, height: 1, background: pal.border }}/>
      <span style={{ fontSize: 10, color: pal.muted, fontWeight: 700, letterSpacing: "1.2px" }}>OR WITH EMAIL</span>
      <div style={{ flex: 1, height: 1, background: pal.border }}/>
    </div>
  );

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;600;700;800&family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,800&display=swap" rel="stylesheet"/>
      <style>{`
        @keyframes signupGlow { 0%,100%{box-shadow:0 0 40px rgba(212,160,23,.05)} 50%{box-shadow:0 0 80px rgba(212,160,23,.12)} }
        @keyframes checkPop   { 0%{transform:scale(0) rotate(-20deg);opacity:0} 60%{transform:scale(1.2) rotate(5deg);opacity:1} 100%{transform:scale(1) rotate(0deg);opacity:1} }
        .vc-signup-card { animation: signupGlow 5s ease-in-out infinite; }
        .vc-primary-btn { transition: all .2s; }
        .vc-primary-btn:hover { background: #e8b420 !important; transform: translateY(-1px); box-shadow: 0 8px 32px rgba(212,160,23,.35) !important; }
        .vc-primary-btn:active { transform: translateY(0); }
        @media (max-width: 600px) {
          .vc-signup-tagline { display: none !important; }
          .vc-signup-wrap { padding: 130px 14px 30px !important; align-items: flex-start !important; }
        }
      `}</style>

      <div className="vc-signup-wrap" style={{
        background: pal.bg, minHeight: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "92px 20px 60px", fontFamily: "'DM Sans', sans-serif",
      }}>
        {/* Ambient glow */}
        <div style={{ position:"fixed", top:"20%", left:"50%", transform:"translateX(-50%)", width:500, height:500, background:"radial-gradient(ellipse, rgba(212,160,23,0.04) 0%, transparent 70%)", pointerEvents:"none", zIndex:0 }}/>

        <div style={{ maxWidth: 480, width: "100%", position: "relative", zIndex: 1 }}>

          {done ? (
            /* ── SUCCESS STATE ── */
            <div style={{ textAlign:"center", padding:"60px 32px", background:pal.card, border:`1px solid ${pal.border}`, borderRadius:20 }}>
              <div style={{ fontSize:64, animation:"checkPop .5s cubic-bezier(.22,1,.36,1) forwards" }}>✅</div>
              <h2 style={{ fontSize:26, fontWeight:800, color:pal.text, fontFamily:"'Playfair Display',serif", margin:"20px 0 10px" }}>
                Welcome, {name.split(" ")[0]}!
              </h2>
              <p style={{ fontSize:14, color:pal.sub, lineHeight:1.7 }}>
                You're in. Redirecting you to Vantage Capital…
              </p>
            </div>
          ) : (
            <>
              {/* ── HEADER ── */}
              <div style={{ textAlign:"center", marginBottom:14, marginTop:8, ...fu(0) }}>
<div style={{ fontSize:9, letterSpacing:"0.38em", color:"rgba(212,160,23,0.6)", fontWeight:700, marginBottom:8, textAlign:"center" }}>
                  JOIN VANTAGE CAPITAL
                </div>
<h1 style={{ fontSize:"clamp(26px,5vw,36px)", fontWeight:900, color:GOLD, fontFamily:"'Playfair Display',serif", margin:"0 0 0", letterSpacing:"0.02em", textAlign:"center" }}>
                  Sign Up
                </h1>
                <h1 className="vc-signup-tagline" style={{ fontSize:"clamp(24px,4vw,32px)", fontWeight:900, color:pal.text, fontFamily:"'Playfair Display',serif", margin:"10px 0 10px", lineHeight:1.15, textAlign:"center" }}>
                  Institutional-grade research.<br/>
                  <span style={{ background:"linear-gradient(135deg,#f8dc72,#D4A017)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
                    Built for independent investors.
                  </span>
                </h1>

              </div>

              {/* ── FEATURES — only show on signup tab ── */}
              {tab === "signup" && (
                <div style={{ display:"flex", flexDirection:"column", gap:5, marginBottom:10, ...fu(80) }}>
                  {FEATURES.map(({ icon, text }) => (
                    <div key={text} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", background:pal.card, border:`1px solid ${pal.border}`, borderRadius:8 }}>
                      <span style={{ fontSize:15, flexShrink:0 }}>{icon}</span>
                      <span style={{ fontSize:12, color:pal.sub, fontWeight:500, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{text}</span>
                    </div>
                  ))}

                </div>
              )}



              {/* ── CARD ── */}
              <div className="vc-signup-card" style={{ background:pal.card, border:`1px solid ${pal.border}`, borderRadius:16, padding:"16px 18px 16px", ...fu(200) }}>

                {/* Social buttons */}
                <div style={{ display:"flex", gap:10, marginBottom:4 }}>
                  {socialBtn(handleGoogleLogin, isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.85)", isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.12)", isDark ? "#c8dae8" : "#2a2a2a", GOOGLE_SVG, "Google")}
                  {socialBtn(handleFacebook, "#1877F2", "none", "#fff", FB_SVG, "Facebook")}
                </div>

                {siMsg && (
                  <div style={{ fontSize:11, color:GOLD, background:"rgba(212,160,23,0.08)", border:"1px solid rgba(212,160,23,0.18)", borderRadius:7, padding:"8px 12px", marginTop:10, textAlign:"center" }}>
                    {siMsg}
                  </div>
                )}

                {divider}

                {/* ── SIGN UP FORM ── */}
                {tab === "signup" && (
                  <form onSubmit={handleSignUp} style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    <div>
                      <label style={{ fontSize:10, letterSpacing:"1.4px", color:"rgba(212,160,23,0.65)", fontWeight:700, display:"block", marginBottom:4 }}>YOUR NAME</label>
                      <input
                        type="text" value={name} onChange={e => setName(e.target.value)}
                        placeholder="e.g. Arjun Sharma"
                        onFocus={() => setFocused("name")} onBlur={() => setFocused(null)}
                        style={inputStyle("name")}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize:10, letterSpacing:"1.4px", color:"rgba(212,160,23,0.65)", fontWeight:700, display:"block", marginBottom:4 }}>EMAIL ADDRESS</label>
                      <input
                        type="email" value={email} onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
                        style={inputStyle("email")}
                      />
                    </div>
                    {error && <div style={{ fontSize:12, color:"#e07070", background:"rgba(224,112,112,0.08)", border:"1px solid rgba(224,112,112,0.18)", borderRadius:7, padding:"8px 12px" }}>{error}</div>}
                    <button type="submit" className="vc-primary-btn" style={{
                      background:GOLD, color:NAVY, border:"none", borderRadius:10,
                      padding:"11px", fontWeight:800, fontSize:12, letterSpacing:"0.16em",
                      cursor:"pointer", fontFamily:"'DM Sans',sans-serif", marginTop:2,
                      boxShadow:"0 4px 20px rgba(212,160,23,.22)",
                    }}>
                      CREATE FREE ACCOUNT
                    </button>
                    <p style={{ fontSize:10, color:pal.muted, textAlign:"center", margin:"6px 0 0", lineHeight:1.6 }}>
                      No spam. No subscription. No credit card.<br/>
                      By signing up you agree to our{" "}
                      <Link to="/terms" style={{ color:"rgba(212,160,23,0.6)", textDecoration:"none" }}>Terms & Conditions</Link>.
                    </p>
                    <p style={{ fontSize:12, color:pal.muted, textAlign:"center", margin:"10px 0 0" }}>
                      Already a user?{" "}
                      <span onClick={() => setTab("signin")} style={{ color:GOLD, fontWeight:700, cursor:"pointer" }}>
                        Sign in
                      </span>
                    </p>
                  </form>
                )}

                {/* ── SIGN IN FORM ── */}
                {tab === "signin" && (
                  <form onSubmit={handleSignIn} style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    <div>
                      <label style={{ fontSize:10, letterSpacing:"1.4px", color:"rgba(212,160,23,0.65)", fontWeight:700, display:"block", marginBottom:4 }}>EMAIL ADDRESS</label>
                      <input
                        type="email" value={siEmail} onChange={e => setSiEmail(e.target.value)}
                        placeholder="you@example.com"
                        onFocus={() => setFocused("siEmail")} onBlur={() => setFocused(null)}
                        style={inputStyle("siEmail")}
                      />
                    </div>
                    {error && <div style={{ fontSize:12, color:"#e07070", background:"rgba(224,112,112,0.08)", border:"1px solid rgba(224,112,112,0.18)", borderRadius:7, padding:"8px 12px" }}>{error}</div>}
                    <button type="submit" disabled={loading} className="vc-primary-btn" style={{
                      background:GOLD, color:NAVY, border:"none", borderRadius:10,
                      padding:"11px", fontWeight:800, fontSize:12, letterSpacing:"0.16em",
                      cursor: loading ? "not-allowed" : "pointer",
                      fontFamily:"'DM Sans',sans-serif", marginTop:2,
                      opacity: loading ? 0.7 : 1,
                      boxShadow:"0 4px 20px rgba(212,160,23,.22)",
                    }}>
                      {loading ? "SIGNING IN…" : "SIGN IN"}
                    </button>
                    <p style={{ fontSize:12, color:pal.muted, textAlign:"center", margin:"4px 0 0" }}>
                      No account?{" "}
                      <span onClick={() => setTab("signup")} style={{ color:GOLD, fontWeight:700, cursor:"pointer" }}>
                        Create one free
                      </span>
                    </p>
                  </form>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}