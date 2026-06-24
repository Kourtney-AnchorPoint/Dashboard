import http from "node:http";
import { randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { handleAuditRoute } from "./pilot-api/routes/audit.mjs";
import { handleScoringRoute } from "./pilot-api/routes/scoring.mjs";
import { predictCensusGuardAmaRisk } from "./vertexPrediction.mjs";
import { initialAuditEvents, patients as pilotPatients, staffCheckins } from "../src/data/censusGuardData.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 8080);
const DIST_DIR = resolve(__dirname, "../dist");
const clinicalActions = [];
const groupNarratives = [];

const substanceCode = {
  Alcohol: 1,
  Opioid: 2,
  Benzodiazepine: 3,
  Methamphetamine: 4,
  Cocaine: 5,
  Heroin: 7,
};

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function toDashboardPatient(patient) {
  return {
    id: patient.id,
    name: patient.displayName || patient.name,
    episode_id: patient.episodeId,
    unit: patient.unit,
    room_number: patient.roomNumber || "",
    level_of_care: patient.levelOfCare,
    length_of_stay: patient.dayOfStay,
    substance_encoded: substanceCode[patient.primarySubstance] || 8,
    risk_score: patient.amaRiskScore,
    risk_tier: patient.riskTier,
    previous_risk_score: Math.max(0, (patient.amaRiskScore || 0) - 8),
    velocity: patient.riskTier === "CRITICAL" ? 3.2 : patient.riskTier === "HIGH" ? 2.1 : 0.8,
    alert_active: ["CRITICAL", "HIGH"].includes(patient.riskTier),
    alert_reason: patient.lastTrigger?.label || patient.trend || "",
    top_drivers: (patient.drivers || []).join("|"),
    intervention: patient.suggestedAction || "",
    counselor: patient.counselor,
    last_staff_checkin: patient.last_staff_checkin,
    cliff_window: Boolean(patient.cliff_window),
    calm_before_storm_flag: Boolean(patient.calm_before_storm_flag),
    psych_comorbid: Boolean(patient.psych_comorbid),
    moud_status: patient.moud_status,
    medication_review_needed: Boolean(patient.medication_review_needed),
    status: "Active",
  };
}

function scoreHistoryFor(patientId) {
  const patient = pilotPatients.find((item) => item.id === patientId);
  if (!patient) return [];

  const score = patient.amaRiskScore || 0;
  const previous = Math.max(0, score - 8);
  return [
    {
      id: `history-${patientId}-admit`,
      patient_id: patientId,
      patient_name: patient.displayName,
      score: previous,
      previous_score: null,
      risk_tier: previous >= 85 ? "CRITICAL" : previous >= 65 ? "HIGH" : previous >= 40 ? "MODERATE" : "LOW",
      day_in_treatment: 1,
      timestamp: "2026-05-06T08:00:00.000Z",
      trigger: "Admission intake",
      drivers: (patient.drivers || []).slice(0, 2).join("|"),
      velocity: 0,
      alert_fired: false,
    },
    {
      id: `history-${patientId}-staff`,
      patient_id: patientId,
      patient_name: patient.displayName,
      score,
      previous_score: previous,
      risk_tier: patient.riskTier,
      day_in_treatment: patient.dayOfStay,
      timestamp: patient.lastTrigger?.at || "2026-05-06T14:00:00.000Z",
      trigger: patient.lastTrigger?.label || "Staff check-in",
      drivers: (patient.drivers || []).join("|"),
      velocity: score - previous,
      alert_fired: ["CRITICAL", "HIGH"].includes(patient.riskTier),
    },
  ];
}

function sendJson(res, status, data) {
  res.writeHead(status, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Content-Type": "application/json",
  });
  res.end(JSON.stringify(data));
}

function readJson(req) {
  return new Promise((resolveBody, rejectBody) => {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", () => {
      if (!body) {
        resolveBody({});
        return;
      }
      try {
        resolveBody(JSON.parse(body));
      } catch (error) {
        rejectBody(error);
      }
    });
    req.on("error", rejectBody);
  });
}

