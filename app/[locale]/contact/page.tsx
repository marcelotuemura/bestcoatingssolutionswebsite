import { ContactPageView } from '@/components/conversion/ContactPageView';
import { getDictionary } from '@/i18n/get-dictionary';
import { isLocale, type Locale } from '@/i18n/config';
import { buildPageMetadata } from '@/lib/seo/page-metadata';
import { breadcrumbJsonLd } from '@/lib/seo/structured-data';
import { siteConfig } from '@/config/site';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const dictionary = await getDictionary(raw);
  return buildPageMetadata({
    locale: raw,
    path: '/contact',
    title: dictionary.conversion.contact.metaTitle,
    description: dictionary.conversion.contact.metaDescription,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dictionary = await getDictionary(locale);
  const breadcrumb = breadcrumbJsonLd(locale, [
    { name: dictionary.nav.home, path: '/' },
    { name: dictionary.nav.contact, path: '/contact' },
  ]);
  const contactLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: dictionary.conversion.contact.title,
    url: `${siteConfig.url}/${locale}/contact`,
    mainEntity: {
      '@type': 'ProfessionalService',
      name: siteConfig.name,
      telephone: siteConfig.contact.phoneE164,
      email: siteConfig.contact.email,
      areaServed: siteConfig.serviceArea.range,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactLd) }}
      />
      <ContactPageView locale={locale} dictionary={dictionary} />
    </>
  );
}
