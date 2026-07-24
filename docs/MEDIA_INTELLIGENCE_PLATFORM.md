# Media Intelligence Platform (DAMS)

Permanent **Digital Asset Management System** for Best Coatings Solutions.

This is **not** a one-time image analyzer. It is a growing company knowledge base:
every approved repair job feeds marketing, SEO, training, sales, insurance case
studies, and future AI estimate / damage recognition capabilities.

**Hard rules**

1. Never modify original files.  
2. Never delete originals automatically.  
3. Never publish automatically — owner approval required.  
4. Never overwrite immutable metadata history (append audit events).  
5. Generate optimized **copies** only (WebP / AVIF / thumbnails).  
6. Never expose originals on the public marketing site.  
7. Never invent real projects, testimonials, or published workmanship.  
8. Never treat `robots.txt`, feature flags, or obscurity as authorization.  
9. Never accept actor identity from the client.  
10. Never claim binary originals exist until the real vault phase ships.

## Access control (foundation — temporary)

`/media` is an **authenticated internal studio**.

| Control | Behavior |
|---------|----------|
| `MEDIA_INTELLIGENCE_ENABLED` | Availability only (default false). Not auth. |
| Preview / Production when enabled | Requires `MEDIA_INTELLIGENCE_ACCESS_SECRET` + `MEDIA_INTELLIGENCE_SESSION_SECRET` (min 16 chars). Fail closed if missing. |
| Login | `/media/login` — server-validated access secret, rate-limited |
| Session | HttpOnly, SameSite=Strict, Path=/media, HMAC-signed cookie (12h) |
| Actor | Server-derived `{ id, role: 'owner', source: 'temporary-media-session' }` |
| Local bypass | `MEDIA_INTELLIGENCE_LOCAL_BYPASS=true` **only** in development — never Preview/Production |
| Disable / rollback | Set `MEDIA_INTELLIGENCE_ENABLED=false` |
| Future | Replace with Supabase Auth + full RBAC |

**Threat model (foundation):** anonymous Preview/Production access, client-spoofed actors, hard-coded `ownerApproved: true`, and status-only publish authorization are explicitly defended against. Full auth providers, MFA, and RBAC remain deferred.

Also prefer **Vercel Deployment Protection** on Preview when available (defense in depth).

## Owner publication approval

Workflow status `approved` is **not** sufficient to publish.

Publishing requires a stored `MediaApproval` record:

- `assetId`, `target`, `approvedBy`, `approvedAt`, `approvalVersion`
- Created only by an authenticated owner session
- Privacy-blocked assets cannot receive publication approval
- Returning to pending/editing revokes stale publication approvals

## Import truthfulness (Phase 1)

The foundation UI is a **metadata-only simulation**:

- No original binaries are uploaded or stored
- UI states this explicitly
- Demo seeds are labeled non-client data
- Do not use confidential production photos until the real vault exists

Real vault (later): binary upload, checksum, immutable storage, derivatives, malware validation, EXIF policy, recovery.

| Surface | How DAMS helps |
|---------|----------------|
| Marketing website | Approved portfolio / before-after / service imagery |
| Google Business Profile | Approved posts + images |
| SEO / Blog | Titles, alt text, structured data, article drafts |
| Social | Captions, hashtags, carousel order (approval-gated) |
| Insurance case studies | Damage → repair narratives |
| Sales / customer decks | Export PDF / PPT / ZIP |
| Internal training | Tagged repair technique library |
| AI estimates / damage recognition | Labeled training corpus (future) |
| Operations Platform | Shared media API (future) |

## Modular architecture

```
Import Engine → Storage (originals immutable)
             → Analysis Engine (vision / heuristics)
             → Tagging / Boat / Damage / Repair
             → Project Detection (before → during → after)
             → Duplicate / QC / Privacy
             → Derivatives Pipeline (optimized copies only)
             → Media Library + Search
             → Approval Workflow
             → Publishers (website / social / GBP) — never auto
             → Case Study / SEO / Calendar generators
             → Analytics + Future API
```

