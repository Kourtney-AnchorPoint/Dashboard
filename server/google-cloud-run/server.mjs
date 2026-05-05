import http from "node:http";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { cleanPatientRows } from "../../src/data-cleaning/patientCleaner.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 8080);
const DB_PATH = resolve(__dirname, "../../data/local-db.json");

const ENTITY_NAMES = new Set([
  "Patient",
  "ScoreHistory",
  "ClinicalAction",
  "GroupCohesion",
  "Task",
  "MoneyTracker",
  "DemoLead",
]);

async function ensureDb() {
  await mkdir(dirname(DB_PATH), { recursive: true });
  try {
    return JSON.parse(await readFile(DB_PATH, "utf8"));
  } catch {
    const initial = Object.fromEntries([...ENTITY_NAMES].map((name) => [name, []]));
    await writeDb(initial);
    return initial;
  }
}

async function writeDb(db) {
  await writeFile(DB_PATH, `${JSON.stringify(db, null, 2)}\n`);
}

function send(res, status, data) {
  res.writeHead(status, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Content-Type": "application/json",
  });
  res.end(JSON.stringify(data));
}

function notFound(res) {
  send(res, 404, { error: "Not found" });
}

function readJson(req) {
  return new Promise((resolveBody, rejectBody) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
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

function matchesFilter(row, filter) {
  return Object.entries(filter || {}).every(([key, value]) => row?.[key] === value);
}

function scorePatientLocally(patient) {
  const adjustments = [];
  let baseBoost = 0;

  const los = patient.length_of_stay || 0;
  if ((los >= 4 && los <= 7) || (los >= 15 && los <= 21)) {
    baseBoost += 15;
    adjustments.push(`Cliff window Day ${los}`);
  }
  if ((patient.admission_number || 1) === 2) {
    baseBoost += 15;
    adjustments.push("2nd admission");
  }
  if ((patient.admission_number || 1) >= 3) {
    baseBoost += 25;
    adjustments.push("3rd+ admission");
  }
  if (patient.substance_encoded === 4 && patient.level_of_care === "PHP") {
    baseBoost += 20;
    adjustments.push("Meth+PHP");
  }
  if (patient.gender_encoded === 1 && patient.substance_encoded === 2) {
    baseBoost += 12;
    adjustments.push("Female+Opioid");
  }
  if ((patient.referral_motivation_score || 0) >= 4) {
    baseBoost += 10;
    adjustments.push("Low motivation referral");
  }

  const existing = Number(patient.risk_score || patient.previous_risk_score || 35);
  const finalScore = Math.max(0, Math.min(99, existing + baseBoost));
  const riskTier =
    finalScore >= 85 ? "CRITICAL" :
    finalScore >= 65 ? "HIGH" :
    finalScore >= 40 ? "MODERATE" :
    "LOW";

  return {
    base_score: existing,
    final_score: finalScore,
    risk_tier: riskTier,
    top_drivers: adjustments.length ? adjustments : ["Baseline clinical and operational risk"],
    intervention:
      riskTier === "CRITICAL" || riskTier === "HIGH"
        ? "Immediate staff review and documented intervention plan"
        : "Continue monitoring and routine engagement checks",
    reasoning: "Local deterministic scoring fallback used. Connect model provider server-side for full clinical narrative output.",
    rule_adjustments: adjustments,
  };
}

async function handleEntity(req, res, url, pathParts) {
  const entityIndex = pathParts.indexOf("entities") + 1;
  const entityName = pathParts[entityIndex];
  const idOrAction = pathParts[entityIndex + 1];

  if (!ENTITY_NAMES.has(entityName)) {
    send(res, 400, { error: `Unsupported entity: ${entityName}` });
    return;
  }

  const db = await ensureDb();
  const rows = db[entityName] || [];

  if (req.method === "GET" && !idOrAction) {
    send(res, 200, rows);
    return;
  }

  if (req.method === "POST" && idOrAction === "query") {
    const filter = await readJson(req);
    send(res, 200, rows.filter((row) => matchesFilter(row, filter)));
    return;
  }

  if (req.method === "POST" && !idOrAction) {
    const now = new Date().toISOString();
    const item = { id: randomUUID(), created_at: now, updated_at: now, ...(await readJson(req)) };
    db[entityName] = [...rows, item];
    await writeDb(db);
    send(res, 201, item);
    return;
  }

  if (req.method === "PATCH" && idOrAction) {
    const patch = await readJson(req);
    const index = rows.findIndex((row) => row.id === idOrAction);
    if (index === -1) {
      notFound(res);
      return;
    }
    const updated = { ...rows[index], ...patch, updated_at: new Date().toISOString() };
    rows[index] = updated;
    db[entityName] = rows;
    await writeDb(db);
    send(res, 200, updated);
    return;
  }

  if (req.method === "DELETE" && idOrAction) {
    db[entityName] = rows.filter((row) => row.id !== idOrAction);
    await writeDb(db);
    send(res, 200, { ok: true });
    return;
  }

  notFound(res);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host}`);
    const pathParts = url.pathname.split("/").filter(Boolean);

    if (req.method === "OPTIONS") {
      send(res, 200, { ok: true });
      return;
    }

    if (req.method === "GET" && url.pathname === "/health") {
      send(res, 200, { ok: true, service: "censusguard-api" });
      return;
    }

    const isEntityRoute =
      url.pathname.startsWith("/api/entities/") ||
      url.pathname.startsWith("/api/demo/entities/") ||
      url.pathname.startsWith("/api/real/entities/");

    if (isEntityRoute) {
      await handleEntity(req, res, url, pathParts);
      return;
    }

    if (
      req.method === "POST" &&
      (
        url.pathname === "/api/censusguard/score-patient" ||
        url.pathname === "/api/functions/scorePatient" ||
        url.pathname === "/api/demo/censusguard/score-patient" ||
        url.pathname === "/api/real/censusguard/score-patient"
      )
    ) {
      const patient = await readJson(req);
      send(res, 200, scorePatientLocally(patient));
      return;
    }

    if (
      req.method === "POST" &&
      (
        url.pathname === "/api/demo/censusguard/clean-patients" ||
        url.pathname === "/api/real/censusguard/clean-patients"
      )
    ) {
      const body = await readJson(req);
      send(res, 200, { rows: cleanPatientRows(body.rows || []) });
      return;
    }

    notFound(res);
  } catch (error) {
    send(res, 500, { error: error.message || "Internal server error" });
  }
});

server.listen(PORT, () => {
  console.log(`CensusGuard API listening on :${PORT}`);
});
