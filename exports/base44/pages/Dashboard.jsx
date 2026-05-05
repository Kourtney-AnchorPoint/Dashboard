import { useState, useEffect } from "react";
import { Patient, ScoreHistory, ClinicalAction, GroupCohesion } from "@/api/entities";

const LOGO = "https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/c3d5295ac_CensusGuard_banner_logo.png";
const TIER_COLOR = { CRITICAL:"#D4159A", HIGH:"#ff6b35", MODERATE:"#f0c040", LOW:"#10D8F0" };
const TIER_BG    = { CRITICAL:"#2a0018", HIGH:"#2a1400", MODERATE:"#252000", LOW:"#001c22" };
const SUBSTANCE_MAP = {1:"Alcohol",2:"Opioid",3:"Benzodiazepine",4:"Methamphetamine",5:"Cocaine",6:"Non-rx Methadone",7:"Heroin",8:"Other"};
const ACTION_TYPES = ["Counselor contacted patient","1:1 session scheduled","1:1 session completed","Discharge planning initiated","Family notified","BHT increased check-in frequency","Medication review ordered","Group therapy added","Peer separation implemented","Safety check completed","Custom note"];

function TierBadge({ tier }) {
  const c = TIER_COLOR[tier]||"#555";
  return <span style={{background:c+"22",color:c,border:`1px solid ${c}44`,fontSize:10,fontWeight:800,padding:"2px 8px",borderRadius:2,letterSpacing:1,whiteSpace:"nowrap"}}>{tier}</span>;
}

function VelocityChip({ v }) {
  if (!v && v!==0) return <span style={{color:"#444"}}>—</span>;
  const up = v>0;
  return <span style={{color:up?"#D4159A":"#10D8F0",fontWeight:700,fontSize:12}}>{up?"▲":"▼"} {Math.abs(v).toFixed(1)}/d</span>;
}

function MiniSparkline({ up }) {
  const pts = up ? "0,28 10,24 20,26 30,20 40,18 50,12 60,8" : "0,8 10,12 20,10 30,14 40,18 50,20 60,22";
  return <svg width={62} height={32} viewBox="0 0 62 32"><polyline points={pts} fill="none" stroke={up?"#D4159A":"#10D8F0"} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/><circle cx={60} cy={up?8:22} r={3} fill={up?"#D4159A":"#10D8F0"}/></svg>;
}

function DonutChart({ patients, size=72 }) {
  const tiers = ["CRITICAL","HIGH","MODERATE","LOW"];
  const counts = tiers.map(t=>patients.filter(p=>p.risk_tier===t).length);
  const total = counts.reduce((a,b)=>a+b,0)||1;
  const r = size/2-6, cx = size/2, cy = size/2;
  let cumAngle = -Math.PI/2;
  const slices = tiers.map((t,i)=>{
    const angle = (counts[i]/total)*2*Math.PI;
    const x1 = cx+r*Math.cos(cumAngle), y1 = cy+r*Math.sin(cumAngle);
    cumAngle += angle;
    const x2 = cx+r*Math.cos(cumAngle), y2 = cy+r*Math.sin(cumAngle);
    const large = angle > Math.PI ? 1 : 0;
    return { t, path:`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`, color:TIER_COLOR[t], count:counts[i] };
  });
  return (
    <svg width={size} height={size}>
      {slices.filter(s=>s.count>0).map(s=>(
        <path key={s.t} d={s.path} fill={s.color} fillOpacity={0.85} stroke="#07070F" strokeWidth={1}/>
      ))}
      <circle cx={cx} cy={cy} r={r*0.55} fill="#07070F"/>
      <text x={cx} y={cy+4} textAnchor="middle" fill="#fff" fontSize={size*0.2} fontWeight={900}>{total}</text>
    </svg>
  );
}

