import Image from 'next/image';
import { Badge } from '@/components/ui/Badge';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Section } from '@/components/ui/Section';
import { Reveal } from '@/components/home/Reveal';
import type { ReactNode } from 'react';

export function PageHero({
  eyebrow,
  title,
  lead,
  badge,
  imageSrc,
  imageLabel,
  children,
}: {
  readonly eyebrow?: string;
  readonly title: string;
  readonly lead: string;
  readonly badge?: ReactNode;
  readonly imageSrc?: string;
  readonly imageLabel?: string;
  readonly children?: ReactNode;
}) {
  return (
    <Section className="pt-10 sm:pt-14" aria-labelledby="page-hero-heading">
      <Container>
        <div
          className={
            imageSrc
              ? 'grid items-center gap-10 lg:grid-cols-2 lg:gap-16'
              : 'max-w-3xl'
          }
        >
          <Reveal>
            {badge ? <div className="mb-4">{badge}</div> : null}
            {eyebrow ? (
              <p className="text-accent mb-3 text-sm tracking-[0.16em] uppercase">
                {eyebrow}
              </p>
            ) : null}
            <Heading as="h1" id="page-hero-heading">
              {title}
            </Heading>
            <p className="text-text-secondary mt-5 text-lg text-pretty">
              {lead}
            </p>
            {children ? <div className="mt-8">{children}</div> : null}
          </Reveal>
          {imageSrc ? (
            <Reveal className="border-border bg-bg-secondary relative aspect-[16/10] overflow-hidden rounded-[var(--radius-media)] border">
              <Image
                src={imageSrc}
                alt={imageLabel ?? ''}
                fill
                unoptimized
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              {imageLabel ? (
                <p className="bg-bg-primary/80 text-text-muted absolute right-3 bottom-3 rounded-[var(--radius-control)] px-2 py-1 text-xs">
                  {imageLabel}
                </p>
              ) : null}
            </Reveal>
          ) : null}
        </div>
      </Container>
    </Section>
  );
}

export function ComingSoonBadge({ label }: { readonly label: string }) {
  return <Badge tone="warning">{label}</Badge>;
}
