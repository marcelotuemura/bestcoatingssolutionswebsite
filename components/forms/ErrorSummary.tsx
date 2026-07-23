'use client';

import type { FormErrorItem } from '@/lib/forms/form-errors';

export function ErrorSummary({
  title,
  errors,
}: {
  readonly title: string;
  readonly errors: readonly FormErrorItem[];
}) {
  if (errors.length === 0) return null;

  return (
    <div
      id="form-error-summary"
      role="alert"
      tabIndex={-1}
      className="mb-6 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-4"
      data-testid="form-error-summary"
    >
      <p className="font-medium text-amber-100">{title}</p>
      <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-amber-50/90">
        {errors.map((error) => (
          <li key={error.id}>
            <a
              href={`#field-${error.id}`}
              className="focus-visible:ring-electric-500 rounded-sm underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:outline-none"
            >
              {error.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
