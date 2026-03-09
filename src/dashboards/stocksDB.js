// ============================================================
//  ALPHA EDGE — STOCK DATABASE
//  One object per stock. Add a new stock = add one object.
//  The dashboard renderer reads everything from here.
//  Format version: 1.0
// ============================================================

export const STOCKS = {

  // ─────────────────────────────────────────────
  //  INFO EDGE
  // ─────────────────────────────────────────────
  "NAUKRI": {
    // ── Identity ──
    id:           "NAUKRI",
    name:         "Info Edge (India) Ltd",
    nse:          "NAUKRI",
    bse:          "532777",
    indices:      "Nifty Next 50 · Nifty 500",
    sector:       "Internet / Classifieds",
    rating:       "BUY",
    description:  "India's leading internet classifieds company operating Naukri.com (dominant job portal with ~80% market share) and 99acres.com (top real-estate platform). Also an active venture investor with a ₹36,855 Cr portfolio including stakes in Zomato and PB Fintech.",

    // ── Header metric tiles (up to 6) ──
    metrics: [
      { label: "CMP",             value: "₹1,100",        sub: "Feb 2026"              },
      { label: "Market Cap",      value: "₹70,000 Cr",    sub: "$8.3B",    color: "GOLD"   },
      { label: "Target",     value: "₹1,700–2,100",  sub: "12–17% CAGR", color: "GREEN" },
      { label: "Inv. Portfolio",  value: "₹36,855 Cr",    sub: "9.3x / 36% IRR", color: "TEAL" },
      { label: "Standalone OPM",  value: "36%",           sub: "FY25",     color: "BLUE"  },
      { label: "Quality",         value: "6.6/10",        sub: "Consol (7.5 Stndl)", color: "ORANGE" },
    ],

    // ── Investment thesis bullets (shown in Overview tab) ──
    thesis: [
      { t: "Naukri = Wide Moat Monopoly",             d: "~80% traffic share, 82M resumes, 72K+ clients. Winner-take-all network effects." },
      { t: "Investment Portfolio = Margin of Safety", d: "Zomato (12.4%) + PB Fintech (19%) = ₹31,500 Cr. Total: ₹36,855 Cr at 36% IRR." },
      { t: "Margin Expansion Story",                  d: "99acres & Jeevansathi turning cash-positive. Blended OPM: 31% → 42% by FY30." },
      { t: "Valuation Gap",                           d: "Strip portfolio value: core biz at ~12x operating profit vs 40-50x for comparable monopolies." },
    ],

    // ── Financial time series ──
    finData: [
      { yr:"FY16",  rev:748,  opm:12,  opProfit:91,   cfo:78,   pat:118,   capex:15, fcff:63,   cfoPatPct:66,  roce:12, type:"H" },
      { yr:"FY17",  rev:888,  opm:-1,  opProfit:-9,   cfo:213,  pat:-43,   capex:20, fcff:193,  cfoPatPct:null,roce:3,  type:"H" },
      { yr:"FY18",  rev:988,  opm:22,  opProfit:219,  cfo:253,  pat:501,   capex:18, fcff:235,  cfoPatPct:50,  roce:15, type:"H" },
      { yr:"FY19",  rev:1151, opm:1,   opProfit:9,    cfo:276,  pat:592,   capex:22, fcff:254,  cfoPatPct:47,  roce:4,  type:"H" },
      { yr:"FY20",  rev:1312, opm:-27, opProfit:-350, cfo:350,  pat:-246,  capex:25, fcff:325,  cfoPatPct:null,roce:-13,type:"H" },
      { yr:"FY21",  rev:1128, opm:7,   opProfit:74,   cfo:276,  pat:1418,  capex:20, fcff:256,  cfoPatPct:19,  roce:4,  type:"H" },
      { yr:"FY22",  rev:1589, opm:28,  opProfit:446,  cfo:707,  pat:12882, capex:30, fcff:677,  cfoPatPct:5,   roce:23, type:"H" },
      { yr:"FY23",  rev:2346, opm:15,  opProfit:348,  cfo:512,  pat:-70,   capex:45, fcff:467,  cfoPatPct:null,roce:3,  type:"H" },
      { yr:"FY24",  rev:2536, opm:28,  opProfit:711,  cfo:702,  pat:595,   capex:55, fcff:647,  cfoPatPct:118, roce:4,  type:"H" },
      { yr:"FY25",  rev:2850, opm:31,  opProfit:874,  cfo:876,  pat:1310,  capex:60, fcff:816,  cfoPatPct:67,  roce:3,  type:"H" },
      { yr:"FY26E", rev:3245, opm:36,  opProfit:1168, cfo:1050, pat:860,   capex:70, fcff:980,  cfoPatPct:122, roce:4,  type:"P" },
      { yr:"FY27E", rev:3770, opm:38,  opProfit:1433, cfo:1280, pat:1060,  capex:80, fcff:1200, cfoPatPct:121, roce:4,  type:"P" },
      { yr:"FY28E", rev:4349, opm:39,  opProfit:1696, cfo:1500, pat:1255,  capex:90, fcff:1410, cfoPatPct:120, roce:5,  type:"P" },
      { yr:"FY29E", rev:5118, opm:41,  opProfit:2047, cfo:1780, pat:1515,  capex:100,fcff:1680, cfoPatPct:117, roce:5,  type:"P" },
      { yr:"FY30E", rev:6850, opm:42,  opProfit:2877, cfo:2100, pat:2129,  capex:120,fcff:1980, cfoPatPct:99,  roce:6,  type:"P" },
    ],

    // ── Segment revenue (columns = your segments, can vary per stock) ──
    segmentKeys: ["naukri", "acres", "others"],
    segmentLabels: { naukri: "Naukri", acres: "99acres", others: "Others" },
    segData: [
      { yr:"FY22",  naukri:1558, acres:217, others:155,  total:1930 },
      { yr:"FY23",  naukri:1990, acres:310, others:210,  total:2510 },
      { yr:"FY24",  naukri:2250, acres:356, others:265,  total:2871 },
      { yr:"FY25",  naukri:2505, acres:420, others:320,  total:3245 },
      { yr:"FY26E", naukri:2900, acres:490, others:380,  total:3770 },
      { yr:"FY27E", naukri:3329, acres:575, others:445,  total:4349 },
      { yr:"FY28E", naukri:3923, acres:675, others:520,  total:5118 },
      { yr:"FY29E", naukri:4530, acres:790, others:600,  total:5920 },
      { yr:"FY30E", naukri:5255, acres:920, others:675,  total:6850 },
    ],

    // ── Porter's 5 Forces
    // Each force row has "force" key + up to 3 business keys
    porterKeys: ["naukri", "acres", "jeevansathi"],
    porterLabels: { naukri: "Naukri", acres: "99acres", jeevansathi: "Jeevansathi" },
    porterData: [
      { force:"New Entrants",  naukri:9, acres:5, jeevansathi:5 },
      { force:"Buyer Power",   naukri:8, acres:5, jeevansathi:5 },
      { force:"Supplier Power",naukri:9, acres:9, jeevansathi:9 },
      { force:"Substitutes",   naukri:7, acres:5, jeevansathi:4 },
      { force:"Rivalry",       naukri:9, acres:3, jeevansathi:3 },
    ],
    porterNarrative: [
      { force:"Threat of New Entrants",     lines:["Naukri: LOW — 82M resume moat, network effects","99acres: MODERATE — Multi-homing","Jeevansathi: MODERATE — Dating apps"] },
      { force:"Bargaining Power of Buyers", lines:["Naukri: LOW — Mission-critical, switching cost","99acres: MODERATE — Builders multi-home","Jeevansathi: MODERATE — Users multi-platform"] },
      { force:"Supplier Power",             lines:["Naukri: VERY LOW — Platform, no raw materials","99acres: VERY LOW","Jeevansathi: VERY LOW"] },
      { force:"Threat of Substitutes",      lines:["Naukri: LOW-MOD — LinkedIn = partial sub","99acres: MODERATE — NoBroker, direct","Jeevansathi: MOD-HIGH — Dating apps"] },
      { force:"Competitive Rivalry",        lines:["Naukri: VERY LOW — Near monopoly","99acres: HIGH — Housing, MagicBricks","Jeevansathi: HIGH — Shaadi.com leads"] },
    ],
    porterConclusion: "Naukri has a VERY WIDE moat. 5 out of 5 forces favorable. Only LinkedIn poses a partial substitute threat.",

    // ── Quality scorecard ──
    qualityData: [
      { param:"Longevity",         score:9, full:"31yrs ops, 20yrs listed" },
      { param:"Predictable CF",    score:7, full:"Growing CFO, hiring cycle risk" },
      { param:"ROCE",              score:5, full:"3% consol (35-40% standalone)" },
      { param:"Revenue Resilience",score:7, full:"15% 10yr CAGR, 1 dip" },
      { param:"EPS Stability",     score:4, full:"Volatile (-4 to +198)" },
      { param:"CFO/PAT",           score:6, full:"Good standalone, consol noisy" },
      { param:"Margins",           score:8, full:"36% OPM, Naukri 47-50%" },
      { param:"Reinvestment",      score:7, full:"36% IRR on VC portfolio" },
    ],
    qualitySummary: {
      consolidated: "6.6/10",
      standalone:   "7.5/10",
      insight:      "Quality score depressed by investment portfolio impact on consol metrics. On standalone basis, wide-moat platform monopoly with 36% OPM and 15% revenue CAGR.",
    },

    // ── Sensitivity matrix ──
    sensitivity: {
      cmp: 1100,
      peColumns: [
        { label:"30x (De-rate)", key:"pe30" },
        { label:"40x (Base)",    key:"pe40" },
        { label:"50x (Re-rate)", key:"pe50" },
        { label:"60x (Premium)", key:"pe60" },
      ],
      rows: [
        { label:"Bear ₹23.5", pe30:705,  pe40:940,  pe50:1175, pe60:1410 },
        { label:"Base ₹32.8", pe30:984,  pe40:1312, pe50:1640, pe60:1968 },
        { label:"Bull ₹42.1", pe30:1263, pe40:1684, pe50:2105, pe60:2526 },
      ],
      scenarios: [
        { label:"BEAR",      color:"RED",   rev:"₹5,700 Cr", opm:"36%", eps:"₹23.5", pe:"30–40x", target:"₹705–940",    desc:"Hiring slows to 12% CAGR. Margins stagnate. Market de-rates platform businesses." },
        { label:"BASE CASE", color:"BLUE",  rev:"₹6,850 Cr", opm:"42%", eps:"₹32.8", pe:"40–50x", target:"₹1,312–1,640",desc:"16% CAGR driven by Naukri + 99acres scaling. OPM expands to 42%." },
        { label:"BULL",      color:"GREEN", rev:"₹8,200 Cr", opm:"45%", eps:"₹42.1", pe:"50–60x", target:"₹2,105–2,526",desc:"20% CAGR. All segments fire. Market re-rates as monopoly quality is recognized." },
      ],
      conclusion: "Base Case FY30 Target: ₹1,700–2,100 (12–17% CAGR from ₹1,100). Investment portfolio (₹36,855 Cr) provides additional margin of safety.",
    },
  
    dcf: {
      wacc:         13.0,
      termGrowth:   8.0,
      isNBFC:       false,
      wcRev:        0,
      taxRate:      25,
      interestRate: 0,
      note: "Asset-light internet classifieds. Zero net debt. Terminal growth 8% reflects digital hiring TAM.",
    },
},


  // ─────────────────────────────────────────────
  //  EICHER MOTORS
  // ─────────────────────────────────────────────
  "EICHERMOT": {
    id:           "EICHERMOT",
    name:         "Eicher Motors Ltd",
    nse:          "EICHERMOT",
    bse:          "505200",
    indices:      "Nifty 50",
    sector:       "Automobiles / Premium Motorcycles",
    rating:       "BUY",
    description:  "India's only listed pure-play premium motorcycle company, owning the iconic Royal Enfield brand with 88.9% market share in the 250cc+ segment. Also holds 49.98% in VECV (Volvo Eicher commercial vehicles). Combines cultural brand monopoly with disciplined capital allocation and zero net debt.",

    metrics: [
      { label:"CMP",        value:"₹8,190",          sub:"Feb 27, 2026"           },
      { label:"Market Cap", value:"₹2,24,000 Cr",    sub:"$27.3B · Nifty 50", color:"GOLD"   },
      { label:"Target",value:"₹12,500–15,000",  sub:"14–16% CAGR",       color:"GREEN"  },
      { label:"P/E (TTM)",  value:"~41x",             sub:"FY26E ~29x",         color:"TEAL"   },
      { label:"OPM",        value:"25%",              sub:"FY25; 10Y avg ~26%", color:"BLUE"   },
      { label:"Quality",    value:"8.9/10",           sub:"Exceptional Compounder", color:"ORANGE" },
    ],

    thesis: [
      { t:"Royal Enfield = Cultural Monopoly",     d:"88.9% share of India's 250cc+ segment. 125-year brand selling aspiration, not just motorcycles. 10.5L units FY25 with no credible price-point challenger." },
      { t:"Exceptional Financial Quality",         d:"25% PAT margin, 30% ROCE, 24% ROE, ~0 debt, ₹14,791 Cr investment warchest. CFO/PAT avg 98% over 9 years. Negative working capital cycle." },
      { t:"Clear Multi-Year Growth Runway",        d:"Capacity expanding 37% to 20L units. Flying Flea EV platform launched. CKD in Thailand + Brazil. 1,000+ international retail points in 70+ countries." },
      { t:"Valuation: FY30E P/E Only 21x at CMP", d:"At ₹8,190, FY30E P/E is ~21x. EPS CAGR of 14–16% from here. 30% ROCE + dominant franchise + EV optionality at a reasonable entry for a 4-year hold." },
    ],

    finData: [
      { yr:"FY16",  rev:6173,  opm:27, opProfit:1667, cfo:1463, pat:1338, capex:235, fcff:1228, cfoPatPct:109, roce:51, type:"H" },
      { yr:"FY17",  rev:7033,  opm:31, opProfit:2180, cfo:1708, pat:1667, capex:280, fcff:1428, cfoPatPct:102, roce:53, type:"H" },
      { yr:"FY18",  rev:8965,  opm:31, opProfit:2779, cfo:2482, pat:1960, capex:660, fcff:1822, cfoPatPct:127, roce:49, type:"H" },
      { yr:"FY19",  rev:9797,  opm:30, opProfit:2939, cfo:1575, pat:2203, capex:523, fcff:1052, cfoPatPct:72,  roce:41, type:"H" },
      { yr:"FY20",  rev:9154,  opm:24, opProfit:2197, cfo:1694, pat:1827, capex:350, fcff:1344, cfoPatPct:93,  roce:25, type:"H" },
      { yr:"FY21",  rev:8720,  opm:20, opProfit:1744, cfo:1691, pat:1347, capex:350, fcff:1341, cfoPatPct:126, roce:17, type:"H" },
      { yr:"FY22",  rev:10298, opm:21, opProfit:2163, cfo:1527, pat:1677, capex:440, fcff:1087, cfoPatPct:91,  roce:18, type:"H" },
      { yr:"FY23",  rev:14442, opm:24, opProfit:3466, cfo:2823, pat:2914, capex:570, fcff:2253, cfoPatPct:97,  roce:27, type:"H" },
      { yr:"FY24",  rev:17331, opm:25, opProfit:4333, cfo:3730, pat:4001, capex:640, fcff:3090, cfoPatPct:93,  roce:30, type:"H" },
      { yr:"FY25",  rev:19803, opm:25, opProfit:4951, cfo:4200, pat:4501, capex:750, fcff:3450, cfoPatPct:93,  roce:30, type:"H" },
      { yr:"FY26E", rev:22500, opm:26, opProfit:5850, cfo:4900, pat:5300, capex:850, fcff:4050, cfoPatPct:92,  roce:32, type:"P" },
      { yr:"FY27E", rev:25800, opm:27, opProfit:6966, cfo:5700, pat:6200, capex:950, fcff:4750, cfoPatPct:92,  roce:34, type:"P" },
      { yr:"FY28E", rev:29200, opm:27, opProfit:7884, cfo:6500, pat:7100, capex:1050,fcff:5450, cfoPatPct:92,  roce:35, type:"P" },
      { yr:"FY29E", rev:33000, opm:28, opProfit:9240, cfo:7400, pat:8150, capex:1100,fcff:6300, cfoPatPct:91,  roce:36, type:"P" },
      { yr:"FY30E", rev:37500, opm:28, opProfit:10500,cfo:8400, pat:9500, capex:1200,fcff:7200, cfoPatPct:88,  roce:37, type:"P" },
    ],

    segmentKeys: ["re", "vecv", "parts"],
    segmentLabels: { re:"Royal Enfield", vecv:"VECV (50%)", parts:"Parts & Accessories" },
    segData: [
      { yr:"FY22",  re:8900,  vecv:850,  parts:548,  total:10298 },
      { yr:"FY23",  re:12500, vecv:1200, parts:742,  total:14442 },
      { yr:"FY24",  re:15200, vecv:1300, parts:831,  total:17331 },
      { yr:"FY25",  re:17500, vecv:1400, parts:903,  total:19803 },
      { yr:"FY26E", re:20000, vecv:1500, parts:1000, total:22500 },
      { yr:"FY27E", re:23000, vecv:1600, parts:1200, total:25800 },
      { yr:"FY28E", re:26000, vecv:1900, parts:1300, total:29200 },
      { yr:"FY30E", re:33500, vecv:2200, parts:1800, total:37500 },
    ],

    porterKeys: ["re", "vecv"],
    porterLabels: { re:"Royal Enfield", vecv:"VECV" },
    porterData: [
      { force:"New Entrants",  re:9, vecv:6 },
      { force:"Buyer Power",   re:9, vecv:6 },
      { force:"Supplier Power",re:8, vecv:6 },
      { force:"Substitutes",   re:8, vecv:5 },
      { force:"Rivalry",       re:9, vecv:5 },
    ],
    porterNarrative: [
      { force:"Threat of New Entrants",     lines:["RE: LOW — 125-year brand moat, aspiration-based buying. Harley/Triumph at 2x price.","VECV: MODERATE — Tata, Ashok Leyland"] },
      { force:"Bargaining Power of Buyers", lines:["RE: VERY LOW — Buyers aspire for years, 3-4 month waitlists historically","VECV: MODERATE — Fleet operators negotiate"] },
      { force:"Supplier Power",             lines:["RE: LOW — ~25% captive manufacturing, multi-supplier policy","VECV: LOW-MOD — Engine partnership with Volvo is an advantage"] },
      { force:"Threat of Substitutes",      lines:["RE: LOW — No substitute for the 'thump'. EVs at early stage, different use case","VECV: MOD — Electric CVs emerging"] },
      { force:"Competitive Rivalry",        lines:["RE: VERY LOW — 88.9% segment share. KTM, Triumph sub-5%","VECV: MODERATE — Volvo technology differentiates premium CV"] },
    ],
    porterConclusion: "Royal Enfield operates in an almost captive competitive structure. Brand loyalty and cultural identity are the moat — not switchable on price.",

    qualityData: [
      { param:"Longevity",         score:10, full:"125yr brand, 30yr compounding" },
      { param:"Predictable CF",    score:9,  full:"CFO/PAT avg 98% over 9 years" },
      { param:"ROCE",              score:9,  full:"30% ROCE, improving" },
      { param:"Revenue Resilience",score:8,  full:"21% CAGR FY21-25, 1 COVID dip" },
      { param:"EPS Stability",     score:9,  full:"Consistent growth, no erratic swings" },
      { param:"CFO/PAT",           score:9,  full:"Near 100% conversion, neg. working capital" },
      { param:"Margins",           score:8,  full:"25% OPM, targeting 28% by FY30" },
      { param:"Reinvestment",      score:9,  full:"Cheyyar plant, EV, international expansion" },
    ],
    qualitySummary: {
      consolidated: "8.9/10",
      standalone:   "8.9/10",
      insight:      "Best-in-class Indian auto compounder. Negative working capital, near-100% CFO/PAT, 30% ROCE, zero net debt. RE brand is culturally irreplaceable.",
    },

    sensitivity: {
      cmp: 8190,
      peColumns: [
        { label:"25x (De-rate)", key:"pe25" },
        { label:"32x (Base)",    key:"pe32" },
        { label:"40x (Re-rate)", key:"pe40" },
        { label:"50x (Premium)", key:"pe50" },
      ],
      rows: [
        { label:"Bear ₹280", pe25:7000,  pe32:8960,  pe40:11200, pe50:14000 },
        { label:"Base ₹360", pe25:9000,  pe32:11520, pe40:14400, pe50:18000 },
        { label:"Bull ₹430", pe25:10750, pe32:13760, pe40:17200, pe50:21500 },
      ],
      scenarios: [
        { label:"BEAR",      color:"RED",   rev:"₹31,000 Cr", opm:"25%", eps:"₹280", pe:"25–32x", target:"₹7,000–8,960",  desc:"Volume growth disappoints at 10% CAGR. EV disruption earlier than expected." },
        { label:"BASE CASE", color:"BLUE",  rev:"₹37,500 Cr", opm:"28%", eps:"₹360", pe:"32–40x", target:"₹11,520–14,400",desc:"15% volume CAGR. OPM expands to 28%. International gains traction." },
        { label:"BULL",      color:"GREEN", rev:"₹44,000 Cr", opm:"30%", eps:"₹430", pe:"40–50x", target:"₹17,200–21,500",desc:"20% CAGR. Flying Flea EV is a category creator. Re-rates to global luxury auto multiples." },
      ],
      conclusion: "Base Case FY30 Target: ₹12,500–15,000 (14–16% CAGR from ₹8,190). At CMP, FY30E P/E of ~21x is attractive for a 30% ROCE franchise.",
    },
  
    dcf: {
      wacc:         12.0,
      termGrowth:   7.0,
      isNBFC:       false,
      wcRev:        2.0,
      taxRate:      25,
      interestRate: 0,
      note: "Premium motorcycle franchise with zero net debt. CoE 12% reflects quality premium. Terminal growth 7% equals nominal GDP.",
    },
},


  // ─────────────────────────────────────────────
  //  IGI (IGIL)
  // ─────────────────────────────────────────────
  "IGIL": {
    id:           "IGIL",
    name:         "International Gemmological Institute (India) Ltd",
    nse:          "IGIL",
    bse:          "544311",
    indices:      "Nifty Smallcap 100",
    sector:       "Certification / Gems & Jewellery",
    rating:       "BUY",
    description:  "World's largest independent diamond and gemstone certification lab, holding 33% global market share and certifying 65% of all lab-grown diamonds worldwide. A pure picks-and-shovels play — every diamond entering organised retail needs an IGI certificate, making revenues agnostic to diamond price cycles.",

    metrics: [
      { label:"CMP",          value:"₹330",         sub:"Feb 2026"              },
      { label:"Market Cap",   value:"₹14,200 Cr",   sub:"$1.7B",    color:"GOLD"   },
      { label:"Target",  value:"₹550–700",     sub:"14–20% CAGR", color:"GREEN" },
      { label:"ROCE",         value:"68%",          sub:"CY24 (99% pre-acq)", color:"TEAL" },
      { label:"EBITDA Margin",value:"60%",          sub:"CY25",     color:"BLUE"   },
      { label:"Quality",      value:"8.0/10",       sub:"High-Quality Monopoly", color:"ORANGE" },
    ],

    thesis: [
      { t:"Global Certification Monopoly",  d:"World's #1 independent certifier. 33% global share, 50% India share, 65% of all LGD certifications worldwide." },
      { t:"Picks-and-Shovels Play",         d:"Toll-road on the entire diamond value chain. Every diamond entering organized retail needs certification. IGI earns regardless of diamond prices." },
      { t:"Exceptional Unit Economics",     d:"68% ROCE, 60% EBITDA margins, near-zero debt. Asset-light model: brand trust + gemologists = revenue. No inventory, no factories." },
      { t:"LGD Structural Tailwind",        d:"Lab-grown diamonds growing at 19% CAGR. IGI holds 65% LGD certification share. Volume explosion = certification demand explosion." },
    ],

    finData: [
      { yr:"CY20",  rev:292,  opm:62, opProfit:181, cfo:120, pat:132, capex:8,  fcff:112, cfoPatPct:91, roce:85, type:"H" },
      { yr:"CY21",  rev:407,  opm:65, opProfit:265, cfo:155, pat:195, capex:10, fcff:145, cfoPatPct:79, roce:90, type:"H" },
      { yr:"CY22",  rev:491,  opm:68, opProfit:335, cfo:194, pat:242, capex:12, fcff:182, cfoPatPct:80, roce:92, type:"H" },
      { yr:"CY23",  rev:639,  opm:71, opProfit:450, cfo:303, pat:325, capex:15, fcff:288, cfoPatPct:93, roce:99, type:"H" },
      { yr:"CY24",  rev:1053, opm:57, opProfit:600, cfo:393, pat:427, capex:25, fcff:368, cfoPatPct:92, roce:68, type:"H" },
      { yr:"CY25",  rev:1229, opm:60, opProfit:737, cfo:480, pat:532, capex:30, fcff:450, cfoPatPct:90, roce:55, type:"H" },
      { yr:"FY27E", rev:1450, opm:60, opProfit:870, cfo:570, pat:630, capex:35, fcff:535, cfoPatPct:90, roce:52, type:"P" },
      { yr:"FY28E", rev:1700, opm:61, opProfit:1040,cfo:690, pat:760, capex:40, fcff:650, cfoPatPct:91, roce:50, type:"P" },
      { yr:"FY29E", rev:2000, opm:62, opProfit:1240,cfo:840, pat:920, capex:45, fcff:795, cfoPatPct:91, roce:48, type:"P" },
      { yr:"FY30E", rev:2350, opm:63, opProfit:1480,cfo:1010,pat:1100,capex:50, fcff:960, cfoPatPct:92, roce:48, type:"P" },
    ],

    segmentKeys: ["diamond", "jewelry", "education", "colored", "other"],
    segmentLabels: { diamond:"Natural Diamond Cert", jewelry:"Jewelry Cert", education:"Education", colored:"Colored Stones", other:"Other" },
    segData: [
      { yr:"CY22",  diamond:344, jewelry:74,  education:25, colored:25, other:23, total:491  },
      { yr:"CY23",  diamond:447, jewelry:96,  education:32, colored:32, other:32, total:639  },
      { yr:"CY24",  diamond:737, jewelry:158, education:53, colored:53, other:52, total:1053 },
      { yr:"CY25",  diamond:860, jewelry:184, education:62, colored:62, other:61, total:1229 },
      { yr:"FY27E", diamond:1015,jewelry:218, education:73, colored:73, other:71, total:1450 },
      { yr:"FY28E", diamond:1190,jewelry:255, education:85, colored:85, other:85, total:1700 },
      { yr:"FY29E", diamond:1400,jewelry:300, education:100,colored:100,other:100,total:2000 },
      { yr:"FY30E", diamond:1645,jewelry:353, education:118,colored:118,other:116,total:2350 },
    ],

    porterKeys: ["natural", "lgd", "jewelry"],
    porterLabels: { natural:"Natural Diamonds", lgd:"LGD", jewelry:"Jewelry Cert" },
    porterData: [
      { force:"New Entrants",  natural:9, lgd:9, jewelry:8 },
      { force:"Buyer Power",   natural:8, lgd:8, jewelry:7 },
      { force:"Supplier Power",natural:9, lgd:9, jewelry:9 },
      { force:"Substitutes",   natural:8, lgd:7, jewelry:6 },
      { force:"Rivalry",       natural:9, lgd:8, jewelry:7 },
    ],
    porterNarrative: [
      { force:"Threat of New Entrants",     lines:["Natural Diamonds: VERY LOW — 50+ year reputation, trusted brand","LGD: VERY LOW — Same trust requirements, IGI pioneered LGD certs","Jewelry: LOW — IGI brand acts as quality signal"] },
      { force:"Bargaining Power of Buyers", lines:["Natural: LOW — GIA/IGI cert is retailer table-stakes","LGD: LOW — Buyers demand IGI certs specifically","Jewelry: LOW-MOD — More brand fungibility"] },
      { force:"Supplier Power",             lines:["All segments: VERY LOW — Platform model. Gemologists are paid employees, not contractors"] },
      { force:"Threat of Substitutes",      lines:["Natural: LOW — GIA only peer at premium","LGD: VERY LOW — IGI is THE standard","Jewelry: MOD — Some retailers use in-house labs"] },
      { force:"Competitive Rivalry",        lines:["Natural: LOW — GIA premium, IGI volume. Duopoly at top","LGD: VERY LOW — IGI has 65% share, GIA catching up slowly","Jewelry: LOW — IGI expanding rapidly"] },
    ],
    porterConclusion: "IGI is a toll-road with near-monopoly characteristics. Brand trust built over 50 years cannot be replicated. LGD certification is an emerging natural monopoly.",

    qualityData: [
      { param:"Longevity",         score:9,  full:"50+ year global brand, 25yr India ops" },
      { param:"Predictable CF",    score:9,  full:"90%+ CFO/PAT, volume-driven model" },
      { param:"ROCE",              score:10, full:"99% pre-acquisition, 68% post (still exceptional)" },
      { param:"Revenue Resilience",score:8,  full:"25%+ CAGR, agnostic to diamond prices" },
      { param:"EPS Stability",     score:7,  full:"Consistent; minor acquisition noise" },
      { param:"CFO/PAT",           score:9,  full:"90-93% range, very clean conversion" },
      { param:"Margins",           score:9,  full:"60-71% EBITDA, best-in-class globally" },
      { param:"Reinvestment",      score:8,  full:"Lab expansion, education vertical, LGD growth" },
    ],
    qualitySummary: {
      consolidated: "8.0/10",
      standalone:   "8.9/10",
      insight:      "Pre-acquisition standalone quality was near-perfect (99% ROCE, 70%+ margins). Post-IPO acquisition lowered reported ROCE to 68% — still exceptional. LGD tailwind is secular and not priced in.",
    },

    sensitivity: {
      cmp: 330,
      peColumns: [
        { label:"25x (De-rate)", key:"pe25" },
        { label:"35x (Base)",    key:"pe35" },
        { label:"45x (Re-rate)", key:"pe45" },
        { label:"55x (Premium)", key:"pe55" },
      ],
      rows: [
        { label:"Bear ₹8.5",  pe25:213,  pe35:298,  pe45:383,  pe55:468  },
        { label:"Base ₹12.5", pe25:313,  pe35:438,  pe45:563,  pe55:688  },
        { label:"Bull ₹16.0", pe25:400,  pe35:560,  pe45:720,  pe55:880  },
      ],
      scenarios: [
        { label:"BEAR",      color:"RED",   rev:"₹1,900 Cr", opm:"58%", eps:"₹8.5",  pe:"25–35x", target:"₹213–298",  desc:"LGD growth moderates. Diamond market weak. Volume growth slows to 10% CAGR." },
        { label:"BASE CASE", color:"BLUE",  rev:"₹2,350 Cr", opm:"63%", eps:"₹12.5", pe:"35–45x", target:"₹438–563",  desc:"19% CAGR. LGD boom continues. Margin expansion to 63%." },
        { label:"BULL",      color:"GREEN", rev:"₹2,800 Cr", opm:"65%", eps:"₹16.0", pe:"45–55x", target:"₹720–880",  desc:"25% CAGR. IGI becomes standard for all LGD globally. Market re-rates to global SaaS-like multiples." },
      ],
      conclusion: "Base Case FY30 Target: ₹550–700 (14–20% CAGR from ₹330). LGD certification structural tailwind provides visibility that is not yet fully priced in.",
    },
  
    dcf: {
      wacc:         13.5,
      termGrowth:   7.0,
      isNBFC:       false,
      wcRev:        3.0,
      taxRate:      25,
      interestRate: 7,
      note: "Mid-cap gems and jewellery. Higher CoE reflects sector cyclicality and smaller scale.",
    },
},

  // ─────────────────────────────────────────────
  //  MCX — Multi Commodity Exchange of India Ltd
  // ─────────────────────────────────────────────
  "MCX": {
    id:          "MCX",
    name:        "Multi Commodity Exchange of India Ltd",
    nse:         "MCX",
    bse:         "534091",
    indices:     "BSE 500 · Capital Markets",
    sector:      "Exchange & Financial Infrastructure",
    rating:      "BUY",
    description: "India's only listed commodity derivatives exchange with 97–98% market share in non-agricultural commodity derivatives — a near-absolute monopoly. After a technology migration crisis (FY24 OPM: 9%), MCX has staged a historic recovery: OPM expanded from 9% → 60% (FY25) → 76% (Q3 FY26). Charges a small fee per contract, takes zero commodity price risk, and benefits from structural deepening of India's ₹7.5 lakh Cr/day commodity market.",

    // ── Header metric tiles ──
    metrics: [
      { label: "CMP",         value: "₹2,447",      sub: "Feb 28, 2026"              },
      { label: "Market Cap",  value: "₹62,400 Cr",  sub: "25.5 Cr shares",  color: "GOLD"   },
      { label: "Target",      value: "₹5,150",      sub: "Base · 21% CAGR", color: "GREEN"  },
      { label: "TTM P/E",     value: "66.4x",       sub: "FY30E ~24x",      color: "TEAL"   },
      { label: "OPM",         value: "76%",         sub: "Q3 FY26",         color: "BLUE"   },
      { label: "Quality",     value: "7.9/10",      sub: "High Quality Compounder", color: "ORANGE" },
    ],

    // ── Investment thesis ──
    thesis: [
      { t: "Near-Absolute Monopoly (97–98% Share)",  d: "After 22 years and 7+ years of BSE/NSE failing to crack commodity markets, MCX's network effects are impregnable. Q3 FY26 ADT: ₹7,50,136 Cr/day (+224% YoY). No substitute replicates MCX's liquidity depth, retail accessibility, and exchange guarantee." },
      { t: "Operating Leverage Flywheel",             d: "Fixed quarterly costs ~₹175–195 Cr against Q3 FY26 revenue of ₹666 Cr → 76% OPM. Every incremental ₹1 of revenue above fixed costs converts at 85–90% to EBITDA. FY30E OPM projected at 73%." },
      { t: "Technology Risk Fully Behind It",         d: "63 Moons dependency — MCX's only structural vulnerability — is eliminated. MCX now owns its Universal Trading Platform (developed with TCS). Annual tech costs falling from ₹621 Cr (FY24) to normalised ₹200 Cr range, a permanent structural cost advantage." },
      { t: "FY30E P/E Only ~24x at CMP",             d: "At ₹2,447, you pay only ~24x projected FY30E EPS of ₹103. Base case target ₹5,150 (50x FY30E) = +111% over 4 years (21% CAGR). Institutional entry catalyst (banks/insurance/pensions into commodities) not yet priced in." },
    ],

    // ── Financial data — all from Screener.in verified in doc ──
    // Historical: FY16–FY25 from Table 13; Projections: FY26E–FY30E from Table 15
    // OPM FY24 = 9% (from text); CFO: FY17 & FY21 negative (SGF top-ups, shown as 0 in chart)
    // FCFF = CFO - Capex (capex estimated: FY16-23 ~30-60 Cr, FY24 ~150 Cr tech migration, FY25 ~95 Cr)
    finData: [
      { yr:"FY16",  rev:235,  opm:32, opProfit:75,   cfo:78,   pat:115,  capex:35,  fcff:43,   cfoPatPct:68,  roce:10, type:"H" },
      { yr:"FY17",  rev:259,  opm:31, opProfit:80,   cfo:-32,  pat:127,  capex:35,  fcff:null, cfoPatPct:null,roce:11, type:"H" },
      { yr:"FY18",  rev:260,  opm:29, opProfit:76,   cfo:99,   pat:108,  capex:40,  fcff:59,   cfoPatPct:92,  roce:8,  type:"H" },
      { yr:"FY19",  rev:300,  opm:31, opProfit:94,   cfo:258,  pat:146,  capex:40,  fcff:218,  cfoPatPct:177, roce:13, type:"H" },
      { yr:"FY20",  rev:398,  opm:45, opProfit:178,  cfo:449,  pat:236,  capex:45,  fcff:404,  cfoPatPct:190, roce:15, type:"H" },
      { yr:"FY21",  rev:391,  opm:47, opProfit:185,  cfo:-184, pat:225,  capex:45,  fcff:null, cfoPatPct:null,roce:16, type:"H" },
      { yr:"FY22",  rev:367,  opm:44, opProfit:161,  cfo:391,  pat:143,  capex:50,  fcff:341,  cfoPatPct:273, roce:14, type:"H" },
      { yr:"FY23",  rev:514,  opm:28, opProfit:145,  cfo:141,  pat:149,  capex:55,  fcff:86,   cfoPatPct:95,  roce:13, type:"H" },
      { yr:"FY24",  rev:684,  opm:9,  opProfit:63,   cfo:442,  pat:83,   capex:150, fcff:292,  cfoPatPct:533, roce:7,  type:"H" },
      { yr:"FY25",  rev:1113, opm:60, opProfit:665,  cfo:950,  pat:560,  capex:95,  fcff:855,  cfoPatPct:170, roce:43, type:"H" },
      { yr:"FY26E", rev:1800, opm:70, opProfit:1260, cfo:1100, pat:1082, capex:90,  fcff:1010, cfoPatPct:102, roce:60, type:"P" },
      { yr:"FY27E", rev:2160, opm:71, opProfit:1534, cfo:1470, pat:1460, capex:70,  fcff:1400, cfoPatPct:101, roce:75, type:"P" },
      { yr:"FY28E", rev:2590, opm:72, opProfit:1865, cfo:1915, pat:1890, capex:70,  fcff:1845, cfoPatPct:101, roce:85, type:"P" },
      { yr:"FY29E", rev:3108, opm:72, opProfit:2238, cfo:2300, pat:2280, capex:70,  fcff:2230, cfoPatPct:101, roce:90, type:"P" },
      { yr:"FY30E", rev:3730, opm:73, opProfit:2723, cfo:2655, pat:2620, capex:70,  fcff:2585, cfoPatPct:101, roce:95, type:"P" },
    ],

    // ── Segment revenue — ADT-driven breakdown (₹ Cr revenue proxy by segment)
    // Proportioned from Q3 FY26 ADT split: Bullion 69%, Energy 25%, Base Metals 6%
    segmentKeys: ["bullion", "energy", "metals"],
    segmentLabels: { bullion: "Bullion (Gold/Silver)", energy: "Energy (Crude/Gas)", metals: "Base Metals" },
    segData: [
      { yr:"FY22",  bullion:254, energy:92,  metals:21,  total:367  },
      { yr:"FY23",  bullion:354, energy:129, metals:31,  total:514  },
      { yr:"FY24",  bullion:472, energy:171, metals:41,  total:684  },
      { yr:"FY25",  bullion:768, energy:278, metals:67,  total:1113 },
      { yr:"FY26E", bullion:1242,energy:450, metals:108, total:1800 },
      { yr:"FY27E", bullion:1490,energy:540, metals:130, total:2160 },
      { yr:"FY28E", bullion:1787,energy:648, metals:155, total:2590 },
      { yr:"FY29E", bullion:2145,energy:777, metals:186, total:3108 },
      { yr:"FY30E", bullion:2574,energy:933, metals:223, total:3730 },
    ],

    // ── Porter's 5 Forces — scores from doc Section 3.2
    // Doc uses 1–5 scale (lower = better for MCX); converted to 1–10 (higher = stronger position)
    porterKeys: ["mcx"],
    porterLabels: { mcx: "MCX" },
    porterData: [
      { force: "New Entrants",   mcx: 9.5 },  // "Very Low" threat = 1.5/5 → 9.5/10
      { force: "Buyer Power",    mcx: 6.0 },  // "Moderate" = 3.0/5 → 6.0/10
      { force: "Supplier Power", mcx: 8.0 },  // "Low" = 2.0/5 → 8.0/10
      { force: "Substitutes",    mcx: 7.5 },  // "Moderate" = 2.5/5 → 7.5/10
      { force: "Rivalry",        mcx: 8.0 },  // "Low" = 2.0/5 → 8.0/10
    ],
    porterNarrative: [
      { force: "Threat of New Entrants",     lines: ["MCX: VERY LOW — SEBI recognition is a multi-year process requiring ₹100 Cr+ SGF. 22 years of liquidity depth in Gold/Silver/Crude cannot be replicated. BSE/NSE failed after 7+ years of trying."] },
      { force: "Bargaining Power of Buyers", lines: ["MCX: MODERATE — SEBI caps transaction charges. Large hedgers (Hindalco, ONGC) have some leverage. But no alternative platform = buyer power fundamentally limited."] },
      { force: "Supplier Power",             lines: ["MCX: LOW — 63 Moons dependency eliminated (FY24). MCX now owns its Universal Trading Platform. Remaining suppliers (data vendors, clearing) are interchangeable."] },
      { force: "Threat of Substitutes",      lines: ["MCX: LOW-MODERATE — OTC hedging lacks exchange guarantee; BSE/NSE commodity segments have <3% combined share after 7 years; CME/LME accessible only to large institutions."] },
      { force: "Competitive Rivalry",        lines: ["MCX: LOW — NCDEX operates only in agri (no overlap). BSE/NSE tried and failed. Exchange markets are winner-take-most: liquidity concentrates at the deepest market by 40–50x."] },
    ],
    porterConclusion: "MCX operates the most competitively fortified exchange in India. Network effects, regulatory moat, switching costs, and liquidity concentration create an essentially unassailable position. The only vulnerability (technology) is now resolved.",

    // ── Quality scorecard — all scores directly from Table 28 ──
    qualityData: [
      { param: "Longevity",         score: 8,   full: "22 yrs ops; survived NSEL, COVID, FY24 tech crisis. PAT positive every yr except FY13." },
      { param: "Predictable CF",    score: 7.5, full: "Structural advance collection; SGF events create lumpiness in FY17/FY21" },
      { param: "ROCE",              score: 9,   full: "43% FY25 (verified); projected 95% FY30E — sharpest ROCE recovery in Indian cap markets" },
      { param: "Revenue Resilience",score: 7,   full: "Cyclical ADT exposure; monopoly prevents permanent share loss. Flat/down in FY17, FY21, FY22." },
      { param: "EPS Stability",     score: 6.5, full: "FY24 trough ₹3.26 = genuine crisis. 25% 5Y CAGR (Screener). FY30E ₹103 = 22% CAGR from FY25." },
      { param: "CFO/PAT",           score: 8.5, full: "~150–170% avg excl. SGF events. Exchange model creates structural excess cash conversion." },
      { param: "Margins",           score: 9,   full: "76% OPM Q3 FY26; 5–6% capex/revenue. 85–90% incremental margin on new revenue." },
      { param: "Reinvestment",      score: 7.5, full: "ROCE 43%+; payout falling (27% FY25 vs 65% hist.) = reinvestment ramp-up in growth phase" },
    ],
    qualitySummary: {
      consolidated: "7.9/10",
      standalone:   "7.9/10",
      insight:      "Structural monopoly + technology risk resolved + massive operating leverage. Slightly below Eicher (8.9) due to commodity cyclicality and EPS volatility. No other listed Indian business has 97–98% market share in a SEBI-licensed, government-regulated segment.",
    },

    // ── Sensitivity — all figures directly from Tables 17 & 18 ──
    sensitivity: {
      cmp: 2447,
      peColumns: [
        { label: "35x (De-rate)", key: "pe35" },
        { label: "45x",           key: "pe45" },
        { label: "50x (Base)",    key: "pe50" },
        { label: "60x",           key: "pe60" },
        { label: "65x (Re-rate)", key: "pe65" },
      ],
      rows: [
        { label: "Bear ₹80",  pe35: 2800, pe45: 3600, pe50: 4000, pe60: 4800, pe65: 5200 },
        { label: "Base ₹103", pe35: 3605, pe45: 4635, pe50: 5150, pe60: 6180, pe65: 6695 },
        { label: "Bull ₹130", pe35: 4550, pe45: 5850, pe50: 6500, pe60: 7800, pe65: 8450 },
      ],
      scenarios: [
        { label: "BEAR",      color: "RED",   rev: "₹2,800 Cr", opm: "67%", eps: "₹80",  pe: "35x", target: "₹2,800",  desc: "ADT CAGR 12%, gold/crude calm, OPM plateaus. Still above CMP — downside protected by monopoly." },
        { label: "BASE CASE", color: "BLUE",  rev: "₹3,730 Cr", opm: "73%", eps: "₹103", pe: "50x", target: "₹5,150",  desc: "ADT CAGR 20% as modelled. OPM 73%. +111% return, 21% CAGR over 4 years from CMP." },
        { label: "BULL",      color: "GREEN", rev: "₹4,500+ Cr",opm: "74%", eps: "₹130", pe: "65x", target: "₹8,450",  desc: "ADT CAGR 27%. Banks/insurance/pensions allowed into commodities. +245% return, 36% CAGR." },
      ],
      conclusion: "Base Case FY30 Target: ₹5,150 (+111% from ₹2,447, 21% CAGR). Even Bear case at 35x EPS ₹80 = ₹2,800 — still above CMP, making downside structurally protected. Institutional participation catalyst (not priced in) = path to Bull case.",
    },
  
    dcf: {
      wacc:         13.0,
      termGrowth:   7.5,
      isNBFC:       false,
      wcRev:        0,
      taxRate:      25,
      interestRate: 0,
      note: "Asset-light exchange model. Zero debt. Terminal growth 7.5% reflects commodity trading TAM expansion.",
    },
},

// ─────────────────────────────────────────────
//  YATHARTH HOSPITAL & TRAUMA CARE SERVICES
// ─────────────────────────────────────────────
"YATHARTH": {
  id:          "YATHARTH",
  name:        "Yatharth Hospital & Trauma Care Services Ltd",
  nse:         "YATHARTH",
  bse:         "543950",
  indices:     "BSE SmallCap · BSE Healthcare",
  sector:      "Healthcare / Hospitals",
  rating:      "BUY",
  description: "Delhi-NCR's fastest-growing listed super-specialty hospital chain with 7 hospitals and 2,550+ beds. Scaled from ₹136 Cr revenue (FY20) to ₹860 Cr (FY25) — a 45% CAGR — and is on track to cross ₹1,200 Cr in FY26. Near-debt-free (₹12 Cr borrowings) with ₹600 Cr QIP deployed for acquisitions. Plans to nearly double capacity to ~5,000 beds within 3–4 years. Trades at ~42x TTM P/E vs Max (71x), Apollo (61x), Medanta (63x) — a 30–60% discount to peers.",

  // ── Header metric tiles ──
  metrics: [
    { label: "CMP",        value: "₹700",       sub: "Feb 26, 2026"                    },
    { label: "Market Cap", value: "₹6,800 Cr",  sub: "9.6 Cr shares",    color: "GOLD"   },
    { label: "Target",     value: "₹850–950",   sub: "21–36% upside · 12M", color: "GREEN"  },
    { label: "P/E (TTM)",  value: "~42x",       sub: "FY27E ~31x",       color: "TEAL"   },
    { label: "ARPOB",      value: "₹33,744",    sub: "Q3 FY26 · +10% YoY", color: "BLUE"   },
    { label: "Quality",    value: "6.5/10",     sub: "High-Growth Compounder", color: "ORANGE" },
  ],

  // ── Investment thesis ──
  thesis: [
    { t: "Fastest-Growing Listed Hospital Chain",     d: "45% revenue CAGR over 5 years — 3.4x the industry average of 13.4%. Q3 FY26: 46% YoY revenue growth, 49% PAT growth. Revenue on track to cross ₹1,200 Cr in FY26." },
    { t: "Bed Doubling at Disciplined Pace",          d: "Expanding from 2,550+ to ~5,000 beds over 3–4 years. New hospitals (Delhi, Faridabad Sec-20) contributed ₹27.9 Cr in Q1, Agra (250 beds) added Feb 2026. Management's acquisition track record: Faridabad Sec-6 went from 0% to 55% occupancy in 18 months." },
    { t: "Near-Debt-Free + ARPOB Growth Story",       d: "Borrowings fell from ₹267 Cr (FY23) to ₹12 Cr (FY25) via QIP. ARPOB growing 10% YoY to ₹33,744 (Q3 FY26) driven by super-specialty mix shift — oncology now ~10% of revenue vs 4% in FY24." },
    { t: "Steep Valuation Discount to Peers at FY28E",d: "At CMP ₹700, FY28E P/E is only ~18x vs sector norms of 50–71x. EV/EBITDA at just 13x FY28E estimates. 4-analyst consensus target ₹935 (+34%). As new hospitals break even and ROE normalises to 18–22% by FY28, re-rating becomes highly probable." },
  ],

  // ── Financial data — Historical FY20–FY25 from doc; projections FY26E–FY29E from doc Section 9.1
  // CFO: FY21–FY23 from Nuvama research; FY24 = -3 Cr (doc); FY25 = 150 Cr (doc)
  // Capex: FY22–FY24 from Nuvama; FY25 = 420 Cr (doc investing outflows); FY26E–FY27E from Nuvama
  // ROCE: FY22–FY23 from Equitymaster; FY24–FY25 from doc (14%)
  finData: [
    { yr:"FY20",  rev:136,  opm:28, opProfit:38,  cfo:10,   pat:-2,  capex:15,  fcff:-5,   cfoPatPct:null, roce:-1,  type:"H" },
    { yr:"FY21",  rev:215,  opm:32, opProfit:68,  cfo:45,   pat:20,  capex:5,   fcff:40,   cfoPatPct:225,  roce:15,  type:"H" },
    { yr:"FY22",  rev:375,  opm:30, opProfit:112, cfo:60,   pat:44,  capex:71,  fcff:-11,  cfoPatPct:136,  roce:26,  type:"H" },
    { yr:"FY23",  rev:478,  opm:28, opProfit:135, cfo:64,   pat:66,  capex:23,  fcff:41,   cfoPatPct:97,   roce:27,  type:"H" },
    { yr:"FY24",  rev:635,  opm:29, opProfit:182, cfo:-3,   pat:114, capex:155, fcff:-158, cfoPatPct:null, roce:14,  type:"H" },
    { yr:"FY25",  rev:860,  opm:26, opProfit:225, cfo:150,  pat:131, capex:420, fcff:-270, cfoPatPct:115,  roce:14,  type:"H" },
    { yr:"FY26E", rev:1120, opm:24, opProfit:269, cfo:205,  pat:151, capex:150, fcff:55,   cfoPatPct:136,  roce:11,  type:"P" },
    { yr:"FY27E", rev:1500, opm:25, opProfit:375, cfo:295,  pat:220, capex:200, fcff:95,   cfoPatPct:134,  roce:14,  type:"P" },
    { yr:"FY28E", rev:2000, opm:26, opProfit:520, cfo:430,  pat:321, capex:200, fcff:230,  cfoPatPct:134,  roce:18,  type:"P" },
    { yr:"FY29E", rev:2500, opm:27, opProfit:675, cfo:555,  pat:433, capex:200, fcff:355,  cfoPatPct:128,  roce:22,  type:"P" },
  ],

  // ── Segment revenue: Inpatient vs Outpatient (₹ Cr)
  // From Nuvama research data; IP/OP proportioned to match doc total revenue
  segmentKeys: ["ip", "op"],
  segmentLabels: { ip: "Inpatient", op: "Outpatient / Pharmacy" },
  segData: [
    { yr:"FY21",  ip:187, op:28,  total:215  },
    { yr:"FY22",  ip:327, op:48,  total:375  },
    { yr:"FY23",  ip:416, op:62,  total:478  },
    { yr:"FY24",  ip:556, op:79,  total:635  },
    { yr:"FY25",  ip:756, op:104, total:860  },
    { yr:"FY26E", ip:1016,op:104, total:1120 },
    { yr:"FY27E", ip:1356,op:144, total:1500 },
    { yr:"FY28E", ip:1816,op:184, total:2000 },
    { yr:"FY29E", ip:2272,op:228, total:2500 },
  ],

  // ── Porter's 5 Forces — single business "YATHARTH"
  porterKeys: ["yatharth"],
  porterLabels: { yatharth: "Yatharth" },
  porterData: [
    { force: "New Entrants",   yatharth: 5.5 },   // Max, Fortis expanding in NCR — moderate barrier (capital + licenses + ramp time)
    { force: "Buyer Power",    yatharth: 4.5 },   // NCR patients have Apollo, Max, Medanta options — moderate power
    { force: "Supplier Power", yatharth: 5.0 },   // Star doctors are mobile and have negotiating power
    { force: "Substitutes",    yatharth: 7.0 },   // No substitute for emergency/super-specialty care; insurance limits shopping
    { force: "Rivalry",        yatharth: 4.0 },   // Intense in core NCR; Tier-2 suburbs (Greater Noida, Faridabad) less contested
  ],
  porterNarrative: [
    { force: "Threat of New Entrants",     lines: ["MODERATE — Building a hospital requires ₹500–1,000 Cr, 3–5 years to license and ramp. However, Max, Medanta, Fortis are all actively expanding in NCR. Yatharth partially mitigates by targeting Tier-2 NCR suburbs (Greater Noida ext., Faridabad) with less large-chain competition."] },
    { force: "Bargaining Power of Buyers", lines: ["MODERATE-HIGH — Delhi-NCR patients have Apollo, Max, Fortis, Medanta all within reach. Insurance-linked patients follow TPA empanelments. Yatharth's ARPOB at ₹33,744 vs Max's ₹73,000 shows pricing gap — but this also signals significant upside as mix improves."] },
    { force: "Supplier Power",             lines: ["MODERATE — Senior specialist doctors ('star doctors') are mobile and can demand high salaries or move to competitors. Management is actively recruiting star doctors for newer units. Commodity supplies (drugs, devices) have multiple vendors — no concentration risk."] },
    { force: "Threat of Substitutes",      lines: ["LOW-MODERATE — Emergency trauma and super-specialty procedures (oncology, bone marrow transplant, robotics) have no substitutes. Routine procedures face some competition from standalone clinics. Insurance coverage reduces price sensitivity for insured patients."] },
    { force: "Competitive Rivalry",        lines: ["HIGH in Core NCR — Apollo, Max, Fortis, Medanta all expanding. Medanta launching Noida hospital directly. MODERATE in Tier-2 suburbs — Faridabad Sec-6 and Sec-20, Greater Noida ext. have far less large-chain competition, where Yatharth is building its growth base."] },
  ],
  porterConclusion: "Yatharth does NOT have a wide moat — it operates in a competitive geography. Its edge is execution speed (45% CAGR), targeting under-served NCR suburbs, and a near-debt-free balance sheet that lets it acquire opportunistically. The moat will widen as brand recognition, doctor networks, and occupancy scale over FY27–29.",

  // ── Quality scorecard ──
  qualityData: [
    { param: "Longevity",         score: 7,   full: "Founded 2008, listed 2023. 17 years ops, COVID survived. PAT positive every year ex-FY20." },
    { param: "Predictable CF",    score: 5,   full: "CFO highly volatile — negative FY24 due to govt receivables. FY25 recovery to ₹150 Cr. High debtor days (128 in FY25) are structural concern." },
    { param: "ROCE",              score: 5,   full: "Declined sharply: 27% (FY23) → 14% (FY25) due to front-loaded capex + QIP equity dilution. Should normalise to 18–22% by FY28 as earnings catch up." },
    { param: "Revenue Resilience",score: 8.5, full: "45% 5-year CAGR — 3.4x industry. No year of revenue decline. Q3 FY26 strongest quarter in company history (+46% YoY)." },
    { param: "EPS Stability",     score: 6,   full: "FY22 EPS dipped to ₹6.74 (from ₹11.09) due to new equity at IPO. FY25 EPS ₹13.55 (+1.6% on FY24) muted by dilution. FY27E ₹22.9 = 69% jump." },
    { param: "CFO/PAT",           score: 5.5, full: "Strong in FY23 (97%) and FY25 (115%) but negative FY24 due to receivables. Improving but still CGHS billing risk." },
    { param: "Margins",           score: 7,   full: "Core ops 28–29% EBITDA (at par with Max). Consolidated 26% FY25, temporarily 23% Q3 FY26 as new hospitals drag. Should recover to 26–28% by FY27." },
    { param: "Reinvestment",      score: 7.5, full: "Aggressive but disciplined: ₹420 Cr capex FY25, all for capacity that is already ramping. Acquisition payback: Faridabad Sec-6 went 0%→55% occupancy in 18 months." },
  ],
  qualitySummary: {
    consolidated: "6.5/10",
    standalone:   "6.5/10",
    insight:      "Yatharth is a high-growth compounder in a capital-intensive sector with no structural moat yet. The quality score is temporarily depressed by capex-cycle ROCE dilution and volatile CFO. If execution on bed ramp and ARPOB growth continues (strong Q3 FY26 suggests it will), quality score should rise to 7.5+ by FY28 as earnings catch up with capacity investment.",
  },

  // ── Sensitivity matrix — directly from doc Section 9.3 (FY27E EPS basis) ──
  sensitivity: {
    cmp: 700,
    peColumns: [
      { label: "25x (Bear)",    key: "pe25" },
      { label: "30x",           key: "pe30" },
      { label: "35x (Base)",    key: "pe35" },
      { label: "40x (Bull)",    key: "pe40" },
    ],
    rows: [
      { label: "Bear ₹18.0",  pe25: 450,  pe30: 540,  pe35: 630,  pe40: 720  },
      { label: "Base ₹22.9",  pe25: 573,  pe30: 687,  pe35: 802,  pe40: 916  },
      { label: "Bull ₹26.0",  pe25: 650,  pe30: 780,  pe35: 910,  pe40: 1040 },
    ],
    scenarios: [
      { label: "BEAR",      color: "RED",   rev: "₹1,500 Cr", opm: "23%", eps: "₹18.0", pe: "25x",    target: "₹450",   desc: "New hospital breakevens delayed. Occupancy ramp disappoints. CGHS receivables worsen. Government pushes back on pricing." },
      { label: "BASE CASE", color: "BLUE",  rev: "₹1,500 Cr", opm: "25%", eps: "₹22.9", pe: "35x",    target: "₹802",   desc: "FY27E base case per report. Delhi & Faridabad Sec-20 break even in guided 12–15 months. ARPOB grows 8–10% annually. Consensus target ₹935." },
      { label: "BULL",      color: "GREEN", rev: "₹1,600 Cr", opm: "27%", eps: "₹26.0", pe: "40x",    target: "₹1,040", desc: "All new hospitals at 60%+ occupancy by Q2 FY27. ARPOB pushes to ₹38,000+. Further acquisition announced. Peer re-rating lifts multiple." },
    ],
    conclusion: "12-Month Target: ₹850–950 (BUY). Base Case FY27E at 35x EPS ₹22.9 = ₹802; Bull Case ₹1,040. On FY28E EPS ₹33.4 at 28x = ₹935 (4-analyst consensus). Bear case ₹450 represents -36% downside — key risk is execution failure on new hospital ramp and prolonged CGHS receivable issues.",
  },

  dcf: {
    wacc:         14.0,
    termGrowth:   7.0,
    isNBFC:       false,
    wcRev:        4.0,
    taxRate:      25,
    interestRate: 8,
    note: "Healthcare and hospitals. Higher discount rate reflects capex intensity and execution risk.",
  },
},


// ─────────────────────────────────────────────
//  BEL (BEL)
// ─────────────────────────────────────────────
"BEL": {
  id:           "BEL",
  name:         "Bharat Electronics Ltd",
  nse:          "BEL",
  bse:          "500049",
  indices:      "Nifty 50, Nifty Next 50",
  sector:       "Defence Electronics / Navratna PSU",
  rating:       "BUY",
  description:  "India's largest defence electronics company and Navratna PSU. Dominant supplier (90%+ market share in key platforms) of radars, electronic warfare systems, communication equipment, avionics and missiles to the Indian Armed Forces. ₹73,015 Cr order book (2.8× TTM sales) with multi-year execution visibility. 72–75% indigenisation, shifting to full system integration.",

  metrics: [
    { label:"CMP",          value:"₹454",         sub:"Mar 2026"                  },
    { label:"Market Cap",   value:"₹3.32 Lakh Cr",sub:"$39.5B",    color:"GOLD"     },
    { label:"Target",       value:"₹800–1,000",   sub:"12–18% CAGR", color:"GREEN" },
    { label:"Order Book",   value:"₹73,015 Cr",   sub:"2.8× TTM sales", color:"TEAL" },
    { label:"OPM",          value:"29%",          sub:"FY25 (27% FY26 guidance)", color:"BLUE" },
    { label:"Quality",      value:"8.2/10",       sub:"Wide Regulatory Moat", color:"ORANGE" },
  ],

  thesis: [
    { t:"Regulatory + Execution Moat",          d:"Navratna PSU status + MoD strategic partner preference + security clearances create 5–10 year qualification lead over private players. Positive indigenisation lists force domestic sourcing." },
    { t:"High-Visibility Multi-Year Programmes",d:"LRSAM/Barak-8, Akash NG, QRSAM (₹30k Cr potential), Himshakti EW, LCA Mk1A LRUs, Project Kusha. Order book provides 3+ years revenue visibility even without new inflows." },
    { t:"Margin & Operating Leverage Levers",   d:"Indigenisation (72–75% → 95% in platforms) + vertical integration into semiconductors + product mix shift to full systems. OPM expanding 27–30% range with minimal capex (₹1,000–1,400 Cr)." },
    { t:"Defence Budget + Export Tailwinds",    d:"Atmanirbhar Bharat + defence budget surge. Exports targeting 10%+ (Vietnam, Armenia, ASEAN). Non-defence diversification (railways, data centres, anti-drone) to 10–15%." },
  ],

  finData: [
    { yr:"FY21",  rev:14100, opm:22, opProfit:3102, cfo:3500, pat:2040, capex:600, dep:400, tax:800, fcff:2900, cfoPatPct:172, roce:24, type:"H" },
    { yr:"FY22",  rev:15300, opm:24, opProfit:3672, cfo:4000, pat:2420, capex:650, dep:420, tax:950, fcff:3350, cfoPatPct:165, roce:26, type:"H" },
    { yr:"FY23",  rev:17700, opm:25, opProfit:4425, cfo:4800, pat:3020, capex:700, dep:450, tax:1100, fcff:4100, cfoPatPct:159, roce:28, type:"H" },
    { yr:"FY24",  rev:20200, opm:27, opProfit:5454, cfo:5500, pat:3985, capex:800, dep:500, tax:1400, fcff:4700, cfoPatPct:138, roce:32, type:"H" },
    { yr:"FY25",  rev:23769, opm:29, opProfit:6893, cfo:6500, pat:5322, capex:900, dep:550, tax:1800, fcff:5600, cfoPatPct:122, roce:38, type:"H" },
    { yr:"FY26E", rev:27944, opm:28.7,opProfit:8020, cfo:7500, pat:6200, capex:1000,dep:600, tax:2100, fcff:6500, cfoPatPct:121, roce:40, type:"P" },
    { yr:"FY27E", rev:32431, opm:28.8,opProfit:9340, cfo:8800, pat:7200, capex:1100,dep:650, tax:2500, fcff:7700, cfoPatPct:122, roce:42, type:"P" },
    { yr:"FY28E", rev:37675, opm:28.8,opProfit:10850,cfo:10500,pat:8500,capex:1200,dep:700, tax:2900, fcff:9300, cfoPatPct:124, roce:44, type:"P" },
    { yr:"FY29E", rev:44000, opm:29.5,opProfit:12980,cfo:12500,pat:10200,capex:1300,dep:750, tax:3500, fcff:11200,cfoPatPct:123, roce:45, type:"P" },
    { yr:"FY30E", rev:52000, opm:30,  opProfit:15600,cfo:15000,pat:12500,capex:1400,dep:800, tax:4200, fcff:13600,cfoPatPct:120, roce:46, type:"P" },
  ],

  segmentKeys: ["defence", "nondef", "export"],
  segmentLabels: { defence:"Defence (Core)", nondef:"Non-Defence", export:"Exports" },
  segData: [
    { yr:"FY21",  defence:13113, nondef:987,  export:0,    total:14100 },
    { yr:"FY22",  defence:14229, nondef:1071, export:0,    total:15300 },
    { yr:"FY23",  defence:16461, nondef:1239, export:0,    total:17700 },
    { yr:"FY24",  defence:18786, nondef:1414, export:0,    total:20200 },
    { yr:"FY25",  defence:22106, nondef:1664, export:0,    total:23769 },
    { yr:"FY26E", defence:25987, nondef:1956, export:0,    total:27944 },
    { yr:"FY27E", defence:30161, nondef:2270, export:0,    total:32431 },
    { yr:"FY28E", defence:35038, nondef:2637, export:0,    total:37675 },
    { yr:"FY29E", defence:40920, nondef:3080, export:0,    total:44000 },
    { yr:"FY30E", defence:48360, nondef:3640, export:0,    total:52000 },
  ],

  porterKeys: ["defence", "nondef", "export"],
  porterLabels: { defence:"Defence Platforms", nondef:"Non-Defence", export:"Exports" },
  porterData: [
    { force:"New Entrants",  defence:9.5, nondef:7.5, export:8 },
    { force:"Buyer Power",   defence:6,   nondef:5.5, export:6 },
    { force:"Supplier Power",defence:5.5, nondef:6,   export:5 },
    { force:"Substitutes",   defence:8.5, nondef:7,   export:7.5 },
    { force:"Rivalry",       defence:7,   nondef:6.5, export:6 },
  ],
  porterNarrative: [
    { force:"Threat of New Entrants",     lines:["Defence: VERY LOW — Security clearances, DRDO ToT, 5–10yr qualification lead","Non-Defence: LOW — Established PSU preference in govt tenders","Exports: LOW — Brand + offset policy advantage"] },
    { force:"Bargaining Power of Buyers", lines:["Defence: MODERATE — Single large buyer (MoD) but long-term contracts + spares","Non-Defence: LOW — Multiple customers (railways, airports)","Exports: MODERATE — Sovereign buyers but offset clauses"] },
    { force:"Supplier Power",             lines:["All segments: MODERATE — Imported components, but 72–75% indigenisation + in-house semiconductors reducing dependency"] },
    { force:"Threat of Substitutes",      lines:["Defence: VERY LOW — Specialised tech, no viable alternatives","Non-Defence: LOW — Custom solutions","Exports: LOW — Global competition but offset + quality edge"] },
    { force:"Competitive Rivalry",        lines:["Defence: MODERATE — Private players (L&T, Tata) in sub-systems only; BEL leads platforms","Non-Defence: MODERATE — Emerging competition","Exports: LOW — BEL gaining share via government-to-government routes"] },
  ],
  porterConclusion: "BEL operates in an extremely favourable competitive structure. Regulatory + technological moat in defence electronics is near-impenetrable for the next 10–15 years. Private players remain restricted to sub-systems; BEL is the default platform-level integrator.",

  qualityData: [
    { param:"Longevity",              score:10,   full:"72 years ÷ 5 = 10 (capped)" },
    { param:"Predictable CF",         score:9.0,  full:"Avg CFO/PAT ÷ 150" },
    { param:"ROCE",                   score:9.5,  full:"Avg ROCE ÷ 3.5" },
    { param:"Revenue Resilience",     score:9.0,  full:"CAGR + down years" },
    { param:"EPS Stability",          score:8.5,  full:"Volatility calc" },
    { param:"CFO/PAT",                score:9.0,  full:"Latest ÷ 120" },
    { param:"Margins",                score:8.5,  full:"Margin + expansion" },
    { param:"Reinvestment",           score:8.0,  full:"Capex efficiency" },
    { param:"Balance Sheet Strength", score:10,   full:"(Debt Score + Cash Score) ÷ 2" },
  ],
  qualitySummary: {
    consolidated: "9.1/10",
    standalone:   "9.1/10",
    insight:      "Standalone operating metrics reflect true quality (38%+ ROCE, clean cash conversion). Consolidated numbers are clean with zero debt. Regulatory moat and order book visibility make this one of the strongest quality defence franchises in India.",
  },

  sensitivity: {
    cmp: 454,
    peColumns: [
      { label:"35x (De-rate)", key:"pe35" },
      { label:"45x (Base)",    key:"pe45" },
      { label:"55x (Re-rate)", key:"pe55" },
      { label:"65x (Premium)", key:"pe65" },
    ],
    rows: [
      { label:"Bear ₹18",   pe35:630,  pe45:810,  pe55:990,  pe65:1170 },
      { label:"Base ₹24",   pe35:840,  pe45:1080, pe55:1320, pe65:1560 },
      { label:"Bull ₹30",   pe35:1050, pe45:1350, pe55:1650, pe65:1950 },
    ],
    scenarios: [
      { label:"BEAR",      color:"RED",   rev:"₹44,000 Cr", opm:"27%", eps:"₹18",  pe:"35–45x", target:"₹630–810",   desc:"QRSAM delayed. Defence budget growth slows. Execution rate remains 20–22%. Private competition increases in sub-systems." },
      { label:"BASE CASE", color:"BLUE",  rev:"₹52,000 Cr", opm:"30%", eps:"₹24",  pe:"45–55x", target:"₹1,080–1,320", desc:"16% revenue CAGR. QRSAM + Kusha execution ramps. Indigenisation drives 28–30% OPM. Order book visibility intact." },
      { label:"BULL",      color:"GREEN", rev:"₹60,000+ Cr",opm:"32%", eps:"₹30",  pe:"55–65x", target:"₹1,650–1,950", desc:"18–20% CAGR. Exports hit 10%+. Full system integration + Akash NG/QRSAM acceleration. Market re-rates defence electronics to global growth multiples." },
    ],
    conclusion: "Base Case FY30 Target: ₹800–1,000 (12–18% CAGR from ₹454). Order book + policy tailwinds provide multi-year visibility that is not fully priced in at current 55x TTM P/E.",
  },

  dcf: {
    wacc:         12.0,
    termGrowth:   7.0,
    isNBFC:       false,
    wcRev:        2.5,
    taxRate:      25,
    interestRate: 0,
    note: "Defence PSU with strong order book. Zero net debt. CoE 12% reflects Navratna quality and stable cash flows.",
  },
},

// ─────────────────────────────────────────────
//  BAJFINANCE
// ─────────────────────────────────────────────
"BAJFINANCE": {
  id:           "BAJFINANCE",
  name:         "Bajaj Finance Ltd",
  nse:          "BAJFINANCE",
  bse:          "500034",
  indices:      "Nifty 50, Nifty Next 50",
  sector:       "NBFC / Consumer Finance",
  rating:       "BUY",
  description:  "India's leading diversified NBFC with 115.40 MM customer franchise. Dominant in consumer durable, personal loans, mortgages (via BHFL), MSME and rural lending. Strong cross-sell engine + AI-driven underwriting (BFL 3.0 FINAI). AUM ₹4.85 Lakh Cr (adjusted) with 21-22% FY26 guidance post MSME risk tightening. Long-term 23-25% AUM CAGR feasible.",

  metrics: [
    { label:"CMP",          value:"₹978",         sub:"Mar 2026"                  },
    { label:"Market Cap",   value:"₹6.09 Lakh Cr",sub:"$72B",      color:"GOLD"     },
    { label:"Target",       value:"₹1,600–1,800", sub:"13–16% CAGR", color:"GREEN" },
    { label:"AUM",          value:"₹4.85 Lakh Cr",sub:"Q3 FY26 adj. (+22% YoY)", color:"TEAL" },
    { label:"Core ROE",     value:"19.6%",        sub:"Q3 FY26 ann.", color:"BLUE" },
    { label:"Quality",      value:"8.3/10",       sub:"Cross-sell + Data Moat", color:"ORANGE" },
  ],

  thesis: [
    { t:"Massive Cross-Sell Flywheel",          d:"115.40 MM customers + 87 MM EMI cards → 40-50% incremental loans from existing base at near-zero CAC. New customer addition 4.76 MM in Q3 alone." },
    { t:"AI + Data Moat (BFL 3.0 FINAI)",       d:"Proprietary analytics + AI across underwriting, pricing, collections. Superior risk pricing vs peers; enables faster product launches (Gold, Car, MFI verticals)." },
    { t:"Diversified + Resilient Model",        d:"Mortgages 31.5%, Urban B2C 20.6%, MSME 10.6%, Rural/Commercial/Gold growing fast. Low-cost funding (51% money market + 17% deposits). Capital adequacy 21.45%." },
    { t:"Long-term Growth Intact Despite Near-term Caution", d:"FY26 AUM guidance 21-22% (MSME tightened, housing competitive). Post-FY26 23-25% CAGR via new verticals + rural recovery. Core ROE 19-21% sustainable." },
  ],

  finData: [
    { yr:"FY21",  rev:26683, opm:65, opProfit:17300, cfo:18000, pat:4420,  capex:300, dep:400, tax:1572, fcff:17700, cfoPatPct:407, roce:12, type:"H" },
    { yr:"FY22",  rev:31648, opm:69, opProfit:21894, cfo:22000, pat:7028,  capex:350, dep:450, tax:2476, fcff:21650, cfoPatPct:313, roce:17, type:"H" },
    { yr:"FY23",  rev:41418, opm:70, opProfit:28858, cfo:28000, pat:11508, capex:400, dep:500, tax:4020, fcff:27600, cfoPatPct:243, roce:22, type:"H" },
    { yr:"FY24",  rev:54983, opm:66, opProfit:36258, cfo:32000, pat:14451, capex:450, dep:550, tax:4859, fcff:31550, cfoPatPct:221, roce:21, type:"H" },
    { yr:"FY25",  rev:69725, opm:64, opProfit:44954, cfo:38000, pat:16779, capex:500, dep:600, tax:5531, fcff:37500, cfoPatPct:226, roce:19, type:"H" },
    { yr:"FY26E", rev:85000, opm:63, opProfit:53550, cfo:45000, pat:20500, capex:550, dep:650, tax:6800, fcff:44450, cfoPatPct:220, roce:20, type:"P" },
    { yr:"FY27E", rev:104000,opm:63, opProfit:65520, cfo:55000, pat:25500, capex:600, dep:700, tax:8500, fcff:54400, cfoPatPct:216, roce:21, type:"P" },
    { yr:"FY28E", rev:127000,opm:63, opProfit:80010, cfo:67000, pat:31500, capex:650, dep:750, tax:10500,fcff:66350, cfoPatPct:213, roce:21, type:"P" },
    { yr:"FY29E", rev:155000,opm:63, opProfit:97650, cfo:82000, pat:38500, capex:700, dep:800, tax:12800,fcff:81200, cfoPatPct:213, roce:21, type:"P" },
    { yr:"FY30E", rev:190000,opm:63, opProfit:119700,cfo:100000,pat:47000,capex:750, dep:850, tax:15600,fcff:99250, cfoPatPct:213, roce:21, type:"P" },
  ],

  segmentKeys: ["mortgage", "urbanB2C", "msme", "ruralOther", "salesFinance"],
  segmentLabels: { mortgage:"Mortgages (incl BHFL)", urbanB2C:"Urban B2C Loans", msme:"MSME Lending", ruralOther:"Rural + Gold + Others", salesFinance:"Sales Finance" },
  segData: [
    { yr:"FY25", mortgage:152747, urbanB2C:99878, msme:51136, ruralOther:60000, salesFinance:35000, total:416661 },
    { yr:"FY26E",mortgage:190000, urbanB2C:125000, msme:57000, ruralOther:75000, salesFinance:43000, total:490000 },
    { yr:"FY27E",mortgage:235000, urbanB2C:155000, msme:65000, ruralOther:93000, salesFinance:52000, total:600000 },
    { yr:"FY28E",mortgage:290000, urbanB2C:190000, msme:75000, ruralOther:115000,salesFinance:63000, total:733000 },
    { yr:"FY29E",mortgage:355000, urbanB2C:235000, msme:85000, ruralOther:140000,salesFinance:75000, total:890000 },
    { yr:"FY30E",mortgage:435000, urbanB2C:290000, msme:98000, ruralOther:170000,salesFinance:90000, total:1083000 },
  ],

  porterKeys: ["consumer", "mortgage", "msme"],
  porterLabels: { consumer:"Consumer Lending", mortgage:"Mortgages", msme:"MSME" },
  porterData: [
    { force:"New Entrants",  consumer:8.5, mortgage:7.5, msme:8 },
    { force:"Buyer Power",   consumer:6,   mortgage:7,   msme:6.5 },
    { force:"Supplier Power",consumer:5,   mortgage:5.5, msme:5 },
    { force:"Substitutes",   consumer:7,   mortgage:8,   msme:7 },
    { force:"Rivalry",       consumer:7.5, mortgage:8,   msme:7 },
  ],
  porterNarrative: [
    { force:"Threat of New Entrants",     lines:["Consumer: LOW — Brand + 115 MM franchise + data moat","Mortgage: MODERATE — BHFL scale + competition","MSME: LOW — Tightened underwriting edge"] },
    { force:"Bargaining Power of Buyers", lines:["All segments: LOW-MOD — Mass-affluent focus + cross-sell stickiness"] },
    { force:"Supplier Power",             lines:["All segments: VERY LOW — Diverse funding (51% money market + deposits)"] },
    { force:"Threat of Substitutes",      lines:["Consumer: MOD — Banks/digital lenders","Mortgage: HIGH — Banks/HFCs","MSME: MOD — Fintechs"] },
    { force:"Competitive Rivalry",        lines:["Consumer: MODERATE — Bajaj differentiated by cross-sell","Mortgage: HIGH — Competition but BHFL gaining share","MSME: MODERATE — Risk actions taken"] },
  ],
  porterConclusion: "Bajaj Finance operates in a highly favourable structure. Cross-sell + proprietary data + AI create sustainable moat in consumer lending. Mortgage/MSME competitive but disciplined risk management and funding advantage protect margins.",

  qualityData: [
    { param:"Longevity",              score:7.0,  full:"35 years ÷ 5 = 7.0" },
    { param:"Predictable CF",         score:8.5,  full:"Avg CFO/PAT ÷ 150" },
    { param:"ROCE",                   score:9.0,  full:"Avg ROCE ÷ 3.5" },
    { param:"Revenue Resilience",     score:9.0,  full:"CAGR + down years" },
    { param:"EPS Stability",          score:8.0,  full:"Volatility calc" },
    { param:"CFO/PAT",                score:9.0,  full:"Latest ÷ 120" },
    { param:"Margins",                score:8.5,  full:"Margin + expansion" },
    { param:"Reinvestment",           score:8.0,  full:"Capex efficiency" },
    { param:"Balance Sheet Strength", score:3.4,  full:"(Debt Score + Cash Score) ÷ 2" },
  ],
  qualitySummary: {
    consolidated: "7.8/10",
    standalone:   "7.8/10",
    insight:      "Core operating quality exceptional (19.6% ROE, clean asset quality post MSME tightening). Recent guidance cut reflects prudence, not weakness. Cross-sell + AI moat + diversified funding = durable 20%+ ROE franchise.",
  },

  sensitivity: {
    cmp: 978,
    peColumns: [
      { label:"25x (De-rate)", key:"pe25" },
      { label:"30x (Base)",    key:"pe30" },
      { label:"35x (Re-rate)", key:"pe35" },
      { label:"40x (Premium)", key:"pe40" },
    ],
    rows: [
      { label:"Bear ₹45",   pe25:1125, pe30:1350, pe35:1575, pe40:1800 },
      { label:"Base ₹61",   pe25:1525, pe30:1830, pe35:2135, pe40:2440 },
      { label:"Bull ₹75",   pe25:1875, pe30:2250, pe35:2625, pe40:3000 },
    ],
    scenarios: [
      { label:"BEAR",      color:"RED",   rev:"₹1.55 Lakh Cr", opm:"61%", eps:"₹45",  pe:"25–30x", target:"₹1,125–1,350", desc:"MSME/housing stress persists. AUM CAGR slows to 18%. Credit cost spikes to 2%+. Market de-rates NBFCs." },
      { label:"BASE CASE", color:"BLUE",  rev:"₹1.90 Lakh Cr", opm:"63%", eps:"₹61",  pe:"30–35x", target:"₹1,830–2,135", desc:"22% AUM CAGR. New verticals (Gold/Car/MFI) scale. Opex leverage + stable NIM. Reasonable 30-35x multiple." },
      { label:"BULL",      color:"GREEN", rev:"₹2.30 Lakh Cr", opm:"64%", eps:"₹75",  pe:"35–40x", target:"₹2,625–3,000", desc:"25% AUM CAGR. Rural + cross-sell fires. AI drives further opex gains. Re-rating to global fintech multiples." },
    ],
    conclusion: "Base Case FY30 Target: ₹1,600–1,800 (13–16% CAGR from ₹978). 30x FY30 EPS on ₹61 (22% AUM CAGR + 20% ROE). Orderly MSME tightening + new verticals provide multi-year visibility not fully priced at current 33x TTM.",
  },

  dcf: {
    wacc:         13.0,
    termGrowth:   8.0,
    isNBFC:       true,
    wcRev:        0,
    taxRate:      25,
    interestRate: 0,
    note: "FCFE-based DCF. Cost of Equity 13% reflects NBFC risk premium. Terminal growth 8% anchored to nominal GDP.",
  },
},


// ─────────────────────────────────────────────
//  TVSMOTOR
// ─────────────────────────────────────────────
"TVSMOTOR": {
  id:           "TVSMOTOR",
  name:         "TVS Motor Company Ltd",
  nse:          "TVSMOTOR",
  bse:          "532343",
  indices:      "Nifty 50, Nifty Next 50",
  sector:       "Automobiles / Two & Three Wheelers",
  rating:       "BUY",
  description:  "India's third-largest two-wheeler manufacturer (20% market share in 10M FY26) with leadership in premium ICE (Apache, Raider, Ntorq), electric scooters (iQube + Orbiter at 23% EV share — higher than its ICE share), and emerging 3W EV (King EV). Record exports (Feb'26 high of 1.58 lakh units) and only legacy player gaining share in both ICE & EV segments. Strong premiumisation + EV transition + Norton pipeline (6 new bikes 2026-28).",

  metrics: [
    { label:"CMP",          value:"₹3,813",       sub:"Mar 2026"                  },
    { label:"Market Cap",   value:"₹1.82 Lakh Cr",sub:"$21.7B",    color:"GOLD"     },
    { label:"Target",       value:"₹5,800–7,000", sub:"16–20% CAGR", color:"GREEN" },
    { label:"EBITDA Margin",value:"13.1%",        sub:"Q3 FY26 (+120 bps)", color:"TEAL" },
    { label:"EV Share",     value:"23%",          sub:"9M FY26 (EV > ICE)", color:"BLUE" },
    { label:"Quality",      value:"8.8/10",       sub:"Premium + EV + Export Moat", color:"ORANGE" },
  ],

  thesis: [
    { t:"Premiumisation + EV Leadership Flywheel", d:"Only legacy OEM gaining market share in both ICE (20% overall) and EV (23% — now > its ICE share). Orbiter + iQube ramp + Apache RTX300 + Ntorq 150 driving mix shift and 120 bps margin expansion in Q3 FY26." },
    { t:"Record Export Scale & Diversification",   d:"Feb'26 exports hit all-time high 1.58 lakh units (+27% YoY). Africa + LATAM focus; exports now ~24% of revenue with 21% CAGR expected. 3W EV (King EV) capturing share in L5 category (30–32% penetration)." },
    { t:"Margin & Operating Leverage Levers",      d:"EBITDA margin at 13.1% in Q3 FY26 (+120 bps) via premium mix, PLI benefits, cost control and EV scale. FY25-28E consensus: 21%/26%/29% revenue/EBITDA/PAT CAGR. Norton premium launch pipeline 2026-28 adds high-margin upside." },
    { t:"Market Share Gains in Transition",        d:"Gained 2% overall 2W share in 10M FY26 (18% → 20%). EV market share 23% in 9M FY26. Strong rural + premium recovery + new launches position TVS ahead of Hero/Bajaj in EV shift." },
  ],

  finData: [
    { yr:"FY21",  rev:18700, opm:9.5, opProfit:1777, cfo:2200, pat:800,  capex:600, dep:700, tax:300, fcff:1600, cfoPatPct:275, roce:15, type:"H" },
    { yr:"FY22",  rev:21200, opm:10.5,opProfit:2226, cfo:2800, pat:1100, capex:700, dep:750, tax:400, fcff:2100, cfoPatPct:255, roce:18, type:"H" },
    { yr:"FY23",  rev:24700, opm:11.0,opProfit:2717, cfo:3200, pat:1400, capex:800, dep:800, tax:500, fcff:2400, cfoPatPct:229, roce:20, type:"H" },
    { yr:"FY24",  rev:31776, opm:11.1,opProfit:3527, cfo:3800, pat:2083, capex:900, dep:850, tax:700, fcff:2900, cfoPatPct:182, roce:22, type:"H" },
    { yr:"FY25",  rev:36251, opm:12.3,opProfit:4459, cfo:4500, pat:2711, capex:1000,dep:900, tax:900, fcff:3500, cfoPatPct:166, roce:24, type:"H" },
    { yr:"FY26E", rev:44000, opm:13.5,opProfit:5940, cfo:5500, pat:3400, capex:1100,dep:950, tax:1100,fcff:4400, cfoPatPct:162, roce:26, type:"P" },
    { yr:"FY27E", rev:53000, opm:14.0,opProfit:7420, cfo:6700, pat:4300, capex:1200,dep:1000, tax:1400,fcff:5500, cfoPatPct:156, roce:27, type:"P" },
    { yr:"FY28E", rev:64000, opm:14.3,opProfit:9152, cfo:8200, pat:5400, capex:1300,dep:1050, tax:1750,fcff:6900, cfoPatPct:152, roce:28, type:"P" },
    { yr:"FY29E", rev:76000, opm:14.5,opProfit:11020,cfo:9800, pat:6700, capex:1400,dep:1100, tax:2150,fcff:8400, cfoPatPct:146, roce:29, type:"P" },
    { yr:"FY30E", rev:90000, opm:14.8,opProfit:13320,cfo:11800,pat:8500, capex:1500,dep:1150, tax:2700,fcff:10300,cfoPatPct:139, roce:30, type:"P" },
  ],

  segmentKeys: ["domestic2w", "exports", "ev", "threeW"],
  segmentLabels: { domestic2w:"Domestic 2W (ICE)", exports:"Exports", ev:"Electric Vehicles", threeW:"3W (incl EV)" },
  segData: [
    { yr:"FY25", domestic2w:24000, exports:8700, ev:2500, threeW:1051, total:36251 },
    { yr:"FY26E",domestic2w:28500, exports:11000,ev:3500, threeW:1000, total:44000 },
    { yr:"FY27E",domestic2w:34000, exports:13500,ev:4500, threeW:1000, total:53000 },
    { yr:"FY28E",domestic2w:41000, exports:16500,ev:5500, threeW:1000, total:64000 },
    { yr:"FY29E",domestic2w:48500, exports:20000,ev:6500, threeW:1000, total:76000 },
    { yr:"FY30E",domestic2w:57000, exports:24000,ev:8000, threeW:1000, total:90000 },
  ],

  porterKeys: ["iceScooter", "premiumBike", "evScooter", "export"],
  porterLabels: { iceScooter:"ICE Scooters", premiumBike:"Premium Motorcycles", evScooter:"EV Scooters", export:"Exports" },
  porterData: [
    { force:"New Entrants",  iceScooter:8, premiumBike:9, evScooter:8.5, export:8 },
    { force:"Buyer Power",   iceScooter:6, premiumBike:5.5,evScooter:6,   export:6 },
    { force:"Supplier Power",iceScooter:5, premiumBike:5,  evScooter:5.5, export:5 },
    { force:"Substitutes",   iceScooter:7, premiumBike:6,  evScooter:7.5, export:6.5 },
    { force:"Rivalry",       iceScooter:7.5,premiumBike:6.5,evScooter:7,   export:7 },
  ],
  porterNarrative: [
    { force:"Threat of New Entrants",     lines:["ICE Scooters: LOW — Brand + distribution","Premium Bike: VERY LOW — Apache/Norton tech edge","EV Scooters: LOW — iQube/Orbiter scale + PLI","Exports: LOW — Africa/LATAM relationships"] },
    { force:"Bargaining Power of Buyers", lines:["All segments: LOW-MOD — Premium + connected features + service network lock-in"] },
    { force:"Supplier Power",             lines:["All segments: VERY LOW — In-house R&D + backward integration"] },
    { force:"Threat of Substitutes",      lines:["ICE: MOD — Public transport","Premium: LOW — Lifestyle appeal","EV: LOW — Policy push","Exports: MOD — Local competition"] },
    { force:"Competitive Rivalry",        lines:["ICE Scooter: MODERATE — Hero/Honda","Premium Bike: LOW — Bajaj/RE","EV Scooter: MODERATE — Bajaj/Ather but TVS leading legacy","Exports: MODERATE — Bajaj but TVS gaining"] },
  ],
  porterConclusion: "TVS operates in an extremely favourable structure. Premium + EV + export moat is widening. Only legacy player gaining share in both ICE and EV (23% EV share). Norton pipeline and 3W EV entry create multi-year high-margin growth runway.",

  qualityData: [
    { param:"Longevity",              score:10,   full:"65 years ÷ 5 = 10 (capped)" },
    { param:"Predictable CF",         score:9.0,  full:"Avg CFO/PAT ÷ 150" },
    { param:"ROCE",                   score:9.0,  full:"Avg ROCE ÷ 3.5" },
    { param:"Revenue Resilience",     score:9.5,  full:"CAGR + down years" },
    { param:"EPS Stability",          score:9.0,  full:"Volatility calc" },
    { param:"CFO/PAT",                score:9.0,  full:"Latest ÷ 120" },
    { param:"Margins",                score:9.0,  full:"Margin + expansion" },
    { param:"Reinvestment",           score:8.5,  full:"Capex efficiency" },
    { param:"Balance Sheet Strength", score:5.5,  full:"(Debt Score + Cash Score) ÷ 2" },
  ],
  qualitySummary: {
    consolidated: "8.7/10",
    standalone:   "8.7/10",
    insight:      "Core quality exceptional — only OEM gaining share in ICE + EV transition, record EBITDA margin 13.1%, export scale, and premium/Norton pipeline. FY25-28E 21%/26%/29% CAGR confirms durable 25%+ ROCE franchise.",
  },

  sensitivity: {
    cmp: 3813,
    peColumns: [
      { label:"30x (De-rate)", key:"pe30" },
      { label:"35x (Base)",    key:"pe35" },
      { label:"40x (Re-rate)", key:"pe40" },
      { label:"45x (Premium)", key:"pe45" },
    ],
    rows: [
      { label:"Bear ₹160",  pe30:4800, pe35:5600, pe40:6400, pe45:7200 },
      { label:"Base ₹240",  pe30:7200, pe35:8400, pe40:9600, pe45:10800 },
      { label:"Bull ₹300",  pe30:9000, pe35:10500,pe40:12000,pe45:13500 },
    ],
    scenarios: [
      { label:"BEAR",      color:"RED",   rev:"₹70,000 Cr", opm:"13%", eps:"₹160", pe:"30–35x", target:"₹4,800–5,600", desc:"EV slowdown + rural weakness. Market share gains stall. Margin expansion caps at 13%." },
      { label:"BASE CASE", color:"BLUE",  rev:"₹90,000 Cr", opm:"14.8%",eps:"₹240", pe:"35–40x", target:"₹8,400–9,600", desc:"19% revenue CAGR. EV 25%+ share + Norton ramp. Premium mix drives 14.8% EBITDA. 35–40x justified." },
      { label:"BULL",      color:"GREEN", rev:"₹1,05,000 Cr",opm:"15.5%",eps:"₹300", pe:"40–45x", target:"₹12,000–13,500", desc:"22% CAGR. Exports 30%+ revenue + 30% EV share. Norton premium + 3W EV fires. Re-rating to global EV/auto multiples." },
    ],
    conclusion: "Base Case FY30 Target: ₹5,800–7,000 (16–20% CAGR from ₹3,813). 35–38x FY30 EPS on ₹240 (19% revenue CAGR + 14.8% EBITDA + 30% ROCE). Market share gains, EV leadership, and Norton pipeline provide multi-year visibility not fully priced at current levels.",
  },

  dcf: {
    wacc:         12.5,
    termGrowth:   7.0,
    isNBFC:       false,
    wcRev:        2.0,
    taxRate:      25,
    interestRate: 7,
    note: "Two and three wheeler leader. CoE 12.5% reflects auto sector cyclicality offset by premium brand mix.",
  },
},


  // ─────────────────────────────────────────────
//  V2RETAIL (Updated Pure-Maths 9-Parameter)
// ─────────────────────────────────────────────
"V2RETAIL": {
  id:           "V2RETAIL",
  name:         "V2 Retail Ltd",
  nse:          "V2RETAIL",
  bse:          "532867",
  indices:      "Nifty Smallcap 100",
  sector:       "Retail / Value Fashion Apparel",
  rating:       "BUY",
  description:  "Fastest-growing value fashion retailer focused on Tier-II/III cities targeting neo-middle & middle-class customers. Operates 294 stores (31.9 lakh sq ft) as of Dec 2025 with aggressive expansion (105 new stores in 9M FY26; +150 guided for FY27). Q3 FY26 blockbuster: Revenue ₹929 Cr (+57% YoY), PAT ₹102 Cr (+99% YoY) on festive demand, full-price sales 92%, operating leverage (margin 18.7%). 8-10% SSSG guidance + 50%+ revenue growth ambition via store additions and improved productivity.",

  metrics: [
    { label:"CMP",          value:"₹1,940",       sub:"Mar 2026"                  },
    { label:"Market Cap",   value:"₹7,100 Cr",    sub:"$845M",     color:"GOLD"     },
    { label:"Target",       value:"₹4,200–5,200", sub:"17–22% CAGR", color:"GREEN" },
    { label:"Store Count",  value:"294 (+105 in 9M)", sub:"Dec 2025; +150 FY27", color:"TEAL" },
    { label:"EBITDA Margin",value:"18.7%",        sub:"Q3 FY26 (pre-IndAS)", color:"BLUE" },
    { label:"Quality",      value:"7.7/10",       sub:"Pure Maths Score", color:"ORANGE" },
  ],

  thesis: [
    { t:"Aggressive Store-Led Growth Engine",   d:"105 new stores added in 9M FY26 (total 294). Pipeline robust; guidance for 150 more in FY27 (end-FY26 ~325 stores). QIP proceeds deployed for warehousing + network. Mature stores productivity rising sharply." },
    { t:"Strong Operating Leverage + Margin Expansion", d:"Q3 FY26 operating margin 18.7% (highest ever). Full-price sales 92%, gross margin trajectory to 28-29%. Volume growth 48% in Q3 on festive + better inventory management. Normalised SSSG 12.8% (Q3) / 8.6% (9M)." },
    { t:"Tier-II/III Value Fashion Moat",       d:"Neo-middle class focus + apparel dominance. Minimal discounting, strong same-store momentum. Only organised player scaling rapidly in under-penetrated markets vs fragmented unorganised + big-box competition." },
    { t:"Turnaround Execution + FY27 50%+ Revenue Guidance", d:"From near-losses in FY23 to record PAT ₹102 Cr in Q3 FY26. Management confident on 8-10% SSSG + 50% revenue growth FY27 via store additions and productivity." },
  ],

  finData: [
    { yr:"FY23",  rev:839,  opm:10, opProfit:85,  cfo:50,  pat:-13, capex:80, dep:90, tax:0,   fcff:-30, cfoPatPct:null, roce:4,  type:"H" },
    { yr:"FY24",  rev:1165, opm:13, opProfit:149, cfo:120, pat:28,  capex:100,dep:100, tax:10, fcff:20,  cfoPatPct:429, roce:11, type:"H" },
    { yr:"FY25",  rev:1884, opm:14, opProfit:260, cfo:223, pat:72,  capex:131,dep:110, tax:25, fcff:92,  cfoPatPct:310, roce:17, type:"H" },
    { yr:"FY26E", rev:3200, opm:15, opProfit:480, cfo:350, pat:180, capex:200,dep:120, tax:60, fcff:150, cfoPatPct:194, roce:19, type:"P" },
    { yr:"FY27E", rev:4800, opm:16, opProfit:768, cfo:520, pat:320, capex:250,dep:130, tax:105,fcff:270, cfoPatPct:163, roce:22, type:"P" },
    { yr:"FY28E", rev:6500, opm:16.5,opProfit:1073,cfo:700, pat:480, capex:280,dep:140, tax:160,fcff:420, cfoPatPct:146, roce:24, type:"P" },
    { yr:"FY29E", rev:8500, opm:17, opProfit:1445,cfo:920, pat:680, capex:300,dep:150, tax:225,fcff:620, cfoPatPct:135, roce:25, type:"P" },
    { yr:"FY30E", rev:11000,opm:17.5,opProfit:1925,cfo:1200,pat:950, capex:320,dep:160, tax:315,fcff:880, cfoPatPct:126, roce:26, type:"P" },
  ],

  segmentKeys: ["apparel", "nonApparel", "others"],
  segmentLabels: { apparel:"Apparel (Core)", nonApparel:"Non-Apparel", others:"Others" },
  segData: [
    { yr:"FY25",  apparel:1500, nonApparel:300, others:84,  total:1884 },
    { yr:"FY26E", apparel:2550, nonApparel:500, others:150, total:3200 },
    { yr:"FY27E", apparel:3800, nonApparel:700, others:300, total:4800 },
    { yr:"FY28E", apparel:5100, nonApparel:950, others:450, total:6500 },
    { yr:"FY29E", apparel:6600, nonApparel:1300,others:600, total:8500 },
    { yr:"FY30E", apparel:8500, nonApparel:1700,others:800, total:11000 },
  ],

  porterKeys: ["tier23Value", "organisedApparel", "ecom"],
  porterLabels: { tier23Value:"Tier-II/III Value Retail", organisedApparel:"Organised Apparel", ecom:"E-commerce" },
  porterData: [
    { force:"New Entrants",  tier23Value:8.5, organisedApparel:7, ecom:6 },
    { force:"Buyer Power",   tier23Value:6,   organisedApparel:6.5, ecom:7 },
    { force:"Supplier Power",tier23Value:5,   organisedApparel:5.5, ecom:5 },
    { force:"Substitutes",   tier23Value:7,   organisedApparel:7.5, ecom:8 },
    { force:"Rivalry",       tier23Value:7,   organisedApparel:8,   ecom:8.5 },
  ],
  porterNarrative: [
    { force:"Threat of New Entrants",     lines:["Tier-II/III Value: LOW — Real-estate + supply chain + local understanding moat","Organised Apparel: MODERATE — Capital intensive","E-com: HIGH — Low barriers"] },
    { force:"Bargaining Power of Buyers", lines:["All segments: MOD — Price-sensitive but brand + full-price mix (92%) building stickiness"] },
    { force:"Supplier Power",             lines:["All segments: LOW — Direct sourcing + scale improving bargaining"] },
    { force:"Threat of Substitutes",      lines:["Tier-II/III: MOD — Unorganised + local kiranas","Organised: MOD — Big-box players","E-com: HIGH — Flipkart/Amazon penetration"] },
    { force:"Competitive Rivalry",        lines:["Tier-II/III Value: MODERATE — Fragmented unorganised but organised gaining","Organised Apparel: HIGH — Reliance Trends, Aditya Birla","E-com: VERY HIGH — Pure-play competition"] },
  ],
  porterConclusion: "V2 Retail enjoys a favourable position in under-penetrated Tier-II/III value fashion. Rapid store rollout + operating leverage + reduced discounting create widening moat vs unorganised players. Competition from organised big-box and e-com exists but execution edge in smaller cities + full-price focus differentiates.",

  qualityData: [
    { param:"Longevity",              score:5.0,  full:"25 years ÷ 5 = 5.0" },
    { param:"Predictable CF",         score:10,   full:"Avg CFO/PAT ÷ 150" },
    { param:"ROCE",                   score:4.9,  full:"17% ÷ 3.5" },
    { param:"Revenue Resilience",     score:9.5,  full:"CAGR + down years" },
    { param:"EPS Stability",          score:7.0,  full:"Volatility calc" },
    { param:"CFO/PAT",                score:10,   full:"Latest ÷ 120" },
    { param:"Margins",                score:8.5,  full:"Margin + expansion" },
    { param:"Reinvestment",           score:8.0,  full:"Capex efficiency" },
    { param:"Balance Sheet Strength", score:3.0,  full:"(Debt Score + Cash Score) ÷ 2" },
  ],
  qualitySummary: {
    consolidated: "7.7/10",
    standalone:   "7.7/10",
    insight:      "Pure maths score. Longevity capped at 5.0 (25 years). Balance sheet moderate due to debt. Strong cash conversion and resilience pull it up.",
  },

  sensitivity: {
    cmp: 1940,
    peColumns: [
      { label:"35x (De-rate)", key:"pe35" },
      { label:"45x (Base)",    key:"pe45" },
      { label:"55x (Re-rate)", key:"pe55" },
      { label:"65x (Premium)", key:"pe65" },
    ],
    rows: [
      { label:"Bear ₹65",   pe35:2275, pe45:2925, pe55:3575, pe65:4225 },
      { label:"Base ₹95",   pe35:3325, pe45:4275, pe55:5225, pe65:6175 },
      { label:"Bull ₹125",  pe35:4375, pe45:5625, pe55:6875, pe65:8125 },
    ],
    scenarios: [
      { label:"BEAR",      color:"RED",   rev:"₹7,500 Cr", opm:"15%", eps:"₹65",  pe:"35–45x", target:"₹2,275–2,925", desc:"SSSG slows to 5%. Store addition delays. Margin pressure from competition + discounting. Debt servicing strains." },
      { label:"BASE CASE", color:"BLUE",  rev:"₹11,000 Cr",opm:"17.5%",eps:"₹95", pe:"45–55x", target:"₹4,275–5,225", desc:"8-10% SSSG + 150 stores/year. Operating leverage sustains. Gross margin 28-29%. Reasonable premium for growth." },
      { label:"BULL",      color:"GREEN", rev:"₹14,000 Cr",opm:"18.5%",eps:"₹125", pe:"55–65x", target:"₹6,875–8,125", desc:"12%+ SSSG + faster rollout to 500+ stores. Market share gains in Tier-II/III. Re-rating on consistent execution." },
    ],
    conclusion: "Base Case FY30 Target: ₹4,200–5,200 (17–22% CAGR from ₹1,940). 45-55x FY30 EPS on ₹95 (store-led 25%+ revenue CAGR + 17.5% EBITDA + rising ROCE). Aggressive expansion + SSSG momentum + operating leverage provide multi-year visibility in under-penetrated value retail segment.",
  },

  dcf: {
    wacc:         14.5,
    termGrowth:   8.0,
    isNBFC:       false,
    wcRev:        3.0,
    taxRate:      25,
    interestRate: 8,
    note: "High-growth value fashion. Higher CoE reflects small-cap risk and early-stage unit economics.",
  },
},


// ─────────────────────────────────────────────
//  HDFC AMC — HDFC Asset Management Company Ltd
// ─────────────────────────────────────────────
"HDFCAMC": {
  // ── Identity ──
  id:           "HDFCAMC",
  name:         "HDFC Asset Management Company Ltd",
  nse:          "HDFCAMC",
  bse:          "541729",
  indices:      "Nifty 50 · Nifty Next 50 · Nifty 500",
  sector:       "Asset Management / Financial Services",
  rating:       "BUY",
  description:  "India's largest AMC by actively managed equity AUM and #2 overall (~11.5% total market share). Manages ₹9.25 lakh Cr (Q3 FY26) across 250+ schemes under HDFC Mutual Fund. Zero debt, 80%+ EBITDA margins, 30%+ ROE, 42%+ ROCE. Pure capital-light toll-road business: earns a fee (TER) on every rupee of AUM, takes zero market risk. 15.4 million unique investors, 27.6 million live folios, backed by HDFC Bank (52.4% promoter). 1:1 bonus issue completed Nov 2025.",

  // ── Header metric tiles ──
  metrics: [
    { label: "CMP",              value: "₹2,510",        sub: "Mar 2026 (post bonus)"            },
    { label: "Market Cap",       value: "₹1,07,500 Cr",  sub: "~$12.8B · Nifty 50", color: "GOLD"   },
    { label: "Target",           value: "₹3,200–4,000",  sub: "14–18% CAGR to FY30", color: "GREEN" },
    { label: "EBITDA Margin",    value: "81.7%",          sub: "Q3 FY26 (FY30E: 80%+)", color: "BLUE"  },
    { label: "ROCE / ROE",       value: "41% / 31%",     sub: "FY25",               color: "TEAL"   },
    { label: "Quality",          value: "8.3/10",         sub: "Wide-Moat Compounder", color: "ORANGE" },
  ],

  // ── Investment thesis ──
  thesis: [
    { t: "India's Financialisation Mega-Theme",           d: "India MF AUM grew from ₹23 lakh Cr (FY20) to ₹67 lakh Cr (Q3 FY26) — a 3x in 5 years. Mutual fund penetration at 17% of GDP vs 130%+ in USA. SIP inflows hit ₹31,000 Cr/month in Dec 2025. 8.6 crore SIP accounts growing at 28% YoY. HDFC AMC is the toll-road on this structural trend." },
    { t: "Duopoly with Near-Unassailable Moat",           d: "25+ years of brand trust, HDFC Bank's 9,455 branches as distribution backbone, and scale-driven cost advantages create a network effect moat. Top-2 AMCs (HDFC + SBI) hold ~24% of total industry AUM. Active equity market share steady at 13% — the highest-margin segment at 58 bps yield." },
    { t: "Operating Leverage Compounding Machine",        d: "Revenue scales with AUM (fee-based), but costs are largely fixed (people + technology). EBITDA margins expand from 76% (FY22) to 80%+ now and expected to sustain at 78–82% through FY30. Cost-to-AUM is industry's lowest at 11 bps. Every incremental ₹1 of AUM revenue converts at 80–85% to EBITDA." },
    { t: "Valuation Disconnect from Quality",             d: "At ₹2,510 and FY30E EPS of ~₹190, stock trades at ~13x FY30E — extraordinarily cheap for a 30%+ ROE compounder with zero debt. TER compression fears are overblown: HDFC AMC can offset 2–4 bps yield compression via AUM volume growth of 15–18% CAGR." },
  ],

  // ── Financial time series (₹ Cr) ──
  // Revenue = Revenue from operations; OPM = EBITDA margin; PAT as reported
  // CFO from cash flow statements; Capex minimal (capex ~₹35-60 Cr/yr, asset-light)
  // ROCE per annual reports; EPS pre-bonus doubled post-bonus (1:1 Nov 2025)
  finData: [
    { yr:"FY20",  rev:2143, opm:71, opProfit:1522, cfo:1010, pat:1262, capex:25, fcff:985,  cfoPatPct:80,  roce:31, type:"H" },
    { yr:"FY21",  rev:2202, opm:79, opProfit:1740, cfo:1085, pat:1326, capex:28, fcff:1057, cfoPatPct:82,  roce:37, type:"H" },
    { yr:"FY22",  rev:2584, opm:76, opProfit:1964, cfo:1254, pat:1393, capex:32, fcff:1222, cfoPatPct:90,  roce:34, type:"H" },
    { yr:"FY23",  rev:2645, opm:75, opProfit:1984, cfo:1149, pat:1423, capex:35, fcff:1114, cfoPatPct:81,  roce:31, type:"H" },
    { yr:"FY24",  rev:3163, opm:76, opProfit:2398, cfo:1615, pat:1943, capex:40, fcff:1575, cfoPatPct:83,  roce:36, type:"H" },
    { yr:"FY25",  rev:4058, opm:80, opProfit:3241, cfo:2075, pat:2460, capex:45, fcff:2030, cfoPatPct:84,  roce:41, type:"H" },
    { yr:"FY26E", rev:4850, opm:81, opProfit:3929, cfo:2520, pat:2960, capex:50, fcff:2470, cfoPatPct:85,  roce:45, type:"P" },
    { yr:"FY27E", rev:5600, opm:81, opProfit:4536, cfo:2950, pat:3430, capex:55, fcff:2895, cfoPatPct:86,  roce:46, type:"P" },
    { yr:"FY28E", rev:6500, opm:82, opProfit:5330, cfo:3450, pat:4000, capex:60, fcff:3390, cfoPatPct:86,  roce:48, type:"P" },
    { yr:"FY29E", rev:7400, opm:82, opProfit:6068, cfo:3950, pat:4550, capex:60, fcff:3890, cfoPatPct:87,  roce:49, type:"P" },
    { yr:"FY30E", rev:8500, opm:82, opProfit:6970, cfo:4580, pat:5250, capex:65, fcff:4515, cfoPatPct:87,  roce:51, type:"P" },
  ],

  // ── Segment AUM-based revenue split (₹ Cr, proxy) ──
  // Equity yields ~58 bps, Debt ~27-28 bps, Liquid ~12-13 bps of AUM
  // Revenue split derived from AUM mix and segment yields
  segmentKeys: ["equity", "debt", "liquid", "etfother"],
  segmentLabels: { equity: "Equity-Oriented", debt: "Debt / Hybrid", liquid: "Liquid / Money Mkt", etfother: "ETF & Others" },
  segData: [
    { yr:"FY22",  equity:1810, debt:420,  liquid:225, etfother:129,  total:2584 },
    { yr:"FY23",  equity:1800, debt:430,  liquid:230, etfother:185,  total:2645 },
    { yr:"FY24",  equity:2280, debt:460,  liquid:240, etfother:183,  total:3163 },
    { yr:"FY25",  equity:3100, debt:530,  liquid:250, etfother:178,  total:4058 },
    { yr:"FY26E", equity:3750, debt:590,  liquid:270, etfother:240,  total:4850 },
    { yr:"FY27E", equity:4350, debt:660,  liquid:295, etfother:295,  total:5600 },
    { yr:"FY28E", equity:5100, debt:750,  liquid:320, etfother:330,  total:6500 },
    { yr:"FY29E", equity:5850, debt:840,  liquid:340, etfother:370,  total:7400 },
    { yr:"FY30E", equity:6750, debt:960,  liquid:375, etfother:415,  total:8500 },
  ],

  // ── Porter's 5 Forces ──
  porterKeys: ["activeEquity", "passiveETF", "debt"],
  porterLabels: { activeEquity: "Active Equity", passiveETF: "Passive / ETF", debt: "Debt / Liquid" },
  porterData: [
    { force:"New Entrants",   activeEquity:8,   passiveETF:5,  debt:6  },
    { force:"Buyer Power",    activeEquity:6,   passiveETF:7,  debt:7  },
    { force:"Supplier Power", activeEquity:8,   passiveETF:9,  debt:9  },
    { force:"Substitutes",    activeEquity:6,   passiveETF:5,  debt:5  },
    { force:"Rivalry",        activeEquity:7,   passiveETF:6,  debt:6  },
  ],
  porterNarrative: [
    { force:"Threat of New Entrants",     lines:["Active Equity: LOW — SEBI license, HDFC brand trust, 25yr track record + HDFC Bank distribution moat create near-insurmountable barriers","Passive/ETF: MODERATE — Low-cost ETFs easier to replicate; Mirae, Nippon gaining ETF AUM","Debt: MODERATE — SBI, ICICI, Kotak all compete fiercely in debt AUM"] },
    { force:"Bargaining Power of Buyers", lines:["Active Equity: MODERATE — Direct plans + fintech aggregators (Zerodha Coin, Groww) reduce switching costs; but HDFC brand + performance builds stickiness","Passive: HIGH — Price competition caps TER; investors commoditize index products","Debt/Liquid: HIGH — Corporate treasuries and banks toggle between AMCs on yield"] },
    { force:"Supplier Power",             lines:["Active Equity: LOW — Fund managers are employees; HDFC Bank (distribution) is a related party = structural cost advantage","Passive/ETF: VERY LOW — Index construction is rule-based, minimal talent dependency","Debt: LOW — Fixed income is rules-driven; switching costs of distributor low"] },
    { force:"Threat of Substitutes",      lines:["Active Equity: MODERATE — PMS, AIF, direct equities, NPS compete for the HNI wallet; but SIP culture is deeply entrenched","Passive: LOW-MOD — International ETFs emerging but domestic alternatives dominate","Debt: MODERATE — Bank FDs, bonds, G-secs increasingly accessible via RBI Retail Direct"] },
    { force:"Competitive Rivalry",        lines:["Active Equity: MOD-HIGH — Top-5 AMCs compete intensely on alpha generation; HDFC equity mix (66% of AUM vs 56% industry) = structural advantage","Passive: HIGH — Nippon, SBI, Mirae aggressively building passive AUM","Debt: HIGH — 40+ AMCs compete; margins thin; product differentiation low"] },
  ],
  porterConclusion: "HDFC AMC enjoys a WIDE MOAT in active equity management — its highest-margin segment. The 25-year brand + HDFC Bank distribution network + scale economics are extremely hard to replicate. Threat exists in passive/ETF shift (structural headwind) but active equity inflows remain robust. Overall moat: WIDE, with moderate erosion risk from TER regulation and passive shift over 10+ year horizon.",

  // ── Quality scorecard ──
  qualityData: [
    { param:"Longevity",          score:9,   full:"25yr ops since 1999; PAT positive every year; survived Dot-com, GFC, COVID; HDFC brand = 50+ year legacy" },
    { param:"Predictable CF",     score:8,   full:"CFO/PAT consistently 80-87%; fee income scales linearly with AUM; very low capex; highly predictable cash generation" },
    { param:"ROCE",               score:9,   full:"ROCE expanded 31% (FY21) → 41% (FY25) → 51%E (FY30); zero debt = pure equity ROCE; best-in-class capital efficiency" },
    { param:"Revenue Resilience", score:7,   full:"16.5% revenue CAGR FY21-25; AUM fell 20% in FY20 correction but recovered; COVID-year PAT still grew; market-linked but structurally rising" },
    { param:"EPS Stability",      score:7,   full:"Consistent growth except FY22-23 flattish (market downturn). EPS (post-bonus basis): FY24 ₹91 → FY25 ₹115 → FY26E ₹140 → FY30E ₹190" },
    { param:"CFO/PAT",            score:8,   full:"80-87% CFO/PAT; clean conversion; no capital trapped in receivables (fee collected upfront/daily); minimal capex" },
    { param:"Margins",            score:9,   full:"EBITDA 79-82%; highest sustained margin in listed Indian financials; operating leverage means margins expand with AUM scale" },
    { param:"Reinvestment",       score:8,   full:"Capital-light; dividends 70-75% payout; AUM growth = automatic reinvestment via retained AUM compounding; alternatives & PMS expanding" },
  ],
  qualitySummary: {
    consolidated: "8.3/10",
    standalone:   "8.3/10",
    insight:      "HDFC AMC is one of India's highest-quality listed businesses: near-monopoly brand in active equity, 80%+ EBITDA margin, zero debt, 30%+ ROE, and 25 years of PAT growth. Quality score held back by market-linked revenue risk (AUM falls in corrections) and regulatory TER compression risk. Otherwise, a near-perfect business model.",
  },

  // ── Sensitivity matrix (FY30E EPS basis, post-bonus) ──
  sensitivity: {
    cmp: 2510,
    peColumns: [
      { label:"30x (De-rate)", key:"pe30" },
      { label:"38x (Base)",    key:"pe38" },
      { label:"46x (Re-rate)", key:"pe46" },
      { label:"55x (Premium)", key:"pe55" },
    ],
    rows: [
      { label:"Bear ₹140",  pe30:4200, pe38:5320, pe46:6440, pe55:7700 },
      { label:"Base ₹190",  pe30:5700, pe38:7220, pe46:8740, pe55:10450 },
      { label:"Bull ₹230",  pe30:6900, pe38:8740, pe46:10580, pe55:12650 },
    ],
    scenarios: [
      { label:"BEAR",      color:"RED",   rev:"₹6,500 Cr", opm:"78%", eps:"₹140", pe:"30–38x", target:"₹4,200–5,320", desc:"AUM growth moderates to 10% CAGR due to equity market correction. TER compression hits 6+ bps. Revenue CAGR only 8%. Market de-rates to 30x on regulatory uncertainty." },
      { label:"BASE CASE", color:"BLUE",  rev:"₹8,500 Cr", opm:"82%", eps:"₹190", pe:"38–46x", target:"₹7,220–8,740", desc:"15–18% AUM CAGR. Equity share stays 62%+. TER compression offset by volume. PAT CAGR 16–18%. Justified 38–46x for a 30%+ ROE compounder with near-zero reinvestment need." },
      { label:"BULL",      color:"GREEN", rev:"₹10,000 Cr",opm:"83%", eps:"₹230", pe:"46–55x", target:"₹10,580–12,650",desc:"20%+ AUM CAGR. India MF penetration re-rates upward. Alternatives/PMS scale to 5%+ of revenue. Market re-rates HDFC AMC as India's Blackrock at premium multiple." },
    ],
    conclusion: "Base Case FY30 Target: ₹7,200–8,700 (14–18% CAGR from ₹2,510). At CMP, FY30E P/E is only ~13x — extraordinarily cheap for a 30%+ ROE, 80%+ margin, zero-debt compounder. Even at 30x de-rate, FY30 target is ₹5,700 (12% CAGR). Downside is limited; upside is substantial if India's MF AUM grows to ₹1.5 lakh Cr+ by FY30.",
  },

  dcf: {
    wacc:         12.5,
    termGrowth:   8.5,
    isNBFC:       false,
    wcRev:        0,
    taxRate:      25,
    interestRate: 0,
    note: "Asset management — zero debt, capital-light, AUM-linked recurring fee income. Terminal growth 8.5% reflects India nominal GDP growth + financialisation premium. Low WACC justified by near-zero business risk and AAA-equivalent promoter (HDFC Bank).",
  },
},



// ─────────────────────────────────────────────
//  ICICI PRUDENTIAL AMC — ICICI Prudential Asset Management Company Ltd
// ─────────────────────────────────────────────
"ICICIAMC": {
  // ── Identity ──
  id:           "ICICIAMC",
  name:         "ICICI Prudential Asset Management Company Ltd",
  nse:          "ICICIAMC",
  bse:          "544658",
  indices:      "BSE 500 · BSE Financial Services",
  sector:       "Asset Management / Financial Services",
  rating:       "BUY",
  description:  "India's #1 AMC by active mutual fund QAAUM (₹10.76 lakh Cr, Q3 FY26), largest equity QAAUM (13.8% share), and most profitable AMC by operating profit (20% industry share). JV between ICICI Bank (51%) and Prudential Corporation Holdings (49%). Newly listed Dec 2025 (IPO price ₹2,165). Manages 143+ schemes, 278 offices, 16.2 million unique customers. Revenue CAGR 27% over FY23–25; PAT CAGR 32% over same period. 0% debt, ROE 83%, EBITDA margin 73%. Superior to HDFC AMC on absolute AUM scale and ROE; commands premium on post-IPO re-rating cycle.",

  // ── Header metric tiles ──
  metrics: [
    { label: "CMP",              value: "₹3,010",        sub: "Mar 2026 (post-IPO)"              },
    { label: "Market Cap",       value: "₹1,48,500 Cr",  sub: "~$17.7B · Fresh Listing Dec 2025", color: "GOLD"   },
    { label: "Target",           value: "₹3,800–4,800",  sub: "15–20% CAGR to FY30",             color: "GREEN"  },
    { label: "EBITDA Margin",    value: "73.0%",          sub: "FY25 (Q3 FY26: 73.3%)",           color: "BLUE"   },
    { label: "ROE / ROCE",       value: "83% / 68%",     sub: "FY25 (highest in listed AMCs)",    color: "TEAL"   },
    { label: "Quality",          value: "8.5/10",         sub: "Exceptional ROE Compounder",       color: "ORANGE" },
  ],

  // ── Investment thesis ──
  thesis: [
    { t: "India's #1 AMC — Largest, Most Profitable",    d: "Active MF QAAUM of ₹10.76 lakh Cr; 13.3% total market share; 13.8% equity market share — both industry-leading. Operating profit market share 20% in FY25, well above AUM share — testament to higher equity mix (57% vs 56% industry) and scale-driven operating leverage. India MF AUM CAGR of 18.4% over FY19–FY25 and ICICI AMC riding this perfectly." },
    { t: "Dual-Promoter Moat: ICICI Bank + Prudential",  d: "ICICI Bank (51%) provides 6,500+ branches and 16,650+ ATMs for distribution — India's 2nd largest private bank backbone. Prudential plc (49%) contributes global investment management expertise, risk frameworks, and international product mandates. Dual-promoter JV model creates structural distribution + governance advantages that no independent AMC can replicate." },
    { t: "Extraordinary Unit Economics — ROE 83%",       d: "FY25 ROE of 82.8% — highest among listed Indian AMCs. This is structural: asset-light model (net worth only ₹3,517 Cr vs ₹1,48,500 Cr market cap) with zero debt and high fee income. EBITDA-to-revenue yield of 0.37% on AUM; every ₹1 of incremental revenue above fixed costs converts at ~85%+ to EBITDA. Operating leverage will compound as AUM doubles from ₹10.7 lakh Cr toward ₹25 lakh Cr by FY30." },
    { t: "Post-IPO Re-rating Catalyst + Alternates Scale", d: "Stock listed Dec 2025 at ₹2,165 (IPO). Re-rating cycle typically lasts 12–18 months as institutional ownership builds up. Additionally, Alternates (PMS ₹2,728 Cr AUM + AIF ₹1,591 Cr + Advisory ₹3,209 Cr) growing faster and at higher margins. Proposed acquisition of ICICI Venture AIF management rights (SEBI-approved Mar 2026) will accelerate alternatives scale — a structural re-rating trigger." },
  ],

  // ── Financial time series (₹ Cr) ──
  // Revenue = Revenue from operations per IPO RHP and quarterly filings
  // EBITDA per Outlook Money / BSE filings: FY23 ₹2,073 Cr, FY24 ₹2,780 Cr, FY25 ₹3,637 Cr
  // PAT: FY23 ₹1,516 Cr, FY24 ₹2,050 Cr, FY25 ₹2,651 Cr; Q3FY26 ₹917 Cr (TTM ~₹3,235 Cr)
  // ROE: FY25 82.8% (net worth ₹3,517 Cr); ROCE ~68% FY25 (computed from EBIT/CE)
  // Capex ~₹40-60 Cr/yr (asset-light, minimal fixed assets); CFO ~88-92% of PAT (clean conversion)
  // Shares outstanding post-IPO: ~4.93 Cr (post Rs1 FV) = 49.3 Cr shares
  finData: [
    { yr:"FY20",  rev:1856, opm:65, opProfit:1206, cfo:880,  pat:1020, capex:30, fcff:850,  cfoPatPct:86,  roce:52, type:"H" },
    { yr:"FY21",  rev:1942, opm:68, opProfit:1321, cfo:930,  pat:1120, capex:32, fcff:898,  cfoPatPct:83,  roce:55, type:"H" },
    { yr:"FY22",  rev:2380, opm:70, opProfit:1666, cfo:1100, pat:1221, capex:35, fcff:1065, cfoPatPct:90,  roce:58, type:"H" },
    { yr:"FY23",  rev:2837, opm:73, opProfit:2073, cfo:1380, pat:1516, capex:38, fcff:1342, cfoPatPct:91,  roce:61, type:"H" },
    { yr:"FY24",  rev:3758, opm:74, opProfit:2780, cfo:1870, pat:2050, capex:42, fcff:1828, cfoPatPct:91,  roce:65, type:"H" },
    { yr:"FY25",  rev:4977, opm:73, opProfit:3637, cfo:2400, pat:2651, capex:48, fcff:2352, cfoPatPct:91,  roce:68, type:"H" },
    { yr:"FY26E", rev:6000, opm:74, opProfit:4440, cfo:2950, pat:3235, capex:55, fcff:2895, cfoPatPct:91,  roce:71, type:"P" },
    { yr:"FY27E", rev:7100, opm:74, opProfit:5254, cfo:3520, pat:3830, capex:60, fcff:3460, cfoPatPct:92,  roce:74, type:"P" },
    { yr:"FY28E", rev:8400, opm:75, opProfit:6300, cfo:4200, pat:4550, capex:65, fcff:4135, cfoPatPct:92,  roce:77, type:"P" },
    { yr:"FY29E", rev:9800, opm:75, opProfit:7350, cfo:4950, pat:5300, capex:70, fcff:4880, cfoPatPct:93,  roce:80, type:"P" },
    { yr:"FY30E", rev:11500,opm:76, opProfit:8740, cfo:5900, pat:6250, capex:75, fcff:5825, cfoPatPct:94,  roce:83, type:"P" },
  ],

  // ── AUM-based revenue segment split (₹ Cr) ──
  // Equity QAAUM ~57% of total; Debt/Hybrid ~30%; Liquid ~8%; ETF+Passive+Others ~5%
  // Yields: Equity ~56 bps; Debt ~28 bps; Liquid ~12 bps; ETF ~7 bps
  // Alternates (PMS+AIF+Advisory) growing rapidly — modelled separately as "Alternates"
  segmentKeys: ["equity", "debt", "liquid", "alternates"],
  segmentLabels: { equity: "Equity-Oriented", debt: "Debt / Hybrid", liquid: "Liquid / Passive", alternates: "Alternates (PMS/AIF)" },
  segData: [
    { yr:"FY22",  equity:1665, debt:497,  liquid:131, alternates:87,  total:2380 },
    { yr:"FY23",  equity:1980, debt:589,  liquid:163, alternates:105, total:2837 },
    { yr:"FY24",  equity:2695, debt:743,  liquid:200, alternates:120, total:3758 },
    { yr:"FY25",  equity:3675, debt:858,  liquid:249, alternates:195, total:4977 },
    { yr:"FY26E", equity:4450, debt:990,  liquid:280, alternates:280, total:6000 },
    { yr:"FY27E", equity:5300, debt:1130, liquid:300, alternates:370, total:7100 },
    { yr:"FY28E", equity:6300, debt:1300, liquid:320, alternates:480, total:8400 },
    { yr:"FY29E", equity:7400, debt:1480, liquid:340, alternates:580, total:9800 },
    { yr:"FY30E", equity:8700, debt:1700, liquid:360, alternates:740, total:11500 },
  ],

  // ── Porter's 5 Forces ──
  porterKeys: ["activeEquity", "passiveETF", "alternates"],
  porterLabels: { activeEquity: "Active Equity", passiveETF: "Passive / Liquid", alternates: "Alternates (PMS/AIF)" },
  porterData: [
    { force:"New Entrants",   activeEquity:8,   passiveETF:5,  alternates:7  },
    { force:"Buyer Power",    activeEquity:6,   passiveETF:7,  alternates:5  },
    { force:"Supplier Power", activeEquity:8,   passiveETF:9,  alternates:7  },
    { force:"Substitutes",    activeEquity:6,   passiveETF:5,  alternates:6  },
    { force:"Rivalry",        activeEquity:7,   passiveETF:6,  alternates:7  },
  ],
  porterNarrative: [
    { force:"Threat of New Entrants",     lines:["Active Equity: LOW — SEBI license + 30-year brand + ICICI Bank distribution + ICICI Group captive AUM create a near-unassailable position. New AMCs need 5–10 years of track record","Passive/Liquid: MODERATE — Lower-cost ETFs easier to replicate. Mirae, Nippon, and Groww AMC gaining ETF market share aggressively","Alternates (PMS/AIF): LOW-MOD — SEBI-registered PMS/AIF space is competitive but ICICI Prudential's institutional trust provides differentiation"] },
    { force:"Bargaining Power of Buyers", lines:["Active Equity: MODERATE — Direct plans + Groww/Zerodha reduce switching cost; but ICICI brand + Sankaran Naren's fund performance builds stickiness","Passive/Liquid: HIGH — Institutional treasuries commoditize liquid products; price competition caps yields at 10–12 bps","Alternates: LOW-MOD — HNI/Institutional clients sticky due to customization; relationship-driven with lower churn"] },
    { force:"Supplier Power",             lines:["Active Equity: LOW — Sankaran Naren is a team, not a single star; institutionalized investment process reduces key-man risk","Passive/ETF: VERY LOW — Rules-based indexing needs no star managers; supply concentration near-zero","Alternates: MODERATE — Senior PMS fund managers have market alternatives; talent cost rising in alternatives space"] },
    { force:"Threat of Substitutes",      lines:["Active Equity: MODERATE — PMS, AIF, direct equity, NPS all compete for wallet. But SIP as a habit is deeply embedded; ICICI Pru captures HNI via multiple products simultaneously","Passive/Liquid: MODERATE — Bank FDs, G-secs via RBI Retail Direct, and bonds are substitutes. But convenience and product depth retain customers","Alternates: MODERATE — IIFL Wealth, 360 One, Nuvama compete for UHNI wallet; but ICICI's institutional trust and ICICI Bank cross-sell offset this"] },
    { force:"Competitive Rivalry",        lines:["Active Equity: MOD-HIGH — HDFC AMC, SBI AMC, Mirae, Nippon all compete fiercely on 1yr/3yr/5yr performance tables; ICICI Pru holds edge via Naren's contra-style, which works in volatile markets","Passive/Liquid: HIGH — 45+ AMCs compete; yield competition compressed margins; ICICI's scale advantage helps on cost","Alternates: HIGH — Growing number of SEBI-registered investment advisors and PMS providers; but ICICI Pru's scale = institutional mandate preference"] },
  ],
  porterConclusion: "ICICI Prudential AMC commands a WIDE MOAT in active equity management — the crown jewel at 57% of AUM and highest yield segment. Dual promoter structure (ICICI Bank distribution + Prudential global expertise) is the defining competitive advantage. The primary moat threats — passive shift and TER compression — are secular but slow-moving. Alternates business is emerging as a second high-margin moat. Overall: WIDE MOAT, durable for 10+ years.",

  // ── Quality scorecard ──
  qualityData: [
    { param:"Longevity",          score:9,   full:"30yr ops since 1993; PAT positive every year; survived Asian crisis, GFC, COVID, demonetization; ICICI & Prudential = combined 100+ yr brand legacy" },
    { param:"Predictable CF",     score:9,   full:"CFO/PAT consistently 88–94%; fee collected daily on AUM; zero capex intensity (₹48 Cr on ₹4,977 Cr revenue = 1% of sales); cash generation near-perfect" },
    { param:"ROCE",               score:10,  full:"ROCE 68% FY25 (and still expanding); zero debt balance sheet; pre-IPO asset-light entity. ROE 82.8% = highest in listed Indian financial services. Industry benchmark." },
    { param:"Revenue Resilience", score:8,   full:"27% revenue CAGR FY23–25; 20%+ CAGR over FY20–25; AUM-linked but SIP habit provides smoothness even in corrections. No year of absolute revenue decline in 10yr history." },
    { param:"EPS Stability",      score:7,   full:"Consistent growth; FY23 EPS ₹37.5 → FY24 EPS ₹50.6 → FY25 EPS ₹65.5. IPO dilution marginal (OFS only = no new shares). FY26E TTM EPS ~₹80; FY30E EPS ~₹154." },
    { param:"CFO/PAT",            score:9,   full:"88–94% CFO/PAT range; among the cleanest in Indian listed universe. No working capital trap; negligible receivables; upfront fee collection on AUM daily." },
    { param:"Margins",            score:8,   full:"EBITDA margin 73–74%; expansion path to 75–76% by FY30 via operating leverage. Net profit margin 53.3% FY25 — one of the highest in Indian financials." },
    { param:"Reinvestment",       score:8,   full:"Capital-light; 85–90% payout announced; Alternates expansion (PMS/AIF) is self-funded from free cash flows; ICICI Venture AIF rights acquisition a high-ROE bolt-on." },
  ],
  qualitySummary: {
    consolidated: "8.5/10",
    standalone:   "8.5/10",
    insight:      "ICICI Prudential AMC ranks among the top 3 highest-quality businesses in Indian listed equities by financial metrics. 82.8% ROE, 68% ROCE, zero debt, 73%+ EBITDA margins, 30-year track record, dual-promoter moat, and cleanest cash conversion in the sector. Only structural risk is market-linkage of AUM and regulatory TER pressure — both manageable and well-understood.",
  },

  // ── Sensitivity matrix (FY30E EPS basis, 49.3 Cr shares) ──
  sensitivity: {
    cmp: 3010,
    peColumns: [
      { label:"28x (De-rate)", key:"pe28" },
      { label:"36x (Base)",    key:"pe36" },
      { label:"44x (Re-rate)", key:"pe44" },
      { label:"55x (Premium)", key:"pe55" },
    ],
    rows: [
      { label:"Bear ₹105",  pe28:2940, pe36:3780, pe44:4620, pe55:5775 },
      { label:"Base ₹154",  pe28:4312, pe36:5544, pe44:6776, pe55:8470 },
      { label:"Bull ₹190",  pe28:5320, pe36:6840, pe44:8360, pe55:10450 },
    ],
    scenarios: [
      { label:"BEAR",      color:"RED",   rev:"₹8,500 Cr", opm:"73%", eps:"₹105", pe:"28–36x", target:"₹2,940–3,780", desc:"AUM growth moderates to 12% CAGR. TER compression hits 5–7 bps. Equity market correction reduces QAAUM. Revenue CAGR slows to 10%. Market de-rates to 28–36x on fresh-listing valuation anxiety and regulatory uncertainty." },
      { label:"BASE CASE", color:"BLUE",  rev:"₹11,500 Cr", opm:"76%", eps:"₹154", pe:"36–44x", target:"₹5,544–6,776", desc:"17–20% AUM CAGR driven by SIP flows and equity market appreciation. ICICI Bank distribution drives B30 penetration. Alternates scale to 8–10% of revenue. PAT CAGR 20%+. 36–44x reasonable for India's most profitable AMC." },
      { label:"BULL",      color:"GREEN", rev:"₹14,000 Cr", opm:"78%", eps:"₹190", pe:"44–55x", target:"₹8,360–10,450", desc:"25%+ AUM CAGR. ICICI Venture AIF rights generate ₹500–700 Cr incremental revenue. India MF penetration re-rates. Post-IPO institutional ownership build drives re-rating to premium multiple. ROE sustains 85%+." },
    ],
    conclusion: "Base Case FY30 Target: ₹5,500–6,800 (15–20% CAGR from CMP ₹3,010). At CMP, FY30E P/E is only ~19.5x — deeply undervalued for India's most profitable AMC with 83% ROE, 68% ROCE, and zero debt. Strong IPO re-rating cycle ahead; institutional ownership still nascent. 12-month target: ₹3,800 (26% upside at 44x TTM FY26E EPS ₹86).",
  },

  dcf: {
    wacc:         12.0,
    termGrowth:   8.5,
    isNBFC:       false,
    wcRev:        0,
    taxRate:      25,
    interestRate: 0,
    note: "India's #1 active AMC. Zero debt, near-100% CFO conversion, negligible capex. WACC 12.0% (lower than HDFC AMC due to ICICI Bank + Prudential dual-promoter AAA backing). Terminal growth 8.5% = India nominal GDP + financialisation premium. ROE 80%+ perpetuity = moat-quality business.",
  },
},

  };





// ─────────────────────────────────────────────────────────────────────────────
//  ROUTE MAP — used by App.js to auto-generate routes
//  Add one line per stock. Route path + which DB key to use.
// ─────────────────────────────────────────────────────────────────────────────
export const STOCK_ROUTES = [
  { path: "/bajfinance",    stockId: "BAJFINANCE"  },
  { path: "/hdfcamc",    stockId: "HDFCAMC"  },
  { path: "/bel",           stockId: "BEL"  },
  { path: "/iciciamc",           stockId: "ICICIAMC"  },
  { path: "/tvs-motor",     stockId: "TVSMOTOR"    },
  { path: "/v2-retails",     stockId: "V2RETAIL"    },
  { path: "/info-edge",     stockId: "NAUKRI"    },
  { path: "/eicher-motors", stockId: "EICHERMOT" },
  { path: "/igil",          stockId: "IGIL"      },
  { path: "/mcx",           stockId: "MCX"       },
  { path: "/yatharth",      stockId: "YATHARTH"  },
  

  

];