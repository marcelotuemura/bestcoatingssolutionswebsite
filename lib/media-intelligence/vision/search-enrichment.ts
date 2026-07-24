import {
  queryCatalogAssets,
  type CatalogFilters,
  type CatalogQueryOptions,
  type CatalogQueryResult,
} from '@/lib/media-library/catalog-query';
import type { CatalogAsset } from '@/lib/media-library/catalog-schema';
import type { AssetVisionAnalysis } from '@/lib/media-intelligence/vision/schema';
import { attachAiAnalysisBatch } from '@/lib/media-intelligence/vision/merge';

const STAGE_ALIASES: Record<string, string> = {
  before: 'before',
  after: 'after',
  during: 'during',
  progress: 'during',
  hero: 'hero',
  heroes: 'hero',
  best: 'hero',
};

const SERVICE_ALIASES: Record<string, string> = {
  ceramic: 'ceramic coating',
  coating: 'ceramic coating',
  polishing: 'paint correction',
  polish: 'paint correction',
  buffing: 'buffing',
  buff: 'buffing',
  oxidation: 'oxidation removal',
  gelcoat: 'gelcoat repair',
  fiberglass: 'fiberglass repair',
  detailing: 'detail work',
  detail: 'detail work',
};

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function tokenize(q: string): string[] {
  return normalize(q)
    .split(/[\s,/|]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

/**
 * Build a search corpus that keeps deterministic text separate from AI text,
 * then joins both for matching.
 */
export function buildEnrichedSearchCorpus(
  asset: CatalogAsset,
  ai?: AssetVisionAnalysis,
): {
  readonly deterministic: string;
  readonly ai: string;
  readonly joined: string;
} {
  const deterministic = [
    asset.filename,
    asset.originalFilename,
    asset.manufacturer,
    asset.boatName,
    asset.boatType,
    asset.repairCategory,
    asset.stage,
    asset.projectName,
    asset.folder,
    ...(asset.keywords ?? []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const aiText = ai
    ? [
        ai.boat.manufacturer?.value,
        ai.boat.model?.value,
        ai.boat.hullColor?.value,
        ai.boat.superstructureColor?.value,
        ai.boat.outboardBrand?.value,
        ai.boat.environment?.value,
        ai.boat.viewContext?.value,
        ai.stage.stage,
        ...ai.services.map((s) => s.category.replace(/_/g, ' ')),
        ...ai.keywords,
        ...ai.tags,
        ai.quality.heroSuitability >= 75 ? 'hero best' : '',
        ai.privacy.requiresOwnerReview ? 'privacy review' : '',
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
    : '';

  return {
    deterministic,
    ai: aiText,
    joined: `${deterministic} ${aiText}`.trim(),
  };
}

export type EnrichedSearchOptions = CatalogQueryOptions & {
  readonly aiByAssetId?: ReadonlyMap<string, AssetVisionAnalysis>;
  /** When true (default), NL query may match AI overlay keywords. */
  readonly includeAiText?: boolean;
};

/**
 * Parse natural-language catalog queries into filters + remaining text tokens.
 * Examples: "Blue Axopar ceramic coating", "Before oxidation repair", "Best hero images"
 */
export function parseEnrichedNaturalLanguageQuery(text: string): {
  readonly filters: CatalogFilters;
  readonly residualTokens: readonly string[];
  readonly preferHero: boolean;
} {
  const tokens = tokenize(text);
  const residual: string[] = [];
  let stage: CatalogFilters['stage'];
  let preferHero = false;
  const manufacturerParts: string[] = [];

  for (const token of tokens) {
    if (STAGE_ALIASES[token] === 'hero' || token === 'best') {
      preferHero = true;
      continue;
    }
    if (STAGE_ALIASES[token] && STAGE_ALIASES[token] !== 'hero') {
      stage = STAGE_ALIASES[token] as CatalogFilters['stage'];
      continue;
    }
    if (SERVICE_ALIASES[token]) {
      residual.push(...tokenize(SERVICE_ALIASES[token]));
      continue;
    }
    // Capitalized brand-like tokens stay as search text / manufacturer hint
    manufacturerParts.push(token);
    residual.push(token);
  }

  return {
    filters: {
      stage,
      heroCandidate: preferHero ? true : undefined,
    },
    residualTokens: residual,
    preferHero,
  };
}

/**
 * Catalog search enriched with AI overlay text.
 * Deterministic filters still apply to catalog fields; AI expands free-text match.
 */
export function searchCatalogWithAiEnrichment(
  assets: readonly CatalogAsset[],
  options: EnrichedSearchOptions = {},
): CatalogQueryResult & {
  readonly matchedViaAi: number;
} {
  const includeAi = options.includeAiText !== false;
  const aiById = options.aiByAssetId ?? new Map();
  const rawQ = options.q?.trim() ?? '';

  let baseFilters: CatalogQueryOptions = { ...options };
  let preferHero = false;

  if (rawQ) {
    const parsed = parseEnrichedNaturalLanguageQuery(rawQ);
    preferHero = parsed.preferHero;
    baseFilters = {
      ...options,
      stage: options.stage ?? parsed.filters.stage,
      heroCandidate: options.heroCandidate ?? parsed.filters.heroCandidate,
      // Keep full q for residual matching below when AI-enabled
      q: undefined,
      sort: preferHero ? 'hero_rank' : options.sort,
    };

    const residual = parsed.residualTokens;
    if (residual.length === 0 && !preferHero && !parsed.filters.stage) {
      baseFilters = { ...baseFilters, q: rawQ };
    } else if (!includeAi) {
      baseFilters = { ...baseFilters, q: residual.join(' ') || rawQ };
    } else {
      // Pre-filter with deterministic facets, then AI-aware text match
      const facetResult = queryCatalogAssets(assets, {
        ...baseFilters,
        q: undefined,
        page: 1,
        pageSize: assets.length || 1,
      });

      let matchedViaAi = 0;
      const textMatched = facetResult.items.filter((asset) => {
        if (residual.length === 0) return true;
        const corpus = buildEnrichedSearchCorpus(asset, aiById.get(asset.id));
        const ok = residual.every((token) => corpus.joined.includes(token));
        if (
          ok &&
          residual.some((token) => corpus.ai.includes(token)) &&
          !residual.every((token) => corpus.deterministic.includes(token))
        ) {
          matchedViaAi += 1;
        }
        return ok;
      });

      const sorted = preferHero
        ? queryCatalogAssets(textMatched, {
            sort: 'hero_rank',
            page: options.page,
            pageSize: options.pageSize,
          })
        : (() => {
            const pageSize = Math.min(Math.max(options.pageSize ?? 48, 1), 200);
            const page = Math.max(options.page ?? 1, 1);
            const total = textMatched.length;
            const pageCount = Math.max(1, Math.ceil(total / pageSize));
            const safePage = Math.min(page, pageCount);
            const start = (safePage - 1) * pageSize;
            return {
              items: textMatched.slice(start, start + pageSize),
              total,
              page: safePage,
              pageSize,
              pageCount,
              durationMs: facetResult.durationMs,
            };
          })();

      // Ensure AI overlay is attachable for callers
      void attachAiAnalysisBatch(sorted.items, aiById);

      return { ...sorted, matchedViaAi };
    }
  }

  const result = queryCatalogAssets(assets, baseFilters);
  return { ...result, matchedViaAi: 0 };
}
