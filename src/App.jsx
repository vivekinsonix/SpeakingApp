import { useState, useEffect, useRef, useCallback } from "react";

const C = {
  headerDark: "#075E54", headerMid: "#128C7E", accent: "#25D366", outgoing: "#DCF8C6",
  incoming: "#FFFFFF", bg: "#ECE5DD", text: "#111B21", textSec: "#667781",
  blue: "#53BDEB", gold: "#FFB800", green: "#25D366", orange: "#FF9500",
  red: "#FF6B6B", purple: "#7C5CFC",
};

const P = {
  LANG: 0, GOAL: 1,
  // FREE ASSESSMENT
  ASSESS_INTRO: 2, ASSESS_V1: 3, ASSESS_LISTEN1: 4, ASSESS_REC1: 5,
  ASSESS_V2: 6, ASSESS_LISTEN2: 7, ASSESS_REC2: 8,
  ASSESS_V3: 9, ASSESS_LISTEN3: 10, ASSESS_REC3: 11,
  ASSESS_RESULT: 12,
  // SUBSCRIPTION GATE
  SUB_GATE: 13,
  // MICRO LESSON
  MICRO_INTRO: 14, MICRO_VIDEO: 15, MICRO_LISTEN: 16, MICRO_REC: 17,
  MICRO_FEEDBACK: 18, MICRO_DONE: 19,
  CERT: 20,
};

const CheckIcon = () => <svg width="16" height="11" viewBox="0 0 16 11" fill="none"><path d="M1 5.5L4.5 9L10.5 1" stroke={C.blue} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 5.5L8.5 9L14.5 1" stroke={C.blue} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const MicSVG = ({s=24,c="#fff"}) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>;
const PlaySVG = ({s=20,c="#fff"}) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M8 5v14l11-7z"/></svg>;
const PauseSVG = ({s=20,c="#fff"}) => <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>;
const SendSVG = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>;
const ShareSVG = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>;
const LockSVG = () => <svg width="18" height="18" viewBox="0 0 24 24" fill={C.headerDark}><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z"/></svg>;

const StarIcon = ({filled}) => <svg width="16" height="16" viewBox="0 0 24 24" fill={filled?C.gold:"none"} stroke={C.gold} strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>;

const ASSESS_PHRASES = [
  { en: "Hello, how are you?", hi: "हेलो, हाउ आर यू?", label: "Basic Greeting", level: "Beginner" },
  { en: "I would like to exchange this product, please.", hi: "आई वुड लाइक टू एक्सचेंज दिस प्रोडक्ट, प्लीज़।", label: "Polite Request", level: "Intermediate" },
  { en: "Could you walk me through the return policy for electronics purchased online?", hi: "कुड यू वॉक मी थ्रू द रिटर्न पॉलिसी फॉर इलेक्ट्रॉनिक्स पर्चेस्ड ऑनलाइन?", label: "Complex Query", level: "Advanced" },
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700;800&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  @keyframes typB{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}
  @keyframes bubIn{0%{opacity:0;transform:translateY(12px) scale(.95)}100%{opacity:1;transform:translateY(0) scale(1)}}
  @keyframes pulse{0%,100%{transform:scale(1);box-shadow:0 0 0 0 rgba(37,211,102,.5)}50%{transform:scale(1.08);box-shadow:0 0 0 12px rgba(37,211,102,0)}}
  @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
  @keyframes certIn{0%{opacity:0;transform:scale(.85)}60%{transform:scale(1.02)}100%{opacity:1;transform:scale(1)}}
  @keyframes confetti{0%{opacity:1;transform:translateY(0) rotate(0)}100%{opacity:0;transform:translateY(-70px) rotate(720deg)}}
  @keyframes slideUp{0%{opacity:0;transform:translateY(30px)}100%{opacity:1;transform:translateY(0)}}
  @keyframes rec{0%,100%{opacity:1}50%{opacity:.3}}
  @keyframes glow{0%,100%{box-shadow:0 0 8px rgba(37,211,102,.3)}50%{box-shadow:0 0 20px rgba(37,211,102,.6)}}
  @keyframes fadeIn{0%{opacity:0}100%{opacity:1}}
  ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(0,0,0,.15);border-radius:4px}
