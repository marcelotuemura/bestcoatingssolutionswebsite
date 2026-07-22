import { describe, expect, it } from 'vitest';
import { routes, sitemapRoutes, primaryNav } from '@/config/routes';
import { services, servicesByDivision } from '@/config/services';
import { estimatePolicy } from '@/config/estimate-policy';
import { divisions } from '@/config/divisions';
import { getPublicSocialChannels, socialChannels } from '@/config/social';
import { siteConfig } from '@/config/site';
import { localePath, stripLocale, switchLocalePath } from '@/i18n/path';
import { isLocale, locales } from '@/i18n/config';

describe('routes registry', () => {
  it('exposes the home route at the site root', () => {
    expect(routes.home.path).toBe('/');
  });

  it('includes service-area in the launch sitemap', () => {
    const paths = sitemapRoutes.map((route) => route.path);
    expect(paths).toContain('/service-area');
  });

  it('excludes deferred and portal routes from the sitemap', () => {
    const paths = sitemapRoutes.map((route) => route.path);
    expect(paths).not.toContain('/portal');
    expect(paths).not.toContain('/blog');
    expect(paths).not.toContain('/gallery');
    expect(paths).not.toContain('/process');
  });

  it('keeps every sitemap priority within the 0..1 range', () => {
    for (const route of sitemapRoutes) {
      expect(route.priority).toBeGreaterThanOrEqual(0);
      expect(route.priority).toBeLessThanOrEqual(1);
    }
  });

  it('lists primary nav keys that exist in the registry', () => {
    for (const key of primaryNav) {
      expect(routes[key]).toBeDefined();
    }
  });
});

describe('services catalogue', () => {
  it('splits services by division', () => {
    const marine = servicesByDivision('marine');
    const aviation = servicesByDivision('aviation');
    expect(marine.length).toBe(8);
    expect(aviation.length).toBeGreaterThan(0);
    expect(marine.length + aviation.length).toBe(services.length);
  });

  it('uses unique slugs', () => {
    const slugs = services.map((service) => service.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe('business guardrails', () => {
  it('publishes the BCS phone number', () => {
    expect(siteConfig.contact.phone).toBe('305-747-8352');
  });

  it('never claims all estimates are free', () => {
    expect(estimatePolicy.neverClaimAllEstimatesFree).toBe(true);
    expect(estimatePolicy.freeEstimateArea).toBe('Fort Lauderdale');
    expect(estimatePolicy.publicNotice.toLowerCase()).toContain(
      'fort lauderdale',
    );
    expect(estimatePolicy.publicNotice.toLowerCase()).not.toContain(
      'all estimates are free',
    );
  });

  it('keeps aviation non-active until owner confirmation', () => {
    expect(divisions.aviation.status).not.toBe('active');
  });

  it('hides TikTok and disables social without URLs', () => {
    const tiktok = socialChannels.find((channel) => channel.id === 'tiktok');
    expect(tiktok?.visibility).toBe('hidden');
    expect(getPublicSocialChannels()).toHaveLength(0);
  });

  it('keeps portal teaser off by default', () => {
    expect(siteConfig.portalTeaser.enabled).toBe(false);
  });
});

describe('i18n paths', () => {
  it('recognizes supported locales', () => {
    expect(locales).toEqual(['en', 'es']);
    expect(isLocale('en')).toBe(true);
    expect(isLocale('fr')).toBe(false);
  });

  it('builds and strips locale paths', () => {
    expect(localePath('en')).toBe('/en');
    expect(localePath('es', '/marine')).toBe('/es/marine');
    expect(stripLocale('/en/marine')).toBe('/marine');
    expect(switchLocalePath('/en/contact', 'es')).toBe('/es/contact');
  });
});
