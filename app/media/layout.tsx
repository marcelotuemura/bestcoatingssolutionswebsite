import type { ReactNode } from 'react';
import { evaluateMediaAccessGate } from '@/config/media-intelligence';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Media Intelligence | Best Coatings Solutions',
  robots: { index: false, follow: false },
};

/**
 * Availability gate only. Authentication is enforced per-page via
 * requireMediaPageAccess() and independently in every Server Action.
 *
 * Global CSS is imported from the root `app/layout.tsx` so `/media` receives
 * Tailwind without introducing a second `<html>` document root (which breaks
 * the App Router tree when `[locale]` already owns `<html>`).
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
  return children;
}
