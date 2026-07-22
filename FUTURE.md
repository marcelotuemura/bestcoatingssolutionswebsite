# FUTURE.md

**Everything postponed** lives here so the launch roadmap stays clean.

The public website ships first. Items below are intentional **not now** — unless
explicitly approved later. Do not expand Phase 1–7 scope by quietly pulling from
this list.

Related: [`ROADMAP.md`](./ROADMAP.md), [`FUTURE_PLATFORM.md`](./FUTURE_PLATFORM.md)
(architecture boundaries), [`PROJECT_OVERVIEW.md`](./PROJECT_OVERVIEW.md).

---

## Product surfaces (postponed)

| Item | Notes |
|------|-------|
| **Customer Portal** | Auth area: track projects, invoices, approve estimates, photos, timeline, payments. Homepage may show a single “Coming Soon” mock only. |
| **Technician App** | Field ops tooling for crews — not part of marketing site. |
| **Operations application merge** | Do not merge ops into this repo for launch. |
| **Monorepo (`apps/web`)** | Prepare boundaries only; do not restructure now. See platform notes below. |

## Commerce & data (postponed)

| Item | Notes |
|------|-------|
| **CRM** | No duplicate CRM/database logic on the marketing site; email adapter first. |
| **Inventory** | Materials/stock systems — out of scope. |
| **Payments** | Online payment collection. |
| **Stripe** | No production Stripe without approval. |
| **Database / Supabase (production)** | No production Supabase without approval; env seams only. |
| **Auth** | Portal authentication — future. |

## Scheduling & maps (postponed)

| Item | Notes |
|------|-------|
| **Calendar** | Live Google/Outlook availability booking. |
| **Maps** | Interactive Google Maps service-area embed / places. |
| **Reviews** | Google Reviews fetch/display (never fake reviews in the meantime). |

## Communications (postponed)

| Item | Notes |
|------|-------|
| **Notifications platform** | Unified email/SMS/push beyond simple lead email. |
| **SMS** | Twilio (or similar) customer messaging. |
| **Push** | Web/mobile push for portal. |
| **Live chat** | On-site chat widget. |
| **AI assistant** | On-site or ops AI. |
| **Customer auto-reply polish** | Beyond basic success UX / simple ack email if added later. |

## Mobile & social (postponed)

| Item | Notes |
|------|-------|
| **Native mobile apps** | Customer or technician stores apps. |
| **TikTok (live)** | Architecture prepared; channel off until approved. |
| **Instagram/Facebook API galleries** | Deep links fine at launch; API embeds later. |
| **Additional social networks** | Config-ready; not marketed as live. |

## Content & growth (postponed)

| Item | Notes |
|------|-------|
| **Blog / CMS** | MDX or headless content platform. |
| **Gallery route** | If not covered by case studies / before-after. |
| **Location landing pages at scale** | Beyond core `/service-area`. |
| **Locales beyond EN/ES** | PT/JA spoken in business; UI locales later. |
| **National / international expansion site structure** | After South Florida launch maturity. |

## Portal module checklist (when approved)

Dashboard · Projects · Estimates · Invoices · Payments · Messages · Documents ·
Photos · Timeline · Appointments · Profile · Notifications · Approvals.

## Platform migration (when approved)

Target shape (names may vary):

```
apps/web      ← this website
apps/ops
apps/portal   ← or portal route group
packages/ui
packages/types
packages/validation
packages/auth
packages/db
packages/config
```

Until then: standalone Next.js app with clean `components/ui`, `types`, Zod
schemas, `config/`, and `services/` adapters — see
[`FUTURE_PLATFORM.md`](./FUTURE_PLATFORM.md).

## Explicit launch exclusions (reminder)

- Do not build the portal.  
- Do not merge the operations application.  
- Do not create the monorepo.  
- Do not connect production Supabase or Stripe without approval.  
- Do not invent reviews, prices on the marketing site, or “free estimates
  everywhere.”

## How to use this file

1. New idea during launch? Add it here first — not to the active phase.  
2. Promotion to active roadmap requires owner approval and a ROADMAP phase update.  
3. Homepage “Coming Soon” portal tease is **marketing**, not delivery of any row
   in this file.
