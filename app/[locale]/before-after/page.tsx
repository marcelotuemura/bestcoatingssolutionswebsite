import { BeforeAfterSection } from '@/components/home/BeforeAfterSection';
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
    <main id="main-content">
      <BeforeAfterSection dictionary={dictionary} />
    </main>
  );
}
