# Phase 2 — Interactive Media Library

Internal, authenticated, **read-only** Media Library that consumes indexing
engine output (`08_Reports`) as the source of truth.

## Architecture

```
08_Reports / data/media-catalog
        │
        ▼
lib/media-library/catalog-loader.ts   ← parse + cache (read-only)
        │
        ├── catalog-query.ts          ← search / filter / sort / paginate (<100ms)
        ├── catalog-stats.ts          ← dashboard aggregations
        └── fixture-catalog.ts        ← deterministic fallback when reports missing
        │
        ▼
components/media-library/*            ← cards, filters, gallery, stats, theme
        │
        ▼
app/media/**                          ← Dashboard, Gallery, Project, Details,
                                        Duplicates, Heroes, Reports
```

Auth remains Phase 1 session gate (`requireMediaPageAccess` on every page).

## Syncing real catalogs

```bash
cp "/Users/<you>/Desktop/Best Coatings Solutions Media/08_Reports/"*.json \
  ./data/media-catalog/
# or
export MEDIA_CATALOG_DIR="/absolute/path/to/08_Reports"
```

Regenerate fixtures: `node scripts/generate-media-catalog-fixtures.mjs`

## Explicit non-goals (this phase)

- Editing / renaming / moving / deleting media
- Uploading binaries
- Publishing
- AI vision providers
- Indexing engine changes

## Suggested Phase 3 improvements

1. Serve real thumbnails/derivatives from private vault (never originals publicly)
2. Virtualized infinite scroll backed by indexed search (SQLite / Postgres)
3. Keyboard-first lightbox with EXIF histogram + focus peaking cues
4. Owner-approved duplicate resolution workflow (still no auto-delete)
5. Wire Hero Center selections into portfolio draft queues (still approval-gated)
