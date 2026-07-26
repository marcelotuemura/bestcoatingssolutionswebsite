import type { ReactNode } from 'react';
import './globals.css';

/**
 * Pass-through root layout.
 *
 * The marketing document shell (`<html lang>`, `<body>`, fonts, analytics)
 * lives in `app/[locale]/layout.tsx` so `lang` is server-rendered from the
 * locale segment — matching the Next.js App Router i18n guide.
 *
 * Global CSS is imported here so sibling trees such as `/media/*` still receive
 * Tailwind tokens without defining a second `<html>` root.
 *
 * `sitemap.ts` / `robots.ts` still resolve under `app/` via this layout.
 */
export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return children;
}
