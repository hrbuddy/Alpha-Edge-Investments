/**
 * PortfolioSimulator.js  -  /portfolio
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { doc, getDoc, collection, getDocs, setDoc, deleteDoc } from "firebase/firestore";
import { db }       from "./firebase";
import { useAuth }  from "./AuthContext";
import { useAccess } from "./AccessContext";
import PaywallOverlay from "./PaywallOverlay";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell, Legend } from "recharts";

const NAVY="#0D1B2A",GOLD="#D4A017",GREEN="#27AE60",RED="#C0392B",TEAL="#00BFA5",BLUE="#2E75B6",PURPLE="#8E44AD",ORANGE="#E67E22",MUTED="#3d5570",SUB="#5a7a94";
const BENCHMARKS=[{id:"nifty50",label:"Nifty 50",symbol:"^NSEI",color:"#4FC3F7"},{id:"nifty500",label:"Nifty 500",symbol:"^CNX500",color:TEAL},{id:"sensex",label:"Sensex",symbol:"^BSESN",color:GREEN},{id:"banknifty",label:"Bank Nifty",symbol:"^NSEBANK",color:BLUE},{id:"midcap",label:"Nifty Midcap",symbol:"^CNXMIDCAP",color:ORANGE},{id:"smallcap",label:"Nifty Smallcap",symbol:"^CNXSMALLCAP",color:PURPLE},{id:"niftyit",label:"Nifty IT",symbol:"^CNXIT",color:"#00E5FF"}];
const DATE_RANGES=[{label:"1Y",days:365},{label:"3Y",days:1095},{label:"5Y",days:1825},{label:"Max",days:null}];
const STOCK_COLORS=[GOLD,TEAL,BLUE,ORANGE,GREEN,PURPLE,RED,"#00E5FF","#FF6D00","#8BC34A"];
const RISK_FREE=0.065;

function pct(v,dec=1){if(v==null||isNaN(v))return"—";return`${v>=0?"+":""}${(v*100).toFixed(dec)}%`;}
function fmt2(v){if(v==null||isNaN(v))return"—";return v.toFixed(2);}

function alignSeries(seriesMap,useUnion=false){
  const tickers=Object.keys(seriesMap);
  if(!tickers.length)return{dates:[],aligned:{}};
  const maps={};
  tickers.forEach(t=>{maps[t]={};seriesMap[t].forEach(p=>{const d=new Date(p.ts).toISOString().slice(0,10);maps[t][d]=p.close;});});
  let dates;
  if(useUnion){
    // Union: use all dates where ANY ticker has data
    const allDates=new Set(tickers.flatMap(t=>Object.keys(maps[t])));
    dates=[...allDates].sort();
  } else {
    // Intersection: only dates where ALL tickers have data (used for benchmark)
    const sets=tickers.map(t=>new Set(Object.keys(maps[t])));
    let common=[...sets[0]];
    for(let i=1;i<sets.length;i++)common=common.filter(d=>sets[i].has(d));
    dates=common.sort();
  }
  const aligned={};
  tickers.forEach(t=>{aligned[t]=dates.map(d=>maps[t][d]??null);});
  return{dates,aligned};
}

function computeMetrics(portRets,dates){
  if(!portRets.length)return{};
  const n=portRets.length;
  // Use actual date range for years — not n/252 which inflates CAGR when nulls are skipped
  const years=Math.max((new Date(dates[dates.length-1])-new Date(dates[0]))/(365.25*24*3600*1000),n/252);
  const cumul=portRets.reduce((acc,r)=>{acc.push((acc[acc.length-1]??1)*(1+r));return acc;},[1]);
  const finalV=cumul[cumul.length-1];
  const cagr=Math.pow(finalV,1/years)-1;
  const mean=portRets.reduce((a,b)=>a+b,0)/n;
  const variance=portRets.reduce((a,b)=>a+(b-mean)**2,0)/(n-1);
  const vol=Math.sqrt(variance*252);
  const sharpe=(cagr-RISK_FREE)/vol;
  let peak=1,maxDD=0;
  cumul.forEach(v=>{if(v>peak)peak=v;const dd=(peak-v)/peak;if(dd>maxDD)maxDD=dd;});
  const annualMap={};
  dates.forEach((d,i)=>{if(i===0)return;const yr=d.slice(0,4);if(!annualMap[yr])annualMap[yr]={start:cumul[i-1],end:cumul[i]};else annualMap[yr].end=cumul[i];});
  const annualReturns=Object.entries(annualMap).map(([yr,{start,end}])=>({year:yr,ret:(end-start)/start}));
  // cumul has same length as dates (seed + n-1 returns = n elements = dates.length)
  return{cagr,vol,sharpe,maxDD:-maxDD,annualReturns,cumul:cumul.map((v,i)=>({date:dates[i],value:+((v-1)*100).toFixed(2)}))};
}

async function fetchStockPrices(ticker){
  try{const snap=await getDoc(doc(db,"stock_prices",ticker));if(snap.exists()){const pts=snap.data().points??[];return pts.filter(p=>p.ts&&p.close);}}catch(e){console.warn("price:",ticker,e);}
  return null;
}
const BM_CACHE={};
async function fetchBenchmark(bm){
  if(BM_CACHE[bm.id])return BM_CACHE[bm.id];
  try{const snap=await getDoc(doc(db,"macro_data",bm.id));if(snap.exists()){const pts=snap.data().points??[];if(pts.length>10){BM_CACHE[bm.id]=pts;return pts;}}}catch(e){}
  try{const url=`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(bm.symbol)}?interval=1d&range=10y`;const r=await fetch(url);const j=await r.json();const ts=j?.chart?.result?.[0]?.timestamp??[];const closes=j?.chart?.result?.[0]?.indicators?.quote?.[0]?.close??[];const pts=ts.map((t,i)=>({ts:t*1000,close:closes[i]})).filter(p=>p.close!=null);if(pts.length>10){BM_CACHE[bm.id]=pts;return pts;}}catch(e){console.warn("YF:",bm.symbol,e);}
  return null;
}

// StatCol: shows PORT row + BM row
function StatCol({label,portVal,bmVal,portColor,bmColor}){
  return(
    <div style={{flex:1,minWidth:0,padding:"10px 10px",background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,overflow:"hidden"}}>
      <div style={{fontSize:9,color:SUB,textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>{label}</div>
      <div style={{display:"flex",alignItems:"baseline",gap:5,marginBottom:4}}>
        <span style={{fontSize:9,color:MUTED,minWidth:26}}>PORT</span>
        <span className="pm-val" style={{fontSize:16,fontWeight:800,color:portColor||"#e2e8f0",lineHeight:1,whiteSpace:"nowrap"}}>{portVal}</span>
      </div>
      {bmVal!==undefined&&(
        <div style={{display:"flex",alignItems:"baseline",gap:5}}>
          <span style={{fontSize:9,color:MUTED,minWidth:26}}>BM</span>
          <span className="pm-bm" style={{fontSize:12,fontWeight:700,color:bmColor||SUB,lineHeight:1,whiteSpace:"nowrap"}}>{bmVal}</span>
        </div>
      )}
    </div>
  );
}

function WeightRow({stock,weight,mode,onChange,onRemove,color}){
  return(
    <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)",borderLeft:`3px solid ${color}`,borderRadius:8,minWidth:0}}>
      <span style={{fontSize:12,fontWeight:800,color:"#e2e8f0",flexShrink:0,maxWidth:"28%",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{stock}</span>
      <input type="range" min={1} max={100} step={1} value={Math.round(weight*100)} disabled={mode==="equal"} onChange={e=>onChange(Number(e.target.value)/100)} style={{flex:1,minWidth:0,accentColor:color,opacity:mode==="equal"?0.4:1,cursor:mode==="equal"?"not-allowed":"pointer"}}/>
      <div style={{display:"flex",alignItems:"stretch",border:`1px solid ${color}44`,borderRadius:6,overflow:"hidden",flexShrink:0}}>
        <input type="number" min={1} max={100} step={1} value={Math.round(weight*100)} disabled={mode==="equal"} onChange={e=>onChange(Math.max(0.01,Math.min(1,Number(e.target.value)/100)))} style={{width:36,textAlign:"center",background:"rgba(255,255,255,0.06)",border:"none",color:"#e2e8f0",fontSize:12,fontWeight:700,padding:"4px 2px",opacity:mode==="equal"?0.5:1,outline:"none"}}/>
        <span style={{fontSize:11,color:MUTED,display:"flex",alignItems:"center",padding:"0 6px 0 2px",background:"rgba(255,255,255,0.03)"}}>%</span>
      </div>
      <button onClick={onRemove}
        style={{flexShrink:0,background:"transparent",border:"none",cursor:"pointer",color:RED,fontSize:14,fontWeight:700,lineHeight:1,padding:"2px 3px",opacity:0.7}}
        onMouseEnter={e=>{e.currentTarget.style.opacity="1";}}
        onMouseLeave={e=>{e.currentTarget.style.opacity="0.7";}}>×</button>
    </div>
  );
}

function SavedSheet({portfolios,onLoad,onDelete,onClose}){
  const [visible,setVisible]=useState(false);
  useEffect(()=>{requestAnimationFrame(()=>setVisible(true));},[]);
  function close(){setVisible(false);setTimeout(onClose,320);}
  return(
    <div style={{position:"fixed",inset:0,zIndex:99999}}>
      <div onClick={close} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.65)",transition:"opacity .3s",opacity:visible?1:0}}/>
      <div style={{position:"absolute",bottom:0,left:0,right:0,background:"#0d1b2a",borderTop:`2px solid ${GOLD}`,borderRadius:"16px 16px 0 0",maxHeight:"75vh",overflowY:"auto",transform:visible?"translateY(0)":"translateY(100%)",transition:"transform .3s cubic-bezier(.32,1,.5,1)"}}>
        <div style={{position:"sticky",top:0,background:"#0d1b2a",padding:"18px 24px 14px",borderBottom:"1px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",justifyContent:"space-between",zIndex:1}}>
          <div>
            <div style={{fontSize:9,color:GOLD,letterSpacing:"2px",fontWeight:700,marginBottom:2}}>PORTFOLIO LAB</div>
            <div style={{fontSize:16,fontWeight:800,color:"#e2e8f0",fontFamily:"'Playfair Display',serif"}}>Saved Portfolios</div>
          </div>
          <button onClick={close} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"50%",width:32,height:32,cursor:"pointer",color:"#e2e8f0",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>x</button>
        </div>
        <div style={{padding:"16px 24px"}}>
          {portfolios.length===0?(
            <div style={{textAlign:"center",padding:"40px 0",color:SUB,fontSize:13}}>No saved portfolios yet.</div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {portfolios.map(p=>(
                <div key={p.id} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"14px 16px",display:"flex",alignItems:"center",gap:12}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:800,color:"#e2e8f0",marginBottom:4}}>{p.name}</div>
                    <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                      {(p.stocks||[]).map((t,i)=>(
                        <span key={t} style={{fontSize:9,fontWeight:800,padding:"2px 7px",borderRadius:999,background:STOCK_COLORS[i%STOCK_COLORS.length]+"22",color:STOCK_COLORS[i%STOCK_COLORS.length],border:`1px solid ${STOCK_COLORS[i%STOCK_COLORS.length]}44`}}>{t}</span>
                      ))}
                    </div>
                    <div style={{fontSize:9,color:MUTED,marginTop:3}}>{p.weightMode==="equal"?"Equal weight":"Custom weight"}</div>
                  </div>
                  <div style={{display:"flex",gap:8,flexShrink:0}}>
                    <button onClick={()=>{onLoad(p);close();}} style={{background:GOLD+"18",border:`1px solid ${GOLD}44`,borderRadius:8,padding:"7px 14px",color:GOLD,fontSize:11,fontWeight:800,cursor:"pointer"}}>LOAD</button>
                    <button onClick={()=>onDelete(p.id)} style={{background:"rgba(192,57,43,0.1)",border:"1px solid rgba(192,57,43,0.3)",borderRadius:8,padding:"7px 10px",color:RED,fontSize:13,cursor:"pointer"}}>x</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SaveDialog({onSave,onClose,saving,error,initialName,isDuplicate,onConfirmOverwrite}){
  const [name,setName]=useState(initialName||"");
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:999999,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:"#0d1b2a",border:`1px solid rgba(212,160,23,0.3)`,borderRadius:14,padding:"28px 32px",width:320,fontFamily:"'DM Sans',sans-serif"}}>
        <div style={{fontSize:14,fontWeight:800,color:GOLD,fontFamily:"'Playfair Display',serif",marginBottom:16}}>Save Portfolio</div>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Portfolio name" onKeyDown={e=>e.key==="Enter"&&name.trim()&&onSave(name.trim())} style={{width:"100%",background:"rgba(255,255,255,0.06)",border:`1px solid rgba(212,160,23,0.3)`,borderRadius:8,padding:"5px 10px",color:"#e2e8f0",fontSize:16,fontFamily:"'DM Sans',sans-serif",outline:"none",boxSizing:"border-box",marginBottom:16}}/>
        {isDuplicate&&(
          <div style={{fontSize:11,color:"#F39C12",marginBottom:12,padding:"10px 12px",background:"rgba(243,156,18,0.08)",border:"1px solid rgba(243,156,18,0.3)",borderRadius:6,lineHeight:1.6}}>
            ⚠️ A portfolio named <strong>"{name}"</strong> already exists. Do you want to overwrite it?
            <div style={{display:"flex",gap:8,marginTop:10}}>
              <button onClick={onClose} style={{flex:1,padding:"6px",borderRadius:6,background:"transparent",border:"1px solid rgba(255,255,255,0.1)",color:SUB,fontSize:10,fontWeight:700,cursor:"pointer"}}>CANCEL</button>
              <button onClick={onConfirmOverwrite} style={{flex:1,padding:"6px",borderRadius:6,background:"rgba(243,156,18,0.15)",border:"1px solid rgba(243,156,18,0.4)",color:"#F39C12",fontSize:10,fontWeight:800,cursor:"pointer"}}>YES, OVERWRITE</button>
            </div>
          </div>
        )}
        {!isDuplicate&&error&&<div style={{fontSize:11,color:"#E74C3C",marginBottom:12,padding:"8px 10px",background:"rgba(192,57,43,0.1)",border:"1px solid rgba(192,57,43,0.3)",borderRadius:6,lineHeight:1.5}}>{error}</div>}
        {!isDuplicate&&(
          <div style={{display:"flex",gap:10}}>
            <button onClick={onClose} style={{flex:1,padding:"8px",borderRadius:8,background:"transparent",border:"1px solid rgba(255,255,255,0.1)",color:SUB,fontSize:11,fontWeight:700,cursor:"pointer"}}>CANCEL</button>
            <button onClick={()=>name.trim()&&onSave(name.trim())} disabled={saving||!name.trim()} style={{flex:1,padding:"8px",borderRadius:8,background:GOLD+"22",border:`1px solid ${GOLD}66`,color:GOLD,fontSize:11,fontWeight:800,cursor:name.trim()?"pointer":"not-allowed"}}>{saving?"SAVING...":"SAVE"}</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PortfolioSimulator(){
  const navigate=useNavigate();
  const location=useLocation();
  const{user}=useAuth();
  const{ checkPortfolio, recordPortfolioRun }=useAccess();
  const userKey=user?.email?user.email.replace(/[.#$[\]]/g,"_"):null;
  const[paywall,setPaywall]=useState(null);

  const[universe,setUniverse]=useState([]);
  const[suggestions,setSuggestions]=useState([]);
  const[showSugg,setShowSugg]=useState(false);

  const[stocks,setStocks]=useState([]);
  const[weights,setWeights]=useState({});
  const[weightMode,setWeightMode]=useState("equal");
  const[tickerInput,setTickerInput]=useState("");
  const[addError,setAddError]=useState(null);
  const[adding,setAdding]=useState(false);

  const[benchmark,setBenchmark]=useState(BENCHMARKS[0]);
  const[showBm,setShowBm]=useState(true);
  const[dateRange,setDateRange]=useState(DATE_RANGES[1]);
  const[dataStartTs,setDataStartTs]=useState(null);
  const[sliderStart,setSliderStart]=useState(null);

  const[simulating,setSimulating]=useState(false);
  const[result,setResult]=useState(null);
  const[simError,setSimError]=useState(null);

  const[savedPortfolios,setSavedPortfolios]=useState([]);
  const[showSheet,setShowSheet]=useState(false);
  const[showSaveDialog,setShowSaveDialog]=useState(false);
  const[duplicatePortfolio,setDuplicatePortfolio]=useState(null);
  const[saving,setSaving]=useState(false);
  const[saveError,setSaveError]=useState(null);
  const[portfolioName,setPortfolioName]=useState("");

  const totalWeight=Object.values(weights).reduce((a,b)=>a+b,0);
  const weightOk=weightMode==="equal"||Math.abs(totalWeight-1)<0.01;

  useEffect(()=>{window.scrollTo(0,0);},[]);

  useEffect(()=>{
    getDocs(collection(db,"stock_fundamentals")).then(snap=>{
      const list=[];
      snap.forEach(d=>{if(d.id!=="_meta")list.push({ticker:d.id,name:d.data()?.name||d.id});});
      list.sort((a,b)=>a.ticker.localeCompare(b.ticker));
      setUniverse(list);
    }).catch(()=>{});
  },[]);

  useEffect(()=>{
    if(!userKey)return;
    getDocs(collection(db,"portfolios",userKey,"saved")).then(snap=>{
      const list=[];snap.forEach(d=>list.push({id:d.id,...d.data()}));
      list.sort((a,b)=>((b.created_at||"") > (a.created_at||"") ? 1 : -1));
      setSavedPortfolios(list);
    }).catch(()=>{});
  },[userKey]);

  useEffect(()=>{
    if(weightMode==="equal"&&stocks.length){
      const w=1/stocks.length,wm={};stocks.forEach(t=>{wm[t]=w;});setWeights(wm);
    }
  },[stocks,weightMode]);

  const normalise=useCallback(wm=>{
    const sum=Object.values(wm).reduce((a,b)=>a+b,0);
    if(!sum)return wm;
    const out={};Object.keys(wm).forEach(k=>{out[k]=wm[k]/sum;});return out;
  },[]);

  async function addStock(){
    const ticker=tickerInput.trim().toUpperCase().replace(/\.NS$/,"");
    if(!ticker)return;
    if(stocks.includes(ticker)){setAddError("Already in portfolio");return;}
    if(stocks.length>=30){setAddError("Max 30 stocks");return;}
    setAdding(true);setAddError(null);
    const pts=await fetchStockPrices(ticker);
    if(!pts||pts.length<30){setAddError(`No price data for ${ticker}`);setAdding(false);return;}
    const ns=[...stocks,ticker];setStocks(ns);
    if(weightMode==="equal"){const w=1/ns.length,wm={};ns.forEach(t=>{wm[t]=w;});setWeights(wm);}
    else{const wm={...weights,[ticker]:0.1};setWeights(normalise(wm));}
    setTickerInput("");setAdding(false);setResult(null);
  }

  function removeStock(ticker){
    const ns=stocks.filter(t=>t!==ticker);setStocks(ns);
    const wm={...weights};delete wm[ticker];
    if(weightMode==="equal"&&ns.length){const w=1/ns.length;ns.forEach(t=>{wm[t]=w;});}
    else if(ns.length)Object.assign(wm,normalise(wm));
    setWeights(wm);setResult(null);
  }

  const simulateRef = useRef(null);

  const[pendingSim, setPendingSim]=useState(false);

  function loadPortfolio(p){setStocks(p.stocks||[]);setWeights(p.weights||{});setWeightMode(p.weightMode||"custom");setResult(null);setDataStartTs(null);setSliderStart(null);setPortfolioName(p.name||"");setPendingSim(true);}

  // Auto-run simulation after portfolio is loaded
  useEffect(()=>{
    if(pendingSim && stocks.length>0){
      setPendingSim(false);
      setTimeout(()=>{ if(simulateRef.current) simulateRef.current(); }, 200);
    }
  },[pendingSim, stocks]);

  // ── Auto-load + run portfolio passed via navigation state ──────
  useEffect(()=>{
    const incoming = location.state?.portfolio ?? null;
    if(incoming){
      window.history.replaceState({}, '');
      setTimeout(()=>{ loadPortfolio(incoming); }, 50);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  async function deleteSaved(id){
    if(!userKey)return;
    await deleteDoc(doc(db,"portfolios",userKey,"saved",id));
    setSavedPortfolios(prev=>prev.filter(p=>p.id!==id));
  }

  async function savePortfolio(name){
    if(!userKey||!stocks.length)return;
    // Check for duplicate name
    const existing=savedPortfolios.find(p=>p.name.trim().toLowerCase()===name.trim().toLowerCase());
    if(existing){
      setDuplicatePortfolio(existing);
      return;
    }
    await doSave(name, "port_"+Date.now());
  }

  async function doSave(name, id){
    setSaving(true);setSaveError(null);
    try{
      const data={name,stocks,weights,weightMode,created_at:new Date().toISOString()};
      await setDoc(doc(db,"portfolios",userKey,"saved",id),data);
      setSavedPortfolios(prev=>{
        const filtered=prev.filter(p=>p.id!==id);
        return [{id,...data},...filtered];
      });
      setPortfolioName(name);
      setShowSaveDialog(false);
      setDuplicatePortfolio(null);
    }catch(e){
      console.error("Save error:",e);
      setSaveError(e.code==="permission-denied"?"Firestore permission denied. Add portfolios rule — see docs.":e.message||"Save failed.");
    }finally{setSaving(false);}
  }

  async function overwritePortfolio(){
    if(!duplicatePortfolio)return;
    await doSave(duplicatePortfolio.name, duplicatePortfolio.id);
  }

  async function simulate(){
    if(stocks.length<1)return;
    if(!weightOk){setSimError(`Weights sum to ${(totalWeight*100).toFixed(0)}% - must equal 100%.`);return;}

    // ── Access check ──────────────────────────────────────────────────────────
    const access = checkPortfolio();
    if(!access.allowed){
      setPaywall({
        type:  access.requiresSignup ? "signup" : "portfolio",
        used:  access.used  ?? 0,
        total: access.total ?? 10,
      });
      return;
    }
    await recordPortfolioRun();
    // ─────────────────────────────────────────────────────────────────────────

    setSimulating(true);setSimError(null);setResult(null);
    try{
      const priceMap={};
      await Promise.all(stocks.map(async t=>{const pts=await fetchStockPrices(t);if(pts)priceMap[t]=pts;}));
      const fetched=Object.keys(priceMap);
      if(!fetched.length)throw new Error("No price data available.");
      const allTs=fetched.flatMap(t=>priceMap[t].map(p=>p.ts));
      const earliestTs=Math.min(...allTs);
      const rangeCutoff=dateRange.days?Date.now()-dateRange.days*86400000:0;
      const cutoff=sliderStart!=null?Math.max(earliestTs,sliderStart):Math.max(earliestTs,rangeCutoff);
      setDataStartTs(earliestTs);
      if(sliderStart==null)setSliderStart(cutoff);
      const filtered={};fetched.forEach(t=>{filtered[t]=priceMap[t].filter(p=>p.ts>=cutoff);});
      // useUnion=true: use all dates any stock has data — gives maximum history for Max range
      const{dates,aligned}=alignSeries(filtered,true);
      if(dates.length<30)throw new Error("Insufficient overlapping data. Try a longer range or different stocks.");
      const w=normalise(Object.fromEntries(fetched.map(t=>[t,weights[t]??(1/fetched.length)])));
      const portRets=[];
      for(let i=1;i<dates.length;i++){
        // On each day, only use stocks that have data for both prev and curr day
        // Renormalize weights dynamically so portfolio return is always fully invested
        let r=0,wSum=0;
        fetched.forEach(t=>{const prev=aligned[t][i-1],curr=aligned[t][i];if(prev&&curr)wSum+=(w[t]||0);});
        if(wSum>0)fetched.forEach(t=>{const prev=aligned[t][i-1],curr=aligned[t][i];if(prev&&curr)r+=((w[t]||0)/wSum)*(curr-prev)/prev;});
        portRets.push(r);
      }
      const portMetrics=computeMetrics(portRets,dates);
      // Use portfolio's ACTUAL first date (not cutoff) as BM start — ensures same time period
      const portFirstTs=new Date(dates[0]).getTime();
      let bmMetrics=null;
      const bmPts=await fetchBenchmark(benchmark);
      if(bmPts){
        const bmFiltered=bmPts.filter(p=>p.ts>=portFirstTs);
        const{dates:bmDates,aligned:bmAligned}=alignSeries({bm:bmFiltered});
        if(bmDates.length>30){
          const bmRets=[];const bmp=bmAligned["bm"];
          for(let i=1;i<bmp.length;i++){if(bmp[i-1]&&bmp[i])bmRets.push((bmp[i]-bmp[i-1])/bmp[i-1]);}
          bmMetrics=computeMetrics(bmRets,bmDates);
        }
      }
      // Store actual first portfolio date for chart label
      setResult({portMetrics,bmMetrics,fetched,w,dates,earliestTs,cutoff,portFirstDate:dates[0]});
    }catch(e){setSimError(e.message);}finally{setSimulating(false);}
  }

  // Always keep ref pointing to latest simulate (for auto-run after load)
  simulateRef.current = simulate;

  function buildChartData(portMetrics,bmMetrics){
    const pm={},bm2={};
    portMetrics.cumul.forEach(p=>{pm[p.date]=p.value;});
    if(bmMetrics)bmMetrics.cumul.forEach(p=>{bm2[p.date]=p.value;});
    const portDates=portMetrics.cumul.map(p=>p.date);
    const firstDate=portDates[0];
    // Find nearest benchmark date at or before portfolio start — exact match often missing
    const bmDates=Object.keys(bm2).sort();
    const nearestBmDate=bmDates.filter(d=>d<=firstDate).pop();
    const bmOffset=nearestBmDate!=null?bm2[nearestBmDate]:0;
    return portDates.map(d=>({
      date:d,
      portfolio:pm[d]??null,
      benchmark:bm2[d]!=null?+(bm2[d]-bmOffset).toFixed(2):null
    }));
  }

  function annualWithBm(){
    const bm2={};(result?.bmMetrics?.annualReturns??[]).forEach(r=>{bm2[r.year]=r.ret;});
    return(result?.portMetrics?.annualReturns??[]).map(r=>({...r,bmRet:bm2[r.year]}));
  }

  const chartData=result?buildChartData(result.portMetrics,result.bmMetrics):[];

  return(
    <div style={{background:`linear-gradient(160deg,${NAVY} 0%,#060e1a 100%)`,minHeight:"100vh",color:"#e2e8f0",fontFamily:"'DM Sans',sans-serif",paddingTop:92}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet"/>
      <style>{`@keyframes pSpin{to{transform:rotate(360deg)}}input[type=range]{height:4px;cursor:pointer}input[type=number]::-webkit-inner-spin-button{opacity:0.5}@media(max-width:760px){.pm-layout{flex-direction:column!important}.pm-left{width:100%!important}.pm-stats{display:grid!important;grid-template-columns:1fr 1fr 1fr!important;gap:6px!important}.pm-stats>div{padding:8px 8px!important}.pm-stats .pm-val{font-size:13px!important}.pm-stats .pm-bm{font-size:11px!important}.pm-header{padding:22px 16px 16px!important}.pm-header-divider{display:none!important}.pm-layout{padding:14px 14px 80px!important}}`}</style>

      {/* Paywall overlay */}
      {paywall && <PaywallOverlay config={paywall} onClose={()=>setPaywall(null)} />}

      {/* Header */}
      <div className="pm-header" style={{padding:"52px 28px 28px",borderBottom:"1px solid rgba(212,160,23,0.15)",textAlign:"center"}}>
        <div style={{maxWidth:660,margin:"0 auto"}}>
          <div className="pm-header-label" style={{fontSize:9,color:GOLD,letterSpacing:"2.5px",fontWeight:700,marginBottom:10}}>VANTAGE CAPITAL · PORTFOLIO LAB</div>
          <h1 style={{margin:"0 0 10px",fontSize:"clamp(26px,4vw,40px)",fontWeight:800,fontFamily:"'Playfair Display',serif",color:"#fff",lineHeight:1.15}}>Portfolio Simulator</h1>
          <div className="pm-header-divider" style={{width:44,height:2,background:GOLD,borderRadius:2,margin:"0 auto 12px"}}/>
          <p className="pm-header-sub" style={{fontSize:12,color:SUB,lineHeight:1.8,margin:"0 0 18px"}}>Build a portfolio, set weights, compare against a benchmark and simulate historical returns.</p>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,flexWrap:"wrap"}}>
            {stocks.length>0&&(
              <button onClick={()=>user?setShowSaveDialog(true):navigate("/signup")} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 18px",borderRadius:999,background:GOLD+"18",border:`1px solid ${GOLD}55`,color:GOLD,fontSize:11,fontWeight:800,cursor:"pointer",letterSpacing:"0.5px"}}>
                💾 SAVE PORTFOLIO {!user&&<span style={{fontSize:9,opacity:0.7}}>(sign in required)</span>}
              </button>
            )}
            {result&&(
              <button onClick={simulate} disabled={simulating} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 18px",borderRadius:999,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"#e2e8f0",fontSize:11,fontWeight:700,cursor:"pointer"}}>
                ↺ RE-RUN
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="pm-layout" style={{display:"flex",gap:24,padding:"24px 28px 80px",maxWidth:1360,margin:"0 auto",alignItems:"flex-start"}}>

        {/* LEFT PANEL */}
        <div className="pm-left" style={{width:360,flexShrink:0}}>

          {/* Load buttons row */}
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            <button onClick={()=>user?setShowSheet(true):navigate("/signup")}
              style={{flex:1,display:"flex",alignItems:"center",gap:8,padding:"10px 14px",borderRadius:10,background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.08)",color:SUB,fontSize:11,fontWeight:700,cursor:"pointer",textAlign:"left"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=GOLD+"55";e.currentTarget.style.color=GOLD;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.08)";e.currentTarget.style.color=SUB;}}>
              <span style={{fontSize:14}}>📂</span>
              <span style={{flex:1}}>Load Saved</span>
              {savedPortfolios.length>0&&<span style={{fontSize:9,background:GOLD+"22",color:GOLD,padding:"2px 7px",borderRadius:999,fontWeight:800}}>{savedPortfolios.length}</span>}
            </button>
            <button onClick={()=>{
                try{
                  const wl=JSON.parse(localStorage.getItem("ae_wishlist")||"[]");
                  if(!wl.length){alert("Your wishlist is empty. Heart some stocks first!");return;}
                  if(stocks.length>0&&!window.confirm(`Replace current ${stocks.length} stock(s) with ${Math.min(wl.length,30)} wishlisted stocks?`))return;
                  const tickers=wl.slice(0,30);
                  const w=1/tickers.length;
                  const wm={};tickers.forEach(t=>{wm[t]=w;});
                  setStocks(tickers);setWeights(wm);setWeightMode("equal");
                  setResult(null);setDataStartTs(null);setSliderStart(null);
                  setPendingSim(true);
                }catch(e){alert("Could not load wishlist.");}
              }}
              style={{flex:1,display:"flex",alignItems:"center",gap:8,padding:"10px 14px",borderRadius:10,background:"rgba(255,255,255,0.025)",border:"1px solid rgba(255,255,255,0.08)",color:SUB,fontSize:11,fontWeight:700,cursor:"pointer",textAlign:"left"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="#E74C3C55";e.currentTarget.style.color="#E74C3C";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.08)";e.currentTarget.style.color=SUB;}}>
              <span style={{fontSize:14}}>🤍</span>
              <span style={{flex:1}}>From Wishlist</span>
            </button>
          </div>

          {/* Ticker autocomplete */}
          <div style={{background:"rgba(255,255,255,0.022)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"18px",marginBottom:14}}>
            <div style={{fontSize:10,fontWeight:800,color:GOLD,letterSpacing:"2px",marginBottom:14}}>ADD STOCKS</div>
            <div style={{position:"relative"}}>
              <div style={{display:"flex",gap:8}}>
                <input value={tickerInput}
                  onChange={e=>{
                    const v=e.target.value.toUpperCase();setTickerInput(v);setAddError(null);
                    if(v.length>=1){const m=universe.filter(u=>u.ticker.startsWith(v)||u.name.toUpperCase().includes(v)).slice(0,8);setSuggestions(m);setShowSugg(m.length>0);}
                    else setShowSugg(false);
                  }}
                  onKeyDown={e=>{if(e.key==="Enter"){setShowSugg(false);addStock();e.target.blur();}if(e.key==="Escape"){setShowSugg(false);e.target.blur();}}}
                  onBlur={()=>setTimeout(()=>setShowSugg(false),150)}
                  placeholder="Name or NSE symbol..."
                  autoCorrect="off" autoCapitalize="characters" autoComplete="off" spellCheck="false"
                  style={{flex:1,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(212,160,23,0.25)",borderRadius:8,padding:"4px 10px",color:"#e2e8f0",fontSize:16,lineHeight:"1.2",fontFamily:"'DM Sans',sans-serif",outline:"none"}}
                />
                <button onClick={()=>{setShowSugg(false);addStock();document.activeElement?.blur();}} disabled={adding||!tickerInput.trim()}
                  style={{background:GOLD+"22",border:"1px solid "+GOLD+"44",borderRadius:8,padding:"8px 14px",color:GOLD,fontSize:12,fontWeight:800,cursor:adding?"wait":"pointer",opacity:!tickerInput.trim()?0.4:1,flexShrink:0}}>
                  {adding?"...":"+ ADD"}
                </button>
              </div>
              {showSugg&&suggestions.length>0&&(
                <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,right:60,background:"rgba(6,14,26,0.98)",border:"1px solid rgba(212,160,23,0.25)",borderRadius:8,boxShadow:"0 8px 24px rgba(0,0,0,0.5)",zIndex:9999,overflow:"hidden"}}>
                  {suggestions.map(u=>(
                    <div key={u.ticker} onMouseDown={()=>{setTickerInput(u.ticker);setShowSugg(false);document.activeElement?.blur();}}
                      style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",cursor:"pointer",borderBottom:"1px solid rgba(255,255,255,0.04)"}}
                      onMouseEnter={e=>e.currentTarget.style.background="rgba(212,160,23,0.08)"}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <span style={{fontSize:12,fontWeight:800,color:GOLD,minWidth:90}}>{u.ticker}</span>
                      <span style={{fontSize:10,color:SUB,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.name!==u.ticker?u.name:""}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {addError&&<div style={{fontSize:11,color:RED,marginTop:6}}>! {addError}</div>}
            <div style={{fontSize:10,color:MUTED,marginTop:8}}>Type name or symbol - up to 30 stocks</div>
          </div>

          {/* Weights */}
          {stocks.length>0&&(
            <div style={{background:"rgba(255,255,255,0.022)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"18px",marginBottom:14}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                <div style={{fontSize:10,fontWeight:800,color:GOLD,letterSpacing:"2px"}}>WEIGHTS</div>
                <div style={{display:"flex",gap:6}}>
                  {["equal","custom"].map(m=>(
                    <button key={m} onClick={()=>{setWeightMode(m);if(m==="equal"&&stocks.length){const w=1/stocks.length,wm={};stocks.forEach(t=>{wm[t]=w;});setWeights(wm);}}}
                      style={{padding:"4px 12px",borderRadius:999,fontSize:10,fontWeight:700,cursor:"pointer",border:`1px solid ${m===weightMode?GOLD+"88":"rgba(255,255,255,0.1)"}`,background:m===weightMode?GOLD+"18":"transparent",color:m===weightMode?GOLD:MUTED}}>
                      {m==="equal"?"EQUAL":"CUSTOM"}
                    </button>
                  ))}
                  <button onClick={()=>{setStocks([]);setWeights({});setResult(null);}}
                    style={{padding:"4px 10px",borderRadius:999,fontSize:10,fontWeight:700,cursor:"pointer",border:"1px solid rgba(192,57,43,0.35)",background:"rgba(192,57,43,0.08)",color:RED,letterSpacing:"0.3px"}}>
                    CLEAR ALL
                  </button>
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {stocks.map((t,i)=>(
                  <WeightRow key={t} stock={t} weight={weights[t]??0} mode={weightMode} color={STOCK_COLORS[i%STOCK_COLORS.length]}
                    onChange={v=>setWeights(prev=>({...prev,[t]:v}))} onRemove={()=>removeStock(t)}/>
                ))}
              </div>
              {weightMode==="custom"&&(
                <>
                  <div style={{display:"flex",justifyContent:"space-between",marginTop:10,padding:"6px 10px",background:weightOk?"rgba(39,174,96,0.08)":"rgba(192,57,43,0.08)",border:`1px solid ${weightOk?GREEN+"44":RED+"44"}`,borderRadius:6}}>
                    <span style={{fontSize:10,color:SUB}}>Total weight</span>
                    <span style={{fontSize:11,fontWeight:800,color:weightOk?GREEN:RED}}>{(totalWeight*100).toFixed(0)}%</span>
                  </div>
                  {!weightOk&&(
                    <button onClick={()=>setWeights(normalise(weights))} style={{width:"100%",marginTop:8,background:"rgba(212,160,23,0.08)",border:`1px solid ${GOLD}33`,borderRadius:8,padding:"6px",color:GOLD,fontSize:10,fontWeight:700,cursor:"pointer"}}>
                      AUTO-NORMALISE TO 100%
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* Benchmark */}
          <div style={{background:"rgba(255,255,255,0.022)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"18px",marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
              <div style={{fontSize:10,fontWeight:800,color:GOLD,letterSpacing:"2px"}}>BENCHMARK</div>
              <button onClick={()=>setShowBm(p=>!p)} style={{display:"flex",alignItems:"center",gap:5,padding:"3px 10px",borderRadius:999,fontSize:9,fontWeight:800,cursor:"pointer",border:`1px solid ${showBm?benchmark.color+"55":"rgba(255,255,255,0.1)"}`,background:showBm?benchmark.color+"14":"transparent",color:showBm?benchmark.color:MUTED}}>
                {showBm?"● ON":"○ OFF"}
              </button>
            </div>
            <div style={{position:"relative",marginBottom:14}}>
              <select value={benchmark.id}
                onChange={e=>{const b=BENCHMARKS.find(x=>x.id===e.target.value);if(b){setBenchmark(b);setResult(null);}}}
                style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid "+benchmark.color+"55",borderRadius:8,padding:"9px 32px 9px 12px",color:benchmark.color,fontSize:12,fontWeight:700,fontFamily:"'DM Sans',sans-serif",outline:"none",cursor:"pointer",appearance:"none",WebkitAppearance:"none"}}>
                {BENCHMARKS.map(b=>(<option key={b.id} value={b.id} style={{background:"#0d1b2a",color:"#e2e8f0"}}>{b.label}</option>))}
              </select>
              <div style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",color:benchmark.color,fontSize:10}}>▼</div>
            </div>
            <div style={{fontSize:10,fontWeight:800,color:GOLD,letterSpacing:"2px",marginBottom:8}}>DATE RANGE</div>
            <div style={{display:"flex",gap:6,marginBottom: dataStartTs?14:0}}>
              {DATE_RANGES.map(dr=>(
                <button key={dr.label} onClick={()=>{setDateRange(dr);setSliderStart(null);}}
                  style={{flex:1,padding:"6px",borderRadius:8,fontSize:11,fontWeight:700,cursor:"pointer",border:`1px solid ${dr.label===dateRange.label?GOLD+"88":"rgba(255,255,255,0.08)"}`,background:dr.label===dateRange.label?GOLD+"18":"transparent",color:dr.label===dateRange.label?GOLD:SUB}}>
                  {dr.label}
                </button>
              ))}
            </div>
            {dataStartTs&&(
              <div>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:9,color:MUTED,letterSpacing:"0.5px"}}>SIMULATION START</span>
                  <span style={{fontSize:9,fontWeight:700,color:GOLD}}>{new Date(sliderStart??dataStartTs).toLocaleDateString("en-IN",{month:"short",year:"numeric"})}</span>
                </div>
                <input type="range" min={dataStartTs} max={Date.now()-90*86400000} step={86400000*30} value={sliderStart??dataStartTs}
                  onChange={e=>setSliderStart(Number(e.target.value))} style={{width:"100%",accentColor:GOLD,marginBottom:2}}/>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <span style={{fontSize:9,color:MUTED}}>{new Date(dataStartTs).toLocaleDateString("en-IN",{month:"short",year:"numeric"})}</span>
                  <span style={{fontSize:9,color:MUTED}}>Today</span>
                </div>
                <div style={{fontSize:9,color:MUTED,marginTop:4}}>Drag to adjust start - re-run to update</div>
              </div>
            )}
          </div>

          {/* Weight warning */}
          {weightMode==="custom"&&!weightOk&&(
            <div style={{padding:"9px 12px",background:"rgba(192,57,43,0.1)",border:"1px solid rgba(192,57,43,0.35)",borderRadius:8,marginBottom:10,fontSize:11,color:"#E74C3C",lineHeight:1.6}}>
              Weights sum to <strong>{(totalWeight*100).toFixed(0)}%</strong> - must equal 100% before running.
            </div>
          )}

          {/* Run button */}
          <button onClick={simulate} disabled={simulating||stocks.length===0||!weightOk}
            style={{width:"100%",padding:"14px",borderRadius:10,background:stocks.length&&weightOk?`linear-gradient(135deg,${GOLD}dd,${ORANGE}dd)`:"rgba(255,255,255,0.05)",border:"none",color:stocks.length&&weightOk?NAVY:MUTED,fontSize:13,fontWeight:900,letterSpacing:"1.5px",cursor:stocks.length&&weightOk?"pointer":"not-allowed",fontFamily:"'DM Sans',sans-serif",marginBottom:14}}>
            {simulating?"SIMULATING...":"RUN SIMULATION"}
          </button>
        </div>

        {/* RIGHT PANEL */}
        <div style={{flex:1,minWidth:0}}>
          {!result&&!simulating&&!simError&&(
            <div style={{textAlign:"center",padding:"80px 20px"}}>
              <div style={{fontSize:48,marginBottom:16}}>📊</div>
              <div style={{fontSize:18,fontWeight:800,color:GOLD,fontFamily:"'Playfair Display',serif",marginBottom:8}}>Build Your Portfolio</div>
              <div style={{fontSize:12,color:SUB,lineHeight:1.8,maxWidth:340,margin:"0 auto"}}>Add stocks, set weights and benchmark, then run the simulation.</div>
            </div>
          )}

          {simulating&&(
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"80px 0",gap:14}}>
              <svg width="40" height="40" viewBox="0 0 32 32" style={{animation:"pSpin .9s linear infinite"}}>
                <circle cx="16" cy="16" r="12" fill="none" stroke={GOLD} strokeWidth="2.5" strokeDasharray="52" strokeDashoffset="14" strokeLinecap="round"/>
              </svg>
              <span style={{fontSize:11,color:GOLD,letterSpacing:"2px"}}>RUNNING SIMULATION...</span>
            </div>
          )}

          {simError&&!simulating&&(
            <div style={{padding:"14px 18px",background:"rgba(192,57,43,0.08)",border:`1px solid ${RED}44`,borderRadius:10,color:RED,fontSize:12,marginBottom:16}}>
              {simError}
            </div>
          )}

          {result&&!simulating&&(()=>{
            const{portMetrics,bmMetrics}=result;
            return(
              <>
                {/* Stats */}
                <div style={{background:"rgba(255,255,255,0.018)",border:`1px solid rgba(212,160,23,0.12)`,borderTop:`2px solid ${GOLD}`,borderRadius:14,padding:"18px 20px",marginBottom:20}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14,flexWrap:"wrap"}}>
                    <div style={{width:3,height:16,background:GOLD,borderRadius:2}}/>
                    <span style={{fontSize:13,fontWeight:800,color:GOLD}}>Performance Summary</span>
                    {showBm&&bmMetrics&&<span style={{fontSize:10,color:MUTED}}>vs {benchmark.label}</span>}
                    {!showBm&&<span style={{fontSize:10,color:MUTED,fontStyle:"italic"}}>benchmark hidden</span>}
                  </div>
                  <div className="pm-stats" style={{display:"flex",gap:10}}>
                    <StatCol label="CAGR" portVal={pct(portMetrics.cagr,1)} bmVal={showBm&&bmMetrics?pct(bmMetrics.cagr,1):undefined} portColor={portMetrics.cagr>=0?GREEN:RED} bmColor={bmMetrics&&bmMetrics.cagr>=0?GREEN+"aa":RED+"aa"}/>
                    <StatCol label="SHARPE" portVal={fmt2(portMetrics.sharpe)} bmVal={showBm&&bmMetrics?fmt2(bmMetrics.sharpe):undefined} portColor={portMetrics.sharpe>=1?GREEN:portMetrics.sharpe>=0?GOLD:RED} bmColor={SUB}/>
                    <StatCol label="MAX DD" portVal={pct(portMetrics.maxDD,1)} bmVal={showBm&&bmMetrics?pct(bmMetrics.maxDD,1):undefined} portColor={RED} bmColor={RED+"88"}/>
                    <StatCol label="ANN VOL" portVal={pct(portMetrics.vol,1)} bmVal={showBm&&bmMetrics?pct(bmMetrics.vol,1):undefined} portColor={ORANGE} bmColor={ORANGE+"88"}/>
                    {showBm&&bmMetrics&&(
                      <StatCol label="ALPHA" portVal={pct(portMetrics.cagr-bmMetrics.cagr,1)} portColor={(portMetrics.cagr-bmMetrics.cagr)>=0?GREEN:RED}/>
                    )}
                  </div>
                </div>

                {/* Cumulative return chart */}
                <div style={{background:"rgba(255,255,255,0.018)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:"20px 22px",marginBottom:20}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16,flexWrap:"wrap"}}>
                    <div style={{width:3,height:18,background:GOLD,borderRadius:2}}/>
                    <span style={{fontSize:14,fontWeight:800,color:GOLD}}>Cumulative Return</span>
                    <span style={{fontSize:10,color:MUTED,flex:1}}>from {new Date(result.portFirstDate||result.cutoff).toLocaleDateString("en-IN",{month:"short",year:"numeric"})}</span>
                    {bmMetrics&&(
                      <button onClick={()=>setShowBm(p=>!p)} style={{display:"flex",alignItems:"center",gap:5,padding:"3px 10px",borderRadius:999,fontSize:9,fontWeight:800,cursor:"pointer",border:`1px solid ${showBm?benchmark.color+"55":"rgba(255,255,255,0.1)"}`,background:showBm?benchmark.color+"14":"transparent",color:showBm?benchmark.color:MUTED}}>
                        <span style={{display:"inline-block",width:8,height:2,background:showBm?benchmark.color:MUTED,borderRadius:1}}/>
                        &nbsp;{benchmark.label}
                      </button>
                    )}
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData} margin={{top:0,right:10,left:0,bottom:0}}>
                      <defs>
                        <linearGradient id="portG" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={GOLD} stopOpacity={0.22}/>
                          <stop offset="95%" stopColor={GOLD} stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="bmG" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={benchmark.color} stopOpacity={0.12}/>
                          <stop offset="95%" stopColor={benchmark.color} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                      <XAxis dataKey="date" tick={{fill:MUTED,fontSize:9}} tickLine={false} axisLine={false} tickFormatter={d=>d?.slice(0,7)} interval="preserveStartEnd"/>
                      <YAxis tick={{fill:MUTED,fontSize:9}} tickLine={false} axisLine={false} tickFormatter={v=>`${v>=0?"+":""}${v?.toFixed(0)}%`}/>
                      <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3"/>
                      <Legend formatter={n => {
                        const pName = portfolioName||"Portfolio";
                        return n===pName ? pName : benchmark.label;
                      }} wrapperStyle={{fontSize:10,paddingTop:6}}/>
                      <Tooltip contentStyle={{background:"rgba(6,14,26,0.97)",border:"1px solid rgba(212,160,23,0.3)",borderRadius:8,fontSize:11}} formatter={(v,n)=>[`${v>=0?"+":""}${v?.toFixed(1)}%`, n===(portfolioName||"Portfolio") ? (portfolioName||"Portfolio") : benchmark.label]} labelFormatter={d=>d}/>
                      <Area type="monotone" dataKey="portfolio" stroke={GOLD} strokeWidth={2} fill="url(#portG)" dot={false} connectNulls name={portfolioName||"Portfolio"}/>
                      {showBm&&bmMetrics&&<Area type="monotone" dataKey="benchmark" stroke={benchmark.color} strokeWidth={1.5} fill="url(#bmG)" dot={false} strokeDasharray="4 2" connectNulls name="benchmark"/>}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Annual returns */}
                <div style={{background:"rgba(255,255,255,0.018)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:"20px 22px",marginBottom:20}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
                    <div style={{width:3,height:18,background:TEAL,borderRadius:2}}/>
                    <span style={{fontSize:14,fontWeight:800,color:TEAL}}>Annual Returns</span>
                    {showBm&&bmMetrics&&<span style={{fontSize:10,color:MUTED}}>vs {benchmark.label}</span>}
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={annualWithBm()} margin={{top:0,right:10,left:0,bottom:0}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false}/>
                      <XAxis dataKey="year" tick={{fill:MUTED,fontSize:9}} tickLine={false} axisLine={false}/>
                      <YAxis tick={{fill:MUTED,fontSize:9}} tickLine={false} axisLine={false} tickFormatter={v=>`${(v*100).toFixed(0)}%`}/>
                      <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)"/>
                      <Tooltip contentStyle={{background:"rgba(6,14,26,0.97)",border:`1px solid rgba(0,191,165,0.3)`,borderRadius:8,fontSize:11}} formatter={(v,n)=>[`${v>=0?"+":""}${(v*100).toFixed(1)}%`,n==="ret"?"Portfolio":benchmark.label]}/>
                      <Bar dataKey="ret" name="ret" radius={[3,3,0,0]} maxBarSize={28}>
                        {annualWithBm().map(entry=>(<Cell key={entry.year} fill={entry.ret>=0?GREEN:RED} fillOpacity={0.85}/>))}
                      </Bar>
                      {showBm&&bmMetrics&&<Bar dataKey="bmRet" name="bmRet" radius={[3,3,0,0]} maxBarSize={28} fill={benchmark.color} fillOpacity={0.4}/>}
                    </BarChart>
                  </ResponsiveContainer>
                  <div style={{marginTop:16,overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
                      <thead>
                        <tr style={{borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
                          <th style={{textAlign:"left",padding:"6px 10px",color:MUTED,fontWeight:700}}>YEAR</th>
                          <th style={{textAlign:"right",padding:"6px 10px",color:GOLD,fontWeight:700}}>PORTFOLIO</th>
                          {showBm&&bmMetrics&&<th style={{textAlign:"right",padding:"6px 10px",color:benchmark.color,fontWeight:700}}>{benchmark.label.toUpperCase()}</th>}
                          {showBm&&bmMetrics&&<th style={{textAlign:"right",padding:"6px 10px",color:MUTED,fontWeight:700}}>ALPHA</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {annualWithBm().map(r=>(
                          <tr key={r.year} style={{borderBottom:"1px solid rgba(255,255,255,0.04)"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.03)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                            <td style={{padding:"7px 10px",color:SUB,fontWeight:700}}>{r.year}</td>
                            <td style={{padding:"7px 10px",textAlign:"right",fontWeight:800,color:r.ret>=0?GREEN:RED}}>{pct(r.ret,1)}</td>
                            {showBm&&bmMetrics&&<td style={{padding:"7px 10px",textAlign:"right",color:r.bmRet>=0?GREEN+"aa":RED+"aa"}}>{r.bmRet!=null?pct(r.bmRet,1):"--"}</td>}
                            {showBm&&bmMetrics&&<td style={{padding:"7px 10px",textAlign:"right",fontWeight:700,color:(r.ret-(r.bmRet||0))>=0?GREEN:RED}}>{r.bmRet!=null?pct(r.ret-r.bmRet,1):"--"}</td>}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Composition */}
                <div style={{background:"rgba(255,255,255,0.018)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:"16px 20px",marginBottom:20}}>
                  <div style={{fontSize:10,fontWeight:800,color:PURPLE,letterSpacing:"2px",marginBottom:12}}>PORTFOLIO COMPOSITION</div>
                  <div style={{display:"flex",flexDirection:"column",gap:6}}>
                    {result.fetched.map((t,i)=>{
                      const w=result.w[t]??0;
                      return(
                        <div key={t} style={{display:"flex",alignItems:"center",gap:10}}>
                          <span style={{fontSize:12,fontWeight:800,color:STOCK_COLORS[i%STOCK_COLORS.length],minWidth:100}}>{t}</span>
                          <div style={{flex:1,background:"rgba(255,255,255,0.05)",borderRadius:999,height:5}}>
                            <div style={{width:`${(w*100).toFixed(1)}%`,background:STOCK_COLORS[i%STOCK_COLORS.length],borderRadius:999,height:5}}/>
                          </div>
                          <span style={{fontSize:11,fontWeight:700,color:SUB,minWidth:40,textAlign:"right"}}>{(w*100).toFixed(1)}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div style={{fontSize:10,color:MUTED,lineHeight:1.9,borderTop:"1px solid rgba(255,255,255,0.05)",paddingTop:14}}>
                  Daily closing prices from Firestore. Sharpe assumes {(RISK_FREE*100).toFixed(1)}% risk-free rate.
                  <strong style={{color:RED}}> Not SEBI-registered investment advice.</strong>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {showSheet&&<SavedSheet portfolios={savedPortfolios} onLoad={loadPortfolio} onDelete={deleteSaved} onClose={()=>setShowSheet(false)}/>}
      {showSaveDialog&&<SaveDialog onSave={savePortfolio} onClose={()=>{setShowSaveDialog(false);setSaveError(null);setDuplicatePortfolio(null);}} saving={saving} error={saveError} initialName={portfolioName} isDuplicate={!!duplicatePortfolio} onConfirmOverwrite={overwritePortfolio}/>}
    </div>
  );
}