import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Section } from '@/components/ui/Section';
import { Reveal, RevealItem, RevealStagger } from '@/components/home/Reveal';
import type { Dictionary } from '@/i18n/get-dictionary';

export function ProcessSection({
  dictionary,
}: {
  readonly dictionary: Dictionary;
}) {
  const copy = dictionary.home.process;
  return (
    <Section
      id="process"
      className="py-16 sm:py-24"
      aria-labelledby="process-heading"
    >
      <Container>
        <Reveal className="max-w-2xl">
          <Heading as="h2" id="process-heading">
            {copy.title}
          </Heading>
          <p className="text-text-secondary mt-4 text-pretty">{copy.body}</p>
        </Reveal>
        <RevealStagger className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {copy.steps.map((step, index) => (
            <RevealItem key={step.title}>
              <article>
                <p className="text-accent text-xs tracking-[0.2em] uppercase">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <h3 className="text-text-primary mt-2 text-lg font-medium">
                  {step.title}
                </h3>
                <p className="text-text-secondary mt-2 text-sm text-pretty">
                  {step.body}
                </p>
              </article>
            </RevealItem>
          ))}
        </RevealStagger>
      </Container>
    </Section>
  );
}
