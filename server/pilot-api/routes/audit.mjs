const auditEvents = [];

export async function handleAuditRoute({ req, res, url, readJson, send, requestId }) {
  if (req.method === "GET" && url.pathname === "/api/audit/events") {
    send(res, 200, { requestId, events: auditEvents });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/audit/events") {
    const event = await readJson(req);
    const record = {
      id: event.id || `audit-${Date.now()}`,
      timestamp: event.timestamp || new Date().toISOString(),
      ...event,
    };
    auditEvents.unshift(record);
    send(res, 201, { requestId, event: record });
    return;
  }

  send(res, 404, { error: "Audit route not found", requestId });
}
