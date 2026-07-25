import type { CatalogAsset } from '@/lib/media-library/catalog-schema';
import type {
  AssetVisionAnalysis,
  VisionProviderId,
} from '@/lib/media-intelligence/vision/schema';

/**
 * Vision provider contract.
 * The rest of the system depends only on this interface.
 *
 * Analysis-only: never modify originals, never publish, never change workflow.
 */
export type VisionAnalysisInput = {
  readonly assetId: string;
  readonly filename: string;
  readonly mimeType: string;
  readonly mediaKind: 'image' | 'video';
  readonly bytes?: number;
  readonly width?: number;
  readonly height?: number;
  readonly orientation?: string;
  /** Deterministic catalog cues (hints only — not AI authority). */
  readonly deterministic?: {
    readonly manufacturer?: string;
    readonly boatName?: string;
    readonly boatType?: string;
    readonly repairCategory?: string;
    readonly stage?: string;
    readonly keywords?: readonly string[];
    readonly folder?: string;
    readonly projectName?: string;
    readonly isExactDuplicate?: boolean;
    readonly isNearDuplicate?: boolean;
    readonly isHeroCandidate?: boolean;
    readonly scores?: {
      readonly website?: number;
      readonly marketing?: number;
      readonly technical?: number;
    };
    readonly privacyIssues?: readonly string[];
  };
  /**
   * Optional bytes or derivative path for content analysis.
   * Prefer derivatives; never write to originals.
   */
  readonly imageBytes?: Uint8Array;
  readonly derivativeRelativePath?: string;
};

export interface VisionProvider {
  readonly id: VisionProviderId;
  readonly displayName: string;
  analyze(input: VisionAnalysisInput): Promise<AssetVisionAnalysis>;
}

export function catalogAssetToVisionInput(
  asset: CatalogAsset,
): VisionAnalysisInput {
  return {
    assetId: asset.id,
    filename: asset.filename,
    mimeType: asset.fileType,
    mediaKind: asset.mediaKind,
    bytes: asset.fileSizeBytes,
    width: asset.width,
    height: asset.height,
    orientation: asset.orientation,
    deterministic: {
      manufacturer: asset.manufacturer,
      boatName: asset.boatName,
      boatType: asset.boatType,
      repairCategory: asset.repairCategory,
      stage: asset.stage,
      keywords: asset.keywords,
      folder: asset.folder,
      projectName: asset.projectName,
      isExactDuplicate: asset.isExactDuplicate,
      isNearDuplicate: asset.isNearDuplicate,
      isHeroCandidate: asset.isHeroCandidate,
      scores: {
        website: asset.scores.website,
        marketing: asset.scores.marketing,
        technical: asset.scores.technical,
      },
      privacyIssues: asset.privacyIssues,
    },
    derivativeRelativePath:
      asset.derivatives?.preview ??
      asset.derivatives?.webp ??
      asset.derivatives?.thumbnails?.[400],
  };
}
