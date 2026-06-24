import { useNavigate } from "react-router-dom";
import { AlertQueue } from "@/components/AlertQueue";
import { CommandDetailPanel } from "@/components/CommandDetailPanel";
import { ForecastLayerCard } from "@/components/ForecastLayerCard";
import { MetricStrip } from "@/components/MetricStrip";
import { PatientMonitorTable } from "@/components/PatientMonitorTable";
import { usePilotData } from "@/context/PilotDataContext";

export function CommandCenter() {
  const navigate = useNavigate();
  const { alerts, patients, patientsById, selectedAlert, selectedPatient, setSelectedAlertId, selectPatient, applyAction } = usePilotData();

  function handleSelectAlert(alertId) {
    setSelectedAlertId(alertId);
  }

  function handleSelectPatient(patientId) {
    selectPatient(patientId);
  }

  function handleSelectMetric(metricId) {
    if (metricId === "audit") {
      navigate("/audit");
      return;
    }

    if (metricId === "critical") {
      const criticalAlert = alerts.find((alert) => alert.severity === "Critical");
      if (criticalAlert) setSelectedAlertId(criticalAlert.id);
      return;
    }

    if (metricId === "averageRisk") {
      const highestRiskPatient = [...patients].sort((a, b) => b.amaRiskScore - a.amaRiskScore)[0];
      if (highestRiskPatient) selectPatient(highestRiskPatient.id);
      return;
    }

    const openAlert = alerts.find((alert) => !["Resolved", "Override/false positive"].includes(alert.status));
    if (openAlert) setSelectedAlertId(openAlert.id);
  }

  function handleOpenProfile() {
    if (selectedPatient) navigate(`/patient/${selectedPatient.id}`);
  }

  return (
    <>
      <section>
        <h1 className="text-2xl font-semibold text-foreground">Command Center</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          Triage-first SUD retention command view for open AMA alerts, risk-tier scanning, and rapid patient selection.
        </p>
      </section>
      <MetricStrip alerts={alerts} patients={patients} onSelectMetric={handleSelectMetric} />
      <ForecastLayerCard />
      <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)_390px]">
        <AlertQueue alerts={alerts} patientsById={patientsById} selectedAlertId={selectedAlert?.id} onSelectAlert={handleSelectAlert} />
        <PatientMonitorTable patients={patients} selectedPatientId={selectedAlert?.patientId} onSelectPatient={handleSelectPatient} />
        <CommandDetailPanel alert={selectedAlert} patient={selectedPatient} onApproveAction={applyAction} onOpenProfile={handleOpenProfile} />
      </div>
    </>
  );
}
