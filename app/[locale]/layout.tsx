import { SiteShell } from '@/components/layout/SiteShell';
import { getDictionary } from '@/i18n/get-dictionary';
import { isLocale, locales, type Locale } from '@/i18n/config';
import { buildRootMetadata } from '@/lib/seo/metadata';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

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
  const base = buildRootMetadata();
  return {
    ...base,
    title: {
      default: dictionary.meta.titleDefault,
      template: dictionary.meta.titleTemplate,
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

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) {
    notFound();
  }
  const locale = raw as Locale;
  const dictionary = await getDictionary(locale);

  return (
    <SiteShell locale={locale} dictionary={dictionary}>
      {children}
    </SiteShell>
  );
}
