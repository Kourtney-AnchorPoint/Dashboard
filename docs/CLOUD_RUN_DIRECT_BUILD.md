# CensusGuard Dashboard - Direct Cloud Run Build

This package is for building the CensusGuard dashboard directly on Google Cloud Run with Node buildpacks.

## What This Is

- The real CensusGuard dashboard code.
- A Cloud Run server that serves the dashboard and API routes from one service.
- A cloud-first build path that does not require you to create a Docker image yourself.

## Deploy From Repo Root

From the project root:

```powershell
gcloud run deploy censusguard-dashboard --source . --region us-central1 --allow-unauthenticated
```

Cloud Run will:

1. Upload the source code, using `.gcloudignore` to skip local-only files.
2. Install the Node dependencies.
3. Run `npm run gcp-build`, which builds the dashboard.
4. Run `npm start`, which starts `server/cloud-run-dashboard.mjs`.

## Health Check

After deploy:

```text
/health
```

Expected result:

```json
{
  "ok": true,
  "service": "censusguard-dashboard"
}
```

## Dashboard Route

```text
/dashboard
```

## API Routes Included

- `GET /api/bootstrap`
- `GET /api/patients`
- `GET /api/patients/:id/score-history`
- `GET /api/patients/:id/clinical-actions`
- `POST /api/clinical-actions`
- `GET /api/group-narratives`
- `POST /api/group-narratives`
- `POST /api/staff-check-ins`
- `POST /api/score`
- `POST /api/scoring`
- `POST /api/audit`

