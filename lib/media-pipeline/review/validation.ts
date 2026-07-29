/**
 * Zod validation for inventory review mutations.
 * Never trust FormData casts.
 */

import { z } from 'zod';
import { canMarkPublished } from '@/lib/media-pipeline/archive-rules';
import { checklistHasBlocker } from '@/lib/media-pipeline/privacy';
import type { MediaAssetRecord } from '@/lib/media-pipeline/types';
import {
  mediaAssetStatusSchema,
  mediaCategorySchema,
  mediaDivisionSchema,
  mediaPrivacyStatusSchema,
  mediaPublishStatusSchema,
  mediaQualityStatusSchema,
  mediaStageSchema,
  privacyChecklistSchema,
} from '@/lib/media-pipeline/types';

export const inventoryReviewFormSchema = z.object({
  assetId: z.string().min(1),
  division: mediaDivisionSchema,
  stage: mediaStageSchema,
  category: mediaCategorySchema,
  status: mediaAssetStatusSchema,
  privacyStatus: mediaPrivacyStatusSchema,
  qualityStatus: mediaQualityStatusSchema,
  publishStatus: mediaPublishStatusSchema,
  featured: z.boolean(),
  heroCandidate: z.boolean(),
  altText: z.string().nullable(),
  caption: z.string().nullable(),
  notes: z.string().nullable(),
  privacyChecklist: privacyChecklistSchema,
  privacyReviewedNow: z.boolean(),
});

export type InventoryReviewFormInput = z.infer<
  typeof inventoryReviewFormSchema
>;

function formString(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === 'string' ? v : '';
}

function formBool(formData: FormData, key: string): boolean {
  return formData.get(key) === 'true';
}

export function parseInventoryReviewFormData(
  formData: FormData,
  existing: MediaAssetRecord,
  nowIso: string,
  reviewerId: string,
):
  | { readonly ok: true; readonly data: InventoryReviewFormInput }
  | { readonly ok: false; readonly error: string } {
  const privacyReviewedNow = formBool(formData, 'privacyReviewed');
  const checklist = privacyChecklistSchema.parse({
    visibleFace: formBool(formData, 'privacy_visibleFace'),
    vesselRegistration: formBool(formData, 'privacy_vesselRegistration'),
    hin: formBool(formData, 'privacy_hin'),
    licensePlate: formBool(formData, 'privacy_licensePlate'),
    customerDocument: formBool(formData, 'privacy_customerDocument'),
    invoice: formBool(formData, 'privacy_invoice'),
    address: formBool(formData, 'privacy_address'),
    gpsMetadata: formBool(formData, 'privacy_gpsMetadata'),
    otherPrivateInformation: formBool(
      formData,
      'privacy_otherPrivateInformation',
    ),
    reviewedAt: privacyReviewedNow
      ? nowIso
      : existing.privacyChecklist.reviewedAt,
    reviewedBy: privacyReviewedNow
      ? reviewerId
      : existing.privacyChecklist.reviewedBy,
  });

  const parsed = inventoryReviewFormSchema.safeParse({
    assetId: formString(formData, 'assetId') || existing.id,
    division: formString(formData, 'division') || existing.division,
    stage: formString(formData, 'stage') || existing.stage,
    category: formString(formData, 'category') || existing.category,
    status: formString(formData, 'status') || existing.status,
    privacyStatus:
      formString(formData, 'privacyStatus') || existing.privacyStatus,
    qualityStatus:
      formString(formData, 'qualityStatus') || existing.qualityStatus,
    publishStatus:
      formString(formData, 'publishStatus') || existing.publishStatus,
    featured: formBool(formData, 'featured'),
    heroCandidate: formBool(formData, 'heroCandidate'),
    altText: formString(formData, 'altText') || null,
    caption: formString(formData, 'caption') || null,
    notes: formString(formData, 'notes') || null,
    privacyChecklist: checklist,
    privacyReviewedNow,
  });

  if (!parsed.success) {
    return {
      ok: false,
      error:
        parsed.error.issues.map((i) => i.message).join('; ') ||
        'Invalid review payload',
    };
  }

  return { ok: true, data: parsed.data };
}

/**
 * Business rules after schema validation.
 */
export function assertInventoryReviewBusinessRules(input: {
  readonly data: InventoryReviewFormInput;
  readonly existingAssetId: string;
}): { readonly ok: true } | { readonly ok: false; readonly error: string } {
  const { data, existingAssetId } = input;
  if (data.assetId !== existingAssetId) {
    return { ok: false, error: 'Asset id mismatch' };
  }

  const gate = canMarkPublished(data.privacyStatus, data.publishStatus);
  if (!gate.ok) {
    return { ok: false, error: gate.reason };
  }

  if (data.privacyStatus === 'clear') {
    if (!data.privacyChecklist.reviewedAt) {
      return {
        ok: false,
        error:
          'privacyStatus=clear requires a completed manual privacy review (reviewedAt)',
      };
    }
    if (checklistHasBlocker(data.privacyChecklist)) {
      return {
        ok: false,
        error:
          'privacyStatus=clear is not allowed while privacy checklist blockers are set',
      };
    }
  }

  return { ok: true };
}
