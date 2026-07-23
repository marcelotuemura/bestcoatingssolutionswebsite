# Form production checklist (blockers)

Do **not** launch public lead forms until each item is resolved.

- [ ] Real email delivery wired via **Resend** (replace demo/prepared-only path)
- [ ] `SUBMISSION_DELIVERY_ENABLED=true` only after credentials + legal gates clear
- [ ] Server-side Zod validation on all submissions (API route / Server Action)
- [ ] Rate limiting via **Upstash Redis** (`lib/security/rate-limit.ts` seam)
- [ ] Bot protection via **Cloudflare Turnstile** (`lib/security/turnstile.ts` seam)
- [ ] Secure upload handling for estimate photos (**Vercel Blob** when approved)
- [ ] Malware scanning for uploads
- [ ] Storage lifecycle / retention for attachments
- [ ] Privacy retention policy finalized
- [ ] Legal approval of Privacy + Terms
- [ ] Error monitoring via **Sentry** (without logging full PII payloads)
- [ ] Analytics privacy review (**Vercel Analytics** only — no form field contents)
- [ ] Remove or rewrite demonstration success copy (`config/submission.ts` + conversion dictionaries)
- [ ] Confirm free-estimate policy copy still matches operations
- [ ] Confirm `BCS_SUBMISSION_TO_EMAIL` / from-address

**Current state (Phase 6):** provider selections and delivery gates are in place.
Adapters still return `prepared` unless launch env gates pass. UI must not claim
BCS received a message until delivery is live.

See also: `docs/PROVIDER_SELECTION.md`, `docs/PRODUCTION_LAUNCH_READINESS.md`,
`config/launch.ts`.
