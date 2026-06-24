import { AuditTimeline } from "@/components/AuditTimeline";
import { usePilotData } from "@/context/PilotDataContext";

export function AuditTrail() {
  const { auditEvents, patientsById } = usePilotData();

  return (
    <>
      <section>
        <h1 className="text-2xl font-semibold text-foreground">Audit Trail</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          Read-only operational trail for alert creation, acknowledgement, intervention documentation, and override decisions.
        </p>
      </section>
      <AuditTimeline events={auditEvents} patientsById={patientsById} />
    </>
  );
}
