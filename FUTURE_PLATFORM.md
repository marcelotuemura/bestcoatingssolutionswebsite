# Future Platform

How the public website stays launchable now while remaining ready to join a
broader Best Coatings Solutions platform later — without doing that migration
yet.

Related: [`PROJECT_OVERVIEW.md`](./PROJECT_OVERVIEW.md),
[`docs/architecture/README.md`](./docs/architecture/README.md),
[`ROADMAP.md`](./ROADMAP.md), [`SECURITY.md`](./SECURITY.md).

## Immediate business priority

Ship the **public marketing website** before broader BCS platform
consolidation. Customers need a professional place to:

- Discover the company
- Understand Marine and Aviation services
- Review project results
- Request an estimate
- Schedule a visit
- Contact the company
- Find social channels

## Explicit non-goals (now)

| Do not | Why |
|--------|-----|
| Restructure into a monorepo | Premature; launch risk |
| Merge the operations application | Separate product surface |
| Build the customer portal | Not required for public launch |
| Rebuild the engineering foundation | Preserve Phase 0 work |
| Connect production Supabase or Stripe without approval | Data/payment risk |
| Duplicate CRM/database logic in the website | Ownership belongs to operations later |

A portal link may be **omitted** or shown as **“Coming Soon”** only if
explicitly approved.

## Target end state (later)

```
bcs-platform/                    (future monorepo — not created now)
  apps/
    web/                         ← this website moves here
    ops/                         ← operations application
    portal/                      ← authenticated customer area (or route group)
  packages/
    ui/                          ← shared components
    types/                       ← shared domain types
    validation/                  ← Zod schemas
    auth/                        ← auth clients & guards
    db/                          ← database clients
    config/                      ← business configuration
```

Exact package names may change; the **boundaries** matter more than the folder
spellings.

## Boundaries to preserve in this repo

Design the single Next.js app so extraction into `apps/web` is mechanical:

| Concern | Keep isolated today |
|---------|---------------------|
| UI primitives | `components/ui` — no data fetching, no vendor SDKs |
| Layout chrome | `components/layout` |
| Domain types | `types/` |
| Validation | Zod schemas in a dedicated module (infer types) |
| Business config | `config/site.ts`, `config/services.ts`, `config/routes.ts` |
| Integrations | `services/*` adapters only (email, spam, future CRM) |
| Auth | Not implemented; when added, only behind `services/auth` |
| DB / Stripe | Env seams only; no live production clients without approval |

**Dependency rule:** presentation → domain/config → `services` interfaces.
Only adapter implementations know vendors (Dependency Inversion).

## Lead capture today vs later

**v1 path:**

```
Form (RHF + Zod) → Server Action → spam checks → services/leads
  → services/notifications (email)
```

**Later path (swap adapter, keep UI):**

```
… → services/leads → BCS operations platform / CRM API
                 ↘ notifications (email/SMS) as needed
```

Do not invent a second source of truth for customers or jobs on the marketing
site.

## Customer portal (architecture target only)

Planned capabilities (future): dashboard, projects, estimates, invoices,
payments, messages, documents, photos, timeline, appointments, profile,
notifications.

Constraints when it arrives:

- Dedicated route group; excluded from indexing (`robots`).
- Supabase Auth (expected) with protected routes.
- Stripe only through `services/payments`.
- Shared UI/types with marketing where it reduces duplication.

## i18n & expansion

First release: **English and Spanish** public UI.
Business can speak Portuguese and Japanese — reflected in copy, not necessarily
as locales yet.

Later: additional locales and national/international service-area expansion
without rewriting component trees (messages + config driven).

## Social & channels

Instagram and Facebook for launch. Config/types should allow TikTok and other
networks to be enabled later without schema breaks.

## Migration checklist (when platform work is approved)

1. Confirm monorepo tool (e.g. pnpm workspaces + Turborepo) with ops owners.
2. Move app to `apps/web`; keep git history if practical.
3. Extract `packages/ui`, `packages/types`, `packages/validation`, `packages/config`.
4. Point `services/leads` at operations APIs; retire email-only path or keep as
   fallback.
5. Align env naming and secrets with platform standards.
6. Re-run performance, a11y, SEO, and form E2E on the new paths.

Until that approval lands, **this repository remains a standalone Next.js app**
with clean seams — nothing more.
