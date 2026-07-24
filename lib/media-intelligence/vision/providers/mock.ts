import type { ImageType } from '@/lib/media-intelligence/schemas';
import type {
  VisionAnalysisInput,
  VisionProvider,
} from '@/lib/media-intelligence/vision/provider';
import { detectVisionPrivacy } from '@/lib/media-intelligence/vision/privacy-detect';
import { computeVisionQuality } from '@/lib/media-intelligence/vision/quality';
import {
  VISION_ANALYSIS_VERSION,
  type AssetVisionAnalysis,
  type ServiceCategory,
  type VisionBoatDetections,
  type VisionServiceDetection,
} from '@/lib/media-intelligence/vision/schema';

const BRANDS: ReadonlyArray<{ needle: string; label: string }> = [
  { needle: 'axopar', label: 'Axopar' },
  { needle: 'chris craft', label: 'Chris Craft' },
  { needle: 'chris_craft', label: 'Chris Craft' },
  { needle: 'boston whaler', label: 'Boston Whaler' },
  { needle: 'boston_whaler', label: 'Boston Whaler' },
  { needle: 'sea ray', label: 'Sea Ray' },
  { needle: 'searay', label: 'Sea Ray' },
  { needle: 'pursuit', label: 'Pursuit' },
  { needle: 'regulator', label: 'Regulator' },
  { needle: 'scout', label: 'Scout' },
  { needle: 'grader', label: 'Grady-White' },
  { needle: 'grady', label: 'Grady-White' },
  { needle: 'everglades', label: 'Everglades' },
  { needle: 'yamaha', label: 'Yamaha' },
];

const OUTBOARD_BRANDS = [
  'mercury',
  'yamaha',
  'suzuki',
  'honda',
  'evinrude',
  'tohatsu',
] as const;

const COLORS = [
  'blue',
  'white',
  'black',
  'red',
  'silver',
  'gray',
  'grey',
  'green',
  'yellow',
  'cream',
] as const;

const SERVICE_MAP: ReadonlyArray<{
  needles: readonly string[];
  category: ServiceCategory;
}> = [
  { needles: ['ceramic', 'coating'], category: 'ceramic_coating' },
  { needles: ['wet_sand', 'wetsand', 'wet sand'], category: 'wet_sanding' },
  { needles: ['buff', 'buffing'], category: 'buffing' },
  { needles: ['gelcoat'], category: 'gelcoat_repair' },
  { needles: ['fiberglass', 'fibre glass'], category: 'fiberglass_repair' },
  {
    needles: ['hull paint', 'hull_paint', 'painting'],
    category: 'hull_painting',
  },
  {
    needles: ['bottom paint', 'bottom_paint', 'antifoul'],
    category: 'bottom_paint',
  },
  { needles: ['oxidation', 'oxidized'], category: 'oxidation_removal' },
  { needles: ['detail', 'detailing'], category: 'detail_work' },
  {
    needles: ['paint correction', 'correction', 'polish'],
    category: 'paint_correction',
  },
];

