import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MODELS = ["gemini-2.0-flash", "gemini-1.5-flash"];

async function callGemini(key: string, body: unknown): Promise<string | null> {
  for (const model of MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
      );
      if (!res.ok) continue;
      const d = await res.json();
      const t = d?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (t) return t as string;
    } catch (_) { /* try next */ }
  }
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { metrics } = await req.json();
    const key = Deno.env.get("GEMINI_API_KEY");
    if (!key) throw new Error("GEMINI_API_KEY not set");

    const prompt = `You are a senior e-commerce analyst for Gadget360.ng (a Nigerian phones & gadgets shop based in Lagos).

Given the JSON metrics below, write a concise admin briefing for the company owner (NOT technical). Use markdown.

Include these sections:
1. **Headline** — 1 sentence on traffic trend.
2. **Lead quality** — estimate the % of visitors who are *probable buyers* vs casual browsers, based on WhatsApp click rate, product page depth, and cart actions. Show the % and a 1-sentence reason.
3. **Likely orders** — estimate the number of probable real orders in the last 30 days (WhatsApp clicks with product context are strong signals; multiple-product carts are stronger). State the number + confidence (low/medium/high).
4. **Top opportunities** — 2-3 bullet, plain-English actions to grow sales.
5. **Watch-outs** — 1-2 risks (e.g. high traffic but zero WhatsApp clicks on a page).

Keep it under 220 words. Use Nigerian context (₦, Lagos, WhatsApp).

METRICS:
${JSON.stringify(metrics, null, 2)}`;

    const out = await callGemini(key, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.5, maxOutputTokens: 700 },
    });

    if (!out) throw new Error("AI unavailable");

    return new Response(JSON.stringify({ insights: out }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
