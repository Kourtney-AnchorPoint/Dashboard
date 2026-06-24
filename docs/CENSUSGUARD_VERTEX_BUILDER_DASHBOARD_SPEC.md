# CensusGuard POC Dashboard - Builder Specification for Google Vertex / Cloud Run

Updated: June 23, 2026

## Plain-English Purpose

CensusGuard is currently a proof-of-concept / pilot dashboard. It is not yet the final production clinical system. The purpose of this build is to demonstrate the core CensusGuard workflow:

1. Detect rising patient risk.
2. Alert staff before the patient walks out.
3. Guide the clinical intervention.
4. Document who did what, when they did it, and what happened.
5. Feed the outcome back into the system so the next risk score is smarter.

This is the CensusGuard Infinity Loop: detect, alert, intervene, document, prove, learn.

The current dashboard should use simulated, synthetic, or de-identified data only unless production HIPAA controls, BAAs, access governance, audit logging, data retention, and PHI handling procedures are finalized.

## Recommended Google Architecture

Use Google Cloud for the CensusGuard POC because the ML model endpoint is already in Vertex AI.

Current known Google resources:

- Project: `censusguard-proof-of-concept`
- Project number: `141425789074`
- Vertex AI region: `us-south1`
- Vertex AI endpoint ID: `6906353591456366592`
- Vertex endpoint URL:
  `https://us-south1-aiplatform.googleapis.com/v1/projects/141425789074/locations/us-south1/endpoints/6906353591456366592:predict`
- Cloud Run dashboard service name used during testing: `dashboard-service`
- Recommended deployment region: `us-south1`

## Important Security Rule

The browser frontend must not call Vertex AI directly with Google credentials.

Use a backend bridge instead:

- React dashboard calls `/api/score`.
- Cloud Run backend receives the request.
- Backend uses Google service account permissions to call Vertex AI.
- Backend returns the prediction to the dashboard.

This keeps credentials off the user browser and avoids exposing sensitive service account access.

## Required Dashboard Sections

The dashboard should be built as a real app with pages and tabs. Do not make everything one long page.

Primary app areas:

- Patient Monitor
- Census Floor
- Group Flow
- Narrative / Group Notes
- Alerts
- Outcomes
- MOUD
- Learn / Intervention Learning
- Staff Docs
- Psych / Medical Provider View
- Settings / Account Management

The user preference is: if something appears on screen, it should generally be clickable and should open deeper context.

## Global Dashboard Header

The header should show:

- CensusGuard brand/logo
- "CensusGuard Infinity System" positioning
- Search patient box
- Real-time scoring status
- Clinical Command Center button
- Outcomes button
- Staff Docs button
- CTA button for implementation/demo access

Top metrics should include:

- Open alerts
- Critical patients
- High-risk patients
- Average risk score
- Audit coverage
- Revenue protected, if included, should be clearly labeled as illustrative POC logic

Do not use outdated ROI language such as the old `$6,000` footer. Remove outdated logo/assets.

## Closed-Loop Intervention Map

Add a visible closed-loop map across the app:

1. Detect
2. Alert
3. Intervene
4. Document
5. Prove
6. Learn

Requirements:

- Each step must be clickable.
- The current step should glow or be visually active.
- Clicking a step should navigate to the matching section or open its detail panel.
- The map should make it obvious that CensusGuard is not just scoring risk; it closes the loop after staff action and outcome documentation.

## Patient Monitor

Purpose:

Show all active patients ranked by risk and velocity.

Required fields:

- Patient name
- Counselor
- Unit / level of care
- Room, if inpatient/residential
- Day in treatment
- Primary substance / condition category
- Risk score
- Risk tier
- Velocity
- Trend sparkline
- Last staff check-in
- Flags

Filters:

- Tier filter
- Counselor filter
- Site / level-of-care filter
- Sort by risk score
- Sort by velocity

Required interactions:

- Clicking a patient opens the patient drawer or patient detail page.
- Clicking counselor should filter or open counselor caseload.
- Clicking flags should explain the signal.
- Patients with fast-rising velocity should have a subtle glow.

