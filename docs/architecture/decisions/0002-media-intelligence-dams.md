# ADR 0002 — Media Intelligence Platform (DAMS)

- **Status:** Accepted
- **Date:** 2026-07-24
- **Deciders:** Owner brief (Media Intelligence Platform / DAMS)

## Context

Best Coatings Solutions needs a permanent media brain: every completed repair
should become searchable, approvable knowledge for website, SEO, social, GBP,
insurance case studies, sales decks, training, and future AI estimate / damage
systems. A one-off folder of photos will not scale.

## Decision

1. Build a modular **Media Intelligence Platform (DAMS)** with immutable
   originals, approval-gated publishing, and pluggable analysis/storage.
2. Host foundation UI at internal `/media` (not locale marketing routes).
3. Keep analysis behind a `MediaAnalysisEngine` interface so heuristics can be
   replaced by vision providers without rewriting the library.
4. Keep storage behind adapters (local vault now → Supabase Storage later).
5. Never auto-publish; never mutate originals; append-only audit events.

## Consequences

- Marketing site remains public and SEO-first; DAMS is an internal system.
- Extractable later to `apps/media` in a monorepo without rewriting domain types.
- Go-live of the marketing site does not depend on DAMS completion.
- Ops Platform consumes DAMS via future API — not by embedding ops in `/media`.
