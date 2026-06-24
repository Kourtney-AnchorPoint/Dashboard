import { StaffRipplePanel } from "@/components/StaffRipplePanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePilotData } from "@/context/PilotDataContext";

export function CohortDynamics() {
  const { staffCheckins } = usePilotData();
  const averageRipple = staffCheckins.reduce((sum, row) => sum + row.group_ripple_index, 0) / staffCheckins.length;
  const averageReliability = staffCheckins.reduce((sum, row) => sum + row.staff_reliability_score, 0) / staffCheckins.length;

  return (
    <>
      <section>
        <h1 className="text-2xl font-semibold text-foreground">Cohort Dynamics</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          Staff check-in group-ripple context for SUD unit-level risk. This view stays focused on cohort behavior, reliability filtering, and group dynamics.
        </p>
      </section>
      <div className="grid gap-3 md:grid-cols-2">
        <Card className="border-border bg-card/95 shadow-panel">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Average ripple index</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-3xl font-semibold text-primary">{averageRipple.toFixed(1)}</div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card/95 shadow-panel">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Staff reliability filter</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-3xl font-semibold text-primary">{averageReliability.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>
      <StaffRipplePanel checkins={staffCheckins} />
    </>
  );
}
