import { useState, useEffect } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { censusGuardAdapter } from "@/lib/censusGuardAdapter";
import { patients as seedPatients } from "@/data/censusGuardData";

const TIER_COLOR = { CRITICAL:"#D4159A", HIGH:"#ff6b35", MODERATE:"#f0c040", LOW:"#10D8F0" };
const TIER_BG    = { CRITICAL:"#2a0018", HIGH:"#2a1400", MODERATE:"#252000", LOW:"#001c22" };
const SUBSTANCE_MAP = {1:"Alcohol",2:"Opioid",3:"Benzodiazepine",4:"Methamphetamine",5:"Cocaine",6:"Non-rx Methadone",7:"Heroin",8:"Other"};
const ACTION_TYPES = [
  "Counselor contacted patient",
  "1:1 session scheduled",
  "1:1 session completed",
  "Discharge planning initiated",
  "Family notified",
  "Staff increased check-in frequency",
  "Medication review ordered",
  "Group therapy added",
  "Peer separation implemented",
  "Safety check completed",
  "Custom note"
];


function useIsMobile() {
  const [mobile, setMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 640);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 640);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return mobile;
}


const FALLBACK_PATIENTS = seedPatients.map((patient) => ({
  id: patient.id,
  name: patient.displayName || patient.name,
  episode_id: patient.episodeId,
  unit: patient.unit,
  room_number: patient.roomNumber || patient.room_number || "",
  level_of_care: patient.levelOfCare || patient.level_of_care,
  length_of_stay: patient.dayOfStay || patient.length_of_stay || 0,
  substance_encoded: patient.substance_encoded,
  risk_score: patient.amaRiskScore || patient.risk_score || 0,
  risk_tier: patient.riskTier || patient.risk_tier || "LOW",
  previous_risk_score: patient.previous_risk_score,
  velocity: patient.velocity || 0,
  alert_active: Boolean(patient.alert_active),
  alert_reason: patient.lastTrigger?.label || patient.alert_reason || "",
  top_drivers: Array.isArray(patient.drivers) ? patient.drivers.join("|") : patient.top_drivers || "",
  intervention: patient.suggestedAction || patient.intervention || "",
  status: patient.status || "Active",
  counselor: patient.counselor,
  last_staff_checkin: patient.last_staff_checkin,
  cliff_window: Boolean(patient.cliff_window),
  calm_before_storm_flag: Boolean(patient.calm_before_storm_flag),
  psych_comorbid: Boolean(patient.psych_comorbid),
  moud_status: patient.moud_status,
  medication_review_needed: Boolean(patient.medication_review_needed),
}));
const FALLBACK_HISTORY = {};
const FALLBACK_ACTIONS = {};
const FILTER_OPTIONS = ["All","Critical","High","Moderate","Low","Detox","Residential","PHP","IOP"];
const NAV_AREAS = [
  { id:"monitor", label:"Patient Monitor" },
  { id:"census", label:"Census Floor" },
  { id:"staff", label:"Staff Docs" },
  { id:"psych", label:"Psych / Providers" },
  { id:"alerts", label:"Alerts" },
  { id:"outcomes", label:"Outcomes" },
  { id:"flow", label:"Group Flow" },
  { id:"moud", label:"MOUD" },
];

const CLOSED_LOOP_STAGES = [
  ["Detect", "Risk signal enters CensusGuard from admission, staff notes, or live scoring.", "#10D8F0"],
  ["Alert", "High-risk patients route to the staff queue before the window closes.", "#D4159A"],
  ["Guide", "CensusGuard recommends the next clinical action and responsible owner.", "#8844E8"],
  ["Document", "Staff records who acted, what happened, and when it happened.", "#ff6b35"],
  ["Verify", "Follow-up and outcome notes prove whether continuity was protected.", "#f0c040"],
];

const CLOSED_LOOP_ROUTE_BY_STAGE = {
  Detect: "monitor",
  Alert: "alerts",
  Guide: "psych",
  Document: "staff",
  Verify: "outcomes",
};

const CLOSED_LOOP_STAGE_BY_SECTION = {
  monitor: "Detect",
  census: "Detect",
  flow: "Detect",
  alerts: "Alert",
  psych: "Guide",
  moud: "Guide",
  staff: "Document",
  outcomes: "Verify",
};

const VERTEX_FEATURE_DEFAULTS = {
  STFIPS: "40",
  EDUC: "3",
  MARSTAT: "1",
  SERVICES: "7",
  DETCRIM: "1",
  PSOURCE: "7",
  NOPRIOR: "1",
  ARRESTS: "0",
  EMPLOY: "3",
  METHUSE: "1",
  PSYPROB: "1",
  PREG: "1",
  SEX: "2",
  VET: "2",
  LIVARAG: "3",
  DAYWAIT: "0",
  DSMCRIT: "5",
  AGE: "6",
  RACE: "5",
  ETHNIC: "5",
  DETNLF: "1",
  PRIMINC: "1",
  SUB1: "2",
  SUB2: "1",
  SUB3: "1",
  ROUTE1: "2",
  ROUTE2: "1",
  ROUTE3: "1",
  FREQ1: "3",
  FREQ2: "1",
  FREQ3: "1",
  FRSTUSE1: "4",
  FRSTUSE2: "1",
  FRSTUSE3: "1",
  HLTHINS: "4",
  PRIMPAY: "5",
  FREQ_ATND_SELF_HELP: "1",
  ALCFLG: "0",
  COKEFLG: "0",
  MARFLG: "0",
  HERFLG: "0",
  METHFLG: "0",
  OPSYNFLG: "0",
  PCPFLG: "0",
  HALLFLG: "0",
  MTHAMFLG: "0",
  AMPHFLG: "0",
  STIMFLG: "0",
  BENZFLG: "0",
  TRNQFLG: "0",
  BARBFLG: "0",
  SEDHPFLG: "0",
  INHFLG: "0",
  OTCFLG: "0",
  OTHERFLG: "0",
  DIVISION: "7",
  REGION: "3",
  IDU: "0",
  ALCDRUG: "2",
  CBSA2020: "36420",
};

function buildVertexRiskPayload(patient) {
  const instance = { ...VERTEX_FEATURE_DEFAULTS };
  const substance = SUBSTANCE_MAP[patient?.substance_encoded] || "";
  const level = patient?.level_of_care || patient?.unit || "";

  instance.SUB1 = String(patient?.substance_encoded || instance.SUB1);
  instance.AGE = String(patient?.age_code || patient?.age || instance.AGE);
  instance.DAYWAIT = String(patient?.day_wait || patient?.daywait || instance.DAYWAIT);
  instance.PSYPROB = patient?.psych_comorbid ? "1" : instance.PSYPROB;
  instance.SERVICES = /detox/i.test(level) ? "7" : /residential/i.test(level) ? "6" : /php|iop/i.test(level) ? "8" : instance.SERVICES;

  if (/alcohol/i.test(substance)) instance.ALCFLG = "1";
  if (/cocaine/i.test(substance)) instance.COKEFLG = "1";
  if (/heroin/i.test(substance)) instance.HERFLG = "1";
  if (/methamphetamine/i.test(substance)) instance.METHFLG = "1";
  if (/benzodiazepine/i.test(substance)) instance.BENZFLG = "1";
  if (/opioid|methadone/i.test(substance)) instance.OPSYNFLG = "1";

  return { instances: [instance] };
}

function formatScoreResult(result) {
  if (!result) return "";
  if (typeof result.amaProbability === "number") {
    return `${Math.round(result.amaProbability * 100)}% AMA risk probability`;
  }
  if (Array.isArray(result.predictions) && result.predictions.length) {
    return "Vertex returned a prediction";
  }
  return "Score request completed";
}

function formatRunTime(value) {
  if (!value) return "Never";
  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getPatientOwner(patient, index = 0) {
  if (!patient) return "Unassigned";
  return patient.counselor || patient.assigned_counselor || patient.owner || ["T. Williams, LCDC", "R. Santos, CADC", "K. Patel, LCSW", "M. Johnson, LPC", "A. Rivera, CADC", "C. Kim, LMFT"][index % 6];
}

function getGuidedIntervention(patient) {
  if (!patient) return "Load a patient record before CensusGuard can recommend a guided intervention.";
  if (patient.intervention) return patient.intervention;
  if (patient.risk_tier === "CRITICAL") return "Immediate counselor touch, safety check, medication review, and documented follow-up before next shift.";
  if (patient.risk_tier === "HIGH") return "Same-shift counselor contact, barrier review, and next-check-in scheduled with staff owner.";
  if (patient.risk_tier === "MODERATE") return "Monitor trend, confirm engagement, and add note if mood, attendance, or peer dynamics shift.";
  return "Continue routine monitoring and document any material change in engagement.";
}

function getAuditCoverage(activeAlerts, patients) {
  if (!activeAlerts.length) return patients.length ? 100 : 0;
  const documented = activeAlerts.filter((patient) => patient.last_staff_checkin || patient.last_action_at || patient.audit_status === "documented").length;
  return Math.round((documented / activeAlerts.length) * 100);
}

function findPatientByName(patients, name) {
  if (!name) return null;
  const normalized = String(name).trim().toLowerCase();
  return patients.find((patient) => String(patient.name || "").trim().toLowerCase() === normalized) || null;
}

function SectionHeader({ eyebrow, title, copy, action }) {
  return (
    <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",gap:16,flexWrap:"wrap",marginBottom:18}}>
      <div>
        <div style={{fontSize:10,letterSpacing:2,color:"#10D8F0",fontWeight:800,marginBottom:6}}>{eyebrow}</div>
        <div style={{fontSize:22,fontWeight:900,color:"#fff",lineHeight:1.1}}>{title}</div>
        {copy && <div style={{fontSize:12,color:"#666",marginTop:6,maxWidth:720,lineHeight:1.5}}>{copy}</div>}
      </div>
      {action}
    </div>
  );
}

function PatientNameAction({ patient, onOpen, compact = false }) {
  if (!patient) return null;
  return (
    <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onOpen?.(patient);
        }}
        style={{
          background:"none",
          border:"none",
          padding:0,
          color:"#fff",
          cursor:"pointer",
          fontWeight:900,
          fontSize:compact ? 13 : 14,
          textAlign:"left",
          textDecoration:"underline",
          textDecorationColor:"#10D8F066",
          textUnderlineOffset:3,
        }}
      >
        {patient.name}
      </button>
      <Link
        to={`/patient/${patient.id}`}
        onClick={(event) => event.stopPropagation()}
        style={{fontSize:10,color:"#10D8F0",fontWeight:900,textDecoration:"none",letterSpacing:.6,whiteSpace:"nowrap"}}
      >
        FULL PAGE
      </Link>
    </div>
  );
}

