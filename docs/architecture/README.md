# Architecture

## System overview

A single Next.js (App Router) application deployed on Vercel serves two surfaces
from one codebase:

- **Public marketing site** — mostly static Server Components, SEO-first, fast.
- **Customer Portal** (future) — authenticated, dynamic, behind Supabase Auth.

```
Browser
  │
  ▼
Next.js App Router (Vercel)
  ├─ Server Components (default)  ── render marketing pages, read config/data
  ├─ Client Components ('use client') ── interactivity, Framer Motion (homepage)
  ├─ Metadata API / sitemap.ts / robots.ts ── SEO
  └─ services/ (adapters)  ──►  Supabase · Stripe · Google · CRM · Email/SMS
```

## Layered design (Clean Architecture)

1. **Presentation** — `app/` (routes/layouts), `components/`, `hooks/`,
   `animations/`, `styles/`.
2. **Application/config** — `config/` (site, routes, services) and `lib/`
   (framework-facing modules such as SEO builders).
3. **Domain** — `types/` (shared models) and pure logic in `utils/`.
4. **Infrastructure** — `services/` adapters wrapping all third-party access.

Dependencies point inward: presentation depends on config/domain abstractions;
only `services/` knows about vendors (Dependency Inversion). This keeps the UI
testable and lets providers be swapped or mocked.

## Folder rationale (why each exists)

| Folder        | Reason it exists                                                        |
| ------------- | ---------------------------------------------------------------------- |
| `app/`        | App Router routes, layouts, and SEO route handlers.                    |
| `components/` | Reusable UI; Server Components first, isolated and testable.           |
| `hooks/`      | Encapsulate client-side behavior for reuse (single responsibility).    |
| `lib/`        | Framework-facing building blocks (e.g. SEO) that aren't integrations.  |
| `services/`   | Isolate third-party access behind typed interfaces (swap/mock/test).   |
| `config/`     | Content-as-data + typed route registry; one source of truth.          |
| `types/`      | Shared domain models; keep types DRY and derivable from Zod.           |
| `utils/`      | Pure, dependency-free helpers.                                         |
| `animations/` | Centralize motion so static pages stay free of animation code.        |
| `styles/`     | CSS that can't be expressed as utilities.                              |
| `tests/`      | Unit/component (Vitest) + E2E (Playwright) kept separate.              |
| `public/`     | Static assets served at the site root.                                |
| `docs/`       | Architecture, wireframes, branding, working assets.                   |
| `.github/`    | CI, templates, Dependabot, ownership — repo governance.               |

## Routing & rendering strategy

- Routes are declared as data in `config/routes.ts` before pages exist, so
  navigation and the sitemap stay consistent as pages land.
- Marketing pages are statically rendered where possible; dynamic behavior is
  opt-in. The homepage is the only page with premium animation.
- The portal will live in a dedicated route group with auth protection and is
  excluded from indexing.

## Decisions

Architecture Decision Records live in [`decisions/`](./decisions). Start each new
significant decision from `decisions/0000-template.md`.
