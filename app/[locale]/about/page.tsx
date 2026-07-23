import { AboutPage } from '@/components/about/AboutPage';
import { getAboutContent } from '@/content/about';
import { getDictionary } from '@/i18n/get-dictionary';
import { isLocale, type Locale } from '@/i18n/config';
import { buildPageMetadata } from '@/lib/seo/page-metadata';
import { breadcrumbJsonLd } from '@/lib/seo/structured-data';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) {
    return {};
  }
  const content = getAboutContent(raw);
  return buildPageMetadata({
    locale: raw,
    path: '/about',
    title: content.metaTitle,
    description: content.metaDescription,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) {
    notFound();
  }
  const locale = raw as Locale;
  const dictionary = await getDictionary(locale);
  const jsonLd = breadcrumbJsonLd(locale, [
    { name: dictionary.nav.home, path: '/' },
    { name: dictionary.nav.about, path: '/about' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AboutPage locale={locale} dictionary={dictionary} />
    </>
  );
}
