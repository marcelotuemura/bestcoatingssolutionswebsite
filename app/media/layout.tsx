import type { ReactNode } from 'react';
import { Source_Sans_3, IBM_Plex_Sans } from 'next/font/google';
import { evaluateMediaAccessGate } from '@/config/media-intelligence';
import { notFound } from 'next/navigation';
import '../globals.css';

export const dynamic = 'force-dynamic';

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-media-sans',
});

const plex = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-media-ui',
});

export const metadata = {
  title: 'Media Intelligence | Best Coatings Solutions',
  robots: { index: false, follow: false },
};

/**
 * Media Intelligence document shell.
 *
 * `/media/*` is outside the `[locale]` marketing tree, so this layout must
 * provide `<html>`/`<body>` and import global CSS. Authentication remains
 * per-page via requireMediaPageAccess() and Server Actions.
 */
export default function MediaLayout({
  children,
}: {
  readonly children: ReactNode;
}) {
  const gate = evaluateMediaAccessGate();
  if (!gate.ok && gate.status === 404) {
    notFound();
  }

  return (
    <html
      lang="en"
      className={`${sourceSans.variable} ${plex.variable}`}
      data-media-theme="dark"
      suppressHydrationWarning
    >
      <body
        className="bg-navy-950 text-silver-100 min-h-dvh antialiased"
        style={{
          fontFamily:
            'var(--font-media-ui), var(--font-media-sans), ui-sans-serif, system-ui, sans-serif',
        }}
      >
        {children}
      </body>
    </html>
  );
}
