import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MODELS = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-2.0-flash-exp"];

async function callGemini(key: string, body: unknown): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  let lastErr = "no models tried";
  for (const model of MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
      );
      if (!res.ok) {
        lastErr = `${model} → HTTP ${res.status}`;
        console.warn(`[analytics-insights] ${lastErr}`);
        continue;
      }
      const d = await res.json();
      const t = d?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (t) return { ok: true, text: t as string };
      lastErr = `${model} → empty response`;
    } catch (e) {
      lastErr = `${model} → ${(e as Error).message}`;
      console.warn(`[analytics-insights] ${lastErr}`);
    }
  }
  return { ok: false, error: lastErr };
}

const PROMPTS: Record<string, (m: unknown) => string> = {
  briefing: (m) => `You are a senior e-commerce analyst for Gadget360.ng (Lagos-based phones & gadgets shop).
Given the JSON metrics, write a concise admin briefing (markdown, <220 words, Nigerian context: ₦, Lagos, WhatsApp).
Sections: **Headline** · **Lead quality** (% probable buyers + reason) · **Likely orders** (number + low/med/high confidence) · **Top opportunities** (2-3 bullets) · **Watch-outs** (1-2).
METRICS:
${JSON.stringify(m, null, 2)}`,

  conversion: (m) => `You are a conversion analyst for Gadget360.ng. Given these metrics, estimate:
1. **Order probability per WhatsApp click** (with vs. without product name attached, %).
2. **Funnel drop-off** — where most visitors leave (shop → product → cart → WhatsApp).
3. **Expected orders next 7 days** (range + assumption).
Keep under 180 words, markdown, plain English.
METRICS:
${JSON.stringify(m, null, 2)}`,

  products: (m) => `You are a merchandising analyst for Gadget360.ng. From these metrics (which include the most-visited product paths and WhatsApp clicks by product), recommend:
1. **Top 3 products to push** this week and why.
2. **Underperformers** — products getting views but no WhatsApp clicks.
3. **Pricing or stock actions** (1-2 concrete moves).
Markdown, <180 words, Nigerian context.
METRICS:
${JSON.stringify(m, null, 2)}`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { metrics, kind = "briefing" } = await req.json();
    const key = Deno.env.get("GEMINI_API_KEY");
    if (!key) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY not configured on the server." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const buildPrompt = PROMPTS[kind] || PROMPTS.briefing;
    const result = await callGemini(key, {
      contents: [{ parts: [{ text: buildPrompt(metrics) }] }],
      generationConfig: { temperature: 0.5, maxOutputTokens: 700 },
    });

    if (!result.ok) {
      return new Response(JSON.stringify({ error: `AI unavailable: ${result.error}` }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ insights: result.text, kind }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
