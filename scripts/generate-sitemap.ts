// Generates public/sitemap.xml from static routes + Supabase products.
// Runs via predev/prebuild hooks in package.json.
import { writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";

const BASE_URL = "https://gadgets360.ng";
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://yasicaakzqqhmtgscbhg.supabase.co";
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlhc2ljYWFrenFxaG10Z3NjYmhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyOTY4OTUsImV4cCI6MjA3MTg3Mjg5NX0.Fv_WBq_pw46OwE6tT3kTCzIqtgMSSO_pqaXBh8CTxrU";

interface Entry { path: string; lastmod?: string; changefreq?: string; priority?: string }

const staticEntries: Entry[] = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/shop", changefreq: "daily", priority: "0.9" },
  { path: "/contact", changefreq: "monthly", priority: "0.6" },
];

const CATEGORIES = ["Smartphones", "Laptops", "Apple", "Gaming", "Audio", "Accessories"];

async function fetchProducts(): Promise<Entry[]> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id,updated_at`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows = (await res.json()) as Array<{ id: string; updated_at?: string }>;
    return rows.map((r) => ({
      path: `/product/${r.id}`,
      lastmod: r.updated_at ? new Date(r.updated_at).toISOString().split("T")[0] : undefined,
      changefreq: "weekly",
      priority: "0.7",
    }));
  } catch (e) {
    console.warn("[sitemap] could not fetch products:", (e as Error).message);
    return [];
  }
}

function build(entries: Entry[]) {
  const urls = entries.map((e) =>
    [
      "  <url>",
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      "  </url>",
    ].filter(Boolean).join("\n")
  );
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

async function main() {
  const products = await fetchProducts();
  const categories: Entry[] = CATEGORIES.map((c) => ({
    path: `/shop?category=${encodeURIComponent(c)}`,
    changefreq: "weekly",
    priority: "0.7",
  }));
  const all = [...staticEntries, ...categories, ...products];
  const out = resolve("public/sitemap.xml");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, build(all));
  console.log(`[sitemap] wrote ${all.length} URLs to public/sitemap.xml`);
}

main();
