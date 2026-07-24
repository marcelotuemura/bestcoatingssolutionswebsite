# Phase 5 Deliverables — Supabase Auth, Postgres & Private Storage

PR: draft on `cursor/phase-5-supabase-auth-storage-5ec4`  
Status: **awaiting review**. Do not merge. Phase 6 not started. Local vault retained.

## 1. Architecture diagram

See [`MEDIA_SUPABASE_PHASE5.md`](./MEDIA_SUPABASE_PHASE5.md).

## 2. Database schema & migrations

| File | Purpose |
|------|---------|
| `supabase/migrations/20260724190000_media_phase5_schema.sql` | Tables, indexes, role helpers |
| `supabase/migrations/20260724190001_media_phase5_rls.sql` | RLS on every media_* table |
| `supabase/migrations/20260724190002_media_phase5_storage.sql` | Private buckets + storage policies |
| `supabase/tests/rls_smoke.sql` | Manual RLS smoke checks |

Tables: `media_users`, `media_user_roles`, `media_assets`, `media_asset_derivatives`, `media_projects`, `media_project_assets`, `media_ai_analyses`, `media_ai_detections`, `media_privacy_flags`, `media_duplicate_groups`, `media_duplicate_members`, `media_ingestion_runs`, `media_analysis_runs`, `media_audit_events`.

## 3. RLS policy documentation

- Anon: no policies → no rows  
- Staff read via `media_is_staff()`  
- Mutations gated by role (owner/admin/editor/reviewer as specified)  
- Only owners mutate `media_user_roles`  
- Originals bucket: no update/delete for authenticated users  

## 4. Role-permission matrix

Implemented in `lib/media-intelligence/auth/roles.ts` and rendered at `/media/users` (owner-only).

## 5. Storage bucket & object-key design

Buckets listed in Phase 5 doc. Keys via `lib/media-intelligence/storage/object-keys.ts` — no absolute paths, no traversal, MIME checks.

## 6. Repository implementation summary

- `PostgreSQLRepository` — full `MediaRepository` against Postgres  
- `SupabaseStorageRepository` — wraps Postgres + private signed objects  
- Vault route proxies signed URLs (client never stores them)  
- Analysis: `JsonAnalysisRepository` + `PostgresAnalysisRepository`

## 7. Migration dry-run report

```bash
pnpm media:migrate:supabase --dry-run
```

Prints destination project ref, counts, fixture warnings. Default dry-run; fixtures blocked unless `--allow-fixtures` (never to production).

## 8. Rollback & cutover plan

Documented in `MEDIA_SUPABASE_PHASE5.md`. Temporary auth remains default.

## 9. Audit logging design

`lib/media-intelligence/audit/audit.ts` + `media_audit_events` table.

## 10. Test results

| Gate | Result |
|------|--------|
| `pnpm typecheck` | (reported in PR) |
| `pnpm lint` | (reported in PR) |
| Vitest | Phase 5 suite + regression |
| Playwright | media + phase5 auth |

## 11. Security verification report

| Check | Status |
|-------|--------|
| No public media buckets | SQL sets `public=false` |
| No service-role in NEXT_PUBLIC_ | Config validator fails closed |
| No anonymous table access | RLS deny-by-default |
| No arbitrary object keys | `assertSafeObjectKey` |
| No persisted signed URLs | Ephemeral 60s; proxied by vault route |
| No fixture→production migrate | Plan + CLI guards |
| Temporary gate not removed | Default `MEDIA_AUTH_PROVIDER=temporary` |

## 12. Environment variables

See `.env.example` and Phase 5 doc.

## 13. Screenshots

Captured during verification (login temporary form; role matrix at `/media/users`). Paths referenced in the PR body / artifacts when available.
