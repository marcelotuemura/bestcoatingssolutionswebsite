# Brand Guide

Strategic brand direction for the Best Coatings Solutions (BCS) public website.
Implementation tokens live in [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) and
`app/globals.css`. This guide explains **identity, voice, and usage rules** so
UI never drifts into a generic contractor template.

Related: [`CONTENT_STRATEGY.md`](./CONTENT_STRATEGY.md),
[`HOME_EXPERIENCE.md`](./HOME_EXPERIENCE.md),
[`PHOTOGRAPHY_GUIDE.md`](./PHOTOGRAPHY_GUIDE.md).

## Positioning

**Premium local specialist** for marine and aviation coatings, refinishing, and
composite repair — mobile to homes, marinas, boatyards, airports, and hangars
where permitted.

Feel: **Apple-inspired simplicity × high-end luxury × technical credibility**.
Closer to Feadship / Gulfstream restraint than loud trade advertising.

## Brand signals

| Signal | Rule |
|--------|------|
| Name | **Best Coatings Solutions** is a hero-level signal on branded surfaces — not only nav text or an eyebrow. |
| Short name | **BCS** for compact UI, metadata templates, and logo lockups. |
| Logo | Follow the uploaded BCS logo identity (SVG primary). Do not redraw or recolor outside approved variants. |
| Divisions | Marine and Aviation are equal peers; do not bury either. |

**Brand test:** If the first viewport could belong to another company after
removing the nav, branding is too weak.

## Visual direction

### Palette

Dark navy, electric blue, silver, and white. Colorful enough to catch the eye;
never loud neon or rainbow gradients.

| Role | Token family | Notes |
|------|--------------|-------|
| Atmosphere | `navy-950` → `navy-700` | Near-black navy fields; raised surfaces sparingly |
| Accent | `electric-400` → `electric-600` | CTAs, focus, light sweeps — use with discipline |
| Type | `silver-100` / `300` / `500` + white | Primary / secondary / muted |

Avoid defaulting to purple-on-white themes, warm cream + terracotta “AI brochure”
looks, or broadsheet newspaper layouts. Prefer purposeful gradients, reflective
texture, and real imagery over flat single-color slabs.

### Typography

Expressive but restrained. Prefer a purposeful premium sans via `next/font`
(foundation currently uses Inter — confirm upgrade vs keep before Phase 1 UI).
Large confident headings; generous body line-height; weights mostly 400–600.

### Layout & components

- Mobile-first; generous whitespace.
- **Default: no cards.** Cards only when they containerize a real interaction.
- Never use cards in the hero.
- No floating badges, promo stickers, or detached labels on hero media.
- Full-bleed hero visual plane on promotional surfaces; no inset media cards in
  the first viewport.

### Motion

Homepage only. Elsewhere: static. Honour `prefers-reduced-motion`. See
[`HOME_EXPERIENCE.md`](./HOME_EXPERIENCE.md).

## Voice & tone

Confident, precise, understated. Short declarative sentences. Emphasize
craftsmanship, protection, restoration, and mobility.

| Do | Don't |
|----|-------|
| “Mobile refinishing at your marina or hangar.” | “#1 cheapest coatings in Florida!!!” |
| “Free estimates in the Fort Lauderdale area.” | “Free estimates everywhere.” |
| Real project outcomes and process | Fake reviews, invented case studies |
| Clear next steps | Price lists or discount banners |

Languages spoken in business: English, Spanish, Portuguese, Japanese.
**Site UI locales for first release:** English and Spanish only.

## Audiences (tone calibration)

Marinas, boat owners, yacht captains/managers/brokers, shipyards, aircraft
owners/managers, FBOs, and related marine/aviation buyers. Speak to
professionals who protect high-value assets — not DIY bargain hunters.

## Messaging pillars

1. **Dual expertise** — Marine and Aviation under one specialist brand.
2. **Mobile service** — Work comes to the vessel or aircraft where permitted.
3. **Finish quality** — Cosmetic and structural care with technical credibility.
4. **South Florida focus** — Jupiter southward; travel beyond by arrangement.
5. **Accessible next step** — Estimate and schedule without friction or prices.

## Social presence

- Live channels: Instagram, Facebook (URLs in `config/site.ts` when provided).
- Architecture prepares TikTok and additional networks without implying they are
  live until approved.

## Non-negotiables

- No service prices on the public site.
- No implication that every estimate is free.
- No fake social proof.
- No customer portal UI beyond an approved “Coming Soon” treatment (or omit).
- Do not connect production Supabase or Stripe without approval.

## Asset checklist

Owner-supplied: logo (SVG/PNG variants), favicons, default Open Graph image,
approved photography (see [`PHOTOGRAPHY_GUIDE.md`](./PHOTOGRAPHY_GUIDE.md)), and
final Spanish brand copy review.
