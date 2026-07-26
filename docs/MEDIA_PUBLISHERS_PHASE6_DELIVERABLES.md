# Phase 6 Publishers — Acceptance report (authority correction)

Branch: `cursor/phase-6-dams-publishers-5ec4`  
Base: `main@56f22da`

## Blocker corrections

| Blocker | Root cause | Correction |
|---------|------------|------------|
| 1 DB authority | Broad editor/admin UPDATE policies; publish only in app layer | Restrictive grants + denial triggers + SECURITY DEFINER RPCs |
| 2 Process store | UI/actions used in-memory publication store | Default runtime is PostgreSQL RPCs (`db-repository.ts`); memory only via `MEDIA_PUBLICATION_REPOSITORY=memory` for unit tests |
| 3 Hosted validation | Marked N/A without provider creds | Added `pnpm test:supabase:phase6` (draft workflow; no external delivery). **Requires staging secrets + migration apply** |

## Migrations

- `20260725210000` / `20260725210001` (initial Phase 6) — **not rewritten**
- `20260725220000_media_phase6_publication_authority.sql` (**new corrective**)
- `20260725220001_media_phase6_publication_rpcs.sql` (**new corrective**)

Phase 5 migrations untouched. Hosted apply status: **not yet applied to staging** (local PG only).

## Quality gates

| Gate | Result |
|------|--------|
| `pnpm typecheck` | PASS |
| `pnpm lint` | PASS (0 errors) |
| `pnpm test` | **181 passed** |
| `pnpm test:supabase:phase5:local` | PASS (Phase 5 + Phase 6 authority) |
| Playwright media + phase5 + phase6 | **19 passed** (Postgres-backed publications) |
| `pnpm test:supabase:phase5` hosted | **Blocked** — staging secrets not available in this agent environment |
| `pnpm test:supabase:phase6` hosted | Suite corrected (no zero-arg RPC probes). Re-run required for `failed: 0`. |

## Confirmations

- Protected lifecycle fields cannot be directly mutated (privilege revoke + triggers)
- UI/actions use PostgreSQL RPCs when `MEDIA_PUBLICATION_DATABASE_URL` / `DATABASE_URL` / `SUPABASE_DB_URL` is set
- Event history from `media_publication_events`
- No false external delivery claims
- No secrets/signed URLs committed
- Phase 7 not started
