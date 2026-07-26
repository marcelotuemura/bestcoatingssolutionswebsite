/**
 * Official BCS logo usage — Phase 5B.
 *
 * Owner approved the powerboat + business jet + metallic BCS mark as the
 * official logo. The binary file has not yet been committed to this repository.
 * Until it is, the interim SVG is used for layout evaluation only.
 *
 * Do not redesign or invent alternate marks without owner approval.
 */

export const brandLogo = {
  /**
   * Web path for the full-color logo.
   * Replace with `/brand/bcs-logo-official.svg` when the owner file is added.
   */
  fullColorSrc: '/brand/bcs-logo-temporary.svg',
  /** True until `public/brand/bcs-logo-official.svg` (or PNG) is supplied. */
  officialFilePending: true as const,
  alt: 'Best Coatings Solutions',
  /**
   * Recommended max heights by surface (evaluate; do not invent a new mark).
   * If the header exceeds usability, propose a simplified horizontal variant —
   * do not implement without approval.
   */
  recommendedMaxHeightPx: {
    header: 40,
    hero: 96,
    footer: 56,
    designSystemPreview: 120,
  },
  notes: [
    'Full-color logo: homepage hero and footer where space allows.',
    'Header: evaluate full logo first; if too tall, document and propose (do not ship) a simplified horizontal variant.',
    'Never display employer or manufacturer logos alongside the BCS mark.',
  ],
} as const;
