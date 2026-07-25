import { z } from 'zod';
import {
  imageTypeSchema,
  privacyRiskSchema,
  privacySuggestionSchema,
} from '@/lib/media-intelligence/schemas';

/**
 * Phase 4 AI metadata schema.
 * Stored separately from deterministic catalog / vault records.
 * Analysis never mutates originals or auto-publishes.
 */

export const VISION_ANALYSIS_VERSION = '1.0.0' as const;

export const visionProviderIdSchema = z.enum(['mock', 'openai']);

export const serviceCategorySchema = z.enum([
  'ceramic_coating',
  'wet_sanding',
  'buffing',
  'gelcoat_repair',
  'fiberglass_repair',
  'hull_painting',
  'bottom_paint',
  'oxidation_removal',
  'detail_work',
  'paint_correction',
  'unknown',
]);

export const environmentTypeSchema = z.enum([
  'marina',
  'shop',
  'trailer',
  'water',
  'unknown',
]);

export const viewContextSchema = z.enum(['interior', 'exterior', 'unknown']);

export const scoredLabelSchema = z.object({
  value: z.string().min(1),
  confidence: z.number().min(0).max(1),
});

export const visionBoatDetectionsSchema = z.object({
  manufacturer: scoredLabelSchema.optional(),
  model: scoredLabelSchema.optional(),
  hullColor: scoredLabelSchema.optional(),
  superstructureColor: scoredLabelSchema.optional(),
  outboardBrand: scoredLabelSchema.optional(),
  outboardCount: z
    .object({
      value: z.number().int().nonnegative(),
      confidence: z.number().min(0).max(1),
    })
    .optional(),
  trailerPresent: z
    .object({
      value: z.boolean(),
      confidence: z.number().min(0).max(1),
    })
    .optional(),
  viewContext: z
    .object({
      value: viewContextSchema,
      confidence: z.number().min(0).max(1),
    })
    .optional(),
  environment: z
    .object({
      value: environmentTypeSchema,
      confidence: z.number().min(0).max(1),
    })
    .optional(),
});

export const visionServiceDetectionSchema = z.object({
  category: serviceCategorySchema,
  confidence: z.number().min(0).max(1),
  notes: z.string().optional(),
});

export const visionStageInferenceSchema = z.object({
  stage: imageTypeSchema,
  confidence: z.number().min(0).max(1),
});

export const visionQualityMetricsSchema = z.object({
  sharpness: z.number().min(0).max(100),
  exposure: z.number().min(0).max(100),
  blur: z.number().min(0).max(100),
  noise: z.number().min(0).max(100),
  composition: z.number().min(0).max(100),
  orientationScore: z.number().min(0).max(100),
  duplicateConfidence: z.number().min(0).max(1),
  marketingSuitability: z.number().min(0).max(100),
  heroSuitability: z.number().min(0).max(100),
  /** Weighted, explainable overall quality (0–100). */
  overall: z.number().min(0).max(100),
  explanation: z.array(z.string()).default([]),
});

export const visionPrivacyFindingSchema = z.object({
  risk: privacyRiskSchema,
  confidence: z.number().min(0).max(1),
  requiresOwnerReview: z.literal(true),
  suggestion: privacySuggestionSchema.optional(),
  notes: z.string().optional(),
});

export const visionPrivacyAnalysisSchema = z.object({
  findings: z.array(visionPrivacyFindingSchema).default([]),
  requiresOwnerReview: z.boolean(),
  /** Always true — vision never auto-blurs or modifies originals. */
  neverAutoModifyOriginal: z.literal(true),
  blockAutoPublish: z.literal(true),
});

/**
 * Full structured analysis for one asset.
 * Deterministic catalog fields remain the source of truth for Phase 2 UI;
 * this record is an AI overlay only.
 */
export const assetVisionAnalysisSchema = z.object({
  assetId: z.string().min(1),
  analysisVersion: z.string().min(1),
  analyzedAt: z.string().min(1),
  provider: visionProviderIdSchema,
  providerModel: z.string().optional(),
  confidence: z.number().min(0).max(1),
  boat: visionBoatDetectionsSchema.default({}),
  services: z.array(visionServiceDetectionSchema).default([]),
  stage: visionStageInferenceSchema,
  quality: visionQualityMetricsSchema,
  privacy: visionPrivacyAnalysisSchema,
  keywords: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
  /** Optional path analyzed (derivative preferred); never an original mutation target. */
  analyzedRelativePath: z.string().optional(),
});

export const aiAnalysisStoreSchema = z.object({
  generatedAt: z.string(),
  version: z.string().default(VISION_ANALYSIS_VERSION),
  provider: visionProviderIdSchema.optional(),
  source: z.string().optional(),
  analyses: z.array(assetVisionAnalysisSchema),
});

export const projectEnrichmentSuggestionSchema = z.object({
  projectId: z.string(),
  missingStages: z.array(imageTypeSchema).default([]),
  relatedAssetIds: z.array(z.string()).default([]),
  suggestedCoverAssetId: z.string().optional(),
  suggestedTimelineOrder: z.array(z.string()).default([]),
  similarityNotes: z.array(z.string()).default([]),
  /** Suggestions only — never auto-applied to project grouping. */
  autoApply: z.literal(false),
});

export type VisionProviderId = z.infer<typeof visionProviderIdSchema>;
export type ServiceCategory = z.infer<typeof serviceCategorySchema>;
export type EnvironmentType = z.infer<typeof environmentTypeSchema>;
export type ViewContext = z.infer<typeof viewContextSchema>;
export type ScoredLabel = z.infer<typeof scoredLabelSchema>;
export type VisionBoatDetections = z.infer<typeof visionBoatDetectionsSchema>;
export type VisionServiceDetection = z.infer<
  typeof visionServiceDetectionSchema
>;
export type VisionStageInference = z.infer<typeof visionStageInferenceSchema>;
export type VisionQualityMetrics = z.infer<typeof visionQualityMetricsSchema>;
export type VisionPrivacyFinding = z.infer<typeof visionPrivacyFindingSchema>;
export type VisionPrivacyAnalysis = z.infer<typeof visionPrivacyAnalysisSchema>;
export type AssetVisionAnalysis = z.infer<typeof assetVisionAnalysisSchema>;
export type AiAnalysisStore = z.infer<typeof aiAnalysisStoreSchema>;
export type ProjectEnrichmentSuggestion = z.infer<
  typeof projectEnrichmentSuggestionSchema
>;
