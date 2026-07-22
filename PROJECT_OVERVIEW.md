# Project Overview

## Vision

Build the digital flagship for **Best Coatings Solutions (BCS)** — a product that
feels closer to **Apple / Feadship / Gulfstream** than a traditional contractor
website, and that keeps evolving for a decade. Two surfaces share one codebase:

1. **Public marketing site** — elegant, fast, SEO-first. The **homepage is the
   only page with premium animation**; every other page is static, lightweight
   and extremely fast.
2. **Customer Portal** (future) — an authenticated area for projects, estimates,
   invoices, payments, messages, documents, photos, timeline and appointments.

## Business context

- **Company:** Best Coatings Solutions
- **Model:** Mobile service
- **Primary market:** South Florida — Jupiter south to the Florida Keys
- **Expansion:** Entire United States, then international
- **Divisions:** Marine and Aviation (see `config/services.ts`)
- **Customers:** boat/yacht owners, captains, marinas, shipyards, yacht
  management companies, brokers, insurance companies, aircraft owners, charter
  companies, FBOs

## Architecture principles

- **Clean Architecture / Dependency Inversion.** UI depends on abstractions, not
  vendors. All third-party access is isolated behind `services/` so providers can
  be swapped or mocked without touching components.
- **Server Components first.** Ship the minimum client JS. A component opts into
  `'use client'` only when it needs interactivity, browser APIs or animation.
- **Content as data.** Services, routes and (later) projects live in typed data
  modules (`config/`) so content changes don't require component edits and stay
  consistent across pages, SEO and forms.
- **SOLID / DRY / KISS.** Small, single-responsibility modules; no duplicated
  code; no unnecessary dependencies (e.g. `utils/cn.ts` stays dependency-free).
- **SEO-first, Performance-first, Accessibility-first, Security-first.** These
  are cross-cutting constraints, not afterthoughts — each has its own strategy
  doc.
- **Everything has a purpose.** Every folder is documented; no placeholder
  architecture is shipped as dead code.

## Why this stack

- **Next.js App Router + React 19** — Server Components, streaming, first-class
  Metadata API, dynamic `sitemap`/`robots`, and a straight path to Vercel.
- **TypeScript (strict + `noUncheckedIndexedAccess`)** — safety for a codebase
  meant to live for years and grow a team.
- **Tailwind v4** — design tokens expressed as `@theme` in `app/globals.css`
  become the single source of truth for the brand, generating utilities directly.
- **Framer Motion** — declarative, accessible animation scoped to the homepage.
- **Vitest + Playwright** — fast unit/component feedback plus real-browser E2E.
- **RHF + Zod** — one schema drives both runtime validation and inferred types
  for the estimate/schedule/contact forms.

## Prepared-for (not yet implemented)

The architecture is ready for these integrations; each will land behind a typed
adapter in `services/` per `ROADMAP.md`:

- Supabase (Auth + PostgreSQL), Stripe (payments)
- Google Calendar / Outlook (scheduling)
- Instagram / Facebook (gallery/social), Google Reviews, Google Maps
- CRM sync with the existing business platform
- Notifications: Email, SMS, Push; plus Live Chat and an AI Assistant

## Customer Portal (architecture target)

Planned authenticated modules: Dashboard, Projects, Invoices, Estimates,
Payments, Messages, Documents, Photos, Timeline, Appointments, Profile,
Notifications. The portal is excluded from indexing (`robots.ts`) and will use
Supabase Auth with route protection under a dedicated route group.

## Non-goals (for now)

- No marketing pages, components, or the premium homepage yet (foundation phase).
- No live integrations — only the seams that make them low-risk to add later.
