# Local Media Vault

Private, write-once media storage for Best Coatings Solutions DAMS.

```
data/media-vault/
  originals/                 # immutable copies (never overwrite/delete via APIs)
  derivatives/
    thumbnails/{200,400,800,1600}/
    webp/
    avif/
    previews/
    posters/
  manifests/
    media_catalog.json
    ingestion_log.jsonl
  inbox/                     # drop new files here for ingestion
  reports/                   # optional 08_Reports sync
```

## Configure

```bash
export MEDIA_REPOSITORY=local-filesystem
export MEDIA_VAULT_ROOT=./data/media-vault
```

Default UI backend remains `json` (Phase 2 catalog). Switch to `local-filesystem`
after ingestion to resolve private derivatives.

## Ingest

```bash
pnpm media:ingest -- ./data/media-vault/inbox
# or
node --experimental-strip-types scripts/ingest-media-vault.ts /path/to/01_Originals
```

Hard rules: never overwrite originals · never delete originals · never publish ·
never upload externally · authenticated `/media/vault/*` only.
