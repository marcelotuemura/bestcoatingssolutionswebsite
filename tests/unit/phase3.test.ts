import { describe, expect, it } from 'vitest';
import { marineServices, isMarineServiceSlug } from '@/config/marine-services';
import {
  getPublishedProjects,
  getProjectFrameworkDemo,
} from '@/config/projects';
import {
  getMarineServiceContent,
  listMarineServiceSummaries,
} from '@/content/marine-services';
import { buildPageMetadata } from '@/lib/seo/page-metadata';
import { breadcrumbJsonLd, serviceJsonLd } from '@/lib/seo/structured-data';

describe('marine services catalogue', () => {
  it('registers eight public marine service slugs', () => {
    expect(marineServices).toHaveLength(8);
    expect(isMarineServiceSlug('gelcoat-repair')).toBe(true);
    expect(isMarineServiceSlug('aircraft-refinishing')).toBe(false);
  });

  it('loads localized content for every slug', () => {
    for (const service of marineServices) {
      const en = getMarineServiceContent('en', service.slug);
      const es = getMarineServiceContent('es', service.slug);
      expect(en.title.length).toBeGreaterThan(0);
      expect(es.title.length).toBeGreaterThan(0);
      expect(en.faqs.length).toBeGreaterThan(0);
      expect(en.processSteps.length).toBeGreaterThan(0);
    }
  });

  it('lists summaries for the services index', () => {
    const summaries = listMarineServiceSummaries('en');
    expect(summaries).toHaveLength(8);
    expect(summaries[0]?.slug).toBe('gelcoat-repair');
  });
});

describe('project framework', () => {
  it('publishes no fabricated projects', () => {
    expect(getPublishedProjects()).toHaveLength(0);
  });

  it('exposes a clearly marked placeholder framework', () => {
    const demo = getProjectFrameworkDemo();
    expect(demo.placeholder).toBe(true);
    expect(demo.published).toBe(false);
    expect(demo.images.every((image) => image.placeholder)).toBe(true);
  });
});

describe('page SEO helpers', () => {
  it('builds canonical and hreflang metadata', () => {
    const meta = buildPageMetadata({
      locale: 'es',
      path: '/services/gelcoat-repair',
      title: 'Test',
      description: 'Desc',
    });
    expect(meta.alternates?.canonical).toBe('/es/services/gelcoat-repair');
    expect(meta.alternates?.languages).toMatchObject({
      en: '/en/services/gelcoat-repair',
      es: '/es/services/gelcoat-repair',
      'x-default': '/en/services/gelcoat-repair',
    });
    expect(meta.openGraph).toBeDefined();
    expect(meta.twitter).toBeDefined();
  });

  it('builds breadcrumb and service JSON-LD', () => {
    const crumbs = breadcrumbJsonLd('en', [
      { name: 'Home', path: '/' },
      { name: 'Services', path: '/services' },
    ]);
    expect(crumbs['@type']).toBe('BreadcrumbList');
    const service = serviceJsonLd({
      name: 'Gelcoat Repair',
      description: 'Test',
      url: 'https://example.com/en/services/gelcoat-repair',
      areaServed: 'South Florida',
    });
    expect(service['@type']).toBe('Service');
  });
});
