import type { ReactNode } from 'react';
import { evaluateMediaAccessGate } from '@/config/media-intelligence';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Media Intelligence | Best Coatings Solutions',
  robots: { index: false, follow: false },
};

/**
 * Availability gate only. Authentication is enforced per-page via
 * requireMediaPageAccess() and independently in every Server Action.
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
