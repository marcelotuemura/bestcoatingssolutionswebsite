# Best Coatings Solutions — Website & Customer Portal

The official website and future customer portal for **Best Coatings Solutions
(BCS)** — premium **mobile marine and aviation coatings**, refinishing and
composite repair, serving South Florida from **Jupiter to the Florida Keys**
(expanding nationally).

This repository is engineered as the company's long-lived digital flagship: a
fast, accessible, SEO-first marketing site with a clean architecture prepared for
a future authenticated Customer Portal and business-platform integrations
(Supabase, Stripe, Vercel).

> **Status: Phase 1 in progress.** Foundation and strategic docs are on `main`.
> Shared UI, navigation, and EN/ES architecture ship next — see
> [`ROADMAP.md`](./ROADMAP.md). The homepage remains a shell until Phase 2.


## Tech stack

| Concern         | Choice                                            |
| --------------- | ------------------------------------------------- |
| Framework       | Next.js (App Router) + React 19                    |
| Language        | TypeScript (strict)                                |
| Styling         | Tailwind CSS v4 (brand tokens via `@theme`)        |
| Animation       | Framer Motion (homepage only)                      |
| Forms           | React Hook Form + Zod                              |
| Unit/component  | Vitest + Testing Library                           |
| End-to-end      | Playwright                                         |
| Quality gates   | ESLint (flat) + Prettier + Husky + lint-staged     |
| Commits         | Conventional Commits (commitlint)                  |
| Analytics       | Vercel Analytics                                   |
| Hosting         | Vercel                                             |

## Quick start

Requirements: **Node ≥ 20.11** and **pnpm ≥ 9** (this repo pins pnpm via
`packageManager`; enable with `corepack enable`).

```bash
pnpm install                 # install dependencies
cp .env.example .env.local   # configure environment (optional in foundation phase)
pnpm dev                     # start dev server → http://localhost:3000
```

## Scripts

| Script                  | Purpose                                     |
| ----------------------- | ------------------------------------------- |
| `pnpm dev`              | Start the dev server (Turbopack)            |
| `pnpm build`            | Production build                            |
| `pnpm start`            | Serve the production build                  |
| `pnpm lint`             | ESLint                                      |
| `pnpm lint:fix`         | ESLint with autofix                         |
| `pnpm format`           | Prettier write                             |
| `pnpm format:check`     | Prettier check                             |
| `pnpm typecheck`        | `tsc --noEmit`                              |
| `pnpm test`             | Unit/component tests (Vitest)              |
| `pnpm test:coverage`    | Unit tests with coverage                   |
| `pnpm test:e2e`         | End-to-end tests (Playwright)              |

## Repository layout

A high-level map (every folder is documented in its own `README.md` or in
[`docs/architecture`](./docs/architecture)):

```
app/          Next.js App Router (layout, foundation page, sitemap, robots)
components/   Reusable UI (Server Components first)
hooks/        Client-side React hooks
lib/          Framework-facing modules (e.g. SEO builders)
services/     Integration/data-access layer (Supabase, Stripe, …) — architecture only
config/       Site config, typed route registry, service catalogue
types/        Shared domain types
utils/        Pure, dependency-free helpers
animations/   Framer Motion variants (homepage only)
styles/       Global/modular CSS beyond the Tailwind entrypoint
tests/        Unit tests + Playwright E2E (tests/e2e)
public/       Static assets served at site root
docs/         Architecture, wireframes, branding, assets
.github/      CI, issue/PR templates, Dependabot, CODEOWNERS
```

## Documentation

| Doc                                          | What it covers                          |
| -------------------------------------------- | --------------------------------------- |
| [`PROJECT_OVERVIEW.md`](./PROJECT_OVERVIEW.md) | Vision, scope, architecture principles |
| [`ROADMAP.md`](./ROADMAP.md)                 | Phased delivery plan                    |
| [`BRAND_GUIDE.md`](./BRAND_GUIDE.md)         | Full brand manual (web + physical)      |
| [`HOME_EXPERIENCE.md`](./HOME_EXPERIENCE.md) | WOW arc, story sections, animation catalogue |
| [`CUSTOMER_JOURNEY.md`](./CUSTOMER_JOURNEY.md) | Emotional funnel land → customer     |
| [`PHOTOGRAPHY_GUIDE.md`](./PHOTOGRAPHY_GUIDE.md) | Complete photography & media standard |
| [`CASE_STUDIES_GUIDE.md`](./CASE_STUDIES_GUIDE.md) | Problem→Result case study stories  |
| [`PERFORMANCE_BUDGET.md`](./PERFORMANCE_BUDGET.md) | Lighthouse 95 / 100 / 100 / 100   |
| [`FUTURE.md`](./FUTURE.md)                   | All postponed work (portal, CRM, …)   |
| [`FUTURE_PLATFORM.md`](./FUTURE_PLATFORM.md) | Later monorepo architecture seams     |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md)       | Branching, commits, workflow            |
| [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md)     | Brand tokens, typography, motion        |
| [`SEO_STRATEGY.md`](./SEO_STRATEGY.md)       | SEO, metadata, structured data          |
| [`CONTENT_STRATEGY.md`](./CONTENT_STRATEGY.md) | Voice, content model                  |
| [`ACCESSIBILITY.md`](./ACCESSIBILITY.md)     | WCAG AA commitments                     |
| [`TESTING.md`](./TESTING.md)                 | Test strategy and tooling               |
| [`DEPLOYMENT.md`](./DEPLOYMENT.md)           | Environments, CI/CD, Vercel             |
| [`SECURITY.md`](./SECURITY.md)               | Reporting and security practices        |
| [`CHANGELOG.md`](./CHANGELOG.md)             | Notable changes                         |

## License

Proprietary — © Best Coatings Solutions. All rights reserved.
