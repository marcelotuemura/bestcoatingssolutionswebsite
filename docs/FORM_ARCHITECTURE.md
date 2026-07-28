# Form architecture

## Schemas

| Module | Purpose |
|--------|---------|
| `lib/forms/contact-schema.ts` | Zod factory `createContactSchema` + `ContactFormValues` |
| `lib/forms/estimate-schema.ts` | Step schemas + `createFullEstimateSchema` + `validateEstimateFiles` |
| `lib/forms/form-errors.ts` | Flatten RHF errors for accessible summaries |

Schemas accept localized validation messages so EN/ES dictionaries stay authoritative.  
Server Actions re-validate with the same factories using internal English messages.

## Form models

- **Contact:** name, email, phone, inquiry type (no aviation), message, preferred contact method, consent, honeypot `companyUrl`
- **Estimate:** customer → vessel → marine services → damage → photos (client-only selection) → review/consent + honeypot

## Delivery path

1. Client UI → `contactSubmissionAdapter` / `estimateSubmissionAdapter`
2. Server Actions → `processContactSubmission` / `processEstimateSubmission`
3. Checks: honeypot, rate limit, Zod, Resend configuration
4. `sendInternalNotification` via Resend (`lib/submissions/mailer.ts`)
5. Typed `SubmissionResult` (`delivered` | `failed`)

See `docs/FORM_DELIVERY.md` for env vars and ops runbook.

## Uploads

`config/estimate-upload.ts` — local selection + validation only. Binaries are not uploaded in this release.
