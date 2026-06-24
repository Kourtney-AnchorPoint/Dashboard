import { ArrowRight, Clock3, FileText, ShieldAlert, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function riskVariant(tier) {
  if (tier === "CRITICAL") return "critical";
  if (tier === "HIGH") return "high";
  if (tier === "MODERATE") return "moderate";
  return "low";
}

export function CommandDetailPanel({ alert, patient, onApproveAction, onOpenProfile }) {
  if (!patient) return null;

  const triggerTime = patient.lastTrigger
    ? new Date(patient.lastTrigger.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "Admission";
  const directive = alert?.requiredAction || patient.suggestedAction;

  function handleApprove() {
    if (!alert) return;
    onApproveAction({
      alert,
      action: "Intervention documented",
      user: "Maya LCSW",
      note: `Command Center quick action: ${directive}`,
    });
  }

  return (
    <aside className="xl:sticky xl:top-28 xl:self-start" aria-label="Selected patient detail panel">
      <Card className="overflow-hidden border-primary/30 bg-card/95 shadow-[0_0_36px_rgba(16,216,240,0.08)]">
        <CardHeader className="border-b border-border p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="size-5 text-primary" aria-hidden="true" />
                Triage Detail
              </CardTitle>
              <CardDescription>Updates when you click a KPI, alert, patient row, or score.</CardDescription>
            </div>
            <Badge variant={riskVariant(patient.riskTier)}>{patient.riskTier}</Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 p-4">
          <button
            type="button"
            onClick={onOpenProfile}
            className="group border border-primary/30 bg-primary/10 p-4 text-left transition hover:border-primary hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={`Open full profile for ${patient.displayName}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold uppercase tracking-wide text-primary">Selected patient</div>
                <div className="mt-1 text-xl font-semibold text-foreground">{patient.displayName}</div>
                <div className="mt-1 text-xs text-muted-foreground">{patient.episodeId} - {patient.levelOfCare}</div>
              </div>
              <ArrowRight className="size-5 text-primary transition group-hover:translate-x-0.5" aria-hidden="true" />
            </div>
            <div className="mt-4 flex items-end justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">AMA risk score</div>
                <div className="mt-1 text-5xl font-semibold leading-none text-foreground">{patient.amaRiskScore}</div>
              </div>
              <div className="text-right text-xs text-muted-foreground">{patient.trend}</div>
            </div>
          </button>

          <div className="grid gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
              <Zap className="size-3.5" aria-hidden="true" />
              Last Staff Check-in Trigger
            </div>
            <div className="border border-border bg-background p-3 text-sm text-foreground/80">
              {patient.lastTrigger?.role || "Intake"} at {triggerTime}
              <div className="mt-1 text-xs text-muted-foreground">{patient.lastTrigger?.label || "Admission intake baseline"}</div>
            </div>
          </div>

          <div className="grid gap-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Top risk drivers</div>
            {patient.drivers.map((driver) => (
              <button
                key={driver}
                type="button"
                className="border border-border bg-background px-3 py-2 text-left text-sm text-foreground/80 transition hover:border-primary/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {driver}
              </button>
            ))}
          </div>

          <div className="border border-high/30 bg-high/10 p-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <FileText className="size-4 text-high" aria-hidden="true" />
              Recommended action
            </div>
            <p className="mt-2 text-sm leading-6 text-foreground/75">{directive}</p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <Button type="button" onClick={handleApprove} disabled={!alert} className="bg-primary text-primary-foreground hover:bg-primary/85">
              Log action
            </Button>
            <Button type="button" variant="clinical" onClick={onOpenProfile}>
              <Clock3 className="size-4" aria-hidden="true" />
              Full profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
