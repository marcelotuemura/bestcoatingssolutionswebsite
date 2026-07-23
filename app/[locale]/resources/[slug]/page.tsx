import { ResourceDetailPage } from '@/components/resources/ResourceDetailPage';
import { getPublishedResources, getResourceBySlug } from '@/content/resources';
import { siteConfig } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { isLocale, locales, type Locale } from '@/i18n/config';
import { buildPageMetadata } from '@/lib/seo/page-metadata';
import { articleJsonLd, breadcrumbJsonLd } from '@/lib/seo/structured-data';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    getPublishedResources().map((resource) => ({
      locale,
      slug: resource.slug,
    })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) {
    return {};
  }
  const resource = getResourceBySlug(slug);
  if (!resource) {
    return {};
  }
  const copy = resource.copy[raw];
  return buildPageMetadata({
    locale: raw,
    path: `/resources/${slug}`,
    title: copy.metaTitle,
    description: copy.metaDescription,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) {
    notFound();
  }
  const locale = raw as Locale;
  const resource = getResourceBySlug(slug);
  if (!resource) {
    notFound();
  }
  const dictionary = await getDictionary(locale);
  const copy = resource.copy[locale];
  const crumbs = breadcrumbJsonLd(locale, [
    { name: dictionary.nav.home, path: '/' },
    { name: dictionary.nav.resources, path: '/resources' },
    { name: copy.title, path: `/resources/${slug}` },
  ]);
  const article = articleJsonLd({
    headline: copy.title,
    description: copy.summary,
    url: `${siteConfig.url}/${locale}/resources/${slug}`,
    datePublished: resource.publishedAt,
    dateModified: resource.updatedAt,
    authorName: resource.authorDisplayName,
    inLanguage: locale,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }}
      />
      <ResourceDetailPage
        locale={locale}
        dictionary={dictionary}
        resource={resource}
      />
    </>
  );
}
