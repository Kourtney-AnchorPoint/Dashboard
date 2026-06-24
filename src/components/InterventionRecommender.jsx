import { toast } from "sonner";
import { Activity, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function InterventionRecommender({ alert, patient, onApprove }) {
  if (!patient) return null;

  const directive = alert?.requiredAction || patient.suggestedAction;

  function handleApprove() {
    onApprove({
      alert,
      action: "Intervention documented",
      user: "Maya LCSW",
      note: `Approved proactive recommendation: ${directive}`,
    });
    toast.success("Intervention approved and audit event queued");
  }

  return (
    <Card className="border-coral/40 bg-critical-bg shadow-panel">
      <CardHeader className="border-b border-coral/20 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Activity className="size-5 text-high" aria-hidden="true" />
              InterventionRecommender
            </CardTitle>
            <CardDescription>Proactive action surfaced from AMA risk and staff stream context.</CardDescription>
          </div>
          <Badge variant="low" className="gap-1 rounded-sm">
            <Zap className="size-3" aria-hidden="true" />
            TRIGGER
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 p-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-primary">Critical shift detected in Staff Stream</div>
          <p className="mt-2 text-lg font-semibold leading-7 text-foreground">{directive}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {patient.displayName} is at {patient.amaRiskScore} AMA risk with active {patient.riskTier.toLowerCase()} tier indicators.
          </p>
        </div>
        <Button type="button" onClick={handleApprove} className="bg-primary text-primary-foreground hover:bg-primary/85">
          Approve and log
        </Button>
      </CardContent>
    </Card>
  );
}
