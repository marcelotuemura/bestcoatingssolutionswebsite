/**
 * Media Intelligence Platform — domain configuration & access policy.
 * Internal DAMS only. Never linked from public marketing nav.
 *
 * MEDIA_INTELLIGENCE_ENABLED is an availability flag only — never authentication.
 */

export const mediaIntelligenceConfig = {
  routePrefix: '/media',
  loginPath: '/media/login',
  sessionCookieName: 'bcs_media_session',
  /** Session lifetime (12 hours). */
  sessionTtlSeconds: 60 * 60 * 12,
  maxImportBatch: 200,
  loginRateLimit: {
    windowMs: 60_000,
    maxAttempts: 8,
  },
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
  /** Future RBAC roles — foundation temporary session is owner-only. */
  roles: [
    'administrator',
    'marketing',
    'sales',
    'technician',
    'viewer',
  ] as const,
  /**
   * Phase 4 vision — provider selection via VISION_PROVIDER (mock|openai).
   * Default mock for CI/dev. OpenAI is stub-only until keys + integration land.
   */
  vision: {
    defaultProvider: 'mock' as const,
    analysisVersion: '1.0.0' as const,
    storeFilename: 'ai_analysis.json' as const,
  },
} as const;

export type MediaIntelligenceConfig = typeof mediaIntelligenceConfig;

export type MediaRuntimeEnvironment = 'development' | 'preview' | 'production';

export function getMediaRuntimeEnvironment(): MediaRuntimeEnvironment {
  const vercelEnv = process.env.VERCEL_ENV?.trim();
  if (vercelEnv === 'preview') return 'preview';
  if (vercelEnv === 'production') return 'production';
  if (process.env.NODE_ENV === 'production') return 'production';
  return 'development';
}

/** Availability flag only — never treats enablement as authentication. */
export function isMediaIntelligenceEnabled(): boolean {
  return process.env.MEDIA_INTELLIGENCE_ENABLED === 'true';
}

function secretPresent(key: string): boolean {
  const value = process.env[key];
  return typeof value === 'string' && value.trim().length >= 16;
}

/**
 * Preview/Production require both secrets when enabled.
 * Development may use local bypass without secrets when explicitly opted in.
 */
export function mediaAccessSecretsConfigured(): boolean {
  return (
    secretPresent('MEDIA_INTELLIGENCE_ACCESS_SECRET') &&
    secretPresent('MEDIA_INTELLIGENCE_SESSION_SECRET')
  );
}

/**
 * Local-only bypass — NEVER active on Vercel Preview/Production or NODE_ENV production.
 */
export function isMediaLocalAuthBypass(): boolean {
  if (getMediaRuntimeEnvironment() !== 'development') {
    return false;
  }
  return process.env.MEDIA_INTELLIGENCE_LOCAL_BYPASS === 'true';
}

export type MediaAccessGateResult =
  | { readonly ok: true; readonly mode: 'authenticated' | 'local-bypass' }
  | { readonly ok: false; readonly reason: string; readonly status: 404 | 503 };

/**
 * Fail-closed gate for exposing `/media` and mutating Server Actions.
 * Feature flag alone is never sufficient in Preview/Production.
 */
export function evaluateMediaAccessGate(): MediaAccessGateResult {
  if (!isMediaIntelligenceEnabled()) {
    return {
      ok: false,
      reason: 'Media Intelligence is disabled.',
      status: 404,
    };
  }

  const env = getMediaRuntimeEnvironment();
  if (env === 'development' && isMediaLocalAuthBypass()) {
    return { ok: true, mode: 'local-bypass' };
  }

  if (!mediaAccessSecretsConfigured()) {
    // Fail closed — never silently expose the studio.
    return {
      ok: false,
      reason:
        'Media Intelligence access secrets are missing or too short. Set MEDIA_INTELLIGENCE_ACCESS_SECRET and MEDIA_INTELLIGENCE_SESSION_SECRET (min 16 chars).',
      status: env === 'development' ? 503 : 404,
    };
  }

  return { ok: true, mode: 'authenticated' };
}
