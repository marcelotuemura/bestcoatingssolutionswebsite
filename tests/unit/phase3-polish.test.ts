import { describe, expect, it } from 'vitest';
import {
  getRelatedMarineServices,
  marineServices,
} from '@/config/marine-services';
import {
  getMarineServiceContent,
  listMarineServiceSummaries,
} from '@/content/marine-services';
import {
  getPublishedProjects,
  getProjectFrameworkDemo,
} from '@/config/projects';
import { SEO_LENGTH, buildPageMetadata } from '@/lib/seo/page-metadata';
import { breadcrumbJsonLd } from '@/lib/seo/structured-data';
import { getDictionarySync } from '@/i18n/get-dictionary';

describe('phase 3 polish — related services', () => {
  it('provides related links for every marine service', () => {
    for (const service of marineServices) {
      const related = getRelatedMarineServices(service.slug);
      expect(related.length).toBeGreaterThanOrEqual(2);
      expect(related).not.toContain(service.slug);
      for (const slug of related) {
        expect(marineServices.some((item) => item.slug === slug)).toBe(true);
      }
    }
  });
});

describe('phase 3 polish — SEO metadata lengths', () => {
  it('keeps division and service metadata within SEO guidance', () => {
    for (const locale of ['en', 'es'] as const) {
      const dictionary = getDictionarySync(locale);
      const pageMetas = [
        dictionary.pages.marine,
        dictionary.pages.aviation,
        dictionary.pages.services,
        dictionary.pages.projects,
      ];
      for (const page of pageMetas) {
        expect(page.metaTitle.length).toBeLessThanOrEqual(
          SEO_LENGTH.titleMax + 15,
        );
        expect(page.metaDescription.length).toBeGreaterThanOrEqual(
          SEO_LENGTH.descriptionMin,
        );
        expect(page.metaDescription.length).toBeLessThanOrEqual(
          SEO_LENGTH.descriptionMax + 40,
        );
      }

      for (const summary of listMarineServiceSummaries(locale)) {
        const content = getMarineServiceContent(locale, summary.slug);
        expect(content.metaTitle.length).toBeGreaterThan(10);
        expect(content.metaTitle.length).toBeLessThanOrEqual(
          SEO_LENGTH.titleMax + 20,
        );
        expect(content.metaDescription.length).toBeGreaterThanOrEqual(50);
        expect(content.metaDescription.length).toBeLessThanOrEqual(
          SEO_LENGTH.descriptionMax + 40,
        );
        expect(content.whyTitle.toLowerCase()).toMatch(
          /why choose|por qué elegir/,
        );
      }
    }
  });

  it('builds full social + hreflang metadata', () => {
    const meta = buildPageMetadata({
      locale: 'en',
      path: '/services/gelcoat-repair',
      title: 'Gelcoat Repair | Marine | BCS',
      description:
        'Mobile gelcoat repair and refinishing for yachts and boats in South Florida.',
    });
    expect(meta.alternates?.canonical).toBe('/en/services/gelcoat-repair');
    expect(meta.alternates?.languages).toMatchObject({
      en: '/en/services/gelcoat-repair',
      es: '/es/services/gelcoat-repair',
      'x-default': '/en/services/gelcoat-repair',
    });
    expect(meta.openGraph).toBeDefined();
    expect(meta.twitter).toBeDefined();
  });
});

describe('phase 3 polish — placeholders and aviation guardrails', () => {
  it('keeps published projects empty and framework labeled', () => {
    expect(getPublishedProjects()).toHaveLength(0);
    const demo = getProjectFrameworkDemo();
    expect(demo.placeholder).toBe(true);
    expect(demo.title).toMatch(/Future Project|Placeholder/i);
  });

  it('uses Coming Soon / Placeholder Image dictionary wording', () => {
    const en = getDictionarySync('en');
    expect(en.placeholder.mediaLabel).toMatch(/Placeholder Image/i);
    expect(en.placeholder.projectLabel).toMatch(/Future Project/i);
    expect(en.placeholder.emptyProjects).toMatch(/Coming Soon/i);
    expect(en.cta.estimate).toBe('Request Free Estimate');
    expect(en.cta.callBcs).toMatch(/Call Best Coatings Solutions/i);
    expect(en.pages.aviation.noBookingNotice).toMatch(
      /no current aviation booking/i,
    );
  });
});

describe('phase 3 polish — breadcrumb JSON-LD parity helpers', () => {
  it('encodes the same crumb names used on service pages', () => {
    const dictionary = getDictionarySync('en');
    const content = getMarineServiceContent('en', 'gelcoat-repair');
    const crumbs = [
      { name: dictionary.nav.home, path: '/' },
      { name: dictionary.nav.marine, path: '/marine' },
      { name: dictionary.nav.services, path: '/services' },
      { name: content.title, path: '/services/gelcoat-repair' },
    ];
    const ld = breadcrumbJsonLd('en', crumbs) as {
      itemListElement: { name: string }[];
    };
    expect(ld.itemListElement.map((item) => item.name)).toEqual(
      crumbs.map((crumb) => crumb.name),
    );
  });
});
