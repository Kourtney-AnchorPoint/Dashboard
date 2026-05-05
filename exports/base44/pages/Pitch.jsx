import { useState } from "react";

const LOGO = "https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/c3d5295ac_CensusGuard_banner_logo.png";
const LOGO_ICON = "https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/5c09bbffd_image4.png";

const C = {
  mag: "#D4159A",
  pur: "#8844E8",
  cyn: "#10D8F0",
  bg: "#07070F",
  card: "#0d0d1a",
  border: "#1a1a2e",
  muted: "#555",
  sub: "#888",
};

function Slide({ children, style = {} }) {
  return (
    <div style={{
      minHeight: "100vh", width: "100%", backgroundColor: C.bg, color: "#fff",
      fontFamily: "'Inter','Segoe UI',sans-serif", display: "flex",
      flexDirection: "column", justifyContent: "center", padding: "60px 80px",
      boxSizing: "border-box", position: "relative", ...style
    }}>
      {children}
    </div>
  );
}

function Label({ children, color = C.mag }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 3, color, marginBottom: 16, textTransform: "uppercase" }}>
      {children}
    </div>
  );
}

function H1({ children, style = {} }) {
  return <div style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.1, color: "#fff", marginBottom: 20, ...style }}>{children}</div>;
}

function H2({ children, style = {} }) {
  return <div style={{ fontSize: 36, fontWeight: 900, lineHeight: 1.2, color: "#fff", marginBottom: 16, ...style }}>{children}</div>;
}

function Body({ children, style = {} }) {
  return <div style={{ fontSize: 17, color: "#aaa", lineHeight: 1.8, ...style }}>{children}</div>;
}

function Card({ children, style = {}, accent = C.border }) {
  return (
    <div style={{
      backgroundColor: C.card, border: `1px solid ${accent}`,
      borderRadius: 6, padding: "24px 28px", ...style
    }}>
      {children}
    </div>
  );
}

function StatBox({ label, value, sub, color = C.cyn }) {
  return (
    <Card style={{ textAlign: "center", flex: 1 }}>
      <div style={{ fontSize: 11, color: C.muted, letterSpacing: 2, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 42, fontWeight: 900, color, lineHeight: 1, marginBottom: 6 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: C.muted }}>{sub}</div>}
    </Card>
  );
}

function Divider({ color = C.mag }) {
  return <div style={{ width: 60, height: 3, backgroundColor: color, borderRadius: 2, marginBottom: 32 }} />;
}

function NavDot({ active, onClick }) {
  return (
    <div onClick={onClick} style={{
      width: active ? 24 : 8, height: 8, borderRadius: 4,
      backgroundColor: active ? C.mag : C.border,
      cursor: "pointer", transition: "all 0.3s"
    }} />
  );
}

