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
          <RevealStagger className="mt-8 space-y-4">
            {items.map((item) => (
              <RevealItem key={item.question}>
                <details className="border-navy-700 group rounded-2xl border px-5 py-4">
                  <summary className="focus-visible:ring-electric-500 cursor-pointer list-none text-base font-medium text-white focus-visible:ring-2 focus-visible:outline-none [&::-webkit-details-marker]:hidden">
                    <span className="flex items-start justify-between gap-4">
                      {item.question}
                      <span
                        aria-hidden="true"
                        className="text-silver-500 transition group-open:rotate-45"
                      >
                        +
                      </span>
                    </span>
                  </summary>
                  <p className="text-silver-400 mt-3 text-sm text-pretty sm:text-base">
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
