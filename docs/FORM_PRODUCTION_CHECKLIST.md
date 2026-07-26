# Form production checklist

## Engineering (this release)

- [x] Real email delivery wired (Resend Server Actions)
- [x] Server-side Zod validation on all submissions
- [x] Rate limiting (in-memory best-effort)
- [x] Honeypot bot field
- [x] Privacy + Terms production pages + form consent links
- [x] Remove demonstration success copy
- [x] Escape user content in notification email HTML
- [x] Generic visitor-facing errors (no provider stack traces)
- [ ] CAPTCHA / Turnstile (optional hardening — not required for RC code gate)
- [ ] Secure upload handling for estimate photos (deferred — local selection only)
- [ ] Malware scanning for uploads (N/A until uploads exist)
- [ ] Storage lifecycle / retention for attachments (N/A until uploads exist)

## Ops (required before claiming live production delivery)

- [ ] Resend domain verified (SPF/DKIM)
- [ ] `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL`, `NEXT_PUBLIC_SITE_URL` set on Vercel Production
- [ ] `FORM_DELIVERY_MODE` **not** set to `mock` on Production
- [ ] Manual Contact + Estimate smoke sends succeed
- [ ] Error monitoring without logging full PII payloads
- [ ] Analytics privacy review (no form field contents in events)
- [ ] Confirm free-estimate policy copy still matches operations

See `docs/FORM_DELIVERY.md`.
