/**
 * Deterministic fixture catalog for Phase 2 when real 08_Reports are not synced.
 * Clearly marked isFixture: true — not client production media.
 */

import type {
  CatalogAsset,
  CatalogProject,
  DuplicateGroup,
  DuplicatesReport,
  MediaCatalog,
  ProjectsReport,
  SearchIndex,
} from './catalog-schema';

const MANUFACTURERS = [
  'Sea Ray',
  'Boston Whaler',
  'Yamaha',
  'Scout',
  'Chris-Craft',
  'Grady-White',
  'Regulator',
  'Pursuit',
] as const;

const BOAT_TYPES = [
  'center_console',
  'cabin',
  'sport_boat',
  'fishing',
  'pontoon',
] as const;

const REPAIRS = [
  'gelcoat',
  'fiberglass',
  'fairing',
  'color_matching',
  'buffing',
  'structural',
  'bottom_paint',
] as const;

const STAGES = ['before', 'during', 'after', 'detail', 'context'] as const;
const CAMERAS = [
  'iPhone 15 Pro',
  'Canon EOS R6',
  'Sony A7 IV',
  'Nikon Z6 II',
  'Unknown',
] as const;

function hash(n: number): number {
  let x = (n + 1) * 2654435761;
  x ^= x >>> 16;
  return Math.abs(x);
}

function pick<T extends readonly string[]>(arr: T, n: number): T[number] {
  return arr[hash(n) % arr.length]!;
}

function score(base: number, n: number, spread = 25): number {
  return Math.min(100, Math.max(20, base + (hash(n) % spread) - spread / 2));
}

export type FixtureBundle = {
  readonly catalog: MediaCatalog;
  readonly projects: ProjectsReport;
  readonly duplicates: DuplicatesReport;
  readonly searchIndex: SearchIndex;
};

