import { Activity, ShieldAlert } from "lucide-react";
import { StatusPill } from "./StatusPill";

export function PatientRiskPanel({ patient, alert }) {
  if (!patient) return null;

  return (
    <section className="border border-line bg-white shadow-panel" aria-labelledby="ama-risk-title">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div>
          <h2 id="ama-risk-title" className="text-lg font-semibold text-ink">AMA Risk Indicators</h2>
          <p className="text-sm text-ink/60">Validated SUD AMA/dropout risk, not a general overdose prediction claim.</p>
        </div>
        <ShieldAlert className="h-5 w-5 text-amber" aria-hidden="true" />
      </div>
      <div className="grid gap-4 p-4 lg:grid-cols-[180px_1fr]">
        <div className="border border-line bg-field p-4 text-center">
          <div className="text-sm font-semibold text-moss">Day {patient.dayOfStay} score</div>
          <div className="mt-2 text-5xl font-semibold text-ink">{patient.amaRiskScore}</div>
          <div className="mt-3"><StatusPill value={patient.riskTier} /></div>
          <div className="mt-3 text-xs text-ink/60">{patient.trend}</div>
        </div>
        <div>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold text-ink">{patient.displayName}</h3>
              <p className="mt-1 text-sm text-ink/60">{patient.episodeId} - {patient.primarySubstance} - {patient.levelOfCare}</p>
            </div>
            <div className="text-sm text-ink/60">{patient.unit}</div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {patient.drivers.map((driver) => (
              <div key={driver} className="border border-line bg-clinic px-3 py-3 text-sm text-ink/75">{driver}</div>
            ))}
          </div>
          <div className="mt-4 flex items-start gap-3 border-l-4 border-amber bg-amber/10 p-4">
            <Activity className="mt-0.5 h-5 w-5 text-amber" aria-hidden="true" />
            <div>
              <div className="text-sm font-semibold text-ink">Recommended retention action</div>
              <p className="mt-1 text-sm leading-5 text-ink/75">{alert?.requiredAction || patient.suggestedAction}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
