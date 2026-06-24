# CensusGuard Dashboard Cloud Run Export

This workspace now includes a Cloud Run-ready dashboard export.

## What To Deploy

Deploy from the repo root:

```text
C:\Users\kourt\Documents\Codex\2026-05-04\what-can-you-do-here
```

Key files:

- `Dockerfile`
- `.dockerignore`
- `server/cloud-run-dashboard.mjs`
- `src/pages/UnifiedCensusGuard.jsx`
- `src/lib/censusGuardAdapter.js`

## What It Does

The Cloud Run container serves both:

- the React dashboard
- the API endpoints the dashboard calls

That means the dashboard does not need a separate API service for the demo build.

## Included API Routes

- `GET /health`
- `GET /api/bootstrap`
- `GET /api/patients`
- `GET /api/patients/:id/score-history`
- `GET /api/patients/:id/clinical-actions`
- `POST /api/clinical-actions`
- `GET /api/group-narratives`
- `POST /api/group-narratives`
- `POST /api/staff-check-ins`
- `POST /api/score`
- `POST /api/scoring/ama-risk`
- `GET /api/audit/events`
- `POST /api/audit/events`

## Local Docker Test

```powershell
docker build -t censusguard-dashboard .
docker run --rm -p 8080:8080 censusguard-dashboard
```

Then open:

```text
http://127.0.0.1:8080/dashboard
```

## Google Cloud Run Deploy

From the repo root:

```powershell
gcloud run deploy censusguard-dashboard --source . --region us-central1 --allow-unauthenticated
```

For a private demo, remove `--allow-unauthenticated` and configure access in Google Cloud IAM.

## Important

This is a demo-ready export. It uses synthetic/pilot data. It is not the final real CensusGuard production system.

Do not put real patient data into this build.
