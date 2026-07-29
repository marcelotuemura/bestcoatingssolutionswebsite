# Media Data Model (Phase 2A)

Canonical TypeScript/Zod model: `lib/media-pipeline/types.ts`.

## MediaAssetRecord (summary)

| Field | Notes |
|-------|--------|
| `id` | `pic_<sha256[0..16]>` |
| `projectSlug` | First folder under `data/pictures/` |
| `division` | `marine` \| `aviation` \| `commercial` \| `unknown` |
| `archivePath` | Repo-relative path to original |
| `publishedPath` | Null until a later publish phase |
| `checksum` | SHA-256 hex |
| `perceptualHash` | Always `null` in Phase 2A (placeholder) |
| `status` | Lifecycle (`imported` … `archived`) |
| `stage` | Process stage enum; default `unknown` |
| `privacyStatus` | Default **`unchecked`** |
| `qualityStatus` | Inventory may set `low-resolution` / `duplicate` |
| `publishStatus` | Default `not-published` |
| `privacyChecklist` | Manual flags |
| `flags` | Inventory signals (GPS, low-res, duplicate, unsupported) |

## Manifest

`data/media-manifest.json` — version `1`, deterministic asset order by `archivePath`.

## Review overlay

`data/media-review-state.json` — overrides + explicit `beforeAfterPairs` (empty by default).

## Before/after

`BeforeAfterPairRecord` requires all match criteria + privacy clear on both assets.  
`autoDetectBeforeAfterPairs()` always returns `[]`.
