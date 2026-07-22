# Security Policy

Security is a first-class concern — the site will handle customer data and
payments in the Customer Portal.

## Reporting a vulnerability

**Do not open a public issue for security reports.** Instead, use GitHub's
private ["Report a vulnerability"](https://github.com/marcelotuemura/bestcoatingssolutionswebsite/security/advisories/new)
advisory flow, or email `security@bestcoatingssolutions.com`. We aim to
acknowledge reports promptly and will coordinate a fix and disclosure.

## Supported versions

The `main` branch (latest production deployment) is supported. Older builds are
not maintained.

## Practices

- **Secrets:** never committed. `.env.example` documents variable names only;
  real values live in Vercel/CI secrets and local `.env.local` (git-ignored).
  Only `NEXT_PUBLIC_*` values are exposed to the browser.
- **Dependencies:** Dependabot watches npm and GitHub Actions weekly; CI runs on
  every PR. Avoid unnecessary dependencies to reduce attack surface.
- **HTTP headers:** baseline security headers set in `next.config.ts`
  (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`,
  `Permissions-Policy`); a Content-Security-Policy is added before the portal
  launches.
- **Server boundaries:** third-party secrets are used only in server code /
  `services/` adapters, never in Client Components.
- **Payments:** Stripe integration (future) uses official SDKs and verified
  webhooks; card data never touches our servers.
- **Auth:** the portal (future) uses Supabase Auth with protected route groups
  and least-privilege access to PostgreSQL (row-level security).
- **Least privilege:** `robots.ts` disallows `/portal` and `/api` from indexing.

## Hardening checklist before portal launch

- [ ] Content-Security-Policy and `Strict-Transport-Security` headers
- [ ] Rate limiting on form/auth endpoints
- [ ] Input validation with Zod on every server action/route
- [ ] Supabase row-level security policies reviewed
- [ ] Stripe webhook signature verification
- [ ] Dependency and secret scanning in CI
