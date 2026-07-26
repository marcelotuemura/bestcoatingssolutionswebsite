import { DesignSystemPage } from '@/components/design-system/DesignSystemPage';
import { isLocale, type Locale } from '@/i18n/config';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Visual Identity System',
  robots: { index: false, follow: false },
};

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) {
    notFound();
  }
  return <DesignSystemPage locale={raw as Locale} />;
}
