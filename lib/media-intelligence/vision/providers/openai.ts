import type {
  VisionAnalysisInput,
  VisionProvider,
} from '@/lib/media-intelligence/vision/provider';
import type { AssetVisionAnalysis } from '@/lib/media-intelligence/vision/schema';

/**
 * Future OpenAI vision provider — interface / stub only for Phase 4.
 * Not wired for live API calls. System must depend on VisionProvider only.
 */
export class OpenAIVisionProvider implements VisionProvider {
  readonly id = 'openai' as const;
  readonly displayName = 'OpenAI Vision Provider (future)';
  private readonly options: {
    readonly apiKey?: string;
    readonly model?: string;
  };

  constructor(
    options: {
      readonly apiKey?: string;
      readonly model?: string;
    } = {},
  ) {
    this.options = options;
  }

  async analyze(_input: VisionAnalysisInput): Promise<AssetVisionAnalysis> {
    void this.options;
    throw new Error(
      'OpenAIVisionProvider is not implemented in Phase 4. Use MockVisionProvider (VISION_PROVIDER=mock) until Phase 4+ provider integration.',
    );
  }
}
