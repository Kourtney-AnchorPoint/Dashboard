import { apiRequest } from "./http";

const DEFAULT_API_MODE = "demo";

function getApiMode() {
  return import.meta?.env?.VITE_CENSUSGUARD_API_MODE || DEFAULT_API_MODE;
}

function createEntityClient(entityName) {
  const basePath = () => `/api/${getApiMode()}/entities/${entityName}`;

  return {
    list() {
      return apiRequest(basePath());
    },

    filter(query) {
      return apiRequest(`${basePath()}/query`, {
        method: "POST",
        body: JSON.stringify(query || {}),
      });
    },

    create(data) {
      return apiRequest(basePath(), {
        method: "POST",
        body: JSON.stringify(data || {}),
      });
    },

    update(id, data) {
      return apiRequest(`${basePath()}/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(data || {}),
      });
    },

    delete(id) {
      return apiRequest(`${basePath()}/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    },
  };
}

export const Patient = createEntityClient("Patient");
export const ScoreHistory = createEntityClient("ScoreHistory");
export const ClinicalAction = createEntityClient("ClinicalAction");
export const GroupCohesion = createEntityClient("GroupCohesion");
export const Task = createEntityClient("Task");
export const MoneyTracker = createEntityClient("MoneyTracker");
export const DemoLead = createEntityClient("DemoLead");
