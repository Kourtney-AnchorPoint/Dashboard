import { MapPin, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const cliffWindows = [
  { label: "D1-3", value: "31.3%", detail: "early ambivalence" },
  { label: "D4-7", value: "24.5%", detail: "medically monitored" },
  { label: "D8-14", value: "37.4%", detail: "early cliff window" },
  { label: "D15-21", value: "41.7%", detail: "peak forecast window" },
  { label: "D22-35", value: "33.1%", detail: "stabilization band" },
  { label: "D35+", value: "43.7%", detail: "extended stay risk" },
];

const hazardRatios = [
  { label: "Self-referral", value: "1.42x", tone: "critical" },
  { label: "Unemployed", value: "1.26x", tone: "high" },
  { label: "Unstable housing", value: "1.19x", tone: "high" },
  { label: "Court referral", value: "0.81x", tone: "low" },
];

const survivalStats = [
  { label: "Past Day 7", value: "90.7%" },
  { label: "Past Day 14", value: "87.2%" },
  { label: "Past Day 21", value: "84.3%" },
  { label: "Past Day 35", value: "54.7%" },
];

export function ForecastLayerCard() {
  return (
    <Card className="border-primary/30 bg-card/95 shadow-[0_0_34px_rgba(16,216,240,0.08)]">
      <CardHeader className="border-b border-border p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-5 text-primary" aria-hidden="true" />
              Forecast Layer
            </CardTitle>
            <CardDescription>TEDS-D 2023 survival simulation. Timing layer only; Vertex remains the Day-1 classifier.</CardDescription>
          </div>
          <Badge variant="low" className="rounded-sm">SURVIVAL POC</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 p-4 xl:grid-cols-[1.2fr_0.9fr_0.9fr]">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cliff windows</div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 2xl:grid-cols-3">
            {cliffWindows.map((window) => (
              <div key={window.label} className="border border-border bg-background p-3">
                <div className="text-sm font-semibold text-primary">{window.label}</div>
                <div className="mt-1 text-2xl font-semibold text-foreground">{window.value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{window.detail}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Survival curve</div>
          <div className="mt-3 grid gap-2">
            {survivalStats.map((stat) => (
              <div key={stat.label} className="flex items-center justify-between gap-3 border border-border bg-background px-3 py-2">
                <span className="text-sm text-foreground/80">{stat.label}</span>
                <span className="text-sm font-semibold text-primary">{stat.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 border border-critical/30 bg-critical-bg p-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-critical">Oklahoma validation</div>
            <div className="mt-1 text-2xl font-semibold text-foreground">49.9%</div>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">AMA rate across 8,760 Oklahoma TEDS-D 2023 records; national rate is 34.1%.</p>
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cox hazard drivers</div>
          <div className="mt-3 grid gap-2">
            {hazardRatios.map((driver) => (
              <div key={driver.label} className="flex items-center justify-between gap-3 border border-border bg-background px-3 py-2">
                <span className="text-sm text-foreground/80">{driver.label}</span>
                <Badge variant={driver.tone} className="rounded-sm">{driver.value}</Badge>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            Self-referral is exploratory until Vertex validation. Court referral currently reads as protective in the Cox sample.
          </p>
          <div className="mt-3 flex items-start gap-2 border border-primary/20 bg-primary/10 p-3 text-xs leading-5 text-foreground/75">
            <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            <span>Vertex-ready file: 952,358 rows, 27 features, targets <span className="font-semibold text-primary">is_ama</span> and <span className="font-semibold text-primary">days_in_treatment</span>.</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
