import { useState, useRef } from "react";

const C = {
  mag: "#D4159A",
  pur: "#8844E8",
  cyn: "#10D8F0",
  bg: "#07070F",
  surface: "#0d0d1a",
  border: "#1a1a2e",
  muted: "#555",
};

const PERSONAS = {
  investor: { label: "💰 Investor", color: C.mag, desc: "Pre-seed, skeptical, wants ROI" },
  clinical: { label: "🩺 Clinical Director", color: C.cyn, desc: "Dr. Sylvie type — MAT-focused, wants outcomes" },
  operator: { label: "🏥 Facility Operator", color: C.pur, desc: "CFO/CEO, wants census math" },
  ocast: { label: "🏛️ OCAST Judge", color: "#ff6b35", desc: "Oklahoma grant panel, wants local impact" },
};

const QUESTIONS = {
  investor: [
    {
      q: "So what does CensusGuard actually do? Give me the 30-second version.",
      ideal: "CensusGuard is an AI-driven patient retention platform for behavioral health treatment facilities. It monitors every patient in real time, scores their dropout risk on every BHT check-in, and fires an alert to clinical staff before someone walks out the door. We trained on 952,358 real federal patient episodes. The model catches 80 out of every 100 real AMA dropouts — from Day 1 intake data alone.",
      tips: ["Lead with WHAT it does, not HOW it works.", "Always end with the 80/100 stat — it's visceral.", "Never say 'batch' or '24-hour window' — say REAL-TIME every time."],
      followup: "Okay but there are a lot of health tech tools. Why hasn't this been built before?"
    },
    {
      q: "What's your accuracy and how did you validate it?",
      ideal: "89.6% AUC-ROC, validated on Vertex AI — Google Cloud's enterprise ML platform. We trained on 952,358 real federal SAMHSA patient episodes from 2023 — the largest publicly available SUD outcomes dataset in the US. The model catches 80 out of every 100 real dropout risks. And critically — it predicts from Day 1 intake data. No wearables, no new hardware. We plug into EHR data the facility already captures.",
      tips: ["Say 'Vertex AI' or 'Google Cloud Vertex AI' — not 'gradient boosting' unless asked directly.", "89.6% AUC-ROC. Never say 86.5% — that's the old model.", "The Day 1 intake angle is powerful — use it."],
      followup: "What's your revenue model?"
    },
    {
      q: "What's your revenue model and how big is the market?",
      ideal: "Flat-rate SaaS. Essential tier is $3,500/month for 1–30 beds. Professional is $6,500/month for 31–100 beds. Multi-site starts at $12,000. Every tier gets all features — no gating. TAM is $42B, SAM $8.5B. We're raising $500K pre-seed via SAFE note at an $8–10M valuation cap.",
      tips: ["Don't over-explain the tiers. Say the numbers clearly and move on.", "Always end the money conversation with the raise: $500K, SAFE, $8-10M cap.", "If they ask use of funds: product dev, pilot launch, team, marketing."],
      followup: "Do you have any customers yet?"
    },
    {
      q: "Do you have paying customers or pilots signed?",
      ideal: "Not yet — we're pre-pilot, which is exactly what this raise funds. What we have is a validated model, a live dashboard, a Chief Clinical Advisor signed, and we're presenting at OCAST this week. The pilot is the next milestone. We're targeting a signed facility partner in Q2 2026.",
      tips: ["Don't apologize for being pre-revenue. Own the stage you're at.", "Name what you DO have: model validated, dashboard live, advisor signed, OCAST.", "Q2 2026 pilot target — say it with confidence, not hedging."],
      followup: "Who else is doing this?"
    },
    {
      q: "Who are your competitors and why won't they just copy you?",
      ideal: "Nobody is doing exactly this inside behavioral health treatment facilities. Goldie Health does overdose prevention in the community — outside facilities. We work inside. Most facilities use static discharge risk scores or paper-based observations. Our moat is the model trained on national SAMHSA data, real-time BHT-triggered scoring, and — post-pilot — a cross-facility patient history network that gets smarter with every facility we add.",
      tips: ["Name Goldie Health as adjacent, not competitive — sequential care.", "Don't name competitors you haven't fully researched.", "The network moat (cross-facility history) is Phase 2 — mention it briefly as the long-term moat, don't over-explain."],
      followup: null
    },
  ],
  clinical: [
    {
      q: "I run a MAT program. Why would I need this?",
      ideal: "MAT patients are actually the highest-risk group in our national training data — 56.7% dropout rate, the highest of any patient category. Right now CensusGuard doesn't have a direct MAT medication flag, and I want to be transparent about that. That's the first feature we're adding in the next version. But even without it, the model is catching patterns in the data that correlate with MAT dropout — things like referral source, geography, admission history. Your input on what the MAT flag should look like clinically would be invaluable.",
      tips: ["Lead with the MAT stat — she'll respect that you know it.", "Own the missing flag. Don't hide it — turn it into a reason she's needed.", "End by making her a co-architect, not just an advisor."],
      followup: "How does it actually work day to day for my staff?"
    },
    {
      q: "How does my staff actually use this? They're already overwhelmed.",
      ideal: "That was the core design constraint. Your staff doesn't change anything they do. BHTs do their check-ins exactly as they do now — CensusGuard runs in the background. The only thing that changes is they see a dashboard with risk tiers, and they get an alert when someone crosses a threshold. The alert tells them who, what the risk is, and what the top drivers are. One screen, one decision. No new hardware, no new workflows.",
      tips: ["Emphasize NO new workflows, NO new hardware — say it clearly.", "BHTs do what they already do. That's the key.", "One screen, one decision — keep it simple."],
      followup: "What does an alert actually look like?"
    },
    {
      q: "Is this clinically validated?",
      ideal: "We've validated the model mathematically on 952,358 federal patient episodes — 89.6% accuracy. Clinical validation through a live facility pilot is the next step, which is exactly what we're building toward. I won't say 'clinically validated' without that citation. What I'll say is: the model is built on real outcomes data from real patients, and we're looking for the right clinical partner to take it into the field.",
      tips: ["NEVER say 'clinically validated' without a citation — you don't have one yet.", "Mathematical validation is real. Own it.", "Turn it into an invitation — you're looking for the right clinical partner."],
      followup: null
    },
  ],
  operator: [
    {
      q: "Make the business case. Why should I spend $6,500 a month on this?",
      ideal: "Let's do the math together. A 30-bed residential facility losing just 4 patients a month to AMA at $15,000 a stay is $60,000 a month walking out the door. CensusGuard at $6,500 a month, if it prevents even 2 of those discharges, pays for itself in the first week. Most facilities are losing far more than 4 patients. 1 in 3 patients leaves before completing treatment — nationally. In Oklahoma it's nearly 1 in 2.",
      tips: ["Always start with THEIR numbers — make them do the math in their head.", "1 in 3 nationally. Nearly 1 in 2 in Oklahoma.", "$15K avg stay × patients saved = the ROI. Let it land.", "Don't mention the price again after you say it — move to the math."],
      followup: "What's the implementation process?"
    },
    {
      q: "How long does it take to implement and what do you need from my team?",
      ideal: "Implementation is designed to be as close to zero friction as possible. We connect to your existing EHR via API — we work with Kipu, which most facilities in our market use. Your staff doesn't change their workflow. BHTs do check-ins as normal. We handle the integration. Target go-live is within 30 days of a signed agreement.",
      tips: ["Zero friction is the message.", "Kipu EHR, 41 APIs — name it, it signals you've done the work.", "30 days to go-live — say it confidently."],
      followup: null
    },
  ],
  ocast: [
    {
      q: "Tell us about the Oklahoma connection. Why does this matter for our state?",
      ideal: "Oklahoma's AMA rate is 49.9% — nearly 1 in 2 SUD patients leaves treatment before it can save them. The national average is 34.1%. We are 46% above the national average. We built CensusGuard here, in Moore, Oklahoma, trained on data that includes 8,760 real Oklahoma patient episodes. This is an Oklahoma-sized problem and we are building the Oklahoma solution.",
      tips: ["49.9% Oklahoma vs 34.1% national — have these numbers cold.", "46% above national average — that's the hook.", "Moore, Oklahoma. Built here. Say it with pride.", "8,760 Oklahoma episodes in the training data — that's local credibility."],
      followup: "How does this align with Oklahoma's healthcare priorities?"
    },
    {
      q: "How does CensusGuard align with Oklahoma's opioid crisis response?",
      ideal: "The $12.1 billion National Opioid Settlement legally requires states to spend those funds on proven intervention strategies. Treatment retention is one of the core mandated outcomes — patients who complete treatment are dramatically less likely to overdose. CensusGuard directly addresses that mandate. We're not asking Oklahoma to fund an experiment. We're asking Oklahoma to fund the infrastructure that makes the money they're already receiving actually work.",
      tips: ["$12.1B National Opioid Settlement — governments are legally required to spend this on exactly this problem.", "Don't say 'experiment' — say 'infrastructure.'", "This isn't a nice-to-have. It's the mechanism that makes their existing investment work."],
      followup: null
    },
  ],
};

