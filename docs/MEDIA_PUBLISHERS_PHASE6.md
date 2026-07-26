# DAMS Phase 6 — Publishers (corrected)

Approval-gated publication layer for website, social, and Google Business Profile
drafts/schedules. **Never auto-publishes. Never claims external delivery without
provider proof.**

## Architecture

```
UI /media/publications
  → server actions (RBAC)
  → publishers/service
      → PostgreSQL SECURITY DEFINER RPCs (default runtime)
      → adapters (website | social | google_business) for provider payload only
  → media_publication_jobs / drafts / events / approvals
  → media_publication_events (durable audit)
```

Process-local publication storage is **not** used at runtime. Unit tests may set
`MEDIA_PUBLICATION_REPOSITORY=memory` explicitly.

## Schema & migrations

| Migration | Purpose |
|-----------|---------|
| `20260725210000_media_phase6_publications_schema.sql` | jobs, drafts, events |
| `20260725210001_media_phase6_publications_rls.sql` | initial RLS (superseded for writes) |
| `20260725220000_media_phase6_publication_authority.sql` | approvals, revoke DML, denial triggers |
| `20260725220001_media_phase6_publication_rpcs.sql` | SECURITY DEFINER RPCs |

Phase 5 migrations `20260724190000`–`20260725193000` are **not edited**.

### Hosted apply status

As of this correction, Phase 6 migrations (including authority/RPCs) have been
verified on **local Postgres** only. They must be applied to staging
(`ybzeuxvzpbguszqxrtur`) before hosted Phase 6 can pass:

```bash
MEDIA_SUPABASE_ENV=staging SUPABASE_DB_URL='postgresql://…' \
  pnpm media:supabase:apply-sql supabase/migrations/20260725210000_media_phase6_publications_schema.sql
# …repeat for 210001, 220000, 220001
```

## RPC catalog

- `media_create_publication_draft`
- `media_update_publication_draft`
- `media_submit_publication`
- `media_approve_publication`
- `media_reject_publication_approval`
- `media_schedule_publication`
- `media_cancel_publication`
- `media_execute_publication`
- `media_record_publication_result`
- `media_retry_publication`

All use `auth.uid()`, fixed `search_path = public`, revoke PUBLIC, grant execute
to `authenticated` only. Actor IDs are never client-trusted.

## Grants / RLS

- Authenticated: **SELECT** on publication tables (staff RLS)
- Authenticated: **no** INSERT/UPDATE/DELETE on publication tables
- Mutations only via RPCs + `publication_mutation` session flag
- Denial triggers raise `42501` on direct DML

## State machine

`draft` → `awaiting_approval` → `approved` → `scheduled` → `publishing` → `published` | `failed`  
Also: `draft` → `approved` (approve RPC), `failed` → `publishing` (retry), cancellable where allowed.

`provider_delivery_status`: `not_configured` | `draft_ready` | `queued` | `delivered` | `failed`  
**`delivered` / job `published` only when `media_record_publication_result` is called with `externally_delivered=true`.**

## RBAC (DB-enforced)

| Action | viewer | reviewer | editor | admin | owner |
|--------|:------:|:--------:|:------:|:-----:|:-----:|
| Read | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create/update draft / submit | — | — | ✓ | ✓ | ✓ |
| Approve / reject / schedule | — | — | — | ✓ | ✓ |
| Cancel draft | — | — | ✓ | ✓ | ✓ |
| Cancel approved/scheduled | — | — | — | ✓ | ✓ |
| Execute / record result / retry | — | — | — | — | ✓ |

## Local / hosted testing

```bash
pnpm test:supabase:phase5:local   # Phase 5 + Phase 6 authority
pnpm test:supabase:phase6         # Hosted staging (requires secrets)
pnpm media:publication:bootstrap-pg
```

Playwright media suites bootstrap a local publication DB automatically.

## Known limitations

- No live Instagram/Facebook/GBP API credentials — draft adapters remain non-delivered
- Temporary auth maps actors into `media_users` via stable UUIDs for local PG RPC calls
- Hosted Phase 6 requires staging secrets + migration apply (see apply status above)
