import type { FieldErrors, FieldValues } from 'react-hook-form';

export interface FormErrorItem {
  readonly id: string;
  readonly message: string;
}

/** Flatten RHF/Zod errors into a focusable error summary list. */
export function flattenFieldErrors<T extends FieldValues>(
  errors: FieldErrors<T>,
): FormErrorItem[] {
  const items: FormErrorItem[] = [];

  for (const [key, value] of Object.entries(errors)) {
    if (!value) continue;
    if (
      typeof value === 'object' &&
      'message' in value &&
      typeof value.message === 'string'
    ) {
      items.push({ id: key, message: value.message });
      continue;
    }
    if (
      typeof value === 'object' &&
      'root' in value &&
      value.root &&
      typeof value.root === 'object' &&
      'message' in value.root &&
      typeof value.root.message === 'string'
    ) {
      items.push({ id: key, message: value.root.message });
    }
  }

  return items;
}

export function focusFormErrorSummary(): void {
  const summary = document.getElementById('form-error-summary');
  summary?.focus();
}
