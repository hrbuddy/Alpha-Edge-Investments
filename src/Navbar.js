import { Link, useNavigate } from "react-router-dom";
import { useContext, useState, useRef, useEffect } from "react";
import { ThemeContext } from "./App";
import { useAuth } from "./AuthContext";

const GOLD = "#D4A017";
const NAVY = "#0D1B2A";

// ── Searchable items: stocks + pages ───────────────────────────────────────
const SEARCH_ITEMS = [
  // ── Live dashboards ──
  { name:"Info Edge (India) Ltd",   ticker:"NSE: NAUKRI",     path:"/info-edge",     type:"stock",  active:true  },
  { name:"Eicher Motors Ltd",       ticker:"NSE: EICHERMOT",  path:"/eicher-motors", type:"stock",  active:true  },
  { name:"IGI Ltd",                 ticker:"NSE: IGIL",       path:"/igil",          type:"stock",  active:true  },
  // ── Coming soon ──
  { name:"Zomato Ltd",              ticker:"NSE: ZOMATO",     path:null,             type:"stock",  active:false },
  { name:"PB Fintech Ltd",          ticker:"NSE: POLICYBZR",  path:null,             type:"stock",  active:false },
  { name:"Trent Ltd",               ticker:"NSE: TRENT",      path:null,             type:"stock",  active:false },
  { name:"Persistent Systems",      ticker:"NSE: PERSISTENT", path:null,             type:"stock",  active:false },
  { name:"Dixon Technologies",      ticker:"NSE: DIXON",      path:null,             type:"stock",  active:false },
  { name:"Rail Vikas Nigam",        ticker:"NSE: RVNL",       path:null,             type:"stock",  active:false },
  { name:"Suzlon Energy",           ticker:"NSE: SUZLON",     path:null,             type:"stock",  active:false },
  { name:"HDFC Bank Ltd",           ticker:"NSE: HDFCBANK",   path:null,             type:"stock",  active:false },
  // ── Pages ──
  { name:"Home",                    ticker:"Page",            path:"/",              type:"page",   active:true  },
  { name:"Research Universe",       ticker:"Page",            path:"/#universe",     type:"page",   active:true  },
  { name:"Investment Philosophy",   ticker:"Page",            path:"/philosophy",    type:"page",   active:true  },
  { name:"About Us",                ticker:"Page",            path:"/about",         type:"page",   active:true  },
  { name:"Sign Up",                 ticker:"Page",            path:"/signup",        type:"page",   active:true  },
  { name:"Terms & Conditions",      ticker:"Page",            path:"/terms",         type:"page",   active:true  },
];

const NAV_LINKS = [
  { label:"Home",                  path:"/"            },
  { label:"Research Universe",     path:"/#universe"   },
  { label:"Investment Philosophy", path:"/philosophy"  },
  { label:"About Us",              path:"/about"       },
  { label:"Info Edge",             path:"/info-edge"   },
  { label:"Eicher Motors",         path:"/eicher-motors"},
  { label:"IGI Ltd",               path:"/igil"        },
];

