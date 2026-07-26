# Form delivery (Resend)

Public **Contact** and **Estimate** forms deliver internal notification email via **Resend** through Next.js Server Actions.

## Architecture

1. Client forms validate with Zod (`lib/forms/*-schema.ts`) and call adapters.
2. Adapters invoke Server Actions (`app/actions/submit-contact.ts`, `submit-estimate.ts`).
3. Server re-validates with Zod, checks honeypot + in-memory rate limit, sends email (`lib/submissions/mailer.ts`).
4. Visitor sees thank-you on success, or a generic accessible error on failure.
5. Estimate photo binaries are **not** uploaded; metadata-only notes may appear in internal email.

Audit snapshot (pre-change): `docs/FORM_DELIVERY_AUDIT.md`.

## Required environment variables

| Variable | Scope | Purpose |
|----------|-------|---------|
| `RESEND_API_KEY` | Server only | Resend API key |
| `CONTACT_FROM_EMAIL` | Server only | Verified sender (e.g. `Best Coatings Solutions <onboarding@resend.dev>` for tests, or domain-verified address) |
| `CONTACT_TO_EMAIL` | Server only | Inbox that receives lead notifications |
| `NEXT_PUBLIC_SITE_URL` | Public | Canonical site origin |
| `FORM_DELIVERY_MODE` | Server only | Omit or `live` for real delivery. **`mock` is for Playwright/local harness only — never set on Production.** |

Never commit real API keys. Never prefix Resend/contact secrets with `NEXT_PUBLIC_`.

## Resend setup

1. Create a Resend account and API key.
2. Add and **verify** the sending domain (DNS: SPF/DKIM as Resend instructs).
3. Set `CONTACT_FROM_EMAIL` to an address on that verified domain.
4. Set `CONTACT_TO_EMAIL` to the business inbox (often `info@bestcoatingssolutions.com`).
5. Configure the same variables in Vercel **Production**, **Preview**, and local `.env.local` as needed.

## Local setup

```bash
cp .env.example .env.local
# Set RESEND_API_KEY, CONTACT_FROM_EMAIL, CONTACT_TO_EMAIL, NEXT_PUBLIC_SITE_URL
pnpm dev
```

Without live keys, submissions fail safely with a visitor-facing configuration message (`configError`).  
For UI-only local testing you may set `FORM_DELIVERY_MODE=mock` (does not send email).

## Vercel

| Environment | Recommendation |
|-------------|----------------|
| Production | `FORM_DELIVERY_MODE` unset/`live` + all Resend vars + verified domain |
| Preview | Prefer live with a dedicated inbox, or mock if Preview must not email |
| Development | Local `.env.local` |

## Testing procedure

- Unit: `pnpm test` — mailer mocked via `__setMailTransportForTests`; no real email.
- E2E: Playwright sets `FORM_DELIVERY_MODE=mock` in `playwright.config.ts` webServer env.
- Manual live check: with Production/Preview env configured, submit Contact + Estimate and confirm inbox + Reply-To.

## Delivery verification

1. Submit Contact form with a real reply-to address you control.
2. Confirm internal email subject like `New BCS contact request — [Name]`.
3. Reply from the notification and confirm it routes to the customer address.
4. Repeat for Estimate (`New BCS estimate request — [Name]`).
5. Confirm failure path (temporarily invalid API key) shows generic visitor error — no stack traces.

## Rollback

1. In Vercel, remove or rotate `RESEND_API_KEY`, or set forms temporarily offline by misconfiguring intentionally only if needed.
2. Prefer: fix provider config; do not re-enable demonstration “fake success” copy.
3. Git revert of the delivery branch is the code rollback path.

## Known limitations

- In-memory rate limiting is best-effort per instance (not a global edge limiter).
- No CAPTCHA/Turnstile yet.
- Estimate photos are not uploaded/stored.
- Optional customer acknowledgment email is not enabled (scope control).
- Owner mailing address remains a documented placeholder in Privacy/Terms.

## Owner-supplied placeholders still open

- Mailing address (if required for legal notices)
- Authentic Marine / Aviation / Marcelo photography (deferred — not a technical RC blocker)
- Confirmed Production Resend domain verification + live smoke
