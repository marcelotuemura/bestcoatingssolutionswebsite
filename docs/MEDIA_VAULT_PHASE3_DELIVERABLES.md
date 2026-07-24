# Phase 3 Deliverables — Media Vault & Storage Engine

Branch: `cursor/media-intelligence-dams-foundation-5ec4` · PR #23

## Architecture diagram

```
UI (Phase 2) ──► MediaRepository
                    ├─ JsonMediaRepository (default)
                    ├─ LocalFilesystemRepository
                    ├─ SupabaseStorageRepository (stub)
                    └─ PostgreSQLRepository (stub)
                              ▲
                     Ingestion Pipeline
                     (checksum / EXIF / thumbs / webp / avif / video)
                              │
                     Local Media Vault (write-once originals)
```

Full detail: `docs/MEDIA_VAULT_PHASE3.md`.

## Storage layout

`data/media-vault/{originals,derivatives/{thumbnails/200|400|800|1600,webp,avif,previews,posters},manifests,inbox,reports}`

## Performance metrics

| Operation | Result |
|-----------|--------|
| Thumbnail + WebP + AVIF + preview (2000×1200 JPEG) | ~0.8–0.9 s (CI) |
| Video poster + probe (1s 320×240 mp4) | included in vault suite (~0.3 s class) |
| Batch ingest 40 small JPEGs | passes per-image &lt; 1.5 s budget |
| Catalog list pressure (20× json assets) | &lt; 500 ms |
| Phase 2 search (5k assets) | still ~7–23 ms |

## Test results

| Suite | Result |
|-------|--------|
| typecheck | pass |
| lint | pass |
| Vitest | **110 passed** (includes 12 vault tests) |
| Playwright media | run after vault commit |

## Migration plan to Supabase Storage

Documented in `docs/MEDIA_VAULT_PHASE3.md`:

1. Keep UI on `MediaRepository` only  
2. Private buckets for originals + derivatives  
3. Implement Supabase + Postgres backends  
4. Dual-run then cut over `MEDIA_REPOSITORY`  
5. Retain local vault as cold backup; never delete originals  

## Security checklist

- [x] Never overwrite originals  
- [x] Never delete originals via vault APIs  
- [x] Never publish automatically  
- [x] Never upload externally  
- [x] Authenticated `/media/vault` only (`private, no-store`, `noindex`)  
