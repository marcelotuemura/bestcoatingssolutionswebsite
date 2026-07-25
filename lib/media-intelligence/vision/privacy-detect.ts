import type { PrivacyRisk } from '@/lib/media-intelligence/schemas';
import type { VisionAnalysisInput } from '@/lib/media-intelligence/vision/provider';
import type {
  VisionPrivacyAnalysis,
  VisionPrivacyFinding,
} from '@/lib/media-intelligence/vision/schema';

/**
 * Privacy detection for vision analysis.
 * Flags assets for owner review — never auto-blurs or modifies originals.
 */
export function detectVisionPrivacy(
  input: VisionAnalysisInput,
): VisionPrivacyAnalysis {
  const findings: VisionPrivacyFinding[] = [];
  const haystack = [
    input.filename,
    input.deterministic?.folder ?? '',
    input.deterministic?.projectName ?? '',
    ...(input.deterministic?.keywords ?? []),
    ...(input.deterministic?.privacyIssues ?? []),
  ]
    .join(' ')
    .toLowerCase();

  const push = (
    risk: PrivacyRisk,
    confidence: number,
    notes: string,
    suggestion?: VisionPrivacyFinding['suggestion'],
  ) => {
    findings.push({
      risk,
      confidence,
      requiresOwnerReview: true,
      suggestion,
      notes,
    });
  };

  if (
    /(^|[^a-z0-9])(face|faces|person|people|crew|customer)([^a-z0-9]|$)/.test(
      haystack,
    ) ||
    haystack.includes('portrait_person')
  ) {
    push('faces', 0.72, 'Possible face / person visible', 'blur');
  }
  if (/(^|[^a-z0-9])(plate|license|licence)([^a-z0-9]|$)/.test(haystack)) {
    push('license_plates', 0.7, 'Possible vehicle license plate', 'blur');
  }
  if (
    /(^|[^a-z0-9])(registration|reg_?no|hull.?id|hin)([^a-z0-9]|$)/.test(
      haystack,
    )
  ) {
    push(
      'registration_numbers',
      0.68,
      'Possible boat registration / HIN',
      'mask',
    );
  }
  if (
    /(^|[^a-z0-9])(address|street|driveway|residence)([^a-z0-9]|$)/.test(
      haystack,
    )
  ) {
    push('home_addresses', 0.55, 'Possible residential context', 'crop');
  }
  if (
    /(^|[^a-z0-9])(phone|email|ssn|passport|id.?card|document)([^a-z0-9]|$)/.test(
      haystack,
    )
  ) {
    push(
      'personal_information',
      0.6,
      'Possible personal information cues',
      'mask',
    );
  }
  if (/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(haystack)) {
    push('email', 0.9, 'Email pattern detected in metadata text', 'reject');
  }
  if (/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/.test(haystack)) {
    push(
      'phone_numbers',
      0.85,
      'Phone pattern detected in metadata text',
      'mask',
    );
  }

  return {
    findings,
    requiresOwnerReview: findings.length > 0,
    neverAutoModifyOriginal: true,
    blockAutoPublish: true,
  };
}
