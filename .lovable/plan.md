# Plan

## 1. Fix the AI chat bot
The `gemini-chat` edge function is calling `gemini-1.5-flash-latest`, which returns 404 (model retired). 
- Update `supabase/functions/gemini-chat/index.ts` to use `gemini-2.0-flash` (current stable Gemini model on the v1beta endpoint).
- Keep the existing prompt, session, and DB-logging logic intact.

## 2. WhatsApp messages — identify source + include quantities
Update `src/lib/whatsapp.ts` so every generated message clearly states it came from gadget360.ng and includes quantity:
- `waOrderUrl(name, price, qty=1)` → "Hi Gadget360.ng team! I'm ordering from your **website (gadget360.ng)**: {name} ×{qty} — {total}. Please confirm availability & delivery."
- `waQuoteUrl(name)` → prefix with "I'm visiting gadget360.ng and would like a quote for…"
- `waGeneralUrl()` → prefix with website source.
- `Cart.tsx` already builds a multi-line cart message — add the "from gadget360.ng website" header line and an "Items: N (Qty: M)" summary line above Total.
- Audit callers (`ProductDetail`, `ProductCard`, `MiniCart`, `Header`, `Footer`, `Hero`, `LiveChat` fallback, etc.) so the new signature is used consistently.

## 3. Track WhatsApp clicks
- New migration: create `public.whatsapp_clicks` table (columns: `path`, `product_id` nullable, `product_name` nullable, `quantity` nullable, `total_amount` nullable, `source` enum-ish text like `product|cart|header|footer|hero|chat`, `session_id`, `user_agent`, `country`, `country_code`, `city`, `region`). Standard timestamps. RLS: anon+authenticated INSERT (bounded validation like `page_visits`); admin SELECT only. GRANTs included.
- Add `trackWhatsAppClick(payload)` helper in `src/lib/analytics.ts` (mirrors `trackPageView` geo/session logic, fire-and-forget).
- Wrap every `window.open(wa…)` / `<a href={wa…}>` call site to fire the tracker first.
- Add a "WhatsApp Clicks" card/table to `src/components/admin/AnalyticsPanel.tsx` showing recent clicks, totals by source, and per-day count. Keep visual style consistent with existing analytics tiles.

## 4. Remove Developer Export page
- Remove the Developer Export tab trigger and tab content from `src/pages/Admin.tsx`.
- Remove the `isSuperAdmin` state/RPC check (no longer needed) and the export-guide download handler. Leave the `super_admin` role in the DB untouched (harmless; no migration needed).

## 5. SEO + UX polish (no visual redesign)
- `index.html`: fix the canonical/JSON-LD host mismatch (`gadgets360.ng` vs `gadget360.ng`) — standardize on `https://gadget360.ng`. Add `<meta name="robots" content="index,follow">` and `og:locale`, `og:site_name`.
- Add a real `og:image` reference to the existing logo (1200×630-ish) — only if a usable asset exists; otherwise leave as favicon.
- `Seo.tsx`: already solid; add `og:site_name` and `twitter:image` fallback.
- `public/sitemap.xml`: verify entries use `gadget360.ng` and include `/shop`, `/cart`, `/auth`, `/contact`.
- Minor UX: ensure WhatsApp buttons have `aria-label`, `rel="noopener noreferrer"` where missing, and `target="_blank"` consistency. No layout/color changes.

## Out of scope
- No design overhaul (per your note — design stays).
- No changes to `super_admin` enum or role data.

## Technical notes
- Edge function model swap is a one-line change; no secret changes.
- New `whatsapp_clicks` table follows the same bounded-INSERT RLS pattern already used for `page_visits` so anonymous tracking stays safe.
- Tracking calls are non-blocking (`void trackWhatsAppClick(...)`) so they never delay the WhatsApp redirect.
