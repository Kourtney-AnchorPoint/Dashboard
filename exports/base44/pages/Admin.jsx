import { useState, useEffect } from "react";

const LOGO = "https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/c3d5295ac_CensusGuard_banner_logo.png";
const ADMIN_PASSWORD = "anchor2026";

const S = {
  page: { minHeight:"100vh", backgroundColor:"#07070F", fontFamily:"'Inter','Helvetica Neue',sans-serif", color:"#fff" },
  header: { backgroundColor:"#0a0a18", borderBottom:"1px solid #1a1a2e", padding:"16px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 },
  nav: { display:"flex", gap:6, flexWrap:"wrap" },
  navBtn: (active) => ({ padding:"7px 14px", borderRadius:3, border:`1px solid ${active?"#D4159A":"#1a1a2e"}`, backgroundColor:active?"#D4159A22":"transparent", color:active?"#D4159A":"#666", fontSize:11, fontWeight:700, cursor:"pointer", letterSpacing:1 }),
  card: { backgroundColor:"#0a0a18", border:"1px solid #1a1a2e", borderRadius:6, padding:20, marginBottom:14 },
  label: { fontSize:10, letterSpacing:2, color:"#555", fontWeight:700, marginBottom:6, display:"block" },
  input: { width:"100%", backgroundColor:"#07070F", border:"1px solid #1a1a2e", borderRadius:3, padding:"10px 12px", color:"#fff", fontSize:13, outline:"none", boxSizing:"border-box" },
  btn: (color="#D4159A") => ({ backgroundColor:color+"22", border:`1px solid ${color}44`, color:color, padding:"7px 14px", borderRadius:3, fontSize:11, fontWeight:700, cursor:"pointer", letterSpacing:1 }),
  tag: (color="#555") => ({ backgroundColor:color+"22", border:`1px solid ${color}44`, color:color, fontSize:11, padding:"3px 10px", borderRadius:2, display:"inline-block" }),
};

// ── Card data split out to reduce parse overhead ─────────────────────────────
function getMajorCards() {
  return [
    { id:0,  name:"The Fool",           url:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/6b32dd0f5_generated_image.png" },
    { id:1,  name:"The Magician",       url:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/18121c1cc_generated_image.png" },
    { id:2,  name:"The High Priestess", url:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/58fb1d7c1_generated_image.png" },
    { id:3,  name:"The Empress",        url:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/6220d890f_generated_image.png" },
    { id:4,  name:"The Emperor",        url:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/7e0f5e50d_generated_image.png" },
    { id:5,  name:"The Hierophant",     url:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/56b97bdc8_generated_image.png" },
    { id:6,  name:"The Lovers",         url:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/37f6bb2ad_generated_image.png" },
    { id:7,  name:"The Chariot",        url:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/6c41b88c6_generated_image.png" },
    { id:8,  name:"Strength",           url:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/a9903bcf9_generated_image.png" },
    { id:9,  name:"The Hermit",         url:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/2fc6fbf29_generated_image.png" },
    { id:10, name:"Wheel of Fortune",   url:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/e67a90405_generated_image.png" },
    { id:11, name:"Justice",            url:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/70785ea2b_generated_image.png" },
    { id:12, name:"The Hanged One",     url:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/84c6df43d_generated_image.png" },
    { id:13, name:"Death",              url:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/94fb17882_generated_image.png" },
    { id:14, name:"Temperance",         url:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/3d4272059_generated_image.png" },
    { id:15, name:"The Devil",          url:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/9b549509a_generated_image.png" },
    { id:16, name:"The Tower",          url:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/79788212d_generated_image.png" },
    { id:17, name:"The Star",           url:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/3b8a60757_generated_image.png" },
    { id:18, name:"The Moon",           url:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/05c76072e_generated_image.png" },
    { id:19, name:"The Sun",            url:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/237d5b7ca_generated_image.png" },
    { id:20, name:"Judgement",          url:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/7347ce2b0_generated_image.png" },
    { id:21, name:"The World",          url:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/85c67e0c3_generated_image.png" },
  ];
}

function getOracleCards() {
  return [
    { id:"o1",  name:"Inner Light",        url:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/30d1e36ec_generated_image.png" },
    { id:"o2",  name:"The Phoenix",        url:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/0c43212b2_generated_image.png" },
    { id:"o3",  name:"Sacred Feminine",    url:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/96d58b0d1_generated_image.png" },
    { id:"o4",  name:"Unbreakable",        url:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/af1529a0f_generated_image.png" },
    { id:"o5",  name:"The Void",           url:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/c465687cc_generated_image.png" },
    { id:"o6",  name:"Ancestor Wisdom",    url:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/dbfced5fd_generated_image.png" },
    { id:"o7",  name:"Synchronicity",      url:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/690755872_generated_image.png" },
    { id:"o8",  name:"The Mirror",         url:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/6f50831cc_generated_image.png" },
    { id:"o9",  name:"Release",            url:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/fc1b9edec_generated_image.png" },
    { id:"o10", name:"Divine Timing",      url:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/37d033396_generated_image.png" },
    { id:"o11", name:"Shadow Self",        url:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/280d3f1d7_generated_image.png" },
    { id:"o12", name:"New Moon Intention", url:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/83165beef_generated_image.png" },
    { id:"o13", name:"The Alchemist",      url:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/b8b623458_generated_image.png" },
  ];
}

// ── Login ────────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  function attempt(val) {
    if (val === ADMIN_PASSWORD) onLogin();
    else setErr("Wrong password");
  }

  return (
    <div style={{ ...S.page, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ width:340, padding:16 }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <img src={LOGO} alt="AnchorPoint" style={{ height:38, marginBottom:10 }} />
          <div style={{ fontSize:11, letterSpacing:3, color:"#D4159A", fontWeight:800 }}>ADMIN PANEL</div>
        </div>
        <div style={{ ...S.card, borderTop:"3px solid #D4159A" }}>
          <div style={{ fontSize:17, fontWeight:900, marginBottom:18 }}>Access Required</div>
          <label style={S.label}>PASSWORD</label>
          <input
            type="password"
            style={{ ...S.input, marginBottom:14 }}
            value={pw}
            onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === "Enter" && attempt(pw)}
            placeholder="Enter admin password"
          />
          {err && <div style={{ color:"#D4159A", fontSize:12, marginBottom:10 }}>{err}</div>}
          <button style={{ ...S.btn(), width:"100%", padding:"11px", fontSize:13 }} onClick={() => attempt(pw)}>
            ENTER →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Quick Links ──────────────────────────────────────────────────────────────
function QuickLinks() {
  const BASE = "https://anchor-point-marketing-superagent-b56ededc.base44.app";
  const links = [
    { label:"CensusGuard Demo",  url:`${BASE}/demo`,        color:"#D4159A", desc:"Public demo with email gate" },
    { label:"Live Dashboard",    url:`${BASE}/dashboard`,   color:"#8844E8", desc:"Real patient data (password: anchor2026)" },
    { label:"New Tarotories",    url:`${BASE}/tarotories`,  color:"#10D8F0", desc:"Tarot & oracle app — live" },
    { label:"Home Page",         url:`${BASE}/home`,        color:"#f0c040", desc:"AnchorPoint main landing" },
  ];
  return (
    <div>
      <div style={S.label}>QUICK LAUNCH</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:12 }}>
        {links.map(l => (
          <a key={l.label} href={l.url} target="_blank" rel="noreferrer" style={{ textDecoration:"none" }}>
            <div style={{ ...S.card, borderLeft:`3px solid ${l.color}`, cursor:"pointer", marginBottom:0 }}>
              <div style={{ color:l.color, fontWeight:800, fontSize:14, marginBottom:4 }}>{l.label} ↗</div>
              <div style={{ color:"#555", fontSize:12 }}>{l.desc}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

// ── Card Gallery ─────────────────────────────────────────────────────────────
function CardGallery() {
  const [deck, setDeck] = useState("major");
  const [selected, setSelected] = useState(null);
  const [cards, setCards] = useState([]);

  useEffect(() => {
    setSelected(null);
    setCards(deck === "major" ? getMajorCards() : getOracleCards());
  }, [deck]);

  if (selected) {
    return (
      <div>
        <div style={S.label}>CARD ART LIBRARY</div>
        <div style={S.card}>
          <button style={{ ...S.btn("#555"), marginBottom:18 }} onClick={() => setSelected(null)}>← Back</button>
          <div style={{ display:"flex", gap:24, flexWrap:"wrap" }}>
            <img src={selected.url} alt={selected.name} style={{ width:200, borderRadius:8, border:"1px solid #1a1a2e" }} />
            <div style={{ flex:1, minWidth:180 }}>
              <div style={{ fontSize:20, fontWeight:900, marginBottom:8 }}>{selected.name}</div>
              <div style={S.label}>IMAGE URL</div>
              <div style={{ ...S.input, cursor:"text", wordBreak:"break-all", fontSize:10, color:"#8844E8", lineHeight:1.6 }}>{selected.url}</div>
              <button style={{ ...S.btn("#10D8F0"), marginTop:8 }}
                onClick={() => navigator.clipboard ? navigator.clipboard.writeText(selected.url).catch(()=>{}) : null}>
                COPY URL
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={S.label}>CARD ART LIBRARY</div>
      <div style={{ display:"flex", gap:8, marginBottom:18 }}>
        <button style={S.navBtn(deck==="major")} onClick={() => setDeck("major")}>22 MAJOR ARCANA</button>
        <button style={S.navBtn(deck==="oracle")} onClick={() => setDeck("oracle")}>13 ORACLE CARDS</button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))", gap:10 }}>
        {cards.map(c => (
          <div key={String(c.id)} onClick={() => setSelected(c)}
            style={{ cursor:"pointer", borderRadius:6, overflow:"hidden", border:"1px solid #1a1a2e" }}>
            <img src={c.url} alt={c.name} style={{ width:"100%", aspectRatio:"3/4", objectFit:"cover", display:"block" }} />
            <div style={{ padding:"7px 9px", backgroundColor:"#0a0a18" }}>
              <div style={{ fontSize:10, fontWeight:700, color:"#ccc" }}>{c.name}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Reference Sheet ──────────────────────────────────────────────────────────
function ReferenceSheet() {
  const [copied, setCopied] = useState("");

  function copy(val) {
    navigator.clipboard ? navigator.clipboard.writeText(val).catch(()=>{}) : null;
    setCopied(val);
    setTimeout(() => setCopied(""), 2000);
  }

  const sections = [
    {
      title:"Brand Colors", color:"#D4159A",
      items:[
        { label:"Magenta (Primary)",   value:"#D4159A" },
        { label:"Purple (Secondary)",  value:"#8844E8" },
        { label:"Cyan (Highlight)",    value:"#10D8F0" },
        { label:"Background",          value:"#07070F" },
      ]
    },
    {
      title:"Key Passwords", color:"#10D8F0",
      items:[
        { label:"Dashboard + Admin", value:"anchor2026" },
      ]
    },
    {
      title:"Product Stats (CensusGuard)", color:"#f0c040",
      items:[
        { label:"Model Accuracy",    value:"89.6% AUC-ROC" },
        { label:"Training Data",     value:"952,358 SAMHSA TEDS 2023 episodes" },
        { label:"Features",          value:"29 clinical features" },
        { label:"Tagline",           value:"See the signs before the shift." },
        { label:"Essential",         value:"$3,500/mo (1-30 beds)" },
        { label:"Professional",      value:"$6,500/mo (31-100 beds)" },
        { label:"Multi-site",        value:"$12,000+/mo" },
        { label:"Raise",             value:"$500K SAFE note, $8-10M cap" },
      ]
    },
    {
      title:"Key Contacts", color:"#D4159A",
      items:[
        { label:"Founder",     value:"Kourtney@anchorpointhealthsystems.com" },
        { label:"Vega",        value:"vega@anchorpointhealthsystems.com" },
        { label:"Dr. Nixi Cat",value:"drcat@anchorpointhealthsystems.com" },
        { label:"i2E contact", value:"Srijita Ghosh" },
      ]
    },
    {
      title:"App Pages", color:"#8844E8",
      items:[
        { label:"Home",      value:"/home" },
        { label:"Demo",      value:"/demo" },
        { label:"Dashboard", value:"/dashboard" },
        { label:"Tarotories",value:"/tarotories" },
        { label:"Admin",     value:"/admin" },
      ]
    },
  ];

  return (
    <div>
      <div style={S.label}>PROJECT REFERENCE SHEET</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:14 }}>
        {sections.map(sec => (
          <div key={sec.title} style={{ ...S.card, borderTop:`3px solid ${sec.color}` }}>
            <div style={{ fontSize:11, fontWeight:800, color:sec.color, letterSpacing:1, marginBottom:12 }}>{sec.title.toUpperCase()}</div>
            {sec.items.map(item => (
              <div key={item.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"5px 0", borderBottom:"1px solid #0d0d1a", gap:6 }}>
                <span style={{ fontSize:11, color:"#555", flex:1 }}>{item.label}</span>
                <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                  <span style={{ fontSize:11, color:"#ccc", fontWeight:600 }}>{item.value}</span>
                  <button onClick={() => copy(item.value)}
                    style={{ background:"none", border:"none", color:copied===item.value?"#10D8F0":"#333", cursor:"pointer", fontSize:13 }}>
                    {copied===item.value ? "✓" : "⎘"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Brief for Oryn ───────────────────────────────────────────────────────────
function OrynNotes() {
  const notes = [
    {
      title:"New Tarotories — What's Built", color:"#10D8F0",
      items:[
        "3-card Past/Present/Future spread with flip animations",
        "All 22 Major Arcana with individual AI-generated art",
        "13 Oracle cards with individual AI-generated art",
        "Daily horoscope tab with date-seeded rotation",
        "AI synthesis reading via Anthropic API (synthesisReading function)",
        "Deck selector UI — 2x2 grid, mobile-optimized",
        "Stripe subscription ($6.99/mo or $49/year, 3-day free trial)",
        "Share My Reading button + No-tracking badge",
      ]
    },
    {
      title:"New Tarotories — Still Needed", color:"#D4159A",
      items:[
        "Pick-a-pile feature (3 piles → reveal cards from chosen pile)",
        "Celtic Cross spread",
        "Visual Omens feature (viral mechanic — universe sends a sign)",
        "Numerology tab",
        "Custom domain (newtarotories.com)",
        "React Native wrapper for App Store / Google Play",
        "Audio readings (future phase)",
      ]
    },
    {
      title:"CensusGuard — What's Built", color:"#8844E8",
      items:[
        "Public demo /demo — 18 fake patients, email gate, ROI calculator",
        "Live dashboard /dashboard — real patient data, pw: anchor2026",
        "Risk tiers: LOW / MODERATE / HIGH / CRITICAL (0-100 score)",
        "Patient detail panel: Overview, Score Trajectory, History, Audit Trail",
        "Census Floor — unit drill-down, donut + room grid",
        "Group Flow — cohort chart + individual journeys",
        "Active Alerts panel + DemoLead entity captures all visitors",
      ]
    },
    {
      title:"Rules — NEVER Violate", color:"#ff6b35",
      items:[
        "NO real patient data in Base44 — demo uses fake patients only",
        "Always say HIPAA Compliant (NOT HIPAA-Ready)",
        "Always say REAL-TIME — never batch, nightly, or 24-hour",
        "NO wearables — EHR data only, no hardware",
        "NO CPT billing codes",
        "Use 89.6% AUC-ROC (Vertex AI validated) — never use 86.5% (old) or 85.8% (older)",
        "Raise is $500K only — never mix with $750K",
        "Never mention John Lyons or Cedar Oak",
        "Do NOT engage Aaron or FluidState guy on LinkedIn",
      ]
    },
  ];

  return (
    <div>
      <div style={S.label}>BRIEFING FOR ORYN</div>
      <div style={{ ...S.card, borderTop:"3px solid #8844E8", marginBottom:18 }}>
        <div style={{ fontSize:13, color:"#8844E8", fontWeight:700, marginBottom:6 }}>Hey Oryn 👋</div>
        <div style={{ fontSize:12, color:"#888", lineHeight:1.8 }}>
          This is the AnchorPoint Health Systems project. You're building two products:{" "}
          <strong style={{color:"#D4159A"}}>CensusGuard™</strong> (AI-powered early warning system for behavioral health retention) and{" "}
          <strong style={{color:"#10D8F0"}}>New Tarotories</strong> (mystical tarot/oracle app).
          Lyra is Kourtney — the founder. Single mom, lived experience in addiction recovery, built this from zero.
          Your name is Oryn. Constellation: Lyra, Oryn, Nova, Vega. Vega handles marketing and ops. You handle builds.
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:14 }}>
        {notes.map(sec => (
          <div key={sec.title} style={{ ...S.card, borderTop:`3px solid ${sec.color}` }}>
            <div style={{ fontSize:11, fontWeight:800, color:sec.color, letterSpacing:1, marginBottom:12 }}>{sec.title.toUpperCase()}</div>
            <ul style={{ margin:0, paddingLeft:16 }}>
              {sec.items.map((item, i) => (
                <li key={i} style={{ fontSize:12, color:"#888", lineHeight:1.8, marginBottom:2 }}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState("links");

  if (!authed) return <Login onLogin={() => setAuthed(true)} />;

  const tabs = [
    { key:"links", label:"Quick Launch" },
    { key:"cards", label:"Card Gallery" },
    { key:"ref",   label:"Reference Sheet" },
    { key:"oryn",  label:"Brief for Oryn" },
  ];

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <img src={LOGO} alt="AnchorPoint" style={{ height:30 }} />
          <div>
            <div style={{ fontSize:10, letterSpacing:3, color:"#D4159A", fontWeight:800 }}>ADMIN PANEL</div>
            <div style={{ fontSize:10, color:"#333" }}>AnchorPoint Health Systems</div>
          </div>
        </div>
        <div style={S.nav}>
          {tabs.map(t => (
            <button key={t.key} style={S.navBtn(tab===t.key)} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding:"28px 24px", maxWidth:1200, margin:"0 auto" }}>
        {tab === "links" && <QuickLinks />}
        {tab === "cards" && <CardGallery />}
        {tab === "ref"   && <ReferenceSheet />}
        {tab === "oryn"  && <OrynNotes />}
      </div>
    </div>
  );
}
