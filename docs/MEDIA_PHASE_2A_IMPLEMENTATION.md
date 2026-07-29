# Media Phase 2A — Implementation

## Goal

Safe, local-first media intake → inventory → privacy/quality review inside existing `/media`.

## Architecture decision

**Hybrid:**

| Concern | Choice |
|---------|--------|
| Archive originals | `data/pictures/` (immutable) |
| Inventory | `data/media-manifest.json` (generated, read-only) |
| Operator review | **Supabase/Postgres** `media_inventory_reviews` |
| Local JSON review file | **Not production** — `MEDIA_INVENTORY_REVIEW_REPOSITORY=file` only |
| Auth / RBAC | Existing media session + RLS + app permissions |
| Website publish | Deferred stubs |

## Persistence

### Manifest (read-only generated)

```bash
pnpm media:inventory
```

Writes `data/media-manifest.json` with checksums, dimensions, EXIF/GPS flags, paths.
Never stores human decisions.

### Reviews (durable)

Table: `public.media_inventory_reviews`  
Migration: `supabase/migrations/20260729030000_media_phase2a_inventory_reviews.sql`

Repository selection (`MEDIA_INVENTORY_REVIEW_REPOSITORY`):

| Value | When |
|-------|------|
| `supabase` / `postgres` / default with DB URL | Production / e2e with Postgres |
| `memory` | Unit tests (`tests/setup.ts`) |
| `file` | Explicit local-only; **throws in production/staging** |

App auth still required: `review_privacy` or `edit_metadata`.

### Rollback

```sql
drop trigger if exists media_inventory_reviews_set_updated_at on public.media_inventory_reviews;
drop function if exists public.media_inventory_reviews_touch_updated_at();
drop policy if exists media_inventory_reviews_update_reviewers on public.media_inventory_reviews;
drop policy if exists media_inventory_reviews_insert_reviewers on public.media_inventory_reviews;
drop policy if exists media_inventory_reviews_select_staff on public.media_inventory_reviews;
drop table if exists public.media_inventory_reviews;
```

## Operator workflow

1. Upload originals into `data/pictures/<project-slug>/`
2. Run `pnpm media:inventory`
3. Open `/media/inventory` (authenticated)
4. Review quality flags
5. Complete privacy checklist
6. Classify stage / category / division
7. Approve or reject
8. Mark publish **candidates** only when privacy is `clear` (requires `reviewedAt`)
9. Publish export remains deferred

## Hard rules

- Never modify / delete originals automatically
- Never invent before/after pairs from filenames
- Never publish when privacy is unchecked / review-required / blocked
- Never use `data/media-review-state.json` as production persistence
- Zod-validate all review FormData (no unchecked enum casts)

## Deferred (Phase 2B+)

Paid AI APIs, automatic face/OCR/HIN claims, derivative FS export, config regeneration, cloud archive migration.
