# Provider selection — Phase 6

Selected providers for the **public marketing website** launch. These are
architecture decisions. Credentials live in Vercel — never in git.

## Selected for launch

| Category | Provider | Status | Notes |
|----------|----------|--------|-------|
| Hosting | **Vercel** | Selected | Matches DEPLOYMENT.md; App Router + previews |
| Email | **Resend** | Pending credentials | Contact/estimate notifications to BCS inbox |
| Bot protection | **Cloudflare Turnstile** | Pending credentials | Public forms |
| Rate limiting | **Upstash Redis** | Pending credentials | Submission abuse controls |
| Analytics | **Vercel Analytics** | Wired | Already mounted; no form field contents |
| Error monitoring | **Sentry** | Pending credentials | Safe/redacted context only |
| Uploads (optional) | **Vercel Blob** | Pending credentials | Estimate photos when upload pipeline approved |

## Explicitly deferred (not Phase 6)

| Provider | Reason |
|----------|--------|
| Supabase | Portal/auth/database — FUTURE.md |
| Stripe | Payments/portal — FUTURE.md |
| Twilio SMS | Notifications platform — FUTURE.md |
| Google Maps / Places | Interactive maps / reviews — FUTURE.md |
| Google Calendar | Live booking — FUTURE.md |
| CRM platforms | Email adapter first; no duplicate CRM on marketing site |

## Source of truth

Typed registry: `config/providers.ts`

Launch gates: `config/launch.ts`
