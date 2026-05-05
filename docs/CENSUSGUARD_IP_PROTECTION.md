# CensusGuard IP Protection Plan

This document is an operational checklist for protecting CensusGuard while rebuilding it off Base44. It is not legal advice; use it to prepare for an IP attorney and to keep the migration disciplined.

## Protect As Confidential By Default

CensusGuard should be treated as protected IP across four buckets:

1. Brand IP
   - CensusGuard name
   - Logos, shield/phoenix marks, color system, taglines
   - Product positioning: AI-powered safety infrastructure

2. Copyrightable Assets
   - Source code
   - UI layouts and original copy
   - Brochures, pitch materials, docs, images, scripts
   - Training content and product documentation

3. Trade Secrets
   - Risk scoring rules and model prompts
   - Patient-risk feature engineering
   - Outreach targets and GTM lists
   - Internal workflows, founder voice system prompt, sales scripts
   - Any non-public validation data or performance claims support

4. Potential Patentable/Technical Inventions
   - Real-time intervention workflow
   - Risk signal scoring and escalation logic
   - Audit trail and accountability layer architecture
   - Any novel clinical/operational safety infrastructure pattern

## Repository Rules

- Keep this repo private.
- Do not publish CensusGuard source, prompts, scoring logic, outreach lists, or raw business docs publicly.
- Do not commit real API keys, tokens, credentials, patient records, or private facility data.
- Use `.env.example` for variable names only.
- Store real secrets in AWS Secrets Manager when deployed.
- Keep Base44 exports in `exports/base44/` as historical source material.
- Put derived rebuild code in `src/` only after we intentionally start porting.
- Keep screenshots and marketing images under `assets/` until licensing/ownership is reviewed.

## Immediate IP Actions

1. Trademark
   - Run a clearance search for `CensusGuard`.
   - Consider filing for the word mark `CensusGuard`.
   - Consider filing for the logo/mark if it will be used publicly.
   - Track classes/services around software, healthcare operations, risk analytics, and behavioral health.

2. Copyright
   - Keep dated copies of source code, brochures, scripts, docs, and visual assets.
   - Consider copyright registration for important written materials, software snapshots, and original artwork.
   - Separate human-authored materials from AI-generated or AI-assisted images where possible.

3. Trade Secrets
   - Mark internal documents as confidential.
   - Limit access to the repo and exports.
   - Do not share scoring logic, prompts, or outreach lists in public demos.
   - Move all model/API calls server-side.
   - Maintain an access log for vendors/contractors.

4. Invention Review
   - Before public disclosure, ask an IP attorney whether any CensusGuard workflow or scoring method should be reviewed for patent strategy.
   - Preserve dated design docs and technical diagrams showing conception and evolution.

## Public Demo Safety

Public-facing demos should use:

- Synthetic patient data only
- Generic facility names
- Sanitized screenshots
- High-level claims unless validated support is documented
- No API keys
- No proprietary scoring formulas
- No private outreach targets
- Separate demo endpoints and demo database

Public-facing demos should avoid:

- Raw patient-risk feature weights
- Internal prompts
- Facility-specific metrics
- Non-public model evaluation details
- Source code snippets
- Anything copied from real customer/facility data

## AWS Protection Defaults

- Secrets: AWS Secrets Manager
- Files: private S3 buckets by default
- Logs: avoid logging PHI, API keys, or full prompts containing sensitive data
- Network: backend-only model calls
- Access: least-privilege IAM roles
- Database: encryption at rest and backup enabled
- Environments: separate dev/staging/prod

## Attorney Prep Packet

Prepare these for counsel:

- Current CensusGuard pitch/brochure docs
- Screenshots of product UI
- Description of what CensusGuard does
- List of current and planned public names/logos/taglines
- Explanation of risk scoring and intervention workflow at a non-secret level
- Timeline of creation and public disclosure
- List of collaborators/vendors who have seen the work
- Any Base44 terms/export notes relevant to ownership

## Working Principle

Treat CensusGuard as private, valuable, and not-yet-hardened. Rebuild in a private repo, keep secrets server-side, publish only sanitized demos, and get trademark/copyright/trade-secret strategy reviewed before broad public launch.
