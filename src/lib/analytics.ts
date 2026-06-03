import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "g360.sid";
const LAST_PATH_KEY = "g360.lastPath";
const GEO_KEY = "g360.geo";

type Geo = { country?: string; country_code?: string; city?: string; region?: string };

function sid(): string {
  try {
    let s = sessionStorage.getItem(SESSION_KEY);
    if (!s) {
      s = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, s);
    }
    return s;
  } catch {
    return "anon";
  }
}

async function getGeo(): Promise<Geo> {
  try {
    const cached = sessionStorage.getItem(GEO_KEY);
    if (cached) return JSON.parse(cached);
  } catch {
    sessionStorage.removeItem(GEO_KEY);
  }
  try {
    // Free, no-key, CORS-enabled IP geolocation
    const res = await fetch("https://ipapi.co/json/", { cache: "no-store" });
    if (!res.ok) return {};
    const j = await res.json();
    const geo: Geo = {
      country: j.country_name || undefined,
      country_code: j.country_code || undefined,
      city: j.city || undefined,
      region: j.region || undefined,
    };
    try {
      sessionStorage.setItem(GEO_KEY, JSON.stringify(geo));
    } catch {
      sessionStorage.removeItem(GEO_KEY);
    }
    return geo;
  } catch {
    return {};
  }
}

export async function trackPageView(path: string) {
  try {
    if (sessionStorage.getItem(LAST_PATH_KEY) === path) return;
    sessionStorage.setItem(LAST_PATH_KEY, path);
    const geo = await getGeo();
    await supabase.from("page_visits").insert({
      path,
      referrer: typeof document !== "undefined" ? document.referrer || null : null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      session_id: sid(),
      ...geo,
    });
  } catch {
    // silent
  }
}
