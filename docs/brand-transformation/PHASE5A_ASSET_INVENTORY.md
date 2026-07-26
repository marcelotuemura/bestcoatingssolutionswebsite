# Phase 5A — Asset Inventory

**Date:** 2026-07-26  
**Branch:** `cursor/phase-5a-repo-asset-audit-5ec4`  
**Scope:** All image/media assets under the repository (excluding `node_modules`, `.next`, Playwright report folders).  
**Status:** Audit only — no redesign, no asset replacement.

---

## Executive answers

| Question | Finding |
|----------|---------|
| Official logo (powerboat + business jet + metallic BCS lettering) | **Not present in the repository** |
| Temporary logo only? | **Yes** — `public/brand/bcs-logo-temporary.svg` |
| Silhouette placeholders? | **Yes** — marine + aviation SVGs |
| Real BCS project photography for marketing? | **No** |
| Real aviation marketing imagery? | **No** (silhouette only) |
| Favicon / Open Graph images? | **Missing** from `public/` and `app/` |
| Fixture / test media only? | **Yes** — media catalog + local gallery binaries |

---

## Public brand assets (`public/brand/`)

| File | Size | Dimensions | Classification | Marketing use |
|------|------|------------|----------------|---------------|
| `bcs-logo-temporary.svg` | 1.6 KB | viewBox 320×96 | Temporary logo (letterform “BCS” + wordmark) | Temporary only — **not** the official powerboat/jet mark |
| `marine-silhouette.svg` | 1.0 KB | 1200×600 | Decorative / Placeholder | Atmosphere only; explicitly not BCS photography |
| `aviation-silhouette.svg` | 0.9 KB | 1200×600 | Decorative / Placeholder | Aviation preview atmosphere only |

**Entire `public/` media surface:** these 3 files.

### Temporary logo limitations (evaluate before any redesign)

Documented in SVG title/desc as temporary and replaceable.

Observed limitations for real layouts:

1. **No dual-division mark** — missing powerboat and business jet. Fails the brand test once logo is removed of communicating Marine + Aviation.  
2. **Header does not use the SVG** — `Logo.tsx` renders a text monogram (`BCS` in a rounded square) + company name. Hero uses the temporary SVG. Two different marks compete.  
3. **Horizontal / compact variants absent** — no simplified header mark, monogram-only, one-color, or favicon masters.  
4. **Metallic styling in SVG is subtle**; at small header sizes the wordmark becomes hard to read.  
5. **Do not invent alternate marks** until the owner supplies the official logo files.

---

## Config placeholder maps

| Source | Slots | Notes |
|--------|-------|-------|
| `config/home-placeholders.ts` | logo, marineVisual, aviationVisual, featured, beforeAfter | All temporary / placeholder |
| `config/marketing-placeholders.ts` | marine/aviation/service heroes | Same silhouettes |
| `config/projects.ts` | Empty published catalog; test fixture uses marine silhouette for B/D/A | Fixtures only when `BCS_INCLUDE_TEST_FIXTURES` |
| `components/home/BeforeAfterSlider.tsx` | CSS gradients | Demo UI, not photography |
| About photo slots | Empty honest notes | No stock substitution |

See also: `docs/assets/PLACEHOLDER_INVENTORY.md`.

---

## Media vault (`data/media-vault/`)

| Area | Status |
|------|--------|
| `originals/` | Empty (`.gitkeep` only) |
| `derivatives/` | Empty structure |
| `gallery/**` | Local test binaries only (**gitignored**) — upload tiles / stubs, not marketing photos |

**Marketing trust:** none of the gallery binaries are approved project photography.

---

## Fixture media catalog (`data/media-catalog/`)

| Artifact | Count | Notes |
|----------|------:|-------|
| `media_catalog.json` | 240 | `isFixture: true` — synthetic marine assets, **no binaries in repo** |
| Projects rollup | 13 | All marine fixtures |
| Aviation / aircraft assets in catalog | **0** | |
| Duplicates report | 14 groups | Fixture-only |

Every catalog entry notes it is **not a real client photo**. Do not publish as portfolio proof.

---

## Classification rollup (public marketing readiness)

| Class | Ready for public marketing? | Current source |
|-------|----------------------------:|----------------|
| Official logo | No | Missing |
| Temporary logo | Temporary only | `bcs-logo-temporary.svg` |
| Marine (real photo) | No | Silhouette |
| Aviation (real photo) | No | Silhouette |
| Process / During | No | — |
| Before / After (matched) | No | CSS demo / silhouette fixture |
| Shop / Team | No | Empty About slots |
| Fixture catalog | No | Metadata only |

---

## Priority intake (owner action)

### P0 — blocks premium redesign credibility

1. **Official logo masters** (SVG preferred): full-color horizontal, simplified header, monogram, one-color, favicon source.  
2. **Homepage marine hero** — authentic wide + vertical crop.  
3. **Homepage / division aviation still** — authentic, scoped to refinishing (not mechanical maintenance).  
4. **At least one matched marine before → during → after set** with owner publication approval.  
5. **Marcelo working / portrait** (natural, not stock) for About + Meet Marcelo teaser.

### P1 — strengthens trust

6. Process details: masking, prep, gelcoat/paint application, wet sanding, polish, reflection quality.  
7. Favicon + default Open Graph image derived from approved logo/photo.  
8. Additional marine project stories (only when data is verified).  
9. Aviation before/during/after only when operational messaging and imagery are approved.

### Do not

- Replace authentic work with stock or AI because it looks cleaner.  
- Display employer or manufacturer logos.  
- Publish fixture catalog assets as real work.  
- Invent vessel/aircraft identities from unlabeled photos.

---

## Enhancement policy reminder

Preserve originals. Create enhanced copies separately. Allowed: resolution, noise, exposure, WB, crop, straighten, moderate sharpen, compression. Forbidden: misrepresenting damage, repair quality, scope, materials, or identity.
