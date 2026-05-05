function groupBy(rows, keyFn) {
  const groups = new Map();
  for (const row of rows || []) {
    const key = keyFn(row);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }
  return groups;
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function standardDeviation(values) {
  const numbers = values.map((value) => toNumber(value)).filter(Number.isFinite);
  if (numbers.length <= 1) return 0;

  const mean = numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
  const variance = numbers.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (numbers.length - 1);
  return Math.sqrt(variance);
}

function average(values) {
  const numbers = values.map((value) => toNumber(value)).filter(Number.isFinite);
  if (!numbers.length) return 0;
  return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
}

function getUnitId(row) {
  return row.unit_id || row.unit || row.level_of_care || "unknown-unit";
}

function getStaffId(row) {
  return row.staff_id || row.staff_name || "unknown-staff";
}

function getBehaviorScore(row) {
  return row.behavior_score ?? row.observation_score ?? row.risk_score ?? 0;
}

function getBehavioralVelocity(row) {
  return row.behavioral_velocity ?? row.velocity ?? row.calm_before_storm_velocity ?? 0;
}

function getPatientRiskLevel(row) {
  return String(row.patient_risk_level || row.risk_tier || "").toLowerCase();
}

export function applyBhtGroupRippleLogic(rows) {
  const inputRows = (rows || []).map((row) => ({ ...row }));
  const staffUnitGroups = groupBy(inputRows, (row) => `${getUnitId(row)}::${getStaffId(row)}`);
  const unitGroups = groupBy(inputRows, getUnitId);

  const bhtVarianceByGroup = new Map();
  for (const [key, groupRows] of staffUnitGroups.entries()) {
    bhtVarianceByGroup.set(key, standardDeviation(groupRows.map(getBehaviorScore)));
  }

  const unitVelocityByGroup = new Map();
  for (const [unitId, groupRows] of unitGroups.entries()) {
    unitVelocityByGroup.set(unitId, average(groupRows.map(getBehavioralVelocity)));
  }

  return inputRows.map((row) => {
    const staffUnitKey = `${getUnitId(row)}::${getStaffId(row)}`;
    const bhtVariance = bhtVarianceByGroup.get(staffUnitKey) || 0;
    const bhtReliabilityScore = bhtVariance === 0 ? 0.5 : 1.0;
    const unitVelocity = unitVelocityByGroup.get(getUnitId(row)) || 0;
    const groupRippleIndex = unitVelocity * bhtReliabilityScore;
    const contagionRiskMultiplier =
      groupRippleIndex > 5 && getPatientRiskLevel(row) === "high" ? 1.5 : 1.0;
    const finalEngineeredVelocity =
      toNumber(getBehavioralVelocity(row)) * contagionRiskMultiplier * bhtReliabilityScore;

    return {
      ...row,
      bht_variance: bhtVariance,
      bht_reliability_score: bhtReliabilityScore,
      group_ripple_index: groupRippleIndex,
      contagion_risk_multiplier: contagionRiskMultiplier,
      final_engineered_velocity: finalEngineeredVelocity,
    };
  });
}
