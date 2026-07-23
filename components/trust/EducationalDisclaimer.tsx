import { Heading } from '@/components/ui/Heading';

export function EducationalDisclaimer({
  title,
  body,
}: {
  readonly title: string;
  readonly body: string;
}) {
  return (
    <aside
      className="border-navy-700 bg-navy-950/60 max-w-3xl rounded-2xl border p-5"
      data-testid="educational-disclaimer"
    >
      <Heading as="h2" className="text-base sm:text-lg">
        {title}
      </Heading>
      <p className="text-silver-400 mt-2 text-sm text-pretty">{body}</p>
    </aside>
  );
}
