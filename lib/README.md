# `lib/`

Framework-facing building blocks and cross-cutting concerns that are richer than
pure helpers but are not external integrations (those live in `services/`).

Current modules:

- `lib/seo/` — Metadata API builders and schema.org JSON-LD structured data,
  consumed by the root layout, `sitemap.ts` and `robots.ts`.

Future candidates: validation schema registries, analytics wrappers, feature
flags. Keep modules small, pure and unit-tested.
