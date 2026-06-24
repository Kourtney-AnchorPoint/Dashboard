import { RadioTower } from "lucide-react";

export function StaffRipplePanel({ checkins, selectedPatientId }) {
  const selectedRows = checkins.filter((checkin) => checkin.patientId === selectedPatientId);
  const visibleRows = selectedRows.length ? selectedRows : checkins;

  return (
    <section className="border border-line bg-white shadow-panel" aria-labelledby="staff-ripple-title">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div>
          <h2 id="staff-ripple-title" className="text-lg font-semibold text-ink">Staff Check-ins & Group Ripple</h2>
          <p className="text-sm text-ink/60">Observation reliability and unit-level risk context stay server-side in production.</p>
        </div>
        <RadioTower className="h-5 w-5 text-pine" aria-hidden="true" />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-field text-left text-xs uppercase tracking-wide text-moss">
            <tr>
              <th className="px-4 py-3 font-semibold">Unit</th>
              <th className="px-4 py-3 font-semibold">Staff</th>
              <th className="px-4 py-3 font-semibold">Behavior</th>
              <th className="px-4 py-3 font-semibold">Ripple</th>
              <th className="px-4 py-3 font-semibold">Reliability</th>
              <th className="px-4 py-3 font-semibold">Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {visibleRows.map((row) => (
              <tr key={row.id} className="align-top">
                <td className="px-4 py-3 font-medium text-ink">{row.unit_id}</td>
                <td className="px-4 py-3 text-ink/70">{row.staff_id}</td>
                <td className="px-4 py-3 text-ink/70">{row.behavior_score} / velocity {row.behavioral_velocity}</td>
                <td className="px-4 py-3 font-semibold text-pine">{row.group_ripple_index.toFixed(1)}</td>
                <td className="px-4 py-3 text-ink/70">{row.staff_reliability_score.toFixed(2)}</td>
                <td className="max-w-[260px] px-4 py-3 text-ink/70">{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
