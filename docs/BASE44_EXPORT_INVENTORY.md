# Base44 Export Inventory

This is the first recovered snapshot of VEGA/CensusGuard assets copied from `C:\Users\kourt\Downloads`.

## Workspace Layout

```text
exports/base44/
  extension/   Vega Chrome extension
  pages/       Base44 React pages
  functions/   Base44/Deno backend functions
  entities/    Base44 entity schemas and data/config files
assets/
  docs/        CensusGuard and AnchorPoint docs/PDFs
  images/      Brand, brochure, and comic-style marketing images
  scripts/     Marketing/deck/brochure helper scripts and drafts
```

## VEGA Extension

Files:

- `manifest.json`
- `background.js`
- `content.js`
- `popup.html`
- `popup.js`
- `sidebar.css`
- `vega-extension.zip`

What it does:

- Injects a VEGA sidebar into webpages.
- Adds right-click context menu actions.
- Supports LinkedIn post/reply drafting.
- Supports Gmail reply drafting and summarization.
- Reads selected text and page context.
- Reads LinkedIn page content when on LinkedIn.
- Reads Gmail subject/body snippets when on Gmail.
- Calls Anthropic directly from the extension background worker.

Important migration note:

- Current extension stores/uses an Anthropic API key in browser extension storage.
- In the AWS version, API keys should move server-side into AWS Secrets Manager. The extension should call VEGA's backend instead of calling Anthropic directly.

## Base44 Pages

- `About.jsx` - 157 lines
- `Admin.jsx` - 396 lines
- `Command.jsx` - 414 lines
- `Dashboard.jsx` - 1008 lines
- `Demo.jsx` - 1590 lines
- `Demo.jsx.bak` - 1427 lines
- `Home.jsx` - 253 lines
- `Pitch.jsx` - 801 lines
- `Tarotories.jsx` - 531 lines
- `Trainer.jsx` - 516 lines

Main app areas observed:

- CensusGuard dashboard and patient risk workflow
- Admin/training interfaces
- Command center for tasks and money tracking
- Pitch/demo/marketing surfaces
- Tarotories subscription/reading surfaces

## Backend Functions

- `scorePatient.ts`
  - CensusGuard risk scoring engine
  - Uses `ANTHROPIC_API_KEY`
  - Calls Claude model `claude-opus-4-5`
  - Combines rule boosts with LLM-generated JSON risk output

- `generateReading.ts`
  - Tarot/reading generator
  - Uses `ANTHROPIC_API_KEY`
  - Calls Claude model `claude-opus-4-5`

- `tarotReading.ts`
  - Tarot reading function
  - Uses `ANTHROPIC_API_KEY`
  - Calls Claude model `claude-opus-4-5`

- `synthesisReading.ts`
  - Synthesis reading function
  - Uses `ANTHROPIC_API_KEY`
  - Calls Claude model `claude-3-5-sonnet-20241022`

- `createCheckoutSession.ts`
  - Stripe subscription checkout
  - Uses `STRIPE_TEST_SECRET_KEY`
  - Creates monthly/yearly Tarotories subscription sessions

Duplicate copies exist for several functions with ` (1)` suffixes. They appear to be repeated downloads and should be compared before deletion.

## Entity Schemas

- `Patient`
  - Core CensusGuard patient/risk model
  - Includes level of care, length of stay, risk drivers, risk tier, intervention, alert fields, and status.

- `ScoreHistory`
  - Historical risk score events.

- `ClinicalAction`
  - Intervention/audit trail actions.

- `GroupCohesion`
  - Unit/group observations and affected patients.

- `Task`
  - VEGA/Command task tracking.

- `MoneyTracker`
  - Revenue/expense/pending money tracking.

- `DemoLead`
  - Demo/pilot lead capture.

- `config.json`, `config (1).json`
  - Empty MCP config shape: `{ "mcpServers": {} }`

- `rehab_outreach_targets.json`
  - Outreach targets list.

## Brand And Marketing Assets

The copied assets include:

- CensusGuard brochures
- CensusGuard dashboard build docs
- AnchorPoint SEO pack
- Comic-style advocacy/brand images
- Founder/CEO brochure visuals
- Infrastructure and demo graphics
- Marketing email drafts
- Python scripts for brochure/deck generation

## AWS Migration Implications

Suggested first AWS shape:

- Frontend: React app deployed with AWS Amplify Hosting or S3 + CloudFront.
- Backend: API service on AWS App Runner, Lambda, or ECS/Fargate.
- Agent/model calls: server-side only.
- Secrets: AWS Secrets Manager.
- Data: Postgres/RDS if relational auditability matters; DynamoDB if speed/simple document storage matters.
- Files/assets: S3.
- Logs: CloudWatch.

## Immediate Rebuild Tasks

1. Normalize the recovered Base44 app into a runnable local React project.
2. Replace Base44 entity APIs with a local API layer.
3. Move Anthropic/Stripe secrets out of browser/client code.
4. Decide database schema for Patient, ScoreHistory, ClinicalAction, Task, MoneyTracker, and DemoLead.
5. Rebuild VEGA extension so it calls the new VEGA backend.
6. Separate CensusGuard product surfaces from VEGA assistant/ops surfaces where helpful.
7. Preserve the current brand voice and system prompt from `background.js`.
