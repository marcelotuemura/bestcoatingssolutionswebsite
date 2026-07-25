import type { PublisherAdapter } from '@/lib/media-intelligence/publishers/contract';
import { websitePublisherAdapter } from '@/lib/media-intelligence/publishers/website';
import { socialPublisherAdapter } from '@/lib/media-intelligence/publishers/social';
import { googleBusinessPublisherAdapter } from '@/lib/media-intelligence/publishers/google-business';
import type { Phase6PublishTarget } from '@/lib/media-intelligence/publishers/types';

const adapters: Record<Phase6PublishTarget, PublisherAdapter> = {
  website: websitePublisherAdapter,
  social: socialPublisherAdapter,
  google_business: googleBusinessPublisherAdapter,
};

export function getPublisherAdapter(
  target: Phase6PublishTarget,
): PublisherAdapter {
  return adapters[target];
}

export function listPublisherAdapters(): readonly PublisherAdapter[] {
  return Object.values(adapters);
}
