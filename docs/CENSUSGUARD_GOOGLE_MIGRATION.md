# CensusGuard Google Cloud Migration

CensusGuard is a protected product/dashboard built by Kourtney and VEGA. It should be migrated off Base44 as its own Google Cloud-first system.

## Migration Goal

Move the CensusGuard dashboard, risk scoring workflow, schemas, product surfaces, and brand assets into a self-owned, private codebase deployable on Google Cloud.

## Two-System Rule

CensusGuard must be built with two clearly separated environments:

1. Demo CensusGuard
   - Synthetic data only
   - Safe for pilots, screenshots, investor walkthroughs, and facility demos
   - Shows value, workflow, and product experience
   - Does not expose real patient data, real facility data, proprietary scoring internals, or raw prompts

2. Real CensusGuard
   - Protected production system
   - Real customer/facility accounts only after security, auth, compliance, and legal review
   - Server-side secrets only
   - Strict audit logs
   - No commingling with demo data

## Current Recovered Pieces

Source snapshot:

```text
exports/base44/
  pages/
  functions/
  entities/
assets/
  docs/
  images/
  scripts/
```

Dashboard build docs:

- `assets/docs/Migrate_dashboard_Doc.pdf`
- `assets/docs/CensusGuard_Dashboard_BuildDoc.pdf`
- Summary: `docs/DASHBOARD_BUILD_DOC_SUMMARY.md`

Core CensusGuard files:

- `exports/base44/pages/Dashboard.jsx`
- `exports/base44/pages/Demo.jsx`
- `exports/base44/pages/Pitch.jsx`
- `exports/base44/pages/Admin.jsx`
- `exports/base44/pages/Trainer.jsx`
- `exports/base44/functions/scorePatient.ts`
- `src/data-cleaning/patientCleaner.js`
- `exports/base44/entities/Patient.json`
- `exports/base44/entities/ScoreHistory.json`
- `exports/base44/entities/ClinicalAction.json`
- `exports/base44/entities/GroupCohesion.json`

## Google Cloud Target Architecture

VEGA's dashboard build document points to a Firebase/Firestore-first migration path.

Demo:

- Frontend: React dashboard hosted on Firebase Hosting
- Backend: Firebase/Firestore wrapper first; Cloud Run for scoring/model endpoints
- Database: Firestore synthetic seed data
- Object storage: Cloud Storage for demo assets
- Secrets: Google Secret Manager
- Logs: Cloud Logging
- Model calls: server-side only, optional deterministic fallback for demo reliability

Real:

- Frontend: authenticated React dashboard
- Backend: Firebase Auth + Firestore wrapper + Cloud Run scoring/model endpoints
- Database: Firestore first if following VEGA's doc; Cloud SQL/Postgres remains an option if audit/relational needs outgrow Firestore
- Object storage: private Cloud Storage buckets
- Secrets: Google Secret Manager
- Logs: Cloud Logging with PHI-safe logging rules
- Audit trail: application-level immutable-ish audit records in Postgres
- Model calls: server-side only

## Data Model Candidates

- patients
- score_history
- clinical_actions
- group_cohesion_observations
- demo_leads
- users
- facilities
- facility_units
- audit_events
- data_import_batches
- data_import_rows

## Security And IP Defaults

- Private repo
- Private Google Cloud project
- No public patient data
- Synthetic demo data only
- Separate demo and real databases
- Separate demo and real cloud projects or at least hard-separated environments
- No API keys in frontend code
- No risk-scoring prompts or rule internals in public demos
- Encrypt database/storage at rest
- Restrict IAM by least privilege
- Separate dev/staging/prod

## First Build Path

1. Create the demo app first with synthetic data.
2. Create a Vite React app.
3. Copy recovered Base44 JSX pages into the app.
4. Add Firebase, React Router, and a Firebase entity wrapper.
5. Replace Base44 entity calls while keeping the same frontend method names.
6. Add data cleaning/intake before scoring.
7. Port `scorePatient.ts` into a server-side Cloud Run or Firebase callable endpoint.
8. Build demo Firestore collections and seed synthetic demo data.
9. Deploy first private demo to Firebase Hosting.
10. Design the real production schema separately, with stricter security assumptions.
11. Add auth before sharing with anyone outside the build team.
12. Promote proven demo features into the real system only after review.

## Open Decisions

- Firebase Hosting vs Cloud Run for frontend
- Cloud SQL/Postgres vs Firestore for first version
- Auth provider: Google Identity Platform, Firebase Auth, Auth0, or custom
- Whether risk scoring should use Anthropic, Google Vertex AI, OpenAI, or pluggable model providers
- Whether CensusGuard and VEGA share a single identity/account system

## Non-Negotiables

- CensusGuard IP stays protected.
- Real patient/facility data does not enter demos.
- Demo data and real data never share tables.
- Clinical claims must be tracked to supporting documentation.
- Risk scoring logic and prompts stay server-side.
- Public pages should show value and product story, not proprietary internals.
