import { createContext, useContext, useMemo, useState } from "react";
import { staffCheckins, initialAlerts, initialAuditEvents, patients } from "@/data/censusGuardData";
import { applyAlertAction } from "@/lib/pilotState";

const PilotDataContext = createContext(null);

export function PilotDataProvider({ children }) {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [auditEvents, setAuditEvents] = useState(initialAuditEvents);
  const [selectedAlertId, setSelectedAlertId] = useState(initialAlerts[0]?.id);

  const patientsById = useMemo(() => new Map(patients.map((patient) => [patient.id, patient])), []);
  const selectedAlert = alerts.find((alert) => alert.id === selectedAlertId) || alerts[0];
  const selectedPatient = selectedAlert ? patientsById.get(selectedAlert.patientId) : patients[0];

  function applyAction({ alert, action, user, note }) {
    const result = applyAlertAction({ alert, action, user, note });
    setAlerts((current) => current.map((item) => item.id === result.alert.id ? result.alert : item));
    setAuditEvents((current) => [result.auditEvent, ...current]);
  }

  function selectPatient(patientId) {
    const matchingAlert = alerts.find((alert) => alert.patientId === patientId);
    if (matchingAlert) {
      setSelectedAlertId(matchingAlert.id);
    }
  }

  const value = {
    alerts,
    auditEvents,
    staffCheckins,
    patients,
    patientsById,
    selectedAlert,
    selectedAlertId,
    selectedPatient,
    setSelectedAlertId,
    applyAction,
    selectPatient,
  };

  return <PilotDataContext.Provider value={value}>{children}</PilotDataContext.Provider>;
}

export function usePilotData() {
  const context = useContext(PilotDataContext);
  if (!context) {
    throw new Error("usePilotData must be used inside PilotDataProvider");
  }
  return context;
}
