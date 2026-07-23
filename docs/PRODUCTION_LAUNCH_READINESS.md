# Production launch readiness — Phase 6

Public marketing website only. **Do not** start the customer portal or BCS
Operations Platform in this phase.

## Objective

Ship the **production form-delivery workflow** (Server Actions, validation,
abuse controls, Resend, optional Blob uploads) behind explicit launch gates —
without claiming live delivery until credentials and legal approvals exist.

## Default public behavior

- Forms run the production pipeline but return **prepared** when gates fail.
- Demo banner + thank-you copy remain until delivery is enabled.
- Estimate photos upload to Vercel Blob only when `BLOB_READ_WRITE_TOKEN` is set **and** delivery is enabled; otherwise metadata-only in email.
- Portal, Supabase, Stripe, CRM, and ops platform remain out of scope.

## Production pipeline (implemented)

1. `submitContactAction` / `submitEstimateAction` (Server Actions)
2. Server Zod revalidation
3. Rate limit (`lib/security/rate-limit.ts`)
4. Cloudflare Turnstile (`lib/security/turnstile.ts` + form widget)
5. Optional Vercel Blob photo upload (`lib/submissions/blob-upload.ts`)
6. Resend email (`lib/submissions/resend-delivery.ts`)
7. Thank-you `?status=delivered` when `SubmissionResult.status === 'delivered'`

## Enable live delivery (owner-operated)

Only after blockers clear:

1. Configure Vercel env from `.env.example` (Resend, Turnstile, Upstash, Sentry, site URL; Blob optional).
2. Confirm legal approvals (Privacy/Terms) and processor list.
3. Confirm estimate inbox / from-address and Fort Lauderdale estimate policy.
4. Set `SUBMISSION_DELIVERY_ENABLED=true`.
5. Verify `canEnablePublicFormDelivery()` gates in `config/launch.ts`.
6. Smoke-test contact + estimate on a preview deployment.
7. Demo banner automatically switches to live copy when gates pass.

## Architecture

| Area | Path |
|------|------|
| Providers | `config/providers.ts` |
| Launch gates | `config/launch.ts` |
| Owner decisions | `config/owner-decisions.ts` |
| Legal decisions | `config/legal-decisions.ts` |
| Analytics privacy | `config/analytics-privacy.ts` |
| Rate limit | `lib/security/rate-limit.ts` |
| Turnstile | `lib/security/turnstile.ts` |
| Safe errors | `lib/monitoring/safe-error.ts` |
| Process pipeline | `lib/submissions/process-submission.ts` |
| Resend REST | `lib/submissions/resend-delivery.ts` |
| Blob uploads | `lib/submissions/blob-upload.ts` |
| Contact action | `app/[locale]/contact/actions.ts` |
| Estimate action | `app/[locale]/estimate-request/actions.ts` |

## Related docs

- `docs/PROVIDER_SELECTION.md`
- `docs/FORM_ARCHITECTURE.md`
- `docs/FORM_PRODUCTION_CHECKLIST.md`
- `docs/LEGAL_REVIEW_CHECKLIST.md`
- `docs/OWNER_CONTENT_REQUEST.md`
- `DEPLOYMENT.md`
- `FUTURE.md`

## Stopping rules

- Do not merge portal or operations apps.
- Do not invent reviews, projects, certifications, or addresses.
- Do not enable delivery in production without owner approval.
