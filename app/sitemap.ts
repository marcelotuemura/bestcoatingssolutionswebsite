import type { MetadataRoute } from 'next';
import { marineServices } from '@/config/marine-services';
import { siteConfig } from '@/config/site';
import { sitemapRoutes } from '@/config/routes';
import { locales } from '@/i18n/config';

/**
 * Dynamic sitemap: launch routes × locales, plus marine service detail pages.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const baseEntries = sitemapRoutes.flatMap((route) => {
    const pathSuffix = route.path === '/' ? '' : route.path;

    return locales.map((locale) => {
      const url = `${siteConfig.url}/${locale}${pathSuffix}`;
      const languages = Object.fromEntries(
        locales.map((alt) => [alt, `${siteConfig.url}/${alt}${pathSuffix}`]),
      ) as Record<string, string>;
      languages['x-default'] = `${siteConfig.url}/en${pathSuffix}`;

      return {
        url,
        lastModified,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: { languages },
      };
    });
  });

  const serviceEntries = marineServices.flatMap((service) => {
    const pathSuffix = `/services/${service.slug}`;
    return locales.map((locale) => {
      const url = `${siteConfig.url}/${locale}${pathSuffix}`;
      const languages = Object.fromEntries(
        locales.map((alt) => [alt, `${siteConfig.url}/${alt}${pathSuffix}`]),
      ) as Record<string, string>;
      languages['x-default'] = `${siteConfig.url}/en${pathSuffix}`;

      return {
        url,
        lastModified,
        changeFrequency: 'monthly' as const,
        priority: 0.75,
        alternates: { languages },
      };
    });
  });

  return [...baseEntries, ...serviceEntries];
}