function haystack(input: VisionAnalysisInput): string {
  return [
    input.filename,
    input.deterministic?.manufacturer,
    input.deterministic?.boatName,
    input.deterministic?.boatType,
    input.deterministic?.repairCategory,
    input.deterministic?.stage,
    input.deterministic?.folder,
    input.deterministic?.projectName,
    ...(input.deterministic?.keywords ?? []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function detectBoat(input: VisionAnalysisInput): VisionBoatDetections {
  const text = haystack(input);
  const boat: VisionBoatDetections = {};

  for (const brand of BRANDS) {
    if (text.includes(brand.needle)) {
      boat.manufacturer = { value: brand.label, confidence: 0.78 };
      break;
    }
  }
  if (!boat.manufacturer && input.deterministic?.manufacturer) {
    boat.manufacturer = {
      value: input.deterministic.manufacturer,
      confidence: 0.55,
    };
  }

  // Model: token after manufacturer or boatName cue
  if (input.deterministic?.boatName) {
    boat.model = {
      value: input.deterministic.boatName,
      confidence: 0.6,
    };
  } else {
    const modelMatch = text.match(
      /\b(axopar|sea.?ray|pursuit|regulator|scout)\s*([a-z0-9-]{2,12})\b/i,
    );
    if (modelMatch?.[2]) {
      boat.model = {
        value: modelMatch[2].toUpperCase(),
        confidence: 0.52,
      };
    }
  }

  for (const color of COLORS) {
    if (text.includes(color)) {
      const label = color === 'grey' ? 'gray' : color;
      boat.hullColor = {
        value: label.charAt(0).toUpperCase() + label.slice(1),
        confidence: 0.62,
      };
      break;
    }
  }
  if (text.includes('superstructure') || text.includes('cabin_white')) {
    boat.superstructureColor = { value: 'White', confidence: 0.5 };
  } else if (boat.hullColor && text.includes('white')) {
    boat.superstructureColor = { value: 'White', confidence: 0.4 };
  }

  for (const brand of OUTBOARD_BRANDS) {
    if (text.includes(brand)) {
      boat.outboardBrand = {
        value: brand.charAt(0).toUpperCase() + brand.slice(1),
        confidence: 0.58,
      };
      break;
    }
  }

  const twin = /\b(twin|dual|2x|two.?engine)\b/.test(text);
  const triple = /\b(triple|3x|three.?engine)\b/.test(text);
  if (triple) {
    boat.outboardCount = { value: 3, confidence: 0.55 };
  } else if (twin) {
    boat.outboardCount = { value: 2, confidence: 0.55 };
  } else if (boat.outboardBrand) {
    boat.outboardCount = { value: 1, confidence: 0.4 };
  }

  if (/\btrailer\b/.test(text)) {
    boat.trailerPresent = { value: true, confidence: 0.7 };
  } else {
    boat.trailerPresent = { value: false, confidence: 0.35 };
  }

  if (/\binterior|cabin.?inside|helm.?seat\b/.test(text)) {
    boat.viewContext = { value: 'interior', confidence: 0.65 };
  } else if (/\bexterior|hull.?side|transom|bow\b/.test(text)) {
    boat.viewContext = { value: 'exterior', confidence: 0.65 };
  } else {
    boat.viewContext = { value: 'exterior', confidence: 0.35 };
  }

  if (/\bmarina|dock|slip\b/.test(text)) {
    boat.environment = { value: 'marina', confidence: 0.6 };
  } else if (/\bshop|workshop|bay|garage\b/.test(text)) {
    boat.environment = { value: 'shop', confidence: 0.6 };
  } else if (boat.trailerPresent?.value) {
    boat.environment = { value: 'trailer', confidence: 0.45 };
  } else if (/\bwater|on.?water|anchored\b/.test(text)) {
    boat.environment = { value: 'water', confidence: 0.5 };
  } else {
    boat.environment = { value: 'unknown', confidence: 0.25 };
  }

  return boat;
}

function detectServices(input: VisionAnalysisInput): VisionServiceDetection[] {
  const text = haystack(input);
  const found: VisionServiceDetection[] = [];
  for (const entry of SERVICE_MAP) {
    if (entry.needles.some((n) => text.includes(n))) {
      found.push({ category: entry.category, confidence: 0.7 });
    }
  }
  if (
    input.deterministic?.repairCategory &&
    !found.some((f) => f.category !== 'unknown')
  ) {
    const mapped = SERVICE_MAP.find((s) =>
      s.needles.some((n) =>
        input.deterministic!.repairCategory!.toLowerCase().includes(n),
      ),
    );
    if (mapped) {
      found.push({ category: mapped.category, confidence: 0.5 });
    }
  }
  if (found.length === 0) {
    found.push({ category: 'unknown', confidence: 0.15 });
  }
  return found;
}

function inferStage(input: VisionAnalysisInput): {
  stage: ImageType;
  confidence: number;
} {
  const text = haystack(input);
  if (input.deterministic?.stage && input.deterministic.stage !== 'unknown') {
    return {
      stage: input.deterministic.stage as ImageType,
      confidence: 0.55,
    };
  }
  if (/(^|[^a-z0-9])before([^a-z0-9]|$)/.test(text) || text.includes('pre-')) {
    return { stage: 'before', confidence: 0.75 };
  }
  if (/(^|[^a-z0-9])after([^a-z0-9]|$)/.test(text) || text.includes('post-')) {
    return { stage: 'after', confidence: 0.75 };
  }
  if (text.includes('during') || text.includes('progress')) {
    return { stage: 'during', confidence: 0.7 };
  }
  if (text.includes('detail') || text.includes('close')) {
    return { stage: 'detail', confidence: 0.6 };
  }
  return { stage: 'unknown', confidence: 0.2 };
}

function overallConfidence(
  analysis: Omit<AssetVisionAnalysis, 'confidence'>,
): number {
  const parts = [
    analysis.boat.manufacturer?.confidence ?? 0.2,
    analysis.stage.confidence,
    analysis.services[0]?.confidence ?? 0.2,
    analysis.quality.overall / 100,
  ];
  return (
    Math.round((parts.reduce((a, b) => a + b, 0) / parts.length) * 100) / 100
  );
}

/**
 * Deterministic mock vision provider for development, CI, and demos.
 * Produces structured detections from filename + catalog cues — no network.
 */
export class MockVisionProvider implements VisionProvider {
  readonly id = 'mock' as const;
  readonly displayName = 'Mock Vision Provider';

  async analyze(input: VisionAnalysisInput): Promise<AssetVisionAnalysis> {
    if (input.mediaKind === 'video') {
      // Still analyze metadata cues; no frame sampling in mock.
    }

    const boat = detectBoat(input);
    const services = detectServices(input);
    const stage = inferStage(input);
    const quality = computeVisionQuality(input);
    const privacy = detectVisionPrivacy(input);

    const tags = [
      boat.manufacturer?.value,
      boat.model?.value,
      boat.hullColor?.value ? `${boat.hullColor.value} hull` : undefined,
      boat.outboardBrand?.value,
      boat.environment?.value,
      boat.viewContext?.value,
      stage.stage,
      ...services.map((s) => s.category.replace(/_/g, ' ')),
    ].filter((v): v is string => Boolean(v));

    const keywords = [
      ...tags,
      ...services
        .filter((s) => s.category !== 'unknown')
        .map((s) => s.category.replace(/_/g, ' ')),
      'marine',
      'Best Coatings Solutions',
    ];

    const draft: Omit<AssetVisionAnalysis, 'confidence'> = {
      assetId: input.assetId,
      analysisVersion: VISION_ANALYSIS_VERSION,
      analyzedAt: new Date().toISOString(),
      provider: 'mock',
      providerModel: 'mock-heuristics-v1',
      boat,
      services,
      stage,
      quality,
      privacy,
      keywords: [...new Set(keywords)],
      tags: [...new Set(tags)],
      analyzedRelativePath: input.derivativeRelativePath,
      notes:
        'Mock vision analysis — replace with OpenAIVisionProvider for production models.',
    };

    return {
      ...draft,
      confidence: overallConfidence(draft),
    };
  }
}

export const defaultMockVisionProvider = new MockVisionProvider();
