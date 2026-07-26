/**
 * Approved CTA hierarchy (Phase 5F / 5G / 5G.5).
 * Marine & most pages → Estimate primary.
 * Aviation & About → Contact primary (conversation first).
 */

const CONTACT_PRIMARY_SEGMENTS = new Set(['aviation', 'about']);

/** Pathname may be locale-prefixed (`/en/aviation`) or bare (`/aviation`). */
export function isContactPrimaryPath(pathname: string): boolean {
  const parts = pathname.split('/').filter(Boolean);
  const segment = parts[0] === 'en' || parts[0] === 'es' ? parts[1] : parts[0];
  return typeof segment === 'string' && CONTACT_PRIMARY_SEGMENTS.has(segment);
}
