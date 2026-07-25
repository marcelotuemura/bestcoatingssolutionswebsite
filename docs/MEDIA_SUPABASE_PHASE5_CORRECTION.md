# Phase 5 Correction — Database-enforced RBAC

PR #24 remains **draft / not approved** until live non-production Supabase
validation passes.

## Fixes

| Blocker | Fix |
|---------|-----|
| Editor unrestricted UPDATE | Removed; `media_editor_update_asset_metadata` RPC only |
| Reviewer FOR ALL on AI/duplicates | Removed; narrow review RPCs only |
| Final owner unprotected | `media_revoke_role` / deactivate RPCs + deferred triggers |
| Broad self-update on `media_users` | Removed; `media_update_own_display_name` only |
| SECURITY DEFINER hygiene | `search_path=public`, revoke PUBLIC, grant authenticated |

Migration: `supabase/migrations/20260724190003_media_phase5_rbac_hardening.sql`  
(also hardens `20260724190000` / `001` for clean installs)

## RPCs

| RPC | Roles | Accepted fields |
|-----|-------|-----------------|
| `media_editor_update_asset_metadata` | editor, admin, owner | manufacturer, boat_name, boat_type, repair_category, stage, keywords, notes, project_name |
| `media_review_resolve_privacy_flag` | reviewer, admin, owner | flag_id, notes |
| `media_review_ai_suggestion` | reviewer, admin, owner | analysis_id, decision, notes |
| `media_review_duplicate_decision` | reviewer, admin, owner | group_external_id, decision, notes |
| `media_update_own_display_name` | self | display_name |
| `media_assign_role` / `media_revoke_role` | owner | user_id, role |
| `media_set_user_active_state` | owner | user_id, is_active, archive |

Actor identity always from `auth.uid()`.

## Final-owner design

1. Role mutations only via owner RPCs (no direct authenticated DML on `media_user_roles`).  
2. Before revoking/deactivating an owner, lock owner rows and require `active_owner_count > 1`.  
3. Deferred constraint triggers re-check at commit so concurrent removals cannot drop to zero.  
4. All attempts audited (`role_revoke_denied` / `user_deactivate_denied`).

## Validation

### Local Postgres RBAC (available without Supabase)

```bash
pnpm test:supabase:phase5:local
```

Applies all Phase 5 migrations to a throwaway local database with stub
`auth.uid()` / storage schemas. Writes
`docs/MEDIA_SUPABASE_PHASE5_LOCAL_PG_REPORT.json`.

This proves database-enforced RBAC SQL. It is **not** a live Supabase claim.

### Live non-production Supabase

```bash
MEDIA_SUPABASE_PHASE5_LIVE=1 \
MEDIA_SUPABASE_ENV=development \
NEXT_PUBLIC_SUPABASE_URL=... \
NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
SUPABASE_SERVICE_ROLE_KEY=... \
pnpm test:supabase:phase5
```

Refuses production. Writes `docs/MEDIA_SUPABASE_PHASE5_LIVE_REPORT.json`.

**Do not claim live success unless that command ran against a real non-prod project.**

Full correction deliverables:
[`MEDIA_SUPABASE_PHASE5_CORRECTION_DELIVERABLES.md`](./MEDIA_SUPABASE_PHASE5_CORRECTION_DELIVERABLES.md).