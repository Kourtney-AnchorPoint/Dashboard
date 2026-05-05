# CensusGuard Endpoint Map

This maps recovered Base44 calls to owned API endpoints for the Google Cloud migration.

## Runtime Shape

- Frontend adapter: `src/api/entities.js`
- Function adapter: `src/api/functions.js`
- Local/Cloud Run API skeleton: `server/google-cloud-run/server.mjs`
- Local data file for development only: `data/local-db.json`

VEGA's dashboard build document also specifies a Firebase/Firestore wrapper as the primary dashboard migration path. The REST endpoint skeleton remains useful for Cloud Run and model/scoring functions, but the first Google dashboard can use a Firestore wrapper that preserves the Base44 method names.

## Demo vs Real Endpoint Rule

CensusGuard needs two endpoint families:

```text
/api/demo/...
/api/real/...
```

Current local endpoints are development scaffolding only. They are closest to demo behavior because they use local JSON storage and a deterministic scoring fallback.

Production Google Cloud should separate demo and real at the routing, database, IAM, and configuration layers.

## Entity Endpoints

All entities share the same REST shape:

```text
GET    /api/entities/:entity
POST   /api/entities/:entity/query
POST   /api/entities/:entity
PATCH  /api/entities/:entity/:id
DELETE /api/entities/:entity/:id
```

Future explicit demo/real forms:

```text
GET    /api/demo/entities/:entity
POST   /api/demo/entities/:entity/query
POST   /api/demo/entities/:entity
PATCH  /api/demo/entities/:entity/:id
DELETE /api/demo/entities/:entity/:id

GET    /api/real/entities/:entity
POST   /api/real/entities/:entity/query
POST   /api/real/entities/:entity
PATCH  /api/real/entities/:entity/:id
DELETE /api/real/entities/:entity/:id
```

Supported entities:

- `Patient`
- `ScoreHistory`
- `ClinicalAction`
- `GroupCohesion`
- `Task`
- `MoneyTracker`
- `DemoLead`

## Recovered Frontend Calls

| Base44 call | New endpoint |
| --- | --- |
| `Task.list()` | `GET /api/entities/Task` |
| `Task.create(data)` | `POST /api/entities/Task` |
| `Task.update(id, data)` | `PATCH /api/entities/Task/:id` |
| `MoneyTracker.list()` | `GET /api/entities/MoneyTracker` |
| `MoneyTracker.create(data)` | `POST /api/entities/MoneyTracker` |
| `ScoreHistory.filter({ patient_id })` | `POST /api/entities/ScoreHistory/query` |
| `ClinicalAction.filter({ patient_id })` | `POST /api/entities/ClinicalAction/query` |
| `ClinicalAction.create(data)` | `POST /api/entities/ClinicalAction` |
| `GroupCohesion.list()` | `GET /api/entities/GroupCohesion` |
| `GroupCohesion.create(data)` | `POST /api/entities/GroupCohesion` |
| `DemoLead.create(data)` | `POST /api/entities/DemoLead` |

## Function Endpoints

```text
POST /api/censusguard/score-patient
POST /api/functions/scorePatient
POST /api/demo/censusguard/clean-patients
POST /api/real/censusguard/clean-patients
POST /api/demo/censusguard/apply-group-ripple
POST /api/real/censusguard/apply-group-ripple
```

Both currently route to the same local deterministic scoring fallback. The production Google Cloud version should call the model provider server-side, using Google Secret Manager for API keys.

Future explicit demo/real forms:

```text
POST /api/demo/censusguard/score-patient
POST /api/real/censusguard/score-patient
```

Demo score route:

- Synthetic patient data only
- May use deterministic scoring for stable demos
- May show explanations, but not proprietary internals

Real score route:

- Authenticated users only
- Server-side secrets only
- PHI-safe logs
- Audit event creation
- Carefully controlled clinical wording

## Data Cleaning Endpoint

Future route:

```text
POST /api/demo/censusguard/clean-patients
POST /api/real/censusguard/clean-patients
```

Request body:

```json
{
  "rows": []
}
```

Response body:

```json
{
  "rows": [
    {
      "row_number": 1,
      "cleaned": {},
      "issues": [],
      "ready_for_scoring": true
    }
  ]
}
```

Starter implementation: `src/data-cleaning/patientCleaner.js`.

## BHT And Group Ripple Endpoint

Future route:

```text
POST /api/demo/censusguard/apply-group-ripple
POST /api/real/censusguard/apply-group-ripple
```

Starter implementation: `src/risk/bhtGroupRipple.js`.

This is protected CensusGuard IP and should remain server-side.

## Google Cloud Translation

Local skeleton:

- Node HTTP API
- JSON file data store
- No frontend secrets

Google target:

- Firebase Hosting
- Firebase Auth
- Firestore collections
- Cloud Run for scoring/model endpoints
- Google Secret Manager
- Cloud Logging
- Server-side model calls only

## Next Connection Step

Move a copy of the recovered Dashboard page into a real React app, configure `@/api/entities` to resolve to `src/api/entities.js`, and run it against the local API skeleton. The first app target should be the demo lane. Once demo behavior is stable, design the real lane with Postgres, auth, audit logging, and Google Cloud security boundaries.
