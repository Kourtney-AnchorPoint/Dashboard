import { AlertTriangle, Clock3 } from "lucide-react";
import { StatusPill } from "./StatusPill";

export function AlertQueue({ alerts, patientsById, selectedAlertId, onSelectAlert }) {
  return (
    <section className="border border-line bg-white shadow-panel" aria-labelledby="alert-queue-title">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div>
          <h2 id="alert-queue-title" className="text-lg font-semibold text-ink">Alert Queue</h2>
          <p className="text-sm text-ink/60">Prioritized AMA risk alerts for SUD retention workflow.</p>
        </div>
        <AlertTriangle className="h-5 w-5 text-coral" aria-hidden="true" />
      </div>
      <div className="divide-y divide-line">
        {alerts.map((alert) => {
          const patient = patientsById.get(alert.patientId);
          const isSelected = alert.id === selectedAlertId;
          return (
            <button
              key={alert.id}
              type="button"
              onClick={() => onSelectAlert(alert.id)}
              className={`w-full px-4 py-4 text-left transition hover:bg-field ${isSelected ? "bg-field" : "bg-white"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-ink">{patient?.displayName}</div>
                  <div className="mt-1 text-sm text-ink/60">{patient?.unit} - {patient?.levelOfCare}</div>
                </div>
                <StatusPill value={alert.severity} />
              </div>
              <p className="mt-3 text-sm leading-5 text-ink/75">{alert.reason}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-ink/55">
                <StatusPill value={alert.status} />
                <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" /> {new Date(alert.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                <span>{alert.owner || "Unassigned"}</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
