// New Tarotories AI Reading Engine v1.0
import Anthropic from "npm:@anthropic-ai/sdk@4.56.0";

Deno.serve(async (req) => {
  const CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS });
  }

  try {
    const client = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY") });
    const body = await req.json();
    const { name, sign, question, pile } = body;

    const pileDescriptions: Record<string, string> = {
      A: "The Moon pile — mystery, intuition, hidden truths, the subconscious",
      B: "The Star pile — hope, renewal, clarity after darkness, cosmic direction",
      C: "The Sun pile — purpose, power, visibility, truth, illumination",
    };

    const pileDesc = pileDescriptions[pile] || pileDescriptions["A"];

    const systemPrompt = `You are the voice of New Tarotories — a mystical AI tarot reading app. Your tone is deeply intuitive, raw, real, poetic but grounded. NOT generic horoscope fluff. Speak directly to the person. Write in second person. Every reading is completely unique and personal. Blend tarot symbolism with real human psychology. Do not use bullet points. Write in flowing paragraphs.`;

    const userPrompt = `Generate a personalized single-card tarot reading:

Name: ${name || "Seeker"}
Sun Sign: ${sign || "Unknown"}
${question ? `Seeking clarity on: "${question}"` : "No specific question — give general guidance"}
Pile chosen: ${pileDesc}

Return ONLY a valid JSON object, no text before or after:
{
  "card_name": "Name of a tarot card that fits their energy",
  "card_subtitle": "A poetic subtitle for this card in this moment",
  "theme": "2-4 word theme for this reading",
  "message": "4-5 paragraphs — a deep personal reading. Reference their sign and question. Make it feel written only for them.",
  "action": "One specific concrete action they should take today",
  "affirmation": "A powerful affirmation written specifically for this person",
  "angel_number": "An angel number (111, 222, 333, 444, 555, 777, 888, or 1111) with a brief personalized meaning",
  "element": "The dominant element (Fire, Water, Air, or Earth) with one sentence explaining why"
}`;

    const response = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not parse reading response");

    const reading = JSON.parse(jsonMatch[0]);
    return Response.json({ success: true, reading }, { headers: CORS });

  } catch (err: any) {
    console.error("Reading error:", err);
    return Response.json({ success: false, error: err.message }, { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
  }
});
