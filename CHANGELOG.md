# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Project foundation** (engineering scaffolding, no marketing pages yet):
  - Next.js (App Router) + React 19 + TypeScript (strict) base.
  - Tailwind CSS v4 with BCS brand tokens via `@theme`.
  - Framer Motion, React Hook Form + Zod, Vercel Analytics dependencies.
  - Tooling: ESLint (flat config) + Prettier + Husky + lint-staged +
    commitlint (Conventional Commits).
  - Testing: Vitest + Testing Library (unit/component) and Playwright (E2E).
  - SEO scaffolding: Metadata API, dynamic `sitemap.ts`, `robots.ts`,
    schema.org JSON-LD, Open Graph.
  - Typed configuration layer: `config/site.ts`, `config/routes.ts`,
    `config/services.ts`.
  - CI (GitHub Actions), issue/PR templates, Dependabot, CODEOWNERS, labels.
  - Full documentation set and per-folder architecture docs.
  - Minimal placeholder home route so the toolchain is verifiable end-to-end.

[Unreleased]: https://github.com/marcelotuemura/bestcoatingssolutionswebsite
