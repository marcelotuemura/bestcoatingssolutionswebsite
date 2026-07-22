import { MarineServicePage } from '@/components/services/MarineServicePage';
import {
  isMarineServiceSlug,
  marineServices,
  type MarineServiceSlug,
} from '@/config/marine-services';
import { siteConfig } from '@/config/site';
import { getMarineServiceContent } from '@/content/marine-services';
import { getDictionary } from '@/i18n/get-dictionary';
import { isLocale, locales, type Locale } from '@/i18n/config';
import { buildPageMetadata } from '@/lib/seo/page-metadata';
import { breadcrumbJsonLd, serviceJsonLd } from '@/lib/seo/structured-data';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    marineServices.map((service) => ({
      locale,
      slug: service.slug,
    })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw) || !isMarineServiceSlug(slug)) {
    return {};
  }
  const content = getMarineServiceContent(raw, slug);
  return buildPageMetadata({
    locale: raw,
    path: `/services/${slug}`,
    title: content.metaTitle,
    description: content.metaDescription,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw) || !isMarineServiceSlug(slug)) {
    notFound();
  }
  const locale = raw as Locale;
  const serviceSlug = slug as MarineServiceSlug;
  const dictionary = await getDictionary(locale);
  const content = getMarineServiceContent(locale, serviceSlug);
  const path = `/services/${serviceSlug}`;
  const breadcrumb = breadcrumbJsonLd(locale, [
    { name: dictionary.nav.home, path: '/' },
    { name: dictionary.nav.marine, path: '/marine' },
    { name: dictionary.nav.services, path: '/services' },
    { name: content.title, path },
  ]);
  const serviceLd = serviceJsonLd({
    name: content.title,
    description: content.metaDescription,
    url: `${siteConfig.url}/${locale}${path}`,
    areaServed: siteConfig.serviceArea.range,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }}
      />
      <MarineServicePage
        locale={locale}
        dictionary={dictionary}
        content={content}
        slug={serviceSlug}
      />
    </>
  );
}
