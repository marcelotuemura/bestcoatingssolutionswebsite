# Media Intelligence — Phase 7 Training Corpus & Dataset Governance

Governed selection, classification, review, versioning, and export of approved
media intelligence data for **future** machine-learning / AI evaluation.

## Hard rules

- Human-reviewed data only
- No model training in this phase
- No external training providers
- No media sent to external AI services
- No auto-add of unreviewed assets
- No signed URLs / secrets in manifests or events
- Released versions are immutable
- PostgreSQL is the production source of truth

## Tables

| Table | Purpose |
|-------|---------|
| `media_workspace_members` | Workspace membership for corpus RLS |
| `media_corpora` | Corpus metadata + lifecycle |
| `media_corpus_versions` | Versioned builds; released = immutable |
| `media_corpus_items` | Candidate/included items + snapshots |
| `media_corpus_item_labels` | `ai_suggested` vs `human_confirmed` |
| `media_corpus_reviews` | Reviewer decisions |
| `media_corpus_events` | Audit trail |
| `media_corpus_exports` | Manifest export records |

## Lifecycle

**Corpus:** `draft` → `under_review` → `approved` → `archived`

**Version:** `building` → `review_ready` → `approved` → `released` → `superseded`  
Also: `building|review_ready|approved` → `cancelled`

**Item:** `candidate` | `included` | `excluded` | `needs_review`

Transitions are enforced in PostgreSQL (`media_corpus_*_can_transition` + RPCs +
immutability triggers).

## Roles

| Role | Capabilities |
|------|--------------|
| Viewer | Read released/workspace corpora; no mutate |
| Reviewer | Confirm labels, review decisions, assign splits; cannot release |
| Editor | Create drafts/versions, add/remove candidates while building; cannot approve/release |
| Admin | Submit for review, approve when ready; cannot owner-release |
| Owner | Release, supersede, cancel, archive |

## Eligibility

Blocked from approved/released inclusion when:

- privacy blocked / unresolved privacy flags
- archived asset
- missing checksum / provenance
- unresolved exact duplicate (no group)
- missing human-confirmed labels
- near-duplicate without explicit acknowledgement

Exact duplicate groups cannot create multiple training examples in one version
and cannot span conflicting dataset splits.

## Runtime

- Default: PostgreSQL SECURITY DEFINER RPCs (`lib/media-intelligence/corpora/`)
- Memory fixture: `MEDIA_CORPUS_REPOSITORY=memory` (unit tests only)
- UI: `/media/corpora`, `/media/corpora/[id]`, `/media/corpora/[id]/versions/[versionId]`

## Tests

| Suite | Command |
|-------|---------|
| Unit | `pnpm test` |
| Local PG (Phase 5–7) | `pnpm test:supabase:phase7:local` |
| Hosted Phase 7 | `pnpm test:supabase:phase7` |
| Playwright | `pnpm test:e2e` (includes corpora smoke) |

Hosted suite requires `MEDIA_SUPABASE_PHASE7_LIVE=1` (or Phase 5 live) plus
non-production Supabase credentials. If live is requested and credentials are
missing/invalid, the suite **fails** (does not silent-pass). Without the live
flag, the suite exits SKIP with `liveIntegrationClaimed: false`.

## Migrations (additive)

- `20260726010000_media_phase7_corpora_schema.sql`
- `20260726010001_media_phase7_corpora_rls.sql`
- `20260726010002_media_phase7_corpora_authority.sql`
- `20260726010003_media_phase7_corpora_rpcs.sql`

No Phase 5/6 migration files were edited.
