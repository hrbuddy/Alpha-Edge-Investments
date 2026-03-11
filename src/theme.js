// ═══════════════════════════════════════════════════════════════════════
//  VANTAGE CAPITAL — Design Tokens  v2.2
//  Single source of truth. Import PAL, TYPE, SHADOW, SPACE, EASE.
//  Change here → changes everywhere.
//
//  Usage:
//    import { PAL, TYPE, SHADOW, SPACE, EASE } from './theme';
//    const pal    = isDark ? PAL.dark    : PAL.light;
//    const shadow = isDark ? SHADOW.dark : SHADOW.light;
// ═══════════════════════════════════════════════════════════════════════

// ─── WEIGHT SYSTEM ────────────────────────────────────────────────────
// Bold is reserved. Everything defaults light + crisp.
//
//  400  Regular   — body text, descriptions, paragraphs
//  500  Medium    — metadata, captions, secondary labels
//  600  Semibold  — nav labels, UI labels, active states, metric values
//  700  Bold      — CTA buttons ONLY, Playfair H3
//  800  Extrabold — Playfair H1/H2 only
//  900  Black     — Playfair hero only
//
// Rule: if it's not Playfair Display, it should never exceed 600.
// ──────────────────────────────────────────────────────────────────────


// ─── COLOUR PALETTES ──────────────────────────────────────────────────

