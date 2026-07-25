# Phase 5 Correction Deliverables — PR #24

Status: **draft / not approved**. Temporary auth rollback retained. Phase 6 not started. Not targeting production.

## 1. Exact files changed (correction)

| Path | Change |
|------|--------|
| `supabase/migrations/20260724190000_media_phase5_schema.sql` | SECURITY DEFINER helpers hardened |
| `supabase/migrations/20260724190001_media_phase5_rls.sql` | Removed editor direct UPDATE; removed reviewer FOR ALL; removed broad self-update; role DML RPC-only |
| `supabase/migrations/20260724190003_media_phase5_rbac_hardening.sql` | **New** — RPCs, final-owner triggers, review table, grants |
| `lib/media-intelligence/supabase/rpcs.ts` | **New** — typed RPC wrappers + catalogs |
| `lib/media-intelligence/index.ts` | Export RPC catalog |
| `scripts/test-supabase-phase5.ts` | Live non-prod suite (refuses production) |
| `scripts/test-supabase-phase5-local-pg.ts` | Local Postgres RBAC suite |
| `supabase/tests/phase5_rbac_local.sql` | SQL assertions by role |
| `tests/unit/media-intelligence/phase5-rbac-hardening.test.ts` | Contract tests |
| `package.json` | `test:supabase:phase5`, `test:supabase:phase5:local` |
| `docs/MEDIA_SUPABASE_PHASE5.md` | Correction notes |
| `docs/MEDIA_SUPABASE_PHASE5_CORRECTION.md` | Correction summary |
| `.env.example` | `MEDIA_SUPABASE_PHASE5_LIVE` |

## 2. Updated role-permission matrix

| Capability | owner | administrator | editor | reviewer | viewer |
|------------|:-----:|:-------------:|:------:|:--------:|:------:|
| Read staff DAMS tables | ✓ | ✓ | ✓ | ✓ | ✓ |
| Edit descriptive asset metadata (RPC) | ✓ | ✓ | ✓ | — | — |
| Direct UPDATE `media_assets` | ✓ | ✓ | **—** | — | — |
| Resolve privacy flag (RPC) | ✓ | ✓ | — | ✓ | — |
| AI suggestion decision (RPC) | ✓ | ✓ | — | ✓ | — |
| Duplicate decision (RPC) | ✓ | ✓ | — | ✓ | — |
| Create/delete AI analyses | ✓ | ✓ | — | **—** | — |
| Create/delete duplicate groups | ✓ | ✓ | — | **—** | — |
| Manage roles (RPC) | ✓ | **—** | — | — | — |
| Assign/revoke owner | ✓ | **—** | — | — | — |
| Deactivate/archive users (RPC) | ✓ | — | — | — | — |
| Self `display_name` (RPC) | ✓ | ✓ | ✓ | ✓ | ✓ |
| Self-update email / is_active | **—** | **—** | **—** | **—** | **—** |
| Storage originals write | ✓ | ✓ | — | — | — |
| Storage originals update/delete | — | — | — | — | — |

App matrix source: `lib/media-intelligence/auth/roles.ts`.

## 3. Direct table privileges by role (RLS)

Authenticated role has table DML grants; **RLS** is the gate. Effective mutations:

| Table | anon | viewer | editor | reviewer | admin | owner |
|-------|------|--------|--------|----------|-------|-------|
| `media_assets` | none | SELECT | SELECT (+ metadata RPC) | SELECT | ALL | ALL |
| `media_ai_analyses` | none | SELECT | SELECT | SELECT (+ review RPC) | ALL | ALL |
| `media_ai_detections` | none | SELECT | SELECT | SELECT | ALL | ALL |
| `media_duplicate_groups` | none | SELECT | SELECT | SELECT (+ decision RPC) | ALL | ALL |
| `media_privacy_flags` | none | SELECT | SELECT | SELECT (+ resolve RPC) | ALL | ALL |
| `media_users` | none | SELECT self | SELECT self | SELECT self | SELECT | SELECT/INSERT |
| `media_user_roles` | none | SELECT self | SELECT self | SELECT self | SELECT | SELECT (+ role RPCs) |
| `media_ai_suggestion_reviews` | none | SELECT | SELECT | SELECT (+ insert via RPC) | SELECT | SELECT |

No authenticated UPDATE policy on `media_users` or `media_user_roles`.

## 4. RPCs and accepted fields

See `PHASE5_RPC_CATALOG` in `lib/media-intelligence/supabase/rpcs.ts` and correction doc.

