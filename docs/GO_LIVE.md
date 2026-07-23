# Go live — owner checklist

**Stop writing marketing-site feature code.** Phase 6 shipped the production
form-delivery architecture. Getting Best Coatings Solutions online and generating
leads now depends on **owner / ops configuration and approved content**, not more
application features.

After this site is live and stable, begin the **BCS Operations Platform** as a
**separate product** — see [`FUTURE.md`](../FUTURE.md) and
[`FUTURE_PLATFORM.md`](../FUTURE_PLATFORM.md). Do not build ops inside this repo.

Related: [`docs/PRODUCTION_LAUNCH_READINESS.md`](./PRODUCTION_LAUNCH_READINESS.md),
[`docs/PROVIDER_SELECTION.md`](./PROVIDER_SELECTION.md),
[`docs/LEGAL_REVIEW_CHECKLIST.md`](./LEGAL_REVIEW_CHECKLIST.md),
[`docs/OWNER_CONTENT_REQUEST.md`](./OWNER_CONTENT_REQUEST.md),
[`DEPLOYMENT.md`](../DEPLOYMENT.md),
[`ROADMAP.md`](../ROADMAP.md).

---

## Sequence (do in order)

### 1. Purchase / configure the production domain

- [ ] Register or transfer the production domain
- [ ] DNS ready for Vercel (A/ALIAS/CNAME as required)
- [ ] Decide canonical host (`www` vs apex) and set `NEXT_PUBLIC_SITE_URL`

### 2. Configure Vercel Production

- [ ] Production project linked to the launch branch / `main`
- [ ] Production domain attached and HTTPS valid
- [ ] Environment variables from `.env.example` set for **Production**
- [ ] Preview deployments still available for smoke checks

### 3. Configure Resend

- [ ] Resend account + domain/DNS authentication (SPF/DKIM)
- [ ] `RESEND_API_KEY`
- [ ] `BCS_SUBMISSION_TO_EMAIL` / from-address confirmed
- [ ] Test message accepted (preview or production inbox)

### 4. Configure Turnstile

- [ ] Cloudflare Turnstile site for the production hostname
- [ ] `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- [ ] `TURNSTILE_SECRET_KEY`
- [ ] Widget passes on contact + estimate in a real browser

### 5. Configure Upstash

- [ ] Upstash Redis REST credentials for rate limiting
- [ ] `UPSTASH_REDIS_REST_URL`
- [ ] `UPSTASH_REDIS_REST_TOKEN`

### 6. Configure Sentry

- [ ] Sentry project for the marketing site
- [ ] `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN`
- [ ] Confirm PII is **not** logged in full form payloads

### 7. Configure Vercel Analytics

- [ ] Vercel Analytics enabled for Production
- [ ] Confirm privacy rules in `config/analytics-privacy.ts` (no form field contents)

### 8. Review Privacy Policy

- [ ] Owner / counsel review of `/privacy`
- [ ] Retention, processors (Resend, Turnstile, Upstash, Analytics, Sentry, Blob), and contact wording approved
- [ ] See [`LEGAL_REVIEW_CHECKLIST.md`](./LEGAL_REVIEW_CHECKLIST.md)

### 9. Review Terms

- [ ] Owner / counsel review of `/terms`
- [ ] Estimate / no-appointment / warranty disclaimer language approved

### 10. Upload first real projects

- [ ] Approved before / during / after photos + project copy
- [ ] Customer consent + publication approval
- [ ] Publish via existing portfolio content model (no invented projects)
- [ ] Details: [`OWNER_CONTENT_REQUEST.md`](./OWNER_CONTENT_REQUEST.md)

### 11. Add testimonials

- [ ] Real quotes with written publication consent only
- [ ] Never invent reviews or ratings

### 12. Add company biography

- [ ] Approved About / biography content (owner-provided)
- [ ] No invented licenses, certifications, or founding claims

### 13. Add warranty information

- [ ] Actual warranty terms for Workmanship page
- [ ] Owner + legal approval before publishing

### 14. Enable form delivery + production smoke tests

- [ ] Set `SUBMISSION_DELIVERY_ENABLED=true` only after env + legal gates clear
- [ ] Confirm `canEnablePublicFormDelivery()` requirements in `config/launch.ts`
- [ ] Smoke: home, contact submit → thank-you delivered, estimate submit, EN/ES, sitemap, robots
- [ ] Confirm lead email arrives; Turnstile + rate limit behave under normal use
- [ ] Optional: Blob token if estimate photo storage is approved

### 15. Go live

- [ ] DNS cutover complete
- [ ] Production URL is the canonical marketing site
- [ ] Monitor Sentry / Analytics for first hours
- [ ] Demo banner gone (live copy) because delivery gates pass

---

## After go-live (separate product)

**Do not** extend this marketing site into CRM, work orders, billing, or portal.

Start the **BCS Operations Platform** as its own application (suggested phases in
[`FUTURE.md`](../FUTURE.md)):

1. Authentication & company setup  
2. CRM  
3. Estimates  
4. Work orders  
5. Scheduling  
6. Inventory  
7. Billing  
8. Management dashboards  
9. Customer portal  
10. AI assistant  

Marketing site lead capture should later **adapt** to the ops API — not embed ops UI here.
