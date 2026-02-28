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
    },
  
  };
  
  
  // ─────────────────────────────────────────────────────────────────────────────
  //  ROUTE MAP — used by App.js to auto-generate routes
  //  Add one line per stock. Route path + which DB key to use.
  // ─────────────────────────────────────────────────────────────────────────────
  export const STOCK_ROUTES = [
    { path: "/info-edge",     stockId: "NAUKRI"    },
    { path: "/eicher-motors", stockId: "EICHERMOT" },
    { path: "/igil",          stockId: "IGIL"      },
    { path: "/mcx",           stockId: "MCX"       },
  ];