import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "g360.sid";
const LAST_PATH_KEY = "g360.lastPath";

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

export async function trackPageView(path: string) {
  try {
    // De-dupe identical consecutive paths in same tab
    if (sessionStorage.getItem(LAST_PATH_KEY) === path) return;
    sessionStorage.setItem(LAST_PATH_KEY, path);
    await supabase.from("page_visits").insert({
      path,
      referrer: typeof document !== "undefined" ? document.referrer || null : null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      session_id: sid(),
    });
  } catch (e) {
    // silent
  }
}