`;

const VideoThumb = ({title, sub}) => (
  <div style={{position:"relative",borderRadius:8,overflow:"hidden",background:"#000",cursor:"pointer",marginBottom:6}}>
    <div style={{width:"100%",height:160,background:`linear-gradient(135deg,${C.headerDark} 0%,${C.headerMid} 50%,#0a8c6e 100%)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",position:"relative"}}>
      <div style={{position:"absolute",inset:0,opacity:.07,backgroundImage:"radial-gradient(circle at 20% 30%,#fff 1px,transparent 1px),radial-gradient(circle at 80% 70%,#fff 1px,transparent 1px)",backgroundSize:"40px 40px"}}/>
      <div style={{width:50,height:50,borderRadius:"50%",background:"rgba(255,255,255,.25)",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)",border:"2px solid rgba(255,255,255,.4)",marginBottom:8}}><PlaySVG s={24}/></div>
      <div style={{color:"#fff",fontSize:12.5,fontWeight:600,textAlign:"center",padding:"0 16px",textShadow:"0 1px 3px rgba(0,0,0,.3)"}}>{title}</div>
      {sub && <div style={{color:"rgba(255,255,255,.7)",fontSize:11,marginTop:2}}>{sub}</div>}
    </div>
    <div style={{position:"absolute",bottom:6,right:8,background:"rgba(0,0,0,.6)",borderRadius:4,padding:"2px 6px",fontSize:10,color:"#fff",fontWeight:500}}>0:45</div>
  </div>
);

const AudioBar = ({playing, onToggle, dur="0:12"}) => (
  <div onClick={onToggle} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 2px",cursor:"pointer",minWidth:180}}>
    <div style={{width:30,height:30,borderRadius:"50%",background:C.headerMid,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
      {playing ? <PauseSVG s={14}/> : <PlaySVG s={14}/>}
    </div>
    <div style={{flex:1}}>
      <div style={{display:"flex",alignItems:"center",gap:2.5,marginBottom:2}}>
        {[...Array(24)].map((_,i)=><div key={i} style={{width:2.5,borderRadius:2,height:3+Math.sin(i*.7)*9+Math.random()*5,background:playing&&i<12?C.headerMid:"#92aeb8",transition:"background .2s"}}/>)}
      </div>
      <div style={{fontSize:10,color:C.textSec}}>{dur}</div>
    </div>
  </div>
);

const ScoreBadge = ({score, label}) => {
  const color = score>=80?C.green:score>=60?C.orange:C.red;
  return (
    <div style={{display:"inline-flex",alignItems:"center",gap:6,background:`${color}15`,border:`1.5px solid ${color}`,borderRadius:18,padding:"5px 12px",margin:"4px 0"}}>
      <div style={{fontSize:20,fontWeight:800,color,fontFamily:"'Noto Sans',sans-serif"}}>{score}%</div>
      <div style={{fontSize:11,color,fontWeight:600}}>{label||"Correct!"}</div>
      <span style={{fontSize:14}}>{score>=80?"🌟":score>=60?"👍":"💪"}</span>
    </div>
  );
};

const Typing = () => <div style={{display:"flex",gap:4,padding:"10px 14px",alignItems:"center"}}>{[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:"#90A4AE",animation:`typB 1.4s ease-in-out ${i*.2}s infinite`}}/>)}</div>;

const Bubble = ({type,children,time="",tick=false}) => {
  const out = type==="out";
  return (
    <div style={{display:"flex",justifyContent:out?"flex-end":"flex-start",padding:"2px 10px",animation:"bubIn .35s cubic-bezier(.34,1.56,.64,1)"}}>
      <div style={{maxWidth:"84%",minWidth:70,background:out?C.outgoing:C.incoming,borderRadius:out?"10px 10px 2px 10px":"10px 10px 10px 2px",padding:"6px 9px 3px",boxShadow:"0 1px 1px rgba(0,0,0,.08)"}}>
        {children}
        <div style={{display:"flex",justifyContent:"flex-end",alignItems:"center",gap:3,marginTop:1}}>
          <span style={{fontSize:10.5,color:C.textSec}}>{time}</span>
          {tick && <CheckIcon/>}
        </div>
      </div>
    </div>
  );
};

const Btn = ({children, onClick, color=C.accent, textColor="#fff", outline=false, small=false, icon, glow=false, ...rest}) => (
  <button onClick={onClick} style={{
    background: outline?"transparent":color, color: outline?color:textColor,
    border: outline?`1.5px solid ${color}`:"none", borderRadius:22,
    padding: small?"7px 18px":"10px 26px", fontSize: small?12.5:13.5, fontWeight:700,
    cursor:"pointer", display:"inline-flex", alignItems:"center", gap:7,
    boxShadow: glow?`0 3px 14px ${color}55`:"0 1px 4px rgba(0,0,0,.1)",
    animation: glow?"glow 2s ease-in-out infinite":"none",
    transition:"all .15s", whiteSpace:"nowrap", ...rest?.style
  }}>{icon}{children}</button>
);

const FREE_TAG = () => (
  <span style={{background:"#E8F5E9",color:C.headerDark,fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:10,marginLeft:6,verticalAlign:"middle",border:`1px solid ${C.accent}40`}}>FREE ✓</span>
);

const LevelBar = ({level, score, label}) => {
  const colors = {beginner:"#25D366",intermediate:"#FF9500",advanced:"#7C5CFC"};
  return (
    <div style={{marginBottom:8}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
        <span style={{fontSize:12,fontWeight:600,color:C.text}}>{label}</span>
        <span style={{fontSize:11,fontWeight:700,color:colors[level]||C.textSec}}>{score}%</span>
      </div>
      <div style={{height:6,background:"#E8E8E8",borderRadius:8,overflow:"hidden"}}>
        <div style={{width:`${score}%`,height:"100%",borderRadius:8,background:colors[level]||C.accent,transition:"width .8s ease"}}/>
      </div>
    </div>
  );
};

export default function App() {
  const [phase, setPhase] = useState(P.LANG);
  const [lang, setLang] = useState(null);
  const [goal, setGoal] = useState(null);
  const [typing, setTyping] = useState(false);
  const [playAudio, setPlayAudio] = useState(null);
  const [recording, setRecording] = useState(false);
  const [recProg, setRecProg] = useState(0);
  const [confetti, setConfetti] = useState(false);
  const [subPlan, setSubPlan] = useState(null);
  const chatRef = useRef(null);
  const recTimer = useRef(null);

  const assessPhaseMap = [
    {v:P.ASSESS_V1,l:P.ASSESS_LISTEN1,r:P.ASSESS_REC1},
    {v:P.ASSESS_V2,l:P.ASSESS_LISTEN2,r:P.ASSESS_REC2},
    {v:P.ASSESS_V3,l:P.ASSESS_LISTEN3,r:P.ASSESS_REC3},
  ];

  const progress = phase <= P.ASSESS_INTRO ? 0
    : phase <= P.ASSESS_REC3 ? Math.round(((phase - P.ASSESS_INTRO) / (P.ASSESS_RESULT - P.ASSESS_INTRO)) * 40)
    : phase <= P.ASSESS_RESULT ? 40
    : phase <= P.SUB_GATE ? 45
    : phase <= P.MICRO_DONE ? 40 + Math.round(((phase - P.MICRO_INTRO) / (P.MICRO_DONE - P.MICRO_INTRO)) * 55)
    : 100;

  const scroll = useCallback(() => {
    setTimeout(() => { if(chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, 80);
  },[]);

  const advance = useCallback((next, delay=1100) => {
    setTyping(true); scroll();
    setTimeout(() => { setTyping(false); setPhase(next); scroll(); }, delay);
  },[scroll]);

  useEffect(() => { scroll(); }, [phase, scroll]);

  const getNextAfterRec = (p) => {
    if(p===P.ASSESS_REC1) return P.ASSESS_V2;
    if(p===P.ASSESS_REC2) return P.ASSESS_V3;
    if(p===P.ASSESS_REC3) return P.ASSESS_RESULT;
    if(p===P.MICRO_REC) return P.MICRO_FEEDBACK;
    return p+1;
  };

  const doRecord = () => {
    setRecording(true); setRecProg(0); let p=0;
    recTimer.current = setInterval(()=>{
      p+=3; setRecProg(p);
      if(p>=100){clearInterval(recTimer.current);setRecording(false);setRecProg(0);advance(getNextAfterRec(phase),1200);}
    },50);
  };
  const stopRecord = () => {
    if(recTimer.current){clearInterval(recTimer.current);setRecording(false);if(recProg>25){advance(getNextAfterRec(phase),1200);}setRecProg(0);}
  };

  const isRecPhase = [P.ASSESS_REC1,P.ASSESS_REC2,P.ASSESS_REC3,P.MICRO_REC].includes(phase);
  const headerLabel = phase <= P.ASSESS_RESULT ? "Free Assessment" : phase <= P.SUB_GATE ? "Choose Plan" : "Micro-Lesson #1";

  // ─── ONBOARDING ───
  if(phase <= P.GOAL) {
    return (
      <div style={{fontFamily:"'Noto Sans',sans-serif",height:"100%",minHeight:"100dvh",background:`linear-gradient(160deg,${C.headerDark},${C.headerMid})`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20,color:"#fff"}}>
        <style>{css}</style>
        <div style={{width:"100%",maxWidth:380,animation:"slideUp .5s ease-out"}}>
          <div style={{textAlign:"center",marginBottom:32}}>
            <div style={{width:68,height:68,borderRadius:"50%",background:"rgba(255,255,255,.15)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",fontSize:32,border:"2px solid rgba(255,255,255,.25)"}}>📚</div>
            <h1 style={{fontSize:21,fontWeight:700,marginBottom:5,letterSpacing:-.3}}>SpeakEasy English</h1>
            <p style={{fontSize:13,opacity:.8}}>अंग्रेज़ी सीखें — बिलकुल आसान तरीके से!</p>
          </div>

          {phase===P.LANG ? (
            <div>
              <p style={{fontSize:13.5,fontWeight:600,marginBottom:12,textAlign:"center"}}>अपनी भाषा चुनें / Choose your language</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
                {[{c:"hi",l:"हिंदी",s:"Hindi",i:"🇮🇳"},{c:"ta",l:"தமிழ்",s:"Tamil",i:"🇮🇳"},{c:"te",l:"తెలుగు",s:"Telugu",i:"🇮🇳"},{c:"bn",l:"বাংলা",s:"Bengali",i:"🇮🇳"}].map(x=>(
                  <button key={x.c} onClick={()=>{setLang(x.c);setPhase(P.GOAL);}} style={{background:"rgba(255,255,255,.1)",border:"1.5px solid rgba(255,255,255,.2)",borderRadius:13,padding:"16px 8px",color:"#fff",cursor:"pointer",textAlign:"center",backdropFilter:"blur(4px)"}}>
                    <div style={{fontSize:26,marginBottom:4}}>{x.i}</div>
                    <div style={{fontSize:15,fontWeight:700}}>{x.l}</div>
                    <div style={{fontSize:11,opacity:.7}}>{x.s}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{animation:"slideUp .4s ease-out"}}>
              <p style={{fontSize:13.5,fontWeight:600,marginBottom:4,textAlign:"center"}}>आप English किसलिए सीखना चाहते हैं?</p>
              <p style={{fontSize:11.5,opacity:.7,marginBottom:14,textAlign:"center"}}>Why do you want to learn English?</p>
              <div style={{display:"flex",flexDirection:"column",gap:9}}>
                {[
                  {id:"social",icon:"💬",l:"Social Communication",s:"रोज़मर्रा की बातचीत",tag:"No career goal needed"},
                  {id:"delivery",icon:"🛵",l:"Delivery Partner",s:"डिलीवरी पार्टनर"},
                  {id:"retail",icon:"🏬",l:"Retail / Mall Job",s:"रिटेल / मॉल जॉब"},
                  {id:"call",icon:"📞",l:"Call Center",s:"कॉल सेंटर"},
                  {id:"hotel",icon:"🏨",l:"Hotel / Hospitality",s:"होटल / हॉस्पिटैलिटी"},
                ].map(g=>(
                  <button key={g.id} onClick={()=>{setGoal(g.id);advance(P.ASSESS_INTRO,800);}} style={{display:"flex",alignItems:"center",gap:12,background:g.id==="social"?"rgba(255,255,255,.18)":"rgba(255,255,255,.1)",border:g.id==="social"?"1.5px solid rgba(255,255,255,.35)":"1.5px solid rgba(255,255,255,.18)",borderRadius:13,padding:"12px 14px",color:"#fff",cursor:"pointer",textAlign:"left",backdropFilter:"blur(4px)",position:"relative"}}>
                    <div style={{fontSize:26,width:42,height:42,borderRadius:11,background:"rgba(255,255,255,.1)",display:"flex",alignItems:"center",justifyContent:"center"}}>{g.icon}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:700}}>{g.l}</div>
                      <div style={{fontSize:11.5,opacity:.7}}>{g.s}</div>
                    </div>
                    {g.tag && <span style={{position:"absolute",top:6,right:8,fontSize:9,background:"rgba(255,255,255,.2)",padding:"2px 7px",borderRadius:8,fontWeight:600}}>{g.tag}</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── SUBSCRIPTION GATE ───
  if(phase === P.SUB_GATE) {
    return (
      <div style={{fontFamily:"'Noto Sans',sans-serif",height:"100%",minHeight:"100dvh",background:C.bg,display:"flex",flexDirection:"column"}}>
        <style>{css}</style>
        {/* Header */}
        <div style={{background:C.headerDark,color:"#fff",padding:"10px 12px",display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
          <span style={{fontSize:18,cursor:"pointer",opacity:.9}}>←</span>
          <div style={{position:"relative"}}>
            <div style={{width:38,height:38,borderRadius:"50%",background:`linear-gradient(135deg,${C.accent},${C.headerMid})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:700}}>AI</div>
          </div>
          <div style={{flex:1}}><div style={{fontSize:14,fontWeight:600}}>AI English Coach 🎓</div><div style={{fontSize:11,opacity:.8}}>Your assessment is complete!</div></div>
        </div>

        <div style={{flex:1,overflowY:"auto",padding:16}}>
          {/* Result summary card */}
          <div style={{background:"#fff",borderRadius:14,padding:18,boxShadow:"0 2px 12px rgba(0,0,0,.08)",marginBottom:14,animation:"slideUp .5s ease-out"}}>
            <div style={{textAlign:"center",marginBottom:14}}>
              <div style={{fontSize:11,color:C.textSec,textTransform:"uppercase",letterSpacing:2,fontWeight:600,marginBottom:4}}>Assessment Result</div>
              <div style={{fontSize:24,fontWeight:800,color:C.headerDark}}>Beginner — Level A1</div>
              <div style={{fontSize:12.5,color:C.textSec,marginTop:4}}>आपका level: <strong>शुरुआती</strong> — आप basic greetings बोल सकते हैं!</div>
            </div>
            <LevelBar level="beginner" score={85} label="🟢 Basic Greetings"/>
            <LevelBar level="intermediate" score={40} label="🟡 Polite Requests"/>
            <LevelBar level="advanced" score={15} label="🟣 Complex Queries"/>
            <div style={{background:"#F0FFF4",borderRadius:10,padding:"10px 12px",marginTop:10,border:`1px solid ${C.accent}30`}}>
              <div style={{fontSize:12,fontWeight:700,color:C.headerDark,marginBottom:2}}>📋 Recommended Course</div>
              <div style={{fontSize:12.5,color:C.text,lineHeight:1.5}}>
                {goal==="social" ? "\"Everyday English — Social Conversations\" (12 modules)" : goal==="retail" ? "\"Retail English — Customer Service\" (15 modules)" : goal==="delivery" ? "\"Delivery English — Customer Calls\" (10 modules)" : goal==="call" ? "\"Call Center English — Professional\" (18 modules)" : "\"Hospitality English — Guest Service\" (14 modules)"}
              </div>
            </div>
          </div>

          {/* Pay per outcome */}
          <div style={{textAlign:"center",marginBottom:12,animation:"slideUp .6s ease-out"}}>
            <div style={{fontSize:14,fontWeight:700,color:C.headerDark,marginBottom:2}}>🎯 Pay per Outcome — सिर्फ सीखने पर खर्च करें!</div>
            <div style={{fontSize:12,color:C.textSec}}>हर lesson complete करने पर pay करें, monthly नहीं</div>
          </div>

          {/* Plan cards */}
          <div style={{display:"flex",flexDirection:"column",gap:10,animation:"slideUp .7s ease-out"}}>
            {[
              {id:"starter",name:"Starter Pack",price:"₹9",per:"per lesson",lessons:"5 micro-lessons",desc:"एक lesson सिर्फ ₹9 में — रोज़ 5 min!",color:C.accent,badge:null,save:null},
              {id:"value",name:"Value Pack",price:"₹39",per:"10 lessons",lessons:"10 micro-lessons",desc:"₹3.9 / lesson — Best for daily practice!",color:C.headerMid,badge:"POPULAR 🔥",save:"Save 57%"},
              {id:"pro",name:"Pro Pack",price:"₹149",per:"50 lessons",lessons:"50 micro-lessons",desc:"₹2.98 / lesson — Full course access!",color:C.purple,badge:null,save:"Save 67%"},
            ].map(p=>(
              <button key={p.id} onClick={()=>{setSubPlan(p.id);advance(P.MICRO_INTRO,900);}} style={{
                background:"#fff",border:subPlan===p.id?`2px solid ${p.color}`:`1.5px solid #E8E8E8`,borderRadius:14,padding:"14px 16px",
                cursor:"pointer",textAlign:"left",position:"relative",boxShadow:p.badge?"0 2px 12px rgba(0,0,0,.1)":"0 1px 4px rgba(0,0,0,.05)",
                transition:"all .2s"
              }}>
                {p.badge && <span style={{position:"absolute",top:-8,right:12,background:p.color,color:"#fff",fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:10}}>{p.badge}</span>}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontSize:15,fontWeight:700,color:C.text}}>{p.name}</div>
                    <div style={{fontSize:12,color:C.textSec,marginTop:1}}>{p.desc}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:22,fontWeight:800,color:p.color}}>{p.price}</div>
                    <div style={{fontSize:10,color:C.textSec}}>{p.per}</div>
                    {p.save && <div style={{fontSize:10,fontWeight:700,color:C.green,marginTop:1}}>{p.save}</div>}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div style={{textAlign:"center",marginTop:14,animation:"slideUp .8s ease-out"}}>
            <div style={{fontSize:11,color:C.textSec,marginBottom:8}}>🔒 Cancel anytime • No monthly subscription • Pay only when you learn</div>
            <Btn onClick={()=>advance(P.MICRO_INTRO,900)} color={C.accent} glow>
              ▶️ Start First Lesson — ₹9 only!
            </Btn>
          </div>
        </div>
      </div>
    );
  }

  // ─── MAIN CHAT ───
  return (
    <div style={{fontFamily:"'Noto Sans',sans-serif",height:"100%",minHeight:"100dvh",display:"flex",flexDirection:"column",background:C.bg,position:"relative",overflow:"hidden"}}>
      <style>{css}</style>

      {confetti && <div style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:100}}>
        {[...Array(28)].map((_,i)=><div key={i} style={{position:"absolute",left:`${6+Math.random()*88}%`,top:"50%",width:8,height:8,borderRadius:i%3===0?"50%":1,background:["#25D366","#FFB800","#FF6B6B","#34B7F1","#075E54","#fff","#7C5CFC"][i%7],animation:`confetti ${.7+Math.random()*.8}s ease-out ${Math.random()*.4}s forwards`,transform:`rotate(${Math.random()*360}deg)`}}/>)}
      </div>}

      {/* HEADER */}
      <div style={{background:C.headerDark,color:"#fff",padding:"9px 11px",display:"flex",alignItems:"center",gap:9,flexShrink:0,zIndex:10}}>
        <span style={{fontSize:18,cursor:"pointer",opacity:.9,marginRight:2}}>←</span>
        <div style={{position:"relative"}}>
          <div style={{width:38,height:38,borderRadius:"50%",background:`linear-gradient(135deg,${C.accent},${C.headerMid})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:700}}>AI</div>
          <div style={{position:"absolute",bottom:0,right:0,width:9,height:9,borderRadius:"50%",background:C.accent,border:`2px solid ${C.headerDark}`}}/>
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:14.5,fontWeight:600}}>AI English Coach 🎓</div>
          <div style={{fontSize:11,opacity:.8}}>online • {headerLabel}</div>
        </div>
        {phase <= P.ASSESS_RESULT && <FREE_TAG/>}
      </div>

      {/* PROGRESS */}
      <div style={{background:"#0a4f47",padding:"3px 11px",display:"flex",alignItems:"center",gap:7,flexShrink:0}}>
        <span style={{fontSize:10.5,color:"rgba(255,255,255,.7)",whiteSpace:"nowrap"}}>{phase<=P.ASSESS_RESULT?"Assessment":phase<=P.SUB_GATE?"Results":"Lesson 1"}</span>
        <div style={{flex:1,height:4.5,background:"rgba(255,255,255,.15)",borderRadius:10,overflow:"hidden"}}>
          <div style={{height:"100%",borderRadius:10,transition:"width .6s ease",width:`${Math.max(progress,0)}%`,background:`linear-gradient(90deg,${C.accent},#6FE89A)`,backgroundSize:"200% 100%",animation:"shimmer 2s linear infinite"}}/>
        </div>
        <span style={{fontSize:10.5,color:"rgba(255,255,255,.8)",fontWeight:600,minWidth:26,textAlign:"right"}}>{Math.max(progress,0)}%</span>
      </div>

      {/* CHAT */}
      <div ref={chatRef} style={{flex:1,overflowY:"auto",padding:"6px 0",backgroundImage:`url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23c9c2b6' fill-opacity='.12'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,backgroundColor:C.bg}}>

        <div style={{display:"flex",justifyContent:"center",margin:"5px 0 8px"}}>
          <div style={{background:"rgba(255,255,255,.85)",borderRadius:7,padding:"3px 12px",fontSize:11.5,color:C.textSec,boxShadow:"0 1px 2px rgba(0,0,0,.05)"}}>Today</div>
        </div>

        {/* ── ASSESSMENT INTRO ── */}
        {phase >= P.ASSESS_INTRO && (
          <Bubble type="in" time="10:00 AM">
            <div style={{fontSize:13,lineHeight:1.55,color:C.text}}>
              <span style={{fontWeight:700}}>🎉 नमस्ते! Welcome!</span><br/>
              मैं आपका AI English Coach हूँ।<br/><br/>
              <span style={{background:"#E8F5E9",padding:"2px 8px",borderRadius:6,fontSize:12,fontWeight:600,color:C.headerDark}}>🆓 यह Assessment FREE है!</span><br/><br/>
              मैं 3 phrases बोलूँगा — Easy ➜ Medium ➜ Hard<br/>
              आप सुनकर repeat करें। इससे मैं आपका level समझूँगा।<br/><br/>
              <span style={{fontSize:11.5,color:C.textSec}}>📌 कोई tension नहीं — सही-गलत कोई नहीं, बस level check!</span>
            </div>
          </Bubble>
        )}
        {phase === P.ASSESS_INTRO && (
          <div style={{display:"flex",justifyContent:"center",margin:"8px 0",animation:"slideUp .4s ease-out"}}>
            <Btn onClick={()=>advance(P.ASSESS_V1)} glow>🎤 Assessment शुरू करें — FREE</Btn>
          </div>
        )}

        {/* ── ASSESSMENT ROUNDS ── */}
        {assessPhaseMap.map((ap, idx) => {
          const phrase = ASSESS_PHRASES[idx];
          const roundNum = idx+1;
          const roundLabel = ["Easy 🟢","Medium 🟡","Hard 🟣"][idx];
          return (
            <div key={idx}>
              {/* Video */}
              {phase >= ap.v && (
                <Bubble type="in" time={`10:0${roundNum} AM`}>
                  <div style={{fontSize:12,marginBottom:4,fontWeight:600,color:C.text}}>
                    📹 Phrase {roundNum}/3 — {roundLabel}
                    <span style={{fontSize:10.5,color:C.textSec,fontWeight:400,marginLeft:6}}>{phrase.level}</span>
                  </div>
                  <VideoThumb title={`🎬 "${phrase.label}"`} sub={`Assessment — Phrase ${roundNum}`}/>
                </Bubble>
              )}
              {/* Listen */}
              {phase >= ap.l && (
                <Bubble type="in" time={`10:0${roundNum} AM`}>
                  <div style={{fontSize:12.5,marginBottom:3,color:C.text}}>🔊 <strong>सुनें और दोहराएँ:</strong></div>
                  <AudioBar playing={playAudio===`al${idx}`} onToggle={()=>setPlayAudio(playAudio===`al${idx}`?null:`al${idx}`)} dur="0:08"/>
                  <div style={{fontSize:12.5,fontStyle:"italic",color:C.headerDark,fontWeight:600,marginTop:3}}>"{phrase.en}"</div>
                  <div style={{fontSize:11.5,color:C.textSec,marginTop:1}}>({phrase.hi})</div>
                </Bubble>
              )}
              {/* User voice note (shown after recording) */}
              {phase > ap.r && (
                <Bubble type="out" time={`10:0${roundNum+1} AM`} tick>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{width:26,height:26,borderRadius:"50%",background:C.headerMid,display:"flex",alignItems:"center",justifyContent:"center"}}><MicSVG s={12}/></div>
                    <AudioBar playing={playAudio===`au${idx}`} onToggle={()=>setPlayAudio(playAudio===`au${idx}`?null:`au${idx}`)} dur={`0:0${3+idx*2}`}/>
                  </div>
                </Bubble>
              )}
              {/* advance buttons between listen→record */}
              {phase === ap.l && (
                <div style={{display:"flex",justifyContent:"center",margin:"6px 0",animation:"slideUp .3s ease-out"}}>
                  <Btn onClick={()=>setPhase(ap.r)} small outline color={C.headerDark}>🎤 अब बोलें / Speak Now</Btn>
                </div>
              )}
              {/* advance between video→listen */}
              {phase === ap.v && (
                <div style={{display:"flex",justifyContent:"center",margin:"6px 0",animation:"slideUp .3s ease-out"}}>
                  <Btn onClick={()=>advance(ap.l)} small outline color={C.headerDark}>▶️ सुनें / Listen</Btn>
                </div>
              )}
            </div>
          );
        })}

        {/* ── ASSESSMENT RESULT ── */}
        {phase >= P.ASSESS_RESULT && (
          <Bubble type="in" time="10:06 AM">
            <div style={{fontSize:13,lineHeight:1.55,color:C.text}}>
              <span style={{fontWeight:700,fontSize:14}}>📊 Assessment Complete!</span><br/><br/>
              <div style={{marginBottom:6}}>
                <ScoreBadge score={85} label="Basic"/>{" "}
                <ScoreBadge score={40} label="Polite"/>{" "}
                <ScoreBadge score={15} label="Complex"/>
              </div>
              <div style={{background:"#FFF8E1",borderRadius:8,padding:"8px 10px",margin:"6px 0",border:"1px solid #FFE082"}}>
                <span style={{fontWeight:700,color:"#E65100"}}>📌 Your Level: Beginner (A1)</span><br/>
                <span style={{fontSize:12,color:C.text}}>आप basic greetings अच्छे से बोल सकते हैं! अब आगे बढ़ते हैं 💪</span>
              </div>
              <span style={{fontSize:12,color:C.textSec}}>अगला step: अपना course plan चुनें →</span>
            </div>
          </Bubble>
        )}
        {phase === P.ASSESS_RESULT && (
          <div style={{display:"flex",justifyContent:"center",margin:"8px 0",animation:"slideUp .4s ease-out"}}>
            <Btn onClick={()=>setPhase(P.SUB_GATE)} glow icon={<LockSVG/>}>🔓 See Course Plans</Btn>
          </div>
        )}

        {/* ── MICRO LESSON ── */}
        {phase >= P.MICRO_INTRO && phase !== P.SUB_GATE && (
          <Bubble type="in" time="10:10 AM">
            <div style={{fontSize:13,lineHeight:1.55,color:C.text}}>
              <span style={{fontWeight:700}}>🎯 Micro-Lesson #1</span>
              <span style={{background:"#E3F2FD",fontSize:10,fontWeight:600,padding:"2px 7px",borderRadius:8,marginLeft:6,color:"#1565C0"}}>₹9 LESSON</span><br/><br/>
              आज का goal: <strong>1 phrase perfect करें!</strong><br/>
              बस 2 minute — एक phrase सीखें, score पाएं, done! ✅<br/><br/>
              <span style={{fontSize:11.5,color:C.textSec}}>💡 हर lesson complete = 1 outcome = 1 payment</span>
            </div>
          </Bubble>
        )}
        {phase === P.MICRO_INTRO && (
          <div style={{display:"flex",justifyContent:"center",margin:"6px 0",animation:"slideUp .3s ease-out"}}>
            <Btn onClick={()=>advance(P.MICRO_VIDEO)} glow>▶️ Let's go!</Btn>
          </div>
        )}

        {phase >= P.MICRO_VIDEO && phase !== P.SUB_GATE && (
          <Bubble type="in" time="10:11 AM">
            <div style={{fontSize:12,marginBottom:4,fontWeight:600,color:C.text}}>📹 Today's Phrase — "Greeting a Customer"</div>
            <VideoThumb title='🎬 "Good morning, welcome!"' sub={goal==="social"?"Daily Greeting":"Retail — Customer Service"}/>
            <div style={{fontSize:12.5,color:C.text,lineHeight:1.5,marginTop:3}}>
              👆 Video देखें: <em>"Good morning! Welcome to our store. How can I help you today?"</em>
            </div>
          </Bubble>
        )}
        {phase === P.MICRO_VIDEO && (
          <div style={{display:"flex",justifyContent:"center",margin:"6px 0"}}><Btn onClick={()=>advance(P.MICRO_LISTEN)} small outline color={C.headerDark}>▶️ सुनें / Listen</Btn></div>
        )}

        {phase >= P.MICRO_LISTEN && phase !== P.SUB_GATE && (
          <Bubble type="in" time="10:11 AM">
            <div style={{fontSize:12.5,marginBottom:3,color:C.text}}>🔊 <strong>सुनें और दोहराएँ:</strong></div>
            <AudioBar playing={playAudio==="ml"} onToggle={()=>setPlayAudio(playAudio==="ml"?null:"ml")}/>
            <div style={{fontSize:12.5,fontStyle:"italic",color:C.headerDark,fontWeight:600,marginTop:3}}>
              "Good morning! Welcome to our store."
            </div>
            <div style={{fontSize:11.5,color:C.textSec,marginTop:1}}>(गुड मॉर्निंग! वेलकम टू अवर स्टोर।)</div>
          </Bubble>
        )}
        {phase === P.MICRO_LISTEN && (
          <div style={{display:"flex",justifyContent:"center",margin:"6px 0"}}><Btn onClick={()=>setPhase(P.MICRO_REC)} small outline color={C.headerDark}>🎤 अब बोलें / Speak Now</Btn></div>
        )}

        {phase > P.MICRO_REC && phase !== P.SUB_GATE && (
          <Bubble type="out" time="10:12 AM" tick>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:C.headerMid,display:"flex",alignItems:"center",justifyContent:"center"}}><MicSVG s={12}/></div>
              <AudioBar playing={playAudio==="mu"} onToggle={()=>setPlayAudio(playAudio==="mu"?null:"mu")} dur="0:04"/>
            </div>
          </Bubble>
        )}

        {phase >= P.MICRO_FEEDBACK && phase !== P.SUB_GATE && (
          <Bubble type="in" time="10:12 AM">
            <ScoreBadge score={92} label="Excellent!"/>
            <div style={{fontSize:12.5,lineHeight:1.6,color:C.text,marginTop:4}}>
              <span style={{color:C.green,fontWeight:700}}>✅ "Good morning"</span> — Perfect! 🎯<br/>
              <span style={{color:C.green,fontWeight:700}}>✅ "Welcome to our store"</span> — बहुत बढ़िया!<br/><br/>
              <div style={{background:"#E8F5E9",borderRadius:8,padding:"8px 10px",border:`1px solid ${C.accent}40`}}>
                <span style={{fontWeight:700,color:C.headerDark}}>🎉 Micro-Lesson Complete!</span><br/>
                <span style={{fontSize:12}}>₹9 well spent — आपने 1 phrase master कर लिया!</span>
              </div>
            </div>
          </Bubble>
        )}

        {phase === P.MICRO_FEEDBACK && (
          <div style={{display:"flex",justifyContent:"center",margin:"8px 0",animation:"slideUp .4s ease-out"}}>
            <Btn onClick={()=>{setConfetti(true);setTimeout(()=>setConfetti(false),2000);setPhase(P.MICRO_DONE);}} color={C.gold} textColor="#000" glow>🏆 Get Certificate!</Btn>
          </div>
        )}

        {/* Micro done message */}
        {phase >= P.MICRO_DONE && (
          <Bubble type="in" time="10:13 AM">
            <div style={{fontSize:12.5,lineHeight:1.5,color:C.text}}>
              <strong>💰 Pay-per-Outcome Summary:</strong><br/>
              ✅ 1 phrase mastered = ₹9 spent<br/>
              📈 Next lesson: "How can I help you?" — ₹9<br/><br/>
              <span style={{fontSize:11.5,color:C.textSec}}>सिर्फ result पर pay करें — कोई monthly charge नहीं!</span>
            </div>
          </Bubble>
        )}
        {phase === P.MICRO_DONE && (
          <div style={{display:"flex",justifyContent:"center",margin:"8px 0",gap:8,flexWrap:"wrap",animation:"slideUp .4s ease-out"}}>
            <Btn onClick={()=>{setConfetti(true);setTimeout(()=>setConfetti(false),2000);setPhase(P.CERT);}} glow>🏅 View Certificate</Btn>
          </div>
        )}

        {/* ── CERTIFICATE ── */}
        {phase >= P.CERT && (
          <div style={{padding:"8px 12px",animation:"certIn .7s ease-out"}}>
            <div style={{background:"#fff",borderRadius:14,overflow:"hidden",boxShadow:"0 4px 20px rgba(0,0,0,.12)",border:"1px solid rgba(7,94,84,.12)"}}>
              <div style={{background:`linear-gradient(135deg,${C.headerDark},${C.headerMid})`,padding:"18px 16px 22px",textAlign:"center",color:"#fff",position:"relative"}}>
                <div style={{position:"absolute",inset:0,opacity:.05,backgroundImage:"repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 1px,transparent 10px)"}}/>
                <svg width="50" height="50" viewBox="0 0 60 60" fill="none">
                  <circle cx="30" cy="26" r="20" fill="#fff" opacity=".12"/><circle cx="30" cy="26" r="14" fill="#fff" opacity=".18"/>
                  <path d="M30 12L33 20.5H42L35 26L37.5 34.5L30 29.5L22.5 34.5L25 26L18 20.5H27L30 12Z" fill={C.gold} stroke="#E6A600" strokeWidth="1"/>
                  <path d="M25 38L30 34L35 38V50L30 46L25 50V38Z" fill={C.headerDark}/>
                </svg>
                <div style={{fontSize:9.5,letterSpacing:2.5,textTransform:"uppercase",marginTop:8,opacity:.8}}>Certificate of Completion</div>
                <div style={{fontSize:16,fontWeight:800,marginTop:3}}>Micro-Lesson #1</div>
                <div style={{fontSize:11,opacity:.7,marginTop:2}}>Customer Greeting — Phrase Mastered</div>
              </div>
              <div style={{padding:"16px",textAlign:"center"}}>
                <div style={{fontSize:11.5,color:C.textSec,marginBottom:3}}>यह प्रमाणित किया जाता है कि</div>
                <div style={{fontSize:18,fontWeight:800,color:C.headerDark,marginBottom:3,fontStyle:"italic"}}>Learner</div>
                <div style={{fontSize:11.5,color:C.textSec,marginBottom:10}}>ने "Customer Greeting" phrase सफलतापूर्वक master किया</div>
                <div style={{display:"flex",justifyContent:"center",gap:2,marginBottom:8}}>
                  {[1,2,3,4,5].map(i=><StarIcon key={i} filled={i<=5}/>)}
                </div>
                <div style={{display:"inline-flex",alignItems:"center",gap:5,background:"#F0FFF4",border:`1.5px solid ${C.accent}`,borderRadius:18,padding:"5px 14px",marginBottom:10}}>
                  <span style={{fontSize:20,fontWeight:800,color:C.headerDark}}>92%</span>
                  <span style={{fontSize:11,color:C.headerMid,fontWeight:600}}>Score</span>
                </div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginBottom:10}}>
                  <div style={{background:"#FFF8E1",borderRadius:8,padding:"4px 10px",fontSize:11,fontWeight:600,color:"#E65100",border:"1px solid #FFE082"}}>💰 Cost: ₹9</div>
                  <div style={{background:"#E3F2FD",borderRadius:8,padding:"4px 10px",fontSize:11,fontWeight:600,color:"#1565C0",border:"1px solid #90CAF9"}}>⏱ Time: 2 min</div>
                </div>
                <div style={{fontSize:10.5,color:C.textSec}}>
                  Date: {new Date().toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})} • ID: SE-{Math.floor(Math.random()*9000+1000)}
                </div>
              </div>
              <div style={{padding:"0 14px 10px"}}>
                <button style={{width:"100%",background:C.accent,color:"#fff",border:"none",borderRadius:22,padding:"11px",fontSize:13.5,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7,boxShadow:`0 3px 12px ${C.accent}55`}}>
                  <ShareSVG/> WhatsApp Status पर Share करें
                </button>
              </div>
              <div style={{padding:"0 14px 10px",display:"flex",gap:7}}>
                <button style={{flex:1,background:"transparent",color:C.headerDark,border:`1.5px solid ${C.headerDark}`,borderRadius:22,padding:"9px",fontSize:12,fontWeight:600,cursor:"pointer"}}>📥 Download</button>
                <button onClick={()=>advance(P.MICRO_INTRO,600)} style={{flex:1,background:"transparent",color:C.headerMid,border:`1.5px solid ${C.headerMid}`,borderRadius:22,padding:"9px",fontSize:12,fontWeight:600,cursor:"pointer"}}>▶️ Next Lesson — ₹9</button>
              </div>
              <div style={{padding:"0 14px 12px"}}>
                <button onClick={()=>{setPhase(P.LANG);setLang(null);setGoal(null);}} style={{width:"100%",background:"transparent",color:C.textSec,border:"none",padding:"6px",fontSize:11.5,cursor:"pointer",fontWeight:500}}>
                  🔄 Restart Full Demo
                </button>
              </div>
            </div>
          </div>
        )}

        {typing && <div style={{padding:"2px 10px"}}><div style={{display:"inline-block",background:"#fff",borderRadius:"10px 10px 10px 2px",boxShadow:"0 1px 1px rgba(0,0,0,.08)"}}><Typing/></div></div>}
        <div style={{height:8}}/>
      </div>

      {/* ── INPUT BAR ── */}
      {phase >= P.ASSESS_INTRO && phase < P.CERT && phase !== P.SUB_GATE && (
        <div style={{background:"#F0F2F5",padding:"5px 7px",display:"flex",alignItems:"center",gap:5,flexShrink:0,borderTop:"1px solid rgba(0,0,0,.07)"}}>
          <button style={{width:34,height:34,borderRadius:"50%",border:"none",background:"transparent",cursor:"pointer",fontSize:18}}>😊</button>
          <div style={{flex:1,display:"flex",alignItems:"center",background:"#fff",borderRadius:20,padding:"5px 12px",border:"1px solid rgba(0,0,0,.05)",minHeight:38}}>
            {recording ? (
              <div style={{display:"flex",alignItems:"center",gap:7,flex:1}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:"#FF3B30",animation:"rec 1s ease-in-out infinite"}}/>
                <span style={{fontSize:12.5,color:C.textSec}}>Recording... {Math.round(recProg)}%</span>
                <div style={{flex:1,height:3,background:"#E8E8E8",borderRadius:4,overflow:"hidden"}}><div style={{width:`${recProg}%`,height:"100%",background:"#FF3B30",borderRadius:4,transition:"width .04s"}}/></div>
              </div>
            ) : (
              <span style={{fontSize:12.5,color:C.textSec}}>{isRecPhase?"🎤 Hold the mic to speak...":"Type a message"}</span>
            )}
          </div>
          <button style={{background:"transparent",border:"none",cursor:"pointer",fontSize:11,color:C.headerDark,fontWeight:600,borderRadius:7,whiteSpace:"nowrap",padding:"4px 6px"}}>हिंदी 🔄</button>
          {isRecPhase ? (
            <button
              onMouseDown={doRecord} onMouseUp={stopRecord} onMouseLeave={stopRecord}
              onTouchStart={e=>{e.preventDefault();doRecord();}} onTouchEnd={e=>{e.preventDefault();stopRecord();}}
              style={{width:42,height:42,borderRadius:"50%",border:"none",cursor:"pointer",background:recording?"#FF3B30":C.accent,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:recording?"0 0 0 6px rgba(255,59,48,.2)":`0 2px 8px ${C.accent}66`,animation:!recording?"pulse 2s ease-in-out infinite":"none",transition:"background .2s,box-shadow .2s"}}>
              <MicSVG s={20}/>
            </button>
          ) : (
            <button onClick={()=>{
              if(phase===P.ASSESS_V1) advance(P.ASSESS_LISTEN1);
              else if(phase===P.ASSESS_V2) advance(P.ASSESS_LISTEN2);
              else if(phase===P.ASSESS_V3) advance(P.ASSESS_LISTEN3);
              else if(phase===P.MICRO_VIDEO) advance(P.MICRO_LISTEN);
            }} style={{width:42,height:42,borderRadius:"50%",border:"none",cursor:"pointer",background:C.accent,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 2px 8px ${C.accent}55`}}>
              <SendSVG/>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
