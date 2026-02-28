import { useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ComposedChart, Area, Cell, ReferenceLine
} from "recharts";

const NAVY  = "#0D1B2A";
const BLUE  = "#2E75B6";
const TEAL  = "#0E7C7B";
const GREEN = "#27AE60";
const RED   = "#C0392B";
const ORANGE= "#E67E22";
const GOLD  = "#D4A017";

const tabs = ["Overview","Porter's 5 Forces","Revenue Model","FCFF & CFO/PAT","OPM & ROCE","Quality Score","Sensitivity"];

// ─── Financial data — sourced from Eicher Motors Equity Research Report (Feb 27 2026) ───
// FY16 data from public filings; FY17–FY25 exact from report table; FY26E–FY30E from report projections
const finData = [
  // yr       rev    opm  opProfit cfo    pat    capex  fcff  cfoPatPct roce  type
  { yr:"FY16", rev:6173,  opm:27, opProfit:1667, cfo:1463, pat:1338, capex:235, fcff:1228, cfoPatPct:109, roce:51, type:"H" },
  { yr:"FY17", rev:7033,  opm:31, opProfit:2180, cfo:1708, pat:1667, capex:280, fcff:1428, cfoPatPct:102, roce:53, type:"H" },
  { yr:"FY18", rev:8965,  opm:31, opProfit:2779, cfo:2482, pat:1960, capex:660, fcff:1822, cfoPatPct:127, roce:49, type:"H" },
  { yr:"FY19", rev:9797,  opm:30, opProfit:2939, cfo:1575, pat:2203, capex:523, fcff:1052, cfoPatPct:72,  roce:41, type:"H" },
  { yr:"FY20", rev:9154,  opm:24, opProfit:2197, cfo:1694, pat:1827, capex:350, fcff:1344, cfoPatPct:93,  roce:25, type:"H" },
  { yr:"FY21", rev:8720,  opm:20, opProfit:1744, cfo:1691, pat:1347, capex:350, fcff:1341, cfoPatPct:126, roce:17, type:"H" },
  { yr:"FY22", rev:10298, opm:21, opProfit:2163, cfo:1527, pat:1677, capex:440, fcff:1087, cfoPatPct:91,  roce:18, type:"H" },
  { yr:"FY23", rev:14442, opm:24, opProfit:3466, cfo:2823, pat:2914, capex:570, fcff:2253, cfoPatPct:97,  roce:27, type:"H" },
  { yr:"FY24", rev:16536, opm:26, opProfit:4299, cfo:3724, pat:4001, capex:700, fcff:3024, cfoPatPct:93,  roce:31, type:"H" },
  { yr:"FY25", rev:18870, opm:25, opProfit:4718, cfo:3980, pat:4734, capex:800, fcff:3180, cfoPatPct:84,  roce:30, type:"H" },
  // Projections from report (Section 7.1)
  { yr:"FY26E",rev:22800, opm:25, opProfit:5700, cfo:4800, pat:5600, capex:1200,fcff:3600, cfoPatPct:86,  roce:31, type:"P" },
  { yr:"FY27E",rev:26400, opm:26, opProfit:6864, cfo:5700, pat:6600, capex:1000,fcff:4700, cfoPatPct:86,  roce:32, type:"P" },
  { yr:"FY28E",rev:30400, opm:27, opProfit:8208, cfo:6800, pat:7800, capex:900, fcff:5900, cfoPatPct:87,  roce:33, type:"P" },
  { yr:"FY29E",rev:34800, opm:27, opProfit:9396, cfo:8100, pat:9200, capex:850, fcff:7250, cfoPatPct:88,  roce:33, type:"P" },
  { yr:"FY30E",rev:39500, opm:28, opProfit:11060,cfo:9500, pat:10800,capex:850, fcff:8650, cfoPatPct:88,  roce:34, type:"P" },
];

// ─── Segment revenue (approximate split from standalone + VECV data) ─────────
const segData = [
  { yr:"FY22", re_dom:7900,  re_intl:1050, vecv:1050, others:298 },
  { yr:"FY23", re_dom:10300, re_intl:1800, vecv:2100, others:242 },
  { yr:"FY24", re_dom:11700, re_intl:2200, vecv:2400, others:236 },
  { yr:"FY25", re_dom:13200, re_intl:2600, vecv:2800, others:270 },
  { yr:"FY26E",re_dom:16200, re_intl:3100, vecv:3200, others:300 },
  { yr:"FY27E",re_dom:18800, re_intl:3800, vecv:3500, others:300 },
  { yr:"FY28E",re_dom:21700, re_intl:4600, vecv:3800, others:300 },
  { yr:"FY29E",re_dom:24900, re_intl:5500, vecv:4100, others:300 },
  { yr:"FY30E",re_dom:28300, re_intl:6700, vecv:4200, others:300 },
];

