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
                    │   exclusive create) │
                    │ derivatives/*       │
                    │ manifests/*         │
                    └─────────┬───────────┘
                              ▲
                    ┌─────────┴───────────┐
                    │ Ingestion Pipeline  │
                    │ content MIME · SHA  │
                    │ exclusive originals │
                    │ atomic manifests    │
                    └─────────────────────┘
```

## Atomic write-once originals

`preserveOriginalExclusive` uses `fs.copyFile(..., COPYFILE_EXCL)`:

1. Filesystem enforces exclusive creation (no exists-then-copy TOCTOU).
2. On `EEXIST`, re-hash the destination SHA-256.
3. Matching checksum → accept as already present.
4. Mismatch → `VaultIntegrityConflictError` (fail closed; never truncate/replace).
5. Successful creates receive best-effort `chmod 0o444`.

## Content-based MIME detection

`detectMediaFromFile` reads magic bytes (JPEG/PNG/WEBP/TIFF/BMP/HEIC/MP4/MOV).
Filename extensions are compared for consistency only — never trusted alone.
Spoofed, empty, truncated, unsupported, and mismatched files are rejected.

## Atomic manifest updates

`mergeVaultManifestAtomic`:

1. Acquire `manifests/ingestion.lock` via exclusive `wx` create.
2. Read + schema-validate the current `media_catalog.json` (invalid → fail closed).
3. Merge by stable asset id.
4. Schema-validate the merged catalog.
5. Write to `media_catalog.json.tmp.<pid>.<rand>` with `fsync`.
6. `rename` into place.
7. Release lock; clean abandoned temps older than 5 minutes.

## Re-ingestion status model

| Status | Meaning |
|--------|---------|
| `ingested` | New original exclusively created (+ derivatives) |
| `already_present` | Original exists (checksum match); true no-op when derivatives complete |
| `derivatives_repaired` | Original present; missing derivatives generated via `repairDerivatives` |
| `rejected` | Unsupported / spoofed / mismatched content |
| `integrity_conflict` | Destination exists with different bytes |
| `failed` | Unexpected I/O or processing error |

Default re-ingest is idempotent. Missing derivatives require
`repairDerivatives: true`. Overwriting existing derivatives requires
`forceRegenerateDerivatives: true`.

CLI env: `INGEST_REPAIR_DERIVATIVES`, `INGEST_FORCE_REGENERATE_DERIVATIVES`.

## Storage layout

See `data/media-vault/README.md`.

## Security

- Authenticated `/media` session required for `/media/vault/*`
- `Cache-Control: private, no-store` + `X-Robots-Tag: noindex` + `nosniff`
- Path traversal blocked (`assertInsideVault`)
- Absolute filesystem paths never returned to the client
- Originals never overwritten/deleted; no external upload; no auto-publish

## Migration plan → Supabase Storage

1. Keep `MediaRepository` as the only UI dependency.
2. Private Supabase buckets: `media-originals`, `media-derivatives`.
3. Implement `SupabaseStorageRepository` + `PostgreSQLRepository`.
4. Dual-run local ingest → upload → cut over `MEDIA_REPOSITORY`.
5. Retain local vault as cold backup; never delete originals during migration.
