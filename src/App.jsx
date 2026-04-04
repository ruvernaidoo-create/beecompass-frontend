import { useState, useEffect, useRef, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";

/* ── Supabase ─────────────────────────────────────────────── */
const sb = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
const API = import.meta.env.VITE_API_URL || "http://localhost:8080";

const apiFetch = async (path, opts={}, token=null) => {
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: { "Content-Type":"application/json", ...(token?{Authorization:`Bearer ${token}`}:{}), ...(opts.headers||{}) },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if(opts.raw) return res;
  return res.json();
};

/* ── DESIGN ───────────────────────────────────────────────── */
const C = {
  bg:"#F8FAFC", white:"#FFFFFF", border:"#E2E8F0",
  ink:"#0F172A", mid:"#475569", muted:"#94A3B8",
  s100:"#F1F5F9", s200:"#E2E8F0", s500:"#64748B", s700:"#334155", s900:"#0F172A",
  amber:"#F59E0B", amberBg:"#FFFBEB", amberBdr:"#FDE68A", amberTxt:"#92400E",
  green:"#15803D", greenBg:"#F0FDF4", red:"#B91C1C", redBg:"#FEF2F2",
  copper:"#C4692A", copperLt:"#D4834A",
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'DM Sans',sans-serif;background:${C.bg};color:${C.ink};-webkit-font-smoothing:antialiased;}
input,button,select,textarea{font-family:'DM Sans',sans-serif;}
::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px;}
@keyframes up{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
@keyframes in{from{opacity:0}to{opacity:1}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes dot{0%,100%{opacity:.25;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}
@keyframes pulse{0%,100%{opacity:.7}50%{opacity:1}}
input[type=range]{-webkit-appearance:none;width:100%;height:4px;border-radius:99px;background:${C.s200};outline:none;}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:${C.ink};cursor:pointer;border:2px solid white;box-shadow:0 1px 4px #0002;}
.serif{font-family:'Instrument Serif',serif;}
`;

/* ── PRIMITIVES ───────────────────────────────────────────── */
const Card=({ch,p="20px",style:s={}})=>(<div style={{background:C.white,borderRadius:20,border:`1px solid ${C.border}`,boxShadow:"0 1px 8px #0F172A06",padding:p,...s}}>{ch}</div>);
const Spin=({size=16,color="#fff"})=>(<div style={{width:size,height:size,border:`2.5px solid ${color}`,borderTopColor:"transparent",borderRadius:"50%",animation:"spin 1s linear infinite"}}/>);
const Tag=({label,color=C.mid,bg=C.s100})=>(<span style={{fontSize:11,fontWeight:600,letterSpacing:.5,padding:"3px 10px",borderRadius:99,background:bg,color,border:`1px solid ${color}20`,whiteSpace:"nowrap"}}>{label}</span>);
const Bar=({v,max,color=C.ink,h=5})=>(<div style={{height:h,background:C.s200,borderRadius:99,overflow:"hidden"}}><div style={{width:`${Math.min(v/max,1)*100}%`,height:"100%",background:color,borderRadius:99,transition:"width 1s ease"}}/></div>);

const Btn=({ch,onClick,variant="solid",disabled,full,style:s={}})=>{
  const vs={
    solid:{background:C.ink,color:"#fff",border:"none"},
    copper:{background:C.copper,color:"#fff",border:"none"},
    outline:{background:"transparent",color:C.ink,border:`1.5px solid ${C.border}`},
    ghost:{background:"transparent",color:C.mid,border:"none"},
    danger:{background:"transparent",color:C.red,border:`1.5px solid ${C.red}30`},
  };
  return(<button onClick={disabled?undefined:onClick} style={{padding:"11px 22px",borderRadius:12,fontWeight:600,fontSize:14,cursor:disabled?"not-allowed":"pointer",opacity:disabled?.45:1,width:full?"100%":undefined,display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6,transition:"opacity .15s",...vs[variant],...s}}>{ch}</button>);
};

const Input=({label,value,onChange,placeholder,type="text",hint})=>(<div style={{marginBottom:14}}>
  {label&&<div style={{fontSize:12,fontWeight:600,color:C.muted,letterSpacing:.5,textTransform:"uppercase",marginBottom:5}}>{label}</div>}
  {hint&&<div style={{fontSize:12,color:C.muted,marginBottom:5}}>{hint}</div>}
  <input type={type} value={value} onChange={e=>onChange(type==="number"?Number(e.target.value):e.target.value)} placeholder={placeholder}
    style={{width:"100%",padding:"11px 14px",border:`1.5px solid ${C.border}`,borderRadius:10,fontSize:14,color:C.ink,background:C.bg,outline:"none"}}/>
</div>);

const Disclaimer=()=>(<div style={{borderRadius:14,border:`1px solid ${C.amberBdr}`,background:C.amberBg,padding:"14px 16px",display:"flex",gap:10}}>
  <span style={{color:C.amber,fontSize:15,flexShrink:0}}>⚠</span>
  <p style={{fontSize:13,lineHeight:1.65,color:C.amberTxt}}>BEEcompass provides pre-readiness estimates only. This is NOT an official B-BBEE verification outcome and carries no legal weight. Only a SANAS-accredited verification agency may issue an official B-BBEE certificate. Always consult a qualified BEE practitioner for formal compliance advice.</p>
</div>);

/* ── BEE ENGINE ───────────────────────────────────────────── */
const PILLARS=[
  {key:"own",    label:"Ownership",                    max:25, color:"#7C3AED"},
  {key:"mgmt",   label:"Management Control",           max:19, color:C.ink},
  {key:"skills", label:"Skills Development",           max:20, color:C.green},
  {key:"esd",    label:"Enterprise & Supplier Dev",    max:40, color:C.copper},
  {key:"sed",    label:"Socio-Economic Dev",            max:5,  color:C.red},
];
const ELEMENTS=[
  {id:"own",max:25,fields:[{id:"blackOwn",max:100,pts:20},{id:"blackWomen",max:100,pts:5}]},
  {id:"mgmt",max:19,fields:[{id:"board",max:100,pts:5},{id:"exec",max:100,pts:5},{id:"senior",max:100,pts:5},{id:"middle",max:100,pts:4}]},
  {id:"skills",max:20,fields:[{id:"trainPct",max:6,pts:8},{id:"learners",max:5,pts:7},{id:"bursaries",max:20,pts:5}]},
  {id:"esd",max:40,fields:[{id:"beeProc",max:100,pts:15},{id:"blackSpend",max:100,pts:12},{id:"supDev",max:3,pts:10},{id:"entDev",max:3,pts:5}]},
  {id:"sed",max:5,fields:[{id:"sedPct",max:1,pts:5}]},
];
const calcEl=(el,v)=>Math.min(el.fields.reduce((s,f)=>s+(Math.min(parseFloat(v[f.id]||0),f.max)/f.max)*f.pts,0),el.max);
const getLevel=s=>{
  if(s>=100)return{n:1,label:"Level 1",rec:"135%",clr:C.green};
  if(s>=95) return{n:2,label:"Level 2",rec:"125%",clr:"#1A9E50"};
  if(s>=90) return{n:3,label:"Level 3",rec:"110%",clr:"#22C55E"};
  if(s>=80) return{n:4,label:"Level 4",rec:"100%",clr:C.amber};
  if(s>=75) return{n:5,label:"Level 5",rec:"80%", clr:C.copper};
  if(s>=70) return{n:6,label:"Level 6",rec:"60%", clr:"#B45309"};
  if(s>=55) return{n:7,label:"Level 7",rec:"50%", clr:"#92400E"};
  if(s>=40) return{n:8,label:"Level 8",rec:"10%", clr:C.red};
  return        {n:9,label:"Non-Compliant",rec:"0%",clr:C.red};
};
const DVALS=Object.fromEntries(ELEMENTS.flatMap(e=>e.fields.map(f=>[f.id,""])));

/* ═══════════════════════════════════════════════════════════
   MARKETING SITE
═══════════════════════════════════════════════════════════ */
function MarketingSite({onSignUp,onSignIn}) {
  const [mPage,setMPage]=useState("home");
  return(
    <div style={{minHeight:"100vh",background:C.bg}}>
      {/* Nav */}
      <nav style={{position:"sticky",top:0,zIndex:100,background:C.white+"F0",backdropFilter:"blur(12px)",borderBottom:`1px solid ${C.border}`,padding:"14px 40px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={()=>setMPage("home")}>
          <div style={{width:32,height:32,borderRadius:9,background:`linear-gradient(135deg,${C.copper},${C.copperLt})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🧭</div>
          <span style={{fontFamily:"'Instrument Serif'",fontSize:22,fontWeight:400,color:C.ink}}>BEE<span style={{color:C.copper}}>compass</span></span>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {[["home","Home"],["about","About BEE"],["how","How It Works"],["pricing","Pricing"]].map(([p,l])=>(
            <button key={p} onClick={()=>setMPage(p)} style={{padding:"8px 14px",borderRadius:10,border:"none",background:mPage===p?C.s100:"transparent",color:mPage===p?C.ink:C.mid,fontWeight:500,fontSize:14,cursor:"pointer"}}>{l}</button>
          ))}
          <div style={{width:1,height:24,background:C.border,margin:"0 4px"}}/>
          <Btn ch="Sign In" variant="outline" onClick={onSignIn} style={{padding:"8px 16px",fontSize:14,borderRadius:10}}/>
          <Btn ch="Get Started Free" variant="copper" onClick={onSignUp} style={{padding:"8px 18px",fontSize:14,borderRadius:10}}/>
        </div>
      </nav>

      {mPage==="home"    && <HomePage onSignUp={onSignUp}/>}
      {mPage==="about"   && <AboutBEE/>}
      {mPage==="how"     && <HowItWorks onSignUp={onSignUp}/>}
      {mPage==="pricing" && <PricingPage onSignUp={onSignUp}/>}

      {/* Footer */}
      <footer style={{background:C.ink,padding:"40px",marginTop:60}}>
        <div style={{maxWidth:1100,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:16}}>
          <div>
            <div style={{fontFamily:"'Instrument Serif'",fontSize:20,color:"#fff",marginBottom:6}}>BEE<span style={{color:C.copper}}>compass</span></div>
            <p style={{fontSize:13,color:"#64748B",lineHeight:1.6,maxWidth:360}}>Pre-readiness planning tool for South African SMEs. Not an accredited BEE verification service.</p>
          </div>
          <div style={{fontSize:12,color:"#475569",textAlign:"right"}}>
            <p>© 2025 BEEcompass · Made in 🇿🇦 South Africa</p>
            <p style={{marginTop:4}}>Not SANAS accredited · For planning purposes only</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function HomePage({onSignUp}){
  return(<div style={{maxWidth:1100,margin:"0 auto",padding:"0 40px"}}>
    {/* Hero */}
    <div style={{textAlign:"center",padding:"80px 0 60px",animation:"up .5s ease"}}>
      <span style={{fontSize:13,fontWeight:600,letterSpacing:1,textTransform:"uppercase",color:C.copper,background:C.amberBg,padding:"5px 14px",borderRadius:99,border:`1px solid ${C.amberBdr}`}}>BEE Pre-Readiness · Not Verification</span>
      <h1 className="serif" style={{fontSize:58,lineHeight:1.1,letterSpacing:-1,marginTop:20,color:C.ink}}>
        Know your BEE position<br/>
        <span style={{color:C.copper,fontStyle:"italic"}}>before</span> you book a verifier.
      </h1>
      <p style={{fontSize:18,lineHeight:1.7,color:C.mid,marginTop:20,maxWidth:580,margin:"20px auto 0"}}>
        BEEcompass helps South African SMEs understand their estimated B-BBEE readiness, identify gaps, compile documents, and prepare a handoff pack for their SANAS-accredited verifier.
      </p>
      <div style={{display:"flex",gap:12,justifyContent:"center",marginTop:32}}>
        <Btn ch="Start Free — No Card Required →" variant="copper" onClick={onSignUp} style={{padding:"14px 28px",fontSize:16,borderRadius:14,boxShadow:`0 6px 24px ${C.copper}35`}}/>
        <Btn ch="See how it works" variant="outline" onClick={()=>{}} style={{padding:"14px 24px",fontSize:16,borderRadius:14}}/>
      </div>
      <p style={{fontSize:12,color:C.muted,marginTop:14}}>Free readiness estimate · No SANAS accreditation · For planning only</p>
    </div>

    {/* Stats */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:60}}>
      {[["750K+","SMEs in SA need BEE"],["R0","to get your estimate"],["5 min","to complete assessment"],["100%","you own your documents"]].map(([v,l])=>(
        <Card key={l} ch={<div style={{textAlign:"center"}}><p className="serif" style={{fontSize:36,color:C.ink}}>{v}</p><p style={{fontSize:14,color:C.mid,marginTop:4}}>{l}</p></div>} p="24px"/>
      ))}
    </div>

    {/* Features */}
    <div style={{marginBottom:60}}>
      <h2 className="serif" style={{fontSize:38,textAlign:"center",marginBottom:8}}>Everything you need to prepare</h2>
      <p style={{fontSize:16,color:C.mid,textAlign:"center",marginBottom:36}}>We handle the preparation. Your accredited verifier handles the certificate.</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
        {[
          ["🧮","BEE Readiness Calculator","Estimate your position across all 5 pillars instantly. Updated as you enter data."],
          ["📋","Guided Questionnaire","25 BEE-specific questions guide you through what your verifier will assess."],
          ["📁","Document Vault","Upload and categorise all required documents. The system detects types using AI."],
          ["🤖","BeeBot AI Advisor","Ask any BEE question. BeeBot is trained exclusively on South African BEE legislation."],
          ["🔍","Gap Analysis","See exactly which pillars need work and what actions to take — in plain language."],
          ["🤝","Verifier Marketplace","Browse and book real SANAS-accredited verification agencies, advisory firms, and consultants."],
          ["📊","Scenario Planner","Model improvements before spending money. See how changes affect your estimated level."],
          ["📄","Pre-Readiness Report","Generate a PDF readiness pack to hand to your verifier — saves them time and you money."],
          ["🔒","POPIA Compliant","Your data is private, encrypted, and never shared without your consent."],
        ].map(([icon,title,desc])=>(
          <Card key={title} ch={<div>
            <div style={{width:44,height:44,borderRadius:12,background:C.s100,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,marginBottom:14}}>{icon}</div>
            <p style={{fontWeight:700,fontSize:15,marginBottom:8}}>{title}</p>
            <p style={{fontSize:14,color:C.mid,lineHeight:1.6}}>{desc}</p>
          </div>} p="24px"/>
        ))}
      </div>
    </div>

    {/* CTA */}
    <div style={{background:C.ink,borderRadius:24,padding:"48px",textAlign:"center",marginBottom:60}}>
      <h2 className="serif" style={{fontSize:38,color:"#fff",marginBottom:12}}>Ready to know where you stand?</h2>
      <p style={{fontSize:16,color:"#94A3B8",marginBottom:28,maxWidth:480,margin:"0 auto 28px"}}>Start your free readiness assessment today. No credit card, no SANAS accreditation — just clarity.</p>
      <Btn ch="Start Free Assessment →" variant="copper" onClick={onSignUp} style={{padding:"14px 32px",fontSize:16,borderRadius:14}}/>
    </div>

    <Disclaimer/>
  </div>);
}

function AboutBEE(){
  const sections=[
    {title:"What is B-BBEE?",content:"Broad-Based Black Economic Empowerment (B-BBEE) is a South African government policy introduced through the B-BBEE Act 53 of 2003. It aims to redress historical economic inequalities by promoting the participation of Black South Africans in the economy through ownership, management, skills development, and supplier development."},
    {title:"Who does it affect?",content:"B-BBEE applies to all businesses operating in South Africa that wish to do business with government entities, state-owned enterprises, or large corporates. While compliance is not legally mandatory for private businesses, non-compliance can significantly restrict access to contracts and funding."},
    {title:"The Generic Scorecard",content:"The B-BBEE Generic Codes of Good Practice (2013) measure compliance across five elements: Ownership (25 pts), Management Control (19 pts), Skills Development (20 pts), Enterprise & Supplier Development (40 pts), and Socio-Economic Development (5 pts) — totalling 109 points maximum."},
    {title:"EME and QSE Status",content:"Exempt Micro Enterprises (EMEs) with annual turnover below R10 million automatically qualify as Level 4 (or Level 1 if 100% Black-owned). Qualifying Small Enterprises (QSEs) with turnover between R10m and R50m use a simplified scorecard. Generic entities above R50m use the full scorecard."},
    {title:"BEE Levels and Recognition",content:"B-BBEE levels range from Level 1 (best, 135% procurement recognition) to Level 8 (10% recognition). Non-compliant businesses receive 0% recognition. Levels are determined by your total scorecard points, and certificates are valid for 12 months from the verification date."},
    {title:"The Verification Process",content:"Official BEE certificates must be issued by a SANAS-accredited verification agency. Businesses prepare their documentation, undergo an audit by the agency, and receive a rating certificate. This process typically costs R2,000–R15,000 depending on entity size and complexity."},
    {title:"2025 Legislative Changes",content:"The Employment Equity Amendment Act (effective January 2025) introduced mandatory sectoral representation targets across 18 industries. These integrate with BEE Management Control scoring and require businesses to demonstrate equitable representation at all occupational levels through 2030."},
    {title:"Common Mistakes to Avoid",content:"Fronting (misrepresenting BEE status) is illegal and carries severe penalties. Other common mistakes include failing to renew certificates annually, using incorrect sector codes, poor document keeping, and not understanding sub-minimum requirements on priority elements."},
  ];
  return(<div style={{maxWidth:900,margin:"0 auto",padding:"60px 40px",animation:"up .4s ease"}}>
    <p style={{fontSize:12,fontWeight:600,letterSpacing:2,textTransform:"uppercase",color:C.muted,marginBottom:10}}>Knowledge Base</p>
    <h1 className="serif" style={{fontSize:44,marginBottom:8}}>Understanding B-BBEE</h1>
    <p style={{fontSize:16,color:C.mid,marginBottom:40,lineHeight:1.7}}>A plain-language guide to South Africa's Broad-Based Black Economic Empowerment framework — what it is, how it works, and what it means for your business.</p>
    <Disclaimer/>
    <div style={{marginTop:32,display:"flex",flexDirection:"column",gap:24}}>
      {sections.map((s,i)=>(
        <Card key={s.title} ch={<div>
          <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
            <div style={{width:32,height:32,borderRadius:8,background:C.ink,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,flexShrink:0,marginTop:2}}>{i+1}</div>
            <div><h3 style={{fontSize:18,fontWeight:700,marginBottom:8}}>{s.title}</h3><p style={{fontSize:15,color:C.mid,lineHeight:1.7}}>{s.content}</p></div>
          </div>
        </div>} p="24px"/>
      ))}
    </div>
  </div>);
}

function HowItWorks({onSignUp}){
  const steps=[
    {n:"01",title:"Create your account",desc:"Sign up free. No credit card required. Complete your company profile with basic details.",icon:"👤"},
    {n:"02",title:"Complete the questionnaire",desc:"Answer 25 BEE-specific questions about your ownership, management, skills, procurement, and SED spend.",icon:"📋"},
    {n:"03",title:"Upload your documents",desc:"Upload your supporting documents. Our AI categorises them automatically and flags what's missing.",icon:"📁"},
    {n:"04",title:"Review your readiness",desc:"See your estimated BEE level range, confidence score, and gap analysis across all 5 pillars.",icon:"📊"},
    {n:"05",title:"Run scenarios",desc:"Model improvements before spending money. See how ownership changes or supplier shifts affect your estimate.",icon:"🔧"},
    {n:"06",title:"Generate your readiness report",desc:"Download a PDF pre-readiness pack — a professional summary for your verifier that saves them time.",icon:"📄"},
    {n:"07",title:"Book an accredited verifier",desc:"Browse real SANAS-accredited agencies. Book directly through BEEcompass and hand over your readiness pack.",icon:"🤝"},
  ];
  return(<div style={{maxWidth:900,margin:"0 auto",padding:"60px 40px",animation:"up .4s ease"}}>
    <p style={{fontSize:12,fontWeight:600,letterSpacing:2,textTransform:"uppercase",color:C.muted,marginBottom:10}}>The Process</p>
    <h1 className="serif" style={{fontSize:44,marginBottom:8}}>How BEEcompass Works</h1>
    <p style={{fontSize:16,color:C.mid,marginBottom:40,lineHeight:1.7}}>From zero to verification-ready in seven simple steps.</p>
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {steps.map((s,i)=>(
        <div key={s.n} style={{display:"flex",gap:20,alignItems:"flex-start",padding:"24px",background:C.white,borderRadius:16,border:`1px solid ${C.border}`,animation:`up .4s ease ${i*.05}s both`}}>
          <div style={{fontSize:32,flexShrink:0}}>{s.icon}</div>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
              <span style={{fontSize:11,fontWeight:700,letterSpacing:1,color:C.muted}}>{s.n}</span>
              <h3 style={{fontSize:18,fontWeight:700}}>{s.title}</h3>
            </div>
            <p style={{fontSize:15,color:C.mid,lineHeight:1.6}}>{s.desc}</p>
          </div>
        </div>
      ))}
    </div>
    <div style={{marginTop:40,textAlign:"center"}}>
      <Btn ch="Start Now — It's Free →" variant="copper" onClick={onSignUp} style={{padding:"14px 32px",fontSize:16,borderRadius:14}}/>
    </div>
  </div>);
}

function PricingPage({onSignUp}){
  const plans=[
    {name:"Free",price:"R0",per:"forever",desc:"Get your estimated BEE readiness position",features:["Basic readiness estimate","Questionnaire (10 questions)","Gap analysis overview","BeeBot AI (10 messages/month)"],cta:"Start Free",variant:"outline"},
    {name:"Report",price:"R299",per:"one-time",desc:"Download your full pre-readiness report",features:["Everything in Free","Full questionnaire (25 questions)","Document vault (up to 20 files)","Unlimited BeeBot AI","PDF pre-readiness report","Scenario planner"],cta:"Get Report",variant:"copper",featured:true},
    {name:"Annual",price:"R1,299",per:"per year",desc:"Year-round readiness tracking",features:["Everything in Report","Unlimited documents","Quarterly score tracking","WhatsApp deadline reminders","Priority support","Multi-year comparison"],cta:"Go Annual",variant:"solid"},
    {name:"Verification Assist",price:"Custom",per:"",desc:"Managed handoff to accredited verifiers",features:["Everything in Annual","Agency matching","Managed booking","Verifier briefing call","Readiness pack preparation","Compliance check"],cta:"Contact Us",variant:"outline"},
  ];
  return(<div style={{maxWidth:1100,margin:"0 auto",padding:"60px 40px",animation:"up .4s ease"}}>
    <p style={{fontSize:12,fontWeight:600,letterSpacing:2,textTransform:"uppercase",color:C.muted,textAlign:"center",marginBottom:10}}>Pricing</p>
    <h1 className="serif" style={{fontSize:44,textAlign:"center",marginBottom:8}}>Simple, transparent pricing</h1>
    <p style={{fontSize:16,color:C.mid,textAlign:"center",marginBottom:40}}>Start free. Pay only when you need more.</p>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:40}}>
      {plans.map(p=>(
        <div key={p.name} style={{background:p.featured?C.ink:C.white,borderRadius:20,border:p.featured?`2px solid ${C.copper}`:`1px solid ${C.border}`,padding:"24px",position:"relative"}}>
          {p.featured&&<div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",background:C.copper,color:"#fff",fontSize:11,fontWeight:700,padding:"3px 14px",borderRadius:99,letterSpacing:.5}}>MOST POPULAR</div>}
          <p style={{fontWeight:700,fontSize:16,color:p.featured?"#fff":C.ink,marginBottom:4}}>{p.name}</p>
          <p style={{fontFamily:"'Instrument Serif'",fontSize:32,color:p.featured?C.amber:C.ink,marginBottom:2}}>{p.price}</p>
          <p style={{fontSize:12,color:p.featured?"#64748B":C.muted,marginBottom:12}}>{p.per}</p>
          <p style={{fontSize:13,color:p.featured?"#94A3B8":C.mid,marginBottom:16,lineHeight:1.5}}>{p.desc}</p>
          <div style={{marginBottom:20}}>{p.features.map(f=>(<div key={f} style={{display:"flex",gap:8,marginBottom:8,fontSize:13,color:p.featured?"#CBD5E1":C.s700}}>
            <span style={{color:p.featured?C.amber:C.green}}>✓</span>{f}
          </div>))}</div>
          <Btn ch={p.cta} variant={p.featured?"copper":p.variant} onClick={onSignUp} full style={{borderRadius:12,fontSize:14}}/>
        </div>
      ))}
    </div>
    <Disclaimer/>
  </div>);
}

/* ═══════════════════════════════════════════════════════════
   AUTH
═══════════════════════════════════════════════════════════ */
function Auth({mode:initMode="signup",onAuth,onBack}){
  const [mode,setMode]=useState(initMode);
  const [f,setF]=useState({name:"",company:"",email:"",pw:""});
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const set=(k,v)=>setF(p=>({...p,[k]:v}));

  const submit=async()=>{
    setLoading(true);setError("");
    try{
      if(mode==="signup"){
        const {error:e}=await sb.auth.signUp({email:f.email,password:f.pw,options:{data:{name:f.name,company:f.company}}});
        if(e)throw e;
        const {data:{session},error:e2}=await sb.auth.signInWithPassword({email:f.email,password:f.pw});
        if(e2)throw e2;
        if(session){
          await apiFetch("/api/profile",{method:"POST",body:{name:f.name,company:f.company}},session.access_token);
          onAuth(session,{name:f.name,company:f.company});
        }
      } else {
        const {data:{session},error:e}=await sb.auth.signInWithPassword({email:f.email,password:f.pw});
        if(e)throw e;
        const profile=await apiFetch("/api/profile",{},session.access_token);
        onAuth(session,profile);
      }
    }catch(e){setError(e.message||"Something went wrong");}
    setLoading(false);
  };

  return(<div style={{minHeight:"100vh",background:C.ink,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
    <style>{CSS}</style>
    <button onClick={onBack} style={{position:"absolute",top:20,left:20,background:"none",border:"none",color:"#64748B",cursor:"pointer",fontSize:22}}>‹</button>
    <div style={{fontFamily:"'Instrument Serif'",fontSize:28,color:"#fff",marginBottom:32}}>BEE<span style={{color:C.copper}}>compass</span></div>
    <div style={{width:"100%",maxWidth:400,background:"#ffffff0A",border:"1px solid #ffffff12",borderRadius:22,padding:"28px 24px",animation:"up .4s ease"}}>
      <div style={{display:"flex",background:"#ffffff0C",borderRadius:10,padding:3,marginBottom:22}}>
        {["signup","login"].map(m=>(<button key={m} onClick={()=>setMode(m)} style={{flex:1,padding:"9px",borderRadius:8,border:"none",cursor:"pointer",fontWeight:600,fontSize:13,background:m===mode?"#fff":"transparent",color:m===mode?C.ink:"#ffffff60",transition:"all .2s"}}>{m==="login"?"Sign In":"Create Account"}</button>))}
      </div>
      {mode==="signup"&&<>
        <Input label="Full Name" value={f.name} onChange={v=>set("name",v)} placeholder="Sipho Dlamini"/>
        <Input label="Company Name" value={f.company} onChange={v=>set("company",v)} placeholder="Dlamini Holdings (Pty) Ltd"/>
      </>}
      <Input label="Email" value={f.email} onChange={v=>set("email",v)} placeholder="you@company.co.za" type="email"/>
      <Input label="Password" value={f.pw} onChange={v=>set("pw",v)} placeholder="••••••••" type="password"/>
      {error&&<div style={{fontSize:13,color:"#FCA5A5",marginBottom:12,padding:"10px",background:"#B91C1C20",borderRadius:9}}>{error}</div>}
      <button onClick={submit} disabled={loading} style={{width:"100%",padding:"13px",border:"none",borderRadius:12,cursor:"pointer",fontWeight:700,fontSize:15,background:`linear-gradient(135deg,${C.copper},${C.copperLt})`,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:4}}>
        {loading?<Spin/>:(mode==="login"?"Sign In →":"Start Free →")}
      </button>
      <div style={{textAlign:"center",marginTop:14,fontSize:12,color:"#ffffff40"}}>No credit card required · POPIA compliant</div>
    </div>
  </div>);
}

/* ═══════════════════════════════════════════════════════════
   MAIN APP (after login)
═══════════════════════════════════════════════════════════ */
const APP_PAGES=["dashboard","questionnaire","calculator","gaps","scenario","documents","chat","verifiers","report","info"];

function AppShell({session,user,setUser,onLogout,vals,setVals}){
  const [page,setPage]=useState("dashboard");
  const token=session?.access_token;
  const total=useMemo(()=>ELEMENTS.reduce((s,e)=>s+calcEl(e,vals),0),[vals]);
  const bee=useMemo(()=>getLevel(total),[total]);

  return(<div style={{minHeight:"100vh",background:C.bg}}>
    <style>{CSS}</style>
    {/* Top bar */}
    <div style={{position:"sticky",top:0,zIndex:100,background:C.white+"F0",backdropFilter:"blur(12px)",borderBottom:`1px solid ${C.border}`,padding:"12px 24px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:28,height:28,borderRadius:8,background:`linear-gradient(135deg,${C.copper},${C.copperLt})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>🧭</div>
        <span style={{fontFamily:"'Instrument Serif'",fontSize:18,color:C.ink}}>BEE<span style={{color:C.copper}}>compass</span></span>
      </div>
      <div style={{display:"flex",gap:6,overflowX:"auto",scrollbarWidth:"none"}}>
        {[["dashboard","🏠"],["questionnaire","📋"],["calculator","🧮"],["gaps","🎯"],["scenario","🔧"],["documents","📁"],["chat","🤖"],["verifiers","🤝"],["report","📄"],["info","📚"]].map(([p,icon])=>(
          <button key={p} onClick={()=>setPage(p)} style={{padding:"6px 12px",borderRadius:9,border:`1px solid ${page===p?C.ink:C.border}`,background:page===p?C.ink:"transparent",color:page===p?"#fff":C.mid,fontWeight:500,fontSize:12,cursor:"pointer",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:4}}>
            {icon} <span style={{display:"none"}}>{p}</span>
          </button>
        ))}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <Tag label={bee.label} color={bee.clr} bg={bee.clr+"18"}/>
        <button onClick={onLogout} style={{fontSize:13,color:C.mid,background:"none",border:"none",cursor:"pointer"}}>Sign out</button>
      </div>
    </div>

    {/* Pages */}
    <div style={{maxWidth:1100,margin:"0 auto",padding:"28px 24px 80px"}}>
      {page==="dashboard"    && <AppDashboard    vals={vals} user={user} setPage={setPage} token={token}/>}
      {page==="questionnaire"&& <Questionnaire   token={token}/>}
      {page==="calculator"   && <Calculator      vals={vals} setVals={setVals} token={token}/>}
      {page==="gaps"         && <GapAnalysis     vals={vals}/>}
      {page==="scenario"     && <ScenarioPlanner vals={vals} setVals={setVals}/>}
      {page==="documents"    && <DocumentVault   token={token}/>}
      {page==="chat"         && <BeeBot          token={token} vals={vals} user={user}/>}
      {page==="verifiers"    && <VerifierMarket  token={token}/>}
      {page==="report"       && <ReportGen       token={token} vals={vals} user={user}/>}
      {page==="info"         && <AboutBEE/>}
    </div>
  </div>);
}

/* ── App Dashboard ────────────────────────────────────────── */
function AppDashboard({vals,user,setPage,token}){
  const els=ELEMENTS.map(e=>({...e,score:calcEl(e,vals)}));
  const total=els.reduce((a,b)=>a+b.score,0);
  const bee=getLevel(total);
  const next=[{l:"Level 4",min:80},{l:"Level 3",min:90},{l:"Level 2",min:95},{l:"Level 1",min:100}].find(t=>t.min>total);

  return(<div style={{animation:"up .4s ease"}}>
    <div style={{marginBottom:24}}>
      <p style={{fontSize:13,color:C.muted}}>Welcome back, <strong style={{color:C.ink}}>{user?.name?.split(" ")[0]||"there"}</strong></p>
      <h1 className="serif" style={{fontSize:32,marginTop:2}}>{user?.company||"Your Company"}</h1>
    </div>

    {/* Score hero */}
    <div style={{background:C.ink,borderRadius:22,padding:"28px 28px",marginBottom:20,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",right:-50,top:-50,width:200,height:200,borderRadius:"50%",background:"#ffffff05"}}/>
      <div style={{display:"flex",alignItems:"center",gap:24,position:"relative"}}>
        <div style={{textAlign:"center"}}>
          <div style={{fontFamily:"'Instrument Serif'",fontSize:52,color:"#fff",lineHeight:1}}>{total.toFixed(0)}</div>
          <div style={{fontSize:11,color:C.copper,marginTop:2}}>/ 109 pts</div>
        </div>
        <div style={{flex:1}}>
          <Tag label="ESTIMATED SCORE" color={C.amber}/>
          <div style={{fontFamily:"'Instrument Serif'",fontSize:36,color:"#fff",marginTop:6}}>{bee.label}</div>
          <div style={{fontSize:14,color:"#94A3B8",marginTop:4}}>{bee.rec} estimated recognition</div>
        </div>
        {next&&<div style={{textAlign:"right"}}>
          <div style={{fontSize:12,color:"#64748B"}}>Next milestone</div>
          <div style={{fontFamily:"'Instrument Serif'",fontSize:22,color:C.amber}}>{next.l}</div>
          <div style={{fontSize:13,color:"#64748B"}}>{(next.min-total).toFixed(1)} pts away</div>
        </div>}
      </div>
    </div>

    {/* Quick actions */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
      {[["📋","Questionnaire","questionnaire"],["📁","Documents","documents"],["🤖","Ask BeeBot","chat"],["🤝","Book Verifier","verifiers"]].map(([i,l,p])=>(
        <Card key={l} ch={<div style={{textAlign:"center"}}>
          <div style={{fontSize:28,marginBottom:8}}>{i}</div>
          <div style={{fontWeight:600,fontSize:13}}>{l}</div>
        </div>} p="20px" style={{cursor:"pointer"}} onClick={()=>setPage(p)}/>
      ))}
    </div>

    {/* Pillars */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <Card ch={<div>
        <p style={{fontWeight:700,fontSize:16,marginBottom:14}}>Pillar Readiness</p>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {els.map(e=>{
            const p=PILLARS.find(p=>p.id===e.id||e.id===p.key)||{color:C.mid};
            const pct=e.score/e.max;
            const clr=pct>=.8?C.green:pct>=.5?C.amber:C.red;
            return(<div key={e.id}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <span style={{fontSize:13,fontWeight:500}}>{PILLARS.find(p=>p.key===e.id)?.label||e.id}</span>
                <Tag label={`${e.score.toFixed(1)}/${e.max}`} color={clr} bg={clr+"14"}/>
              </div>
              <Bar v={e.score} max={e.max} color={clr}/>
            </div>);
          })}
        </div>
      </div>} p="22px"/>

      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <Card ch={<div>
          <p style={{fontWeight:700,fontSize:16,marginBottom:4}}>Your next step</p>
          <p style={{fontSize:14,color:C.mid,lineHeight:1.6,marginBottom:14}}>Complete the questionnaire to improve your confidence score and unlock your full gap analysis.</p>
          <Btn ch="Complete Questionnaire →" variant="copper" onClick={()=>setPage("questionnaire")} full style={{borderRadius:12,fontSize:13}}/>
        </div>} p="22px"/>
        <Card ch={<div>
          <p style={{fontWeight:700,fontSize:16,marginBottom:4}}>Generate Your Report</p>
          <p style={{fontSize:14,color:C.mid,lineHeight:1.6,marginBottom:14}}>Download your pre-readiness PDF to hand to your SANAS-accredited verifier.</p>
          <Btn ch="Generate PDF Report" variant="outline" onClick={()=>setPage("report")} full style={{borderRadius:12,fontSize:13}}/>
        </div>} p="22px"/>
      </div>
    </div>

    <div style={{marginTop:20}}><Disclaimer/></div>
  </div>);
}

/* ── Questionnaire ────────────────────────────────────────── */
const QUESTIONS=[
  {id:"q1", section:"Business Profile",  q:"What is your company's annual turnover?",          type:"select", opts:["Under R1m","R1m–R10m (EME)","R10m–R50m (QSE)","Over R50m (Generic)"]},
  {id:"q2", section:"Business Profile",  q:"How many full-time employees do you have?",        type:"select", opts:["1–5","6–20","21–50","51–150","150+"]},
  {id:"q3", section:"Business Profile",  q:"What industry are you in?",                        type:"select", opts:["Construction","Financial Services","Mining","Manufacturing","Retail","ICT","Agriculture","Other"]},
  {id:"q4", section:"Ownership",         q:"What percentage of your company is Black-owned?",  type:"select", opts:["0–25%","26–50%","51–74%","75–100%"]},
  {id:"q5", section:"Ownership",         q:"What percentage is Black women-owned?",            type:"select", opts:["0%","1–10%","11–25%","26–50%","Over 50%"]},
  {id:"q6", section:"Ownership",         q:"Do you have a Shareholders Agreement?",            type:"bool"},
  {id:"q7", section:"Ownership",         q:"Do you have an Employee Share Ownership Programme (ESOP)?", type:"bool"},
  {id:"q8", section:"Management",        q:"What % of your board/directors are Black?",        type:"select", opts:["0–24%","25–49%","50–74%","75–100%"]},
  {id:"q9", section:"Management",        q:"What % of senior management (C-suite) are Black?", type:"select", opts:["0–24%","25–49%","50–74%","75–100%"]},
  {id:"q10",section:"Management",        q:"Do you have an Employment Equity Plan in place?",  type:"bool"},
  {id:"q11",section:"Skills Development",q:"What % of payroll do you spend on training Black employees?", type:"select", opts:["0–0.5%","0.5–1%","1–2%","2–3%","Over 3%"]},
  {id:"q12",section:"Skills Development",q:"Do you have employees on SETA-accredited learnerships?", type:"bool"},
  {id:"q13",section:"Skills Development",q:"Do you offer bursaries to Black students?",       type:"bool"},
  {id:"q14",section:"Skills Development",q:"Have you submitted a Workplace Skills Plan (WSP) to your SETA?", type:"bool"},
  {id:"q15",section:"Enterprise & Supplier Dev",q:"What % of your total procurement is from BEE-compliant suppliers?", type:"select", opts:["0–25%","26–50%","51–74%","75–100%"]},
  {id:"q16",section:"Enterprise & Supplier Dev",q:"What % of procurement spend is with Black-owned suppliers?", type:"select", opts:["0–10%","11–25%","26–50%","Over 50%"]},
  {id:"q17",section:"Enterprise & Supplier Dev",q:"Do you collect and verify BEE certificates from suppliers?", type:"bool"},
  {id:"q18",section:"Enterprise & Supplier Dev",q:"Do you contribute to Enterprise Development programmes?", type:"bool"},
  {id:"q19",section:"Enterprise & Supplier Dev",q:"What % of your NPAT goes to Supplier Development?", type:"select", opts:["0%","0.1–1%","1–2%","Over 2%"]},
  {id:"q20",section:"Socio-Economic Dev",q:"Do you make SED contributions to approved organisations?", type:"bool"},
  {id:"q21",section:"Socio-Economic Dev",q:"What % of NPAT goes to SED?",                     type:"select", opts:["0%","0.1–0.5%","0.5–1%","Over 1%"]},
  {id:"q22",section:"Verification Readiness",q:"Have you been BEE-verified before?",           type:"bool"},
  {id:"q23",section:"Verification Readiness",q:"Do you have a system for tracking BEE compliance throughout the year?", type:"bool"},
  {id:"q24",section:"Verification Readiness",q:"Do you have all supporting documents organised and ready?", type:"select", opts:["None ready","Some ready","Mostly ready","All ready"]},
  {id:"q25",section:"Verification Readiness",q:"When do you need your BEE certificate?",      type:"select", opts:["Urgently (within 1 month)","1–3 months","3–6 months","Not urgent"]},
];

function Questionnaire({token}){
  const [answers,setAnswers]=useState({});
  const [saving,setSaving]=useState(false);
  const [saved,setSaved]=useState(false);
  const sections=[...new Set(QUESTIONS.map(q=>q.section))];

  const save=async()=>{
    setSaving(true);
    if(token) await apiFetch("/api/questionnaire",{method:"POST",body:{answers}},token).catch(()=>{});
    setSaved(true);setSaving(false);
    setTimeout(()=>setSaved(false),3000);
  };

  const answered=Object.keys(answers).length;
  const pct=Math.round(answered/QUESTIONS.length*100);

  return(<div style={{animation:"up .4s ease"}}>
    <p style={{fontSize:12,fontWeight:600,letterSpacing:2,textTransform:"uppercase",color:C.muted,marginBottom:8}}>Step 2 of 7</p>
    <h1 className="serif" style={{fontSize:32,marginBottom:6}}>BEE Readiness Questionnaire</h1>
    <p style={{fontSize:15,color:C.mid,marginBottom:20}}>Answer these 25 questions based on the B-BBEE Codes of Good Practice. Your answers improve your confidence score and gap analysis.</p>

    {/* Progress */}
    <Card ch={<div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
        <span style={{fontSize:14,fontWeight:600}}>{answered} of {QUESTIONS.length} answered</span>
        <span style={{fontSize:14,color:C.copper,fontWeight:700}}>{pct}% complete</span>
      </div>
      <Bar v={answered} max={QUESTIONS.length} color={C.copper}/>
    </div>} p="18px" style={{marginBottom:20}}/>

    {sections.map(sec=>(
      <div key={sec} style={{marginBottom:24}}>
        <h3 style={{fontSize:16,fontWeight:700,marginBottom:12,paddingBottom:8,borderBottom:`2px solid ${C.s100}`}}>{sec}</h3>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {QUESTIONS.filter(q=>q.section===sec).map(q=>(
            <Card key={q.id} ch={<div>
              <p style={{fontSize:14,fontWeight:600,marginBottom:12,lineHeight:1.5}}>{q.q}</p>
              {q.type==="bool"
                ?<div style={{display:"flex",gap:10}}>
                  {["Yes","No"].map(opt=>(
                    <button key={opt} onClick={()=>setAnswers(a=>({...a,[q.id]:opt}))} style={{flex:1,padding:"10px",borderRadius:10,border:`1.5px solid ${answers[q.id]===opt?C.ink:C.border}`,background:answers[q.id]===opt?C.ink:"transparent",color:answers[q.id]===opt?"#fff":C.ink,fontWeight:600,fontSize:14,cursor:"pointer"}}>{opt}</button>
                  ))}
                </div>
                :<div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {q.opts?.map(opt=>(
                    <button key={opt} onClick={()=>setAnswers(a=>({...a,[q.id]:opt}))} style={{padding:"8px 14px",borderRadius:10,border:`1.5px solid ${answers[q.id]===opt?C.ink:C.border}`,background:answers[q.id]===opt?C.ink:"transparent",color:answers[q.id]===opt?"#fff":C.ink,fontWeight:500,fontSize:13,cursor:"pointer"}}>{opt}</button>
                  ))}
                </div>
              }
            </div>} p="18px"/>
          ))}
        </div>
      </div>
    ))}

    <div style={{display:"flex",gap:12}}>
      <Btn ch={saving?<><Spin size={14}/>Saving…</>:saved?"✓ Saved!":"Save Progress"} variant={saved?"outline":"copper"} onClick={save} disabled={saving} style={{borderRadius:12,flex:1,justifyContent:"center"}}/>
    </div>
  </div>);
}

/* ── Calculator ───────────────────────────────────────────── */
const CALC_FIELDS=[
  {id:"blackOwn",  label:"Black Ownership (%)",           el:"own",   hint:"% of equity held by Black South Africans",max:100,pts:20},
  {id:"blackWomen",label:"Black Women Ownership (%)",      el:"own",   hint:"% of equity held by Black women",         max:100,pts:5},
  {id:"board",     label:"Black Board Members (%)",        el:"mgmt",  hint:"% Black at board/director level",         max:100,pts:5},
  {id:"exec",      label:"Black Executives (%)",           el:"mgmt",  hint:"% Black C-suite executives",              max:100,pts:5},
  {id:"senior",    label:"Black Senior Management (%)",    el:"mgmt",  hint:"% Black senior management",              max:100,pts:5},
  {id:"middle",    label:"Black Middle Management (%)",    el:"mgmt",  hint:"% Black middle management",              max:100,pts:4},
  {id:"trainPct",  label:"Training Spend (% of payroll)", el:"skills",hint:"% of payroll spent on Black training",    max:6,  pts:8},
  {id:"learners",  label:"Learnership Enrolments",         el:"skills",hint:"Black learners in accredited programs",   max:5,  pts:7},
  {id:"bursaries", label:"Bursary Awards",                 el:"skills",hint:"Bursaries granted to Black students",     max:20, pts:5},
  {id:"beeProc",   label:"BEE-Compliant Suppliers (%)",   el:"esd",   hint:"% procurement from BEE suppliers",       max:100,pts:15},
  {id:"blackSpend",label:"Black Supplier Spend (%)",       el:"esd",   hint:"% spend on Black-owned businesses",      max:100,pts:12},
  {id:"supDev",    label:"Supplier Dev (% NPAT)",          el:"esd",   hint:"Investment in supplier development",     max:3,  pts:10},
  {id:"entDev",    label:"Enterprise Dev (% NPAT)",        el:"esd",   hint:"Investment in enterprise development",   max:3,  pts:5},
  {id:"sedPct",    label:"SED Contribution (% NPAT)",      el:"sed",   hint:"Donations to approved social programs",  max:1,  pts:5},
];

function Calculator({vals,setVals,token}){
  const [saving,setSaving]=useState(false);
  const total=ELEMENTS.reduce((s,e)=>s+calcEl(e,vals),0);
  const bee=getLevel(total);

  const save=async()=>{
    setSaving(true);
    if(token) await apiFetch("/api/scorecard",{method:"POST",body:{values:vals}},token).catch(()=>{});
    setSaving(false);
  };

  const elGroups={own:"Ownership",mgmt:"Management Control",skills:"Skills Development",esd:"Enterprise & Supplier Dev",sed:"Socio-Economic Dev"};

  return(<div style={{animation:"up .4s ease"}}>
    <p style={{fontSize:12,fontWeight:600,letterSpacing:2,textTransform:"uppercase",color:C.muted,marginBottom:8}}>Scorecard Engine</p>
    <h1 className="serif" style={{fontSize:32,marginBottom:20}}>BEE Readiness Calculator</h1>

    {/* Score card */}
    <Card ch={<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:16}}>
      <div>
        <p style={{fontSize:13,color:C.muted,marginBottom:4}}>Estimated Total Score</p>
        <p style={{fontFamily:"'Instrument Serif'",fontSize:48,color:C.ink,lineHeight:1}}>{total.toFixed(1)}<span style={{fontSize:20,color:C.muted}}>/109</span></p>
      </div>
      <div style={{textAlign:"right"}}>
        <p style={{fontSize:13,color:C.muted,marginBottom:4}}>Estimated Level</p>
        <p style={{fontFamily:"'Instrument Serif'",fontSize:28,color:bee.clr}}>{bee.label}</p>
        <Tag label={`${bee.rec} recognition`} color={bee.clr} bg={bee.clr+"18"}/>
      </div>
    </div>} p="24px" style={{marginBottom:20}}/>

    {/* Fields by element */}
    {Object.entries(elGroups).map(([elId,elName])=>{
      const fields=CALC_FIELDS.filter(f=>f.el===elId);
      const el=ELEMENTS.find(e=>e.id===elId);
      const score=el?calcEl(el,vals):0;
      return(<div key={elId} style={{marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <h3 style={{fontSize:16,fontWeight:700}}>{elName}</h3>
          <Tag label={`${score.toFixed(1)} / ${el?.max} pts`} color={score/el?.max>=.8?C.green:score/el?.max>=.5?C.amber:C.red}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {fields.map(f=>{
            const v=vals[f.id]||"";
            const pct=Math.min(parseFloat(v||0)/f.max,1);
            return(<Card key={f.id} ch={<div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontSize:13,fontWeight:600}}>{f.label}</span>
                <span style={{fontSize:12,color:pct>=.8?C.green:pct>=.4?C.amber:C.muted,fontWeight:700}}>+{(pct*f.pts).toFixed(1)} pts</span>
              </div>
              <p style={{fontSize:12,color:C.muted,marginBottom:8}}>{f.hint}</p>
              <div style={{display:"flex",alignItems:"center",border:`1.5px solid ${pct>0?C.copper:C.border}`,borderRadius:10,overflow:"hidden",marginBottom:6}}>
                <input type="number" min="0" max={f.max} value={v} onChange={e=>setVals(p=>({...p,[f.id]:e.target.value}))} placeholder="0"
                  style={{flex:1,padding:"9px 13px",border:"none",background:"transparent",fontSize:15,fontWeight:600,color:C.ink,outline:"none"}}/>
                <span style={{padding:"0 10px",fontSize:11,color:C.muted,borderLeft:`1px solid ${C.border}`}}>max {f.max}</span>
              </div>
              <Bar v={parseFloat(v||0)} max={f.max} color={pct>=.8?C.green:pct>=.4?C.amber:"#DDD"}/>
            </div>} p="14px"/>);
          })}
        </div>
      </div>);
    })}

    <Btn ch={saving?<><Spin size={14}/>Saving…</>:"💾 Save Scorecard"} variant="copper" onClick={save} disabled={saving} style={{borderRadius:12,width:"100%",justifyContent:"center"}}/>
    <div style={{marginTop:16}}><Disclaimer/></div>
  </div>);
}

/* ── Gap Analysis ─────────────────────────────────────────── */
function GapAnalysis({vals}){
  const els=ELEMENTS.map(e=>({...e,score:calcEl(e,vals),gap:e.max-calcEl(e,vals)}));
  const total=els.reduce((a,b)=>a+b.score,0);
  const next=[{l:"Level 4",min:80},{l:"Level 3",min:90},{l:"Level 2",min:95},{l:"Level 1",min:100}].find(t=>t.min>total);
  const LABELS={own:"Ownership",mgmt:"Management Control",skills:"Skills Development",esd:"Enterprise & Supplier Dev",sed:"Socio-Economic Dev"};
  const TIPS={
    own:"Consider an Employee Share Ownership Programme (ESOP) or structured BEE equity transaction. Even 26% Black ownership dramatically improves this element.",
    mgmt:"Fast-track Black talent into executive roles. Board co-option of Black Non-Executive Directors is the fastest lever available.",
    skills:"Enroll Black staff in SETA-accredited learnerships — 1–2% of payroll in targeted training yields material point gains.",
    esd:"Verify and document all supplier BEE certificates. Consciously shift procurement — set a target for Black-owned supplier spend.",
    sed:"Donate 1% of NPAT to an approved NPO. Get a board resolution and proper receipts. Highest-return, lowest-cost action.",
  };
  return(<div style={{animation:"up .4s ease"}}>
    <p style={{fontSize:12,fontWeight:600,letterSpacing:2,textTransform:"uppercase",color:C.muted,marginBottom:8}}>Improvement Plan</p>
    <h1 className="serif" style={{fontSize:32,marginBottom:20}}>Gap Analysis</h1>

    {next&&<Card ch={<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:12}}>
        <div><p style={{fontSize:12,color:C.muted,marginBottom:4}}>Next milestone</p><p className="serif" style={{fontSize:26}}>{next.l}</p></div>
        <div style={{textAlign:"right"}}><p className="serif" style={{fontSize:24,color:C.copper}}>{(next.min-total).toFixed(1)}</p><p style={{fontSize:11,color:C.muted}}>points needed</p></div>
      </div>
      <Bar v={total} max={next.min} color={C.copper}/>
    </div>} p="22px" style={{marginBottom:20}}/>}

    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      {[...els].sort((a,b)=>b.gap-a.gap).map(e=>{
        const pct=e.score/e.max,clr=pct>=.8?C.green:pct>=.5?C.amber:C.red;
        return(<Card key={e.id} ch={<div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <p style={{fontWeight:700,fontSize:15}}>{LABELS[e.id]||e.id}</p>
            <div style={{display:"flex",gap:8}}>
              <Tag label={`${e.score.toFixed(1)}/${e.max}`} color={clr} bg={clr+"14"}/>
              <Tag label={pct>=.8?"Strong":pct>=.5?"Fair":"Priority"} color={clr} bg={clr+"14"}/>
            </div>
          </div>
          <Bar v={e.score} max={e.max} color={clr}/>
          {e.gap>0.3&&<div style={{marginTop:12,padding:"12px",background:C.s100,borderRadius:10,fontSize:13,color:C.s700,lineHeight:1.6}}>💡 {TIPS[e.id]}</div>}
        </div>} style={{borderLeft:`4px solid ${clr}`}}/>);
      })}
    </div>

    <div style={{marginTop:20}}><Disclaimer/></div>
  </div>);
}

/* ── Scenario Planner ─────────────────────────────────────── */
function ScenarioPlanner({vals,setVals}){
  const total=ELEMENTS.reduce((s,e)=>s+calcEl(e,vals),0);
  const bee=getLevel(total);
  const controls=[
    {id:"blackOwn",  label:"Black Ownership (%)",    min:0,max:51, step:1},
    {id:"board",     label:"Black Board (%)",         min:0,max:100,step:1},
    {id:"trainPct",  label:"Training Spend % payroll",min:0,max:6,  step:0.1},
    {id:"beeProc",   label:"BEE Supplier Profile %",  min:0,max:100,step:1},
    {id:"blackSpend",label:"Black Supplier Spend %",  min:0,max:100,step:1},
    {id:"sedPct",    label:"SED % NPAT",              min:0,max:2,  step:0.1},
  ];
  return(<div style={{animation:"up .4s ease"}}>
    <p style={{fontSize:12,fontWeight:600,letterSpacing:2,textTransform:"uppercase",color:C.muted,marginBottom:8}}>What-If Modelling</p>
    <h1 className="serif" style={{fontSize:32,marginBottom:6}}>Scenario Planner</h1>
    <p style={{fontSize:15,color:C.mid,marginBottom:20}}>Adjust the sliders to model potential improvements before spending money.</p>

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
      <div>
        <Card ch={<div>
          <p style={{fontWeight:700,fontSize:16,marginBottom:14}}>Scenario Controls</p>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {controls.map(c=>{
              const v=parseFloat(vals[c.id]||0);
              return(<div key={c.id} style={{borderRadius:12,border:`1px solid ${C.border}`,padding:"14px"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                  <span style={{fontSize:13,fontWeight:500}}>{c.label}</span>
                  <Tag label={v.toFixed(1)} color={C.s700} bg={C.s100}/>
                </div>
                <input type="range" min={c.min} max={c.max} step={c.step} value={v}
                  onChange={e=>setVals(p=>({...p,[c.id]:e.target.value}))}/>
              </div>);
            })}
          </div>
        </div>} p="22px"/>
      </div>

      <div>
        <Card ch={<div>
          <p style={{fontWeight:700,fontSize:16,marginBottom:14}}>Projected Impact</p>
          <div style={{textAlign:"center",padding:"24px",background:C.s100,borderRadius:14,marginBottom:16}}>
            <p style={{fontSize:12,color:C.muted,marginBottom:4}}>Projected Score</p>
            <p style={{fontFamily:"'Instrument Serif'",fontSize:52,color:C.ink,lineHeight:1}}>{total.toFixed(1)}</p>
            <p style={{fontSize:13,color:C.muted}}>/ 109 points</p>
            <p style={{fontFamily:"'Instrument Serif'",fontSize:24,color:bee.clr,marginTop:8}}>{bee.label}</p>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {ELEMENTS.map(e=>{
              const s=calcEl(e,vals),pct=s/e.max;
              const LABELS={own:"Ownership",mgmt:"Management Control",skills:"Skills Development",esd:"Enterprise & Supplier Dev",sed:"Socio-Economic Dev"};
              const clr=pct>=.8?C.green:pct>=.5?C.amber:C.red;
              return(<div key={e.id}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:12}}>{LABELS[e.id]}</span>
                  <span style={{fontSize:12,color:clr,fontWeight:600}}>{s.toFixed(1)}/{e.max}</span>
                </div>
                <Bar v={s} max={e.max} color={clr}/>
              </div>);
            })}
          </div>
        </div>} p="22px"/>
      </div>
    </div>
    <div style={{marginTop:20}}><Disclaimer/></div>
  </div>);
}

/* ── Document Vault ───────────────────────────────────────── */
const DOC_CATS=["Ownership","Management Control","Skills Development","Enterprise & Supplier Dev","Socio-Economic Dev","General / Other"];

function DocumentVault({token}){
  const [docs,setDocs]=useState([]);
  const [uploading,setUploading]=useState(false);
  const [sel,setSel]=useState("Ownership");
  const fileRef=useRef(null);

  const loadDocs=async()=>{
    if(!token)return;
    const d=await apiFetch("/api/documents",{},token);
    if(Array.isArray(d))setDocs(d);
  };
  useEffect(()=>{loadDocs();},[token]);

  const upload=async(file)=>{
    if(!file||!token)return;
    setUploading(true);
    const fd=new FormData();
    fd.append("file",file);fd.append("category",sel);fd.append("name",file.name);
    const res=await fetch(`${API}/api/documents/upload`,{method:"POST",headers:{Authorization:`Bearer ${token}`},body:fd});
    const d=await res.json();
    if(!d.error)setDocs(prev=>[d,...prev]);
    setUploading(false);
  };

  const deleteDoc=async(id)=>{
    if(!token)return;
    await apiFetch(`/api/documents/${id}`,{method:"DELETE"},token);
    setDocs(prev=>prev.filter(d=>d.id!==id));
  };

  const required={
    "Ownership":["Share register / shareholder certificates","ID copies of all shareholders","Shareholder agreement","CIPC CoR documents"],
    "Management Control":["Organisational chart (race & gender)","Employment contracts for executives","Payroll by race, gender & level","Board minutes & resolutions"],
    "Skills Development":["SETA levy returns (EMP201)","Training attendance registers","Learnership agreements","Bursary award letters","WSP submission confirmation"],
    "Enterprise & Supplier Dev":["BEE certificates of all suppliers","Supplier payment records","ESD contribution agreements & proof","SLAs with Black-owned suppliers"],
    "Socio-Economic Dev":["SED donation receipts","NPO registration documents","Board resolution authorising SED","Bank proof of transfer"],
    "General / Other":["Any other compliance documents"],
  };

  return(<div style={{animation:"up .4s ease"}}>
    <p style={{fontSize:12,fontWeight:600,letterSpacing:2,textTransform:"uppercase",color:C.muted,marginBottom:8}}>Step 3 of 7</p>
    <h1 className="serif" style={{fontSize:32,marginBottom:6}}>Document Vault</h1>
    <p style={{fontSize:15,color:C.mid,marginBottom:20}}>Upload your supporting documents. Our AI detects the document type and flags what's missing for your SANAS verifier.</p>

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
      {/* Upload area */}
      <Card ch={<div>
        <p style={{fontWeight:700,fontSize:16,marginBottom:12}}>Upload Document</p>
        <div style={{marginBottom:12}}>
          <p style={{fontSize:12,fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:.5,marginBottom:6}}>Category</p>
          <select value={sel} onChange={e=>setSel(e.target.value)} style={{width:"100%",padding:"10px 14px",border:`1.5px solid ${C.border}`,borderRadius:10,fontSize:14,background:C.bg,outline:"none"}}>
            {DOC_CATS.map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
        <div onClick={()=>fileRef.current?.click()} style={{border:`2px dashed ${C.border}`,borderRadius:14,padding:"32px",textAlign:"center",cursor:"pointer",background:C.s100}}>
          <p style={{fontSize:32,marginBottom:8}}>{uploading?"⏳":"📎"}</p>
          <p style={{fontWeight:600,fontSize:14,marginBottom:4}}>{uploading?"Uploading…":"Click to upload"}</p>
          <p style={{fontSize:12,color:C.muted}}>PDF, Word, PNG, JPG · Max 10MB</p>
        </div>
        <input ref={fileRef} type="file" style={{display:"none"}} accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" onChange={e=>e.target.files?.[0]&&upload(e.target.files[0])}/>
      </div>} p="20px"/>

      {/* Required docs checklist */}
      <Card ch={<div>
        <p style={{fontWeight:700,fontSize:16,marginBottom:12}}>Required for {sel}</p>
        {(required[sel]||[]).map(item=>{
          const uploaded=docs.some(d=>d.category===sel&&d.name.toLowerCase().includes(item.toLowerCase().slice(0,10)));
          return(<div key={item} style={{display:"flex",gap:10,marginBottom:10,alignItems:"flex-start"}}>
            <span style={{color:uploaded?C.green:C.muted,fontSize:16,flexShrink:0}}>{uploaded?"✓":"○"}</span>
            <span style={{fontSize:13,color:uploaded?C.ink:C.mid}}>{item}</span>
          </div>);
        })}
      </div>} p="20px"/>
    </div>

    {/* Uploaded files */}
    <Card ch={<div>
      <p style={{fontWeight:700,fontSize:16,marginBottom:14}}>Uploaded Documents ({docs.length})</p>
      {docs.length===0
        ?<p style={{color:C.muted,fontSize:14,textAlign:"center",padding:"20px 0"}}>No documents uploaded yet.</p>
        :<div style={{display:"flex",flexDirection:"column",gap:10}}>
          {docs.map(d=>(
            <div key={d.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:12,border:`1px solid ${C.border}`}}>
              <span style={{fontSize:20,flexShrink:0}}>📄</span>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontWeight:600,fontSize:14,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.name}</p>
                <p style={{fontSize:12,color:C.muted}}>{d.category} · {d.detected_type}</p>
                {d.ai_summary&&<p style={{fontSize:12,color:C.mid,marginTop:2}}>{d.ai_summary}</p>}
              </div>
              <Tag label="✓ Uploaded" color={C.green} bg={C.greenBg}/>
              <button onClick={()=>deleteDoc(d.id)} style={{background:"none",border:"none",cursor:"pointer",color:C.red,fontSize:18}}>×</button>
            </div>
          ))}
        </div>}
    </div>} p="20px"/>
  </div>);
}

/* ── BeeBot AI Chat ───────────────────────────────────────── */
function BeeBot({token,vals,user}){
  const [msgs,setMsgs]=useState([{role:"assistant",text:`Hello ${user?.name?.split(" ")[0]||"there"}! I'm BeeBot 🐝, your B-BBEE compliance assistant. I'm trained exclusively on South African BEE legislation including the B-BBEE Act 53 of 2003 and the DTI Codes of Good Practice.\n\nAsk me anything about B-BBEE — ownership structures, scoring, skills development, supplier requirements, or how to prepare for verification. How can I help?`}]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const ref=useRef(null);
  const quickQ=["What documents do I need for ownership?","Explain the ESD element","How do EME/QSE rules work?","What are sub-minimum requirements?","How long is a BEE certificate valid?"];

  const send=async()=>{
    if(!input.trim()||loading)return;
    const um={role:"user",text:input};
    setMsgs(m=>[...m,um]);setInput("");setLoading(true);
    try{
      if(token){
        const d=await apiFetch("/api/chat",{method:"POST",body:{message:input,history:msgs.map(m=>({role:m.role,content:m.text}))}},token);
        setMsgs(m=>[...m,{role:"assistant",text:d.reply||"Sorry, I couldn't get a response."}]);
      } else {
        const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:600,system:"You are BeeBot, a South African B-BBEE compliance expert. Only answer BEE-related questions. Be practical and helpful.",messages:[{role:"user",content:input}]})});
        const d=await r.json();
        setMsgs(m=>[...m,{role:"assistant",text:d.content?.[0]?.text||"Sorry, try again."}]);
      }
    }catch{setMsgs(m=>[...m,{role:"assistant",text:"Connection error. Please try again."}]);}
    setLoading(false);
  };

  useEffect(()=>ref.current?.scrollIntoView({behavior:"smooth"}),[msgs,loading]);

  return(<div style={{animation:"up .4s ease"}}>
    <p style={{fontSize:12,fontWeight:600,letterSpacing:2,textTransform:"uppercase",color:C.muted,marginBottom:8}}>AI Assistant</p>
    <h1 className="serif" style={{fontSize:32,marginBottom:6}}>BeeBot</h1>
    <p style={{fontSize:15,color:C.mid,marginBottom:14}}>Ask any B-BBEE question. BeeBot only answers questions about South African BEE legislation — nothing else.</p>

    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
      {quickQ.map(q=><button key={q} onClick={()=>setInput(q)} style={{padding:"7px 14px",borderRadius:99,border:`1px solid ${C.border}`,background:C.white,color:C.ink,fontSize:12,fontWeight:500,cursor:"pointer"}}>{q}</button>)}
    </div>

    <Card ch={<div style={{height:420,overflowY:"auto",display:"flex",flexDirection:"column",gap:12}}>
      {msgs.map((m,i)=>(
        <div key={i} style={{alignSelf:m.role==="user"?"flex-end":"flex-start",maxWidth:"82%",background:m.role==="user"?C.ink:C.s100,color:m.role==="user"?"#fff":C.ink,borderRadius:m.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px",padding:"12px 16px",fontSize:14,lineHeight:1.65,animation:"up .3s ease",whiteSpace:"pre-wrap"}}>
          {m.role==="assistant"&&<div style={{fontSize:10,fontWeight:700,color:C.copper,letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>🐝 BEEBOT</div>}
          {m.text}
        </div>
      ))}
      {loading&&<div style={{alignSelf:"flex-start",background:C.s100,borderRadius:"16px 16px 16px 4px",padding:"12px 16px",display:"flex",gap:5}}>
        {[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:C.copper,animation:`dot 1.2s ease ${i*.25}s infinite`}}/>)}
      </div>}
      <div ref={ref}/>
    </div>} p="16px" style={{marginBottom:12}}/>

    <div style={{display:"flex",gap:10}}>
      <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask about B-BBEE legislation, scoring, documents…"
        style={{flex:1,padding:"12px 16px",border:`1.5px solid ${C.border}`,borderRadius:12,fontSize:14,outline:"none",background:C.white}}/>
      <Btn ch={loading?<Spin/>:"↑"} onClick={send} disabled={loading||!input.trim()} style={{borderRadius:12,padding:"12px 18px"}}/>
    </div>

    <div style={{marginTop:14,padding:"12px 14px",background:C.amberBg,borderRadius:12,border:`1px solid ${C.amberBdr}`,fontSize:12,color:C.amberTxt}}>
      🐝 BeeBot is an AI assistant, not a qualified BEE practitioner. Always consult a SANAS-accredited verifier for official certification.
    </div>
  </div>);
}

/* ── Verifier Marketplace ─────────────────────────────────── */
const VERIFIERS=[
  {id:"empowerlogic", name:"EmpowerLogic",       type:"Verification Agency",     location:"Johannesburg, GP", phone:"011 792 5600",website:"empowerlogic.co.za",   accred:"SANAS",fee:"R3,500–R8,000",turn:"5–7 days",   spec:"Generic codes, all sectors",              badge:"Top Rated",stars:"4.9"},
  {id:"honeycomb",    name:"Honeycomb BEE Ratings",type:"Verification Agency",   location:"Cape Town, WC",    phone:"021 276 0490",website:"honeycomb-bee.co.za",  accred:"SANAS",fee:"R2,800–R7,000",turn:"5–10 days", spec:"All sector codes, mining specialist",     badge:"Largest Agency",stars:"4.8"},
  {id:"nkosi",        name:"Nkosi Advisory",      type:"BEE Consultant",          location:"Durban, KZN",      phone:"031 573 6000",website:"nkosiadvisory.co.za",  accred:"SANAS",fee:"R2,400–R6,000",turn:"7–14 days", spec:"QSE & EME specialists",                   badge:"Best Value",stars:"4.7"},
  {id:"mdi",          name:"MDI Consulting",       type:"BEE Advisory Firm",       location:"Sandton, GP",      phone:"011 234 8900",website:"mdiconsulting.co.za",  accred:"SANAS",fee:"R4,000–R12,000",turn:"5–8 days", spec:"Corporate & listed companies",           badge:"",stars:"4.6"},
  {id:"serr",         name:"SERR Synergy",         type:"Compliance Partner",      location:"Pretoria, GP",     phone:"012 644 0000",website:"serr.co.za",           accred:"SANAS",fee:"R2,000–R5,000",turn:"7–10 days", spec:"Broad sector coverage, SME focus",       badge:"",stars:"4.5"},
  {id:"nexia",        name:"Nexia SAB&T BEE Unit", type:"Verification Agency",     location:"Johannesburg, GP", phone:"011 286 5800",website:"nexiasabt.co.za",      accred:"SANAS",fee:"R3,000–R9,000",turn:"5–7 days", spec:"Financial services sector specialist",   badge:"",stars:"4.7"},
  {id:"ubuntu",       name:"Ubuntu Rating Agency", type:"Verification Agency",     location:"Durban, KZN",      phone:"031 940 5600",website:"ubunturating.co.za",   accred:"SANAS",fee:"R2,200–R5,500",turn:"8–12 days", spec:"Construction & engineering focus",       badge:"",stars:"4.4"},
  {id:"beecon",       name:"BEE-Con Advisory",     type:"BEE Consultant",          location:"Cape Town, WC",    phone:"021 833 2000",website:"beecon.co.za",         accred:"Member SAICA",fee:"R1,800–R4,500",turn:"10–14 days",spec:"SME & startup specialists",           badge:"",stars:"4.5"},
];

function VerifierMarket({token}){
  const [sel,setSel]=useState(null);
  const [filter,setFilter]=useState("All");
  const [booking,setBooking]=useState({date:"",time:"",notes:""});
  const [booked,setBooked]=useState(false);
  const [loading,setLoading]=useState(false);
  const types=["All",...new Set(VERIFIERS.map(v=>v.type))];
  const filtered=filter==="All"?VERIFIERS:VERIFIERS.filter(v=>v.type===filter);

  const confirmBook=async()=>{
    if(!booking.date||!booking.time)return;
    setLoading(true);
    const v=VERIFIERS.find(v=>v.id===sel);
    if(token) await apiFetch("/api/bookings",{method:"POST",body:{verifierId:sel,verifierName:v.name,...booking}},token).catch(()=>{});
    setBooked(true);setLoading(false);
  };

  if(booked){
    const v=VERIFIERS.find(v=>v.id===sel);
    return(<div style={{textAlign:"center",padding:"60px 20px",animation:"up .4s ease"}}>
      <div style={{fontSize:56,marginBottom:16}}>🎉</div>
      <h2 className="serif" style={{fontSize:30,marginBottom:8}}>Booking Request Sent!</h2>
      <p style={{fontSize:15,color:C.mid,lineHeight:1.7,marginBottom:24,maxWidth:400,margin:"0 auto 24px"}}><strong>{v?.name}</strong> will contact you at your registered email to confirm your appointment on <strong>{booking.date}</strong> at <strong>{booking.time}</strong>.</p>
      <Btn ch="Back to Marketplace" variant="outline" onClick={()=>{setBooked(false);setSel(null);}} style={{borderRadius:12}}/>
    </div>);
  }

  return(<div style={{animation:"up .4s ease"}}>
    <p style={{fontSize:12,fontWeight:600,letterSpacing:2,textTransform:"uppercase",color:C.muted,marginBottom:8}}>Step 7 of 7</p>
    <h1 className="serif" style={{fontSize:32,marginBottom:6}}>Verification Marketplace</h1>
    <p style={{fontSize:15,color:C.mid,marginBottom:8}}>Browse real SANAS-accredited verification agencies and BEE advisory firms. Book directly and hand over your BEEcompass readiness pack.</p>

    <div style={{padding:"12px 16px",background:C.s100,borderRadius:12,border:`1px solid ${C.border}`,marginBottom:20,fontSize:13,color:C.s700}}>
      <strong>Important:</strong> BEEcompass is NOT a verification body. The firms below are independent, SANAS-accredited agencies. Fees and turnaround times are estimates — confirm directly with the agency.
    </div>

    {/* Filter */}
    <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
      {types.map(t=><button key={t} onClick={()=>setFilter(t)} style={{padding:"7px 16px",borderRadius:99,border:`1.5px solid ${filter===t?C.ink:C.border}`,background:filter===t?C.ink:"transparent",color:filter===t?"#fff":C.mid,fontWeight:500,fontSize:13,cursor:"pointer"}}>{t}</button>)}
    </div>

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      {filtered.map(v=>(
        <Card key={v.id} ch={<div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
            <div><p style={{fontWeight:700,fontSize:16,marginBottom:2}}>{v.name}</p><p style={{fontSize:12,color:C.muted}}>{v.type} · {v.location}</p></div>
            {v.badge&&<Tag label={v.badge} color={C.green} bg={C.greenBg}/>}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
            {[["Accreditation",v.accred],["Fee Range",v.fee],["Turnaround",v.turn],["Speciality",v.spec]].map(([l,val])=>(
              <div key={l} style={{background:C.s100,borderRadius:9,padding:"9px 10px"}}>
                <p style={{fontSize:10,color:C.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:.4,marginBottom:2}}>{l}</p>
                <p style={{fontSize:12,color:C.ink,fontWeight:500}}>{val}</p>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setSel(sel===v.id?null:v.id)} style={{flex:1,padding:"10px",borderRadius:10,border:`1.5px solid ${sel===v.id?C.ink:C.border}`,background:sel===v.id?C.ink:"transparent",color:sel===v.id?"#fff":C.ink,fontWeight:600,fontSize:13,cursor:"pointer"}}>
              {sel===v.id?"▾ Hide Booking":"Book Now"}
            </button>
            <a href={`https://${v.website}`} target="_blank" rel="noopener noreferrer" style={{padding:"10px 16px",borderRadius:10,border:`1.5px solid ${C.border}`,background:"transparent",color:C.mid,fontWeight:500,fontSize:13,textDecoration:"none",display:"flex",alignItems:"center"}}>↗</a>
          </div>

          {sel===v.id&&<div style={{marginTop:14,paddingTop:14,borderTop:`1px solid ${C.border}`,animation:"up .3s ease"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              <div>
                <p style={{fontSize:11,fontWeight:600,color:C.muted,textTransform:"uppercase",marginBottom:5}}>Preferred Date</p>
                <input type="date" value={booking.date} onChange={e=>setBooking(b=>({...b,date:e.target.value}))} style={{width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:9,fontSize:13,outline:"none",background:C.bg}}/>
              </div>
              <div>
                <p style={{fontSize:11,fontWeight:600,color:C.muted,textTransform:"uppercase",marginBottom:5}}>Preferred Time</p>
                <select value={booking.time} onChange={e=>setBooking(b=>({...b,time:e.target.value}))} style={{width:"100%",padding:"9px 12px",border:`1.5px solid ${C.border}`,borderRadius:9,fontSize:13,outline:"none",background:C.bg}}>
                  <option value="">Select…</option>
                  {["09:00","10:00","11:00","14:00","15:00","16:00"].map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <textarea value={booking.notes} onChange={e=>setBooking(b=>({...b,notes:e.target.value}))} placeholder="Any notes for the verifier (optional)…"
              style={{width:"100%",padding:"10px 12px",border:`1.5px solid ${C.border}`,borderRadius:9,fontSize:13,outline:"none",background:C.bg,resize:"vertical",minHeight:60,marginBottom:10}}/>
            <Btn ch={loading?<><Spin size={14}/>Submitting…</>:"Confirm Booking Request"} variant="copper" onClick={confirmBook} disabled={!booking.date||!booking.time||loading} full style={{borderRadius:10}}/>
          </div>}
        </div>} style={{borderColor:sel===v.id?C.copper:C.border,borderWidth:sel===v.id?2:1}}/>
      ))}
    </div>
  </div>);
}

/* ── Report Generator ─────────────────────────────────────── */
function ReportGen({token,vals,user}){
  const [loading,setLoading]=useState(false);
  const [done,setDone]=useState(false);
  const total=ELEMENTS.reduce((s,e)=>s+calcEl(e,vals),0);
  const bee=getLevel(total);

  const generate=async()=>{
    if(!token){alert("Please sign in to generate reports.");return;}
    setLoading(true);
    try{
      const res=await fetch(`${API}/api/reports/generate`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`}});
      const blob=await res.blob();
      const url=URL.createObjectURL(blob);
      const a=document.createElement("a");a.href=url;a.download="BEEcompass_PreReadiness_Report.pdf";a.click();
      URL.revokeObjectURL(url);setDone(true);
    }catch(e){alert("Report generation failed: "+e.message);}
    setLoading(false);
  };

  return(<div style={{animation:"up .4s ease"}}>
    <p style={{fontSize:12,fontWeight:600,letterSpacing:2,textTransform:"uppercase",color:C.muted,marginBottom:8}}>Step 6 of 7</p>
    <h1 className="serif" style={{fontSize:32,marginBottom:6}}>Pre-Readiness Report</h1>
    <p style={{fontSize:15,color:C.mid,marginBottom:20}}>Generate a professional PDF that summarises your BEE readiness position to hand to your SANAS-accredited verifier. Saves you time and money.</p>

    {/* Preview */}
    <Card ch={<div>
      <div style={{background:C.ink,borderRadius:14,padding:"22px",marginBottom:16}}>
        <p style={{fontSize:10,color:C.muted,letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>BEECOMPASS — PRE-READINESS REPORT</p>
        <p style={{fontFamily:"'Instrument Serif'",fontSize:22,color:"#fff",marginBottom:4}}>B-BBEE Pre-Readiness Report</p>
        <p style={{fontSize:14,color:C.copper}}>{user?.company||"Your Company"}</p>
        <p style={{fontSize:11,color:"#475569",marginTop:4}}>Generated: {new Date().toLocaleDateString("en-ZA")}</p>
      </div>

      <div style={{padding:"12px",background:C.amberBg,borderRadius:10,border:`1px solid ${C.amberBdr}`,marginBottom:16,fontSize:12,color:C.amberTxt}}>
        <strong>DISCLAIMER:</strong> This report is a pre-readiness estimate only. It is NOT an official B-BBEE certificate. Only a SANAS-accredited agency may issue an official certificate.
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
        <div style={{background:C.s100,borderRadius:12,padding:"16px"}}>
          <p style={{fontSize:11,color:C.muted,marginBottom:4}}>ESTIMATED LEVEL</p>
          <p style={{fontFamily:"'Instrument Serif'",fontSize:26,color:bee.clr}}>{bee.label}</p>
        </div>
        <div style={{background:C.s100,borderRadius:12,padding:"16px"}}>
          <p style={{fontSize:11,color:C.muted,marginBottom:4}}>WEIGHTED SCORE</p>
          <p style={{fontFamily:"'Instrument Serif'",fontSize:26}}>{total.toFixed(1)} / 109</p>
        </div>
      </div>

      <p style={{fontSize:14,fontWeight:700,marginBottom:10}}>Report includes:</p>
      {["Executive summary with estimated level range","Pillar-by-pillar breakdown with progress bars","Uploaded documents index","Priority action plan","Recommended next steps","SANAS verifier referral page"].map(item=>(
        <div key={item} style={{display:"flex",gap:8,marginBottom:8,fontSize:14}}><span style={{color:C.green}}>✓</span>{item}</div>
      ))}
    </div>} p="22px" style={{marginBottom:20}}/>

    {!done
      ?<Btn ch={loading?<><Spin size={14}/>Generating PDF…</>:"⬇ Download Pre-Readiness Report"} variant="copper" onClick={generate} disabled={loading} full style={{borderRadius:14,padding:"14px",fontSize:15}}/>
      :<div style={{textAlign:"center",padding:"20px",background:C.greenBg,borderRadius:14,border:`1px solid ${C.green}30`}}>
        <div style={{fontSize:28,marginBottom:6}}>✅</div>
        <p style={{fontWeight:700,color:C.green,fontSize:16}}>Report Downloaded!</p>
        <p style={{fontSize:13,color:C.mid,marginTop:4}}>BEEcompass_PreReadiness_Report.pdf</p>
        <Btn ch="Generate Again" variant="outline" onClick={()=>setDone(false)} style={{borderRadius:10,marginTop:12,fontSize:13}}/>
      </div>}

    <div style={{marginTop:20}}><Disclaimer/></div>
  </div>);
}

/* ═══════════════════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════════════════ */
export default function App(){
  const [screen,setScreen]=useState("marketing"); // marketing | auth | app
  const [authMode,setAuthMode]=useState("signup");
  const [session,setSession]=useState(null);
  const [user,setUser]=useState(null);
  const [vals,setVals]=useState(DVALS);

  useEffect(()=>{
    sb.auth.getSession().then(({data:{session}})=>{
      if(session){setSession(session);setScreen("app");
        apiFetch("/api/profile",{},session.access_token).then(p=>{if(p&&!p.error)setUser(p);}).catch(()=>{});
      }
    });
    const {data:{subscription}}=sb.auth.onAuthStateChange((_,session)=>{
      setSession(session);
      if(!session){setScreen("marketing");setUser(null);}
    });
    return ()=>subscription.unsubscribe();
  },[]);

  const handleAuth=(sess,profile)=>{
    setSession(sess);setUser(profile);setScreen("app");
    if(profile?.scorecard)setVals({...DVALS,...profile.scorecard});
  };

  const handleLogout=async()=>{
    await sb.auth.signOut();
    setScreen("marketing");setSession(null);setUser(null);setVals(DVALS);
  };

  if(screen==="marketing") return(<><style>{CSS}</style>
    <MarketingSite onSignUp={()=>{setAuthMode("signup");setScreen("auth");}} onSignIn={()=>{setAuthMode("login");setScreen("auth");}}/></>);

  if(screen==="auth") return <Auth mode={authMode} onAuth={handleAuth} onBack={()=>setScreen("marketing")}/>;

  return <AppShell session={session} user={user} setUser={setUser} onLogout={handleLogout} vals={vals} setVals={setVals}/>;
}
