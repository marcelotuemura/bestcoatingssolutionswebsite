import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { brandLogoMeta } from '@/config/brand-logo-meta';
import { marketingPlaceholders } from '@/config/marketing-placeholders';
import { isContactPrimaryPath } from '@/config/cta-hierarchy';
import { getDictionarySync } from '@/i18n/get-dictionary';

describe('phase 6 launch readiness inventory', () => {
  it('tracks official logo candidates and temporary division heroes', () => {
    expect(brandLogoMeta.officialCandidates.length).toBeGreaterThan(0);
    for (const candidate of brandLogoMeta.officialCandidates) {
      expect(candidate.startsWith('/brand/')).toBe(true);
    }
    expect(marketingPlaceholders.marineHero.temporary).toBe(true);
    expect(marketingPlaceholders.aviationHero.temporary).toBe(true);
  });

  it('keeps privacy/terms marked until legal review lands', () => {
    const en = getDictionarySync('en');
    expect(en.conversion.privacy.reviewBadge).toMatch(/legal review/i);
    expect(en.conversion.terms.reviewBadge).toMatch(/legal review/i);
  });

  it('preserves CTA hierarchy and craftsman claim discipline at launch baseline', () => {
    expect(isContactPrimaryPath('/en/aviation')).toBe(true);
    expect(isContactPrimaryPath('/en/about')).toBe(true);
    expect(isContactPrimaryPath('/en/marine')).toBe(false);
    const en = getDictionarySync('en');
    expect(en.pages.aviation.scope).toMatch(/not an FAA repair station/i);
    expect(en.pages.marine.title).toBe('Marine refinishing');
    expect(en.pages.aviation.title).toBe('Aviation refinishing');
  });

  it('documents brand standards and launch matrix in the repo', () => {
    const docs = path.join(process.cwd(), 'docs/brand-transformation');
    expect(existsSync(path.join(docs, 'BRAND_STANDARDS.md'))).toBe(true);
    expect(existsSync(path.join(docs, 'LAUNCH_READINESS_MATRIX.md'))).toBe(
      true,
    );
  });
});
