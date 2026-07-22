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
            <p className="text-silver-300 mt-5 text-lg text-pretty">{body}</p>
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
          <p className="text-silver-100 border-electric-500/40 border-l pl-3 text-sm sm:text-base">
            {item}
          </p>
        </RevealItem>
      ))}
    </RevealStagger>
  );
}

export function ProcessSteps({
  steps,
}: {
  readonly steps: readonly { readonly title: string; readonly body: string }[];
}) {
  return (
    <RevealStagger className="mt-8 grid gap-6 sm:grid-cols-2">
      {steps.map((step, index) => (
        <RevealItem key={step.title}>
          <div className="border-navy-700/80 rounded-2xl border border-dashed p-5">
            <p className="text-electric-400 text-xs tracking-wide uppercase">
              {String(index + 1).padStart(2, '0')}
            </p>
            <h3 className="mt-2 text-lg font-medium text-white">
              {step.title}
            </h3>
            <p className="text-silver-400 mt-2 text-sm text-pretty">
              {step.body}
            </p>
          </div>
        </RevealItem>
      ))}
    </RevealStagger>
  );
}
