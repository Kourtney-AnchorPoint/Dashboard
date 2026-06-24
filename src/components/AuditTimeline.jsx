import { FileClock } from "lucide-react";

export function AuditTimeline({ events, patientsById }) {
  return (
    <section className="border border-line bg-white shadow-panel" aria-labelledby="audit-trail-title">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div>
          <h2 id="audit-trail-title" className="text-lg font-semibold text-ink">Audit Trail</h2>
          <p className="text-sm text-ink/60">Every alert starts an event trail; audit is product behavior, not afterthought logging.</p>
        </div>
        <FileClock className="h-5 w-5 text-pine" aria-hidden="true" />
      </div>
      <div className="divide-y divide-line">
        {events.map((event) => {
          const patient = patientsById.get(event.patientId);
          return (
            <div key={event.id} className="px-4 py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-semibold text-ink">{event.eventType}</div>
                <time className="text-xs text-ink/50">{new Date(event.timestamp).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</time>
              </div>
              <div className="mt-1 text-sm text-ink/60">{patient?.displayName || event.patientId} - {event.actor}</div>
              <p className="mt-2 text-sm leading-5 text-ink/75">{event.note}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
