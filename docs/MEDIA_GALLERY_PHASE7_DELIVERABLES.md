# Phase 7 — Visual DAMS Gallery Deliverables

## Status

Implementation is on branch `cursor/phase-7-visual-dams-gallery-5ec4` (PR #28).

**Hosted Phase 7 is not complete** until `pnpm test:supabase:phase7` reports `failed: 0` against staging with credentials. Current hosted result: FAIL (credentials unavailable). Local Phase 5+6+7 Postgres RLS suite: PASS.

Training Corpus remains postponed to Phase 8. PR #27 was not merged; corpus migrations were not applied.

## Completed Deliverables

### 1. Gallery Module (`lib/media-intelligence/gallery/`)

| File | Status | Notes |
|------|--------|-------|
| `types.ts` | ✅ | GalleryAsset, GalleryCollection, GalleryEvent, GalleryFavorite, filter/sort types |
| `rpc-catalog.ts` | ✅ | 11 SECURITY DEFINER RPCs catalogued |
| `runtime.ts` | ✅ | postgres (default) / memory (tests) |
| `permissions.ts` | ✅ | Per-role edit/review/upload/viewer checks |
| `validation.ts` | ✅ | MIME, size, collection name, review decision, sanitize metadata |
| `pg.ts` | ✅ | Re-exports publishers/pg.ts pool/actor patterns |
| `store.ts` | ✅ | In-memory fixture (MEDIA_GALLERY_REPOSITORY=memory) |
| `db-repository.ts` | ✅ | Postgres RPCs + SELECT queries |
| `upload.ts` | ✅ | Real upload: validate → sha256 → local vault → Supabase Storage → RPC → thumbnails |
| `private-delivery.ts` | ✅ | Server-authorized local-vault / ephemeral signed URL resolution |
| `service.ts` | ✅ | Full service façade with memory/postgres dispatch |
| `index.ts` | ✅ | Barrel exports |

### 2. Server Actions / Upload API

| File | Status |
|------|--------|
| `app/media/gallery-actions.ts` | ✅ |
| `app/media/api/upload/route.ts` | ✅ |

### 3. Routes & UI

| Route | Status | Notes |
|-------|--------|-------|
| `/media` | ✅ | Gallery + Upload CTAs |
| `/media/library` | ✅ | Workspace gallery default; `source=catalog` for fixture browse |
| `/media/upload` | ✅ | Drag-drop multi-upload with progress/cancel/retry |
| `/media/assets/[id]` | ✅ | Preview, zoom/fit, metadata editor, favorite, publication draft |
| `/media/collections` | ✅ | Collection list |
| `/media/collections/[id]` | ✅ | Collection detail |
| `/media/review` | ✅ | Review queue |
| `/media/activity` | ✅ | Activity log |
| `/media/publishers` | ✅ | Redirect → `/media/publications` |
| `/media/corpora` | ❌ intentionally not implemented (Phase 8) |

### 4. Components

| Component | Status |
|-----------|--------|
| `VisualGalleryGrid.tsx` | ✅ real vault thumbnails, badges, selection, keyboard nav |
| `GalleryWorkspaceView.tsx` | ✅ selection + bulk actions |
| `UploadDropzone.tsx` | ✅ progress bars, cancel, retry |
| `AssetPreviewPane.tsx` | ✅ preview, zoom/fit, metadata, publication draft |
| `CollectionList.tsx` | ✅ |
| `FavoriteToggle.tsx` | ✅ |
| `BulkActionBar.tsx` | ✅ |
| `GalleryFilters.tsx` | ✅ URL-persisted filters |

### 5. Migrations (additive only; Phase 5/6 untouched)

| Migration | Purpose |
|-----------|---------|
| `20260726020000_media_phase7_gallery_schema.sql` | columns + collections/favorites/events |
| `20260726020001_media_phase7_gallery_rls.sql` | RLS + membership helper |
| `20260726020002_media_phase7_gallery_authority.sql` | mutation authority |
| `20260726020003_media_phase7_gallery_rpcs.sql` | SECURITY DEFINER RPCs |
| `20260726020004_media_phase7_gallery_corrections.sql` | reviewer `review_mutation` path |

### 6. Tests & reports

| Gate | Result |
|------|--------|
| `pnpm typecheck` | PASS |
| `pnpm lint` | PASS |
| `pnpm test` | PASS — 226 |
| `pnpm test:e2e` | PASS — 118 |
| `pnpm test:supabase:phase7:local` | PASS — failed: 0 |
| `pnpm test:supabase:phase5` (hosted) | FAIL — no staging credentials |
| `pnpm test:supabase:phase6` (hosted) | FAIL — no staging credentials |
| `pnpm test:supabase:phase7` (hosted) | FAIL — no staging credentials |

### 7. Screenshots

Captured under `/opt/cursor/artifacts/screenshots/`:

- `phase7-gallery-desktop.png`
- `phase7-gallery-mobile.png`
- `phase7-upload.png`
- `phase7-upload-progress.png`
- `phase7-asset-preview.png`

## Security Assertions

- ✅ Default production path is PostgreSQL
- ✅ Signed URLs never persisted; vault route proxies ephemeral signed URLs
- ✅ Service role never exposed to client
- ✅ Viewer cannot mutate (permissions + service + actions + RLS)
- ✅ Privacy-blocked assets cannot prepare publication
- ✅ Memory fixture forbidden in production
- ✅ Private storage buckets remain private
- ✅ No `/media/corpora` on this branch

## Known Limitations

- Hosted Supabase Phase 5/6/7 live suites not green in this environment (credentials / MCP auth unavailable).
- Catalog fixture assets still have no binaries; workspace uploads are the visual proof path.
- Training corpus export remains Phase 8 (PR #27 preserved for rebase/rename later).
- Full-text `tsvector` search indexing can be added as a later migration extension.
