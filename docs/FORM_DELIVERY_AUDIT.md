# Form delivery audit (pre-implementation)

**Date:** 2026-07-26  
**Scope:** Public contact + estimate forms only (media-intelligence forms out of scope)

## Surfaces

| Form | Route | UI | Submit path (pre-change) |
|------|-------|----|--------------------------|
| Contact | `/[locale]/contact` | `ContactForm.tsx` | Client → `contactSubmissionAdapter` → **mock** |
| Estimate | `/[locale]/estimate-request` | `EstimateRequestForm.tsx` | Client → `estimateSubmissionAdapter` → **mock** |

No `app/api` form routes. No form Server Actions. Validation was client Zod only (`lib/forms/*-schema.ts`).

## Adapters

- Interfaces: `lib/submissions/types.ts`
- Active: `contact-submission-adapter.ts` / `estimate-submission-adapter.ts` → `mock-adapters.ts`
- Mock returns `status: 'prepared'` — **not delivered**
- Failure simulation: `?simulateFailure=1`

## Uploads

`config/estimate-upload.ts`: local file selection + validation only. Binaries never uploaded. Email delivery must not accept executable uploads; photo binaries remain out of scope for this release.

## Env (pre-change)

`.env.example` had `RESEND_API_KEY=` placeholder only. No `CONTACT_FROM_EMAIL` / `CONTACT_TO_EMAIL`. Package `resend` was not installed.

## Analytics / cookies (for Privacy accuracy)

- `@vercel/analytics` mounted in locale layout (no cookie banner)
- No gtag / GTM / marketing pixels
- Media session cookies exist under `/media` only (not public marketing forms)

## Legal pages (pre-change)

`/privacy` and `/terms` existed with provisional copy + review badge (“Requires owner / legal review before production”). Footer already linked both via `footerNav`.

## Post-implementation target

Server Actions + Zod re-validation + Resend transactional email + honeypot + in-memory rate limit + production Privacy/Terms + form consent links. See `docs/FORM_DELIVERY.md`.
