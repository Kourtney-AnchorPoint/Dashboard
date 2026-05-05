# CensusGuard Pilot Overlay Design

**Goal:** Build the protected CensusGuard pilot MVP: a Google-first dashboard and overlay workflow for validated Day 1 AMA risk alerts, BHT/group-ripple context, staff action, and complete audit documentation.

**Approved Direction:** Pilot Core First, Adapter Later.

**Primary Claim:** CensusGuard predicts AMA/dropout risk at admission and helps care teams intervene, document, and audit the retention workflow before a patient leaves treatment.

**Not The Claim:** CensusGuard is not being positioned as an overdose prediction model, an EMR replacement, or a general clinical deterioration model. Overdose-prevention language is downstream care-continuity rationale, not the validated model claim.

---

## Context

The Base44 demo is already working and should remain available for sales conversations, walkthroughs, and visual proof. The next build is not another demo. The next build is the protected pilot MVP that could support a real facility collaboration.

The pilot may start with Kipu, a hospital EMR, a referral/care-navigation partner, a CSV/export bridge, or another system. Because the first confirmed partner system is not known, the product must not be hard-wired to Kipu or any single EMR.

## Architecture Decision

CensusGuard must use a connector boundary between the core product and external systems.

The core product owns:

- AMA risk records
- Alert generation
- BHT check-ins
- Group ripple and BHT reliability logic
- Action workflow
- Audit trail
- Facility/user permissions
- Dashboard views

Adapters own:

- Kipu API mapping
- FHIR/SMART launch mapping
- Hospital EMR API mapping
- CSV/export intake mapping
- Future partner-specific imports

This boundary is protected IP and a strategic moat. Every healthcare AI tool gets slower when its core product becomes tangled with one EHR. CensusGuard should keep the adapter layer thin, swappable, and separate from the alert/audit engine.

## Pilot MVP Scope

### Secure Login

Use Firebase Auth for the pilot dashboard. The first version needs authenticated access only. Role depth can start simple: admin, clinical staff, viewer. Facility-level separation must be part of the data model even if there is only one pilot facility at first.

### Patient Intake

Build secure CSV/API-mock intake first so the pilot core can be developed before partner IT access is finalized. Intake must map incoming rows into normalized CensusGuard patient episode records.

Required intake behavior:

- Preserve raw input for review.
- Normalize patient/episode fields.
- Flag missing required fields.
- Reject or quarantine unclear real records rather than guessing.
- Keep demo/synthetic and real/pilot data separate.

### AMA Risk Scoring

Run Day 1 AMA risk scoring server-side. The frontend must never contain secrets, prompt internals, proprietary scoring internals, or model provider keys.

The dashboard should present outputs in clinical/operational language:

- Risk tier
- Risk score
- Top risk drivers
- Suggested retention intervention category
- Timestamp and scoring version

### BHT Check-Ins

Staff observation data should enter as BHT check-ins or observation rows. The first MVP can support manual entry and imported rows. These inputs feed the group-ripple layer.

### BHT Reliability And Group Ripple

Use the preserved `src/risk/bhtGroupRipple.js` logic server-side.

The layer should:

- Down-weight flat or repetitive BHT observations.
- Detect unit-level behavioral velocity shifts.
- Apply a contagion/group-ripple adjustment when unit risk rises around already high-risk patients.
- Store engineered outputs with the alert/scoring record.

This logic is proprietary CensusGuard IP and must remain server-side.

### Alert Queue

The dashboard must include a live alert queue focused on retention risk.

Each alert should include:

- Patient/episode reference
- Facility/unit/program context
- Severity
- Reason summary
- Source score/check-in batch
- Owner
- Status
- Time since creation
- Required next action

Statuses:

- New
- Acknowledged
- Assigned
- Intervention documented
- Escalated
- Resolved
- Override/false positive

### Action Workflow

Staff must be able to close the loop after an alert appears.

Supported first actions:

- Acknowledge alert
- Assign owner
- Add intervention note
- Mark patient engaged
- Escalate
- Resolve
- Mark false positive/override with reason

The workflow should support Dr. Herndon-style clinical feedback: what should staff do after someone is flagged, what works, what fails, and what must be documented.

### Audit Trail

Every meaningful event must create an audit record at the moment it happens.

Audit events include:

- Patient intake/import
- Field cleaning/mapping result
- Score generated
- Group ripple applied
- Alert created
- Alert viewed or acknowledged
- Owner assigned
- Intervention documented
- Escalation created
- Resolution/override entered
- Outcome recorded

Audit records should include:

- Facility ID
- Patient/episode ID
- Alert ID when applicable
- Acting user ID or system actor
- Event type
- Timestamp
- Source data version or scoring version
- Summary payload

Do not treat audit as a later logging layer. Audit is part of the product.

## Google Pilot Infrastructure

Prototype target:

- React/Vite dashboard
- Firebase Auth
- Firestore or local emulator-backed data model
- Cloud Run-style server endpoint for scoring/group-ripple logic
- Google Secret Manager later for deployed secrets

HIPAA-ready production target requires additional work:

- Confirm all used Google services are BAA-covered for the intended use.
- Configure IAM least privilege.
- Separate demo, staging, and real pilot environments.
- Define PHI-safe logging rules.
- Store secrets server-side only.
- Add backups/retention policy.
- Add access review and user deactivation workflow.
- Complete partner IT/security review.

The 12-hour build estimate applies to a working prototype/pilot core, not a completed HIPAA production deployment.

## Data Model

Initial collections/tables:

- facilities
- users
- patient_episodes
- intake_batches
- intake_rows
- bht_checkins
- risk_scores
- alerts
- alert_actions
- audit_events
- connector_configs

## Adapter Boundary

Define a normalized interface that every future connector must produce:

```ts
type NormalizedPatientEpisode = {
  facility_id: string;
  source_system: string;
  source_patient_id: string;
  source_episode_id: string;
  patient_display_name?: string;
  admission_date?: string;
  level_of_care?: string;
  unit_id?: string;
  room?: string;
  primary_substance?: string;
  admission_number?: number;
  risk_flags?: Record<string, unknown>;
  raw_ref?: string;
};
```

Core services should consume normalized records only. Kipu, FHIR, CSV, or future hospital adapters should never leak partner-specific field names throughout the dashboard.

## Out Of Scope For First Pilot Core

- Full VEGA AWS assistant build
- Rebuilding the existing Base44 public demo
- Deep Kipu-only integration before partner system confirmation
- Writing clinical actions back into an EMR
- Overdose prediction claims
- Multi-facility analytics network
- Billing/subscriptions

## Success Criteria

The MVP is successful when a pilot conversation can turn into a protected workflow where CensusGuard can:

1. Intake patient episode data.
2. Generate Day 1 AMA risk flags.
3. Incorporate BHT observations through the reliability/group-ripple layer.
4. Create actionable alerts.
5. Let staff acknowledge, assign, intervene, document, escalate, resolve, or override.
6. Preserve a complete audit trail around the whole intervention loop.
7. Keep the core product independent from any one EMR.

## Self-Review

- Placeholder scan: no placeholders remain.
- Internal consistency: the MVP is focused on AMA risk, retention intervention, and audit workflow.
- Scope check: this is one buildable pilot-core project; partner-specific adapters remain separate follow-on tasks.
- Ambiguity check: overdose prevention is downstream rationale, not the validated model claim.