// ─── Porter's 5 Forces ───────────────────────────────────────────────────────
const porterData = [
  { force:"New Entrants",   re:8, vecv:5 },
  { force:"Buyer Power",    re:7, vecv:5 },
  { force:"Supplier Power", re:6, vecv:6 },
  { force:"Substitutes",    re:6, vecv:5 },
  { force:"Rivalry",        re:7, vecv:4 },
];

// ─── Quality scorecard (Section 10i of report) ───────────────────────────────
const qualityData = [
  { param:"Longevity",       score:10, full:"125yr brand, 43yr listed, zero loss years ever" },
  { param:"Predictable CF",  score:9,  full:"Neg WC cycle, daily cash sales; 5Y CFO CAGR 19%" },
  { param:"ROCE",            score:9,  full:"30% avg 10Y; peak 53% (FY17); trough 17% (COVID)" },
  { param:"Rev Resilience",  score:8,  full:"Only 2 dips in 10 yrs (FY20, FY21); 5Y CAGR 16%" },
  { param:"EPS Stability",   score:8,  full:"5Y EPS CAGR 29% (₹49.3→₹172.7); 1 COVID dip" },
  { param:"CFO/PAT",         score:9,  full:"Avg 98% over 9 years; FY18 peak 127%" },
  { param:"Margins",         score:9,  full:"25% PAT margin; 25% OPM; extraordinary for auto" },
  { param:"Reinvestment",    score:8,  full:"59% PAT retained; ₹14,791 Cr investment warchest" },
];
const radarQuality = qualityData.map(d=>({...d,fullMark:10}));

// ─── Sensitivity (Section 7.2 of report, extended P/E grid) ─────────────────
// CMP: ₹8,190 (Feb 27, 2026)
const sensMatrix = [
  { eps:"Bear ₹340",  pe28:9520,  pe30:10200, pe33:11220, pe35:11900 },
  { eps:"Base ₹394",  pe28:11032, pe30:11820, pe33:13002, pe35:13790 },
  { eps:"Bull ₹430",  pe28:12040, pe30:12900, pe33:14190, pe35:15050 },
];
const CMP = 8190;

// ─── Shared UI components (identical tokens to InfoEdge) ────────────────────
const CustomTooltip = ({active,payload,label}) => {
  if(!active||!payload?.length) return null;
  return (
    <div style={{background:NAVY,border:`1px solid ${GOLD}`,borderRadius:6,padding:"8px 12px",color:"#fff",fontSize:12}}>
      <p style={{margin:0,fontWeight:700,color:GOLD}}>{label}</p>
      {payload.map((p,i)=>(
        <p key={i} style={{margin:"2px 0",color:p.color}}>
          {p.name}: {typeof p.value==="number"?p.value.toLocaleString():p.value}{p.unit||""}
        </p>
      ))}
    </div>
  );
};

function TabButton({label,active,onClick}) {
  return (
    <button onClick={onClick} style={{
      padding:"8px 16px",border:"none",
      borderBottom:active?`3px solid ${GOLD}`:"3px solid transparent",
      background:active?"rgba(212,160,23,0.1)":"transparent",
      color:active?GOLD:"#94a3b8",fontWeight:active?700:500,
      fontSize:13,cursor:"pointer",transition:"all 0.2s",fontFamily:"'DM Sans',sans-serif",
    }}>{label}</button>
  );
}

function MetricCard({label,value,sub,color=GOLD}) {
  return (
    <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:8,padding:"14px 18px",flex:1,minWidth:140}}>
      <div style={{fontSize:11,color:"#94a3b8",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{label}</div>
      <div style={{fontSize:22,fontWeight:800,color,fontFamily:"'DM Sans',sans-serif"}}>{value}</div>
      {sub&&<div style={{fontSize:11,color:"#64748b",marginTop:2}}>{sub}</div>}
    </div>
  );
}

