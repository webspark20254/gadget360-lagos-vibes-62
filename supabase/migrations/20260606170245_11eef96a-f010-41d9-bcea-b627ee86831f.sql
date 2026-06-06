
CREATE TABLE public.whatsapp_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL,
  source text,
  product_id uuid,
  product_name text,
  quantity integer,
  total_amount numeric,
  session_id text,
  user_agent text,
  country text,
  country_code text,
  city text,
  region text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT INSERT ON public.whatsapp_clicks TO anon, authenticated;
GRANT SELECT ON public.whatsapp_clicks TO authenticated;
GRANT ALL ON public.whatsapp_clicks TO service_role;

ALTER TABLE public.whatsapp_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Visitors can record bounded whatsapp clicks"
ON public.whatsapp_clicks
FOR INSERT
TO anon, authenticated
WITH CHECK (
  path IS NOT NULL
  AND char_length(path) BETWEEN 1 AND 2048
  AND path LIKE '/%'
  AND (source IS NULL OR char_length(source) <= 64)
  AND (product_name IS NULL OR char_length(product_name) <= 512)
  AND (quantity IS NULL OR (quantity >= 0 AND quantity <= 10000))
  AND (total_amount IS NULL OR (total_amount >= 0 AND total_amount <= 1000000000))
  AND (user_agent IS NULL OR char_length(user_agent) <= 512)
  AND (session_id IS NULL OR char_length(session_id) <= 128)
  AND (country IS NULL OR char_length(country) <= 128)
  AND (country_code IS NULL OR country_code ~ '^[A-Z]{2}$')
  AND (city IS NULL OR char_length(city) <= 128)
  AND (region IS NULL OR char_length(region) <= 128)
  AND created_at <= (now() + INTERVAL '5 minutes')
  AND created_at >= (now() - INTERVAL '1 day')
);

CREATE POLICY "Admins can view all whatsapp clicks"
ON public.whatsapp_clicks
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX whatsapp_clicks_created_at_idx ON public.whatsapp_clicks (created_at DESC);
CREATE INDEX whatsapp_clicks_source_idx ON public.whatsapp_clicks (source);
