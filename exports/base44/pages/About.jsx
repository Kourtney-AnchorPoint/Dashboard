
export default function About() {
  return (
    <div style={{ backgroundColor: "#07070F", color: "#fff", fontFamily: "'Inter', sans-serif", minHeight: "100vh" }}>
      {/* NAV */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 48px", borderBottom: "1px solid #1a1a2e", position: "sticky", top: 0, backgroundColor: "#07070F", zIndex: 100 }}>
        <a href="/home" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <img src="https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/c3d5295ac_CensusGuard_banner_logo.png" alt="AnchorPoint Health Systems" style={{ height: 38 }} />
        </a>
        <div style={{ display: "flex", gap: "28px", alignItems: "center" }}>
          {[["HOME", "/home"], ["ABOUT", "/about"], ["DEMO", "/demo"], ["PITCH", "/pitch"], ["CONTACT", "/contact"]].map(([label, href]) => (
            <a key={label} href={href} style={{ color: label === "ABOUT" ? "#D4159A" : "#aaa", textDecoration: "none", fontSize: "12px", letterSpacing: "1.5px", fontWeight: label === "ABOUT" ? 700 : 500 }}>
              {label}
            </a>
          ))}
          <a href="/contact" style={{ backgroundColor: "#D4159A", color: "#fff", padding: "10px 22px", borderRadius: "4px", textDecoration: "none", fontSize: "12px", fontWeight: 700, letterSpacing: "1px" }}>
            REQUEST A PILOT
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: "100px 48px 60px", textAlign: "center", background: "radial-gradient(ellipse at top, #1a0a2e 0%, #07070F 60%)" }}>
        <div style={{ fontSize: "13px", letterSpacing: "4px", color: "#10D8F0", marginBottom: "24px" }}>OUR STORY</div>
        <h1 style={{ fontSize: "clamp(48px, 7vw, 80px)", fontWeight: 900, margin: "0 0 16px" }}>THE REASON</h1>
        <p style={{ fontSize: "22px", color: "#aaa", fontStyle: "italic" }}>The Signs Were Always There.</p>
      </section>

      {/* FOUNDER STATEMENT */}
      <section style={{ padding: "80px 48px", maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ backgroundColor: "#0d0d1a", borderLeft: "4px solid #D4159A", borderRadius: "4px", padding: "48px", position: "relative" }}>
          <div style={{ fontSize: "80px", color: "#D4159A", lineHeight: 0.5, marginBottom: "32px", fontFamily: "Georgia, serif" }}>"</div>
          <p style={{ fontSize: "20px", lineHeight: 1.9, color: "#ddd", marginBottom: "32px" }}>
            I know the silence of a treatment center at 3:00 AM. I've been the patient wondering if anyone would notice if I left, and the one knocking on a closed therapist's door mid-crisis. I lost my career, my family, and myself to this disease before I found my way back.
          </p>
          <p style={{ fontSize: "20px", lineHeight: 1.9, color: "#ddd", marginBottom: "32px" }}>
            Through every treatment center and every setback, I saw the same fatal crack in the system: the critical moment when a patient starts to slip, and nobody catches it in time.
          </p>
          <p style={{ fontSize: "20px", lineHeight: 1.9, color: "#ddd", marginBottom: "40px" }}>
            I stopped waiting for someone else to fix it. I taught myself the tech, trained the model on a million real-world treatment episodes, and built CensusGuard. This isn't just a company — it's my testimony. We've built the eyes the system was missing, ensuring that when the "switch flips" for a patient, someone is finally watching.
          </p>
          <div style={{ borderTop: "1px solid #2a1a3e", paddingTop: "24px" }}>
            <div style={{ fontWeight: 800, fontSize: "16px", color: "#D4159A" }}>KOURTNEY RHODES</div>
            <div style={{ color: "#666", fontSize: "14px", letterSpacing: "1px", marginTop: "4px" }}>FOUNDER & CEO, ANCHORPOINT HEALTH SYSTEMS</div>
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section style={{ backgroundColor: "#0d0d1a", padding: "100px 48px", textAlign: "center" }}>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <div style={{ fontSize: "12px", letterSpacing: "4px", color: "#8844E8", marginBottom: "24px" }}>WHAT WE'RE BUILDING</div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 900, marginBottom: "32px" }}>
            WE EXIST FOR ONE REASON.
          </h2>
          <p style={{ fontSize: "18px", color: "#aaa", lineHeight: 1.9, marginBottom: "24px" }}>
            AnchorPoint Health Systems exists to make sure no one falls through the cracks the way so many of us did.
          </p>
          <p style={{ fontSize: "18px", color: "#aaa", lineHeight: 1.9 }}>
            We're not a software company that decided to enter healthcare. We're a recovery story that became a technology company — because we <em style={{ color: "#fff" }}>lived the problem</em> before we built the solution.
          </p>
          <p style={{ fontSize: "20px", fontWeight: 700, color: "#D4159A", marginTop: "32px" }}>
            CensusGuard™ is our first product. And it's just the beginning.
          </p>
        </div>
      </section>

      {/* STATS */}
      <section style={{ padding: "100px 48px", maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ fontSize: "12px", letterSpacing: "4px", color: "#10D8F0", marginBottom: "48px", textAlign: "center" }}>THE NUMBERS BEHIND THE MISSION</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px" }}>
          {[
            { num: "952,358", label: "Federal patient episodes our model was trained on", color: "#D4159A" },
            { num: "89.6%", label: "AUC-ROC accuracy — Vertex AI validated", color: "#8844E8" },
            { num: "80 of 100", label: "Real AMA dropouts caught before they leave (80.3% Recall)", color: "#10D8F0" },
            { num: "90.1%", label: "PR-AUC — precision-recall balance across all risk thresholds", color: "#D4159A" },
            { num: "77%", label: "Completion premium for patients who finish treatment", color: "#10D8F0" },
            { num: "48.4M", label: "Americans struggling with addiction right now", color: "#D4159A" },
            { num: "1 in 3", label: "Patients who leave treatment before it can save them", color: "#8844E8" },
          ].map(item => (
            <div key={item.num} style={{ backgroundColor: "#0d0d1a", border: `1px solid ${item.color}22`, borderTop: `3px solid ${item.color}`, padding: "32px", borderRadius: "4px", textAlign: "center" }}>
              <div style={{ fontSize: "40px", fontWeight: 900, color: item.color, marginBottom: "12px" }}>{item.num}</div>
              <div style={{ color: "#aaa", fontSize: "14px", lineHeight: 1.6 }}>{item.label}</div>
            </div>
          ))}
        </div>
        <p style={{ color: "#666", fontSize: "15px", lineHeight: 1.8, marginTop: "48px", textAlign: "center" }}>
          Our model was built on SAMHSA federal treatment data — not a small pilot, not a guess. Nearly a million real patient outcomes went into CensusGuard™ before we ever showed it to a single facility.
        </p>
      </section>

      {/* TEAM */}
      <section style={{ backgroundColor: "#0d0d1a", padding: "100px 48px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ fontSize: "12px", letterSpacing: "4px", color: "#D4159A", marginBottom: "48px", textAlign: "center" }}>MEET THE TEAM</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: "32px" }}>
            {[
              {
                name: "KOURTNEY RHODES",
                title: "CEO & Founder",
                bio: "Built by someone who lived this crisis from the inside. Kourtney knows firsthand what it feels like to be the patient nobody caught in time. A Duke University-trained AI Product Manager, she built CensusGuard from the ground up — training the model on nearly a million real-world treatment episodes. This isn't just a company. It's her testimony.",
                color: "#D4159A"
              },
              {
                name: "DR. NIXI CAT, DO",
                title: "Chief Clinical Advisor",
                bio: "A Family Medicine physician and addiction medicine specialist. His clinical expertise spans psychiatric comorbidities, pain management, medication-assisted therapy, and the social determinants of health. Dr. Cat brings frontline clinical experience ensuring every signal CensusGuard detects is grounded in real human behavior — not just data.",
                color: "#8844E8"
              }
            ].map(person => (
              <div key={person.name} style={{ backgroundColor: "#07070F", border: "1px solid #1a1a2e", borderTop: `3px solid ${person.color}`, padding: "40px", borderRadius: "4px" }}>
                <div style={{ width: "64px", height: "64px", backgroundColor: person.color + "22", border: `2px solid ${person.color}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", marginBottom: "24px" }}>
                  {person.name[0]}
                </div>
                <div style={{ fontWeight: 900, fontSize: "18px", letterSpacing: "1px", marginBottom: "4px", color: person.color }}>{person.name}</div>
                <div style={{ color: "#666", fontSize: "13px", letterSpacing: "2px", marginBottom: "20px" }}>{person.title}</div>
                <p style={{ color: "#aaa", lineHeight: 1.8, fontSize: "15px" }}>{person.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section style={{ padding: "100px 48px", textAlign: "center", background: "radial-gradient(ellipse at bottom, #1a0a2e 0%, #07070F 60%)" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(24px, 3.5vw, 40px)", fontWeight: 900, lineHeight: 1.3, marginBottom: "32px" }}>
            IF YOU BELIEVE THE PEOPLE MOST FAILED BY THE SYSTEM DESERVE THE MOST SOPHISTICATED SOLUTIONS —{" "}
            <span style={{ color: "#D4159A" }}>LET'S BUILD THIS TOGETHER.</span>
          </h2>
          <p style={{ color: "#aaa", fontSize: "17px", lineHeight: 1.8, marginBottom: "48px" }}>
            We're currently seeking pilot partners and investors who understand what's at stake.
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="mailto:Kourtney@anchorpointhealthsystems.com?subject=Pilot Partner Application" style={{ backgroundColor: "#D4159A", color: "#fff", padding: "16px 36px", borderRadius: "4px", textDecoration: "none", fontWeight: 700, fontSize: "14px", letterSpacing: "1px" }}>
              APPLY TO BE A PILOT PARTNER
            </a>
            <a href="mailto:Kourtney@anchorpointhealthsystems.com?subject=Investor Inquiry" style={{ border: "2px solid #8844E8", color: "#fff", padding: "16px 36px", borderRadius: "4px", textDecoration: "none", fontWeight: 700, fontSize: "14px", letterSpacing: "1px" }}>
              TALK TO OUR TEAM
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ backgroundColor: "#0d0d1a", borderTop: "1px solid #1a1a2e", padding: "40px 48px", textAlign: "center" }}>
        <div style={{ fontWeight: 800, fontSize: "16px", letterSpacing: "2px", marginBottom: "8px" }}>
          ANCHORPOINT <span style={{ color: "#D4159A" }}>HEALTH SYSTEMS</span>
        </div>
        <p style={{ color: "#555", fontSize: "13px", marginBottom: "16px" }}>Kourtney@anchorpointhealthsystems.com</p>
        <p style={{ color: "#333", fontSize: "12px" }}>© 2026 AnchorPoint Health Systems. All rights reserved.</p>
      </footer>

      <style>{`* { box-sizing: border-box; } html { scroll-behavior: smooth; }`}</style>
    </div>
  );
}
