import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { CatalogAsset } from '@/lib/media-library/catalog-schema';
import { MockVisionProvider } from '@/lib/media-intelligence/vision/providers/mock';
import { OpenAIVisionProvider } from '@/lib/media-intelligence/vision/providers/openai';
import {
  createVisionProvider,
  __resetVisionProviderForTests,
} from '@/lib/media-intelligence/vision/factory';
import {
  attachAiAnalysis,
  mergeAiIntoMediaAssetFields,
  summarizeAiForDisplay,
} from '@/lib/media-intelligence/vision/merge';
import { detectVisionPrivacy } from '@/lib/media-intelligence/vision/privacy-detect';
import { computeVisionQuality } from '@/lib/media-intelligence/vision/quality';
import { suggestProjectEnrichment } from '@/lib/media-intelligence/vision/project-enrichment';
import {
  buildEnrichedSearchCorpus,
  parseEnrichedNaturalLanguageQuery,
  searchCatalogWithAiEnrichment,
} from '@/lib/media-intelligence/vision/search-enrichment';
import {
  analyzeCatalogAssets,
  analyzeSingleAsset,
} from '@/lib/media-intelligence/vision/pipeline';
import {
  mergeAiAnalysisStore,
  readAiAnalysisStore,
} from '@/lib/media-intelligence/vision/store';
import { VisionBackedAnalysisEngine } from '@/lib/media-intelligence/vision/adapter';
import {
  assetVisionAnalysisSchema,
  VISION_ANALYSIS_VERSION,
} from '@/lib/media-intelligence/vision/schema';
import type { MediaAsset } from '@/lib/media-intelligence/schemas';
import type { CatalogProject } from '@/lib/media-library/catalog-schema';

function stubAsset(
  partial: Partial<CatalogAsset> & { id: string; filename: string },
): CatalogAsset {
  return {
    id: partial.id,
    filename: partial.filename,
    originalFilename: partial.filename,
    fileType: 'image/jpeg',
    mediaKind: 'image',
    folder: partial.folder ?? '',
    stage: partial.stage ?? 'unknown',
    keywords: partial.keywords ?? [],
    hasExif: false,
    orientation: 'landscape',
    scores: partial.scores ?? { website: 70, marketing: 65, technical: 60 },
    privacyStatus: 'clear',
    privacyIssues: partial.privacyIssues ?? [],
    isHeroCandidate: partial.isHeroCandidate ?? false,
    isExactDuplicate: partial.isExactDuplicate ?? false,
    isNearDuplicate: false,
    manufacturer: partial.manufacturer,
    boatName: partial.boatName,
    boatType: partial.boatType,
    repairCategory: partial.repairCategory,
    projectId: partial.projectId,
    projectName: partial.projectName,
  };
}

describe('VisionProvider abstraction', () => {
  afterAll(() => {
    __resetVisionProviderForTests();
  });

  it('defaults to MockVisionProvider', () => {
    __resetVisionProviderForTests();
    const provider = createVisionProvider('mock');
    expect(provider.id).toBe('mock');
    expect(provider.displayName).toMatch(/Mock/i);
  });

  it('OpenAIVisionProvider is interface-only and fails closed', async () => {
    const provider = new OpenAIVisionProvider();
    expect(provider.id).toBe('openai');
    await expect(
      provider.analyze({
        assetId: 'x',
        filename: 'boat.jpg',
        mimeType: 'image/jpeg',
        mediaKind: 'image',
      }),
    ).rejects.toThrow(/not implemented/i);
  });

  it('MockVisionProvider returns schema-valid analysis', async () => {
    const provider = new MockVisionProvider();
    const result = await provider.analyze({
      assetId: 'a1',
      filename: 'blue_axopar_ceramic_coating_before.jpg',
      mimeType: 'image/jpeg',
      mediaKind: 'image',
      width: 2000,
      height: 1200,
      bytes: 800_000,
    });
    expect(assetVisionAnalysisSchema.safeParse(result).success).toBe(true);
    expect(result.analysisVersion).toBe(VISION_ANALYSIS_VERSION);
    expect(result.provider).toBe('mock');
    expect(result.boat.manufacturer?.value).toMatch(/Axopar/i);
    expect(result.boat.hullColor?.value).toMatch(/Blue/i);
    expect(result.stage.stage).toBe('before');
    expect(result.services.some((s) => s.category === 'ceramic_coating')).toBe(
      true,
    );
    expect(result.privacy.neverAutoModifyOriginal).toBe(true);
    expect(result.privacy.blockAutoPublish).toBe(true);
  });
});

