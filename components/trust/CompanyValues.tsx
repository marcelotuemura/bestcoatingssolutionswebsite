import { Heading } from '@/components/ui/Heading';

export interface CompanyValueItem {
  readonly id: string;
  readonly title: string;
  readonly body: string;
}

export function CompanyValues({
  title,
  intro,
  values,
}: {
  readonly title: string;
  readonly intro: string;
  readonly values: readonly CompanyValueItem[];
}) {
  return (
    <div data-testid="company-values">
      <Heading as="h2" id="company-values-heading">
        {title}
      </Heading>
      <p className="text-silver-400 mt-3 max-w-3xl text-pretty">{intro}</p>
      <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {values.map((value) => (
          <li key={value.id} className="border-navy-700 border-t pt-4">
            <h3 className="text-base font-medium text-white">{value.title}</h3>
            <p className="text-silver-400 mt-2 text-sm text-pretty">
              {value.body}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
