# Media Privacy Review (Phase 2A)

## Principles

1. New inventory assets default to `privacyStatus = "unchecked"`.
2. Unchecked / blocked / review-required assets **cannot** be marked `published` or `queued`.
3. `privacyStatus = clear` requires completed manual checklist (`reviewedAt` set) and no checklist blockers.
4. Checklist is **manual**. GPS EXIF detection is advisory only.
5. Review decisions persist in **Supabase/Postgres**, not in committed JSON, in production.

## Checklist fields

- visible face, vessel registration, HIN, license plate
- customer document, invoice, address, GPS metadata, other private information
- `reviewedAt` / `reviewedBy` when the operator confirms review

## Authorization

- Read: media staff (`media_is_staff()` RLS)
- Insert/update: owner, administrator, editor, reviewer (maps to `review_privacy` / `edit_metadata`)
- Anonymous: denied (no RLS policies for `anon`)

## UI

`/media/inventory/[id]` — Privacy checklist + validated status selects.
