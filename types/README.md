# `types/`

Shared, cross-cutting TypeScript types and domain models (e.g. `Project`,
`Estimate`, `Invoice`, `CustomerProfile`) plus ambient declarations.

Guidelines:

- Types used by a single module stay next to that module; only promote here when
  shared across features.
- Prefer deriving types from Zod schemas (`z.infer`) once validation schemas
  exist, so runtime and compile-time stay in sync (single source of truth).
- No runtime code in this folder — types and interfaces only.
