import { Clock3, FileClock, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function PatientTimeline({ auditEvents, checkins, patient }) {
  if (!patient) return null;

  const events = [
    ...checkins
      .filter((checkin) => checkin.patientId === patient.id)
      .map((checkin) => ({
        id: checkin.id,
        at: checkin.createdAt,
        title: "Staff check-in real-time rescore",
        detail: checkin.note,
        actor: checkin.staff_id,
        tone: "trigger",
      })),
    ...auditEvents
      .filter((event) => event.patientId === patient.id)
      .map((event) => ({
        id: event.id,
        at: event.timestamp,
        title: event.eventType,
        detail: event.note,
        actor: event.actor,
        tone: "audit",
      })),
  ].toSorted((a, b) => new Date(b.at) - new Date(a.at));

  return (
    <Card className="border-border bg-card/95 shadow-panel" aria-labelledby="patient-timeline-title">
      <CardHeader className="border-b border-border p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle id="patient-timeline-title">24-Hour Timeline</CardTitle>
            <CardDescription>Recent triggers, interventions, and audit events for this patient.</CardDescription>
          </div>
          <Clock3 className="size-5 text-primary" aria-hidden="true" />
        </div>
      </CardHeader>
      <CardContent className="divide-y divide-border p-0">
        {events.map((event) => (
          <article key={event.id} className="grid gap-2 px-4 py-4 md:grid-cols-[150px_1fr]">
            <time className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {new Date(event.at).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </time>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={event.tone === "trigger" ? "low" : "secondary"} className="rounded-sm">
                  {event.tone === "trigger" ? <Zap className="size-3" aria-hidden="true" /> : <FileClock className="size-3" aria-hidden="true" />}
                  {event.tone === "trigger" ? "TRIGGER" : "AUDIT"}
                </Badge>
                <div className="font-semibold text-foreground">{event.title}</div>
              </div>
              <div className="mt-1 text-sm text-muted-foreground">{event.actor}</div>
              <p className="mt-2 text-sm leading-6 text-foreground/75">{event.detail}</p>
            </div>
          </article>
        ))}
      </CardContent>
    </Card>
  );
}
