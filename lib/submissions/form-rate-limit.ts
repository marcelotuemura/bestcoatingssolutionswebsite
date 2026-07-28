/**
 * Lightweight in-memory rate limit for public form submissions.
 * Suitable for single-instance / serverless best-effort protection.
 * Not a substitute for edge WAF / Turnstile when volume grows.
 */

import { createHash } from 'node:crypto';
import { formDeliveryConfig } from '@/config/form-delivery';

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export function __resetFormRateLimitForTests(): void {
  buckets.clear();
}

export function checkFormRateLimit(identity: string): {
  readonly allowed: boolean;
  readonly remaining: number;
} {
  const key = createHash('sha256').update(identity).digest('hex').slice(0, 24);
  const now = Date.now();
  const { windowMs, maxAttempts } = formDeliveryConfig.rateLimit;
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1 };
  }
  if (existing.count >= maxAttempts) {
    return { allowed: false, remaining: 0 };
  }
  existing.count += 1;
  return { allowed: true, remaining: maxAttempts - existing.count };
}
