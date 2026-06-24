# Base44 Rebuild Kit Gap Check

Updated: 2026-06-21

## Plain-English Summary

Base44 provided a helpful architecture summary, but it is not a full code export. The best local source we have is still the saved Base44 export under `exports/base44-full-demo-2026-06-07/` plus the current Cloud Run dashboard code under `src/` and `server/`.

The APK at `C:\Users\kourt\Downloads\android-2.124641.1.apk` was inspected. It is a Wix/React Native Android wrapper with an `assets/index.android.bundle`, but the readable string dump contains no `CensusGuard` text. It should not be treated as the dashboard source code.

## Entity Name Check

Base44 summary mentioned:

- `InterventionLog`
- `DemoVisit`

Local exported schemas currently found:

- `exports/base44/entities/Patient.json`
- `exports/base44/entities/ScoreHistory.json`
- `exports/base44/entities/ClinicalAction.json`
- `exports/base44/entities/GroupCohesion.json`
- `exports/base44/entities/DemoLead.json`

Important: `ClinicalAction` appears to be the production equivalent of the intervention/audit trail entity in the code we have. If Base44 has a separate `InterventionLog` entity now, we still need that raw schema/code dumped from Base44.

## Logic Already Preserved Locally

- Peer proximity logic exists in the dashboard through `room_number` and `known_peers`.
- Cliff-window and calm-before-storm flags exist in the old Base44 demo data and current dashboard display.
- Staff/BHT group ripple logic is documented in `docs/CENSUSGUARD_BHT_GROUP_RIPPLE_LOGIC.md`.
- JavaScript group ripple port exists in `src/risk/staffGroupRipple.js`.
- Staff stream UI exists in `src/components/UnifiedStaffStream.jsx`.
- Current real dashboard route is `src/pages/UnifiedCensusGuard.jsx`.

## Still Needed From Base44

Ask Base44 to dump raw code for these first:

1. `components/demo/DemoData.js` or whatever file now holds the updated demo data.
2. `TabMonitor` or the current tab/session tracking component.
3. Any current `InterventionLog` entity schema, if it exists separately from `ClinicalAction`.
4. Any current `DemoVisit` entity schema, if it exists separately from `DemoLead`.
5. The newest dashboard page/component if it has changes after the June 7 export.

## Current Build Direction

Do not re-add fake demo patients to the real Cloud Run dashboard unless explicitly requested. The real dashboard should show live backend/Vertex/facility records. Demo patients can stay in a separate demo route or demo export.

