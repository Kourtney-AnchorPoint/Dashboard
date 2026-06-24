export function createAuditEvent({ alert, action, user, note, now = new Date().toISOString() }) {
  return {
    id: `audit-${alert.id}-${Date.parse(now) || Date.now()}`,
    alertId: alert.id,
    patientId: alert.patientId,
    actor: user,
    eventType: action,
    note,
    timestamp: now,
  };
}

export function applyAlertAction({ alert, action, user, note, now = new Date().toISOString() }) {
  const actor = user?.trim() || "Clinical staff";
  const updatedAlert = {
    ...alert,
    status: action,
    owner: alert.owner || actor,
    lastActionAt: now,
    lastActionNote: note,
  };

  return {
    alert: updatedAlert,
    auditEvent: createAuditEvent({ alert: updatedAlert, action, user: actor, note, now }),
  };
}
