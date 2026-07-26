import Image from 'next/image';
import { brandLogo } from '@/config/brand-logo';
import { siteConfig } from '@/config/site';
import { cn } from '@/utils/cn';

/**
 * Large brand presentation mark for footer / design-system / hero-scale spots.
 * Uses official SVG/PNG/WebP when present. Never labels the temporary SVG as official.
 */
export function BrandLogoMark({
  maxHeightPx,
  className,
  priority = false,
}: {
  readonly maxHeightPx: number;
  readonly className?: string;
  readonly priority?: boolean;
}) {
  if (!brandLogo.officialSrc) {
    const heroScale = maxHeightPx >= 72;
    return (
      <div
        className={cn('flex flex-col leading-tight', className)}
        data-testid="brand-logo-text-fallback"
        data-logo-mode="text"
      >
        <span
          className={cn(
            'text-text-primary font-semibold tracking-tight',
            heroScale ? 'text-2xl sm:text-3xl' : 'text-base',
          )}
        >
          {siteConfig.name}
        </span>
        <span
          className={cn(
            'text-text-muted tracking-[0.14em] uppercase',
            heroScale ? 'mt-2 text-xs sm:text-sm' : 'mt-1 text-xs',
          )}
        >
          Premium marine &amp; aviation refinishing
        </span>
      </div>
    );
  }

  const width = Math.round(maxHeightPx * (320 / 96));
  return (
    <Image
      src={brandLogo.officialSrc}
      alt={brandLogo.alt}
      width={width}
      height={maxHeightPx}
      priority={priority}
      unoptimized={brandLogo.officialSrc.endsWith('.svg')}
      className={cn('h-auto w-auto max-w-full', className)}
      style={{ maxHeight: maxHeightPx }}
      data-testid="brand-logo-official"
      data-logo-mode="image"
    />
  );
}
