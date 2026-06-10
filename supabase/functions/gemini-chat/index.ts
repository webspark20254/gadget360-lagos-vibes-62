import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const WA = "2348108418727";

// Models to try in order — first 200 wins. Lets us survive Gemini model deprecations.
const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash"];

async function callGemini(apiKey: string, body: unknown): Promise<string | null> {
  for (const model of MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
      );
      if (!res.ok) { console.warn(`[gemini-chat] ${model} ${res.status}`); continue; }
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text as string;
    } catch (err) {
      console.warn(`[gemini-chat] ${model} threw`, err);
    }
  }
  return null;
}

function fallbackResponse(message: string, products: Array<{ name: string; price: number; category: string | null }>): string {
  const lower = message.toLowerCase();
  const match = products.find((p) =>
    lower.includes(p.name.toLowerCase().split(" ")[0]) ||
    (p.category && lower.includes(p.category.toLowerCase()))
  );
  const waBase = `https://wa.me/${WA}`;
  if (match) {
    const text = encodeURIComponent(
      `Hi Gadget360.ng! 👋 I'm on your website and interested in ${match.name} (₦${match.price.toLocaleString()}). Is it available?`,
    );
    return `I'd love to help with **${match.name}** (₦${match.price.toLocaleString()}). Tap "Continue on WhatsApp" to chat with our team instantly: ${waBase}?text=${text}\n\n[RECOMMEND: ${match.name}]`;
  }
  return `I'm having a brief connection issue, but our team is online on WhatsApp right now and can help with prices, stock and delivery. Tap "Continue on WhatsApp" or visit ${waBase}.`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { message, sessionId, customerName, context } = await req.json();
    if (!message || !sessionId) {
      return new Response(JSON.stringify({ error: "Message and sessionId are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    // Live product catalog (max 60) — lets the bot recommend real items with real prices.
    const { data: productData } = await supabase
      .from("products")
      .select("name, price, category, stock_quantity, description")
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(60);
    const products = (productData || []) as Array<{ name: string; price: number; category: string | null; stock_quantity: number; description: string | null }>;

    // Log user message (best-effort)
    supabase.from("chat_messages").insert({ session_id: sessionId, sender: "user", message }).then(() => {});

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    let botResponse: string;
    let usedFallback = false;

    if (!GEMINI_API_KEY) {
      usedFallback = true;
      botResponse = fallbackResponse(message, products);
    } else {
      const catalogText = products
        .map((p) => `• ${p.name} — ₦${Number(p.price).toLocaleString()} (${p.category || "uncategorised"})${p.stock_quantity > 0 ? "" : " — out of stock"}`)
        .join("\n");

      const pageContext = context
        ? `\nCURRENT PAGE CONTEXT:\n• Page: ${context.path || "/"}\n${context.productName ? `• Viewing product: ${context.productName} (₦${context.productPrice?.toLocaleString?.() || ""})\n` : ""}${context.category ? `• Category: ${context.category}\n` : ""}`
        : "";

      const systemPrompt = `You are the Gadget360.ng AI Concierge — friendly, concise, knowledgeable about phones, laptops, gaming consoles and accessories. You help customers in Nigeria.

CONTACT: WhatsApp +234 810 841 8727 (link: https://wa.me/${WA})
DELIVERY: Free in Lagos, ₦2,000+ nationwide, 1-3 days Lagos / 3-7 days other states.
HOURS: Mon-Sat 9am-7pm.
PAYMENT: Pay on delivery (Lagos) or bank transfer.
WARRANTY: Manufacturer warranty (new) / 3-month store warranty (UK used).

LIVE CATALOG (use these exact names + prices):
${catalogText || "(catalog temporarily unavailable — direct user to WhatsApp)"}
${pageContext}

CUSTOMER: ${customerName || "Guest"}

RULES:
1. Be warm but brief — 2-4 short sentences max unless asked for details.
2. Recommend SPECIFIC products from the catalog (with price) when asked.
3. If they want to order/buy/are ready, say "Tap Continue on WhatsApp" and end with a marker on its own line:
   [RECOMMEND: <exact product name>]
4. If the user mentions a budget, suggest 1-2 catalog items that fit.
5. Never invent prices, never promise specs not in the catalog.
6. Use ₦ formatting. Be Nigerian-friendly.
7. If unsure, hand off to WhatsApp.`;

      const result = await callGemini(GEMINI_API_KEY, {
        contents: [{ parts: [{ text: systemPrompt }, { text: `Customer message: ${message}` }] }],
        generationConfig: { temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 600 },
      });

      usedFallback = !result;
      botResponse = result || fallbackResponse(message, products);
    }

    // Parse a [RECOMMEND: name] marker if present.
    let recommendedProduct: { name: string; price: number } | null = null;
    const m = botResponse.match(/\[RECOMMEND:\s*([^\]]+)\]/i);
    if (m) {
      const name = m[1].trim();
      const found = products.find((p) => p.name.toLowerCase() === name.toLowerCase())
        || products.find((p) => p.name.toLowerCase().includes(name.toLowerCase()));
      if (found) recommendedProduct = { name: found.name, price: Number(found.price) };
      botResponse = botResponse.replace(/\[RECOMMEND:[^\]]+\]/gi, "").trim();
    }

    supabase.from("chat_messages").insert({ session_id: sessionId, sender: "bot", message: botResponse }).then(() => {});

    return new Response(JSON.stringify({ response: botResponse, sessionId, recommendedProduct, fallback: usedFallback }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[gemini-chat] fatal", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({
        error: msg,
        response: `I'm having technical trouble. Please WhatsApp us directly at +234 810 841 8727 — we'll reply within minutes. https://wa.me/${WA}`,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
