import Image from 'next/image';
import type { ReactNode } from 'react';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Reveal } from '@/components/home/Reveal';
import { cn } from '@/utils/cn';

export type DivisionAtmosphere = 'marine' | 'aviation';

/**
 * Shared division hero — same UI language for Marine and Aviation.
 * Atmosphere differs through texture/photography, not a separate design system.
 */
export function DivisionHero({
  atmosphere,
  eyebrow,
  title,
  lead,
  imageSrc,
  imageAlt = '',
  imageLabel,
  showImageLabel = true,
  children,
}: {
  readonly atmosphere: DivisionAtmosphere;
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  readonly imageSrc: string;
  /** Meaningful alt when authentic photography is shown; empty for decorative SVG placeholders. */
  readonly imageAlt?: string;
  readonly imageLabel?: string;
  /** Hide placeholder warning when a real BCS photo is displayed. */
  readonly showImageLabel?: boolean;
  readonly children?: ReactNode;
}) {
  const isSvg = imageSrc.endsWith('.svg');

  return (
    <section
      className={cn(
        'relative isolate overflow-hidden border-b',
        atmosphere === 'marine'
          ? 'bcs-marine-texture border-border/50'
          : 'bcs-aviation-texture border-border/50',
      )}
      aria-labelledby="page-hero-heading"
      data-testid="division-hero"
      data-atmosphere={atmosphere}
      data-hero-authentic={showImageLabel ? 'false' : 'true'}
    >
      <Container className="py-14 sm:py-20 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <p className="text-accent mb-3 text-sm tracking-[0.16em] uppercase">
              {eyebrow}
            </p>
            <Heading as="h1" id="page-hero-heading">
              {title}
            </Heading>
            <p className="text-text-secondary mt-5 text-lg text-pretty">
              {lead}
            </p>
            {children ? <div className="mt-8">{children}</div> : null}
          </Reveal>
          <Reveal className="lg:col-span-7">
            <div className="border-border relative aspect-[16/10] overflow-hidden rounded-[var(--radius-media)] border sm:aspect-[21/12]">
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                priority
                unoptimized={isSvg}
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 58vw"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050d18]/50 via-transparent to-transparent"
              />
              {showImageLabel && imageLabel ? (
                <p className="bg-bg-primary/80 text-text-muted absolute right-3 bottom-3 rounded-[var(--radius-control)] px-2 py-1 text-xs">
                  {imageLabel}
                </p>
              ) : null}
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
