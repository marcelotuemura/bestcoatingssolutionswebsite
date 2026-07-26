# Phase 1 — Complete Website Audit

**Project:** Best Coatings Solutions — Premium Brand Transformation  
**Date:** 2026-07-26  
**Scope:** Marketing site audit only (`/[locale]/*`). No code changes in this phase.  
**Baseline:** `origin/main` at audit time (Phase 7 gallery already merged). Separate open PR #29 may refine CTA/service-area microcopy; this audit treats the broader brand/UX gap, not that PR.  
**Method:** Code review + live visual inspection (desktop 1280 / mobile 390) of homepage, about, services, gelcoat repair, projects, contact.  
**Stop point:** Await owner approval before Phase 2 (Brand Strategy).  
**Approval:** **Phase 1 approved** by owner (2026-07-26). Proceeded to Phase 2 strategy docs only.

---

## Executive verdict

The site has a **solid engineering foundation** (Next.js App Router, i18n EN/ES, typed routes, honest empty states, WCAG-aware primitives, Media Intelligence backend). Visually and narratively, it still reads as a **premium template waiting for a craftsman**, not yet as a Feadship/Riva-level refinishing atelier.

| Dimension | Grade | One-line judgment |
|-----------|-------|-------------------|
| Design system / UI chrome | B | Dark navy + electric is coherent; Inter + silhouette hero feel SaaS, not craft. |
| UX / information architecture | B− | Clear paths to estimate/contact; homepage is long; portfolio empty. |
| Typography | C+ | Inter everywhere — competent, not distinctive. |
| Imagery / authenticity | F | Public marketing pages use temporary SVG / labeled placeholders; no real work on-page. |
| Copy / voice | C | Honest and careful, but corporate-safe; no Marcelo story; some cliché residue (“excellence”, “premium”). |
| Trust | C− | Strong anti-fabrication ethics; weak human proof (no founder, no real case studies). |
| Accessibility posture | B+ | Skip link, focus rings, reduced motion, landmarks — verify with Lighthouse before claiming 100. |
| SEO posture | B | Metadata + JSON-LD + sitemap present; keywords/copy not yet craftsmanship-led. |
| Performance posture | B | Budgets documented; homepage Framer Motion + temporary assets need re-measure with real photos. |
| Responsive | B | Layouts work; hero/brand hierarchy still weaker than a luxury marine brand. |

**Launch readiness for paid traffic:** Not yet. Soft launch to known network only until real photography + founder story + case studies land.

---

## What is already working (keep)

1. **Honesty as a brand asset** — Placeholders are labeled; projects page refuses fake portfolio work; about copy forbids invented awards/years. That aligns with the Golden Rules.
2. **Conversion plumbing** — Estimate request, contact, schedule visit, phone, bilingual UI.
3. **Design token discipline** — Navy / electric / silver in `app/globals.css`; documented in `DESIGN_SYSTEM.md` / `BRAND_GUIDE.md`.
4. **Homepage story architecture** — Emotional arc documented (`HOME_EXPERIENCE.md`) and implemented section-by-section.
5. **Media Intelligence / DAMS** — Private gallery pipeline exists for real assets; not yet feeding the public site.
6. **Accessibility foundations** — Skip-to-content, focus-visible rings, `prefers-reduced-motion`, semantic shell.
7. **SEO foundations** — Metadata API, sitemap, robots, `WebSite` + `ProfessionalService` JSON-LD.

---

## Critical gaps (must resolve before “premium agency” bar)

### C1 — No authentic photography on the public site

**Evidence**

- Hero uses temporary logo + `marine-silhouette.svg` (`config/home-placeholders.ts`), not a full-bleed vessel photograph.
- Marine / featured / before-after sections explicitly label placeholder media.
- Projects page: “Project documentation in preparation” — empty of published case studies.
- `public/brand/` contains only temporary SVGs.
- `data/media-catalog/` is a **fixture** (`isFixture: true`, 240 synthetic assets). It is not proof of live owner photography in the repo.
- Local vault contains a handful of e2e/test originals, not a curated public portfolio.

