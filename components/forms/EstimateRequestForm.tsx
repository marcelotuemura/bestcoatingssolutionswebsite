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
import { estimateUploadPolicy } from '@/config/estimate-upload';
import {
  affectedAreaOptions,
  estimateServiceOptions,
  type EstimateServiceOption,
  urgencyOptions,
  vesselOperabilityOptions,
} from '@/config/form-options';
import { routes } from '@/config/routes';
import {
  createEstimateConsentSchema,
  createEstimateCustomerSchema,
  createEstimateDamageSchema,
  createEstimateServiceSchema,
  createEstimateVesselSchema,
  createFullEstimateSchema,
  validateEstimateFiles,
  type EstimateFormValues,
} from '@/lib/forms/estimate-schema';
import {
  flattenFieldErrors,
  focusFormErrorSummary,
} from '@/lib/forms/form-errors';
import { estimateSubmissionAdapter } from '@/lib/submissions/estimate-submission-adapter';
import type { Dictionary } from '@/i18n/get-dictionary';
import type { Locale } from '@/i18n/config';
import { localePath } from '@/i18n/path';

const STEPS = [
  'customer',
  'vessel',
  'services',
  'damage',
  'photos',
  'review',
] as const;

export function EstimateRequestForm({
  locale,
  dictionary,
}: {
  readonly locale: Locale;
  readonly dictionary: Dictionary;
}) {
  const router = useRouter();
  const copy = dictionary.conversion;
  const [stepIndex, setStepIndex] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fullSchema = useMemo(
    () => createFullEstimateSchema(copy.validation),
    [copy.validation],
  );

  const form = useForm<EstimateFormValues>({
    resolver: zodResolver(fullSchema),
    mode: 'onSubmit',
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      preferredContactMethod: 'either',
      manufacturer: '',
      model: '',
      year: new Date().getFullYear(),
      lengthFeet: 30,
      vesselName: '',
      hin: '',
      currentLocation: '',
      marinaName: '',
      services: [],
      damageDescription: '',
      affectedArea: 'unsure',
      damageOccurred: '',
      operability: 'unknown',
      insuranceRelated: 'unsure',
      urgency: 'flexible',
      acknowledgeNotQuote: false,
      acknowledgeInspection: false,
      acknowledgeNoAppointment: false,
    },
  });

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    watch,
    formState: { errors },
  } = form;

  const step = STEPS[stepIndex]!;
  const stepLabel = copy.estimate.steps[step];
  const progressText = copy.estimate.progress
    .replace('{current}', String(stepIndex + 1))
    .replace('{total}', String(STEPS.length))
    .replace('{label}', stepLabel);

  const selectedServices = watch('services') ?? [];

  async function goNext() {
    setSubmitError(null);
    setFileError(null);
    let valid = true;

    if (step === 'customer') {
      valid = await trigger([
        'fullName',
        'email',
        'phone',
        'preferredContactMethod',
      ]);
      const result = createEstimateCustomerSchema(copy.validation).safeParse(
        getValues(),
      );
      valid = result.success;
      if (!result.success) {
        await trigger(['fullName', 'email', 'phone', 'preferredContactMethod']);
      }
    } else if (step === 'vessel') {
      valid = await trigger([
        'manufacturer',
        'model',
        'year',
        'lengthFeet',
        'currentLocation',
        'vesselName',
        'hin',
        'marinaName',
      ]);
      valid = createEstimateVesselSchema(copy.validation).safeParse(
        getValues(),
      ).success;
      if (!valid) {
        await trigger([
          'manufacturer',
          'model',
          'year',
          'lengthFeet',
          'currentLocation',
        ]);
      }
    } else if (step === 'services') {
      valid = createEstimateServiceSchema(copy.validation).safeParse(
        getValues(),
      ).success;
      await trigger('services');
    } else if (step === 'damage') {
      valid = createEstimateDamageSchema(copy.validation).safeParse(
        getValues(),
      ).success;
      await trigger([
        'damageDescription',
        'affectedArea',
        'operability',
        'insuranceRelated',
        'urgency',
      ]);
    } else if (step === 'photos') {
      const err = validateEstimateFiles(files, {
        maxFiles: copy.validation.maxFiles,
        maxSize: copy.validation.maxSize,
        type: copy.validation.fileType,
      });
      if (err) {
        setFileError(err);
        valid = false;
        focusFormErrorSummary();
      }
    }

    if (!valid) {
      focusFormErrorSummary();
      return;
    }
    setStepIndex((index) => Math.min(index + 1, STEPS.length - 1));
  }

  function goBack() {
    setSubmitError(null);
    setFileError(null);
    setStepIndex((index) => Math.max(index - 1, 0));
  }

  function onFilesSelected(list: FileList | null) {
    if (!list) return;
    const next = [...files, ...Array.from(list)];
    const err = validateEstimateFiles(next, {
      maxFiles: copy.validation.maxFiles,
      maxSize: copy.validation.maxSize,
      type: copy.validation.fileType,
    });
    if (err) {
      setFileError(err);
      focusFormErrorSummary();
      return;
    }
    setFileError(null);
    setFiles(next);
  }

  function removeFile(name: string, index: number) {
    setFiles((current) =>
      current.filter((file, i) => !(file.name === name && i === index)),
    );
    setFileError(null);
  }

  const onSubmit = handleSubmit(async (values) => {
    const consentOk = createEstimateConsentSchema(copy.validation).safeParse(
      values,
    ).success;
    if (!consentOk) {
      await trigger([
        'acknowledgeNotQuote',
        'acknowledgeInspection',
        'acknowledgeNoAppointment',
      ]);
      focusFormErrorSummary();
      return;
    }

    const fileErr = validateEstimateFiles(files, {
      maxFiles: copy.validation.maxFiles,
      maxSize: copy.validation.maxSize,
      type: copy.validation.fileType,
    });
    if (fileErr) {
      setFileError(fileErr);
      focusFormErrorSummary();
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    const simulateFailure =
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('simulateFailure') ===
        '1';

    const result = await estimateSubmissionAdapter.submit({
      payload: { ...values },
      attachments: files.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
      })),
      simulateFailure,
    });

    setSubmitting(false);

    if (!result.ok) {
      setSubmitError(copy.common.demoFailure);
      focusFormErrorSummary();
      return;
    }

    setFiles([]);
    router.push(`${localePath(locale, routes.thankYou.path)}?type=estimate`);
  });

  const errorItems = [
    ...flattenFieldErrors(errors),
    ...(fileError ? [{ id: 'photos', message: fileError }] : []),
    ...(submitError ? [{ id: 'submit', message: submitError }] : []),
  ];

  const maxMb = estimateUploadPolicy.maxFileSizeBytes / (1024 * 1024);
  const photosHint = copy.estimate.photosHint
    .replace('{max}', String(estimateUploadPolicy.maxFiles))
    .replace('{size}', String(maxMb));

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="space-y-6"
      data-testid="estimate-form"
    >
      <p className="text-silver-500 border-navy-700 rounded-xl border border-dashed px-4 py-3 text-sm">
        {copy.common.demoBanner}
      </p>
      <p
        className="text-silver-300 text-sm"
        role="status"
        aria-live="polite"
        data-testid="estimate-progress"
      >
        <span className="sr-only">{copy.a11y.stepStatus}: </span>
        {progressText}
      </p>
      <ol className="text-silver-500 flex flex-wrap gap-2 text-xs">
        {STEPS.map((id, index) => (
          <li
            key={id}
            className={
              index === stepIndex
                ? 'text-electric-400 font-medium'
                : index < stepIndex
                  ? 'text-silver-300'
                  : undefined
            }
            aria-current={index === stepIndex ? 'step' : undefined}
          >
            {index + 1}. {copy.estimate.steps[id]}
          </li>
        ))}
      </ol>

      {errorItems.length > 0 ? (
        <ErrorSummary title={copy.common.errorSummary} errors={errorItems} />
      ) : null}

      {step === 'customer' ? (
        <div className="space-y-6" data-testid="step-customer">
          <FormField
            id="fullName"
            label={copy.estimate.fields.fullName}
            required
            error={errors.fullName?.message}
          >
            <Input
              id="fullName"
              autoComplete="name"
              {...register('fullName')}
            />
          </FormField>
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              id="email"
              label={copy.estimate.fields.email}
              required
              error={errors.email?.message}
            >
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email')}
              />
            </FormField>
            <FormField
              id="phone"
              label={copy.estimate.fields.phone}
              required
              error={errors.phone?.message}
            >
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                {...register('phone')}
              />
            </FormField>
          </div>
          <FormField
            id="preferredContactMethod"
            label={copy.estimate.fields.preferredContactMethod}
            required
          >
            <Select
              id="preferredContactMethod"
              {...register('preferredContactMethod')}
            >
              <option value="phone">{copy.estimate.preferred.phone}</option>
              <option value="email">{copy.estimate.preferred.email}</option>
              <option value="either">{copy.estimate.preferred.either}</option>
            </Select>
          </FormField>
        </div>
      ) : null}

      {step === 'vessel' ? (
        <div className="space-y-6" data-testid="step-vessel">
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              id="manufacturer"
              label={copy.estimate.fields.manufacturer}
              required
              error={errors.manufacturer?.message}
            >
              <Input id="manufacturer" {...register('manufacturer')} />
            </FormField>
            <FormField
              id="model"
              label={copy.estimate.fields.model}
              required
              error={errors.model?.message}
            >
              <Input id="model" {...register('model')} />
            </FormField>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              id="year"
              label={copy.estimate.fields.year}
              required
              error={errors.year?.message}
            >
              <Input
                id="year"
                type="number"
                {...register('year', { valueAsNumber: true })}
              />
            </FormField>
            <FormField
              id="lengthFeet"
              label={copy.estimate.fields.lengthFeet}
              required
              error={errors.lengthFeet?.message}
            >
              <Input
                id="lengthFeet"
                type="number"
                step="0.1"
                {...register('lengthFeet', { valueAsNumber: true })}
              />
            </FormField>
          </div>
          <FormField
            id="vesselName"
            label={copy.estimate.fields.vesselName}
            optionalLabel={copy.common.optional}
          >
            <Input id="vesselName" {...register('vesselName')} />
          </FormField>
          <FormField
            id="hin"
            label={copy.estimate.fields.hin}
            optionalLabel={copy.common.optional}
          >
            <Input id="hin" {...register('hin')} />
          </FormField>
          <FormField
            id="currentLocation"
            label={copy.estimate.fields.currentLocation}
            required
            error={errors.currentLocation?.message}
          >
            <Input id="currentLocation" {...register('currentLocation')} />
          </FormField>
          <FormField
            id="marinaName"
            label={copy.estimate.fields.marinaName}
            optionalLabel={copy.common.optional}
          >
            <Input id="marinaName" {...register('marinaName')} />
          </FormField>
        </div>
      ) : null}

      {step === 'services' ? (
        <fieldset data-testid="step-services" className="space-y-3">
          <legend className="text-silver-300 mb-2 text-sm font-medium">
            {copy.estimate.fields.services}{' '}
            <span className="text-electric-400" aria-hidden="true">
              *
            </span>
          </legend>
          <p className="text-silver-500 text-sm">{copy.estimate.noAviation}</p>
          <ul className="space-y-2">
            {estimateServiceOptions.map((service) => (
              <li key={service}>
                <Checkbox
                  id={`service-${service}`}
                  label={copy.estimate.services[service]}
                  value={service}
                  {...register('services')}
                />
              </li>
            ))}
          </ul>
          {errors.services?.message ? (
            <p className="text-sm text-amber-200">{errors.services.message}</p>
          ) : null}
        </fieldset>
      ) : null}

      {step === 'damage' ? (
        <div className="space-y-6" data-testid="step-damage">
          <FormField
            id="damageDescription"
            label={copy.estimate.fields.damageDescription}
            required
            error={errors.damageDescription?.message}
          >
            <Textarea
              id="damageDescription"
              rows={5}
              {...register('damageDescription')}
            />
          </FormField>
          <FormField
            id="affectedArea"
            label={copy.estimate.fields.affectedArea}
            required
          >
            <Select id="affectedArea" {...register('affectedArea')}>
              {affectedAreaOptions.map((option) => (
                <option key={option} value={option}>
                  {copy.estimate.affected[option]}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField
            id="damageOccurred"
            label={copy.estimate.fields.damageOccurred}
            optionalLabel={copy.common.optional}
          >
            <Input id="damageOccurred" {...register('damageOccurred')} />
          </FormField>
          <FormField
            id="operability"
            label={copy.estimate.fields.operability}
            required
          >
            <Select id="operability" {...register('operability')}>
              {vesselOperabilityOptions.map((option) => (
                <option key={option} value={option}>
                  {copy.estimate.operability[option]}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField
            id="insuranceRelated"
            label={copy.estimate.fields.insuranceRelated}
            required
          >
            <Select id="insuranceRelated" {...register('insuranceRelated')}>
              <option value="yes">{copy.estimate.insurance.yes}</option>
              <option value="no">{copy.estimate.insurance.no}</option>
              <option value="unsure">{copy.estimate.insurance.unsure}</option>
            </Select>
          </FormField>
          <FormField
            id="urgency"
            label={copy.estimate.fields.urgency}
            required
            hint={copy.estimate.urgencyHint}
          >
            <Select id="urgency" {...register('urgency')}>
              {urgencyOptions.map((option) => (
                <option key={option} value={option}>
                  {copy.estimate.urgency[option]}
                </option>
              ))}
            </Select>
          </FormField>
        </div>
      ) : null}

      {step === 'photos' ? (
        <div className="space-y-4" data-testid="step-photos">
          <FormField
            id="photos"
            label={copy.estimate.fields.photos}
            optionalLabel={copy.common.optional}
            hint={photosHint}
            error={fileError ?? undefined}
          >
            <Input
              id="photos"
              type="file"
              accept={estimateUploadPolicy.acceptAttribute}
              multiple
              aria-label={copy.a11y.fileInput}
              onChange={(event) => {
                onFilesSelected(event.target.files);
                event.target.value = '';
              }}
            />
          </FormField>
          <p
            className="text-silver-400 text-sm"
            role="status"
            aria-live="polite"
          >
            {copy.estimate.photosSelected.replace(
              '{count}',
              String(files.length),
            )}
          </p>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="border-navy-700 flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-sm"
              >
                <span className="text-silver-300 truncate">{file.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.name, index)}
                  aria-label={copy.estimate.photosRemove.replace(
                    '{name}',
                    file.name,
                  )}
                >
                  ×
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {step === 'review' ? (
        <div className="space-y-6" data-testid="step-review">
          <h2 className="text-xl font-semibold text-white">
            {copy.estimate.reviewTitle}
          </h2>
          <dl className="text-silver-300 space-y-3 text-sm">
            <div>
              <dt className="text-silver-500">
                {copy.estimate.fields.fullName}
              </dt>
              <dd>{getValues('fullName')}</dd>
            </div>
            <div>
              <dt className="text-silver-500">{copy.estimate.fields.email}</dt>
              <dd>{getValues('email')}</dd>
            </div>
            <div>
              <dt className="text-silver-500">{copy.estimate.fields.phone}</dt>
              <dd>{getValues('phone')}</dd>
            </div>
            <div>
              <dt className="text-silver-500">
                {copy.estimate.fields.preferredContactMethod}
              </dt>
              <dd>
                {copy.estimate.preferred[getValues('preferredContactMethod')]}
              </dd>
            </div>
            <div>
              <dt className="text-silver-500">
                {copy.estimate.fields.manufacturer}
              </dt>
              <dd>
                {getValues('manufacturer')} {getValues('model')} (
                {getValues('year')}) — {getValues('lengthFeet')} ft
              </dd>
            </div>
            <div>
              <dt className="text-silver-500">
                {copy.estimate.fields.currentLocation}
              </dt>
              <dd>{getValues('currentLocation')}</dd>
            </div>
            <div>
              <dt className="text-silver-500">
                {copy.estimate.fields.services}
              </dt>
              <dd>
                <ul className="list-inside list-disc">
                  {selectedServices.map((service) => (
                    <li key={service}>
                      {copy.estimate.services[service as EstimateServiceOption]}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
            <div>
              <dt className="text-silver-500">
                {copy.estimate.fields.damageDescription}
              </dt>
              <dd className="whitespace-pre-wrap">
                {getValues('damageDescription')}
              </dd>
            </div>
            <div>
              <dt className="text-silver-500">{copy.estimate.reviewPhotos}</dt>
              <dd>{files.length}</dd>
            </div>
          </dl>

          <Checkbox
            id="acknowledgeNotQuote"
            label={copy.estimate.fields.acknowledgeNotQuote}
            {...register('acknowledgeNotQuote')}
          />
          <Checkbox
            id="acknowledgeInspection"
            label={copy.estimate.fields.acknowledgeInspection}
            {...register('acknowledgeInspection')}
          />
          <Checkbox
            id="acknowledgeNoAppointment"
            label={copy.estimate.fields.acknowledgeNoAppointment}
            {...register('acknowledgeNoAppointment')}
          />
        </div>
      ) : null}

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {submitting ? copy.a11y.submitting : progressText}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="secondary"
          onClick={goBack}
          disabled={stepIndex === 0 || submitting}
          data-testid="estimate-back"
        >
          {copy.common.back}
        </Button>
        {step === 'review' ? (
          <Button
            type="submit"
            disabled={submitting}
            data-testid="estimate-submit"
          >
            {submitting ? copy.common.submitting : copy.common.submit}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={goNext}
            disabled={submitting}
            data-testid="estimate-next"
          >
            {copy.common.next}
          </Button>
        )}
      </div>
    </form>
  );
}
