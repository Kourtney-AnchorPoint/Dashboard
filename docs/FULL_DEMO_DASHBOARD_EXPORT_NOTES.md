# Full Demo Dashboard Export Notes

Source file:

`assets/docs/FULL_CODE_FOR_DEMO_DASHBOARD.md`

Original location:

`C:\Users\kourt\Downloads\FULL CODE FOR DEMO DASHBOARD.md`

Generated:

June 7, 2026, according to the file header.

## What It Contains

This is a full Base44 app code export for CensusGuard / AnchorPoint reconstruction.

Extracted copy:

`exports/base44-full-demo-2026-06-07/`

Extracted pages:

- `Dashboard.jsx`
- `Demo.jsx`
- `Home.jsx`
- `Pitch.jsx`
- `Trainer.jsx`
- `About.jsx`
- `Contact.jsx`
- `AgentBoard.jsx`
- `Admin.jsx`
- `Command.jsx`

Extracted functions:

- `scorePatient.ts`
- `createCheckoutSession.ts`
- `generateReading.ts`
- `synthesisReading.ts`
- `tarotReading.ts`

Also extracted:

- `ANCHORPOINT_SOURCE_OF_TRUTH.md`

## Relationship To Current Dashboard

The current running dashboard in `src/pages/UnifiedCensusGuard.jsx` is not a direct copy of this export. It is a newer local React/Vite implementation that already includes tests, local routing, and an API adapter.

The full export should be treated as source material for rebuilding the demo dashboard again, not blindly pasted over the working app.

## Important Difference

The exported `Dashboard.jsx` still expects Base44-style entity calls such as:

```js
Patient.list()
ScoreHistory.filter(...)
ClinicalAction.create(...)
GroupCohesion.list()
```

The current local app is being moved toward our owned API/Firebase path.

## Recommended Use

Use this export to verify missing screens, copy/preserve UI sections, recover product language, and compare behavior.

Do not overwrite the current app directly without first porting the Base44 data calls to the local API/Firebase adapter.
