import { describe, expect, it } from 'vitest';
import {
  buildCatalogDashboardStats,
  generateFixtureCatalog,
  parseCatalogSearchParams,
  queryCatalogAssets,
  uniqueFacetValues,
} from '@/lib/media-library';

describe('media library catalog query', () => {
  const fixture = generateFixtureCatalog(240);
  const assets = fixture.catalog.assets;

  it('searches by manufacturer and repair under 100ms', () => {
    const sample = assets.find((a) => a.manufacturer && a.repairCategory)!;
    const result = queryCatalogAssets(assets, {
      q: `${sample.manufacturer} ${sample.repairCategory}`,
      pageSize: 48,
    });
    expect(result.durationMs).toBeLessThan(100);
    expect(result.total).toBeGreaterThan(0);
    expect(
      result.items.every((a) => {
        const blob = [
          a.filename,
          a.manufacturer,
          a.repairCategory,
          a.projectName,
        ]
          .join(' ')
          .toLowerCase();
        return (
          blob.includes(sample.manufacturer!.toLowerCase()) &&
          blob.includes(sample.repairCategory!.toLowerCase())
        );
      }),
    ).toBe(true);
  });

  it('filters images, hero candidates, and privacy warnings', () => {
    const heroes = queryCatalogAssets(assets, {
      mediaKind: 'image',
      heroCandidate: true,
      noPrivacyIssues: true,
    });
    expect(heroes.items.every((a) => a.isHeroCandidate)).toBe(true);
    expect(heroes.items.every((a) => a.privacyStatus === 'clear')).toBe(true);

    const privacy = queryCatalogAssets(assets, { privacyWarnings: true });
    expect(privacy.items.every((a) => a.privacyStatus !== 'clear')).toBe(true);
  });

  it('filters has EXIF / missing EXIF', () => {
    const withExif = queryCatalogAssets(assets, { hasExif: true });
    expect(withExif.items.every((a) => a.hasExif)).toBe(true);
    const missing = queryCatalogAssets(assets, { missingExif: true });
    expect(missing.items.every((a) => !a.hasExif)).toBe(true);
  });

  it('paginates results', () => {
    const page1 = queryCatalogAssets(assets, { page: 1, pageSize: 24 });
    const page2 = queryCatalogAssets(assets, { page: 2, pageSize: 24 });
    expect(page1.items).toHaveLength(24);
    expect(page2.items[0]?.id).not.toBe(page1.items[0]?.id);
    expect(page1.pageCount).toBeGreaterThan(1);
  });

  it('sorts hero rank preferring landscape + scores + clear privacy', () => {
    const ranked = queryCatalogAssets(assets, {
      mediaKind: 'image',
      sort: 'hero_rank',
      pageSize: 10,
    });
    expect(ranked.items.length).toBeGreaterThan(0);
    const first = ranked.items[0]!;
    expect(first.scores.website).toBeGreaterThanOrEqual(50);
  });

  it('parses search params for filters', () => {
    const options = parseCatalogSearchParams({
      q: 'Yamaha',
      manufacturer: 'Yamaha',
      mediaKind: 'image',
      heroCandidate: 'true',
      websiteScoreMin: '75',
      page: '2',
    });
    expect(options.q).toBe('Yamaha');
    expect(options.manufacturer).toBe('Yamaha');
    expect(options.mediaKind).toBe('image');
    expect(options.heroCandidate).toBe(true);
    expect(options.websiteScoreMin).toBe(75);
    expect(options.page).toBe(2);
  });

  it('exposes facet values', () => {
    const manufacturers = uniqueFacetValues(assets, 'manufacturer');
    expect(manufacturers.length).toBeGreaterThan(1);
  });
});

describe('media library dashboard stats', () => {
  it('aggregates catalog totals', () => {
    const fixture = generateFixtureCatalog(120);
    const stats = buildCatalogDashboardStats({
      assets: fixture.catalog.assets,
      projects: fixture.projects.projects,
      duplicateGroups: fixture.duplicates.groups,
      isFixture: true,
      generatedAt: fixture.catalog.generatedAt,
      source: 'test',
    });
    expect(stats.totalImages + stats.totalVideos).toBe(120);
    expect(stats.totalProjects).toBeGreaterThan(0);
    expect(stats.exactDuplicateGroups).toBeGreaterThan(0);
    expect(stats.nearDuplicateGroups).toBeGreaterThan(0);
    expect(stats.recentlyIndexed.length).toBeGreaterThan(0);
    expect(stats.manufacturerDistribution.length).toBeGreaterThan(0);
  });
});

describe('large dataset performance', () => {
  it('searches 5000 assets under 100ms', () => {
    const large = generateFixtureCatalog(5000).catalog.assets;
    const samples = Array.from({ length: 5 }, () =>
      queryCatalogAssets(large, { q: 'gelcoat after', pageSize: 48 }),
    );
    const avg =
      samples.reduce((sum, s) => sum + s.durationMs, 0) / samples.length;
    expect(avg).toBeLessThan(100);
    expect(samples[0]!.total).toBeGreaterThan(0);
  });

  it('filters 5000 assets by score + manufacturer under 100ms', () => {
    const large = generateFixtureCatalog(5000).catalog.assets;
    const result = queryCatalogAssets(large, {
      manufacturer: 'Boston Whaler',
      websiteScoreMin: 70,
      mediaKind: 'image',
      sort: 'website_desc',
      pageSize: 48,
    });
    expect(result.durationMs).toBeLessThan(100);
  });
});
