# Roadmap

Phased delivery plan. Phases are ordered by dependency, **not** by calendar time.
Each implementation phase ends with green quality gates (`pnpm typecheck`,
`pnpm lint`, `pnpm test`, `pnpm build`) and, where relevant, Playwright E2E,
Lighthouse vs [`PERFORMANCE_BUDGET.md`](./PERFORMANCE_BUDGET.md), and a Vercel
preview.

**Launch priority:** public marketing site first. Everything postponed is listed
in [`FUTURE.md`](./FUTURE.md) — do not pull portal, CRM, Stripe, AI, maps, etc.
into active phases without approval.

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

## Phase 2 — Premium homepage (WOW)

- Story sections per [`HOME_EXPERIENCE.md`](./HOME_EXPERIENCE.md):
  Hero → Who We Are → Marine → Aviation → Why BCS → Featured Project →
  Before & After → Our Process → Service Area → Request Estimate →
  Portal Coming Soon → Footer.
- Full animation catalogue (no improvisation).
- Hit performance budget (Performance **95+**, a11y/SEO/BP **100**).

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
  approval.**

## Later

See [`FUTURE.md`](./FUTURE.md) — portal, CRM, payments, maps, reviews,
notifications, AI, monorepo, technician app, and more.

## Cross-cutting

- Accessibility AA (Lighthouse Accessibility **100**).
- No fake reviews, fake case studies, or displayed prices.
- Psychology funnel in [`CUSTOMER_JOURNEY.md`](./CUSTOMER_JOURNEY.md) overrides
  page-count vanity.
