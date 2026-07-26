import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Section } from '@/components/ui/Section';
import { Reveal } from '@/components/home/Reveal';
import type { Dictionary } from '@/i18n/get-dictionary';

export function PhilosophySection({
  dictionary,
}: {
  readonly dictionary: Dictionary;
}) {
  const copy = dictionary.home.philosophy;
  return (
    <Section
      id="philosophy"
      className="bg-bg-secondary/40 py-16 sm:py-24"
      aria-labelledby="philosophy-heading"
    >
      <Container>
        <Reveal className="mx-auto max-w-3xl text-center">
          <Heading as="h2" id="philosophy-heading">
            {copy.title}
          </Heading>
          <p className="text-text-secondary mt-6 text-lg text-pretty sm:text-xl">
            {copy.body}
          </p>
        </Reveal>
      </Container>
    </Section>
  );
}
