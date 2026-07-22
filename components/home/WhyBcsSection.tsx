import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Section } from '@/components/ui/Section';
import { Reveal, RevealItem, RevealStagger } from '@/components/home/Reveal';
import { trustPillars } from '@/config/trust';
import type { Dictionary } from '@/i18n/get-dictionary';

export function WhyBcsSection({
  dictionary,
}: {
  readonly dictionary: Dictionary;
}) {
  const copy = dictionary.home.whyBcs;
  return (
    <Section
      id="why-bcs"
      className="bg-navy-900/35"
      aria-labelledby="why-bcs-heading"
    >
      <Container>
        <Reveal className="max-w-2xl">
          <Heading as="h2" id="why-bcs-heading">
            {copy.title}
          </Heading>
          <p className="text-silver-300 mt-4 text-pretty">{copy.body}</p>
        </Reveal>
        <RevealStagger className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {trustPillars.map((id) => (
            <RevealItem key={id}>
              <div className="border-navy-700/80 rounded-2xl border px-4 py-5">
                <p className="text-sm font-medium tracking-wide text-white uppercase">
                  {dictionary.trust[id]}
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealStagger>
      </Container>
    </Section>
  );
}
