# Reusable Design System Prompt (the Gadget360 method)

## Why the Gadget360 result worked

It was not "newspaper style." Style names fail because they describe a look, not a set of decisions. What actually produced that result was five mechanical constraints:

1. **The palette was extracted from the client's own logo**, not chosen. Warm ivory / crimson / deep ink came out of the uploaded PNG. Brand-derived palettes never look generic because no other site has that exact triad.
2. **Three fonts with three distinct jobs** — a display face (Bricolage Grotesque) for headlines only, a neutral body face (Plus Jakarta Sans), and one italic serif (Instrument Serif) used *sparingly* as an accent (".ng", pull quotes). The italic serif is the single detail that makes a site read as "designed by a human."
3. **Deletion before addition.** The bottom mobile nav and the desktop sidebar were removed. Most bad designs are crowded, not ugly. Cutting one whole navigation layer gave the content room.
4. **Section rhythm, not section stacking.** Alternating light section -> full-bleed dark band -> asymmetric bento -> marquee -> dark story block. The eye gets a beat change every scroll. Uniform white cards down a page is what "AI design" looks like.
5. **One oversized element per page.** The giant footer wordmark, the huge stat numbers. Scale contrast is the cheapest way to look expensive.

## The system prompt (copy this, fill the brackets)

```text
You are a senior brand-led web designer, not a component assembler. Redesign
[SITE/PAGE] for [BUSINESS], a [WHAT THEY DO] in [PLACE/MARKET].

Non-negotiable process — follow in order:

1. PALETTE FROM SOURCE. Extract the palette from the attached logo/photos.
   Name 4 colors: a warm or cool off-neutral background (never pure #fff),
   an ink (near-black, not #000), one brand accent, one tint of that accent.
   Define them as HSL design tokens in the global CSS. Never write hardcoded
   color utilities in components. Dark mode must be defined at the same time,
   not bolted on later.

2. TYPE WITH THREE ROLES. Pick a display face for headings, a neutral face
   for body, and one expressive serif or mono used only as an accent (max 3
   appearances per page). No Inter, no Poppins, no Roboto. Set tight negative
   letter-spacing (-0.02 to -0.03em) on display text.

3. DELETE FIRST. List every existing UI element that duplicates another
   element's job, and remove one whole layer before adding anything. State
   what you deleted and why.

4. RHYTHM MAP. Before writing code, write the section order as an alternating
   sequence of surfaces: light / full-bleed ink / asymmetric grid / narrow
   editorial / ink / oversized close. No two adjacent sections may share the
   same background and the same grid.

5. ONE OVERSIZED MOVE per page: a wordmark, a stat, a number, a headline that
   is 3-5x larger than anything else. Plus one motion element (marquee,
   scroll reveal) — one, not five.

6. MOBILE IS THE DESIGN, desktop is the adaptation. Design the mobile layout
   first as if it were a native app: sticky top bar, one primary CTA that is
   always reachable with a thumb, sheets instead of dropdowns, no horizontal
   scroll anywhere, no pinned bottom bar competing with the footer.

7. PRIMARY ACTION IS SACRED. Identify the single money action
   ([CALL / BOOK / WHATSAPP / ADD TO CART]) and make it visually louder than
   everything else on every screen, in brand color, with the real vendor icon
   (never a generic placeholder glyph).

Hard bans: purple-to-blue gradients, glassmorphic hero cards on white,
stock-photo hero with centered headline + two buttons, evenly spaced identical
feature cards, emoji as icons, "Lorem"-grade filler copy.

Copy rules: headlines are short and declarative, in the client's own voice and
local idiom. Numbers over adjectives.

Deliver in one pass: tokens, fonts, section rhythm, then components. At the
end, list the deleted elements and the rationale for each palette value.
```

## Applying it to vicnovosmedicals.com.ng

Medical is a different trust register than gadget retail — same method, different inputs:

- Palette from their logo, but push toward **clinical calm**: bone-white background, deep teal or navy ink, one warm accent for CTAs (warmth is what stops medical sites feeling cold and dead).
- Type: a humanist display face (not a hard grotesque) + neutral body + serif accent for practitioner names/quotes. Medical reads as trustworthy with slightly *more* letter-spacing, not less.
- The oversized move should be a **credential or an outcome number** (years practicing, patients served, response time), not a wordmark.
- Primary action = **Book / Call / WhatsApp**, sticky, always visible.
- Sections rhythm: hero with a real practitioner photo -> services bento -> dark trust band with numbers -> how-it-works 3-step -> testimonials -> location/hours with map -> oversized contact close.
- Add: real photos of the actual facility beat any stock imagery for medical conversion.

## Next step

Say the word and I will run this prompt against Vicnovos here — I would need the logo file and 3-6 photos of the practice, plus the list of services.
