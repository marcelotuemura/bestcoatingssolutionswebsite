import type { MetadataRoute } from 'next';
import { marineServices } from '@/config/marine-services';
import { getSitemapProjects } from '@/config/projects';
import { siteConfig } from '@/config/site';
import { sitemapRoutes } from '@/config/routes';
import { getSitemapResources } from '@/content/resources';
import { locales } from '@/i18n/config';

function localeEntries(
  pathSuffix: string,
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'],
  priority: number,
  lastModified: Date,
): MetadataRoute.Sitemap {
  return locales.map((locale) => {
    const url = `${siteConfig.url}/${locale}${pathSuffix}`;
    const languages = Object.fromEntries(
      locales.map((alt) => [alt, `${siteConfig.url}/${alt}${pathSuffix}`]),
    ) as Record<string, string>;
    languages['x-default'] = `${siteConfig.url}/en${pathSuffix}`;

    return {
      url,
      lastModified,
      changeFrequency,
      priority,
      alternates: { languages },
    };
  });
}

/**
 * Dynamic sitemap: launch routes × locales, marine services, published
 * projects, and published resources. Excludes drafts, fixtures, thank-you.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const baseEntries = sitemapRoutes.flatMap((route) => {
    const pathSuffix = route.path === '/' ? '' : route.path;
    return localeEntries(
      pathSuffix,
      route.changeFrequency,
      route.priority,
      lastModified,
    );
  });

  const serviceEntries = marineServices.flatMap((service) =>
    localeEntries(`/services/${service.slug}`, 'monthly', 0.75, lastModified),
  );

  const projectEntries = getSitemapProjects().flatMap((project) =>
    localeEntries(`/projects/${project.slug}`, 'monthly', 0.65, lastModified),
  );

  const resourceEntries = getSitemapResources().flatMap((resource) =>
    localeEntries(`/resources/${resource.slug}`, 'monthly', 0.7, lastModified),
  );

  return [
    ...baseEntries,
    ...serviceEntries,
    ...projectEntries,
    ...resourceEntries,
  ];
}
