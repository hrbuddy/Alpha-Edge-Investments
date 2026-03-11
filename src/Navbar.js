import { Link, useNavigate, useLocation } from "react-router-dom";
import { lsGetWishlist } from "./FlashCard";
import { useStockModal } from "./StockModal";
import { useContext, useState, useRef, useEffect } from "react";
import { ThemeContext } from "./App";
import { useAuth } from "./AuthContext";
import { useAccess } from "./AccessContext";
import { STOCKS, STOCK_ROUTES } from "./dashboards/stocksDB";

const GOLD  = "#D4A017";
const MUTED = "#3d5570";
const NAVY = "#0D1B2A";

const STATIC_PAGES = [
  { name:"Home",                 ticker:"Page", path:"/",                    type:"page", active:true },
  { name:"Research Universe",    ticker:"Page", path:"/research-universe",   type:"page", active:true },
  { name:"Investment Philosophy",ticker:"Page", path:"/philosophy",          type:"page", active:true },
  { name:"About Us",             ticker:"Page", path:"/about",               type:"page", active:true },
  { name:"Sign Up",              ticker:"Page", path:"/signup",              type:"page", active:true },
  { name:"Terms & Conditions",   ticker:"Page", path:"/terms",              type:"page", active:true },
  { name:"Macro Board",          ticker:"Page", path:"/macro",               type:"page", active:true },
  { name:"Quant Hub",             ticker:"Page", path:"/quant",              type:"page", active:true },
  { name:"Momentum Factor",      ticker:"Page", path:"/momentum",           type:"page", active:true },
  { name:"Size Factor",          ticker:"Page", path:"/size",               type:"page", active:true },
  { name:"Value Factor",         ticker:"Page", path:"/value",              type:"page", active:true },
  { name:"Discover Stocks",      ticker:"Page", path:"/discover",            type:"page", active:true },
];

const SEARCH_ITEMS = [
  ...STOCK_ROUTES.map(({ path, stockId }) => ({
    name:   STOCKS[stockId].name,
    ticker: `NSE: ${STOCKS[stockId].nse}`,
    path,
    type:   "stock",
    active: true,
  })),
  ...STATIC_PAGES,
];

const QUANT_SUB_LINKS = [
  { label:"Momentum", icon:"🚀", path:"/momentum", live:true  },
  { label:"Value",    icon:"💎", path:"/value",    live:true  },
  { label:"Size",     icon:"📐", path:"/size",     live:true  },
  { label:"Quality",  icon:"🔬", path:"/quant",    live:false },
  { label:"Growth",   icon:"📈", path:"/quant",    live:false },
];


const ABOUT_SUB_LINKS = [
  { label:"About Us",              icon:"👥", path:"/about"       },
  { label:"Investment Philosophy", icon:"📖", path:"/philosophy"  },
  { label:"Terms & Conditions",    icon:"📋", path:"/terms"       },
];

// Mobile quick-nav destinations — Home, Stocks, Momentum, Macro, Discover
// Borders only appear when the user is ON that tab (handled via useLocation below)
const MOBILE_QUICK_NAV = [
  { label:"Home",      icon:"🏠", path:"/",                  active:true,  highlight:false },
  { label:"Stocks",    icon:"📈", path:"/research-universe", active:true,  highlight:true  },
  { label:"Quant",     icon:"π",  path:"/quant",             active:true,  highlight:false },
  { label:"Macro",     icon:"📊", path:"/macro",             active:true,  highlight:false },
  { label:"Portfolio", icon:"🗂️", path:"/my-portfolio",      active:true,  highlight:false },
  { label:"Discover",  icon:"⚡", path:"/discover",          active:true,  highlight:false },
];

