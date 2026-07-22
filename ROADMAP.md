# Roadmap

Phased delivery plan. Phases are ordered by dependency, **not** by calendar time.
Each phase ends with green quality gates (typecheck, lint, test, build) and, where
relevant, E2E and a Vercel preview.

## Phase 0 — Foundation ✅ (this repository)

Engineering scaffolding only; **no marketing pages/components**.

- Next.js + React + TypeScript + Tailwind v4 base.
- Tooling, testing, CI, SEO scaffolding, typed config, docs.
- Placeholder home route to verify the toolchain end-to-end.

**Exit criteria:** all gates green; app builds, runs, and serves
`sitemap.xml` / `robots.txt`.

## Phase 1 — Design system & shared UI

- Implement brand primitives in `components/ui` (Button, Card, Container,
  Section, Input) from `DESIGN_SYSTEM.md`.
- Global layout: accessible Header (with primary nav from `config/routes.ts`) and
  Footer.
- Motion tokens in `animations/` (respecting `prefers-reduced-motion`).

## Phase 2 — Premium homepage

- The single animated experience (Framer Motion; GSAP only if unavoidable).
- Hero, divisions (Marine/Aviation), differentiators, social proof, CTAs.
- Strict performance budget (see `DEPLOYMENT.md` / Core Web Vitals).

## Phase 3 — Core marketing pages (static, fast)

Routes are already registered in `config/routes.ts`:

- `/marine`, `/aviation`, `/services`, `/process`, `/about`
- `/projects`, `/before-after`, `/gallery`
- `/privacy`, `/terms`, `/accessibility`

## Phase 4 — Lead capture

- `/estimate-request`, `/schedule-visit`, `/contact` forms (RHF + Zod).
- Server Actions + spam protection; email notifications via a `services/`
  adapter.

## Phase 5 — Content platform

- `/blog` with MDX or a headless CMS; article structured data and feeds.

## Phase 6 — Integrations (behind `services/` adapters)

- Google Maps (service area), Google Reviews, Instagram/Facebook gallery.

## Phase 7 — Customer Portal (authenticated)

- Supabase Auth + protected route group.
- Modules: Dashboard, Projects, Invoices, Estimates, Payments (Stripe),
  Messages, Documents, Photos, Timeline, Appointments, Profile, Notifications.
- CRM sync with the existing business platform.

## Phase 8 — Advanced

- Push notifications, SMS, Live Chat, AI Assistant.
- Internationalization; national/international expansion.

## Cross-cutting (every phase)

- Accessibility AA, SEO, performance budgets, security review, tests, and
  updated documentation.