## Patient Drawer / Patient Detail Page

The patient drawer is one of the most important parts of the app.

Required tabs:

- Overview
- MI Guide
- Meds
- Nursing
- Trajectory
- Score History
- Staff Action Loop
- Audit Trail

Header should show:

- Patient name
- Room / unit / level of care
- Day in treatment
- Current score
- Current tier
- Back button
- Close button
- Fullscreen / collapse toggle

Overview should include:

- Active alert
- Clinical guidance
- Peer relationships
- Roommates
- Known prior relationship risks
- Velocity
- Admission number
- Prior treatment count
- Substance
- Pain score
- Psychiatric comorbidity
- Housing instability
- Cliff window
- Known peer
- Smoker status
- Last check-in
- Room

Click behavior:

- Every visible patient name should open that patient.
- Every visible peer/roommate should open that peer patient when available.
- Every flag should explain why it matters.
- The drawer can become full-screen for deeper review.

## MI Guide

Purpose:

Give staff a motivational interviewing guide, not a script.

Required checklist:

- Open with empathy, not urgency.
- Explore ambivalence openly.
- Elicit change talk.
- Affirm patient strength.
- Revisit the patient's "why."
- Collaborate on the next step.
- Notify supervisor and document.

Each item should be expandable/clickable.

## Meds / MAR Tab

Purpose:

Show medication administration and adherence signals.

Required:

- Active orders count
- Last MAR entry
- Adherence flags
- Medication list
- Route
- Dose
- Schedule
- Prescriber
- Last administered date/time
- Adherence status
- Notes

Adherence flags should contribute to risk logic when clinically relevant.

## Nursing Tab

Purpose:

Show nursing vitals, withdrawal scores, pain, and shift notes.

Required:

- Latest BP
- HR
- RR
- Temperature
- SpO2
- COWS or CIWA score
- Pain score
- Shift notes
- Nurse name
- Timestamp
- Threshold highlighting

Clinical examples:

- HR > 100 should flag.
- COWS >= 12 should flag severe withdrawal risk.
- High pain score should contribute to risk and intervention urgency.

## Trajectory and Score History

Purpose:

Show why the patient score is rising or falling.

Required:

- Risk score timeline
- Actual score line
- Forecast line
- Alert-fired markers
- Admission score
- Current score
- Net change
- Velocity
- Alerts fired
- Days in treatment
- Trigger tags for each score movement

Score history should show:

- Date/time
- Score
- Change in points
- Tier
- Trigger
- Relevant tags
- Whether an alert fired

## Staff Action Loop

Purpose:

Show the accountability layer: who saw the alert, what they did, when they did it, and what happened.

Required:

- Staff role
- Staff name or staff ID
- Timestamp
- Note text
- Tags
- Signal quality
- Risk ripple contribution
- High-signal / low-detail markers

The system should detect low-detail notes. In the POC, this can be simulated with:

- Suspiciously short note length
- Repeated note patterns
- Low variance in wording

Low-signal notes should prompt follow-up before the loop advances.

## Audit Trail

Purpose:

Show that the clinical loop was documented.

Required loop states:

- Detect
- Alert
- Intervene
- Document
- Prove

Required action form:

- Action status
- Intervention note
- Staff action
- Patient response
- Score at action
- Save action and advance loop

The audit trail should show previous actions in chronological order.

## Census Floor

Purpose:

Show risk by unit, room, and proximity.

Required units:

- Detox
- Residential
- PHP
- IOP

Required behavior:

- Room cards are clickable.
- Clicking a room opens the highest-risk patient in that room.
- If a unit has no rooms, such as IOP, show a list view.
- Display room proximity warnings.
- Display group ripple warnings.
- Display seven-day forecast layer.
- Display projected high-risk departures.

## Group Flow

Purpose:

Show cohort-level risk and level-of-care movement.

Required stages:

- Detox
- Residential
- PHP
- IOP
- Discharge / outpatient step-down

Required views:

- All Together
- By Level of Care

Required logic:

