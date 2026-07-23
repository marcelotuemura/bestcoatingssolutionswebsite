'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { ErrorSummary } from '@/components/forms/ErrorSummary';
import { FormField } from '@/components/forms/FormField';
import { contactInquiryTypes } from '@/config/form-options';
import {
  createContactSchema,
  type ContactFormValues,
} from '@/lib/forms/contact-schema';
import {
  flattenFieldErrors,
  focusFormErrorSummary,
} from '@/lib/forms/form-errors';
import { contactSubmissionAdapter } from '@/lib/submissions/contact-submission-adapter';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';
import { localePath } from '@/i18n/path';
import { routes } from '@/config/routes';

export function ContactForm({
  locale,
  dictionary,
}: {
  readonly locale: Locale;
  readonly dictionary: Dictionary;
}) {
  const router = useRouter();
  const copy = dictionary.conversion;
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const schema = useMemo(
    () => createContactSchema(copy.validation),
    [copy.validation],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ContactFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      inquiryType: 'general',
      message: '',
      preferredContactMethod: 'either',
      consent: false,
    },
  });

  const errorItems = flattenFieldErrors(errors);

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    setSubmitError(null);
    const simulateFailure =
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('simulateFailure') ===
        '1';

    const result = await contactSubmissionAdapter.submit({
      payload: { ...values },
      simulateFailure,
    });

    setSubmitting(false);

    if (!result.ok) {
      setSubmitError(copy.common.demoFailure);
      focusFormErrorSummary();
      // Retain values — RHF keeps them
      void getValues();
      return;
    }

    router.push(`${localePath(locale, routes.thankYou.path)}?type=contact`);
  });

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="space-y-6"
      data-testid="contact-form"
    >
      <p className="text-silver-500 border-navy-700 rounded-xl border border-dashed px-4 py-3 text-sm">
        {copy.common.demoBanner}
      </p>

      {(errorItems.length > 0 || submitError) && (
        <ErrorSummary
          title={copy.common.errorSummary}
          errors={[
            ...errorItems,
            ...(submitError ? [{ id: 'submit', message: submitError }] : []),
          ]}
        />
      )}

      <FormField
        id="name"
        label={copy.contact.fields.name}
        required
        error={errors.name?.message}
      >
        <Input
          id="name"
          autoComplete="name"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'name-error' : undefined}
          {...register('name')}
        />
      </FormField>

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField
          id="email"
          label={copy.contact.fields.email}
          required
          error={errors.email?.message}
        >
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            {...register('email')}
          />
        </FormField>
        <FormField
          id="phone"
          label={copy.contact.fields.phone}
          required
          error={errors.phone?.message}
        >
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            aria-invalid={Boolean(errors.phone)}
            {...register('phone')}
          />
        </FormField>
      </div>

      <FormField
        id="inquiryType"
        label={copy.contact.fields.inquiryType}
        required
        error={errors.inquiryType?.message}
      >
        <Select
          id="inquiryType"
          aria-invalid={Boolean(errors.inquiryType)}
          {...register('inquiryType')}
        >
          {contactInquiryTypes.map((type) => (
            <option key={type} value={type}>
              {copy.contact.inquiryTypes[type]}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField
        id="preferredContactMethod"
        label={copy.contact.fields.preferredContactMethod}
        required
        error={errors.preferredContactMethod?.message}
      >
        <Select
          id="preferredContactMethod"
          {...register('preferredContactMethod')}
        >
          <option value="phone">{copy.contact.preferred.phone}</option>
          <option value="email">{copy.contact.preferred.email}</option>
          <option value="either">{copy.contact.preferred.either}</option>
        </Select>
      </FormField>

      <FormField
        id="message"
        label={copy.contact.fields.message}
        required
        error={errors.message?.message}
      >
        <Textarea
          id="message"
          rows={5}
          aria-invalid={Boolean(errors.message)}
          {...register('message')}
        />
      </FormField>

      <Checkbox
        id="consent"
        label={copy.contact.fields.consent}
        {...register('consent')}
      />
      {errors.consent?.message ? (
        <p className="text-sm text-amber-200" id="consent-error">
          {errors.consent.message}
        </p>
      ) : null}

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {submitting ? copy.a11y.submitting : ''}
      </div>

      <Button type="submit" disabled={submitting} data-testid="contact-submit">
        {submitting ? copy.common.submitting : copy.common.submit}
      </Button>
    </form>
  );
}
