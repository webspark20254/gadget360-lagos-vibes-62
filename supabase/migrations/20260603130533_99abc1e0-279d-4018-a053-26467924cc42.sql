-- Replace overly broad analytics insert policy with bounded validation
DROP POLICY IF EXISTS "Anyone can record a page visit" ON public.page_visits;

CREATE POLICY "Visitors can record bounded page visits"
ON public.page_visits
FOR INSERT
TO anon, authenticated
WITH CHECK (
  path IS NOT NULL
  AND char_length(path) BETWEEN 1 AND 2048
  AND path LIKE '/%'
  AND (referrer IS NULL OR char_length(referrer) <= 2048)
  AND (user_agent IS NULL OR char_length(user_agent) <= 512)
  AND (session_id IS NULL OR char_length(session_id) <= 128)
  AND (country IS NULL OR char_length(country) <= 128)
  AND (country_code IS NULL OR country_code ~ '^[A-Z]{2}$')
  AND (city IS NULL OR char_length(city) <= 128)
  AND (region IS NULL OR char_length(region) <= 128)
  AND created_at <= now() + interval '5 minutes'
  AND created_at >= now() - interval '1 day'
);

-- Prevent direct API execution of trigger-only SECURITY DEFINER function
REVOKE EXECUTE ON FUNCTION public.prevent_sensitive_order_changes() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.prevent_sensitive_order_changes() TO service_role;