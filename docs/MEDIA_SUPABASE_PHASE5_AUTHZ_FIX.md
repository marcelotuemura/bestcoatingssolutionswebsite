# Phase 5 — Hosted authorization denial fix

## Root causes

| Failing test | Root cause |
|--------------|------------|
| `rls_viewer_cannot_update` | PostgREST returns success with 0 rows when RLS blocks UPDATE; also lacked table-privilege denial. Viewers must not hold INSERT/UPDATE/DELETE on `media_assets`. |
| `reviewer_cannot_delete_analyses` | Same PostgREST 0-row DELETE semantics; reviewers must not hold DELETE on `media_ai_analyses`. |
| `final_owner_cannot_self_revoke` | `media_revoke_role` counted total owners with `<= 1` before update, but leftover owners from prior runs made count `> 1`, allowing self-revoke. Count now uses **other** active owners after locking. |
| `profile_direct_update_denied` | No UPDATE policy was not enough for PostgREST error semantics; UPDATE privilege remained on `media_users`. |

## Fix migration

`supabase/migrations/20260725193000_media_phase5_authz_denials.sql`

- Revokes INSERT/UPDATE/DELETE on `media_assets` and `media_ai_analyses` from `authenticated`/`anon`
- Revokes UPDATE/DELETE on `media_users` from `authenticated`/`anon`
- Replaces broad FOR ALL write policies with admin/owner-only INSERT/UPDATE/DELETE policies
- Adds denial triggers (42501) with RPC session flags for approved SECURITY DEFINER paths
- Replaces `media_revoke_role` / `media_set_user_active_state` to require ≥1 **other** active owner

Prior migrations `20260724190000`–`003` are not edited.

## Apply to staging (`ybzeuxvzpbguszqxrtur`)

```bash
# Option A — Supabase SQL editor: paste/run the migration file

# Option B — DB URL (never commit):
MEDIA_SUPABASE_ENV=staging \
SUPABASE_DB_URL='postgresql://…' \
pnpm exec node --import ./scripts/register-ts-alias.mjs --experimental-strip-types \
  scripts/apply-supabase-sql-file.ts \
  supabase/migrations/20260725193000_media_phase5_authz_denials.sql
```

Then:

```bash
MEDIA_SUPABASE_PHASE5_LIVE=1 \
MEDIA_SUPABASE_ENV=staging \
NEXT_PUBLIC_SUPABASE_URL=https://ybzeuxvzpbguszqxrtur.supabase.co \
NEXT_PUBLIC_SUPABASE_ANON_KEY=… \
SUPABASE_SERVICE_ROLE_KEY=… \
pnpm test:supabase:phase5
```

Expected: `failed: 0`, including the four previously failing checks.
