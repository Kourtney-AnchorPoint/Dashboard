import { predictCensusGuardAmaRisk } from "../../vertexPrediction.mjs";

function riskTierFromScore(score) {
  if (score === null || score === undefined) return "UNKNOWN";
  if (score >= 75) return "CRITICAL";
  if (score >= 50) return "HIGH";
  if (score >= 25) return "MODERATE";
  return "LOW";
}

export async function handleScoringRoute({ req, res, url, readJson, send, requestId }) {
  if (req.method !== "POST" || url.pathname !== "/api/scoring/ama-risk") {
    send(res, 404, { error: "Scoring route not found", requestId });
    return;
  }

  const body = await readJson(req);
  const prediction = await predictCensusGuardAmaRisk(body);
  const amaRiskScore = prediction.amaProbability === null ? null : Math.round(prediction.amaProbability * 100);

  send(res, 200, {
    requestId,
    source: "vertex-ai",
    receivedEpisodeId: body.episodeId || body.source_episode_id || body.episode_id || null,
    risk: {
      riskTier: riskTierFromScore(amaRiskScore),
      amaRiskScore,
      topDrivers: [],
    },
    prediction,
  });
}
