import { headers } from 'next/headers';
import { createHash } from 'node:crypto';

/** Best-effort client IP from platform headers. */
export async function getRequestIp(): Promise<string | undefined> {
  const headerStore = await headers();
  const forwarded = headerStore.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim();
  }
  return (
    headerStore.get('x-real-ip')?.trim() ||
    headerStore.get('cf-connecting-ip')?.trim() ||
    undefined
  );
}

/** Opaque rate-limit identity — never store raw IP in submission results. */
export async function getSubmissionIdentityKey(
  prefix: string,
): Promise<string> {
  const ip = (await getRequestIp()) ?? 'unknown';
  const hash = createHash('sha256').update(ip).digest('hex').slice(0, 16);
  return `${prefix}:${hash}`;
}

export function shouldSimulateFailureFromHeaders(
  headerValue: string | null,
): boolean {
  return headerValue === '1' || headerValue === 'true';
}
