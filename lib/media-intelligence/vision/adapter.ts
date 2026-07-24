import {
  type AnalysisEngineInput,
  type AnalysisEngineResult,
  type MediaAnalysisEngine,
} from '@/lib/media-intelligence/analysis/engine';
import { scanPrivacyRisks } from '@/lib/media-intelligence/privacy';
import { computeScoreBreakdown } from '@/lib/media-intelligence/scoring';
import type { VisionProvider } from '@/lib/media-intelligence/vision/provider';
import { getVisionProvider } from '@/lib/media-intelligence/vision/factory';
import type {
  DamageFinding,
  RepairFinding,
} from '@/lib/media-intelligence/schemas';

/**
 * Adapts VisionProvider → MediaAnalysisEngine so Phase 1 studio can use vision
 * without depending on a concrete provider.
 */
export class VisionBackedAnalysisEngine implements MediaAnalysisEngine {
  private readonly provider: VisionProvider;

  constructor(provider: VisionProvider = getVisionProvider()) {
    this.provider = provider;
  }

  async analyze(input: AnalysisEngineInput): Promise<AnalysisEngineResult> {
    const vision = await this.provider.analyze({
      assetId: `tmp_${input.filename}`,
      filename: input.filename,
      mimeType: input.mimeType,
      mediaKind: input.mimeType.startsWith('video/') ? 'video' : 'image',
      bytes: input.bytes,
      width: input.width,
      height: input.height,
      deterministic: {
        manufacturer: input.hints?.manufacturer,
        boatName: input.hints?.model,
        stage: input.hints?.imageType,
        keywords: input.hints?.tags,
      },
    });

    const damages: DamageFinding[] = [];
    const repairs: RepairFinding[] = vision.services
      .filter((s) => s.category !== 'unknown')
      .map((s) => {
        const map: Record<string, RepairFinding['type']> = {
          ceramic_coating: 'polishing',
          wet_sanding: 'wet_sanding',
          buffing: 'buffing',
          gelcoat_repair: 'gelcoat',
          fiberglass_repair: 'fiberglass',
          hull_painting: 'painting',
          bottom_paint: 'bottom_paint',
          oxidation_removal: 'polishing',
          detail_work: 'polishing',
          paint_correction: 'polishing',
        };
        return {
          type: map[s.category] ?? 'unknown',
          confidence: s.confidence,
          notes: s.category,
        };
      });

    if (repairs.length === 0) {
      repairs.push({ type: 'unknown', confidence: 0.1 });
    }
    if (damages.length === 0) {
      damages.push({ type: 'unknown', severity: 'low', confidence: 0.1 });
    }

    const privacy = scanPrivacyRisks({
      filename: input.filename,
      notes: input.notes,
      detectedLabels: vision.privacy.findings.map((f) => f.risk),
    });

    const scores = computeScoreBreakdown({
      width: input.width,
      height: input.height,
      bytes: input.bytes,
      blurSuspect: vision.quality.blur >= 50,
      darkSuspect: vision.quality.exposure < 40,
      overexposedSuspect: vision.quality.exposure > 90,
      privacyRiskCount: vision.privacy.findings.length,
      hasBeforeAfterContext:
        vision.stage.stage === 'before' ||
        vision.stage.stage === 'after' ||
        vision.stage.stage === 'during',
      luxuryCues: input.hints?.luxuryCues,
      marineSubjectConfidence: vision.boat.manufacturer?.confidence ?? 0.4,
    });

    return {
      scores,
      boat: {
        manufacturer:
          vision.boat.manufacturer?.value ?? input.hints?.manufacturer,
        model: vision.boat.model?.value ?? input.hints?.model,
        hullColor: vision.boat.hullColor?.value,
        propulsion: vision.boat.outboardBrand?.value,
        engineCount: vision.boat.outboardCount?.value,
        category: 'unknown',
        confidence: vision.boat.manufacturer?.confidence ?? 0.2,
      },
      damages,
      repairs,
      imageType: vision.stage.stage,
      tags: vision.tags,
      keywords: vision.keywords,
      qcRejectReasons:
        vision.quality.blur >= 60
          ? ['blur']
          : vision.quality.exposure < 35
            ? ['dark']
            : [],
      privacy,
    };
  }
}
