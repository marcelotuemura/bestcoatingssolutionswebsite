# Future Platform

**Architecture boundaries** for a later BCS platform merger.  
**Postponed product backlog** (portal, CRM, Stripe, AI, etc.): see [`FUTURE.md`](./FUTURE.md).

This file answers *how* the website should stay extractable.  
`FUTURE.md` answers *what* is deferred.

Related: [`PROJECT_OVERVIEW.md`](./PROJECT_OVERVIEW.md),
[`docs/architecture/README.md`](./docs/architecture/README.md),
[`ROADMAP.md`](./ROADMAP.md).

## Immediate priority

1. Ship / go-live the public marketing website.  
2. Grow the **Media Intelligence Platform (DAMS)** —
   [`docs/MEDIA_INTELLIGENCE_PLATFORM.md`](./docs/MEDIA_INTELLIGENCE_PLATFORM.md).  
3. Later: Operations Platform as a **separate** product ([`FUTURE.md`](./FUTURE.md)).

## Explicit non-goals (now)

Do not: create a monorepo prematurely, merge the operations app, build the
customer portal into marketing pages, connect production Supabase/Stripe without
approval, or duplicate CRM logic. Full deferred list: [`FUTURE.md`](./FUTURE.md).

Homepage may show one approved **Coming Soon — Customer Portal** mock
([`HOME_EXPERIENCE.md`](./HOME_EXPERIENCE.md)) — that is not portal delivery.

## Boundaries to preserve

| Concern | Keep isolated today |
|---------|---------------------|
| UI primitives | `components/ui` |
| Layout chrome | `components/layout` |
| Domain types | `types/` |
| Validation | Zod modules (`z.infer` types) |
| Business config | `config/*` |
| Media Intelligence | `lib/media-intelligence/*`, `app/media/*` |
| Integrations | `services/*` adapters only |
| Auth / DB / Stripe | Seams only until approved |

## Target monorepo shape (later)

```
apps/web | apps/media | apps/ops | apps/portal
packages/ui | types | validation | auth | db | config
```

Until approval: this repo remains a **standalone** Next.js app with clean seams
(marketing + internal `/media` DAMS foundation).
