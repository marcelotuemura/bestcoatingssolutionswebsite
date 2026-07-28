# Launch Readiness Matrix

**Single source of truth for public launch decisions.**  
**Phase:** 6 — Production Launch Readiness (**Approved**)  
**Release state:** **Release Candidate** — do not tag `v1.0.0` until remaining ops gates clear  
**Updated:** 2026-07-26  
**Release target tag:** `v1.0.0` (Best Coatings Solutions Website)  
**Final human gate:** [`LAUNCH_ACCEPTANCE_REVIEW.md`](./LAUNCH_ACCEPTANCE_REVIEW.md)

Status legend: ✅ Ready · ⏳ Pending · 🔶 Partial · 🚫 Blocker · ➖ N/A · 📦 Deferred (owner)

---

## Brand & visual assets

| Area | Status | Notes |
|------|--------|-------|
| Official logo (SVG/PNG/WebP) | ✅ Ready | Production assets in `public/brand/` (`bcs-logo-official.webp` preferred + header `@1x/@2x`) |
| Interim logo treatment | ✅ Ready | Temporary letterform SVG scaffolding only — not presented as official |
| Real Marine hero photography | 📦 Deferred | **Deferred by owner approval — pending approved assets.** Placeholders/silhouettes retained; no stock/AI/manufacturer scrape |
| Aviation hero photography | 📦 Deferred | **Deferred by owner approval — pending approved assets.** Architecture preserved |
| Marcelo portrait / workshop photo | 📦 Deferred | **Deferred by owner approval — pending approved assets.** About/homepage slots remain honest placeholders |
| Project / process photography | 📦 Deferred | Post-content launch item via DAM; Projects stay empty-safe until approved |
| Manufacturer spelling verification | ✅ Verified | Owner-confirmed: **Shaefer** (not Sheaffer / Schaefer) |

---

## Legal & trust

| Area | Status | Notes |
|------|--------|-------|
| Privacy Policy | ✅ Ready | Production page `/privacy` with Last updated; mailing address remains owner placeholder |
| Terms of Use | ✅ Ready | Production page `/terms` (Florida governing law); estimate/inquiry non-binding language included |
| Employer / manufacturer disclaimer | ✅ Verified | Includes authorization; rendered on About |
| Aviation scope exclusions | ✅ Verified | Cosmetic-only; no FAA/airworthiness claims |
| No invented reviews / partnerships | ✅ Verified | Empty-safe testimonials; claim discipline tests |

---

## Product & conversion

| Area | Status | Notes |
|------|--------|-------|
| Contact form UX / validation | ✅ Verified | Client + server Zod; honeypot; consent links |
| Estimate form UX / validation | ✅ Verified | Client + server Zod; honeypot; consent links |
| Production form delivery | 🔶 Partial | **Code wired (Resend Server Actions).** Production go-live still requires verified Resend domain + Production env vars (`RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL`, `NEXT_PUBLIC_SITE_URL`) — see `docs/FORM_DELIVERY.md` |
| CTA hierarchy | ✅ Verified | Estimate default; Contact on Aviation + About (header + page) |
| EN/ES lexicon | ✅ Verified | Phase 5G.5 normalization (`refinación`, `igualación de color`) |
| About craftsman narrative | ✅ Verified | Phase 5G approved |
| Marine / Aviation division pages | ✅ Verified | Phases 5E / 5F approved |

---

## Engineering quality

| Area | Status | Notes |
|------|--------|-------|
| Typecheck / unit suite | ✅ Verified | `pnpm typecheck` · `pnpm test` |
| Marketing e2e smoke | ✅ Verified | Phase 3 / 4 / 5 suites on flagship routes (`FORM_DELIVERY_MODE=mock` in Playwright harness only) |
| Accessibility (engineering) | 🔶 Partial | Semantic tokens, AA resting/hover primary, reduced-motion, skip link; full axe/manual SR pass still recommended |
| Lighthouse / CWV lab | 🔶 Partial | Re-run on production preview before launch (targets in `PERFORMANCE_BUDGET.md`) |
| Responsive QA | 🔶 Partial | Breakpoint screenshots through 5G.5; full device matrix pending owner devices |
| Cross-browser | ⏳ Pending | Chromium covered in CI e2e; Safari/Firefox/manual pending |
| robots.txt / sitemap | ✅ Verified | Implemented; thank-you & drafts excluded |
| Security headers / deploy config | 🔶 Partial | See `DEPLOYMENT.md`; confirm production env vars |

---

## Documentation

| Area | Status | Notes |
|------|--------|-------|
| Brand Standards Guide | ✅ Verified | `BRAND_STANDARDS.md` (Phase 6) |
| Transformation archive (Phases 1–5G.5) | ✅ Verified | `docs/brand-transformation/` |
| Form delivery runbook | ✅ Verified | `docs/FORM_DELIVERY.md` |
| Working prompt addendum | ✅ Verified | Living constraints |
| This matrix | ✅ Verified | Update at every launch gate |

---

## Go / No-Go

**Public launch is No-Go until remaining 🚫 / unresolved ops rows are cleared.**  
Photography is **not** a technical blocker for this RC (owner-approved deferral).

Minimum clear list:

1. ~~Official logo file in repo~~ ✅  
2. ~~Authentic photography~~ 📦 Deferred by owner approval — pending approved assets (post-content)  
3. ~~Privacy + Terms production pages~~ ✅ (owner mailing-address placeholder remains)  
4. Production form delivery **confirmed in live environment** (Resend domain verified + Production env vars set + smoke send)  
5. Lighthouse / CWV recorded on production preview meeting budget or explicitly accepted  

When gates clear → complete [`LAUNCH_ACCEPTANCE_REVIEW.md`](./LAUNCH_ACCEPTANCE_REVIEW.md) → tag **`v1.0.0`**, archive Phases 1–6 docs as baseline, run post-deploy smoke → then Phase 7 Growth & Optimization.
