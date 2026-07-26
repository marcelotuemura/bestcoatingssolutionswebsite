# Phase 7 — Visual DAMS Gallery Deliverables

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
| `service.ts` | ✅ | Full service façade with memory/postgres dispatch |
| `index.ts` | ✅ | Barrel exports |

### 2. Server Actions

| File | Status |
|------|--------|
| `app/media/gallery-actions.ts` | ✅ |

### 3. Upload API Route

| File | Status |
|------|--------|
| `app/media/api/upload/route.ts` | ✅ |

### 4. Routes & UI

| Route | Status | Notes |
|-------|--------|-------|
| `app/media/page.tsx` | ✅ | Gallery + Upload CTAs added |
| `app/media/library/page.tsx` | ✅ | View modes (grid/compact/list) |
| `app/media/upload/page.tsx` | ✅ | Drag-drop multi-upload |
| `app/media/assets/[id]/page.tsx` | ✅ | Enhanced with preview, metadata editor, favorite, review |
| `app/media/collections/page.tsx` | ✅ | Collection list |
| `app/media/collections/[id]/page.tsx` | ✅ | Collection detail with assets |
| `app/media/review/page.tsx` | ✅ | Review queue with status tabs |
| `app/media/activity/page.tsx` | ✅ | Activity log |
| `app/media/publishers/page.tsx` | ✅ | Redirect to /media/publications |
| `components/media-intelligence/MediaShell.tsx` | ✅ | Updated nav: Gallery, Upload, Collections, Review, Activity, Publishers |

### 5. Components

| Component | Status |
|-----------|--------|
| `VisualGalleryGrid.tsx` | ✅ |
| `UploadDropzone.tsx` | ✅ |
| `AssetPreviewPane.tsx` | ✅ |
| `CollectionList.tsx` | ✅ |
| `FavoriteToggle.tsx` | ✅ |
| `BulkActionBar.tsx` | ✅ |
| `GalleryFilters.tsx` | ✅ |

### 6. Bootstrap + Migration Wiring

| File | Status | Notes |
|------|--------|-------|
| `scripts/bootstrap-publication-pg.ts` | ✅ | Phase 7 migrations + grants added |
| `scripts/test-supabase-phase5-local-pg.ts` | ✅ | Phase 7 migrations + grants + test file added |

### 7. Test Scripts

| File | Status |
|------|--------|
| `scripts/test-supabase-phase7.ts` | ✅ |
| `package.json` — `test:supabase:phase7` | ✅ |
| `package.json` — `test:supabase:phase7:local` | ✅ |

### 8. Tests

| File | Status |
|------|--------|
| `tests/unit/media-intelligence/phase7-gallery.test.ts` | ✅ |
| `supabase/tests/phase7_gallery_rls_local.sql` | ✅ |
| `tests/e2e/media-phase7-gallery.spec.ts` | ✅ |

### 9. Documentation

| File | Status |
|------|--------|
| `docs/MEDIA_GALLERY_PHASE7.md` | ✅ |
| `docs/MEDIA_GALLERY_PHASE7_DELIVERABLES.md` | ✅ |
| `docs/MEDIA_INTELLIGENCE_PLATFORM.md` | ✅ — Phase 7 row updated |

## Security Assertions

- ✅ Default production path is PostgreSQL
- ✅ Signed URLs never persisted
- ✅ Service role never exposed to client
- ✅ Viewer cannot mutate (permissions.ts + service.ts + server actions)
- ✅ Privacy-blocked assets cannot prepare publication (`canPreparePublicationForAsset`)
- ✅ Memory fixture forbidden in production
- ✅ `gallery_mutation` flag enforced by trigger
- ✅ Signed URL ban in `media_gallery_events.metadata` via CHECK constraint

## Known Limitations / Postponed

- Training corpus export (Phase 8 scope — not started)
- Vault streaming preview (requires `/media/vault/[...key]` auth pass-through for gallery assets)
- Full-text search indexing (PostgreSQL tsvector — can be added as migration extension)
