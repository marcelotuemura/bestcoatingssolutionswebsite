# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Strategic launch documentation** (gate before production UI):
  - `BRAND_GUIDE.md` — full brand manual (logo, voice, print, wraps, email, …).
  - `HOME_EXPERIENCE.md` — WOW emotional arc, story sections, animation catalogue.
  - `CUSTOMER_JOURNEY.md` — psychology funnel from land → become customer.
  - `PHOTOGRAPHY_GUIDE.md` — complete shot standard (drone through social crops).
  - `CASE_STUDIES_GUIDE.md` — Problem→Repair→Process→Photos→Time→Result→Customer.
  - `PERFORMANCE_BUDGET.md` — Lighthouse Performance 95+, a11y/SEO/BP 100.
  - `FUTURE.md` — postponed backlog (portal, CRM, Stripe, AI, maps, …).
  - `FUTURE_PLATFORM.md` — monorepo/portal architecture seams (not migration).
- **Project foundation** (engineering scaffolding, no marketing pages yet):
  - Next.js (App Router) + React 19 + TypeScript (strict) base.
  - Tailwind CSS v4 with BCS brand tokens via `@theme`.
  - Framer Motion, React Hook Form + Zod, Vercel Analytics dependencies.
  - Tooling: ESLint (flat config) + Prettier + Husky + lint-staged +
    commitlint (Conventional Commits).
  - Testing: Vitest + Testing Library (unit/component) and Playwright (E2E).
  - SEO scaffolding: Metadata API, dynamic `sitemap.ts`, `robots.ts`,
    schema.org JSON-LD, Open Graph.
  - Typed configuration layer: `config/site.ts`, `config/routes.ts`,
    `config/services.ts`.
  - CI (GitHub Actions), issue/PR templates, Dependabot, CODEOWNERS, labels.
  - Full documentation set and per-folder architecture docs.
  - Minimal placeholder home route so the toolchain is verifiable end-to-end.

[Unreleased]: https://github.com/marcelotuemura/bestcoatingssolutionswebsite