**Impact:** A refinishing company without visible work cannot sell trust. Copy about craftsmanship floats without evidence.

**Phase mapping:** Phase 8 (Image Strategy), Phase 7 (Portfolio), Phase 9 (Shot list).

### C2 — Founder identity missing

**Evidence**

- About title is “About Best Coatings Solutions”, not “Meet Marcelo”.
- No first-name-only founder narrative; `config/about.ts` owner facts are still placeholders pending approval.
- Homepage “Who We Are” speaks as a company, not a craftsman.

**Impact:** Visitors cannot answer “Who will touch my boat?”

**Constraint for later phases:** Use **Marcelo** only — never last name; company remains the hero; no résumé tone; no employer logos/endorsements.

**Phase mapping:** Phase 4 (About), Phase 2–3 (strategy + copy).

### C3 — Hero does not meet the new brand brief

**Current**

- Headline: “Precision coatings for vessels that demand excellence.”
- Support: “Mobile marine refinishing and composite care across South Florida.”
- Primary CTA: Request an Estimate  
- Secondary CTA: **Schedule Visit** (brief wants **View Our Work**)

**Target (Phase 3 brief)**

- Headline: **Craftsmanship That Shows in Every Finish**
- Supporting copy: 25+ years / Japan → automotive → marine/aviation → BCS (first person, human)
- Secondary CTA: **View Our Work**

**Impact:** Current hero is competent marketing; it is not the craftsman voice or emotional proof path.

### C4 — Temporary brand mark + weak first-viewport brand test

**Evidence**

- Logo alt: “temporary logo”; file `bcs-logo-temporary.svg`.
- Hero is gradient/atmosphere + silhouette, not a dominant photographic plane.
- Visual QA noted a small broken-image artifact at the left edge of the hero on desktop — polish failure on first impression.

**Impact:** Fails the brand test (“remove the nav — does this still feel unmistakably BCS?”).

---

## Design audit

| Topic | Finding | Severity | Recommendation (later phases) |
|-------|---------|----------|-------------------------------|
| Palette | Strong navy/electric; dark-only marketing | Medium | Keep navy core; add warm metal/silver accents sparingly; avoid purple/cream AI clichés |
| Typography | Inter via `next/font` only | High | Pair distinctive display face + refined text face (not Inter-as-identity) |
| Radius / cards | `rounded-xl` / `rounded-2xl` cards and trust chips | Medium | Fewer card containers; more editorial photography + type |
| Hero | Atmosphere, not photography | Critical | Full-bleed real work; brand + one headline + one sentence + CTA group |
| Motion | Framer Motion on homepage; reduced-motion respected | Medium | Keep 2–3 intentional motions; cut logo light-sweep if it feels gimmicky |
| Icons / trust grid | 9 uppercase trust chips (“Why BCS”) | Medium | Replace claim grid with proof (process photos, Marcelo, case studies) |
| Aviation | Preview / Coming Soon on homepage | Medium | De-emphasize until active so marine craftsmanship is not diluted |
| Logo | Temporary SVG | High | Finalize mark; hero-level brand presence |

---

## UX audit

| Topic | Finding | Severity | Recommendation |
|-------|---------|----------|----------------|
| Primary nav | Marine, Services, Projects, Resources, About, Contact | Low–Med | Consider Work / Process over “Resources” primacy; keep Contact + Estimate |
| Homepage length | 10 sections before footer | Medium | Tighten; merge weak proof sections until real media exists |
| Projects empty state | Ethically excellent, conversion-poor | High | Publish 1–3 real case studies ASAP |
| Services index | Eight equal cards | Medium | Outcome-led hierarchy; photography per service |
| Forms | Estimate/contact solid | Low | Keep honesty about Fort Lauderdale free-estimate policy |
| Secondary CTA | Schedule Visit vs View Our Work | High | Align with brief once portfolio exists |
| Mobile nav | Functional estimate/schedule | Low | Add phone in drawer optional |

