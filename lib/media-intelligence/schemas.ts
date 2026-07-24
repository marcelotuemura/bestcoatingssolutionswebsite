import { z } from 'zod';

/** Asset lifecycle — publication is never automatic. */
export const assetWorkflowStatusSchema = z.enum([
  'imported',
  'analyzed',
  'optimized',
  'pending_approval',
  'approved',
  'rejected',
  'archived',
  'hidden',
  'scheduled',
  'published_website',
  'published_portfolio',
  'published_service_page',
  'published_blog',
  'published_gallery',
  'published_social',
  'published_google_business',
]);

export const imageTypeSchema = z.enum([
  'before',
  'during',
  'after',
  'detail',
  'context',
  'material',
  'unknown',
]);

export const boatCategorySchema = z.enum([
  'center_console',
  'cabin',
  'fishing',
  'pontoon',
  'sport_boat',
  'luxury_yacht',
  'commercial',
  'unknown',
]);

export const damageTypeSchema = z.enum([
  'scratch',
  'impact',
  'crack',
  'hole',
  'structural',
  'gelcoat',
  'fiberglass',
  'delamination',
  'stress_crack',
  'water_damage',
  'blister',
  'paint_failure',
  'collision',
  'fire',
  'unknown',
]);

export const repairTypeSchema = z.enum([
  'gelcoat',
  'fiberglass',
  'composite',
  'fairing',
  'color_matching',
  'painting',
  'spraying',
  'buffing',
  'wet_sanding',
  'structural',
  'bottom_paint',
  'hardware_removal',
  'rigging',
  'polishing',
  'unknown',
]);

export const severitySchema = z.enum(['low', 'moderate', 'high', 'critical']);

export const privacyRiskSchema = z.enum([
  'faces',
  'license_plates',
  'registration_numbers',
  'home_addresses',
  'business_addresses',
  'phone_numbers',
  'email',
  'documents',
  'personal_information',
]);

export const privacySuggestionSchema = z.enum([
  'blur',
  'crop',
  'mask',
  'reject',
]);

export const qcRejectReasonSchema = z.enum([
  'blur',
  'dark',
  'overexposed',
  'camera_mistake',
  'ground',
  'sky',
  'pocket',
  'finger',
  'accidental',
  'poor_composition',
]);

export const mediaRoleSchema = z.enum([
  'administrator',
  'marketing',
  'sales',
  'technician',
  'viewer',
]);

export const scoreBreakdownSchema = z.object({
  technical: z.number().min(0).max(100),
  marketing: z.number().min(0).max(100),
  seo: z.number().min(0).max(100),
  commercial: z.number().min(0).max(100),
  visualImpact: z.number().min(0).max(100),
  professional: z.number().min(0).max(100),
  luxury: z.number().min(0).max(100),
  website: z.number().min(0).max(100),
  advertising: z.number().min(0).max(100),
  social: z.number().min(0).max(100),
  overall: z.number().min(0).max(100),
});

export const boatIdentificationSchema = z.object({
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  approximateYear: z.number().int().optional(),
  category: boatCategorySchema.default('unknown'),
  lengthFeet: z.number().positive().optional(),
  hullColor: z.string().optional(),
  propulsion: z.string().optional(),
  engineCount: z.number().int().nonnegative().optional(),
  confidence: z.number().min(0).max(1),
});

export const damageFindingSchema = z.object({
  type: damageTypeSchema,
  severity: severitySchema,
  confidence: z.number().min(0).max(1),
  notes: z.string().optional(),
});

export const repairFindingSchema = z.object({
  type: repairTypeSchema,
  confidence: z.number().min(0).max(1),
  notes: z.string().optional(),
});

export const derivativeKindSchema = z.enum([
  'webp',
  'avif',
  'thumbnail',
  'retina',
  'mobile',
  'desktop',
]);

