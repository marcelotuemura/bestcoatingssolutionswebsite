import Image from 'next/image';
import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export type MediaAspect = 'hero' | 'landscape' | 'portrait' | 'square' | 'wide';

const aspectClass: Record<MediaAspect, string> = {
  hero: 'aspect-[16/10]',
  landscape: 'aspect-[3/2]',
  portrait: 'aspect-[3/4]',
  square: 'aspect-square',
  wide: 'aspect-[21/9]',
};

/**
 * Editorial image treatment — large imagery, minimal chrome.
 * Prefer authentic photography; captions must stay honest about placeholders.
 */
export function MediaFrame({
  src,
  alt,
  caption,
  aspect = 'landscape',
  priority = false,
  division,
  children,
  className,
}: {
  readonly src?: string;
  readonly alt: string;
  readonly caption?: string;
  readonly aspect?: MediaAspect;
  readonly priority?: boolean;
  readonly division?: 'marine' | 'aviation' | 'neutral';
  readonly children?: ReactNode;
  readonly className?: string;
}) {
  return (
    <figure className={cn('group max-w-full', className)}>
      <div
        className={cn(
          'bg-surface relative overflow-hidden rounded-[var(--radius-media)]',
          aspectClass[aspect],
          division === 'marine' && 'bcs-marine-texture',
          division === 'aviation' && 'bcs-aviation-texture',
        )}
      >
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            unoptimized={src.endsWith('.svg')}
            className="object-cover transition-transform duration-[var(--duration-slow)] ease-[var(--ease-premium)] motion-safe:group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 720px"
          />
        ) : null}
        {children}
      </div>
      {caption ? (
        <figcaption className="text-text-muted mt-3 text-sm tracking-wide text-pretty">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