describe('quality analysis', () => {
  it('produces explainable quality scores', () => {
    const quality = computeVisionQuality({
      assetId: 'q1',
      filename: 'hero_landscape.jpg',
      mimeType: 'image/jpeg',
      mediaKind: 'image',
      width: 4000,
      height: 2500,
      bytes: 3_000_000,
      deterministic: { isHeroCandidate: true },
    });
    expect(quality.overall).toBeGreaterThan(60);
    expect(quality.heroSuitability).toBeGreaterThan(50);
    expect(quality.explanation.length).toBeGreaterThan(0);
  });

  it('penalizes blur cues', () => {
    const quality = computeVisionQuality({
      assetId: 'q2',
      filename: 'blur_out_of_focus.jpg',
      mimeType: 'image/jpeg',
      mediaKind: 'image',
      bytes: 30_000,
    });
    expect(quality.blur).toBeGreaterThan(40);
    expect(quality.sharpness).toBeLessThan(70);
  });
});

describe('privacy detection', () => {
  it('flags faces and plates for owner review without modifying originals', () => {
    const privacy = detectVisionPrivacy({
      assetId: 'p1',
      filename: 'customer_face_and_license_plate.jpg',
      mimeType: 'image/jpeg',
      mediaKind: 'image',
    });
    expect(privacy.requiresOwnerReview).toBe(true);
    expect(privacy.neverAutoModifyOriginal).toBe(true);
    expect(privacy.findings.some((f) => f.risk === 'faces')).toBe(true);
    expect(privacy.findings.some((f) => f.risk === 'license_plates')).toBe(
      true,
    );
    expect(privacy.findings.every((f) => f.requiresOwnerReview)).toBe(true);
  });

  it('flags boat registration cues', () => {
    const privacy = detectVisionPrivacy({
      assetId: 'p2',
      filename: 'hull_registration_number_detail.jpg',
      mimeType: 'image/jpeg',
      mediaKind: 'image',
    });
    expect(
      privacy.findings.some((f) => f.risk === 'registration_numbers'),
    ).toBe(true);
  });
});

describe('AI metadata merge', () => {
  it('attaches AI overlay without mutating deterministic catalog fields', async () => {
    const asset = stubAsset({
      id: 'm1',
      filename: 'sea_ray.jpg',
      manufacturer: 'Deterministic Brand',
      stage: 'during',
    });
    const provider = new MockVisionProvider();
    const analysis = await provider.analyze({
      assetId: asset.id,
      filename: 'blue_axopar_after_ceramic.jpg',
      mimeType: 'image/jpeg',
      mediaKind: 'image',
    });
    const merged = attachAiAnalysis(asset, analysis);
    expect(merged.manufacturer).toBe('Deterministic Brand');
    expect(merged.stage).toBe('during');
    expect(merged.aiAnalysis?.boat.manufacturer?.value).toMatch(/Axopar/i);
    expect(merged.aiAnalysis?.stage.stage).toBe('after');
  });

  it('merges into MediaAsset without changing workflow status', async () => {
    const asset = {
      id: 'ma1',
      originalFilename: 'x.jpg',
      originalStorageKey: 'key',
      mimeType: 'image/jpeg',
      bytes: 1000,
      importedAt: new Date().toISOString(),
      status: 'pending_approval',
      websiteStatus: 'none',
      socialStatus: 'none',
      keywords: [],
      tags: [],
      repairTypes: [],
      damageTypes: [],
      imageType: 'unknown',
      privacyRisks: [],
      privacySuggestions: [],
      qcRejectReasons: [],
      derivatives: [],
      audit: [],
      isDemoSeed: false,
    } as MediaAsset;

    const analysis = await new MockVisionProvider().analyze({
      assetId: 'ma1',
      filename: 'chris_craft_polishing_after.jpg',
      mimeType: 'image/jpeg',
      mediaKind: 'image',
    });
    const merged = mergeAiIntoMediaAssetFields(asset, analysis);
    expect(merged.status).toBe('pending_approval');
    expect(merged.manufacturer).toMatch(/Chris Craft/i);
    const summary = summarizeAiForDisplay(analysis);
    expect(summary.services.length).toBeGreaterThan(0);
  });
});

