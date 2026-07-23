import type { Dictionary } from '@/i18n/get-dictionary';
import { Heading } from '@/components/ui/Heading';

export function InsuranceRepairProcess({
  dictionary,
}: {
  readonly dictionary: Dictionary;
}) {
  const copy = dictionary.phase5.insuranceExpanded;
  return (
    <div className="max-w-3xl" data-testid="insurance-repair-process">
      <Heading as="h2" id="insurance-process-heading">
        {copy.processTitle}
      </Heading>
      <ol className="mt-6 space-y-4">
        {copy.steps.map((step, index) => (
          <li key={step.title} className="border-navy-700 border-t pt-4">
            <p className="text-sm font-medium text-white">
              <span className="text-silver-500 mr-2">{index + 1}.</span>
              {step.title}
            </p>
            <p className="text-silver-400 mt-2 text-sm text-pretty">
              {step.body}
            </p>
          </li>
        ))}
      </ol>
      <Heading as="h3" id="insurance-disclaimers-heading" className="mt-10">
        {copy.disclaimersTitle}
      </Heading>
      <ul className="text-silver-300 mt-4 list-disc space-y-2 pl-5 text-sm">
        {copy.disclaimers.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