---

## Copy audit (voice)

**Strengths**

- No fabricated reviews, awards, or certifications in about content.
- Clear free-estimate geography policy.
- Service pages emphasize process over hard sell.

**Gaps vs master brief**

| Issue | Example | Severity |
|-------|---------|----------|
| Corporate / abstract | “vessels that demand excellence” | High |
| Overuse of “premium” | Meta description, Who We Are | Medium |
| No first-person craftsman voice | Entire about/home | Critical |
| No verified career narrative | Japan → Aisin Sin Ei → MarineMax / Nautical Ventures / HCB → aviation work | Critical |
| Timeline constraint | Must end at HCB; BCS transition after timeline | Info for Phase 4 |
| Spanish parity | Will need full rewrite with same voice, not literal AI tone | Medium |

**Banned phrases check:** No “industry-leading / state-of-the-art / trusted partner” found as primary CTAs. Residual risk words: “excellence”, “premium”, “professional finish” as chip labels.

---

## Imagery & media inventory

| Location | Contents | Status for public site |
|----------|----------|------------------------|
| `public/brand/` | Temporary logo + marine/aviation silhouettes | Temporary only |
| `config/home-placeholders.ts` | Explicit placeholder registry | Honest; not launch visuals |
| `data/media-catalog/` | 240 **fixture** assets | Do not treat as real portfolio |
| `data/media-vault/gallery/` | Few local/test originals + derivatives | Not curated public set |
| Owner desktop media (referenced in catalog README) | Real `08_Reports` pipeline intended | **Not present in this environment** |

**Phase 8 implication:** Before any stock, locate and evaluate real originals from the owner media library / vault. Enhance first; replace only if enhancement fails. Generate enhancement report for owner approval when needed.

---

## Accessibility audit (posture)

| Control | Status |
|---------|--------|
| Skip to main content | Present |
| Focus rings (`electric-500`) | Present on buttons/links |
| Reduced motion | Global CSS + Framer `useReducedMotion` on hero |
| Landmarks / one H1 | Generally followed |
| Form labels | Present on conversion forms |
| Contrast on navy/silver | Designed for AA — needs Lighthouse confirmation |
| Target score | Docs claim Lighthouse A11y **100** — not re-run in this audit pass |

**Risks:** Placeholder/decorative images with empty `alt` in hero are OK only if truly decorative; once real photos ship, meaningful alts are mandatory. Before/after slider needs continued keyboard coverage.

---

## SEO audit (posture)

| Control | Status |
|---------|--------|
| Titles / descriptions | Present; still “premium mobile marine and aviation…” framing |
| Canonical + hreflang EN/ES | Present |
| Sitemap / robots | Present |
| JSON-LD LocalBusiness/ProfessionalService | Present |
| Keyword intent (gelcoat, fiberglass, boat cosmetic, South Florida, metallic, paint matching) | Partially reflected; not craftsmanship-led rewrite |
| Open Graph images | Weak without real photography |

---

## Performance audit (posture)

| Control | Status |
|---------|--------|
| Documented budgets (`PERFORMANCE_BUDGET.md`) | Performance 95+, A11y/BP/SEO 100 |
| Homepage motion island | Framer Motion dependency |
| `next/image` | Used; temporary SVGs often `unoptimized` |
| Server Components default | Yes |
| This audit | No new Lighthouse run recorded — Phase 12/15 deliverable |

---

## Responsive audit

| Viewport | Observation |
|----------|-------------|
| Desktop 1280 | Clean chrome; hero lacks photo weight; nav dense but usable |
| Mobile 390 | Stack works; hamburger + estimate CTA OK; brand story still text-heavy without images |
| Touch targets | Buttons generally ≥44px (`min-h-11`+) |

