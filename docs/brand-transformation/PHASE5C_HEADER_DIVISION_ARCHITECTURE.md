# Phase 5C — Header, Navigation, Footer & Division Architecture

**Status:** Awaiting owner approval  
**Branch:** `cursor/phase-5c-header-division-architecture-5ec4`  
**PR:** https://github.com/marcelotuemura/bestcoatingssolutionswebsite/pull/36  
**Base:** `main` (Phase 5B merged)  
**Date:** 2026-07-26

---

## Phase completed

1. Merged Phase 5B into `main`.  
2. Primary nav → **Home · About · Marine · Aviation · Projects · Contact**.  
3. Quiet sticky header, no tagline, language + Estimate CTA, accessible mobile nav with focus trap (panel portaled to `document.body` so sticky `backdrop-blur` does not clip the overlay).  
4. Active nav states (`aria-current`, `data-active`).  
5. Aviation **visible and active** — Coming Soon removed; carefully scoped cosmetic refinishing copy; Contact CTA (not marine estimate booking).  
6. Footer slimmed: brand blurb, contact, explore links (Marine/Aviation/Projects/About/Contact/Estimate/legal), languages.  
7. Logo resolution: official SVG/WebP/PNG auto-detect; **text wordmark interim** when missing (temporary SVG never treated as official).  
8. Evidence screenshots + keyboard notes.

---

## Logo decision (header)

| Question | Finding |
|----------|---------|
| Official SVG/PNG/WebP in repo? | **No** at time of Phase 5C |
| Header treatment | Calm **text wordmark** (`BrandLockup`, `data-logo-mode="text"`) |
| Temporary SVG as official? | **No** — never |
| Full illustrated logo in header | Practical once `public/brand/bcs-logo-official.{svg\|webp\|png}` is dropped — auto-switches to image mode at ~36px height in a 64px bar |
| Recommendation | **Reserve full illustrated mark for hero, footer, and brand presentations** when the file lands; keep header compact with text (or a future approved horizontal lockup). Do not invent a new mark. |

Drop masters in `docs/branding/originals/` before optimizing web exports. Suggested interim production filenames if no SVG: `public/brand/bcs-logo-official.png` / `.webp` (preserve originals separately).

---

## Division architecture

| | Marine | Aviation |
|---|--------|----------|
| Status | `active` | `active` |
| Nav | Yes | Yes |
| Public estimates | Yes | No — Contact inquiries |
| Framing | Primary commercial focus | “Aviation is part of who we are” |
| Scope | Full marine services | Cosmetic / exterior refinishing only |

Aviation catalog (names only; no separate service detail routes yet): Aircraft Cosmetic Refinishing, Exterior Paint Restoration, Composite Surface Refinishing, Paint Correction, Color Matching, Surface Preparation, Finish Restoration, Cosmetic Exterior Repairs.

Explicitly excluded: FAA repair station, structural, mechanical, engines, avionics, flight-critical.

---

## Shared vs differentiated

Shared: typography (Newsreader display + Manrope UI/body), nav, buttons, spacing, motion, accent logic, forms.  
Differentiated: photography/atmosphere + division content (not separate color systems).

---

## Review evidence

Artifacts: `/opt/cursor/artifacts/phase5c-screenshots/`

| Evidence | File |
|----------|------|
| Desktop header on dark | `header-desktop-dark-1440.png` |
| Desktop header over imagery | `header-over-imagery-1440.png` |
| Tablet header | `header-tablet-1024.png` |
| Mobile closed | `mobile-header-closed-390.png` |
| Mobile open (viewport) | `mobile-header-open-390.png` |
| Mobile open (drawer) | `mobile-nav-drawer-390.png` |
| Footer desktop | `footer-desktop-1440.png` |
| Footer mobile | `footer-mobile-390.png` |
| Marine route | `marine-desktop-1440.png` |
| Aviation route | `aviation-desktop-1440.png` |
| Active nav (About / Marine) | `nav-active-about-1440.png`, `nav-active-marine-1440.png` |
| Spanish nav | `header-spanish-1440.png`, `nav-spanish-aviation-1440.png` |
| Keyboard focus on Marine | `keyboard-nav-focus-1440.png` |
| Logo width ladder | `logo-header-{1280,1024,768,390}.png` (all `data-logo-mode=text`) |

### Keyboard navigation notes

- Skip link → main content works (covered by existing home e2e).  
- Desktop primary nav links receive visible focus ring (`keyboard-nav-focus-1440.png` — Marine focused).  
- Mobile dialog traps focus; Escape closes and returns focus to open control (home e2e).  
- Active route uses `aria-current="page"`.

---

## Tests

| Command | Result |
|---------|--------|
| `pnpm typecheck` | Pass |
| `pnpm test` | 252 passed |
| `pnpm build` | Pass |
| E2E `home` / `phase3` / `phase3-polish` / `phase5` | Pass (updated for Phase 5C footer + aviation) |

---

## Deferred

- Homepage Marine+Aviation strip after hero (Phase 5D)  
- Official logo binary (owner drop)  
- Aviation service detail pages  
- Manufacturer list on About (5G)  

---

## Approval request

Approve Phase 5C before Phase 5D homepage premium redesign.
