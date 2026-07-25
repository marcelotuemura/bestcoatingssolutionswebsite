# DAMS Phase 6 — Publishers (implementation plan)

Branch: `cursor/phase-6-dams-publishers-5ec4` from `main@56f22da`.

## Scope

Approval-gated publication jobs for **website**, **social**, and **google_business**.
Draft/schedule only when providers are unconfigured — never claim external delivery.

## Migrations (new only)

1. `20260725210000_media_phase6_publications_schema.sql` — jobs, drafts, events  
2. `20260725210001_media_phase6_publications_rls.sql` — RLS + owner/admin/editor policies  

Do not edit `20260724190000`–`20260725193000`.

## Domain

- Shared publisher contract + adapters (`website`, `social`, `google-business`)
- State machine: draft → awaiting_approval → approved → scheduled → publishing → published|failed|cancelled
- `provider_delivery_status`: `not_configured` | `draft_ready` | `queued` | `delivered` | `failed`
- Exact `MediaApproval` match + privacy block + derivative eligibility
- Idempotency keys

## Surfaces

- Server actions for draft/approve/schedule/cancel/execute/list
- `/media/publications` queue + detail UI
- In-memory job store for temporary-auth path; Postgres tables for Supabase cutover

## Tests

Unit + local SQL RLS + Playwright + Phase 5 regression gates.