Screenshots (artifacts):

- `phase1-audit-01-homepage-desktop-1280.png`
- `phase1-audit-01-homepage-mobile-390.png`
- `phase1-audit-02-about-desktop-1280.png`
- `phase1-audit-02-about-mobile-390.png`
- `phase1-audit-03-services-desktop-1280.png`
- `phase1-audit-03-services-mobile-390.png`
- `phase1-audit-04-service-gelcoat-desktop-1280.png`
- `phase1-audit-04-service-gelcoat-mobile-390.png`
- `phase1-audit-05-projects-desktop-1280.png`
- `phase1-audit-05-projects-mobile-390.png`
- `phase1-audit-06-contact-desktop-1280.png`
- `phase1-audit-06-contact-mobile-390.png`

---

## Alignment with master brief (gap matrix)

| Brief requirement | Current state | Gap |
|-------------------|---------------|-----|
| Feels like craftsman, not another repair shop | Partial | Needs Marcelo + real work |
| Apple/Porsche/Riva quality without imitation | Partial chrome | Needs photography + typography |
| Hero copy + CTAs per Phase 3 | Not implemented | Rewrite + View Our Work |
| Meet Marcelo about page | Not implemented | Phase 4 |
| Philosophy sections (prep before paint; every repair has my attention) | Partially via workmanship/about | Phase 5 rewrite |
| Outcome-led services | Feature-leaning | Phase 6 |
| Case-study portfolio | Framework / empty | Phase 7 |
| Real images first | Placeholders | Phase 8–9 |
| No last name / no fake endorsements | Compliant today | Preserve |

---

## Recommended phase sequence (unchanged — do not skip gates)

1. **Phase 1 — Audit** ← *this document*  
2. **Phase 2 — Brand strategy** (positioning, trust answers, IA)  
3. **Phase 3 — Copywriting** (homepage hero + sitewide voice)  
4. **Phase 4 — About / Meet Marcelo**  
5. **Phase 5 — Philosophy**  
6. **Phase 6 — Services rewrite**  
7. **Phase 7 — Portfolio case studies**  
8. **Phase 8 — Image strategy / enhancement**  
9. **Phase 9 — Photography shot list**  
10. **Phase 10 — UI design system polish**  
11. **Phase 11 — Responsive refinement**  
12. **Phase 12 — Performance**  
13. **Phase 13 — Accessibility verification**  
14. **Phase 14 — SEO metadata rewrite**  
15. **Phase 15 — Final review**

---

## Design decisions observed (why the site looks this way today)

1. **Honesty over theater** — Empty portfolio and labeled placeholders were intentional to avoid fake social proof. Correct ethically; incomplete commercially.
2. **Dark navy system** — Positions away from generic “sunny marine contractor” templates; risks feeling like SaaS without photography.
3. **Homepage-only motion** — Protects performance on other routes; good engineering constraint.
4. **Aviation preview** — Future division foreshadowing; currently competes with marine trust narrative.
5. **Inter** — Fast, readable default; not a luxury brand differentiator.

---

## Out of scope / not changed

- No application code modified in Phase 1.
- No migrations, Media Intelligence, or `/media` admin changes.
- No Lighthouse numbers claimed without a fresh production/preview run.
- No stock photography introduced.
- No founder biography invented beyond the verified facts reserved for later owner-approved copy.

---

## Approval gate

**Phase 1 is complete when you approve this audit.**

Please confirm to proceed to **Phase 2 — Brand Strategy** only (still no full redesign pass).

Optional owner inputs that unlock later phases faster:

1. Access to the real media library / approved publishable photos  
2. Approval to use first name **Marcelo** publicly on About  
3. Confirmation of verified career facts to include (and which employers may be named as background only)  
4. Final logo asset (to replace temporary SVG)
