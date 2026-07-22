import { Container } from '@/components/ui/Container';
import { Heading } from '@/components/ui/Heading';
import { Section } from '@/components/ui/Section';
import { BeforeAfterSlider } from '@/components/home/BeforeAfterSlider';
import { Reveal } from '@/components/home/Reveal';
import type { Dictionary } from '@/i18n/get-dictionary';

export function BeforeAfterSection({
  dictionary,
}: {
  readonly dictionary: Dictionary;
}) {
  const copy = dictionary.home.beforeAfter;
  return (
    <Section
      id="before-after"
      className="bg-navy-900/30"
      aria-labelledby="before-after-heading"
    >
      <Container>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <Heading as="h2" id="before-after-heading">
              {copy.title}
            </Heading>
            <p className="text-silver-300 mt-4 text-pretty">{copy.body}</p>
          </Reveal>
          <Reveal>
            <BeforeAfterSlider
              beforeLabel={dictionary.a11y.beforeLabel}
              afterLabel={dictionary.a11y.afterLabel}
              sliderLabel={dictionary.a11y.beforeAfterSlider}
              valueTextTemplate={dictionary.a11y.beforeAfterValueText}
              beforeCaption={copy.beforeCaption}
              afterCaption={copy.afterCaption}
              mediaLabel={dictionary.placeholder.mediaLabel}
            />
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