- Group average risk trend
- Forecast
- Group cohesion score
- Cohesion drop warnings
- Peer/ripple signals
- Level-of-care stage movement

## Narrative / Group Notes

Purpose:

Track group observations and clinical narratives that may affect risk.

Required fields:

- Observation type
- Unit
- Staff name
- Timestamp
- Observation text
- Cohesion score, if available

Observation types may include:

- Conflict
- Clinical Note
- Positive
- Group Milestone
- Cohesion Drop
- Warning
- Alert

Narrative entries should influence cohort and patient risk in the POC logic.

## Alerts Page

Purpose:

Act as the clinical command center.

Required:

- Active alerts
- Alert severity
- Patient
- Trigger reason
- Recommended intervention
- Assigned staff
- Alert age
- Status

Click behavior:

- Clicking alert opens patient drawer.
- Clicking trigger explains the signal.
- Clicking recommended intervention opens MI / action guidance.

## Outcomes Page

Purpose:

Show whether interventions worked.

Required:

- Active alerts
- Critical risk count
- Improving patient count
- Average length of stay
- Intervention outcomes
- Score before intervention
- Score after intervention
- Outcome status
- What worked
- What did not work
- Lessons learned

The outcomes page should not just be business ROI. It must show clinical feedback into the loop.

## MOUD Tab

This tab must be updated for the BayMark / residential story.

Do not use `56.7%` on this tab. That number includes outpatient and should not be used for this inpatient/residential/PHP/IOP comparison.

Headline stat:

MOUD patients in long-term residential leave AMA at 43.7% - nearly 8 points higher than non-MOUD patients in the same setting.

Supporting line:

The gap is not clinical failure. It is a systems visibility failure. CensusGuard catches the signal before it becomes a walkout.

Required chart:

Side-by-side bar chart, MOUD vs No MOUD, one bar pair per setting. The chart should feel like a staircase, with the gap widening down the continuum.

Exact numbers:

| Setting | No MOUD AMA | MOUD AMA |
|---|---:|---:|
| Inpatient Detox | 17.6% | 19.4% |
| Short-term Residential | 27.7% | 31.6% |
| Long-term Residential | 35.7% | 43.7% |
| PHP / IOP | 51.6% | 62.2% |

Visual rules:

- Brand colors only.
- Use magenta and cyan on black.
- No green.
- No teal.

## Learn / Intervention Learning

Purpose:

Let staff log interventions and teach the system what worked.

Required fields:

- Patient name
- Risk tier
- Intervention type
- Intervention notes
- Outcome
- What worked
- What did not work
- Outcome notes
- Lessons learned
- Staff name
- Score before
- Score after
- Tags

Intervention types:

- MI 1:1 Session
- MAT Consult
- Family Outreach
- Care Plan Adjustment
- Peer Separation
- Psych Referral
- Pain Management
- Housing Support
- Vocational Support
- Other

## Staff Docs

Purpose:

Show staff-facing documentation and accountability.

Required:

- Staff note stream
- Staff action loop
- Reliability / signal quality indicator
- Low-detail note prompts
- Intervention history
- Assigned caseload
- Counselor filter support

Staff Docs must be clickable. Clicking a staff note should open the related patient and action context.

## Psych / Doctors Section

The dashboard needs a Psych / Medical Provider section.

Purpose:

Show provider-level interventions and clinical-medical accountability.

Required:

- Psychiatric provider notes
- MAT / MOUD consults
- Medication changes
- Withdrawal management decisions
- Pain management concerns
- Psych comorbidity flags
- Provider follow-up tasks
- Pending consults
- Completed consults

Click behavior:

- Clicking a provider task opens the patient drawer.
- Clicking a consult opens meds, nursing, and audit context.
- Psych Referral from Learn should link to this provider section.

## Settings / Account Management

Required:

- Account settings
- Organization / facility settings
- User role settings
- Secure account deletion workflow
- Multi-step confirmation for destructive actions

For production later:

- Role-based access control
- Audit logs
- User provisioning
- SSO if required by enterprise customers

## Data Objects to Model

