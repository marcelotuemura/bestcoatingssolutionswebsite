import { FaqCenterPage } from '@/components/faq/FaqCenterPage';
import { getAllFaqItems, getFaqCategories } from '@/content/faq';
import { getDictionary } from '@/i18n/get-dictionary';
import { isLocale, type Locale } from '@/i18n/config';
import { buildPageMetadata } from '@/lib/seo/page-metadata';
import { breadcrumbJsonLd, faqPageJsonLd } from '@/lib/seo/structured-data';
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
  const dictionary = await getDictionary(raw);
  return buildPageMetadata({
    locale: raw,
    path: '/faq',
    title: dictionary.phase5.faq.metaTitle,
    description: dictionary.phase5.faq.metaDescription,
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
  const categories = getFaqCategories(locale);
  const faqItems = getAllFaqItems(locale);
  const crumbs = breadcrumbJsonLd(locale, [
    { name: dictionary.nav.home, path: '/' },
    { name: dictionary.nav.faq, path: '/faq' },
  ]);
  const faqSchema = faqPageJsonLd(faqItems);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbs) }}
      />
      {faqSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      ) : null}
      <FaqCenterPage
        locale={locale}
        dictionary={dictionary}
        categories={categories}
      />
    </>
  );
}
