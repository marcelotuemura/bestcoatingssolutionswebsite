# Media Vault — Phase 3

Secure, immutable Media Vault with interchangeable `MediaRepository` backends.

## Architecture diagram

```
                 ┌─────────────────────────────┐
                 │  Interactive Media Library  │
                 │  (Phase 2 UI — unchanged)   │
                 └──────────────┬──────────────┘
                                │ depends on
                                ▼
                 ┌─────────────────────────────┐
                 │      MediaRepository        │
                 │   (interface only contract) │
                 └─┬──────────┬──────────┬─────┘
                   │          │          │
       ┌───────────▼──┐  ┌────▼─────┐  ┌▼────────────────┐
       │ JsonMedia    │  │ LocalFS  │  │ SupabaseStorage │
       │ Repository   │  │ Repo     │  │ Repository      │
       │ (catalog)    │  │ (vault)  │  │ (stub)          │
       └──────────────┘  └────┬─────┘  └─────────────────┘
                              │         ┌─────────────────┐
                              │         │ PostgreSQLRepo  │
                              │         │ (stub)          │
                              ▼         └─────────────────┘
                    ┌─────────────────────┐
                    │   Local Media Vault │
                    │ originals (RO after │
                    │   write-once copy)  │
                    │ derivatives/*       │
                    │ manifests/*         │
                    └─────────┬───────────┘
                              ▲
                    ┌─────────┴───────────┐
                    │ Ingestion Pipeline  │
                    │ SHA-256 · EXIF ·    │
                    │ thumbs · WebP/AVIF  │
                    │ video poster/probe  │
                    └─────────────────────┘
```

## Storage layout

See `data/media-vault/README.md`.

| Path | Purpose |
|------|---------|
| `originals/` | Write-once preserved binaries |
| `derivatives/thumbnails/{200,400,800,1600}/` | Aspect-preserving JPEGs |
| `derivatives/webp/` | Optimized WebP |
| `derivatives/avif/` | Optimized AVIF |
| `derivatives/previews/` | Large preview JPEGs |
| `derivatives/posters/` | Video posters |
| `manifests/` | Vault catalog + ingestion log |
| `inbox/` | Optional drop folder |

## Security

- Authenticated `/media` session required for `/media/vault/*`
- `Cache-Control: private, no-store` + `X-Robots-Tag: noindex`
- Path traversal blocked (`assertInsideVault`)
- Originals never overwritten; chmod best-effort read-only after copy
- No external upload / no auto-publish

## Backends

| `MEDIA_REPOSITORY` | Implementation |
|--------------------|----------------|
| `json` (default) | `JsonMediaRepository` — Phase 2 catalog |
| `local` / `local-filesystem` | `LocalFilesystemRepository` |
| `supabase` | Stub — throws until implemented |
| `postgres` | Stub — throws until implemented |

## Migration plan → Supabase Storage

1. Keep `MediaRepository` as the only UI dependency (already done).
2. Create private Supabase Storage buckets: `media-originals`, `media-derivatives` (no public policies).
3. Implement `SupabaseStorageRepository.resolvePrivateObject` via short-lived signed URLs streamed through `/media/vault` (do not expose signed URLs to the browser long-term if possible — proxy preferred).
4. Implement `PostgreSQLRepository` for catalog/projects/duplicates tables mirrored from manifests.
5. Dual-run: ingest locally → upload derivatives + metadata → cut over `MEDIA_REPOSITORY=supabase`.
6. Retain local vault as disaster-recovery cold copy; never delete originals during migration.
7. Replace temporary access-secret auth with Supabase Auth + RBAC before production cutover.

## Performance notes

Ingestion and derivative generation are CPU-bound (sharp + ffmpeg). Catalog reads remain in-memory / JSON and stay under the Phase 2 &lt;100ms search target. See deliverables for measured metrics.
