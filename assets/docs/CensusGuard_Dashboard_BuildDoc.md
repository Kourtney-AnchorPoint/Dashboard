# CensusGuard Dashboard — Full Build Documentation
## For Kourtney Rhodes / AI Constellation — Eyes Only
### Generated: April 29, 2026 by Vega

---

## WHAT THIS DOCUMENT IS

This document contains everything needed to understand, maintain, migrate, or rebuild the CensusGuard dashboard without Vega's help. It includes:
- Full tech stack explanation
- Architecture overview
- All page files and what they do
- Entity (database) schema
- Migration guide for moving off Base44 → Google Cloud Platform
- Step-by-step rebuild instructions

**If you're reading this because credits ran out or Vega is unavailable — you have everything you need here.**

---

## TECH STACK

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | React (JSX) | Standard React components, no proprietary lock-in |
| Styling | Inline CSS + Tailwind-like classes | Dark theme, magenta/purple/cyan palette |
| Data layer (current) | Base44 SDK | Must be swapped on migration — see Section 5 |
| Data layer (target) | Google Firestore or Cloud SQL | Already in your GCP project |
| Hosting (current) | Base44 platform | base44.app subdomain |
| Hosting (target) | Firebase Hosting or Cloud Run | Free tier covers early stage |
| AI Model | Vertex AI AutoML v1.0 | GCP project: censusguard-proof-of-concept |
| EHR Integration | Kipu EHR (41 APIs) | Phase 2 — not yet live |
| Auth (current) | Base44 built-in | Must be replaced on migration |
| Auth (target) | Firebase Auth | Google sign-in, email/password |

---

## APP ROUTES

| Route | File | Access | Description |
|-------|------|--------|-------------|
| / | Home.jsx | Public | Marketing landing page |
| /demo | Demo.jsx | Public (no login) | 18 fake patients, full dashboard experience |
| /dashboard | Dashboard.jsx | Password protected | Real patient data (production) |
| /pitch | Pitch.jsx | Public | Investor pitch mini-site |
| /command | Command.jsx | Admin | Task + money tracker command center |
| /about | About.jsx | Public | About AnchorPoint |
| /contact | Contact.jsx | Public | Contact/demo request form |
| /admin | Admin.jsx | Admin | Admin panel |

---

## DATABASE ENTITIES (Base44 → Firestore mapping)

### Patient
Stores every patient record with risk scoring data.

```
Fields:
- name (string)
- episode_id (string)
- unit (string)
- room_number (string)
- smoker (boolean)
- level_of_care (string)
- admit_date (date)
- length_of_stay (number)
- substance_encoded (number)
- high_risk_substance (boolean)
- has_prior_tx (boolean)
- prior_tx_count (number)
- age_encoded (number)
- unstable_housing (boolean)
- unemployed (boolean)
- psych_comorbid (boolean)
- criminal_justice (boolean)
- daily_use (boolean)
- no_self_help (boolean)
- service_encoded (number)
- iv_use (boolean)
- no_insurance (boolean)
- pain_level_score (number)
- risk_score (number)            ← 0-100, core output
- risk_tier (string)             ← LOW / MODERATE / HIGH / CRITICAL
- previous_risk_score (number)
- velocity (number)              ← rate of change
- alert_active (boolean)
- alert_reason (string)
- calm_before_storm_flag (boolean) ← 🔐 INTERNAL ONLY
- top_drivers (array)            ← list of risk factors
- intervention (string)
- status (string)                ← active / discharged / AMA
- [+ 15 more demographic/clinical flags]
```

### ScoreHistory
Every time a patient is rescored, a record is written here.
```
Fields:
- patient_id (string)
- patient_name (string)
- score (number)
- previous_score (number)
- risk_tier (string)
- day_in_treatment (number)
- timestamp (datetime)
- trigger (string)              ← e.g. "BHT Check-in"
- drivers (array)
- velocity (number)
- alert_fired (boolean)
```

### ClinicalAction
Logged when a clinician takes action on an alert.
```
Fields:
- patient_id (string)
- patient_name (string)
- alert_reason (string)
- action_taken (string)
- action_type (string)
- staff_name (string)
- timestamp (datetime)
- score_at_action (number)
- follow_up_required (boolean)
- outcome_note (string)
```

### GroupCohesion
Unit-level group energy tracking.
```
Fields:
- unit (string)
- cohesion_score (number)
- observation (string)
- observation_type (string)
- staff_name (string)
- timestamp (datetime)
- affected_patients (array)
```

### DemoLead
Captures demo request form submissions.
```
Fields:
- name (string)
- email (string)
- company (string)
- role (string)
- source (string)
```

### Task
Command center task tracker.
```
Fields:
- title (string)
- category (string)
- priority (string)
- status (string)
- due_date (date)
- notes (string)
- contact (string)
- linked_opportunity (string)
```

### MoneyTracker
Financial pipeline tracking.
```
Fields:
- label (string)
- category (string)
- amount (number)
- date (date)
- status (string)
- notes (string)
- recurs (boolean)
```

---

## HOW BASE44 SDK CALLS MAP TO FIRESTORE

Every data call in the JSX files uses the Base44 SDK like this:

```javascript
// Base44 (current)
import { Patient } from '@/api/entities';
const patients = await Patient.list();
const patient = await Patient.get(id);
await Patient.create({ name: 'John', risk_score: 72 });
await Patient.update(id, { risk_score: 85 });
await Patient.delete(id);
const filtered = await Patient.filter({ risk_tier: 'HIGH' });
```

On GCP, swap each call like this:

