# Media Phase 2A — Audit

**Date:** 2026-07-29  
**Scope:** Safe local-first media intake, inventory, and review foundation  
**Decision:** Extend existing `/media` DAMS — do not build a second product

## What already exists

| Area | Evidence |
|------|----------|
| `/media` shell + RBAC | `app/media/**`, `lib/media-intelligence/auth/*`, `MEDIA_INTELLIGENCE_ENABLED` |
| Catalog library UI | `lib/media-library`, `/media/library`, `/media/catalog` |
| Vault ingest + derivatives | `lib/media-vault`, `pnpm media:ingest`, sharp WebP/AVIF/thumbs |
| Privacy heuristics | `lib/media-intelligence/privacy.ts`, vision privacy detect (suggestions only) |
| Gallery review queue | `/media/review` (Supabase-backed gallery assets) |
| Publishers (Phase 6) | Draft/approve/schedule — **not** FS export to `public/images` |
| Archive contract | `data/pictures/<slug>/` + `public/images/<division>/` (`PHOTOGRAPHY_GUIDE.md`, `MEDIA_PIPELINE_ROADMAP.md`) |
| Marine publish wiring | `config/marine-photography.ts` + hand-exported WebPs |

## What is reusable

- Session gate + permission matrix (`review_privacy`, `edit_metadata`)
- `sha256File`, `readImageExif`, sharp
- MediaShell / design tokens
- Roadmap Phase A “first implementation slice” as the Phase 2A charter

## What was missing (before Phase 2A)

1. CLI inventory of `data/pictures/` → deterministic manifest  
2. Typed Phase 2A media record (status/stage/privacy/quality/publish)  
3. Manual privacy checklist with default `unchecked`  
4. Internal inventory UI over archive (not only gallery DB / fixture catalog)  
5. Publish/derivative **contracts** without implementing website export  
6. Explicit before/after approval model that never auto-pairs from filenames  

## Technical risks

| Risk | Mitigation |
|------|------------|
| JSON review state not durable on serverless multi-instance | Document local-first; durable multi-user stays on Supabase gallery (Phase 5–7) later |
| GPS EXIF detection is heuristic | Flag as `review-required`; never claim complete privacy AI |
| Operator mistakes marking publish | `canMarkPublished` hard-blocks unchecked/blocked/review-required |
| Confusing gallery review vs archive inventory | Separate nav item **Inventory**; gallery review unchanged |

## Recommended implementation path (executed)

1. **Hybrid storage:** generated JSON manifest + JSON review overlay for Phase 2A; keep Supabase for existing gallery/publishers.  
2. Add `lib/media-pipeline` types, scanner, privacy checklist, BA protocol, publish stubs.  
3. `pnpm media:inventory` → `data/media-manifest.json`.  
4. `/media/inventory` + detail review form.  
5. Docs + unit/e2e tests.  
6. Defer AI APIs, FS publish export, and cloud upload of archives.
