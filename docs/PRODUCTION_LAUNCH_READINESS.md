# Production launch readiness — Phase 6

Public marketing website only. **Do not** start the customer portal or BCS
Operations Platform in this phase.

## Objective

Make the site **launch-ready**: provider decisions, delivery gates, security
seams, monitoring privacy rules, and clear blockers — without claiming live
form delivery until credentials and legal approvals exist.

## Default public behavior

- Forms remain in **demo / prepared** mode.
- Success copy must not claim BCS received a message until delivery is enabled.
- Estimate photo binaries are not uploaded to cloud storage yet.
- Portal, Supabase, Stripe, CRM, and ops platform remain out of scope.

## Enable live delivery (owner-operated)

Only after blockers clear:

1. Configure Vercel env from `.env.example` (Resend, Turnstile, Upstash, Sentry, site URL).
2. Confirm legal approvals (Privacy/Terms) and processor list.
3. Confirm estimate inbox / from-address and Fort Lauderdale estimate policy.
4. Set `SUBMISSION_DELIVERY_ENABLED=true`.
5. Verify `canEnablePublicFormDelivery()` gates in `config/launch.ts`.
6. Smoke-test contact + estimate on a preview deployment.
7. Remove or rewrite demonstration banner copy when delivery is confirmed live.

## Architecture added

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
| Resend REST | `lib/submissions/resend-delivery.ts` |

## Related docs

- `docs/PROVIDER_SELECTION.md`
- `docs/FORM_PRODUCTION_CHECKLIST.md`
- `docs/LEGAL_REVIEW_CHECKLIST.md`
- `docs/OWNER_CONTENT_REQUEST.md`
- `DEPLOYMENT.md`
- `FUTURE.md`

## Stopping rules

- Do not merge portal or operations apps.
- Do not invent reviews, projects, certifications, or addresses.
- Do not enable delivery in production without owner approval.
