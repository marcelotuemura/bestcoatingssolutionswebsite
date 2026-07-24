import type { VisionProvider } from '@/lib/media-intelligence/vision/provider';
import { MockVisionProvider } from '@/lib/media-intelligence/vision/providers/mock';
import { OpenAIVisionProvider } from '@/lib/media-intelligence/vision/providers/openai';
import type { VisionProviderId } from '@/lib/media-intelligence/vision/schema';

export function resolveVisionProviderId(
  configured = process.env.VISION_PROVIDER?.trim(),
): VisionProviderId {
  if (configured === 'openai') return 'openai';
  return 'mock';
}

/**
 * Factory — callers depend on VisionProvider, never concrete classes.
 */
export function createVisionProvider(
  id: VisionProviderId = resolveVisionProviderId(),
): VisionProvider {
  switch (id) {
    case 'openai':
      return new OpenAIVisionProvider({
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_VISION_MODEL ?? 'gpt-4o',
      });
    case 'mock':
    default:
      return new MockVisionProvider();
  }
}

let cached: VisionProvider | null = null;

export function getVisionProvider(): VisionProvider {
  if (!cached) {
    cached = createVisionProvider();
  }
  return cached;
}

/** Test helper */
export function __resetVisionProviderForTests(): void {
  cached = null;
}
