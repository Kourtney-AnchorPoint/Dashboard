const DEFAULT_PROJECT_ID = "censusguard-proof-of-concept";
const DEFAULT_LOCATION = "us-south1";
const DEFAULT_ENDPOINT_ID = "6906353591456366592";

export const CENSUSGUARD_FEATURE_COLUMNS = [
  "STFIPS",
  "EDUC",
  "MARSTAT",
  "SERVICES",
  "DETCRIM",
  "PSOURCE",
  "NOPRIOR",
  "ARRESTS",
  "EMPLOY",
  "METHUSE",
  "PSYPROB",
  "PREG",
  "SEX",
  "VET",
  "LIVARAG",
  "DAYWAIT",
  "DSMCRIT",
  "AGE",
  "RACE",
  "ETHNIC",
  "DETNLF",
  "PRIMINC",
  "SUB1",
  "SUB2",
  "SUB3",
  "ROUTE1",
  "ROUTE2",
  "ROUTE3",
  "FREQ1",
  "FREQ2",
  "FREQ3",
  "FRSTUSE1",
  "FRSTUSE2",
  "FRSTUSE3",
  "HLTHINS",
  "PRIMPAY",
  "FREQ_ATND_SELF_HELP",
  "ALCFLG",
  "COKEFLG",
  "MARFLG",
  "HERFLG",
  "METHFLG",
  "OPSYNFLG",
  "PCPFLG",
  "HALLFLG",
  "MTHAMFLG",
  "AMPHFLG",
  "STIMFLG",
  "BENZFLG",
  "TRNQFLG",
  "BARBFLG",
  "SEDHPFLG",
  "INHFLG",
  "OTCFLG",
  "OTHERFLG",
  "DIVISION",
  "REGION",
  "IDU",
  "ALCDRUG",
  "CBSA2020"
];

function endpointUrl() {
  const projectId = process.env.VERTEX_PROJECT_ID || DEFAULT_PROJECT_ID;
  const location = process.env.VERTEX_LOCATION || DEFAULT_LOCATION;
  const endpointId = process.env.VERTEX_ENDPOINT_ID || DEFAULT_ENDPOINT_ID;
  const host = process.env.VERTEX_API_HOST || `${location}-aiplatform.googleapis.com`;

  return `https://${host}/v1/projects/${projectId}/locations/${location}/endpoints/${endpointId}:predict`;
}

async function getAccessToken() {
  const configuredToken = process.env.VERTEX_ACCESS_TOKEN || process.env.GOOGLE_ACCESS_TOKEN;
  if (configuredToken) return configuredToken;

  const response = await fetch(
    "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token",
    { headers: { "Metadata-Flavor": "Google" } }
  );

  if (!response.ok) {
    throw new Error(`Could not get Cloud Run service account token: ${response.status}`);
  }

  const tokenPayload = await response.json();
  if (!tokenPayload.access_token) {
    throw new Error("Cloud Run metadata server did not return an access token.");
  }

  return tokenPayload.access_token;
}

export function normalizeCensusGuardInstance(rawInstance = {}) {
  const instance = {};
  const missing = [];

  for (const column of CENSUSGUARD_FEATURE_COLUMNS) {
    const value = rawInstance[column];
    if (value === undefined || value === null || value === "") {
      missing.push(column);
    } else {
      instance[column] = String(value);
    }
  }

  return { instance, missing };
}

function parseAmaPrediction(prediction) {
  const classes = prediction?.classes || prediction?.displayNames || [];
  const scores = prediction?.scores || prediction?.confidences || [];
  const positiveIndex = classes.findIndex((value) => String(value) === "1" || String(value).toLowerCase() === "true");

  if (positiveIndex >= 0 && scores[positiveIndex] !== undefined) {
    return Number(scores[positiveIndex]);
  }

  if (typeof prediction?.value === "number") return prediction.value;
  if (typeof prediction?.score === "number") return prediction.score;
  return null;
}

export async function predictCensusGuardAmaRisk(payload) {
  const rawInstances = Array.isArray(payload?.instances) ? payload.instances : [payload];
  const normalized = rawInstances.map(normalizeCensusGuardInstance);
  const missingByRow = normalized.map((item) => item.missing);

  if (missingByRow.some((missing) => missing.length)) {
    const error = new Error("Prediction request is missing required CensusGuard feature columns.");
    error.statusCode = 400;
    error.missingByRow = missingByRow;
    throw error;
  }

  const token = await getAccessToken();
  const response = await fetch(endpointUrl(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ instances: normalized.map((item) => item.instance) })
  });

  const result = await response.json();

  if (!response.ok) {
    const error = new Error(result?.error?.message || `Vertex prediction failed: ${response.status}`);
    error.statusCode = response.status;
    error.vertexError = result;
    throw error;
  }

  const predictions = Array.isArray(result.predictions) ? result.predictions : [];
  return {
    endpoint: endpointUrl(),
    predictions,
    amaProbability: predictions.length ? parseAmaPrediction(predictions[0]) : null,
    raw: result
  };
}