describe('project enrichment suggestions', () => {
  it('suggests missing before/after and cover without auto-applying', () => {
    const project: CatalogProject = {
      id: 'proj1',
      name: 'Axopar detail',
      mediaCount: 2,
      imageCount: 2,
      videoCount: 0,
      beforeCount: 0,
      duringCount: 1,
      afterCount: 1,
      duplicateAlertCount: 0,
      privacyAlertCount: 0,
      assetIds: ['a', 'b'],
    };
    const assets = [
      stubAsset({
        id: 'a',
        filename: 'during.jpg',
        stage: 'during',
        projectId: 'proj1',
      }),
      stubAsset({
        id: 'b',
        filename: 'after_hero.jpg',
        stage: 'after',
        projectId: 'proj1',
        isHeroCandidate: true,
        scores: { website: 90, marketing: 88, technical: 80 },
      }),
      stubAsset({
        id: 'c',
        filename: 'related_axopar.jpg',
        manufacturer: 'Axopar',
        projectId: 'other',
      }),
    ];
    const suggestion = suggestProjectEnrichment({
      project,
      assets: assets.filter((a) => a.projectId === 'proj1'),
      pool: assets,
    });
    expect(suggestion.autoApply).toBe(false);
    expect(suggestion.missingStages).toContain('before');
    expect(suggestion.suggestedCoverAssetId).toBe('b');
    expect(suggestion.suggestedTimelineOrder).toEqual(['a', 'b']);
  });
});

describe('search enrichment', () => {
  it('parses natural-language queries for stage/service/hero', () => {
    const parsed = parseEnrichedNaturalLanguageQuery(
      'Blue Axopar ceramic coating',
    );
    expect(parsed.residualTokens.join(' ')).toMatch(/blue/i);
    expect(parsed.residualTokens.join(' ')).toMatch(/axopar/i);
    expect(parsed.residualTokens.join(' ')).toMatch(/ceramic/i);

    const before = parseEnrichedNaturalLanguageQuery('Before oxidation repair');
    expect(before.filters.stage).toBe('before');

    const heroes = parseEnrichedNaturalLanguageQuery('Best hero images');
    expect(heroes.preferHero).toBe(true);
  });

  it('matches AI overlay keywords while keeping deterministic corpus separate', async () => {
    const asset = stubAsset({
      id: 's1',
      filename: 'job_001.jpg',
      manufacturer: 'Unknown',
      keywords: [],
    });
    const analysis = await new MockVisionProvider().analyze({
      assetId: 's1',
      filename: 'blue_axopar_ceramic_coating_after.jpg',
      mimeType: 'image/jpeg',
      mediaKind: 'image',
    });
    const corpus = buildEnrichedSearchCorpus(asset, analysis);
    expect(corpus.deterministic).toContain('job_001');
    expect(corpus.deterministic).not.toContain('axopar');
    expect(corpus.ai).toMatch(/axopar/i);
    expect(corpus.joined).toMatch(/ceramic/i);

    const result = searchCatalogWithAiEnrichment([asset], {
      q: 'Axopar ceramic',
      aiByAssetId: new Map([['s1', analysis]]),
    });
    expect(result.total).toBe(1);
    expect(result.matchedViaAi).toBeGreaterThan(0);
  });

  it('finds chris craft polishing queries via AI services', async () => {
    const asset = stubAsset({ id: 's2', filename: 'img.jpg' });
    const analysis = await new MockVisionProvider().analyze({
      assetId: 's2',
      filename: 'chris_craft_polishing_detail.jpg',
      mimeType: 'image/jpeg',
      mediaKind: 'image',
    });
    const result = searchCatalogWithAiEnrichment([asset], {
      q: 'Chris Craft polishing',
      aiByAssetId: new Map([['s2', analysis]]),
    });
    expect(result.total).toBe(1);
  });
});

