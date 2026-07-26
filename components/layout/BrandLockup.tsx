import Image from 'next/image';
import Link from 'next/link';
import { brandLogo } from '@/config/brand-logo';
import { siteConfig } from '@/config/site';
import type { Locale } from '@/i18n/config';
import { localePath } from '@/i18n/path';
import { cn } from '@/utils/cn';

/**
 * Header / compact brand lockup.
 * Uses `bcs-logo-header.webp` (+ `@2x`) when present, else the official mark.
 * Never presents the temporary letterform SVG as the official logo.
 */
export function BrandLockup({
  locale,
  label,
  className,
  surface = 'header',
}: {
  readonly locale: Locale;
  readonly label: string;
  readonly className?: string;
  readonly surface?: 'header' | 'footer';
}) {
  const maxHeight =
    surface === 'header'
      ? brandLogo.recommendedMaxHeightPx.header
      : brandLogo.recommendedMaxHeightPx.footer;

  const { width: intrinsicW, height: intrinsicH } = brandLogo.intrinsic.header;
  const displayWidth = Math.round(maxHeight * (intrinsicW / intrinsicH));

  /** Prefer @2x source for sharper retina rendering at compact header size. */
  const imageSrc =
    surface === 'header'
      ? (brandLogo.headerSrc2x ?? brandLogo.headerSrc)
      : brandLogo.officialSrc;

  return (
    <Link
      href={localePath(locale)}
      aria-label={`${siteConfig.name} ${siteConfig.shortName}. ${label}`}
      className={cn(
        'focus-visible:ring-focus-ring focus-visible:ring-offset-bg-primary inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-control)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        className,
      )}
      data-logo-mode={brandLogo.headerMode}
      data-testid="brand-lockup"
    >
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={brandLogo.alt}
          width={displayWidth}
          height={maxHeight}
          unoptimized={imageSrc.endsWith('.svg')}
          priority={surface === 'header'}
          className="h-auto w-auto max-w-[11rem] object-contain object-left sm:max-w-[14rem]"
          style={{ maxHeight }}
          sizes={`${displayWidth}px`}
        />
      ) : (
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="text-text-primary truncate text-sm font-semibold tracking-tight sm:text-base">
            {siteConfig.name}
          </span>
          <span className="text-text-muted text-[0.65rem] tracking-[0.14em] uppercase">
            {siteConfig.shortName}
          </span>
        </span>
      )}
    </Link>
  );
}
