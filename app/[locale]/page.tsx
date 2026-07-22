import { HomePage } from '@/components/home/HomePage';
import { getDictionary } from '@/i18n/get-dictionary';
import { isLocale, type Locale } from '@/i18n/config';
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
  return {
    title: {
      absolute: dictionary.meta.titleDefault,
    },
    description: dictionary.meta.description,
    alternates: {
      canonical: `/${raw}`,
      languages: {
        en: '/en',
        es: '/es',
        'x-default': '/en',
      },
    },
  };
}

export default async function LocaleHomePage({
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

  return <HomePage locale={locale} dictionary={dictionary} />;
}
