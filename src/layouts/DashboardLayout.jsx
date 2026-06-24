import { NavLink, Outlet } from "react-router-dom";
import { ActivitySquare, ClipboardList, Gauge, GitBranch, LockKeyhole, Map, RadioTower, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Command Center", to: "/", icon: Gauge, end: true },
  { label: "Patient Profile", to: "/patient/patient-01", icon: ClipboardList },
  { label: "Census Floor", to: "/floor", icon: Map },
  { label: "Cohort Dynamics", to: "/cohort", icon: RadioTower },
  { label: "Audit Trail", to: "/audit", icon: ShieldCheck },
];

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-field text-ink lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-line bg-panel/95 lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-3 border-b border-line px-5 py-5 text-pine">
          <ActivitySquare className="size-7" aria-hidden="true" />
          <div>
            <div className="text-sm font-semibold uppercase tracking-wide">AnchorPoint</div>
            <div className="text-xs font-medium uppercase tracking-wide text-ink/50">CensusGuard</div>
          </div>
        </div>
        <nav className="flex gap-2 overflow-x-auto px-3 py-3 lg:flex-col lg:overflow-visible" aria-label="Dashboard sections">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => cn(
                "inline-flex min-w-fit items-center gap-3 border border-transparent px-3 py-2 text-sm font-semibold text-ink/60 transition hover:border-pine/30 hover:bg-field hover:text-ink lg:min-w-0",
                isActive && "border-pine/40 bg-field text-pine"
              )}
            >
              <item.icon className="size-4" aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-10 border-b border-line bg-clinic/95 backdrop-blur">
          <div className="flex flex-col gap-4 px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-pine">Facility Context</div>
              <div className="mt-1 text-xl font-semibold text-ink">North Residential SUD Pilot</div>
              <div className="mt-1 text-sm text-ink/55">SMART on FHIR agnostic overlay - Backend-mediated scoring</div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-sm font-semibold text-emerald-300">
                <span className="size-2 bg-emerald-300" aria-hidden="true" />
                System Status: Vertex AI Online
              </div>
              <div className="inline-flex items-start gap-2 border border-coral/30 bg-panel px-3 py-2 text-sm text-ink/70">
                <LockKeyhole className="mt-0.5 size-4 shrink-0 text-pine" aria-hidden="true" />
                <span>Frontend never calls Vertex directly</span>
              </div>
              <GitBranch className="size-5 text-purple" aria-hidden="true" />
            </div>
          </div>
        </header>

        <main className="mx-auto grid max-w-7xl gap-4 px-5 py-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
