# Base44 Fresh Dump Request

Updated: 2026-06-21

## Plain-English Status

Base44 described the newest files, but the actual raw code has not been copied into this repo yet. Local search found no current files named:

- `pages/Settings.jsx`
- `components/demo/MedTab.jsx`
- `components/demo/NursingTab.jsx`
- `components/demo/BHTStaffStream.jsx`
- `components/demo/TabOutcomes.jsx`
- `components/demo/TabMonitor.jsx`
- `pages/Outcomes.jsx`
- `components/demo/DemoLayout.jsx`
- `components/demo/DemoData.js`
- `entities/InterventionLog.json`

The APK also did not contain readable CensusGuard source code, so Base44 needs to provide the raw file contents directly.

## Paste This To Base44

Please dump the actual raw code, not summaries, for the newest CensusGuard demo/rebuild files.

For each file, provide the complete file contents in a fenced code block with the filename above it.

Priority order:

1. `components/demo/DemoData.js`
2. `components/demo/DemoLayout.jsx`
3. `components/demo/BHTStaffStream.jsx`
4. `components/demo/TabOutcomes.jsx`
5. `components/demo/TabMonitor.jsx`
6. `pages/Demo.jsx`
7. `pages/Outcomes.jsx`
8. `components/demo/MedTab.jsx`
9. `components/demo/NursingTab.jsx`
10. `pages/Settings.jsx`
11. `entities/InterventionLog.json`
12. `entities/DemoVisit.json`

Please include imports, exports, helper functions, constants, and all UI logic. Do not summarize. Do not say "copy the structure above." I need the literal code.

## Logic We Specifically Need Preserved

- Infinity loop: detect -> alert -> guided intervention -> staff documentation -> outcome -> rescore.
- Staff action loop: who, what, when, outcome, score ripple.
- Pencil-whip / low-signal staff reliability detection.
- BHT/staff note variance logic.
- Group ripple / contagion risk logic.
- Medication/MOUD adherence logic from MAR timestamps.
- Nursing vitals thresholds, including COWS/CIWA and vital sign flags.
- Outcomes analytics, including success rate and average score drop from intervention logs.
- Leadership ROI/business impact section, if it still exists.
- Mobile layout and bottom navigation logic.
- Account deletion flow.
- Patient monitor table/card switching for desktop and mobile.
- Live score bump / pulsing patient logic.
- Visit analytics tracking through `DemoVisit.create`.
- Main dashboard tab controller logic from `pages/Demo.jsx`.

## Current Rebuild Rule

Keep the real Cloud Run dashboard separate from demo mode. Demo patient data is useful for testing and sales demos, but the real dashboard should not pretend sample patients are live facility patients.
