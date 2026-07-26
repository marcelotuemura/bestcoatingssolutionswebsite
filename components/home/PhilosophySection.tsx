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
      className="bg-navy-900/35"
      aria-labelledby="philosophy-heading"
    >
      <Container>
        <Reveal className="max-w-2xl">
          <Heading as="h2" id="philosophy-heading">
            {copy.title}
          </Heading>
          <p className="text-silver-300 mt-5 text-lg text-pretty">
            {copy.body}
          </p>
        </Reveal>
      </Container>
    </Section>
  );
}
