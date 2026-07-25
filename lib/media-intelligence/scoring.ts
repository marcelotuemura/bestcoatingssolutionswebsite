import type { ScoreBreakdown } from '@/lib/media-intelligence/schemas';

export interface ScoringHints {
  readonly width?: number;
  readonly height?: number;
  readonly bytes?: number;
  readonly blurSuspect?: boolean;
  readonly darkSuspect?: boolean;
  readonly overexposedSuspect?: boolean;
  readonly privacyRiskCount?: number;
  readonly hasBeforeAfterContext?: boolean;
  readonly luxuryCues?: boolean;
  readonly marineSubjectConfidence?: number;
}

function clamp(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Deterministic scoring seam. Vision providers should map model outputs into
 * the same ScoreBreakdown shape.
 */
export function computeScoreBreakdown(hints: ScoringHints): ScoreBreakdown {
  const megapixels =
    hints.width && hints.height ? (hints.width * hints.height) / 1_000_000 : 4;
  const technicalBase = Math.min(95, 40 + megapixels * 8);
  let technical = technicalBase;
  if (hints.blurSuspect) technical -= 35;
  if (hints.darkSuspect) technical -= 20;
  if (hints.overexposedSuspect) technical -= 20;

  const marine = (hints.marineSubjectConfidence ?? 0.5) * 100;
  const marketing = clamp(
    marine * 0.55 +
      technical * 0.25 +
      (hints.hasBeforeAfterContext ? 15 : 0) +
      (hints.luxuryCues ? 10 : 0),
  );
  const seo = clamp(marketing * 0.7 + (hints.hasBeforeAfterContext ? 20 : 5));
  const commercial = clamp(marketing * 0.8 + (hints.luxuryCues ? 12 : 0));
  const visualImpact = clamp(technical * 0.4 + marketing * 0.6);
  const professional = clamp(technical * 0.6 + marine * 0.3);
  const luxury = clamp(
    (hints.luxuryCues ? 70 : 35) + technical * 0.2 + marine * 0.1,
  );
  const privacyPenalty = (hints.privacyRiskCount ?? 0) * 12;
  const website = clamp(marketing - privacyPenalty);
  const advertising = clamp(commercial - privacyPenalty * 0.5);
  const social = clamp(visualImpact * 0.7 + marketing * 0.3 - privacyPenalty);

  const overall = clamp(
    (technical +
      marketing +
      seo +
      commercial +
      visualImpact +
      professional +
      luxury +
      website +
      advertising +
      social) /
      10,
  );

  return {
    technical: clamp(technical),
    marketing,
    seo,
    commercial,
    visualImpact,
    professional,
    luxury,
    website,
    advertising,
    social,
    overall,
  };
}

export function isWebsiteReady(scores: ScoreBreakdown | undefined): boolean {
  return Boolean(scores && scores.website >= 70 && scores.overall >= 65);
}

export function isSocialReady(scores: ScoreBreakdown | undefined): boolean {
  return Boolean(scores && scores.social >= 65 && scores.overall >= 60);
}

export function isSeoReady(scores: ScoreBreakdown | undefined): boolean {
  return Boolean(scores && scores.seo >= 65);
}
