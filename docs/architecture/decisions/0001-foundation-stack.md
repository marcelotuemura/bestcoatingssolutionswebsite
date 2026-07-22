# ADR-0001: Foundation technology stack

- **Status:** Accepted
- **Date:** 2026-07-22
- **Deciders:** BCS engineering

## Context

BCS needs a long-lived (10+ year) digital flagship: a fast, SEO-first,
accessible marketing site that can grow into an authenticated Customer Portal and
integrate with an existing business platform (Next.js, React, TypeScript,
Supabase, PostgreSQL, Stripe, Vercel). The foundation must be production-grade
before any pages are built.

## Decision

Adopt **Next.js (App Router) + React 19 + TypeScript (strict)**, **Tailwind CSS
v4** (brand tokens via `@theme`), **Framer Motion** (homepage only),
**React Hook Form + Zod**, **Vitest + Playwright**, and a full quality toolchain
(ESLint flat config, Prettier, Husky, lint-staged, commitlint). Deploy on
**Vercel**. Isolate all third-party access behind a `services/` layer.

## Alternatives considered

- **Astro / plain Vite** — excellent for static marketing, but a weaker fit for a
  future authenticated portal and business-platform integration; would likely
  require a second framework later.
- **Pages Router** — mature, but App Router provides Server Components, the
  Metadata API, and better long-term alignment with the ecosystem.
- **CSS-in-JS** — heavier runtime and weaker RSC story than Tailwind v4 tokens.

## Consequences

- One framework spans marketing + portal, matching the existing platform stack
  and easing the future CRM/Supabase/Stripe integration.
- Server Components + Tailwind keep client JS minimal (performance/SEO wins).
- Strict TypeScript and enforced quality gates raise the contribution bar but pay
  off in maintainability. Tailwind v4 is relatively new; tokens are centralized
  in `app/globals.css` to contain any future migration.
