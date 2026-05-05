const LEVEL_OF_CARE_MAP = new Map([
  ["detox", "Detox"],
  ["residential", "Residential"],
  ["res", "Residential"],
  ["php", "PHP"],
  ["iop", "IOP"],
  ["op", "OP"],
  ["outpatient", "OP"],
]);

const STATUS_MAP = new Map([
  ["active", "Active"],
  ["current", "Active"],
  ["discharged", "Discharged"],
  ["discharge", "Discharged"],
  ["ama", "AMA"],
  ["left ama", "AMA"],
]);

const SUBSTANCE_MAP = new Map([
  ["alcohol", 1],
  ["opioid", 2],
  ["opioids", 2],
  ["benzo", 3],
  ["benzodiazepine", 3],
  ["benzodiazepines", 3],
  ["meth", 4],
  ["methamphetamine", 4],
  ["cocaine", 5],
  ["methadone", 6],
  ["non-rx methadone", 6],
  ["heroin", 7],
  ["other", 8],
]);

const GENDER_MAP = new Map([
  ["male", 0],
  ["m", 0],
  ["female", 1],
  ["f", 1],
  ["non-binary", 2],
  ["nonbinary", 2],
  ["nb", 2],
]);

function normalizeKey(key) {
  return String(key || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizeText(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function toNumber(value, fallback = 0) {
  if (value === null || value === undefined || value === "") return fallback;
  const number = Number(String(value).replace(/[$,%]/g, "").trim());
  return Number.isFinite(number) ? number : fallback;
}

function toBoolean(value) {
  if (typeof value === "boolean") return value;
  const normalized = normalizeText(value).toLowerCase();
  return ["1", "true", "yes", "y", "active", "positive"].includes(normalized);
}

function firstPresent(row, keys) {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null && row[key] !== "") {
      return row[key];
    }
  }
  return undefined;
}

function normalizeIncomingRow(rawRow) {
  return Object.fromEntries(
    Object.entries(rawRow || {}).map(([key, value]) => [normalizeKey(key), value]),
  );
}

function mapEnum(value, lookup, fallback) {
  const normalized = normalizeText(value).toLowerCase();
  return lookup.get(normalized) || fallback;
}

function calculateLengthOfStay(row) {
  const explicit = firstPresent(row, ["length_of_stay", "los", "days_in_treatment"]);
  if (explicit !== undefined) return toNumber(explicit, 0);

  const admitDate = Date.parse(firstPresent(row, ["admit_date", "admission_date", "date_admitted"]));
  if (!Number.isFinite(admitDate)) return 0;

  const diff = Date.now() - admitDate;
  return Math.max(0, Math.floor(diff / 86400000));
}

function buildFlags(row) {
  return {
    smoker: toBoolean(firstPresent(row, ["smoker", "tobacco_use"])),
    unstable_housing: toNumber(firstPresent(row, ["unstable_housing", "housing_instability"]), 0),
    unemployed: toNumber(firstPresent(row, ["unemployed", "employment_unemployed"]), 0),
    psych_comorbid: toNumber(firstPresent(row, ["psych_comorbid", "mental_health_comorbidity"]), 0),
    criminal_justice: toNumber(firstPresent(row, ["criminal_justice", "justice_involved"]), 0),
    daily_use: toNumber(firstPresent(row, ["daily_use", "daily_substance_use"]), 0),
    no_self_help: toNumber(firstPresent(row, ["no_self_help", "not_attending_self_help"]), 0),
    iv_use: toNumber(firstPresent(row, ["iv_use", "injection_use"]), 0),
    no_insurance: toNumber(firstPresent(row, ["no_insurance", "uninsured"]), 0),
    pregnant_flag: toNumber(firstPresent(row, ["pregnant_flag", "pregnant"]), 0),
    court_referral: toNumber(firstPresent(row, ["court_referral"]), 0),
    self_referral: toNumber(firstPresent(row, ["self_referral"]), 0),
    homeless: toNumber(firstPresent(row, ["homeless"]), 0),
  };
}

export function cleanPatientRow(rawRow) {
  const row = normalizeIncomingRow(rawRow);
  const substance = firstPresent(row, ["substance", "primary_substance", "substance_name", "substance_encoded"]);
  const gender = firstPresent(row, ["gender", "sex", "gender_encoded"]);
  const levelOfCare = firstPresent(row, ["level_of_care", "loc", "program_level"]);
  const status = firstPresent(row, ["status", "patient_status"]);
  const lengthOfStay = calculateLengthOfStay(row);
  const substanceEncoded = Number.isFinite(Number(substance))
    ? toNumber(substance, 8)
    : mapEnum(substance, SUBSTANCE_MAP, 8);
  const genderEncoded = Number.isFinite(Number(gender))
    ? toNumber(gender, 0)
    : mapEnum(gender, GENDER_MAP, 0);

  const cleaned = {
    name: normalizeText(firstPresent(row, ["name", "patient_name", "full_name"])),
    episode_id: normalizeText(firstPresent(row, ["episode_id", "episode", "patient_id", "mrn"])),
    unit: normalizeText(firstPresent(row, ["unit", "program", "facility_unit"])),
    room_number: normalizeText(firstPresent(row, ["room_number", "room", "bed"])),
    level_of_care: mapEnum(levelOfCare, LEVEL_OF_CARE_MAP, "Residential"),
    admit_date: normalizeText(firstPresent(row, ["admit_date", "admission_date", "date_admitted"])),
    length_of_stay: lengthOfStay,
    substance_encoded: substanceEncoded,
    high_risk_substance: [2, 4, 7].includes(substanceEncoded) ? 1 : 0,
    has_prior_tx: toNumber(firstPresent(row, ["has_prior_tx", "prior_treatment"]), 0),
    prior_tx_count: toNumber(firstPresent(row, ["prior_tx_count", "prior_treatment_count"]), 0),
    age_encoded: toNumber(firstPresent(row, ["age_encoded", "age_bucket", "age"]), 0),
    service_encoded: toNumber(firstPresent(row, ["service_encoded", "service_code"]), 0),
    pain_level_score: toNumber(firstPresent(row, ["pain_level_score", "pain_score"]), 0),
    adhd_sud_comorbidity_flag: toNumber(firstPresent(row, ["adhd_sud_comorbidity_flag", "adhd"]), 0),
    calm_before_storm_velocity: toNumber(firstPresent(row, ["calm_before_storm_velocity"]), 0),
    female_flag: genderEncoded === 1 ? 1 : 0,
    separated_flag: toNumber(firstPresent(row, ["separated_flag", "separated"]), 0),
    divorced_flag: toNumber(firstPresent(row, ["divorced_flag", "divorced"]), 0),
    employed_full_time: toNumber(firstPresent(row, ["employed_full_time"]), 0),
    cliff_window: lengthOfStay >= 4 && lengthOfStay <= 7 ? 1 : 0,
    female_high_risk_sub: genderEncoded === 1 && [2, 4, 7].includes(substanceEncoded) ? 1 : 0,
    gender_encoded: genderEncoded,
    referral_motivation_score: toNumber(firstPresent(row, ["referral_motivation_score", "motivation_score"]), 0),
    admission_number: toNumber(firstPresent(row, ["admission_number", "admission_count"]), 1),
    risk_score: toNumber(firstPresent(row, ["risk_score"]), 0),
    risk_tier: normalizeText(firstPresent(row, ["risk_tier"])) || "LOW",
    previous_risk_score: toNumber(firstPresent(row, ["previous_risk_score"]), 0),
    velocity: toNumber(firstPresent(row, ["velocity"]), 0),
    alert_active: toBoolean(firstPresent(row, ["alert_active"])),
    alert_reason: normalizeText(firstPresent(row, ["alert_reason"])),
    calm_before_storm_flag: toBoolean(firstPresent(row, ["calm_before_storm_flag"])),
    top_drivers: normalizeText(firstPresent(row, ["top_drivers", "drivers"])),
    intervention: normalizeText(firstPresent(row, ["intervention", "recommended_intervention"])),
    known_peers: normalizeText(firstPresent(row, ["known_peers", "peer_group"])),
    status: mapEnum(status, STATUS_MAP, "Active"),
    ...buildFlags(row),
  };

  const issues = [];
  if (!cleaned.name) issues.push("Missing patient name");
  if (!cleaned.episode_id) issues.push("Missing episode/patient identifier");
  if (!cleaned.admit_date && !cleaned.length_of_stay) issues.push("Missing admit date or length of stay");

  return {
    cleaned,
    issues,
    source_keys: Object.keys(row),
  };
}

export function cleanPatientRows(rows) {
  const seenEpisodeIds = new Set();

  return (rows || []).map((rawRow, index) => {
    const result = cleanPatientRow(rawRow);
    const episodeId = result.cleaned.episode_id;

    if (episodeId && seenEpisodeIds.has(episodeId)) {
      result.issues.push("Duplicate episode/patient identifier");
    }
    if (episodeId) seenEpisodeIds.add(episodeId);

    return {
      row_number: index + 1,
      ...result,
      ready_for_scoring: result.issues.length === 0,
    };
  });
}
