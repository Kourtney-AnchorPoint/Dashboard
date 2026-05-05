# CensusGuard Dashboard Build Doc Summary

Source PDFs:

- `assets/docs/Migrate_dashboard_Doc.pdf`
- `assets/docs/CensusGuard_Dashboard_BuildDoc.pdf`

These two PDFs have identical extracted text and file hashes. They appear to be the same VEGA-created dashboard build document under different names.

## What VEGA Specified

The document describes the CensusGuard dashboard as a React app currently on Base44, intended to migrate to Google/Firebase.

## Target Stack From The Document

- Frontend: React
- Current data layer: Base44 SDK
- Target data layer: Google Firestore
- Current hosting: Base44
- Target hosting: Firebase Hosting
- Current auth: Base44 built-in auth
- Target auth: Firebase Auth
- AI/model direction: Vertex AI AutoML
- EHR direction: Kipu EHR APIs in a later phase

## Routes Listed

- `/` - public marketing landing page
- `/demo` - public demo with fake patients
- `/dashboard` - real patient dashboard, protected
- `/pitch` - investor pitch mini-site
- `/command` - admin command center
- `/about` - public about page
- `/contact` - contact/demo request page
- `/admin` - admin panel

## Data Tables Listed

- Patient
- ScoreHistory
- ClinicalAction
- GroupCohesion
- DemoLead
- Task
- MoneyTracker

## Migration Checklist From VEGA

1. Set up Firebase/GCP.
2. Enable Firestore, Firebase Hosting, and Firebase Auth.
3. Complete required compliance setup before any real patient data.
4. Create a Vite React app.
5. Copy Base44 JSX pages.
6. Install Firebase.
7. Create a Firebase config file.
8. Replace Base44 entity imports with a Firebase entity wrapper.
9. Replace Base44 auth with Firebase Auth.
10. Add React Router.
11. Export Base44 entity data.
12. Import JSON data into Firestore.
13. Deploy Firebase Hosting.
14. Deploy/connect Vertex AI endpoint.
15. Test with synthetic patients before real records.

## Product Features Listed

- Global stats bar
- Patient risk monitor
- Patient detail panel
- Census floor tab
- Group flow tab
- Group narrative tab
- Active alerts panel
- History tab
- ROI calculator

## Design Tokens

- Background: `#07070F`
- Magenta: `#D4159A`
- Purple: `#8844E8`
- Cyan: `#10D8F0`
- White: `#FFFFFF`
- Light: `#E0E0EE`
- Dim gray: `#8888A8`
- Dark card: `#111125`
- Card line: `#28284A`

## Implication For Our Migration

The dashboard path should be Firebase/Firestore-first for the demo build, with a separate protected real dashboard later.

The endpoint adapter work is still useful, but the first dashboard implementation can use a Firebase entity wrapper that preserves the same `Patient.list()`, `Patient.create()`, and `Patient.filter()` style the recovered Base44 pages already expect.
