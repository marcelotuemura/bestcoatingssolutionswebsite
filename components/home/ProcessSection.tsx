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
    <Section id="process" aria-labelledby="process-heading">
      <Container>
        <Reveal className="max-w-2xl">
          <Heading as="h2" id="process-heading">
            {copy.title}
          </Heading>
          <p className="text-silver-300 mt-4 text-pretty">{copy.body}</p>
        </Reveal>
        <RevealStagger className="mt-10 grid gap-6 sm:grid-cols-2">
          {copy.steps.map((step, index) => (
            <RevealItem key={step.title}>
              <article className="border-navy-700 h-full rounded-2xl border p-5">
                <p className="text-electric-400 text-xs tracking-[0.2em] uppercase">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <h3 className="mt-3 text-lg font-medium text-white">
                  {step.title}
                </h3>
                <p className="text-silver-300 mt-2 text-sm text-pretty">
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
