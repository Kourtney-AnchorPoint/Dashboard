# CensusGuard BHT And Group Ripple Logic

Source preserved at:

`assets/docs/BHT_logic_group_ripple_detection.pdf`

## Plain-English Meaning

This logic protects the scoring model from bad or flat staff-entered observation data, then looks for unit-wide behavior shifts that can raise risk for individual patients.

It adds three layers before final scoring:

1. BHT reliability
   - If one staff member enters identical behavior scores across a unit, that can signal low-quality or repetitive documentation.
   - Those inputs are down-weighted.

2. Group ripple
   - Looks for a unit-wide rise in behavioral velocity.
   - This captures the idea that the environment can shift before individual patients visibly deteriorate.

3. Contagion multiplier
   - If the unit ripple is high and the patient is already high risk, their velocity is multiplied upward.
   - This helps detect cluster/dropout risk.

## Original Logic Summary

Inputs expected by the original Python:

- `unit_id`
- `staff_id`
- `behavior_score`
- `behavioral_velocity`
- `patient_risk_level`

Outputs:

- `bht_variance`
- `bht_reliability_score`
- `group_ripple_index`
- `contagion_risk_multiplier`
- `final_engineered_velocity`

## JavaScript Port

Implemented in:

`src/risk/bhtGroupRipple.js`

The port accepts either the original field names or CensusGuard-style aliases:

- `unit_id`, `unit`, or `level_of_care`
- `staff_id` or `staff_name`
- `behavior_score`, `observation_score`, or `risk_score`
- `behavioral_velocity`, `velocity`, or `calm_before_storm_velocity`
- `patient_risk_level` or `risk_tier`

## Important IP Note

This is proprietary CensusGuard logic. It should stay server-side and should not be exposed in public demos, public source code, screenshots, or sales materials.
