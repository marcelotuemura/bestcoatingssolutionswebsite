# Phase 7 Deliverables — Training Corpus & Dataset Governance

## Summary

Phase 7 adds a governed training-corpus system on PostgreSQL/Supabase with
human review, immutable released versions, eligibility enforcement, dataset-split
leakage controls, and secret-free JSON manifests. No model training or external
AI publishing is performed.

## Migrations (new only)

1. `20260726010000_media_phase7_corpora_schema.sql`
2. `20260726010001_media_phase7_corpora_rls.sql`
3. `20260726010002_media_phase7_corpora_authority.sql`
4. `20260726010003_media_phase7_corpora_rpcs.sql`

Confirmation: no previously applied Phase 5/6 migration files were edited.

## Application surfaces

- `lib/media-intelligence/corpora/*` — types, permissions, PG repository, service
- `app/media/corpus-actions.ts` — server actions
- `app/media/corpora/**` — list, detail, version queue UI
- `components/media-intelligence/Corpus*.tsx`
- `pnpm test:supabase:phase7` — hosted validation
- `supabase/tests/phase7_corpora_rls_local.sql` — local DB assertions

## Out of scope (confirmed)

- Phase 8 not started
- No external training provider calls
- No automatic publishing of corpora
- No signed URL persistence
