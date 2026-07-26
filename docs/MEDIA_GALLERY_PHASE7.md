# Phase 7 — Visual DAMS Gallery

## Overview

Phase 7 introduces the **Visual DAMS Gallery** — a full-featured Digital Asset Management System built on top of the Phase 5/6 Postgres + RLS infrastructure. It enables visual browsing, uploading, organizing, reviewing, and publishing of media assets within named workspaces.

## Architecture

```
lib/media-intelligence/gallery/
  types.ts          — Domain types (GalleryAsset, GalleryCollection, GalleryEvent, ...)
  rpc-catalog.ts    — Phase 7 SECURITY DEFINER RPC catalog
  runtime.ts        — Backend selector (postgres|memory)
  permissions.ts    — Actor permission helpers
  validation.ts     — Input validation (mime, size, names, ...)
  pg.ts             — Re-exports publishers/pg.ts patterns for gallery
  store.ts          — In-memory fixture (MEDIA_GALLERY_REPOSITORY=memory only)
  db-repository.ts  — PostgreSQL RPC calls + SELECT queries
  upload.ts         — Real upload: validate → sha256 → local vault → Supabase Storage → RPC register → thumbnails
  service.ts        — Business logic façade
  index.ts          — Barrel exports

app/media/
  gallery-actions.ts       — Server actions for gallery operations
  api/upload/route.ts      — POST multipart upload endpoint
  library/page.tsx         — Visual gallery with view modes (grid/compact/list)
  upload/page.tsx          — Drag-and-drop upload page
  assets/[id]/page.tsx     — Enhanced asset detail (preview, metadata editor, favorite, review)
  collections/page.tsx     — Collection list
  collections/[id]/page.tsx — Collection detail with assets
  review/page.tsx          — Review queue
  activity/page.tsx        — Activity log
  publishers/page.tsx      — Redirect to /media/publications

components/media-intelligence/
  VisualGalleryGrid.tsx    — Responsive grid/compact/list views with selection
  UploadDropzone.tsx       — Multi-file drag-drop upload with progress
  AssetPreviewPane.tsx     — Preview + metadata editor + review actions
  CollectionList.tsx       — Collection card grid
  FavoriteToggle.tsx       — Optimistic favorite toggle button
  BulkActionBar.tsx        — Sticky bottom bulk action toolbar
  GalleryFilters.tsx       — Server-rendered filter chips
```

## Database Schema (Phase 7 Migrations)

| Table | Purpose |
|-------|---------|
| `media_workspace_members` | Workspace membership; gated by `media_is_staff()` |
| `media_collections` | Named asset collections per workspace |
| `media_collection_assets` | Many-to-many collection↔asset membership |
| `media_favorites` | Per-user, per-workspace favorites |
| `media_gallery_events` | Append-only activity log |

Columns added to `media_assets`:
- `workspace_id` (default `bcs-default`)
- `display_title`, `description`, `location`, `creator_name`, `capture_date`, `customer_notes`
- `review_status` (none | pending | in_review | approved | rejected)

## Security

- All mutations go through **SECURITY DEFINER** RPCs; direct INSERT/UPDATE/DELETE are revoked from `authenticated`
- `gallery_mutation` mutation flag enforced by trigger `media_enforce_gallery_mutation`
- Signed URLs and `service_role` strings are banned from `media_gallery_events.metadata` via a CHECK constraint
- Privacy-blocked assets (`privacyStatus = 'flagged' | 'blocked'`) cannot prepare publications
- Viewer role has read-only access; no mutations permitted
- Service role is never exposed to the client

## Upload Flow

1. `POST /media/api/upload` (multipart/form-data)
2. Auth check via `resolveMediaTrustedActor()`; permission check via `actorCanUpload()`
3. MIME type validation (`image/*`, `video/mp4`, `video/quicktime`)
4. File size validation (max 500 MB)
5. SHA-256 computed over the raw bytes
6. File written to local vault at `MEDIA_VAULT_ROOT/gallery/originals/{checksum}{ext}` (write-once)
7. If Supabase Storage is configured, also uploaded to `gallery` bucket
8. `media_gallery_register_asset` RPC called (exact duplicate detection via checksum)
9. If image: sharp thumbnails (200px, 400px, 800px WebP) generated and registered via `media_gallery_register_derivative`
10. Response: `{ ok, assetId, checksum, duplicate? }`

Never fakes success. Upload is rejected at any failing step.

## Gallery Listing / Search

Server-side filters (all additive):
- `q` — full-text search (title, filename, description, location, keywords)
- `kind` — image | video
- `privacy` — clear | flagged | blocked | reviewed
- `reviewStatus` — none | pending | in_review | approved | rejected
- `onlyFavorites` — boolean
- `collectionId` — UUID
- `archived` — boolean (default false)
- `sort` — created_desc | created_asc | updated_desc | title_asc | size_desc | capture_date_desc
- `page`, `pageSize` (1–200, default 48)

## Environment Variables

| Variable | Description |
|----------|-------------|
| `MEDIA_GALLERY_REPOSITORY` | Set to `memory` for unit tests only |
| `MEDIA_VAULT_ROOT` | Root for local vault storage |
| `MEDIA_PUBLICATION_DATABASE_URL` / `SUPABASE_DB_URL` / `DATABASE_URL` | Postgres connection |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Required for Supabase Storage uploads (server-side only) |

## Testing

```bash
# Unit tests (memory backend)
pnpm test tests/unit/media-intelligence/phase7-gallery.test.ts

# Local PostgreSQL RLS/authority validation
pnpm test:supabase:phase7:local

# Hosted Supabase integration suite (requires credentials)
MEDIA_SUPABASE_PHASE7_LIVE=1 pnpm test:supabase:phase7

# Playwright e2e
pnpm test:e2e tests/e2e/media-phase7-gallery.spec.ts
```

## Design Principles

- **Navy/electric theme** — follows existing MediaShell colour palette; no purple/cream
- **Cards only for interactive gallery items** — non-interactive content uses plain lists/tables
- **No signed URLs persisted** — vault object keys only; signed URLs generated at request time
- **Service role server-only** — never reaches the browser
- **Training corpus postponed** — corpus export (Phase 8) not started