| Module | Path |
|--------|------|
| Auth / session / guards | `lib/media-intelligence/auth/` |
| Domain types & Zod | `lib/media-intelligence/schemas.ts` |
| Workflow state machine | `lib/media-intelligence/workflow.ts` |
| Scoring | `lib/media-intelligence/scoring.ts` |
| Privacy suggestions | `lib/media-intelligence/privacy.ts` |
| Duplicate detection | `lib/media-intelligence/duplicates.ts` |
| NL + facet search | `lib/media-intelligence/search.ts` |
| Case study drafts | `lib/media-intelligence/case-study.ts` |
| SEO package drafts | `lib/media-intelligence/seo.ts` |
| Social drafts | `lib/media-intelligence/social.ts` |
| Analysis engine seam | `lib/media-intelligence/analysis/` |
| Storage seams | `lib/media-intelligence/storage/` |
| Repository | `lib/media-intelligence/repository.ts` |
| Config | `config/media-intelligence.ts` |
| Internal UI | `app/media/**`, `components/media-intelligence/**` |

## Asset lifecycle (approval-gated)

```
imported → analyzed → optimized → pending_approval
  → approved → scheduled → published_* 
  OR rejected / archived / hidden
```

Publication targets (`website`, `portfolio`, `service_page`, `blog`, `gallery`,
`social`, `google_business`) are **explicit owner actions**, never defaults.

## Import sources (planned adapters)

Folder · Drag & drop · Camera · iPhone · Android · SD card · External drive ·
Cloud · Future Google Drive / OneDrive / Dropbox.

Formats: JPG/JPEG/PNG/WEBP/HEIC/RAW/TIFF/BMP + MP4/MOV.

## Analysis (per image — never skip)

Scores (0–100): technical, marketing, SEO, commercial, visual impact,
professional, luxury, website suitability, advertising, social, overall.

Plus: boat identification, damage recognition, repair identification, tags,
privacy risks, QC rejection reasons, project grouping confidence.

**Current engine:** deterministic heuristic seam suitable for offline CI and
owner demos. Swap in a vision model provider behind
`MediaAnalysisEngine` without rewriting the library or workflow.

## Storage policy

| Layer | Behavior |
|-------|----------|
| Originals | Write-once; private; never served publicly |
| Derivatives | WebP/AVIF/thumb/retina/mobile/desktop copies |
| Metadata | Versioned; audit log for every state change |
| Future | Supabase Storage + PostgreSQL (seams ready) |

## Roles (future auth)

Administrator · Marketing · Sales · Technician · Viewer

Foundation UI is gated by `MEDIA_INTELLIGENCE_ENABLED=true` (404 when off in
production). Full RBAC arrives with Operations / Auth.

## Internal UI

Route prefix: **`/media`** (not under EN/ES marketing locales).

- Disallowed in `robots.txt`
- Excluded from sitemap
- Not linked from public nav
- Middleware allows `/media` without locale redirect

## Implementation phases

| Phase | Deliverable |
|-------|-------------|
| **1 — Foundation (this PR)** | Schemas, workflow, scoring, search, privacy, duplicates, analysis seam, in-memory repo + seed, dashboard / library / asset / import / projects / approvals / studio / calendar / analytics shells, tests |
| **2 — Real ingest** | Disk/cloud import adapters, original vault, derivative pipeline (sharp), HEIC/RAW handling |
| **3 — Vision providers** | Pluggable AI analysis; batch re-analyze; confidence calibration |
| **4 — Auth + Postgres** | Supabase/auth roles; durable library; audit trail |
| **5 — Publishers** | Website content bridge, social/GBP draft scheduling APIs |
| **6 — Training corpus** | Export labeled sets for estimate / damage AI |

## Relationship to go-live & ops

- **Website go-live** ([`docs/GO_LIVE.md`](./GO_LIVE.md)) remains owner-operated and is not blocked by DAMS.  
- **Operations Platform** ([`FUTURE.md`](../FUTURE.md)) remains a separate product; DAMS exposes a future API rather than merging ops UI into marketing pages.  
- DAMS may live in this repo during foundation, then extract to `apps/media` per [`FUTURE_PLATFORM.md`](../FUTURE_PLATFORM.md).

## Stopping rules

- Do not auto-publish to the marketing site.  
- Do not treat seed/demo assets as real BCS jobs.  
- Do not store PII in public derivatives.  
- Do not delete originals without explicit owner confirmation UI.
