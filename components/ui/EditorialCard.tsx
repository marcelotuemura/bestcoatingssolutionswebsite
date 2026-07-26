import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

/**
 * Editorial card — imagery-led, minimal border, no dashboard chrome.
 */
export function EditorialCard({
  children,
  className,
  media,
}: {
  readonly children: ReactNode;
  readonly className?: string;
  readonly media?: ReactNode;
}) {
  return (
    <article
      className={cn(
        'bg-surface/40 border-border/70 overflow-hidden rounded-[var(--radius-card)] border',
        'shadow-[0_1px_0_rgba(255,255,255,0.04)_inset]',
        className,
      )}
    >
      {media ? <div className="border-divider border-b">{media}</div> : null}
      <div className="p-6 sm:p-8">{children}</div>
    </article>
  );
}
