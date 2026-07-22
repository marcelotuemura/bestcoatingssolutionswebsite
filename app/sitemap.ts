import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';
import { sitemapRoutes } from '@/config/routes';

/**
 * Dynamic sitemap generated from the typed route registry (`config/routes.ts`).
 * New public pages appear here automatically once registered — no manual XML.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return sitemapRoutes.map((route) => ({
    url: `${siteConfig.url}${route.path === '/' ? '' : route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
