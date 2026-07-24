import type { VisionQualityMetrics } from '@/lib/media-intelligence/vision/schema';
import type { VisionAnalysisInput } from '@/lib/media-intelligence/vision/provider';

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(n)));
}

/**
 * Explainable quality analysis from available signals.
 * Prefer image metrics when bytes/dimensions exist; fall back to deterministic cues.
 * Never modifies media.
 */
export function computeVisionQuality(
  input: VisionAnalysisInput,
): VisionQualityMetrics {
  const explanation: string[] = [];
  const lower = input.filename.toLowerCase();
  const det = input.deterministic;

  let sharpness = 72;
  let exposure = 70;
  let blur = 18;
  let noise = 22;
  let composition = 68;
  let orientationScore = 70;

  if (input.width && input.height) {
    const megapixels = (input.width * input.height) / 1_000_000;
    if (megapixels >= 8) {
      sharpness += 10;
      explanation.push('High resolution supports sharpness (+10).');
    } else if (megapixels < 2) {
      sharpness -= 15;
      explanation.push('Low resolution reduces sharpness (−15).');
    }
    const ratio = input.width / input.height;
    if (ratio >= 1.2 && ratio <= 2.2) {
      orientationScore += 12;
      composition += 8;
      explanation.push('Landscape framing favors marketing composition.');
    } else if (ratio < 0.85) {
      orientationScore -= 5;
      explanation.push('Portrait framing is less ideal for hero crops.');
    }
  }

  if (typeof input.bytes === 'number') {
    if (input.bytes < 40_000) {
      sharpness -= 12;
      noise += 15;
      explanation.push('Small file size suggests compression or low detail.');
    } else if (input.bytes > 2_000_000) {
      sharpness += 6;
      noise -= 6;
      explanation.push('Larger file size supports detail retention.');
    }
  }

  if (lower.includes('blur') || lower.includes('out_of_focus')) {
    blur += 40;
    sharpness -= 25;
    explanation.push('Filename cues indicate blur.');
  }
  if (lower.includes('dark') || lower.includes('underexposed')) {
    exposure -= 25;
    explanation.push('Filename cues indicate underexposure.');
  }
  if (lower.includes('overexposed') || lower.includes('blown')) {
    exposure -= 20;
    explanation.push('Filename cues indicate overexposure.');
  }
  if (lower.includes('noise') || lower.includes('grain')) {
    noise += 25;
    explanation.push('Filename cues indicate noise/grain.');
  }

  if (det?.isHeroCandidate) {
    composition += 10;
    explanation.push('Marked hero candidate in deterministic catalog.');
  }

  const duplicateConfidence =
    det?.isExactDuplicate || det?.isNearDuplicate ? 0.85 : 0.08;
  if (duplicateConfidence > 0.5) {
    composition -= 8;
    explanation.push('Duplicate confidence reduces uniqueness for marketing.');
  }

  sharpness = clamp(sharpness);
  exposure = clamp(exposure);
  blur = clamp(blur);
  noise = clamp(noise);
  composition = clamp(composition);
  orientationScore = clamp(orientationScore);

  const marketingSuitability = clamp(
    sharpness * 0.2 +
      exposure * 0.15 +
      (100 - blur) * 0.2 +
      (100 - noise) * 0.1 +
      composition * 0.25 +
      orientationScore * 0.1,
  );

  const heroSuitability = clamp(
    marketingSuitability * 0.7 +
      composition * 0.2 +
      orientationScore * 0.1 -
      (duplicateConfidence > 0.5 ? 15 : 0) +
      (det?.isHeroCandidate ? 10 : 0),
  );

  const overall = clamp(
    sharpness * 0.22 +
      exposure * 0.18 +
      (100 - blur) * 0.18 +
      (100 - noise) * 0.1 +
      composition * 0.2 +
      orientationScore * 0.12,
  );

  explanation.push(
    `Overall quality ${overall}/100 from weighted sharpness, exposure, blur, noise, composition, and orientation.`,
  );

  return {
    sharpness,
    exposure,
    blur,
    noise,
    composition,
    orientationScore,
    duplicateConfidence,
    marketingSuitability,
    heroSuitability,
    overall,
    explanation,
  };
}
