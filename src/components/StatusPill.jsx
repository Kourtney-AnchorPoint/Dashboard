export function StatusPill({ value }) {
  const tone = {
    Critical: "bg-coral/15 text-coral border-coral/30",
    High: "bg-amber/15 text-amber border-amber/30",
    Moderate: "bg-gold/15 text-gold border-gold/30",
    LOW: "bg-pine/10 text-pine border-pine/20",
    CRITICAL: "bg-coral/15 text-coral border-coral/30",
    HIGH: "bg-amber/15 text-amber border-amber/30",
    MODERATE: "bg-gold/15 text-gold border-gold/30",
    New: "bg-coral/15 text-coral border-coral/30",
    Acknowledged: "bg-amber/15 text-amber border-amber/30",
    Monitoring: "bg-pine/10 text-pine border-pine/20",
    "Intervention documented": "bg-pine/10 text-pine border-pine/20",
    Escalated: "bg-coral/15 text-coral border-coral/30",
    Resolved: "bg-pine/10 text-pine border-pine/20",
  }[value] || "bg-white text-ink border-line";

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${tone}`}>
      {value}
    </span>
  );
}
