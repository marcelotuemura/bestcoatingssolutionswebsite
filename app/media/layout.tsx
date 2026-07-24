import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { isMediaIntelligenceEnabled } from '@/config/media-intelligence';

export const metadata = {
  title: 'Media Intelligence | Best Coatings Solutions',
  robots: { index: false, follow: false },
};

export default function MediaLayout({
  children,
}: {
  readonly children: ReactNode;
}) {
  if (!isMediaIntelligenceEnabled()) {
    notFound();
  }
  return children;
}
