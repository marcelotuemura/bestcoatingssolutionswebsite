import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';
import { sitemapRoutes } from '@/config/routes';
import { locales } from '@/i18n/config';

/**
 * Dynamic sitemap: every launch route × public locale, with hreflang alternates.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return sitemapRoutes.flatMap((route) => {
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
}