const PITCH_SCRIPT = [
  {
    label: "THE HOOK",
    color: C.mag,
    timing: "0:00 – 0:30",
    note: "Say this before anything else. No slides. Eye contact.",
    lines: [
      { speaker: "YOU", text: "1 in 3 patients in behavioral health treatment will leave before it's complete. In Oklahoma, it's nearly 1 in 2. That's not a statistic — that's a person who was trying to get better, and the system didn't catch them in time." },
      { speaker: "PAUSE", text: "Let that land. Don't rush." },
      { speaker: "YOU", text: "I know what that feels like. I've been that person. And I built CensusGuard because that should never happen again." },
    ]
  },
  {
    label: "THE PROBLEM",
    color: C.pur,
    timing: "0:30 – 1:00",
    note: "One breath. Don't over-explain.",
    lines: [
      { speaker: "YOU", text: "Treatment facilities lose patients every single day — AMA discharges, walkaways, premature completions. The tools they have right now are observation notes and gut instinct. By the time staff realizes someone is about to leave, they're already gone." },
      { speaker: "YOU", text: "The 30 days after an AMA discharge carry 10 times the overdose risk. 77% of patients who leave early are not abstinent at one year. This is a life-or-death retention problem and nobody is solving it with technology." },
    ]
  },
  {
    label: "THE SOLUTION",
    color: C.cyn,
    timing: "1:00 – 2:00",
    note: "This is where you slow down. Let them visualize it.",
    lines: [
      { speaker: "YOU", text: "CensusGuard is an AI-driven patient retention platform. It monitors every patient in real time — no wearables, no new hardware, no workflow changes for staff. It plugs directly into the EHR data facilities already capture." },
      { speaker: "YOU", text: "Every time a behavioral health technician does a check-in, CensusGuard re-scores that patient's dropout risk. 29 variables. Real time. The moment the data shifts, the score shifts." },
      { speaker: "YOU", text: "When someone crosses a threshold — the clinical team gets an alert. Not a report the next morning. Right now. While the patient is still in the building." },
    ]
  },
  {
    label: "THE MODEL",
    color: C.mag,
    timing: "2:00 – 2:30",
    note: "Confident. These numbers are validated. Own them.",
    lines: [
      { speaker: "YOU", text: "We trained on 952,358 real federal patient episodes — the SAMHSA Treatment Episode Data Set, the largest SUD outcomes dataset in the country. Validated on Google Cloud Vertex AI." },
      { speaker: "YOU", text: "89.6% AUC-ROC accuracy. And here's the number that matters in the room: the model catches 80 out of every 100 real AMA dropouts before they happen." },
      { speaker: "YOU", text: "And it does that from Day 1 intake data alone — before a single day of treatment passes." },
    ]
  },
  {
    label: "THE OKLAHOMA ANGLE",
    color: "#ff6b35",
    timing: "2:30 – 3:00",
    note: "Use this for OCAST and Oklahoma-specific audiences. Skip or shorten for national investors.",
    lines: [
      { speaker: "YOU", text: "Oklahoma's AMA rate is 49.9%. The national average is 34.1%. We are 46% above the national average. This is not a national problem we're applying to Oklahoma — this is an Oklahoma problem we built the solution for, right here in Moore." },
      { speaker: "YOU", text: "The $12.1 billion National Opioid Settlement legally requires states to fund proven retention interventions. CensusGuard is that infrastructure." },
    ]
  },
  {
    label: "THE ASK",
    color: C.pur,
    timing: "3:00 – 3:30",
    note: "Look them in the eye. Say the numbers clearly. Don't soften it.",
    lines: [
      { speaker: "YOU", text: "We're raising $500,000 pre-seed via SAFE note at an $8 to $10 million valuation cap. That funds product development, our pilot facility launch, and our first clinical hire." },
      { speaker: "YOU", text: "The live demo is running right now at anchorpointhealthsystems.com. I'd love to walk you through it." },
      { speaker: "PAUSE", text: "Then stop talking. Let them ask." },
    ]
  },
  {
    label: "THE CLOSE (if they're warm)",
    color: C.cyn,
    timing: "Optional",
    note: "Only use this if the conversation is flowing and they're leaning in.",
    lines: [
      { speaker: "YOU", text: "I didn't build this from a whiteboard. I built it because I was the patient nobody caught in time. Every facility that deploys CensusGuard is one more place where that doesn't happen to someone else." },
      { speaker: "YOU", text: "I'm not asking you to fund an experiment. I'm asking you to fund the infrastructure that makes everything else in this space actually work." },
    ]
  },
];

