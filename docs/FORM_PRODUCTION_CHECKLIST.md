# Form production checklist (blockers)

Do **not** launch public lead forms until each item is resolved.

- [ ] Real email and/or CRM delivery wired (replace mock adapters)
- [ ] Server-side Zod validation on all submissions
- [ ] Rate limiting
- [ ] Bot protection (e.g. CAPTCHA / Turnstile)
- [ ] Secure upload handling for estimate photos
- [ ] Malware scanning for uploads
- [ ] Storage lifecycle / retention for attachments
- [ ] Privacy retention policy finalized
- [ ] Legal approval of Privacy + Terms
- [ ] Error monitoring (without logging full PII payloads)
- [ ] Analytics privacy review (no form field contents in events)
- [ ] Remove or rewrite demonstration success copy (`config/submission.ts`)
- [ ] Confirm free-estimate policy copy still matches operations

**Current state:** adapters only prepare requests locally. UI must not claim BCS received a message until delivery is live.
