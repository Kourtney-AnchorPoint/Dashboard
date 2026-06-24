import { Link, useParams } from "react-router-dom";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, BarChart3, ShieldAlert } from "lucide-react";
import { ActionWorkflow } from "@/components/ActionWorkflow";
import { InterventionRecommender } from "@/components/InterventionRecommender";
import { UnifiedStaffStream } from "@/components/UnifiedStaffStream";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { usePilotData } from "@/context/PilotDataContext";

const driverWeights = {
  "patient-01": [
    { label: "Level of Care", value: 21 },
    { label: "Isolation / withdrawal cues", value: 15 },
    { label: "Referral motivation", value: 13 },
  ],
  "patient-02": [
    { label: "Level of Care", value: 21 },
    { label: "Group disengagement", value: 16 },
    { label: "Housing instability", value: 12 },
  ],
  "patient-03": [
    { label: "Level of Care", value: 21 },
    { label: "Transportation barrier", value: 14 },
    { label: "Limited sober support", value: 11 },
  ],
};

const scoreHistory = {
  "patient-01": [
    { time: "8 AM", score: 73 },
    { time: "10 AM", score: 78 },
    { time: "12 PM", score: 83 },
    { time: "2 PM", score: 91 },
  ],
  "patient-02": [
    { time: "8 AM", score: 62 },
    { time: "10 AM", score: 68 },
    { time: "12 PM", score: 74 },
    { time: "2 PM", score: 78 },
  ],
  "patient-03": [
    { time: "8 AM", score: 51 },
    { time: "10 AM", score: 53 },
    { time: "12 PM", score: 52 },
    { time: "2 PM", score: 54 },
  ],
};

function riskVariant(tier) {
  if (tier === "CRITICAL") return "critical";
  if (tier === "HIGH") return "high";
  if (tier === "MODERATE") return "moderate";
  return "low";
}

function RiskBreakdownCard({ patient }) {
  const drivers = driverWeights[patient.id] || driverWeights["patient-01"];

  return (
    <Card className="border-border bg-card/95 shadow-panel">
      <CardHeader className="border-b border-border p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="size-5 text-high" aria-hidden="true" />
              Risk Breakdown
            </CardTitle>
            <CardDescription>Top weighted AMA risk drivers for the current 24-hour window.</CardDescription>
          </div>
          <Badge variant={riskVariant(patient.riskTier)}>{patient.riskTier}</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-5 p-4 lg:grid-cols-[170px_1fr]">
        <div className="border border-border bg-background p-4 text-center">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">AMA risk score</div>
          <div className="mt-3 text-5xl font-semibold leading-none text-foreground">{patient.amaRiskScore}</div>
          <div className="mt-3 text-xs leading-5 text-muted-foreground">{patient.trend}</div>
        </div>
        <div className="grid content-center gap-4">
          {drivers.map((driver) => (
            <div key={driver.label} className="grid gap-2">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-foreground">{driver.label}</span>
                <span className="text-primary">{driver.value}%</span>
              </div>
              <Progress value={driver.value} indicatorClassName={patient.riskTier === "CRITICAL" ? "bg-critical" : "bg-primary"} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ScoreHistoryCard({ patient }) {
  const rows = scoreHistory[patient.id] || scoreHistory["patient-01"];

  return (
    <Card className="border-border bg-card/95 shadow-panel">
      <CardHeader className="border-b border-border p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="size-5 text-primary" aria-hidden="true" />
              Score History Sparkline
            </CardTitle>
            <CardDescription>Minimal 24-hour AMA risk trajectory from intake and staff-stream signals.</CardDescription>
          </div>
          <Badge variant="low">24H</Badge>
        </div>
      </CardHeader>
      <CardContent className="h-[220px] p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 10, right: 12, bottom: 0, left: -24 }}>
            <XAxis dataKey="time" tickLine={false} axisLine={false} stroke="#8888A8" fontSize={12} />
            <YAxis domain={[40, 100]} tickLine={false} axisLine={false} stroke="#8888A8" fontSize={12} />
            <Tooltip
              contentStyle={{ background: "#111125", border: "1px solid #28284A", color: "#E0E0EE", borderRadius: 4 }}
              labelStyle={{ color: "#10D8F0" }}
            />
            <Line type="monotone" dataKey="score" stroke="#10D8F0" strokeWidth={3} dot={{ fill: "#D4159A", strokeWidth: 0, r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function PatientProfile() {
  const { id } = useParams();
  const { alerts, staffCheckins, patientsById, applyAction } = usePilotData();
  const patient = patientsById.get(id);
  const alert = alerts.find((item) => item.patientId === id);

  if (!patient) {
    return (
      <section className="border border-border bg-card p-6 shadow-panel">
        <h1 className="text-xl font-semibold text-foreground">Patient not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">Return to the command center and choose an active SUD census record.</p>
        <Button asChild className="mt-4">
          <Link to="/">Back to Command Center</Link>
        </Button>
      </section>
    );
  }

  return (
    <>
      <section className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{patient.displayName} Profile</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {patient.episodeId} · {patient.primarySubstance} · {patient.levelOfCare} · Day {patient.dayOfStay}
          </p>
        </div>
        <Badge variant={riskVariant(patient.riskTier)} className="w-fit">{patient.riskTier} · Score {patient.amaRiskScore}</Badge>
      </section>

      <InterventionRecommender alert={alert} patient={patient} onApprove={applyAction} />

      <div className="grid gap-4 xl:grid-cols-[1fr_390px]">
        <div className="grid gap-4 content-start">
          <div className="grid gap-4 xl:grid-cols-2">
            <RiskBreakdownCard patient={patient} />
            <ScoreHistoryCard patient={patient} />
          </div>
          <UnifiedStaffStream checkins={staffCheckins} patient={patient} />
        </div>
        <div className="grid gap-4 content-start">
          <Card className="border-border bg-card/95 shadow-panel">
            <CardHeader className="border-b border-border p-4">
              <CardTitle className="flex items-center gap-2">
                <Activity className="size-5 text-primary" aria-hidden="true" />
                Clinical Context
              </CardTitle>
              <CardDescription>Drivers and recommended retention action.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 p-4">
              {patient.drivers.map((driver) => (
                <div key={driver} className="border border-border bg-background px-3 py-3 text-sm text-foreground/75">{driver}</div>
              ))}
              <div className="border-l-4 border-high bg-high/10 p-3 text-sm leading-6 text-foreground/80">
                {alert?.requiredAction || patient.suggestedAction}
              </div>
            </CardContent>
          </Card>
          <ActionWorkflow alert={alert} patient={patient} onApplyAction={applyAction} />
        </div>
      </div>
    </>
  );
}
