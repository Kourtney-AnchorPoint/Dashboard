import { DatabaseZap } from "lucide-react";

export function IntakePanel() {
  const rows = [
    ["Adapter boundary", "CSV/API intake first; Kipu or SUD EHR adapter later"],
    ["Data lane", "SUD treatment retention only"],
    ["Scoring route", "Backend only; frontend never calls Vertex directly"],
    ["Environment boundary", "Protected dashboard data stays behind server-side endpoints"],
  ];

  return (
    <section className="border border-line bg-white shadow-panel" aria-labelledby="intake-title">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div>
          <h2 id="intake-title" className="text-lg font-semibold text-ink">Pilot Intake Boundary</h2>
          <p className="text-sm text-ink/60">Core product stays independent from any one EHR.</p>
        </div>
        <DatabaseZap className="h-5 w-5 text-pine" aria-hidden="true" />
      </div>
      <dl className="divide-y divide-line">
        {rows.map(([label, value]) => (
          <div key={label} className="grid gap-1 px-4 py-3 sm:grid-cols-[150px_1fr]">
            <dt className="text-sm font-semibold text-ink">{label}</dt>
            <dd className="text-sm text-ink/65">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
