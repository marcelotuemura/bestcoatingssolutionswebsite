import type { PublisherAdapter } from '@/lib/media-intelligence/publishers/contract';
import { assertNoPersistedSignedUrl } from '@/lib/media-intelligence/publishers/validation';

/**
 * Google Business Profile draft adapter.
 * Never claims GBP API delivery without a configured integration.
 */
export const googleBusinessPublisherAdapter: PublisherAdapter = {
  target: 'google_business',
  displayName: 'Google Business Profile drafts',
  normalize({ payload }) {
    if (payload.kind !== 'google_business') {
      return {
        ok: false,
        error: 'Google Business adapter requires google_business payload.',
      };
    }
    if (payload.ctaUrl && !assertNoPersistedSignedUrl(payload.ctaUrl)) {
      return {
        ok: false,
        error: 'CTA URL must not contain signed URL tokens.',
      };
    }
    return {
      ok: true,
      payload,
      destinationRef: `gbp:${payload.locationRef}`,
      providerDeliveryStatus: 'not_configured',
      providerMetadata: {
        locationRef: payload.locationRef,
        postType: payload.postType,
        providerConfigured: false,
        autoPublish: false,
      },
    };
  },
  execute({ payload, jobId }) {
    if (payload.kind !== 'google_business') {
      return {
        ok: false,
        error: 'Invalid payload for Google Business adapter.',
      };
    }
    return {
      ok: true,
      externallyDelivered: false,
      providerDeliveryStatus: 'draft_ready',
      providerMetadata: {
        locationRef: payload.locationRef,
        jobId,
        providerConfigured: false,
        note: 'GBP draft prepared — no Google Business API call was made.',
      },
      message:
        'Google Business draft ready. Provider is not configured; nothing was posted.',
    };
  },
};
