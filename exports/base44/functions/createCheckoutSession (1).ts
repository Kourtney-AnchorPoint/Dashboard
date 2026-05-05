import Stripe from "npm:stripe@14";

export default async function handler(req: Request) {
  const stripe = new Stripe(Deno.env.get("STRIPE_TEST_SECRET_KEY") || "", {
    apiVersion: "2023-10-16",
  });

  const body = await req.json();
  const { plan } = body; // "monthly" or "yearly"

  const priceData =
    plan === "yearly"
      ? {
          currency: "usd",
          unit_amount: 4900,
          recurring: { interval: "year" as const },
          product_data: {
            name: "New Tarotories Premium — Annual",
            description: "All decks, AI readings, full astrology, Visual Omens & more.",
          },
        }
      : {
          currency: "usd",
          unit_amount: 699,
          recurring: { interval: "month" as const },
          product_data: {
            name: "New Tarotories Premium — Monthly",
            description: "All decks, AI readings, full astrology, Visual Omens & more.",
          },
        };

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price_data: priceData, quantity: 1 }],
    subscription_data: { trial_period_days: 3 },
    success_url: `${req.headers.get("origin") || "https://anchor-point-marketing-superagent-b56ededc.base44.app"}/new-tarotories?success=true`,
    cancel_url: `${req.headers.get("origin") || "https://anchor-point-marketing-superagent-b56ededc.base44.app"}/new-tarotories`,
  });

  return new Response(JSON.stringify({ url: session.url }), {
    headers: { "Content-Type": "application/json" },
  });
}
