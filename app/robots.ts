import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

/**
 * Dynamic robots.txt. Disallows the authenticated customer portal from being
 * indexed while allowing the public marketing site.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/portal', '/api'],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
