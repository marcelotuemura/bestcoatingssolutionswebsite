# Media Import Workflow (Phase 2A)

## Folder contract

```text
data/pictures/<project-slug>/...originals...
public/images/<division>/<project-slug>/...web publishes (later)...
```

## Steps

1. **Upload originals** into `data/pictures/<project-slug>/`.
2. **Inventory:** `pnpm media:inventory` → `data/media-manifest.json` (generated, read-only).
3. **Open** authenticated `/media/inventory`.
4. **Quality / privacy / classify** — saved to Supabase `media_inventory_reviews`.
5. **Candidates:** `publishStatus = candidate` only when privacy is `clear`.
6. **Publish:** deferred (Phase C).

## Persistence reminder

| Artifact | Role |
|----------|------|
| `data/media-manifest.json` | Generated inventory |
| `data/media-review-state.json` | Local/test fixture only (`MEDIA_INVENTORY_REVIEW_REPOSITORY=file`) |
| `media_inventory_reviews` | Production review decisions |

## What not to do

- Do not treat review JSON as production storage on Vercel  
- Do not invent before/after pairs from filenames  
- Do not publish privacy-unchecked assets  
