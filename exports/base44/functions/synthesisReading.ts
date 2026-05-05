import Anthropic from "npm:@anthropic-ai/sdk";

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
    const { name, sign, question, cards } = await req.json();

    const systemPrompt = `You are the mystical voice of New Tarotories — a tarot reading app. Your tone is deeply intuitive, raw, real, poetic but grounded. NOT generic horoscope fluff. Speak directly to the person in second person. Every reading is completely unique and personal.`;

    const userPrompt = `Write a powerful synthesis reading weaving together these 3 tarot cards in a Past/Present/Future spread.

Name: ${name || "Seeker"}
Sign: ${sign || "Unknown"}
Question: "${question || "General guidance"}"
Cards: ${cards}

Write 3 flowing paragraphs (no headers, no bullets, no card names as labels) that weave together how the past card shaped who they are now, how the present card reflects their current energy, and how the future card points to where they're headed. Speak directly in second person. Raw, real, poetic but grounded. Reference their specific sign and question. Make it feel like the cards are speaking ONLY to this person. End with one powerful closing line.

Return ONLY the paragraph text. No JSON. No labels. Just the reading.`;

    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 800,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    if (!text) {
      throw new Error("Empty response from AI");
    }

    return Response.json({ success: true, text }, { headers: CORS });

  } catch (err: any) {
    console.error("Synthesis error:", err.message);
    return Response.json({ success: false, error: err.message }, { status: 200, headers: { "Access-Control-Allow-Origin": "*" } });
  }
});