const SLIDES = [
  // 1 — Title
  () => (
    <Slide style={{ alignItems: "center", textAlign: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: `radial-gradient(ellipse at 30% 50%, ${C.mag}11 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, ${C.pur}11 0%, transparent 60%)`, pointerEvents: "none" }} />
      <img src={LOGO} alt="CensusGuard" style={{ height: 80, objectFit: "contain", marginBottom: 32, maxWidth: 700 }} />
      <div style={{ fontSize: 20, color: C.cyn, fontWeight: 600, letterSpacing: 3, marginBottom: 40 }}>
        AI-DRIVEN PATIENT RETENTION FOR BEHAVIORAL HEALTH ORGANIZATIONS
      </div>
      <div style={{ width: 80, height: 2, background: `linear-gradient(90deg, ${C.mag}, ${C.pur})`, borderRadius: 2, marginBottom: 40 }} />
      <Body style={{ fontSize: 18, color: "#888", maxWidth: 500 }}>
        "See the signs before the shift."
      </Body>
      <div style={{ marginTop: 32, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <span style={{ backgroundColor: C.cyn + "22", color: C.cyn, border: `1px solid ${C.cyn}44`, fontSize: 11, fontWeight: 700, padding: "6px 16px", borderRadius: 2, letterSpacing: 1 }}>✓ VERTEX AI VALIDATED · 89.6% AUC-ROC</span>
        <span style={{ backgroundColor: C.mag + "22", color: C.mag, border: `1px solid ${C.mag}44`, fontSize: 11, fontWeight: 700, padding: "6px 16px", borderRadius: 2, letterSpacing: 1 }}>80 OF EVERY 100 DROPOUTS CAUGHT</span>
      </div>
      <div style={{ marginTop: 28, fontSize: 13, color: C.muted, letterSpacing: 2 }}>
        ANCHORPOINT HEALTH SYSTEMS · PRE-SEED · APRIL 2026 · CONFIDENTIAL
      </div>
    </Slide>
  ),

  // 2 — Human Story
  () => (
    <Slide>
      <Label color={C.mag}>THE WHY</Label>
      <Divider />
      <H1>Built by someone who<br /><span style={{ color: C.mag }}>needed it to exist.</span></H1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginTop: 16 }}>
        <div>
          <Body>
            Our founder didn't build CensusGuard from a whiteboard. She built it from lived experience inside the behavioral health system — as a patient, as a survivor, and as a single mom who watched the system fail the people she loved.
          </Body>
          <div style={{ marginTop: 28 }}>
            <Body>
              She knows what it feels like when the system doesn't catch you in time. She knows the 30-day window after an AMA discharge. She knows what a missed intervention costs — not in dollars, but in lives.
            </Body>
          </div>
          <div style={{ marginTop: 28 }}>
            <Body style={{ color: "#fff", fontStyle: "italic", fontSize: 19, lineHeight: 1.6 }}>
              "I built this company because the system that was supposed to save my life almost killed me. Now I'm using AI to make sure nobody else falls through the cracks."
            </Body>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            ["10×", "Higher overdose risk within 30 days of an AMA discharge", C.mag],
            ["1 in 3", "Patients leave SUD treatment before it can save them", C.pur],
            ["77%", "Less likely to be abstinent at one year if they leave early", C.cyn],
            ["#1", "Drug overdose is the leading cause of death for Americans 18–45", "#ff6b35"],
          ].map(([stat, text, color]) => (
            <Card key={stat} accent={color + "44"} style={{ display: "flex", gap: 20, alignItems: "center", padding: "16px 20px" }}>
              <div style={{ fontSize: 32, fontWeight: 900, color, minWidth: 80, textAlign: "center" }}>{stat}</div>
              <div style={{ fontSize: 13, color: "#aaa", lineHeight: 1.5 }}>{text}</div>
            </Card>
          ))}
        </div>
      </div>
    </Slide>
  ),

  // 3 — The Problem
  () => (
    <Slide>
      <Label color="#ff6b35">THE PROBLEM</Label>
      <Divider color="#ff6b35" />
      <H1>1 in 3 patients leave before<br /><span style={{ color: "#ff6b35" }}>treatment can save them.</span></H1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginTop: 16 }}>
        <div>
          <Body>By the time a patient says "I'm checking out," the clinical window has already closed. Facilities are fighting dropouts reactively — at the door — instead of catching the signals days earlier when intervention is still possible.</Body>
          <div style={{ marginTop: 28 }}>
            <div style={{ fontSize: 13, color: C.muted, letterSpacing: 2, marginBottom: 16 }}>THE HUMAN COST</div>
            {[
              ["10× higher overdose risk", "within 30 days of leaving AMA — PMC/NCBI HR 10.1"],
              ["77% less likely to be abstinent", "at one year vs. program completers — Vista Research, n=27,000"],
              ["3× more likely to be using", "one year later if left AMA — Raynes et al."],
              ["40–60% leave early", "up to 80% in some settings — Journal of Dual Diagnosis 2025"],
            ].map(([bold, rest]) => (
              <div key={bold} style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "flex-start" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#ff6b35", marginTop: 8, flexShrink: 0 }} />
                <div style={{ fontSize: 14, color: "#aaa", lineHeight: 1.6 }}><span style={{ color: "#fff", fontWeight: 700 }}>{bold}</span> {rest}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 13, color: C.muted, letterSpacing: 2, marginBottom: 16 }}>THE BUSINESS COST</div>
          {[
            ["$820B", "Addiction costs the US economy annually", "#ff6b35"],
            ["Lost revenue", "Every AMA = lost census, failed outcome, readmission cost to payers", C.mag],
            ["Payer penalties", "Insurers increasingly penalizing facilities for high readmission rates", C.pur],
            ["Zero visibility", "Facilities have NO real-time signal for who is about to leave", C.cyn],
          ].map(([title, desc, color]) => (
            <Card key={title} accent={color + "33"} style={{ marginBottom: 12, padding: "14px 18px" }}>
              <div style={{ fontSize: 15, fontWeight: 800, color, marginBottom: 4 }}>{title}</div>
              <div style={{ fontSize: 13, color: "#888", lineHeight: 1.5 }}>{desc}</div>
            </Card>
          ))}
        </div>
      </div>
    </Slide>
  ),

  // 4 — Why Current Solutions Fail
  () => (
    <Slide>
      <Label color={C.pur}>THE GAP</Label>
      <Divider color={C.pur} />
      <H1>Every current solution fails<br /><span style={{ color: C.pur }}>for the same reason.</span></H1>
      <Body style={{ maxWidth: 600, marginBottom: 40 }}>They all tell you what already happened. None of them tell you what's coming.</Body>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {[
          ["Gut Feeling", "Relies on overextended staff intuition — inconsistent, unscalable, undocumented"],
          ["Batch Reports", "24-hour lag. Patient already left by the time you see the data"],
          ["Weekly Meetings", "7-day cycles miss the critical 48-hour intervention window entirely"],
          ["Paper Assessments", "Static scoring. No real-time behavioral signals. Filed and forgotten"],
          ["EHR Dashboards", "Descriptive, not predictive. Tells you what happened — not what's coming"],
          ["Manual Check-Ins", "Dependent on staff bandwidth. Every missed round is a missed signal"],
        ].map(([title, desc]) => (
          <Card key={title} accent={C.pur + "33"} style={{ borderTop: `3px solid ${C.pur}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ color: "#ff6b35", fontSize: 16 }}>✕</span>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{title}</div>
            </div>
            <div style={{ fontSize: 13, color: "#888", lineHeight: 1.6 }}>{desc}</div>
          </Card>
        ))}
      </div>
      <div style={{ marginTop: 32, backgroundColor: C.mag + "11", border: `1px solid ${C.mag}44`, borderRadius: 6, padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontSize: 24 }}>💡</span>
        <div style={{ fontSize: 16, color: "#fff", fontWeight: 600 }}>The gap isn't care. It's <span style={{ color: C.mag }}>real-time intelligence</span> — knowing who needs intervention <em>before</em> they're at the door.</div>
      </div>
    </Slide>
  ),

  // 5 — The Solution
  () => (
    <Slide>
      <Label color={C.cyn}>THE SOLUTION</Label>
      <Divider color={C.cyn} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
        <div>
          <H1>Real-time RPM<br /><span style={{ color: C.cyn }}>for the patients most likely to leave.</span></H1>
          <Body>CensusGuard™ is an AI-driven patient retention platform purpose-built for behavioral health. It monitors every patient continuously, scores dropout risk in real time, and alerts clinical teams the moment someone is heading toward the door — while they're still in the building.</Body>
          <div style={{ marginTop: 28 }}>
            <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 3, backgroundColor: C.cyn, borderRadius: 2, flexShrink: 0 }} />
              <div style={{ fontSize: 15, color: "#aaa" }}>Category: <span style={{ color: "#fff", fontWeight: 700 }}>AI-Driven Patient Retention</span></div>
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 3, backgroundColor: C.mag, borderRadius: 2, flexShrink: 0 }} />
              <div style={{ fontSize: 15, color: "#aaa" }}>Primary outcome: <span style={{ color: "#fff", fontWeight: 700 }}>Census protection + patient retention</span></div>
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 3, backgroundColor: C.pur, borderRadius: 2, flexShrink: 0 }} />
              <div style={{ fontSize: 15, color: "#aaa" }}>Market: <span style={{ color: "#fff", fontWeight: 700 }}>$175B+ RPM — behavioral health massively underserved</span></div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ width: 3, backgroundColor: "#10D8F0", borderRadius: 2, flexShrink: 0 }} />
              <div style={{ fontSize: 15, color: "#aaa" }}>Integration: <span style={{ color: "#fff", fontWeight: 700 }}>Plugs into your existing EHR — zero new hardware</span></div>
            </div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 13, color: C.muted, letterSpacing: 2, marginBottom: 16 }}>WHY RPM — NOT JUST ANOTHER HEALTH APP</div>
          {[
            [C.mag, "Federally Recognized", "RPM is an established, billable care category — not a wellness app. CensusGuard operates in a regulated, reimbursable lane."],
            [C.pur, "Zero New Hardware", "No wearables. No devices. CensusGuard plugs directly into the EHR data your team already captures. Nothing new to buy, nothing new to learn."],
            [C.cyn, "Revenue Metric", "Retention = census = revenue. Every operator tracks it. CensusGuard speaks the language of the CFO, not just the clinical director."],
            ["#10D8F0", "Underserved Category", "RPM is a $175B+ market. Behavioral health has almost zero purpose-built RPM solutions. We can own it."],
          ].map(([color, title, desc]) => (
            <Card key={title} accent={color + "44"} style={{ marginBottom: 14, borderLeft: `3px solid ${color}` }}>
              <div style={{ fontSize: 14, fontWeight: 800, color, marginBottom: 6 }}>{title}</div>
              <div style={{ fontSize: 13, color: "#888", lineHeight: 1.5 }}>{desc}</div>
            </Card>
          ))}
        </div>
      </div>
    </Slide>
  ),

  // 6 — How It Works
  () => (
    <Slide>
      <Label color={C.mag}>HOW IT WORKS</Label>
      <Divider />
      <H2>Four steps. Real-time. Every check-in.</H2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20, marginTop: 24 }}>
        {[
          [C.cyn, "01", "INGEST", "Connects to your EHR via HIPAA-compliant API. Data flows continuously. No manual entry. No batch uploads. Zero staff training required.", "Kipu EHR · 41 APIs · GCP Vertex AI"],
          [C.pur, "02", "SCORE", "AI scores every patient against 952,358 federal SAMHSA episodes. 29 risk features weighted in real time. Gradient Boosting Classifier v3.", "89.6% AUC-ROC · 29 features · Real-time"],
          [C.mag, "03", "ALERT", "The moment a patient crosses a risk threshold, clinical staff get an immediate priority alert through the live dashboard. No delay. No batch.", "4 risk tiers · Instant push · HIPAA Compliant"],
          ["#ff6b35", "04", "INTERVENE", "Armed with real-time data, clinicians act during the CensusGuard Window — saving the census and, more importantly, the patient.", "Audit trail · Intervention log · Outcome tracking"],
        ].map(([color, num, title, desc, sub]) => (
          <div key={num} style={{ position: "relative" }}>
            <div style={{ position: "absolute", top: -8, left: -8, fontSize: 64, fontWeight: 900, color: color + "11", lineHeight: 1, userSelect: "none" }}>{num}</div>
            <Card accent={color + "55"} style={{ borderTop: `3px solid ${color}`, position: "relative", height: "100%", boxSizing: "border-box" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color, letterSpacing: 2, marginBottom: 10 }}>{title}</div>
              <div style={{ fontSize: 13, color: "#aaa", lineHeight: 1.7, marginBottom: 14 }}>{desc}</div>
              <div style={{ fontSize: 11, color: C.muted, borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>{sub}</div>
            </Card>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 32, display: "flex", gap: 16, flexWrap: "wrap" }}>
        {[
          ["REAL-TIME", "Scores fire on every BHT check-in. Never batch. Never 24-hour.", C.cyn],
          ["HIPAA COMPLIANT", "GCP Vertex AI — HIPAA-eligible infrastructure from day one.", C.pur],
          ["ZERO FRICTION", "No staff training. No workflow changes. Plug into your existing EHR.", C.mag],
        ].map(([title, desc, color]) => (
          <div key={title} style={{ flex: 1, minWidth: 200, backgroundColor: color + "11", border: `1px solid ${color}33`, borderRadius: 4, padding: "12px 16px" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color, letterSpacing: 2, marginBottom: 4 }}>{title}</div>
            <div style={{ fontSize: 12, color: "#888" }}>{desc}</div>
          </div>
        ))}
      </div>
    </Slide>
  ),

  // 7 — The Dashboard
  () => (
    <Slide>
      <Label color={C.cyn}>THE PRODUCT</Label>
      <Divider color={C.cyn} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }}>
        <div>
          <H2>A live command center<br /><span style={{ color: C.cyn }}>for your clinical team.</span></H2>
          <Body style={{ marginBottom: 28 }}>The CensusGuard dashboard is fully built and live. Not a mockup. Not a wireframe. A real, functioning product your staff could use tomorrow.</Body>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              ["Patient Risk Monitor", "Every patient scored, ranked, filterable by tier and unit"],
              ["Real-Time Alerts", "Critical alerts fire instantly — no missed intervention windows"],
              ["Score History Timeline", "Full trajectory with delta, drivers, and alert flags"],
              ["Clinical Audit Trail", "Log every intervention — staff, action, outcome, follow-up"],
              ["Group Cohesion", "Unit-level dynamics, peer proximity, smoker cluster warnings"],
              ["Census Floor View", "Detox / Residential / PHP breakdown at a glance"],
            ].map(([title, desc]) => (
              <div key={title} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", backgroundColor: C.mag + "22", border: `1px solid ${C.mag}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: C.mag }} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{title}</div>
                  <div style={{ fontSize: 12, color: "#888" }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 28, display: "flex", gap: 12 }}>
            <a href="/demo" target="_blank" style={{ display: "inline-block", backgroundColor: C.mag, color: "#fff", padding: "12px 24px", borderRadius: 4, fontWeight: 800, fontSize: 13, textDecoration: "none", letterSpacing: 1 }}>
              EXPLORE LIVE DEMO →
            </a>
          </div>
        </div>
        <div>
          {/* Dashboard preview mockup */}
          <div style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
            <div style={{ backgroundColor: "#0a0a18", padding: "10px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#ff5f57" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#ffbd2e" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#28c840" }} />
              <div style={{ fontSize: 11, color: C.muted, marginLeft: 8 }}>CensusGuard™ · Live Dashboard</div>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: C.cyn }} />
                <span style={{ fontSize: 10, color: C.cyn, fontWeight: 700 }}>REAL-TIME</span>
              </div>
            </div>
            <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
              {[["PATIENTS","24","#fff"],["CRITICAL","3",C.mag],["HIGH","5","#ff6b35"],["AVG SCORE","61","#f0c040"]].map(([l,v,c])=>(
                <div key={l} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 9, color: C.muted, letterSpacing: 1 }}>{l}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: c }}>{v}</div>
                </div>
              ))}
            </div>
            {[
              ["Sarah M.", "91", "CRITICAL", "#D4159A", "Female + Non-rx Methadone · Cliff Window"],
              ["James T.", "78", "HIGH", "#ff6b35", "⚡ Calm-before-storm · 2nd Admission"],
              ["Marcus D.", "72", "HIGH", "#ff6b35", "Day 18 cliff window · Pain 8/10"],
              ["Destiny R.", "61", "MODERATE", "#f0c040", "Methamphetamine · Unemployed"],
              ["Kevin P.", "44", "MODERATE", "#f0c040", "Alcohol · Court Referral (protective)"],
              ["Robert C.", "22", "LOW", "#10D8F0", "Alcohol · Full-time employed"],
            ].map(([name,score,tier,color,signal])=>(
              <div key={name} style={{ display: "grid", gridTemplateColumns: "1fr 48px 90px 2fr", gap: 8, padding: "8px 16px", borderBottom: `1px solid #111`, alignItems: "center" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{name}</div>
                <div style={{ fontSize: 20, fontWeight: 900, color }}>{score}</div>
                <span style={{ background: color+"22", color, border: `1px solid ${color}44`, fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 2, letterSpacing: 1 }}>{tier}</span>
                <div style={{ fontSize: 10, color: "#666" }}>{signal}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Slide>
  ),

  // 8 — The Model
  () => (
    <Slide>
      <Label color={C.pur}>THE MODEL</Label>
      <Divider color={C.pur} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
        <div>
          <H2>Built on nearly<br /><span style={{ color: C.pur }}>1 million federal cases.</span></H2>
          <Body style={{ marginBottom: 28 }}>Not proprietary facility data. Not a small sample. CensusGuard was trained on 952,358 real federal patient episodes from the SAMHSA Treatment Episode Data Set — the largest publicly available SUD outcomes dataset in the United States.</Body>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              ["Model", "Vertex AI AutoML (validated)", C.pur],
              ["Training Data", "952,358 SAMHSA TEDS 2023 episodes", C.cyn],
              ["ROC AUC", "89.6% (Vertex AI validated)", C.mag],
              ["PR AUC", "90.1%", C.pur],
              ["Recall", "80.3% of dropouts caught", C.cyn],
              ["Precision", "80.3%", C.mag],
              ["Features", "29 risk features per patient", C.pur],
              ["Scoring", "Real-time — every BHT check-in", C.cyn],
            ].map(([label, value, color]) => (
              <Card key={label} accent={color + "33"} style={{ padding: "12px 16px" }}>
                <div style={{ fontSize: 10, color: C.muted, letterSpacing: 1, marginBottom: 4 }}>{label.toUpperCase()}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{value}</div>
              </Card>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 13, color: C.muted, letterSpacing: 2, marginBottom: 16 }}>TOP PREDICTIVE SIGNALS</div>
          {[
            ["Substance Type", 27.9, C.mag],
            ["Level of Care", 27.5, C.pur],
            ["Length of Stay", 26.9, C.cyn],
            ["Prior Treatment History", 8.2, "#ff6b35"],
            ["Housing Status", 4.1, "#aaa"],
            ["Employment Status", 3.4, "#888"],
          ].map(([label, pct, color]) => (
            <div key={label} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: "#aaa" }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color }}>{pct}%</span>
              </div>
              <div style={{ backgroundColor: "#111", borderRadius: 2, height: 6 }}>
                <div style={{ backgroundColor: color, height: 6, borderRadius: 2, width: `${pct * 3}%`, transition: "width 0.5s" }} />
              </div>
            </div>
          ))}
          <div style={{ marginTop: 24, fontSize: 13, color: C.muted, letterSpacing: 2, marginBottom: 12 }}>HIGH-RISK CLINICAL PATTERNS</div>
          {[
            ["3rd Admission", "Auto HIGH tier — 83% historical dropout rate", "#ff6b35"],
            ["Female + Non-rx Methadone", "55.4% combined dropout risk", C.mag],
            ["Cliff Windows", "Day 8-14 Detox · Day 15-21 Residential · Day 35+ PHP", C.pur],
          ].map(([title, desc, color]) => (
            <div key={title} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
              <div style={{ width: 3, height: 36, backgroundColor: color, borderRadius: 2, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{title}</div>
                <div style={{ fontSize: 12, color: "#888" }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Slide>
  ),

  // 9 — Market
  () => (
    <Slide>
      <Label color={C.cyn}>MARKET OPPORTUNITY</Label>
      <Divider color={C.cyn} />
      <H2>A <span style={{ color: C.cyn }}>$175B+ market</span> with almost<br />no purpose-built solution.</H2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginTop: 24 }}>
        <div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 32 }}>
            {[
              ["RPM Market", "$175B+", "and growing — behavioral health is the most underserved segment", C.cyn],
              ["TAM", "$42B", "Total behavioral health SUD treatment market", C.mag],
              ["SAM", "$8.5B", "Facilities with infrastructure to adopt RPM technology", C.pur],
              ["SOM", "$500M", "Realistically capturable in years 1–5", "#10D8F0"],
            ].map(([label, value, desc, color]) => (
              <div key={label} style={{ display: "flex", gap: 20, alignItems: "center" }}>
                <div style={{ minWidth: 80, textAlign: "right" }}>
                  <div style={{ fontSize: 10, color: C.muted, letterSpacing: 1 }}>{label}</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color }}>{value}</div>
                </div>
                <div style={{ flex: 1, height: 1, backgroundColor: color + "33", position: "relative" }}>
                  <div style={{ position: "absolute", right: 0, top: -4, width: 8, height: 8, borderRadius: "50%", backgroundColor: color }} />
                </div>
                <div style={{ fontSize: 12, color: "#888", maxWidth: 240 }}>{desc}</div>
              </div>
            ))}
          </div>
          <Card accent={C.cyn + "33"} style={{ borderLeft: `3px solid ${C.cyn}` }}>
            <div style={{ fontSize: 13, color: C.cyn, fontWeight: 800, marginBottom: 8 }}>WHY NOW</div>
            <div style={{ fontSize: 13, color: "#aaa", lineHeight: 1.7 }}>
              48.4 million US adults have a substance use disorder. Nearly 1 in 6 Americans. Federal investment in behavioral health is accelerating. RPM reimbursement is expanding. And no one has built the retention layer — until now.
            </div>
          </Card>
        </div>
        <div>
          <div style={{ fontSize: 13, color: C.muted, letterSpacing: 2, marginBottom: 16 }}>THE BILLING ADVANTAGE</div>
          <Card accent={C.mag + "44"} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.mag, marginBottom: 12 }}>Plug In. Go. That's it.</div>
            {[
              ["EHR API", "Connects to your existing EHR — no new hardware, no new workflows"],
              ["Real-Time", "Scores on every BHT check-in — always current, never batch"],
              ["Live in Days", "Not months. If you're on Kipu EHR, you can be up and running fast"],
            ].map(([code, desc]) => (
              <div key={code} style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                <span style={{ backgroundColor: C.mag + "22", color: C.mag, fontSize: 12, fontWeight: 800, padding: "2px 10px", borderRadius: 2, flexShrink: 0 }}>{code}</span>
                <span style={{ fontSize: 13, color: "#aaa" }}>{desc}</span>
              </div>
            ))}
            <div style={{ marginTop: 12, fontSize: 13, color: "#fff", fontWeight: 600, lineHeight: 1.6 }}>
              Facilities can bill insurance for using CensusGuard — offsetting or eliminating the subscription cost entirely.
            </div>
          </Card>
          <Card accent={C.pur + "44"}>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.pur, marginBottom: 8 }}>Competitive Landscape</div>
            <div style={{ fontSize: 13, color: "#aaa", lineHeight: 1.7 }}>No direct competitor offers real-time, AI-driven patient retention monitoring purpose-built for behavioral health. General EHR vendors are descriptive. General health tech platforms weren't built for SUD. The AI-driven behavioral health retention category is ours to define.</div>
          </Card>
        </div>
      </div>
    </Slide>
  ),


  // 10 — Opioid Abatement Funds (NEW DISTRIBUTION CHANNEL)
  () => (
    <Slide>
      <Label color="#ff6b35">DISTRIBUTION STRATEGY</Label>
      <Divider color="#ff6b35" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
        <div>
          <H2>$50B Opioid Abatement Funds —<br /><span style={{ color: "#ff6b35" }}>A Second Distribution Channel.</span></H2>
          <Body style={{ marginBottom: 20 }}>
            National opioid settlements from Purdue Pharma, Johnson & Johnson, and major distributors created $50B+ in mandated SUD funding across all 50 states. Every state has an abatement committee actively deploying these dollars right now — and they are <span style={{ color: "#fff", fontWeight: 700 }}>required by law to fund evidence-based solutions only.</span>
          </Body>
          <Body>
            CensusGuard qualifies. Trained on 952,358 federal SAMHSA episodes. 89.6% AUC-ROC accuracy. HIPAA Compliant. Directly addresses treatment retention — one of the core mandated outcomes in every state abatement plan.
          </Body>
          <Card accent="#ff6b3544" style={{ marginTop: 28, borderLeft: "3px solid #ff6b35" }}>
            <div style={{ fontSize: 15, fontWeight: 900, color: "#fff", fontStyle: "italic", lineHeight: 1.6 }}>
              "This is not a grant strategy. It is a <span style={{ color: "#ff6b35" }}>distribution deal disguised as public funding.</span>"
            </div>
          </Card>
        </div>
        <div>
          <div style={{ fontSize: 13, color: C.muted, letterSpacing: 2, marginBottom: 20 }}>TWO REVENUE CHANNELS</div>
          <Card accent={C.mag + "44"} style={{ marginBottom: 16, borderLeft: "3px solid " + C.mag }}>
            <div style={{ fontSize: 12, color: C.mag, fontWeight: 800, letterSpacing: 2, marginBottom: 8 }}>CHANNEL 1 — DIRECT SAAS</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 6 }}>$3,500 – $12,000/mo</div>
            <div style={{ fontSize: 13, color: "#888", lineHeight: 1.6 }}>Direct sales to behavioral health facilities. Essential / Professional / Multi-Site tiers. Recurring SaaS revenue. Standard enterprise sales motion.</div>
          </Card>
          <Card accent="#ff6b3544" style={{ marginBottom: 24, borderLeft: "3px solid #ff6b35" }}>
            <div style={{ fontSize: 12, color: "#ff6b35", fontWeight: 800, letterSpacing: 2, marginBottom: 8 }}>CHANNEL 2 — STATE ABATEMENT COMMITTEES</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 6 }}>1 State = Multiple Facilities</div>
            <div style={{ fontSize: 13, color: "#888", lineHeight: 1.6 }}>State abatement committees fund CensusGuard AND mandate its deployment inside their contracted facilities. One state deal is a distribution agreement — not a single sale.</div>
          </Card>
          <div style={{ fontSize: 12, color: C.muted, letterSpacing: 2, marginBottom: 10 }}>HIGH-PRIORITY STATES</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {["Texas","California","Florida","New York","Ohio","Pennsylvania","West Virginia","Oklahoma","Tennessee","Michigan"].map(state => (
              <span key={state} style={{ backgroundColor: "#ff6b3522", border: "1px solid #ff6b3544", color: "#ff6b35", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 2 }}>{state}</span>
            ))}
          </div>
        </div>
      </div>
    </Slide>
  ),

  // 11 — Business Model
  () => (
    <Slide>
      <Label color={C.mag}>BUSINESS MODEL</Label>
      <Divider />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
        <div>
          <H2>Recurring SaaS.<br /><span style={{ color: C.mag }}>All features. No gating.</span></H2>
          <Body style={{ marginBottom: 28 }}>Every tier gets every feature. No stripped-down entry plans. No upsell traps. Pricing reflects facility size — not artificial feature walls.</Body>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              ["ESSENTIAL", "$3,500", "/month", "1–30 beds", C.cyn, "All features included · Full API access"],
              ["PROFESSIONAL", "$6,500", "/month", "31–100 beds", C.mag, "All features included · Full API access"],
              ["MULTI-SITE", "$12,000+", "/month", "100+ beds", C.pur, "All features included · Multi-site management"],
            ].map(([tier, price, per, beds, color, note]) => (
              <Card key={tier} accent={color + "55"} style={{ borderLeft: `4px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px" }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color, letterSpacing: 2 }}>{tier}</div>
                  <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>{beds}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{note}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 28, fontWeight: 900, color }}>{price}</span>
                  <span style={{ fontSize: 13, color: C.muted }}>{per}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 13, color: C.muted, letterSpacing: 2, marginBottom: 16 }}>REVENUE PROJECTIONS</div>
          <Card accent={C.cyn + "33"} style={{ marginBottom: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, textAlign: "center" }}>
              {[["Year 1", "3 pilots", "$235K ARR", C.cyn],["Year 2", "15 facilities", "$1.2M ARR", C.mag],["Year 3", "50 facilities", "$3.9M ARR", C.pur]].map(([yr, fac, arr, color])=>(
                <div key={yr}>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>{yr}</div>
                  <div style={{ fontSize: 13, color: "#aaa", marginBottom: 4 }}>{fac}</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color }}>{arr}</div>
                </div>
              ))}
            </div>
          </Card>
          <Card accent={C.mag + "44"} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.mag, marginBottom: 8 }}>RPM Billing Offset</div>
            <div style={{ fontSize: 13, color: "#aaa", lineHeight: 1.7 }}>CensusGuard uses the data your team already captures. No wearables, no devices, no new staff training. The barrier to adoption is as low as we could possibly make it — because we know facilities don't have time for complicated rollouts.</div>
          </Card>
          <Card accent={C.pur + "44"}>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.pur, marginBottom: 8 }}>Unit Economics</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[["CAC (est.)", "$800–$1,200"],["LTV (5yr avg)", "$132,000"],["Gross Margin","~85%"],["Payback Period","~4 months"]].map(([l,v])=>(
                <div key={l}>
                  <div style={{ fontSize: 10, color: C.muted, letterSpacing: 1 }}>{l}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>{v}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Slide>
  ),

  // 12 — Traction
  () => (
    <Slide>
      <Label color={C.cyn}>TRACTION</Label>
      <Divider color={C.cyn} />
      <H2>Built, live, and<br /><span style={{ color: C.cyn }}>already in motion.</span></H2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginTop: 16 }}>
        <div>
          <div style={{ fontSize: 13, color: C.muted, letterSpacing: 2, marginBottom: 16 }}>FOUNDATION</div>
          {[
            ["✓", "AnchorPoint Health Systems LLC formed — Moore, Oklahoma", "March 2026", C.cyn],
            ["✓", "EIN secured · Mercury business bank account active", "March 2026", C.cyn],
            ["✓", "Website live — anchorpointhealthsystems.com", "April 2026", C.cyn],
            ["✓", "CensusGuard dashboard fully built and live", "April 2026", C.mag],
            ["✓", "Public demo available — request access at anchorpointhealthsystems.com", "April 2026", C.mag],
            ["✓", "Dr. Nixi Cat DO signed as Chief Clinical Advisor", "April 2026", C.pur],
          ].map(([icon, text, date, color]) => (
            <div key={text} style={{ display: "flex", gap: 12, marginBottom: 10, alignItems: "flex-start" }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", backgroundColor: color + "22", border: `1px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 10, color, fontWeight: 900, marginTop: 2 }}>{icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: "#fff" }}>{text}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{date}</div>
              </div>
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 13, color: C.muted, letterSpacing: 2, marginBottom: 16 }}>MOMENTUM</div>
          {[
            ["✓", "NVIDIA Inception — application submitted", C.cyn],
            ["✓", "Snowflake Accelerate — application submitted", C.cyn],
            ["✓", "i2E Concept Fund — pitch completed", C.cyn],
            ["✓", "OK Catalyst — pitch completed", C.cyn],
            ["✓", "gener8tor gBETA — pitch completed", C.cyn],
            ["→", "OCAST Innovation Conference — registered April 21-22", C.mag],
            ["→", "Pilot partner conversations active — target signed Q2 2026", C.mag],
            ["→", "OCAST FY27 grant — July 2026", C.pur],
            ["→", "NIH SUD Tech Grant — June 2026", C.pur],
          ].map(([icon, text, color]) => (
            <div key={text} style={{ display: "flex", gap: 12, marginBottom: 10, alignItems: "flex-start" }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", backgroundColor: color + "22", border: `1px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 12, color, fontWeight: 900, marginTop: 2 }}>{icon}</div>
              <div style={{ fontSize: 13, color: icon === "→" ? "#aaa" : "#fff" }}>{text}</div>
            </div>
          ))}
        </div>
      </div>
    </Slide>
  ),

  // 13 — Team
  () => (
    <Slide>
      <Label color={C.pur}>THE TEAM</Label>
      <Divider color={C.pur} />
      <H2>The founder who <span style={{ color: C.pur }}>lived it.</span><br />The doctor who <span style={{ color: C.cyn }}>validates it.</span></H2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginTop: 24 }}>
        <Card accent={C.mag + "55"} style={{ borderTop: `3px solid ${C.mag}` }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>Kourtney Rhodes</div>
            <div style={{ fontSize: 13, color: C.mag, fontWeight: 700, marginTop: 4 }}>Founder & CEO</div>
          </div>
          {[
            ["Education", "Duke University — AI Product Management Certificate (2024–2025)\nUniversity of Pennsylvania — Data Analytics, SQL, Python (2024–2025)"],
            ["Background", "Fraud investigation at Bank of America — 100% audit quality\nHIPAA-regulated healthcare operations"],
            ["Why Her", "Lived experience in the behavioral health system. Built the product she needed to exist. Single mom. Authentic founder operating with infinite purpose."],
          ].map(([label, text]) => (
            <div key={label} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: C.muted, letterSpacing: 2, marginBottom: 4 }}>{label.toUpperCase()}</div>
              <div style={{ fontSize: 13, color: "#aaa", lineHeight: 1.7, whiteSpace: "pre-line" }}>{text}</div>
            </div>
          ))}
        </Card>
        <Card accent={C.cyn + "55"} style={{ borderTop: `3px solid ${C.cyn}` }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#fff" }}>Dr. Nixi Cat, DO</div>
            <div style={{ fontSize: 13, color: C.cyn, fontWeight: 700, marginTop: 4 }}>Chief Clinical Advisor</div>
          </div>
          {[
            ["Credentials", "Doctor of Osteopathic Medicine"],
            ["Signed", "April 2026 · 0.25% equity · 24-month vesting · No cliff"],
            ["Role", "Clinical validation for CensusGuard signal detection. Provides medical credibility for risk patterns, intervention protocols, and clinical outcome tracking."],
          ].map(([label, text]) => (
            <div key={label} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: C.muted, letterSpacing: 2, marginBottom: 4 }}>{label.toUpperCase()}</div>
              <div style={{ fontSize: 13, color: "#aaa", lineHeight: 1.7 }}>{text}</div>
            </div>
          ))}
          <Card accent={C.pur + "44"} style={{ marginTop: 8 }}>
            <div style={{ fontSize: 12, color: C.pur, fontWeight: 700, marginBottom: 6 }}>SECOND PRODUCT IN DEVELOPMENT</div>
            <div style={{ fontSize: 12, color: "#888" }}>Outpatient engagement and post-visit follow-up tool for private practices — advised by Dr. Cat.</div>
          </Card>
        </Card>
      </div>
    </Slide>
  ),

  // 14 — The Ask
  () => (
    <Slide style={{ alignItems: "center", textAlign: "center" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: `radial-gradient(ellipse at 50% 40%, ${C.mag}0d 0%, transparent 65%)`, pointerEvents: "none" }} />
      <Label color={C.mag} style={{ textAlign: "center" }}>THE ASK</Label>
      <H1 style={{ fontSize: 64, textAlign: "center" }}>
        <span style={{ color: C.mag }}>$500K</span> pre-seed.
      </H1>
      <div style={{ fontSize: 20, color: "#888", marginBottom: 48 }}>SAFE Note · $8–10M Valuation Cap · Pre-Seed Round</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20, width: "100%", maxWidth: 900, marginBottom: 48 }}>
        {[
          ["40%", "Product Development", "Scoring engine, API integrations, platform hardening", C.mag],
          ["25%", "Pilot Launch", "First 3 signed facilities, onboarding, support", C.pur],
          ["20%", "Team", "First hire — clinical implementation lead", C.cyn],
          ["15%", "Marketing & Sales", "Investor relations, pilot outreach, conferences", "#ff6b35"],
        ].map(([pct, label, desc, color]) => (
          <Card key={label} accent={color + "44"} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 36, fontWeight: 900, color, marginBottom: 6 }}>{pct}</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 12, color: "#888", lineHeight: 1.5 }}>{desc}</div>
          </Card>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, width: "100%", maxWidth: 700, marginBottom: 40 }}>
        {[
          ["Q2 2026", "Signed pilot partner", C.cyn],
          ["Q3 2026", "3 facilities live", C.mag],
          ["Q4 2026", "Grant funding + seed raise", C.pur],
        ].map(([time, milestone, color]) => (
          <div key={time} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 12, color, fontWeight: 800, marginBottom: 4 }}>{time}</div>
            <div style={{ fontSize: 13, color: "#888" }}>{milestone}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 22, color: "#fff", fontWeight: 600, fontStyle: "italic", maxWidth: 600, lineHeight: 1.6 }}>
        "We're not building another healthcare app.<br />We're building the thing I wish existed when I was fighting for my life."
      </div>
      <div style={{ marginTop: 32, fontSize: 14, color: C.muted }}>
        kourtney.rhodes25@gmail.com · anchorpointhealthsystems.com · /demo
      </div>
    </Slide>
  ),
];

