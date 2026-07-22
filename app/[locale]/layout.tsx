import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { notFound } from 'next/navigation';
import { SiteShell } from '@/components/layout/SiteShell';
import { siteConfig } from '@/config/site';
import { getDictionary } from '@/i18n/get-dictionary';
import { isLocale, localeHtmlLang, locales, type Locale } from '@/i18n/config';
import { buildRootMetadata } from '@/lib/seo/metadata';
import { localBusinessJsonLd, websiteJsonLd } from '@/lib/seo/structured-data';
import '../globals.css';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-inter',
});

export const viewport: Viewport = {
  themeColor: siteConfig.themeColor,
  width: 'device-width',
  initialScale: 1,
};

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

/**
 * Locale root layout — `<html lang>` is set from the route segment on the
 * server so `/es` initial HTML is never `lang="en"`.
 */
export default async function LocaleRootLayout({
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
    <html
      lang={localeHtmlLang[locale]}
      className={inter.variable}
      suppressHydrationWarning
    >
      <body className="min-h-dvh antialiased">
        <SiteShell locale={locale} dictionary={dictionary}>
          {children}
        </SiteShell>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessJsonLd()),
          }}
        />
        <Analytics />
      </body>
    </html>
  );
}
