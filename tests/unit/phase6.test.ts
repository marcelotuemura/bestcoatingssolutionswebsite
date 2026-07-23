import { describe, expect, it, beforeEach } from 'vitest';
import { analyticsPrivacy } from '@/config/analytics-privacy';
import {
  canEnablePublicFormDelivery,
  getBlockingLaunchGates,
  getProductionBlockers,
  isDemoSubmissionMode,
  isSubmissionDeliveryEnabled,
} from '@/config/launch';
import {
  getLaunchBlockingLegalDecisions,
  getUnresolvedLegalDecisions,
} from '@/config/legal-decisions';
import {
  getLaunchBlockingOwnerDecisions,
  getUnresolvedOwnerDecisions,
} from '@/config/owner-decisions';
import {
  getDeferredProviders,
  getSelectedProviders,
  providerSelections,
} from '@/config/providers';
import { submissionMessaging } from '@/config/submission';
import {
  __resetMemoryRateLimitForTests,
  checkSubmissionRateLimit,
} from '@/lib/security/rate-limit';
import {
  isTurnstileConfigured,
  verifyTurnstileToken,
} from '@/lib/security/turnstile';
import { processContactSubmission } from '@/lib/submissions/process-submission';
import { mockContactAdapter } from '@/lib/submissions/mock-adapters';
import { isResendConfigured } from '@/lib/submissions/resend-delivery';
import { isBlobUploadConfigured } from '@/lib/submissions/blob-upload';
import { isSentryConfigured } from '@/lib/monitoring/safe-error';

describe('Phase 6 provider selection', () => {
  it('selects launch providers and defers portal platforms', () => {
    const selected = getSelectedProviders().map((p) => p.id);
    expect(selected).toContain('vercel-hosting');
    expect(selected).toContain('resend-email');
    expect(selected).toContain('cloudflare-turnstile');
    expect(selected).toContain('upstash-rate-limit');
    expect(selected).toContain('vercel-analytics');
    expect(selected).toContain('sentry-monitoring');
    const deferred = getDeferredProviders().map((p) => p.id);
    expect(deferred).toContain('supabase');
    expect(deferred).toContain('stripe');
    expect(providerSelections.some((p) => p.name === 'Resend')).toBe(true);
  });

  it('keeps analytics privacy rules strict', () => {
    expect(analyticsPrivacy.sendFormFieldContents).toBe(false);
    expect(analyticsPrivacy.sendPiiAsEventProps).toBe(false);
  });
});

describe('Phase 6 launch gates', () => {
  it('defaults to demo mode without delivery credentials', () => {
    expect(isSubmissionDeliveryEnabled()).toBe(false);
    expect(isDemoSubmissionMode()).toBe(true);
    expect(canEnablePublicFormDelivery()).toBe(false);
    expect(submissionMessaging.demoModeFlag).toBe(true);
    expect(getBlockingLaunchGates().length).toBeGreaterThan(0);
    expect(getProductionBlockers().length).toBeGreaterThan(0);
  });

  it('reports unresolved owner and legal decisions', () => {
    expect(getUnresolvedOwnerDecisions().length).toBeGreaterThan(0);
    expect(getLaunchBlockingOwnerDecisions().length).toBeGreaterThan(0);
    expect(getUnresolvedLegalDecisions().length).toBeGreaterThan(0);
    expect(getLaunchBlockingLegalDecisions().length).toBeGreaterThan(0);
  });
});

describe('Phase 6 security seams', () => {
  beforeEach(() => {
    __resetMemoryRateLimitForTests();
  });

  it('rate-limits repeated identities in memory mode', async () => {
    process.env.BCS_RATE_LIMIT_MAX = '2';
    const first = await checkSubmissionRateLimit('test-identity');
    const second = await checkSubmissionRateLimit('test-identity');
    const third = await checkSubmissionRateLimit('test-identity');
    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(third.allowed).toBe(false);
    delete process.env.BCS_RATE_LIMIT_MAX;
  });

  it('skips Turnstile verification in demo mode when unconfigured', async () => {
    expect(isTurnstileConfigured()).toBe(false);
    const result = await verifyTurnstileToken(undefined);
    expect(result.ok).toBe(true);
    expect(result.skipped).toBe(true);
  });

  it('keeps Resend and Sentry unconfigured by default', () => {
    expect(isResendConfigured()).toBe(false);
    expect(isSentryConfigured()).toBe(false);
  });
});

describe('Phase 6 submission pipeline', () => {
  it('prepares contact submissions in demo mode via process-submission', async () => {
    const result = await processContactSubmission({
      payload: {
        name: 'Test User',
        email: 'test@example.com',
        phone: '305-747-8352',
        inquiryType: 'general',
        message: 'Need gelcoat advice for a hull scratch.',
        preferredContactMethod: 'either',
        consent: true,
      },
      identityKey: `contact-unit-${Date.now()}`,
    });
    expect(result.ok).toBe(true);
    expect(result.status).toBe('prepared');
    expect(result.messageKey).toBe('demoSuccess');
  });

  it('keeps adapter facade compatible with process-submission', async () => {
    const result = await mockContactAdapter.submit({
      payload: {
        name: 'Test',
        email: 'test@example.com',
        message: 'Hello there friend',
      },
      identityKey: `contact-unit-adapter-${Date.now()}`,
    });
    expect(result.ok).toBe(true);
    expect(result.status).toBe('prepared');
  });

  it('reports Blob unconfigured by default', () => {
    expect(isBlobUploadConfigured()).toBe(false);
  });
});
