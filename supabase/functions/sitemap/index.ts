// Dynamic sitemap.xml — regenerates on every request so product additions/edits
// show up instantly without rebuilding the site.
//
// Public URL: https://yasicaakzqqhmtgscbhg.supabase.co/functions/v1/sitemap

const BASE_URL = "https://gadget360.ng";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const STATIC: Array<{ path: string; changefreq: string; priority: string }> = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/shop", changefreq: "daily", priority: "0.9" },
  { path: "/contact", changefreq: "monthly", priority: "0.6" },
];

const CATEGORIES = ["Smartphones", "Laptops", "Apple", "Gaming", "Audio", "Accessories"];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  let products: Array<{ id: string; updated_at?: string }> = [];
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/products?select=id,updated_at`,
      { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } },
    );
    if (res.ok) products = await res.json();
  } catch (e) {
    console.error("sitemap: product fetch failed", e);
  }

  const entries = [
    ...STATIC,
    ...CATEGORIES.map((c) => ({
      path: `/shop?category=${encodeURIComponent(c)}`,
      changefreq: "weekly",
      priority: "0.7",
    })),
    ...products.map((p) => ({
      path: `/product/${p.id}`,
      lastmod: p.updated_at ? new Date(p.updated_at).toISOString().split("T")[0] : undefined,
      changefreq: "weekly",
      priority: "0.7",
    })),
  ] as Array<{ path: string; lastmod?: string; changefreq: string; priority: string }>;

  const xml = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...entries.map((e) =>
      [
        "  <url>",
        `    <loc>${BASE_URL}${e.path}</loc>`,
        e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
        `    <changefreq>${e.changefreq}</changefreq>`,
        `    <priority>${e.priority}</priority>`,
        "  </url>",
      ].filter(Boolean).join("\n")
    ),
    `</urlset>`,
  ].join("\n");

  return new Response(xml, {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/xml; charset=utf-8",
      // Cache at the edge for 5 minutes; product edits propagate within that window.
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
});
