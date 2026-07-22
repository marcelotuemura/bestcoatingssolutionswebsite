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
              <p className="text-electric-400 mb-3 text-sm tracking-wide uppercase">
                {eyebrow}
              </p>
            ) : null}
            <Heading as="h1" id="page-hero-heading">
              {title}
            </Heading>
            <p className="text-silver-300 mt-5 text-lg text-pretty">{lead}</p>
            {children ? <div className="mt-8">{children}</div> : null}
          </Reveal>
          {imageSrc ? (
            <Reveal className="border-navy-700 bg-navy-950 relative aspect-[16/10] overflow-hidden rounded-2xl border">
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
                <p className="bg-navy-950/80 text-silver-500 absolute right-3 bottom-3 rounded-lg px-2 py-1 text-xs">
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
