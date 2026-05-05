import { useState } from "react";

const LOGO = "https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/c3d5295ac_CensusGuard_banner_logo.png";
const NAV = [["HOME", "/home"], ["ABOUT", "/about"], ["DEMO", "/demo"], ["PITCH", "/pitch"], ["CONTACT", "/contact"]];

function Nav() {
  return (
    <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 48px", borderBottom: "1px solid #1a1a2e", position: "sticky", top: 0, backgroundColor: "#07070F", zIndex: 100 }}>
      <a href="/home" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
        <img src={LOGO} alt="AnchorPoint Health Systems" style={{ height: 38 }} />
      </a>
      <div style={{ display: "flex", gap: "28px", alignItems: "center" }}>
        {NAV.map(([label, href]) => (
          <a key={label} href={href} style={{ color: label === "HOME" ? "#D4159A" : "#aaa", textDecoration: "none", fontSize: "12px", letterSpacing: "1.5px", fontWeight: label === "HOME" ? 700 : 500, transition: "color 0.2s" }}
            onMouseEnter={e => e.target.style.color = "#D4159A"}
            onMouseLeave={e => e.target.style.color = label === "HOME" ? "#D4159A" : "#aaa"}>
            {label}
          </a>
        ))}
        <a href="/contact" style={{ backgroundColor: "#D4159A", color: "#fff", padding: "10px 22px", borderRadius: "4px", textDecoration: "none", fontSize: "12px", fontWeight: 700, letterSpacing: "1px" }}>
          REQUEST A PILOT
        </a>
      </div>
    </nav>
  );
}

