import { describe, expect, it } from 'vitest';
import { isContactPrimaryPath } from '@/config/cta-hierarchy';
import { getAboutContent } from '@/content/about';
import { getMarineServiceContent } from '@/content/marine-services';
import { getDictionarySync } from '@/i18n/get-dictionary';

const BANNED_CLAIMS =
  /\btrusted by\b|\bpartnered with\b|\bfactory certified\b|\bauthorized by\b|\bofficial partner\b|\baward-winning\b|\bguaranteed invisible\b/i;

const LAST_NAME = /\bTuemura\b|\bTuémura\b/i;

describe('phase 5g.5 brand consistency audit', () => {
  it('routes Aviation and About to Contact-primary CTA hierarchy', () => {
    expect(isContactPrimaryPath('/en/aviation')).toBe(true);
    expect(isContactPrimaryPath('/es/about')).toBe(true);
    expect(isContactPrimaryPath('/en/marine')).toBe(false);
    expect(isContactPrimaryPath('/en')).toBe(false);
    expect(isContactPrimaryPath('/en/contact')).toBe(false);
  });

  it('keeps aviation title casing aligned with marine', () => {
    const en = getDictionarySync('en');
    expect(en.pages.marine.title).toBe('Marine refinishing');
    expect(en.pages.aviation.title).toBe('Aviation refinishing');
  });

  it('normalizes Spanish refinishing and color-matching terminology', () => {
    const paint = getMarineServiceContent('es', 'paint-refinishing');
    const color = getMarineServiceContent('es', 'color-matching');
    expect(paint.title).toMatch(/refinación/i);
    expect(paint.title).not.toMatch(/refinamiento/i);
    expect(color.title).toBe('Igualación de color');
    expect(
      getDictionarySync('es').conversion.estimate.services['paint-refinishing'],
    ).toMatch(/refinación/i);
    expect(
      getDictionarySync('es').conversion.estimate.services['color-matching'],
    ).toBe('Igualación de color');
  });

  it('keeps employer disclaimer authorization wording localized', () => {
    const en = getAboutContent('en');
    const es = getAboutContent('es');
    expect(en.disclaimerHeading.length).toBeGreaterThan(3);
    expect(es.disclaimerHeading).not.toBe('Disclaimer');
    expect(en.disclaimer).toMatch(/authorization/i);
    expect(es.disclaimer).toMatch(/autorización/i);
  });

  it('avoids banned claims and last name on flagship marketing surfaces', () => {
    const en = getDictionarySync('en');
    const es = getDictionarySync('es');
    const aboutEn = getAboutContent('en');
    const aboutEs = getAboutContent('es');

    const blob = [
      en.pages.marine.overview,
      en.pages.aviation.overview,
      en.pages.aviation.scope,
      en.home.hero.support,
      en.home.process.body,
      es.pages.marine.overview,
      es.pages.aviation.scope,
      es.home.process.body,
      ...aboutEn.began,
      ...aboutEn.industries,
      ...aboutEn.whyExists,
      aboutEn.disclaimer,
      ...aboutEs.began,
      aboutEs.disclaimer,
      en.conversion.contact.metaDescription,
      es.conversion.contact.metaDescription,
      en.conversion.contact.formLead,
    ].join(' ');

    expect(BANNED_CLAIMS.test(blob)).toBe(false);
    expect(LAST_NAME.test(blob)).toBe(false);
    expect(en.home.process.body).toMatch(/craftsman/i);
    expect(en.conversion.contact.metaDescription).toMatch(/aviation/i);
  });
});
