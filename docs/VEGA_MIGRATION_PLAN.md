# VEGA Migration Plan

## What We Know

- Project: VEGA, your super agent
- Source platform: Base44
- Target: a self-owned versioned codebase deployed on AWS or Google Cloud
- Direction: deploy first on AWS, using available AWS credits
- Role: your main assistant for marketing, operations, building, and general execution
- Repo branch: `main`
- First recovered export: copied into `exports/base44/`

## First Migration Steps

1. Export or copy everything Base44 lets you access:
   - App/source code
   - Prompts and agent instructions
   - API keys/env var names, without secret values
   - Database/schema definitions
   - Workflows/automations
   - UI pages/components
   - Storage assets
   - Deployment settings
2. Put exported files into this workspace.
3. Commit the raw export as `chore: import base44 export`.
4. Map VEGA's architecture:
   - Frontend
   - Backend/API routes
   - Agent orchestration
   - Data storage
   - Auth
   - Third-party integrations
5. Choose the replacement cloud stack: AWS first, while keeping the codebase portable.
6. Rebuild and verify VEGA feature by feature.

Current status: steps 1-2 are underway. The first copied Base44 files are organized in `exports/base44/`, with supporting brand/docs/assets in `assets/`.

## Recovered Snapshot

See `docs/BASE44_EXPORT_INVENTORY.md` for the current inventory.

Major recovered pieces:

- VEGA Chrome extension
- CensusGuard React/Base44 pages
- CensusGuard patient-risk schemas
- Anthropic-powered backend functions
- Stripe checkout function
- Command center task/money schemas
- CensusGuard marketing docs and visuals

## Cloud Direction

VEGA should be rebuilt so the core app is portable first, then deployed to either AWS or Google Cloud.

Current preferred deployment target: AWS.

### Likely Building Blocks

- Web app/frontend
- API backend
- Agent runtime/orchestration
- Database
- File/object storage
- Secrets manager for API keys
- Auth/user accounts, if VEGA needs login
- Logs and monitoring

### AWS Candidate Stack

- Frontend: Amplify Hosting or S3 + CloudFront
- Backend/API: Lambda, ECS/Fargate, or App Runner
- Database: DynamoDB, Aurora, or RDS/Postgres
- Files: S3
- Secrets: AWS Secrets Manager
- Logs: CloudWatch

### Google Cloud Candidate Stack

- Frontend: Firebase Hosting or Cloud Run
- Backend/API: Cloud Run or Cloud Functions
- Database: Firestore, Cloud SQL/Postgres, or AlloyDB
- Files: Cloud Storage
- Secrets: Secret Manager
- Logs: Cloud Logging

## Decision Rule

Choose AWS if VEGA needs maximum enterprise flexibility, deep infrastructure control, or easy expansion into many cloud services.

Choose Google Cloud if VEGA should be fast to ship, container-friendly, Firebase-friendly, or closely tied to Google services.

## VEGA Product Role

VEGA is intended to become the main operating assistant across the user's work, not a single-purpose chatbot.

### Core Domains

- Marketing: campaigns, copy, content planning, launches, brand voice, audience research
- Operations: planning, scheduling, task tracking, process documentation, follow-ups
- Builder work: product planning, app/site creation, technical support, implementation support
- General assistant work: research, drafting, decision support, organizing information

### Capabilities To Preserve Or Rebuild

- Existing Base44 behavior and workflows
- Agent instructions/personality
- Project and business context
- User memory/preferences
- Marketing and operations templates
- Integrations with external tools
- File and knowledge storage
- Secure handling of API keys and credentials

### AWS-Oriented First Architecture

- Frontend: web app for interacting with VEGA
- Backend: API service for messages, tasks, and tool actions
- Agent runtime: orchestrates model calls, tools, memory, and workflows
- Database: stores users, projects, tasks, conversation metadata, and structured business data
- Object storage: stores uploaded files, exports, assets, and generated documents
- Secrets manager: stores API keys and service credentials
- Logging/monitoring: captures errors, usage, and system health

## Questions To Answer Soon

- Can Base44 export the source code directly, or only generated app assets?
- Does VEGA use a database? If yes, what data must be migrated?
- Which model/provider does VEGA use?
- Does VEGA have external integrations like Gmail, Slack, calendars, Stripe, or custom APIs?
- Where do you want VEGA hosted after migration?

## Suggested Repo Shape

```text
docs/
  VEGA_MIGRATION_PLAN.md
exports/
  base44/
src/
tests/
.env.example
README.md
```