export default function Trainer() {
  const [tab, setTab] = useState("script"); // script | train
  const [persona, setPersona] = useState(null);
  const [qIndex, setQIndex] = useState(0);
  const [showIdeal, setShowIdeal] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [mode, setMode] = useState("select");
  const [practiced, setPracticed] = useState([]);
  const [activeSection, setActiveSection] = useState(null);
  const textRef = useRef(null);

  const questions = persona ? QUESTIONS[persona] : [];
  const currentQ = questions[qIndex];

  function startTraining(p) {
    setPersona(p);
    setQIndex(0);
    setShowIdeal(false);
    setShowTips(false);
    setUserAnswer("");
    setSubmitted(false);
    setMode("train");
  }

  function handleSubmit() {
    setSubmitted(true);
    setShowIdeal(true);
    setPracticed(prev => [...prev, persona + "_" + qIndex]);
  }

  function nextQuestion() {
    if (qIndex + 1 < questions.length) {
      setQIndex(qIndex + 1);
      setShowIdeal(false);
      setShowTips(false);
      setUserAnswer("");
      setSubmitted(false);
    } else {
      setMode("done");
    }
  }

  function reset() {
    setPersona(null);
    setQIndex(0);
    setShowIdeal(false);
    setShowTips(false);
    setUserAnswer("");
    setSubmitted(false);
    setMode("select");
  }

  const totalDone = practiced.length;
  const totalQuestions = Object.values(QUESTIONS).flat().length;

  return (
    <div style={{ backgroundColor: C.bg, minHeight: "100vh", fontFamily: "'Inter', sans-serif", color: "#fff" }}>
      {/* Header */}
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: C.mag, boxShadow: `0 0 8px ${C.mag}` }} />
          <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: 2, color: C.mag }}>CENSUSGUARD™</span>
          <span style={{ fontSize: 13, color: C.muted, letterSpacing: 1 }}>PITCH TRAINER</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["script", "train"].map(t => (
            <button key={t} onClick={() => { setTab(t); if (t === "train") reset(); }}
              style={{ backgroundColor: tab === t ? (t === "script" ? C.mag : C.pur) : "transparent", border: `1px solid ${tab === t ? "transparent" : C.border}`, color: tab === t ? "#fff" : "#888", fontSize: 12, fontWeight: 700, padding: "8px 18px", borderRadius: 2, cursor: "pointer", letterSpacing: 1 }}>
              {t === "script" ? "📜 PITCH SCRIPT" : "🎯 Q&A TRAINER"}
            </button>
          ))}
        </div>
      </div>

      {/* OCAST banner */}
      <div style={{ backgroundColor: C.mag + "15", borderBottom: `1px solid ${C.mag}33`, padding: "10px 24px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: C.mag }}>🔥 OCAST INNOVATION EXPO — TOMORROW</span>
        <span style={{ fontSize: 12, color: "#666" }}>·</span>
        <span style={{ fontSize: 12, color: "#888" }}>89.6% AUC-ROC · 80/100 dropouts caught · $500K pre-seed · Vertex AI validated</span>
      </div>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px 24px" }}>

        {/* ═══════════════════════════════════════════════════ */}
        {/* PITCH SCRIPT TAB */}
        {/* ═══════════════════════════════════════════════════ */}
        {tab === "script" && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Your 3-Minute Pitch Script</div>
              <div style={{ fontSize: 14, color: "#888", lineHeight: 1.7 }}>
                This is written in YOUR voice. Read it out loud 3 times today. By the third time you shouldn't need to look at it. Click any section to expand the coaching notes.
              </div>
            </div>

            {/* Full script at a glance */}
            <div style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: "24px 28px", marginBottom: 32 }}>
              <div style={{ fontSize: 11, color: C.cyn, fontWeight: 700, letterSpacing: 2, marginBottom: 16 }}>⚡ QUICK REFERENCE — THE WHOLE THING</div>
              <div style={{ fontSize: 14, color: "#ccc", lineHeight: 2 }}>
                <span style={{ color: C.mag, fontWeight: 700 }}>"1 in 3 patients leaves before treatment is complete. In Oklahoma it's 1 in 2. I was that person. I built CensusGuard because that should never happen again."</span>
                <br /><br />
                <span style={{ color: "#aaa" }}>"CensusGuard is AI-driven patient retention for behavioral health. Real-time risk scoring on every BHT check-in — no wearables, no new hardware, no workflow changes. Plugs into the EHR they already use."</span>
                <br /><br />
                <span style={{ color: C.cyn, fontWeight: 700 }}>"Trained on 952,358 federal patient episodes. 89.6% accuracy on Vertex AI. The model catches 80 out of every 100 real dropouts — from Day 1 intake data alone."</span>
                <br /><br />
                <span style={{ color: "#aaa" }}>"We're raising $500K pre-seed, SAFE note, $8–10M cap. The demo is live. I'd love to walk you through it."</span>
              </div>
            </div>

            {/* Section by section */}
            {PITCH_SCRIPT.map((section, i) => (
              <div key={i} style={{ marginBottom: 16 }}>
                <button
                  onClick={() => setActiveSection(activeSection === i ? null : i)}
                  style={{ width: "100%", backgroundColor: activeSection === i ? section.color + "15" : C.surface, border: `1px solid ${activeSection === i ? section.color + "66" : C.border}`, borderRadius: activeSection === i ? "6px 6px 0 0" : 6, padding: "16px 20px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 3, height: 28, backgroundColor: section.color, borderRadius: 2, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: section.color, letterSpacing: 1 }}>{section.label}</div>
                      <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{section.timing}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 18, color: C.muted }}>{activeSection === i ? "▲" : "▼"}</div>
                </button>

                {activeSection === i && (
                  <div style={{ backgroundColor: section.color + "08", border: `1px solid ${section.color}33`, borderTop: "none", borderRadius: "0 0 6px 6px", padding: "20px 24px" }}>
                    {/* Coaching note */}
                    <div style={{ backgroundColor: section.color + "15", borderLeft: `3px solid ${section.color}`, padding: "10px 16px", borderRadius: "0 4px 4px 0", marginBottom: 20, fontSize: 13, color: section.color, fontWeight: 600 }}>
                      💡 {section.note}
                    </div>

                    {/* Lines */}
                    {section.lines.map((line, j) => (
                      <div key={j} style={{ marginBottom: 16, display: "flex", gap: 16, alignItems: "flex-start" }}>
                        <div style={{ fontSize: 10, fontWeight: 800, color: line.speaker === "PAUSE" ? "#555" : line.speaker === "YOU" ? section.color : C.muted, letterSpacing: 1, minWidth: 48, marginTop: 3, flexShrink: 0 }}>
                          {line.speaker}
                        </div>
                        <div style={{ fontSize: line.speaker === "PAUSE" ? 12 : 15, color: line.speaker === "PAUSE" ? "#555" : "#fff", lineHeight: 1.7, fontStyle: line.speaker === "PAUSE" ? "italic" : "normal", fontWeight: line.speaker === "YOU" ? 500 : 400 }}>
                          {line.speaker === "YOU" ? `"${line.text}"` : `[ ${line.text} ]`}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Numbers cheat sheet */}
            <div style={{ marginTop: 32, backgroundColor: C.surface, borderRadius: 6, padding: "24px 28px", border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 12, color: C.mag, fontWeight: 700, letterSpacing: 1, marginBottom: 16 }}>📌 NUMBERS TO KNOW COLD — SAY THESE WITHOUT THINKING</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  ["89.6%", "AUC-ROC — Vertex AI validated"],
                  ["80 of 100", "Dropouts caught before they leave"],
                  ["952,358", "Federal SAMHSA episodes trained on"],
                  ["49.9%", "Oklahoma AMA rate"],
                  ["34.1%", "National AMA rate (Oklahoma is 46% higher)"],
                  ["56.7%", "MAT patient dropout — highest group"],
                  ["83%", "3rd admission dropout rate"],
                  ["$500K", "Raise — SAFE, $8–10M cap"],
                  ["$6,500/mo", "Professional tier, 31–100 beds"],
                  ["Day 1", "Predicts from intake data alone"],
                  ["10x", "Higher overdose risk after AMA discharge"],
                  ["$12.1B", "National Opioid Settlement — states must spend this"],
                ].map(([num, label]) => (
                  <div key={num} style={{ display: "flex", gap: 12, alignItems: "center", backgroundColor: "#0a0a18", borderRadius: 4, padding: "10px 14px" }}>
                    <div style={{ fontSize: 15, fontWeight: 900, color: C.cyn, minWidth: 80 }}>{num}</div>
                    <div style={{ fontSize: 12, color: "#888" }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA to trainer */}
            <div style={{ marginTop: 24, backgroundColor: C.pur + "15", border: `1px solid ${C.pur}44`, borderRadius: 6, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: C.pur }}>Ready to practice the hard questions?</div>
                <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>Switch to Q&A Trainer — I'll throw real investor and OCAST questions at you.</div>
              </div>
              <button onClick={() => { setTab("train"); reset(); }} style={{ backgroundColor: C.pur, color: "#fff", border: "none", padding: "12px 24px", borderRadius: 2, fontSize: 13, fontWeight: 800, cursor: "pointer", letterSpacing: 1 }}>
                START Q&A TRAINER →
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════ */}
        {/* Q&A TRAINER TAB */}
        {/* ═══════════════════════════════════════════════════ */}
        {tab === "train" && (
          <div>
            {mode === "select" && (
              <div>
                <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Who are you pitching?</div>
                <div style={{ fontSize: 15, color: "#888", marginBottom: 32 }}>Pick your audience. I throw questions. You answer out loud or type it. Then I show you the ideal response and coaching tips.</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {Object.entries(PERSONAS).map(([key, p]) => (
                    <button key={key} onClick={() => startTraining(key)}
                      style={{ backgroundColor: C.surface, border: `1px solid ${p.color}44`, borderRadius: 6, padding: "24px 20px", cursor: "pointer", textAlign: "left" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = p.color}
                      onMouseLeave={e => e.currentTarget.style.borderColor = p.color + "44"}>
                      <div style={{ fontSize: 22, marginBottom: 8 }}>{p.label}</div>
                      <div style={{ fontSize: 13, color: "#aaa" }}>{p.desc}</div>
                      <div style={{ marginTop: 16, fontSize: 11, color: p.color, fontWeight: 700, letterSpacing: 1 }}>
                        {QUESTIONS[key].length} QUESTIONS →
                      </div>
                    </button>
                  ))}
                </div>
                <div style={{ marginTop: 24, padding: "20px", backgroundColor: C.surface, borderRadius: 4, border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 12, color: C.cyn, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>💡 HOW TO USE THIS</div>
                  <div style={{ fontSize: 13, color: "#aaa", lineHeight: 1.8 }}>
                    1. Pick a persona → read the question out loud<br />
                    2. Answer it like you're in the room (type or just say it)<br />
                    3. Hit "Show Ideal Answer" to compare<br />
                    4. Say your answer again — cleaner, faster, no hedging<br />
                    5. Next question
                  </div>
                </div>
              </div>
            )}

            {mode === "train" && currentQ && (
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: PERSONAS[persona].color }}>{PERSONAS[persona].label}</span>
                    <span style={{ fontSize: 12, color: C.muted }}>— {PERSONAS[persona].desc}</span>
                  </div>
                  <div style={{ fontSize: 12, color: C.muted }}>
                    Question <span style={{ color: "#fff", fontWeight: 700 }}>{qIndex + 1}</span> of {questions.length}
                  </div>
                </div>

                <div style={{ backgroundColor: "#111", borderRadius: 2, height: 4, marginBottom: 32 }}>
                  <div style={{ backgroundColor: PERSONAS[persona].color, height: 4, borderRadius: 2, width: `${(qIndex / questions.length) * 100}%`, transition: "width 0.3s" }} />
                </div>

                <div style={{ backgroundColor: C.surface, border: `1px solid ${PERSONAS[persona].color}44`, borderRadius: 6, padding: "24px 28px", marginBottom: 24 }}>
                  <div style={{ fontSize: 11, color: PERSONAS[persona].color, fontWeight: 700, letterSpacing: 2, marginBottom: 12 }}>THEY ASK:</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", lineHeight: 1.5 }}>"{currentQ.q}"</div>
                </div>

                {!submitted && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 12, color: C.muted, letterSpacing: 1, marginBottom: 10 }}>YOUR ANSWER (type it or practice out loud, then hit Show):</div>
                    <textarea
                      ref={textRef}
                      value={userAnswer}
                      onChange={e => setUserAnswer(e.target.value)}
                      placeholder="Type your answer here... or just practice out loud and click Show Ideal Answer"
                      style={{ width: "100%", minHeight: 120, backgroundColor: "#0a0a18", border: `1px solid ${C.border}`, borderRadius: 4, color: "#fff", fontSize: 14, padding: "14px 16px", resize: "vertical", fontFamily: "inherit", lineHeight: 1.6, boxSizing: "border-box" }}
                    />
                    <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                      <button onClick={handleSubmit} style={{ backgroundColor: PERSONAS[persona].color, color: "#fff", border: "none", padding: "12px 28px", borderRadius: 2, fontSize: 13, fontWeight: 800, cursor: "pointer", letterSpacing: 1 }}>
                        SHOW IDEAL ANSWER
                      </button>
                      <button onClick={() => setShowTips(!showTips)} style={{ backgroundColor: "transparent", border: `1px solid ${C.border}`, color: "#888", padding: "12px 20px", borderRadius: 2, fontSize: 12, cursor: "pointer", letterSpacing: 1 }}>
                        {showTips ? "HIDE TIPS" : "QUICK TIPS"}
                      </button>
                    </div>
                  </div>
                )}

                {showTips && !submitted && (
                  <div style={{ backgroundColor: C.cyn + "11", border: `1px solid ${C.cyn}33`, borderRadius: 4, padding: "16px 20px", marginBottom: 20 }}>
                    <div style={{ fontSize: 11, color: C.cyn, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>COACHING TIPS:</div>
                    {currentQ.tips.map((tip, i) => (
                      <div key={i} style={{ fontSize: 13, color: "#ccc", marginBottom: 6, paddingLeft: 12, borderLeft: `2px solid ${C.cyn}` }}>{tip}</div>
                    ))}
                  </div>
                )}

                {submitted && (
                  <div>
                    {userAnswer && (
                      <div style={{ backgroundColor: "#ffffff08", border: `1px solid ${C.border}`, borderRadius: 4, padding: "16px 20px", marginBottom: 16 }}>
                        <div style={{ fontSize: 11, color: C.muted, letterSpacing: 1, marginBottom: 8 }}>YOUR ANSWER:</div>
                        <div style={{ fontSize: 14, color: "#aaa", lineHeight: 1.6 }}>{userAnswer}</div>
                      </div>
                    )}
                    <div style={{ backgroundColor: C.mag + "11", border: `1px solid ${C.mag}44`, borderRadius: 4, padding: "20px 24px", marginBottom: 16 }}>
                      <div style={{ fontSize: 11, color: C.mag, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>✓ IDEAL ANSWER:</div>
                      <div style={{ fontSize: 15, color: "#fff", lineHeight: 1.7, fontStyle: "italic" }}>"{currentQ.ideal}"</div>
                    </div>
                    <div style={{ backgroundColor: C.cyn + "11", border: `1px solid ${C.cyn}33`, borderRadius: 4, padding: "16px 20px", marginBottom: 24 }}>
                      <div style={{ fontSize: 11, color: C.cyn, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>COACHING NOTES:</div>
                      {currentQ.tips.map((tip, i) => (
                        <div key={i} style={{ fontSize: 13, color: "#ccc", marginBottom: 8, display: "flex", gap: 10, alignItems: "flex-start" }}>
                          <span style={{ color: C.cyn, fontWeight: 700, flexShrink: 0 }}>→</span>
                          <span>{tip}</span>
                        </div>
                      ))}
                    </div>
                    {currentQ.followup && (
                      <div style={{ backgroundColor: PERSONAS[persona].color + "11", border: `1px solid ${PERSONAS[persona].color}33`, borderRadius: 4, padding: "14px 18px", marginBottom: 24 }}>
                        <div style={{ fontSize: 11, color: PERSONAS[persona].color, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>LIKELY FOLLOW-UP:</div>
                        <div style={{ fontSize: 14, color: "#ccc", fontStyle: "italic" }}>"{currentQ.followup}"</div>
                        <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>→ Next question covers this</div>
                      </div>
                    )}
                    <button onClick={nextQuestion} style={{ backgroundColor: PERSONAS[persona].color, color: "#fff", border: "none", padding: "14px 32px", borderRadius: 2, fontSize: 13, fontWeight: 800, cursor: "pointer", letterSpacing: 1 }}>
                      {qIndex + 1 < questions.length ? "NEXT QUESTION →" : "FINISH THIS PERSONA ✓"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {mode === "done" && (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔥</div>
                <div style={{ fontSize: 32, fontWeight: 900, marginBottom: 12 }}>
                  {PERSONAS[persona].label} — <span style={{ color: C.mag }}>Done.</span>
                </div>
                <div style={{ fontSize: 16, color: "#888", marginBottom: 40, maxWidth: 500, margin: "0 auto 40px" }}>
                  Now do it without looking. Say every answer out loud one more time — clean, confident, no hedging.
                </div>
                <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
                  <button onClick={() => startTraining(persona)} style={{ backgroundColor: C.mag, color: "#fff", border: "none", padding: "14px 28px", borderRadius: 2, fontSize: 13, fontWeight: 800, cursor: "pointer", letterSpacing: 1 }}>
                    RUN IT AGAIN
                  </button>
                  <button onClick={reset} style={{ backgroundColor: "transparent", border: `1px solid ${C.border}`, color: "#888", padding: "14px 28px", borderRadius: 2, fontSize: 13, fontWeight: 800, cursor: "pointer", letterSpacing: 1 }}>
                    TRY ANOTHER PERSONA
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
