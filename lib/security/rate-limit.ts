/**
 * Rate-limiting seam for public form submissions.
 * Uses an in-memory limiter locally; Upstash when credentials exist.
 */

export interface RateLimitResult {
  readonly allowed: boolean;
  readonly remaining: number;
  readonly retryAfterSeconds?: number;
}

const memoryHits = new Map<string, { count: number; resetAt: number }>();

function getWindowMs(): number {
  return Number(process.env.BCS_RATE_LIMIT_WINDOW_MS ?? 60_000);
}

function getMaxHits(): number {
  return Number(process.env.BCS_RATE_LIMIT_MAX ?? 8);
}

function memoryLimit(key: string): RateLimitResult {
  const now = Date.now();
  const windowMs = getWindowMs();
  const max = getMaxHits();
  const existing = memoryHits.get(key);
  if (!existing || existing.resetAt <= now) {
    memoryHits.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1 };
  }
  if (existing.count >= max) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
    };
  }
  existing.count += 1;
  return { allowed: true, remaining: max - existing.count };
}

async function upstashLimit(key: string): Promise<RateLimitResult | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    return null;
  }

  const windowMs = getWindowMs();
  const max = getMaxHits();
  const redisKey = `bcs:rl:${key}`;

  const incrResponse = await fetch(
    `${url}/incr/${encodeURIComponent(redisKey)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    },
  );
  if (!incrResponse.ok) {
    return null;
  }
  const incrJson = (await incrResponse.json()) as { result?: number };
  const count = Number(incrJson.result ?? 0);
  if (count === 1) {
    await fetch(`${url}/pexpire/${encodeURIComponent(redisKey)}/${windowMs}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
  }
  if (count > max) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil(windowMs / 1000),
    };
  }
  return { allowed: true, remaining: Math.max(0, max - count) };
}

/**
 * Check rate limit for a submission identity (IP hash / action key).
 * Falls back to memory limiter when Upstash is unavailable.
 */
export async function checkSubmissionRateLimit(
  identityKey: string,
): Promise<RateLimitResult> {
  try {
    const remote = await upstashLimit(identityKey);
    if (remote) {
      return remote;
    }
  } catch {
    // Fall through to memory limiter.
  }
  return memoryLimit(identityKey);
}

/** Test helper — clear in-memory buckets. */
export function __resetMemoryRateLimitForTests(): void {
  memoryHits.clear();
}
