# CensusGuard Compliance Monitoring Starter

This is an internal planning note for the compliance binder. It is not a finalized policy.

## Monitoring Stack

- Google Cloud Logging: platform logs for Cloud Run, Vertex AI calls, deployment events, and service errors.
- Datadog: application observability, uptime checks, error alerts, dashboards, and incident visibility.
- Application audit trail: product-level records for who opened an alert, who documented an intervention, when it happened, and what outcome was recorded.

## Datadog Purpose

Datadog should be used to help show operational control over the system:

- Service uptime and availability
- API error rates
- Request latency
- Failed prediction or scoring requests
- Cloud Run service health
- Alerting for abnormal failures
- Incident review support

## PHI-Safe Logging Rule

Datadog and platform logs should not receive PHI unless a formal compliance review approves the exact data path.

Do not log:

- Patient names
- Patient messages or clinical notes
- Full medication records
- Full prompts or model inputs containing patient details
- API keys, tokens, credentials, or secrets
- Facility-private data that is not needed for debugging

Prefer logging:

- Internal patient record IDs
- Facility ID or environment ID
- Request ID / trace ID
- Error code
- Endpoint name
- Timing and status
- De-identified event category

## Required Before Real Patient Data

Before any real PHI is processed, confirm:

- Google Cloud BAA status
- Datadog BAA / HIPAA-eligible configuration status
- Log redaction rules
- Access controls for Datadog users
- Role-based access to dashboards
- Incident response owner and escalation path
- Data retention settings
- Separation between demo and real environments

## Binder Open Items

- Final monitoring and logging policy
- Incident response policy
- Breach notification workflow
- Access review procedure
- Vendor / BAA tracker
- PHI logging prohibition checklist
