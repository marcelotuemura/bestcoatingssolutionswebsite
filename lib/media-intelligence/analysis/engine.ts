import type {
  BoatIdentification,
  DamageFinding,
  ImageType,
  MediaAsset,
  QcRejectReason,
  RepairFinding,
  ScoreBreakdown,
} from '@/lib/media-intelligence/schemas';
import { scanPrivacyRisks } from '@/lib/media-intelligence/privacy';
import { computeScoreBreakdown } from '@/lib/media-intelligence/scoring';

export interface AnalysisEngineInput {
  readonly filename: string;
  readonly mimeType: string;
  readonly bytes: number;
  readonly width?: number;
  readonly height?: number;
  readonly notes?: string;
  readonly hints?: {
    readonly manufacturer?: string;
    readonly model?: string;
    readonly imageType?: ImageType;
    readonly damageTypes?: readonly DamageFinding['type'][];
    readonly repairTypes?: readonly RepairFinding['type'][];
    readonly tags?: readonly string[];
    readonly luxuryCues?: boolean;
  };
}

export interface AnalysisEngineResult {
  readonly scores: ScoreBreakdown;
  readonly boat: BoatIdentification;
  readonly damages: readonly DamageFinding[];
  readonly repairs: readonly RepairFinding[];
  readonly imageType: ImageType;
  readonly tags: readonly string[];
  readonly keywords: readonly string[];
  readonly qcRejectReasons: readonly QcRejectReason[];
  readonly privacy: ReturnType<typeof scanPrivacyRisks>;
}

export interface MediaAnalysisEngine {
  analyze(input: AnalysisEngineInput): Promise<AnalysisEngineResult>;
  analyzeSync?(input: AnalysisEngineInput): AnalysisEngineResult;
}

const brandHints = [
  'boston whaler',
  'sea ray',
  'pursuit',
  'regulator',
  'yamaha',
  'mercury',
  'grader',
  'scout',
  'everglades',
] as const;

function inferBoat(
  filename: string,
  hints?: AnalysisEngineInput['hints'],
): BoatIdentification {
  const lower = filename.toLowerCase();
  let manufacturer = hints?.manufacturer;
  const model = hints?.model;
  for (const brand of brandHints) {
    const compact = brand.replaceAll(' ', '');
    const underscored = brand.replaceAll(' ', '_');
    if (
      lower.includes(brand) ||
      lower.includes(compact) ||
      lower.includes(underscored)
    ) {
      manufacturer = brand
        .split(' ')
        .map((part) => part[0]!.toUpperCase() + part.slice(1))
        .join(' ');
      break;
    }
  }
  let category: BoatIdentification['category'] = 'unknown';
  if (lower.includes('console') || lower.includes('cc'))
    category = 'center_console';
  if (lower.includes('yacht')) category = 'luxury_yacht';
  if (lower.includes('pontoon')) category = 'pontoon';
  if (lower.includes('cabin')) category = 'cabin';

  return {
    manufacturer,
    model,
    category,
    confidence: manufacturer ? 0.55 : 0.15,
  };
}

function inferImageType(
  filename: string,
  hints?: AnalysisEngineInput['hints'],
): ImageType {
  if (hints?.imageType) return hints.imageType;
  const lower = filename.toLowerCase();
  if (/(^|[_-])before([_-]|$)/.test(lower) || lower.includes('pre-')) {
    return 'before';
  }
  if (/(^|[_-])after([_-]|$)/.test(lower) || lower.includes('post-')) {
    return 'after';
  }
  if (lower.includes('during') || lower.includes('progress')) return 'during';
  if (lower.includes('detail') || lower.includes('close')) return 'detail';
  return 'unknown';
}

function inferDamages(
  filename: string,
  hints?: AnalysisEngineInput['hints'],
): DamageFinding[] {
  if (hints?.damageTypes?.length) {
    return hints.damageTypes.map((type) => ({
      type,
      severity: 'moderate' as const,
      confidence: 0.5,
    }));
  }
  const lower = filename.toLowerCase();
  const findings: DamageFinding[] = [];
  const map: Array<[string, DamageFinding['type']]> = [
    ['scratch', 'scratch'],
    ['crack', 'crack'],
    ['impact', 'impact'],
    ['hole', 'hole'],
    ['blister', 'blister'],
    ['delam', 'delamination'],
    ['gelcoat', 'gelcoat'],
    ['collision', 'collision'],
    ['paint', 'paint_failure'],
  ];
  for (const [needle, type] of map) {
    if (lower.includes(needle)) {
      findings.push({ type, severity: 'moderate', confidence: 0.45 });
    }
  }
  if (findings.length === 0) {
    findings.push({ type: 'unknown', severity: 'low', confidence: 0.1 });
  }
  return findings;
}

