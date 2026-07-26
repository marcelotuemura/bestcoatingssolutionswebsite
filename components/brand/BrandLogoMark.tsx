import Image from 'next/image';
import { brandLogo } from '@/config/brand-logo';
import { cn } from '@/utils/cn';

/**
 * Full-color BCS logo mark for hero, footer, and design-system evaluation.
 * Does not invent a simplified header variant — that requires owner approval.
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
  const width = Math.round(maxHeightPx * (320 / 96));
  return (
    <Image
      src={brandLogo.fullColorSrc}
      alt={brandLogo.alt}
      width={width}
      height={maxHeightPx}
      priority={priority}
      unoptimized
      className={cn('h-auto w-auto max-w-full', className)}
      style={{ maxHeight: maxHeightPx }}
    />
  );
}
