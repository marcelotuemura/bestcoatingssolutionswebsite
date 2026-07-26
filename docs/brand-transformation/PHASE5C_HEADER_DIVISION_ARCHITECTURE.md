# Phase 5C — Header, Navigation, Footer & Division Architecture

**Status:** Awaiting owner approval  
**Branch:** `cursor/phase-5c-header-division-architecture-5ec4`  
**Base:** `main` (Phase 5B merged)  
**Date:** 2026-07-26

---

## Phase completed

1. Merged Phase 5B into `main`.  
2. Primary nav → **Home · About · Marine · Aviation · Projects · Contact**.  
3. Quiet sticky header, no tagline, language + Estimate CTA, accessible mobile nav with focus trap.  
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
| Recommendation | Reserve full illustrated mark for **hero, footer, and brand presentations** when the file lands; keep header compact. If the official mark is still too tall at laptop widths, propose (do not invent) a simplified horizontal lockup for approval |

Drop masters in `docs/branding/originals/` before optimizing web exports.

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

Shared: typography, nav, buttons, spacing, motion, accent logic, forms.  
Differentiated: photography/atmosphere + division content (not separate color systems).

---

## Tests

| Command | Result |
|---------|--------|
| `pnpm typecheck` | Pass |
| `pnpm test` | 252 passed |
| `pnpm build` | Pass (run with evidence capture) |
| E2E aviation / home / phase3 | Updated for visible aviation |

---

## Deferred

- Homepage Marine+Aviation strip after hero (Phase 5D)  
- Official logo binary (owner drop)  
- Aviation service detail pages  
- Manufacturer list on About (5G)  

---

## Approval request

Approve Phase 5C before Phase 5D homepage premium redesign.
