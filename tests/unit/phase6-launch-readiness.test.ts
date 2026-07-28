import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { brandLogoMeta } from '@/config/brand-logo-meta';
import { marketingPlaceholders } from '@/config/marketing-placeholders';
import { isContactPrimaryPath } from '@/config/cta-hierarchy';
import { legalConfig } from '@/config/legal';
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

  it('ships production privacy/terms copy with last-updated metadata', () => {
    const en = getDictionarySync('en');
    expect('reviewBadge' in en.conversion.privacy).toBe(false);
    expect('reviewBadge' in en.conversion.terms).toBe(false);
    expect(en.conversion.privacy.lastUpdatedLabel).toMatch(/last updated/i);
    expect(en.conversion.terms.title).toMatch(/terms of use/i);
    expect(en.conversion.formConsent.privacy).toMatch(/privacy/i);
    expect(legalConfig.documentsLastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
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

  it('documents brand standards, launch matrix, form delivery, and acceptance review', () => {
    const docs = path.join(process.cwd(), 'docs/brand-transformation');
    expect(existsSync(path.join(docs, 'BRAND_STANDARDS.md'))).toBe(true);
    expect(existsSync(path.join(docs, 'LAUNCH_READINESS_MATRIX.md'))).toBe(
      true,
    );
    expect(existsSync(path.join(docs, 'LAUNCH_ACCEPTANCE_REVIEW.md'))).toBe(
      true,
    );
    expect(existsSync(path.join(docs, 'PHASE7_GROWTH_OPTIMIZATION.md'))).toBe(
      true,
    );
    expect(existsSync(path.join(process.cwd(), 'docs/FORM_DELIVERY.md'))).toBe(
      true,
    );
    const matrix = path.join(docs, 'LAUNCH_READINESS_MATRIX.md');
    expect(
      readFileSync(matrix, 'utf8').includes(
        'Deferred by owner approval — pending approved assets',
      ),
    ).toBe(true);
  });
});