export const mediaDerivativeSchema = z.object({
  id: z.string(),
  kind: derivativeKindSchema,
  storageKey: z.string(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  bytes: z.number().int().nonnegative().optional(),
  createdAt: z.string(),
});

export const auditEventSchema = z.object({
  id: z.string(),
  at: z.string(),
  actor: z.string(),
  action: z.string(),
  fromStatus: assetWorkflowStatusSchema.optional(),
  toStatus: assetWorkflowStatusSchema.optional(),
  note: z.string().optional(),
});

export const mediaAssetSchema = z.object({
  id: z.string(),
  originalFilename: z.string(),
  optimizedFilename: z.string().optional(),
  originalStorageKey: z.string(),
  mimeType: z.string(),
  bytes: z.number().int().nonnegative(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  capturedAt: z.string().optional(),
  importedAt: z.string(),
  projectId: z.string().optional(),
  boat: boatIdentificationSchema.optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  repairTypes: z.array(repairTypeSchema).default([]),
  damageTypes: z.array(damageTypeSchema).default([]),
  imageType: imageTypeSchema.default('unknown'),
  scores: scoreBreakdownSchema.optional(),
  status: assetWorkflowStatusSchema.default('imported'),
  websiteStatus: z
    .enum(['none', 'ready', 'scheduled', 'published'])
    .default('none'),
  socialStatus: z
    .enum(['none', 'ready', 'scheduled', 'published'])
    .default('none'),
  keywords: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  location: z.string().optional(),
  technician: z.string().optional(),
  notes: z.string().optional(),
  privacyRisks: z.array(privacyRiskSchema).default([]),
  privacySuggestions: z.array(privacySuggestionSchema).default([]),
  qcRejectReasons: z.array(qcRejectReasonSchema).default([]),
  duplicateOf: z.string().optional(),
  nearDuplicateGroupId: z.string().optional(),
  derivatives: z.array(mediaDerivativeSchema).default([]),
  audit: z.array(auditEventSchema).default([]),
  /** Seed/demo flag — never treat as real published BCS work. */
  isDemoSeed: z.boolean().default(false),
});

export const mediaProjectSchema = z.object({
  id: z.string(),
  projectNumber: z.string(),
  title: z.string(),
  boat: boatIdentificationSchema.optional(),
  repairTypes: z.array(repairTypeSchema).default([]),
  damageTypes: z.array(damageTypeSchema).default([]),
  assetIds: z.array(z.string()).default([]),
  beforeAssetIds: z.array(z.string()).default([]),
  duringAssetIds: z.array(z.string()).default([]),
  afterAssetIds: z.array(z.string()).default([]),
  timelineStart: z.string().optional(),
  timelineEnd: z.string().optional(),
  confidence: z.number().min(0).max(1).default(0),
  status: assetWorkflowStatusSchema.default('imported'),
  location: z.string().optional(),
  technician: z.string().optional(),
  notes: z.string().optional(),
  isDemoSeed: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const caseStudyDraftSchema = z.object({
  projectId: z.string(),
  title: z.string(),
  summary: z.string(),
  damage: z.string(),
  repairProcess: z.string(),
  materials: z.array(z.string()),
  techniques: z.array(z.string()),
  estimatedLabor: z.string(),
  challenges: z.string(),
  finalResult: z.string(),
  seoTitle: z.string(),
  metaDescription: z.string(),
  keywords: z.array(z.string()),
  altTexts: z.array(z.string()),
  captions: z.array(z.string()),
  blogArticleDraft: z.string(),
  insuranceSummary: z.string(),
  requiresOwnerApproval: z.literal(true),
});

export const seoPackageSchema = z.object({
  assetId: z.string(),
  optimizedFilename: z.string(),
  title: z.string(),
  altText: z.string(),
  caption: z.string(),
  description: z.string(),
  metaDescription: z.string(),
  keywords: z.array(z.string()),
  openGraphHints: z.object({
    title: z.string(),
    description: z.string(),
  }),
});

export const socialDraftSchema = z.object({
  projectId: z.string(),
  platform: z.enum([
    'instagram',
    'facebook',
    'linkedin',
    'google_business',
    'x',
    'threads',
    'pinterest',
  ]),
  caption: z.string(),
  hashtags: z.array(z.string()),
  imageAssetIds: z.array(z.string()),
  carouselOrder: z.array(z.string()),
  callToAction: z.string(),
  seoKeywords: z.array(z.string()),
  scheduledFor: z.string().optional(),
  requiresOwnerApproval: z.literal(true),
});

export type AssetWorkflowStatus = z.infer<typeof assetWorkflowStatusSchema>;
export type ImageType = z.infer<typeof imageTypeSchema>;
export type BoatCategory = z.infer<typeof boatCategorySchema>;
export type DamageType = z.infer<typeof damageTypeSchema>;
export type RepairType = z.infer<typeof repairTypeSchema>;
export type Severity = z.infer<typeof severitySchema>;
export type PrivacyRisk = z.infer<typeof privacyRiskSchema>;
export type PrivacySuggestion = z.infer<typeof privacySuggestionSchema>;
export type QcRejectReason = z.infer<typeof qcRejectReasonSchema>;
export type MediaRole = z.infer<typeof mediaRoleSchema>;
export type ScoreBreakdown = z.infer<typeof scoreBreakdownSchema>;
export type BoatIdentification = z.infer<typeof boatIdentificationSchema>;
export type DamageFinding = z.infer<typeof damageFindingSchema>;
export type RepairFinding = z.infer<typeof repairFindingSchema>;
export type MediaDerivative = z.infer<typeof mediaDerivativeSchema>;
export type AuditEvent = z.infer<typeof auditEventSchema>;
export type MediaAsset = z.infer<typeof mediaAssetSchema>;
export type MediaProject = z.infer<typeof mediaProjectSchema>;
export type CaseStudyDraft = z.infer<typeof caseStudyDraftSchema>;
export type SeoPackage = z.infer<typeof seoPackageSchema>;
export type SocialDraft = z.infer<typeof socialDraftSchema>;
