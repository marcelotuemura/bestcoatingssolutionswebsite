# Phase 5 — Supabase Auth, Postgres Metadata & Private Storage

Production-ready auth and persistence for the BCS Media Intelligence Platform.

**Hard rules**

1. Media buckets are **never** public.  
2. Service-role credentials never reach the browser.  
3. Temporary shared-secret gate remains until Supabase Auth acceptance tests pass.  
4. Local Media Vault remains the cold backup — migrations never delete originals.  
5. Never auto-publish, auto-approve AI, or auto-delete duplicates.  
6. Do not store absolute filesystem paths in PostgreSQL.  
7. Do not persist signed URLs.

## Architecture

```
┌──────────────┐     MEDIA_AUTH_PROVIDER      ┌─────────────────────┐
│ /media UI    │◄──── temporary | supabase ──►│ Session resolver    │
│ MediaRepository│                            │ + RBAC permissions  │
└──────┬───────┘                              └──────────┬──────────┘
       │                                                 │
       ▼                                                 ▼
┌──────────────────┐                          ┌─────────────────────┐
│ json / local-fs  │  cutover                 │ PostgreSQL + RLS    │
│ (dev / rollback) │ ───────────────────────► │ media_* tables      │
└──────────────────┘                          └──────────┬──────────┘
                                                         │
                                              ┌──────────▼──────────┐
                                              │ Private Storage     │
                                              │ media-originals …   │
                                              │ signed URL (60s)    │
                                              └─────────────────────┘
```

## Auth providers

| `MEDIA_AUTH_PROVIDER` | Behavior |
|-----------------------|----------|
| `temporary` (default) | Phase 1 shared-secret + HMAC cookie — **rollback path** |
| `supabase` | Email/password Supabase Auth + `media_user_roles` |

Cutover only after acceptance tests. Rollback: set `MEDIA_AUTH_PROVIDER=temporary`.

## Roles

`owner` · `administrator` · `editor` · `reviewer` · `viewer`

Permission matrix: `lib/media-intelligence/auth/roles.ts` and `/media/users` (owner-only).

## Database

Migrations in `supabase/migrations/`:

1. `20260724190000_media_phase5_schema.sql` — tables + helpers  
2. `20260724190001_media_phase5_rls.sql` — RLS policies  
3. `20260724190002_media_phase5_storage.sql` — private buckets  
4. `20260724190003_media_phase5_rbac_hardening.sql` — column-limited RPCs, final-owner protection  
5. `20260725193000_media_phase5_authz_denials.sql` — privilege revokes, denial triggers, final-owner count fix

AI history: `media_ai_analyses` with `is_current` (history retained).

## Storage buckets (all private)

| Bucket | Purpose |
|--------|---------|
| `media-originals` | Immutable originals |
| `media-thumbnails` | 200/400/800/1600 |
| `media-previews` | Large previews |
| `media-webp` / `media-avif` | Optimized copies |
| `media-video-posters` | Video posters |

Object keys: checksum-addressed / collision-safe relative paths only.

## Repositories

| Backend | Class |
|---------|-------|
| `postgres` | `PostgreSQLRepository` |
| `supabase` | `SupabaseStorageRepository` (metadata + signed objects) |
| `json` / `local-filesystem` | Existing (dev / cold backup) |

Analysis: `MEDIA_ANALYSIS_REPOSITORY=json|postgres`.

## Migration CLI

```bash
pnpm media:migrate:supabase                 # dry-run (default)
pnpm media:migrate:supabase --dry-run
pnpm media:migrate:supabase --execute --confirm-destination <project-ref>
pnpm media:migrate:supabase --execute --allow-fixtures --confirm-destination <ref>
# production additionally requires --confirm-production
```

## Phase 5 correction (RBAC hardening)

See [`MEDIA_SUPABASE_PHASE5_CORRECTION.md`](./MEDIA_SUPABASE_PHASE5_CORRECTION.md).

- Editors: **no** direct `UPDATE` on `media_assets` — RPC only  
- Reviewers: **no** `FOR ALL` on AI/duplicates — review RPCs only  
- Final owner preserved via RPCs + deferred triggers  
- Profile self-update: `display_name` only  
- Live suite: `pnpm test:supabase:phase5` (non-production only)

## Environment


See `.env.example`. Critical:

```
MEDIA_AUTH_PROVIDER=temporary|supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # server-only
MEDIA_REPOSITORY=json|postgres|supabase
MEDIA_ANALYSIS_REPOSITORY=json|postgres
MEDIA_SUPABASE_ENV=development|production
MEDIA_SUPABASE_PRODUCTION_REF=      # optional safety
```

## Rollback & cutover

1. Keep `MEDIA_AUTH_PROVIDER=temporary` until Auth e2e passes.  
2. Apply SQL migrations to a non-prod project.  
3. Dry-run migrate; verify checksums.  
4. Execute migrate with `--confirm-destination`.  
5. Switch `MEDIA_REPOSITORY=supabase` and `MEDIA_AUTH_PROVIDER=supabase` on preview.  
6. Production cutover only with `--confirm-production`.  
7. Local vault remains untouched cold backup.

## Audit

`lib/media-intelligence/audit/audit.ts` — login/logout/failures, roles, migration, upload, analysis, duplicates, approvals, storage failures, integrity conflicts. Never logs passwords, tokens, service keys, or signed URL queries.
