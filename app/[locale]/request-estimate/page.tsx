import { redirect } from 'next/navigation';
import { isLocale } from '@/i18n/config';
import { notFound } from 'next/navigation';

/**
 * Spec alias: `/request-estimate` → canonical `/estimate-request`.
 */
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  redirect(`/${raw}/estimate-request`);
}
