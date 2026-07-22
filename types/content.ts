/**
 * Shared domain types for media, case studies, and social — monorepo-ready.
 * No runtime code; prefer Zod-inferred types when validation schemas land.
 */

export type MediaType = 'image' | 'video' | 'timelapse';

export type MediaShotType =
  | 'drone'
  | 'exterior'
  | 'interior'
  | 'night'
  | 'reflection'
  | 'waterline'
  | 'macro'
  | 'gelcoat'
  | 'painter'
  | 'before'
  | 'after'
  | 'process'
  | 'timelapse'
  | 'video'
  | 'other';

export type MediaOrientation = 'horizontal' | 'vertical' | 'square';

export type MediaUsage = 'hero' | 'case' | 'detail' | 'social' | 'og' | 'thumb';

export interface MediaAsset {
  readonly id: string;
  readonly src: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
  readonly type: MediaType;
  readonly shotType?: MediaShotType;
  readonly division?: 'marine' | 'aviation';
  readonly orientation?: MediaOrientation;
  readonly usage?: readonly MediaUsage[];
  readonly credit?: string;
  /** Internal permission reference — not shown publicly. */
  readonly permissionRef?: string;
  /** When true, UI must treat as non-production placeholder. */
  readonly placeholder?: boolean;
}

export interface BeforeAfterPair {
  readonly id: string;
  readonly title: string;
  readonly division: 'marine' | 'aviation';
  readonly before: MediaAsset;
  readonly after: MediaAsset;
  readonly location?: string;
  readonly summary?: string;
}

export interface CaseStudyCustomer {
  readonly label: string;
  readonly name?: string;
  readonly attributionPermitted: boolean;
}

export interface CaseStudy {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly division: 'marine' | 'aviation';
  readonly problem: string;
  readonly repair: string;
  readonly process: string;
  readonly time?: string;
  readonly result: string;
  readonly customer?: CaseStudyCustomer;
  readonly location?: string;
  readonly services: readonly string[];
  readonly photos: readonly MediaAsset[];
  readonly beforeAfter?: readonly BeforeAfterPair[];
  readonly video?: readonly MediaAsset[];
  readonly timelapse?: readonly MediaAsset[];
  readonly featured?: boolean;
  readonly published: boolean;
  readonly seoDescription?: string;
}
