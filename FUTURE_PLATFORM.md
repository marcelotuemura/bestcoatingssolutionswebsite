# Future Platform

**Architecture boundaries** for a later BCS platform merger.  
**Postponed product backlog** (portal, CRM, Stripe, AI, etc.): see [`FUTURE.md`](./FUTURE.md).

This file answers *how* the website should stay extractable.  
`FUTURE.md` answers *what* is deferred.

Related: [`PROJECT_OVERVIEW.md`](./PROJECT_OVERVIEW.md),
[`docs/architecture/README.md`](./docs/architecture/README.md),
[`ROADMAP.md`](./ROADMAP.md).

## Immediate priority

Ship the public marketing website before platform consolidation. Customers need
discover → understand → trust → proof → estimate / schedule / contact / social.

## Explicit non-goals (now)

Do not: create a monorepo, merge the operations app, build the customer portal,
rebuild the foundation, connect production Supabase/Stripe without approval, or
duplicate CRM logic. Full deferred list: [`FUTURE.md`](./FUTURE.md).

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
| Integrations | `services/*` adapters only |
| Auth / DB / Stripe | Seams only until approved |

Presentation → domain/config → `services` interfaces. Only adapters know vendors.

## Lead capture today vs later

**v1:** Form → Server Action → spam checks → `services/leads` → email notifications.  
**Later:** Same UI; swap adapter to operations/CRM API ([`FUTURE.md`](./FUTURE.md)).

## Target monorepo shape (later)

```
apps/web | apps/ops | apps/portal
packages/ui | types | validation | auth | db | config
```

Until approval: this repo remains a **standalone** Next.js app with clean seams.
