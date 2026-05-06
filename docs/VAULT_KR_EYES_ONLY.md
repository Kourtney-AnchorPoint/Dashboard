# VAULT_KR_EYES_ONLY - Legacy Base44 Recovery

## UI/UX Trigger Styling (Legacy BHT -> Adapt to Unified Stream)
- Header: ⚡ TRIGGER pill added (cyan, next to REAL-TIME SCORING ACTIVE badge)
- Patient Monitor table: 'Last Note' column shows ⚡ + exact check-in time per patient
- Active Alerts: every card shows '⚡ Triggered by [Role] check-in at [time]' in cyan
- History tab: Trigger entries highlighted in cyan as '⚡ Staff check-in (real-time rescore)' — admission intake stays grey, contrast is instant.

## Core Positioning (OCAST April 2026)
- 'AI-Driven Patient Retention' stays locked.
- Goldie Health = overdose prevention OUTSIDE facilities (community/first responders/PORT teams).
- CensusGuard = retention INSIDE treatment facilities. NOT competitors — we are sequential. Goldie catches people before treatment. We keep them IN treatment.

## Vertex AI Baseline Metrics & Feature Weights
- ROC AUC: 89.6% | PR AUC: 90.1% | Precision: 80.3% | Recall: 80.3%
- Top features (Vertex validated): 
  1. Level of Care 21.0%
  2. State/Geography 11.9%
  3. Census Division 11.1%
  4. Referral Source 6.3%
  5. Frequency of Use 4.7%
  6. Primary Substance 4.5%
- Geography emerging as #2 and #3 validates the Oklahoma pitch angle (where you are predicts whether you leave).