export function generateFixtureCatalog(assetCount = 240): FixtureBundle {
  const generatedAt = '2026-07-24T12:00:00.000Z';
  const projectCount = Math.max(8, Math.floor(assetCount / 18));
  const projectsMeta: CatalogProject[] = [];
  const assets: CatalogAsset[] = [];
  const groups: DuplicateGroup[] = [];

  for (let p = 0; p < projectCount; p += 1) {
    const manufacturer = pick(MANUFACTURERS, p);
    const repairCategory = pick(REPAIRS, p + 3);
    const boatType = pick(BOAT_TYPES, p + 7);
    const id = `proj_${String(p + 1).padStart(3, '0')}`;
    projectsMeta.push({
      id,
      name: `${manufacturer} ${repairCategory.replace(/_/g, ' ')} #${p + 1}`,
      manufacturer,
      boatName: `${manufacturer} ${20 + (hash(p) % 30)}`,
      boatType,
      repairCategory,
      folder: `01_Originals/${manufacturer.replace(/\s+/g, '_')}/${id}`,
      mediaCount: 0,
      imageCount: 0,
      videoCount: 0,
      beforeCount: 0,
      duringCount: 0,
      afterCount: 0,
      duplicateAlertCount: 0,
      privacyAlertCount: 0,
      assetIds: [],
      notes: 'Fixture project for Interactive Media Library development.',
    });
  }

  for (let i = 0; i < assetCount; i += 1) {
    const project = projectsMeta[i % projectsMeta.length]!;
    const stage = pick(STAGES, i);
    const isVideo = hash(i) % 17 === 0;
    const width = isVideo ? 1920 : 2400 + (hash(i) % 2000);
    const height = isVideo ? 1080 : 1600 + (hash(i + 1) % 1400);
    const orientation =
      width === height ? 'square' : width > height ? 'landscape' : 'portrait';
    const website = score(72, i, 40);
    const marketing = score(70, i + 2, 40);
    const technical = score(75, i + 5, 35);
    const hasExif = hash(i) % 5 !== 0;
    const privacyRoll = hash(i) % 23;
    const privacyStatus =
      privacyRoll === 0 ? 'blocked' : privacyRoll <= 2 ? 'warning' : 'clear';
    const day = 1 + (hash(i) % 28);
    const month = 1 + (hash(i + 9) % 12);
    const exifDate = hasExif
      ? `2025-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T14:30:00.000Z`
      : undefined;
    const id = `asset_${String(i + 1).padStart(4, '0')}`;
    const filename = isVideo
      ? `${project.id}_${stage}_${i + 1}.mp4`
      : `${project.id}_${stage}_${i + 1}.jpg`;

    const asset: CatalogAsset = {
      id,
      filename,
      originalFilename: filename,
      fileType: isVideo ? 'video/mp4' : 'image/jpeg',
      mediaKind: isVideo ? 'video' : 'image',
      folder: project.folder ?? '',
      projectId: project.id,
      projectName: project.name,
      manufacturer: project.manufacturer,
      boatName: project.boatName,
      boatType: project.boatType,
      repairCategory: project.repairCategory,
      stage,
      keywords: [
        project.manufacturer ?? '',
        project.repairCategory ?? '',
        stage,
        'marine',
        'south-florida',
      ].filter(Boolean),
      camera: hasExif ? pick(CAMERAS, i) : undefined,
      exifDate,
      hasExif,
      width,
      height,
      resolution: `${width}x${height}`,
      orientation,
      checksum: `sha256_fixture_${hash(i).toString(16)}`,
      fileSizeBytes: isVideo
        ? 12_000_000 + (hash(i) % 40_000_000)
        : 2_000_000 + (hash(i) % 8_000_000),
      scores: {
        website,
        marketing,
        technical,
        quality: technical,
        seo: score(68, i + 11, 30),
        social: marketing,
        overall: Math.round((website + marketing + technical) / 3),
      },
      privacyStatus,
      privacyIssues:
        privacyStatus === 'clear'
          ? []
          : privacyStatus === 'blocked'
            ? ['faces', 'license_plates']
            : ['registration_numbers'],
      isHeroCandidate:
        !isVideo &&
        website >= 80 &&
        marketing >= 75 &&
        orientation === 'landscape' &&
        privacyStatus === 'clear',
      duplicateGroupId: null,
      nearDuplicateGroupId: null,
      isExactDuplicate: false,
      isNearDuplicate: false,
      thumbnailPath: null,
      previewPath: null,
      recommendations: {
        website:
          website >= 80
            ? 'Strong website candidate — consider portfolio hero.'
            : 'Use internally; improve framing before public use.',
        marketing:
          marketing >= 78
            ? 'Suitable for social / sales deck after approval.'
            : 'Needs stronger visual impact for marketing.',
        seo: 'Draft alt text from boat + repair + stage; owner approval required.',
      },
      indexedAt: `2026-07-${String(1 + (i % 20)).padStart(2, '0')}T${String(8 + (i % 10)).padStart(2, '0')}:00:00.000Z`,
      notes: 'Fixture catalog asset — not a real client photo.',
    };

    assets.push(asset);
    project.assetIds.push(id);
    project.mediaCount += 1;
    if (isVideo) project.videoCount += 1;
    else project.imageCount += 1;
    if (stage === 'before') project.beforeCount += 1;
    if (stage === 'during') project.duringCount += 1;
    if (stage === 'after') project.afterCount += 1;
    if (privacyStatus !== 'clear') project.privacyAlertCount += 1;
  }

  // Exact duplicate groups (only when enough assets exist)
  const exactGroupCount = Math.min(6, Math.floor(assets.length / 12));
  for (let g = 0; g < exactGroupCount; g += 1) {
    const primary = assets[g * 11];
    const copy = assets[g * 11 + 1];
    if (!primary || !copy) break;
    const groupId = `dup_exact_${g + 1}`;
    primary.duplicateGroupId = groupId;
    primary.isExactDuplicate = true;
    copy.duplicateGroupId = groupId;
    copy.isExactDuplicate = true;
    copy.checksum = primary.checksum;
    groups.push({
      id: groupId,
      kind: 'exact',
      similarity: 1,
      recommendedKeepAssetId: primary.id,
      members: [
        { assetId: primary.id, filename: primary.filename, role: 'original' },
        { assetId: copy.id, filename: copy.filename, role: 'copy' },
      ],
      notes: 'Exact checksum match. Owner approval required before any action.',
    });
    const project = projectsMeta.find((p) => p.id === primary.projectId);
    if (project) project.duplicateAlertCount += 1;
  }

  // Near duplicate groups
  const nearGroupCount = Math.min(
    8,
    Math.floor(Math.max(0, assets.length - 40) / 9),
  );
  for (let g = 0; g < nearGroupCount; g += 1) {
    const a = assets[30 + g * 9];
    const b = assets[31 + g * 9];
    if (!a || !b) break;
    const groupId = `dup_near_${g + 1}`;
    a.nearDuplicateGroupId = groupId;
    a.isNearDuplicate = true;
    b.nearDuplicateGroupId = groupId;
    b.isNearDuplicate = true;
    groups.push({
      id: groupId,
      kind: 'near',
      similarity: 0.86 + (hash(g) % 10) / 100,
      recommendedKeepAssetId:
        (a.scores.overall ?? 0) >= (b.scores.overall ?? 0) ? a.id : b.id,
      members: [
        { assetId: a.id, filename: a.filename, role: 'candidate' },
        { assetId: b.id, filename: b.filename, role: 'candidate' },
      ],
      notes: 'Near-duplicate visual similarity. No automatic deletion.',
    });
  }

  for (const project of projectsMeta) {
    const projectAssets = assets.filter((a) => a.projectId === project.id);
    const images = projectAssets.filter((a) => a.mediaKind === 'image');
    const byWebsite = [...images].sort(
      (x, y) => y.scores.website - x.scores.website,
    );
    const byMarketing = [...images].sort(
      (x, y) => y.scores.marketing - x.scores.marketing,
    );
    const hero = images.find((a) => a.isHeroCandidate) ?? byWebsite[0];
    project.bestWebsiteAssetId = byWebsite[0]?.id;
    project.bestSocialAssetId = byMarketing[0]?.id;
    project.topHeroAssetId = hero?.id;
    project.averageWebsiteScore =
      images.length === 0
        ? 0
        : Math.round(
            images.reduce((s, a) => s + a.scores.website, 0) / images.length,
          );
    project.averageMarketingScore =
      images.length === 0
        ? 0
        : Math.round(
            images.reduce((s, a) => s + a.scores.marketing, 0) / images.length,
          );
    project.averageTechnicalScore =
      images.length === 0
        ? 0
        : Math.round(
            images.reduce((s, a) => s + a.scores.technical, 0) / images.length,
          );
    const dates = projectAssets
      .map((a) => a.exifDate)
      .filter((d): d is string => Boolean(d))
      .sort();
    project.timelineStart = dates[0];
    project.timelineEnd = dates[dates.length - 1];
  }

  const catalog: MediaCatalog = {
    generatedAt,
    version: '1.0',
    source: 'fixture-generator',
    isFixture: true,
    assets,
  };

  const projects: ProjectsReport = {
    generatedAt,
    version: '1.0',
    isFixture: true,
    projects: projectsMeta,
  };

  const duplicates: DuplicatesReport = {
    generatedAt,
    version: '1.0',
    isFixture: true,
    groups,
  };

  const searchIndex: SearchIndex = {
    generatedAt,
    version: '1.0',
    isFixture: true,
    entries: assets.map((asset) => ({
      id: asset.id,
      text: [
        asset.filename,
        asset.projectName,
        asset.manufacturer,
        asset.boatName,
        asset.repairCategory,
        asset.stage,
        ...(asset.keywords ?? []),
      ]
        .filter(Boolean)
        .join(' '),
      tokens: (asset.keywords ?? []).map((k) => k.toLowerCase()),
    })),
  };

  return { catalog, projects, duplicates, searchIndex };
}
