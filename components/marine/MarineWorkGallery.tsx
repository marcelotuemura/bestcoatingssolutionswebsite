import Image from 'next/image';
import { Reveal, RevealItem, RevealStagger } from '@/components/home/Reveal';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Section } from '@/components/ui/Section';
import { marinePhotography } from '@/config/marine-photography';

export function MarineWorkGallery({
  title,
  lead,
}: {
  readonly title: string;
  readonly lead: string;
}) {
  return (
    <Section
      id="marine-work"
      className="py-16 sm:py-24"
      aria-labelledby="marine-work-heading"
      data-testid="marine-work-gallery"
    >
      <Container>
        <Reveal className="max-w-3xl">
          <Heading as="h2" id="marine-work-heading">
            {title}
          </Heading>
          <p className="text-text-secondary mt-5 text-lg text-pretty">{lead}</p>
        </Reveal>

        <RevealStagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {marinePhotography.gallery.map((photo) => (
            <RevealItem key={photo.src}>
              <figure className="border-border/60 bg-surface/20 overflow-hidden rounded-[var(--radius-media)] border">
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    width={photo.width}
                    height={photo.height}
                    className="h-full w-full object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    loading="lazy"
                    // Pre-optimized WebPs — skip /_next/image to avoid CI navigator
                    // contention when the 22-image marine page loads under load.
                    unoptimized
                  />
                </div>
              </figure>
            </RevealItem>
          ))}
        </RevealStagger>
      </Container>
    </Section>
  );
}
