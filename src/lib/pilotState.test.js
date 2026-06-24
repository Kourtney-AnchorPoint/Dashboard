import { describe, expect, it } from "vitest";
import { applyAlertAction } from "./pilotState";

const alert = {
  id: "alert-01",
  patientId: "patient-01",
  status: "New",
  owner: null,
};

describe("applyAlertAction", () => {
  it("documents intervention actions and appends an audit event", () => {
    const result = applyAlertAction({
      alert,
      action: "Intervention documented",
      user: "Maya LCSW",
      note: "Completed motivational check-in before PHP group.",
      now: "2026-05-06T12:00:00.000Z",
    });

    expect(result.alert.status).toBe("Intervention documented");
    expect(result.alert.owner).toBe("Maya LCSW");
    expect(result.auditEvent).toMatchObject({
      alertId: "alert-01",
      patientId: "patient-01",
      actor: "Maya LCSW",
      eventType: "Intervention documented",
      note: "Completed motivational check-in before PHP group.",
    });
  });
});
