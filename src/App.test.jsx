import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import App from "./App";

function renderAt(path) {
  window.history.pushState({}, "", path);
  return render(<App />);
}

describe("CensusGuard dashboard", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders the monitor page with closed-loop language", async () => {
    renderAt("/dashboard");

    expect(await screen.findByText(/CensusGuard Infinity System/i)).toBeInTheDocument();
    expect(screen.getAllByText(/CLOSED-LOOP INTERVENTION INTELLIGENCE/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/CONTINUITY PROTECTED/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Patient Monitor/i })).toBeInTheDocument();
    expect(screen.queryByText(/REVENUE PROTECTED/i)).not.toBeInTheDocument();
  });

  it("uses real page routes for main dashboard sections", async () => {
    renderAt("/dashboard/alerts");
    expect(await screen.findByText(/Alert Queue/i)).toBeInTheDocument();

    renderAt("/dashboard/outcomes");
    expect(await screen.findByText(/Infinity Closed-Loop Outcomes/i)).toBeInTheDocument();

    renderAt("/dashboard/psych");
    expect(await screen.findByText(/Psych and Provider Loop/i)).toBeInTheDocument();

    renderAt("/dashboard/moud");
    expect(await screen.findByText(/MOUD Patients In Long-Term Residential Leave AMA At 43.7%/i)).toBeInTheDocument();
    expect(screen.queryByText(/56\.7%/i)).not.toBeInTheDocument();
  });

  it("opens patient details and links to a full patient page", async () => {
    const user = userEvent.setup();
    renderAt("/dashboard");

    await user.click(await screen.findByRole("button", { name: /Avery M\./i }));
    expect(await screen.findByText(/PATIENT DETAIL/i)).toBeInTheDocument();
    expect(screen.getByText(/OPEN FULL PATIENT PAGE/i)).toHaveAttribute("href", "/patient/cg-101");
  });

  it("renders the standalone patient page", async () => {
    renderAt("/patient/cg-101");

    expect(await screen.findByText(/Back to dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Avery M\./i)).toBeInTheDocument();
    expect(screen.getByText(/Intervention Plan/i)).toBeInTheDocument();
  });
});
