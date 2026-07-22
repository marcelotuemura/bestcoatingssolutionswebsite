import { ScheduleVisitPageView } from '@/components/conversion/ScheduleVisitPageView';
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
  if (!isLocale(raw)) return {};
  const dictionary = await getDictionary(raw);
  return buildPageMetadata({
    locale: raw,
    path: '/schedule-visit',
    title: dictionary.conversion.schedule.metaTitle,
    description: dictionary.conversion.schedule.metaDescription,
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
    { name: dictionary.nav.scheduleVisit, path: '/schedule-visit' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <ScheduleVisitPageView locale={locale} dictionary={dictionary} />
    </>
  );
}
