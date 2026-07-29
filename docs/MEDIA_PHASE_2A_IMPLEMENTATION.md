# Media Phase 2A — Implementation

## Goal

Safe, local-first media intake → inventory → privacy/quality review inside existing `/media`.

## Architecture decision

**Hybrid (JSON-first for Phase 2A):**

| Concern | Choice |
|---------|--------|
| Archive originals | `data/pictures/` (immutable) |
| Inventory | `data/media-manifest.json` (generated) |
| Operator review | `data/media-review-state.json` (overlay) |
| Auth / RBAC | Existing media session + permissions |
| Website publish | Deferred stubs in `publish-contracts.ts` |
| Supabase Storage upload of archive | **Not** in Phase 2A |

## Operator workflow

1. Upload originals into `data/pictures/<project-slug>/`
2. Run `pnpm media:inventory`
3. Open `/media/inventory` (authenticated)
4. Review quality flags (low-res, duplicates)
5. Complete privacy checklist
6. Classify stage / category / division
7. Approve or reject (`status`)
8. Mark publish **candidates** only when privacy is clear
9. Publish export happens in a later phase

## Key modules

- `lib/media-pipeline/` — types, scanner, privacy, BA protocol, publish contracts
- `scripts/media-inventory.ts` — CLI
- `app/media/inventory/` — UI
- `app/media/inventory-actions.ts` — review mutations

## Hard rules enforced

- Never modify / delete originals automatically
- Never invent before/after pairs from filenames
- Never publish when `privacyStatus` is `unchecked`, `review-required`, or `blocked`
- Never serve `data/pictures/` as public CDN assets

## Deferred (Phase 2B+)

- Paid external AI APIs
- Automatic face / OCR / HIN recognition claims
- Derivative generation + `public/images` export
- Regenerating `config/marine-photography.ts`
- Cloud migration of archive masters
