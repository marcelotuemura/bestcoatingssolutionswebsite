# Media Import Workflow (Phase 2A)

## Folder contract

```text
data/pictures/<project-slug>/...originals...
public/images/<division>/<project-slug>/...web publishes (later)...
```

## Steps

1. **Upload originals** into `data/pictures/<project-slug>/` (keep masters).
2. **Inventory:** `pnpm media:inventory` → writes `data/media-manifest.json`.
3. **Open** authenticated `/media/inventory`.
4. **Quality:** inspect low-res / duplicate warnings (no auto-delete).
5. **Privacy:** complete checklist; clear or block.
6. **Classify:** stage, category, division, alt/caption notes.
7. **Approve** via `status` (`approved` / `rejected` / …).
8. **Candidates:** set `publishStatus = candidate` only when privacy is `clear`.
9. **Publish:** later phase (`publishAsset` currently deferred).

## Commands

```bash
pnpm media:inventory
```

## What not to do

- Do not edit files under `data/pictures/` in place for web optimization  
- Do not delete “duplicates” automatically  
- Do not invent before/after pairs from names like `before.jpg` / `after.jpg`  
- Do not commit huge binary transforms as part of inventory (inventory is JSON only)
