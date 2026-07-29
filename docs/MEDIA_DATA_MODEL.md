# Media Data Model (Phase 2A)

Canonical TypeScript/Zod model: `lib/media-pipeline/types.ts`.

## Separation of concerns

| Layer | Storage | Contents |
|-------|---------|----------|
| Manifest | `data/media-manifest.json` | checksum, dimensions, archive path, captured date, EXIF/GPS flags, source album |
| Review overlay | Supabase `media_inventory_reviews` | classification, privacy, quality, caption, alt, approval, publish candidate |

Do **not** copy binary-derived manifest fields into the database.

## MediaAssetRecord (merged view)

Inventory fields come from the manifest; human fields overlay from the review repository.

## Review table (DB)

See migration `20260729030000_media_phase2a_inventory_reviews.sql`.

Primary key: `asset_id` (manifest id `pic_<sha256…>`).

## Before/after

`BeforeAfterPairRecord` requires explicit criteria.  
`autoDetectBeforeAfterPairs()` always returns `[]`.