function inferRepairs(
  filename: string,
  hints?: AnalysisEngineInput['hints'],
): RepairFinding[] {
  if (hints?.repairTypes?.length) {
    return hints.repairTypes.map((type) => ({ type, confidence: 0.5 }));
  }
  const lower = filename.toLowerCase();
  const findings: RepairFinding[] = [];
  const map: Array<[string, RepairFinding['type']]> = [
    ['gelcoat', 'gelcoat'],
    ['fiberglass', 'fiberglass'],
    ['fairing', 'fairing'],
    ['paint', 'painting'],
    ['buff', 'buffing'],
    ['polish', 'polishing'],
    ['color', 'color_matching'],
    ['structural', 'structural'],
  ];
  for (const [needle, type] of map) {
    if (lower.includes(needle)) {
      findings.push({ type, confidence: 0.45 });
    }
  }
  if (findings.length === 0) {
    findings.push({ type: 'unknown', confidence: 0.1 });
  }
  return findings;
}

function inferQc(filename: string, bytes: number): QcRejectReason[] {
  const lower = filename.toLowerCase();
  const reasons: QcRejectReason[] = [];
  if (lower.includes('blur') || lower.includes('out_of_focus'))
    reasons.push('blur');
  if (lower.includes('dark') || lower.includes('underexposed'))
    reasons.push('dark');
  if (lower.includes('overexposed') || lower.includes('blown')) {
    reasons.push('overexposed');
  }
  if (lower.includes('pocket') || lower.includes('accidental')) {
    reasons.push('accidental', 'pocket');
  }
  if (lower.includes('finger')) reasons.push('finger');
  if (bytes < 20_000) reasons.push('poor_composition');
  return reasons;
}

/**
 * Heuristic analysis engine — inspects every file passed in (never skips).
 * Replace with a vision provider implementation of MediaAnalysisEngine.
 */
export class HeuristicMediaAnalysisEngine implements MediaAnalysisEngine {
  analyzeSync(input: AnalysisEngineInput): AnalysisEngineResult {
    const imageType = inferImageType(input.filename, input.hints);
    const boat = inferBoat(input.filename, input.hints);
    const damages = inferDamages(input.filename, input.hints);
    const repairs = inferRepairs(input.filename, input.hints);
    const qcRejectReasons = inferQc(input.filename, input.bytes);
    const privacy = scanPrivacyRisks({
      filename: input.filename,
      notes: input.notes,
      detectedLabels: input.hints?.tags,
    });

    const scores = computeScoreBreakdown({
      width: input.width,
      height: input.height,
      bytes: input.bytes,
      blurSuspect: qcRejectReasons.includes('blur'),
      darkSuspect: qcRejectReasons.includes('dark'),
      overexposedSuspect: qcRejectReasons.includes('overexposed'),
      privacyRiskCount: privacy.risks.length,
      hasBeforeAfterContext:
        imageType === 'before' ||
        imageType === 'after' ||
        imageType === 'during',
      luxuryCues: input.hints?.luxuryCues ?? boat.category === 'luxury_yacht',
      marineSubjectConfidence: boat.confidence > 0.3 ? 0.75 : 0.4,
    });

    const tags = [
      ...(input.hints?.tags ?? []),
      ...(boat.manufacturer ? [boat.manufacturer] : []),
      ...damages.map((d) => d.type),
      ...repairs.map((r) => r.type),
      imageType,
      'Florida',
    ].filter(Boolean);

    const keywords = [
      ...tags,
      'marine repair',
      'Best Coatings Solutions',
      boat.category !== 'unknown' ? boat.category.replace('_', ' ') : '',
    ].filter(Boolean);

    return {
      scores,
      boat,
      damages,
      repairs,
      imageType,
      tags: [...new Set(tags.map(String))],
      keywords: [...new Set(keywords.map(String))],
      qcRejectReasons,
      privacy,
    };
  }

  async analyze(input: AnalysisEngineInput): Promise<AnalysisEngineResult> {
    return this.analyzeSync(input);
  }
}

export const defaultMediaAnalysisEngine = new HeuristicMediaAnalysisEngine();

export function applyAnalysisToAsset(
  asset: MediaAsset,
  result: AnalysisEngineResult,
): MediaAsset {
  return {
    ...asset,
    boat: result.boat,
    manufacturer: result.boat.manufacturer ?? asset.manufacturer,
    model: result.boat.model ?? asset.model,
    damageTypes: result.damages.map((d) => d.type),
    repairTypes: result.repairs.map((r) => r.type),
    imageType: result.imageType,
    scores: result.scores,
    tags: [...new Set([...asset.tags, ...result.tags])],
    keywords: [...new Set([...asset.keywords, ...result.keywords])],
    privacyRisks: [...result.privacy.risks],
    privacySuggestions: [...result.privacy.suggestions],
    qcRejectReasons: [...result.qcRejectReasons],
    status: asset.status === 'imported' ? 'analyzed' : asset.status,
  };
}
