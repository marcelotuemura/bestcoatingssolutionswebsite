# Roadmap

Phased delivery plan. Phases are ordered by dependency, **not** by calendar time.
Each implementation phase ends with green quality gates (`pnpm typecheck`,
`pnpm lint`, `pnpm test`, `pnpm build`) and, where relevant, Playwright E2E and a
Vercel preview.

**Launch priority:** public marketing site first. Do **not** start monorepo
migration, operations-app merge, or customer portal build until approved — see
[`FUTURE_PLATFORM.md`](./FUTURE_PLATFORM.md).

## Phase 0 — Foundation ✅

Engineering scaffolding only; **no marketing pages/components**.

- Next.js + React + TypeScript + Tailwind v4 base.
- Tooling, testing, CI, SEO scaffolding, typed config, docs.
- Placeholder home route to verify the toolchain end-to-end.

**Exit criteria:** all gates green; app builds, runs, and serves
`sitemap.xml` / `robots.txt`.

## Phase 0.5 — Strategic documentation ✅

Required **before** production UI/code for the public launch:

| Doc | Role |
|-----|------|
| [`BRAND_GUIDE.md`](./BRAND_GUIDE.md) | Identity, voice, non-negotiables |
| [`HOME_EXPERIENCE.md`](./HOME_EXPERIENCE.md) | Homepage composition & motion contract |
| [`CUSTOMER_JOURNEY.md`](./CUSTOMER_JOURNEY.md) | Discover → request paths |
| [`PHOTOGRAPHY_GUIDE.md`](./PHOTOGRAPHY_GUIDE.md) | Media standards & asset checklist |
| [`CASE_STUDIES_GUIDE.md`](./CASE_STUDIES_GUIDE.md) | Honest project proof rules |
| [`FUTURE_PLATFORM.md`](./FUTURE_PLATFORM.md) | Later monorepo/portal boundaries |
| [`PERFORMANCE_BUDGET.md`](./PERFORMANCE_BUDGET.md) | CWV / JS / media / motion budgets |

**Exit criteria:** docs merged; implementation may proceed to Phase 1.

## Phase 1 — Shared UI, navigation & content models

- Brand primitives in `components/ui` from [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md)
  / [`BRAND_GUIDE.md`](./BRAND_GUIDE.md).
- Header, Footer, primary nav (`config/routes.ts`), language framework (EN/ES).
- Typed content models for services, projects, media, social channels.
- Route registry aligned to first-release paths (incl. `/service-area`).

## Phase 2 — Premium homepage

- Single animated experience per [`HOME_EXPERIENCE.md`](./HOME_EXPERIENCE.md).
- Framer Motion (GSAP only if unavoidable); honour reduced motion.
- Enforce [`PERFORMANCE_BUDGET.md`](./PERFORMANCE_BUDGET.md).

## Phase 3 — Marine, Aviation & Services

- Static, fast division and catalogue pages from `config/services.ts`.
- No prices; clear CTAs into estimate / schedule.

## Phase 4 — Projects, About & Service Area

- Portfolio per [`CASE_STUDIES_GUIDE.md`](./CASE_STUDIES_GUIDE.md) and
  [`PHOTOGRAPHY_GUIDE.md`](./PHOTOGRAPHY_GUIDE.md).
- `/about`, `/service-area`; optional `/before-after` when assets allow.
- Privacy, Terms, Accessibility pages as needed for launch readiness.

## Phase 5 — Estimate, Schedule & Contact

- RHF + Zod forms; accessible; iPhone/iPad-friendly.
- Spam-protection architecture; email via `services/` adapter (no duplicate CRM).
- Estimate policy: free estimates only in the Fort Lauderdale area.

## Phase 6 — SEO, analytics, accessibility & launch testing

- Per-route/locale metadata, sitemap, robots, ProfessionalService + Service schema.
- A11y AA verification; Lighthouse against performance budget.
- Playwright for navigation and forms; record gate command output.

## Phase 7 — Production deployment preparation

- Env, domain, email deliverability, legal/copy sign-off.
- **Do not deploy to production without explicit approval.**

## Later (not first release)

- Blog / content platform, Maps/Reviews/social APIs.
- Customer Portal (authenticated) and CRM sync.
- Monorepo move into `apps/web` and shared packages.
- Additional locales beyond EN/ES; national/international expansion.

## Cross-cutting (every implementation phase)

- Accessibility AA, SEO, performance budgets, security review, tests, and
  updated documentation.
- No fake reviews, fake projects, or displayed prices.