// -- SVG Donut Chart ------------------------------------------------------------
function DonutChart({ patients, size = 120 }) {
  const tiers = ["CRITICAL","HIGH","MODERATE","LOW"];
  const counts = tiers.map(t => patients.filter(p => p.risk_tier === t).length);
  const total = patients.length || 1;
  const r = 42, cx = size/2, cy = size/2, stroke = 18;
  const circumference = 2 * Math.PI * r;

  let offset = 0;
  const segments = tiers.map((tier, i) => {
    const pct = counts[i] / total;
    const dash = pct * circumference;
    const seg = { tier, count: counts[i], pct, dash, offset };
    offset += dash;
    return seg;
  }).filter(s => s.count > 0);

  return (
    <div style={{position:"relative", width:size, height:size, flexShrink:0}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1a1a2e" strokeWidth={stroke}/>
        {segments.map((s, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={TIER_COLOR[s.tier]} strokeWidth={stroke}
            strokeDasharray={`${s.dash} ${circumference - s.dash}`}
            strokeDashoffset={-s.offset}
            strokeLinecap="butt"
          />
        ))}
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        <div style={{fontSize:22,fontWeight:900,color:"#fff",lineHeight:1}}>{patients.length}</div>
        <div style={{fontSize:9,color:"#555",letterSpacing:1}}>PTS</div>
      </div>
    </div>
  );
}

// -- Individual Score Line Chart ------------------------------------------------
function ScoreLineChart({ patientId, patientName, patient }) {
  const history = getPatientHistory(patient || FALLBACK_PATIENTS.find((item) => item.id === patientId));
  if (!history.length) return <div style={{color:"#444",fontSize:12,padding:20}}>No history available.</div>;

  const W = 420, H = 140, padL = 36, padR = 16, padT = 12, padB = 28;
  const maxDay = Math.max(...history.map(h => h.day), 1);
  const xScale = d => padL + (d / maxDay) * (W - padL - padR);
  const yScale = s => padT + ((100 - s) / 100) * (H - padT - padB);

  const points = history.map(h => `${xScale(h.day)},${yScale(h.score)}`).join(" ");

  // Risk zone bands
  const zones = [
    { min:75, max:100, color:"#D4159A", label:"CRITICAL" },
    { min:50, max:75, color:"#ff6b35", label:"HIGH" },
    { min:25, max:50, color:"#f0c040", label:"MOD" },
    { min:0, max:25, color:"#10D8F0", label:"LOW" },
  ];

  return (
    <div style={{overflowX:"auto"}}>
      <svg width={W} height={H} style={{display:"block"}}>
        {/* Zone bands */}
        {zones.map(z => (
          <rect key={z.label} x={padL} y={yScale(z.max)} width={W - padL - padR} height={yScale(z.min) - yScale(z.max)}
            fill={z.color} fillOpacity={0.06}/>
        ))}
        {/* Grid lines */}
        {[0,25,50,75,100].map(s => (
          <g key={s}>
            <line x1={padL} x2={W - padR} y1={yScale(s)} y2={yScale(s)} stroke="#1a1a2e" strokeDasharray="3,3"/>
            <text x={padL - 4} y={yScale(s) + 4} fill="#444" fontSize={9} textAnchor="end">{s}</text>
          </g>
        ))}
        {/* Day labels */}
        {history.map(h => (
          <text key={h.day} x={xScale(h.day)} y={H - 6} fill="#444" fontSize={9} textAnchor="middle">D{h.day}</text>
        ))}
        {/* Line */}
        <polyline points={points} fill="none" stroke="#8844E8" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round"/>
        {/* Alert dots */}
        {history.map((h, i) => {
          const c = TIER_COLOR[h.risk_tier] || "#555";
          return (
            <g key={i}>
              <circle cx={xScale(h.day)} cy={yScale(h.score)} r={h.alert_fired ? 6 : 4} fill={c} stroke="#07070F" strokeWidth={1.5}/>
              {h.alert_fired && <circle cx={xScale(h.day)} cy={yScale(h.score)} r={9} fill="none" stroke={c} strokeWidth={1} opacity={0.5}/>}
              <text x={xScale(h.day)} y={yScale(h.score) - 10} fill={c} fontSize={10} fontWeight={700} textAnchor="middle">{h.score}</text>
            </g>
          );
        })}
      </svg>
      <div style={{display:"flex",gap:12,flexWrap:"wrap",marginTop:6}}>
        {zones.map(z => <span key={z.label} style={{fontSize:10,color:TIER_COLOR[z.label==="MOD"?"MODERATE":z.label],display:"flex",alignItems:"center",gap:4}}>
          <span style={{width:8,height:8,borderRadius:"50%",backgroundColor:TIER_COLOR[z.label==="MOD"?"MODERATE":z.label],display:"inline-block"}}/>
          {z.label}
        </span>)}
        <span style={{fontSize:10,color:"#555",marginLeft:"auto"}}>? = alert fired</span>
      </div>
    </div>
  );
}

// -- Group Progress Flow (Sankey-style) -----------------------------------------
function GroupRiskChart({ patients }) {
  // Simulated group avg risk score over 14 days
  const groupHistory = [
    { day:1,  avg:52, critical:0, high:1, note:null },
    { day:2,  avg:55, critical:0, high:1, note:null },
    { day:3,  avg:58, critical:0, high:2, note:"Unit escalation detected" },
    { day:4,  avg:61, critical:0, high:2, note:null },
    { day:5,  avg:63, critical:0, high:2, note:null },
    { day:6,  avg:65, critical:0, high:2, note:null },
    { day:7,  avg:67, critical:1, high:2, note:"Critical alert threshold crossed" },
    { day:8,  avg:70, critical:1, high:2, note:null },
    { day:9,  avg:72, critical:1, high:2, note:"Cliff window: Detox" },
    { day:10, avg:69, critical:1, high:2, note:"Intervention logged" },
    { day:11, avg:66, critical:1, high:2, note:null },
    { day:12, avg:64, critical:1, high:1, note:null },
    { day:13, avg:62, critical:1, high:2, note:"Residential risk escalation" },
    { day:14, avg:64, critical:1, high:2, note:null },
  ];

  const W = 580, H = 180, padL = 40, padR = 16, padT = 16, padB = 32;
  const maxDay = 14;
  const xScale = d => padL + ((d - 1) / (maxDay - 1)) * (W - padL - padR);
  const yScale = s => padT + ((100 - s) / 100) * (H - padT - padB);

  const linePoints = groupHistory.map(h => `${xScale(h.day)},${yScale(h.avg)}`).join(" ");

  // fill area under line
  const areaPoints = [
    `${xScale(1)},${H - padB}`,
    ...groupHistory.map(h => `${xScale(h.day)},${yScale(h.avg)}`),
    `${xScale(14)},${H - padB}`
  ].join(" ");

  return (
    <div style={{backgroundColor:"#0a0a18",border:"1px solid #1a1a2e",borderRadius:4,padding:20,marginBottom:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}>
        <div style={{fontSize:10,letterSpacing:2,color:"#444"}}>COHORT AVG RISK SCORE — 14-DAY TREND</div>
        <div style={{display:"flex",gap:12,fontSize:10}}>
          <span style={{color:"#D4159A"}}>? Avg Risk Score</span>
          <span style={{color:"#ff6b35"}}>? Event</span>
          <span style={{color:"#8844E822",border:"1px solid #8844E844",padding:"1px 6px",borderRadius:2,color:"#8844E8"}}>SIMULATED DATA</span>
        </div>
      </div>
      <div style={{overflowX:"auto"}}>
        <svg width={W} height={H} style={{display:"block",minWidth:W}}>
          {/* Risk zone bands */}
          {[
            {min:75,max:100,color:"#D4159A",label:"CRITICAL"},
            {min:50,max:75,color:"#ff6b35",label:"HIGH"},
            {min:25,max:50,color:"#f0c040",label:"MOD"},
            {min:0,max:25,color:"#10D8F0",label:"LOW"},
          ].map(z => (
            <rect key={z.label} x={padL} y={yScale(z.max)} width={W-padL-padR} height={yScale(z.min)-yScale(z.max)} fill={z.color} fillOpacity={0.04}/>
          ))}
          {/* Grid lines */}
          {[0,25,50,75,100].map(s => (
            <g key={s}>
              <line x1={padL} x2={W-padR} y1={yScale(s)} y2={yScale(s)} stroke="#1a1a2e" strokeDasharray="3,3"/>
              <text x={padL-4} y={yScale(s)+4} fill="#333" fontSize={9} textAnchor="end">{s}</text>
            </g>
          ))}
          {/* Day labels */}
          {groupHistory.filter((_,i)=>i%2===0).map(h => (
            <text key={h.day} x={xScale(h.day)} y={H-8} fill="#333" fontSize={9} textAnchor="middle">D{h.day}</text>
          ))}
          {/* Area fill */}
          <polygon points={areaPoints} fill="#8844E8" fillOpacity={0.07}/>
          {/* Line */}
          <polyline points={linePoints} fill="none" stroke="#8844E8" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round"/>
          {/* Event dots & notes */}
          {groupHistory.map((h, i) => {
            const hasNote = !!h.note;
            const dotColor = h.critical > 0 ? "#D4159A" : h.high > 1 ? "#ff6b35" : "#8844E8";
            return (
              <g key={i}>
                <circle cx={xScale(h.day)} cy={yScale(h.avg)} r={hasNote ? 6 : 3} fill={dotColor} stroke="#07070F" strokeWidth={1.5}/>
                {hasNote && (
                  <>
                    <line x1={xScale(h.day)} y1={yScale(h.avg)-6} x2={xScale(h.day)} y2={yScale(h.avg)-22} stroke={dotColor} strokeWidth={1} strokeDasharray="2,2"/>
                    <text x={xScale(h.day)} y={yScale(h.avg)-25} fill={dotColor} fontSize={8} textAnchor="middle" fontWeight={700}>{h.note}</text>
                  </>
                )}
                <text x={xScale(h.day)} y={yScale(h.avg)+16} fill="#555" fontSize={8} textAnchor="middle">{h.avg}</text>
              </g>
            );
          })}
        </svg>
      </div>
      {/* Critical/High count mini legend */}
      <div style={{display:"flex",gap:16,marginTop:10,flexWrap:"wrap"}}>
        {groupHistory.filter(h=>h.note).map(h=>(
          <div key={h.day} style={{display:"flex",alignItems:"center",gap:6,fontSize:10,color:"#555"}}>
            <span style={{color:"#ff6b35",fontWeight:700}}>D{h.day}</span>
            <span>{h.note}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GroupProgressFlow({ patients }) {
  const [flowView, setFlowView] = useState("all");
  const stages = ["Detox","Residential","PHP","IOP","Discharge"];
  // count patients in each stage + simulated discharge
  const counts = {
    "Detox": patients.filter(p => p.unit === "Detox").length,
    "Residential": patients.filter(p => p.unit === "Residential").length,
    "PHP": patients.filter(p => p.unit === "PHP").length,
    "IOP": patients.filter(p => p.unit === "IOP").length,
    "Discharge": 3, // simulated completed
  };
  const maxCount = Math.max(...Object.values(counts), 1);
  const W = 680, H = 160, nodeW = 86, gap = (W - stages.length * nodeW) / (stages.length - 1);

  const stageColors = { "Detox":"#D4159A", "Residential":"#ff6b35", "PHP":"#8844E8", "IOP":"#10D8F0", "Discharge":"#f0c040" };

  const nodes = stages.map((s, i) => ({
    stage: s,
    x: i * (nodeW + gap),
    count: counts[s],
    color: stageColors[s],
    height: Math.max(20, (counts[s] / maxCount) * 100),
  }));

  // individual patient trajectories
  const patientLines = [
    { id:"d7", path:[{stage:"Detox",day:0},{stage:"Residential",day:7},{stage:"PHP",day:21},{stage:"Discharge",day:42}], color:"#10D8F0" , last_staff_checkin:"2026-04-21T19:00:00" },
    { id:"d6", path:[{stage:"Detox",day:0},{stage:"Residential",day:7},{stage:"PHP",day:21}], color:"#8844E8" , last_staff_checkin:"2026-04-21T19:00:00" },
    { id:"d3", path:[{stage:"Detox",day:0},{stage:"Residential",day:7}], color:"#ff6b35" , last_staff_checkin:"2026-04-21T20:30:00" },
  ];

  return (
    <div>
      <GroupRiskChart patients={patients}/>
      <div style={{display:"flex",justifyContent:"flex-end",gap:6,marginBottom:10}}>
        {[
          ["all","All Together"],
          ["level","By Level of Care"],
        ].map(([id,label]) => (
          <button key={id} type="button" onClick={()=>setFlowView(id)} style={{backgroundColor:flowView===id?"#D4159A22":"#0a0a18",border:`1px solid ${flowView===id?"#D4159A66":"#2a2a3e"}`,color:flowView===id?"#D4159A":"#777",borderRadius:3,padding:"6px 10px",fontSize:11,fontWeight:900,cursor:"pointer"}}>
            {label}
          </button>
        ))}
      </div>
      <div style={{fontSize:10,letterSpacing:2,color:"#444",marginBottom:12}}>GROUP TREATMENT FLOW — COHORT PROGRESSION</div>
      <div style={{overflowX:"auto",backgroundColor:"#0a0a18",borderRadius:4,padding:20,border:"1px solid #1a1a2e"}}>
        <svg width={W} height={H} style={{display:"block",minWidth:W}}>
          {/* Flow arrows between nodes */}
          {nodes.slice(0,-1).map((n, i) => {
            const next = nodes[i+1];
            const y1 = (H - n.height) / 2 + n.height / 2;
            const y2 = (H - next.height) / 2 + next.height / 2;
            const x1 = n.x + nodeW;
            const x2 = next.x;
            const mx = (x1 + x2) / 2;
            // flow band
            const bandH1 = Math.min(n.height, next.height) * 0.6;
            const top1 = y1 - bandH1/2, top2 = y2 - bandH1/2;
            return (
              <g key={i}>
                <path d={`M ${x1} ${top1} C ${mx} ${top1}, ${mx} ${top2}, ${x2} ${top2} L ${x2} ${top2+bandH1} C ${mx} ${top2+bandH1}, ${mx} ${top1+bandH1}, ${x1} ${top1+bandH1} Z`}
                  fill={n.color} fillOpacity={0.15}/>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={n.color} strokeOpacity={0.3} strokeWidth={1} strokeDasharray="4,4"/>
              </g>
            );
          })}
          {/* Node bars */}
          {nodes.map(n => {
            const y = (H - n.height) / 2;
            return (
              <g key={n.stage}>
                <rect x={n.x} y={y} width={nodeW} height={n.height} rx={4} fill={n.color} fillOpacity={0.15} stroke={n.color} strokeWidth={1.5}/>
                <text x={n.x + nodeW/2} y={y + n.height/2 - 8} fill={n.color} fontSize={22} fontWeight={900} textAnchor="middle">{n.count}</text>
                <text x={n.x + nodeW/2} y={y + n.height/2 + 10} fill={n.color} fontSize={9} fontWeight={700} textAnchor="middle" letterSpacing={1}>{n.stage.toUpperCase()}</text>
              </g>
            );
          })}
        </svg>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:8,paddingLeft:4,paddingRight:4}}>
          {stages.map(s => (
            <div key={s} style={{textAlign:"center",width:nodeW,fontSize:10,color:"#444"}}>
              {s === "Discharge" ? "? Completed" : `${counts[s]} active`}
            </div>
          ))}
        </div>
      </div>
      {/* Mini patient progress rows */}
      <div style={{marginTop:16}}>
        <div style={{fontSize:10,letterSpacing:2,color:"#444",marginBottom:10}}>INDIVIDUAL TREATMENT JOURNEYS</div>
        {(flowView === "level" ? stages.flatMap(stage => patients.filter(patient => patient.unit === stage)) : patients).map(p => {
          const stageIdx = stages.indexOf(p.unit);
          const c = TIER_COLOR[p.risk_tier];
          return (
            <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8,backgroundColor:"#0a0a18",borderRadius:3,padding:"8px 12px",border:"1px solid #1a1a2e"}}>
              <div style={{width:80,fontSize:12,fontWeight:700,color:"#fff",flexShrink:0}}>{p.name}</div>
              <div style={{flex:1,display:"flex",alignItems:"center",gap:0,position:"relative"}}>
                {stages.map((s, i) => {
                  const active = i === stageIdx;
                  const done = i < stageIdx;
                  const sc = stageColors[s];
                  return (
                    <div key={s} style={{display:"flex",alignItems:"center",flex:1}}>
                      <div style={{
                        width:24,height:24,borderRadius:"50%",
                        backgroundColor: done ? sc+"44" : active ? sc : "#1a1a2e",
                        border: `2px solid ${done||active ? sc : "#333"}`,
                        display:"flex",alignItems:"center",justifyContent:"center",
                        flexShrink:0,zIndex:1
                      }}>
                        {done && <span style={{fontSize:10,color:sc}}>?</span>}
                        {active && <span style={{fontSize:8,color:"#fff",fontWeight:900}}>?</span>}
                      </div>
                      {i < stages.length - 1 && <div style={{flex:1,height:2,backgroundColor: done ? sc+"44" : "#1a1a2e"}}/>}
                    </div>
                  );
                })}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                <span style={{fontSize:11,color:"#555"}}>Day {p.length_of_stay}</span>
                <span style={{fontSize:16,fontWeight:900,color:c}}>{p.risk_score}</span>
                <span style={{fontSize:9,fontWeight:800,color:c,border:`1px solid ${c}44`,padding:"1px 6px",borderRadius:2}}>{p.risk_tier}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// -- Unit Detail Drill-Down -----------------------------------------------------
function UnitDrillDown({ unit, patients, onBack, onSelectPatient }) {
  const unitPatients = patients.filter(p => p.unit === unit.name);
  const cohesionColor = unit.cohesion >= 70 ? "#10D8F0" : unit.cohesion >= 50 ? "#f0c040" : "#D4159A";
  const critical = unitPatients.filter(p=>p.risk_tier==="CRITICAL").length;
  const high = unitPatients.filter(p=>p.risk_tier==="HIGH").length;
  const avgScore = unitPatients.length ? Math.round(unitPatients.reduce((a,p)=>a+p.risk_score,0)/unitPatients.length) : 0;

  return (
    <div>
      {/* Back button */}
      <button onClick={onBack} style={{background:"none",border:"1px solid #2a2a3e",color:"#888",padding:"6px 16px",borderRadius:2,cursor:"pointer",fontSize:12,fontWeight:700,marginBottom:16,display:"flex",alignItems:"center",gap:8}}>
        ? All Units
      </button>

      {/* Unit title banner */}
      <div style={{backgroundColor:unit.color+"15",border:`1px solid ${unit.color}44`,borderRadius:6,padding:"16px 24px",marginBottom:20,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:16}}>
        <div>
          <div style={{fontSize:22,fontWeight:900,color:unit.color,letterSpacing:2}}>{unit.name.toUpperCase()}</div>
          <div style={{fontSize:12,color:"#555",marginTop:2}}>
            {unitPatients.length} / {unit.capacity} beds occupied
            {unit.location && <span style={{marginLeft:8,color:"#444"}}>{unit.location}</span>}
          </div>
        </div>
        <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
          <DonutChart patients={unitPatients} size={80}/>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <div style={{display:"flex",gap:16}}>
              {[["CRITICAL",critical,"#D4159A"],["HIGH RISK",high,"#ff6b35"],["AVG SCORE",avgScore,"#f0c040"]].map(([l,v,c])=>(
                <div key={l} style={{textAlign:"center"}}>
                  <div style={{fontSize:9,color:"#444",letterSpacing:1}}>{l}</div>
                  <div style={{fontSize:22,fontWeight:900,color:c}}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{backgroundColor:"#07070F",border:`1px solid ${cohesionColor}33`,borderRadius:4,padding:"10px 16px",textAlign:"center",minWidth:90}}>
            <div style={{fontSize:9,color:"#444",letterSpacing:2,marginBottom:4}}>COHESION</div>
            <div style={{fontSize:28,fontWeight:900,color:cohesionColor,lineHeight:1}}>{unit.cohesion}</div>
            <div style={{fontSize:10,color:unit.cohesionTrend>0?"#10D8F0":unit.cohesionTrend<0?"#D4159A":"#555",marginTop:4}}>
              {unit.cohesionTrend>0?`? +${unit.cohesionTrend}`:unit.cohesionTrend<0?`? ${unit.cohesionTrend}`:"? Stable"}
            </div>
          </div>
        </div>
      </div>

      {/* Patient table for this unit */}
      <div style={{marginBottom:20}}>
        <div style={{fontSize:10,letterSpacing:2,color:"#444",marginBottom:10}}>PATIENT ROSTER</div>
        <div style={{overflowX:"auto"}}>
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
                const c = TIER_COLOR[p.risk_tier]||"#555";
                return (
                  <tr key={p.id} onClick={()=>onSelectPatient(p)} style={{borderBottom:"1px solid #0d0d1a",cursor:"pointer"}}
                    onMouseEnter={e=>e.currentTarget.style.backgroundColor="#0d0d1a"}
                    onMouseLeave={e=>e.currentTarget.style.backgroundColor="transparent"}>
                    <td style={{padding:"10px 12px",fontWeight:700,color:"#fff"}}>{p.name}</td>
                    <td style={{padding:"10px 12px",color:"#555"}}>{p.room_number||"—"}</td>
                    <td style={{padding:"10px 12px",color:"#888"}}>{p.length_of_stay}</td>
                    <td style={{padding:"10px 12px",color:"#666",fontSize:11}}>{SUBSTANCE_MAP[p.substance_encoded]||"—"}</td>
                    <td style={{padding:"10px 12px"}}><span style={{fontSize:22,fontWeight:900,color:c}}>{p.risk_score}</span></td>
                    <td style={{padding:"10px 12px"}}><TierBadge tier={p.risk_tier}/></td>
                    <td style={{padding:"10px 12px"}}><VelocityChip v={p.velocity}/></td>
                    <td style={{padding:"10px 12px"}}>
                      <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                        {p.alert_active&&<span style={{backgroundColor:"#D4159A22",color:"#D4159A",fontSize:10,padding:"2px 6px",borderRadius:2,fontWeight:700}}>ALERT</span>}
                        {p.cliff_window&&<span style={{backgroundColor:"#f0c04022",color:"#f0c040",fontSize:10,padding:"2px 6px",borderRadius:2}}>CLIFF</span>}
                        {p.calm_before_storm_flag&&<span style={{backgroundColor:"#8844E822",color:"#8844E8",fontSize:10,padding:"2px 6px",borderRadius:2}}>CBS</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floor map for this unit only */}
      <div style={{fontSize:10,letterSpacing:2,color:"#444",marginBottom:10}}>FLOOR LAYOUT</div>
      {unit.rooms.length === 0 ? (
        <div style={{display:"grid",gap:10,marginBottom:20}}>
          <div style={{backgroundColor:"#071a24",border:"1px solid #10D8F033",borderRadius:4,padding:"12px 14px",fontSize:12,color:"#9befff",lineHeight:1.6}}>
            IOP patients do not have room placement. CensusGuard tracks them by evening check-in status, next scheduled session, medication continuity, and missed-contact escalation.
          </div>
          {unitPatients.map((patient) => {
            const c = TIER_COLOR[patient.risk_tier] || "#555";
            return (
              <button key={patient.id} type="button" onClick={()=>onSelectPatient(patient)} style={{textAlign:"left",backgroundColor:"#0a0a18",border:`1px solid ${c}44`,borderLeft:`3px solid ${c}`,borderRadius:4,padding:"12px 14px",cursor:"pointer"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                  <div>
                    <div style={{fontSize:14,fontWeight:900,color:"#fff"}}>{patient.name}</div>
                    <div style={{fontSize:11,color:"#777",marginTop:3}}>Next IOP touch: tomorrow AM - Last check-in: {patient.last_staff_checkin ? new Date(patient.last_staff_checkin).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) : "pending"}</div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <VelocityChip v={patient.velocity} />
                    <span style={{fontSize:24,fontWeight:950,color:c}}>{patient.risk_score}</span>
                    <TierBadge tier={patient.risk_tier} />
                  </div>
                </div>
                <div style={{fontSize:12,color:"#888",lineHeight:1.5,marginTop:8}}>{getGuidedIntervention(patient)}</div>
              </button>
            );
          })}
        </div>
      ) : (
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:10,marginBottom:20}}>
        {unit.rooms.map(room => {
          const roomPatients = unitPatients.filter(p => p.room_number === room);
          const isEmpty = roomPatients.length === 0;
          const topTier = roomPatients.reduce((worst, p) => {
            const order = {CRITICAL:0,HIGH:1,MODERATE:2,LOW:3};
            return (order[p.risk_tier] < order[worst]) ? p.risk_tier : worst;
          }, "LOW");
          const bc = isEmpty ? "#1a1a2e" : TIER_COLOR[topTier];
          const hasAlert = roomPatients.some(p => p.alert_active);
          const hasPeerRisk = roomPatients.some(p => p.known_peers && roomPatients.some(r => r.name === p.known_peers));
          const hasSmokers = roomPatients.filter(p=>p.smoker).length > 1;
          const highestRiskPatient = [...roomPatients].sort((a,b)=>(b.risk_score||0)-(a.risk_score||0))[0];
          return (
            <div key={room} onClick={()=>highestRiskPatient && onSelectPatient(highestRiskPatient)} style={{backgroundColor: isEmpty?"#0d0d1a":bc+"11",border:`1px solid ${bc}`,borderRadius:4,padding:"12px 14px",minHeight:80,opacity:isEmpty?0.4:1,cursor:isEmpty?"default":"pointer"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <span style={{fontSize:11,color:"#555",fontWeight:700,letterSpacing:1}}>ROOM {room}</span>
                <div style={{display:"flex",gap:4}}>
                  {hasAlert&&<span style={{fontSize:11}}>Alert</span>}
                  {hasPeerRisk&&<span style={{fontSize:11}}>Peer</span>}
                  {hasSmokers&&<span style={{fontSize:11}}>Smoke</span>}
                </div>
              </div>
              {isEmpty ? <div style={{fontSize:11,color:"#333",fontStyle:"italic"}}>Available</div> :
                roomPatients.map(p=>{
                  const c = TIER_COLOR[p.risk_tier];
                  return (
                    <div key={p.id} onClick={(event)=>{event.stopPropagation();onSelectPatient(p);}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
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
      )}

      {/* Unit-specific cohesion alerts */}
      {unit.name === "Detox" && (
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          <div style={{backgroundColor:"#1a0800",border:"1px solid #ff6b3555",borderLeft:"3px solid #ff6b35",borderRadius:3,padding:"10px 14px",fontSize:11}}>
            <span style={{color:"#ff6b35",fontWeight:800}}>? ROOM 101 — HIGH-RISK PEER PROXIMITY </span>
            <span style={{color:"#888"}}>Two high-risk records share a known context. Monitor daily.</span>
          </div>
          <div style={{backgroundColor:"#1a1000",border:"1px solid #f0c04055",borderLeft:"3px solid #f0c040",borderRadius:3,padding:"10px 14px",fontSize:11}}>
            <span style={{color:"#f0c040",fontWeight:800}}>SMOKER CLUSTER </span>
            <span style={{color:"#888"}}>Multiple high-risk records share an environmental risk factor. Consider staggered schedules.</span>
          </div>
        </div>
      )}
    </div>
  );
}

// -- Census Floor Map -----------------------------------------------------------
function CensusFloorMap({ patients, onSelectPatient }) {
  const [drillUnit, setDrillUnit] = useState(null);
  const units = [
    { name:"Detox", rooms:["101","102","103","104"], capacity:8, cohesion:58, cohesionTrend:-4, color:"#D4159A", location:"Building A" },
    { name:"Residential", rooms:["205","206","207","208","209","210"], capacity:12, cohesion:72, cohesionTrend:3, color:"#ff6b35", location:"Building B" },
    { name:"PHP", rooms:["310","311","312","313"], capacity:8, cohesion:81, cohesionTrend:6, color:"#8844E8", location:"Building C" },
    { name:"IOP", rooms:[], capacity:20, cohesion:76, cohesionTrend:4, color:"#10D8F0", location:"Step-down / home nights" },
  ];

  if (drillUnit) {
    return <UnitDrillDown unit={drillUnit} patients={patients} onBack={()=>setDrillUnit(null)} onSelectPatient={onSelectPatient}/>;
  }

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      {units.map(unit => {
        const unitPatients = patients.filter(p => p.unit === unit.name);
        const cohesionColor = unit.cohesion >= 70 ? "#10D8F0" : unit.cohesion >= 50 ? "#f0c040" : "#D4159A";

        return (
          <div key={unit.name} style={{backgroundColor:"#0a0a18",border:`1px solid ${unit.color}33`,borderRadius:6,overflow:"hidden"}}>
            {/* Unit Header */}
            <div onClick={()=>setDrillUnit(unit)} style={{backgroundColor:unit.color+"15",borderBottom:`1px solid ${unit.color}33`,padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12,cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.backgroundColor=unit.color+"25"} onMouseLeave={e=>e.currentTarget.style.backgroundColor=unit.color+"15"}>
              <div style={{display:"flex",alignItems:"center",gap:16}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{fontSize:14,fontWeight:900,color:unit.color,letterSpacing:1}}>{unit.name.toUpperCase()}</div>
                    <span style={{fontSize:10,color:unit.color,opacity:0.7,border:`1px solid ${unit.color}44`,padding:"2px 8px",borderRadius:2,letterSpacing:1}}>VIEW UNIT ?</span>
                  </div>
                  <div style={{fontSize:11,color:"#555"}}>{unitPatients.length} / {unit.capacity} beds occupied · {unit.location}</div>
                </div>
                {/* Donut */}
                <DonutChart patients={unitPatients} size={72}/>
                {/* Tier legend */}
                <div style={{display:"flex",flexDirection:"column",gap:3}}>
                  {["CRITICAL","HIGH","MODERATE","LOW"].map(t => {
                    const n = unitPatients.filter(p=>p.risk_tier===t).length;
                    if (!n) return null;
                    return <div key={t} style={{display:"flex",alignItems:"center",gap:5,fontSize:10}}>
                      <span style={{width:8,height:8,borderRadius:"50%",backgroundColor:TIER_COLOR[t],display:"inline-block",flexShrink:0}}/>
                      <span style={{color:TIER_COLOR[t],fontWeight:700}}>{n}</span>
                      <span style={{color:"#444"}}>{t}</span>
                    </div>;
                  })}
                </div>
              </div>
              {/* Cohesion Score */}
              <div style={{backgroundColor:"#07070F",border:`1px solid ${cohesionColor}33`,borderRadius:4,padding:"10px 16px",textAlign:"center",minWidth:100}}>
                <div style={{fontSize:9,color:"#444",letterSpacing:2,marginBottom:4}}>GROUP COHESION</div>
                <div style={{fontSize:28,fontWeight:900,color:cohesionColor,lineHeight:1}}>{unit.cohesion}</div>
                <div style={{fontSize:10,color:unit.cohesionTrend>0?"#10D8F0":unit.cohesionTrend<0?"#D4159A":"#555",marginTop:4}}>
                  {unit.cohesionTrend>0?`? +${unit.cohesionTrend}`:unit.cohesionTrend<0?`? ${unit.cohesionTrend}`:"? Stable"}
                </div>
                <div style={{marginTop:6,backgroundColor:"#1a1a2e",borderRadius:2,height:3}}>
                  <div style={{backgroundColor:cohesionColor,height:3,borderRadius:2,width:`${unit.cohesion}%`}}/>
                </div>
              </div>
            </div>

            {/* Room Grid */}
            <div style={{padding:16}}>
              <div style={{fontSize:9,color:"#444",letterSpacing:2,marginBottom:10}}>FLOOR LAYOUT</div>
              {unit.rooms.length === 0 && (
                <div style={{display:"grid",gap:8}}>
                  {unitPatients.map((patient) => {
                    const c = TIER_COLOR[patient.risk_tier] || "#555";
                    return (
                      <button key={patient.id} type="button" onClick={()=>onSelectPatient(patient)} style={{textAlign:"left",backgroundColor:"#05050c",border:`1px solid ${c}44`,borderLeft:`3px solid ${c}`,borderRadius:4,padding:"10px 12px",cursor:"pointer"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                          <div>
                            <div style={{fontSize:13,fontWeight:900,color:"#fff"}}>{patient.name}</div>
                            <div style={{fontSize:10,color:"#777",marginTop:3}}>IOP / home-night risk - next touch tomorrow AM</div>
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <VelocityChip v={patient.velocity} />
                            <span style={{fontSize:22,fontWeight:950,color:c}}>{patient.risk_score}</span>
                            <TierBadge tier={patient.risk_tier} />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              {unit.rooms.length > 0 && (
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:8}}>
                {unit.rooms.map(room => {
                  const roomPatients = unitPatients.filter(p => p.room_number === room);
                  const isEmpty = roomPatients.length === 0;
                  const topTier = roomPatients.reduce((worst, p) => {
                    const order = {CRITICAL:0,HIGH:1,MODERATE:2,LOW:3};
                    return (order[p.risk_tier] < order[worst]) ? p.risk_tier : worst;
                  }, "LOW");
                  const bc = isEmpty ? "#1a1a2e" : TIER_COLOR[topTier];
                  const hasAlert = roomPatients.some(p => p.alert_active);
                  const hasPeerRisk = roomPatients.some(p => p.known_peers && roomPatients.some(r => r.name === p.known_peers));
                  const hasSmokers = roomPatients.filter(p=>p.smoker).length > 1;
                  const highestRiskPatient = [...roomPatients].sort((a,b)=>(b.risk_score||0)-(a.risk_score||0))[0];

                  return (
                    <div key={room} onClick={()=>highestRiskPatient && onSelectPatient(highestRiskPatient)} style={{
                      backgroundColor: isEmpty ? "#0d0d1a" : bc+"11",
                      border: `1px solid ${bc}`,
                      borderRadius:4, padding:"10px 12px", cursor: isEmpty ? "default" : "pointer",
                      position:"relative", minHeight:70,
                      opacity: isEmpty ? 0.4 : 1,
                    }}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                        <span style={{fontSize:10,color:"#555",fontWeight:700,letterSpacing:1}}>ROOM {room}</span>
                        <div style={{display:"flex",gap:4}}>
                          {hasAlert && <span title="Active alert" style={{fontSize:10}}>Alert</span>}
                          {hasPeerRisk && <span title="Known peer relationship" style={{fontSize:10}}>Peer</span>}
                          {hasSmokers && <span title="Smoker cluster" style={{fontSize:10}}>Smoke</span>}
                        </div>
                      </div>
                      {isEmpty ? (
                        <div style={{fontSize:11,color:"#333",fontStyle:"italic"}}>Available</div>
                      ) : (
                        roomPatients.map(p => {
                          const c = TIER_COLOR[p.risk_tier];
                          return (
                            <div key={p.id} onClick={(event) => { event.stopPropagation(); onSelectPatient(p); }}
                              style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4,cursor:"pointer"}}>
                              <div>
                                <div style={{fontSize:12,fontWeight:700,color:"#fff"}}>{p.name}</div>
                                <div style={{fontSize:10,color:"#555"}}>Day {p.length_of_stay}</div>
                              </div>
                              <div style={{textAlign:"right"}}>
                                <div style={{fontSize:18,fontWeight:900,color:c}}>{p.risk_score}</div>
                                <div style={{fontSize:8,color:c,fontWeight:800,letterSpacing:1}}>{p.risk_tier}</div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  );
                })}
              </div>
              )}
            </div>

            {/* Cohesion Alerts for this unit */}
            {unit.name === "Detox" && (
              <div style={{borderTop:"1px solid #1a1a2e",padding:"10px 16px",display:"flex",flexDirection:"column",gap:6}}>
                <div style={{backgroundColor:"#1a0800",border:"1px solid #ff6b3555",borderLeft:"3px solid #ff6b35",borderRadius:3,padding:"8px 12px",fontSize:11}}>
                  <span style={{color:"#ff6b35",fontWeight:800}}>? ROOM 101 — HIGH-RISK PEER PROXIMITY </span>
                  <span style={{color:"#888"}}>Two high-risk records share a known context. Monitor daily.</span>
                </div>
                <div style={{backgroundColor:"#1a1000",border:"1px solid #f0c04055",borderLeft:"3px solid #f0c040",borderRadius:3,padding:"8px 12px",fontSize:11}}>
                  <span style={{color:"#f0c040",fontWeight:800}}>SMOKER CLUSTER </span>
                  <span style={{color:"#888"}}>Multiple high-risk records share an environmental risk factor. Consider staggered schedules.</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}


// -- Search Bar -----------------------------------------------------------------
function SearchBar({ patients, onSelect }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const results = query.length > 1 ? patients.filter(p => p.name.toLowerCase().includes(query.toLowerCase())) : [];
  return (
    <div style={{position:"relative",width:240}}>
      <div style={{display:"flex",alignItems:"center",backgroundColor:"#0d0d1a",border:"1px solid #2a2a3e",borderRadius:3,padding:"6px 12px",gap:8}}>
        <span style={{color:"#444",fontSize:14}}>Signal</span>
        <input value={query} onChange={e=>{setQuery(e.target.value);setOpen(true);}} onFocus={()=>setOpen(true)} onBlur={()=>setTimeout(()=>setOpen(false),200)} placeholder="Search patient..." style={{background:"none",border:"none",outline:"none",color:"#fff",fontSize:12,width:"100%"}}/>
        {query && <span onClick={()=>{setQuery("");setOpen(false);}} style={{color:"#444",cursor:"pointer",fontSize:16}}>×</span>}
      </div>
      {open && results.length>0 && (
        <div style={{position:"absolute",top:"100%",left:0,right:0,backgroundColor:"#0d0d1a",border:"1px solid #2a2a3e",borderRadius:3,zIndex:100,marginTop:2,overflow:"hidden"}}>
          {results.map(p=>{
            const c=TIER_COLOR[p.risk_tier]||"#555";
            return (
              <div key={p.id} onClick={()=>{onSelect(p);setQuery("");setOpen(false);}} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",cursor:"pointer",borderBottom:"1px solid #111"}} onMouseEnter={e=>e.currentTarget.style.background="#1a1a2e"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div>
                  <div style={{fontWeight:700,color:"#fff",fontSize:12}}>{p.name}</div>
                  <div style={{fontSize:10,color:"#555"}}>Day {p.length_of_stay} · {p.unit} · Room {p.room_number||"—"}</div>
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3}}>
                  <span style={{fontSize:18,fontWeight:900,color:c}}>{p.risk_score}</span>
                  <span style={{backgroundColor:c+"22",color:c,border:`1px solid ${c}44`,fontSize:9,fontWeight:800,padding:"1px 6px",borderRadius:2}}>{p.risk_tier}</span>
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

// -- TierBadge ------------------------------------------------------------------
function TierBadge({ tier }) {
  const c = TIER_COLOR[tier]||"#555";
  return <span style={{background:c+"22",color:c,border:`1px solid ${c}44`,fontSize:10,fontWeight:800,padding:"2px 8px",borderRadius:2,letterSpacing:1,whiteSpace:"nowrap"}}>{tier}</span>;
}

function VelocityChip({ v }) {
  if (!v && v!==0) return <span style={{color:"#444"}}>—</span>;
  const up = v>0;
  return <span style={{color:up?"#D4159A":"#10D8F0",fontWeight:700,fontSize:12}}>{up?"?":"?"} {Math.abs(v).toFixed(1)}/d</span>;
}

function MiniSparkline({ up }) {
  const pts = up ? "0,28 10,24 20,26 30,20 40,18 50,12 60,8" : "0,8 10,12 20,10 30,14 40,18 50,20 60,22";
  return <svg width={62} height={32} viewBox="0 0 62 32"><polyline points={pts} fill="none" stroke={up?"#D4159A":"#10D8F0"} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/><circle cx={60} cy={up?8:22} r={3} fill={up?"#D4159A":"#10D8F0"}/></svg>;
}

const ROLE_COLORS = {
  BHT: { color: "#10D8F0", bg: "#001c22", label: "BHT/TECH" },
  Nursing: { color: "#8844E8", bg: "#1a0030", label: "NURSING" },
  Therapist: { color: "#f0c040", bg: "#252000", label: "THERAPIST" },
  Physician: { color: "#10D8F0", bg: "#001c22", label: "PHYSICIAN" },
};

function buildMedicationRecords(patient) {
  if (!patient) return [];
  const substance = SUBSTANCE_MAP[patient.substance_encoded] || "";
  const baseTime = patient.last_staff_checkin || new Date().toISOString();
  const isOpioid = /opioid|heroin|methadone/i.test(substance);
  const needsReview = patient.medication_review_needed || patient.moud_status === "consult_pending" || patient.risk_tier === "CRITICAL";
  const meds = [
    { name:"Clonidine", route:"PO", dose:"0.1mg", frequency:"TID PRN", startDay:1, prescriber:"Medical provider", lastAdministered:baseTime, adherence:"full", note:"For withdrawal symptom management. Given with vitals check." },
    { name:"Hydroxyzine", route:"PO", dose:"50mg", frequency:"QHS PRN", startDay:1, prescriber:"Medical provider", lastAdministered:baseTime, adherence:"full", note:"For sleep/anxiety support. Monitor sedation and response." },
  ];
  if (isOpioid || patient.moud_status) {
    meds.unshift({
      name: patient.moud_status === "on_mat" ? "Buprenorphine/Naloxone" : "MOUD consult",
      route: patient.moud_status === "on_mat" ? "SL" : "CONSULT",
      dose: patient.moud_status === "on_mat" ? "8mg/2mg" : "Pending order",
      frequency: patient.moud_status === "on_mat" ? "QD" : "Same-shift review",
      startDay: Math.max(1, (patient.length_of_stay || 1) - 2),
      prescriber: "Dr. Nixi / MAT provider",
      lastAdministered: baseTime,
      adherence: needsReview ? "partial" : "full",
      note: needsReview
        ? "Medication continuity requires provider review before next handoff."
        : "MOUD continuity documented; continue adherence monitoring.",
    });
  }
  if (patient.pain_level_score >= 7 || needsReview) {
    meds.push({
      name:"Pain / withdrawal protocol",
      route:"Nursing",
      dose:"Per protocol",
      frequency:"Reassess q4h",
      startDay:patient.length_of_stay || 1,
      prescriber:"Nursing + medical provider",
      lastAdministered:baseTime,
      adherence:needsReview ? "partial" : "full",
      note:"Pain, COWS/CIWA, and medication response should be tied to the intervention loop.",
    });
  }
  return meds;
}

function buildNursingNotes(patient) {
  if (!patient) return [];
  const base = new Date(patient.last_staff_checkin || Date.now());
  const score = patient.risk_score || 0;
  const pain = patient.pain_level_score || (score >= 85 ? 8 : score >= 65 ? 6 : 3);
  const withdrawal = /opioid|heroin|methadone|alcohol|benzodiazepine/i.test(SUBSTANCE_MAP[patient.substance_encoded] || "");
  const cows = withdrawal ? Math.min(16, Math.max(4, Math.round(score / 8))) : undefined;
  const ciwa = /alcohol|benzodiazepine/i.test(SUBSTANCE_MAP[patient.substance_encoded] || "") ? Math.min(18, Math.max(5, Math.round(score / 7))) : undefined;
  return [
    {
      shift:"Day",
      nurse:"RN Martinez",
      timestamp:base.toISOString(),
      bp: score >= 85 ? "145/95" : score >= 65 ? "138/88" : "122/78",
      hr: score >= 85 ? 106 : score >= 65 ? 94 : 78,
      rr: score >= 85 ? 22 : 18,
      temp:"99.3F",
      spo2:"96%",
      cows_score:cows,
      ciwa_score:ciwa,
      pain_score:pain,
      note: patient.alert_active
        ? `${patient.name} remains elevated. ${patient.alert_reason || "Risk signal active."} Nursing notified provider and linked vitals to staff handoff.`
        : `${patient.name} stable during shift. Continue routine vitals and watch for engagement or medication changes.`,
    },
    {
      shift:"Eve",
      nurse:"RN Okafor",
      timestamp:new Date(base.getTime() - 12 * 60 * 60 * 1000).toISOString(),
      bp: score >= 85 ? "140/90" : "128/82",
      hr: score >= 85 ? 98 : 84,
      rr:18,
      temp:"98.7F",
      spo2:"97%",
      cows_score:cows ? Math.max(2, cows - 3) : undefined,
      ciwa_score:ciwa ? Math.max(2, ciwa - 3) : undefined,
      pain_score:Math.max(1, pain - 1),
      note:"Evening check-in completed. Patient response and medication tolerance documented for the next shift.",
    },
  ];
}

function buildStaffLoopNotes(patient) {
  if (!patient) return [];
  const base = patient.last_staff_checkin || new Date().toISOString();
  const critical = patient.risk_tier === "CRITICAL";
  const high = patient.risk_tier === "HIGH";
  return [
    {
      role:"BHT",
      staff:"BHT Lewis",
      timestamp:base,
      note: patient.alert_reason || "Staff check-in captured a change in patient state.",
      tags:(patient.top_drivers || "engagement shift").split("|"),
      reliability: critical ? 0.95 : high ? 0.88 : 0.82,
      ripple: critical ? 5 : high ? 3 : 1.5,
    },
    {
      role:"Nursing",
      staff:"RN Thompson",
      timestamp:new Date(new Date(base).getTime() - 2 * 60 * 60 * 1000).toISOString(),
      note: patient.medication_review_needed ? "Medication review needed. Provider handoff flagged." : "Vitals and medication response reviewed.",
      tags: patient.medication_review_needed ? ["Medication continuity", "Provider handoff"] : ["Vitals", "MAR review"],
      reliability:0.9,
      ripple: patient.medication_review_needed ? 4 : 1,
    },
    {
      role:"BHT",
      staff:"BHT Ortiz",
      timestamp:new Date(new Date(base).getTime() - 24 * 60 * 60 * 1000).toISOString(),
      note:"Patient stable. No concerns.",
      tags:[],
      reliability:0.5,
      ripple:0,
      pencilWhip:true,
    },
  ];
}

function getPatientHistory(patient) {
  if (!patient) return [];
  const existing = FALLBACK_HISTORY[patient.id] || [];
  if (existing.length) return existing;
  const current = patient.risk_score || 0;
  const previous = patient.previous_risk_score || Math.max(8, current - Math.round((patient.velocity || 1) * 3));
  const admission = Math.max(5, previous - 12);
  const day = patient.length_of_stay || 1;
  return [
    { day:1, score:admission, previous_score:null, risk_tier:admission >= 75 ? "HIGH" : admission >= 50 ? "MODERATE" : "LOW", timestamp:new Date(Date.now() - day * 86400000).toISOString(), trigger:"Admission intake", drivers:patient.top_drivers || "", alert_fired:false },
    { day:Math.max(2, day - 2), score:previous, previous_score:admission, risk_tier:previous >= 85 ? "CRITICAL" : previous >= 65 ? "HIGH" : "MODERATE", timestamp:new Date(Date.now() - 2 * 86400000).toISOString(), trigger:"Staff check-in", drivers:patient.top_drivers || "", alert_fired:previous >= 75 },
    { day, score:current, previous_score:previous, risk_tier:patient.risk_tier, timestamp:patient.last_staff_checkin || new Date().toISOString(), trigger:"Staff check-in", drivers:patient.top_drivers || "", alert_fired:Boolean(patient.alert_active) },
  ];
}

function MedicationPanel({ patient }) {
  const meds = buildMedicationRecords(patient);
  const routeColors = { SL:"#10D8F0", PO:"#f0c040", ODT:"#8844E8", IM:"#D4159A", CONSULT:"#D4159A", Nursing:"#8844E8" };
  const adherenceColors = { full:"#10D8F0", partial:"#f0c040", missed:"#D4159A", none:"#555" };
  const adherenceLabels = { full:"Consistent", partial:"Partial", missed:"Missed", none:"Not Started" };
  const flagged = meds.filter((med) => med.adherence !== "full");
  const lastMar = meds[0];
  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:6,marginBottom:12}}>
        {[["ACTIVE ORDERS", meds.length, "#10D8F0"],["LAST MAR ENTRY", lastMar ? new Date(lastMar.lastAdministered).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) : "—", "#fff"],["ADHERENCE FLAGS", flagged.length, flagged.length ? "#f0c040" : "#10D8F0"]].map(([label,value,color]) => (
          <div key={label} style={{backgroundColor:"#0a0a18",border:`1px solid ${color}33`,borderRadius:4,padding:"10px 12px",textAlign:"center"}}>
            <div style={{fontSize:9,color:"#444",letterSpacing:1,marginBottom:4}}>{label}</div>
            <div style={{fontSize:20,fontWeight:900,color}}>{value}</div>
          </div>
        ))}
      </div>
      {flagged.length > 0 && (
        <div style={{backgroundColor:"#1a1400",border:"1px solid #f0c04033",borderLeft:"3px solid #f0c040",borderRadius:4,padding:"10px 14px",marginBottom:12}}>
          <div style={{fontSize:10,letterSpacing:2,color:"#f0c040",fontWeight:900,marginBottom:6}}>ADHERENCE FLAGS DETECTED</div>
          {flagged.map((med) => <div key={med.name} style={{fontSize:12,color:"#ddd",lineHeight:1.5}}><span style={{color:"#f0c040",fontWeight:800}}>{med.name}</span> - {med.note}</div>)}
        </div>
      )}
      <div style={{fontSize:10,letterSpacing:2,color:"#444",marginBottom:10}}>MEDICATION ADMINISTRATION RECORD (MAR)</div>
      <div style={{display:"grid",gap:8}}>
        {meds.map((med) => {
          const routeColor = routeColors[med.route] || "#555";
          const adherenceColor = adherenceColors[med.adherence] || "#555";
          return (
            <div key={med.name} style={{backgroundColor:"#0a0a18",border:"1px solid #1a1a2e",borderRadius:4,overflow:"hidden"}}>
              <div style={{padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,flexWrap:"wrap"}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                    <span style={{color:"#fff",fontWeight:900,fontSize:14}}>{med.name}</span>
                    <span style={{backgroundColor:routeColor+"22",color:routeColor,fontSize:9,fontWeight:900,padding:"1px 6px",borderRadius:2}}>{med.route}</span>
                  </div>
                  <div style={{fontSize:11,color:"#888"}}>{med.dose} - {med.frequency} - Started Day {med.startDay}</div>
                  <div style={{fontSize:11,color:"#555",marginTop:2}}>{med.prescriber}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:10,letterSpacing:1,color:"#444",marginBottom:3}}>LAST ADMINISTERED</div>
                  <div style={{fontSize:12,fontWeight:800,color:"#ccc"}}>{new Date(med.lastAdministered).toLocaleString()}</div>
                  <span style={{display:"inline-flex",marginTop:5,backgroundColor:adherenceColor+"22",border:`1px solid ${adherenceColor}33`,color:adherenceColor,fontSize:9,fontWeight:900,padding:"2px 8px",borderRadius:2}}>{adherenceLabels[med.adherence]}</span>
                </div>
              </div>
              <div style={{backgroundColor:"#060612",borderTop:"1px solid #111",padding:"8px 14px",fontSize:11,color:"#777",lineHeight:1.5}}>{med.note}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NursingPanel({ patient }) {
  const notes = buildNursingNotes(patient);
  const latest = notes[0];
  const avgPain = Math.round(notes.reduce((sum, note) => sum + (note.pain_score || 0), 0) / Math.max(1, notes.length));
  const withdrawalScore = latest?.cows_score ?? latest?.ciwa_score ?? 0;
  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:6,marginBottom:12}}>
        {[["LATEST BP", latest?.bp || "—", "#fff"],["AVG PAIN", `${avgPain}/10`, avgPain >= 7 ? "#D4159A" : "#f0c040"],["SHIFT NOTES", notes.length, "#8844E8"]].map(([label,value,color]) => (
          <div key={label} style={{backgroundColor:"#0a0a18",border:"1px solid #1a1a2e",borderRadius:4,padding:"10px 12px",textAlign:"center"}}>
            <div style={{fontSize:9,color:"#444",letterSpacing:1,marginBottom:4}}>{label}</div>
            <div style={{fontSize:20,fontWeight:900,color}}>{value}</div>
          </div>
        ))}
      </div>
      <div style={{backgroundColor:"#0a0a18",border:"1px solid #1a1a2e",borderRadius:4,padding:"12px 14px",marginBottom:12}}>
        <div style={{fontSize:10,letterSpacing:2,color:"#444",marginBottom:8}}>LATEST VITALS - {latest.shift} SHIFT - RN {latest.nurse}</div>
        <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
          {[["BP",latest.bp,"#fff"],["HR",`${latest.hr} bpm`,latest.hr>100?"#D4159A":"#10D8F0"],["RR",`${latest.rr}/min`,"#f0c040"],["Temp",latest.temp,"#fff"],["SpO2",latest.spo2,"#10D8F0"],[latest.cows_score ? "COWS" : "CIWA",withdrawalScore || "—",withdrawalScore>=12?"#D4159A":withdrawalScore>=8?"#f0c040":"#10D8F0"],["Pain",`${latest.pain_score}/10`,latest.pain_score>=7?"#D4159A":"#f0c040"]].map(([label,value,color]) => (
            <div key={label} style={{textAlign:"center",minWidth:54,flex:1}}>
              <div style={{fontSize:8,color:"#444",letterSpacing:1,marginBottom:2}}>{label}</div>
              <div style={{fontSize:15,fontWeight:900,color}}>{value}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{fontSize:10,letterSpacing:2,color:"#444",marginBottom:10}}>NURSING SHIFT NOTES</div>
      <div style={{position:"relative"}}>
        <div style={{position:"absolute",left:14,top:0,bottom:0,width:2,backgroundColor:"#1a1a2e"}} />
        {notes.map((note) => {
          const shiftColor = note.shift === "Day" ? "#10D8F0" : note.shift === "Eve" ? "#8844E8" : "#D4159A";
          const elevated = (note.cows_score || note.ciwa_score || 0) >= 12 || note.pain_score >= 7;
          return (
            <div key={`${note.shift}-${note.timestamp}`} style={{position:"relative",paddingLeft:38,paddingBottom:14}}>
              <div style={{position:"absolute",left:6,top:4,width:18,height:18,borderRadius:"50%",backgroundColor:elevated?"#D4159A":shiftColor,border:`2px solid ${shiftColor}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:"#fff",fontWeight:900}}>{note.shift[0]}</div>
              <div style={{backgroundColor:"#0a0a18",border:`1px solid ${elevated ? "#D4159A33" : "#1a1a2e"}`,borderRadius:4,padding:"10px 14px"}}>
                <div style={{display:"flex",justifyContent:"space-between",gap:8,flexWrap:"wrap",marginBottom:7}}>
                  <div><span style={{fontSize:12,color:shiftColor,fontWeight:900}}>{note.shift} SHIFT</span> <span style={{fontSize:10,color:"#555"}}>RN {note.nurse}</span></div>
                  <div style={{fontSize:10,color:"#444"}}>{new Date(note.timestamp).toLocaleString()}</div>
                </div>
                <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:8,fontSize:10,color:"#555"}}>
                  <span>BP: <b style={{color:"#ccc"}}>{note.bp}</b></span>
                  <span>HR: <b style={{color:note.hr>100?"#D4159A":"#ccc"}}>{note.hr}</b></span>
                  <span>RR: <b style={{color:"#ccc"}}>{note.rr}</b></span>
                  {note.cows_score != null && <span>COWS: <b style={{color:note.cows_score>=12?"#D4159A":"#f0c040"}}>{note.cows_score}</b></span>}
                  {note.ciwa_score != null && <span>CIWA: <b style={{color:note.ciwa_score>=12?"#D4159A":"#f0c040"}}>{note.ciwa_score}</b></span>}
                  <span>Pain: <b style={{color:note.pain_score>=7?"#D4159A":"#f0c040"}}>{note.pain_score}/10</b></span>
                </div>
                <div style={{fontSize:12,color:"#aaa",lineHeight:1.6}}>{note.note}</div>
                {elevated && <div style={{marginTop:6,fontSize:10,color:"#D4159A",fontWeight:900}}>Elevated clinical signal - provider notification recommended.</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StaffActionLoopPanel({ patient }) {
  const notes = buildStaffLoopNotes(patient);
  const [roleFilter, setRoleFilter] = useState("ALL");
  const visible = notes.filter((note) => roleFilter === "ALL" || note.role === roleFilter);
  const totalRipple = visible.reduce((sum, note) => sum + (note.ripple || 0), 0);
  const lowDetail = visible.filter((note) => note.pencilWhip).length;
  const highSignal = visible.filter((note) => !note.pencilWhip && note.reliability >= 0.85).length;
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:14}}>
        <div>
          <div style={{fontSize:10,letterSpacing:2,color:"#10D8F0",fontWeight:900}}>STAFF ACTION LOOP - INTERVENTION ACCOUNTABILITY</div>
          <div style={{fontSize:11,color:"#444",marginTop:3}}>Who was alerted, what they did, when they did it, and what signal changed.</div>
        </div>
        <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} style={{backgroundColor:"#0a0a18",border:"1px solid #2a2a3e",color:"#ccc",fontSize:11,padding:"7px 10px",borderRadius:3}}>
          {["ALL","BHT","Nursing","Therapist","Physician"].map((role) => <option key={role}>{role}</option>)}
        </select>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
        {[["SCORE CONTRIBUTION", totalRipple.toFixed(1), totalRipple >= 8 ? "#D4159A" : "#f0c040"],["HIGH-SIGNAL NOTES", highSignal, "#10D8F0"],["LOW-DETAIL NOTES", lowDetail, lowDetail ? "#f0c040" : "#444"]].map(([label,value,color]) => (
          <div key={label} style={{backgroundColor:"#0a0a18",border:"1px solid #1a1a2e",borderRadius:4,padding:"8px 14px",textAlign:"center"}}>
            <div style={{fontSize:9,color:"#444",letterSpacing:1,marginBottom:2}}>{label}</div>
            <div style={{fontSize:20,fontWeight:900,color}}>{value}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gap:10}}>
        {visible.map((note) => {
          const role = ROLE_COLORS[note.role] || ROLE_COLORS.BHT;
          const signalColor = note.pencilWhip ? "#f0c040" : note.reliability >= 0.85 ? "#10D8F0" : "#ff6b35";
          return (
            <div key={`${note.staff}-${note.timestamp}`} style={{backgroundColor:note.pencilWhip?"#0a0a0a":"#0a0a18",border:`1px solid ${note.pencilWhip ? "#D4159A33" : "#1a1a2e"}`,borderLeft:`3px solid ${note.pencilWhip ? "#D4159A" : role.color}`,borderRadius:4,padding:"12px 14px",opacity:note.pencilWhip ? .7 : 1}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,flexWrap:"wrap",marginBottom:8}}>
                <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                  <span style={{backgroundColor:role.bg,color:role.color,border:`1px solid ${role.color}44`,fontSize:10,fontWeight:900,padding:"2px 8px",borderRadius:2}}>{role.label}</span>
                  <span style={{fontSize:12,color:"#bbb",fontWeight:700}}>{note.staff}</span>
                  {note.pencilWhip && <span style={{backgroundColor:"#252000",color:"#f0c040",border:"1px solid #f0c04044",fontSize:9,fontWeight:900,padding:"2px 8px",borderRadius:2}}>LOW SIGNAL - NEEDS FOLLOW-UP</span>}
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:10,color:"#444"}}>{new Date(note.timestamp).toLocaleString()}</div>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",gap:6,marginTop:4}}>
                    <div style={{width:60,height:4,backgroundColor:"#1a1a2e",borderRadius:2,overflow:"hidden"}}><div style={{width:`${note.reliability * 100}%`,height:"100%",backgroundColor:signalColor}} /></div>
                    <span style={{fontSize:10,color:signalColor,fontWeight:900}}>{note.pencilWhip ? "LOW DETAIL" : "HIGH SIGNAL"}</span>
                  </div>
                </div>
              </div>
              <div style={{fontSize:12,color:note.pencilWhip?"#555":"#ddd",lineHeight:1.6,marginBottom:8,fontStyle:note.pencilWhip?"italic":"normal"}}>{note.note}</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{note.tags.map((tag) => <span key={tag} style={{backgroundColor:"#1a1a2e",color:"#888",fontSize:10,padding:"2px 7px",borderRadius:2}}>{tag}</span>)}</div>
                {note.ripple > 0 && <span style={{fontSize:11,color:note.ripple>=4?"#D4159A":"#f0c040",fontWeight:900}}>RISK RIPPLE: +{note.ripple}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ClosedLoopCommandCenter({ patients, activeAlerts, auditCoverage, currentStage = "Detect", onStageSelect }) {
  const highPriority = patients.filter(p => ["CRITICAL","HIGH"].includes(p.risk_tier)).length;
  const documented = activeAlerts.filter(p => p.last_staff_checkin || p.last_action_at || p.audit_status === "documented").length;
  const nextOwner = activeAlerts[0] ? getPatientOwner(activeAlerts[0]) : "No active owner";

  return (
    <div style={{backgroundColor:"#0a0a18",border:"1px solid #1a1a2e",borderRadius:6,padding:18,marginBottom:18}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:16,flexWrap:"wrap",marginBottom:16}}>
        <div>
          <div style={{fontSize:10,letterSpacing:2,color:"#10D8F0",fontWeight:900,marginBottom:6}}>CLINICAL COMMAND CENTER</div>
          <div style={{fontSize:20,fontWeight:900,color:"#fff"}}>Closed-loop intervention intelligence</div>
          <div style={{fontSize:12,color:"#777",lineHeight:1.55,marginTop:6,maxWidth:760}}>
            Every alert must move through the same chain: risk detected, staff owner assigned, intervention guided, action documented, outcome verified.
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(92px,1fr))",gap:8,minWidth:300}}>
          {[
            ["OPEN ALERTS", activeAlerts.length, "#D4159A"],
            ["HIGH PRIORITY", highPriority, "#ff6b35"],
            ["AUDIT COV.", `${auditCoverage}%`, auditCoverage >= 90 ? "#10D8F0" : "#f0c040"],
          ].map(([label,value,color]) => (
            <div key={label} style={{border:`1px solid ${color}33`,backgroundColor:color+"10",borderRadius:4,padding:"10px 12px"}}>
              <div style={{fontSize:9,letterSpacing:1.5,color:"#666",marginBottom:4}}>{label}</div>
              <div style={{fontSize:24,fontWeight:900,color}}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10,marginBottom:14}}>
        {CLOSED_LOOP_STAGES.map(([label,detail,color], index) => {
          const isActive = label === currentStage;
          return (
          <button
            type="button"
            key={label}
            onClick={() => onStageSelect?.(label)}
            style={{
              textAlign:"left",
              border:`1px solid ${isActive ? color : color + "33"}`,
              borderRadius:4,
              padding:12,
              backgroundColor:isActive ? color + "16" : "#07070F",
              boxShadow:isActive ? `0 0 24px ${color}44, inset 0 1px 0 ${color}33` : "none",
              cursor:"pointer",
              transition:"border-color .15s ease, box-shadow .15s ease, background-color .15s ease",
              minHeight:112
            }}
            aria-current={isActive ? "step" : undefined}
          >
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
              <span style={{width:22,height:22,borderRadius:"50%",border:`1px solid ${isActive ? color : color + "66"}`,backgroundColor:isActive ? color + "22" : "transparent",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color}}>{index + 1}</span>
              <span style={{fontSize:12,fontWeight:900,color:"#fff"}}>{label}</span>
              {isActive && <span style={{marginLeft:"auto",fontSize:8,letterSpacing:1.2,color,fontWeight:900}}>CURRENT</span>}
            </div>
            <div style={{fontSize:11,color:"#777",lineHeight:1.45}}>{detail}</div>
          </button>
          );
        })}
      </div>

      <div style={{display:"flex",gap:10,flexWrap:"wrap",fontSize:11,color:"#888"}}>
        <span style={{border:"1px solid #10D8F033",color:"#10D8F0",padding:"4px 8px",borderRadius:3}}>Next owner: {nextOwner}</span>
        <span style={{border:"1px solid #8844E833",color:"#b98cff",padding:"4px 8px",borderRadius:3}}>Documented interventions: {documented}</span>
        <span style={{border:"1px solid #D4159A33",color:"#ff72c9",padding:"4px 8px",borderRadius:3}}>Outcome proof required for every alert</span>
      </div>
    </div>
  );
}

// -- Patient Detail Panel -------------------------------------------------------
function PatientDetail({ patient, onClose, mode = "dashboard", patients = [], onOpenPatient, onNavigateStage }) {
  const [tab, setTab] = useState("overview");
  const [savedActions, setSavedActions] = useState([]);
  const [showActionForm, setShowActionForm] = useState(false);
  const [savingAction, setSavingAction] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionForm, setActionForm] = useState({
    action_type: "Counselor contacted patient",
    action_taken: "",
    staff_name: "",
    follow_up_required: false,
    outcome_note: ""
  });

  const patientId = patient?.id;
  const history = getPatientHistory(patient);
  const actions = [...savedActions, ...(FALLBACK_ACTIONS[patient.id] || [])].sort((a, b) => new Date(b.timestamp || b.createdAt || 0) - new Date(a.timestamp || a.createdAt || 0));
  const c = patient ? TIER_COLOR[patient.risk_tier]||"#555" : "#555";
  const drivers = patient?.top_drivers ? patient.top_drivers.split("|") : [];
  const owner = getPatientOwner(patient);
  const guidedIntervention = getGuidedIntervention(patient);
  const knownPeer = findPatientByName(patients, patient?.known_peers);

  useEffect(() => {
    let active = true;
    async function loadActions() {
      if (!patientId) return;
      const data = await censusGuardAdapter.getClinicalActions(patientId, { mode });
      if (active) setSavedActions(data);
    }
    setSavedActions([]);
    setShowActionForm(false);
    setActionError("");
    loadActions();
    return () => {
      active = false;
    };
  }, [patientId, mode]);

  if (!patient) {
    return (
      <div style={{backgroundColor:"#0a0a18",border:"1px solid #1a1a2e",borderRadius:6,padding:20,marginTop:16}}>
        <div style={{fontSize:10,letterSpacing:2,color:"#D4159A",fontWeight:900,marginBottom:8}}>PATIENT RECORD UNAVAILABLE</div>
        <div style={{fontSize:18,fontWeight:900,color:"#fff",marginBottom:8}}>No patient is loaded for this view.</div>
        <div style={{fontSize:12,color:"#777",lineHeight:1.6,marginBottom:14}}>
          CensusGuard is waiting for the live patient feed or a selected patient record before it can show intervention details.
        </div>
        {onClose && (
          <button onClick={onClose} style={{backgroundColor:"#D4159A",border:"none",color:"#fff",padding:"8px 16px",borderRadius:2,cursor:"pointer",fontSize:12,fontWeight:800}}>
            Return to dashboard
          </button>
        )}
      </div>
    );
  }

  async function saveAction() {
    if (!actionForm.action_taken.trim() || !actionForm.staff_name.trim()) {
      setActionError("Staff name and action taken are required.");
      return;
    }

    setSavingAction(true);
    setActionError("");
    try {
      const record = await censusGuardAdapter.createClinicalAction({
        ...actionForm,
        patient_id: patient.id,
        patient_name: patient.name,
        alert_reason: patient.alert_reason || "Manual clinical entry",
        timestamp: new Date().toISOString(),
        score_at_action: patient.risk_score || 0
      }, { mode });
      setSavedActions((existing) => [record, ...existing]);
      setActionForm({
        action_type: "Counselor contacted patient",
        action_taken: "",
        staff_name: "",
        follow_up_required: false,
        outcome_note: ""
      });
      setShowActionForm(false);
    } catch {
      setActionError("Could not save the action. Try again.");
    } finally {
      setSavingAction(false);
    }
  }

  return (
    <div style={{backgroundColor:"#0a0a18",border:`1px solid ${c}44`,borderRadius:6,padding:20,marginTop:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16,flexWrap:"wrap",gap:12}}>
        <div>
          <div style={{fontSize:18,fontWeight:900,color:"#fff"}}>{patient.name}</div>
          <div style={{fontSize:11,color:"#555",marginTop:2}}>Day {patient.length_of_stay} · {patient.level_of_care} · Room {patient.room_number||"—"} · {SUBSTANCE_MAP[patient.substance_encoded]||"Unknown"}</div>
          <div style={{fontSize:11,color:"#10D8F0",marginTop:5,fontWeight:800}}>Owner: {owner}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:40,fontWeight:900,color:c,lineHeight:1}}>{patient.risk_score}</div>
            <TierBadge tier={patient.risk_tier}/>
          </div>
          <button onClick={onClose} style={{background:"none",border:"1px solid #2a2a3e",color:"#555",width:28,height:28,borderRadius:"50%",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
      </div>

      {patient.alert_active && (
        <div style={{backgroundColor:"#2a0018",border:"1px solid #D4159A44",borderLeft:"3px solid #D4159A",borderRadius:3,padding:"10px 14px",marginBottom:14,fontSize:12,color:"#D4159A"}}>
          {patient.alert_reason}
        </div>
      )}

      <div style={{display:"flex",gap:0,marginBottom:16,borderBottom:"1px solid #1a1a2e",overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
        {[["overview","Overview"],["plan","Intervention Plan"],["meds","Meds"],["nursing","Nursing"],["trajectory","Score Trajectory"],["history","Score History"],["staffLoop","Staff Action Loop"],["audit","Audit Trail"]].map(([t,label])=>(
          <button key={t} onClick={()=>setTab(t)} style={{background:"none",border:"none",borderBottom:tab===t?"2px solid #D4159A":"2px solid transparent",color:tab===t?"#D4159A":"#555",padding:"8px 16px",cursor:"pointer",fontSize:12,fontWeight:700,letterSpacing:1,marginBottom:-1}}>
            {label}
          </button>
        ))}
      </div>

      {tab==="overview" && (
        <div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
            {drivers.map((d,i)=>(
              <button
                key={i}
                type="button"
                onClick={() => setTab(d.toLowerCase().includes("staff") ? "audit" : "plan")}
                style={{backgroundColor:"#D4159A22",border:"1px solid #D4159A33",color:"#D4159A",fontSize:11,padding:"3px 10px",borderRadius:2,fontWeight:700,cursor:"pointer"}}
              >
                {d}
              </button>
            ))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:8}}>
            {[
              ["Velocity", <VelocityChip v={patient.velocity}/>],
              ["Admission #", patient.admission_number||1],
              ["Prior Tx", patient.has_prior_tx ? `Yes (${patient.prior_tx_count}x)` : "No"],
              ["Substance", SUBSTANCE_MAP[patient.substance_encoded]||"—"],
              ["Pain Score", patient.pain_level_score ? `${patient.pain_level_score}/10` : "—"],
              ["Psych Comorbid", patient.psych_comorbid ? "Yes" : "No"],
              ["Unstable Housing", patient.unstable_housing ? "Yes" : "No"],
              ["Cliff Window", patient.cliff_window ? "? Active" : "No"],
              ["Known Peer", patient.known_peers||"—"],
              ["Smoker", patient.smoker ? "Yes" : "No"],
              ["Court Referral", patient.court_referral ? "Yes" : "No"],
              ["Room", patient.room_number||"—"],
            ].map(([l,v])=>{
              const clickable =
                (l === "Known Peer" && knownPeer) ||
                (l === "Cliff Window" && patient.cliff_window) ||
                l === "Psych Comorbid" ||
                l === "Velocity" ||
                l === "Pain Score";
              const handleClick = () => {
                if (l === "Known Peer" && knownPeer) return onOpenPatient?.(knownPeer);
                if (l === "Velocity") return setTab("trajectory");
                if (l === "Cliff Window" || l === "Psych Comorbid" || l === "Pain Score") return setTab("plan");
              };
              return (
              <button
                key={l}
                type="button"
                onClick={handleClick}
                disabled={!clickable}
                style={{textAlign:"left",backgroundColor:"#0d0d1a",border:`1px solid ${clickable ? "#10D8F033" : "#1a1a2e"}`,borderRadius:3,padding:"8px 12px",cursor:clickable?"pointer":"default"}}
              >
                <div style={{fontSize:10,color:"#444",letterSpacing:1,marginBottom:3}}>{String(l).toUpperCase()}</div>
                <div style={{color:"#fff",fontWeight:700,fontSize:13}}>{v}</div>
              </button>
              );
            })}
          </div>
        </div>
      )}

      {tab==="plan" && (
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:10,marginBottom:14}}>
            {[
              ["ALERT OWNER", owner, "#10D8F0"],
              ["CURRENT TIER", patient.risk_tier, c],
              ["ACTION STATUS", actions.length ? "Documented" : "Needs action", actions.length ? "#10D8F0" : "#D4159A"],
              ["FOLLOW-UP", actions.some(a => a.follow_up_required) ? "Required" : "Set by staff", "#f0c040"],
            ].map(([label,value,color]) => (
              <div key={label} style={{backgroundColor:"#0d0d1a",border:`1px solid ${color}33`,borderRadius:4,padding:12}}>
                <div style={{fontSize:10,color:"#444",letterSpacing:1.5,marginBottom:5}}>{label}</div>
                <div style={{fontSize:15,fontWeight:900,color}}>{value}</div>
              </div>
            ))}
          </div>

          <div style={{backgroundColor:"#0d0008",border:"1px solid #D4159A33",borderLeft:"3px solid #D4159A",borderRadius:4,padding:16,marginBottom:14}}>
            <div style={{fontSize:10,letterSpacing:2,color:"#D4159A",fontWeight:900,marginBottom:8}}>GUIDED INTERVENTION</div>
            <div style={{fontSize:14,color:"#fff",lineHeight:1.65}}>{guidedIntervention}</div>
          </div>

          <div style={{backgroundColor:"#071a10",border:"1px solid #10D8F033",borderRadius:4,padding:16}}>
            <div style={{fontSize:10,letterSpacing:2,color:"#10D8F0",fontWeight:900,marginBottom:10}}>CLOSE THE LOOP</div>
            <div style={{display:"grid",gap:9}}>
              {[
                ["Who", `Assigned staff owner: ${owner}`],
                ["What", actions[0]?.action_taken || "Document the clinical action taken."],
                ["When", actions[0]?.timestamp ? new Date(actions[0].timestamp).toLocaleString() : "Same shift; before next handoff."],
                ["Outcome", actions[0]?.outcome_note || "Record patient response, follow-up need, and continuity status."],
              ].map(([label,value]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    if (label === "Who" || label === "What" || label === "When") setTab("audit");
                    if (label === "Outcome") onNavigateStage?.("Verify");
                  }}
                  style={{display:"grid",gridTemplateColumns:"80px minmax(0,1fr)",gap:10,fontSize:12,lineHeight:1.55,textAlign:"left",background:"none",border:"1px solid #10D8F022",borderRadius:3,padding:"7px 8px",cursor:"pointer"}}
                >
                  <div style={{color:"#10D8F0",fontWeight:900}}>{label}</div>
                  <div style={{color:"#ddd"}}>{value}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab==="trajectory" && (
        <div>
          <div style={{fontSize:10,letterSpacing:2,color:"#444",marginBottom:12}}>INDIVIDUAL RISK SCORE TRAJECTORY</div>
          <ScoreLineChart patientId={patient.id} patientName={patient.name} patient={patient}/>
        </div>
      )}

      {tab==="meds" && <MedicationPanel patient={patient} />}

      {tab==="nursing" && <NursingPanel patient={patient} />}

      {tab==="staffLoop" && <StaffActionLoopPanel patient={patient} />}

      {tab==="history" && (
        <div>
          <div style={{fontSize:10,letterSpacing:2,color:"#444",marginBottom:14}}>RISK SCORE HISTORY</div>
          {!history.length && <div style={{color:"#444",fontSize:12}}>No history recorded.</div>}
          <div style={{position:"relative"}}>
            <div style={{position:"absolute",left:16,top:0,bottom:0,width:2,backgroundColor:"#1a1a2e"}}/>
            {[...history].reverse().map((h,i)=>{
              const hc = TIER_COLOR[h.risk_tier]||"#555";
              const delta = h.previous_score ? h.score - h.previous_score : 0;
              const driverList = h.drivers ? h.drivers.split("|") : [];
              return (
                <div key={i} style={{position:"relative",paddingLeft:40,paddingBottom:20}}>
                  <div style={{position:"absolute",left:8,top:4,width:18,height:18,borderRadius:"50%",backgroundColor:h.alert_fired?"#D4159A":"#1a1a2e",border:`2px solid ${hc}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {h.alert_fired && <span style={{fontSize:8,color:"#fff"}}>!</span>}
                  </div>
                  <div style={{backgroundColor:"#0a0a18",border:`1px solid ${h.alert_fired?"#D4159A33":"#1a1a2e"}`,borderRadius:4,padding:"10px 14px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,flexWrap:"wrap",gap:4}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <span style={{fontSize:24,fontWeight:900,color:hc}}>{h.score}</span>
                        {delta!==0&&<span style={{fontSize:12,fontWeight:700,color:delta>0?"#D4159A":"#10D8F0"}}>{delta>0?`+${delta}`:delta} pts</span>}
                        <TierBadge tier={h.risk_tier}/>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:11,color:"#555"}}>Day {h.day}</div>
                        <div style={{fontSize:10,color:"#333"}}>{new Date(h.timestamp).toLocaleString()}</div>
                      </div>
                    </div>
                    <div style={{fontSize:12,color:"#888",marginBottom:6}}>
                      <span style={{color:"#555"}}>Trigger: </span>
                      <span style={{color: h.trigger==="Staff check-in" ? "#10D8F0" : "#888", fontWeight: h.trigger==="Staff check-in" ? 700 : 400}}>
                        {h.trigger === "Staff check-in" ? "? Staff Check-in (real-time rescore)" : h.trigger}
                      </span>
                    </div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                      {driverList.map((d,j)=><span key={j} style={{backgroundColor:"#1a1a2e",color:"#888",fontSize:11,padding:"2px 8px",borderRadius:2}}>{d}</span>)}
                    </div>
                    {h.alert_fired && <div style={{marginTop:6,fontSize:11,color:"#D4159A",fontWeight:700}}>Alert fired</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab==="audit" && (
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div>
              <div style={{fontSize:10,letterSpacing:2,color:"#444"}}>CLINICAL AUDIT TRAIL</div>
              <div style={{fontSize:12,color:"#777",marginTop:4}}>Records who did what, when they did it, and what happened next.</div>
            </div>
            <button onClick={()=>setShowActionForm(!showActionForm)} style={{backgroundColor:"#D4159A",border:"none",color:"#fff",fontSize:11,fontWeight:800,padding:"6px 14px",borderRadius:2,cursor:"pointer",letterSpacing:1}}>+ LOG ACTION</button>
          </div>
          {showActionForm && (
            <div style={{backgroundColor:"#0a0a18",border:"1px solid #D4159A33",borderRadius:4,padding:16,marginBottom:16}}>
              <div style={{marginBottom:10}}>
                <div style={{fontSize:10,color:"#444",marginBottom:4}}>ACTION TYPE</div>
                <select value={actionForm.action_type} onChange={e=>setActionForm(f=>({...f,action_type:e.target.value}))} style={{width:"100%",backgroundColor:"#07070F",border:"1px solid #2a2a3e",borderRadius:3,color:"#fff",padding:"8px 10px",fontSize:12}}>
                  {ACTION_TYPES.map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <div style={{marginBottom:10}}>
                <div style={{fontSize:10,color:"#444",marginBottom:4}}>STAFF NAME</div>
                <input value={actionForm.staff_name} onChange={e=>setActionForm(f=>({...f,staff_name:e.target.value}))} placeholder="e.g. K. Rhodes, LCSW" style={{width:"100%",backgroundColor:"#07070F",border:"1px solid #2a2a3e",borderRadius:3,color:"#fff",padding:"8px 10px",fontSize:12,boxSizing:"border-box"}}/>
              </div>
              <div style={{marginBottom:10}}>
                <div style={{fontSize:10,color:"#444",marginBottom:4}}>ACTION TAKEN</div>
                <textarea value={actionForm.action_taken} onChange={e=>setActionForm(f=>({...f,action_taken:e.target.value}))} placeholder="Describe what was done..." rows={3} style={{width:"100%",backgroundColor:"#07070F",border:"1px solid #2a2a3e",borderRadius:3,color:"#fff",padding:"8px 10px",fontSize:12,resize:"vertical",boxSizing:"border-box"}}/>
              </div>
              <div style={{marginBottom:10}}>
                <div style={{fontSize:10,color:"#444",marginBottom:4}}>OUTCOME NOTE (optional)</div>
                <input value={actionForm.outcome_note} onChange={e=>setActionForm(f=>({...f,outcome_note:e.target.value}))} placeholder="Patient response, next steps..." style={{width:"100%",backgroundColor:"#07070F",border:"1px solid #2a2a3e",borderRadius:3,color:"#fff",padding:"8px 10px",fontSize:12,boxSizing:"border-box"}}/>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                <input type="checkbox" id={`follow-up-${patient.id}`} checked={actionForm.follow_up_required} onChange={e=>setActionForm(f=>({...f,follow_up_required:e.target.checked}))} style={{accentColor:"#D4159A"}}/>
                <label htmlFor={`follow-up-${patient.id}`} style={{fontSize:12,color:"#888",cursor:"pointer"}}>Follow-up required</label>
              </div>
              {actionError && <div style={{fontSize:12,color:"#ff6b35",marginBottom:10}}>{actionError}</div>}
              <div style={{display:"flex",gap:8}}>
                <button onClick={saveAction} disabled={savingAction} style={{backgroundColor:savingAction?"#444":"#D4159A",border:"none",color:"#fff",padding:"8px 20px",borderRadius:2,cursor:savingAction?"not-allowed":"pointer",fontSize:12,fontWeight:800}}>
                  {savingAction ? "Saving..." : "Save Action"}
                </button>
                <button onClick={()=>{setShowActionForm(false);setActionError("");}} style={{backgroundColor:"transparent",border:"1px solid #2a2a3e",color:"#555",padding:"8px 16px",borderRadius:2,cursor:"pointer",fontSize:12}}>Cancel</button>
              </div>
            </div>
          )}
          {!actions.length && <div style={{color:"#444",fontSize:12}}>No clinical actions logged yet.</div>}
          {actions.map((a,i)=>(
            <div key={i} style={{backgroundColor:"#0a0a18",border:"1px solid #1a1a2e",borderRadius:4,padding:"12px 14px",marginBottom:10}}>
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
              {a.outcome_note && <div style={{fontSize:12,color:"#666",fontStyle:"italic"}}>? {a.outcome_note}</div>}
              <div style={{fontSize:11,color:"#444",marginTop:6}}>Score at action: <span style={{color:TIER_COLOR["HIGH"]}}>{a.score_at_action}</span> · Outcome status: <span style={{color:"#10D8F0"}}>{a.outcome_note ? "Documented" : "Pending"}</span></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


const FALLBACK_NARRATIVES = [];

// -- Group Narrative -----------------------------------------------------------
function GroupNarrativePanel({ mode = "dashboard" }) {
  const [savedNarratives, setSavedNarratives] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({unit:"Detox",observation:"",observation_type:"Clinical Note",staff_name:""});
  const typeColor = {
    "Conflict":"#D4159A","Clinical Note":"#10D8F0","Positive":"#10D8F0",
    "Group Milestone":"#8844E8","Cohesion Drop":"#ff6b35","Warning":"#f0c040",
    "Alert":"#D4159A"
  };
  const narratives = [...savedNarratives, ...FALLBACK_NARRATIVES].sort((a, b) => new Date(b.timestamp || b.createdAt || 0) - new Date(a.timestamp || a.createdAt || 0));

  useEffect(() => {
    let active = true;
    async function loadNarratives() {
      const data = await censusGuardAdapter.getGroupNarratives({ mode });
      if (active) setSavedNarratives(data);
    }
    loadNarratives();
    return () => {
      active = false;
    };
  }, [mode]);

  async function saveNarrative() {
    if (!form.observation.trim() || !form.staff_name.trim()) {
      setError("Staff name and narrative are required.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const record = await censusGuardAdapter.createGroupNarrative({
        ...form,
        cohesion_score: null,
        affected_patients: "",
        timestamp: new Date().toISOString()
      }, { mode });
      setSavedNarratives((existing) => [record, ...existing]);
      setForm({unit:"Detox",observation:"",observation_type:"Clinical Note",staff_name:""});
      setShowForm(false);
    } catch {
      setError("Could not save the group note. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{fontSize:10,letterSpacing:2,color:"#444"}}>DAILY GROUP NARRATIVE</div>
        <button onClick={()=>setShowForm(!showForm)} style={{backgroundColor:"#D4159A22",border:"1px solid #D4159A44",color:"#D4159A",padding:"6px 14px",borderRadius:2,cursor:"pointer",fontSize:11,fontWeight:800}}>+ LOG NOTE</button>
      </div>
      <div style={{backgroundColor:"#071a10",border:"1px solid #10D8F033",borderRadius:4,padding:"10px 16px",marginBottom:16,fontSize:12,color:"#10D8F0"}}>
        In live mode, clinical staff log group observations in real time. CensusGuard tracks cohesion scores and flags emerging conflicts before they escalate.
      </div>
      {showForm && (
        <div style={{backgroundColor:"#0a0a18",border:"1px solid #D4159A44",borderRadius:4,padding:16,marginBottom:16}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div>
              <div style={{fontSize:10,color:"#444",letterSpacing:1,marginBottom:6}}>UNIT</div>
              <select value={form.unit} onChange={e=>setForm(f=>({...f,unit:e.target.value}))} style={{width:"100%",backgroundColor:"#07070F",border:"1px solid #2a2a3e",borderRadius:2,color:"#fff",padding:"8px 10px",fontSize:12}}>
                {["Detox","Residential","PHP"].map(u=><option key={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <div style={{fontSize:10,color:"#444",letterSpacing:1,marginBottom:6}}>TYPE</div>
              <select value={form.observation_type} onChange={e=>setForm(f=>({...f,observation_type:e.target.value}))} style={{width:"100%",backgroundColor:"#07070F",border:"1px solid #2a2a3e",borderRadius:2,color:"#fff",padding:"8px 10px",fontSize:12}}>
                {["Clinical Note","Conflict","Positive","Group Milestone","Cohesion Drop","Warning"].map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:10,color:"#444",letterSpacing:1,marginBottom:6}}>STAFF NAME</div>
            <input value={form.staff_name} onChange={e=>setForm(f=>({...f,staff_name:e.target.value}))} placeholder="Your name" style={{width:"100%",backgroundColor:"#07070F",border:"1px solid #2a2a3e",borderRadius:2,color:"#fff",padding:"8px 10px",fontSize:12,outline:"none",boxSizing:"border-box"}}/>
          </div>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:10,color:"#444",letterSpacing:1,marginBottom:6}}>NARRATIVE</div>
            <textarea value={form.observation} onChange={e=>setForm(f=>({...f,observation:e.target.value}))} rows={3} placeholder="Log cross-disciplinary group context, cohesion changes, or emerging risk." style={{width:"100%",backgroundColor:"#07070F",border:"1px solid #2a2a3e",borderRadius:2,color:"#fff",padding:"8px 10px",fontSize:12,outline:"none",resize:"vertical",boxSizing:"border-box"}}/>
          </div>
          {error && <div style={{fontSize:12,color:"#ff6b35",marginBottom:10}}>{error}</div>}
          <div style={{display:"flex",gap:8}}>
            <button onClick={saveNarrative} disabled={saving} style={{backgroundColor:saving?"#444":"#D4159A",border:"none",color:"#fff",padding:"8px 20px",borderRadius:2,cursor:saving?"not-allowed":"pointer",fontWeight:800,fontSize:12}}>{saving ? "Saving..." : "LOG NOTE"}</button>
            <button onClick={()=>{setShowForm(false);setError("");}} style={{background:"none",border:"1px solid #2a2a3e",color:"#555",padding:"8px 16px",borderRadius:2,cursor:"pointer",fontSize:12}}>Cancel</button>
          </div>
        </div>
      )}
      {narratives.map((n,i)=>{
        const tc = typeColor[n.observation_type]||"#555";
        return (
          <div key={n.id || i} style={{backgroundColor:"#0a0a18",border:`1px solid ${tc}33`,borderLeft:`3px solid ${tc}`,borderRadius:4,padding:"14px 18px",marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8,flexWrap:"wrap",gap:6}}>
              <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                <span style={{backgroundColor:tc+"22",color:tc,fontSize:10,fontWeight:800,padding:"2px 8px",borderRadius:2,letterSpacing:1}}>{n.observation_type}</span>
                <span style={{backgroundColor:"#1a1a2e",color:"#888",fontSize:10,padding:"2px 8px",borderRadius:2}}>{n.unit}</span>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:11,color:"#666"}}>{n.staff_name}</div>
                <div style={{fontSize:10,color:"#333"}}>{new Date(n.timestamp).toLocaleString()}</div>
              </div>
            </div>
            <div style={{fontSize:13,color:"#ddd",lineHeight:1.7}}>{n.observation}</div>
            {n.cohesion_score!=null && <div style={{fontSize:11,color:"#555",marginTop:6}}>Cohesion score logged: <span style={{color:tc,fontWeight:700}}>{n.cohesion_score}</span></div>}
          </div>
        );
      })}
    </div>
  );
}

function StaffCrossCheckPanel({ patients, onSelectPatient }) {
  const rows = patients.map((patient, index) => {
    const isCritical = patient.risk_tier === "CRITICAL";
    const isHigh = patient.risk_tier === "HIGH";
    const reliability = isCritical ? 0.5 : isHigh ? 0.74 : 0.91;
    return {
      patient,
      owner: getPatientOwner(patient, index),
      staffId: index === 0 ? "TECH-17" : index === 1 ? "TECH-09" : "TECH-12",
      role: index === 1 ? "Therapist" : index === 2 ? "Nursing" : "BHT",
      reliability,
      crossCheck: reliability < 0.65 ? "Supervisor review" : reliability < 0.8 ? "Second staff touch" : "Clear",
      note: isCritical
        ? "Repeated check-in pattern. Reduce model weight until a second staff member validates patient state."
        : isHigh
          ? "Mood shift noted after group. Cross-check before next block."
          : "Stable check-in pattern with adequate note variation.",
    };
  });

  const lowReliability = rows.filter(row => row.reliability < 0.65).length;
  const secondTouch = rows.filter(row => row.crossCheck === "Second staff touch").length;

  return (
    <div>
      <SectionHeader
        eyebrow="STAFF DOCUMENTATION LAYER"
        title="Staff Docs and Cross-Check"
        copy="Connects BHT check-ins, counselor ownership, action notes, and model weighting so every alert has accountable staff documentation."
      />

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginBottom:18}}>
        {[
          ["CHECK-INS REVIEWED", rows.length, "#fff"],
          ["LOW RELIABILITY", lowReliability, "#D4159A"],
          ["SECOND TOUCH NEEDED", secondTouch, "#ff6b35"],
          ["MODEL INPUT STATUS", lowReliability ? "FILTERED" : "CLEAR", "#10D8F0"],
        ].map(([label,value,color]) => (
          <div key={label} style={{backgroundColor:"#0a0a18",border:"1px solid #1a1a2e",borderRadius:4,padding:"14px 16px"}}>
            <div style={{fontSize:10,letterSpacing:2,color:"#444",marginBottom:6}}>{label}</div>
            <div style={{fontSize:24,fontWeight:900,color}}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"minmax(0,1.4fr) minmax(280px,.6fr)",gap:18,alignItems:"start"}}>
        <div style={{overflowX:"auto",backgroundColor:"#0a0a18",border:"1px solid #1a1a2e",borderRadius:4}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead>
              <tr style={{borderBottom:"1px solid #1a1a2e"}}>
                {["Staff","Role","Owner","Patient","Risk","Reliability","Cross-check","Model handling"].map(h => (
                  <th key={h} style={{padding:"10px 12px",textAlign:"left",fontSize:10,color:"#444",letterSpacing:1,fontWeight:800,whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => {
                const color = row.reliability < 0.65 ? "#D4159A" : row.reliability < 0.8 ? "#ff6b35" : "#10D8F0";
                return (
                  <tr
                    key={`${row.staffId}-${row.patient.id}`}
                    onClick={() => onSelectPatient?.(row.patient)}
                    style={{borderBottom:"1px solid #111125",cursor:"pointer"}}
                    onMouseEnter={(event) => { event.currentTarget.style.backgroundColor = "#0d0d1a"; }}
                    onMouseLeave={(event) => { event.currentTarget.style.backgroundColor = "transparent"; }}
                  >
                    <td style={{padding:"12px",fontWeight:900,color:"#fff"}}>{row.staffId}</td>
                    <td style={{padding:"12px",color:"#888"}}>{row.role}</td>
                    <td style={{padding:"12px",color:"#10D8F0",fontWeight:800,whiteSpace:"nowrap"}}>{row.owner}</td>
                    <td style={{padding:"12px",color:"#fff"}}><PatientNameAction patient={row.patient} onOpen={onSelectPatient} compact /></td>
                    <td style={{padding:"12px"}}><TierBadge tier={row.patient.risk_tier}/></td>
                    <td style={{padding:"12px"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,minWidth:120}}>
                        <div style={{height:6,backgroundColor:"#111125",borderRadius:999,overflow:"hidden",flex:1}}>
                          <div style={{height:"100%",width:`${Math.round(row.reliability * 100)}%`,backgroundColor:color}} />
                        </div>
                        <span style={{fontSize:12,fontWeight:900,color}}>{row.reliability.toFixed(2)}</span>
                      </div>
                    </td>
                    <td style={{padding:"12px",fontWeight:800,color}}>{row.crossCheck}</td>
                    <td style={{padding:"12px",color:"#777",lineHeight:1.45,maxWidth:360}}>{row.note}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{backgroundColor:"#0d0008",border:"1px solid #D4159A33",borderRadius:4,padding:18}}>
          <div style={{fontSize:10,letterSpacing:2,color:"#D4159A",fontWeight:900,marginBottom:10}}>WHY THIS MATTERS</div>
          <div style={{fontSize:13,color:"#ddd",lineHeight:1.7}}>
            CensusGuard should not blindly trust every staff note. The staff docs layer identifies flat or repeated check-ins, lowers their model weight, and asks for a second human touch before a high-stakes escalation.
          </div>
          <div style={{marginTop:14,fontSize:11,color:"#888",lineHeight:1.6}}>
            Staff check-ins are signal inputs and accountability records. CensusGuard validates signal quality before it changes clinical risk, then keeps the who-did-what trail attached to the patient.
          </div>
        </div>
      </div>
    </div>
  );
}

function PsychProviderPanel({ patients, onSelectPatient }) {
  const providerRows = patients
    .filter((patient) => ["CRITICAL", "HIGH"].includes(patient.risk_tier) || patient.psych_comorbid || /medication|withdrawal|moud|methadone|opioid|heroin/i.test(`${patient.intervention || ""} ${SUBSTANCE_MAP[patient.substance_encoded] || ""}`))
    .map((patient, index) => {
      const substance = SUBSTANCE_MAP[patient.substance_encoded] || "Unknown";
      const needsPsych = patient.psych_comorbid || patient.calm_before_storm_flag || patient.risk_tier === "CRITICAL";
      const needsMedication = /opioid|heroin|methadone|benzodiazepine/i.test(substance) || /medication|nursing|moud/i.test(patient.intervention || "");
      return {
        patient,
        provider: needsPsych ? ["Dr. Patel, Psychiatrist", "Dr. Nixi, Prescriber", "Dr. Moreno, Medical Director"][index % 3] : "Medical provider on call",
        lane: needsPsych && needsMedication ? "Psych + Med Review" : needsPsych ? "Psych Consult" : "Medication Review",
        priority: patient.risk_tier === "CRITICAL" ? "Same shift" : patient.risk_tier === "HIGH" ? "Before next group" : "Routine review",
        handoff: needsMedication
          ? "Confirm med continuity, withdrawal response, pharmacy timing, and prescriber follow-up."
          : "Assess mood shift, safety risk, ambivalence, and readiness for care plan adjustment.",
      };
    });

  const sameShift = providerRows.filter((row) => row.priority === "Same shift").length;
  const medReviews = providerRows.filter((row) => /Med/.test(row.lane)).length;
  const psychConsults = providerRows.filter((row) => /Psych/.test(row.lane)).length;

  return (
    <div>
      <SectionHeader
        eyebrow="PSYCH AND PROVIDER LOOP"
        title="Doctors Belong In The Same Audit Trail"
        copy="Connects psychiatry, medical providers, medication review, and prescriber handoff to the same patient-level closed loop as staff alerts."
      />

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,marginBottom:18}}>
        {[
          ["PROVIDER REVIEWS", providerRows.length, "#fff"],
          ["SAME-SHIFT", sameShift, "#D4159A"],
          ["MED REVIEWS", medReviews, "#10D8F0"],
          ["PSYCH CONSULTS", psychConsults, "#D4159A"],
        ].map(([label,value,color]) => (
          <div key={label} style={{backgroundColor:"#0a0a18",border:`1px solid ${color}33`,borderRadius:4,padding:"14px 16px"}}>
            <div style={{fontSize:10,letterSpacing:2,color:"#444",marginBottom:6}}>{label}</div>
            <div style={{fontSize:24,fontWeight:900,color}}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) minmax(280px,.4fr)",gap:18,alignItems:"start"}}>
        <div style={{overflowX:"auto",backgroundColor:"#0a0a18",border:"1px solid #1a1a2e",borderRadius:4}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead>
              <tr style={{borderBottom:"1px solid #1a1a2e"}}>
                {["Patient","Provider","Lane","Priority","Risk","Handoff"].map((h) => (
                  <th key={h} style={{padding:"10px 12px",textAlign:"left",fontSize:10,color:"#444",letterSpacing:1,fontWeight:800,whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!providerRows.length && (
                <tr>
                  <td colSpan={6} style={{padding:"28px 16px",textAlign:"center",color:"#777"}}>No provider reviews queued.</td>
                </tr>
              )}
              {providerRows.map((row) => {
                const color = row.priority === "Same shift" ? "#D4159A" : row.priority === "Before next group" ? "#10D8F0" : "#888";
                return (
                  <tr
                    key={row.patient.id}
                    onClick={() => onSelectPatient?.(row.patient)}
                    style={{borderBottom:"1px solid #111125",cursor:"pointer"}}
                    onMouseEnter={(event) => { event.currentTarget.style.backgroundColor = "#0d0d1a"; }}
                    onMouseLeave={(event) => { event.currentTarget.style.backgroundColor = "transparent"; }}
                  >
                    <td style={{padding:"12px"}}><PatientNameAction patient={row.patient} onOpen={onSelectPatient} compact /></td>
                    <td style={{padding:"12px",color:"#fff",fontWeight:800,whiteSpace:"nowrap"}}>{row.provider}</td>
                    <td style={{padding:"12px",color:"#10D8F0",fontWeight:900}}>{row.lane}</td>
                    <td style={{padding:"12px",color,fontWeight:900}}>{row.priority}</td>
                    <td style={{padding:"12px"}}><TierBadge tier={row.patient.risk_tier} /></td>
                    <td style={{padding:"12px",color:"#777",lineHeight:1.45,minWidth:280}}>{row.handoff}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{backgroundColor:"#05050c",border:"1px solid #10D8F033",borderRadius:4,padding:18}}>
          <div style={{fontSize:10,letterSpacing:2,color:"#10D8F0",fontWeight:900,marginBottom:10}}>WHY THIS MATTERS</div>
          <div style={{fontSize:13,color:"#ddd",lineHeight:1.7}}>
            Doctors are not outside the workflow. If a patient needs psych review, medication continuity, detox response, or prescriber handoff, CensusGuard should show who owns it and whether the action closed.
          </div>
          <div style={{marginTop:14,fontSize:11,color:"#888",lineHeight:1.6}}>
            This section is ready for psychiatry consult status, provider notes, MAR/MOUD fields, pharmacy delay, and discharge bridge planning.
          </div>
        </div>
      </div>
    </div>
  );
}

function OutcomesPanel({ patients, activeAlerts, continuityProtected, auditCoverage }) {
  const criticalOrHigh = patients.filter(p => ["CRITICAL","HIGH"].includes(p.risk_tier));
  const interventionsNeeded = activeAlerts.length;
  const documentedInterventions = activeAlerts.filter(p => p.last_staff_checkin || p.last_action_at || p.audit_status === "documented").length;
  const coverage = auditCoverage ?? getAuditCoverage(activeAlerts, patients);
  const projectedRetained = Math.max(1, Math.round(criticalOrHigh.length * 0.58));
  const avgRiskDrop = criticalOrHigh.length ? 14 : 0;

  const proofRows = [
    {
      label: "At-risk patients retained",
      value: projectedRetained,
      detail: "Projected retention after documented same-shift intervention.",
      color: "#10D8F0",
    },
    {
      label: "Average risk reduction",
      value: `-${avgRiskDrop}`,
      detail: "Risk score movement after intervention and follow-up check-in.",
      color: "#8844E8",
    },
    {
      label: "Audit coverage",
      value: `${coverage}%`,
      detail: "Alerts with a linked staff action or follow-up event.",
      color: coverage >= 90 ? "#10D8F0" : "#f0c040",
    },
    {
      label: "Continuity protected",
      value: continuityProtected,
      detail: "High/critical patients with documented ownership in the intervention loop.",
      color: "#D4159A",
    },
  ];

  const timeline = [
    ["Identify", "Day 1 score created from admission risk profile.", "#10D8F0"],
    ["Forecast", "Cliff-window timing marks when risk is expected to peak.", "#8844E8"],
    ["Alert", `${activeAlerts.length} active alerts routed to staff queue.`, "#D4159A"],
    ["Intervene", `${documentedInterventions} interventions documented in the audit loop.`, "#ff6b35"],
    ["Verify", `${coverage}% audit coverage confirms staff action.`, "#f0c040"],
    ["Continue", "Outcome tracked across patient, floor, and cohort views.", "#10D8F0"],
  ];

  return (
    <div>
      <SectionHeader
        eyebrow="OUTCOMES AND PROOF"
        title="Infinity Closed-Loop Outcomes"
        copy="Turns risk detection into proof: who was identified, who owned the alert, what staff did, when they did it, and whether continuity was protected."
      />

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:12,marginBottom:20}}>
        {proofRows.map(row => (
          <div key={row.label} style={{backgroundColor:"#0a0a18",border:`1px solid ${row.color}33`,borderRadius:4,padding:18}}>
            <div style={{fontSize:10,letterSpacing:2,color:"#444",marginBottom:8}}>{row.label.toUpperCase()}</div>
            <div style={{fontSize:34,fontWeight:900,color:row.color,lineHeight:1}}>{row.value}</div>
            <div style={{fontSize:12,color:"#777",lineHeight:1.55,marginTop:10}}>{row.detail}</div>
          </div>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) minmax(300px,.42fr)",gap:18,alignItems:"start"}}>
        <div style={{backgroundColor:"#0a0a18",border:"1px solid #1a1a2e",borderRadius:4,padding:18}}>
          <div style={{fontSize:10,letterSpacing:2,color:"#10D8F0",fontWeight:900,marginBottom:16}}>CLOSED-LOOP PROOF CHAIN</div>
          <div style={{display:"grid",gap:10}}>
            {timeline.map(([label,detail,color], index) => (
              <div key={label} style={{display:"grid",gridTemplateColumns:"34px minmax(0,1fr)",gap:12,alignItems:"start"}}>
                <div style={{width:34,height:34,borderRadius:"50%",border:`1px solid ${color}66`,color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:900}}>{index + 1}</div>
                <div style={{borderBottom:index === timeline.length - 1 ? "none" : "1px solid #111125",paddingBottom:10}}>
                  <div style={{fontSize:13,fontWeight:900,color:"#fff",marginBottom:3}}>{label}</div>
                  <div style={{fontSize:12,color:"#777",lineHeight:1.55}}>{detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{backgroundColor:"#071a10",border:"1px solid #10D8F033",borderRadius:4,padding:18}}>
          <div style={{fontSize:10,letterSpacing:2,color:"#10D8F0",fontWeight:900,marginBottom:10}}>OPERATOR TALK TRACK</div>
          <div style={{fontSize:13,color:"#ddd",lineHeight:1.7}}>
            "CensusGuard is not just a retention dashboard. It is an early-intervention workflow. The outcome is whether staff saw the risk in time, acted, documented it, and kept continuity over the next shift."
          </div>
          <div style={{marginTop:14,fontSize:11,color:"#8ddde8",lineHeight:1.6}}>
            Production note: real outcomes should connect to discharge disposition, AMA events, readmission flags, and post-intervention score movement through the backend adapter.
          </div>
        </div>
      </div>
    </div>
  );
}

function MOUDContinuityPanel({ patients, onSelectPatient, isMobile }) {
  const moudSettings = [
    { setting: "Inpatient Detox", noMoud: 17.6, moud: 19.4 },
    { setting: "Short-term Residential", noMoud: 27.7, moud: 31.6 },
    { setting: "Long-term Residential", noMoud: 35.7, moud: 43.7 },
    { setting: "PHP / IOP", noMoud: 51.6, moud: 62.2 },
  ];
  const maxRate = 70;
  const longTermGap = (43.7 - 35.7).toFixed(1);
  const largestGap = moudSettings.reduce((max, row) => Math.max(max, row.moud - row.noMoud), 0);
  const moudFlags = patients.filter((patient) => {
    const substance = SUBSTANCE_MAP[patient.substance_encoded] || "";
    return /opioid|heroin|methadone/i.test(substance) || patient.moud_status || patient.medication_review_needed;
  });
  const rows = moudFlags.slice(0, 8);

  return (
    <div>
      <SectionHeader
        eyebrow="MOUD AMA VISIBILITY"
        title="MOUD Patients In Long-Term Residential Leave AMA At 43.7%"
        copy="Nearly 8 points higher than non-MOUD patients in the same setting."
      />

      <div style={{backgroundColor:"#0a0a18",border:"1px solid #D4159A44",borderTop:"3px solid #D4159A",borderRadius:4,padding:isMobile ? 18 : 24,marginBottom:18}}>
        <div style={{fontSize:isMobile ? 22 : 34,fontWeight:950,color:"#fff",lineHeight:1.12,maxWidth:980}}>
          MOUD patients in long-term residential leave AMA at <span style={{color:"#D4159A"}}>43.7%</span> - nearly <span style={{color:"#10D8F0"}}>{longTermGap} points higher</span> than non-MOUD patients in the same setting.
        </div>
        <div style={{fontSize:14,color:"#10D8F0",lineHeight:1.65,marginTop:14,maxWidth:880,fontWeight:800}}>
          The gap isn't clinical failure. It's a systems visibility failure. CensusGuard catches the signal before it becomes a walkout.
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:isMobile ? "1fr" : "minmax(0,1fr) 310px",gap:18,alignItems:"start"}}>
        <div style={{backgroundColor:"#05050c",border:"1px solid #1a1a2e",borderRadius:4,padding:isMobile ? 14 : 22,overflow:"hidden"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,marginBottom:18,flexWrap:"wrap"}}>
            <div>
              <div style={{fontSize:10,letterSpacing:2,color:"#10D8F0",fontWeight:900,marginBottom:6}}>AMA RATE BY SETTING</div>
              <div style={{fontSize:12,color:"#777",lineHeight:1.5}}>Side-by-side MOUD vs No MOUD. The widening gap is the story.</div>
            </div>
            <div style={{display:"flex",gap:14,fontSize:11,fontWeight:900,letterSpacing:.8}}>
              <span style={{color:"#10D8F0"}}>NO MOUD</span>
              <span style={{color:"#D4159A"}}>MOUD</span>
            </div>
          </div>

          <div style={{display:"grid",gap:18}}>
            {moudSettings.map((row, index) => {
              const gap = row.moud - row.noMoud;
              const gapIntensity = gap / largestGap;
              const stairInset = isMobile ? 0 : index * 28;
              const noMoudWidth = `${Math.max(8, (row.noMoud / maxRate) * 100)}%`;
              const moudWidth = `${Math.max(8, (row.moud / maxRate) * 100)}%`;
              return (
                <div key={row.setting} style={{marginLeft:stairInset,transition:"margin 160ms ease"}}>
                  <div style={{display:"grid",gridTemplateColumns:isMobile ? "1fr" : "190px minmax(0,1fr) 82px",gap:12,alignItems:"center"}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:900,color:"#fff",lineHeight:1.3}}>{row.setting}</div>
                      <div style={{fontSize:10,color:"#666",marginTop:3}}>Gap: <span style={{color:"#D4159A",fontWeight:900}}>+{gap.toFixed(1)} pts</span></div>
                    </div>
                    <div style={{display:"grid",gap:7}}>
                      <div style={{height:24,backgroundColor:"#0a0a18",border:"1px solid #10D8F022",borderRadius:3,overflow:"hidden",position:"relative"}}>
                        <div style={{height:"100%",width:noMoudWidth,background:"linear-gradient(90deg,#0b4c55,#10D8F0)",boxShadow:"0 0 18px #10D8F033"}} />
                        <span style={{position:"absolute",right:8,top:4,fontSize:11,color:"#d7fbff",fontWeight:900}}>{row.noMoud}%</span>
                      </div>
                      <div style={{height:28,backgroundColor:"#0a0a18",border:`1px solid rgba(212,21,154,${0.25 + gapIntensity * 0.45})`,borderRadius:3,overflow:"hidden",position:"relative"}}>
                        <div style={{height:"100%",width:moudWidth,background:"linear-gradient(90deg,#5c073f,#D4159A)",boxShadow:`0 0 ${14 + index * 7}px rgba(212,21,154,${0.2 + gapIntensity * 0.32})`}} />
                        <span style={{position:"absolute",right:8,top:5,fontSize:12,color:"#fff",fontWeight:950}}>{row.moud}%</span>
                      </div>
                    </div>
                    <div style={{textAlign:isMobile ? "left" : "right"}}>
                      <div style={{fontSize:26,fontWeight:950,color:"#D4159A",lineHeight:1}}>+{gap.toFixed(1)}</div>
                      <div style={{fontSize:9,color:"#666",letterSpacing:1}}>POINT GAP</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{backgroundColor:"#0a0a18",border:"1px solid #D4159A33",borderRadius:4,padding:18}}>
          <div style={{fontSize:10,letterSpacing:2,color:"#D4159A",fontWeight:900,marginBottom:10}}>BAYMARK TALK TRACK</div>
          <div style={{fontSize:13,color:"#ddd",lineHeight:1.75}}>
            The further a patient moves through residential and step-down care, the more the MOUD/non-MOUD AMA gap opens. CensusGuard turns that gap into an operational visibility layer: staff see the rising risk early, document the intervention, and keep the handoff attached to the patient.
          </div>
          <div style={{height:1,backgroundColor:"#1a1a2e",margin:"16px 0"}} />
          <div style={{fontSize:10,letterSpacing:2,color:"#10D8F0",fontWeight:900,marginBottom:10}}>MOUD WATCHLIST</div>
          {!rows.length && (
            <div style={{fontSize:12,color:"#777",lineHeight:1.6}}>Connect facility medication status, consult timing, and handoff fields to populate patient-level MOUD risk.</div>
          )}
          <div style={{display:"grid",gap:8}}>
            {rows.map((patient, index) => (
              <div key={patient.id || index} style={{border:"1px solid #1a1a2e",borderLeft:"3px solid #D4159A",borderRadius:3,padding:"10px 12px",backgroundColor:"#05050c"}}>
                <PatientNameAction patient={patient} onOpen={onSelectPatient} compact />
                <div style={{fontSize:11,color:"#777",lineHeight:1.5,marginTop:6}}>
                  {SUBSTANCE_MAP[patient.substance_encoded] || "Unknown"} · {patient.risk_tier} · {getPatientOwner(patient, index)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// -- Main Dashboard Page --------------------------------------------------------

export function UnifiedCensusGuard({ mode = "dashboard" }) {
  const { section } = useParams();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("All");
  const [counselorFilter, setCounselorFilter] = useState("All");
  const [sortMode, setSortMode] = useState("risk");
  const [drawerFullscreen, setDrawerFullscreen] = useState(false);
  const [apiPatients, setApiPatients] = useState([]);
  const [apiStatus, setApiStatus] = useState("idle");
  const [scoreStatus, setScoreStatus] = useState("idle");
  const [scoreResult, setScoreResult] = useState(null);
  const [scoreError, setScoreError] = useState("");
  const [scoreRuns, setScoreRuns] = useState([]);
  const [stagedFiles, setStagedFiles] = useState([]);
  const [alertSettings, setAlertSettings] = useState({
    dayShiftStart: "07:00",
    nightShiftStart: "19:00",
    dayFrequency: "start-and-q4",
    nightFrequency: "start-and-q2",
    sendEmail: true,
    sendPush: true,
    sendShiftDigest: true,
    criticalImmediate: true,
  });
  
  const isMobile = useIsMobile();
  const validSections = new Set(NAV_AREAS.map((area) => area.id));
  const tab = section || "monitor";
  const currentLoopStage = CLOSED_LOOP_STAGE_BY_SECTION[tab] || "Detect";
  const goToSection = (id) => {
    setSelected(null);
    navigate(id === "monitor" ? "/dashboard" : `/dashboard/${id}`);
  };
  const goToLoopStage = (stage) => {
    goToSection(CLOSED_LOOP_ROUTE_BY_STAGE[stage] || "monitor");
  };

  if (section && !validSections.has(section)) {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    let alive = true;
    setApiStatus("loading");
    censusGuardAdapter.getPatients({ mode }).then((data) => {
      if (!alive) return;
      setApiPatients(Array.isArray(data) ? data : []);
      setApiStatus(Array.isArray(data) && data.length ? "connected" : "fallback");
    }).catch(() => {
      if (!alive) return;
      setApiPatients([]);
      setApiStatus("fallback");
    });

    return () => {
      alive = false;
    };
  }, [mode]);

  const patients = apiPatients.length ? apiPatients : FALLBACK_PATIENTS;
  const critical = patients.filter(p=>p.risk_tier==="CRITICAL").length;
  const high = patients.filter(p=>p.risk_tier==="HIGH").length;
  const avgScore = patients.length ? Math.round(patients.reduce((a,p)=>a+p.risk_score,0)/patients.length) : 0;
  const activeAlerts = patients.filter(p=>p.alert_active);
  const auditCoverage = getAuditCoverage(activeAlerts, patients);
  const continuityProtected = activeAlerts.filter(p => p.last_staff_checkin || p.last_action_at || p.audit_status === "documented").length;
  const counselorOptions = ["All", ...Array.from(new Set(patients.map((patient, index) => getPatientOwner(patient, index)).filter(Boolean)))];

  const filtered = patients.filter(p=>{
    if (filter==="All") return true;
    if (["Critical","High","Moderate","Low"].includes(filter)) return p.risk_tier===filter.toUpperCase();
    return p.level_of_care===filter;
  }).filter((p, index) => counselorFilter === "All" || getPatientOwner(p, index) === counselorFilter)
    .sort((a,b)=> sortMode === "velocity" ? (b.velocity||0)-(a.velocity||0) : (b.risk_score||0)-(a.risk_score||0));

  async function runRiskScore(patient = selected || activeAlerts[0] || patients[0]) {
    if (!patient) return;
    setSelected(patient);
    setScoreStatus("scoring");
    setScoreResult(null);
    setScoreError("");

    try {
      const result = await censusGuardAdapter.scorePatient(buildVertexRiskPayload(patient));
      setScoreResult({ patient, result });
      setScoreStatus("complete");
      setScoreRuns((runs) => [
        {
          id: `score-${Date.now()}`,
          patientName: patient.name,
          patientId: patient.id,
          status: "complete",
          resultLabel: formatScoreResult(result),
          createdAt: new Date().toISOString(),
          source: "Vertex AI",
        },
        ...runs,
      ].slice(0, 8));
    } catch (error) {
      const message = error?.message || "Risk score request failed.";
      setScoreError(message);
      setScoreStatus("error");
      setScoreRuns((runs) => [
        {
          id: `score-${Date.now()}`,
          patientName: patient.name,
          patientId: patient.id,
          status: "error",
          resultLabel: message,
          createdAt: new Date().toISOString(),
          source: "Vertex AI",
        },
        ...runs,
      ].slice(0, 8));
    }
  }

  function stageUploadFiles(files) {
    const accepted = Array.from(files || []).map((file) => ({
      id: `${file.name}-${file.lastModified}`,
      name: file.name,
      size: file.size,
      type: file.type || "unknown",
      status: "Staged for cleaning",
      createdAt: new Date().toISOString(),
    }));
    setStagedFiles((current) => [...accepted, ...current].slice(0, 8));
  }

  return (
    <div style={{minHeight:"100vh",backgroundColor:"#07070F",color:"#fff",fontFamily:"'Inter','Segoe UI',sans-serif"}}>

      {/* Header */}
      <div style={{padding:isMobile?"12px 16px":"16px 32px",borderBottom:"1px solid #1a1a2e",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <div aria-label="CensusGuard shield" style={{width:40,height:40,borderRadius:8,border:"1px solid #10D8F055",background:"linear-gradient(135deg,#071a24,#120a24)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 18px #10D8F022",fontSize:22,fontWeight:900,color:"#10D8F0"}}>
            CG
          </div>
          <div>
            <div style={{fontWeight:900,fontSize:18,letterSpacing:1}}>CensusGuard Infinity System<span style={{color:"#D4159A"}}>™</span></div>
            <div style={{fontSize:11,color:"#555",letterSpacing:2}}>CLOSED-LOOP INTERVENTION INTELLIGENCE</div>
          </div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          <SearchBar patients={patients} onSelect={p=>{setSelected(p);navigate("/dashboard");}}/>
          {!isMobile && <span style={{backgroundColor:"#10D8F022",color:"#10D8F0",border:"1px solid #10D8F033",fontSize:11,fontWeight:700,padding:"4px 12px",borderRadius:2,letterSpacing:1}}>REAL-TIME SCORING ACTIVE · {apiStatus === "connected" ? "API CONNECTED" : apiStatus === "loading" ? "CONNECTING API" : "AWAITING DATA SOURCE"}</span>}
          {!isMobile && <span style={{backgroundColor:"#8844E822",color:"#b98cff",border:"1px solid #8844E833",fontSize:11,fontWeight:700,padding:"4px 12px",borderRadius:2,letterSpacing:1}}>TRIGGER: STAFF CHECK-IN</span>}
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))",gap:0,borderBottom:"1px solid #1a1a2e"}}>
        {[
          ["TOTAL PATIENTS", patients.length, "#fff"],
          ["OPEN ALERTS", activeAlerts.length, "#D4159A"],
          ["CRITICAL", critical, "#D4159A"],
          ["HIGH RISK", high, "#ff6b35"],
          ["AVG RISK SCORE", avgScore, "#f0c040"],
          ["AUDIT COV.", `${auditCoverage}%`, auditCoverage >= 90 ? "#10D8F0" : "#f0c040"],
          ["CONTINUITY PROTECTED", continuityProtected, "#10D8F0"],
        ].map(([label,val,color])=>(
          <div key={label} style={{padding:"12px 8px",borderRight:"1px solid #1a1a2e",borderBottom:"1px solid #1a1a2e",textAlign:"center"}}>
            <div style={{fontSize:10,color:"#444",letterSpacing:2,marginBottom:4}}>{label}</div>
            <div style={{fontSize:isMobile?18:28,fontWeight:900,color}}>{val}</div>
          </div>
        ))}
      </div>

      {/* Main Areas */}
      <div style={{display:"flex",gap:8,padding:isMobile?"10px 14px":"12px 32px",borderBottom:"1px solid #1a1a2e",overflowX:"auto",WebkitOverflowScrolling:"touch",backgroundColor:"#09091a"}}>
        {NAV_AREAS.map(({id,label})=>(
          <button key={id} onClick={()=>goToSection(id)} style={{background:tab===id?"#111125":"transparent",border:`1px solid ${tab===id?"#D4159A55":"#1a1a2e"}`,color:tab===id?"#fff":"#777",padding:"9px 14px",cursor:"pointer",fontSize:12,fontWeight:800,letterSpacing:.5,borderRadius:4,whiteSpace:"nowrap"}}>
            {label}{id==="alerts"&&activeAlerts.length>0&&<span style={{marginLeft:8,backgroundColor:"#D4159A",color:"#fff",borderRadius:"50%",width:18,height:18,fontSize:10,fontWeight:900,display:"inline-flex",alignItems:"center",justifyContent:"center"}}>{activeAlerts.length}</span>}
          </button>
        ))}
      </div>

      <div style={{padding:isMobile?"16px 14px":"24px 32px"}}>
        <ClosedLoopCommandCenter
          patients={patients}
          activeAlerts={activeAlerts}
          auditCoverage={auditCoverage}
          currentStage={currentLoopStage}
          onStageSelect={goToLoopStage}
        />

        <div style={{border:"1px solid #10D8F033",borderLeft:"3px solid #10D8F0",background:"linear-gradient(135deg,#071a241f,#0a0a181f)",borderRadius:6,padding:isMobile?"14px":"16px 18px",marginBottom:18,display:"flex",alignItems:isMobile?"stretch":"center",justifyContent:"space-between",gap:14,flexDirection:isMobile?"column":"row"}}>
          <div>
            <div style={{fontSize:10,letterSpacing:2,color:"#10D8F0",fontWeight:900,marginBottom:5}}>VERTEX RISK SCORING</div>
            <div style={{fontSize:15,color:"#fff",fontWeight:900}}>
              {selected ? `Ready to rescore ${selected.name}` : activeAlerts[0] ? `Ready to rescore highest alert: ${activeAlerts[0].name}` : "Ready to run a CensusGuard risk score"}
            </div>
            <div style={{fontSize:12,color:"#777",lineHeight:1.5,marginTop:5}}>
              Sends one patient through the secure Cloud Run bridge to Vertex AI. No browser-side Google credentials.
            </div>
            <div style={{fontSize:11,color:"#666",lineHeight:1.5,marginTop:7}}>
              Last run: <span style={{color:"#fff",fontWeight:900}}>{formatRunTime(scoreRuns[0]?.createdAt)}</span>
              {scoreRuns[0]?.patientName && <span> for <span style={{color:"#10D8F0",fontWeight:900}}>{scoreRuns[0].patientName}</span></span>}
            </div>
            {scoreStatus === "complete" && scoreResult && (
              <div style={{fontSize:12,color:"#10D8F0",fontWeight:900,marginTop:8}}>
                {scoreResult.patient.name}: {formatScoreResult(scoreResult.result)}
              </div>
            )}
            {scoreStatus === "error" && (
              <div style={{fontSize:12,color:"#D4159A",fontWeight:900,marginTop:8}}>
                Score failed: {scoreError}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => runRiskScore()}
            disabled={scoreStatus === "scoring" || !patients.length}
            style={{backgroundColor:scoreStatus === "scoring" ? "#1a1a2e" : "#10D8F0",border:"1px solid #10D8F0",borderRadius:4,color:scoreStatus === "scoring" ? "#777" : "#02030a",padding:"11px 16px",fontSize:12,fontWeight:1000,letterSpacing:1,cursor:scoreStatus === "scoring" ? "wait" : "pointer",whiteSpace:"nowrap",boxShadow:scoreStatus === "scoring" ? "none" : "0 0 22px #10D8F033"}}
          >
            {scoreStatus === "scoring" ? "SCORING..." : "RUN RISK SCORE"}
          </button>
        </div>

        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)",gap:14,marginBottom:22}}>
          <div style={{backgroundColor:"#0a0a18",border:"1px solid #1a1a2e",borderRadius:6,padding:16}}>
            <div style={{fontSize:10,letterSpacing:2,color:"#10D8F0",fontWeight:900,marginBottom:8}}>DATA INTAKE</div>
            <div style={{fontSize:13,color:"#fff",fontWeight:900,marginBottom:6}}>Upload new patient/source files</div>
            <div style={{fontSize:12,color:"#777",lineHeight:1.55,marginBottom:12}}>
              Files are staged first. CensusGuard should clean, map, and review columns before sending rows to Vertex.
            </div>
            <label style={{display:"block",border:"1px dashed #10D8F066",borderRadius:5,padding:"14px 12px",cursor:"pointer",backgroundColor:"#05050c",textAlign:"center"}}>
              <input
                type="file"
                multiple
                accept=".csv,.xlsx,.xls,.json,.pdf,.doc,.docx,.txt"
                onChange={(event) => stageUploadFiles(event.target.files)}
                style={{display:"none"}}
              />
              <span style={{fontSize:12,color:"#10D8F0",fontWeight:900,letterSpacing:1}}>CHOOSE FILES TO STAGE</span>
            </label>
            <div style={{display:"grid",gap:7,marginTop:12}}>
              {stagedFiles.length === 0 && <div style={{fontSize:11,color:"#555"}}>No files staged yet.</div>}
              {stagedFiles.map((file) => (
                <div key={file.id} style={{border:"1px solid #1a1a2e",borderRadius:4,padding:"8px 9px",backgroundColor:"#05050c"}}>
                  <div style={{fontSize:12,color:"#fff",fontWeight:800,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{file.name}</div>
                  <div style={{fontSize:10,color:"#777",marginTop:3}}>{file.status} · {Math.max(1, Math.round(file.size / 1024))} KB</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{backgroundColor:"#0a0a18",border:"1px solid #1a1a2e",borderRadius:6,padding:16}}>
            <div style={{fontSize:10,letterSpacing:2,color:"#D4159A",fontWeight:900,marginBottom:8}}>SHIFT SCORING RULES</div>
            <div style={{fontSize:13,color:"#fff",fontWeight:900,marginBottom:6}}>When should risk scores run?</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:12}}>
              <label style={{fontSize:10,color:"#666",letterSpacing:1,fontWeight:900}}>
                DAY START
                <input type="time" value={alertSettings.dayShiftStart} onChange={(event)=>setAlertSettings({...alertSettings,dayShiftStart:event.target.value})} style={{width:"100%",marginTop:5,backgroundColor:"#05050c",border:"1px solid #2a2a3e",borderRadius:4,color:"#fff",padding:"8px"}} />
              </label>
              <label style={{fontSize:10,color:"#666",letterSpacing:1,fontWeight:900}}>
                NIGHT START
                <input type="time" value={alertSettings.nightShiftStart} onChange={(event)=>setAlertSettings({...alertSettings,nightShiftStart:event.target.value})} style={{width:"100%",marginTop:5,backgroundColor:"#05050c",border:"1px solid #2a2a3e",borderRadius:4,color:"#fff",padding:"8px"}} />
              </label>
            </div>
            <label style={{display:"block",fontSize:10,color:"#666",letterSpacing:1,fontWeight:900,marginTop:10}}>
              DAY FREQUENCY
              <select value={alertSettings.dayFrequency} onChange={(event)=>setAlertSettings({...alertSettings,dayFrequency:event.target.value})} style={{width:"100%",marginTop:5,backgroundColor:"#05050c",border:"1px solid #2a2a3e",borderRadius:4,color:"#fff",padding:"8px"}}>
                <option value="start-only">Start of shift only</option>
                <option value="start-and-q4">Start + every 4 hours</option>
                <option value="start-and-q2">Start + every 2 hours</option>
                <option value="manual">Manual only</option>
              </select>
            </label>
            <label style={{display:"block",fontSize:10,color:"#666",letterSpacing:1,fontWeight:900,marginTop:10}}>
              NIGHT FREQUENCY
              <select value={alertSettings.nightFrequency} onChange={(event)=>setAlertSettings({...alertSettings,nightFrequency:event.target.value})} style={{width:"100%",marginTop:5,backgroundColor:"#05050c",border:"1px solid #2a2a3e",borderRadius:4,color:"#fff",padding:"8px"}}>
                <option value="start-only">Start of shift only</option>
                <option value="start-and-q4">Start + every 4 hours</option>
                <option value="start-and-q2">Start + every 2 hours</option>
                <option value="manual">Manual only</option>
              </select>
            </label>
          </div>

          <div style={{backgroundColor:"#0a0a18",border:"1px solid #1a1a2e",borderRadius:6,padding:16}}>
            <div style={{fontSize:10,letterSpacing:2,color:"#f0c040",fontWeight:900,marginBottom:8}}>ALERT DELIVERY</div>
            <div style={{fontSize:13,color:"#fff",fontWeight:900,marginBottom:6}}>How should alerts fire?</div>
            {[
              ["sendEmail", "Email care team"],
              ["sendPush", "Push notification"],
              ["sendShiftDigest", "Start-of-shift digest"],
              ["criticalImmediate", "Critical alerts immediately"],
            ].map(([key,label]) => (
              <label key={key} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,borderBottom:"1px solid #111125",padding:"10px 0",fontSize:12,color:"#ddd",fontWeight:800}}>
                {label}
                <input type="checkbox" checked={Boolean(alertSettings[key])} onChange={(event)=>setAlertSettings({...alertSettings,[key]:event.target.checked})} />
              </label>
            ))}
            <div style={{fontSize:11,color:"#777",lineHeight:1.55,marginTop:10}}>
              Backend hook next: create scheduled jobs per facility, then send alerts through approved email and mobile/push providers.
            </div>
          </div>
        </div>

        {/* Patient Monitor */}
        {tab==="monitor" && (
          <div>
            <SectionHeader
              eyebrow="CLINICAL COMMAND CENTER"
              title="Patient Monitor"
              copy="Risk-sorted census view for same-shift intervention: who needs attention, who owns it, why they triggered, and what staff should document next."
              action={
                <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                  <label style={{display:"flex",alignItems:"center",gap:8,fontSize:11,color:"#666",letterSpacing:1,fontWeight:800}}>
                    TIER / LOC
                    <select value={filter} onChange={e=>setFilter(e.target.value)} style={{backgroundColor:"#0a0a18",border:"1px solid #2a2a3e",borderRadius:4,color:"#fff",padding:"8px 34px 8px 10px",fontSize:12,fontWeight:800,letterSpacing:.5}}>
                      {FILTER_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </label>
                  <label style={{display:"flex",alignItems:"center",gap:8,fontSize:11,color:"#666",letterSpacing:1,fontWeight:800}}>
                    COUNSELOR
                    <select value={counselorFilter} onChange={e=>setCounselorFilter(e.target.value)} style={{backgroundColor:"#0a0a18",border:"1px solid #2a2a3e",borderRadius:4,color:"#fff",padding:"8px 34px 8px 10px",fontSize:12,fontWeight:800,letterSpacing:.5,maxWidth:190}}>
                      {counselorOptions.map(counselor => <option key={counselor} value={counselor}>{counselor}</option>)}
                    </select>
                  </label>
                  <button
                    type="button"
                    onClick={()=>setSortMode(mode => mode === "risk" ? "velocity" : "risk")}
                    style={{backgroundColor:sortMode==="velocity"?"#D4159A22":"#0a0a18",border:`1px solid ${sortMode==="velocity"?"#D4159A66":"#2a2a3e"}`,borderRadius:4,color:sortMode==="velocity"?"#D4159A":"#888",padding:"8px 12px",fontSize:12,fontWeight:900,letterSpacing:.5,cursor:"pointer"}}
                  >
                    SORT: {sortMode === "velocity" ? "VELOCITY" : "RISK"}
                  </button>
                </div>
              }
            />

            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead>
                  <tr style={{borderBottom:"1px solid #1a1a2e"}}>
                    {["Patient","Owner","Unit","Room","Day","Substance","Risk Score","Tier","Velocity","Trend","Last Staff Check-in","Guided Intervention","Flags"].map(h=>(
                      <th key={h} style={{padding:"8px 12px",textAlign:"left",fontSize:10,color:"#444",letterSpacing:1,fontWeight:700,whiteSpace:"nowrap"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {!filtered.length && (
                    <tr>
                      <td colSpan={13} style={{padding:"28px 16px",textAlign:"center",color:"#777",borderBottom:"1px solid #111125"}}>
                        <div style={{fontSize:12,letterSpacing:2,color:"#10D8F0",fontWeight:900,marginBottom:8}}>AWAITING LIVE PATIENT DATA</div>
                        <div style={{fontSize:13,lineHeight:1.6}}>
                          The dashboard shell is running. CensusGuard is waiting for the Cloud Run API, Vertex scoring feed, or facility patient source to return records.
                        </div>
                      </td>
                    </tr>
                  )}
                  {filtered.map(p=>{
                    const c = TIER_COLOR[p.risk_tier]||"#555";
                    const isSelected = selected?.id === p.id;
                    const owner = getPatientOwner(p);
                    const risingFast = (p.velocity || 0) > 1.5;
                    return (
                      <tr key={p.id} onClick={()=>setSelected(isSelected?null:p)} style={{borderBottom:"1px solid #0d0d1a",cursor:"pointer",backgroundColor:isSelected?TIER_BG[p.risk_tier]||"#0d0d1a":"transparent",boxShadow:risingFast?`inset 4px 0 0 ${c}, inset 0 0 18px ${c}18`:"none"}}
                        onMouseEnter={e=>!isSelected&&(e.currentTarget.style.backgroundColor="#0d0d1a")}
                        onMouseLeave={e=>!isSelected&&(e.currentTarget.style.backgroundColor="transparent")}>
                        <td style={{padding:"10px 12px",fontWeight:700,color:"#fff"}}><PatientNameAction patient={p} onOpen={setSelected} compact /></td>
                        <td style={{padding:"10px 12px",color:"#10D8F0",fontWeight:800,whiteSpace:"nowrap"}}>{owner}</td>
                        <td style={{padding:"10px 12px",color:"#888"}}>{p.unit}</td>
                        <td style={{padding:"10px 12px",color:"#555"}}>{p.room_number||"—"}</td>
                        <td style={{padding:"10px 12px",color:"#888"}}>{p.length_of_stay}</td>
                        <td style={{padding:"10px 12px",color:"#666",fontSize:11}}>{SUBSTANCE_MAP[p.substance_encoded]||"—"}</td>
                        <td style={{padding:"10px 12px"}}><span style={{fontSize:22,fontWeight:900,color:c}}>{p.risk_score}</span></td>
                        <td style={{padding:"10px 12px"}}><TierBadge tier={p.risk_tier}/></td>
                        <td style={{padding:"10px 12px"}}><VelocityChip v={p.velocity}/></td>
                        <td style={{padding:"10px 12px"}}><MiniSparkline up={p.velocity>0}/></td>
                        <td style={{padding:"10px 12px",whiteSpace:"nowrap"}}>
                          {p.last_staff_checkin ? (
                            <div>
                              <div style={{fontSize:10,color:"#10D8F0",fontWeight:700}}>? Staff</div>
                              <div style={{fontSize:10,color:"#555"}}>{new Date(p.last_staff_checkin).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</div>
                            </div>
                          ) : <span style={{color:"#333",fontSize:11}}>—</span>}
                        </td>
                        <td style={{padding:"10px 12px",color:"#888",fontSize:11,lineHeight:1.45,minWidth:260}}>{getGuidedIntervention(p)}</td>
                        <td style={{padding:"10px 12px"}}>
                          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                            {p.alert_active&&<span style={{backgroundColor:"#D4159A22",color:"#D4159A",fontSize:10,padding:"2px 6px",borderRadius:2,fontWeight:700}}>ALERT</span>}
                            {p.cliff_window&&<span style={{backgroundColor:"#f0c04022",color:"#f0c040",fontSize:10,padding:"2px 6px",borderRadius:2}}>CLIFF</span>}
                            {p.calm_before_storm_flag&&<span style={{backgroundColor:"#8844E822",color:"#8844E8",fontSize:10,padding:"2px 6px",borderRadius:2}}>CBS</span>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Patient detail now shown as modal overlay */}
          </div>
        )}

        {/* Census Floor */}
        {tab==="census" && (
          <div>
            <SectionHeader
              eyebrow="FACILITY VIEW"
              title="Census Floor"
              copy="Spatial risk map for room-level proximity, smoker clusters, peer contagion, and unit drill-down."
            />
            {/* Patient detail shown as modal overlay */}
            <CensusFloorMap patients={patients} onSelectPatient={p=>{setSelected(p);}}/>
          </div>
        )}

        {/* Staff Cross-Check */}
        {tab==="staff" && (
          <StaffCrossCheckPanel patients={patients} onSelectPatient={setSelected}/>
        )}

        {/* Psych / Providers */}
        {tab==="psych" && (
          <PsychProviderPanel patients={patients} onSelectPatient={setSelected}/>
        )}

        {/* Group Flow */}
        {tab==="flow" && (
          <div>
            <SectionHeader
              eyebrow="COHORT DYNAMICS"
              title="Cohort Flow"
              copy="Forecast layer for group-level risk, treatment-stage movement, and emerging contagion patterns."
            />
            <GroupProgressFlow patients={patients}/>
            <GroupNarrativePanel mode={mode}/>
          </div>
        )}

        {/* Active Alerts */}
        {tab==="alerts" && (
          <div>
            <SectionHeader
              eyebrow={`ACTIVE CLINICAL ALERTS (${activeAlerts.length})`}
              title="Alert Queue"
              copy="Prioritized clinical alerts with forecast context and staff-triggered rescore details."
            />
            {!activeAlerts.length && <div style={{color:"#555",fontSize:14,textAlign:"center",padding:40}}>No active alerts</div>}
            {activeAlerts.map(p=>{
              const c = TIER_COLOR[p.risk_tier]||"#555";
              return (
                <div
                  key={p.id}
                  onClick={() => setSelected(p)}
                  style={{backgroundColor:"#0a0a18",border:`1px solid ${c}44`,borderLeft:`3px solid ${c}`,borderRadius:4,padding:"16px 20px",marginBottom:12,cursor:"pointer"}}
                  onMouseEnter={(event) => { event.currentTarget.style.boxShadow = `0 0 22px ${c}22`; }}
                  onMouseLeave={(event) => { event.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8,flexWrap:"wrap",gap:8}}>
                    <div>
                      <div style={{fontWeight:900,fontSize:15,color:"#fff",marginBottom:4}}>{p.name}</div>
                      <div style={{fontSize:11,color:"#555"}}>Day {p.length_of_stay} · {p.level_of_care} · Room {p.room_number}</div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:32,fontWeight:900,color:c}}>{p.risk_score}</span>
                      <TierBadge tier={p.risk_tier}/>
                    </div>
                  </div>
                  <div style={{fontSize:12,color:"#D4159A",fontWeight:700,marginBottom:6}}>{p.alert_reason}</div>
                  <div style={{fontSize:11,color:"#10D8F0",marginBottom:8}}>? Triggered by Staff Check-in {p.last_staff_checkin ? "at " + new Date(p.last_staff_checkin).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) : ""}</div>
                  <button
                    onClick={(event)=>{event.stopPropagation();navigate("/dashboard");setSelected(p);}}
                    style={{backgroundColor:"#D4159A",border:"none",color:"#fff",padding:"6px 16px",borderRadius:2,cursor:"pointer",fontSize:11,fontWeight:700}}
                  >
                    View Patient
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Outcomes */}
        {tab==="outcomes" && (
          <OutcomesPanel patients={patients} activeAlerts={activeAlerts} continuityProtected={continuityProtected} auditCoverage={auditCoverage}/>
        )}

        {/* MOUD Continuity */}
        {tab==="moud" && (
          <div>
            <MOUDContinuityPanel patients={patients} onSelectPatient={setSelected} isMobile={isMobile}/>
          </div>
        )}
      </div>

      {/* Patient Detail Modal */}
      {selected && (
        <div
          onClick={()=>{setSelected(null);setDrawerFullscreen(false);}}
          style={{position:"fixed",inset:0,backgroundColor:"rgba(0,0,0,0.75)",display:"flex",alignItems:"flex-start",justifyContent:"flex-end",zIndex:500,padding:0}}
        >
          <div
            onClick={e=>e.stopPropagation()}
            style={{
              width:"100vw",maxWidth:drawerFullscreen ? "100vw" : 620,height:"100vh",backgroundColor:"#07070F",
              borderLeft:drawerFullscreen ? "none" : "1px solid #2a2a3e",overflowY:"auto",
              display:"flex",flexDirection:"column",
              boxShadow:"-8px 0 40px rgba(0,0,0,0.6)"
            }}
          >
            {/* Slide-in header */}
            <div style={{padding:"16px 20px",borderBottom:"1px solid #1a1a2e",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,backgroundColor:"#07070F",zIndex:10}}>
              <div>
                <div style={{fontSize:11,color:"#555",letterSpacing:2}}>PATIENT DETAIL</div>
                <Link to={`/patient/${selected.id}`} style={{display:"inline-flex",marginTop:5,color:"#10D8F0",fontSize:11,fontWeight:900,textDecoration:"none",letterSpacing:.8}}>OPEN FULL PATIENT PAGE</Link>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <button
                  type="button"
                  onClick={()=>setDrawerFullscreen(value => !value)}
                  style={{background:"none",border:"1px solid #2a2a3e",color:"#10D8F0",height:30,borderRadius:4,cursor:"pointer",fontSize:11,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 10px",letterSpacing:.8}}
                >
                  {drawerFullscreen ? "COLLAPSE" : "EXPAND"}
                </button>
                <button onClick={()=>{setSelected(null);setDrawerFullscreen(false);}} style={{background:"none",border:"1px solid #2a2a3e",color:"#888",width:30,height:30,borderRadius:"50%",cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>x</button>
              </div>
            </div>
            <div style={{padding:"20px",maxWidth:drawerFullscreen ? 980 : "none",width:"100%",boxSizing:"border-box",alignSelf:drawerFullscreen ? "center" : "auto"}}>
            <PatientDetail
              patient={selected}
              onClose={()=>setSelected(null)}
              mode={mode}
              patients={patients}
              onOpenPatient={setSelected}
              onNavigateStage={goToLoopStage}
            />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function UnifiedPatientProfile({ mode = "dashboard" }) {
  const { id } = useParams();
  const patient = FALLBACK_PATIENTS.find((item) => item.id === id) || null;
  const backTo = "/dashboard";

  return (
    <div style={{minHeight:"100vh",backgroundColor:"#07070F",color:"#fff",fontFamily:"'Inter','Segoe UI',sans-serif",padding:24}}>
      <Link to={backTo} style={{display:"inline-flex",color:"#D4159A",fontWeight:800,fontSize:13,textDecoration:"none",marginBottom:20}}>? Back to dashboard</Link>
      <div style={{maxWidth:720}}>
        <PatientDetail patient={patient} onClose={() => { window.history.length > 1 ? window.history.back() : undefined; }} mode={mode} patients={FALLBACK_PATIENTS} />
      </div>
    </div>
  );
}

export default UnifiedCensusGuard;
