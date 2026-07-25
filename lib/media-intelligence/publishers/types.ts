/**
 * Phase 6 — Publisher domain types.
 * Never auto-publish. Never claim external delivery without provider proof.
 */

import { z } from 'zod';
import { publishTargetSchema } from '@/lib/media-intelligence/schemas';

/** Phase 6 targets (subset of PublishTarget). */
export const phase6PublishTargetSchema = z.enum([
  'website',
  'social',
  'google_business',
]);
export type Phase6PublishTarget = z.infer<typeof phase6PublishTargetSchema>;

export const publicationJobStatusSchema = z.enum([
  'draft',
  'awaiting_approval',
  'approved',
  'scheduled',
  'publishing',
  'published',
  'failed',
  'cancelled',
]);
export type PublicationJobStatus = z.infer<typeof publicationJobStatusSchema>;

export const providerDeliveryStatusSchema = z.enum([
  'not_configured',
  'draft_ready',
  'queued',
  'delivered',
  'failed',
]);
export type ProviderDeliveryStatus = z.infer<
  typeof providerDeliveryStatusSchema
>;

export const websitePlacementSchema = z.enum([
  'home_hero',
  'portfolio',
  'service_page',
  'blog',
  'gallery',
  'before_after',
]);
export type WebsitePlacement = z.infer<typeof websitePlacementSchema>;

export const websiteDraftPayloadSchema = z.object({
  kind: z.literal('website'),
  placement: websitePlacementSchema,
  title: z.string().min(1).max(200),
  caption: z.string().max(2000).optional(),
  altText: z.string().min(1).max(300),
  ctaLabel: z.string().max(80).optional(),
  ctaHref: z.string().max(500).optional(),
  derivativeKind: z
    .enum(['thumbnail', 'webp', 'avif', 'retina', 'mobile', 'desktop'])
    .default('webp'),
});
export type WebsiteDraftPayload = z.infer<typeof websiteDraftPayloadSchema>;

export const socialDraftPayloadSchema = z.object({
  kind: z.literal('social'),
  platform: z.enum([
    'instagram',
    'facebook',
    'linkedin',
    'x',
    'threads',
    'pinterest',
  ]),
  destinationAccountRef: z.string().min(1).max(120),
  caption: z.string().min(1).max(2200),
  hashtags: z.array(z.string().max(60)).max(30).default([]),
  campaignTags: z.array(z.string().max(60)).max(20).default([]),
});
export type SocialDraftPayload = z.infer<typeof socialDraftPayloadSchema>;

export const googleBusinessDraftPayloadSchema = z.object({
  kind: z.literal('google_business'),
  locationRef: z.string().min(1).max(120),
  postType: z.enum(['update', 'event', 'offer', 'product']),
  summary: z.string().min(1).max(1500),
  ctaType: z
    .enum(['none', 'book', 'order', 'shop', 'learn_more', 'sign_up', 'call'])
    .default('learn_more'),
  ctaUrl: z.string().max(500).optional(),
  eventStart: z.string().datetime().optional(),
  eventEnd: z.string().datetime().optional(),
});
export type GoogleBusinessDraftPayload = z.infer<
  typeof googleBusinessDraftPayloadSchema
>;

export const publicationPayloadSchema = z.discriminatedUnion('kind', [
  websiteDraftPayloadSchema,
  socialDraftPayloadSchema,
  googleBusinessDraftPayloadSchema,
]);
export type PublicationPayload = z.infer<typeof publicationPayloadSchema>;

export const publicationJobSchema = z.object({
  id: z.string(),
  externalId: z.string(),
  assetId: z.string(),
  derivativeId: z.string().optional(),
  target: phase6PublishTargetSchema,
  status: publicationJobStatusSchema,
  providerDeliveryStatus: providerDeliveryStatusSchema,
  payload: publicationPayloadSchema,
  scheduledFor: z.string().datetime().optional(),
  idempotencyKey: z.string().min(8).max(128),
  approvalId: z.string().optional(),
  approvalVersion: z.number().int().positive().optional(),
  destinationRef: z.string().max(200).optional(),
  failureDetail: z.string().max(2000).optional(),
  providerMetadata: z.record(z.unknown()).default({}),
  createdBy: z.string(),
  reviewedBy: z.string().optional(),
  publishedBy: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type PublicationJob = z.infer<typeof publicationJobSchema>;

export const publicationEventSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  actorId: z.string(),
  action: z.string(),
  previousStatus: publicationJobStatusSchema.optional(),
  nextStatus: publicationJobStatusSchema.optional(),
  target: phase6PublishTargetSchema,
  metadata: z.record(z.unknown()).default({}),
  at: z.string(),
});
export type PublicationEvent = z.infer<typeof publicationEventSchema>;

/** Re-export full publish target schema for approval matching. */
export { publishTargetSchema };
