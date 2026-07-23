# Form architecture (Phase 4)

## Schemas

| Module | Purpose |
|--------|---------|
| `lib/forms/contact-schema.ts` | Zod factory `createContactSchema` + `ContactFormValues` |
| `lib/forms/estimate-schema.ts` | Step schemas + `createFullEstimateSchema` + `validateEstimateFiles` |
| `lib/forms/form-errors.ts` | Flatten RHF errors for accessible summaries |

Schemas accept localized validation messages so EN/ES dictionaries stay authoritative.

## Form models

- **Contact:** name, email, phone, inquiry type (no aviation), message, preferred contact method, consent
- **Estimate:** customer → vessel → marine services (from `config/form-options` + `marine-services`) → damage → photos (client-only) → review/consent

## Adapter interfaces

Defined in `lib/submissions/types.ts`:

- `ContactSubmissionAdapter`
- `EstimateSubmissionAdapter`
- `EstimateAttachment` / `EstimateAttachmentMeta`
- `SubmissionResult` (`prepared` | `failed`)

Active wiring:

- `lib/submissions/contact-submission-adapter.ts` → mock
- `lib/submissions/estimate-submission-adapter.ts` → mock

## Temporary adapter behavior

`lib/submissions/mock-adapters.ts`:

- Simulates latency
- Does **not** persist PII, use localStorage, or call third parties
- Supports deterministic failure via `simulateFailure: true` (E2E uses `?simulateFailure=1`)
- Success means **prepared**, not delivered — copy from `config/submission.ts`

## Future production integration

Replace mock adapters with server actions or API routes that:

1. Re-validate with Zod on the server
2. Rate-limit and bot-protect
3. Deliver via email/CRM
4. Store attachments securely (scan, lifecycle)
5. Return opaque reference IDs only

See `docs/FORM_PRODUCTION_CHECKLIST.md`.
