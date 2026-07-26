# Phase 5B — Premium Visual Identity System

**Status:** Awaiting owner approval  
**Branch:** `cursor/phase-5b-visual-identity-5ec4`  
**Base:** `main` (Phase 4 Trust Experience merged)  
**Date:** 2026-07-26  
**Preview:** `/en/design-system` (noindex)

---

## Phase completed

Established a cohesive design system without restyling every marketing page.

1. Merged Phase 4 into `main` (approved merge strategy).  
2. Defined semantic color tokens, typography, spacing, radius, motion.  
3. Refined primary/secondary button system.  
4. Added editorial card + media frame treatments.  
5. Documented Marine vs Aviation visual personalities (shared family).  
6. Logo usage rules + header evaluation mock; **no logo redesign**.  
7. Controlled preview route + documentation.  
8. Recorded Phase 9 Digital Asset Library as a future roadmap item.

**Not done (intentionally):** full homepage/nav redesign (5C/5D), Aviation copy elevation (5F), About manufacturer expansion (5G), project filters (5H).

---

## Logo

| Decision | Status |
|----------|--------|
| Official mark (powerboat + jet + BCS) approved | Yes |
| Official binary in repository | **Not yet** — blocker for final chrome |
| Interim evaluation asset | `public/brand/bcs-logo-temporary.svg` |
| Hero / footer | Full mark via `BrandLogoMark` (footer live; hero continues interim SVG) |
| Header | Evaluated at 40px in 64px bar on design-system page; **SiteHeader not switched yet** |
| Simplified horizontal variant | **Proposed only** — not implemented |

**Owner action:** add `public/brand/bcs-logo-official.svg` and flip `config/brand-logo.ts`.

---

## Typography

| Role | Family | License | Loading |
|------|--------|---------|---------|
| Display headings | Newsreader | OFL (Google Fonts) | `next/font` → `--font-newsreader` |
| Body / UI / buttons / captions | Manrope | OFL (Google Fonts) | `next/font` → `--font-manrope` |

Scale (approx.): H1 ~36–60px · H2 ~30–36px · H3 ~20–24px · body 16px / 1.625 · UI 14px · caption 12px.  
Tracking: tight on display; slightly wide on UI labels. Weights 400–600.

---

## Semantic color

Defined in `app/globals.css`. Accent = logo electric blue, used sparingly.

Background Primary / Secondary · Surface · Accent / Hover / Pressed · Text Primary / Secondary / Muted · Border · Divider · Focus Ring.

---

## Spacing / radius / motion

- Spacing scale 4→96px; calm section rhythm.  
- Control radius 8px · media ~2px · card 12px.  
- Motion: premium ease, short durations, reduced-motion honored.

---

## Marine vs Aviation

Unified type/spacing/buttons. Differentiation via imagery + atmosphere utilities (`.bcs-marine-texture`, `.bcs-aviation-texture`). Silhouettes remain placeholders until P0 photography.

---

## Locked owner decisions (from Phase 5A approval)

Carried into working addendum for later phases:

- Aviation **visible**, not “Coming Soon”; commercially controlled via content.  
- Approved aviation cosmetic service categories only.  
- Manufacturer list approved with disclaimer; no logos.  
- P0 photography priority list.  
- Phase 9 Digital Asset Library noted in `FUTURE.md`.

---

## Files changed (high level)

- `app/globals.css`, `app/[locale]/layout.tsx`, `app/[locale]/design-system/page.tsx`  
- `components/ui/{Button,Heading,MediaFrame,EditorialCard}.tsx`  
- `components/brand/BrandLogoMark.tsx`, `components/design-system/DesignSystemPage.tsx`  
- `components/layout/SiteFooter.tsx`, `components/home/HeroSection.tsx`  
- `config/{brand-logo,routes,home-placeholders}.ts`  
- `i18n/dictionaries/{en,es}.ts`  
- `DESIGN_SYSTEM.md`, brand-transformation docs, `FUTURE.md`, `public/brand/README.md`  
- Unit test for Phase 5B

---

## Deferred

- Header swap to full official logo (needs file + 5C nav work)  
- Homepage division strip / nav reorder (5C/5D)  
- Aviation status/copy changes (5F)  
- Stock photography (blocked — wait for authentic P0)  
- Alternate logo marks  

---

## Risks / questions

1. Please upload the **official logo SVG** to unlock header/hero finalization.  
2. Confirm Newsreader + Manrope pairing feels right on `/design-system` (alternative pairs available if rejected).  
3. Confirm header mock at 40px is acceptable once the official file lands, or approve a simplified horizontal proposal.

---

## Approval request

**Please approve Phase 5B** before Phase 5C (header, footer, division architecture).