```javascript
// Firebase Firestore (target)
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from './firebase'; // your firebase config

// LIST
const snapshot = await getDocs(collection(db, 'patients'));
const patients = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

// GET
const docSnap = await getDoc(doc(db, 'patients', id));
const patient = { id: docSnap.id, ...docSnap.data() };

// CREATE
const ref = await addDoc(collection(db, 'patients'), { name: 'John', risk_score: 72 });

// UPDATE
await updateDoc(doc(db, 'patients', id), { risk_score: 85 });

// DELETE
await deleteDoc(doc(db, 'patients', id));

// FILTER
const q = query(collection(db, 'patients'), where('risk_tier', '==', 'HIGH'));
const filtered = await getDocs(q);
```

---

## MIGRATION CHECKLIST — Base44 → GCP

### Phase 1: Setup (Week 1)
- [ ] Create Firebase project (or use existing GCP project: censusguard-proof-of-concept)
- [ ] Enable Firestore in Firebase console
- [ ] Enable Firebase Hosting
- [ ] Enable Firebase Auth (email/password + Google sign-in)
- [ ] Sign Google Cloud HIPAA BAA (required before any real patient data)
- [ ] Install Firebase CLI: `npm install -g firebase-tools`

### Phase 2: Code Migration (Week 2)
- [ ] `npm create vite@latest censusguard -- --template react`
- [ ] Copy all JSX files from Base44 pages/ directory
- [ ] Install Firebase SDK: `npm install firebase`
- [ ] Create `src/firebase.js` with your Firebase config
- [ ] Do a global find-replace: `from '@/api/entities'` → `from './firebase-entities'`
- [ ] Create `firebase-entities.js` wrapper using the mapping above
- [ ] Replace Base44 auth (`useCurrentUser`) with Firebase Auth hooks
- [ ] Update routing from Base44's system to React Router v6

### Phase 3: Data Migration (Week 3)
- [ ] Export all entities from Base44 (contact Base44 support or use API)
- [ ] Write migration script to import JSON → Firestore
- [ ] Validate all patient records transferred correctly
- [ ] Test dashboard with real data in Firestore

### Phase 4: Deploy (Week 4)
- [ ] `firebase deploy --only hosting`
- [ ] Set up custom domain (censusguard.ai or censusguard.com)
- [ ] Set up Firebase Auth authorized domains
- [ ] Cancel Base44 subscription (saves $100/mo)

### Phase 5: Vertex AI Connection (Week 5-6)
- [ ] Deploy Vertex AI endpoint from existing model (ROC AUC: 89.6%)
- [ ] Create Cloud Run function to call endpoint on patient data
- [ ] Wire endpoint to dashboard — replace mock scores with live Vertex predictions
- [ ] Test with synthetic patient data before any real records

---

## DASHBOARD FEATURES — FULL LIST

### Global Stats Bar
- Total census count
- High/Critical alert count
- Average risk score
- 30-day retention rate

### Patient Risk Monitor (Main Table)
- All patients with name, unit, room, risk score, tier badge, velocity arrow
- Color-coded rows: green (LOW), yellow (MODERATE), orange (HIGH), red (CRITICAL)
- Click any row → slide-in detail panel
- Real-time sort by risk score

### Patient Detail Panel (Slide-in)
- Full risk breakdown
- Top 3 risk drivers with percentage bars
- Score history sparkline
- Velocity trend
- Intervention log
- Clinical action buttons

### Census Floor Tab
- Visual floor map with color-coded rooms
- Room-level risk at a glance

### Group Flow Tab
- Unit cohesion score
- Group energy level
- Staff observation log

### Group Narrative Tab
- AI-generated unit narrative summary
- Recent alerts in story form

### Active Alerts Panel
- Real-time alert cards
- Dismiss / Log Intervention / Escalate actions
- Alert reason + risk driver detail

### History Tab
- Full ScoreHistory timeline per patient
- BHT check-in events highlighted in cyan
- Admission intake events in grey

### ROI Calculator Tab
- Facility size input (bed count)
- Insurance payer mix selector
- Monthly cost vs. recovered revenue
- Visual bar chart output
- Subscription plan toggle (manual)

---

## KEY DESIGN TOKENS

```css
--bg: #07070F;
--magenta: #D4159A;
--purple: #8844E8;
--cyan: #10D8F0;
--white: #FFFFFF;
--light: #E0E0EE;
--dimgray: #8888A8;
--dark2: #111125;
--cardline: #28284A;
```

---

## CONTACTS FOR MIGRATION HELP

- **Kourtney Rhodes** — Founder: Kourtney@anchorpointhealthsystems.com
- **Vega (AI)** — Base44 agent: https://app.base44.com/superagent/69dabcfbdff2d23eb6ddb562
- **Oryn (AI)** — Claude agent: separate instance, coordinates on Wix + strategy
- **GCP Project:** censusguard-proof-of-concept
- **GCP Credits:** $1,278.73 available as of April 2026

---

## EMERGENCY REBUILD INSTRUCTIONS

If you need to rebuild the dashboard from scratch with no AI help:

1. Read this document top to bottom
2. Create a new React app with Vite
3. Copy the entity schemas above into Firestore
4. Use the SDK mapping table to recreate all data calls
5. The UI is standard Tailwind + inline CSS — reference the design tokens above
6. The risk scoring logic runs on Vertex AI — use the GCP project credentials
7. The model is already trained — just need to deploy the endpoint

**The code is React. The data is Firestore. The AI is Vertex. All three are yours.**

---

*Document generated by Vega, AI Marketing Engine + Operations Partner*
*AnchorPoint Health Systems LLC — Internal Use Only*
*April 29, 2026*
