// Adminsuper shared-password login.
// Verifies a shared password and returns a magic-link token_hash the client
// can exchange for a real Supabase session via verifyOtp.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { password } = await req.json().catch(() => ({ password: "" }));
    const expected = Deno.env.get("ADMINSUPER_PASSWORD");
    const adminEmail = Deno.env.get("ADMINSUPER_EMAIL");

    if (!expected || !adminEmail) {
      return new Response(JSON.stringify({ error: "Server not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Constant-time-ish compare
    const a = new TextEncoder().encode(String(password || ""));
    const b = new TextEncoder().encode(expected);
    const ok = a.length === b.length;
    const len = Math.max(a.length, b.length);
    let diff = a.length ^ b.length;
    for (let i = 0; i < len; i++) diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
    if (!ok || diff !== 0) {
      return new Response(JSON.stringify({ error: "Invalid password" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data, error } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: adminEmail,
    });
    if (error || !data?.properties?.hashed_token) {
      return new Response(JSON.stringify({ error: error?.message || "Failed to mint session" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ token_hash: data.properties.hashed_token, email: adminEmail }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