// ── Search Bar ─────────────────────────────────────────────────────────────────
function SearchBar({ patients, onSelect }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const results = query.length > 1 ? patients.filter(p => p.name.toLowerCase().includes(query.toLowerCase())) : [];
  return (
    <div style={{position:"relative",width:280}}>
      <div style={{display:"flex",alignItems:"center",backgroundColor:"#0d0d1a",border:"1px solid #2a2a3e",borderRadius:3,padding:"6px 12px",gap:8}}>
        <span style={{color:"#444",fontSize:14}}>🔍</span>
        <input value={query} onChange={e=>{setQuery(e.target.value);setOpen(true);}} onFocus={()=>setOpen(true)} onBlur={()=>setTimeout(()=>setOpen(false),200)} placeholder="Search patient..." style={{background:"none",border:"none",outline:"none",color:"#fff",fontSize:13,width:"100%"}}/>
        {query && <span onClick={()=>{setQuery("");setOpen(false);}} style={{color:"#444",cursor:"pointer",fontSize:16}}>×</span>}
      </div>
      {open && results.length>0 && (
        <div style={{position:"absolute",top:"100%",left:0,right:0,backgroundColor:"#0d0d1a",border:"1px solid #2a2a3e",borderRadius:3,zIndex:100,marginTop:2,overflow:"hidden"}}>
          {results.map(p=>{
            const c = TIER_COLOR[p.risk_tier]||"#555";
            return (
              <div key={p.id} onClick={()=>{onSelect(p);setQuery("");setOpen(false);}} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",cursor:"pointer",borderBottom:"1px solid #111"}} onMouseEnter={e=>e.currentTarget.style.background="#1a1a2e"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div>
                  <div style={{fontWeight:700,color:"#fff",fontSize:13}}>{p.name}</div>
                  <div style={{fontSize:11,color:"#555"}}>Day {p.length_of_stay} · Room {p.room_number||"—"} · {SUBSTANCE_MAP[p.substance_encoded]||"—"}</div>
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                  <span style={{fontSize:22,fontWeight:900,color:c}}>{p.risk_score}</span>
                  <TierBadge tier={p.risk_tier}/>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {open && query.length>1 && results.length===0 && (
        <div style={{position:"absolute",top:"100%",left:0,right:0,backgroundColor:"#0d0d1a",border:"1px solid #2a2a3e",borderRadius:3,zIndex:100,marginTop:2,padding:"12px 14px",color:"#555",fontSize:12}}>No patients found</div>
      )}
    </div>
  );
}

// ── Score History Timeline ─────────────────────────────────────────────────────
function ScoreTimeline({ patientId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(()=>{
    ScoreHistory.filter({patient_id:patientId}).then(data=>{
      setHistory(data.sort((a,b)=>new Date(a.timestamp)-new Date(b.timestamp)));
      setLoading(false);
    }).catch(()=>setLoading(false));
  },[patientId]);
  if (loading) return <div style={{color:"#444",padding:20,fontSize:12}}>Loading history...</div>;
  if (!history.length) return <div style={{color:"#444",padding:20,fontSize:12}}>No score history recorded yet.</div>;
  return (
    <div>
      <div style={{fontSize:10,letterSpacing:2,color:"#444",marginBottom:14}}>RISK SCORE HISTORY</div>
      <div style={{position:"relative"}}>
        <div style={{position:"absolute",left:16,top:0,bottom:0,width:2,backgroundColor:"#1a1a2e"}}/>
        {history.map((h,i)=>{
          const c = TIER_COLOR[h.risk_tier]||"#555";
          const delta = h.previous_score ? h.score - h.previous_score : 0;
          const drivers = h.drivers ? h.drivers.split("|") : [];
          return (
            <div key={h.id||i} style={{position:"relative",paddingLeft:40,paddingBottom:20}}>
              <div style={{position:"absolute",left:8,top:4,width:18,height:18,borderRadius:"50%",backgroundColor:h.alert_fired?"#D4159A":"#1a1a2e",border:`2px solid ${c}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                {h.alert_fired && <span style={{fontSize:8,color:"#fff"}}>!</span>}
              </div>
              <div style={{backgroundColor:"#0a0a18",border:`1px solid ${h.alert_fired?"#D4159A33":"#1a1a2e"}`,borderRadius:4,padding:"10px 14px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,flexWrap:"wrap",gap:4}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontSize:24,fontWeight:900,color:c}}>{h.score}</span>
                    {delta!==0&&<span style={{fontSize:12,fontWeight:700,color:delta>0?"#D4159A":"#10D8F0"}}>{delta>0?`+${delta}`:delta} pts</span>}
                    <TierBadge tier={h.risk_tier}/>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:11,color:"#555"}}>Day {h.day_in_treatment}</div>
                    <div style={{fontSize:10,color:"#333"}}>{new Date(h.timestamp).toLocaleString()}</div>
                  </div>
                </div>
                <div style={{fontSize:12,color:"#888",marginBottom:6}}>
                      <span style={{color:"#555"}}>Trigger: </span>
                      <span style={{color: h.trigger==="BHT check-in" ? "#10D8F0" : "#888", fontWeight: h.trigger==="BHT check-in" ? 700 : 400}}>
                        {h.trigger === "BHT check-in" ? "⚡ BHT check-in (real-time rescore)" : h.trigger}
                      </span>
                    </div>
                {drivers.length>0 && (
                  <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                    {drivers.map((d,j)=><span key={j} style={{backgroundColor:"#1a1a2e",color:"#888",fontSize:11,padding:"2px 8px",borderRadius:2}}>{d}</span>)}
                  </div>
                )}
                {h.alert_fired && <div style={{marginTop:6,fontSize:11,color:"#D4159A",fontWeight:700}}>🚨 Alert fired</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Clinical Audit Trail ────────────────────────────────────────────────────────
function AuditTrail({ patientId, patientName, currentScore }) {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({action_type:"Counselor contacted patient",action_taken:"",staff_name:"",follow_up_required:false,outcome_note:""});
  const [saving, setSaving] = useState(false);

  useEffect(()=>{ loadActions(); },[patientId]);

  async function loadActions() {
    try {
      const data = await ClinicalAction.filter({patient_id:patientId});
      setActions(data.sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp)));
    } catch(e){}
    setLoading(false);
  }

  async function saveAction() {
    if (!form.action_taken || !form.staff_name) return;
    setSaving(true);
    try {
      await ClinicalAction.create({...form,patient_id:patientId,patient_name:patientName,alert_reason:"Manual clinical entry",timestamp:new Date().toISOString(),score_at_action:currentScore||0});
      setForm({action_type:"Counselor contacted patient",action_taken:"",staff_name:"",follow_up_required:false,outcome_note:""});
      setShowForm(false);
      loadActions();
    } catch(e){}
    setSaving(false);
  }

  if (loading) return <div style={{color:"#444",padding:20,fontSize:12}}>Loading audit trail...</div>;

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{fontSize:10,letterSpacing:2,color:"#444"}}>CLINICAL AUDIT TRAIL</div>
        <button onClick={()=>setShowForm(!showForm)} style={{backgroundColor:"#D4159A",border:"none",color:"#fff",fontSize:11,fontWeight:700,padding:"4px 14px",borderRadius:2,cursor:"pointer",letterSpacing:1}}>+ LOG ACTION</button>
      </div>
      {showForm && (
        <div style={{backgroundColor:"#0a0a18",border:"1px solid #D4159A33",borderRadius:4,padding:16,marginBottom:16}}>
          <div style={{marginBottom:10}}>
            <div style={{fontSize:10,color:"#444",marginBottom:4}}>ACTION TYPE</div>
            <select value={form.action_type} onChange={e=>setForm(f=>({...f,action_type:e.target.value}))} style={{width:"100%",backgroundColor:"#07070F",border:"1px solid #2a2a3e",borderRadius:3,color:"#fff",padding:"8px 10px",fontSize:12}}>
              {ACTION_TYPES.map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
          <div style={{marginBottom:10}}>
            <div style={{fontSize:10,color:"#444",marginBottom:4}}>STAFF NAME</div>
            <input value={form.staff_name} onChange={e=>setForm(f=>({...f,staff_name:e.target.value}))} placeholder="e.g. K. Rhodes, LCSW" style={{width:"100%",backgroundColor:"#07070F",border:"1px solid #2a2a3e",borderRadius:3,color:"#fff",padding:"8px 10px",fontSize:12,boxSizing:"border-box"}}/>
          </div>
          <div style={{marginBottom:10}}>
            <div style={{fontSize:10,color:"#444",marginBottom:4}}>ACTION TAKEN</div>
            <textarea value={form.action_taken} onChange={e=>setForm(f=>({...f,action_taken:e.target.value}))} placeholder="Describe what was done..." rows={3} style={{width:"100%",backgroundColor:"#07070F",border:"1px solid #2a2a3e",borderRadius:3,color:"#fff",padding:"8px 10px",fontSize:12,resize:"vertical",boxSizing:"border-box"}}/>
          </div>
          <div style={{marginBottom:10}}>
            <div style={{fontSize:10,color:"#444",marginBottom:4}}>OUTCOME NOTE (optional)</div>
            <input value={form.outcome_note} onChange={e=>setForm(f=>({...f,outcome_note:e.target.value}))} placeholder="Patient response, next steps..." style={{width:"100%",backgroundColor:"#07070F",border:"1px solid #2a2a3e",borderRadius:3,color:"#fff",padding:"8px 10px",fontSize:12,boxSizing:"border-box"}}/>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
            <input type="checkbox" id="fu" checked={form.follow_up_required} onChange={e=>setForm(f=>({...f,follow_up_required:e.target.checked}))} style={{accentColor:"#D4159A"}}/>
            <label htmlFor="fu" style={{fontSize:12,color:"#888",cursor:"pointer"}}>Follow-up required</label>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={saveAction} disabled={saving} style={{backgroundColor:saving?"#444":"#D4159A",border:"none",color:"#fff",padding:"8px 20px",borderRadius:2,cursor:saving?"not-allowed":"pointer",fontSize:12,fontWeight:700}}>
              {saving?"Saving...":"Save Action"}
            </button>
            <button onClick={()=>setShowForm(false)} style={{backgroundColor:"transparent",border:"1px solid #2a2a3e",color:"#555",padding:"8px 16px",borderRadius:2,cursor:"pointer",fontSize:12}}>Cancel</button>
          </div>
        </div>
      )}
      {!actions.length && !showForm && <div style={{color:"#444",fontSize:12,fontStyle:"italic"}}>No clinical actions logged yet.</div>}
      {actions.map((a,i)=>(
        <div key={a.id||i} style={{backgroundColor:"#0a0a18",border:"1px solid #1a1a2e",borderRadius:4,padding:"12px 14px",marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6,flexWrap:"wrap",gap:4}}>
            <div>
              <span style={{backgroundColor:"#D4159A22",color:"#D4159A",fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:2}}>{a.action_type}</span>
              {a.follow_up_required && <span style={{marginLeft:6,backgroundColor:"#f0c04022",color:"#f0c040",fontSize:10,padding:"2px 6px",borderRadius:2}}>Follow-up needed</span>}
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:11,color:"#666"}}>{a.staff_name}</div>
              <div style={{fontSize:10,color:"#333"}}>{new Date(a.timestamp).toLocaleString()}</div>
            </div>
          </div>
          <div style={{fontSize:12,color:"#ccc",lineHeight:1.6,marginBottom:6}}>{a.action_taken}</div>
          {a.outcome_note && <div style={{fontSize:12,color:"#666",fontStyle:"italic"}}>→ {a.outcome_note}</div>}
          <div style={{fontSize:11,color:"#444",marginTop:6}}>Score at action: <span style={{color:TIER_COLOR["HIGH"]}}>{a.score_at_action}</span></div>
        </div>
      ))}
    </div>
  );
}

// ── Patient Detail Panel ────────────────────────────────────────────────────────
function PatientDetail({ patient, allPatients, onClose }) {
  const [tab, setTab] = useState("overview");
  if (!patient) return null;
  const color = TIER_COLOR[patient.risk_tier]||"#666";
  const substance = SUBSTANCE_MAP[patient.substance_encoded]||"Unknown";
  const drivers = patient.top_drivers ? patient.top_drivers.split("|") : [];
  const knownPeers = patient.known_peers ? patient.known_peers.split(",").map(s=>s.trim()).filter(Boolean) : [];
  const roommates = allPatients.filter(p=>p.id!==patient.id && p.room_number && p.room_number===patient.room_number);
  const tags = [patient.gender_encoded===1?"Female":patient.gender_encoded===2?"Non-binary":"Male",(patient.admission_number||1)>1?`#${patient.admission_number} Admission`:null,patient.cliff_window?"CLIFF":null,patient.smoker?"Smoker":null,patient.court_referral?"Court Referral":patient.self_referral?"Self Referral":null,`Day ${patient.length_of_stay}`].filter(Boolean);

  return (
    <div style={{position:"fixed",top:0,right:0,bottom:0,width:460,backgroundColor:"#0d0d1a",border:"none",borderLeft:"1px solid #1a1a2e",borderTop:`3px solid ${color}`,zIndex:200,display:"flex",flexDirection:"column",overflowY:"auto"}}>
      <div style={{padding:"16px 20px",borderBottom:"1px solid #1a1a2e",flexShrink:0}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
          <div>
            <div style={{fontWeight:900,fontSize:20,color:"#fff"}}>{patient.name}</div>
            <div style={{fontSize:11,color:"#555",marginTop:2}}>Room {patient.room_number||"—"} · {substance} · {patient.level_of_care}</div>
          </div>
          <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:38,fontWeight:900,color,lineHeight:1}}>{patient.risk_score}</div>
              <TierBadge tier={patient.risk_tier}/>
            </div>
            <button onClick={onClose} style={{background:"none",border:"none",color:"#444",cursor:"pointer",fontSize:22,padding:0,lineHeight:1}}>×</button>
          </div>
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}>
          {tags.map(t=><span key={t} style={{backgroundColor:t==="CLIFF"?"#8844E822":t.includes("Admission")?"#D4159A22":"#1a1a2e",color:t==="CLIFF"?"#8844E8":t.includes("Admission")?"#D4159A":"#777",border:`1px solid ${t==="CLIFF"?"#8844E844":t.includes("Admission")?"#D4159A44":"#2a2a3e"}`,fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:2}}>{t}</span>)}
        </div>
        <div style={{display:"flex",gap:0,borderBottom:"1px solid #1a1a2e",marginBottom:-1}}>
          {[["overview","Overview"],["trajectory","Score Trajectory"],["history","History"],["audit","Audit Trail"]].map(([k,l])=>(
            <button key={k} onClick={()=>setTab(k)} style={{background:"none",border:"none",borderBottom:tab===k?"2px solid #D4159A":"2px solid transparent",color:tab===k?"#fff":"#555",fontSize:12,padding:"8px 14px",cursor:"pointer",fontWeight:tab===k?700:400}}>{l}</button>
          ))}
        </div>
      </div>
      <div style={{padding:"16px 20px",flex:1,overflowY:"auto"}}>
        {tab==="overview" && (
          <div>
            {patient.calm_before_storm_flag && (
              <div style={{backgroundColor:"#12082a",border:"1px solid #8844E8",borderRadius:4,padding:12,marginBottom:12}}>
                <div style={{color:"#8844E8",fontWeight:900,fontSize:11,letterSpacing:2,marginBottom:4}}>⚡ CALM BEFORE STORM</div>
                <div style={{color:"#bbb",fontSize:12,lineHeight:1.6}}>HIGH patient showing unexpected de-escalation with no clinical trigger. Pre-elopement signal — validation pending through pilot.</div>
              </div>
            )}
            {patient.alert_active && (
              <div style={{backgroundColor:"#1a0010",border:"1px solid #D4159A",borderRadius:4,padding:12,marginBottom:12}}>
                <div style={{color:"#D4159A",fontWeight:900,fontSize:11,letterSpacing:2,marginBottom:4}}>🚨 ACTIVE ALERT</div>
                <div style={{color:"#ddd",fontSize:13,lineHeight:1.6}}>{patient.alert_reason}</div>
              </div>
            )}
            {drivers.length>0 && (
              <div style={{marginBottom:14}}>
                <div style={{fontSize:10,letterSpacing:2,color:"#444",marginBottom:8}}>TOP RISK DRIVERS</div>
                {drivers.map((d,i)=><div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:6}}><div style={{width:5,height:5,borderRadius:"50%",backgroundColor:color,flexShrink:0,marginTop:5}}/><span style={{color:"#ccc",fontSize:12,lineHeight:1.5}}>{d}</span></div>)}
              </div>
            )}
            {patient.intervention && (
              <div style={{backgroundColor:"#071a10",border:"1px solid #10D8F022",borderRadius:4,padding:12,marginBottom:14}}>
                <div style={{fontSize:10,letterSpacing:2,color:"#10D8F0",marginBottom:6}}>RECOMMENDED INTERVENTION</div>
                <div style={{color:"#ddd",fontSize:12,lineHeight:1.6}}>{patient.intervention}</div>
              </div>
            )}
            {(roommates.length>0||knownPeers.length>0) && (
              <div style={{marginBottom:14}}>
                <div style={{fontSize:10,letterSpacing:2,color:"#444",marginBottom:8}}>PEER RELATIONSHIPS</div>
                {roommates.length>0 && (
                  <div style={{backgroundColor:"#0a0a18",border:"1px solid #ff6b3533",borderRadius:3,padding:"10px 12px",marginBottom:6}}>
                    <div style={{fontSize:11,color:"#ff6b35",fontWeight:700,marginBottom:6}}>ROOMMATES — Room {patient.room_number}</div>
                    {roommates.map(r=>(
                      <div key={r.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                        <span style={{color:"#ccc",fontSize:12}}>{r.name}</span>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <span style={{fontSize:12,fontWeight:700,color:TIER_COLOR[r.risk_tier]||"#555"}}>{r.risk_score}</span>
                          <TierBadge tier={r.risk_tier}/>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {knownPeers.length>0 && (
                  <div style={{backgroundColor:"#0a0a18",border:"1px solid #8844E833",borderRadius:3,padding:"10px 12px"}}>
                    <div style={{fontSize:11,color:"#8844E8",fontWeight:700,marginBottom:6}}>⚡ KNOWN PRIOR RELATIONSHIP</div>
                    {knownPeers.map(peer=>{
                      const match = allPatients.find(p=>p.name===peer);
                      return (
                        <div key={peer} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                          <span style={{color:"#ccc",fontSize:12}}>{peer}</span>
                          {match && <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:12,fontWeight:700,color:TIER_COLOR[match.risk_tier]||"#555"}}>{match.risk_score}</span><TierBadge tier={match.risk_tier}/></div>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[["Velocity",<VelocityChip v={patient.velocity}/>],["Admission #",patient.admission_number||1],["Prior Tx",patient.has_prior_tx?`Yes (${patient.prior_tx_count}x)`:"No"],["Substance",SUBSTANCE_MAP[patient.substance_encoded]||"—"],["Pain Score",patient.pain_level_score?`${patient.pain_level_score}/10`:"—"],["Psych Comorbid",patient.psych_comorbid?"Yes":"No"],["Unstable Housing",patient.unstable_housing?"Yes":"No"],["Cliff Window",patient.cliff_window?"⚠ Active":"No"],["Known Peer",patient.known_peers||"—"],["Smoker",patient.smoker?"Yes 🚬":"No"],["Court Referral",patient.court_referral?"Yes":"No"],["Room",patient.room_number||"—"]].map(([l,v])=>(
                <div key={l} style={{backgroundColor:"#0a0a18",border:"1px solid #1a1a2e",borderRadius:3,padding:"8px 12px"}}>
                  <div style={{fontSize:10,color:"#444",letterSpacing:1,marginBottom:3}}>{String(l).toUpperCase()}</div>
                  <div style={{color:"#fff",fontWeight:700,fontSize:13}}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab==="trajectory" && (
          <div>
            <div style={{fontSize:10,letterSpacing:2,color:"#444",marginBottom:12}}>INDIVIDUAL RISK SCORE TRAJECTORY</div>
            <svg viewBox="0 0 400 120" style={{width:"100%",height:120,display:"block"}}>
              <defs><linearGradient id="rg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#D4159A" stopOpacity="0.3"/><stop offset="100%" stopColor="#D4159A" stopOpacity="0"/></linearGradient></defs>
              <rect x="0" y="80" width="400" height="1" fill="#ff6b3533"/>
              <text x="2" y="79" fill="#ff6b35" fontSize="8">HIGH</text>
              <rect x="0" y="40" width="400" height="1" fill="#D4159A33"/>
              <text x="2" y="39" fill="#D4159A" fontSize="8">CRITICAL</text>
              <polyline points="0,100 50,95 100,80 150,70 200,60 250,50 300,40 350,35 400,30" fill="none" stroke="#D4159A" strokeWidth="2" strokeLinecap="round"/>
              <polygon points="0,100 50,95 100,80 150,70 200,60 250,50 300,40 350,35 400,30 400,120 0,120" fill="url(#rg)"/>
            </svg>
            <div style={{fontSize:11,color:"#555",textAlign:"center",marginTop:4}}>Risk score trajectory over treatment duration</div>
          </div>
        )}
        {tab==="history" && <ScoreTimeline patientId={patient.id}/>}
        {tab==="audit" && <AuditTrail patientId={patient.id} patientName={patient.name} currentScore={patient.risk_score}/>}
      </div>
    </div>
  );
}

// ── Patient Monitor ─────────────────────────────────────────────────────────────
function PatientMonitor({ patients, selected, onSelect }) {
  const [filter, setFilter] = useState("All");
  const filtered = patients.filter(p=>{
    if (filter==="All") return true;
    if (["CRITICAL","HIGH","MODERATE","LOW"].includes(filter)) return p.risk_tier===filter;
    return p.level_of_care===filter || p.unit===filter;
  });

  return (
    <div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
        {["All","CRITICAL","HIGH","MODERATE","LOW","Detox","Residential","PHP"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{background:filter===f?"#D4159A":"none",border:`1px solid ${filter===f?"#D4159A":"#2a2a3e"}`,color:filter===f?"#fff":"#555",padding:"4px 14px",borderRadius:2,cursor:"pointer",fontSize:11,fontWeight:700,letterSpacing:1}}>{f}</button>
        ))}
      </div>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead>
            <tr style={{borderBottom:"1px solid #1a1a2e"}}>
              {["Patient","Unit","Room","Day","Substance","Risk Score","Tier","Velocity","Trend","Last BHT","Alerts"].map(h=>(
                <th key={h} style={{padding:"8px 12px",textAlign:"left",fontSize:10,color:"#444",letterSpacing:1,fontWeight:700,whiteSpace:"nowrap"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p=>{
              const c = TIER_COLOR[p.risk_tier]||"#555";
              const isSelected = selected?.id===p.id;
              return (
                <tr key={p.id} onClick={()=>onSelect(isSelected?null:p)} style={{borderBottom:"1px solid #0d0d1a",cursor:"pointer",backgroundColor:isSelected?TIER_BG[p.risk_tier]||"#0d0d1a":"transparent"}} onMouseEnter={e=>!isSelected&&(e.currentTarget.style.backgroundColor="#0d0d1a")} onMouseLeave={e=>!isSelected&&(e.currentTarget.style.backgroundColor="transparent")}>
                  <td style={{padding:"10px 12px",fontWeight:700,color:"#fff"}}>{p.name}</td>
                  <td style={{padding:"10px 12px",color:"#888"}}>{p.unit||p.level_of_care}</td>
                  <td style={{padding:"10px 12px",color:"#555"}}>{p.room_number||"—"}</td>
                  <td style={{padding:"10px 12px",color:"#888"}}>{p.length_of_stay}</td>
                  <td style={{padding:"10px 12px",color:"#666",fontSize:11}}>{SUBSTANCE_MAP[p.substance_encoded]||"—"}</td>
                  <td style={{padding:"10px 12px"}}><span style={{fontSize:22,fontWeight:900,color:c}}>{p.risk_score}</span></td>
                  <td style={{padding:"10px 12px"}}><TierBadge tier={p.risk_tier}/></td>
                  <td style={{padding:"10px 12px"}}><VelocityChip v={p.velocity}/></td>
                  <td style={{padding:"10px 12px"}}><MiniSparkline up={(p.velocity||0)>0}/></td>
                  <td style={{padding:"10px 12px",whiteSpace:"nowrap"}}>
                    <div>
                      <div style={{fontSize:10,color:"#10D8F0",fontWeight:700}}>⚡ BHT</div>
                      <div style={{fontSize:10,color:"#555"}}>{p.updated_date ? new Date(p.updated_date).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) : "—"}</div>
                    </div>
                  </td>
                  <td style={{padding:"10px 12px"}}>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                      {p.alert_active&&<span style={{backgroundColor:"#D4159A22",color:"#D4159A",fontSize:10,padding:"2px 6px",borderRadius:2,fontWeight:700}}>🚨 ALERT</span>}
                      {p.cliff_window&&<span style={{backgroundColor:"#f0c04022",color:"#f0c040",fontSize:10,padding:"2px 6px",borderRadius:2}}>CLIFF</span>}
                      {p.calm_before_storm_flag&&<span style={{backgroundColor:"#8844E822",color:"#8844E8",fontSize:10,padding:"2px 6px",borderRadius:2}}>CBS</span>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!filtered.length && <div style={{padding:40,textAlign:"center",color:"#444"}}>No patients match this filter</div>}
      </div>
    </div>
  );
}

// ── Unit Drill Down ─────────────────────────────────────────────────────────────
function UnitDrillDown({ unit, patients, onBack, onSelectPatient }) {
  const unitPatients = patients.filter(p=>p.unit===unit.name||p.level_of_care===unit.name);
  return (
    <div>
      <button onClick={onBack} style={{background:"none",border:"none",color:"#D4159A",cursor:"pointer",fontSize:13,fontWeight:700,marginBottom:16,padding:0,display:"flex",alignItems:"center",gap:6}}>← Back to Census Floor</button>
      <div style={{backgroundColor:unit.color+"15",border:`1px solid ${unit.color}33`,borderRadius:6,padding:"16px 20px",marginBottom:20}}>
        <div style={{display:"flex",alignItems:"center",gap:20,flexWrap:"wrap"}}>
          <DonutChart patients={unitPatients} size={80}/>
          <div>
            <div style={{fontSize:18,fontWeight:900,color:unit.color}}>{unit.name.toUpperCase()}</div>
            <div style={{fontSize:12,color:"#555"}}>{unitPatients.length} patients · {unit.location}</div>
          </div>
          <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
            {["CRITICAL","HIGH","MODERATE","LOW"].map(t=>{
              const n=unitPatients.filter(p=>p.risk_tier===t).length;
              if(!n) return null;
              return <div key={t} style={{display:"flex",alignItems:"center",gap:5,fontSize:12}}>
                <span style={{width:8,height:8,borderRadius:"50%",backgroundColor:TIER_COLOR[t],display:"inline-block"}}/>
                <span style={{color:TIER_COLOR[t],fontWeight:700}}>{n}</span>
                <span style={{color:"#444"}}>{t}</span>
              </div>;
            })}
          </div>
        </div>
      </div>
      <div style={{fontSize:10,letterSpacing:2,color:"#444",marginBottom:10}}>PATIENT ROSTER</div>
      <div style={{overflowX:"auto",marginBottom:20}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead>
            <tr style={{borderBottom:"1px solid #1a1a2e"}}>
              {["Patient","Room","Day","Substance","Score","Tier","Velocity","Alerts"].map(h=>(
                <th key={h} style={{padding:"8px 12px",textAlign:"left",fontSize:10,color:"#444",letterSpacing:1,fontWeight:700,whiteSpace:"nowrap"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...unitPatients].sort((a,b)=>b.risk_score-a.risk_score).map(p=>{
              const c=TIER_COLOR[p.risk_tier]||"#555";
              return (
                <tr key={p.id} onClick={()=>onSelectPatient(p)} style={{borderBottom:"1px solid #0d0d1a",cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.backgroundColor="#0d0d1a"} onMouseLeave={e=>e.currentTarget.style.backgroundColor="transparent"}>
                  <td style={{padding:"10px 12px",fontWeight:700,color:"#fff"}}>{p.name}</td>
                  <td style={{padding:"10px 12px",color:"#555"}}>{p.room_number||"—"}</td>
                  <td style={{padding:"10px 12px",color:"#888"}}>{p.length_of_stay}</td>
                  <td style={{padding:"10px 12px",color:"#666",fontSize:11}}>{SUBSTANCE_MAP[p.substance_encoded]||"—"}</td>
                  <td style={{padding:"10px 12px"}}><span style={{fontSize:22,fontWeight:900,color:c}}>{p.risk_score}</span></td>
                  <td style={{padding:"10px 12px"}}><TierBadge tier={p.risk_tier}/></td>
                  <td style={{padding:"10px 12px"}}><VelocityChip v={p.velocity}/></td>
                  <td style={{padding:"10px 12px"}}>
                    <div style={{display:"flex",gap:4}}>
                      {p.alert_active&&<span style={{backgroundColor:"#D4159A22",color:"#D4159A",fontSize:10,padding:"2px 6px",borderRadius:2,fontWeight:700}}>🚨</span>}
                      {p.cliff_window&&<span style={{backgroundColor:"#f0c04022",color:"#f0c040",fontSize:10,padding:"2px 6px",borderRadius:2}}>CLIFF</span>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{fontSize:10,letterSpacing:2,color:"#444",marginBottom:10}}>FLOOR LAYOUT</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10}}>
        {unit.rooms.map(room=>{
          const roomPts=unitPatients.filter(p=>p.room_number===room);
          const isEmpty=roomPts.length===0;
          const order={CRITICAL:0,HIGH:1,MODERATE:2,LOW:3};
          const topTier=roomPts.reduce((w,p)=>(order[p.risk_tier]<order[w])?p.risk_tier:w,"LOW");
          const bc=isEmpty?"#1a1a2e":TIER_COLOR[topTier];
          const hasAlert=roomPts.some(p=>p.alert_active);
          const hasPeer=roomPts.some(p=>p.known_peers&&roomPts.some(r=>r.name===p.known_peers));
          const hasSmokers=roomPts.filter(p=>p.smoker).length>1;
          return (
            <div key={room} style={{backgroundColor:isEmpty?"#0d0d1a":bc+"11",border:`1px solid ${bc}`,borderRadius:4,padding:"12px 14px",minHeight:80,opacity:isEmpty?0.4:1,cursor:isEmpty?"default":"pointer"}} onClick={()=>!isEmpty&&onSelectPatient(roomPts[0])}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <span style={{fontSize:11,color:"#555",fontWeight:700,letterSpacing:1}}>ROOM {room}</span>
                <div style={{display:"flex",gap:4}}>
                  {hasAlert&&<span style={{fontSize:11}}>🚨</span>}
                  {hasPeer&&<span style={{fontSize:11}}>🔗</span>}
                  {hasSmokers&&<span style={{fontSize:11}}>🚬</span>}
                </div>
              </div>
              {isEmpty?<div style={{fontSize:11,color:"#333",fontStyle:"italic"}}>Available</div>:
                roomPts.map(p=>{
                  const c=TIER_COLOR[p.risk_tier];
                  return (
                    <div key={p.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                      <div>
                        <div style={{fontSize:12,fontWeight:700,color:"#fff"}}>{p.name}</div>
                        <div style={{fontSize:10,color:"#555"}}>Day {p.length_of_stay}</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:18,fontWeight:900,color:c}}>{p.risk_score}</div>
                        <div style={{fontSize:8,color:c,fontWeight:800}}>{p.risk_tier}</div>
                      </div>
                    </div>
                  );
                })
              }
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Census Floor Map ────────────────────────────────────────────────────────────
function CensusFloorMap({ patients, onSelectPatient }) {
  const [drillUnit, setDrillUnit] = useState(null);
  const units = [
    {name:"Detox",rooms:["101","102","103","104"],capacity:8,color:"#D4159A",location:"Building A"},
    {name:"Residential",rooms:["205","206","207","208","209","210"],capacity:12,color:"#ff6b35",location:"Building B"},
    {name:"PHP",rooms:["310","311","312","313"],capacity:8,color:"#8844E8",location:"Building C"},
  ];
  if (drillUnit) return <UnitDrillDown unit={drillUnit} patients={patients} onBack={()=>setDrillUnit(null)} onSelectPatient={p=>{onSelectPatient(p);}}/>;
  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      {units.map(unit=>{
        const unitPatients=patients.filter(p=>p.unit===unit.name||p.level_of_care===unit.name);
        const occupied=unitPatients.length;
        return (
          <div key={unit.name} style={{backgroundColor:"#0a0a18",border:`1px solid ${unit.color}33`,borderRadius:6,overflow:"hidden"}}>
            <div onClick={()=>setDrillUnit(unit)} style={{backgroundColor:unit.color+"15",borderBottom:`1px solid ${unit.color}33`,padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12,cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.backgroundColor=unit.color+"25"} onMouseLeave={e=>e.currentTarget.style.backgroundColor=unit.color+"15"}>
              <div style={{display:"flex",alignItems:"center",gap:16}}>
                <DonutChart patients={unitPatients} size={72}/>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{fontSize:14,fontWeight:900,color:unit.color,letterSpacing:1}}>{unit.name.toUpperCase()}</div>
                    <span style={{fontSize:10,color:unit.color,opacity:0.7,border:`1px solid ${unit.color}44`,padding:"2px 8px",borderRadius:2,letterSpacing:1}}>VIEW UNIT →</span>
                  </div>
                  <div style={{fontSize:11,color:"#555"}}>{occupied} / {unit.capacity} beds · 📍 {unit.location}</div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:3}}>
                  {["CRITICAL","HIGH","MODERATE","LOW"].map(t=>{
                    const n=unitPatients.filter(p=>p.risk_tier===t).length;
                    if(!n) return null;
                    return <div key={t} style={{display:"flex",alignItems:"center",gap:5,fontSize:10}}>
                      <span style={{width:8,height:8,borderRadius:"50%",backgroundColor:TIER_COLOR[t],display:"inline-block",flexShrink:0}}/>
                      <span style={{color:TIER_COLOR[t],fontWeight:700}}>{n}</span>
                      <span style={{color:"#444"}}>{t}</span>
                    </div>;
                  })}
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(80px,1fr))",gap:6,flex:1,maxWidth:400}}>
                {unit.rooms.map(room=>{
                  const rPts=unitPatients.filter(p=>p.room_number===room);
                  const isEmpty=rPts.length===0;
                  const topTier=rPts.reduce((w,p)=>({CRITICAL:0,HIGH:1,MODERATE:2,LOW:3}[p.risk_tier]<{CRITICAL:0,HIGH:1,MODERATE:2,LOW:3}[w])?p.risk_tier:w,"LOW");
                  const bc=isEmpty?"#1a1a2e":TIER_COLOR[topTier];
                  return (
                    <div key={room} style={{backgroundColor:bc+"15",border:`1px solid ${bc}`,borderRadius:3,padding:"6px 8px",opacity:isEmpty?0.3:1,textAlign:"center"}}>
                      <div style={{fontSize:9,color:"#555",marginBottom:2}}>Rm {room}</div>
                      {isEmpty?<div style={{fontSize:10,color:"#333"}}>—</div>:rPts.map(p=><div key={p.id} style={{fontSize:11,fontWeight:700,color:TIER_COLOR[p.risk_tier]}}>{p.risk_score}</div>)}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Group Flow ─────────────────────────────────────────────────────────────────
function GroupFlowPanel({ patients }) {
  const stages = ["Detox","Residential","PHP"];
  const counts = stages.map(s=>patients.filter(p=>p.unit===s||p.level_of_care===s).length);
  const maxCount = Math.max(...counts,1);
  const stageColors = {"Detox":"#D4159A","Residential":"#ff6b35","PHP":"#8844E8"};

  return (
    <div>
      <div style={{backgroundColor:"#0a0a18",border:"1px solid #1a1a2e",borderRadius:6,padding:24,marginBottom:20}}>
        <div style={{fontSize:10,letterSpacing:2,color:"#444",marginBottom:20}}>COHORT TREATMENT PROGRESSION</div>
        <div style={{display:"flex",alignItems:"flex-end",gap:16,height:160,justifyContent:"center"}}>
          {stages.map((s,i)=>{
            const h=Math.max(20,(counts[i]/maxCount)*120);
            const color=stageColors[s];
            const critical=patients.filter(p=>(p.unit===s||p.level_of_care===s)&&p.risk_tier==="CRITICAL").length;
            const high=patients.filter(p=>(p.unit===s||p.level_of_care===s)&&p.risk_tier==="HIGH").length;
            return (
              <div key={s} style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1}}>
                <div style={{fontSize:12,color:"#555",marginBottom:6}}>{critical>0&&<span style={{color:"#D4159A",fontWeight:700}}>{critical} CRIT</span>}{critical>0&&high>0&&" · "}{high>0&&<span style={{color:"#ff6b35"}}>{high} HIGH</span>}</div>
                <div style={{width:"100%",maxWidth:120,backgroundColor:color+"22",border:`1px solid ${color}44`,borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center",height:h,transition:"height 0.5s"}}>
                  <span style={{fontSize:32,fontWeight:900,color}}>{counts[i]}</span>
                </div>
                <div style={{fontSize:12,fontWeight:700,color,marginTop:8,letterSpacing:1}}>{s.toUpperCase()}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{backgroundColor:"#0a0a18",border:"1px solid #1a1a2e",borderRadius:6,padding:24}}>
        <div style={{fontSize:10,letterSpacing:2,color:"#444",marginBottom:16}}>RISK DISTRIBUTION BY UNIT</div>
        {stages.map(s=>{
          const unitPts=patients.filter(p=>p.unit===s||p.level_of_care===s);
          if(!unitPts.length) return null;
          const color=stageColors[s];
          return (
            <div key={s} style={{marginBottom:20}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                <div style={{width:10,height:10,borderRadius:"50%",backgroundColor:color}}/>
                <span style={{fontSize:13,fontWeight:700,color}}>{s}</span>
                <span style={{fontSize:11,color:"#555"}}>{unitPts.length} patients</span>
              </div>
              {["CRITICAL","HIGH","MODERATE","LOW"].map(tier=>{
                const n=unitPts.filter(p=>p.risk_tier===tier).length;
                const pct=unitPts.length?Math.round((n/unitPts.length)*100):0;
                if(!n) return null;
                return (
                  <div key={tier} style={{marginBottom:6}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:2}}>
                      <span style={{color:TIER_COLOR[tier]}}>{tier}</span>
                      <span style={{color:"#555"}}>{n} · {pct}%</span>
                    </div>
                    <div style={{backgroundColor:"#1a1a2e",borderRadius:2,height:4}}>
                      <div style={{backgroundColor:TIER_COLOR[tier],height:4,borderRadius:2,width:`${pct}%`}}/>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Group Narrative ────────────────────────────────────────────────────────────
function GroupNarrative() {
  const [narratives, setNarratives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({unit:"Detox",observation:"",observation_type:"Clinical Note",staff_name:""});
  const [saving, setSaving] = useState(false);

  useEffect(()=>{ loadNarratives(); },[]);

  async function loadNarratives() {
    try {
      const data = await GroupCohesion.list();
      setNarratives(data.sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp)));
    } catch(e){}
    setLoading(false);
  }

  async function save() {
    if(!form.observation||!form.staff_name) return;
    setSaving(true);
    try {
      await GroupCohesion.create({...form,cohesion_score:null,timestamp:new Date().toISOString(),affected_patients:""});
      setForm({unit:"Detox",observation:"",observation_type:"Clinical Note",staff_name:""});
      setShowForm(false);
      await loadNarratives();
    } catch(e){}
    setSaving(false);
  }

  const typeColor = {
    "Conflict":"#D4159A","Clinical Note":"#10D8F0","Positive":"#10D8F0",
    "Group Milestone":"#8844E8","Cohesion Drop":"#ff6b35","Warning":"#f0c040"
  };

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{fontSize:10,letterSpacing:2,color:"#444"}}>DAILY GROUP NARRATIVE</div>
        <button onClick={()=>setShowForm(!showForm)} style={{backgroundColor:"#D4159A22",border:"1px solid #D4159A44",color:"#D4159A",padding:"6px 14px",borderRadius:2,cursor:"pointer",fontSize:11,fontWeight:700}}>+ LOG NOTE</button>
      </div>
      {showForm && (
        <div style={{backgroundColor:"#0a0a18",border:"1px solid #D4159A44",borderRadius:4,padding:16,marginBottom:16}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div>
              <div style={{fontSize:10,color:"#444",letterSpacing:1,marginBottom:6}}>UNIT</div>
              <select value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})} style={{width:"100%",backgroundColor:"#07070F",border:"1px solid #2a2a3e",borderRadius:2,color:"#fff",padding:"8px 10px",fontSize:12}}>
                {["Detox","Residential","PHP"].map(u=><option key={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <div style={{fontSize:10,color:"#444",letterSpacing:1,marginBottom:6}}>TYPE</div>
              <select value={form.observation_type} onChange={e=>setForm({...form,observation_type:e.target.value})} style={{width:"100%",backgroundColor:"#07070F",border:"1px solid #2a2a3e",borderRadius:2,color:"#fff",padding:"8px 10px",fontSize:12}}>
                {["Clinical Note","Conflict","Positive","Group Milestone","Cohesion Drop","Warning"].map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:10,color:"#444",letterSpacing:1,marginBottom:6}}>STAFF NAME</div>
            <input value={form.staff_name} onChange={e=>setForm({...form,staff_name:e.target.value})} placeholder="Your name" style={{width:"100%",backgroundColor:"#07070F",border:"1px solid #2a2a3e",borderRadius:2,color:"#fff",padding:"8px 10px",fontSize:12,outline:"none",boxSizing:"border-box"}}/>
          </div>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:10,color:"#444",letterSpacing:1,marginBottom:6}}>NARRATIVE</div>
            <textarea value={form.observation} onChange={e=>setForm({...form,observation:e.target.value})} rows={3} placeholder="e.g. James T. and Devon L. had a conflict at lunch. Staff intervened. Group cohesion score dropped 4 points." style={{width:"100%",backgroundColor:"#07070F",border:"1px solid #2a2a3e",borderRadius:2,color:"#fff",padding:"8px 10px",fontSize:12,outline:"none",resize:"vertical",boxSizing:"border-box"}}/>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={save} disabled={saving} style={{backgroundColor:"#D4159A",border:"none",color:"#fff",padding:"8px 20px",borderRadius:2,cursor:"pointer",fontWeight:700,fontSize:12}}>{saving?"Saving...":"LOG NOTE"}</button>
            <button onClick={()=>setShowForm(false)} style={{background:"none",border:"1px solid #2a2a3e",color:"#555",padding:"8px 16px",borderRadius:2,cursor:"pointer",fontSize:12}}>Cancel</button>
          </div>
        </div>
      )}
      {loading && <div style={{color:"#444",fontSize:12,padding:20}}>Loading narratives...</div>}
      {!loading && !narratives.length && (
        <div style={{color:"#555",fontSize:13,textAlign:"center",padding:40}}>No group narratives logged yet.<br/><span style={{color:"#333",fontSize:11}}>Use the log above to record daily group observations.</span></div>
      )}
      {narratives.map((n,i)=>{
        const tc = typeColor[n.observation_type]||"#555";
        return (
          <div key={n.id||i} style={{backgroundColor:"#0a0a18",border:`1px solid ${tc}33`,borderLeft:`3px solid ${tc}`,borderRadius:4,padding:"14px 18px",marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8,flexWrap:"wrap",gap:6}}>
              <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                <span style={{backgroundColor:tc+"22",color:tc,fontSize:10,fontWeight:800,padding:"2px 8px",borderRadius:2,letterSpacing:1}}>{n.observation_type||"NOTE"}</span>
                <span style={{backgroundColor:"#1a1a2e",color:"#888",fontSize:10,padding:"2px 8px",borderRadius:2}}>{n.unit}</span>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:11,color:"#666"}}>{n.staff_name}</div>
                <div style={{fontSize:10,color:"#333"}}>{n.timestamp ? new Date(n.timestamp).toLocaleString() : ""}</div>
              </div>
            </div>
            <div style={{fontSize:13,color:"#ddd",lineHeight:1.7}}>{n.observation}</div>
            {n.cohesion_score!=null && <div style={{fontSize:11,color:"#555",marginTop:6}}>Cohesion score: <span style={{color:tc,fontWeight:700}}>{n.cohesion_score}</span></div>}
          </div>
        );
      })}
    </div>
  );
}

// ── Active Alerts ──────────────────────────────────────────────────────────────
function ActiveAlerts({ patients, onSelectPatient }) {
  const alerts = patients.filter(p=>p.alert_active);
  return (
    <div>
      <div style={{fontSize:10,letterSpacing:2,color:"#444",marginBottom:16}}>ACTIVE CLINICAL ALERTS ({alerts.length})</div>
      {!alerts.length && <div style={{color:"#555",fontSize:14,textAlign:"center",padding:40}}>No active alerts — all patients stable</div>}
      {alerts.map(p=>{
        const c=TIER_COLOR[p.risk_tier]||"#555";
        return (
          <div key={p.id} style={{backgroundColor:"#0a0a18",border:`1px solid ${c}44`,borderLeft:`3px solid ${c}`,borderRadius:4,padding:"16px 20px",marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8,flexWrap:"wrap",gap:8}}>
              <div>
                <div style={{fontWeight:900,fontSize:15,color:"#fff",marginBottom:4}}>{p.name}</div>
                <div style={{fontSize:11,color:"#555"}}>Day {p.length_of_stay} · {p.level_of_care} · Room {p.room_number||"—"}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:32,fontWeight:900,color:c}}>{p.risk_score}</span>
                <TierBadge tier={p.risk_tier}/>
              </div>
            </div>
            <div style={{fontSize:12,color:"#D4159A",fontWeight:700,marginBottom:6}}>🚨 {p.alert_reason}</div>
                  <div style={{fontSize:11,color:"#10D8F0",marginBottom:8}}>⚡ Triggered by BHT check-in</div>
            <button onClick={()=>onSelectPatient(p)} style={{backgroundColor:"#D4159A",border:"none",color:"#fff",padding:"6px 16px",borderRadius:2,cursor:"pointer",fontSize:11,fontWeight:700}}>View Patient →</button>
          </div>
        );
      })}
    </div>
  );
}

// ── ROI Calculator ─────────────────────────────────────────────────────────────
function ROICalculator() {
  const [beds, setBeds] = useState(40);
  const [avgStay, setAvgStay] = useState(20000);
  const [amaRate, setAmaRate] = useState(30);
  const [audience, setAudience] = useState("facility");
  const [selectedTier, setSelectedTier] = useState(null); // null = auto

  const TIERS = [
    { name:"Essential", price:3500, beds:"1–30 beds", description:"Up to 30 beds" },
    { name:"Professional", price:6500, beds:"31–100 beds", description:"Up to 100 beds" },
    { name:"Multi-Site", price:12000, beds:"100+ beds", description:"Multi-site / enterprise" },
  ];

  const autoBeds = beds<=30?0:beds<=100?1:2;
  const activeTierIdx = selectedTier !== null ? selectedTier : autoBeds;
  const tier = TIERS[activeTierIdx];

  const monthlyAdmissions = Math.round(beds*1.2);
  const amaLosses = Math.round(monthlyAdmissions*(amaRate/100));
  const monthlyRevLost = amaLosses*avgStay;
  const patientsRetained = Math.round(amaLosses*0.40);
  const monthlyRevRecovered = patientsRetained*avgStay;
  const netROI = monthlyRevRecovered-tier.price;
  const roiMultiple = (monthlyRevRecovered/tier.price).toFixed(1);
  const annualNetROI = netROI*12;
  const readmissionsAvoided = Math.round(patientsRetained*0.6);
  const insurerSavingsMonthly = readmissionsAvoided*35000;
  const insurerSavingsAnnual = insurerSavingsMonthly*12;
  const sliderStyle = {width:"100%",accentColor:"#D4159A",cursor:"pointer"};

  return (
    <div>
      {/* Audience toggle */}
      <div style={{display:"flex",gap:0,marginBottom:24,border:"1px solid #2a2a3e",borderRadius:4,overflow:"hidden",width:"fit-content"}}>
        {[["facility","Treatment Facility ROI"],["insurer","Insurance Company ROI"]].map(([k,label])=>(
          <button key={k} onClick={()=>setAudience(k)} style={{padding:"10px 24px",border:"none",cursor:"pointer",fontSize:12,fontWeight:800,letterSpacing:1,backgroundColor:audience===k?"#D4159A":"transparent",color:audience===k?"#fff":"#555"}}>{label}</button>
        ))}
      </div>

      {/* Subscription Tier Selector */}
      <div style={{marginBottom:24}}>
        <div style={{fontSize:10,letterSpacing:2,color:"#444",marginBottom:12}}>SELECT SUBSCRIPTION PLAN</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
          {TIERS.map((t,i)=>{
            const isActive = activeTierIdx === i;
            const isAuto = selectedTier === null && autoBeds === i;
            return (
              <div
                key={t.name}
                onClick={()=>setSelectedTier(selectedTier===i?null:i)}
                style={{
                  backgroundColor: isActive?"#1a0028":"#0a0a18",
                  border: isActive?`2px solid #D4159A`:`1px solid #2a2a3e`,
                  borderRadius:6,
                  padding:"16px 20px",
                  cursor:"pointer",
                  transition:"all 0.2s",
                  position:"relative",
                }}
              >
                {isAuto && (
                  <div style={{position:"absolute",top:8,right:8,fontSize:9,backgroundColor:"#D4159A22",color:"#D4159A",border:"1px solid #D4159A44",padding:"2px 6px",borderRadius:2,letterSpacing:1,fontWeight:800}}>AUTO</div>
                )}
                {!isAuto && isActive && (
                  <div style={{position:"absolute",top:8,right:8,fontSize:9,backgroundColor:"#8844E822",color:"#8844E8",border:"1px solid #8844E844",padding:"2px 6px",borderRadius:2,letterSpacing:1,fontWeight:800}}>SELECTED</div>
                )}
                <div style={{fontSize:13,fontWeight:900,color:isActive?"#D4159A":"#aaa",marginBottom:4}}>{t.name}</div>
                <div style={{fontSize:22,fontWeight:900,color:"#fff",marginBottom:2}}>${t.price.toLocaleString()}<span style={{fontSize:12,color:"#555",fontWeight:400}}>/mo</span></div>
                <div style={{fontSize:11,color:"#555"}}>{t.description}</div>
              </div>
            );
          })}
        </div>
        {selectedTier !== null && (
          <div
            onClick={()=>setSelectedTier(null)}
            style={{marginTop:8,fontSize:11,color:"#555",cursor:"pointer",textDecoration:"underline"}}
          >
            ↩ Reset to auto-select based on bed count
          </div>
        )}
      </div>

      {/* Main calculator grid */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
        <div style={{backgroundColor:"#0a0a18",border:"1px solid #1a1a2e",borderRadius:6,padding:24}}>
          <div style={{fontSize:10,letterSpacing:2,color:"#444",marginBottom:20}}>FACILITY INPUTS</div>
          {[
            {label:"Licensed Beds",val:beds,min:10,max:300,setter:setBeds,format:v=>v},
            {label:"Avg Revenue / Admission",val:avgStay,min:5000,max:80000,step:1000,setter:setAvgStay,format:v=>`$${v.toLocaleString()}`},
            {label:"AMA / Early Discharge Rate",val:amaRate,min:10,max:50,setter:setAmaRate,format:v=>`${v}%`},
          ].map(({label,val,min,max,step=1,setter,format})=>(
            <div key={label} style={{marginBottom:20}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <span style={{fontSize:12,color:"#888"}}>{label}</span>
                <span style={{fontSize:16,fontWeight:900,color:"#D4159A"}}>{format(val)}</span>
              </div>
              <input type="range" min={min} max={max} step={step} value={val} onChange={e=>{ setter(Number(e.target.value)); if(selectedTier===null){/* auto updates */} }} style={sliderStyle}/>
            </div>
          ))}
          <div style={{backgroundColor:"#0d0d1a",border:"1px solid #2a2a3e",borderRadius:4,padding:"10px 14px",marginTop:8}}>
            <div style={{fontSize:10,color:"#444",letterSpacing:1,marginBottom:4}}>ACTIVE PLAN</div>
            <div style={{fontSize:16,fontWeight:900,color:"#D4159A"}}>{tier.name} — ${tier.price.toLocaleString()}/mo</div>
            <div style={{fontSize:11,color:"#555",marginTop:2}}>{tier.description}</div>
          </div>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {audience==="facility" ? <>
            {[
              {label:"MONTHLY REVENUE AT RISK",val:`$${monthlyRevLost.toLocaleString()}`,sub:`${amaLosses} early discharges × $${avgStay.toLocaleString()}`,color:"#D4159A"},
              {label:"REVENUE RECOVERED WITH CENSUSGUARD",val:`$${monthlyRevRecovered.toLocaleString()}`,sub:`${patientsRetained} patients retained (40% recovery rate)`,color:"#10D8F0"},
              {label:"NET ROI AFTER SUBSCRIPTION",val:`$${netROI.toLocaleString()}/mo`,sub:`${roiMultiple}x return · $${annualNetROI.toLocaleString()}/yr`,color:"#8844E8"},
            ].map(({label,val,sub,color})=>(
              <div key={label} style={{backgroundColor:"#0a0a18",border:`1px solid ${color}22`,borderLeft:`3px solid ${color}`,borderRadius:4,padding:"16px 20px"}}>
                <div style={{fontSize:9,color:"#444",letterSpacing:2,marginBottom:6}}>{label}</div>
                <div style={{fontSize:28,fontWeight:900,color,lineHeight:1.1,marginBottom:4}}>{val}</div>
                <div style={{fontSize:11,color:"#555"}}>{sub}</div>
              </div>
            ))}
          </> : <>
            {[
              {label:"READMISSIONS AVOIDED / MONTH",val:readmissionsAvoided,sub:"60% of retained patients would have readmitted",color:"#10D8F0"},
              {label:"INSURER SAVINGS / MONTH",val:`$${insurerSavingsMonthly.toLocaleString()}`,sub:`${readmissionsAvoided} avoided × $35K avg readmission cost`,color:"#8844E8"},
              {label:"ANNUAL INSURER SAVINGS",val:`$${insurerSavingsAnnual.toLocaleString()}`,sub:"Per contracted facility using CensusGuard",color:"#D4159A"},
            ].map(({label,val,sub,color})=>(
              <div key={label} style={{backgroundColor:"#0a0a18",border:`1px solid ${color}22`,borderLeft:`3px solid ${color}`,borderRadius:4,padding:"16px 20px"}}>
                <div style={{fontSize:9,color:"#444",letterSpacing:2,marginBottom:6}}>{label}</div>
                <div style={{fontSize:28,fontWeight:900,color,lineHeight:1.1,marginBottom:4}}>{val}</div>
                <div style={{fontSize:11,color:"#555"}}>{sub}</div>
              </div>
            ))}
          </>}
        </div>
      </div>
    </div>
  );
}

  const activeAlerts = patients.filter(p=>p.alert_active);
  const revenueProtected = `$${(patients.filter(p=>p.risk_tier==="CRITICAL"||p.risk_tier==="HIGH").length*15000).toLocaleString()}`;

  return (
    <div style={{backgroundColor:"#07070F",color:"#fff",fontFamily:"'Inter',sans-serif",minHeight:"100vh"}}>
      {/* Header */}
      <div style={{padding:"12px 24px",borderBottom:"1px solid #1a1a2e",backgroundColor:"#09091a",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <img src={LOGO} alt="AnchorPoint" style={{height:44,objectFit:"contain"}}/>
          <div>
            <div style={{fontWeight:900,fontSize:18,letterSpacing:1}}>CensusGuard<span style={{color:"#D4159A"}}>™</span></div>
            <div style={{fontSize:11,color:"#555",letterSpacing:2}}>CLINICAL DASHBOARD · LIVE DATA</div>
          </div>
        </div>
        <SearchBar patients={patients} onSelect={p=>{setSelected(p);setTab("monitor");}}/>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{backgroundColor:"#10D8F022",color:"#10D8F0",border:"1px solid #10D8F033",fontSize:11,fontWeight:700,padding:"4px 12px",borderRadius:2,letterSpacing:1}}>● REAL-TIME SCORING ACTIVE</span>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:0,borderBottom:"1px solid #1a1a2e"}}>
        {[
          ["TOTAL PATIENTS",patients.length,"#fff"],
          ["CRITICAL",critical,"#D4159A"],
          ["HIGH RISK",high,"#ff6b35"],
          ["AVG RISK SCORE",avgScore,"#f0c040"],
          ["REVENUE PROTECTED",revenueProtected,"#10D8F0"],
        ].map(([label,val,color])=>(
          <div key={label} style={{padding:"16px 20px",borderRight:"1px solid #1a1a2e",textAlign:"center",backgroundColor:"#09091a",lastChild:{borderRight:"none"}}}>
            <div style={{fontSize:9,color:"#444",letterSpacing:2,marginBottom:4}}>{label}</div>
            <div style={{fontSize:26,fontWeight:900,color}}>{val}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:0,padding:"0 24px",borderBottom:"1px solid #1a1a2e",backgroundColor:"#09091a",overflowX:"auto"}}>
        {[["monitor","Patient Monitor"],["census","Census Floor"],["flow","Group Flow"],["narrative","Group Narrative"],["alerts","Active Alerts"],["roi","ROI Calculator"]].map(([t,label])=>(
          <button key={t} onClick={()=>{setTab(t);setSelected(null);}} style={{background:"none",border:"none",borderBottom:tab===t?"2px solid #D4159A":"2px solid transparent",color:tab===t?"#D4159A":"#555",padding:"14px 20px",cursor:"pointer",fontSize:13,fontWeight:700,letterSpacing:1,marginBottom:-1,whiteSpace:"nowrap"}}>
            {label}{t==="alerts"&&activeAlerts.length>0&&<span style={{marginLeft:6,backgroundColor:"#D4159A",color:"#fff",borderRadius:"50%",width:18,height:18,fontSize:10,fontWeight:900,display:"inline-flex",alignItems:"center",justifyContent:"center"}}>{activeAlerts.length}</span>}
          </button>
        ))}
      </div>

      {/* Body */}
      <div style={{padding:"24px"}}>
        {loading ? (
          <div style={{textAlign:"center",padding:80,color:"#444",fontSize:14}}>Loading census data...</div>
        ) : (
          <>
            {tab==="monitor" && <PatientMonitor patients={patients} selected={selected} onSelect={setSelected}/>}
            {tab==="census" && <CensusFloorMap patients={patients} onSelectPatient={p=>{setSelected(p);}}/>}
            {tab==="flow" && <GroupFlowPanel patients={patients}/>}
            {tab==="narrative" && <GroupNarrative/>}
      {tab==="alerts" && <ActiveAlerts patients={patients} onSelectPatient={p=>{setSelected(p);setTab("monitor");}}/>}
            {tab==="roi" && <ROICalculator/>}
          </>
        )}
      </div>

      {/* Patient detail slide-in panel */}
      {selected && <PatientDetail patient={selected} allPatients={patients} onClose={()=>setSelected(null)}/>}

      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        *{box-sizing:border-box}
        button{font-family:inherit}
        input,select,textarea{font-family:inherit}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:#0d0d1a}
        ::-webkit-scrollbar-thumb{background:#2a1a3e;border-radius:2px}
      `}</style>
    </div>
  );
}
