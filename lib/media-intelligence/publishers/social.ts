import type { PublisherAdapter } from '@/lib/media-intelligence/publishers/contract';

/**
 * Generic social draft adapter.
 * Stops at draft_ready when provider credentials are unavailable.
 */
export const socialPublisherAdapter: PublisherAdapter = {
  target: 'social',
  displayName: 'Social draft scheduler',
  normalize({ payload }) {
    if (payload.kind !== 'social') {
      return { ok: false, error: 'Social adapter requires social payload.' };
    }
    return {
      ok: true,
      payload,
      destinationRef: `social:${payload.platform}:${payload.destinationAccountRef}`,
      providerDeliveryStatus: 'not_configured',
      providerMetadata: {
        platform: payload.platform,
        providerConfigured: false,
        autoPublish: false,
      },
    };
  },
  execute({ payload, jobId }) {
    if (payload.kind !== 'social') {
      return { ok: false, error: 'Invalid payload for social adapter.' };
    }
    return {
      ok: true,
      externallyDelivered: false,
      providerDeliveryStatus: 'draft_ready',
      providerMetadata: {
        platform: payload.platform,
        jobId,
        providerConfigured: false,
        note: 'Social draft normalized — no external post was created.',
      },
      message:
        'Social draft ready. External provider is not configured; nothing was posted.',
    };
  },
};
