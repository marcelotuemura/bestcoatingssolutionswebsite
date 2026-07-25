# DAMS Phase 6 — Publishers

Approval-gated publication layer for website, social, and Google Business Profile
drafts/schedules. **Never auto-publishes. Never claims external delivery without
provider proof.**

## Architecture

```
UI /media/publications
  → server actions (RBAC)
  → publishers/service (state machine + approval + privacy)
  → adapters (website | social | google_business)
  → process-wide store + tmp persistence (temporary auth) / Postgres (Supabase)
  → audit events
```

## Schema

Migrations (new only):

- `20260725210000_media_phase6_publications_schema.sql`
- `20260725210001_media_phase6_publications_rls.sql`

Tables: `media_publication_jobs`, `media_publication_drafts`, `media_publication_events`.

## State machine

`draft` → `awaiting_approval` → `approved` → `scheduled` → `publishing` → `published` | `failed`  
Also: `draft` → `approved` (owner shortcut), `*` → `cancelled` where allowed.

`provider_delivery_status`: `not_configured` | `draft_ready` | `queued` | `delivered` | `failed`  
**`delivered` / job `published` only when a real provider acknowledges success.**

## Adapters

| Target | Behavior |
|--------|----------|
| website | Internal content bridge draft — not production deploy |
| social | Normalized social draft — provider not configured |
| google_business | GBP draft — provider not configured |

## Approval & privacy

- Exact `MediaApproval` for asset + target (+ version when set)
- Privacy-blocked assets cannot draft/approve/schedule/execute
- Original storage keys rejected as derivatives
- Signed URLs never persisted

## RBAC

| Action | viewer | reviewer | editor | admin | owner |
|--------|:------:|:--------:|:------:|:-----:|:-----:|
| Read queue | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create/update draft | — | — | ✓ | ✓ | ✓ |
| Approve publication | — | — | — | ✓ | ✓ |
| Schedule | — | — | — | ✓ | ✓ |
| Execute publish | — | — | — | — | ✓ |

## Rollback

Disable UI route usage; leave tables in place. Do not edit Phase 5 migrations.

## Local / hosted testing

- Unit: `pnpm test` (includes `phase6-publishers.test.ts`)
- Local Postgres RLS: `pnpm test:supabase:phase5:local` (Phase 5 + Phase 6 SQL)
- Playwright: `tests/e2e/media-phase6-publishers.spec.ts` with existing media suites
- Hosted provider delivery: not applicable until credentials + real adapters exist

## Known limitations

- No live Instagram/Facebook/GBP API credentials in this phase
- Temporary-auth job store uses process-wide + tmp persistence; Postgres tables ready for cutover
- Website bridge does not mutate marketing pages automatically
- Database RLS allows editor/admin draft row writes; **live publish authority remains owner-only in the app service layer** (`publish` permission)
