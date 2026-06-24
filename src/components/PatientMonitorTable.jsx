import { Clock3, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function riskVariant(tier) {
  if (tier === "CRITICAL") return "critical";
  if (tier === "HIGH") return "high";
  if (tier === "MODERATE") return "moderate";
  return "low";
}

function triggerText(patient) {
  if (!patient.lastTrigger) return "Admission intake";
  const time = new Date(patient.lastTrigger.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return `⚡ Triggered by ${patient.lastTrigger.role} check-in at ${time}`;
}

export function PatientMonitorTable({ patients, selectedPatientId, onSelectPatient }) {
  return (
    <Card className="border-border bg-card/95 shadow-panel" aria-labelledby="patient-monitor-title">
      <CardHeader className="border-b border-border p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle id="patient-monitor-title">Patient Monitor</CardTitle>
            <CardDescription>Dense SUD census view with risk tier, active trigger, and next retention action.</CardDescription>
          </div>
          <Badge variant="low" className="gap-1 rounded-sm">
            <Zap className="size-3" aria-hidden="true" />
            TRIGGER
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-border/90 bg-muted/30 hover:bg-muted/30">
              <TableHead>Patient</TableHead>
              <TableHead>Program</TableHead>
              <TableHead>Risk Tier</TableHead>
              <TableHead className="text-right">Score</TableHead>
              <TableHead>Last Note</TableHead>
              <TableHead>Next Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((patient) => {
              const isSelected = patient.id === selectedPatientId;
              return (
                <TableRow
                  key={patient.id}
                  data-state={isSelected ? "selected" : undefined}
                  className="cursor-pointer border-border/80"
                  onClick={() => onSelectPatient(patient.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelectPatient(patient.id);
                    }
                  }}
                  tabIndex={0}
                >
                  <TableCell>
                    <div className="font-semibold text-foreground">{patient.displayName}</div>
                    <div className="text-xs text-muted-foreground">{patient.episodeId}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-foreground/90">{patient.levelOfCare}</div>
                    <div className="text-xs text-muted-foreground">{patient.unit}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={riskVariant(patient.riskTier)}>{patient.riskTier}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelectPatient(patient.id);
                      }}
                      className="border border-primary/30 bg-primary/10 px-3 py-1.5 text-lg font-semibold text-foreground transition hover:border-primary hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      aria-label={`Show ${patient.displayName} risk score in triage detail panel`}
                    >
                      {patient.amaRiskScore}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-primary">
                      <Clock3 className="size-3.5" aria-hidden="true" />
                      <span className="text-xs font-semibold">{triggerText(patient)}</span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{patient.lastTrigger?.label || patient.trend}</div>
                  </TableCell>
                  <TableCell className="max-w-[260px] text-sm text-foreground/75">{patient.suggestedAction}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