export default function Pitch() {
  const [current, setCurrent] = useState(0);

  function prev() { setCurrent(c => Math.max(0, c - 1)); }
  function next() { setCurrent(c => Math.min(SLIDES.length - 1, c + 1)); }

  const SlideComponent = SLIDES[current];

  return (
    <div style={{ backgroundColor: C.bg, minHeight: "100vh", position: "relative" }}>
      {/* Slide */}
      <SlideComponent />

      {/* Navigation */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        backgroundColor: "#07070Fdd", backdropFilter: "blur(8px)",
        borderTop: `1px solid ${C.border}`, padding: "12px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 100
      }}>
        <button onClick={prev} disabled={current === 0} style={{
          backgroundColor: current === 0 ? "transparent" : C.card,
          border: `1px solid ${current === 0 ? C.border : C.mag}`,
          color: current === 0 ? C.muted : "#fff", padding: "8px 24px",
          borderRadius: 3, cursor: current === 0 ? "default" : "pointer",
          fontSize: 13, fontWeight: 700, letterSpacing: 1
        }}>← PREV</button>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {SLIDES.map((_, i) => <NavDot key={i} active={i === current} onClick={() => setCurrent(i)} />)}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 12, color: C.muted }}>{current + 1} / {SLIDES.length}</span>
          <button onClick={next} disabled={current === SLIDES.length - 1} style={{
            backgroundColor: current === SLIDES.length - 1 ? "transparent" : C.mag,
            border: `1px solid ${current === SLIDES.length - 1 ? C.border : C.mag}`,
            color: current === SLIDES.length - 1 ? C.muted : "#fff", padding: "8px 24px",
            borderRadius: 3, cursor: current === SLIDES.length - 1 ? "default" : "pointer",
            fontSize: 13, fontWeight: 700, letterSpacing: 1
          }}>NEXT →</button>
        </div>
      </div>
    </div>
  );
}
