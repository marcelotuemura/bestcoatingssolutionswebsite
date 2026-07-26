# Phase 5D — Premium Homepage Experience

**Status:** Awaiting owner approval  
**Branch:** `cursor/phase-5d-premium-homepage-5ec4`  
**PR:** https://github.com/marcelotuemura/bestcoatingssolutionswebsite/pull/37  
**Base:** `main` (Phase 5C merged)  
**Date:** 2026-07-26

---

## Intent

Make the homepage the flagship page of Best Coatings Solutions — the visual and emotional benchmark for every subsequent page.

Within the first viewport (and without excessive scrolling), a visitor should understand:

- Premium company  
- Marine + Aviation  
- Experienced craftsman  
- Real work (honest placeholder framing until photography lands)  
- Easy next step  

---

## Homepage composition (purpose rule)

| Section | Purpose |
|---------|---------|
| Hero | Trust + contact |
| Marine & Aviation (editorial strip) | Capability |
| Meet Marcelo | Trust |
| Philosophy | Trust |
| Featured Work (Before / During / After) | Proof |
| What You Can Expect | Capability |
| Request an Estimate | Contact |

**Removed from homepage** (still available on About / elsewhere): Why BCS, Craft Principles, Service Area standalone block.

---

## What shipped

1. **Cinematic hero** — full-bleed atmosphere, brand-first lockup (official mark when present; scaled text interim), one Newsreader headline, short support, two CTAs.  
2. **Signature divisions strip** — editorial Marine → Aviation layout; atmospheres via photography language + CSS textures (not separate color systems or cards).  
3. **Meet Marcelo** — personal, workshop/project photo slot (not a posed studio prompt).  
4. **Featured Work** — Before / During / After stage frames + honest story scaffolding.  
5. **Estimate CTA** — single primary button; no sales pressure.  
6. **Quieter sticky header** — lighter blur and border (approved 5C direction).  
7. **Primary button contrast** — `accent-pressed` (`#0066cc`) for AA white-on-blue contrast (~5.6:1).  
8. **Brand lockup accessible name** — includes visible “Best Coatings Solutions” + “BCS” text.

---

## Logo roles (confirmed)

| Surface | Treatment |
|---------|-----------|
| Header | Compact wordmark / future compact official mark |
| Hero | Full official logo when file lands |
| Footer | Full official logo when file lands |
| Brand presentations | Full official logo |

---

## Review evidence

Artifacts: `/opt/cursor/artifacts/phase5d-screenshots/`

### Viewports

| Viewport | Hero | Full page | Divisions |
|----------|------|-----------|-----------|
| Desktop 1920 | `home-desktop-1920-hero.png` | `…-full.png` | `…-divisions.png` |
| Desktop 1440 | `home-desktop-1440-hero.png` | `…-full.png` | `…-divisions.png` |
| Laptop 1366 | `home-laptop-1366-hero.png` | `…-full.png` | `…-divisions.png` |
| Tablet portrait 768 | `home-tablet-portrait-768-hero.png` | `…-full.png` | `…-divisions.png` |
| Tablet landscape 1024 | `home-tablet-landscape-1024-hero.png` | `…-full.png` | `…-divisions.png` |
| iPhone portrait 390 | `home-iphone-portrait-390-hero.png` | `…-full.png` | `…-divisions.png` |
| iPhone landscape 844 | `home-iphone-landscape-844-hero.png` | `…-full.png` | `…-divisions.png` |

### Additional

- Hero height ladder: `home-hero-height-{700,900,1100}.png`  
- Division interactions: `division-marine-cta-hover.png`, `division-aviation-focus.png`  
- Featured stages: `featured-work-stages.png`  
- Estimate CTA: `estimate-cta.png`  
- Spanish hero: `home-spanish-1440-hero.png`  
- Before (Phase 5A): `before-home-desktop-1440-phase5a.png`, `before-home-mobile-390-phase5a.png`  
- Lighthouse HTML/JSON: `lighthouse.report.html`, `lighthouse.report.json`  
- Runtime perf probe: `perf-observations.json`

### Lightbox / zoom

Not implemented on the homepage in Phase 5D (no interactive gallery yet). Featured stages are static proof frames awaiting real photography.

---

## Responsive typography scale

| Role | Mobile | Desktop |
|------|--------|---------|
| Hero H1 (Newsreader) | `text-4xl` | up to `xl:text-7xl` |
| Section H2 (Newsreader) | `text-3xl` | `sm:text-4xl` |
| Division H3 (Newsreader) | `text-3xl` | `sm:text-4xl` |
| Body / UI (Manrope) | `text-base`–`text-lg` | same, capped for calm density |

---

## Performance & accessibility observations

### Playwright / Chromium probe (`perf-observations.json`)

- FCP ≈ 80 ms (local production server)  
- LCP ≈ 1.1 s (element: `H1`)  
- CLS = 0  
- Transfer size ≈ 26 KB (HTML document; silhouettes are SVG)

### Lighthouse (local headless, `/en`)

| Category | Score |
|----------|------:|
| Performance | 0.87 |
| Accessibility | 0.96 |
| Best practices | 0.96 |
| SEO | 1.00 |

- LCP (Lighthouse lab): ~4.1 s (lab variance; tab crash warning during run — treat as directional)  
- CLS: 0  
- FCP: ~1.1 s  
- TBT: ~40 ms  

**A11y remediations in this phase:** primary button contrast (`#0066cc` ≈ 5.6:1 vs white) + brand lockup accessible name includes visible BCS text. Lab Lighthouse re-run in this environment crashed the browser tab after the fix — treat the JSON above as pre-fix baseline; re-check in a stable local/CI Chrome after merge.

### Accessibility notes

- Single H1  
- Skip link + focus-visible rings preserved  
- Reduced-motion path verified in e2e  
- Mobile nav focus trap unchanged from Phase 5C  
- Division and Featured frames use semantic headings / figures  

---

## Before / after

Compared to Phase 5A homepage captures:

- Nav is now Home · About · Marine · Aviation · Projects · Contact  
- Aviation is a visible homepage division (not absent / Coming Soon)  
- Hero is cinematic and brand-first  
- Sections pruned to trust / capability / proof / contact  
- Featured Work presents Before / During / After scaffolding  

---

## Tests

| Command | Result |
|---------|--------|
| `pnpm typecheck` | Pass |
| `pnpm test` | 254 passed |
| `pnpm build` | Pass |
| E2E `tests/e2e/home.spec.ts` | 13 passed |

---

## Deferred

- Real workshop / project photography (replaces silhouettes & photo slots)  
- Official logo binary drop  
- Interactive before/after or lightbox on homepage (optional later)  
- Phase 5E/5F Marine & Aviation division page polish  

---

## Approval request

Approve Phase 5D before Phase 5E/5F division polish.
