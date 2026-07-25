# Phase 4 Deliverables — AI Vision & Intelligent Classification

PR: remains draft on `cursor/media-intelligence-dams-foundation-5ec4` (PR #23).  
Status: **awaiting review**. Do not merge until approved.

## 1. Vision architecture diagram

See [`MEDIA_VISION_PHASE4.md`](./MEDIA_VISION_PHASE4.md) — provider interface, overlay store, enrichment flows.

```
Deterministic catalog ──► VisionProvider ──► ai_analysis.json (overlay)
                              │
                     Mock (live) / OpenAI (stub)
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
         Detail panel   Project suggestions  NL search
```

## 2. AI metadata schema

Canonical Zod: `lib/media-intelligence/vision/schema.ts`

| Block | Fields |
|-------|--------|
| Provenance | `analysisVersion`, `analyzedAt`, `provider`, `providerModel`, `confidence` |
| Boat | manufacturer, model, hull/superstructure color, outboard brand/count, trailer, viewContext, environment |
| Services | ceramic_coating, wet_sanding, buffing, gelcoat_repair, fiberglass_repair, hull_painting, bottom_paint, oxidation_removal, detail_work, paint_correction |
| Stage | before \| during \| after \| … + confidence |
| Quality | sharpness, exposure, blur, noise, composition, orientationScore, duplicateConfidence, marketingSuitability, heroSuitability, overall + explanation[] |
| Privacy | findings[], requiresOwnerReview, neverAutoModifyOriginal, blockAutoPublish |

Deterministic `media_catalog.json` fields are **not** overwritten by analysis.

## 3. Test results

Run: `pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e tests/e2e/media-intelligence.spec.ts`

Primary suite: `tests/unit/media-intelligence/vision.test.ts`

Coverage:

- Provider abstraction (mock + openai stub)
- Quality metrics + explanations
- Privacy detection (faces, plates, registration)
- AI metadata merge (catalog + MediaAsset; no status change)
- Project enrichment suggestions (`autoApply: false`)
- Search enrichment (NL examples)
- Pipeline / atomic store / re-analyze skip
- Vision → MediaAnalysisEngine adapter
- Regression: never publish / never modify originals

## 4. Performance metrics

Measured locally with `VISION_PROVIDER=mock` on the fixture catalog (240 assets):

| Operation | Result |
|-----------|--------|
| Batch analyze 240 assets | **35ms** wall / `durationMs` (`pnpm media:analyze`) |
| Failed | 0 |
| Enriched catalog search | same in-memory class as Phase 2 (&lt;100ms target) |
| Store merge | lock + fsync + rename (crash-safe) |

Mock provider is intentionally fast for CI/demos. Live OpenAI latency will differ.

## 5. Example enriched project

Fixture overlay sample (`data/media-catalog/ai_analysis.json` after `pnpm media:analyze`):

```json
{
  "assetId": "asset_0001",
  "provider": "mock",
  "analysisVersion": "1.0.0",
  "confidence": 0.71,
  "boat": {
    "manufacturer": { "value": "Yamaha", "confidence": 0.78 }
  },
  "services": [
    { "category": "fiberglass_repair", "confidence": 0.7 },
    { "category": "detail_work", "confidence": 0.7 }
  ],
  "stage": { "stage": "detail", "confidence": 0.55 },
  "privacy": {
    "requiresOwnerReview": false,
    "neverAutoModifyOriginal": true,
    "blockAutoPublish": true
  }
}
```

Project panel suggests missing stages / cover / timeline — **suggestions only**.

## 6. Future provider integration plan

1. Implement live `OpenAIVisionProvider` against derivative bytes.  
2. Validate model output with `assetVisionAnalysisSchema`.  
3. Env: `VISION_PROVIDER=openai`, `OPENAI_API_KEY`, `OPENAI_VISION_MODEL`.  
4. Keep mock default for CI.  
5. Add cost/rate limits + confidence calibration.  
6. Still never touch originals or auto-publish.

## Files added / changed (Phase 4)

- `lib/media-intelligence/vision/**`
- `lib/media-library/ai-overlay.ts`
- `components/media-library/AiAnalysisPanel.tsx`
- `components/media-library/ProjectEnrichmentPanel.tsx`
- `app/media/catalog/[id]/page.tsx` (panel)
- `app/media/catalog/projects/[id]/page.tsx` (suggestions)
- `app/media/library/page.tsx` (enriched search)
- `scripts/analyze-media-vision.ts`
- `tests/unit/media-intelligence/vision.test.ts`
- `docs/MEDIA_VISION_PHASE4.md`, `docs/MEDIA_VISION_PHASE4_DELIVERABLES.md`
- `config/media-intelligence.ts` (vision config)
- `package.json` (`media:analyze`)
