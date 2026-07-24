/**
 * In-memory login rate limit for the temporary media access boundary.
 * Foundation-only — replace with shared Upstash limiter when ops auth lands.
 */

import { createHash } from 'node:crypto';
import { mediaIntelligenceConfig } from '@/config/media-intelligence';

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export function __resetMediaLoginRateLimitForTests(): void {
  buckets.clear();
}

export function checkMediaLoginRateLimit(identity: string): {
  readonly allowed: boolean;
  readonly remaining: number;
} {
  const key = createHash('sha256').update(identity).digest('hex').slice(0, 24);
  const now = Date.now();
  const windowMs = mediaIntelligenceConfig.loginRateLimit.windowMs;
  const max = mediaIntelligenceConfig.loginRateLimit.maxAttempts;
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1 };
  }
  if (existing.count >= max) {
    return { allowed: false, remaining: 0 };
  }
  existing.count += 1;
  return { allowed: true, remaining: max - existing.count };
}
