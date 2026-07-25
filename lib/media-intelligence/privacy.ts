import type {
  PrivacyRisk,
  PrivacySuggestion,
} from '@/lib/media-intelligence/schemas';

export interface PrivacyScanInput {
  readonly filename?: string;
  readonly notes?: string;
  readonly detectedLabels?: readonly string[];
}

export interface PrivacyScanResult {
  readonly risks: readonly PrivacyRisk[];
  readonly suggestions: readonly PrivacySuggestion[];
  /** Never auto-publish when true. */
  readonly blockAutoPublish: true;
}

const labelToRisk: Readonly<Record<string, PrivacyRisk>> = {
  face: 'faces',
  faces: 'faces',
  person: 'faces',
  license_plate: 'license_plates',
  plate: 'license_plates',
  registration: 'registration_numbers',
  address: 'home_addresses',
  phone: 'phone_numbers',
  email: 'email',
  document: 'documents',
  id_card: 'personal_information',
};

/**
 * Privacy suggestions only — never auto-blur or publish.
 */
export function scanPrivacyRisks(input: PrivacyScanInput): PrivacyScanResult {
  const risks = new Set<PrivacyRisk>();
  const haystack = [
    input.filename ?? '',
    input.notes ?? '',
    ...(input.detectedLabels ?? []),
  ]
    .join(' ')
    .toLowerCase();

  for (const [needle, risk] of Object.entries(labelToRisk)) {
    if (haystack.includes(needle)) {
      risks.add(risk);
    }
  }

  if (/\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/.test(haystack)) {
    risks.add('phone_numbers');
  }
  if (/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(haystack)) {
    risks.add('email');
  }

  const list = [...risks];
  const suggestions: PrivacySuggestion[] = [];
  if (list.includes('faces') || list.includes('license_plates')) {
    suggestions.push('blur', 'crop');
  }
  if (
    list.includes('documents') ||
    list.includes('personal_information') ||
    list.includes('home_addresses')
  ) {
    suggestions.push('mask', 'reject');
  }
  if (list.length > 0 && suggestions.length === 0) {
    suggestions.push('reject');
  }

  return {
    risks: list,
    suggestions: [...new Set(suggestions)],
    blockAutoPublish: true,
  };
}