Actor identity always from `auth.uid()` — never caller-supplied.

## 5. Final-owner protection design

1. Role / active-state mutations only via `media_assign_role`, `media_revoke_role`, `media_set_user_active_state`.
2. Before owner revoke/deactivate: `media_count_active_owners_locked()` (`FOR UPDATE` on owner role rows).
3. Reject when active owner count ≤ 1.
4. Deferred constraint triggers on `media_user_roles` / `media_users` re-check at commit.
5. Audit `role_revoke_denied` / `user_deactivate_denied` with `final_owner` reason.

## 6. SECURITY DEFINER audit

| Function | search_path | PUBLIC revoke | Grant | Derives actor from auth.uid() |
|----------|-------------|---------------|-------|-------------------------------|
| `media_current_roles` | public | ✓ | authenticated | ✓ |
| `media_has_role` | public | ✓ | authenticated | via current roles |
| `media_is_staff` | public | ✓ | authenticated | via current roles |
| `media_require_auth` | public | ✓ | authenticated | ✓ rejects null |
| `media_active_owner_count` | public | ✓ | authenticated | n/a |
| `media_audit_write` | public | ✓ | authenticated | ✓ |
| `media_editor_update_asset_metadata` | public | ✓ | authenticated | ✓ |
| `media_review_*` | public | ✓ | authenticated | ✓ |
| `media_update_own_display_name` | public | ✓ | authenticated | ✓ |
| `media_assign_role` / `media_revoke_role` / `media_set_user_active_state` | public | ✓ | authenticated | ✓ |
| `media_protect_final_owner` | public | ✓ | (trigger) | n/a |
| `media_count_active_owners_locked` | public | ✓ | none (internal) | n/a |

## 7. Live Supabase project environment classification

| Item | Status |
|------|--------|
| Non-production project connected | **Not available in this agent environment** |
| Supabase MCP | `needsAuth` (interactive auth unavailable) |
| Env secrets `SUPABASE_*` | Absent |
| Classification | N/A — no project configured |
| Production refusal | Suite refuses `MEDIA_SUPABASE_ENV=production` and production project refs |

## 8. Migration application results

| Target | Result |
|--------|--------|
| Local Postgres (stub auth/storage) | All 4 migrations applied cleanly |
| Live non-prod Supabase | **Not run** — no project |

## 9. RLS test results by role

### Local Postgres (`pnpm test:supabase:phase5:local`)

| Check | Result |
|-------|--------|
| anon / unauth → 0 assets | PASS |
| viewer read, no mutate | PASS |
| editor RPC metadata; checksum protected | PASS |
| reviewer cannot delete analyses / create dup groups; review RPCs work | PASS |
| admin cannot assign owner | PASS |
| profile display_name only; direct is_active/email denied | PASS |
| final owner cannot self-revoke/archive; second owner can be revoked | PASS |

Report: `docs/MEDIA_SUPABASE_PHASE5_LOCAL_PG_REPORT.json`

### Live Supabase (`pnpm test:supabase:phase5`)

**Skipped** — `liveIntegrationClaimed: false`. See `docs/MEDIA_SUPABASE_PHASE5_LIVE_REPORT.json`.

## 10. Storage access test results

| Check | Local stub | Live |
|-------|------------|------|
| Buckets private (`public=false`) | Migration asserts on insert | Not run |
| Anon download fails | Policy present | Not run |
| Signed URL authorized | N/A locally | Not run |
| Originals no update/delete | Policy present | Not run |

## 11. Migration idempotency results

| Check | Result |
|-------|--------|
| Dry-run default | CLI remains dry-run by default |
| Live execute idempotency | Not run (no project) |
| Fixture→production guard | Unit/config guards present |
| Local migration re-apply | `IF NOT EXISTS` / `DROP POLICY IF EXISTS` safe |

## 12. Audit-log redaction verification

Unit test: `sanitizeAuditMetadata` redacts password, service_role, signed URL query material.

## 13. Retarget / rebase status against main

| Item | Status |
|------|--------|
| PR #23 (Phases 1–4 foundation) | Still **OPEN** on `main` |
| PR #24 base | `cursor/media-intelligence-dams-foundation-5ec4` (stacked) |
| Retarget to `main` | **Blocked** until #23 merges |
| Action taken | Left stacked; did not merge; remained draft |

## 14. Quality-gate results

Filled after CI/local gate run in the PR body for this revision.
