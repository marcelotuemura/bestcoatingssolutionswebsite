import { describe, expect, it } from 'vitest';
import { getAboutContent } from '@/content/about';
import { getDictionarySync } from '@/i18n/get-dictionary';

describe('phase 4 trust experience', () => {
  it('keeps About in nav and Meet Marcelo as about page title', () => {
    const en = getDictionarySync('en');
    const about = getAboutContent('en');
    expect(en.nav.about).toBe('About');
    expect(about.title).toBe('Meet Marcelo');
    expect(en.home.whoWeAre.title).toBe('Meet Marcelo');
    expect(en.home.whoWeAre.cta).toBe('Meet Marcelo');
  });

  it('removes header tagline and shortens hero support', () => {
    const en = getDictionarySync('en');
    expect(en.header.tagline).toBe('');
    expect(en.home.hero.support).toMatch(
      /I've worked in professional refinishing/,
    );
    expect(en.home.hero.support.length).toBeLessThan(280);
  });

  it('provides craft principles and customer journey copy', () => {
    const en = getDictionarySync('en');
    const es = getDictionarySync('es');
    expect(en.home.craftPrinciples.questions).toHaveLength(4);
    expect(es.home.craftPrinciples.questions).toHaveLength(4);
    expect(en.home.process.title).toBe('What You Can Expect');
    expect(en.home.process.steps).toHaveLength(7);
    expect(es.home.process.steps).toHaveLength(7);
    expect(en.home.philosophy.title).toMatch(/Quality Is Built/i);
  });

  it('keeps employer language factual and disclaimer clear', () => {
    const about = getAboutContent('en');
    const banned =
      /\btrusted by\b|\bpartnered with\b|\bfactory certified\b|\bauthorized by\b|\bofficial partner\b|\bis an authorized (dealer|partner|facility of)\b/i;
    expect(banned.test(about.career.join(' '))).toBe(false);
    expect(about.career.join(' ')).toMatch(/not mean .* authorized aviation/i);
    expect(about.career.join(' ')).toMatch(/while employed by/i);
    expect(about.disclaimer).toMatch(/does not imply endorsement/i);
  });
});
