# FUTURE.md

**Everything postponed** lives here so the launch roadmap stays clean.

The public website ships first. Items below are intentional **not now** — unless
explicitly approved later. Do not expand marketing-site phases by quietly pulling
from this list.

**Next owner work (not more feature code):**
[`docs/GO_LIVE.md`](./docs/GO_LIVE.md) — domain, Vercel, Resend, Turnstile,
Upstash, Sentry, Analytics, Privacy/Terms review, real projects/testimonials/
biography/warranty, smoke tests, go live.

**After the website is live:** start the **BCS Operations Platform** as a
**separate product** (roadmap below). Do not build it inside this marketing repo.

Related: [`ROADMAP.md`](./ROADMAP.md), [`FUTURE_PLATFORM.md`](./FUTURE_PLATFORM.md),
[`PROJECT_OVERVIEW.md`](./PROJECT_OVERVIEW.md).

---

## BCS Operations Platform (separate product — after website go-live)

Internal application for running the business. **Not** an extension of the
marketing site. Suggested product roadmap (new repo / `apps/ops` later):

### Phase 1 — Authentication & company setup

- Secure login  
- Roles and permissions  
- Multi-company architecture  
- Employee management  
- Customer database  

### Phase 2 — CRM

- Customer records  
- Vessel records  
- Photos  
- Communication history  
- Insurance information  

### Phase 3 — Estimates

- Guided estimate creation  
- Photo management  
- Labor calculations  
- Materials  
- PDF generation  
- Customer approval workflow  

### Phase 4 — Work orders

- Technician assignment  
- Status tracking  
- Progress photos  
- Time tracking  
- Internal notes  
- Quality control  

### Phase 5 — Scheduling

- Calendar  
- Technician scheduling  
- Marina visits  
- Google Calendar synchronization  

### Phase 6 — Inventory

- Gelcoat / paint / fiberglass / consumables  
- Purchase orders  
- Suppliers  

### Phase 7 — Billing

- Invoices  
- Payments  
- Deposits  
- QuickBooks integration  
- Customer statements  

### Phase 8 — Management

- Dashboards  
- KPIs  
- Profit & loss  
- Technician productivity  
- Job profitability  
- Customer lifetime value  

### Phase 9 — Customer portal

- Estimate approval  
- Invoice payment  
- Job progress  
- Photo gallery  
- Warranty requests  

### Phase 10 — AI assistant

- Damage classification  
- Estimate suggestions  
- Material recommendations  
- Technician guidance  
- Business analytics  
- Predictive reporting  

**Boundary rule:** marketing site captures leads; Operations Platform runs jobs,
money, and staff. Swap the marketing email adapter to an ops/CRM API later —
do not merge product surfaces.

---

## Product surfaces (postponed on marketing site)

| Item | Notes |
|------|-------|
| **Customer Portal** | Belongs to Operations Platform Phase 9 — not this site. Homepage may show a single “Coming Soon” mock only. |
| **Technician App** | Field ops — not part of marketing site. |
| **Operations application merge** | Do not merge ops into this repo for launch. |
| **Monorepo (`apps/web`)** | Prepare boundaries only; do not restructure now. See [`FUTURE_PLATFORM.md`](./FUTURE_PLATFORM.md). |

## Commerce & data (postponed on marketing site)

| Item | Notes |
|------|-------|
| **CRM** | Ops Platform Phase 2. Email adapter on marketing site first. |
| **Inventory** | Ops Platform Phase 6. |
| **Payments / Stripe** | Ops / portal — no production Stripe on marketing site without approval. |
| **Database / Supabase (production)** | Ops platform concern; marketing site env seams only until approved. |
| **Auth** | Ops Phase 1 / portal — not marketing chrome. |

## Scheduling & maps (postponed on marketing site)

| Item | Notes |
|------|-------|
| **Calendar** | Ops Platform Phase 5. |
| **Maps** | Interactive Maps embed — later marketing enhancement if approved. |
| **Reviews** | Google Reviews fetch/display (never fake reviews). |

## Communications (postponed)

| Item | Notes |
|------|-------|
| **Notifications platform** | Beyond simple lead email. |
| **SMS** | Twilio (or similar). |
| **Push** | Portal / ops. |
| **Live chat** | On-site chat widget. |
| **AI assistant** | Ops Platform Phase 10 (not marketing chatbot by default). |

## Mobile & social (postponed)

| Item | Notes |
|------|-------|
| **Native mobile apps** | Customer or technician stores apps. |
| **TikTok (live)** | Off until approved. |
| **Instagram/Facebook API galleries** | Deep links fine at launch. |

## Content & growth (marketing — owner-driven, not engineering backlog)

Real projects, testimonials, biography, and warranty are **go-live content**
(see [`docs/GO_LIVE.md`](./docs/GO_LIVE.md)), not reasons to invent copy in code.

| Item | Notes |
|------|-------|
| **Blog / CMS at scale** | Beyond current Resources MDX. |
| **Location landing pages at scale** | Beyond core `/service-area`. |
| **Locales beyond EN/ES** | Later. |

## Platform migration (when approved)

```
apps/web      ← this website
apps/ops      ← BCS Operations Platform
apps/portal   ← or portal surface of ops
packages/ui | types | validation | auth | db | config
```

Until then: this repo remains a **standalone** Next.js marketing app.

## Explicit launch exclusions (reminder)

- Do not build the portal on the marketing site.  
- Do not start the Operations Platform until the website is live (unless owner overrides).  
- Do not create the monorepo as a prerequisite to go live.  
- Do not connect production Supabase or Stripe on the marketing site without approval.  
- Do not invent reviews, projects, prices, or “free estimates everywhere.”

## How to use this file

1. New idea during launch? Add it here first — not to the active marketing phase.  
2. Promotion to active work requires owner approval and a ROADMAP / GO_LIVE update.  
3. Homepage “Coming Soon” portal tease is **marketing**, not delivery of ops.
