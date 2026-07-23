# Form production checklist (blockers)

Do **not** launch public lead forms until each item is resolved.

- [x] Production pipeline wired: Server Actions → Zod → rate limit → Turnstile → Resend → optional Blob
- [ ] `SUBMISSION_DELIVERY_ENABLED=true` only after credentials + legal gates clear
- [x] Server-side Zod validation on all submissions (`submitContactAction` / `submitEstimateAction`)
- [x] Rate limiting via **Upstash Redis** (`lib/security/rate-limit.ts`; memory fallback for local)
- [x] Bot protection via **Cloudflare Turnstile** (`lib/security/turnstile.ts` + UI field)
- [x] Secure upload path for estimate photos (**Vercel Blob** when `BLOB_READ_WRITE_TOKEN` set)
- [ ] Malware scanning for uploads
- [ ] Storage lifecycle / retention for attachments
- [ ] Privacy retention policy finalized
- [ ] Legal approval of Privacy + Terms
- [ ] Error monitoring via **Sentry** (without logging full PII payloads) — seam ready; DSN required
- [ ] Analytics privacy review (**Vercel Analytics** only — no form field contents)
- [ ] Confirm free-estimate policy copy still matches operations
- [ ] Confirm `BCS_SUBMISSION_TO_EMAIL` / from-address
- [ ] Smoke-test live delivery on a preview deployment, then retire demo banner in production

**Current state (Phase 6):** production form-delivery architecture is implemented.
Public UI stays in **demo / prepared** mode until `canEnablePublicFormDelivery()` env gates pass.
UI must not claim BCS received a message until delivery returns `status: 'delivered'`.

See also: `docs/PROVIDER_SELECTION.md`, `docs/PRODUCTION_LAUNCH_READINESS.md`,
`docs/FORM_ARCHITECTURE.md`, `config/launch.ts`.
