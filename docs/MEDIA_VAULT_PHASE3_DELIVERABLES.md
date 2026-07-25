# Phase 3 Correction Deliverables — Atomic Vault

## Exact files changed (this correction)

- `lib/media-vault/preserve-original.ts` (new)
- `lib/media-vault/mime.ts` (content magic bytes)
- `lib/media-vault/manifest.ts` (new)
- `lib/media-vault/derivative-paths.ts` (new)
- `lib/media-vault/derivatives/images.ts`
- `lib/media-vault/derivatives/video.ts`
- `lib/media-vault/ingestion/pipeline.ts`
- `lib/media-vault/repositories/local-filesystem-repository.ts`
- `lib/media-vault/index.ts`
- `scripts/ingest-media-vault.ts`
- `docs/MEDIA_VAULT_PHASE3.md`
- `docs/MEDIA_VAULT_PHASE3_DELIVERABLES.md`
- `tests/unit/media-vault/vault-corrections.test.ts` (new)
- `tests/unit/media-vault/vault.test.ts` (status model)

## Atomic original-write strategy

`fs.copyFile(src, dest, fs.constants.COPYFILE_EXCL)` — filesystem-enforced
exclusive creation. No pre-check. On `EEXIST`, SHA-256 verify; mismatch →
`integrity_conflict` (never replace).

## Binary MIME detection

Magic-byte inspection of the first 64 bytes; extension must agree with detected
type. Spoofs / empties / truncations / mismatches rejected before preserve.

## Manifest locking + atomic replacement

Exclusive lock file (`wx`) → validate → merge by id → temp + fsync → rename →
unlock. Invalid existing JSON fails closed (no fixture substitution).

## Re-ingestion status model

`ingested | already_present | derivatives_repaired | rejected | integrity_conflict | failed`

## Confirmation

Under concurrent exclusive creators, exactly one process creates the original;
the other accepts checksum match. A destination with different bytes cannot be
overwritten.
