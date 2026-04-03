import { useState, useRef, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

/* ── Supabase client (anon key — safe to expose in frontend) ── */
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const API = import.meta.env.VITE_API_URL || "http://localhost:8080";

const apiFetch = async (path, options = {}, token = null) => {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok && path.includes("pdf")) return res; // blob responses
  return res.json();
};

/* ─── DESIGN TOKENS ─────────────────────────────────────── */
const C = {
  navy:"#0D1421", navyMid:"#162035", copper:"#C4692A", copperLt:"#D4834A",
  amber:"#E8A84C", ivory:"#FAF8F3", paper:"#F2EFE8", white:"#FFFFFF",
  fog:"#EDF0F7", border:"#E0DDD6", slate:"#6B7280", ink:"#111827",
  red:"#B91C1C", teal:"#0D7490", green:"#15803D",
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,600;0,700;0,800;1,700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Plus Jakarta Sans',sans-serif;background:${C.ivory};color:${C.ink};-webkit-font-smoothing:antialiased;}
input,button,select,textarea{font-family:'Plus Jakarta Sans',sans-serif;}
::-webkit-scrollbar{width:4px;height:4px;}::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px;}
@keyframes up{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
@keyframes in{from{opacity:0;}to{opacity:1;}}
@keyframes dot{0%,100%{opacity:.25;transform:scale(.8);}50%{opacity:1;transform:scale(1);}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pulse{0%,100%{opacity:.6}50%{opacity:1}}
`;

/* ─── BEE DATA ───────────────────────────────────────────── */
const ELEMENTS = [
  { id:"own",    label:"Ownership",               short:"Own",    max:25, icon:"◈", color:"#7C3AED",
    fields:[{id:"blackOwn",label:"Black Ownership (%)",hint:"% equity held by Black South Africans",max:100,pts:20},{id:"blackWomen",label:"Black Women Ownership (%)",hint:"% equity held by Black women",max:100,pts:5}]},
  { id:"mgmt",   label:"Management Control",       short:"Mgmt",   max:19, icon:"◉", color:C.teal,
    fields:[{id:"board",label:"Black Board Members (%)",hint:"% Black at board level",max:100,pts:5},{id:"exec",label:"Black Executives (%)",hint:"% Black C-suite",max:100,pts:5},{id:"senior",label:"Black Senior Mgmt (%)",hint:"% Black senior management",max:100,pts:5},{id:"middle",label:"Black Middle Mgmt (%)",hint:"% Black middle management",max:100,pts:4}]},
  { id:"skills", label:"Skills Development",       short:"Skills", max:20, icon:"◎", color:C.green,
    fields:[{id:"trainPct",label:"Training Spend (% payroll)",hint:"% of payroll on Black training",max:6,pts:8},{id:"learners",label:"Learnership Enrolments",hint:"Black learners in accredited programs",max:5,pts:7},{id:"bursaries",label:"Bursary Awards",hint:"Bursaries to Black students",max:20,pts:5}]},
  { id:"esd",    label:"Enterprise & Supplier Dev",short:"ESD",    max:40, icon:"◆", color:C.copper,
    fields:[{id:"beeProc",label:"BEE-Compliant Suppliers (%)",hint:"% procurement from BEE suppliers",max:100,pts:15},{id:"blackSpend",label:"Black Supplier Spend (%)",hint:"% spend on Black-owned businesses",max:100,pts:12},{id:"supDev",label:"Supplier Dev (% NPAT)",hint:"Investment in supplier development",max:3,pts:10},{id:"entDev",label:"Enterprise Dev (% NPAT)",hint:"Investment in enterprise development",max:3,pts:5}]},
  { id:"sed",    label:"Socio-Economic Dev",        short:"SED",    max:5,  icon:"◇", color:C.red,
    fields:[{id:"sedPct",label:"SED Contribution (% NPAT)",hint:"Donations to approved social programs",max:1,pts:5}]},
];
const DEFAULTS = Object.fromEntries(ELEMENTS.flatMap(e=>e.fields.map(f=>[f.id,""])));
const calcEl=(el,v)=>Math.min(el.fields.reduce((s,f)=>s+(Math.min(parseFloat(v[f.id]||0),f.max)/f.max)*f.pts,0),el.max);
const getLevel=s=>{
  if(s>=100)return{n:1,label:"Level 1",rec:"135%",clr:"#15803D"};
  if(s>=95) return{n:2,label:"Level 2",rec:"125%",clr:"#1A9E50"};
  if(s>=90) return{n:3,label:"Level 3",rec:"110%",clr:"#22C55E"};
  if(s>=80) return{n:4,label:"Level 4",rec:"100%",clr:C.amber};
  if(s>=75) return{n:5,label:"Level 5",rec:"80%", clr:C.copper};
  if(s>=70) return{n:6,label:"Level 6",rec:"60%", clr:"#B45309"};
  if(s>=55) return{n:7,label:"Level 7",rec:"50%", clr:"#92400E"};
  if(s>=40) return{n:8,label:"Level 8",rec:"10%", clr:C.red};
  return        {n:9,label:"Non-Compliant",rec:"0%",clr:C.red};
};

/* ─── PRIMITIVES ─────────────────────────────────────────── */
const Card=({children,p="18px",style:s={},onClick})=>(
  <div onClick={onClick} style={{background:C.white,borderRadius:16,border:`1px solid ${C.border}`,padding:p,boxShadow:"0 1px 12px #0D142108",...s}}>{children}</div>
);
const Tag=({label,color=C.navy})=>(
  <span style={{fontSize:11,fontWeight:700,letterSpacing:.8,padding:"3px 9px",borderRadius:99,background:color+"16",color,border:`1px solid ${color}28`,textTransform:"uppercase"}}>{label}</span>
);
const Bar=({v,max,color=C.copper,h=5})=>(
  <div style={{height:h,background:C.fog,borderRadius:99,overflow:"hidden"}}>
    <div style={{width:`${Math.min(v/max,1)*100}%`,height:"100%",background:color,borderRadius:99,transition:"width 1s ease"}}/>
  </div>
);
const Toggle=({on,onClick})=>(
  <div onClick={onClick} style={{width:44,height:24,borderRadius:99,cursor:"pointer",background:on?C.copper:C.border,position:"relative",transition:"background .25s",flexShrink:0}}>
    <div style={{width:18,height:18,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:on?23:3,transition:"left .25s",boxShadow:"0 1px 3px #0003"}}/>
  </div>
);
const Spinner=({size=18,color="#fff"})=>(
  <div style={{width:size,height:size,border:`2.5px solid ${color}`,borderTopColor:"transparent",borderRadius:"50%",animation:"spin 1s linear infinite"}}/>
);
const Logo=({dark})=>(
  <div style={{display:"flex",alignItems:"center",gap:8}}>
    <div style={{width:30,height:30,borderRadius:8,background:`linear-gradient(135deg,${C.copper},${C.copperLt})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>🧭</div>
    <span style={{fontFamily:"'Fraunces'",fontSize:19,fontWeight:700,color:dark?C.white:C.navy,letterSpacing:-.5}}>
      BEE<span style={{color:C.copper}}>compass</span>
    </span>
  </div>
);

/* ─── AUTH ───────────────────────────────────────────────── */
function Auth({onAuth}) {
  const [mode,setMode]=useState("login");
  const [f,setF]=useState({name:"",company:"",email:"",pw:""});
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const set=(k,v)=>setF(p=>({...p,[k]:v}));

  const submit=async()=>{
    setLoading(true); setError("");
    try {
      if(mode==="signup"){
        const {error:e}=await supabase.auth.signUp({email:f.email,password:f.pw,options:{data:{name:f.name,company:f.company}}});
        if(e) throw e;
        // Create profile in backend after signup
        const {data:{session}}=await supabase.auth.signInWithPassword({email:f.email,password:f.pw});
        if(session){
          await apiFetch("/api/profile",{method:"POST",body:{name:f.name,company:f.company}},session.access_token);
          onAuth(session,{name:f.name,company:f.company});
        }
      } else {
        const {data:{session},error:e}=await supabase.auth.signInWithPassword({email:f.email,password:f.pw});
        if(e) throw e;
        const profile=await apiFetch("/api/profile",{},session.access_token);
        onAuth(session,profile);
      }
    } catch(e){ setError(e.message||"Something went wrong"); }
    setLoading(false);
  };

  const demo=async()=>{
    setLoading(true);
    // Demo mode — use local state only
    onAuth(null,{name:"Demo User",company:"Demo Company SA"});
    setLoading(false);
  };

  return(
    <div style={{minHeight:"100vh",background:C.navy,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <style>{CSS}</style>
      <div style={{marginBottom:36,animation:"up .5s ease"}}><Logo dark/></div>
      <div style={{width:"100%",maxWidth:380,background:"#ffffff0A",border:"1px solid #ffffff12",borderRadius:22,padding:"26px 22px",animation:"up .4s ease .1s both"}}>
        <div style={{display:"flex",background:"#ffffff0C",borderRadius:10,padding:3,marginBottom:22}}>
          {["login","signup"].map(m=>(
            <button key={m} onClick={()=>{setMode(m);setError("");}} style={{flex:1,padding:"9px",borderRadius:8,border:"none",cursor:"pointer",fontWeight:600,fontSize:13,background:m===mode?"#fff":"transparent",color:m===mode?C.navy:"#ffffff60",transition:"all .2s"}}>
              {m==="login"?"Sign In":"Create Account"}
            </button>
          ))}
        </div>

        {mode==="signup"&&<>
          {[["Full Name","name","Amahle Dlamini","text"],["Company Name","company","Dlamini Holdings (Pty) Ltd","text"]].map(([lbl,k,ph,t])=>(
            <div key={k} style={{marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:600,color:"#ffffff70",letterSpacing:.5,textTransform:"uppercase",marginBottom:5}}>{lbl}</div>
              <input type={t} value={f[k]} onChange={e=>set(k,e.target.value)} placeholder={ph}
                style={{width:"100%",padding:"11px 14px",border:"1px solid #ffffff18",borderRadius:10,background:"#ffffff0C",color:"#fff",fontSize:14,outline:"none"}}/>
            </div>
          ))}
        </>}

        {[["Email","email","you@company.co.za","email"],["Password","pw","••••••••","password"]].map(([lbl,k,ph,t])=>(
          <div key={k} style={{marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:600,color:"#ffffff70",letterSpacing:.5,textTransform:"uppercase",marginBottom:5}}>{lbl}</div>
            <input type={t} value={f[k]} onChange={e=>set(k,e.target.value)} placeholder={ph}
              onKeyDown={e=>e.key==="Enter"&&submit()}
              style={{width:"100%",padding:"11px 14px",border:"1px solid #ffffff18",borderRadius:10,background:"#ffffff0C",color:"#fff",fontSize:14,outline:"none"}}/>
          </div>
        ))}

        {error&&<div style={{fontSize:13,color:"#FCA5A5",marginBottom:12,padding:"10px 12px",background:"#B91C1C20",borderRadius:9}}>{error}</div>}

        <button onClick={submit} disabled={loading} style={{width:"100%",padding:"13px",border:"none",borderRadius:12,cursor:"pointer",fontWeight:700,fontSize:15,background:`linear-gradient(135deg,${C.copper},${C.copperLt})`,color:"#fff",marginTop:4,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          {loading?<Spinner/>:(mode==="login"?"Sign In →":"Start Free Trial →")}
        </button>

        <div style={{display:"flex",alignItems:"center",gap:10,margin:"16px 0"}}>
          <div style={{flex:1,height:1,background:"#ffffff12"}}/><span style={{fontSize:11,color:"#ffffff40"}}>or</span><div style={{flex:1,height:1,background:"#ffffff12"}}/>
        </div>

        <button onClick={demo} style={{width:"100%",padding:"11px",borderRadius:10,cursor:"pointer",fontWeight:500,fontSize:14,background:"#ffffff0C",border:"1px solid #ffffff18",color:"#ffffffC0"}}>
          🔍 Try Demo (no account needed)
        </button>
        <div style={{textAlign:"center",marginTop:14,fontSize:11,color:"#ffffff40"}}>14-day free trial · No card required · POPIA compliant</div>
      </div>
    </div>
  );
}

/* ─── DASHBOARD ──────────────────────────────────────────── */
function Dashboard({vals,user,setPage,token}) {
  const els=ELEMENTS.map(e=>({...e,score:calcEl(e,vals)}));
  const total=els.reduce((a,b)=>a+b.score,0);
  const bee=getLevel(total);
  const next=[{l:"Level 4",min:80},{l:"Level 3",min:90},{l:"Level 2",min:95},{l:"Level 1",min:100}].find(t=>t.min>total);
  const r=(size,sw,color,score,max,ch)=>{
    const c=size/2,rad=(size-sw*2)/2,circ=2*Math.PI*rad,off=circ*(1-Math.min(score/max,1));
    return(<div style={{position:"relative",width:size,height:size,flexShrink:0}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        <circle cx={c} cy={c} r={rad} fill="none" stroke={C.fog} strokeWidth={sw}/>
        <circle cx={c} cy={c} r={rad} fill="none" stroke={color} strokeWidth={sw} strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round" style={{transition:"stroke-dashoffset 1.2s ease"}}/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>{ch}</div>
    </div>);
  };

  return(
    <div style={{padding:"24px 20px",animation:"up .4s ease"}}>
      <div style={{marginBottom:20}}>
        <div style={{fontSize:13,color:C.slate}}>Welcome back, <strong>{user.name?.split(" ")[0]||"there"}</strong></div>
        <h1 style={{fontFamily:"'Fraunces'",fontSize:26,fontWeight:700,color:C.ink,marginTop:3,letterSpacing:-.5}}>{user.company}</h1>
      </div>

      {/* Score Hero */}
      <div style={{background:C.navy,borderRadius:22,padding:"24px 22px",marginBottom:16,position:"relative",overflow:"hidden",boxShadow:`0 8px 40px ${C.navy}30`}}>
        <div style={{position:"absolute",right:-40,top:-40,width:180,height:180,borderRadius:"50%",background:"#ffffff05"}}/>
        <div style={{display:"flex",alignItems:"center",gap:20,position:"relative"}}>
          {r(118,8,C.amber,total,109,<>
            <div style={{fontFamily:"'Fraunces'",fontSize:27,fontWeight:700,color:"#fff",lineHeight:1}}>{total.toFixed(0)}</div>
            <div style={{fontSize:10,color:C.copper,fontWeight:600,marginTop:1}}>/ 109</div>
          </>)}
          <div style={{flex:1}}>
            <Tag label="B-BBEE Score" color={C.amber}/>
            <div style={{fontFamily:"'Fraunces'",fontSize:34,fontWeight:800,color:"#fff",lineHeight:1.1,marginTop:7}}>{bee.label}</div>
            <div style={{fontSize:13,color:"#ffffff70",marginTop:5}}>{bee.rec} procurement recognition</div>
          </div>
        </div>
        {next&&<div style={{marginTop:18,paddingTop:14,borderTop:"1px solid #ffffff10"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6,fontSize:12}}>
            <span style={{color:"#ffffff60"}}>Path to {next.l}</span>
            <span style={{color:C.amber,fontWeight:600}}>{(next.min-total).toFixed(1)} pts needed</span>
          </div>
          <Bar v={total} max={next.min} color={C.amber} h={5}/>
        </div>}
      </div>

      {/* Quick Actions */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
        {[{icon:"🧮",label:"Update Score",page:"calc",color:C.navy},{icon:"🎯",label:"View Gaps",page:"gaps",color:"#7C3AED"},{icon:"📅",label:"Book Verifier",page:"verifiers",color:C.teal},{icon:"📱",label:"Set Alerts",page:"alerts",color:C.green}].map(a=>(
          <Card key={a.label} onClick={()=>setPage(a.page)} p="15px" style={{cursor:"pointer",borderColor:a.color+"30"}} >
            <div style={{width:34,height:34,borderRadius:10,background:a.color+"14",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,marginBottom:9}}>{a.icon}</div>
            <div style={{fontWeight:600,fontSize:13,color:C.ink}}>{a.label}</div>
          </Card>
        ))}
      </div>

      {/* Elements */}
      <div style={{fontFamily:"'Fraunces'",fontSize:20,fontWeight:700,color:C.ink,marginBottom:12}}>Element Breakdown</div>
      {els.map((e,i)=>{
        const pct=e.score/e.max,clr=pct>=.8?C.green:pct>=.5?C.copper:C.red;
        return(
          <Card key={e.id} p="15px 17px" style={{marginBottom:10,animation:`up .4s ease ${i*.06}s both`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                <span style={{color:e.color,fontSize:13}}>{e.icon}</span>
                <span style={{fontWeight:600,fontSize:14}}>{e.label}</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                <Tag label={pct>=.8?"Strong":pct>=.5?"Fair":"Weak"} color={clr}/>
                <span style={{fontWeight:700,fontSize:14,color:clr}}>{e.score.toFixed(1)}<span style={{color:C.slate,fontWeight:400,fontSize:11}}>/{e.max}</span></span>
              </div>
            </div>
            <Bar v={e.score} max={e.max} color={clr}/>
          </Card>
        );
      })}
    </div>
  );
}

/* ─── CALCULATOR ─────────────────────────────────────────── */
function Calculator({vals,setVals,token,user}) {
  const [active,setActive]=useState(0);
  const [saving,setSaving]=useState(false);
  const el=ELEMENTS[active];
  const score=calcEl(el,vals);

  const save=async()=>{
    setSaving(true);
    if(token) await apiFetch("/api/scorecard",{method:"POST",body:{values:vals}},token).catch(()=>{});
    setSaving(false);
  };

  return(
    <div style={{padding:"24px 20px",animation:"up .4s ease"}}>
      <Tag label="Scorecard Engine" color={C.copper}/>
      <h1 style={{fontFamily:"'Fraunces'",fontSize:26,fontWeight:700,color:C.ink,marginTop:8,marginBottom:18,letterSpacing:-.5}}>Calculate Score</h1>

      <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:6,marginBottom:18,scrollbarWidth:"none"}}>
        {ELEMENTS.map((e,i)=>(
          <button key={e.id} onClick={()=>setActive(i)} style={{flexShrink:0,padding:"7px 14px",borderRadius:99,border:`1.5px solid ${i===active?e.color:C.border}`,cursor:"pointer",fontWeight:600,fontSize:13,background:i===active?e.color:"transparent",color:i===active?"#fff":C.slate,transition:"all .2s"}}>
            {e.icon} {e.short}
          </button>
        ))}
      </div>

      <Card p="16px 18px" style={{marginBottom:14,borderColor:el.color+"30"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
          <div>
            <div style={{fontFamily:"'Fraunces'",fontSize:19,fontWeight:700,color:C.ink}}>{el.icon} {el.label}</div>
            <div style={{fontSize:12,color:C.slate,marginTop:1}}>Maximum {el.max} points</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"'Fraunces'",fontSize:28,fontWeight:700,color:score/el.max>=.8?C.green:score/el.max>=.5?C.copper:C.slate}}>{score.toFixed(1)}</div>
            <div style={{fontSize:11,color:C.slate}}>/ {el.max} pts</div>
          </div>
        </div>
        <Bar v={score} max={el.max} color={el.color} h={6}/>
      </Card>

      <Card p="18px">
        {el.fields.map(f=>{
          const v=vals[f.id]||"",pct=Math.min(parseFloat(v||0)/f.max,1);
          return(
            <div key={f.id} style={{marginBottom:20}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                <span style={{fontSize:13,fontWeight:600,color:C.ink}}>{f.label}</span>
                <span style={{fontSize:13,fontWeight:700,color:pct>=.8?C.green:pct>=.4?C.copper:C.slate}}>+{(pct*f.pts).toFixed(1)} pts</span>
              </div>
              <div style={{fontSize:12,color:C.slate,marginBottom:7}}>{f.hint}</div>
              <div style={{display:"flex",alignItems:"center",border:`1.5px solid ${pct>0?el.color:C.border}`,borderRadius:10,background:C.ivory,overflow:"hidden",marginBottom:5}}>
                <input type="number" min="0" max={f.max} value={v} onChange={e=>setVals(p=>({...p,[f.id]:e.target.value}))} placeholder="0"
                  style={{flex:1,padding:"10px 13px",border:"none",background:"transparent",fontSize:15,fontWeight:600,color:C.ink,outline:"none"}}/>
                <span style={{padding:"0 11px",fontSize:12,color:C.slate,borderLeft:`1px solid ${C.border}`}}>max {f.max}</span>
              </div>
              <Bar v={parseFloat(v||0)} max={f.max} color={pct>=.8?C.green:pct>=.4?C.copper:"#DDD"} h={4}/>
            </div>
          );
        })}
      </Card>

      <div style={{display:"flex",gap:10,marginTop:14}}>
        <button onClick={()=>setActive(Math.max(0,active-1))} disabled={active===0} style={{flex:1,padding:"12px",borderRadius:12,border:`1.5px solid ${C.border}`,background:"transparent",color:active===0?C.border:C.navy,fontWeight:600,fontSize:14,cursor:active===0?"default":"pointer"}}>← Prev</button>
        {active===ELEMENTS.length-1
          ?<button onClick={save} style={{flex:1,padding:"12px",borderRadius:12,border:"none",background:C.copper,color:"#fff",fontWeight:600,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
            {saving?<Spinner/>:"💾 Save Score"}
          </button>
          :<button onClick={()=>setActive(active+1)} style={{flex:1,padding:"12px",borderRadius:12,border:"none",background:C.navy,color:"#fff",fontWeight:600,fontSize:14,cursor:"pointer"}}>Next →</button>}
      </div>
    </div>
  );
}

/* ─── GAPS ───────────────────────────────────────────────── */
function Gaps({vals}) {
  const els=ELEMENTS.map(e=>({...e,score:calcEl(e,vals),gap:e.max-calcEl(e,vals)}));
  const total=els.reduce((a,b)=>a+b.score,0);
  const next=[{l:"Level 4",min:80},{l:"Level 3",min:90},{l:"Level 2",min:95},{l:"Level 1",min:100}].find(t=>t.min>total);
  const tips={
    own:"Consider an ESOP or BEE equity transaction. Even 26% black ownership significantly improves this element.",
    mgmt:"Fast-track Black talent into executive roles. Board co-option of Black Non-Executive Directors is the fastest lever.",
    skills:"Enroll Black staff in SETA-accredited learnerships — 1–2% of payroll on targeted training yields material point gains.",
    esd:"Verify all supplier BEE certificates and document them. Deliberately shift procurement — a 30-day target for Black supplier sourcing works well.",
    sed:"Donate 1% of NPAT to an approved NPO. Get a board resolution and proper receipts. Highest-return, lowest-cost action available.",
  };
  return(
    <div style={{padding:"24px 20px",animation:"up .4s ease"}}>
      <Tag label="Improvement Plan" color={C.copper}/>
      <h1 style={{fontFamily:"'Fraunces'",fontSize:26,fontWeight:700,color:C.ink,marginTop:8,marginBottom:18,letterSpacing:-.5}}>Gap Analysis</h1>

      {next?<div style={{background:C.navy,borderRadius:20,padding:"20px",marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:12}}>
          <div><div style={{fontSize:11,color:"#ffffff50",fontWeight:600,textTransform:"uppercase",letterSpacing:.7,marginBottom:4}}>Next Milestone</div>
            <div style={{fontFamily:"'Fraunces'",fontSize:28,fontWeight:700,color:"#fff"}}>{next.l}</div></div>
          <div style={{textAlign:"right"}}><div style={{fontFamily:"'Fraunces'",fontSize:26,fontWeight:700,color:C.amber}}>{(next.min-total).toFixed(1)}</div>
            <div style={{fontSize:11,color:"#ffffff50"}}>points needed</div></div>
        </div>
        <Bar v={total} max={next.min} color={C.amber} h={6}/>
      </div>:<div style={{background:"#14532D",borderRadius:20,padding:"20px",marginBottom:14,textAlign:"center"}}>
        <div style={{fontSize:32}}>🏆</div>
        <div style={{fontFamily:"'Fraunces'",fontSize:24,fontWeight:700,color:"#fff",marginTop:6}}>Level 1 Achieved</div>
      </div>}

      {[...els].sort((a,b)=>b.gap-a.gap).map((e,i)=>{
        const pct=e.score/e.max,clr=pct>=.8?C.green:pct>=.5?C.copper:C.red;
        return(
          <Card key={e.id} p="16px" style={{marginBottom:12,borderLeft:`4px solid ${clr}`,animation:`up .4s ease ${i*.06}s both`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{display:"flex",alignItems:"center",gap:7}}><span style={{color:e.color}}>{e.icon}</span><span style={{fontWeight:700,fontSize:14}}>{e.label}</span></div>
              <Tag label={pct>=.8?"Strong":pct>=.5?"Fair":"Priority"} color={clr}/>
            </div>
            <div style={{display:"flex",gap:14,fontSize:13,marginBottom:9}}>
              <span><span style={{color:C.slate}}>Score: </span><span style={{fontWeight:700,color:clr}}>{e.score.toFixed(1)}/{e.max}</span></span>
              <span><span style={{color:C.slate}}>Gap: </span><span style={{fontWeight:700,color:C.red}}>−{e.gap.toFixed(1)}</span></span>
            </div>
            <Bar v={e.score} max={e.max} color={clr}/>
            {e.gap>0.5&&<div style={{marginTop:11,padding:"10px 12px",background:C.fog,borderRadius:9,fontSize:13,color:C.ink,lineHeight:1.6}}>💡 {tips[e.id]}</div>}
          </Card>
        );
      })}
    </div>
  );
}

/* ─── DOCUMENTS ──────────────────────────────────────────── */
function Docs() {
  const [checked,setChecked]=useState({});
  const cats=[
    {cat:"Ownership",items:["Share register & certificates","ID copies of all shareholders","Shareholder agreement","CIPC CoR documents","Trust deed (if applicable)"]},
    {cat:"Management Control",items:["Organisational chart (race/gender)","Employment contracts (executives)","Payroll records by race & level","Board resolution & minutes"]},
    {cat:"Skills Development",items:["Training schedule & attendance","SETA levy returns (EMP201)","Learnership agreements","Bursary award letters","WSP submission confirmation"]},
    {cat:"ESD",items:["BEE certificates of all suppliers","Supplier payment records","ESD contribution agreements","SLAs with Black-owned suppliers"]},
    {cat:"SED",items:["SED donation receipts","NPO registration documents","Board resolution for SED","Bank proof of transfer"]},
  ];
  const all=cats.flatMap(d=>d.items.map((_,i)=>`${d.cat}${i}`));
  const done=all.filter(k=>checked[k]).length;

  return(
    <div style={{padding:"24px 20px",animation:"up .4s ease"}}>
      <Tag label="Verification Prep" color={C.copper}/>
      <h1 style={{fontFamily:"'Fraunces'",fontSize:26,fontWeight:700,color:C.ink,marginTop:8,marginBottom:6,letterSpacing:-.5}}>Document Vault</h1>
      <p style={{fontSize:14,color:C.slate,marginBottom:18}}>Track every document your SANAS verifier will request.</p>

      <Card p="17px 19px" style={{background:C.navy,border:"none",marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:10}}>
          <div><div style={{fontSize:11,color:"#ffffff50",fontWeight:600,textTransform:"uppercase",marginBottom:3}}>Documents Ready</div>
            <div style={{fontFamily:"'Fraunces'",fontSize:32,fontWeight:700,color:"#fff"}}>{done}<span style={{fontSize:17,color:"#ffffff50",fontWeight:400}}>/{all.length}</span></div>
          </div>
          <div style={{fontSize:13,color:C.amber,fontWeight:700}}>{Math.round(done/all.length*100)}% complete</div>
        </div>
        <Bar v={done} max={all.length} color={C.amber} h={6}/>
      </Card>

      {cats.map(d=>(
        <div key={d.cat} style={{marginBottom:18}}>
          <div style={{fontSize:11,fontWeight:700,color:C.slate,letterSpacing:1,textTransform:"uppercase",marginBottom:9,paddingBottom:7,borderBottom:`2px solid ${C.fog}`}}>{d.cat}</div>
          <Card p="0" style={{overflow:"hidden"}}>
            {d.items.map((item,i)=>{
              const k=`${d.cat}${i}`;
              return(
                <div key={k} onClick={()=>setChecked(c=>({...c,[k]:!c[k]}))} style={{display:"flex",alignItems:"center",gap:13,padding:"13px 17px",cursor:"pointer",borderBottom:i<d.items.length-1?`1px solid ${C.border}`:"none",background:checked[k]?C.fog:"transparent",transition:"background .15s"}}>
                  <div style={{width:21,height:21,borderRadius:6,flexShrink:0,background:checked[k]?C.copper:C.white,border:`2px solid ${checked[k]?C.copper:C.border}`,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}>
                    {checked[k]&&<span style={{color:"#fff",fontSize:11,fontWeight:700}}>✓</span>}
                  </div>
                  <span style={{fontSize:14,color:checked[k]?C.slate:C.ink,textDecoration:checked[k]?"line-through":"none",transition:"all .2s"}}>{item}</span>
                </div>
              );
            })}
          </Card>
        </div>
      ))}
    </div>
  );
}

/* ─── AI ADVISOR ─────────────────────────────────────────── */
function Advisor({vals,user,token}) {
  const els=ELEMENTS.map(e=>({label:e.label,score:calcEl(e,vals).toFixed(1),max:e.max}));
  const total=els.reduce((a,b)=>a+parseFloat(b.score),0);
  const bee=getLevel(total);
  const [msgs,setMsgs]=useState([{role:"assistant",text:`Hello ${user.name?.split(" ")[0]||"there"}! I'm your BEE Advisor, trained on the DTI Codes of Good Practice.\n\nYour current score is ${total.toFixed(1)}/109 (${bee.label}). What would you like to know?`}]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const ref=useRef(null);

  const send=async()=>{
    if(!input.trim()||loading)return;
    const um={role:"user",text:input};
    const nm=[...msgs,um];
    setMsgs(nm);setInput("");setLoading(true);
    try{
      if(token){
        const d=await apiFetch("/api/advisor",{method:"POST",body:{messages:nm.map(m=>({role:m.role,content:m.text})),values:vals,company:user.company}},token);
        setMsgs(m=>[...m,{role:"assistant",text:d.reply||"Sorry, try again."}]);
      } else {
        // Demo mode — call Anthropic directly via fetch
        const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:600,system:`You are a South African BEE compliance advisor. Company: ${user.company}, Score: ${total.toFixed(1)}/109 (${bee.label}). Give brief, practical advice.`,messages:nm.map(m=>({role:m.role,content:m.text}))})});
        const d=await r.json();
        setMsgs(m=>[...m,{role:"assistant",text:d.content?.[0]?.text||"Sorry, try again."}]);
      }
    }catch{setMsgs(m=>[...m,{role:"assistant",text:"Connection error. Please try again."}]);}
    setLoading(false);
  };
  useEffect(()=>ref.current?.scrollIntoView({behavior:"smooth"}),[msgs,loading]);

  return(
    <div style={{height:"calc(100vh - 116px)",display:"flex",flexDirection:"column"}}>
      <div style={{padding:"18px 20px 10px",flexShrink:0}}>
        <Tag label="AI-Powered" color={C.copper}/>
        <h1 style={{fontFamily:"'Fraunces'",fontSize:23,fontWeight:700,color:C.ink,marginTop:6,marginBottom:10,letterSpacing:-.5}}>BEE Advisor</h1>
        <div style={{display:"flex",gap:7,overflowX:"auto",paddingBottom:4,scrollbarWidth:"none"}}>
          {["How do I reach Level 2?","Cheapest Skills Dev win?","What is an EME/QSE?","Explain ESD scoring"].map(q=>(
            <button key={q} onClick={()=>setInput(q)} style={{flexShrink:0,padding:"6px 12px",borderRadius:99,border:`1px solid ${C.border}`,background:C.white,color:C.ink,fontSize:12,fontWeight:500,cursor:"pointer",whiteSpace:"nowrap"}}>{q}</button>
          ))}
        </div>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"8px 20px",display:"flex",flexDirection:"column",gap:11}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{alignSelf:m.role==="user"?"flex-end":"flex-start",maxWidth:"86%",background:m.role==="user"?C.navy:C.white,color:m.role==="user"?"#fff":C.ink,borderRadius:m.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px",padding:"12px 15px",fontSize:14,lineHeight:1.65,border:m.role==="assistant"?`1px solid ${C.border}`:"none",animation:"up .3s ease",whiteSpace:"pre-wrap"}}>
            {m.role==="assistant"&&<div style={{fontSize:10,fontWeight:700,color:C.copper,letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>⬡ BEE ADVISOR</div>}
            {m.text}
          </div>
        ))}
        {loading&&<div style={{alignSelf:"flex-start",background:C.white,borderRadius:"18px 18px 18px 4px",padding:"13px 17px",border:`1px solid ${C.border}`,display:"flex",gap:5}}>
          {[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:C.copper,animation:`dot 1.2s ease ${i*.25}s infinite`}}/>)}
        </div>}
        <div ref={ref}/>
      </div>

      <div style={{padding:"10px 15px",background:C.white,borderTop:`1px solid ${C.border}`,display:"flex",gap:9,flexShrink:0}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask about your BEE score…"
          style={{flex:1,padding:"11px 14px",border:`1.5px solid ${C.border}`,borderRadius:12,fontSize:14,outline:"none",background:C.ivory}}/>
        <button onClick={send} disabled={loading||!input.trim()} style={{width:43,height:43,borderRadius:11,border:"none",flexShrink:0,background:input.trim()&&!loading?C.navy:"#E5E7EB",color:"#fff",fontSize:17,cursor:input.trim()&&!loading?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center"}}>
          {loading?<Spinner size={16}/>:"↑"}
        </button>
      </div>
    </div>
  );
}

/* ─── REPORTS ────────────────────────────────────────────── */
function Reports({vals,user,token}) {
  const [loading,setLoading]=useState(false);
  const els=ELEMENTS.map(e=>({...e,score:calcEl(e,vals)}));
  const total=els.reduce((a,b)=>a+b.score,0);
  const bee=getLevel(total);

  const download=async()=>{
    setLoading(true);
    try{
      if(token){
        const res=await fetch(`${API}/api/reports/generate`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`}});
        const blob=await res.blob();
        const url=URL.createObjectURL(blob);
        const a=document.createElement("a");
        a.href=url;a.download=`${user.company}_BEE_Report.pdf`;a.click();
        URL.revokeObjectURL(url);
      } else alert("Sign in to download PDF reports.");
    }catch(e){alert("PDF generation failed: "+e.message);}
    setLoading(false);
  };

  return(
    <div style={{padding:"24px 20px",animation:"up .4s ease"}}>
      <Tag label="PDF Export" color={C.copper}/>
      <h1 style={{fontFamily:"'Fraunces'",fontSize:26,fontWeight:700,color:C.ink,marginTop:8,marginBottom:18,letterSpacing:-.5}}>Scorecard Report</h1>

      <Card p="0" style={{marginBottom:18,overflow:"hidden",border:`1.5px solid ${C.border}`}}>
        <div style={{background:C.navy,padding:"18px 20px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><div style={{fontFamily:"'Fraunces'",fontSize:16,fontWeight:700,color:"#fff"}}>B-BBEE Scorecard</div><div style={{fontSize:12,color:"#ffffff60",marginTop:2}}>{user.company}</div></div>
            <div style={{textAlign:"right"}}><div style={{fontFamily:"'Fraunces'",fontSize:20,fontWeight:700,color:C.amber}}>{bee.label}</div><div style={{fontSize:11,color:"#ffffff50"}}>{new Date().toLocaleDateString("en-ZA")}</div></div>
          </div>
        </div>
        <div style={{padding:"16px"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
            <div style={{padding:"12px",background:C.fog,borderRadius:10}}><div style={{fontSize:10,color:C.slate,fontWeight:600,textTransform:"uppercase"}}>Total Score</div><div style={{fontFamily:"'Fraunces'",fontSize:24,fontWeight:700,color:C.ink,marginTop:3}}>{total.toFixed(1)}<span style={{fontSize:13,color:C.slate}}>/109</span></div></div>
            <div style={{padding:"12px",background:C.fog,borderRadius:10}}><div style={{fontSize:10,color:C.slate,fontWeight:600,textTransform:"uppercase"}}>Recognition</div><div style={{fontFamily:"'Fraunces'",fontSize:24,fontWeight:700,color:bee.clr,marginTop:3}}>{bee.rec}</div></div>
          </div>
          {els.map(e=><div key={e.id} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${C.border}`,fontSize:13}}><span style={{color:C.slate}}>{e.label}</span><span style={{fontWeight:700}}>{e.score.toFixed(1)}/{e.max}</span></div>)}
        </div>
      </Card>

      <button onClick={download} disabled={loading} style={{width:"100%",padding:"14px",borderRadius:13,border:"none",background:loading?"#E5E7EB":C.navy,color:loading?C.slate:"#fff",fontWeight:700,fontSize:15,cursor:loading?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
        {loading?<><Spinner color={C.slate}/> Generating…</>:"⬇ Download PDF Report"}
      </button>
    </div>
  );
}

/* ─── VERIFIERS ──────────────────────────────────────────── */
function Verifiers({vals,user,token}) {
  const [sel,setSel]=useState(null);
  const [date,setDate]=useState("");
  const [time,setTime]=useState("");
  const [booked,setBooked]=useState(false);
  const [loading,setLoading]=useState(false);

  const firms=[
    {id:1,name:"EmpowerLogic",loc:"Johannesburg",stars:"4.9",fee:"R3,200",days:"5 days",badge:"Top Rated",color:C.green},
    {id:2,name:"Nkosi Verify",loc:"Cape Town",   stars:"4.8",fee:"R2,800",days:"7 days",badge:"Fastest",  color:C.teal},
    {id:3,name:"Ubuntu Rating",loc:"Durban",      stars:"4.7",fee:"R2,400",days:"10 days",badge:"Best Value",color:C.copper},
  ];

  const confirm=async()=>{
    setLoading(true);
    const firm=firms.find(f=>f.id===sel);
    if(token) await apiFetch("/api/bookings",{method:"POST",body:{verifierId:sel,verifierName:firm.name,date,time}},token).catch(()=>{});
    setBooked(true);setLoading(false);
  };

  if(booked)return(
    <div style={{padding:"24px 20px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"60vh",textAlign:"center",animation:"up .4s ease"}}>
      <div style={{fontSize:52,marginBottom:14}}>🎉</div>
      <h2 style={{fontFamily:"'Fraunces'",fontSize:24,fontWeight:700,color:C.ink,marginBottom:8}}>Booking Confirmed!</h2>
      <p style={{fontSize:14,color:C.slate,lineHeight:1.7,marginBottom:22,maxWidth:300}}>Your verification with <strong>{firms.find(f=>f.id===sel)?.name}</strong> is scheduled for <strong>{date}</strong> at <strong>{time}</strong>.</p>
      <button onClick={()=>{setBooked(false);setSel(null);setDate("");setTime("");}} style={{padding:"12px 24px",borderRadius:12,border:"none",background:C.navy,color:"#fff",fontWeight:600,fontSize:14,cursor:"pointer"}}>Back to Verifiers</button>
    </div>
  );

  return(
    <div style={{padding:"24px 20px",animation:"up .4s ease"}}>
      <Tag label="SANAS Accredited" color={C.copper}/>
      <h1 style={{fontFamily:"'Fraunces'",fontSize:26,fontWeight:700,color:C.ink,marginTop:8,marginBottom:6,letterSpacing:-.5}}>Book a Verifier</h1>
      <p style={{fontSize:14,color:C.slate,marginBottom:20}}>All agencies SANAS-accredited and DTI-approved.</p>
      {firms.map(f=>(
        <Card key={f.id} p="17px" style={{marginBottom:12,cursor:"pointer",borderColor:sel===f.id?f.color:C.border,borderWidth:sel===f.id?2:1,transition:"all .2s"}} onClick={()=>setSel(sel===f.id?null:f.id)}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:9}}>
            <div><div style={{fontWeight:700,fontSize:15,color:C.ink}}>{f.name}</div><div style={{fontSize:13,color:C.slate,marginTop:2}}>📍 {f.loc}</div></div>
            <Tag label={f.badge} color={f.color}/>
          </div>
          <div style={{display:"flex",gap:14,fontSize:13,marginBottom:sel===f.id?14:0}}>
            <span>⭐ {f.stars}</span><span style={{color:C.copper,fontWeight:700}}>{f.fee}</span><span style={{color:C.slate}}>⏱ {f.days}</span>
          </div>
          {sel===f.id&&<div style={{animation:"up .3s ease",paddingTop:14,borderTop:`1px solid ${C.border}`}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              {[["Date","date","date",setDate,date],["Time","time","select",setTime,time]].map(([lbl,k,type,setter,val])=>(
                <div key={k}>
                  <div style={{fontSize:11,fontWeight:600,color:C.slate,marginBottom:5,textTransform:"uppercase",letterSpacing:.5}}>{lbl}</div>
                  {type==="select"?
                    <select value={val} onChange={e=>setter(e.target.value)} style={{width:"100%",padding:"10px 11px",border:`1.5px solid ${C.border}`,borderRadius:10,fontSize:14,outline:"none",background:C.ivory}}>
                      <option value="">Select…</option>
                      {["09:00","10:00","11:00","14:00","15:00","16:00"].map(t=><option key={t}>{t}</option>)}
                    </select>:
                    <input type="date" value={val} onChange={e=>setter(e.target.value)} style={{width:"100%",padding:"10px 11px",border:`1.5px solid ${C.border}`,borderRadius:10,fontSize:14,outline:"none",background:C.ivory}}/>
                  }
                </div>
              ))}
            </div>
            <button onClick={confirm} disabled={!date||!time||loading} style={{width:"100%",padding:"12px",borderRadius:11,border:"none",background:!date||!time?"#E5E7EB":C.copper,color:!date||!time?C.slate:"#fff",fontWeight:600,fontSize:14,cursor:!date||!time?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              {loading?<Spinner/>:"Confirm Booking"}
            </button>
          </div>}
        </Card>
      ))}
    </div>
  );
}

/* ─── ALERTS ─────────────────────────────────────────────── */
function Alerts({token}) {
  const [phone,setPhone]=useState("");
  const [prefs,setPrefs]=useState({expiry:true,monthly:true,docs:false,tips:true});
  const [saved,setSaved]=useState(false);
  const [loading,setLoading]=useState(false);

  const save=async()=>{
    setLoading(true);
    if(token) await apiFetch("/api/alerts/subscribe",{method:"POST",body:{phone,preferences:prefs}},token).catch(()=>{});
    setSaved(true);setLoading(false);
  };

  return(
    <div style={{padding:"24px 20px",animation:"up .4s ease"}}>
      <Tag label="WhatsApp Automation" color="#25D366"/>
      <h1 style={{fontFamily:"'Fraunces'",fontSize:26,fontWeight:700,color:C.ink,marginTop:8,marginBottom:6,letterSpacing:-.5}}>Smart Alerts</h1>
      <p style={{fontSize:14,color:C.slate,marginBottom:20}}>Get BEE compliance reminders directly on WhatsApp.</p>

      <Card p="17px" style={{background:C.navy,border:"none",marginBottom:20}}>
        <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:14}}>
          <div style={{width:40,height:40,borderRadius:"50%",background:"#25D36620",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🟢</div>
          <div><div style={{fontWeight:700,color:"#fff",fontSize:14}}>BEEcompass Alerts</div><div style={{fontSize:11,color:"#ffffff50"}}>WhatsApp · End-to-end encrypted</div></div>
        </div>
        {["⚠️ Certificate expires in 30 days. Book a verifier now to protect your tenders.","📊 Monthly: Score 78.5/109 (Level 4). ESD improved by 2.3 pts this month!"].map((m,i)=>(
          <div key={i} style={{background:"#ffffff12",borderRadius:"12px 12px 12px 3px",padding:"9px 13px",marginBottom:8,fontSize:13,color:"#fff",lineHeight:1.5}}>{m}</div>
        ))}
      </Card>

      <div style={{marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:600,color:C.slate,letterSpacing:.5,textTransform:"uppercase",marginBottom:6}}>WhatsApp Number</div>
        <div style={{display:"flex",alignItems:"center",border:`1.5px solid ${C.border}`,borderRadius:10,background:C.ivory,overflow:"hidden"}}>
          <span style={{padding:"0 12px",color:C.slate,fontSize:13,borderRight:`1px solid ${C.border}`,lineHeight:"44px"}}>🇿🇦 +27</span>
          <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="82 123 4567"
            style={{flex:1,padding:"11px 13px",border:"none",background:"transparent",fontSize:15,outline:"none"}}/>
        </div>
      </div>

      {[{k:"expiry",icon:"📋",label:"Certificate Expiry",desc:"30 & 7 days before expiry"},{k:"monthly",icon:"📊",label:"Monthly Score Report",desc:"Your scorecard summary"},{k:"docs",icon:"📁",label:"Document Reminders",desc:"Pending document nudges"},{k:"tips",icon:"💡",label:"Weekly Quick Wins",desc:"Tips to improve your score"}].map(a=>(
        <Card key={a.k} p="13px 15px" style={{marginBottom:9}}>
          <div style={{display:"flex",alignItems:"center",gap:11}}>
            <span style={{fontSize:17,flexShrink:0}}>{a.icon}</span>
            <div style={{flex:1}}><div style={{fontWeight:600,fontSize:14}}>{a.label}</div><div style={{fontSize:12,color:C.slate,marginTop:1}}>{a.desc}</div></div>
            <Toggle on={prefs[a.k]} onClick={()=>setPrefs(p=>({...p,[a.k]:!p[a.k]}))}/>
          </div>
        </Card>
      ))}

      {!saved
        ?<button onClick={save} disabled={!phone||loading} style={{width:"100%",padding:"13px",marginTop:14,borderRadius:13,border:"none",background:!phone?"#E5E7EB":"#25D366",color:!phone?C.slate:"#fff",fontWeight:700,fontSize:15,cursor:!phone?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          {loading?<Spinner/>:"📱 Activate WhatsApp Alerts"}
        </button>
        :<div style={{marginTop:14,padding:"15px",background:"#F0FDF4",border:`1px solid ${C.green}30`,borderRadius:13,textAlign:"center"}}>
          <div style={{fontSize:20,marginBottom:4}}>✅</div>
          <div style={{fontWeight:700,color:C.green}}>Alerts Active!</div>
          <div style={{fontSize:13,color:C.slate,marginTop:3}}>Verification sent to +27 {phone}</div>
        </div>}
    </div>
  );
}

/* ─── PRICING ────────────────────────────────────────────── */
function Pricing({token}) {
  const [billing,setBilling]=useState("monthly");
  const [sel,setSel]=useState("pro");
  const plans=[
    {id:"starter",name:"Starter",mo:149,yr:99,desc:"Sole proprietors & micro businesses",features:["BEE score calculator","Gap analysis","Document checklist","PDF export (5/month)","Email support"]},
    {id:"pro",name:"Pro",mo:299,yr:199,desc:"Growing SMEs",featured:true,features:["Everything in Starter","Unlimited AI Advisor","Verifier booking","WhatsApp alerts","Priority support"]},
    {id:"enterprise",name:"Enterprise",mo:799,yr:549,desc:"Multi-entity companies & consultants",features:["Everything in Pro","Multi-company management","White-label PDF reports","API access","Dedicated account manager"]},
  ];
  const checkout=async(plan)=>{
    if(!token){alert("Please sign in to subscribe.");return;}
    const d=await apiFetch("/api/billing/checkout",{method:"POST",body:{plan,billing}},token);
    if(d.url) window.location.href=d.url;
  };
  return(
    <div style={{padding:"24px 20px",animation:"up .4s ease"}}>
      <Tag label="Subscription" color={C.copper}/>
      <h1 style={{fontFamily:"'Fraunces'",fontSize:26,fontWeight:700,color:C.ink,marginTop:8,marginBottom:6,letterSpacing:-.5}}>Choose Plan</h1>
      <p style={{fontSize:14,color:C.slate,marginBottom:18}}>14-day free trial on all plans. Cancel anytime.</p>
      <div style={{display:"flex",background:C.fog,borderRadius:11,padding:3,marginBottom:20}}>
        {["monthly","annual"].map(b=>(
          <button key={b} onClick={()=>setBilling(b)} style={{flex:1,padding:"9px",borderRadius:9,border:"none",cursor:"pointer",fontWeight:600,fontSize:13,background:b===billing?C.white:"transparent",color:b===billing?C.ink:C.slate,transition:"all .2s"}}>
            {b==="monthly"?"Monthly":"Annual"}{b==="annual"&&<span style={{marginLeft:5,fontSize:11,background:C.copper+"20",color:C.copper,padding:"1px 6px",borderRadius:99}}>−33%</span>}
          </button>
        ))}
      </div>
      {plans.map((p,i)=>(
        <Card key={p.id} p="18px" onClick={()=>setSel(p.id)} style={{marginBottom:12,cursor:"pointer",borderColor:sel===p.id?C.copper:C.border,borderWidth:sel===p.id?2:1,background:p.featured&&sel===p.id?C.navy:C.white,transition:"all .25s",animation:`up .4s ease ${i*.08}s both`}}>
          {p.featured&&<div style={{marginBottom:9}}><Tag label="Most Popular" color={sel===p.id?"#fff":C.copper}/></div>}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
            <div><div style={{fontFamily:"'Fraunces'",fontSize:21,fontWeight:700,color:p.featured&&sel===p.id?"#fff":C.ink}}>{p.name}</div><div style={{fontSize:12,color:p.featured&&sel===p.id?"#ffffff60":C.slate,marginTop:2}}>{p.desc}</div></div>
            <div style={{textAlign:"right"}}><div style={{fontFamily:"'Fraunces'",fontSize:26,fontWeight:700,color:p.featured&&sel===p.id?C.amber:C.copper}}>R{billing==="monthly"?p.mo:p.yr}</div><div style={{fontSize:11,color:p.featured&&sel===p.id?"#ffffff50":C.slate}}>/month</div></div>
          </div>
          <div style={{height:1,background:p.featured&&sel===p.id?"#ffffff15":C.border,margin:"11px 0"}}/>
          {p.features.map(f=><div key={f} style={{display:"flex",gap:8,marginBottom:7,fontSize:13,color:p.featured&&sel===p.id?"#ffffffCC":C.ink}}><span style={{color:p.featured&&sel===p.id?C.amber:C.copper,fontWeight:700,fontSize:12}}>✓</span>{f}</div>)}
        </Card>
      ))}
      <button onClick={()=>checkout(sel)} style={{width:"100%",padding:"14px",borderRadius:13,border:"none",background:C.copper,color:"#fff",fontWeight:700,fontSize:15,cursor:"pointer",marginTop:4,boxShadow:`0 6px 24px ${C.copper}35`}}>
        Start 14-Day Free Trial →
      </button>
      <div style={{textAlign:"center",fontSize:12,color:C.slate,marginTop:10}}>No credit card required · Cancel anytime</div>
    </div>
  );
}

/* ─── MORE ───────────────────────────────────────────────── */
function More({setPage,user,onLogout}) {
  return(
    <div style={{padding:"24px 20px",animation:"up .4s ease"}}>
      <h1 style={{fontFamily:"'Fraunces'",fontSize:26,fontWeight:700,color:C.ink,marginBottom:20,letterSpacing:-.5}}>Menu</h1>
      <Card p="15px 17px" style={{marginBottom:18}}>
        <div style={{display:"flex",alignItems:"center",gap:13}}>
          <div style={{width:44,height:44,borderRadius:"50%",background:C.navy,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Fraunces'",fontSize:19,fontWeight:700,color:"#fff",flexShrink:0}}>{(user.name||"U")[0]}</div>
          <div style={{flex:1}}><div style={{fontWeight:700,fontSize:15}}>{user.name}</div><div style={{fontSize:13,color:C.slate}}>{user.company}</div></div>
          <Tag label="Pro Trial" color={C.copper}/>
        </div>
      </Card>

      <Card p="0" style={{overflow:"hidden",marginBottom:14}}>
        {[{icon:"🤖",label:"AI Advisor",sub:"Expert BEE guidance",page:"advisor"},{icon:"📄",label:"PDF Reports",sub:"Download scorecard",page:"reports"},{icon:"📅",label:"Book Verifier",sub:"SANAS-accredited agencies",page:"verifiers"},{icon:"📱",label:"WhatsApp Alerts",sub:"Deadline reminders",page:"alerts"},{icon:"💳",label:"Pricing & Plans",sub:"Upgrade your account",page:"pricing"}].map((item,i,arr)=>(
          <div key={item.page} onClick={()=>setPage(item.page)} style={{display:"flex",alignItems:"center",gap:13,padding:"14px 17px",cursor:"pointer",borderBottom:i<arr.length-1?`1px solid ${C.border}`:"none",transition:"background .12s"}}>
            <div style={{width:36,height:36,borderRadius:10,background:C.fog,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{item.icon}</div>
            <div style={{flex:1}}><div style={{fontWeight:600,fontSize:14}}>{item.label}</div><div style={{fontSize:12,color:C.slate,marginTop:1}}>{item.sub}</div></div>
            <span style={{color:C.border,fontSize:20}}>›</span>
          </div>
        ))}
      </Card>

      <button onClick={onLogout} style={{width:"100%",padding:"13px",borderRadius:12,border:`1px solid ${C.border}`,background:C.white,cursor:"pointer",fontWeight:600,fontSize:14,color:C.red}}>Sign Out</button>
      <div style={{textAlign:"center",fontSize:11,color:C.border,marginTop:14}}>BEEcompass v1.0 · Made in 🇿🇦 South Africa · POPIA Compliant</div>
    </div>
  );
}

/* ─── ROOT APP ───────────────────────────────────────────── */
const NAV=[{id:"dashboard",label:"Home",icon:"⊞"},{id:"calc",label:"Score",icon:"◎"},{id:"gaps",label:"Gaps",icon:"◈"},{id:"docs",label:"Docs",icon:"◇"},{id:"more",label:"More",icon:"···"}];
const MAIN_PAGES=NAV.map(n=>n.id);

export default function App() {
  const [session,setSession]=useState(null);
  const [user,setUser]=useState(null);
  const [authed,setAuthed]=useState(false);
  const [page,setPage]=useState("dashboard");
  const [vals,setVals]=useState(DEFAULTS);

  // Restore Supabase session on load
  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{
      if(session){
        setSession(session);
        apiFetch("/api/profile",{},session.access_token).then(p=>{
          if(p&&!p.error){setUser(p);setAuthed(true);}
        }).catch(()=>{});
      }
    });
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_,session)=>{
      setSession(session);
      if(!session){setAuthed(false);setUser(null);}
    });
    return ()=>subscription.unsubscribe();
  },[]);

  const handleAuth=(sess,profile)=>{
    setSession(sess);
    setUser(profile||{name:"Demo User",company:"Demo Company SA"});
    setAuthed(true);
    if(sess&&profile?.scorecard){
      setVals({...DEFAULTS,...profile.scorecard});
    }
  };

  const handleLogout=async()=>{
    await supabase.auth.signOut();
    setAuthed(false);setSession(null);setUser(null);setPage("dashboard");setVals(DEFAULTS);
  };

  if(!authed) return <><style>{CSS}</style><Auth onAuth={handleAuth}/></>;

  const token=session?.access_token||null;
  const isMain=MAIN_PAGES.includes(page);

  return(
    <div style={{maxWidth:480,margin:"0 auto",minHeight:"100vh",background:C.ivory,position:"relative"}}>
      <style>{CSS}</style>

      {/* Top Bar */}
      <div style={{position:"sticky",top:0,zIndex:100,background:C.ivory+"F0",backdropFilter:"blur(12px)",borderBottom:`1px solid ${C.border}`,padding:"13px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {!isMain&&<button onClick={()=>setPage("more")} style={{border:"none",background:"none",cursor:"pointer",fontSize:20,color:C.slate,marginRight:4}}>‹</button>}
          <Logo/>
        </div>
        {(()=>{const t=ELEMENTS.reduce((s,e)=>s+calcEl(e,vals),0);const b=getLevel(t);return <Tag label={b.label} color={b.clr}/>;})()}
      </div>

      {/* Pages */}
      <div style={{paddingBottom:88}}>
        {page==="dashboard" &&<Dashboard vals={vals} user={user} setPage={setPage} token={token}/>}
        {page==="calc"      &&<Calculator vals={vals} setVals={setVals} token={token} user={user}/>}
        {page==="gaps"      &&<Gaps vals={vals}/>}
        {page==="docs"      &&<Docs/>}
        {page==="advisor"   &&<Advisor vals={vals} user={user} token={token}/>}
        {page==="reports"   &&<Reports vals={vals} user={user} token={token}/>}
        {page==="verifiers" &&<Verifiers vals={vals} user={user} token={token}/>}
        {page==="alerts"    &&<Alerts token={token}/>}
        {page==="pricing"   &&<Pricing token={token}/>}
        {page==="more"      &&<More setPage={setPage} user={user} onLogout={handleLogout}/>}
      </div>

      {/* Bottom Nav */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:C.white,borderTop:`1px solid ${C.border}`,display:"flex",boxShadow:"0 -4px 20px #0000000A",paddingBottom:2}}>
        {NAV.map(n=>{
          const active=n.id===page||(n.id==="more"&&!MAIN_PAGES.slice(0,-1).includes(page)&&!MAIN_PAGES.includes(page));
          return(
            <button key={n.id} onClick={()=>setPage(n.id)} style={{flex:1,padding:"10px 4px 6px",border:"none",background:"transparent",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
              <span style={{fontSize:16,color:active?C.copper:C.border,transition:"color .2s"}}>{n.icon}</span>
              <span style={{fontSize:10,fontWeight:active?700:400,color:active?C.navy:C.slate,letterSpacing:.3}}>{n.label}</span>
              {active&&<div style={{width:16,height:2.5,background:C.copper,borderRadius:99}}/>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
