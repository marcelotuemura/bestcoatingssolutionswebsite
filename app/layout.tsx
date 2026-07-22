import type { ReactNode } from 'react';

/**
 * Pass-through root layout.
 *
 * The real document shell (`<html lang>`, `<body>`, fonts, analytics) lives in
 * `app/[locale]/layout.tsx` so `lang` is server-rendered from the locale
 * segment — matching the Next.js App Router i18n guide.
 *
 * `sitemap.ts` / `robots.ts` still resolve under `app/` via this layout.
 */
export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return children;
}