POC can use local/static data, but production should model these as database tables.

Core tables:

- Patient
- RiskScoreHistory
- InterventionLog
- StaffActionLog
- ClinicalAlert
- NursingNote
- Medication / MAR
- NarrativeObservation
- ProviderConsult
- DemoVisit / AnalyticsEvent, for demo analytics only

Patient fields should include:

- Patient ID
- Name or de-identified label
- Unit / level of care
- Room number
- Length of stay
- Risk score
- Risk tier
- Velocity
- Counselor
- Last staff check-in
- Alert active
- Cliff window flag
- Calm-before-storm flag
- Known peers
- Substance / condition category
- Psych comorbidity
- Housing instability
- Pain score
- MOUD status

## Vertex AI Request Flow

Frontend should call:

`POST /api/score`

Backend should:

1. Receive a patient or batch of patient feature rows.
2. Clean and validate the payload.
3. Map frontend fields to Vertex model feature columns.
4. Call the Vertex endpoint.
5. Return prediction output to the dashboard.
6. Log only non-PHI operational metadata in POC logs.

Expected backend environment variables:

- `GOOGLE_CLOUD_PROJECT`
- `VERTEX_LOCATION=us-south1`
- `VERTEX_ENDPOINT_ID=6906353591456366592`

If the dashboard is deployed to Cloud Run in the same Google project, use a service account with permission to call Vertex AI prediction.

## Data Cleaning Logic

The builder should reserve a dedicated data-cleaning layer before scoring.

This layer should:

- Validate required feature columns.
- Convert strings/numbers consistently.
- Handle missing values.
- Reject impossible values.
- Map facility UI labels to model feature names.
- Produce a clean payload for Vertex AI.

The data-cleaning layer should be separate from UI components.

## POC vs Production Boundary

POC allowed:

- Simulated patients
- De-identified records
- Mock intervention outcomes
- Static demo data
- Vertex scoring tests with non-PHI inputs
- Cloud Run proof of wiring

Production required before live PHI:

- Signed BAAs
- HIPAA-aligned infrastructure
- PHI-safe logging
- Access control
- Audit logging
- Retention policy
- Incident response policy
- Data deletion process
- User roles and permissions
- Security review
- Compliance review

## Monitoring / Datadog

Datadog can be used for observability, but do not send PHI into logs.

Track:

- Service uptime
- API errors
- Vertex response errors
- Prediction latency
- Cloud Run cold starts
- Failed score attempts
- Non-PHI event counts

Do not log:

- Patient names
- Patient notes
- Full clinical narratives
- Medication details tied to identifiable patients
- Raw PHI payloads

## Design Direction

Visual style:

- Dark clinical command center.
- Black base.
- Magenta/cyan highlights.
- Purple is acceptable as a secondary accent.
- Avoid green/teal on the MOUD tab.
- Avoid old ROI/footer language.
- Keep the UI dense enough for operators, not a marketing page.

UX rule:

If the user sees a patient, alert, staff note, room, provider task, or risk signal, it should be clickable and should show deeper context.

## Build Acceptance Checklist

Before calling the dashboard ready, confirm:

- App builds without errors.
- App runs locally.
- Cloud Run build succeeds.
- `/api/score` exists.
- `/api/score` can call Vertex or returns a clear fallback error.
- Patient Monitor opens patient detail.
- Census Floor room cards open patients.
- Alerts open patients and guidance.
- Staff Docs entries open patient/action context.
- Patient drawer has Overview, MI, Meds, Nursing, Trajectory, Score History, Staff Action Loop, and Audit Trail.
- Closed-loop map is clickable and current step glows.
- MOUD tab uses the new four-setting numbers and does not show 56.7%.
- Psych / provider section exists.
- No live PHI is stored or logged in the POC.

## One-Sentence Builder Summary

Build CensusGuard as a Google Cloud Run + Vertex AI proof-of-concept dashboard that demonstrates the full closed-loop clinical workflow: identify rising risk, alert staff, guide intervention, document action, measure outcome, and feed that outcome back into the next score.
