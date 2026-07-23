# Form architecture (Phases 4–6)

## Schemas

| Module | Purpose |
|--------|---------|
| `lib/forms/contact-schema.ts` | Zod factory `createContactSchema` + `ContactFormValues` |
| `lib/forms/estimate-schema.ts` | Step schemas + `createFullEstimateSchema` + `validateEstimateFiles` |
| `lib/forms/form-errors.ts` | Flatten RHF errors for accessible summaries |
| `lib/forms/submission-ui.ts` | Map `SubmissionMessageKey` → localized UI copy |

Schemas accept localized validation messages so EN/ES dictionaries stay authoritative.

## Form models

- **Contact:** name, email, phone, inquiry type (no aviation), message, preferred contact method, consent
- **Estimate:** customer → vessel → marine services (from `config/form-options` + `marine-services`) → damage → photos → review/consent + Turnstile when live

## Production submission pipeline

Active wiring (Server Actions):

| Entry | Path |
|-------|------|
| Contact action | `app/[locale]/contact/actions.ts` → `submitContactAction` |
| Estimate action | `app/[locale]/estimate-request/actions.ts` → `submitEstimateAction` |
| Pipeline | `lib/submissions/process-submission.ts` |
| Email | `lib/submissions/resend-delivery.ts` |
| Photos | `lib/submissions/blob-upload.ts` (Vercel Blob when token present) |
| Rate limit | `lib/security/rate-limit.ts` |
| Bot check | `lib/security/turnstile.ts` + `components/forms/TurnstileField.tsx` |
| Launch gates | `config/launch.ts` (`canEnablePublicFormDelivery`) |

### Flow

1. Client Zod (RHF) → Server Action
2. Server Zod revalidation
3. Rate limit (Upstash Redis, or in-memory fallback; `BCS_DISABLE_RATE_LIMIT=1` for E2E)
4. Turnstile verify (skipped only while demo mode and unconfigured)
5. Optional Blob upload for estimate photos
6. Resend email when launch env gates pass
7. Result: `prepared` (demo) or `delivered` (live) — thank-you uses `?status=delivered`

Legacy `lib/submissions/mock-adapters.ts` facades delegate to the same pipeline for unit tests.

## Demo vs live

- Default: demo / prepared — banner + thank-you copy must not claim BCS received the request.
- Live: `SUBMISSION_DELIVERY_ENABLED=true` plus Resend, Turnstile, Upstash, and site URL env (see `docs/PRODUCTION_LAUNCH_READINESS.md`).

See `docs/FORM_PRODUCTION_CHECKLIST.md`.
