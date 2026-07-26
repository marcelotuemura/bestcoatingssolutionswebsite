import { describe, expect, it } from 'vitest';
import { aviationServiceCatalog } from '@/config/services';
import { brandLogo } from '@/config/brand-logo';
import { divisions } from '@/config/divisions';
import { footerNav, primaryNav } from '@/config/routes';
import { getDictionarySync } from '@/i18n/get-dictionary';

describe('phase 5c header and division architecture', () => {
  it('uses Home · About · Marine · Aviation · Projects · Contact nav', () => {
    expect([...primaryNav]).toEqual([
      'home',
      'about',
      'marine',
      'aviation',
      'projects',
      'contact',
    ]);
  });

  it('keeps the footer calm and division-forward', () => {
    expect(footerNav).toContain('marine');
    expect(footerNav).toContain('aviation');
    expect(footerNav).toContain('estimateRequest');
    expect(footerNav).not.toContain('resources');
    expect(footerNav).not.toContain('faq');
  });

  it('makes aviation visible without Coming Soon framing', () => {
    expect(divisions.aviation.status).toBe('active');
    const en = getDictionarySync('en');
    expect(en.pages.aviation.metaTitle).not.toMatch(/Coming Soon/i);
    expect(en.pages.aviation.lead).toMatch(/preparation discipline|precision/i);
    expect(en.pages.aviation.capabilities).toHaveLength(8);
    expect(en.pages.aviation.processSteps).toHaveLength(5);
    expect(en.footer.brandBlurb).toMatch(/Marine and Aviation/i);
  });

  it('limits aviation catalog to cosmetic refinishing categories', () => {
    expect(aviationServiceCatalog.map((s) => s.name)).toEqual([
      'Aircraft Cosmetic Refinishing',
      'Exterior Paint Restoration',
      'Composite Surface Refinishing',
      'Paint Correction',
      'Color Matching',
      'Surface Preparation',
      'Finish Restoration',
      'Cosmetic Exterior Repairs',
    ]);
    const banned = /structural|faa|avionics|engine|mechanical|flight-critical/i;
    expect(
      banned.test(aviationServiceCatalog.map((s) => s.name).join(' ')),
    ).toBe(false);
  });

  it('documents header logo mode when official file is missing', () => {
    if (brandLogo.officialFilePending) {
      expect(brandLogo.headerMode).toBe('text');
    }
  });
});