describe('analysis pipeline + store', () => {
  let root = '';

  beforeAll(async () => {
    root = await fs.mkdtemp(path.join(os.tmpdir(), 'bcs-vision-'));
    process.env.MEDIA_VAULT_ROOT = root;
    delete process.env.MEDIA_CATALOG_DIR;
  });

  afterAll(async () => {
    await fs.rm(root, { recursive: true, force: true });
    delete process.env.MEDIA_VAULT_ROOT;
  });

  it('persists analysis overlay without writing originals', async () => {
    const asset = stubAsset({
      id: 'vault_abc',
      filename: 'sea_ray_gelcoat_before.jpg',
    });
    const analysis = await analyzeSingleAsset({
      asset,
      provider: new MockVisionProvider(),
      root,
    });
    expect(analysis.assetId).toBe('vault_abc');

    const store = await readAiAnalysisStore(root);
    expect(store.analyses.some((a) => a.assetId === 'vault_abc')).toBe(true);

    const originals = path.join(root, 'originals');
    await expect(fs.readdir(originals).catch(() => [])).resolves.toEqual([]);
  });

  it('skips existing analyses unless forceReanalyze', async () => {
    const assets = [
      stubAsset({ id: 'r1', filename: 'boston_whaler_after_buffing.jpg' }),
    ];
    const first = await analyzeCatalogAssets({
      assets,
      provider: new MockVisionProvider(),
      root,
    });
    expect(first.analyzed + first.reanalyzed + first.skipped).toBe(1);

    const second = await analyzeCatalogAssets({
      assets,
      provider: new MockVisionProvider(),
      root,
    });
    expect(second.skipped).toBe(1);
    expect(second.analyzed).toBe(0);

    const third = await analyzeCatalogAssets({
      assets,
      provider: new MockVisionProvider(),
      root,
      forceReanalyze: true,
    });
    expect(third.reanalyzed).toBe(1);
  });

  it('merges concurrent AI store updates by asset id', async () => {
    const a = await new MockVisionProvider().analyze({
      assetId: 'c1',
      filename: 'a.jpg',
      mimeType: 'image/jpeg',
      mediaKind: 'image',
    });
    const b = await new MockVisionProvider().analyze({
      assetId: 'c2',
      filename: 'b.jpg',
      mimeType: 'image/jpeg',
      mediaKind: 'image',
    });
    await Promise.all([
      mergeAiAnalysisStore({ incoming: [a], root }),
      mergeAiAnalysisStore({ incoming: [b], root }),
    ]);
    const store = await readAiAnalysisStore(root);
    const ids = new Set(store.analyses.map((x) => x.assetId));
    expect(ids.has('c1')).toBe(true);
    expect(ids.has('c2')).toBe(true);
  });
});

describe('VisionBackedAnalysisEngine adapter', () => {
  it('implements MediaAnalysisEngine via VisionProvider', async () => {
    const engine = new VisionBackedAnalysisEngine(new MockVisionProvider());
    const result = await engine.analyze({
      filename: 'regulator_wet_sanding_during.jpg',
      mimeType: 'image/jpeg',
      bytes: 500_000,
      width: 1600,
      height: 900,
    });
    expect(result.imageType).toBe('during');
    expect(result.boat.manufacturer).toMatch(/Regulator/i);
    expect(result.repairs.length).toBeGreaterThan(0);
    expect(result.keywords.join(' ').toLowerCase()).toMatch(
      /wet sanding|regulator/,
    );
  });
});

describe('regression — analysis never publishes or mutates status', () => {
  it('privacy blockAutoPublish remains true', async () => {
    const analysis = await new MockVisionProvider().analyze({
      assetId: 'reg1',
      filename: 'clean_hull.jpg',
      mimeType: 'image/jpeg',
      mediaKind: 'image',
    });
    expect(analysis.privacy.blockAutoPublish).toBe(true);
    expect(analysis.privacy.neverAutoModifyOriginal).toBe(true);
  });
});
