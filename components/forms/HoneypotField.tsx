import { formDeliveryConfig } from '@/config/form-delivery';

/**
 * Hidden honeypot — leave empty. Not announced to assistive tech.
 */
export function HoneypotField({
  register,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly register: (name: any) => Record<string, unknown>;
}) {
  const name = formDeliveryConfig.honeypotField;
  return (
    <div
      className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
      aria-hidden="true"
    >
      <label htmlFor={name}>Company website</label>
      <input
        id={name}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        data-testid="form-honeypot"
        {...register(name)}
      />
    </div>
  );
}