export default function Home() {
  return (
    <div style={{ backgroundColor: "#07070F", color: "#fff", fontFamily: "'Inter', sans-serif", minHeight: "100vh" }}>
      <Nav />

      {/* HERO */}
      <section style={{ textAlign: "center", padding: "120px 48px 80px", background: "radial-gradient(ellipse at top, #1a0a2e 0%, #07070F 60%)" }}>
        <div style={{ fontSize: "13px", letterSpacing: "4px", color: "#10D8F0", fontWeight: 600, marginBottom: "24px" }}>
          AI-DRIVEN PATIENT RETENTION
        </div>
        <h1 style={{ fontSize: "clamp(56px, 8vw, 96px)", fontWeight: 900, letterSpacing: "4px", margin: "0 0 24px", lineHeight: 1 }}>
          CENSUS<span style={{ color: "#D4159A" }}>GUARD</span>™
        </h1>
        <p style={{ fontSize: "20px", color: "#aaa", maxWidth: "600px", margin: "0 auto 16px", lineHeight: 1.6 }}>
          AI-Driven Patient Retention for Behavioral Health Organizations
        </p>
        <p style={{ fontSize: "14px", color: "#8844E8", letterSpacing: "2px", marginBottom: "48px", fontWeight: 600 }}>
          REAL-TIME · PREDICTIVE · BUILT ON 952,358 FEDERAL PATIENT EPISODES
        </p>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/demo" style={{ backgroundColor: "#D4159A", color: "#fff", padding: "16px 36px", borderRadius: "4px", textDecoration: "none", fontWeight: 700, fontSize: "14px", letterSpacing: "1px" }}>
            SEE THE LIVE DEMO
          </a>
          <a href="/contact" style={{ border: "2px solid #8844E8", color: "#fff", padding: "16px 36px", borderRadius: "4px", textDecoration: "none", fontWeight: 700, fontSize: "14px", letterSpacing: "1px" }}>
            REQUEST A PILOT
          </a>
        </div>
      </section>

      {/* STATS BAR */}
      <section style={{ backgroundColor: "#0d0d1a", padding: "32px 48px", display: "flex", justifyContent: "center", gap: "64px", flexWrap: "wrap", borderTop: "1px solid #1a1a2e", borderBottom: "1px solid #1a1a2e" }}>
        {[
          { num: "89.6%", label: "AUC-ROC ACCURACY" },
          { num: "952K+", label: "PATIENT EPISODES" },
          { num: "HIPAA", label: "COMPLIANT" },
          { num: "ZERO NEW", label: "HARDWARE REQUIRED" },
        ].map(stat => (
          <div key={stat.num} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "32px", fontWeight: 900, color: "#D4159A" }}>{stat.num}</div>
            <div style={{ fontSize: "11px", letterSpacing: "2px", color: "#666", marginTop: "4px" }}>{stat.label}</div>
          </div>
        ))}
      </section>

      {/* THE PRODUCT */}
      <section style={{ padding: "100px 48px", maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontSize: "12px", letterSpacing: "4px", color: "#10D8F0", marginBottom: "24px" }}>THE PRODUCT</div>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 900, lineHeight: 1.2, marginBottom: "32px" }}>
          CENSUSGUARD™ IS AI-DRIVEN PATIENT RETENTION — BUILT SPECIFICALLY FOR SUD AND BEHAVIORAL HEALTH TREATMENT PROGRAMS.
        </h2>
        <p style={{ fontSize: "18px", color: "#aaa", lineHeight: 1.8 }}>
          We identify patients at risk of dropping out — before it happens — and alert your clinical team while there's still time to intervene.
        </p>
        <p style={{ fontSize: "16px", color: "#8844E8", marginTop: "16px", fontWeight: 600 }}>
          Trained on 952,358 federal patient episodes. 89.6% AUC-ROC accuracy. Real-time. Not 24-hour batch. <em>Now.</em>
        </p>
      </section>

      {/* FEATURES */}
      <section style={{ backgroundColor: "#0d0d1a", padding: "100px 48px" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ fontSize: "12px", letterSpacing: "4px", color: "#10D8F0", marginBottom: "16px", textAlign: "center" }}>WHAT WE MONITOR</div>
          <h2 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 900, marginBottom: "56px", textAlign: "center" }}>CENSUSGUARD™ FEATURES</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
            {[
              { icon: "💊", title: "MEDICATION ADHERENCE MONITORING", desc: "Every missed dose is a data point. CensusGuard tracks adherence patterns directly from your MAR, flagging the moment consistency starts to break down." },
              { icon: "🧠", title: "MOOD & BEHAVIORAL SHIFT DETECTION", desc: "Subtle changes in documented patient interactions often precede a crisis by days. We catch the pattern before your team sees the behavior." },

              { icon: "🔒", title: "SOCIAL ISOLATION INDICATORS", desc: "When a patient starts pulling away from group activities and peer interaction, CensusGuard weighs it. Withdrawal is a signal, not just a personality trait." },
              { icon: "👥", title: "UNIT COHESION TRACKING", desc: "Individual risk doesn't exist in a vacuum. We monitor the health of your cohort as a whole, because a destabilized group affects every patient in it." },
              { icon: "⚡", title: "VELOCITY INTELLIGENCE", desc: "It's not just where a patient's risk score sits. It's how fast it's moving. Acceleration toward crisis is often more important than the score itself." },
            ].map(item => (
              <div key={item.title} style={{ backgroundColor: "#07070F", border: "1px solid #1a1a2e", borderTop: "3px solid #D4159A", borderRadius: "4px", padding: "32px" }}>
                <div style={{ fontSize: "28px", marginBottom: "16px" }}>{item.icon}</div>
                <div style={{ fontWeight: 800, fontSize: "12px", letterSpacing: "2px", marginBottom: "12px", color: "#10D8F0" }}>{item.title}</div>
                <div style={{ color: "#aaa", lineHeight: 1.7, fontSize: "14px" }}>{item.desc}</div>
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", color: "#555", fontSize: "13px", marginTop: "32px", fontStyle: "italic" }}>
            All data pulled from existing EHR documentation. No wearables. No new hardware. No friction.
          </p>
        </div>
      </section>

      {/* THE CRISIS */}
      <section style={{ padding: "100px 48px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ fontSize: "12px", letterSpacing: "4px", color: "#D4159A", marginBottom: "24px" }}>THE CRISIS</div>
          <h2 style={{ fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 900, lineHeight: 1.1, marginBottom: "40px" }}>
            ADDICTION IS THE #1 CAUSE OF DEATH FOR AMERICANS AGE 18–45.
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "32px", marginBottom: "48px" }}>
            {[
              { stat: "$820B", desc: "Annual cost to the U.S. economy in lost productivity, healthcare, and crime" },
              { stat: "48.4M", desc: "Americans struggling with addiction right now — nearly 1 in 6 people" },
              { stat: "1 in 3", desc: "Patients leave treatment before it can save them — 10x higher overdose risk within 30 days" },
            ].map(item => (
              <div key={item.stat} style={{ border: "1px solid #1a1a2e", borderTop: "3px solid #8844E8", padding: "32px", borderRadius: "4px" }}>
                <div style={{ fontSize: "48px", fontWeight: 900, color: "#8844E8", marginBottom: "12px" }}>{item.stat}</div>
                <div style={{ color: "#aaa", lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ backgroundColor: "#1a0a2e", border: "1px solid #D4159A", borderRadius: "4px", padding: "32px" }}>
            <p style={{ fontSize: "20px", fontWeight: 700, color: "#fff", margin: 0, lineHeight: 1.6 }}>
              Every dropout is a relapse waiting to happen. Every dropout is a missed opportunity for recovery. This costs facilities revenue and payers billions in readmissions — but most importantly, <span style={{ color: "#D4159A" }}>it costs patients their lives.</span>
            </p>
          </div>
        </div>
      </section>

      {/* THE SCIENCE */}
      <section style={{ backgroundColor: "#0d0d1a", padding: "100px 48px", maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ fontSize: "12px", letterSpacing: "4px", color: "#10D8F0", marginBottom: "24px" }}>THE SCIENCE</div>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 900, marginBottom: "32px" }}>THE "INVISIBLE" RELAPSE</h2>
        <p style={{ color: "#aaa", fontSize: "18px", lineHeight: 1.8, marginBottom: "48px" }}>
          Most people believe relapse is an instant decision. The research tells a different story. Clinical studies show that relapse is a process, not an event. It happens in three distinct stages:
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginBottom: "48px" }}>
          {[
            { stage: "01", title: "EMOTIONAL RELAPSE", desc: "The patient isn't thinking about using, but their emotions and behaviors are setting the stage." },
            { stage: "02", title: "MENTAL RELAPSE", desc: "The internal struggle begins. Part of them wants to stay; part of them wants to leave." },
            { stage: "03", title: "PHYSICAL RELAPSE", desc: "The patient walks out the door. By this point, stages one and two have already happened." },
          ].map(item => (
            <div key={item.stage} style={{ display: "flex", gap: "24px", alignItems: "flex-start", padding: "24px", border: "1px solid #1a1a2e", borderRadius: "4px" }}>
              <div style={{ fontSize: "36px", fontWeight: 900, color: "#D4159A", minWidth: "60px" }}>{item.stage}</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: "16px", letterSpacing: "2px", marginBottom: "8px" }}>{item.title}</div>
                <div style={{ color: "#aaa", lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <blockquote style={{ borderLeft: "4px solid #D4159A", paddingLeft: "24px", margin: "0", fontStyle: "italic", color: "#aaa", fontSize: "16px", lineHeight: 1.8 }}>
          "Consumption is the very last step in the relapse. Neglecting earlier events in a relapse prevents more effective intervention at earlier stages."
          <br /><strong style={{ color: "#fff", fontStyle: "normal" }}>— StatPearls, Addiction Relapse Prevention · NCBI Bookshelf</strong>
        </blockquote>
      </section>

      {/* WORKFLOW */}
      <section style={{ padding: "100px 48px", maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ fontSize: "12px", letterSpacing: "4px", color: "#10D8F0", marginBottom: "24px", textAlign: "center" }}>THE WORKFLOW</div>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 900, marginBottom: "64px", textAlign: "center" }}>FROM SIGNAL TO INTERVENTION.</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          {[
            { step: "01", title: "INGEST", color: "#D4159A", desc: "CensusGuard™ connects to your existing EHR via HIPAA-compliant API. Patient data flows continuously — no manual entry, no batch uploads, no extra work for your staff." },
            { step: "02", title: "SCORE", color: "#8844E8", desc: "Our AI scores every patient's dropout risk in real time against 952,358+ federal patient episodes — substance type, level of care, length of stay, and behavioral signals all weighted continuously." },
            { step: "03", title: "ALERT", color: "#10D8F0", desc: "The moment a patient's risk score crosses a critical threshold, your clinical staff receives an immediate priority alert. No delay. No batch reports. No missed windows." },
            { step: "04", title: "INTERVENE", color: "#D4159A", desc: "Equipped with real-time data, your clinicians intervene during the CensusGuard™ Window — saving the census and providing the clinical intervention patients need." },
          ].map((item) => (
            <div key={item.step} style={{ display: "flex", gap: "32px", paddingBottom: "48px", borderLeft: `2px solid ${item.color}`, paddingLeft: "32px", marginLeft: "24px", position: "relative" }}>
              <div style={{ position: "absolute", left: "-20px", top: 0, width: "40px", height: "40px", backgroundColor: item.color, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "12px" }}>{item.step}</div>
              <div>
                <div style={{ fontWeight: 900, fontSize: "20px", letterSpacing: "2px", marginBottom: "12px", color: item.color }}>{item.title}</div>
                <div style={{ color: "#aaa", lineHeight: 1.8, fontSize: "16px" }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: "32px", fontSize: "18px", fontWeight: 800, letterSpacing: "2px", color: "#fff" }}>
          CENSUSGUARD™ GIVES THE CLINICAL TEAM THE WINDOW —<br />
          <span style={{ color: "#D4159A" }}>THEN CLINICIANS DO WHAT THEY WERE TRAINED TO DO.</span>
        </div>
      </section>

      {/* THE RESULT */}
      <section style={{ backgroundColor: "#0d0d1a", padding: "100px 48px", textAlign: "center" }}>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <div style={{ fontSize: "12px", letterSpacing: "4px", color: "#D4159A", marginBottom: "24px" }}>THE RESULT</div>
          <div style={{ fontSize: "clamp(80px, 15vw, 140px)", fontWeight: 900, color: "#D4159A", lineHeight: 1 }}>77%</div>
          <h2 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 900, marginBottom: "24px" }}>COMPLETION PREMIUM</h2>
          <p style={{ color: "#aaa", fontSize: "18px", lineHeight: 1.8 }}>
            Patients who complete their full recommended treatment program are 77% more likely to achieve long-term abstinence. We build the tools that make completion a reality.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "100px 48px", textAlign: "center", background: "radial-gradient(ellipse at bottom, #1a0a2e 0%, #07070F 60%)" }}>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, marginBottom: "24px", lineHeight: 1.2 }}>
            READY TO STOP LOSING PATIENTS BEFORE THEY'RE READY TO LEAVE?
          </h2>
          <p style={{ color: "#aaa", fontSize: "18px", lineHeight: 1.8, marginBottom: "48px" }}>
            CensusGuard™ is currently seeking pilot partners and investors. If you run a behavioral health treatment program or you're an investor who sees the opportunity — let's talk.
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap", marginBottom: "32px" }}>
            <a href="mailto:Kourtney@anchorpointhealthsystems.com?subject=Pilot Partner Application" style={{ backgroundColor: "#D4159A", color: "#fff", padding: "16px 36px", borderRadius: "4px", textDecoration: "none", fontWeight: 700, fontSize: "14px", letterSpacing: "1px" }}>
              APPLY TO BE A PILOT PARTNER
            </a>
            <a href="/demo" style={{ border: "2px solid #8844E8", color: "#fff", padding: "16px 36px", borderRadius: "4px", textDecoration: "none", fontWeight: 700, fontSize: "14px", letterSpacing: "1px" }}>
              SEE THE DEMO
            </a>
          </div>
          <p style={{ color: "#666", fontSize: "14px" }}>Kourtney@anchorpointhealthsystems.com</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ backgroundColor: "#0d0d1a", borderTop: "1px solid #1a1a2e", padding: "40px 48px", textAlign: "center" }}>
        <div style={{ overflow: "hidden", marginBottom: "32px" }}>
          <div style={{ whiteSpace: "nowrap", animation: "marquee 20s linear infinite", color: "#333", fontSize: "13px", letterSpacing: "4px" }}>
            MAKE AN IMPACT · SUPPORT INNOVATION · KEEP BUILDING · SAVE LIVES · MAKE AN IMPACT · SUPPORT INNOVATION · KEEP BUILDING · SAVE LIVES ·&nbsp;
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: "32px", marginBottom: "24px", flexWrap: "wrap" }}>
          {NAV.map(([label, href]) => (
            <a key={label} href={href} style={{ color: "#555", textDecoration: "none", fontSize: "12px", letterSpacing: "1px" }}>{label}</a>
          ))}
        </div>
        <div style={{ fontWeight: 800, fontSize: "16px", letterSpacing: "2px", marginBottom: "8px" }}>
          ANCHORPOINT <span style={{ color: "#D4159A" }}>HEALTH SYSTEMS</span>
        </div>
        <p style={{ color: "#555", fontSize: "13px", marginBottom: "16px" }}>Kourtney@anchorpointhealthsystems.com</p>
        <p style={{ color: "#333", fontSize: "12px" }}>© 2026 AnchorPoint Health Systems. All rights reserved. · Moore, Oklahoma · HIPAA Compliant</p>
      </footer>

      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
}
