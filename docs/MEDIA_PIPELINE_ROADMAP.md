# BCS Media Pipeline Roadmap

**Status:** Planned — start **after** marketing-site photography launch (PR #49 / Formula → Marine) is on production.

**Principle:** Extend the existing Media Intelligence / DAMS foundation (`/media`, media vault, vision, publishers, gallery). Do **not** build a separate parallel tool.

Related:

- [`MEDIA_INTELLIGENCE_PLATFORM.md`](./MEDIA_INTELLIGENCE_PLATFORM.md)
- [`PHOTOGRAPHY_GUIDE.md`](../PHOTOGRAPHY_GUIDE.md) — archive vs publish layout
- [`MEDIA_VAULT_PHASE3.md`](./MEDIA_VAULT_PHASE3.md)
- [`MEDIA_VISION_PHASE4.md`](./MEDIA_VISION_PHASE4.md)
- [`MEDIA_GALLERY_PHASE7.md`](./MEDIA_GALLERY_PHASE7.md)

## Permanent folder contract

```text
Original Photos (archive)
data/
└── pictures/
    ├── formula/
    ├── axopar/
    ├── chris-craft/
    └── …

Website Assets (publish)
public/
└── images/
    ├── marine/
    ├── aviation/
    └── …
```

Hard rules (unchanged from DAMS):

1. Never modify or auto-delete originals.  
2. Never auto-publish to the marketing site.  
3. Publish only optimized copies (WebP / AVIF / thumbs).  
4. Owner approval required before public use.  
5. No invented before/after pairs or project claims.

---

## Pipeline phases (post go-live)

### Phase A — Import

Builds on vault ingestion + gallery upload.

- Drag-and-drop and mobile/iPhone-friendly import into `/media`
- Automatic project folder creation under `data/pictures/<slug>/` (or vault originals path with mirrored archive)
- Preserve full-resolution masters
- SHA-256 identity, EXIF probe, duplicate fingerprint on ingest

**Exit criteria:** Owner can import a job album once; originals remain intact and discoverable by project.

### Phase B — AI processing

Builds on Phase 4 vision providers + privacy scoring.

- Duplicate and near-duplicate clustering
- Blur / quality rejection suggestions
- Privacy flags: faces, HINs, registration numbers, license plates
- Repair-type categorization (gelcoat, fiberglass, paint, polishing, detailing, masking, gloss result, …)
- Descriptive alt text + SEO-safe filename suggestions
- Still **never** auto-approve or auto-publish

**Exit criteria:** Review queue shows suggested labels, privacy blocks, and alt text for owner confirmation.

### Phase C — Web publishing

Builds on Phase 6 publishers + Phase 7 gallery.

- Generate hero, gallery, and thumbnail derivatives
- Export optimized WebP and AVIF into `public/images/<division>/`
- Update typed gallery metadata (`config/marine-photography.ts` or successor content bridge)
- One-click “publish approved selection” after owner approval record

**Exit criteria:** Approved Formula-style albums can update `/marine` (or aviation) without hand-editing image lists.

### Phase D — Operations integration

Builds toward Operations Platform APIs — not marketing-site scope creep.

- Link assets to customer jobs / estimates / invoices
- Structured before/after galleries when paired shots are confirmed
- Case-study and marketing draft generation from completed projects
- Shared media API for the future ops product

**Exit criteria:** A completed job can flow archive → privacy review → approved website publish → optional case-study draft without re-uploading.

---

## Sequencing vs current DAMS phases

| Existing DAMS | Pipeline use |
|---------------|--------------|
| 1–2 Library UI | Review / browse surface |
| 3 Vault | Originals + derivatives |
| 4 Vision | Phase B AI processing |
| 5 Auth / Postgres | Multi-user review |
| 6 Publishers | Phase C website bridge |
| 7 Visual Gallery | Import + organize UX |
| 8 Training corpus | Downstream of labeled Phase B data |
| **9 Media Pipeline (this doc)** | Glue: import → AI → publish → ops |

---

## Explicit non-goals (now)

- Auto-publishing to production without owner approval  
- Replacing `data/pictures/` archives with cloud-only storage without a backup policy  
- Building a second media product outside `/media`  
- Blocking website launch on pipeline completion  

## First implementation slice (when approved)

**Phase 2A (this repo):**

1. Archive inventory CLI: `pnpm media:inventory` → `data/media-manifest.json`
2. Privacy checklist + review overlay in `/media/inventory`
3. Publish/derivative **contracts** (deferred implementation)
4. Strict before/after approval model (no filename inference)

See [`MEDIA_PHASE_2A_IMPLEMENTATION.md`](./MEDIA_PHASE_2A_IMPLEMENTATION.md).

**Later slices:**

1. Export approved selections to `public/images/<division>/`
2. Regenerate `config/marine-photography.ts` (or JSON content bridge)
3. Optional Supabase sync for multi-user durable review of archive inventory
4. Phase B AI suggestions (never auto-approve)
