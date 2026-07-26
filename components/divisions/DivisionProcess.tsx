import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Section } from '@/components/ui/Section';
import { Reveal, RevealItem, RevealStagger } from '@/components/home/Reveal';

export type DivisionProcessStep = {
  readonly title: string;
  readonly body: string;
};

/**
 * “Show the Process” — shared workflow presentation for division pages.
 */
export function DivisionProcess({
  id = 'process',
  eyebrow,
  title,
  lead,
  steps,
}: {
  readonly id?: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly lead: string;
  readonly steps: readonly DivisionProcessStep[];
}) {
  return (
    <Section
      id={id}
      className="bg-bg-secondary/35 py-16 sm:py-24"
      aria-labelledby={`${id}-heading`}
      data-testid="division-process"
    >
      <Container>
        <Reveal className="max-w-2xl">
          <p className="text-accent mb-3 text-sm tracking-[0.16em] uppercase">
            {eyebrow}
          </p>
          <Heading as="h2" id={`${id}-heading`}>
            {title}
          </Heading>
          <p className="text-text-secondary mt-5 text-lg text-pretty">{lead}</p>
        </Reveal>

        <ol className="mt-12">
          <RevealStagger className="grid gap-0 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((step, index) => (
              <RevealItem key={step.title}>
                <li className="border-border/70 flex h-full flex-col border-t py-8 pr-6 sm:pr-8">
                  <p className="text-accent text-xs tracking-[0.2em] uppercase">
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <h3 className="font-display text-text-primary mt-3 text-2xl font-medium tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-text-secondary mt-3 text-sm text-pretty">
                    {step.body}
                  </p>
                </li>
              </RevealItem>
            ))}
          </RevealStagger>
        </ol>
      </Container>
    </Section>
  );
}
