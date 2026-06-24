async function dashboardFetch(path, options = {}) {
  const defaultBase =
    typeof window !== "undefined" && window.location.hostname === "127.0.0.1"
      ? "http://127.0.0.1:8081"
      : "";
  const apiBase = import.meta.env.VITE_PILOT_API_URL || defaultBase;
  const response = await fetch(`${apiBase}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });

  if (!response.ok) {
    throw new Error(`CensusGuard API request failed: ${response.status}`);
  }

  return response.json();
}

export const censusGuardAdapter = {
  async getBootstrap() {
    try {
      return await dashboardFetch("/api/bootstrap");
    } catch {
      return null;
    }
  },
  async getPatients() {
    try {
      return await dashboardFetch("/api/patients");
    } catch {
      return [];
    }
  },
  async getScoreHistory(patientId) {
    try {
      return await dashboardFetch(`/api/patients/${patientId}/score-history`);
    } catch {
      return [];
    }
  },
  async getClinicalActions(patientId) {
    try {
      return await dashboardFetch(`/api/patients/${patientId}/clinical-actions`);
    } catch {
      return [];
    }
  },
  async createClinicalAction(action) {
    return dashboardFetch("/api/clinical-actions", {
      method: "POST",
      body: JSON.stringify(action)
    });
  },
  async getGroupNarratives() {
    try {
      return await dashboardFetch("/api/group-narratives");
    } catch {
      return [];
    }
  },
  async createGroupNarrative(narrative) {
    return dashboardFetch("/api/group-narratives", {
      method: "POST",
      body: JSON.stringify(narrative)
    });
  },
  async createStaffCheckIn(checkIn) {
    return dashboardFetch("/api/staff-check-ins", {
      method: "POST",
      body: JSON.stringify(checkIn)
    });
  },
  async scorePatient(payload) {
    return dashboardFetch("/api/score", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }
};
