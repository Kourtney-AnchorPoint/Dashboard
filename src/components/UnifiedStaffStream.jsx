import { useState } from "react";
import { ClipboardPenLine, Send } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const roleTone = {
  Nursing: "low",
  Therapist: "secondary",
  Tech: "high",
  Physician: "critical",
};

const roles = ["Nursing", "Therapist", "Tech", "Physician"];
const contextTags = ["Medication Adherence", "Sleep Disturbance", "Group Dynamic", "Trauma Response", "Withdrawal", "Family Contact"];

function toggleValue(values, value) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function inferRole(checkin) {
  if (checkin.role) return checkin.role;
  if (checkin.staff_id?.includes("TECH")) return "Tech";
  if (checkin.staff_id?.includes("RN")) return "Nursing";
  return checkin.patientId === "patient-02" ? "Therapist" : "Tech";
}

export function UnifiedStaffStream({ checkins, patient }) {
  const [selectedRole, setSelectedRole] = useState("Tech");
  const [selectedTags, setSelectedTags] = useState(["Group Dynamic"]);
  const [note, setNote] = useState("Patient declined group but accepted 1-on-1 check-in.");
  const [localEntries, setLocalEntries] = useState([]);

  if (!patient) return null;

  const rows = checkins.filter((checkin) => checkin.patientId === patient.id);
  const visibleRows = [...localEntries, ...rows];

  function handleSubmit(event) {
    event.preventDefault();
    const entry = {
      id: `local-checkin-${Date.now()}`,
      patientId: patient.id,
      role: selectedRole,
      staff_id: selectedRole === "Tech" ? "TECH-Demo" : selectedRole,
      note,
      context_tags: selectedTags,
      createdAt: new Date().toISOString(),
      group_ripple_index: rows[0]?.group_ripple_index || 0,
      staff_reliability_score: rows[0]?.staff_reliability_score || 1,
    };

    setLocalEntries((current) => [entry, ...current]);
    toast.success("Staff Check-in added to stream");
  }

  return (
    <Card className="border-border bg-card/95 shadow-panel" aria-labelledby="staff-stream-title">
      <CardHeader className="border-b border-border p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle id="staff-stream-title">Unified Staff Stream</CardTitle>
            <CardDescription>Cross-disciplinary notes driving real-time AMA risk rescores.</CardDescription>
          </div>
          <ClipboardPenLine className="size-5 text-primary" aria-hidden="true" />
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 p-4 xl:grid-cols-[320px_1fr]">
        <form onSubmit={handleSubmit} className="grid gap-4 border border-border bg-background p-3">
          <div className="grid gap-2">
            <div className="text-sm font-semibold text-foreground">Role</div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Staff role">
              {roles.map((role) => (
                <button
                  key={role}
                  type="button"
                  aria-pressed={selectedRole === role}
                  onClick={() => setSelectedRole(role)}
                  className={cn(
                    "border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:border-primary/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    selectedRole === role && "border-primary bg-primary text-primary-foreground shadow-[0_0_18px_rgba(16,216,240,0.18)]"
                  )}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <div className="text-sm font-semibold text-foreground">Context Tags</div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Staff check-in context tags">
              {contextTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  aria-pressed={selectedTags.includes(tag)}
                  onClick={() => setSelectedTags((current) => toggleValue(current, tag))}
                  className={cn(
                    "border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:border-primary/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    selectedTags.includes(tag) && "border-primary bg-primary text-primary-foreground shadow-[0_0_18px_rgba(16,216,240,0.18)]"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <label className="grid gap-2 text-sm font-semibold text-foreground">
            Narrative
            <Textarea value={note} onChange={(event) => setNote(event.target.value)} rows={5} />
          </label>

          <div className="border border-primary/30 bg-primary/10 p-3 text-xs leading-5 text-foreground/75">
            Selected: <span className="font-semibold text-primary">{selectedRole}</span>
            {selectedTags.length ? ` - ${selectedTags.join(", ")}` : " - No context tags selected"}
          </div>

          <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/85">
            <Send data-icon="inline-start" />
            Save Staff Check-in
          </Button>
        </form>
        <div className="divide-y divide-border border border-border">
          {visibleRows.map((row) => {
            const role = inferRole(row);
            return (
              <article key={row.id} className="px-4 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={roleTone[role]} className="rounded-sm">{role}</Badge>
                    <span className="text-sm font-semibold text-foreground">{row.staff_id}</span>
                  </div>
                  <time className="text-xs text-muted-foreground">
                    {new Date(row.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </time>
                </div>
                {row.context_tags?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {row.context_tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="rounded-sm">{tag}</Badge>
                    ))}
                  </div>
                ) : null}
                <p className="mt-2 text-sm leading-6 text-foreground/75">{row.note}</p>
                <div className="mt-2 text-xs text-primary">Risk ripple {row.group_ripple_index.toFixed(1)} · Reliability {row.staff_reliability_score.toFixed(2)}</div>
              </article>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
