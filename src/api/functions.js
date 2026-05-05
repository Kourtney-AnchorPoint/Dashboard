import { apiRequest } from "./http";

const DEFAULT_API_MODE = "demo";

function getApiMode() {
  return import.meta?.env?.VITE_CENSUSGUARD_API_MODE || DEFAULT_API_MODE;
}

export function scorePatient(patient) {
  return apiRequest(`/api/${getApiMode()}/censusguard/score-patient`, {
    method: "POST",
    body: JSON.stringify(patient || {}),
  });
}

export function cleanPatients(rows) {
  return apiRequest(`/api/${getApiMode()}/censusguard/clean-patients`, {
    method: "POST",
    body: JSON.stringify({ rows: rows || [] }),
  });
}
