import type { ReactNode } from 'react';
import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Section } from '@/components/ui/Section';
import { Reveal, RevealItem, RevealStagger } from '@/components/home/Reveal';

export function ContentSection({
  id,
  title,
  body,
  children,
}: {
  readonly id: string;
  readonly title: string;
  readonly body?: string;
  readonly children?: ReactNode;
}) {
  return (
    <Section id={id} aria-labelledby={`${id}-heading`}>
      <Container>
        <Reveal className="max-w-3xl">
          <Heading as="h2" id={`${id}-heading`}>
            {title}
          </Heading>
          {body ? (
            <p className="text-text-secondary mt-5 text-lg text-pretty">
              {body}
            </p>
          ) : null}
          {children}
        </Reveal>
      </Container>
    </Section>
  );
}

export function BulletList({ items }: { readonly items: readonly string[] }) {
  return (
    <RevealStagger className="mt-6 space-y-2">
      {items.map((item) => (
        <RevealItem key={item}>
          <p className="text-text-primary border-accent/40 border-l pl-3 text-sm sm:text-base">
            {item}
          </p>
        </RevealItem>
      ))}
    </RevealStagger>
  );
}

/** Quiet editorial steps — not dashed card chrome. */
export function ProcessSteps({
  steps,
}: {
  readonly steps: readonly { readonly title: string; readonly body: string }[];
}) {
  return (
    <RevealStagger className="divide-border/70 border-border/70 mt-8 max-w-3xl divide-y border-y">
      {steps.map((step, index) => (
        <RevealItem key={step.title}>
          <div className="py-5 sm:py-6">
            <p className="text-accent text-xs tracking-[0.16em] uppercase">
              {String(index + 1).padStart(2, '0')}
            </p>
            <h3 className="text-text-primary mt-2 text-lg font-medium tracking-tight">
              {step.title}
            </h3>
            <p className="text-text-secondary mt-2 text-sm text-pretty">
              {step.body}
            </p>
          </div>
        </RevealItem>
      ))}
    </RevealStagger>
  );
}
