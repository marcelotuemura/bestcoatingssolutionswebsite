import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Section } from '@/components/ui/Section';
import { Reveal, RevealItem, RevealStagger } from '@/components/home/Reveal';

export function FaqSection({
  id = 'faq',
  title,
  items,
}: {
  readonly id?: string;
  readonly title: string;
  readonly items: readonly {
    readonly question: string;
    readonly answer: string;
  }[];
}) {
  return (
    <Section id={id} aria-labelledby={`${id}-heading`}>
      <Container>
        <Reveal className="max-w-3xl">
          <Heading as="h2" id={`${id}-heading`}>
            {title}
          </Heading>
          <RevealStagger className="divide-border/70 border-border/70 mt-8 divide-y border-y">
            {items.map((item) => (
              <RevealItem key={item.question}>
                <details className="group py-4">
                  <summary className="focus-visible:ring-focus-ring text-text-primary cursor-pointer list-none text-base font-medium focus-visible:ring-2 focus-visible:outline-none [&::-webkit-details-marker]:hidden">
                    <span className="flex items-start justify-between gap-4">
                      {item.question}
                      <span
                        aria-hidden="true"
                        className="text-text-muted group-open:rotate-45 motion-safe:transition"
                      >
                        +
                      </span>
                    </span>
                  </summary>
                  <p className="text-text-secondary mt-3 text-sm text-pretty sm:text-base">
                    {item.answer}
                  </p>
                </details>
              </RevealItem>
            ))}
          </RevealStagger>
        </Reveal>
      </Container>
    </Section>
  );
}