export const PAL = {

    dark: {
      // — Backgrounds (3 depth tiers) —
      bg:               "#060E1A",                   // page — deepest navy
      bgSection:        "#0A1526",                   // navbar, sidebar, strips
      cardBg:           "rgba(255,255,255,0.025)",   // cards, modals
      cardBgHover:      "rgba(255,255,255,0.04)",    // hovered / active cards
  
      // — Text (4 tiers — no grey anywhere) —
      text:             "#E8EDF2",                   // primary — headlines, body, numbers
      subText:          "#C8DAE8",                   // secondary — card body, sidebar labels
      muted:            "#89B8D0",                   // Steel Blue — captions, metadata (13px min)
      faint:            "#4A6E8A",                   // placeholders / disabled ONLY
  
      // — Gold (accent — NOT default text) —
      gold:             "#D4A017",                   // active states, CTAs, key metrics
      goldWarm:         "#D4A017",                   // compat alias
      goldBright:       "#F0C040",                   // hover on gold elements only
      goldBg:           "rgba(212,160,23,0.10)",     // active nav fill
      goldBgSubtle:     "rgba(212,160,23,0.06)",     // hover nav fill
      goldBorder:       "rgba(212,160,23,0.20)",     // card/input borders
      goldBorderStrong: "rgba(212,160,23,0.35)",     // hovered gold borders
  
      // — Borders & Dividers —
      border:           "rgba(255,255,255,0.07)",
      borderMed:        "rgba(255,255,255,0.11)",
      divider:          "rgba(255,255,255,0.05)",
      cardBorder:       "rgba(212,160,23,0.18)",     // compat
  
      // — Status —
      green:            "#3DBE72",                   // BUY, positive delta
      teal:             "#2ABFB0",                   // CAGR, DCF accent
      blue:             "#4B9CF0",                   // portfolio, macro
      red:              "#E05A47",                   // SELL, negative, error
  
      // — Sidebar specific —
      sidebarBg:        "rgba(7,14,26,0.99)",
      navActiveBg:      "rgba(212,160,23,0.10)",
      navActiveBar:     "#D4A017",
      navHoverBg:       "rgba(212,160,23,0.06)",
  
      // — Carousel / card compat —
      carouselBg:       "rgba(255,255,255,0.025)",
      carouselBorder:   "rgba(212,160,23,0.15)",
      carouselTitle:    "#E8EDF2",
      carouselBody:     "#89B8D0",
      statLabel:        "#89B8D0",
      sectionBg:        "#060E1A",
      stripBg:          "#0A1526",
  
      // — Inactive tile tokens —
      inactiveBorder:   "rgba(255,255,255,0.06)",
      inactiveBg:       "rgba(255,255,255,0.02)",
      inactiveDivider:  "rgba(255,255,255,0.04)",
      inactiveBoxBg:    "rgba(255,255,255,0.03)",
      inactiveBoxBdr:   "rgba(255,255,255,0.07)",
      inactiveLabel:    "#4A6E8A",
  
      // — Scrollbar —
      scrollThumb:      "rgba(212,160,23,0.25)",
      scrollTrack:      "rgba(255,255,255,0.03)",
    },
  
    light: {
      bg:               "#F8F7F4",
      bgSection:        "#F0EDE6",
      sectionBg:        "#F8F7F4",
      stripBg:          "#F0EDE6",
      cardBg:           "#FFFFFF",
      cardBgHover:      "rgba(184,135,10,0.03)",
      cardBorder:       "rgba(13,27,42,0.09)",
      cardBorderHover:  "rgba(184,135,10,0.45)",
  
      text:             "#0D1B2A",
      subText:          "#1E3A52",
      muted:            "#4A6B82",
      faint:            "#8FA5B8",
  
      gold:             "#B8870A",
      goldWarm:         "#D4A017",
      goldBg:           "rgba(184,135,10,0.08)",
      goldBorder:       "rgba(184,135,10,0.22)",
      goldBorderStrong: "rgba(184,135,10,0.45)",
  
      border:           "rgba(13,27,42,0.09)",
      borderMed:        "rgba(13,27,42,0.14)",
      divider:          "rgba(13,27,42,0.06)",
  
      green:            "#1A7A45",
      teal:             "#0B6B6A",
      blue:             "#1E5B9C",
      red:              "#C0392B",
  
      sidebarBg:        "rgba(244,242,238,0.99)",
      navActiveBg:      "rgba(184,135,10,0.08)",
      navActiveBar:     "#B8870A",
      navHoverBg:       "rgba(184,135,10,0.04)",
  
      carouselBg:       "#F0EDE6",
      carouselBorder:   "rgba(184,135,10,0.22)",
      carouselTitle:    "#0D1B2A",
      carouselBody:     "#4A6B82",
      statLabel:        "#4A6B82",
  
      inactiveBorder:   "rgba(13,27,42,0.08)",
      inactiveBg:       "rgba(13,27,42,0.02)",
      inactiveDivider:  "rgba(13,27,42,0.06)",
      inactiveBoxBg:    "rgba(13,27,42,0.04)",
      inactiveBoxBdr:   "rgba(13,27,42,0.09)",
      inactiveLabel:    "#8FA5B8",
  
      scrollThumb:      "rgba(184,135,10,0.3)",
      scrollTrack:      "rgba(13,27,42,0.04)",
    },
  };
  
  
  // ─── TYPOGRAPHY ───────────────────────────────────────────────────────
  // Inter throughout. Playfair Display for hero + H1 + H2 editorial only.
  // Hard floor: 13px. Body: 15px.
  
  export const TYPE = {
    // — Font families —
    fontUI:       "'Inter', sans-serif",             // EVERYTHING except display headlines
    fontDisplay:  "'Playfair Display', serif",       // Hero, H1, H2 ONLY
  
    // — Display scale (Playfair) —
    hero: "clamp(32px, 4.5vw, 52px)",               // brand hero
    h1:   "clamp(24px, 3.2vw, 40px)",               // page titles
    h2:   "clamp(20px, 2.5vw, 30px)",               // section headings
    h3:   "20px",                                   // sub-sections (Inter)
  
    // — UI / body scale (Inter) —
    bodyLg: "15px",                                 // modal copy, onboarding
    body:   "14px",                                 // all paragraphs
    label:  "14px",                                 // nav, sidebar, table data
    sm:     "13px",                                 // captions, metadata — FLOOR
  
    // — Weights (Inter) —
    regular:   400,   // body text, descriptions
    medium:    500,   // metadata, captions, secondary labels
    semibold:  600,   // nav labels, UI emphasis, metric values, active states
    bold:      700,   // CTA buttons ONLY — nothing else on Inter
  
    // — Weights (Playfair) —
    displayBold:  800,  // H1, H2
    displayBlack: 900,  // Hero
  
    // — Letter spacing —
    trackingTight:  "-2px",    // hero 52px+
    trackingH1:     "-1px",    // h1
    trackingH2:     "-0.4px",  // h2
    trackingBody:   "0",       // all body — default, no tracking
    trackingUI:     "0.2px",   // nav labels, sidebar (minimal)
    trackingCaps:   "0.15em",  // ALL CAPS labels/buttons
  
    // — Line heights —
    lhHero:    1.0,
    lhHeading: 1.15,
    lhBody:    1.75,
    lhUI:      1.55,
    lhTight:   1.3,
  
    // — Eyebrow —
    eyebrow: {
      fontSize:      "13px",
      fontWeight:    600,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      lineW:         "28px",
      lineH:         "2px",
    },
  };
  
  
  // ─── SHADOWS ──────────────────────────────────────────────────────────
  
  export const SHADOW = {
    dark: {
      card:    "0 2px 16px rgba(0,0,0,0.4)",
      hover:   "0 8px 40px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.3)",
      gold:    "0 0 0 1px rgba(212,160,23,0.2), 0 8px 32px rgba(212,160,23,0.12)",
      sidebar: "4px 0 32px rgba(0,0,0,0.5), inset -1px 0 0 rgba(212,160,23,0.05)",
      modal:   "0 24px 80px rgba(0,0,0,0.7)",
    },
    light: {
      card:    "0 2px 12px rgba(13,27,42,0.07), 0 1px 3px rgba(13,27,42,0.05)",
      hover:   "0 8px 32px rgba(13,27,42,0.12), 0 2px 8px rgba(13,27,42,0.07)",
      gold:    "0 0 0 1px rgba(184,135,10,0.2), 0 8px 28px rgba(184,135,10,0.08)",
      sidebar: "2px 0 16px rgba(13,27,42,0.08)",
      modal:   "0 24px 64px rgba(13,27,42,0.18)",
    },
  };
  
  
  // ─── SPACING ──────────────────────────────────────────────────────────
  
  export const SPACE = {
    sectionPadding:   "72px 18px",
    sectionMaxWidth:  "1360px",
    cardRadius:       "14px",
    cardPadding:      "24px 20px",
    cardGap:          "16px",
    sidebarExpanded:  "260px",
    sidebarCollapsed: "64px",
    navHeight:        "58px",
    navLinkPadding:   "10px 14px 10px 18px",
    sidebarActiveBar: "2.5px",
  };
  
  
  // ─── TRANSITIONS ──────────────────────────────────────────────────────
  
  export const EASE = {
    default:  "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
    fast:     "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
    sidebar:  "width 0.28s cubic-bezier(0.4, 0, 0.2, 1), left 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
    fade:     "opacity 0.2s ease",
  };
  
  
  // ─── FONT IMPORT (add once to index.html) ─────────────────────────────
  // <link href="https://fonts.googleapis.com/css2?
  //   family=Inter:wght@400;500;600;700
  //   &family=Playfair+Display:wght@800;900
  //   &display=swap" rel="stylesheet"/>