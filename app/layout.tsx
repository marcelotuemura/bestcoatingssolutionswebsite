import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { buildRootMetadata } from '@/lib/seo/metadata';
import { localBusinessJsonLd, websiteJsonLd } from '@/lib/seo/structured-data';
import { siteConfig } from '@/config/site';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = buildRootMetadata();

export const viewport: Viewport = {
  themeColor: siteConfig.themeColor,
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang={siteConfig.defaultLocale}
      className={inter.variable}
      suppressHydrationWarning
    >
      <body className="min-h-dvh antialiased">
        {children}
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
