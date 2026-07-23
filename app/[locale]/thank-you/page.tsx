import { ThankYouPageView } from '@/components/conversion/ThankYouPageView';
import type {
  ThankYouStatus,
  ThankYouType,
} from '@/components/conversion/ThankYouPageView';
import { getDictionary } from '@/i18n/get-dictionary';
import { isLocale, type Locale } from '@/i18n/config';
import { buildPageMetadata } from '@/lib/seo/page-metadata';
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
  const meta = buildPageMetadata({
    locale: raw,
    path: '/thank-you',
    title: dictionary.conversion.thankYou.metaTitle,
    description: dictionary.conversion.thankYou.metaDescription,
  });
  return {
    ...meta,
    robots: { index: false, follow: false },
  };
}

function resolveType(value: string | string[] | undefined): ThankYouType {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === 'contact' || raw === 'estimate') return raw;
  return 'fallback';
}

function resolveStatus(value: string | string[] | undefined): ThankYouStatus {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === 'delivered') return 'delivered';
  return 'prepared';
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    type?: string | string[];
    status?: string | string[];
  }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dictionary = await getDictionary(locale);
  const query = await searchParams;
  const type = resolveType(query.type);
  const status = resolveStatus(query.status);

  return (
    <ThankYouPageView
      locale={locale}
      dictionary={dictionary}
      type={type}
      status={status}
    />
  );
}
