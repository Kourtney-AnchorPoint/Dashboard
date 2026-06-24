# CensusGuard Pilot Decisions

## 1. Core Architecture
* **Frontend:** React scaffold built with Vite.
* **UI/UX Stack:** Shadcn UI, Sonner, Framer Motion, Recharts. Strict dark mode (magenta/cyan) to retain the command-center identity.
* **Backend Target:** Google Cloud Run connecting to Vertex AI via a secure middleware API. Frontend never calls Vertex directly.
* **Integration:** SMART on FHIR agnostic overlay.

## 2. Product Scope (Q4 Launch)
* **Lane:** Strictly Substance Use Disorder (SUD) treatment facilities.
* **Primary Objective:** Forecast the 24-hour window preceding an Against Medical Advice (AMA) discharge.
* **Model boundary:** Vertex remains the validated Day-1 AMA classifier. The TEDS-D survival simulation supports timing/forecast-window display, not replacement of the 89.6% Vertex AUC.

## 2A. Product Expansion Concept: Three Rings
* **Ring 1 - Inpatient / Residential:** Patient is inside the facility. Staff can physically intervene. CensusGuard scores daily, alerts fire, staff acts, and the loop closes. This is the current core product and BayMark demo focus.
* **Ring 2 - Step Down / PHP / IOP:** Patient leaves and returns daily. Risk window opens every night. CensusGuard can send check-ins, track non-response and mood/engagement trends, and alert the care team before the next morning.
* **Ring 3 - Outpatient Maintenance / ContinuityGuard:** Patient is fully outside facility care. The system tracks refill cadence, pharmacy readiness, patient pickup confirmation, prescriber alerts, and 30-day check-ins. This extends the Infinity Loop into medication continuity infrastructure.
* **Strategic framing:** The Infinity Loop follows the patient beyond the building. Phase 2 catches people after they walk out. Phase 3 never lets the continuity thread drop.
* **Working product-line name:** ContinuityGuard.

## 3. The Proactive Data Model
* **The Unified Staff Stream:** A cross-disciplinary timeline incorporating role-tagged staff check-ins from Nursing, Therapists, Techs, and Physicians.
* **Current terminology:** "Staff Check-in" replaces the older "BHT Check-in" language across the active pilot dashboard.
* **Agentic UI:** The dashboard utilizes an 'InterventionRecommender' to actively push critical alerts and specific intervention actions.
* **Forecast layer:** TEDS-D 2023 survival simulation confirms cliff windows D1-3, D4-7, D8-14, D15-21 peak, D22-35, and D35+ extended-stay risk. These support dashboard timing indicators while awaiting pilot Staff Check-in event data.
* **Oklahoma validation:** TEDS-D 2023 shows Oklahoma AMA rate at 49.9% versus 34.1% national across 8,760 Oklahoma records.

## 4. Clinical & Legal Framework
* **Clinical Validation:** John Lyon (Clinical Validation Partner).
