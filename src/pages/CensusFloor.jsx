import { Link } from "react-router-dom";
import { Bed, DoorOpen, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePilotData } from "@/context/PilotDataContext";
import { cn } from "@/lib/utils";

const floorRooms = [
  { id: "room-101", label: "Room 101", patientId: "patient-01", grid: "lg:col-start-1 lg:row-start-1" },
  { id: "room-102", label: "Room 102", patientId: "patient-02", grid: "lg:col-start-3 lg:row-start-1" },
  { id: "day-room", label: "Day Room", type: "shared", grid: "lg:col-start-2 lg:row-start-2" },
  { id: "nurse-station", label: "Nursing Station", type: "station", grid: "lg:col-start-1 lg:row-start-3" },
  { id: "room-103", label: "Room 103", patientId: "patient-03", grid: "lg:col-start-3 lg:row-start-3" },
  { id: "room-104", label: "Room 104", type: "stable", grid: "lg:col-start-2 lg:row-start-4" },
];

function riskClasses(tier) {
  if (tier === "CRITICAL") {
    return "border-critical/80 bg-critical-bg shadow-[0_0_30px_rgba(212,21,154,0.18)]";
  }
  if (tier === "HIGH") {
    return "border-high/80 bg-high-bg shadow-[0_0_28px_rgba(255,107,53,0.14)]";
  }
  if (tier === "MODERATE") {
    return "border-moderate/70 bg-moderate-bg shadow-[0_0_24px_rgba(240,192,64,0.10)]";
  }
  return "border-border bg-card/95";
}

function badgeVariant(tier) {
  if (tier === "CRITICAL") return "critical";
  if (tier === "HIGH") return "high";
  if (tier === "MODERATE") return "moderate";
  return "outline";
}

function RoomCard({ room, patient }) {
  const content = (
    <Card className={cn("min-h-[150px] border transition hover:border-primary/70 hover:bg-card", riskClasses(patient?.riskTier))}>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">{room.label}</CardTitle>
            <CardDescription>{patient ? patient.unit : room.type === "shared" ? "Shared milieu" : "Residential floor"}</CardDescription>
          </div>
          {room.type === "shared" ? <UsersRound className="size-5 text-primary" aria-hidden="true" /> : <Bed className="size-5 text-muted-foreground" aria-hidden="true" />}
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 p-4 pt-2">
        {patient ? (
          <>
            <div>
              <div className="font-semibold text-foreground">{patient.displayName}</div>
              <div className="mt-1 text-xs text-muted-foreground">{patient.levelOfCare} · Day {patient.dayOfStay}</div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Badge variant={badgeVariant(patient.riskTier)}>{patient.riskTier}</Badge>
              <span className="text-2xl font-semibold text-foreground">{patient.amaRiskScore}</span>
            </div>
            <div className="text-xs leading-5 text-primary">{patient.lastTrigger ? `⚡ ${patient.lastTrigger.role} trigger active` : "No active trigger"}</div>
          </>
        ) : (
          <div className="grid min-h-[72px] place-items-center border border-dashed border-border bg-background/55 text-center text-sm text-muted-foreground">
            {room.type === "shared" ? "Milieu activity and group context" : "Stable / open bed"}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (!patient) return content;

  return (
    <Link to={`/patient/${patient.id}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      {content}
    </Link>
  );
}

export function CensusFloor() {
  const { patients, patientsById } = usePilotData();
  const criticalCount = patients.filter((patient) => patient.riskTier === "CRITICAL").length;
  const highCount = patients.filter((patient) => patient.riskTier === "HIGH").length;

  return (
    <>
      <section className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Census Floor</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Spatial residential SUD census map for quickly locating high-risk patients and routing directly into their intervention profile.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="critical">{criticalCount} Critical</Badge>
          <Badge variant="high">{highCount} High</Badge>
          <Badge variant="low">Vertex overlay active</Badge>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3 lg:grid-rows-4" aria-label="Residential floor map">
        {floorRooms.map((room) => {
          const patient = room.patientId ? patientsById.get(room.patientId) : null;
          return (
            <div key={room.id} className={room.grid}>
              <RoomCard room={room} patient={patient} />
            </div>
          );
        })}
      </section>

      <Card className="border-border bg-card/95 shadow-panel">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center gap-2">
            <DoorOpen className="size-5 text-primary" aria-hidden="true" />
            <CardTitle className="text-base">Floor Map Rule</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-2 text-sm leading-6 text-muted-foreground">
          Room glow reflects current AMA risk tier. Clicking an occupied room opens the patient profile for intervention review and staff-stream context.
        </CardContent>
      </Card>
    </>
  );
}