export default function Navbar() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user, signOut }      = useAuth();
  const navigate               = useNavigate();
  const isDark                 = theme === "dark";

  const [searchOpen,  setSearchOpen]  = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen,    setMenuOpen]    = useState(false);
  const searchRef      = useRef(null);
  const inputRef       = useRef(null);
  const mobileInputRef = useRef(null);

  useEffect(() => {
    if (searchOpen && inputRef.current)       inputRef.current.focus();
    if (searchOpen && mobileInputRef.current) mobileInputRef.current.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const fn = e => { if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [searchOpen]);

  // Theme-aware colours
  const navBg     = isDark ? "rgba(10,21,36,0.97)"      : "rgba(245,240,232,0.97)";
  const borderCol = isDark ? "rgba(212,160,23,0.14)"     : "rgba(212,160,23,0.25)";
  const ribbonBg  = isDark ? "rgba(8,17,30,0.99)"        : "rgba(238,233,222,0.99)";
  const dropBg    = isDark ? "rgba(10,21,36,0.98)"       : "rgba(245,240,232,0.98)";
  const textCol   = isDark ? "rgba(212,160,23,0.82)"     : "rgba(120,80,0,0.85)";
  const inputText = isDark ? "#c8dae8"                   : "#0D1B2A";
  const inputBg   = isDark ? "rgba(212,160,23,0.08)"     : "rgba(212,160,23,0.1)";

  const filtered = SEARCH_ITEMS.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.ticker.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function handleSelect(item) {
    if (item.active && item.path) navigate(item.path);
    setSearchOpen(false);
    setSearchQuery("");
  }

  function closeSearch() { setSearchOpen(false); setSearchQuery(""); }

  const SearchSVG = ({ size = 13, op = 1 }) => (
    <svg width={size} height={size} viewBox="0 0 13 13" fill="none">
      <circle cx="5.5" cy="5.5" r="4" stroke={GOLD} strokeWidth="1.4" strokeOpacity={op}/>
      <path d="M8.5 8.5L11.5 11.5" stroke={GOLD} strokeWidth="1.4" strokeLinecap="round" strokeOpacity={op}/>
    </svg>
  );

  const ResultsList = () => (
    <div style={{ maxHeight:280, overflowY:"auto" }}>
      {filtered.length === 0 ? (
        <div style={{ padding:"16px", textAlign:"center", fontSize:12, color:"rgba(212,160,23,0.35)", fontFamily:"'DM Sans',sans-serif" }}>No results</div>
      ) : filtered.map(item => (
        <div key={item.name} className="search-result-item" onClick={() => handleSelect(item)}>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:item.active ? (isDark ? "#c8dae8" : "#0D1B2A") : "#3a5068", fontFamily:"'DM Sans',sans-serif" }}>
              {item.name}
            </div>
            <div style={{ fontSize:10, color:"rgba(212,160,23,0.5)", letterSpacing:1, marginTop:1, fontFamily:"'DM Sans',sans-serif" }}>
              {item.type === "page" ? "📄 " : ""}{item.ticker}
            </div>
          </div>
          {item.active
            ? <span style={{ fontSize:9, fontWeight:700, color:GOLD, letterSpacing:1.2, fontFamily:"'DM Sans',sans-serif", background:"rgba(212,160,23,0.1)", padding:"3px 8px", borderRadius:999 }}>GO →</span>
            : <span style={{ fontSize:9, color:"#2a3d52", letterSpacing:1, fontFamily:"'DM Sans',sans-serif" }}>SOON</span>
          }
        </div>
      ))}
    </div>
  );

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@500;700;800&family=Playfair+Display:wght@800&display=swap" rel="stylesheet"/>
      <style>{`
        @keyframes spinOrbit1{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes spinOrbit2{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}
        @keyframes searchDrop{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes menuSlide{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes searchSlideIn{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:translateX(0)}}

        .orbit-ring-1{animation:spinOrbit1 9s linear infinite;transform-origin:50% 50%}
        .orbit-ring-2{animation:spinOrbit2 13s linear infinite;transform-origin:50% 50%}

        /* ── Ribbon nav links — bigger, brighter ── */
        .nav-link{
          font-size:12px;font-weight:700;letter-spacing:1.6px;
          text-decoration:none;font-family:'DM Sans',sans-serif;
          padding:4px 0;transition:color .2s,border-bottom-color .2s;
          border-bottom:1.5px solid transparent;white-space:nowrap;
        }
        .nav-link:hover{border-bottom-color:rgba(212,160,23,0.45);}

        .search-result-item{display:flex;align-items:center;justify-content:space-between;padding:10px 16px;cursor:pointer;transition:background .15s;border-bottom:1px solid rgba(212,160,23,0.06);}
        .search-result-item:hover{background:rgba(212,160,23,0.08);}
        .search-result-item:last-child{border-bottom:none;}

        .hamburger-line{display:block;width:20px;height:1.8px;border-radius:2px;transition:all .25s ease;}

        /* ── DESKTOP ── */
        @media(min-width:641px){
          .hamburger-btn{display:none !important;}
          .mobile-menu{display:none !important;}
          .mobile-search-bar{display:none !important;}
          .mobile-search-results{display:none !important;}
          .search-word{display:inline !important;}
          .logo-wordmark{font-size:17px !important;}
          .logo-sub{font-size:7.5px !important;}
          .logo-svg{width:36px !important;height:36px !important;}
          .nav-btn{border:1px solid rgba(212,160,23,0.2) !important;background:rgba(212,160,23,0.07) !important;}
          .theme-btn-desktop{display:flex !important;}
          .theme-btn-mobile{display:none !important;}
        }
        /* ── MOBILE ── */
        @media(max-width:640px){
          .ribbon-links{display:none !important;}
          .hamburger-btn{display:flex !important;}
          .search-word{display:none !important;}
          .logo-wordmark{font-size:13px !important;letter-spacing:0.2px !important;}
          .logo-sub{font-size:6px !important;letter-spacing:1.8px !important;}
          .logo-svg{width:27px !important;height:27px !important;}
          .nav-btn{border:none !important;background:transparent !important;padding:6px 7px !important;}
          .theme-btn-desktop{display:none !important;}
          .theme-btn-mobile{display:flex !important;}
          .mobile-search-bar{display:flex;position:absolute;top:0;left:0;right:0;height:58px;align-items:center;padding:0 12px;gap:10px;animation:searchSlideIn .2s ease;z-index:20;}
          .mobile-search-results{display:block;position:absolute;top:58px;left:0;right:0;border-top:1px solid rgba(212,160,23,0.1);border-bottom:1px solid rgba(212,160,23,0.12);z-index:20;}
          .desktop-search-dropdown{display:none !important;}
        }
      `}</style>

      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100000, background:navBg, borderBottom:`1px solid ${borderCol}`, backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)" }}>

        {/* ── TOP ROW ── */}
        <div style={{ padding:"0 16px", height:58, display:"flex", alignItems:"center", justifyContent:"space-between", position:"relative" }}>

          {/* Mobile full-width search overlay */}
          {searchOpen && (
            <div className="mobile-search-bar" style={{ background:ribbonBg }}>
              <button onClick={closeSearch} style={{ background:"none", border:"none", cursor:"pointer", padding:"4px 6px 4px 0", display:"flex", alignItems:"center", flexShrink:0 }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M11 4L6 9L11 14" stroke={GOLD} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <input
                ref={mobileInputRef}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search stocks, pages…"
                style={{ flex:1, background:inputBg, border:"none", borderRadius:8, padding:"8px 12px", outline:"none", color:inputText, fontSize:14, fontFamily:"'DM Sans',sans-serif" }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(212,160,23,0.5)", fontSize:20, padding:"0 4px", lineHeight:1, flexShrink:0 }}>×</button>
              )}
            </div>
          )}
          {searchOpen && (
            <div className="mobile-search-results" style={{ background:ribbonBg }}>
              <ResultsList />
            </div>
          )}

          {/* LOGO */}
          <Link to="/" style={{ display:"flex", alignItems:"center", gap:9, textDecoration:"none", flexShrink:0 }}>
            <svg className="logo-svg" width="36" height="36" viewBox="0 0 44 44" fill="none">
              <defs>
                <filter id="navGlow" x="-80%" y="-80%" width="260%" height="260%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="1.4" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
                <filter id="coreGlow" x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="2.2" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
                <radialGradient id="nucG2" cx="40%" cy="30%" r="65%">
                  <stop offset="0%" stopColor="#ffffff"/>
                  <stop offset="40%" stopColor={GOLD}/>
                  <stop offset="100%" stopColor="#9a6e00"/>
                </radialGradient>
                <radialGradient id="eG2" cx="40%" cy="30%" r="60%">
                  <stop offset="0%" stopColor="#ffe8a0"/>
                  <stop offset="100%" stopColor={GOLD}/>
                </radialGradient>
              </defs>
              <ellipse cx="22" cy="22" rx="17" ry="6.2" stroke={GOLD} strokeWidth="1.15" strokeOpacity="0.9" fill="none" filter="url(#navGlow)"/>
              <g className="orbit-ring-1">
                <ellipse cx="22" cy="22" rx="17" ry="6.2" stroke={GOLD} strokeWidth="1.0" strokeOpacity="0.55" fill="none" transform="rotate(60 22 22)"/>
                <circle cx="38.4" cy="17.4" r="2.6" fill="url(#eG2)" filter="url(#navGlow)"/>
              </g>
              <g className="orbit-ring-2">
                <ellipse cx="22" cy="22" rx="17" ry="6.2" stroke={GOLD} strokeWidth="0.85" strokeOpacity="0.32" fill="none" transform="rotate(-60 22 22)"/>
                <circle cx="5.8" cy="27.2" r="2.2" fill={GOLD} fillOpacity="0.65"/>
              </g>
              <circle cx="38.6" cy="22" r="2.4" fill={GOLD} filter="url(#navGlow)"/>
              <g filter="url(#coreGlow)">
                <path d="M22 15.5 L26.2 22 L22 28.5 L17.8 22 Z" fill="url(#nucG2)"/>
                <path d="M22 16.5 L24.8 21.5 L22 24.5 L20 21.5 Z" fill="white" fillOpacity="0.45"/>
              </g>
            </svg>
            <div>
              <div className="logo-wordmark" style={{ fontSize:17, fontWeight:800, letterSpacing:"0.4px", color:GOLD, fontFamily:"'Playfair Display',serif", lineHeight:1 }}>ALPHA EDGE</div>
              <div className="logo-sub" style={{ fontSize:7.5, letterSpacing:"3px", color:"rgba(212,160,23,0.42)", fontFamily:"'DM Sans',sans-serif", fontWeight:700, marginTop:2, textTransform:"uppercase" }}>INVESTMENTS</div>
            </div>
          </Link>

          {/* RIGHT CONTROLS */}
          <div style={{ display:"flex", alignItems:"center", gap:4 }}>

            {/* Search */}
            <div ref={searchRef} style={{ position:"relative" }}>
              <button className="nav-btn" onClick={() => setSearchOpen(o => !o)} style={{ borderRadius:8, padding:"6px 10px", cursor:"pointer", display:"flex", alignItems:"center", gap:5, transition:"background .2s" }}>
                <SearchSVG size={14}/>
                <span className="search-word" style={{ fontSize:11, fontWeight:700, color:textCol, letterSpacing:1, fontFamily:"'DM Sans',sans-serif" }}>SEARCH</span>
              </button>
              {searchOpen && (
                <div className="desktop-search-dropdown" style={{ position:"absolute", top:"calc(100% + 8px)", right:0, width:320, background:dropBg, border:`1px solid ${borderCol}`, borderRadius:12, boxShadow:"0 16px 48px rgba(0,0,0,0.5)", overflow:"hidden", animation:"searchDrop .2s ease", zIndex:10 }}>
                  <div style={{ padding:"10px 14px", borderBottom:`1px solid rgba(212,160,23,0.1)`, display:"flex", alignItems:"center", gap:8 }}>
                    <SearchSVG size={12} op={0.5}/>
                    <input ref={inputRef} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search stocks & pages…" style={{ background:"transparent", border:"none", outline:"none", color:inputText, fontSize:13, width:"100%", fontFamily:"'DM Sans',sans-serif" }}/>
                    {searchQuery && <button onClick={() => setSearchQuery("")} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(212,160,23,0.4)", fontSize:14, padding:0, lineHeight:1 }}>×</button>}
                  </div>
                  <ResultsList />
                </div>
              )}
            </div>

            {/* Theme toggle — desktop */}
            <button className="nav-btn theme-btn-desktop" onClick={toggleTheme} style={{ borderRadius:8, padding:"6px 10px", cursor:"pointer", fontSize:14, display:"flex", alignItems:"center" }}>
              {isDark ? "☀️" : "🌙"}
            </button>

            {/* Sign Up / User — desktop */}
            {user ? (
              <button className="nav-btn theme-btn-desktop" onClick={signOut} style={{ borderRadius:8, padding:"6px 12px", cursor:"pointer", display:"flex", alignItems:"center", gap:6, fontSize:10, fontWeight:700, letterSpacing:"1px", color:"rgba(212,160,23,0.7)", fontFamily:"'DM Sans',sans-serif" }}>
                {user.name.split(" ")[0]} · Sign Out
              </button>
            ) : (
              <Link to="/signup" className="theme-btn-desktop" style={{ borderRadius:8, padding:"6px 14px", background:"rgba(212,160,23,0.12)", border:"1px solid rgba(212,160,23,0.35)", cursor:"pointer", display:"flex", alignItems:"center", fontSize:10, fontWeight:800, letterSpacing:"1.2px", color:GOLD, fontFamily:"'DM Sans',sans-serif", textDecoration:"none" }}>
                SIGN UP
              </Link>
            )}

            {/* Hamburger — mobile */}
            <button className="hamburger-btn nav-btn" onClick={() => setMenuOpen(o => !o)} style={{ borderRadius:8, padding:"8px 8px", cursor:"pointer", flexDirection:"column", gap:4, alignItems:"center", justifyContent:"center" }}>
              <span className="hamburger-line" style={{ background:textCol, ...(menuOpen ? { transform:"rotate(45deg) translate(4px,4px)" } : {}) }}/>
              <span className="hamburger-line" style={{ background:textCol, ...(menuOpen ? { opacity:0 } : {}) }}/>
              <span className="hamburger-line" style={{ background:textCol, ...(menuOpen ? { transform:"rotate(-45deg) translate(4px,-4px)" } : {}) }}/>
            </button>
          </div>
        </div>

        {/* ── SECONDARY RIBBON (desktop) — bigger + brighter ── */}
        <div className="ribbon-links" style={{ borderTop:`1px solid rgba(212,160,23,0.08)`, padding:"0 24px", height:36, display:"flex", alignItems:"center", gap:28, overflowX:"auto", background:"transparent" }}>
          {NAV_LINKS.map(l => (
            <Link key={l.label} to={l.path} className="nav-link" style={{ color:textCol }}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* ── MOBILE DRAWER ── */}
        {menuOpen && (
          <div className="mobile-menu" style={{ borderTop:`1px solid rgba(212,160,23,0.10)`, background:ribbonBg, padding:"4px 0 8px", animation:"menuSlide .25s ease forwards" }}>
            {NAV_LINKS.map(l => (
              <Link key={l.label} to={l.path} className="nav-link" onClick={() => setMenuOpen(false)}
                style={{ display:"block", padding:"13px 24px", fontSize:12, borderBottom:`1px solid rgba(212,160,23,0.06)`, letterSpacing:"1.6px", color:textCol }}>
                {l.label}
              </Link>
            ))}

            <div style={{ padding:"12px 24px", borderTop:`1px solid rgba(212,160,23,0.08)`, marginTop:4 }}>
              {user ? (
                <button onClick={() => { signOut(); setMenuOpen(false); }} style={{ background:"none", border:"1px solid rgba(212,160,23,0.2)", borderRadius:8, padding:"10px 18px", cursor:"pointer", fontSize:11, fontWeight:700, letterSpacing:"1.4px", color:"rgba(212,160,23,0.6)", fontFamily:"'DM Sans',sans-serif", width:"100%" }}>
                  Signed in as {user.name.split(" ")[0]} · SIGN OUT
                </button>
              ) : (
                <Link to="/signup" onClick={() => setMenuOpen(false)} style={{ display:"block", textAlign:"center", background:"rgba(212,160,23,0.92)", color:NAVY, borderRadius:8, padding:"11px 18px", fontSize:11, fontWeight:800, letterSpacing:"1.4px", fontFamily:"'DM Sans',sans-serif", textDecoration:"none" }}>
                  UNLOCK ALL RESEARCH →
                </Link>
              )}
            </div>

            <div className="theme-btn-mobile" style={{ padding:"14px 24px", borderTop:`1px solid rgba(212,160,23,0.08)`, marginTop:4, alignItems:"center", justifyContent:"space-between" }}>
              <span style={{ fontSize:10, fontWeight:700, letterSpacing:"1.6px", color:"rgba(212,160,23,0.55)", fontFamily:"'DM Sans',sans-serif" }}>
                {isDark ? "SWITCH TO LIGHT" : "SWITCH TO DARK"}
              </span>
              <button onClick={() => { toggleTheme(); setMenuOpen(false); }} style={{ background:"rgba(212,160,23,0.08)", border:"1px solid rgba(212,160,23,0.18)", borderRadius:8, padding:"6px 14px", cursor:"pointer", fontSize:15, display:"flex", alignItems:"center", gap:6 }}>
                {isDark ? "☀️" : "🌙"}
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}