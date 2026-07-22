import { RoutePlaceholder } from '@/components/layout/RoutePlaceholder';
import { getDictionary } from '@/i18n/get-dictionary';
import { isLocale, type Locale } from '@/i18n/config';
import { notFound } from 'next/navigation';

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
  return (
    <RoutePlaceholder
      locale={locale}
      dictionary={dictionary}
      routeKey="accessibility"
    />
  );
}
