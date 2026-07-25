# Phase 4 — AI Vision & Intelligent Classification

Analysis-only enrichment for media already stored in the Media Vault / catalog.

**Hard rules (unchanged)**

1. Never modify originals.  
2. Never auto-publish.  
3. Never change workflow / approval status automatically.  
4. Never auto-blur or alter binaries for privacy.  
5. Keep AI metadata separate from deterministic catalog fields.

## Architecture

```
Catalog / Vault assets (deterministic)
        │
        ▼
 VisionProvider.analyze()   ◄── MockVisionProvider (default)
        │                   ◄── OpenAIVisionProvider (stub / future)
        ▼
 AssetVisionAnalysis (version, timestamp, confidence, provider, detections)
        │
        ▼
 ai_analysis.json overlay (atomic lock + temp + rename)
        │
        ├──► Catalog detail / project suggestion panels (read-only)
        ├──► Enriched NL search (joins AI text; does not overwrite catalog)
        └──► Optional MediaAnalysisEngine adapter (DAMS studio)
```

```
┌─────────────┐     ┌──────────────────┐     ┌────────────────────┐
│ CatalogAsset│────►│ VisionProvider   │────►│ AssetVisionAnalysis│
│ (immutable  │     │  .analyze()      │     │ boat/services/stage│
│  metadata)  │     └──────────────────┘     │ quality / privacy  │
└─────────────┘              ▲               └─────────┬──────────┘
                             │                         │
                    ┌────────┴────────┐                ▼
                    │ Mock (CI/dev)   │     ┌────────────────────┐
                    │ OpenAI (future) │     │ ai_analysis.json   │
                    └─────────────────┘     │ (separate store)   │
                                            └────────────────────┘
```

## VisionProvider

| Provider | Status |
|----------|--------|
| `MockVisionProvider` | Implemented — deterministic cues from filename + catalog hints |
| `OpenAIVisionProvider` | Interface / stub only — throws until configured |

Select with `VISION_PROVIDER=mock|openai` (default `mock`).

System code depends only on `VisionProvider` (`lib/media-intelligence/vision/provider.ts`).

## AI metadata schema

See Zod schemas in `lib/media-intelligence/vision/schema.ts`:

- `boat` — manufacturer, model (confidence), hull/superstructure color, outboard brand/count, trailer, interior/exterior, marina/shop
- `services` — ceramic coating, wet sanding, buffing, gelcoat/fiberglass repair, hull/bottom paint, oxidation removal, detail, paint correction
- `stage` — before / during / after / unknown (+confidence)
- `quality` — sharpness, exposure, blur, noise, composition, orientation, duplicate confidence, marketing/hero suitability, explainable overall
- `privacy` — faces, plates, registration, PII; `requiresOwnerReview`; **never** auto-modify original
- Provenance — `analysisVersion`, `analyzedAt`, `provider`, `confidence`

## Workflow

```bash
pnpm media:analyze
FORCE_REANALYZE=1 pnpm media:analyze
```

- Asynchronous batch analysis (`analyzeCatalogAssets`)
- Re-analysis permitted; originals untouched
- Existing overlays skipped unless `forceReanalyze`
- Store path: `MEDIA_CATALOG_DIR/ai_analysis.json` or `MEDIA_VAULT_ROOT/manifests/ai_analysis.json`

## Project enrichment

`suggestProjectEnrichment` returns **suggestions only**:

- Missing before/during/after sequence
- Related media by AI similarity
- Representative cover image
- Timeline ordering  

`autoApply: false` always.

## Search enrichment

`searchCatalogWithAiEnrichment` supports NL queries such as:

- "Blue Axopar ceramic coating"
- "Before oxidation repair"
- "Chris Craft polishing"
- "Best hero images"

Deterministic catalog text and AI overlay text are tracked separately, then joined for matching.

## UI surfacing (minimal)

| Surface | Change |
|---------|--------|
| `/media/catalog/[id]` | `AiAnalysisPanel` when overlay exists |
| `/media/catalog/projects/[id]` | `ProjectEnrichmentPanel` suggestions |
| `/media/library` | NL search may match AI keywords |

Phase 2 gallery card layout / vault architecture unchanged.

## Future OpenAI integration plan

1. Implement `OpenAIVisionProvider.analyze` with derivative (not original) image bytes.  
2. Map model JSON → `assetVisionAnalysisSchema` (fail closed on invalid).  
3. Set `VISION_PROVIDER=openai`, `OPENAI_API_KEY`, optional `OPENAI_VISION_MODEL`.  
4. Keep Mock as CI default.  
5. Add rate limits, cost metering, and confidence calibration.  
6. Still never write originals or auto-publish.

## Modules

| Path | Role |
|------|------|
| `lib/media-intelligence/vision/*` | Provider, schema, pipeline, store, enrichment |
| `lib/media-library/ai-overlay.ts` | Read overlay for UI |
| `scripts/analyze-media-vision.ts` | CLI batch runner |
| `components/media-library/AiAnalysisPanel.tsx` | Detail surfacing |
| `components/media-library/ProjectEnrichmentPanel.tsx` | Project suggestions |
