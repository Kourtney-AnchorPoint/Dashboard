# CensusGuard Data Cleaning Layer

CensusGuard needs a data-cleaning section between raw facility/EHR data and risk scoring.

## Plain-English Purpose

Facilities will not hand us perfectly clean data. Names, dates, program levels, room numbers, substances, flags, and risk factors may arrive under different column names or formats.

The cleaning layer turns messy exports into a consistent CensusGuard patient record before the dashboard or scoring engine uses it.

The BHT/group-ripple logic is a separate protected risk-engineering layer after data cleaning and before final scoring.

## What It Should Do

- Accept raw rows from demo files, CSV exports, EHR exports, or future API feeds.
- Match messy column names to CensusGuard fields.
- Normalize program levels like `res`, `Residential`, `PHP`, `IOP`.
- Normalize substances like `opioid`, `meth`, `alcohol`.
- Convert yes/no fields into true/false or 1/0 flags.
- Calculate length of stay from admission date when needed.
- Flag missing identifiers, missing names, missing dates, and duplicate records.
- Keep demo cleaning separate from real production cleaning.
- Never score a real record until required fields pass validation.

## Current Starter File

`src/data-cleaning/patientCleaner.js`

It currently supports:

- Patient name mapping
- Episode/patient ID mapping
- Unit/room mapping
- Level of care normalization
- Substance normalization
- Gender flag normalization
- Risk-related boolean/number flags
- Length-of-stay calculation
- Duplicate episode detection
- Basic issue reporting

## Demo vs Real

Demo cleaning:

- Can accept synthetic/messy demo rows.
- Can fill reasonable defaults.
- Should clearly label data as synthetic.

Real cleaning:

- Must be stricter.
- Should reject unclear records instead of guessing.
- Should preserve raw input for audit/debug review.
- Should log what changed during cleaning.
- Should never mix with demo data.

## Cleaning Flow

```text
Raw facility/export row
  -> column name cleanup
  -> field mapping
  -> value normalization
  -> missing-data checks
  -> duplicate checks
  -> cleaned patient record
  -> scorePatient endpoint
  -> dashboard
```

## Future UI Section

The dashboard should eventually have a `Data Cleaning` or `Data Intake` section where you can:

- Upload/paste a demo CSV
- Preview raw rows
- See cleaned rows
- See warnings/errors
- Approve import into demo data
- For real environments, send failed rows to a review queue

## Fields That Matter Most Before Scoring

- `name`
- `episode_id`
- `level_of_care`
- `admit_date` or `length_of_stay`
- `substance_encoded`
- `admission_number`
- Housing/employment/mental health/legal/referral risk flags when available

## Next Step

Add an API endpoint:

```text
POST /api/demo/censusguard/clean-patients
POST /api/real/censusguard/clean-patients
```

The demo endpoint can be forgiving. The real endpoint should be strict and audit every transformation.

Then apply the protected BHT/group-ripple logic:

```text
clean patient rows
  -> apply BHT reliability and group ripple logic
  -> score patient
```

See `docs/CENSUSGUARD_BHT_GROUP_RIPPLE_LOGIC.md`.
