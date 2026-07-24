# Roadmap

Phased delivery plan. Phases are ordered by dependency, **not** by calendar time.
Each implementation phase ends with green quality gates (`pnpm typecheck`,
`pnpm lint`, `pnpm test`, `pnpm build`) and, where relevant, Playwright E2E,
Lighthouse vs [`PERFORMANCE_BUDGET.md`](./PERFORMANCE_BUDGET.md), and a Vercel
preview.

**Launch priority:** public marketing site go-live first
([`docs/GO_LIVE.md`](./docs/GO_LIVE.md)). Parallel long-term asset:
[`docs/MEDIA_INTELLIGENCE_PLATFORM.md`](./docs/MEDIA_INTELLIGENCE_PLATFORM.md)
(DAMS). Do not pull portal/CRM/Stripe into marketing pages without approval.

## Phase 0 — Foundation ✅

Engineering scaffolding; placeholder home route; tooling, CI, SEO seams.

## Phase 0.5 — Strategic documentation ✅ / refining

Launch strategy docs (emotion-first homepage, psychology journey, photography
standard, case studies, brand manual, performance targets, future backlog):

| Doc | Role |
|-----|------|
| [`BRAND_GUIDE.md`](./BRAND_GUIDE.md) | Full brand manual (digital + physical) |
| [`HOME_EXPERIENCE.md`](./HOME_EXPERIENCE.md) | WOW arc, section story, animation catalogue |
| [`CUSTOMER_JOURNEY.md`](./CUSTOMER_JOURNEY.md) | Emotional funnel land → customer |
| [`PHOTOGRAPHY_GUIDE.md`](./PHOTOGRAPHY_GUIDE.md) | Complete shot & media standard |
| [`CASE_STUDIES_GUIDE.md`](./CASE_STUDIES_GUIDE.md) | Problem→Result story model |
| [`PERFORMANCE_BUDGET.md`](./PERFORMANCE_BUDGET.md) | Lighthouse 95 / 100 / 100 / 100 |
| [`FUTURE.md`](./FUTURE.md) | All postponed work |
| [`FUTURE_PLATFORM.md`](./FUTURE_PLATFORM.md) | Later monorepo boundaries |

**Exit criteria:** docs merged; then Phase 1 production UI may start.

## Phase 1 — Shared UI, navigation & content models

- UI primitives + Header/Footer/Nav from brand manual + design system.
- EN/ES language framework.
- Content models: services, case studies, media, social, trust pillars.
- Route registry for first-release paths (incl. `/service-area`).
- Division status (`active` | `preview` | `coming-soon`); Aviation defaults to
  coming-soon until owner confirmation.
- Social: Instagram/Facebook disabled without URLs; TikTok hidden.
- Estimate policy config (Fort Lauderdale free estimates only).
- Motion tokens + reduced-motion foundations (homepage motion is Phase 2).

**Shell only in this phase — premium homepage is Phase 2.**

## Phase 2 — Premium homepage (WOW)

- Story sections per [`HOME_EXPERIENCE.md`](./HOME_EXPERIENCE.md):
  Hero → Who We Are → Marine → Aviation → Why BCS → Featured Project →
  Before & After → Our Process → Service Area → Request Estimate → Footer.
- Full animation catalogue (no improvisation); portal teaser remains disabled.
- Hit performance budget (Performance **95+**, a11y/SEO/BP **100**).

**In progress / PR:** premium homepage implementation.

## Phase 3 — Marine, Aviation & Services

- Static division + catalogue pages; memorable division storytelling.
- CTAs into estimate / schedule; no prices.

## Phase 4 — Case studies, About & Service Area

- `/projects` as case-study index/detail (seven-chapter stories).
- `/about`, `/service-area`; optional `/before-after`.
- Legal: privacy, terms, accessibility as needed.

## Phase 5 — Estimate, Schedule & Contact

- RHF + Zod; spam architecture; email via `services/`.
- Fort Lauderdale free-estimate policy honesty.

## Phase 6 — SEO, analytics, accessibility & launch testing

- Locale metadata, sitemap, schema, Lighthouse gates, Playwright forms/nav.

## Phase 7 — Production deployment preparation

- Env, domain, email, legal/copy, assets. **No production deploy without
  approval.** See [`docs/GO_LIVE.md`](./docs/GO_LIVE.md).

## Media Intelligence Platform (DAMS) — parallel long-term product

Permanent AI-powered Digital Asset Management — not a one-time photo sorter.
Foundation UI: `/media` (internal, robots-disallowed).

- Spec: [`docs/MEDIA_INTELLIGENCE_PLATFORM.md`](./docs/MEDIA_INTELLIGENCE_PLATFORM.md)
- ADR: [`docs/architecture/decisions/0002-media-intelligence-dams.md`](./docs/architecture/decisions/0002-media-intelligence-dams.md)
- Rules: never modify originals · never auto-publish · owner approval required
- Feeds: website, GBP, SEO, blog, social, insurance case studies, sales, training, future AI estimates / ops API

Phases 1–6 of DAMS delivery are listed in the media platform doc (foundation →
ingest → vision → auth/Postgres → publishers → training corpus).

## Later

See [`FUTURE.md`](./FUTURE.md) — portal, CRM, payments, maps, reviews,
notifications, Operations Platform, monorepo, technician app, and more.

## Cross-cutting

- Accessibility AA (Lighthouse Accessibility **100**).
- No fake reviews, fake case studies, or displayed prices.
- Psychology funnel in [`CUSTOMER_JOURNEY.md`](./CUSTOMER_JOURNEY.md) overrides
  page-count vanity.
