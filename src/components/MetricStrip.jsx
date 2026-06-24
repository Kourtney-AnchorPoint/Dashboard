import { Activity, AlertTriangle, Gauge, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MetricStrip({ alerts, patients, onSelectMetric }) {
  const critical = alerts.filter((alert) => alert.severity === "Critical").length;
  const open = alerts.filter((alert) => !["Resolved", "Override/false positive"].includes(alert.status)).length;
  const averageRisk = Math.round(patients.reduce((sum, patient) => sum + patient.amaRiskScore, 0) / patients.length);

  const metrics = [
    { id: "open", label: "Open alerts", value: open, detail: "Retention actions pending", icon: AlertTriangle, tone: "text-critical" },
    { id: "critical", label: "Critical AMA risk", value: critical, detail: "Needs same-shift response", icon: Gauge, tone: "text-critical" },
    { id: "averageRisk", label: "Active risk score", value: averageRisk, detail: "Across visible pilot census", icon: Activity, tone: "text-primary" },
    { id: "audit", label: "Audit coverage", value: "100%", detail: "Every alert starts a trail", icon: ShieldCheck, tone: "text-primary" },
  ];

  return (
    <section className="grid gap-3 md:grid-cols-4" aria-label="Pilot status metrics">
      {metrics.map((metric) => (
        <Card key={metric.label} className="overflow-hidden border-border/90 bg-card/95 shadow-panel">
          <button
            type="button"
            onClick={() => onSelectMetric?.(metric.id)}
            className="block h-full w-full text-left transition hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <CardHeader className="flex flex-row items-start justify-between gap-3 p-4 pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{metric.label}</CardTitle>
              <metric.icon className={`size-4 ${metric.tone}`} aria-hidden="true" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-3xl font-semibold leading-none text-foreground">{metric.value}</div>
              <div className="mt-2 text-sm text-muted-foreground">{metric.detail}</div>
            </CardContent>
          </button>
        </Card>
      ))}
    </section>
  );
}
