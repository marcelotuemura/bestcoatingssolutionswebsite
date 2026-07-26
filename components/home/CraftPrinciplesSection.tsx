import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Section } from '@/components/ui/Section';
import { Reveal, RevealItem, RevealStagger } from '@/components/home/Reveal';
import type { Dictionary } from '@/i18n/get-dictionary';

export function CraftPrinciplesSection({
  dictionary,
}: {
  readonly dictionary: Dictionary;
}) {
  const copy = dictionary.home.craftPrinciples;
  return (
    <Section id="craft-principles" aria-labelledby="craft-principles-heading">
      <Container>
        <Reveal className="max-w-2xl">
          <Heading as="h2" id="craft-principles-heading">
            {copy.title}
          </Heading>
          <p className="text-silver-300 mt-5 text-pretty">{copy.intro}</p>
        </Reveal>
        <RevealStagger className="mt-8 max-w-2xl space-y-4">
          {copy.questions.map((question, index) => (
            <RevealItem key={question}>
              <p className="text-silver-100 flex gap-4 text-base text-pretty sm:text-lg">
                <span
                  className="text-electric-400 shrink-0 font-medium tracking-wide"
                  aria-hidden
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span>{question}</span>
              </p>
            </RevealItem>
          ))}
        </RevealStagger>
        <Reveal className="mt-8 max-w-2xl">
          <p className="text-silver-300 text-pretty">{copy.closing}</p>
        </Reveal>
      </Container>
    </Section>
  );
}
