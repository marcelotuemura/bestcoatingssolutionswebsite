/**
 * Corpus validation helpers (TypeScript mirror of PostgreSQL policy).
 * Database remains the source of truth for mutations.
 */

import { createHash } from 'node:crypto';

const SIGNED_URL_RE =
  /(X-Amz-Signature|X-Goog-Signature|token=|sig=|Signature=|signedUrl|service_role|eyJhbGci)/i;

export function corpusJsonHasSecrets(value: unknown): boolean {
  try {
    return SIGNED_URL_RE.test(JSON.stringify(value ?? {}));
  } catch {
    return true;
  }
}

export function assertSafeManifest(manifest: unknown): void {
  if (corpusJsonHasSecrets(manifest)) {
    throw new Error('Manifest must not contain signed URLs or secrets.');
  }
}

export function deterministicManifestChecksum(manifestBody: string): string {
  // Mirror SQL encode(digest(...sha256...)). Production checksum is in PostgreSQL.
  return createHash('sha256').update(manifestBody, 'utf8').digest('hex');
}
