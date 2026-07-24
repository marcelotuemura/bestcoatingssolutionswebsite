import type { MediaAsset } from '@/lib/media-intelligence/schemas';

export interface MediaSearchQuery {
  readonly text?: string;
  readonly boat?: string;
  readonly repair?: string;
  readonly damage?: string;
  readonly manufacturer?: string;
  readonly dateFrom?: string;
  readonly dateTo?: string;
  readonly projectId?: string;
  readonly technician?: string;
  readonly status?: string;
  readonly tag?: string;
  readonly minOverallScore?: number;
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Faceted + lightweight natural-language search over the media library.
 * Examples: "white Sea Ray hull damage", "fiberglass repairs", "gelcoat 2025".
 */
export function searchMediaAssets(
  assets: readonly MediaAsset[],
  query: MediaSearchQuery,
): readonly MediaAsset[] {
  const text = query.text ? normalize(query.text) : '';
  const tokens = text.split(/\s+/).filter(Boolean);

  return assets.filter((asset) => {
    if (query.projectId && asset.projectId !== query.projectId) return false;
    if (query.technician && asset.technician !== query.technician) return false;
    if (query.status && asset.status !== query.status) return false;
    if (
      query.tag &&
      !asset.tags.map(normalize).includes(normalize(query.tag))
    ) {
      return false;
    }
    if (
      query.minOverallScore != null &&
      (asset.scores?.overall ?? 0) < query.minOverallScore
    ) {
      return false;
    }
    if (query.manufacturer) {
      const m = normalize(query.manufacturer);
      const hay = normalize(
        `${asset.manufacturer ?? ''} ${asset.boat?.manufacturer ?? ''}`,
      );
      if (!hay.includes(m)) return false;
    }
    if (query.boat) {
      const b = normalize(query.boat);
      const hay = normalize(
        `${asset.manufacturer ?? ''} ${asset.model ?? ''} ${asset.boat?.manufacturer ?? ''} ${asset.boat?.model ?? ''} ${asset.boat?.category ?? ''}`,
      );
      if (!hay.includes(b)) return false;
    }
    if (query.repair) {
      const r = normalize(query.repair);
      if (!asset.repairTypes.some((type) => normalize(type).includes(r))) {
        return false;
      }
    }
    if (query.damage) {
      const d = normalize(query.damage);
      if (!asset.damageTypes.some((type) => normalize(type).includes(d))) {
        return false;
      }
    }
    if (
      query.dateFrom &&
      (asset.capturedAt ?? asset.importedAt) < query.dateFrom
    ) {
      return false;
    }
    if (query.dateTo && (asset.capturedAt ?? asset.importedAt) > query.dateTo) {
      return false;
    }

    if (tokens.length === 0) return true;

    const corpus = normalize(
      [
        asset.originalFilename,
        asset.optimizedFilename ?? '',
        asset.manufacturer ?? '',
        asset.model ?? '',
        asset.boat?.manufacturer ?? '',
        asset.boat?.model ?? '',
        asset.boat?.category ?? '',
        asset.boat?.hullColor ?? '',
        asset.location ?? '',
        asset.technician ?? '',
        asset.notes ?? '',
        asset.imageType,
        asset.status,
        ...asset.tags,
        ...asset.keywords,
        ...asset.repairTypes,
        ...asset.damageTypes,
      ].join(' '),
    );

    return tokens.every((token) => corpus.includes(token));
  });
}

/** Parse a natural-language string into structured facets when possible. */
export function parseNaturalLanguageQuery(text: string): MediaSearchQuery {
  const normalized = normalize(text);
  let repair: string | undefined;
  let boat: string | undefined;
  let manufacturer: string | undefined;
  let damage: string | undefined;
  let dateFrom: string | undefined;
  let dateTo: string | undefined;

  if (normalized.includes('gelcoat')) repair = 'gelcoat';
  if (normalized.includes('fiberglass')) repair = 'fiberglass';
  if (normalized.includes('paint')) repair = 'painting';
  if (normalized.includes('center console')) boat = 'center_console';
  if (normalized.includes('sea ray')) manufacturer = 'Sea Ray';
  if (normalized.includes('boston whaler')) manufacturer = 'Boston Whaler';
  if (/\b(20\d{2})\b/.test(normalized)) {
    const year = normalized.match(/\b(20\d{2})\b/)?.[1];
    if (year) {
      dateFrom = `${year}-01-01`;
      dateTo = `${year}-12-31T23:59:59.999Z`;
    }
  }
  if (normalized.includes('hull')) damage = damage ?? 'gelcoat';

  return {
    text,
    repair,
    boat,
    manufacturer,
    damage,
    dateFrom,
    dateTo,
  };
}
