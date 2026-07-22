import type { MarineServiceSlug } from '@/config/marine-services';

/** Contact inquiry types — marine-focused; no aviation estimates. */
export const contactInquiryTypes = [
  'general',
  'marine-service',
  'estimate-follow-up',
  'partnership',
  'other',
] as const;

export type ContactInquiryType = (typeof contactInquiryTypes)[number];

export const preferredContactMethods = ['phone', 'email', 'either'] as const;
export type PreferredContactMethod = (typeof preferredContactMethods)[number];

/** Estimate service options: catalogue + catch-all. No aviation. */
export type EstimateServiceOption = MarineServiceSlug | 'other-marine-repair';

export const estimateServiceOptions: readonly EstimateServiceOption[] = [
  'gelcoat-repair',
  'fiberglass-repair',
  'paint-refinishing',
  'hull-restoration',
  'yacht-cosmetic-repair',
  'structural-composite-repair',
  'color-matching',
  'insurance-repair',
  'other-marine-repair',
] as const;

export const vesselOperabilityOptions = [
  'fully-operational',
  'limited',
  'not-operational',
  'unknown',
] as const;
export type VesselOperability = (typeof vesselOperabilityOptions)[number];

export const urgencyOptions = ['flexible', 'soon', 'time-sensitive'] as const;
export type UrgencyOption = (typeof urgencyOptions)[number];

export const affectedAreaOptions = [
  'small',
  'medium',
  'large',
  'unsure',
] as const;
export type AffectedAreaOption = (typeof affectedAreaOptions)[number];
