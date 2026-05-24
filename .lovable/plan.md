## Goal

Redesign the visual layer of Gadget360.ng to feel premium, thin, and modern — Nexora-style on desktop, clean app-like on mobile — while preserving every existing route, category, product, WhatsApp flow, cart, auth, admin, and Supabase wiring.

Nothing in `src/integrations/supabase/`, `supabase/`, `src/hooks/useAuth`, cart logic, or page data fetching changes. This is a UI/CSS pass.

## Design system (rebuilt in `src/index.css` + `tailwind.config.ts`)

Palette (HSL, light is default, dark via `.dark` toggle):

- Light mode background `0 0% 100%`, surface `0 0% 98%`, foreground `0 0% 7%`
- Dark mode background `0 0% 5%` (#0d0d0d), surface `0 0% 9%`, foreground `0 0% 98%`
- Primary (modernised crimson) `352 78% 52%` with `--primary-glow` `352 92% 62%`
- Accent warm grey `30 6% 55%`, muted `0 0% 95%` / dark `0 0% 14%`
- WhatsApp green retained
- New tokens: `--gradient-crimson`, `--gradient-hero-light`, `--gradient-hero-dark`, `--shadow-soft` (thin 1px ring + low blur), `--shadow-glow-crimson`, `--glass-bg` (`hsla(0 0% 100% / 0.55)` light, `hsla(0 0% 10% / 0.5)` dark), `--glass-border` `hsla(0 0% 100% / 0.18)`
- Radius default `0.75rem`, pill `9999px`
- Default theme switched to LIGHT (matches references); user can toggle dark

Typography:

- Add Google Fonts in `index.html`: **Syne** (700/800) for display, **Inter** (400/500/600) for body/UI
- Tailwind `fontFamily.display` = Syne, `fontFamily.sans` = Inter
- Thin borders (`border` = 1px), thin button heights (h-9 default, h-11 hero), tracking-tight on headings

Glassmorphism: two opt-in utility classes `.glass` and `.glass-strong` (backdrop-blur, semi-transparent bg, hairline border) — used only on (1) hero floating price/feature chip and (2) mobile bottom navigation.

## Desktop redesign (≥ md)

New layout shell in `src/pages/Index.tsx` (and reused on Shop/Contact/Product):

```text
┌─────────────────────────────────────────────────┐
│ Announcement bar: address · hours · phone       │
├──┬──────────────────────────────────────────────┤
│  │ Top nav: logo · search · WhatsApp · cart · ⛌│
│S ├──────────────────────────────────────────────┤
│i │                                              │
│d │   HERO (light)                               │
│e │   "Get Authentic Gadgets" – Syne 72px        │
│b │   subcopy · WhatsApp CTA · Browse CTA        │
│a │   glass price/free-delivery chip             │
│r │   → uploaded device-cluster image right      │
│  ├──────────────────────────────────────────────┤
│  │ Trust strip (4 thin cards, hairline border)  │
│  ├──────────────────────────────────────────────┤
│  │ Shop by Category (icon grid, 7 tiles)        │
│  ├──────────────────────────────────────────────┤
│  │ Featured Products (clean card grid)          │
│  ├──────────────────────────────────────────────┤
│  │ STATS (dark #0d0d0d): 4 big numbers          │
│  │ 10K+ Products · 25K+ Customers · 99% Sat ·   │
│  │ <5min WhatsApp Response                      │
│  ├──────────────────────────────────────────────┤
│  │ Why Choose Us (alternating light section)    │
│  ├──────────────────────────────────────────────┤
│  │ Testimonials (3 cards, Nigerian names)       │
│  ├──────────────────────────────────────────────┤
│  │ Footer (existing content, restyled thin)     │
└──┴──────────────────────────────────────────────┘
```

- New `src/components/DesktopSidebar.tsx` — fixed left rail (w-16), icon-only nav (Home, Shop, Categories popover, Headphones/support, Account), pill active indicator, hidden below md
- New `src/components/Hero.tsx` rewrite — light bg, gradient blob behind device cluster, Syne headline, two CTAs (WhatsApp pill + outline Browse), glass chip with "From ₦ · Free delivery in Lagos"
- New `src/components/StatsSection.tsx` — dark #0d0d0d band, 4 columns, Syne numerals
- New `src/components/Testimonials.tsx` — 3 cards with avatar/initials, quote, name, role
- Featured products / category cards restyled: white card, hairline border, image area on `bg-muted/40`, hover lift `translate-y-[-2px]` + crimson glow shadow, thin "Add" and WhatsApp icon buttons

## Mobile redesign (< md)

- Replace top heavy header with a slim 56px bar: logo left, search icon + cart icon right; below it a horizontal scrollable category chip row (pill chips, active = crimson fill)
- Hero condensed: stacked, large Syne headline, device image below, single WhatsApp CTA
- Product grid: 2-col, rounded-2xl cards, price pill, stock-left line, star rating, heart icon top-right
- Bottom nav uses `.glass-strong`: Home / Shop (Orders→Shop) / Favourites / Profile — pill highlight on active, safe-area padding (extends existing `MobileNavigation.tsx`)
- Full-screen product detail spacing tightened, sticky bottom "Add to Cart / WhatsApp" bar
- Update `src/components/MobileNavigation.tsx` icons + glass style; keep route targets

## Assets

- Copy `user-uploads://BackgroundEraser_20260524_012717333.png` → `src/assets/hero-devices.png`, import in `Hero.tsx`, replace old `/hero-gadgets.png` reference
- Generate a new favicon (premium crimson "G" mark on near-black, rounded square) via imagegen → `public/favicon.png`, delete `public/favicon.ico`, update `index.html` `<link rel="icon">` + theme-color meta + Syne/Inter font links
- Keep all existing `/lovable-uploads/*` social icons

## Files to change

Edited:
- `src/index.css` — new tokens, light default, glass utilities, font families
- `tailwind.config.ts` — fontFamily, extra colors (primary-glow), shadow tokens
- `index.html` — fonts, favicon, theme-color, meta description
- `src/components/Header.tsx` — slim restyle, integrates sidebar trigger on desktop, mobile slim bar + chip row
- `src/components/Hero.tsx` — full rewrite
- `src/components/FeaturedProducts.tsx` — card restyle only (no data change)
- `src/components/ProductCard.tsx` — thin card style, hover, glass-free
- `src/components/Footer.tsx` — thinner type, hairline dividers, light-mode aware
- `src/components/MobileNavigation.tsx` — glass bottom nav, new icon set
- `src/pages/Index.tsx` — compose new sections
- `src/pages/Shop.tsx`, `src/pages/ProductDetail.tsx`, `src/pages/Cart.tsx`, `src/pages/Contact.tsx`, `src/pages/Profile.tsx`, `src/pages/Auth.tsx` — apply new shell (sidebar + slim header), restyle only
- `src/components/ThemeToggle.tsx` — ensure light is default

Created:
- `src/components/DesktopSidebar.tsx`
- `src/components/StatsSection.tsx`
- `src/components/Testimonials.tsx`
- `src/components/CategoryChips.tsx` (mobile horizontal scroll)
- `src/components/AnnouncementBar.tsx`
- `src/assets/hero-devices.png` (copied)
- `public/favicon.png` (generated)

Untouched: Supabase client, edge functions, migrations, types, useAuth, cart hooks, Admin page logic, all product data fetching.

## Preserved verbatim

- All 7 categories
- Phone `+234 706 789 4474`, second line `+234 810 841 8727`, address, hours
- "Get Authentic Gadgets" headline copy and "Free delivery in Lagos" badge
- WhatsApp Order button prominent on desktop header + hero + product cards + mobile bottom action
- Browse Products CTA
- Dark mode toggle
- Cart, Sign In, Admin, Auth flows and routes

## Out of scope

No database migrations, no edge function edits, no new packages beyond Google Fonts (loaded via `<link>` in index.html), no copy rewrites beyond adding stat numbers and testimonial placeholders.
