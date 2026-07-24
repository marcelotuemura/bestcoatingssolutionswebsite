/**
 * Media Intelligence Platform — domain configuration.
 * Internal DAMS only. Never linked from public marketing nav.
 */

export const mediaIntelligenceConfig = {
  routePrefix: '/media',
  /**
   * When false in production, `/media` returns 404.
   * Local/dev may enable via MEDIA_INTELLIGENCE_ENABLED=true.
   */
  enabledEnvKey: 'MEDIA_INTELLIGENCE_ENABLED',
  maxImportBatch: 200,
  supportedImageMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
    'image/tiff',
    'image/bmp',
    'image/x-canon-cr2',
    'image/x-nikon-nef',
  ] as const,
  supportedVideoMimeTypes: ['video/mp4', 'video/quicktime'] as const,
  scoreLabels: [
    'technical',
    'marketing',
    'seo',
    'commercial',
    'visualImpact',
    'professional',
    'luxury',
    'website',
    'advertising',
    'social',
    'overall',
  ] as const,
  roles: [
    'administrator',
    'marketing',
    'sales',
    'technician',
    'viewer',
  ] as const,
} as const;

export type MediaIntelligenceConfig = typeof mediaIntelligenceConfig;

export function isMediaIntelligenceEnabled(): boolean {
  if (process.env.MEDIA_INTELLIGENCE_ENABLED === 'true') {
    return true;
  }
  // Allow local exploration without production exposure.
  return process.env.NODE_ENV !== 'production';
}