async function sendStatic(req, res) {
  const rawPath = decodeURIComponent(new URL(req.url || "/", "http://localhost").pathname);
  const requestedPath = rawPath === "/" ? "/index.html" : rawPath;
  const safePath = normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(DIST_DIR, safePath);

  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) throw new Error("Not a file");

    res.writeHead(200, {
      "Content-Type": mimeTypes[extname(filePath)] || "application/octet-stream",
      "Cache-Control": filePath.endsWith("index.html") ? "no-cache" : "public, max-age=31536000, immutable",
    });
    createReadStream(filePath).pipe(res);
  } catch {
    const indexHtml = await readFile(join(DIST_DIR, "index.html"));
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" });
    res.end(indexHtml);
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const requestId = randomUUID();
    const url = new URL(req.url || "/", `http://${req.headers.host}`);

    if (req.method === "OPTIONS") {
      sendJson(res, 200, { ok: true, requestId });
      return;
    }

    if (req.method === "GET" && url.pathname === "/health") {
      sendJson(res, 200, { ok: true, service: "censusguard-dashboard", requestId });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/bootstrap") {
      sendJson(res, 200, {
        requestId,
        patients: pilotPatients.map(toDashboardPatient),
        staffCheckins,
        auditEvents: initialAuditEvents,
      });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/patients") {
      sendJson(res, 200, pilotPatients.map(toDashboardPatient));
      return;
    }

    const scoreHistoryMatch = url.pathname.match(/^\/api\/patients\/([^/]+)\/score-history$/);
    if (req.method === "GET" && scoreHistoryMatch) {
      sendJson(res, 200, scoreHistoryFor(scoreHistoryMatch[1]));
      return;
    }

    const clinicalActionsMatch = url.pathname.match(/^\/api\/patients\/([^/]+)\/clinical-actions$/);
    if (req.method === "GET" && clinicalActionsMatch) {
      sendJson(res, 200, clinicalActions.filter((action) => action.patient_id === clinicalActionsMatch[1]));
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/clinical-actions") {
      const action = await readJson(req);
      const timestamp = action.timestamp || new Date().toISOString();
      const record = {
        id: action.id || `clinical-action-${Date.now()}`,
        timestamp,
        actor: action.staff_name || action.actor || "Unassigned staff",
        audit_status: action.outcome_note ? "closed" : "documented",
        outcome_status: action.outcome_note ? "documented" : "pending",
        source: "censusguard-closed-loop",
        ...action,
      };
      clinicalActions.unshift(record);
      sendJson(res, 201, record);
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/group-narratives") {
      sendJson(res, 200, groupNarratives);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/group-narratives") {
      const narrative = await readJson(req);
      const record = {
        id: narrative.id || `group-narrative-${Date.now()}`,
        timestamp: narrative.timestamp || new Date().toISOString(),
        ...narrative,
      };
      groupNarratives.unshift(record);
      sendJson(res, 201, record);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/staff-check-ins") {
      const checkIn = await readJson(req);
      sendJson(res, 201, {
        id: checkIn.id || `staff-checkin-${Date.now()}`,
        createdAt: checkIn.createdAt || new Date().toISOString(),
        ...checkIn,
      });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/score") {
      const body = await readJson(req);
      const prediction = await predictCensusGuardAmaRisk(body);
      sendJson(res, 200, {
        requestId,
        source: "vertex-ai",
        ...prediction,
      });
      return;
    }

    if (url.pathname.startsWith("/api/scoring")) {
      await handleScoringRoute({ req, res, url, readJson, send: sendJson, requestId });
      return;
    }

    if (url.pathname.startsWith("/api/audit")) {
      await handleAuditRoute({ req, res, url, readJson, send: sendJson, requestId });
      return;
    }

    if (url.pathname.startsWith("/api/")) {
      sendJson(res, 404, { error: "Not found", requestId });
      return;
    }

    await sendStatic(req, res);
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Internal server error" });
  }
});

server.listen(PORT, () => {
  console.log(`CensusGuard dashboard listening on :${PORT}`);
});
