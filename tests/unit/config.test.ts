import { describe, expect, it } from 'vitest';
import { routes, sitemapRoutes } from '@/config/routes';
import { services, servicesByDivision } from '@/config/services';

describe('routes registry', () => {
  it('exposes the home route at the site root', () => {
    expect(routes.home.path).toBe('/');
  });

  it('excludes the authenticated portal from the sitemap', () => {
    const paths = sitemapRoutes.map((route) => route.path);
    expect(paths).not.toContain('/portal');
  });

  it('keeps every sitemap priority within the 0..1 range', () => {
    for (const route of sitemapRoutes) {
      expect(route.priority).toBeGreaterThanOrEqual(0);
      expect(route.priority).toBeLessThanOrEqual(1);
    }
  });
});

describe('services catalogue', () => {
  it('splits services by division', () => {
    const marine = servicesByDivision('marine');
    const aviation = servicesByDivision('aviation');
    expect(marine.length).toBeGreaterThan(0);
    expect(aviation.length).toBeGreaterThan(0);
    expect(marine.length + aviation.length).toBe(services.length);
  });

  it('uses unique slugs', () => {
    const slugs = services.map((service) => service.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
