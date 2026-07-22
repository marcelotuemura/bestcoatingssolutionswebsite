# `services/`

The **integration / data-access layer**. Everything that talks to the outside
world is wrapped behind a typed interface here so the UI never depends on a
vendor SDK directly (Dependency Inversion). Swapping or mocking a provider is a
one-file change and keeps components testable.

Planned adapters (architecture only — **not implemented in the foundation
phase**, added per `ROADMAP.md`):

| Domain            | Provider(s)                    | Purpose                                  |
| ----------------- | ------------------------------ | ---------------------------------------- |
| `auth/`           | Supabase Auth                  | Customer Portal authentication           |
| `database/`       | Supabase (PostgreSQL)          | Projects, estimates, invoices, messages  |
| `payments/`       | Stripe                         | Invoices & payments in the portal        |
| `scheduling/`     | Google Calendar / Outlook      | Schedule-visit availability & booking    |
| `notifications/`  | Email / SMS / Push             | Transactional customer notifications     |
| `social/`         | Instagram / Facebook           | Gallery & social proof feeds             |
| `reviews/`        | Google Reviews                 | Testimonials                             |
| `maps/`           | Google Maps                    | Service-area map                         |
| `crm/`            | Internal business platform     | Lead & customer sync                     |

Conventions:

- Each adapter exposes a narrow, domain-focused interface; no leaking SDK types.
- Server-only secrets are read from env inside the service, never in components.
- Provide a fake/in-memory implementation for tests where practical.
