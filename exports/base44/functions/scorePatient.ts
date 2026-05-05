// CensusGuard Risk Scoring Engine v1.0
import Anthropic from "npm:@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY") });

export default async function handler(req: Request) {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST", "Access-Control-Allow-Headers": "Content-Type" } });
  }

  const patient = await req.json();

  // Rule-based risk adjustments
  const adjustments: string[] = [];
  let baseBoost = 0;

  const los = patient.length_of_stay || 0;
  if ((los >= 4 && los <= 7) || (los >= 15 && los <= 21)) {
    baseBoost += 15;
    adjustments.push(`Cliff window Day ${los}`);
  }
  if ((patient.admission_number || 1) === 2) { baseBoost += 15; adjustments.push("2nd admission"); }
  if ((patient.admission_number || 1) >= 3) { baseBoost += 25; adjustments.push("3rd+ admission"); }
  if (patient.substance_encoded === 4 && patient.level_of_care === "PHP") { baseBoost += 20; adjustments.push("Meth+PHP"); }
  if (patient.gender_encoded === 1 && patient.substance_encoded === 2) { baseBoost += 12; adjustments.push("Female+Opioid"); }
  if ((patient.referral_motivation_score || 0) >= 4) { baseBoost += 10; adjustments.push("Low motivation referral"); }

  const prompt = `You are CensusGuard, an AI clinical risk scoring engine. Return ONLY valid JSON with no other text.

Patient data: ${JSON.stringify(patient)}
Rule boosts: +${baseBoost} for [${adjustments.join(", ")}]

{"base_score":number_0_to_100,"final_score":number_0_to_99,"risk_tier":"LOW or MODERATE or HIGH or CRITICAL","top_drivers":["driver1","driver2","driver3"],"intervention":"specific clinical action","reasoning":"2 sentence clinical summary"}`;

  const message = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 400,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "{}";
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return new Response(JSON.stringify({ error: "parse error", raw }), { status: 500 });

  const result = { ...JSON.parse(match[0]), rule_adjustments: adjustments };
  return new Response(JSON.stringify(result), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } });
}