export default function Navbar() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user, signOut }      = useAuth();
  const { isPaid }             = useAccess();
  const { openModal }            = useStockModal();
  const navigate               = useNavigate();
  const location               = useLocation();
  const isDark                 = theme === "dark";

  const [searchOpen,        setSearchOpen]        = useState(false);
  const [wishlistCount,     setWishlistCount]     = useState(() => { try { return lsGetWishlist().length; } catch { return 0; } });
  const [scrollY,            setScrollY]            = useState(0);
  const [wishlistOpen,      setWishlistOpen]      = useState(false);
  const [wishlistItems,     setWishlistItems]     = useState([]);

  // ── Desktop sidebar ──
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try { return localStorage.getItem('vc-sidebar-open') !== 'false'; } catch { return true; }
  });
  const toggleSidebar = () => setSidebarOpen(o => {
    const next = !o;
    try { localStorage.setItem('vc-sidebar-open', String(next)); } catch {}
    return next;
  });

  // Desktop sidebar nav state
  const [deskResearchOpen,  setDeskResearchOpen]  = useState(false);
  const [deskPortfolioOpen, setDeskPortfolioOpen] = useState(false);
  const [deskQuantOpen,     setDeskQuantOpen]     = useState(false);
  const [deskAboutOpen,     setDeskAboutOpen]     = useState(false);
  const [deskStocksOpen,    setDeskStocksOpen]    = useState(false);

  // Refresh wishlist count on focus (user may have swiped in another tab)
  useEffect(() => {
    const refresh = () => { try { setWishlistCount(lsGetWishlist().length); } catch {} };
    window.addEventListener('focus', refresh);
    window.addEventListener('wishlist-updated', refresh);
    return () => { window.removeEventListener('focus', refresh); window.removeEventListener('wishlist-updated', refresh); };
  }, []);
  const [searchQuery,       setSearchQuery]        = useState("");
  const [menuOpen,          setMenuOpen]           = useState(false);
  const [stocksOpen,        setStocksOpen]         = useState(false);
  const [mobileStocksOpen,  setMobileStocksOpen]   = useState(false);
  const [mobilePortfolioOpen, setMobilePortfolioOpen] = useState(false);
  const [mobileResearchOpen,  setMobileResearchOpen]  = useState(false);
  const [quantOpen,        setQuantOpen]        = useState(false);
  const [mobileQuantOpen,  setMobileQuantOpen]  = useState(false);
  const [aboutOpen,        setAboutOpen]        = useState(false);
  const [mobileAboutOpen,  setMobileAboutOpen]  = useState(false);
  const stocksRef  = useRef(null);
  const menuRef    = useRef(null);
  const quantRef   = useRef(null);
  const aboutRef   = useRef(null);
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

  useEffect(() => {
    if (!stocksOpen) return;
    const fn = e => { if (stocksRef.current && !stocksRef.current.contains(e.target)) setStocksOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [stocksOpen]);


  useEffect(() => {
    if (!quantOpen) return;
    const fn = e => { if (quantRef.current && !quantRef.current.contains(e.target)) setQuantOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [quantOpen]);
  useEffect(() => {
    if (!aboutOpen) return;
    const fn = e => { if (aboutRef.current && !aboutRef.current.contains(e.target)) setAboutOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [aboutOpen]);
  useEffect(() => {
    if (!menuOpen) return;
    const fn = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", fn);
    document.addEventListener("touchstart", fn);
    return () => { document.removeEventListener("mousedown", fn); document.removeEventListener("touchstart", fn); };
  }, [menuOpen]);

  // Push page content right on desktop when sidebar opens/closes
  useEffect(() => {
    const SIDEBAR_W = sidebarOpen ? 240 : 60;
    const update = () => {
      if (window.innerWidth > 640) {
        document.body.style.paddingLeft = `${SIDEBAR_W}px`;
        document.body.style.transition = 'padding-left 0.25s cubic-bezier(0.4,0,0.2,1)';
        document.documentElement.style.setProperty('--sidebar-w', `${SIDEBAR_W}px`);
      } else {
        document.body.style.paddingLeft = '';
        document.documentElement.style.removeProperty('--sidebar-w');
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [sidebarOpen]);

  // scroll-to-top tracking
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navBg     = isDark ? "rgba(10,21,36,0.97)"  : "rgba(248,247,244,0.97)";
  const borderCol = isDark ? "rgba(212,160,23,0.14)" : "rgba(184,135,10,0.18)";
  const ribbonBg  = isDark ? "rgba(8,17,30,0.99)"   : "rgba(240,237,230,0.99)";
  const dropBg    = isDark ? "rgba(10,21,36,0.98)"  : "#FFFFFF";
  const textCol   = isDark ? "rgba(212,160,23,0.82)" : "#1E3A52";
  const inputText = isDark ? "#c8dae8"               : "#0D1B2A";
  const inputBg   = isDark ? "rgba(212,160,23,0.08)" : "rgba(212,160,23,0.1)";
  const qnavBg    = isDark ? "rgba(10,21,36,0.96)"  : "rgba(240,237,230,0.97)";

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const filtered = SEARCH_ITEMS.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.ticker.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function handleSelect(item) {
    if (!item.active) return;
    if (item.path) navigate(item.path);
    setSearchOpen(false);
    setSearchQuery("");
    setMenuOpen(false);
  }
  function closeSearch() { setSearchOpen(false); setSearchQuery(""); }

  const SearchSVG = ({ size = 13, op = 1 }) => (
    <svg width={size} height={size} viewBox="0 0 13 13" fill="none">
      <circle cx="5.5" cy="5.5" r="4" stroke={isDark?GOLD:"#B8870A"} strokeWidth="1.4" strokeOpacity={op}/>
      <path d="M8.5 8.5L11.5 11.5" stroke={isDark?GOLD:"#B8870A"} strokeWidth="1.4" strokeLinecap="round" strokeOpacity={op}/>
    </svg>
  );

  const ResultsList = () => (
    <div style={{ maxHeight:280, overflowY:"auto" }}>
      {filtered.length === 0 ? (
        <div style={{ padding:"16px", textAlign:"center", fontSize:12, color: isDark ? "rgba(212,160,23,0.35)" : "#4A6B82", fontFamily:"'DM Sans',sans-serif" }}>No results</div>
      ) : filtered.map(item => (
        <div key={item.name} className="search-result-item" onMouseDown={e => e.stopPropagation()} onClick={() => handleSelect(item)}>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:item.active ? (isDark ? "#c8dae8" : "#0D1B2A") : "#3a5068", fontFamily:"'DM Sans',sans-serif" }}>
              {item.name}
            </div>
            <div style={{ fontSize:10, color: isDark ? "rgba(212,160,23,0.5)" : "#4A6B82", letterSpacing:1, marginTop:1, fontFamily:"'DM Sans',sans-serif" }}>
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

        .nav-link{
          font-size:13px;font-weight:700;letter-spacing:1.4px;
          text-decoration:none;font-family:'DM Sans',sans-serif;
          padding:4px 0;transition:color .2s,border-bottom-color .2s;
          border-bottom:1.5px solid transparent;white-space:nowrap;
        }
        .nav-link:hover{border-bottom-color:rgba(212,160,23,0.45);}

        .search-result-item{display:flex;align-items:center;justify-content:space-between;padding:10px 16px;cursor:pointer;transition:background .15s;border-bottom:1px solid rgba(212,160,23,0.06);}
        .search-result-item:hover{background:rgba(212,160,23,0.08);}
        .search-result-item:last-child{border-bottom:none;}

        .hamburger-line{display:block;width:22px;height:2px;border-radius:2px;transition:all .25s ease;}

        /* ── Mobile Quick-Nav strip — hidden on desktop ── */
        .mob-qnav {
          display: none;
          gap: 2px;
          padding: 4px 4px 5px;
          border-top: 1px solid rgba(13,27,42,0.08);
        }
        .mob-qnav-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          padding: 4px 2px 3px;
          border-radius: 7px;
          text-decoration: none;
          transition: background .18s;
          -webkit-tap-highlight-color: transparent;
        }
        .mob-qnav-item:active { opacity: 0.7; }
        .mob-qnav-icon { font-size: 13px; line-height: 1; height: 16px; display: flex; align-items: center; justify-content: center; }
          .mob-qnav-pi { font-size: 15px !important; font-weight: 900; font-family: serif; line-height: 1; }
        .mob-qnav-label {
          font-size: 6.5px; font-weight: 800; letter-spacing: 0.4px;
          font-family: 'DM Sans', sans-serif; white-space: nowrap;
        }

        /*
          .ae-page-root — apply this class to the root <div> of every page.
          On mobile, the nav is taller (top row 58px + quick-nav strip ~52px = 110px).
          On desktop, the nav is 58px + 38px ribbon = 96px, same as current paddingTop.
        */
        @media(max-width:640px){
          .ae-page-root { padding-top: 104px !important; }
          .mob-qnav { display: flex !important; }
        }

        /* Reduce the large top-padding on every page's header section */
        .ae-page-header { padding-top: 20px !important; }

        /* ── Sidebar tooltip ── */
        .sb-link:hover .sb-tooltip { opacity: 1 !important; pointer-events: none; }
        .sb-tooltip {
          position: absolute; left: calc(100% + 10px); top: 50%; transform: translateY(-50%);
          background: rgba(6,14,26,0.97); color: #D4A017;
          padding: 5px 10px; border-radius: 7px;
          font-size: 11px; font-weight: 700; letter-spacing: 1px;
          white-space: nowrap; border: 1px solid rgba(212,160,23,0.25);
          font-family: 'DM Sans', sans-serif; z-index: 999999;
          opacity: 0; transition: opacity .15s;
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        }
        .sb-scroll::-webkit-scrollbar { width: 3px; }
        .sb-scroll::-webkit-scrollbar-track { background: transparent; }
        .sb-scroll::-webkit-scrollbar-thumb { background: rgba(212,160,23,0.2); border-radius: 3px; }
        .sb-scroll::-webkit-scrollbar-thumb:hover { background: rgba(212,160,23,0.4); }
        .sb-section-label {
          font-size: 8px; font-weight: 800; letter-spacing: 2px;
          color: rgba(212,160,23,0.3); font-family: 'DM Sans', sans-serif;
          padding: 10px 18px 4px; text-transform: uppercase;
        }

        /* ── DESKTOP ── */
        @media(min-width:641px){
          .hamburger-btn{display:none !important;}
          .mobile-menu{display:none !important;}
          .mobile-search-bar{display:none !important;}
          .mobile-search-results{display:none !important;}
          .search-word{display:inline !important;}
          .logo-wordmark{font-size:17px !important; letter-spacing:2px !important;}
          .logo-sub{font-size:6.5px !important; letter-spacing:2.5px !important;}
          .logo-svg{width:28px !important;height:28px !important;}
          .nav-btn{border:1px solid rgba(212,160,23,0.2) !important;background:rgba(212,160,23,0.07) !important;}
          .nav-btn-light{border:1px solid rgba(13,27,42,0.10) !important;background:transparent !important;}
          .theme-btn-desktop{display:flex !important;}
          .theme-btn-mobile{display:none !important;}
          /* Hide ribbon — sidebar replaces it on desktop */
          .ribbon-links{display:none !important;}
          /* Show desktop sidebar */
          .desktop-sidebar{display:flex !important;}
          /* Page content shifts right with sidebar — handled via body.paddingLeft in useEffect */
        }
        /* ── MOBILE ── */
        @media(max-width:640px){
          .ribbon-links{display:none !important;}
          .hamburger-btn{display:flex !important;}
          .search-word{display:none !important;}
          .logo-wordmark{font-size:14px !important;letter-spacing:1.5px !important;}
          .logo-sub{font-size:0px !important;}
          .logo-svg{width:22px !important;height:22px !important;}
          .nav-btn{border:none !important;background:transparent !important;padding:6px 7px !important;}
          .theme-btn-desktop{display:none !important;}
          .theme-btn-mobile{display:flex !important;}
          .mobile-search-bar{display:flex;position:absolute;top:0;left:0;right:0;height:58px;align-items:center;padding:0 12px;gap:10px;animation:searchSlideIn .2s ease;z-index:20;background:inherit;}
          .mobile-search-results{display:block;position:absolute;top:58px;left:0;right:0;border-top:1px solid rgba(13,27,42,0.08);border-bottom:1px solid rgba(13,27,42,0.08);z-index:20;}
          .desktop-search-dropdown{display:none !important;}
          .desktop-sidebar{display:none !important;}
        }
      `}</style>

      <nav ref={menuRef} style={{ position:"fixed", top:0, left:0, right:0, zIndex:100000, background:navBg, borderBottom:`1px solid ${borderCol}`, backdropFilter: isDark ? "blur(20px)" : "none", WebkitBackdropFilter: isDark ? "blur(20px)" : "none" }}>

        {/* ── TOP ROW ── */}
        <div style={{ padding:"0 16px", height:58, display:"flex", alignItems:"center", justifyContent:"space-between", position:"relative" }}>

          {/* Mobile full-width search overlay */}
          {searchOpen && (
            <div className="mobile-search-bar" style={{ background:ribbonBg }}>
              <button onClick={closeSearch} style={{ background:"none", border:"none", cursor:"pointer", padding:"4px 6px 4px 0", display:"flex", alignItems:"center", flexShrink:0 }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M11 4L6 9L11 14" stroke={isDark?GOLD:"#B8870A"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
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
              {ResultsList()}
            </div>
          )}

          {/* LOGO */}
          <Link to="/" style={{ display:"flex", alignItems:"center", gap:8, textDecoration:"none", flexShrink:0 }}>
            <svg className="logo-svg" width="28" height="28" viewBox="0 0 44 44" fill="none">
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
                  <stop offset="40%" stopColor={isDark?GOLD:"#0D1B2A"}/>
                  <stop offset="100%" stopColor={isDark?"#9a6e00":"#1E3A52"}/>
                </radialGradient>
                <radialGradient id="eG2" cx="40%" cy="30%" r="60%">
                  <stop offset="0%" stopColor={isDark?"#ffe8a0":"#4A6B82"}/>
                  <stop offset="100%" stopColor={isDark?GOLD:"#0D1B2A"}/>
                </radialGradient>
              </defs>
              <ellipse cx="22" cy="22" rx="17" ry="6.2" stroke={isDark?GOLD:"#B8870A"} strokeWidth="1.15" strokeOpacity="0.5" fill="none" filter="url(#navGlow)"/>
              <g className="orbit-ring-1">
                <ellipse cx="22" cy="22" rx="17" ry="6.2" stroke={isDark?GOLD:"#B8870A"} strokeWidth="1.0" strokeOpacity="0.35" fill="none" transform="rotate(60 22 22)"/>
                <circle cx="38.4" cy="17.4" r="2.6" fill="url(#eG2)" filter="url(#navGlow)"/>
              </g>
              <g className="orbit-ring-2">
                <ellipse cx="22" cy="22" rx="17" ry="6.2" stroke={isDark?GOLD:"#B8870A"} strokeWidth="0.85" strokeOpacity="0.2" fill="none" transform="rotate(-60 22 22)"/>
                <circle cx="5.8" cy="27.2" r="2.2" fill={isDark?GOLD:"#0D1B2A"} fillOpacity={isDark?0.65:0.4}/>
              </g>
              <circle cx="38.6" cy="22" r="2.4" fill={isDark?GOLD:"#0D1B2A"} filter="url(#navGlow)"/>
              <g filter="url(#coreGlow)">
                <path d="M22 15.5 L26.2 22 L22 28.5 L17.8 22 Z" fill="url(#nucG2)"/>
                <path d="M22 16.5 L24.8 21.5 L22 24.5 L20 21.5 Z" fill="white" fillOpacity="0.45"/>
              </g>
            </svg>
            <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
              <div className="logo-wordmark" style={{ fontSize:17, fontWeight:800, letterSpacing:"2px", color:isDark ? GOLD : "#B8870A", fontFamily:"'Playfair Display',serif", lineHeight:1.05 }}>VANTAGE</div>
              <div className="logo-wordmark" style={{ fontSize:17, fontWeight:800, letterSpacing:"2px", color:isDark ? GOLD : "#B8870A", fontFamily:"'Playfair Display',serif", lineHeight:1.05 }}>CAPITAL</div>
              <div className="logo-sub" style={{ fontSize:6.5, letterSpacing:"2.5px", color: isDark ? "rgba(212,160,23,0.35)" : "rgba(13,27,42,0.35)", fontFamily:"'DM Sans',sans-serif", fontWeight:700, marginTop:2, textTransform:"uppercase" }}>INVESTMENTS</div>
            </div>
          </Link>

          {/* RIGHT CONTROLS */}
          <div style={{ display:"flex", alignItems:"center", gap:4 }}>

            {/* Wishlist — mobile only, before search */}
            <button onClick={() => {
                const tickers = lsGetWishlist();
                setWishlistItems(tickers);
                setWishlistOpen(true);
              }} className="hamburger-btn"
              style={{ alignItems:"center", justifyContent:"center", position:"relative", borderRadius:8, padding:"6px 8px", background:"none", border:"none", color:isDark?GOLD:"#B8870A", cursor:"pointer" }}
              title="Saved stocks">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isDark?GOLD:"#B8870A"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              {wishlistCount > 0 && (
                <span style={{ position:"absolute", top:2, right:2, minWidth:16, height:16, borderRadius:8, background: isDark ? GOLD : "#0D1B2A", color: isDark ? "#0D1B2A" : "#FFFFFF", fontSize:9, fontWeight:900, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 3px", lineHeight:1 }}>
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Search */}
            <div ref={searchRef} style={{ position:"relative" }}>
              <button className="nav-btn" onClick={() => setSearchOpen(o => !o)} style={{ borderRadius:8, padding:"6px 10px", cursor:"pointer", display:"flex", alignItems:"center", gap:5, transition:"background .2s" }}>
                <SearchSVG size={20}/>
                <span className="search-word" style={{ fontSize:11, fontWeight:700, color:textCol, letterSpacing:"0.08em", fontFamily:"'DM Sans',sans-serif" }}>Search</span>
              </button>
              {searchOpen && (
                <div className="desktop-search-dropdown" style={{ position:"absolute", top:"calc(100% + 8px)", right:0, width:320, background:dropBg, border:`1px solid ${borderCol}`, borderRadius:12, boxShadow:"0 16px 48px rgba(0,0,0,0.5)", overflow:"hidden", animation:"searchDrop .2s ease", zIndex:10 }}>
                  <div style={{ padding:"10px 14px", borderBottom:`1px solid rgba(212,160,23,0.1)`, display:"flex", alignItems:"center", gap:8 }}>
                    <SearchSVG size={20} op={0.5}/>
                    <input ref={inputRef} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search stocks & pages…" style={{ background:"transparent", border:"none", outline:"none", color:inputText, fontSize:13, width:"100%", fontFamily:"'DM Sans',sans-serif" }}/>
                    {searchQuery && <button onClick={() => setSearchQuery("")} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(212,160,23,0.4)", fontSize:14, padding:0, lineHeight:1 }}>×</button>}
                  </div>
                  {ResultsList()}
                </div>
              )}
            </div>

            {/* Theme toggle — desktop */}
            <button className="nav-btn theme-btn-desktop" onClick={toggleTheme} style={{ borderRadius:8, padding:"6px 10px", cursor:"pointer", fontSize:14, display:"flex", alignItems:"center" }}>
              {isDark ? "☀️" : "🌙"}
            </button>

            {/* Sign Up / User — desktop */}
            {user ? (
              <div className="theme-btn-desktop" style={{ display:"flex", alignItems:"center", gap:6 }}>
                <button onClick={() => navigate("/profile")}
                  style={{ borderRadius:8, padding:"6px 10px", cursor:"pointer", display:"flex", alignItems:"center", gap:5, fontSize:10, fontWeight:700, letterSpacing:"1px", color: isDark ? (isPaid ? GOLD : "rgba(212,160,23,0.7)") : "#0D1B2A", fontFamily:"'DM Sans',sans-serif", background:"none", border:"none" }}>
                  {isPaid && <span style={{ fontSize:10 }}>★</span>}
                  {user.name.split(" ")[0]}
                </button>
                {!isPaid && (
                  <button onClick={() => navigate("/upgrade")} style={{ borderRadius:99, padding:"5px 11px", cursor:"pointer", fontSize:9, fontWeight:800, letterSpacing:"1.2px", color:NAVY, background:GOLD, border:"none", fontFamily:"'DM Sans',sans-serif" }}>
                    UPGRADE
                  </button>
                )}
                <button onClick={signOut} style={{ borderRadius:8, padding:"6px 8px", cursor:"pointer", fontSize:10, fontWeight:600, color:"rgba(90,122,148,0.8)", fontFamily:"'DM Sans',sans-serif", background:"none", border:"none" }}>
                  Sign Out
                </button>
              </div>
            ) : (
              <Link to="/signup" className="theme-btn-desktop" style={{ borderRadius:8, padding:"6px 14px", background: isDark ? "rgba(212,160,23,0.12)" : GOLD, border: isDark ? "1px solid rgba(212,160,23,0.35)" : "none", cursor:"pointer", display:"flex", alignItems:"center", fontSize:10, fontWeight:800, letterSpacing:"1.2px", color: isDark ? GOLD : NAVY, fontFamily:"'DM Sans',sans-serif", textDecoration:"none" }}>
                SIGN UP
              </Link>
            )}

            {/* Account icon / close — mobile */}
            <button className="hamburger-btn nav-btn" onClick={() => setMenuOpen(o => !o)}
              style={{ borderRadius:"50%", width:38, height:38, padding:0, cursor:"pointer",
                alignItems:"center", justifyContent:"center",
                background: user
                ? (menuOpen
                    ? (isDark ? "rgba(212,160,23,0.15)" : "rgba(184,135,10,0.12)")
                    : (isDark ? "rgba(212,160,23,0.12)" : "rgba(184,135,10,0.08)"))
                : (isDark ? "rgba(255,255,255,0.06)" : "rgba(13,27,42,0.06)"),
                border: user
                  ? `1.5px solid ${menuOpen ? (isDark ? GOLD : "#B8870A") : (isDark ? "rgba(212,160,23,0.5)" : "rgba(184,135,10,0.35)")}`
                  : `1.5px solid ${isDark ? "rgba(255,255,255,0.15)" : "rgba(13,27,42,0.15)"}`,
                transition:"all .2s ease",
              }}>
              {menuOpen ? (
                <span style={{ fontSize:18, color:isDark?GOLD:"#B8870A", lineHeight:1, fontWeight:300 }}>×</span>
              ) : user ? (
                <span style={{ fontSize:14, fontWeight:800, color:isDark?GOLD:"#B8870A", fontFamily:"'DM Sans',sans-serif", lineHeight:1 }}>
                  {user.name.charAt(0).toUpperCase()}
                </span>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isDark?GOLD:"#B8870A"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* ── MOBILE QUICK-NAV STRIP — only shows on mobile (≤640px) ── */}
        <div className="mob-qnav" style={{ background:qnavBg }}>
          {MOBILE_QUICK_NAV.map(item => {
            const isCurrentRoute = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.active ? item.path : "#"}
                onClick={e => { if (!item.active) e.preventDefault(); setMenuOpen(false); }}
                className="mob-qnav-item"
                style={{
                  background:   isCurrentRoute ? "rgba(212,160,23,0.16)" : "transparent",
                  border:       isCurrentRoute
                    ? `1px solid rgba(212,160,23,0.55)`
                    : "1px solid transparent",
                  opacity:      item.active ? 1 : 0.38,
                  cursor:       item.active ? "pointer" : "default",
                  position:     "relative",
                }}
              >
                {item.highlight && !isCurrentRoute && (
                  <span style={{ position:"absolute", top:-4, right:-4, width:8, height:8, borderRadius:"50%", background:"#27AE60", border:"1.5px solid " + (isDark ? "#0a1628" : "#F8F7F4"), boxShadow:"0 0 6px #27AE60" }}/>
                )}
                <span className={item.icon === "π" ? "mob-qnav-icon mob-qnav-pi" : "mob-qnav-icon"} style={item.icon === "π" ? { color: isDark ? "#ffffff" : "#B8870A" } : {}}>{item.icon}</span>
                <span className="mob-qnav-label" style={{ color: isCurrentRoute ? (isDark ? GOLD : "#B8870A") : item.highlight ? (isDark ? "rgba(212,160,23,0.75)" : "#B8870A") : item.active ? (isDark ? GOLD : "#B8870A") : textCol, fontWeight: isCurrentRoute ? 800 : item.highlight ? 800 : 700 }}>
                  {item.label}
                  {item.highlight && !isCurrentRoute && <span style={{ fontSize:6, marginLeft:3, color:"#27AE60", letterSpacing:"0.5px" }}>NEW</span>}
                </span>
              </Link>
            );
          })}
        </div>

        {/* ── SECONDARY RIBBON (desktop only) ── */}
        <div className="ribbon-links" style={{ borderTop:`1px solid rgba(212,160,23,0.08)`, padding:"0 24px", height:38, display:"flex", alignItems:"center", justifyContent:"center", gap:32, overflowX:"visible", background:"transparent", position:"relative", zIndex:200000 }}>

          {/* Home */}
          <Link to="/" className="nav-link" style={{ color:textCol }}>Home</Link>

          {/* Research Universe */}
          <Link to="/research-universe" className="nav-link" style={{ color:textCol }}>Research Universe</Link>

          {/* Portfolio Simulator */}
          <Link to="/portfolio" className="nav-link" style={{ color:textCol }}>Portfolio Simulator</Link>

          {/* Quant dropdown */}
          <div ref={quantRef} style={{ position:"relative" }}>
            <button onClick={() => setQuantOpen(o => !o)} className="nav-link"
              style={{ background:"none", border:"none", cursor:"pointer", color: quantOpen ? (isDark ? GOLD : "#B8870A") : textCol, display:"flex", alignItems:"center", gap:4, fontFamily:"inherit", fontSize:"inherit", fontWeight:"inherit", padding:0 }}>
              Quant Hub
              <span style={{ fontSize:9, transition:"transform .2s", display:"inline-block", transform: quantOpen ? "rotate(90deg)" : "rotate(0deg)", marginLeft:2 }}>▶</span>
            </button>
            {quantOpen && (
              <div style={{ position:"absolute", top:"calc(100% + 10px)", left:0, minWidth:180, background: isDark ? "rgba(6,14,26,0.98)" : "rgba(255,255,255,0.99)", border:`1px solid rgba(212,160,23,0.18)`, borderRadius:10, boxShadow:"0 8px 32px rgba(0,0,0,0.4)", backdropFilter:"blur(12px)", overflow:"hidden", zIndex:99999 }}>
                <Link to="/quant" onClick={() => setQuantOpen(false)}
                  style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 16px", borderBottom:`1px solid rgba(212,160,23,0.10)`, textDecoration:"none", background:"transparent" }}
                  onMouseEnter={e => e.currentTarget.style.background="rgba(212,160,23,0.07)"}
                  onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                  <span style={{ fontSize:14, fontWeight:900, color:isDark ? GOLD : "#B8870A", fontFamily:"serif" }}>π</span>
                  <span style={{ fontSize:11, fontWeight:800, color:isDark ? GOLD : "#0D1B2A", letterSpacing:"0.5px" }}>Quant Hub</span>
                </Link>
                {QUANT_SUB_LINKS.map(q => (
                  <Link key={q.label} to={q.path} onClick={() => { if(q.live) setQuantOpen(false); }}
                    style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 16px", borderBottom:`1px solid rgba(255,255,255,0.04)`, textDecoration:"none", opacity: q.live ? 1 : 0.4, pointerEvents: q.live ? "auto" : "none", background:"transparent" }}
                    onMouseEnter={e => { if(q.live) e.currentTarget.style.background="rgba(212,160,23,0.07)"; }}
                    onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                    <span style={{ fontSize:11, fontWeight:700, color: isDark ? "#c8dae8" : "#1a2e42" }}>{q.label}</span>
                    {!q.live && <span style={{ fontSize:8, fontWeight:800, color:MUTED, letterSpacing:"1px", marginLeft:"auto" }}>SOON</span>}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Macro */}
          <Link to="/macro" className="nav-link" style={{ color:textCol }}>Macro</Link>

          {/* About Us dropdown */}
          <div ref={aboutRef} style={{ position:"relative" }}>
            <button onClick={() => setAboutOpen(o => !o)} className="nav-link"
              style={{ background:"none", border:"none", cursor:"pointer", color: aboutOpen ? (isDark ? GOLD : "#B8870A") : textCol, display:"flex", alignItems:"center", gap:4, fontFamily:"inherit", fontSize:"inherit", fontWeight:"inherit", padding:0 }}>
              About Us
              <span style={{ fontSize:9, transition:"transform .2s", display:"inline-block", transform: aboutOpen ? "rotate(90deg)" : "rotate(0deg)", marginLeft:2 }}>▶</span>
            </button>
            {aboutOpen && (
              <div style={{ position:"absolute", top:"calc(100% + 10px)", left:0, minWidth:200, background: isDark ? "rgba(6,14,26,0.98)" : "rgba(255,255,255,0.99)", border:`1px solid rgba(212,160,23,0.18)`, borderRadius:10, boxShadow:"0 8px 32px rgba(0,0,0,0.4)", backdropFilter:"blur(12px)", overflow:"hidden", zIndex:99999 }}>
                {ABOUT_SUB_LINKS.map(a => (
                  <Link key={a.label} to={a.path} onClick={() => setAboutOpen(false)}
                    style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 16px", borderBottom:`1px solid rgba(255,255,255,0.04)`, textDecoration:"none", background:"transparent" }}
                    onMouseEnter={e => e.currentTarget.style.background="rgba(212,160,23,0.07)"}
                    onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                    <span style={{ fontSize:11, fontWeight:700, color: isDark ? "#c8dae8" : "#1a2e42" }}>{a.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* All Stocks dropdown */}
          <div ref={stocksRef} style={{ position:"relative" }}>
            <button onClick={() => setStocksOpen(o => !o)} className="nav-link"
              style={{ background:"none", border:"none", cursor:"pointer", color:stocksOpen ? (isDark ? GOLD : "#B8870A") : textCol, display:"flex", alignItems:"center", gap:5, padding:0 }}>
              All Stocks
              <span style={{ fontSize:9, transition:"transform .2s", display:"inline-block", transform:stocksOpen?"rotate(90deg)":"rotate(0deg)" }}>▶</span>
            </button>
            {stocksOpen && (
              <div style={{ position:"absolute", top:"calc(100% + 10px)", left:0, minWidth:240, background:dropBg, border:`1px solid ${borderCol}`, borderRadius:10, boxShadow:"0 16px 40px rgba(0,0,0,0.55)", overflow:"hidden", animation:"searchDrop .2s ease", zIndex:999999 }}>
                {STOCK_ROUTES.map(({ path, stockId }) => {
                  const s = STOCKS[stockId];
                  return (
                    <Link key={stockId} to={path} onClick={() => setStocksOpen(false)}
                      style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 16px", textDecoration:"none", borderBottom:`1px solid rgba(212,160,23,0.07)`, transition:"background .15s" }}
                      onMouseEnter={e => e.currentTarget.style.background="rgba(212,160,23,0.06)"}
                      onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                      <div>
                        <div style={{ fontSize:12, fontWeight:700, color: isDark ? "#c8dae8" : "#0D1B2A", fontFamily:"'DM Sans',sans-serif" }}>{s.name}</div>
                        <div style={{ fontSize:9, color: isDark ? "rgba(212,160,23,0.55)" : "#4A6B82", letterSpacing:1, marginTop:1, fontFamily:"'DM Sans',sans-serif" }}>NSE: {s.nse}</div>
                      </div>
                      <span style={{ fontSize:9, fontWeight:700, color: isDark ? GOLD : "#B8870A", background: isDark ? "rgba(212,160,23,0.12)" : "rgba(184,135,10,0.08)", padding:"3px 10px", borderRadius:999, letterSpacing:1, fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap", flexShrink:0, display:"inline-flex", alignItems:"center" }}>GO →</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── MOBILE DRAWER ── */}
        {menuOpen && (
          <div className="mobile-menu" style={{ borderTop:`1px solid ${isDark ? "rgba(212,160,23,0.10)" : "rgba(13,27,42,0.08)"}`, background:ribbonBg, padding:"0 0 8px", boxShadow:"0 8px 32px rgba(0,0,0,0.5)", animation:"menuSlide .25s ease forwards" }}>

            {/* ── SIGNED IN: name + profile at top ── */}
            {user && (
              <div style={{ padding:"16px 20px 14px", borderBottom:`1px solid ${isDark ? 'rgba(212,160,23,0.12)' : 'rgba(13,27,42,0.07)'}` }}>
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
                  <div style={{ width:40, height:40, borderRadius:"50%", flexShrink:0,
                    background: isDark ? "rgba(212,160,23,0.12)" : "rgba(13,27,42,0.07)",
                    border: isDark ? "1.5px solid rgba(212,160,23,0.5)" : "1.5px solid rgba(13,27,42,0.2)",
                    display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <span style={{ fontSize:16, fontWeight:800, color: isDark ? GOLD : "#0D1B2A", fontFamily:"'DM Sans',sans-serif" }}>
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:textCol, fontFamily:"'DM Sans',sans-serif" }}>{user.name}</div>
                    <div style={{ fontSize:10, color: isDark ? "rgba(212,160,23,0.5)" : "#4A6B82", letterSpacing:"0.5px", fontFamily:"'DM Sans',sans-serif", marginTop:1 }}>
                      {isPaid ? "★ Premium Member" : "Free Plan"}
                    </div>
                  </div>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={() => { navigate("/profile"); setMenuOpen(false); }}
                    style={{ flex:1, padding:"10px 12px",
                      background: isDark ? "rgba(212,160,23,0.08)" : "rgba(13,27,42,0.05)",
                      border: isDark ? "1px solid rgba(212,160,23,0.25)" : "1px solid rgba(13,27,42,0.15)",
                      borderRadius:8, cursor:"pointer",
                      fontSize:12, fontWeight:700, color: isDark ? GOLD : "#0D1B2A", fontFamily:"'DM Sans',sans-serif",
                      letterSpacing:"0.3px", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                    👤 My Profile
                  </button>
                  {!isPaid && (
                    <button onClick={() => { navigate("/upgrade"); setMenuOpen(false); }}
                      style={{ flex:1, padding:"10px 12px",
                        background:"linear-gradient(135deg,#f8dc72,#D4A017)",
                        border:"none", borderRadius:8, cursor:"pointer",
                        fontSize:12, fontWeight:800, color:NAVY, fontFamily:"'DM Sans',sans-serif",
                        letterSpacing:"0.3px", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                      ⚡ Upgrade
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Home */}
            <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}
              style={{ display:"block", padding:"13px 24px", fontSize:12, borderBottom:`1px solid rgba(212,160,23,0.06)`, letterSpacing:"1.6px", color:textCol }}>
              Home
            </Link>

            {/* Research Universe — submenu */}
            <div>
              <button onClick={() => setMobileResearchOpen(o => !o)}
                style={{ width:"100%", textAlign:"left", background:"none", border:"none", borderBottom:`1px solid rgba(212,160,23,0.06)`, padding:"13px 24px", fontSize:12, fontWeight:700, letterSpacing:"1.6px", color: mobileResearchOpen ? (isDark ? GOLD : "#B8870A") : textCol, cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", fontFamily:"'DM Sans',sans-serif" }}>
                Research Universe
                <span style={{ fontSize:10, transition:"transform .2s", display:"inline-block", transform: mobileResearchOpen ? "rotate(90deg)" : "rotate(0deg)" }}>▶</span>
              </button>
              {mobileResearchOpen && (
                <div style={{ background: isDark ? "rgba(0,0,0,0.18)" : "rgba(13,27,42,0.04)" }}>
                  <Link to="/research-universe" onClick={() => { setMenuOpen(false); setMobileResearchOpen(false); }}
                    style={{ display:"flex", alignItems:"center", padding:"11px 32px", borderBottom:`1px solid rgba(212,160,23,0.05)`, textDecoration:"none" }}
                    onMouseEnter={e => e.currentTarget.style.background="rgba(212,160,23,0.07)"}
                    onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                    <span style={{ fontSize:12, fontWeight:700, letterSpacing:"1.6px", color:textCol, fontFamily:"'DM Sans',sans-serif" }}>All Stocks</span>
                  </Link>
                  <Link to="/dcf" onClick={() => { setMenuOpen(false); setMobileResearchOpen(false); }}
                    style={{ display:"flex", alignItems:"center", padding:"11px 32px", borderBottom:`1px solid rgba(212,160,23,0.05)`, textDecoration:"none" }}
                    onMouseEnter={e => e.currentTarget.style.background="rgba(212,160,23,0.07)"}
                    onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                    <span style={{ fontSize:12, fontWeight:700, letterSpacing:"1.6px", color:textCol, fontFamily:"'DM Sans',sans-serif" }}>Build DCF</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Portfolio Simulator — submenu */}
            <div>
              <button onClick={() => setMobilePortfolioOpen(o => !o)}
                style={{ width:"100%", textAlign:"left", background:"none", border:"none", borderBottom:`1px solid rgba(212,160,23,0.06)`, padding:"13px 24px", fontSize:12, fontWeight:700, letterSpacing:"1.6px", color: mobilePortfolioOpen ? (isDark ? GOLD : "#B8870A") : textCol, cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", fontFamily:"'DM Sans',sans-serif" }}>
                Portfolio Simulator
                <span style={{ fontSize:10, transition:"transform .2s", display:"inline-block", transform: mobilePortfolioOpen ? "rotate(90deg)" : "rotate(0deg)" }}>▶</span>
              </button>
              {mobilePortfolioOpen && (
                <div style={{ background: isDark ? "rgba(0,0,0,0.18)" : "rgba(13,27,42,0.04)" }}>
                  <Link to="/portfolio" onClick={() => { setMenuOpen(false); setMobilePortfolioOpen(false); }}
                    style={{ display:"flex", alignItems:"center", padding:"11px 32px", borderBottom:`1px solid rgba(212,160,23,0.05)`, textDecoration:"none" }}
                    onMouseEnter={e => e.currentTarget.style.background="rgba(212,160,23,0.07)"}
                    onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                    <span style={{ fontSize:12, fontWeight:700, letterSpacing:"1.6px", color:textCol, fontFamily:"'DM Sans',sans-serif" }}>Run Simulation</span>
                  </Link>
                  <Link to="/my-portfolio" onClick={() => { setMenuOpen(false); setMobilePortfolioOpen(false); }}
                    style={{ display:"flex", alignItems:"center", padding:"11px 32px", borderBottom:`1px solid rgba(212,160,23,0.05)`, textDecoration:"none" }}
                    onMouseEnter={e => e.currentTarget.style.background="rgba(212,160,23,0.07)"}
                    onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                    <span style={{ fontSize:12, fontWeight:700, letterSpacing:"1.6px", color:textCol, fontFamily:"'DM Sans',sans-serif" }}>My Portfolios</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Quant submenu */}
            <div>
              <button onClick={() => setMobileQuantOpen(o => !o)}
                style={{ width:"100%", textAlign:"left", background:"none", border:"none", borderBottom:`1px solid rgba(212,160,23,0.06)`, padding:"13px 24px", fontSize:12, fontWeight:700, letterSpacing:"1.6px", color: mobileQuantOpen ? (isDark ? GOLD : "#B8870A") : textCol, cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", fontFamily:"'DM Sans',sans-serif" }}>
                Quant Hub
                <span style={{ fontSize:10, transition:"transform .2s", display:"inline-block", transform: mobileQuantOpen ? "rotate(90deg)" : "rotate(0deg)" }}>▶</span>
              </button>
              {mobileQuantOpen && (
                <div style={{ background: isDark ? "rgba(0,0,0,0.18)" : "rgba(13,27,42,0.04)" }}>
                  <Link to="/quant" onClick={() => { setMenuOpen(false); setMobileQuantOpen(false); }}
                    style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 32px", borderBottom:`1px solid rgba(212,160,23,0.05)`, textDecoration:"none" }}
                    onMouseEnter={e => e.currentTarget.style.background="rgba(212,160,23,0.07)"}
                    onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                    <span style={{ fontSize:14, fontWeight:900, color:isDark ? GOLD : "#B8870A", fontFamily:"serif" }}>π</span>
                    <span style={{ fontSize:12, fontWeight:800, color:isDark ? GOLD : "#0D1B2A" }}>Quant Hub</span>
                  </Link>
                  {QUANT_SUB_LINKS.map(q => (
                    <Link key={q.label} to={q.live ? q.path : "/quant"} onClick={() => { if(q.live){ setMenuOpen(false); setMobileQuantOpen(false); } }}
                      style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 32px", borderBottom:`1px solid rgba(212,160,23,0.05)`, textDecoration:"none", opacity: q.live ? 1 : 0.4, pointerEvents: q.live ? "auto" : "none" }}
                      onMouseEnter={e => { if(q.live) e.currentTarget.style.background="rgba(212,160,23,0.07)"; }}
                      onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                      <span style={{ fontSize:12, fontWeight:700, letterSpacing:"1.6px", color:textCol, fontFamily:"'DM Sans',sans-serif" }}>{q.label}</span>
                      {!q.live && <span style={{ fontSize:8, fontWeight:800, color:MUTED, letterSpacing:"1px", marginLeft:"auto" }}>SOON</span>}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Macro */}
            <Link to="/macro" className="nav-link" onClick={() => setMenuOpen(false)}
              style={{ display:"block", padding:"13px 24px", fontSize:12, borderBottom:`1px solid rgba(212,160,23,0.06)`, letterSpacing:"1.6px", color:textCol }}>
              Macro Dashboard
            </Link>

            {/* About Us submenu */}
            <div>
              <button onClick={() => setMobileAboutOpen(o => !o)}
                style={{ width:"100%", textAlign:"left", background:"none", border:"none", borderBottom:`1px solid rgba(212,160,23,0.06)`, padding:"13px 24px", fontSize:12, fontWeight:700, letterSpacing:"1.6px", color: mobileAboutOpen ? (isDark ? GOLD : "#B8870A") : textCol, cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", fontFamily:"'DM Sans',sans-serif" }}>
                About Us
                <span style={{ fontSize:10, transition:"transform .2s", display:"inline-block", transform: mobileAboutOpen ? "rotate(90deg)" : "rotate(0deg)" }}>▶</span>
              </button>
              {mobileAboutOpen && (
                <div style={{ background: isDark ? "rgba(0,0,0,0.18)" : "rgba(13,27,42,0.04)" }}>
                  {ABOUT_SUB_LINKS.map(a => (
                    <Link key={a.label} to={a.path} onClick={() => { setMenuOpen(false); setMobileAboutOpen(false); }}
                      style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 32px", borderBottom:`1px solid rgba(212,160,23,0.05)`, textDecoration:"none" }}
                      onMouseEnter={e => e.currentTarget.style.background="rgba(212,160,23,0.07)"}
                      onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                      <span style={{ fontSize:12, fontWeight:700, letterSpacing:"1.6px", color:textCol, fontFamily:"'DM Sans',sans-serif" }}>{a.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* All Stocks submenu */}
            <div>
              <button onClick={() => setMobileStocksOpen(o => !o)}
                style={{ width:"100%", textAlign:"left", background:"none", border:"none", borderBottom:`1px solid rgba(212,160,23,0.06)`, padding:"13px 24px", fontSize:12, fontWeight:700, letterSpacing:"1.6px", color:mobileStocksOpen ? (isDark ? GOLD : "#B8870A") : textCol, fontFamily:"'DM Sans',sans-serif", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                All Stocks
                <span style={{ fontSize:10, transition:"transform .2s", display:"inline-block", transform:mobileStocksOpen?"rotate(90deg)":"rotate(0deg)" }}>▶</span>
              </button>
              {mobileStocksOpen && (
                <div style={{ background: isDark ? "rgba(0,0,0,0.18)" : "rgba(13,27,42,0.04)" }}>
                  {STOCK_ROUTES.map(({ path, stockId }) => {
                    const s = STOCKS[stockId];
                    return (
                      <Link key={stockId} to={path}
                        onClick={() => { setMenuOpen(false); setMobileStocksOpen(false); }}
                        style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"13px 32px", textDecoration:"none", color:"inherit", borderBottom:`1px solid rgba(212,160,23,0.05)`, cursor:"pointer" }}>
                        <div>
                          <div style={{ fontSize:13, fontWeight:700, color: isDark ? "#c8dae8" : "#0D1B2A", fontFamily:"'DM Sans',sans-serif" }}>{s.name}</div>
                          <div style={{ fontSize:9, color:"rgba(212,160,23,0.5)", letterSpacing:1, marginTop:2, fontFamily:"'DM Sans',sans-serif" }}>NSE: {s.nse}</div>
                        </div>
                        <span style={{ fontSize:10, fontWeight:700, color: isDark ? GOLD : "#B8870A", background: isDark ? "rgba(212,160,23,0.12)" : "rgba(184,135,10,0.08)", padding:"4px 10px", borderRadius:999, letterSpacing:1, fontFamily:"'DM Sans',sans-serif", flexShrink:0, whiteSpace:"nowrap", display:"inline-flex", alignItems:"center" }}>GO →</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── SIGNED OUT: create account at bottom ── */}
            {!user && (
              <div style={{ padding:"14px 20px", borderTop:`1px solid ${isDark ? 'rgba(212,160,23,0.12)' : 'rgba(13,27,42,0.07)'}`, marginTop:4 }}>
                <Link to="/signup" onClick={() => setMenuOpen(false)}
                  style={{ display:"block", textAlign:"center",
                    background: isDark ? "rgba(212,160,23,0.12)" : "#0D1B2A",
                    color: isDark ? GOLD : "#FFFFFF",
                    border: isDark ? "1px solid rgba(212,160,23,0.3)" : "none", borderRadius:8,
                    padding:"11px 18px", fontSize:11, fontWeight:800, letterSpacing:"1px",
                    fontFamily:"'DM Sans',sans-serif", textDecoration:"none" }}>
                  CREATE FREE ACCOUNT
                </Link>
                <div style={{ textAlign:"center", marginTop:8, fontSize:11, color: isDark ? "rgba(212,160,23,0.45)" : "#4A6B82", fontFamily:"'DM Sans',sans-serif" }}>
                  Already a member?{" "}
                  <span onClick={() => { navigate("/signup"); setMenuOpen(false); }}
                    style={{ color: isDark ? GOLD : "#B8870A", cursor:"pointer", fontWeight:700 }}>Sign in</span>
                </div>
              </div>
            )}

            {/* ── SIGNED IN: sign out at bottom ── */}
            {user && (
              <div style={{ padding:"8px 20px", borderTop:`1px solid rgba(212,160,23,0.06)`, marginTop:4 }}>
                <button onClick={() => { signOut(); setMenuOpen(false); }}
                  style={{ background:"none", border:"none", padding:"8px 0", cursor:"pointer",
                    fontSize:11, fontWeight:500, color:"rgba(212,160,23,0.35)",
                    fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.5px" }}>
                  Sign out of {user.name.split(" ")[0]}'s account
                </button>
              </div>
            )}

            <div className="theme-btn-mobile" style={{ padding:"14px 24px", borderTop:`1px solid rgba(212,160,23,0.08)`, alignItems:"center", justifyContent:"space-between" }}>
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

      {/* ═══════════════════════════════════════════
          DESKTOP LEFT SIDEBAR — hidden on mobile
      ═══════════════════════════════════════════ */}
      <div
        className="desktop-sidebar"
        style={{
          display: 'none', // shown via CSS on desktop
          position: 'fixed',
          top: 58,
          left: 0,
          bottom: 0,
          width: sidebarOpen ? 240 : 60,
          zIndex: 99998,
          background: isDark ? 'rgba(7,14,26,0.99)' : 'rgba(244,242,238,0.99)',
          borderRight: `1px solid ${borderCol}`,
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
          overflow: 'hidden',
          flexDirection: 'column',
          boxShadow: isDark ? '4px 0 24px rgba(0,0,0,0.4)' : '2px 0 12px rgba(13,27,42,0.07)',
        }}
      >
        {/* Gold shimmer line at top */}
        <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,160,23,0.3),transparent)', flexShrink: 0 }}/>

        {/* Scrollable nav links */}
        <div className="sb-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingBottom: 12, paddingTop: 4 }}>

          {sidebarOpen && <div className="sb-section-label">NAVIGATE</div>}

          {/* ── SidebarLink helper (inline) ── */}
          {[
            { icon: '🏠', label: 'Home',               path: '/' },
          ].map(({ icon, label, path }) => {
            const active = isActive(path);
            return (
              <Link key={path} to={path} className="sb-link"
                style={{
                  display: 'flex', alignItems: 'center',
                  gap: sidebarOpen ? 12 : 0,
                  padding: sidebarOpen ? '10px 14px 10px 18px' : '11px 0',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  textDecoration: 'none',
                  background: active ? (isDark ? 'rgba(212,160,23,0.10)' : 'rgba(184,135,10,0.08)') : 'transparent',
                  borderLeft: active ? `2.5px solid ${GOLD}` : '2.5px solid transparent',
                  borderRadius: '0 8px 8px 0', marginRight: 8,
                  transition: 'background .15s', position: 'relative',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = isDark ? 'rgba(212,160,23,0.06)' : 'rgba(184,135,10,0.05)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ fontSize: 14, width: 22, textAlign: 'center', lineHeight: 1, flexShrink: 0 }}>{icon}</span>
                {sidebarOpen && <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', color: active ? GOLD : textCol, fontFamily: "'DM Sans',sans-serif", whiteSpace: 'nowrap' }}>{label}</span>}
                {!sidebarOpen && <span className="sb-tooltip">{label}</span>}
              </Link>
            );
          })}

          {/* Research Universe accordion */}
          {(() => {
            const active = isActive('/research-universe') || isActive('/dcf');
            return (
              <div>
                <button onClick={() => { if (!sidebarOpen) { setSidebarOpen(true); } setDeskResearchOpen(o => !o); }}
                  className="sb-link"
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center',
                    gap: sidebarOpen ? 12 : 0, padding: sidebarOpen ? '10px 14px 10px 18px' : '11px 0',
                    justifyContent: sidebarOpen ? 'flex-start' : 'center',
                    background: active ? (isDark ? 'rgba(212,160,23,0.10)' : 'rgba(184,135,10,0.08)') : 'transparent',
                    borderLeft: active ? `2.5px solid ${GOLD}` : '2.5px solid transparent',
                    borderRadius: '0 8px 8px 0', marginRight: 8,
                    border: 'none', cursor: 'pointer', transition: 'background .15s', position: 'relative',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = isDark ? 'rgba(212,160,23,0.06)' : 'rgba(184,135,10,0.05)'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ fontSize: 14, width: 22, textAlign: 'center', lineHeight: 1, flexShrink: 0 }}>🔬</span>
                  {sidebarOpen && (<>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', color: active ? GOLD : textCol, fontFamily: "'DM Sans',sans-serif", whiteSpace: 'nowrap', flex: 1, textAlign: 'left' }}>Research Universe</span>
                    <span style={{ fontSize: 9, color: active ? GOLD : 'rgba(212,160,23,0.4)', transform: deskResearchOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform .2s', display: 'inline-block', marginRight: 4 }}>▶</span>
                  </>)}
                  {!sidebarOpen && <span className="sb-tooltip">Research</span>}
                </button>
                {deskResearchOpen && sidebarOpen && (
                  <div style={{ borderLeft: '1px solid rgba(212,160,23,0.12)', marginLeft: 29, paddingLeft: 12 }}>
                    {[{label:'All Stocks',path:'/research-universe'},{label:'Build DCF',path:'/dcf'}].map(({label,path}) => (
                      <Link key={path} to={path} style={{ display:'flex', alignItems:'center', padding:'8px 8px 8px 4px', textDecoration:'none', borderRadius:6, transition:'background .15s', fontSize:11, fontWeight:700, color:textCol, fontFamily:"'DM Sans',sans-serif", letterSpacing:'0.5px' }}
                        onMouseEnter={e => e.currentTarget.style.background=isDark?'rgba(212,160,23,0.06)':'rgba(184,135,10,0.05)'}
                        onMouseLeave={e => e.currentTarget.style.background='transparent'}>{label}</Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Portfolio Simulator accordion */}
          {(() => {
            const active = isActive('/portfolio') || isActive('/my-portfolio');
            return (
              <div>
                <button onClick={() => { if (!sidebarOpen) setSidebarOpen(true); setDeskPortfolioOpen(o => !o); }}
                  className="sb-link"
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center',
                    gap: sidebarOpen ? 12 : 0, padding: sidebarOpen ? '10px 14px 10px 18px' : '11px 0',
                    justifyContent: sidebarOpen ? 'flex-start' : 'center',
                    background: active ? (isDark?'rgba(212,160,23,0.10)':'rgba(184,135,10,0.08)') : 'transparent',
                    borderLeft: active ? `2.5px solid ${GOLD}` : '2.5px solid transparent',
                    borderRadius: '0 8px 8px 0', marginRight: 8,
                    border: 'none', cursor: 'pointer', transition: 'background .15s', position: 'relative',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background=isDark?'rgba(212,160,23,0.06)':'rgba(184,135,10,0.05)'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background='transparent'; }}
                >
                  <span style={{ fontSize:14, width:22, textAlign:'center', lineHeight:1, flexShrink:0 }}>🗂️</span>
                  {sidebarOpen && (<>
                    <span style={{ fontSize:11, fontWeight:700, letterSpacing:'1px', color:active?GOLD:textCol, fontFamily:"'DM Sans',sans-serif", whiteSpace:'nowrap', flex:1, textAlign:'left' }}>Portfolio</span>
                    <span style={{ fontSize:9, color:active?GOLD:'rgba(212,160,23,0.4)', transform:deskPortfolioOpen?'rotate(90deg)':'rotate(0deg)', transition:'transform .2s', display:'inline-block', marginRight:4 }}>▶</span>
                  </>)}
                  {!sidebarOpen && <span className="sb-tooltip">Portfolio</span>}
                </button>
                {deskPortfolioOpen && sidebarOpen && (
                  <div style={{ borderLeft:'1px solid rgba(212,160,23,0.12)', marginLeft:29, paddingLeft:12 }}>
                    {[{label:'Run Simulation',path:'/portfolio'},{label:'My Portfolios',path:'/my-portfolio'}].map(({label,path}) => (
                      <Link key={path} to={path} style={{ display:'flex', alignItems:'center', padding:'8px 8px 8px 4px', textDecoration:'none', borderRadius:6, transition:'background .15s', fontSize:11, fontWeight:700, color:textCol, fontFamily:"'DM Sans',sans-serif" }}
                        onMouseEnter={e => e.currentTarget.style.background=isDark?'rgba(212,160,23,0.06)':'rgba(184,135,10,0.05)'}
                        onMouseLeave={e => e.currentTarget.style.background='transparent'}>{label}</Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Quant Hub accordion */}
          {(() => {
            const active = isActive('/quant') || isActive('/momentum') || isActive('/value') || isActive('/size');
            return (
              <div>
                <button onClick={() => { if (!sidebarOpen) setSidebarOpen(true); setDeskQuantOpen(o => !o); }}
                  className="sb-link"
                  style={{
                    width:'100%', display:'flex', alignItems:'center',
                    gap:sidebarOpen?12:0, padding:sidebarOpen?'10px 14px 10px 18px':'11px 0',
                    justifyContent:sidebarOpen?'flex-start':'center',
                    background:active?(isDark?'rgba(212,160,23,0.10)':'rgba(184,135,10,0.08)'):'transparent',
                    borderLeft:active?`2.5px solid ${GOLD}`:'2.5px solid transparent',
                    borderRadius:'0 8px 8px 0', marginRight:8,
                    border:'none', cursor:'pointer', transition:'background .15s', position:'relative',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background=isDark?'rgba(212,160,23,0.06)':'rgba(184,135,10,0.05)'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background='transparent'; }}
                >
                  <span style={{ fontSize:15, width:22, textAlign:'center', lineHeight:1, flexShrink:0, fontFamily:'serif', fontWeight:900, color:active?GOLD:(isDark?textCol:'#1E3A52') }}>π</span>
                  {sidebarOpen && (<>
                    <span style={{ fontSize:11, fontWeight:700, letterSpacing:'1px', color:active?GOLD:textCol, fontFamily:"'DM Sans',sans-serif", whiteSpace:'nowrap', flex:1, textAlign:'left' }}>Quant Hub</span>
                    <span style={{ fontSize:9, color:active?GOLD:'rgba(212,160,23,0.4)', transform:deskQuantOpen?'rotate(90deg)':'rotate(0deg)', transition:'transform .2s', display:'inline-block', marginRight:4 }}>▶</span>
                  </>)}
                  {!sidebarOpen && <span className="sb-tooltip">Quant Hub</span>}
                </button>
                {deskQuantOpen && sidebarOpen && (
                  <div style={{ borderLeft:'1px solid rgba(212,160,23,0.12)', marginLeft:29, paddingLeft:12 }}>
                    {QUANT_SUB_LINKS.map(q => (
                      <Link key={q.label} to={q.live?q.path:'#'}
                        style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 8px 8px 4px', textDecoration:'none', borderRadius:6, transition:'background .15s', opacity:q.live?1:0.38, pointerEvents:q.live?'auto':'none', fontSize:11, fontWeight:700, color:textCol, fontFamily:"'DM Sans',sans-serif" }}
                        onMouseEnter={e => { if(q.live) e.currentTarget.style.background=isDark?'rgba(212,160,23,0.06)':'rgba(184,135,10,0.05)'; }}
                        onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                        <span style={{ fontSize:11 }}>{q.icon}</span>{q.label}
                        {!q.live && <span style={{ fontSize:8, fontWeight:800, color:MUTED, letterSpacing:'1px', marginLeft:'auto' }}>SOON</span>}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Macro */}
          {[{ icon:'📊', label:'Macro Dashboard', path:'/macro' }, { icon:'⚡', label:'Discover Stocks', path:'/discover' }].map(({ icon, label, path }) => {
            const active = isActive(path);
            return (
              <Link key={path} to={path} className="sb-link"
                style={{
                  display:'flex', alignItems:'center', gap:sidebarOpen?12:0,
                  padding:sidebarOpen?'10px 14px 10px 18px':'11px 0',
                  justifyContent:sidebarOpen?'flex-start':'center',
                  textDecoration:'none',
                  background:active?(isDark?'rgba(212,160,23,0.10)':'rgba(184,135,10,0.08)'):'transparent',
                  borderLeft:active?`2.5px solid ${GOLD}`:'2.5px solid transparent',
                  borderRadius:'0 8px 8px 0', marginRight:8,
                  transition:'background .15s', position:'relative',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background=isDark?'rgba(212,160,23,0.06)':'rgba(184,135,10,0.05)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background='transparent'; }}
              >
                <span style={{ fontSize:14, width:22, textAlign:'center', lineHeight:1, flexShrink:0 }}>{icon}</span>
                {sidebarOpen && <span style={{ fontSize:11, fontWeight:700, letterSpacing:'1px', color:active?GOLD:textCol, fontFamily:"'DM Sans',sans-serif", whiteSpace:'nowrap' }}>{label}</span>}
                {!sidebarOpen && <span className="sb-tooltip">{label}</span>}
              </Link>
            );
          })}

          {/* About Us accordion */}
          {(() => {
            const active = isActive('/about') || isActive('/philosophy') || isActive('/terms');
            return (
              <div>
                <button onClick={() => { if (!sidebarOpen) setSidebarOpen(true); setDeskAboutOpen(o => !o); }}
                  className="sb-link"
                  style={{
                    width:'100%', display:'flex', alignItems:'center',
                    gap:sidebarOpen?12:0, padding:sidebarOpen?'10px 14px 10px 18px':'11px 0',
                    justifyContent:sidebarOpen?'flex-start':'center',
                    background:active?(isDark?'rgba(212,160,23,0.10)':'rgba(184,135,10,0.08)'):'transparent',
                    borderLeft:active?`2.5px solid ${GOLD}`:'2.5px solid transparent',
                    borderRadius:'0 8px 8px 0', marginRight:8,
                    border:'none', cursor:'pointer', transition:'background .15s', position:'relative',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background=isDark?'rgba(212,160,23,0.06)':'rgba(184,135,10,0.05)'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background='transparent'; }}
                >
                  <span style={{ fontSize:14, width:22, textAlign:'center', lineHeight:1, flexShrink:0 }}>👥</span>
                  {sidebarOpen && (<>
                    <span style={{ fontSize:11, fontWeight:700, letterSpacing:'1px', color:active?GOLD:textCol, fontFamily:"'DM Sans',sans-serif", whiteSpace:'nowrap', flex:1, textAlign:'left' }}>About Us</span>
                    <span style={{ fontSize:9, color:active?GOLD:'rgba(212,160,23,0.4)', transform:deskAboutOpen?'rotate(90deg)':'rotate(0deg)', transition:'transform .2s', display:'inline-block', marginRight:4 }}>▶</span>
                  </>)}
                  {!sidebarOpen && <span className="sb-tooltip">About Us</span>}
                </button>
                {deskAboutOpen && sidebarOpen && (
                  <div style={{ borderLeft:'1px solid rgba(212,160,23,0.12)', marginLeft:29, paddingLeft:12 }}>
                    {ABOUT_SUB_LINKS.map(a => (
                      <Link key={a.label} to={a.path} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 8px 8px 4px', textDecoration:'none', borderRadius:6, transition:'background .15s', fontSize:11, fontWeight:700, color:textCol, fontFamily:"'DM Sans',sans-serif" }}
                        onMouseEnter={e => e.currentTarget.style.background=isDark?'rgba(212,160,23,0.06)':'rgba(184,135,10,0.05)'}
                        onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                        <span style={{ fontSize:11 }}>{a.icon}</span>{a.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* All Stocks accordion */}
          {(() => {
            return (
              <div>
                <button onClick={() => { if (!sidebarOpen) setSidebarOpen(true); setDeskStocksOpen(o => !o); }}
                  className="sb-link"
                  style={{
                    width:'100%', display:'flex', alignItems:'center',
                    gap:sidebarOpen?12:0, padding:sidebarOpen?'10px 14px 10px 18px':'11px 0',
                    justifyContent:sidebarOpen?'flex-start':'center',
                    background:'transparent',
                    borderLeft:'2.5px solid transparent',
                    borderRadius:'0 8px 8px 0', marginRight:8,
                    border:'none', cursor:'pointer', transition:'background .15s', position:'relative',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background=isDark?'rgba(212,160,23,0.06)':'rgba(184,135,10,0.05)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='transparent'; }}
                >
                  <span style={{ fontSize:14, width:22, textAlign:'center', lineHeight:1, flexShrink:0 }}>📈</span>
                  {sidebarOpen && (<>
                    <span style={{ fontSize:11, fontWeight:700, letterSpacing:'1px', color:textCol, fontFamily:"'DM Sans',sans-serif", whiteSpace:'nowrap', flex:1, textAlign:'left' }}>All Stocks</span>
                    <span style={{ fontSize:9, color:'rgba(212,160,23,0.4)', transform:deskStocksOpen?'rotate(90deg)':'rotate(0deg)', transition:'transform .2s', display:'inline-block', marginRight:4 }}>▶</span>
                  </>)}
                  {!sidebarOpen && <span className="sb-tooltip">All Stocks</span>}
                </button>
                {deskStocksOpen && sidebarOpen && (
                  <div style={{ borderLeft:'1px solid rgba(212,160,23,0.12)', marginLeft:29, paddingLeft:12 }}>
                    {STOCK_ROUTES.map(({ path, stockId }) => {
                      const s = STOCKS[stockId];
                      return (
                        <Link key={stockId} to={path}
                          style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 6px 8px 4px', textDecoration:'none', borderRadius:6, transition:'background .15s' }}
                          onMouseEnter={e => e.currentTarget.style.background=isDark?'rgba(212,160,23,0.07)':'rgba(184,135,10,0.06)'}
                          onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                          <div>
                            <div style={{ fontSize:11, fontWeight:700, color:isDark?'#c8dae8':'#0D1B2A', fontFamily:"'DM Sans',sans-serif" }}>{s.name}</div>
                            <div style={{ fontSize:8, color:isDark?'rgba(212,160,23,0.5)':'#4A6B82', letterSpacing:'0.8px', marginTop:1, fontFamily:"'DM Sans',sans-serif" }}>NSE: {s.nse}</div>
                          </div>
                          <span style={{ fontSize:8, fontWeight:800, color:isDark?GOLD:'#B8870A', background:isDark?'rgba(212,160,23,0.1)':'rgba(184,135,10,0.07)', padding:'2px 7px', borderRadius:999, letterSpacing:'0.8px', fontFamily:"'DM Sans',sans-serif", flexShrink:0, whiteSpace:'nowrap' }}>GO →</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

        </div>{/* end scrollable */}

        {/* ── Bottom: Theme + Auth ── */}
        <div style={{ borderTop:`1px solid ${isDark?'rgba(212,160,23,0.1)':'rgba(13,27,42,0.07)'}`, paddingTop:4, paddingBottom:8, flexShrink:0 }}>
          {/* Theme toggle */}
          <button onClick={toggleTheme} className="sb-link"
            style={{ width:'100%', display:'flex', alignItems:'center', gap:sidebarOpen?12:0, padding:sidebarOpen?'10px 18px':'10px 0', justifyContent:sidebarOpen?'flex-start':'center', background:'none', border:'none', cursor:'pointer', transition:'background .15s', position:'relative' }}
            onMouseEnter={e => e.currentTarget.style.background=isDark?'rgba(212,160,23,0.06)':'rgba(184,135,10,0.05)'}
            onMouseLeave={e => e.currentTarget.style.background='transparent'}
          >
            <span style={{ fontSize:15, width:22, textAlign:'center', lineHeight:1, flexShrink:0 }}>{isDark?'☀️':'🌙'}</span>
            {sidebarOpen && <span style={{ fontSize:11, fontWeight:700, letterSpacing:'1px', color:textCol, fontFamily:"'DM Sans',sans-serif", whiteSpace:'nowrap' }}>{isDark?'Light Mode':'Dark Mode'}</span>}
            {!sidebarOpen && <span className="sb-tooltip">{isDark?'Light Mode':'Dark Mode'}</span>}
          </button>
          {/* Sign out */}
          {user && (
            <button onClick={signOut} className="sb-link"
              style={{ width:'100%', display:'flex', alignItems:'center', gap:sidebarOpen?12:0, padding:sidebarOpen?'9px 18px':'9px 0', justifyContent:sidebarOpen?'flex-start':'center', background:'none', border:'none', cursor:'pointer', transition:'background .15s', position:'relative' }}
              onMouseEnter={e => e.currentTarget.style.background=isDark?'rgba(212,160,23,0.06)':'rgba(184,135,10,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}
            >
              <span style={{ fontSize:14, width:22, textAlign:'center', lineHeight:1, flexShrink:0, color:'rgba(212,160,23,0.4)' }}>→</span>
              {sidebarOpen && <span style={{ fontSize:11, fontWeight:600, color:'rgba(212,160,23,0.4)', fontFamily:"'DM Sans',sans-serif", letterSpacing:'0.5px', whiteSpace:'nowrap' }}>Sign out</span>}
              {!sidebarOpen && <span className="sb-tooltip">Sign out</span>}
            </button>
          )}
          {!user && sidebarOpen && (
            <div style={{ padding:'8px 14px 4px' }}>
              <Link to="/signup" style={{ display:'block', textAlign:'center', background:isDark?'rgba(212,160,23,0.12)':'#0D1B2A', color:isDark?GOLD:'#FFFFFF', border:isDark?'1px solid rgba(212,160,23,0.3)':'none', borderRadius:8, padding:'10px 14px', fontSize:10, fontWeight:800, letterSpacing:'1.2px', fontFamily:"'DM Sans',sans-serif", textDecoration:'none', transition:'opacity .15s' }}
                onMouseEnter={e => e.currentTarget.style.opacity='0.85'}
                onMouseLeave={e => e.currentTarget.style.opacity='1'}>
                CREATE FREE ACCOUNT
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar collapse/expand chevron button */}
      <button
        className="desktop-sidebar"
        onClick={toggleSidebar}
        title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        style={{
          position: 'fixed',
          top: 58 + 20,
          left: (sidebarOpen ? 240 : 60) - 12,
          width: 24, height: 24,
          borderRadius: '50%',
          background: isDark ? 'rgba(10,21,36,0.97)' : 'rgba(248,247,244,0.97)',
          border: `1px solid ${borderCol}`,
          cursor: 'pointer',
          display: 'none', // shown via CSS on desktop
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          transition: `left 0.25s cubic-bezier(0.4,0,0.2,1), background .2s`,
          boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.5)' : '0 2px 8px rgba(13,27,42,0.12)',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,160,23,0.12)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = isDark ? 'rgba(10,21,36,0.97)' : 'rgba(248,247,244,0.97)'; }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
          style={{ transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)', transform: sidebarOpen ? 'rotate(0deg)' : 'rotate(180deg)' }}>
          <path d="M6.5 2L3.5 5L6.5 8" stroke={isDark ? GOLD : '#B8870A'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

    {/* ── Wishlist sheet ── */}
    {wishlistOpen && (
      <>
        <div onClick={() => setWishlistOpen(false)} style={{ position:"fixed", inset:0, zIndex:200000, background:"rgba(0,0,0,0.55)" }}/>
        <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:200001, background:"#0a1526", borderRadius:"20px 20px 0 0", border:"1px solid rgba(212,160,23,0.2)", maxHeight:"70vh", display:"flex", flexDirection:"column", fontFamily:"'DM Sans',sans-serif" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px 12px", borderBottom:"1px solid rgba(212,160,23,0.1)" }}>
            <div style={{ fontSize:11, fontWeight:800, color: isDark ? "#D4A017" : "#0D1B2A", letterSpacing:"0.15em" }}>❤️ SAVED STOCKS · {wishlistItems.length}</div>
            <button onClick={() => setWishlistOpen(false)} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.4)", fontSize:20, cursor:"pointer", padding:"0 4px" }}>×</button>
          </div>
          <div style={{ overflowY:"auto", flex:1 }}>
            {wishlistItems.length === 0 ? (
              <div style={{ padding:"40px 20px", textAlign:"center", color:"rgba(255,255,255,0.25)", fontSize:13 }}>No saved stocks yet. Swipe right on Discover to save.</div>
            ) : wishlistItems.map(ticker => {
              const route = STOCK_ROUTES.find(r => STOCKS[r.stockId]?.nse === ticker || r.stockId === ticker);
              const stock = route ? STOCKS[route.stockId] : null;
              return (
                <div key={ticker} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px", borderBottom:"1px solid rgba(255,255,255,0.04)", cursor:"pointer" }}
                  onClick={() => { openModal(ticker); setWishlistOpen(false); }}>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:"#e2e8f0" }}>{stock?.name || ticker}</div>
                    <div style={{ fontSize:10, color:"rgba(212,160,23,0.6)", marginTop:2, letterSpacing:"0.05em" }}>NSE: {ticker}</div>
                  </div>
                  {route
                    ? <span style={{ fontSize:10, fontWeight:800, color:"#D4A017", background:"rgba(212,160,23,0.1)", border:"1px solid rgba(212,160,23,0.25)", padding:"5px 12px", borderRadius:999, letterSpacing:"0.08em" }}>RESEARCH →</span>
                    : <span style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.35)", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", padding:"5px 12px", borderRadius:999, letterSpacing:"0.06em" }}>CHART →</span>
                  }
                </div>
              );
            })}
          </div>
        </div>
      </>
    )}
      {scrollY > 300 && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          style={{
            position:"fixed", bottom:28, right:20, zIndex:300000,
            width:40, height:40, borderRadius:"50%",
            background:"rgba(212,160,23,0.15)",
            border:"1px solid rgba(212,160,23,0.4)",
            backdropFilter:"blur(10px)",
            display:"flex", alignItems:"center", justifyContent:"center",
            cursor:"pointer", transition:"all .2s",
            boxShadow:"0 4px 16px rgba(0,0,0,0.3)",
          }}
          onMouseEnter={e => { e.currentTarget.style.background="rgba(212,160,23,0.3)"; e.currentTarget.style.transform="translateY(-2px)"; }}
          onMouseLeave={e => { e.currentTarget.style.background="rgba(212,160,23,0.15)"; e.currentTarget.style.transform="translateY(0)"; }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 12V2M7 2L2 7M7 2l5 5" stroke="#D4A017" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
    </>
  );
}