function ScoreBar({label,score,maxScore=10}) {
  const pct=(score/maxScore)*100;
  const barColor=score>=9?GREEN:score>=7?ORANGE:RED;
  return (
    <div style={{marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
        <span style={{fontSize:12,color:"#e2e8f0",fontWeight:600}}>{label}</span>
        <span style={{fontSize:12,fontWeight:800,color:barColor}}>{score}/10</span>
      </div>
      <div style={{background:"rgba(255,255,255,0.06)",borderRadius:4,height:8,overflow:"hidden"}}>
        <div style={{width:`${pct}%`,height:"100%",background:`linear-gradient(90deg,${barColor},${barColor}cc)`,borderRadius:4,transition:"width 0.6s ease"}}/>
      </div>
    </div>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export default function EicherMotorsDashboard() {
  const [tab,setTab] = useState(0);

  return (
    <div style={{background:`linear-gradient(135deg,${NAVY} 0%,#0a1628 100%)`,minHeight:"100vh",color:"#e2e8f0",fontFamily:"'DM Sans',sans-serif"}}>

      <Link to="/" style={{position:"fixed",top:"20px",left:"28px",zIndex:10000,color:GOLD,textDecoration:"none",fontWeight:700,background:"rgba(13,27,42,0.95)",padding:"8px 18px",borderRadius:8,fontSize:13,boxShadow:"0 4px 12px rgba(0,0,0,0.3)"}}>
        ← Back to Alpha Edge Home
      </Link>

      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet"/>

      {/* ── Header ── */}
      <div style={{padding:"90px 28px 0",borderBottom:`1px solid rgba(212,160,23,0.2)`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
          <div>
            <div style={{fontSize:11,color:GOLD,letterSpacing:2,textTransform:"uppercase",fontWeight:700}}>Alpha Edge Research — Initiating Coverage</div>
            <h1 style={{margin:"6px 0 2px",fontSize:30,fontWeight:800,fontFamily:"'Playfair Display',serif",color:"#fff"}}>
              Eicher Motors Ltd
            </h1>
            <div style={{fontSize:13,color:"#94a3b8"}}>NSE: EICHERMOT · BSE: 505200 · Nifty 50 · Royal Enfield | VECV</div>
          </div>
          <div style={{display:"flex",gap:8,padding:"6px 14px",background:"rgba(39,174,96,0.12)",border:`1px solid ${GREEN}44`,borderRadius:8,alignItems:"center"}}>
            <span style={{fontSize:11,color:"#94a3b8",fontWeight:600}}>RATING</span>
            <span style={{fontSize:22,fontWeight:800,color:GREEN}}>BUY</span>
          </div>
        </div>

        {/* Metric cards */}
        <div style={{display:"flex",gap:10,marginTop:16,flexWrap:"wrap"}}>
          <MetricCard label="CMP"           value="₹8,190"          sub="Feb 27, 2026"          />
          <MetricCard label="Market Cap"    value="₹2,24,000 Cr"    sub="$27.3B · Nifty 50"     />
          <MetricCard label="FY30 Target"   value="₹12,500–15,000"  sub="14–16% CAGR"  color={GREEN}  />
          <MetricCard label="P/E (TTM)"     value="~41x"            sub="FY26E ~29x; FY30E ~21x" color={TEAL}   />
          <MetricCard label="OPM"           value="25%"             sub="FY25; 10Y avg ~26%"     color={BLUE}   />
          <MetricCard label="Quality"       value="8.9/10"          sub="Exceptional Compounder" color={ORANGE} />
        </div>

        <div style={{display:"flex",gap:0,marginTop:16,overflowX:"auto"}}>
          {tabs.map((t,i)=><TabButton key={i} label={t} active={tab===i} onClick={()=>setTab(i)}/>)}
        </div>
      </div>

      {/* ── Tab content ── */}
      <div style={{padding:"20px 28px 40px"}}>

        {/* ═══ TAB 0: OVERVIEW ═══ */}
        {tab===0&&(
          <div>
            <h2 style={{fontSize:18,color:GOLD,marginBottom:12,fontFamily:"'Playfair Display',serif"}}>Investment Thesis</h2>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              {[
                {t:"Royal Enfield = Cultural Monopoly",       d:"88.9% share of India's 250cc+ segment — a market it essentially created. 125-year brand selling aspiration, not just motorcycles. 10.5L units FY25 with no credible price-point challenger."},
                {t:"Exceptional Financial Quality",           d:"25% PAT margin, 30% ROCE, 24% ROE, ~0 debt, ₹14,791 Cr investment warchest. CFO/PAT avg 98% over 9 years. Negative working capital cycle. Best-in-class auto economics globally."},
                {t:"Clear Multi-Year Growth Runway",          d:"Capacity expanding 37% to 20L units (₹958 Cr at Cheyyar). Flying Flea EV platform launched. CKD in Thailand (operational) + Brazil (announced). 1,000+ international retail points in 70+ countries."},
                {t:"Valuation: FY30E P/E Only 21x at CMP",   d:"At ₹8,190, stock trades at ~41x TTM but FY30E P/E is ~21x. EPS CAGR of 14–16% from here. For a business with 30% ROCE, dominant franchise, and EV optionality, this is a reasonable entry for a 4-year hold."},
              ].map((item,i)=>(
                <div key={i} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:8,padding:16}}>
                  <div style={{fontSize:13,fontWeight:700,color:GOLD,marginBottom:4}}>{item.t}</div>
                  <div style={{fontSize:12,color:"#94a3b8",lineHeight:1.55}}>{item.d}</div>
                </div>
              ))}
            </div>

            <h2 style={{fontSize:18,color:GOLD,margin:"24px 0 12px",fontFamily:"'Playfair Display',serif"}}>Revenue & Operating Profit (₹ Cr)</h2>
            <p style={{fontSize:12,color:"#94a3b8",margin:"-8px 0 12px"}}>Shaded bars = FY26E–FY30E projections. Revenue CAGR FY21→FY25: 21%.</p>
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={finData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/>
                <XAxis dataKey="yr" tick={{fill:"#94a3b8",fontSize:11}}/>
                <YAxis tick={{fill:"#94a3b8",fontSize:11}}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Legend wrapperStyle={{fontSize:11}}/>
                <Bar dataKey="rev" name="Revenue (₹Cr)" fill={BLUE} opacity={0.7} radius={[3,3,0,0]}>
                  {finData.map((d,i)=><Cell key={i} fill={d.type==="P"?`${BLUE}88`:BLUE}/>)}
                </Bar>
                <Line dataKey="opProfit" name="Op. Profit (₹Cr)" stroke={GOLD} strokeWidth={2.5} dot={{r:3}}/>
              </ComposedChart>
            </ResponsiveContainer>

            {/* Quarterly data strip */}
            <h2 style={{fontSize:18,color:GOLD,margin:"24px 0 8px",fontFamily:"'Playfair Display',serif"}}>Recent Quarterly Performance</h2>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead>
                  <tr style={{borderBottom:`2px solid ${GOLD}33`}}>
                    {["Quarter","Revenue (₹Cr)","EBITDA (₹Cr)","EBITDA %","PAT (₹Cr)","EPS (₹)","RE Volumes"].map(h=>(
                      <th key={h} style={{padding:"8px 10px",textAlign:h==="Quarter"?"left":"right",color:GOLD,fontWeight:700}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Q2 FY25","4,263","1,088","25.5%","1,100","40.2","2,61,326"],
                    ["Q3 FY25","4,973","1,201","24.2%","1,170","42.7","2,69,039"],
                    ["Q4 FY25","5,241","1,258","24.0%","1,362","49.7","2,38,421"],
                    ["Q1 FY26","5,042","1,203","23.9%","1,205","44.0","2,81,992"],
                    ["Q2 FY26","6,172","1,512","24.5%","1,369","49.9","3,08,233"],
                    ["Q3 FY26","6,114","1,557","25.5%","1,421","51.8","3,25,773"],
                  ].map((row,i)=>(
                    <tr key={i} style={{borderBottom:"1px solid rgba(255,255,255,0.04)",background:i===5?"rgba(212,160,23,0.05)":"transparent"}}>
                      {row.map((cell,j)=>(
                        <td key={j} style={{padding:"7px 10px",textAlign:j===0?"left":"right",fontWeight:i===5||j===0?700:400,color:i===5?GOLD:"#e2e8f0"}}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══ TAB 1: PORTER'S 5 FORCES ═══ */}
        {tab===1&&(
          <div>
            <h2 style={{fontSize:18,color:GOLD,marginBottom:6,fontFamily:"'Playfair Display',serif"}}>Porter's Five Forces — Competitive Moat Analysis</h2>
            <p style={{fontSize:12,color:"#94a3b8",marginBottom:16}}>Score 1–10 where 10 = strongest position. Royal Enfield commands a cultural moat — brand loyalty that is psychological, not just financial, and thus far harder to erode.</p>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
              <div>
                <ResponsiveContainer width="100%" height={340}>
                  <RadarChart data={porterData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)"/>
                    <PolarAngleAxis dataKey="force" tick={{fill:"#94a3b8",fontSize:10}}/>
                    <PolarRadiusAxis angle={90} domain={[0,10]} tick={{fill:"#64748b",fontSize:9}}/>
                    <Radar name="Royal Enfield" dataKey="re"   stroke={GREEN}  fill={GREEN}  fillOpacity={0.22} strokeWidth={2}/>
                    <Radar name="VECV"          dataKey="vecv" stroke={ORANGE} fill={ORANGE} fillOpacity={0.1}  strokeWidth={2}/>
                    <Legend wrapperStyle={{fontSize:11}}/>
                    <Tooltip content={<CustomTooltip/>}/>
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div>
                {[
                  {force:"Threat of New Entrants",  re:"LOW — 125yr brand, 4,000+ dealer network, community moat, 88.9% share",     vecv:"MOD — Volvo JV provides tech/brand edge in LMD", color:GREEN  },
                  {force:"Buyer Power",              re:"LOW-MOD — Aspirational purchase; deeply loyal community; no price alternative", vecv:"MOD — Fleet buyers have negotiating power",     color:TEAL   },
                  {force:"Supplier Power",           re:"MODERATE — RE in-houses key parts; manages via scale",                         vecv:"MOD — Similar auto components dynamics",         color:ORANGE },
                  {force:"Threat of Substitutes",    re:"LOW-MOD — Harley/Triumph 2× price; Bajaj/Honda 650 = partial sub",            vecv:"MOD — Tata, Ashok Leyland, SML competition",    color:ORANGE },
                  {force:"Competitive Rivalry",      re:"LOW — ~90% mid-weight share. Honda/Bajaj entering but brand gap wide",         vecv:"HIGH — Competitive CV market; RE #1 LMD trucks", color:GREEN  },
                ].map((f,i)=>(
                  <div key={i} style={{marginBottom:12,padding:"10px 12px",background:"rgba(255,255,255,0.02)",borderRadius:6,borderLeft:`3px solid ${f.color}`}}>
                    <div style={{fontSize:12,fontWeight:700,color:"#e2e8f0",marginBottom:4}}>{f.force}</div>
                    <div style={{fontSize:11,color:GREEN}}>Royal Enfield: {f.re}</div>
                    <div style={{fontSize:11,color:ORANGE}}>VECV: {f.vecv}</div>
                  </div>
                ))}
                <div style={{padding:"12px 14px",background:`rgba(39,174,96,0.08)`,border:`1px solid ${GREEN}33`,borderRadius:8,marginTop:8}}>
                  <div style={{fontSize:13,fontWeight:700,color:GREEN}}>Conclusion: Royal Enfield has a WIDE Cultural Moat</div>
                  <div style={{fontSize:11,color:"#94a3b8",marginTop:4}}>4 of 5 forces favorable for RE. Brand loyalty is psychological — users identify with Royal Enfield as part of their identity. This is the strongest type of moat and extremely difficult for Honda, Bajaj, or even Harley-Davidson to erode.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ TAB 2: REVENUE MODEL ═══ */}
        {tab===2&&(
          <div>
            <h2 style={{fontSize:18,color:GOLD,marginBottom:6,fontFamily:"'Playfair Display',serif"}}>Bottom-Up Segment Revenue Model (₹ Cr)</h2>
            <p style={{fontSize:12,color:"#94a3b8",marginBottom:16}}>RE Domestic = Volume × ASP; RE International = CKD + export; VECV = Eicher's consolidated share of 50:50 JV. Revenue CAGR FY25→FY30E: ~16%.</p>

            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={segData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/>
                <XAxis dataKey="yr" tick={{fill:"#94a3b8",fontSize:11}}/>
                <YAxis tick={{fill:"#94a3b8",fontSize:11}}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Legend wrapperStyle={{fontSize:11}}/>
                <Bar dataKey="re_dom"  name="RE Domestic"     stackId="a" fill={BLUE}   />
                <Bar dataKey="re_intl" name="RE International" stackId="a" fill={TEAL}   />
                <Bar dataKey="vecv"    name="VECV"             stackId="a" fill={ORANGE} />
                <Bar dataKey="others"  name="Others/Parts"     stackId="a" fill={GOLD}   radius={[3,3,0,0]}/>
              </BarChart>
            </ResponsiveContainer>

            <h3 style={{fontSize:15,color:TEAL,margin:"20px 0 10px"}}>Royal Enfield Volume & ASP Driver Model</h3>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead>
                  <tr style={{borderBottom:`2px solid ${GOLD}33`}}>
                    {["Driver","FY25","FY26E","FY27E","FY28E","FY30E"].map(h=>(
                      <th key={h} style={{padding:"8px 10px",textAlign:h==="Driver"?"left":"right",color:GOLD,fontWeight:700}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["RE Domestic Volumes (lakh)","8.7",  "9.8",   "11.0",  "12.5",  "16.0" ],
                    ["RE Intl Volumes (lakh)",    "1.8",  "2.2",   "2.5",   "3.0",   "3.5"  ],
                    ["RE Total Volumes (lakh)",   "10.5", "12.0",  "13.5",  "15.5",  "19.5" ],
                    ["RE Avg Selling Price (₹K)", "151",  "160",   "167",   "173",   "185"  ],
                    ["RE Standalone Rev (₹Cr)",   "18,146","22,000","25,400","29,200","38,000"],
                    ["TOTAL CONSOL REV (₹Cr)",    "18,870","22,800","26,400","30,400","39,500"],
                  ].map((row,i)=>(
                    <tr key={i} style={{borderBottom:"1px solid rgba(255,255,255,0.04)",background:i===5?"rgba(46,117,182,0.08)":"transparent"}}>
                      {row.map((cell,j)=>(
                        <td key={j} style={{padding:"7px 10px",textAlign:j===0?"left":"right",fontWeight:i===5||j===0?700:400,color:i===5?BLUE:"#e2e8f0"}}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 style={{fontSize:15,color:TEAL,margin:"20px 0 10px"}}>Margin Trajectory by Segment</h3>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead>
                  <tr style={{borderBottom:`2px solid ${GOLD}33`}}>
                    {["Segment","FY24","FY25","FY26E","FY27E","FY28E","FY30E"].map(h=>(
                      <th key={h} style={{padding:"8px 10px",textAlign:h==="Segment"?"left":"right",color:GOLD,fontWeight:700}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["RE Standalone OPM","27%","26%","26%","27%","28%","29%"],
                    ["VECV OPM",         "8%", "8%", "8%", "9%", "9%","10%"],
                    ["Blended EBITDA %", "26%","25%","25%","26%","27%","28%"],
                    ["PAT Margin",       "24%","25%","25%","25%","26%","27%"],
                  ].map((row,i)=>(
                    <tr key={i} style={{borderBottom:"1px solid rgba(255,255,255,0.04)",background:i>=2?"rgba(46,117,182,0.06)":"transparent"}}>
                      {row.map((cell,j)=>(
                        <td key={j} style={{padding:"7px 10px",textAlign:j===0?"left":"right",fontWeight:i>=2||j===0?700:400,color:i>=2?BLUE:"#e2e8f0"}}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══ TAB 3: FCFF & CFO/PAT ═══ */}
        {tab===3&&(
          <div>
            <h2 style={{fontSize:18,color:GOLD,marginBottom:6,fontFamily:"'Playfair Display',serif"}}>Free Cash Flow to Firm (FCFF) — 10yr + 5yr Forecast</h2>
            <p style={{fontSize:12,color:"#94a3b8",marginBottom:16}}>FCFF = CFO − Capex. FY26E capex spike (₹1,200 Cr) reflects Cheyyar plant expansion. Structurally low capex business: capex/revenue typically 4–6%.</p>

            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={finData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/>
                <XAxis dataKey="yr" tick={{fill:"#94a3b8",fontSize:11}}/>
                <YAxis tick={{fill:"#94a3b8",fontSize:11}}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Legend wrapperStyle={{fontSize:11}}/>
                <Bar dataKey="cfo"   name="CFO (₹Cr)"   fill={BLUE} opacity={0.6} radius={[3,3,0,0]}>
                  {finData.map((d,i)=><Cell key={i} fill={d.type==="P"?`${BLUE}66`:BLUE}/>)}
                </Bar>
                <Bar dataKey="capex" name="Capex (₹Cr)"  fill={RED}  opacity={0.5}>
                  {finData.map((d,i)=><Cell key={i} fill={d.type==="P"?`${RED}66`:RED}/>)}
                </Bar>
                <Line dataKey="fcff" name="FCFF (₹Cr)" stroke={GREEN} strokeWidth={2.5} dot={{r:4,fill:GREEN}}/>
              </ComposedChart>
            </ResponsiveContainer>

            <h2 style={{fontSize:18,color:GOLD,margin:"28px 0 6px",fontFamily:"'Playfair Display',serif"}}>CFO / PAT Ratio — 10-Year Average: 98%</h2>
            <p style={{fontSize:12,color:"#94a3b8",marginBottom:16}}>Virtually every rupee of accounting profit converts to operating cash — the single clearest sign of a truly high-quality business. Healthy range: 80–120%.</p>

            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={finData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/>
                <XAxis dataKey="yr" tick={{fill:"#94a3b8",fontSize:11}}/>
                <YAxis domain={[60,140]} tick={{fill:"#94a3b8",fontSize:11}} unit="%"/>
                <Tooltip content={<CustomTooltip/>}/>
                <ReferenceLine y={100} stroke={GOLD} strokeDasharray="5 5" label={{value:"100%",fill:GOLD,fontSize:10}}/>
                <ReferenceLine y={80} stroke={"#555"} strokeDasharray="3 3" label={{value:"80%",fill:"#555",fontSize:9}}/>
                <Bar dataKey="cfoPatPct" name="CFO/PAT %" fill={TEAL} radius={[3,3,0,0]}>
                  {finData.map((d,i)=><Cell key={i} fill={d.type==="P"?`${TEAL}88`:TEAL}/>)}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
            <div style={{fontSize:11,color:"#64748b",fontStyle:"italic",marginTop:8}}>
              Source: Company filings. FY17–FY25 CFO/PAT actuals: 102%, 127%, 72%, 93%, 126%, 91%, 97%, 93%, 84%. 9-year average: ~98%.
            </div>
          </div>
        )}

        {/* ═══ TAB 4: OPM & ROCE ═══ */}
        {tab===4&&(
          <div>
            <h2 style={{fontSize:18,color:GOLD,marginBottom:6,fontFamily:"'Playfair Display',serif"}}>EBITDA Margin — 10yr Historical + 5yr Forecast</h2>
            <p style={{fontSize:12,color:"#94a3b8",marginBottom:16}}>EBITDA margin has averaged ~25–27% over 10 years — extraordinary for Indian auto. COVID dip (FY20–21: 20–24%) recovered to 25%+ by FY23 and stable since. Q3 FY26 margin: 25.5% (+130bps YoY).</p>

            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={finData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/>
                <XAxis dataKey="yr" tick={{fill:"#94a3b8",fontSize:11}}/>
                <YAxis domain={[10,40]} tick={{fill:"#94a3b8",fontSize:11}} unit="%"/>
                <Tooltip content={<CustomTooltip/>}/>
                <Legend wrapperStyle={{fontSize:11}}/>
                <ReferenceLine y={20} stroke={"#334"} strokeDasharray="3 3"/>
                <Area dataKey="opm" name="OPM/EBITDA %" fill={BLUE} fillOpacity={0.15} stroke={BLUE} strokeWidth={2.5} dot={(props)=>{
                  const {cx,cy,payload} = props;
                  return <circle key={cx} cx={cx} cy={cy} r={3} fill={payload.type==="P"?ORANGE:BLUE} stroke="#fff" strokeWidth={1}/>;
                }}/>
              </ComposedChart>
            </ResponsiveContainer>

            <h2 style={{fontSize:18,color:GOLD,margin:"28px 0 6px",fontFamily:"'Playfair Display',serif"}}>ROCE — 10yr Historical + 5yr Forecast (%)</h2>
            <p style={{fontSize:12,color:"#94a3b8",marginBottom:16}}>Unlike Info Edge, Eicher's ROCE is clean — no investment portfolio distortion in the denominator. 10-year average ROCE: ~30%. COVID trough (17%) was still above WACC (~12%). This is the true return on operating capital.</p>

            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={finData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/>
                <XAxis dataKey="yr" tick={{fill:"#94a3b8",fontSize:11}}/>
                <YAxis domain={[0,60]} tick={{fill:"#94a3b8",fontSize:11}} unit="%"/>
                <Tooltip content={<CustomTooltip/>}/>
                <Legend wrapperStyle={{fontSize:11}}/>
                <ReferenceLine y={12} stroke={RED} strokeDasharray="4 4" label={{value:"WACC ~12%",fill:RED,fontSize:10}}/>
                <Bar dataKey="roce" name="ROCE %" radius={[3,3,0,0]}>
                  {finData.map((d,i)=><Cell key={i} fill={d.type==="P"?`${ORANGE}77`:d.roce>=30?GREEN:d.roce>=20?ORANGE:BLUE} opacity={d.type==="P"?.65:1}/>)}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
            <div style={{marginTop:10,padding:"10px 14px",background:"rgba(212,160,23,0.06)",borderRadius:6,border:`1px solid ${GOLD}22`}}>
              <span style={{fontSize:12,color:GOLD,fontWeight:700}}>Model Note: </span>
              <span style={{fontSize:12,color:"#94a3b8"}}>Eicher holds ₹14,791 Cr in investments but these are equity-accounted in a clean balance sheet (not distorting operating ROCE). Core business ROCE of ~30% genuinely reflects the quality of the franchise. Sustained ROCE >28% through FY30 is our baseline assumption.</span>
            </div>
          </div>
        )}

        {/* ═══ TAB 5: QUALITY SCORE ═══ */}
        {tab===5&&(
          <div>
            <h2 style={{fontSize:18,color:GOLD,marginBottom:6,fontFamily:"'Playfair Display',serif"}}>Quality Scorecard — 8 Parameter Analysis</h2>
            <p style={{fontSize:12,color:"#94a3b8",marginBottom:16}}>Based on Section 10 of the Alpha Edge Research Report (Feb 27, 2026). Eicher scores above 8 in every single dimension — a rare distinction among 5,000+ listed Indian companies.</p>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
              <div>
                <ResponsiveContainer width="100%" height={320}>
                  <RadarChart data={radarQuality}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)"/>
                    <PolarAngleAxis dataKey="param" tick={{fill:"#94a3b8",fontSize:10}}/>
                    <PolarRadiusAxis angle={90} domain={[0,10]} tick={{fill:"#64748b",fontSize:9}}/>
                    <Radar name="Score" dataKey="score" stroke={GOLD} fill={GOLD} fillOpacity={0.2} strokeWidth={2} dot={{r:3,fill:GOLD}}/>
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div>
                {qualityData.map((d,i)=>(
                  <div key={i} style={{marginBottom:6}}>
                    <ScoreBar label={d.param} score={d.score}/>
                    <div style={{fontSize:10,color:"#64748b",marginTop:-4,marginBottom:6,paddingLeft:2}}>{d.full}</div>
                  </div>
                ))}
                <div style={{marginTop:14,padding:"12px 14px",background:"rgba(212,160,23,0.08)",borderRadius:8,border:`1px solid ${GOLD}33`}}>
                  <div style={{fontSize:14,fontWeight:800,color:GREEN}}>Overall: 8.9/10 — EXCEPTIONAL QUALITY COMPOUNDER</div>
                  <div style={{fontSize:11,color:"#94a3b8",marginTop:6}}>Eicher scores above 8 in every single quality dimension. The combination of a 125-year cultural brand monopoly, 30% clean ROCE, 98% CFO/PAT conversion, near-zero debt, and a proven management team (Siddhartha Lal's 20+ year transformation from 50K to 10L+ units/year) makes this one of the highest-quality compounders on Indian markets.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ TAB 6: SENSITIVITY ═══ */}
        {tab===6&&(
          <div>
            <h2 style={{fontSize:18,color:GOLD,marginBottom:6,fontFamily:"'Playfair Display',serif"}}>FY30 Sensitivity Analysis — EPS × P/E Matrix</h2>
            <p style={{fontSize:12,color:"#94a3b8",marginBottom:16}}>P/E-based target price. CMP: ₹8,190. Bear/Base/Bull EPS and P/E scenarios from report Section 7.2.</p>

            <div style={{overflowX:"auto",marginBottom:24}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead>
                  <tr>
                    <th style={{padding:"10px 14px",textAlign:"left",color:GOLD,fontWeight:700,borderBottom:`2px solid ${GOLD}44`}}>EPS ↓ / P/E →</th>
                    {["28x (De-rate)","30x (Base Low)","33x (Base High)","35x (Re-rate)"].map(h=>(
                      <th key={h} style={{padding:"10px 14px",textAlign:"center",color:GOLD,fontWeight:700,borderBottom:`2px solid ${GOLD}44`}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sensMatrix.map((row,i)=>{
                    const bg=i===0?"rgba(192,57,43,0.06)":i===1?"rgba(46,117,182,0.06)":"rgba(39,174,96,0.06)";
                    return (
                      <tr key={i} style={{background:bg}}>
                        <td style={{padding:"10px 14px",fontWeight:700,color:i===0?RED:i===1?BLUE:GREEN}}>{row.eps}</td>
                        {[row.pe28,row.pe30,row.pe33,row.pe35].map((val,j)=>{
                          const up=((val-CMP)/CMP*100).toFixed(0);
                          const pos=val>CMP;
                          return (
                            <td key={j} style={{padding:"10px 14px",textAlign:"center",fontWeight:(i===1&&j>=1)||(i===2&&j>=1)?700:400}}>
                              <div style={{fontSize:15,color:pos?GREEN:RED}}>₹{val.toLocaleString()}</div>
                              <div style={{fontSize:10,color:pos?"#66bb6a":"#ef5350"}}>{pos?"+":""}{up}%</div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <h3 style={{fontSize:15,color:TEAL,marginBottom:10}}>Scenario Definitions (from Report Section 7.2)</h3>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
              {[
                {label:"BEAR (De-rate)",  color:RED,   rev:"₹31,000 Cr",opm:"22%",eps:"₹340",pe:"28–30x",target:"₹9,520–10,200 (+16–25%)", desc:"Volume growth stalls. EV transition disrupts ICE margins. Commodity shock. Market de-rates auto at 28x."},
                {label:"BASE CASE",       color:BLUE,  rev:"₹39,500 Cr",opm:"28%",eps:"₹394",pe:"33x",   target:"₹13,000 (+59%)",          desc:"16% Rev CAGR. RE volume to 19.5L by FY30. OPM sustains at 27–28%. Market prices in franchise quality at 33x."},
                {label:"BULL (Re-rate)",  color:GREEN, rev:"₹48,000 Cr",opm:"30%",eps:"₹430",pe:"35x",   target:"₹15,050 (+84%)",          desc:"20%+ CAGR. Flying Flea EV wins market. International doubles. Re-rates to 35x as brand + EV optionality recognised."},
              ].map((s,i)=>(
                <div key={i} style={{padding:14,background:"rgba(255,255,255,0.02)",borderRadius:8,borderTop:`3px solid ${s.color}`}}>
                  <div style={{fontSize:13,fontWeight:800,color:s.color,marginBottom:8}}>{s.label}</div>
                  <div style={{fontSize:11,color:"#94a3b8",lineHeight:1.6}}>
                    <div>FY30 Rev: <span style={{color:"#e2e8f0",fontWeight:600}}>{s.rev}</span></div>
                    <div>OPM: <span style={{color:"#e2e8f0",fontWeight:600}}>{s.opm}</span></div>
                    <div>EPS: <span style={{color:"#e2e8f0",fontWeight:600}}>{s.eps}</span></div>
                    <div>P/E: <span style={{color:"#e2e8f0",fontWeight:600}}>{s.pe}</span></div>
                    <div>Target: <span style={{color:s.color,fontWeight:700}}>{s.target}</span></div>
                  </div>
                  <div style={{fontSize:10,color:"#64748b",marginTop:8,lineHeight:1.4}}>{s.desc}</div>
                </div>
              ))}
            </div>

            <div style={{marginTop:20,padding:"14px 18px",background:"rgba(39,174,96,0.06)",border:`1px solid ${GREEN}33`,borderRadius:8}}>
              <div style={{fontSize:14,fontWeight:800,color:GREEN}}>Base Case FY30 Target: ₹12,500–15,000 · Expected CAGR: 14–16% from ₹8,190</div>
              <div style={{fontSize:12,color:"#94a3b8",marginTop:6}}>Assumes 16% revenue CAGR, EBITDA margin sustains at 27–28%, EPS CAGR of 14–16%, P/E holds 33–35x on improved visibility. ₹14,791 Cr investment warchest + near-zero debt provides permanent capital loss protection. Accumulate at ₹7,500–8,500; aggressive buy on dips to ₹7,000–7,500.</div>
            </div>
            <div style={{fontSize:11,color:"#3a4a5a",marginTop:10}}>
              Source: Alpha Edge Research Report, Feb 27 2026. Analyst consensus (30 analysts): avg 1Y target ₹7,663. ICICI Securities BUY ₹9,100. For informational purposes only — not SEBI-registered advice.
            </div>
          </div>
        )}

      </div>
    </div>
  );
}