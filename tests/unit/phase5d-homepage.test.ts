import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { getDictionarySync } from '@/i18n/get-dictionary';

describe('phase 5d premium homepage', () => {
  it('defines divisions and featured proof copy in both locales', () => {
    const en = getDictionarySync('en');
    const es = getDictionarySync('es');
    expect(en.home.divisions.title).toMatch(/Marine and Aviation/i);
    expect(es.home.divisions.title).toMatch(/Marina y Aviación/i);
    expect(en.home.marine.title).toBe('Marine');
    expect(en.home.aviation.title).toBe('Aviation');
    expect(en.home.featured.stageBefore).toBe('Before');
    expect(en.home.featured.stageDuring).toBe('During');
    expect(en.home.featured.stageAfter).toBe('After');
    expect(en.home.featured.lead.length).toBeGreaterThan(40);
  });

  it('keeps homepage composition purpose-driven', () => {
    const source = readFileSync(
      path.join(process.cwd(), 'components/home/HomePage.tsx'),
      'utf8',
    );
    expect(source).toContain('DivisionsSection');
    expect(source).toContain('WhoWeAreSection');
    expect(source).toContain('FeaturedProjectSection');
    expect(source).toContain('EstimateCtaSection');
    expect(source).not.toContain('WhyBcsSection');
    expect(source).not.toContain('CraftPrinciplesSection');
    expect(source).not.toContain('ServiceAreaSection');
    expect(source).not.toContain('MarineSection');
    expect(source).not.toContain('AviationSection');
  });
});
